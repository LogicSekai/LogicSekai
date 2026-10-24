-- Migration 0020: tempat sampah untuk konten yang dihapus lewat MCP (bisa dipulihkan)

CREATE TABLE IF NOT EXISTS mcp_trash (
    id TEXT PRIMARY KEY,
    client_id TEXT,
    entity_type TEXT NOT NULL,
    entity_id TEXT NOT NULL,
    title TEXT NOT NULL,
    snapshot TEXT NOT NULL,
    deleted_at INTEGER NOT NULL,
    restored_at INTEGER
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS idx_mcp_trash_deleted ON mcp_trash(deleted_at);
