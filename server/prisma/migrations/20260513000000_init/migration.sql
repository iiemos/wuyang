CREATE TABLE `users` (
  `id` VARCHAR(191) NOT NULL,
  `username` VARCHAR(191) NULL,
  `password_hash` VARCHAR(255) NULL,
  `nickname` VARCHAR(64) NOT NULL,
  `phone` VARCHAR(32) NULL,
  `email` VARCHAR(128) NULL,
  `status` VARCHAR(32) NOT NULL DEFAULT 'active',
  `publish_count` INTEGER NOT NULL DEFAULT 0,
  `favorite_count` INTEGER NOT NULL DEFAULT 0,
  `view_count` INTEGER NOT NULL DEFAULT 0,
  `registered_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `last_login_at` DATETIME(3) NULL,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `users_username_key` (`username`),
  UNIQUE INDEX `users_phone_key` (`phone`)
);

CREATE TABLE `roles` (
  `id` VARCHAR(191) NOT NULL,
  `code` VARCHAR(64) NOT NULL,
  `name` VARCHAR(64) NOT NULL,
  `description` VARCHAR(255) NULL,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `roles_code_key` (`code`)
);

CREATE TABLE `permissions` (
  `id` VARCHAR(191) NOT NULL,
  `code` VARCHAR(96) NOT NULL,
  `name` VARCHAR(64) NOT NULL,
  `description` VARCHAR(255) NULL,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `permissions_code_key` (`code`)
);

CREATE TABLE `user_roles` (
  `user_id` VARCHAR(191) NOT NULL,
  `role_id` VARCHAR(191) NOT NULL,
  PRIMARY KEY (`user_id`, `role_id`)
);

CREATE TABLE `role_permissions` (
  `role_id` VARCHAR(191) NOT NULL,
  `permission_id` VARCHAR(191) NOT NULL,
  PRIMARY KEY (`role_id`, `permission_id`)
);

CREATE TABLE `content_items` (
  `id` VARCHAR(191) NOT NULL,
  `type` VARCHAR(32) NOT NULL,
  `title` VARCHAR(128) NOT NULL,
  `tag` VARCHAR(32) NOT NULL,
  `price` VARCHAR(64) NULL,
  `address` VARCHAR(160) NULL,
  `contact` VARCHAR(64) NOT NULL,
  `phone` VARCHAR(32) NOT NULL,
  `publisher` VARCHAR(64) NULL,
  `status` VARCHAR(32) NOT NULL DEFAULT 'pending',
  `reject_reason` TEXT NULL,
  `offline_reason` TEXT NULL,
  `summary` TEXT NULL,
  `highlights` JSON NULL,
  `is_top` BOOLEAN NOT NULL DEFAULT false,
  `top_priority` INTEGER NOT NULL DEFAULT 0,
  `top_expire_at` DATETIME(3) NULL,
  `is_recommended` BOOLEAN NOT NULL DEFAULT false,
  `company` VARCHAR(96) NULL,
  `owner_type` VARCHAR(32) NULL,
  `license_no` VARCHAR(96) NULL,
  `package_name` VARCHAR(64) NULL,
  `package_expire_at` DATETIME(3) NULL,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL,
  PRIMARY KEY (`id`),
  INDEX `content_items_type_status_created_at_idx` (`type`, `status`, `created_at`),
  INDEX `content_items_is_top_top_priority_idx` (`is_top`, `top_priority`)
);

CREATE TABLE `certifications` (
  `id` VARCHAR(191) NOT NULL,
  `applicant` VARCHAR(96) NOT NULL,
  `type` VARCHAR(32) NOT NULL,
  `phone` VARCHAR(32) NOT NULL,
  `status` VARCHAR(32) NOT NULL DEFAULT 'pending',
  `material` VARCHAR(255) NULL,
  `reject_reason` TEXT NULL,
  `submitted_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL,
  PRIMARY KEY (`id`),
  INDEX `certifications_status_submitted_at_idx` (`status`, `submitted_at`)
);

CREATE TABLE `reports` (
  `id` VARCHAR(191) NOT NULL,
  `target_id` VARCHAR(64) NOT NULL,
  `target_title` VARCHAR(128) NOT NULL,
  `reason` VARCHAR(255) NOT NULL,
  `reporter` VARCHAR(64) NOT NULL,
  `status` VARCHAR(32) NOT NULL DEFAULT 'pending',
  `result` VARCHAR(255) NULL,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL,
  PRIMARY KEY (`id`),
  INDEX `reports_status_created_at_idx` (`status`, `created_at`)
);

CREATE TABLE `companies` (
  `id` VARCHAR(191) NOT NULL,
  `name` VARCHAR(96) NOT NULL,
  `status` VARCHAR(32) NOT NULL DEFAULT 'pending',
  `credit` VARCHAR(8) NOT NULL DEFAULT 'B',
  `jobs` INTEGER NOT NULL DEFAULT 0,
  `contact` VARCHAR(64) NULL,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL,
  PRIMARY KEY (`id`)
);

CREATE TABLE `recruitment_blacklist` (
  `id` VARCHAR(191) NOT NULL,
  `phone` VARCHAR(32) NULL,
  `user_id` VARCHAR(64) NULL,
  `reason` VARCHAR(255) NULL,
  `operator` VARCHAR(64) NOT NULL,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  INDEX `recruitment_blacklist_phone_idx` (`phone`),
  INDEX `recruitment_blacklist_user_id_idx` (`user_id`)
);

