// OmoRide — ConvoyRoom Durable Object (Worker pendamping "logicsekai-convoy").
//
// Satu instance per konvoi (idFromName(convoyId)). Real-time lewat WebSocket Hibernation:
//   - Identitas, profil, mode hantu & posisi terakhir tiap koneksi disimpan di attachment
//     WebSocket (serializeAttachment) → tetap ada setelah DO hibernasi. Posisi TIDAK pernah ke D1.
//   - Laporan jalan aktif, meta & tujuan di storage DO; laporan juga disalin ke D1
//     (omoride_reports) agar laporan publik bisa dilihat rider di luar konvoi.
//
// DO ini TIDAK punya route publik. Satu-satunya jalan masuk adalah binding CONVOY_ROOM dari
// Pages Logic Sekai, yang sudah memverifikasi sesi + keanggotaan sebelum meneruskan upgrade
// (server/omoride/ws-gate.ts). Karena itu header X-Omo-* dipercaya.

export interface ConvoyEnv {
  DB: D1Database;
}

type Pos = { lat: number; lng: number; spd: number; bearing: number; batt: number; ts: number };
type Profile = { username: string; name: string; avatar: string | null };
type Attach = {
  uid: string;
  role: "leader" | "member";
  client: "app" | "web";
  profile: Profile;
  ghost: boolean;
  pos: Pos | null;
};
type Report = {
  id: string; type: string; lat: number; lng: number; note: string | null;
  userId: string; isPublic: boolean; created: number; expires: number;
  votes: Record<string, "confirm" | "clear">;
};
type Meta = { convoyId: string; leaderId: string; name: string };
type Dest = { lat: number; lng: number; name: string } | null;

const REPORT_TYPES = ["jam", "police", "pothole", "flood", "crash", "hazard"] as const;
// Harus sama dengan OMO_REPORT_TTL di server/utils/omoride.ts
const REPORT_TTL: Record<string, number> = {
  jam: 30 * 60_000, police: 60 * 60_000, pothole: 7 * 24 * 60 * 60_000,
  flood: 3 * 60 * 60_000, crash: 60 * 60_000, hazard: 2 * 60 * 60_000,
};
const CLEAR_THRESHOLD = 3;
const POS_MIN_INTERVAL_MS = 900;
const REPORTS_PER_10_MIN = 10;
const MAX_MSG_BYTES = 2048;

const okLatLng = (lat: unknown, lng: unknown) =>
  typeof lat === "number" && typeof lng === "number" && Number.isFinite(lat) && Number.isFinite(lng) &&
  lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
const clean = (v: unknown, max: number) => String(v ?? "").replace(/[\u0000-\u001f\u007f]/g, " ").trim().slice(0, max);
const num = (v: unknown, def: number) => (typeof v === "number" && Number.isFinite(v) ? v : def);

export class ConvoyRoom implements DurableObject {
  private reports = new Map<string, Report>();
  private destination: Dest = null;
  private meta: Meta | null = null;
  private ended = false;
  // Rate-limit laporan per user (in-memory; reset saat hibernasi tidak masalah)
  private reportTimes = new Map<string, number[]>();

  constructor(private state: DurableObjectState, private env: ConvoyEnv) {
    state.blockConcurrencyWhile(async () => {
      this.destination = (await state.storage.get<Dest>("destination")) ?? null;
      this.meta = (await state.storage.get<Meta>("meta")) ?? null;
      this.ended = (await state.storage.get<boolean>("ended")) ?? false;
      for (const r of (await state.storage.get<Report[]>("reports")) ?? []) this.reports.set(r.id, r);
    });
    // Heartbeat klien dijawab runtime tanpa membangunkan DO
    state.setWebSocketAutoResponse(new WebSocketRequestResponsePair('{"t":"ping"}', '{"t":"pong"}'));
  }

  // ---- HTTP internal (hanya dari Pages Logic Sekai via binding) -----------------------------

