ALTER TABLE `users` DROP PRIMARY KEY;--> statement-breakpoint
ALTER TABLE `restocks` DROP PRIMARY KEY;--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `id` int AUTO_INCREMENT;--> statement-breakpoint
ALTER TABLE `restocks` MODIFY COLUMN `id` int AUTO_INCREMENT;