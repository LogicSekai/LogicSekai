import { toast } from 'vue-sonner'

export const useToaster = (status: 'success' | 'error' | 'info' | 'warning', message: string) => {
    switch (status) {
        case 'success':
            toast.success(message)
            break
        case 'error':
            toast.error(message)
            break
        case 'info':
            toast.info(message)
            break
        case 'warning':
            toast.warning(message)
            break
        default:
            toast(message)
    }
}