  async fetch(req: Request): Promise<Response> {
    const url = new URL(req.url);
    const path = url.pathname;
    if (path === "/ws") return this.handleWs(req);
    if (path === "/snapshot" && req.method === "GET") return Response.json(this.snapshot());

    if (req.method !== "POST") return new Response("not found", { status: 404 });
    const b = (await req.json().catch(() => ({}))) as any;

    switch (path) {
      case "/init": {
        this.meta = { convoyId: String(b.convoyId), leaderId: String(b.leaderId), name: clean(b.name, 60) };
        if (b.destination && okLatLng(b.destination.lat, b.destination.lng)) {
          this.destination = { lat: b.destination.lat, lng: b.destination.lng, name: clean(b.destination.name, 80) };
        }
        this.ended = false;
        await this.persist();
        return Response.json({ ok: true });
      }
      case "/dest": {
        const d = b.destination;
        this.destination = d && okLatLng(d.lat, d.lng) ? { lat: d.lat, lng: d.lng, name: clean(d.name, 80) } : null;
        this.broadcast({ t: "dest", destination: this.destination });
        await this.persist();
        return Response.json({ ok: true });
      }
      case "/kick": {
        const uid = String(b.userId ?? "");
        for (const ws of this.state.getWebSockets(uid)) try { ws.close(4001, "left convoy"); } catch {}
        this.broadcast({ t: "member_left", userId: uid });
        return Response.json({ ok: true });
      }
      case "/end": {
        this.broadcast({ t: "ended" });
        for (const ws of this.state.getWebSockets()) try { ws.close(4000, "convoy ended"); } catch {}
        // Hapus semua state (posisi ada di attachment & ikut hilang bersama socket)
        this.reports.clear();
        this.destination = null;
        this.ended = true;
        await this.state.storage.deleteAlarm();
        await this.state.storage.deleteAll();
        await this.state.storage.put("ended", true);
        return Response.json({ ok: true });
      }
    }
    return new Response("not found", { status: 404 });
  }

  private handleWs(req: Request): Response {
    if (req.headers.get("Upgrade")?.toLowerCase() !== "websocket") return new Response("expected websocket", { status: 426 });
    if (this.ended) return new Response("convoy ended", { status: 410 });

    const uid = req.headers.get("X-Omo-Uid") || "";
    if (!uid) return new Response("missing identity", { status: 400 });
    let profile: Profile;
    try {
      const p = JSON.parse(decodeURIComponent(req.headers.get("X-Omo-Profile") || "{}"));
      profile = { username: clean(p.username, 40), name: clean(p.name, 60) || clean(p.username, 40), avatar: p.avatar ? clean(p.avatar, 300) : null };
    } catch {
      return new Response("bad profile", { status: 400 });
    }

    // Pulihkan meta bila /init sempat gagal saat konvoi dibuat
    if (!this.meta) {
      const convoyId = req.headers.get("X-Omo-Convoy") || "";
      const leaderId = req.headers.get("X-Omo-Leader") || "";
      if (convoyId && leaderId) {
        this.meta = { convoyId, leaderId, name: clean(decodeURIComponent(req.headers.get("X-Omo-Name") || ""), 60) };
        void this.persist();
      }
    }

    const attach: Attach = {
      uid,
      role: this.meta?.leaderId === uid ? "leader" : "member",
      client: req.headers.get("X-Omo-Client") === "web" ? "web" : "app",
      profile,
      ghost: req.headers.get("X-Omo-Ghost") === "1",
      pos: null,
    };
    const wasOnline = this.state.getWebSockets(uid).length > 0;

    const { 0: client, 1: server } = new WebSocketPair();
    this.state.acceptWebSocket(server, [uid]);
    server.serializeAttachment(attach);

    server.send(JSON.stringify({
      t: "welcome",
      you: uid,
      meta: this.meta,
      members: this.snapshotMembers(),
      reports: [...this.reports.values()].map((r) => this.reportDto(r, uid)),
      destination: this.destination,
    }));
    if (!wasOnline) this.broadcast({ t: "member_join", userId: uid, role: attach.role, profile, ghost: attach.ghost, client: attach.client }, server);
    return new Response(null, { status: 101, webSocket: client });
  }

  // ---- WebSocket (hibernation handlers) -----------------------------------------------------

