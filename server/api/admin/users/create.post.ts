import { eq, or } from 'drizzle-orm'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import Database from 'better-sqlite3'
import bcrypt from 'bcryptjs'
import { users } from '~/lib/db/schema'
import { createId } from '@paralleldrive/cuid2'

export default defineEventHandler(async (event) => {
    try {
        // Check if user is authenticated and is superadmin
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

        if (!sessionData?.id || !sessionData?.role || sessionData.role !== 'superadmin') {
            throw createError({
                statusCode: 403,
                statusMessage: 'Forbidden - Superadmin access required'
            })
        }

        // Get request body
        const body = await readBody(event)
        const { name, username, email, password, role, verified, sendWelcomeEmail } = body

        // Validate required fields
        if (!name || !username || !email || !password || !role) {
            throw createError({
                statusCode: 400,
                statusMessage: 'Missing required fields: name, username, email, password, role'
            })
        }

        // Validate role
        if (!['user', 'creator', 'superadmin'].includes(role)) {
            throw createError({
                statusCode: 400,
                statusMessage: 'Invalid role. Must be user, creator, or superadmin'
            })
        }

        // Validate password strength
        if (password.length < 8) {
            throw createError({
                statusCode: 400,
                statusMessage: 'Password must be at least 8 characters long'
            })
        }

        // Validate username format
        const usernameRegex = /^[a-zA-Z0-9_]+$/
        if (!usernameRegex.test(username)) {
            throw createError({
                statusCode: 400,
                statusMessage: 'Username can only contain letters, numbers, and underscores'
            })
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(email)) {
            throw createError({
                statusCode: 400,
                statusMessage: 'Please enter a valid email address'
            })
        }

        // Initialize database
        const sqlite = new Database('./dev.db')
        const db = drizzle(sqlite, { schema: { users } })

        // Check if username or email already exists
        const existingUser = await db
        .select()
        .from(users)
        .where(
            or(
                eq(users.username, username),
                eq(users.email, email)
            )
        )
        .limit(1)

        if (existingUser.length > 0) {
        const field = existingUser[0].username === username ? 'Username' : 'Email'
            throw createError({
                statusCode: 409,
                statusMessage: `${field} already exists. Please choose a different one.`
            })
        }

        // Hash password
        const saltRounds = 12
        const hashedPassword = await bcrypt.hash(password, saltRounds)

        // Create user
        const newUser = {
        id: createId(),
        name,
        username,
        email,
        password: hashedPassword,
        avatar: null,
        role: role as 'user' | 'creator' | 'superadmin',
        verified: verified || false,
        created: new Date(),
        updated: new Date()
        }

        const result = await db
        .insert(users)
        .values(newUser)
        .returning({
            id: users.id,
            name: users.name,
            username: users.username,
            email: users.email,
            role: users.role,
            verified: users.verified,
            created: users.created
        })

        // TODO: Implement welcome email sending if sendWelcomeEmail is true
        if (sendWelcomeEmail) {
        // You can implement email sending logic here
        console.log(`Welcome email should be sent to: ${email}`)
        }

        return {
        success: true,
        user: result[0],
        message: `User ${name} created successfully`
        }

    } catch (error: any) {
        console.error('Error creating user:', error)
        
        if (error.statusCode) {
        throw error
        }

        throw createError({
        statusCode: 500,
        statusMessage: 'Internal server error'
        })
    }
})