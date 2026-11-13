// @ts-nocheck — memakai modul virtual Nitro (#nitro-internal-*) yang hanya ada saat build.
/**
 * Entry Worker Cloudflare Pages kustom untuk Logic Sekai.
 *
 * Salinan entry bawaan preset `cloudflare-pages` Nitro 2.x
 * (node_modules/nitropack/dist/presets/cloudflare/runtime/cloudflare-pages.mjs)
 * DITAMBAH satu langkah: upgrade WebSocket konvoi OmoRide dicegat lebih dulu dan diteruskan
 * ke Durable Object ConvoyRoom. Ini perlu karena respons 101 (dengan `webSocket`) tidak bisa
 * melewati h3/localFetch Nitro.
 *
 * Diaktifkan di nuxt.config.ts → nitro.entry (hanya build produksi).
 * Saat upgrade Nitro/Nuxt, bandingkan lagi dengan entry bawaan di atas.
 */
import '#nitro-internal-pollyfills'
import { useNitroApp } from 'nitropack/runtime'
import { requestHasBody, runCronTasks } from 'nitropack/runtime/internal'
import { isPublicAssetURL } from '#nitro-internal-virtual/public-assets'
import { handleConvoyWsUpgrade } from './ws-gate'

const nitroApp = useNitroApp()

export default {
  async fetch(request, env, context) {
    if (request.headers.get('upgrade')?.toLowerCase() === 'websocket') {
      try {
        const res = await handleConvoyWsUpgrade(request, env)
        if (res) return res
      } catch (err) {
        return new Response(JSON.stringify({ statusCode: 500, statusMessage: 'Convoy gateway error' }), {
          status: 500,
          headers: { 'content-type': 'application/json' },
        })
      }
    }

    const url = new URL(request.url)
    if (env.ASSETS && isPublicAssetURL(url.pathname)) {
      return env.ASSETS.fetch(request)
    }
    let body
    if (requestHasBody(request)) {
      body = Buffer.from(await request.arrayBuffer())
    }
    globalThis.__env__ = env
    return nitroApp.localFetch(url.pathname + url.search, {
      context: {
        waitUntil: (promise) => context.waitUntil(promise),
        _platform: {
          cf: request.cf,
          cloudflare: {
            request,
            env,
            context,
          },
        },
      },
      host: url.hostname,
      protocol: url.protocol,
      method: request.method,
      headers: request.headers,
      body,
    })
  },
  scheduled(event, env, context) {
    if (import.meta._tasks) {
      globalThis.__env__ = env
      context.waitUntil(
        runCronTasks(event.cron, {
          context: {
            cloudflare: {
              env,
              context,
            },
          },
          payload: {},
        }),
      )
    }
  },
}
