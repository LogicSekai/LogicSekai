CREATE TABLE IF NOT EXISTS `creator_profiles` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL UNIQUE REFERENCES `users`(`id`) ON DELETE CASCADE,
	`headline` text,
	`bio` text,
	`location` text,
	`website` text,
	`social_links` text,
	`donation_links` text,
	`is_public` integer DEFAULT true,
	`created` integer NOT NULL,
	`updated` integer NOT NULL
);
