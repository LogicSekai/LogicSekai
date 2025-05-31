export const useUserSearch = () => {
    const pb = usePocketbase()
    const searchQuery = ref('')
    const users = ref<any[]>([])
    const isLoading = ref(false)

    const searchUsers = async () => {
        if (!searchQuery.value.trim()) {
            users.value = []
            return
        }

        isLoading.value = true
        try {
            users.value = await pb.collection('users').getFullList({
                filter: `name ~ "${searchQuery.value}"`,
                fields: 'id,name,avatar,collectionName',
            })
        } catch (error) {
            console.error('Search error:', error)
            users.value = []
        } finally {
            isLoading.value = false
        }
    }

    const getUserAvatar = (user: any) => {
        if (!user.avatar) return '/img/avatar.png'
        return pb.files.getURL(user, user.avatar, {
            thumb: '40x40' // Request thumbnail 40x40
        })
    }

    // Debounce search untuk optimasi performa
    const debouncedSearch = useDebounceFn(searchUsers, 300)

    watch(searchQuery, debouncedSearch)

    return {
        searchQuery,
        users,
        isLoading,
        searchUsers,
        getUserAvatar
    }
}