CREATE TABLE `download_history` (
	`id` text PRIMARY KEY NOT NULL,
	`transaction_id` text NOT NULL,
	`user_id` text NOT NULL,
	`product_id` text NOT NULL,
	`file_name` text,
	`file_size` integer,
	`download_url` text,
	`ip_address` text,
	`user_agent` text,
	`downloaded_at` integer NOT NULL,
	FOREIGN KEY (`transaction_id`) REFERENCES `transactions`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `transaction_items` (
	`id` text PRIMARY KEY NOT NULL,
	`transaction_id` text NOT NULL,
	`item_type` text DEFAULT 'product' NOT NULL,
	`item_id` text NOT NULL,
	`item_name` text NOT NULL,
	`quantity` integer DEFAULT 1 NOT NULL,
	`unit_price` real NOT NULL,
	`total_price` real NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`transaction_id`) REFERENCES `transactions`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `transactions` (
	`id` text PRIMARY KEY NOT NULL,
	`product_id` text NOT NULL,
	`user_id` text NOT NULL,
	`transaction_type` text NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`original_price` real NOT NULL,
	`discount_amount` real DEFAULT 0,
	`final_price` real NOT NULL,
	`currency` text DEFAULT 'IDR',
	`payment_gateway` text,
	`payment_method` text,
	`gateway_transaction_id` text,
	`gateway_response` text,
	`download_count` integer DEFAULT 0,
	`last_download_at` integer,
	`download_limit` integer DEFAULT 10,
	`notes` text,
	`refund_reason` text,
	`refunded_at` integer,
	`ip_address` text,
	`user_agent` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`completed_at` integer,
	FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
