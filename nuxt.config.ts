import tailwindcss from "@tailwindcss/vite"

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
    }
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