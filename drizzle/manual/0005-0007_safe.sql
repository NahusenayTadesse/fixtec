-- Migrations 0005, 0006 and 0007 in one script that is safe to run more than
-- once, including on a database where an earlier attempt stopped part-way.
--
-- Every step checks information_schema first and does nothing when it is
-- already applied. Plain SQL with prepared statements only — no stored
-- procedures or DELIMITER — so it pastes straight into phpMyAdmin, and it runs
-- on both MariaDB and MySQL.
--
-- `bank_accounts` is given the same character set and collation as `user`.`id`,
-- read from the database itself: its foreign keys to `user` fail with
-- "errno 150 / Foreign key constraint is incorrectly formed" when the two
-- differ, and servers don't agree on a default (utf8mb4_general_ci,
-- utf8mb4_unicode_ci, utf8mb4_uca1400_ai_ci, …).

-- ---------------------------------------------------------------------------
-- 0005
-- ---------------------------------------------------------------------------

-- Walk-in / guest customers have no account and often no email. These MODIFYs
-- are idempotent as they stand.
ALTER TABLE `customers` MODIFY COLUMN `email` varchar(100);
ALTER TABLE `customers` MODIFY COLUMN `user_id` varchar(255);
ALTER TABLE `transactions` MODIFY COLUMN `payment_status`
	enum('pending','paid','unpaid','refunded','partially_paid','partially_refunded','overpaid','disputed')
	DEFAULT 'pending';

SET @sql = (SELECT IF(COUNT(*) = 0,
	'ALTER TABLE `orders` ADD COLUMN `delivered_at` datetime',
	'DO 0')
	FROM information_schema.COLUMNS
	WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'orders' AND COLUMN_NAME = 'delivered_at');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql = (SELECT IF(COUNT(*) = 0,
	'CREATE INDEX `transactions_reciept_link_idx` ON `transactions` (`reciept_link`)',
	'DO 0')
	FROM information_schema.STATISTICS
	WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'transactions'
		AND INDEX_NAME = 'transactions_reciept_link_idx');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- ---------------------------------------------------------------------------
-- 0006 — Chapa
-- ---------------------------------------------------------------------------

SET @sql = (SELECT IF(COUNT(*) = 0,
	'ALTER TABLE `transactions` ADD COLUMN `txn_ref` varchar(100)',
	'DO 0')
	FROM information_schema.COLUMNS
	WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'transactions' AND COLUMN_NAME = 'txn_ref');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql = (SELECT IF(COUNT(*) = 0,
	'ALTER TABLE `transactions` ADD COLUMN `settled_txn_ref` varchar(100)',
	'DO 0')
	FROM information_schema.COLUMNS
	WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'transactions' AND COLUMN_NAME = 'settled_txn_ref');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql = (SELECT IF(COUNT(*) = 0,
	'ALTER TABLE `transactions` ADD CONSTRAINT `transactions_txn_ref_unique` UNIQUE (`txn_ref`)',
	'DO 0')
	FROM information_schema.STATISTICS
	WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'transactions'
		AND INDEX_NAME = 'transactions_txn_ref_unique');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- ---------------------------------------------------------------------------
-- 0007 — bank accounts
-- ---------------------------------------------------------------------------

-- The charset/collation the `created_by` / `updated_by` / `deleted_by` columns
-- must share with `user`.`id` for their foreign keys to be accepted.
SET @user_charset = (SELECT CHARACTER_SET_NAME FROM information_schema.COLUMNS
	WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'user' AND COLUMN_NAME = 'id');
SET @user_collation = (SELECT COLLATION_NAME FROM information_schema.COLUMNS
	WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'user' AND COLUMN_NAME = 'id');

SET @sql = CONCAT(
	'CREATE TABLE IF NOT EXISTS `bank_accounts` (',
	'`id` int NOT NULL AUTO_INCREMENT,',
	'`payment_method_id` int NOT NULL,',
	'`bank_name` varchar(100) NOT NULL,',
	'`account_name` varchar(150) NOT NULL,',
	'`account_number` varchar(50) NOT NULL,',
	'`is_active` boolean NOT NULL DEFAULT true,',
	'`created_by` varchar(255),',
	'`updated_by` varchar(255),',
	'`created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,',
	'`updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,',
	'`deleted_at` datetime,',
	'`deleted_by` varchar(255),',
	'PRIMARY KEY (`id`)',
	') ENGINE=InnoDB DEFAULT CHARSET=', @user_charset, ' COLLATE=', @user_collation);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- If an earlier attempt already created the table with the server's default