CREATE TABLE `agencies` (
  `id` VARCHAR(191) NOT NULL,
  `name` VARCHAR(96) NOT NULL,
  `broker` VARCHAR(64) NOT NULL,
  `status` VARCHAR(32) NOT NULL DEFAULT 'pending',
  `houses` INTEGER NOT NULL DEFAULT 0,
  `pass_rate` VARCHAR(16) NOT NULL DEFAULT '0%',
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL,
  PRIMARY KEY (`id`)
);

CREATE TABLE `resource_categories` (
  `id` VARCHAR(191) NOT NULL,
  `group` VARCHAR(32) NOT NULL,
  `name` VARCHAR(64) NOT NULL,
  `status` VARCHAR(32) NOT NULL DEFAULT 'enabled',
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `resource_categories_group_name_key` (`group`, `name`)
);

CREATE TABLE `article_categories` (
  `id` VARCHAR(191) NOT NULL,
  `name` VARCHAR(64) NOT NULL,
  `status` VARCHAR(32) NOT NULL DEFAULT 'enabled',
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `article_categories_name_key` (`name`)
);

CREATE TABLE `ad_positions` (
  `id` VARCHAR(191) NOT NULL,
  `name` VARCHAR(96) NOT NULL,
  `scene` VARCHAR(64) NOT NULL,
  `pv` INTEGER NOT NULL DEFAULT 0,
  `uv` INTEGER NOT NULL DEFAULT 0,
  `ctr` VARCHAR(16) NOT NULL DEFAULT '0%',
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL,
  PRIMARY KEY (`id`)
);

CREATE TABLE `ads` (
  `id` VARCHAR(191) NOT NULL,
  `position_id` VARCHAR(191) NOT NULL,
  `title` VARCHAR(128) NOT NULL,
  `image` VARCHAR(255) NULL,
  `link_type` VARCHAR(32) NOT NULL DEFAULT 'category',
  `link_value` VARCHAR(128) NOT NULL DEFAULT 'jobs',
  `status` VARCHAR(32) NOT NULL DEFAULT 'enabled',
  `start_at` DATETIME(3) NULL,
  `end_at` DATETIME(3) NULL,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL,
  PRIMARY KEY (`id`),
  INDEX `ads_position_id_status_idx` (`position_id`, `status`)
);

CREATE TABLE `top_orders` (
  `id` VARCHAR(191) NOT NULL,
  `target_id` VARCHAR(64) NOT NULL,
  `target_title` VARCHAR(128) NOT NULL,
  `buyer` VARCHAR(64) NOT NULL,
  `amount` DECIMAL(10, 2) NOT NULL,
  `status` VARCHAR(32) NOT NULL DEFAULT 'pending',
  `started_at` DATETIME(3) NOT NULL,
  `expired_at` DATETIME(3) NOT NULL,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL,
  PRIMARY KEY (`id`),
  INDEX `top_orders_status_expired_at_idx` (`status`, `expired_at`)
);

CREATE TABLE `settings` (
  `key` VARCHAR(64) NOT NULL,
  `value` JSON NOT NULL,
  `updated_at` DATETIME(3) NOT NULL,
  PRIMARY KEY (`key`)
);

CREATE TABLE `sensitive_words` (
  `id` VARCHAR(191) NOT NULL,
  `word` VARCHAR(96) NOT NULL,
  `hit_count` INTEGER NOT NULL DEFAULT 0,
  `status` VARCHAR(32) NOT NULL DEFAULT 'enabled',
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `sensitive_words_word_key` (`word`)
);

CREATE TABLE `notices` (
  `id` VARCHAR(191) NOT NULL,
  `title` VARCHAR(128) NOT NULL,
  `content` TEXT NOT NULL,
  `status` VARCHAR(32) NOT NULL DEFAULT 'enabled',
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL,
  PRIMARY KEY (`id`)
);

CREATE TABLE `operation_logs` (
  `id` VARCHAR(191) NOT NULL,
  `operator` VARCHAR(64) NOT NULL,
  `action` VARCHAR(96) NOT NULL,
  `target` VARCHAR(128) NOT NULL,
  `ip` VARCHAR(64) NULL,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  INDEX `operation_logs_created_at_idx` (`created_at`)
);

CREATE TABLE `login_logs` (
  `id` VARCHAR(191) NOT NULL,
  `account` VARCHAR(64) NOT NULL,
  `ip` VARCHAR(64) NULL,
  `status` VARCHAR(32) NOT NULL,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  INDEX `login_logs_created_at_idx` (`created_at`)
);

CREATE TABLE `messages` (
  `id` VARCHAR(191) NOT NULL,
  `title` VARCHAR(128) NOT NULL,
  `body` TEXT NOT NULL,
  `unread` BOOLEAN NOT NULL DEFAULT true,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  INDEX `messages_created_at_idx` (`created_at`)
);

ALTER TABLE `user_roles` ADD CONSTRAINT `user_roles_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `user_roles` ADD CONSTRAINT `user_roles_role_id_fkey` FOREIGN KEY (`role_id`) REFERENCES `roles`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `role_permissions` ADD CONSTRAINT `role_permissions_role_id_fkey` FOREIGN KEY (`role_id`) REFERENCES `roles`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `role_permissions` ADD CONSTRAINT `role_permissions_permission_id_fkey` FOREIGN KEY (`permission_id`) REFERENCES `permissions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `ads` ADD CONSTRAINT `ads_position_id_fkey` FOREIGN KEY (`position_id`) REFERENCES `ad_positions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
