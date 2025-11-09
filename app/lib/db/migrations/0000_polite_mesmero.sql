CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`username` text NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`password` text NOT NULL,
	`avatar` text,
	`role` text DEFAULT 'user' NOT NULL,
	`verified` integer DEFAULT NULL,
	`suspended` integer DEFAULT NULL,
	`created` integer NOT NULL,
	`updated` integer NOT NULL,
	`deleted` integer DEFAULT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_username_unique` ON `users` (`username`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);