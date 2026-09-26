ALTER TABLE `transactions` ADD `txn_ref` varchar(100);--> statement-breakpoint
ALTER TABLE `transactions` ADD `settled_txn_ref` varchar(100);--> statement-breakpoint
ALTER TABLE `transactions` ADD CONSTRAINT `transactions_txn_ref_unique` UNIQUE(`txn_ref`);