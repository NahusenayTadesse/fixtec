ALTER TABLE `customers` MODIFY COLUMN `email` varchar(100);--> statement-breakpoint
ALTER TABLE `customers` MODIFY COLUMN `user_id` varchar(255);--> statement-breakpoint
ALTER TABLE `transactions` MODIFY COLUMN `payment_status` enum('pending','paid','unpaid','refunded','partially_paid','partially_refunded','overpaid','disputed') DEFAULT 'pending';--> statement-breakpoint
ALTER TABLE `orders` ADD `delivered_at` datetime;--> statement-breakpoint
CREATE INDEX `transactions_reciept_link_idx` ON `transactions` (`reciept_link`);