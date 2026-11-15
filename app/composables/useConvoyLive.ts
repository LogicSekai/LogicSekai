/**
 * Koneksi real-time dasbor konvoi OmoRide.
 *
 * - WebSocket ke /api/omoride/convoys/:id/ws?client=web (cookie sesi same-origin).
 * - Reconnect otomatis dengan backoff; heartbeat {"t":"ping"} tiap 25 dtk.
 * - Bila WS gagal, polling GET /api/omoride/convoys/:id/live tiap 5 dtk sebagai cadangan.
 * - Web hanya MENONTON (tidak mengirim posisi) — tapi bisa melapor, memberi suara, dan leader
 *   bisa mengatur tujuan bersama.
 */
import { onBeforeUnmount, reactive, ref } from 'vue'

export type ConvoyReportType = 'jam' | 'police' | 'pothole' | 'flood' | 'crash' | 'hazard'

export interface ConvoyPos { lat: number; lng: number; spd: number; bearing: number; batt: number; ts: number }
export interface ConvoyMemberLive {
  userId: string
  role?: 'leader' | 'member'
  profile: { username: string; name: string; avatar: string | null }
  ghost: boolean
  clients: string[]
  pos: ConvoyPos | null
}
export interface ConvoyReport {
  id: string; type: ConvoyReportType; lat: number; lng: number; note: string | null
  createdMs: number; expiresMs: number; confirms: number; clears: number
  mine?: boolean; myVote?: 'confirm' | 'clear' | null; isPublic?: boolean
}
export interface ConvoyDest { lat: number; lng: number; name: string }
export interface ConvoyRally { lat: number; lng: number; name: string; setAt: number }
export interface ConvoyShout { kind: ShoutKind; from: string; name: string; leader: boolean; ts: number; lat?: number; lng?: number }

/** Pesan cepat konvoi (sama dengan aplikasi OmoRide). Anggota hanya bisa "wait". */
export type ShoutKind = 'regroup' | 'pray' | 'charge' | 'rest' | 'rain' | 'slow' | 'go' | 'wait'
export const SHOUT_META: Record<ShoutKind, { emoji: string; label: string }> = {
  regroup: { emoji: '🧭', label: 'Kumpul, tunggu rombongan' },
  pray: { emoji: '🕌', label: 'Berhenti untuk sholat' },
  charge: { emoji: '🔌', label: 'Berhenti isi daya' },
  rest: { emoji: '☕', label: 'Istirahat di depan' },
  rain: { emoji: '🌧️', label: 'Pakai jas hujan' },
  slow: { emoji: '🐢', label: 'Pelan-pelan' },
  go: { emoji: '🏁', label: 'Lanjut jalan' },
  wait: { emoji: '✋', label: 'Tunggu saya' },
}
export const LEADER_SHOUTS: ShoutKind[] = ['regroup', 'pray', 'charge', 'rest', 'rain', 'slow', 'go']

export const REPORT_META: Record<ConvoyReportType, { label: string; emoji: string; color: string }> = {
  jam: { label: 'Macet', emoji: '🚗', color: '#F59E0B' },
  police: { label: 'Razia', emoji: '👮', color: '#3B82F6' },
  pothole: { label: 'Jalan berlubang', emoji: '🕳️', color: '#78716C' },
  flood: { label: 'Banjir', emoji: '🌊', color: '#0EA5E9' },
  crash: { label: 'Kecelakaan', emoji: '💥', color: '#EF4444' },
  hazard: { label: 'Bahaya lain', emoji: '⚠️', color: '#EAB308' },
}