  async webSocketMessage(ws: WebSocket, message: string | ArrayBuffer) {
    const a = this.att(ws);
    if (!a || this.ended) return;
    const raw = typeof message === "string" ? message : new TextDecoder().decode(message);
    if (raw.length > MAX_MSG_BYTES) return;
    let m: any;
    try { m = JSON.parse(raw); } catch { return; }
    const now = Date.now();

    switch (m?.t) {
      case "pos": {
        if (a.ghost || !okLatLng(m.lat, m.lng)) return;
        if (a.pos && now - a.pos.ts < POS_MIN_INTERVAL_MS) return;
        a.pos = {
          lat: m.lat, lng: m.lng,
          spd: Math.max(0, num(m.spd, 0)),
          bearing: ((num(m.bearing, 0) % 360) + 360) % 360,
          batt: Math.round(num(m.batt, -1)),
          ts: now,
        };
        ws.serializeAttachment(a);
        this.broadcast({ t: "pos", userId: a.uid, ...a.pos }, ws);
        return;
      }
      case "ghost": {
        a.ghost = !!m.on;
        if (a.ghost) a.pos = null;
        ws.serializeAttachment(a);
        // Semua koneksi user yang sama ikut (app + web)
        for (const other of this.state.getWebSockets(a.uid)) {
          if (other === ws) continue;
          const oa = this.att(other);
          if (oa) { oa.ghost = a.ghost; if (a.ghost) oa.pos = null; other.serializeAttachment(oa); }
        }
        this.broadcast({ t: "ghost", userId: a.uid, on: a.ghost });
        return;
      }
      case "report": {
        if (!REPORT_TYPES.includes(m.type) || !okLatLng(m.lat, m.lng)) return;
        const times = (this.reportTimes.get(a.uid) ?? []).filter((t) => now - t < 10 * 60_000);
        if (times.length >= REPORTS_PER_10_MIN) {
          ws.send(JSON.stringify({ t: "error", code: "rate_limited", message: "Terlalu banyak laporan" }));
          return;
        }
        times.push(now);
        this.reportTimes.set(a.uid, times);
        const r: Report = {
          id: crypto.randomUUID(), type: m.type, lat: m.lat, lng: m.lng, note: clean(m.note, 140) || null,
          userId: a.uid, isPublic: m.public !== false, created: now, expires: now + (REPORT_TTL[m.type] ?? 30 * 60_000),
          votes: {},
        };
        this.reports.set(r.id, r);
        for (const s of this.state.getWebSockets()) {
          try { s.send(JSON.stringify({ t: "report", report: this.reportDto(r, this.att(s)?.uid) })); } catch {}
        }
        await this.persist();
        await this.scheduleExpiry();
        await this.saveReport(r);
        return;
      }
      case "confirm":
      case "clear": {
        const r = this.reports.get(String(m.id));
        if (!r) return;
        r.votes[a.uid] = m.t;
        const { confirms, clears } = this.counts(r);
        if (m.t === "confirm") r.expires = Math.max(r.expires, now + (REPORT_TTL[r.type] ?? 30 * 60_000));
        if (clears >= CLEAR_THRESHOLD && clears > confirms) {
          this.reports.delete(r.id);
          r.expires = now;
          this.broadcast({ t: "report_expire", id: r.id });
        } else {
          this.broadcast({ t: "report_update", id: r.id, confirms, clears, expiresMs: r.expires });
        }
        await this.persist();
        await this.updateReportCounts(r, confirms, clears);
        return;
      }
      case "dest": {
        if (!this.meta || a.uid !== this.meta.leaderId) return; // hanya leader
        if (m.clear) this.destination = null;
        else if (okLatLng(m.lat, m.lng)) this.destination = { lat: m.lat, lng: m.lng, name: clean(m.name, 80) };
        else return;
        this.broadcast({ t: "dest", destination: this.destination });
        await this.persist();
        await this.saveDestination();
        return;
      }
    }
  }

  async webSocketClose(ws: WebSocket, code: number, reason: string) {
    try { ws.close(code === 1005 || code === 1006 ? 1000 : code, reason); } catch {}
    this.onGone(ws);
  }

  async webSocketError(ws: WebSocket) {
    this.onGone(ws);
  }

  private onGone(ws: WebSocket) {
    const a = this.att(ws);
    if (!a) return;
    const stillOnline = this.state.getWebSockets(a.uid).some((s) => s !== ws && s.readyState === WebSocket.OPEN);
    if (!stillOnline) this.broadcast({ t: "member_left", userId: a.uid }, ws);
  }

