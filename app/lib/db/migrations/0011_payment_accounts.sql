CREATE TABLE `payment_accounts` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL REFERENCES `users`(`id`) ON DELETE CASCADE,
	`provider` text NOT NULL DEFAULT 'midtrans',
	`mode` text NOT NULL DEFAULT 'sandbox',
	`encrypted_server_key` text,
	`encrypted_client_key` text,
	`masked_server_key` text,
	`masked_client_key` text,
	`key_version` integer NOT NULL DEFAULT 1,
	`is_active` integer NOT NULL DEFAULT 0,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `payment_audit_logs` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL REFERENCES `users`(`id`),
	`account_id` text,
	`action` text NOT NULL,
	`provider` text,
	`ip_address` text,
	`user_agent` text,
	`metadata` text,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `payment_accounts_user_idx` ON `payment_accounts` (`user_id`);
--> statement-breakpoint
CREATE INDEX `payment_audit_logs_user_idx` ON `payment_audit_logs` (`user_id`);
--> statement-breakpoint
CREATE INDEX `payment_audit_logs_account_idx` ON `payment_audit_logs` (`account_id`);
