ALTER TABLE `purchases` DROP PRIMARY KEY;--> statement-breakpoint
ALTER TABLE `purchases` MODIFY COLUMN `id` int AUTO_INCREMENT;