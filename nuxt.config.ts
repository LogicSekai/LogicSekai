import tailwindcss from "@tailwindcss/vite"
import { resolve } from "path"

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  ssr: false,
  css: ['@/assets/css/main.css'],

  app: {
    head: {
      script: [
        {
          innerHTML: `
            // Prevent FOUC (Flash of Unstyled Content) for dark mode
            (function() {
              const stored = localStorage.getItem('darkMode');
              const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
              const shouldBeDark = stored !== null ? JSON.parse(stored) : prefersDark;
              
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
  },

  modules: ['shadcn-nuxt'],
  shadcn: {
    prefix: '',
    componentDir: './app/components/ui',
  },

  nitro: {
    preset: 'cloudflare-pages',
    experimental: {
      wasm: true
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
    public: {
      baseUrl: process.env.BETTER_AUTH_URL || 'http://localhost:3000'
    }
  }
})