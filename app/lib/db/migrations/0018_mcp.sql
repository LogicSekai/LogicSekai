-- Migration 0018: MCP (Model Context Protocol) server dengan signature per klien

CREATE TABLE IF NOT EXISTS mcp_clients (
    id TEXT PRIMARY KEY,
    client_id TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    description TEXT,
    created_by TEXT REFERENCES users(id) ON DELETE SET NULL,
    encrypted_secret TEXT NOT NULL,
    masked_secret TEXT NOT NULL,
    key_version INTEGER NOT NULL DEFAULT 1,
    scopes TEXT NOT NULL DEFAULT '[]',
    allowed_ips TEXT NOT NULL DEFAULT '[]',
    status TEXT NOT NULL DEFAULT 'active',
    expires_at INTEGER,
    last_used_at INTEGER,
    last_used_ip TEXT,
    secret_rotated_at INTEGER,
    revoked_at INTEGER,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS mcp_nonces (
    id TEXT PRIMARY KEY,
    client_id TEXT NOT NULL,
    nonce TEXT NOT NULL,
    expires_at INTEGER NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS uq_mcp_nonces_client_nonce ON mcp_nonces(client_id, nonce);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS idx_mcp_nonces_expires ON mcp_nonces(expires_at);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS mcp_sessions (
    id TEXT PRIMARY KEY,
    client_id TEXT NOT NULL,
    protocol_version TEXT NOT NULL,
    client_info TEXT,
    created_at INTEGER NOT NULL,
    last_seen_at INTEGER NOT NULL,
    expires_at INTEGER NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS idx_mcp_sessions_client ON mcp_sessions(client_id);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS mcp_audit_logs (
    id TEXT PRIMARY KEY,
    client_id TEXT,
    action TEXT NOT NULL,
    tool_name TEXT,
    success INTEGER NOT NULL DEFAULT 1,
    error_code TEXT,
    ip_address TEXT,
    user_agent TEXT,
    metadata TEXT,
    created_at INTEGER NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS idx_mcp_audit_client ON mcp_audit_logs(client_id);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS idx_mcp_audit_created ON mcp_audit_logs(created_at);
