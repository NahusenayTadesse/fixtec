ALTER TABLE `payment_methods` ADD `name_am` varchar(100);--> statement-breakpoint
ALTER TABLE `place_names` ADD `name_am` varchar(100);--> statement-breakpoint
ALTER TABLE `prices` ADD `amount_am` varchar(255);--> statement-breakpoint
ALTER TABLE `product_categories` ADD `name_am` varchar(100);--> statement-breakpoint
ALTER TABLE `product_categories` ADD `description_am` varchar(255);--> statement-breakpoint
ALTER TABLE `products` ADD `name_am` varchar(100);--> statement-breakpoint
ALTER TABLE `products` ADD `description_am` varchar(500);--> statement-breakpoint
ALTER TABLE `testimonials` ADD `position_am` varchar(255);--> statement-breakpoint
ALTER TABLE `testimonials` ADD `message_am` text;