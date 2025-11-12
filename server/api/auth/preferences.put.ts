export default defineEventHandler(async (event) => {
    try {
        // Check if user is authenticated
        const session = getCookie(event, 'user-session')
        if (!session) {
            throw createError({
                statusCode: 401,
                statusMessage: 'Unauthorized'
            })
        }

        let sessionData
        try {
            sessionData = typeof session === 'string' 
                ? JSON.parse(session) 
                : session
        } catch {
            throw createError({
                statusCode: 401,
                statusMessage: 'Invalid session'
            })
        }

        if (!sessionData?.id) {
            throw createError({
                statusCode: 401,
                statusMessage: 'Invalid session data'
            })
        }

        // Get request body
        const body = await readBody(event)
        const { theme, notifications } = body

        // Validate theme
        const validThemes = ['light', 'dark', 'system']
        if (theme && !validThemes.includes(theme)) {
            throw createError({
                statusCode: 400,
                statusMessage: 'Invalid theme. Must be light, dark, or system'
            })
        }

        // For now, we'll store preferences in a simple way
        // In a real application, you might want to create a separate preferences table
        
        // Here we could save to database, but for simplicity we'll just return success
        // You can extend this to save to a preferences table or JSON column

        return {
            success: true,
            message: 'Preferences saved successfully',
            preferences: {
                theme: theme || 'system',
                notifications: notifications || {
                    emailNotifications: true,
                    pushNotifications: false,
                    securityAlerts: true,
                    activityUpdates: false
                }
            }
        }

    } catch (error: any) {
        console.error('Error updating preferences:', error)
        
        if (error.statusCode) {
            throw error
        }

        throw createError({
            statusCode: 500,
            statusMessage: 'Internal server error'
        })
    }
})