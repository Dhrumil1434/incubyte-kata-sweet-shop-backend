CREATE TABLE `categories` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`is_active` boolean DEFAULT true,
	`created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	`deleted_at` datetime,
	CONSTRAINT `categories_name_unique` UNIQUE(`name`)
);
--> statement-breakpoint
ALTER TABLE `sweets` CHANGE COLUMN `category` TO `category_id`;--> statement-breakpoint
ALTER TABLE `sweets` MODIFY COLUMN `category_id` int NOT NULL;--> statement-breakpoint
ALTER TABLE `sweets` ADD CONSTRAINT `sweets_category_id_categories_id_fk` FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`);