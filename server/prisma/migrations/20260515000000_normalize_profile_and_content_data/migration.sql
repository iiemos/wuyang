CREATE TABLE IF NOT EXISTS `content_images` (
  `id` VARCHAR(191) NOT NULL,
  `content_id` VARCHAR(191) NOT NULL,
  `url` VARCHAR(255) NOT NULL,
  `sort_order` INTEGER NOT NULL DEFAULT 0,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  INDEX `content_images_content_id_sort_order_idx` (`content_id`, `sort_order`),
  CONSTRAINT `content_images_content_id_fkey` FOREIGN KEY (`content_id`) REFERENCES `content_items`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS `content_highlights` (
  `id` VARCHAR(191) NOT NULL,
  `content_id` VARCHAR(191) NOT NULL,
  `text` VARCHAR(32) NOT NULL,
  `sort_order` INTEGER NOT NULL DEFAULT 0,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  INDEX `content_highlights_content_id_sort_order_idx` (`content_id`, `sort_order`),
  CONSTRAINT `content_highlights_content_id_fkey` FOREIGN KEY (`content_id`) REFERENCES `content_items`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
);

INSERT INTO `content_images` (`id`, `content_id`, `url`, `sort_order`)
SELECT CONCAT('ci_', REPLACE(UUID(), '-', '')), item.`id`, image_rows.`url`, image_rows.`sort_order`
FROM `content_items` item
JOIN JSON_TABLE(
  CASE WHEN JSON_VALID(item.`images`) AND JSON_TYPE(item.`images`) = 'ARRAY' THEN item.`images` ELSE JSON_ARRAY() END,
  '$[*]' COLUMNS (`sort_order` FOR ORDINALITY, `url` VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci PATH '$')
) image_rows
WHERE NOT EXISTS (
  SELECT 1 FROM `content_images` existing
  WHERE existing.`content_id` = item.`id` AND existing.`url` = image_rows.`url`
);

INSERT INTO `content_highlights` (`id`, `content_id`, `text`, `sort_order`)
SELECT CONCAT('ch_', REPLACE(UUID(), '-', '')), item.`id`, highlight_rows.`text`, highlight_rows.`sort_order`
FROM `content_items` item
JOIN JSON_TABLE(
  CASE WHEN JSON_VALID(item.`highlights`) AND JSON_TYPE(item.`highlights`) = 'ARRAY' THEN item.`highlights` ELSE JSON_ARRAY() END,
  '$[*]' COLUMNS (`sort_order` FOR ORDINALITY, `text` VARCHAR(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci PATH '$')
) highlight_rows
WHERE NOT EXISTS (
  SELECT 1 FROM `content_highlights` existing
  WHERE existing.`content_id` = item.`id` AND existing.`text` = highlight_rows.`text`
);

CREATE TABLE IF NOT EXISTS `platform_settings` (
  `id` VARCHAR(32) NOT NULL DEFAULT 'platform',
  `app_name` VARCHAR(64) NOT NULL DEFAULT '青柠本地生活',
  `logo` VARCHAR(255) NULL,
  `city` VARCHAR(64) NOT NULL DEFAULT '舞阳',
  `customer_service_phone` VARCHAR(32) NULL,
  `customer_wechat` VARCHAR(64) NULL,
  `customer_qq` VARCHAR(64) NULL,
  `sensitive_strategy` VARCHAR(32) NOT NULL DEFAULT 'manual',
  `new_user_publish_delay_hours` INTEGER NOT NULL DEFAULT 0,
  `user_agreement` TEXT NULL,
  `privacy_policy` TEXT NULL,
  `about_us` TEXT NULL,
  `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`)
);

INSERT INTO `platform_settings` (
  `id`, `app_name`, `logo`, `city`, `customer_service_phone`, `customer_wechat`, `customer_qq`,
  `sensitive_strategy`, `new_user_publish_delay_hours`, `user_agreement`, `privacy_policy`, `about_us`
)
SELECT
  'platform',
  COALESCE(JSON_UNQUOTE(JSON_EXTRACT(`value`, '$.appName')), '青柠本地生活'),
  NULLIF(JSON_UNQUOTE(JSON_EXTRACT(`value`, '$.logo')), 'null'),
  COALESCE(JSON_UNQUOTE(JSON_EXTRACT(`value`, '$.city')), '舞阳'),
  NULLIF(JSON_UNQUOTE(JSON_EXTRACT(`value`, '$.customerServicePhone')), 'null'),
  NULLIF(JSON_UNQUOTE(JSON_EXTRACT(`value`, '$.customerWechat')), 'null'),
  NULLIF(JSON_UNQUOTE(JSON_EXTRACT(`value`, '$.customerQq')), 'null'),
  COALESCE(JSON_UNQUOTE(JSON_EXTRACT(`value`, '$.sensitiveStrategy')), 'manual'),
  COALESCE(CAST(JSON_UNQUOTE(JSON_EXTRACT(`value`, '$.newUserPublishDelayHours')) AS UNSIGNED), 0),
  NULLIF(JSON_UNQUOTE(JSON_EXTRACT(`value`, '$.userAgreement')), 'null'),
  NULLIF(JSON_UNQUOTE(JSON_EXTRACT(`value`, '$.privacyPolicy')), 'null'),
  NULLIF(JSON_UNQUOTE(JSON_EXTRACT(`value`, '$.aboutUs')), 'null')
FROM `settings`
WHERE `key` = 'platform'
ON DUPLICATE KEY UPDATE
  `app_name` = VALUES(`app_name`),
  `logo` = VALUES(`logo`),
  `city` = VALUES(`city`),
  `customer_service_phone` = VALUES(`customer_service_phone`),
  `customer_wechat` = VALUES(`customer_wechat`),
  `customer_qq` = VALUES(`customer_qq`),
  `sensitive_strategy` = VALUES(`sensitive_strategy`),
  `new_user_publish_delay_hours` = VALUES(`new_user_publish_delay_hours`),
  `user_agreement` = VALUES(`user_agreement`),
  `privacy_policy` = VALUES(`privacy_policy`),
  `about_us` = VALUES(`about_us`);

INSERT INTO `platform_settings` (`id`)
SELECT 'platform'
WHERE NOT EXISTS (SELECT 1 FROM `platform_settings` WHERE `id` = 'platform');

CREATE TABLE IF NOT EXISTS `platform_audit_required_types` (
  `id` VARCHAR(191) NOT NULL,
  `setting_id` VARCHAR(32) NOT NULL,
  `type` VARCHAR(32) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `platform_audit_required_types_setting_id_type_key` (`setting_id`, `type`),
  CONSTRAINT `platform_audit_required_types_setting_id_fkey` FOREIGN KEY (`setting_id`) REFERENCES `platform_settings`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
);

INSERT IGNORE INTO `platform_audit_required_types` (`id`, `setting_id`, `type`)
SELECT CONCAT('pat_', REPLACE(UUID(), '-', '')), 'platform', audit_rows.`type`
FROM `settings`
JOIN JSON_TABLE(
  CASE
    WHEN `key` = 'platform'
      AND JSON_VALID(`value`)
      AND JSON_TYPE(JSON_EXTRACT(`value`, '$.auditRequiredTypes')) = 'ARRAY'
    THEN JSON_EXTRACT(`value`, '$.auditRequiredTypes')
    ELSE JSON_ARRAY()
  END,
  '$[*]' COLUMNS (`type` VARCHAR(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci PATH '$')
) audit_rows
WHERE `key` = 'platform';

INSERT IGNORE INTO `platform_audit_required_types` (`id`, `setting_id`, `type`) VALUES
  ('pat_jobs', 'platform', 'jobs'),
  ('pat_houses', 'platform', 'houses'),
  ('pat_convenience', 'platform', 'convenience'),
  ('pat_yellow_pages', 'platform', 'yellowPages'),
  ('pat_secondhand', 'platform', 'secondhand');

UPDATE `resource_categories` SET `group` = 'yellowPages' WHERE `group` = 'shop';

CREATE TABLE IF NOT EXISTS `user_favorites` (
  `id` VARCHAR(191) NOT NULL,
  `user_id` VARCHAR(191) NOT NULL,
  `content_id` VARCHAR(191) NOT NULL,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE INDEX `user_favorites_user_id_content_id_key` (`user_id`, `content_id`),
  INDEX `user_favorites_user_id_created_at_idx` (`user_id`, `created_at`),
  CONSTRAINT `user_favorites_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `user_favorites_content_id_fkey` FOREIGN KEY (`content_id`) REFERENCES `content_items`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS `user_browse_history` (
  `id` VARCHAR(191) NOT NULL,
  `user_id` VARCHAR(191) NOT NULL,
  `content_id` VARCHAR(191) NOT NULL,
  `view_count` INTEGER NOT NULL DEFAULT 1,
  `viewed_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE INDEX `user_browse_history_user_id_content_id_key` (`user_id`, `content_id`),
  INDEX `user_browse_history_user_id_viewed_at_idx` (`user_id`, `viewed_at`),
  CONSTRAINT `user_browse_history_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `user_browse_history_content_id_fkey` FOREIGN KEY (`content_id`) REFERENCES `content_items`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS `job_applications` (
  `id` VARCHAR(191) NOT NULL,
  `user_id` VARCHAR(191) NOT NULL,
  `content_id` VARCHAR(191) NOT NULL,
  `status` VARCHAR(32) NOT NULL DEFAULT 'submitted',
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE INDEX `job_applications_user_id_content_id_key` (`user_id`, `content_id`),
  INDEX `job_applications_user_id_created_at_idx` (`user_id`, `created_at`),
  CONSTRAINT `job_applications_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `job_applications_content_id_fkey` FOREIGN KEY (`content_id`) REFERENCES `content_items`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
);
