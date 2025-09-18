ALTER TABLE `users` MODIFY COLUMN `deleted_at` datetime;--> statement-breakpoint
ALTER TABLE `sweets` MODIFY COLUMN `deleted_at` datetime;--> statement-breakpoint
ALTER TABLE `purchases` MODIFY COLUMN `deleted_at` datetime;--> statement-breakpoint
ALTER TABLE `restocks` MODIFY COLUMN `deleted_at` datetime;