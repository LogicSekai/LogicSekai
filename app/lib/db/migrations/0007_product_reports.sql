CREATE TABLE IF NOT EXISTS `product_reports` (
	`id` text PRIMARY KEY NOT NULL,
	`product_id` text NOT NULL REFERENCES `products`(`id`) ON DELETE CASCADE,
	`user_id` text REFERENCES `users`(`id`) ON DELETE SET NULL,
	`reason` text NOT NULL,
	`description` text,
	`reporter_email` text,
	`status` text DEFAULT 'pending',
	`admin_note` text,
	`created` integer NOT NULL,
	`updated_at` integer
);
