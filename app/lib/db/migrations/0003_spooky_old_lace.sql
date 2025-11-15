CREATE TABLE `product_category_mappings` (
	`id` text PRIMARY KEY NOT NULL,
	`product_id` text NOT NULL,
	`category_id` text NOT NULL,
	`created` integer NOT NULL,
	FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`category_id`) REFERENCES `product_categories`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `product_reviews` (
	`id` text PRIMARY KEY NOT NULL,
	`product_id` text NOT NULL,
	`user_id` text NOT NULL,
	`rating` integer NOT NULL,
	`review` text,
	`is_verified_purchase` integer DEFAULT false,
	`creator_reply` text,
	`creator_replied_at` integer,
	`is_active` integer DEFAULT true,
	`created` integer NOT NULL,
	`updated` integer NOT NULL,
	FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `products` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`slug` text NOT NULL,
	`description` text,
	`short_description` text,
	`features` text,
	`tags` text,
	`user_id` text NOT NULL,
	`contributors` text,
	`release_date` integer,
	`last_updated` integer,
	`version` text,
	`documentation_url` text,
	`live_preview_url` text,
	`external_urls` text,
	`license_type` text,
	`support_type` text,
	`thumbnail_image` text,
	`preview_images` text,
	`product_files` text,
	`stock_type` text DEFAULT 'unlimited',
	`stock_quantity` integer,
	`is_available` integer DEFAULT true,
	`base_price` real NOT NULL,
	`currency` text DEFAULT 'IDR',
	`discount_type` text,
	`discount_value` real,
	`discount_start_date` integer,
	`discount_end_date` integer,
	`total_views` integer DEFAULT 0,
	`total_sales` integer DEFAULT 0,
	`total_revenue` real DEFAULT 0,
	`average_rating` real DEFAULT 0,
	`total_reviews` integer DEFAULT 0,
	`status` text DEFAULT 'draft',
	`is_active` integer DEFAULT true,
	`created` integer NOT NULL,
	`updated` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `products_slug_unique` ON `products` (`slug`);