-- collation (which is what breaks the foreign keys), convert it to match.
SET @sql = (SELECT IF(COUNT(*) > 0,
	CONCAT('ALTER TABLE `bank_accounts` CONVERT TO CHARACTER SET ', @user_charset, ' COLLATE ', @user_collation),
	'DO 0')
	FROM information_schema.TABLES
	WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'bank_accounts'
		AND TABLE_COLLATION <> @user_collation);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql = (SELECT IF(COUNT(*) = 0,
	'ALTER TABLE `bank_accounts` ADD CONSTRAINT `bank_accounts_payment_method_id_payment_methods_id_fk` FOREIGN KEY (`payment_method_id`) REFERENCES `payment_methods`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION',
	'DO 0')
	FROM information_schema.TABLE_CONSTRAINTS
	WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'bank_accounts'
		AND CONSTRAINT_NAME = 'bank_accounts_payment_method_id_payment_methods_id_fk');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql = (SELECT IF(COUNT(*) = 0,
	'ALTER TABLE `bank_accounts` ADD CONSTRAINT `bank_accounts_created_by_user_id_fk` FOREIGN KEY (`created_by`) REFERENCES `user`(`id`) ON DELETE SET NULL ON UPDATE NO ACTION',
	'DO 0')
	FROM information_schema.TABLE_CONSTRAINTS
	WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'bank_accounts'
		AND CONSTRAINT_NAME = 'bank_accounts_created_by_user_id_fk');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql = (SELECT IF(COUNT(*) = 0,
	'ALTER TABLE `bank_accounts` ADD CONSTRAINT `bank_accounts_updated_by_user_id_fk` FOREIGN KEY (`updated_by`) REFERENCES `user`(`id`) ON DELETE SET NULL ON UPDATE NO ACTION',
	'DO 0')
	FROM information_schema.TABLE_CONSTRAINTS
	WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'bank_accounts'
		AND CONSTRAINT_NAME = 'bank_accounts_updated_by_user_id_fk');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql = (SELECT IF(COUNT(*) = 0,
	'ALTER TABLE `bank_accounts` ADD CONSTRAINT `bank_accounts_deleted_by_user_id_fk` FOREIGN KEY (`deleted_by`) REFERENCES `user`(`id`) ON DELETE SET NULL ON UPDATE NO ACTION',
	'DO 0')
	FROM information_schema.TABLE_CONSTRAINTS
	WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'bank_accounts'
		AND CONSTRAINT_NAME = 'bank_accounts_deleted_by_user_id_fk');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- ---------------------------------------------------------------------------
-- Check: every row should say OK.
-- ---------------------------------------------------------------------------
SELECT 'orders.delivered_at' AS item,
	IF(COUNT(*) = 1, 'OK', 'MISSING') AS state
	FROM information_schema.COLUMNS
	WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'orders' AND COLUMN_NAME = 'delivered_at'
UNION ALL
SELECT 'transactions.txn_ref / settled_txn_ref', IF(COUNT(*) = 2, 'OK', 'MISSING')
	FROM information_schema.COLUMNS
	WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'transactions'
		AND COLUMN_NAME IN ('txn_ref', 'settled_txn_ref')
UNION ALL
SELECT 'bank_accounts collation matches user.id', IF(COUNT(*) = 1, 'OK', 'MISMATCH')
	FROM information_schema.TABLES
	WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'bank_accounts'
		AND TABLE_COLLATION = @user_collation
UNION ALL
SELECT 'bank_accounts foreign keys (4)', IF(COUNT(*) = 4, 'OK', CONCAT(COUNT(*), ' of 4'))
	FROM information_schema.TABLE_CONSTRAINTS
	WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'bank_accounts'
		AND CONSTRAINT_TYPE = 'FOREIGN KEY';
