-- Migration 0016: add saved_token_id and saved_token_masked to donations table
ALTER TABLE donations ADD COLUMN saved_token_id TEXT;
ALTER TABLE donations ADD COLUMN saved_token_masked TEXT;