  async alarm() {
    const now = Date.now();
    let changed = false;
    for (const r of [...this.reports.values()]) {
      if (r.expires <= now) { this.reports.delete(r.id); this.broadcast({ t: "report_expire", id: r.id }); changed = true; }
    }
    if (changed) await this.persist();
    await this.scheduleExpiry();
  }

  // ---- helpers ------------------------------------------------------------------------------

  private att(ws: WebSocket): Attach | null {
    try { return (ws.deserializeAttachment() as Attach) ?? null; } catch { return null; }
  }

  private snapshotMembers() {
    const byUid = new Map<string, any>();
    for (const ws of this.state.getWebSockets()) {
      if (ws.readyState !== WebSocket.OPEN) continue;
      const a = this.att(ws);
      if (!a) continue;
      const prev = byUid.get(a.uid);
      const pos = a.ghost ? null : a.pos;
      if (!prev) {
        byUid.set(a.uid, { userId: a.uid, role: a.role, profile: a.profile, ghost: a.ghost, clients: [a.client], pos });
      } else {
        if (!prev.clients.includes(a.client)) prev.clients.push(a.client);
        if (pos && (!prev.pos || pos.ts > prev.pos.ts)) prev.pos = pos;
      }
    }
    return [...byUid.values()];
  }

  private snapshot() {
    return {
      meta: this.meta,
      ended: this.ended,
      destination: this.destination,
      members: this.snapshotMembers(),
      reports: [...this.reports.values()].map((r) => this.reportDto(r)),
      ts: Date.now(),
    };
  }

  private counts(r: Report) {
    let confirms = 0, clears = 0;
    for (const v of Object.values(r.votes)) v === "confirm" ? confirms++ : clears++;
    return { confirms, clears };
  }

  private reportDto(r: Report, viewer?: string) {
    const { confirms, clears } = this.counts(r);
    return {
      id: r.id, type: r.type, lat: r.lat, lng: r.lng, note: r.note, isPublic: r.isPublic,
      createdMs: r.created, expiresMs: r.expires, confirms, clears,
      mine: !!viewer && viewer === r.userId,
      myVote: viewer ? r.votes[viewer] ?? null : null,
    };
  }

  private broadcast(obj: unknown, except?: WebSocket) {
    const s = JSON.stringify(obj);
    for (const ws of this.state.getWebSockets()) {
      if (ws === except) continue;
      try { ws.send(s); } catch {}
    }
  }

  private async persist() {
    await this.state.storage.put({
      destination: this.destination,
      meta: this.meta,
      ended: this.ended,
      reports: [...this.reports.values()],
    });
  }

  private async scheduleExpiry() {
    const times = [...this.reports.values()].map((r) => r.expires);
    if (times.length) await this.state.storage.setAlarm(Math.min(...times));
    else await this.state.storage.deleteAlarm();
  }

  // ---- D1 (best-effort; salinan DO adalah sumber kebenaran selama konvoi aktif) -------------

  private async saveReport(r: Report) {
    try {
      await this.env.DB.prepare(
        "INSERT OR IGNORE INTO omoride_reports (id,convoy_id,user_id,type,lat,lng,note,is_public,created_ms,expires_ms,confirms,clears) VALUES (?,?,?,?,?,?,?,?,?,?,0,0)",
      ).bind(r.id, this.meta?.convoyId ?? null, r.userId, r.type, r.lat, r.lng, r.note, r.isPublic ? 1 : 0, r.created, r.expires).run();
    } catch {}
  }

  private async updateReportCounts(r: Report, confirms: number, clears: number) {
    try {
      await this.env.DB.prepare("UPDATE omoride_reports SET confirms=?, clears=?, expires_ms=? WHERE id=?")
        .bind(confirms, clears, r.expires, r.id).run();
    } catch {}
  }

  private async saveDestination() {
    if (!this.meta) return;
    try {
      await this.env.DB.prepare("UPDATE omoride_convoys SET dest_lat=?, dest_lng=?, dest_name=? WHERE id=?")
        .bind(this.destination?.lat ?? null, this.destination?.lng ?? null, this.destination?.name ?? null, this.meta.convoyId).run();
    } catch {}
  }
}
