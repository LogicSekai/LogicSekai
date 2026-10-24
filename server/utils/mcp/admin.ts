/** Helper bersama untuk endpoint admin MCP. */
import { z } from 'zod'
import { MCP_SCOPES, parseJsonArray } from './scopes'
import { isValidIpRule } from './signature'

const scopeKeys = Object.keys(MCP_SCOPES) as [string, ...string[]]

export const mcpClientInputSchema = z.object({
    name: z.string().trim().min(3, 'Nama minimal 3 karakter').max(80),
    description: z.string().trim().max(300).optional().nullable(),
    scopes: z.array(z.enum(scopeKeys)).min(1, 'Pilih minimal satu scope').max(scopeKeys.length),
    allowedIps: z.array(z.string().trim().refine(isValidIpRule, 'IP / CIDR tidak valid')).max(20).default([]),
    // null = tidak kedaluwarsa
    expiresInDays: z.number().int().min(1).max(3650).optional().nullable(),
})

export const mcpClientPatchSchema = z.object({
    name: z.string().trim().min(3).max(80).optional(),
    description: z.string().trim().max(300).optional().nullable(),
    scopes: z.array(z.enum(scopeKeys)).min(1).max(scopeKeys.length).optional(),
    allowedIps: z.array(z.string().trim().refine(isValidIpRule, 'IP / CIDR tidak valid')).max(20).optional(),
    expiresInDays: z.number().int().min(1).max(3650).optional().nullable(),
    status: z.enum(['active', 'revoked']).optional(),
})

export function serializeMcpClient(c: any) {
    return {
        id: c.id,
        clientId: c.clientId,
        name: c.name,
        description: c.description,
        maskedSecret: c.maskedSecret,
        scopes: parseJsonArray(c.scopes),
        allowedIps: parseJsonArray(c.allowedIps),
        status: c.status,
        expiresAt: c.expiresAt,
        lastUsedAt: c.lastUsedAt,
        lastUsedIp: c.lastUsedIp,
        secretRotatedAt: c.secretRotatedAt,
        revokedAt: c.revokedAt,
        createdAt: c.createdAt,
        updatedAt: c.updatedAt,
    }
}

export function validationError(err: z.ZodError) {
    const first = err.issues[0]
    return createError({ statusCode: 400, statusMessage: first ? `${first.path.join('.') || 'input'}: ${first.message}` : 'Input tidak valid' })
}
