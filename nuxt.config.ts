import tailwindcss from "@tailwindcss/vite"
import { resolve } from "path"

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: false },
  ssr: false,
  css: ['@/assets/css/main.css'],

  app: {
    head: {
      htmlAttrs: { lang: 'id' },
      titleTemplate: '%s',
      title: 'Logic Sekai — Marketplace & Belajar untuk Kreator Digital Indonesia',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Logic Sekai adalah platform marketplace dan e-learning yang memberdayakan kreator digital Indonesia untuk menjual produk dengan payment gateway sendiri.' },
        { name: 'robots', content: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1' },
        { name: 'theme-color', content: '#0F172A' },
        { name: 'format-detection', content: 'telephone=no' },
        { name: 'author', content: 'Logic Sekai' },
        // Open Graph (default fallback — diperkaya per halaman & oleh prerender bot)
        { property: 'og:site_name', content: 'Logic Sekai' },
        { property: 'og:type', content: 'website' },
        { property: 'og:locale', content: 'id_ID' },
        { property: 'og:title', content: 'Logic Sekai — Marketplace & Belajar untuk Kreator Digital Indonesia' },
        { property: 'og:description', content: 'Platform marketplace dan e-learning untuk kreator digital Indonesia.' },
        { property: 'og:image', content: 'https://logicsekai.com/img/og-banner.jpg' },
        { property: 'og:image:width', content: '1200' },
        { property: 'og:image:height', content: '630' },
        { property: 'og:image:alt', content: 'Logic Sekai' },
        { property: 'og:url', content: 'https://logicsekai.com' },
        // Twitter / X
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:title', content: 'Logic Sekai — Marketplace & Belajar untuk Kreator Digital Indonesia' },
        { name: 'twitter:description', content: 'Platform marketplace dan e-learning untuk kreator digital Indonesia.' },
        { name: 'twitter:image', content: 'https://logicsekai.com/img/og-banner.jpg' },
      ],
      link: [
        { rel: 'canonical', href: 'https://logicsekai.com' },
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
        { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/favicon-32x32.png' },
        { rel: 'icon', type: 'image/png', sizes: '16x16', href: '/favicon-16x16.png' },
        { rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-touch-icon.png' },
        { rel: 'manifest', href: '/manifest.webmanifest' },
      ],
      script: [
        {
          innerHTML: `
            // Prevent FOUC (Flash of Unstyled Content) for dark mode
            (function() {
              const stored = localStorage.getItem('darkMode');
              const shouldBeDark = stored !== null ? JSON.parse(stored) : false;
              
              if (shouldBeDark) {
                document.documentElement.classList.add('dark');
              } else {
                document.documentElement.classList.remove('dark');
              }
            })();
          `,
          type: 'text/javascript'
        }
      ]
    }
  },

  vite: {
    plugins: [
      tailwindcss(),
    ],
    server: {
      allowedHosts: ['logicsekai.com', 'playground.logicsekai.com'],
    },
    esbuild: {
      // Strip all console.* calls and debugger statements in production build
      drop: process.env.NODE_ENV === 'production' ? ['console', 'debugger'] : undefined,
    },
  },

  modules: ['shadcn-nuxt'],
  shadcn: {
    prefix: '',
    componentDir: './app/components/ui',
  },

  nitro: {
    preset: process.env.NODE_ENV === 'production' ? 'cloudflare-pages' : undefined,
    experimental: {
      wasm: true
    },
    esbuild: {
      // Strip all console.* calls and debugger statements from server-side code in production
      options: {
        drop: process.env.NODE_ENV === 'production' ? ['console', 'debugger'] : undefined,
      },
    },
    // Replace Node.js-only packages with stubs in production (Cloudflare Workers)
    // These code paths are never reached in production (guarded by NODE_ENV checks)
    alias: process.env.NODE_ENV === 'production' ? {
      'better-sqlite3': resolve('./server/utils/stubs/better-sqlite3.ts'),
      'drizzle-orm/better-sqlite3': resolve('./server/utils/stubs/drizzle-better-sqlite3.ts'),
    } : {},
  },

  runtimeConfig: {
    betterAuthSecret: process.env.BETTER_AUTH_SECRET || 'dev-secret',
    betterAuthUrl: process.env.BETTER_AUTH_URL || 'http://localhost:3000',
    superadminSetupSecret: process.env.SUPERADMIN_SETUP_SECRET || 'create-superadmin-2024',
    cloudflareAccountId: process.env.CLOUDFLARE_ACCOUNT_ID,
    cloudflareDatabaseId: process.env.CLOUDFLARE_DATABASE_ID,
    cloudflareApiToken: process.env.CLOUDFLARE_API_TOKEN,
    // Midtrans — platform-level donation account
    midtransServerKey: process.env.MIDTRANS_SERVER_KEY || '',
    midtransMode: (process.env.MIDTRANS_MODE || 'sandbox') as 'sandbox' | 'live',
    public: {
      baseUrl: process.env.BETTER_AUTH_URL || 'http://localhost:3000',
      midtransClientKey: process.env.MIDTRANS_CLIENT_KEY || '',
      midtransMode: process.env.MIDTRANS_MODE || 'sandbox',
    }
  }
})