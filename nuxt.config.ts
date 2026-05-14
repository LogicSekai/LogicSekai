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
    public: {
      baseUrl: process.env.BETTER_AUTH_URL || 'http://localhost:3000'
    }
  }
})