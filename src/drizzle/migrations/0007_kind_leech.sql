ALTER TABLE `sweets` DROP PRIMARY KEY;--> statement-breakpoint
ALTER TABLE `sweets` MODIFY COLUMN `id` int AUTO_INCREMENT;