-- Migration: Add user_id column to product_categories table
-- Step 1: Add user_id column as nullable first
ALTER TABLE `product_categories` ADD `user_id` text;

-- Step 2: Create a default user if needed (you can update this with actual user ID)
-- This is just a placeholder - you should update with real user IDs in production
-- INSERT INTO `users` (id, username, name, email, password, role, created, updated) 
-- VALUES ('default-admin', 'admin', 'System Admin', 'admin@system.com', 'hashed-password', 'superadmin', strftime('%s', 'now'), strftime('%s', 'now'))
-- ON CONFLICT(id) DO NOTHING;

-- Step 3: Update existing records with a default user (replace 'default-user-id' with actual user ID)
-- UPDATE `product_categories` SET `user_id` = 'default-user-id' WHERE `user_id` IS NULL;

-- Step 4: Make the column NOT NULL and add foreign key constraint
-- Note: SQLite doesn't support adding NOT NULL constraints to existing columns
-- So we need to recreate the table if we want NOT NULL constraint

-- For now, we'll leave it as nullable and handle this in application logic
-- You can manually update existing records and then modify the schema if needed