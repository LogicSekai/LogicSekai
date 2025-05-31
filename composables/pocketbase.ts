import PocketBase from 'pocketbase'

const appConfig = useAppConfig()
const pb = new PocketBase(appConfig.pocketbase.url)

export const usePocketbase = () => {
    return pb
}

// import PocketBase from 'pocketbase'

// export const usePocketbase = () => {
//     const appConfig = useAppConfig()
//     const pb = new PocketBase(appConfig.pocketbase.url)

//     // Auto-refresh token (penting untuk maintain session)
//     pb.authStore.onChange(() => {
//         if (pb.authStore.isValid) {
//         pb.collection('users').authRefresh().catch(() => pb.authStore.clear())
//         }
//     }, true)

//     return pb
// }