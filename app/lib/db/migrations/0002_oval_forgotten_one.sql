PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_product_categories` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`slug` text NOT NULL,
	`description` text,
	`parent_id` text,
	`image` text,
	`user_id` text,
	`is_active` integer DEFAULT true NOT NULL,
	`sort_order` integer DEFAULT 0,
	`created` integer NOT NULL,
	`updated` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_product_categories`("id", "name", "slug", "description", "parent_id", "image", "user_id", "is_active", "sort_order", "created", "updated") SELECT "id", "name", "slug", "description", "parent_id", "image", NULL, "is_active", "sort_order", "created", "updated" FROM `product_categories`;--> statement-breakpoint
DROP TABLE `product_categories`;--> statement-breakpoint
ALTER TABLE `__new_product_categories` RENAME TO `product_categories`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `product_categories_slug_unique` ON `product_categories` (`slug`);