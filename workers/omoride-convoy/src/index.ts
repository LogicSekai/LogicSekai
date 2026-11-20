// Worker pendamping Logic Sekai: HANYA menampung Durable Object ConvoyRoom.
// Cloudflare Pages (Nitro advanced mode `_worker.js`) tidak bisa mendefinisikan kelas Durable
// Object sendiri, jadi kelasnya hidup di sini dan di-bind oleh Pages lewat `script_name`.
// Worker ini tidak punya route publik (workers_dev/preview_urls = false); semua akses lewat
// binding CONVOY_ROOM di Pages yang sudah memverifikasi sesi Logic Sekai.

export { ConvoyRoom } from "./convoy-room";

import { sweepCloudRetention } from "../../../server/omoride/cloud-retention";

interface Env {
  DB: D1Database;
  BUCKET: R2Bucket;
}

export default {
  async fetch(): Promise<Response> {
    return new Response("Not found", { status: 404 });
  },

  // Harian (lihat [triggers] di wrangler.toml): masa simpan 90 hari cadangan cloud OmoRide setelah
  // langganan berakhir — mulai hitung, batalkan bila berlangganan lagi, hapus bila lewat 90 hari.
  async scheduled(_controller, env, ctx): Promise<void> {
    ctx.waitUntil(
      sweepCloudRetention(env as any).then(
        (r) => console.log("[cloud-retention]", JSON.stringify(r)),
        (e) => console.error("[cloud-retention] gagal", e),
      ),
    );
  },
} satisfies ExportedHandler<Env>;
