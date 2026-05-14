import { eq } from 'drizzle-orm';
import { getDB } from '~/lib/db/connection';
import { users } from '~/lib/db/schema';
export default defineEventHandler(async (event) => {
    const userId = getRouterParam(event, 'id');
    
    if (getMethod(event) === 'POST') {
        // Update verification status
        const body = await readBody(event);
        const { verified } = body;

        try {
        const db = getDatabase();
        
        // If verifying, set current timestamp; if unverifying, set null
        const verificationValue = verified ? new Date() : null;
        
        await db.update(users)
            .set({ 
                verified: verificationValue,
                updated: new Date()
            })
            .where(eq(users.id, userId!));

        return { success: true, message: 'User verification updated' };
        } catch (error: any) {
            throw createError({
                statusCode: 500,
                statusMessage: error.message || 'Internal server error'
            });
        }
    }
    
    if (getMethod(event) === 'DELETE') {
        // Delete user
        try {
            const db = getDatabase();
            
            await db.delete(users)
                .where(eq(users.id, userId!));

            return { success: true, message: 'User deleted successfully' };
            } catch (error: any) {
            throw createError({
                statusCode: 500,
                statusMessage: error.message || 'Internal server error'
            });
        }
    }

    throw createError({
        statusCode: 405,
        statusMessage: 'Method not allowed'
    });
});