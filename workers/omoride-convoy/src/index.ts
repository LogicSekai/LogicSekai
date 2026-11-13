// Worker pendamping Logic Sekai: HANYA menampung Durable Object ConvoyRoom.
// Cloudflare Pages (Nitro advanced mode `_worker.js`) tidak bisa mendefinisikan kelas Durable
// Object sendiri, jadi kelasnya hidup di sini dan di-bind oleh Pages lewat `script_name`.
// Worker ini tidak punya route publik (workers_dev/preview_urls = false); semua akses lewat
// binding CONVOY_ROOM di Pages yang sudah memverifikasi sesi Logic Sekai.

export { ConvoyRoom } from "./convoy-room";

export default {
  async fetch(): Promise<Response> {
    return new Response("Not found", { status: 404 });
  },
} satisfies ExportedHandler;
