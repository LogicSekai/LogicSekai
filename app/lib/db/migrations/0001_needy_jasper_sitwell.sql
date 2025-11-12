CREATE TABLE `product_categories` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`slug` text NOT NULL,
	`description` text,
	`parent_id` text,
	`image` text,
	`is_active` integer DEFAULT true NOT NULL,
	`sort_order` integer DEFAULT 0,
	`created` integer NOT NULL,
	`updated` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `product_categories_slug_unique` ON `product_categories` (`slug`);