export function useConvoyLive(convoyId: string) {
  const status = ref<'connecting' | 'live' | 'polling' | 'offline' | 'ended'>('connecting')
  const you = ref<string | null>(null)
  const members = reactive(new Map<string, ConvoyMemberLive>())
  const reports = reactive(new Map<string, ConvoyReport>())
  const destination = ref<ConvoyDest | null>(null)
  const rally = ref<ConvoyRally | null>(null)
  const lastShout = ref<ConvoyShout | null>(null)
  /** Berubah setiap peran leader berpindah (halaman memuat ulang daftar anggota). */
  const leaderChange = ref(0)
  const lastEvent = ref<number>(0)
  const errorMessage = ref<string | null>(null)

  let ws: WebSocket | null = null
  let retry = 0
  let reconnectTimer: ReturnType<typeof setTimeout> | null = null
  let pingTimer: ReturnType<typeof setInterval> | null = null
  let pollTimer: ReturnType<typeof setInterval> | null = null
  let closedByUs = false

  function applySnapshot(snap: any) {
    members.clear()
    for (const m of snap.members ?? []) members.set(m.userId, { clients: [], ghost: false, ...m })
    reports.clear()
    for (const r of snap.reports ?? []) reports.set(r.id, r)
    destination.value = snap.destination ?? null
    rally.value = snap.rally ?? null
    lastEvent.value = Date.now()
    if (snap.ended) markEnded()
  }

  function markEnded() {
    status.value = 'ended'
    closedByUs = true
    stopPolling()
    try { ws?.close() } catch {}
  }

  function onMessage(m: any) {
    lastEvent.value = Date.now()
    switch (m.t) {
      case 'welcome':
        you.value = m.you
        applySnapshot(m)
        break
      case 'member_join': {
        const prev = members.get(m.userId)
        members.set(m.userId, {
          userId: m.userId, role: m.role, profile: m.profile, ghost: !!m.ghost,
          clients: [...new Set([...(prev?.clients ?? []), m.client].filter(Boolean))], pos: prev?.pos ?? null,
        })
        break
      }
      case 'member_left':
        members.delete(m.userId)
        break
      case 'removed':
        closedByUs = true
        stopPolling()
        status.value = 'offline'
        errorMessage.value = 'Anda dikeluarkan dari konvoi ini oleh leader'
        break
      case 'leader':
        for (const mem of members.values()) mem.role = mem.userId === m.leaderId ? 'leader' : 'member'
        leaderChange.value++
        break
      case 'shout':
        lastShout.value = { kind: m.kind, from: m.from, name: m.name, leader: !!m.leader, ts: m.ts, lat: m.lat, lng: m.lng }
        break
      case 'rally':
        rally.value = m.rally ?? null
        break
      case 'pos': {
        const mem = members.get(m.userId)
        const pos = { lat: m.lat, lng: m.lng, spd: m.spd, bearing: m.bearing, batt: m.batt, ts: m.ts }
        if (mem) mem.pos = pos
        break
      }
      case 'ghost': {
        const mem = members.get(m.userId)
        if (mem) { mem.ghost = !!m.on; if (m.on) mem.pos = null }
        break
      }
      case 'report':
        reports.set(m.report.id, m.report)
        break
      case 'report_update': {
        const r = reports.get(m.id)
        if (r) { r.confirms = m.confirms; r.clears = m.clears; if (m.expiresMs) r.expiresMs = m.expiresMs }
        break
      }
      case 'report_expire':
        reports.delete(m.id)
        break
      case 'dest':
        destination.value = m.destination ?? null
        break
      case 'ended':
        markEnded()
        break
      case 'error':
        errorMessage.value = m.message ?? 'Terjadi kesalahan'
        break
    }
  }

  function connect() {
    if (closedByUs || import.meta.server) return
    status.value = retry === 0 ? 'connecting' : status.value
    const proto = location.protocol === 'https:' ? 'wss:' : 'ws:'
    const sock = new WebSocket(`${proto}//${location.host}/api/omoride/convoys/${encodeURIComponent(convoyId)}/ws?client=web`)
    ws = sock
    let opened = false

    sock.onopen = () => {
      opened = true
      retry = 0
      status.value = 'live'
      errorMessage.value = null
      stopPolling()
      if (pingTimer) clearInterval(pingTimer)
      pingTimer = setInterval(() => { try { sock.send('{"t":"ping"}') } catch {} }, 25_000)
    }
    sock.onmessage = (ev) => {
      try { onMessage(JSON.parse(ev.data)) } catch {}
    }
    sock.onclose = (ev) => {
      if (pingTimer) { clearInterval(pingTimer); pingTimer = null }
      if (ws === sock) ws = null
      if (closedByUs) return
      if (ev.code === 4000) { markEnded(); return }
      if (ev.code === 4001) { status.value = 'offline'; errorMessage.value = 'Anda sudah keluar dari konvoi ini'; return }
      if (ev.code === 4002) { status.value = 'offline'; errorMessage.value = 'Anda dikeluarkan dari konvoi ini oleh leader'; return }
      // Gagal sebelum terbuka (mis. dev tanpa Durable Object) → polling cadangan
      startPolling()
      retry++
      const delay = Math.min(30_000, 1000 * 2 ** Math.min(retry, 5)) + Math.random() * 500
      reconnectTimer = setTimeout(connect, opened ? Math.min(delay, 3000) : delay)
    }
  }

  async function poll() {
    try {
      const snap: any = await $fetch(`/api/omoride/convoys/${encodeURIComponent(convoyId)}/live`)
      applySnapshot(snap)
      if (status.value !== 'live' && status.value !== 'ended') status.value = 'polling'
    } catch (e: any) {
      if (status.value !== 'live' && status.value !== 'ended') status.value = 'offline'
      if (e?.statusCode === 403 || e?.statusCode === 404) { closedByUs = true; stopPolling(); errorMessage.value = 'Anda bukan anggota konvoi ini' }
    }
  }

  function startPolling() {
    if (pollTimer || closedByUs) return
    void poll()
    pollTimer = setInterval(poll, 5000)
  }
  function stopPolling() {
    if (pollTimer) { clearInterval(pollTimer); pollTimer = null }
  }

  function send(obj: unknown): boolean {
    if (ws && ws.readyState === WebSocket.OPEN) { ws.send(JSON.stringify(obj)); return true }
    return false
  }

  function disconnect() {
    closedByUs = true
    stopPolling()
    if (reconnectTimer) clearTimeout(reconnectTimer)
    if (pingTimer) clearInterval(pingTimer)
    try { ws?.close(1000) } catch {}
  }

  onBeforeUnmount(disconnect)

  return {
    status, you, members, reports, destination, rally, lastShout, leaderChange, lastEvent, errorMessage,
    connect, disconnect, send,
    report: (type: ConvoyReportType, lat: number, lng: number, note?: string, isPublic = true) =>
      send({ t: 'report', type, lat, lng, note, public: isPublic }),
    vote: (id: string, vote: 'confirm' | 'clear') => send({ t: vote, id }),
    setDestination: (d: ConvoyDest | null) => send(d ? { t: 'dest', ...d } : { t: 'dest', clear: true }),
    shout: (kind: ShoutKind) => send({ t: 'shout', kind }),
    setRally: (r: { lat: number; lng: number; name: string } | null) => send(r ? { t: 'rally', ...r } : { t: 'rally', clear: true }),
  }
}
