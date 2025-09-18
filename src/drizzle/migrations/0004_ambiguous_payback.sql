ALTER TABLE `categories` DROP PRIMARY KEY;--> statement-breakpoint
ALTER TABLE `categories` MODIFY COLUMN `id` int AUTO_INCREMENT;