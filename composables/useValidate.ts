export const useValidate = () => {
    const validateEmail = (email: string) => {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        return re.test(email)
    }

    const validatePassword = (password: string) => {
        return password.length >= 8
    }

    return { validateEmail, validatePassword }
}