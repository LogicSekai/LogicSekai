export default defineEventHandler(async (event) => {
    if (getMethod(event) !== 'POST') {
        throw createError({
            statusCode: 405,
            statusMessage: 'Method not allowed'
        });
    }

    // Clear session cookie on server side
    setCookie(event, 'user-session', '', {
        maxAge: -1, // Expire immediately
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax'
    })

    return {
        success: true,
        message: 'Logged out successfully'
    }
});