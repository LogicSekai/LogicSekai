import tailwindcss from "@tailwindcss/vite"

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  css: ['@/assets/css/main.css'],

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
    cloudflareAccountId: process.env.CLOUDFLARE_ACCOUNT_ID,
    cloudflareDatabaseId: process.env.CLOUDFLARE_DATABASE_ID,
    cloudflareApiToken: process.env.CLOUDFLARE_API_TOKEN,
    public: {
      baseUrl: process.env.BETTER_AUTH_URL || 'http://localhost:3000'
    }
  }
})