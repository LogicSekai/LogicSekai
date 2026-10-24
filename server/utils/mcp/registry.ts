/** Gabungan semua tool MCP + filter berdasarkan scope klien. */
import type { McpScope } from './scopes'
import type { McpTool } from './tool-types'
import { MCP_TOOLS } from './tools'
import { WRITE_TOOLS } from './tools-write'

export const ALL_TOOLS: McpTool[] = [...MCP_TOOLS, ...WRITE_TOOLS]

export function toolScopes(t: McpTool): McpScope[] {
    return Array.isArray(t.scope) ? t.scope : [t.scope]
}

export function toolsForScopes(scopes: McpScope[]): McpTool[] {
    const set = new Set(scopes)
    return ALL_TOOLS.filter(t => toolScopes(t).some(s => set.has(s)))
}
