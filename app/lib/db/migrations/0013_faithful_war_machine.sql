CREATE TABLE `article_comments` (
        `id` text PRIMARY KEY NOT NULL,
        `article_id` text NOT NULL,
        `user_id` text NOT NULL,
        `parent_id` text,
        `content` text NOT NULL,
        `is_hidden` integer DEFAULT false NOT NULL,
        `created_at` integer NOT NULL,
        `updated_at` integer NOT NULL,
        FOREIGN KEY (`article_id`) REFERENCES `articles`(`id`) ON UPDATE no action ON DELETE cascade,
        FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `article_reactions` (
        `id` text PRIMARY KEY NOT NULL,
        `article_id` text NOT NULL,
        `user_id` text NOT NULL,
        `type` text DEFAULT 'like' NOT NULL,
        `created_at` integer NOT NULL,
        FOREIGN KEY (`article_id`) REFERENCES `articles`(`id`) ON UPDATE no action ON DELETE cascade,
        FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `gallery` (
        `id` text PRIMARY KEY NOT NULL,
        `title` text NOT NULL,
        `description` text,
        `type` text DEFAULT 'photo' NOT NULL,
        `url` text NOT NULL,
        `thumbnail_url` text,
        `is_published` integer DEFAULT false NOT NULL,
        `sort_order` integer DEFAULT 0 NOT NULL,
        `display_date` integer,
        `created_at` integer NOT NULL,
        `updated_at` integer NOT NULL
);
--> statement-breakpoint
ALTER TABLE `support_tickets` ADD COLUMN `attachments` text;
--> statement-breakpoint
ALTER TABLE `support_ticket_replies` ADD COLUMN `attachments` text;