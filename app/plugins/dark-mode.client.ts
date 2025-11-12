// Plugin untuk mengatasi FOUC (Flash of Unstyled Content) pada dark mode
export default defineNuxtPlugin(() => {
  // Hanya berjalan di client
    if (process.client) {
        // Sync state dengan class yang mungkin sudah ada dari script inline
        const { syncWithDocument } = useDarkMode()
        syncWithDocument()
    }
})