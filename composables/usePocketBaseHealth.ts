const pb = usePocketbase()

export const usePocketBaseHealth = () => {
    const isOnline = ref(true)

    const checkHealth = async () => {
        try {
            await pb.health.check()
            isOnline.value = true
        } catch {
            isOnline.value = false
        }
    }

    // Cek setiap 30 detik
    onMounted(() => {
        checkHealth()
        // const interval = setInterval(checkHealth, 30000)
        // onUnmounted(() => clearInterval(interval))
    })

    return { isOnline }
}
