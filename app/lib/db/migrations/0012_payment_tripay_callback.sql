ALTER TABLE `payment_accounts` ADD COLUMN `encrypted_extra_key` text;
--> statement-breakpoint
ALTER TABLE `payment_accounts` ADD COLUMN `masked_extra_key` text;
--> statement-breakpoint
ALTER TABLE `payment_accounts` ADD COLUMN `callback_token` text;
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS `payment_accounts_callback_token_idx` ON `payment_accounts` (`callback_token`);
