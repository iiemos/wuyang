-- 广告系统重构迁移
-- 新增表结构，保留旧表用于兼容性

-- 1. 创建广告位分类表
CREATE TABLE IF NOT EXISTS `ad_position_categories` (
  `id` VARCHAR(36) NOT NULL PRIMARY KEY,
  `code` VARCHAR(32) NOT NULL UNIQUE COMMENT '分类代码: home, channel, detail, list',
  `name` VARCHAR(64) NOT NULL COMMENT '分类名称: 首页, 频道页',
  `description` TEXT COMMENT '分类描述',
  `icon` VARCHAR(255) COMMENT '分类图标URL',
  `sort_order` INT DEFAULT 0 COMMENT '排序',
  `status` VARCHAR(32) DEFAULT 'enabled' COMMENT 'enabled, disabled',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_code` (`code`),
  INDEX `idx_status` (`status`),
  INDEX `idx_sort` (`sort_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. 改造广告位表（添加新字段，保留旧字段）
ALTER TABLE `ad_positions` ADD COLUMN IF NOT EXISTS `category_id` VARCHAR(36) COMMENT '关联分类ID' AFTER `id`;
ALTER TABLE `ad_positions` ADD COLUMN IF NOT EXISTS `description` TEXT COMMENT '广告位描述' AFTER `name`;
ALTER TABLE `ad_positions` ADD COLUMN IF NOT EXISTS `width` INT COMMENT '宽度(px)' AFTER `ctr`;
ALTER TABLE `ad_positions` ADD COLUMN IF NOT EXISTS `height` INT COMMENT '高度(px)' AFTER `width`;
ALTER TABLE `ad_positions` ADD COLUMN IF NOT EXISTS `max_ads` INT DEFAULT 5 COMMENT '最多放几个广告' AFTER `height`;
ALTER TABLE `ad_positions` ADD COLUMN IF NOT EXISTS `display_rule` VARCHAR(32) DEFAULT 'carousel' COMMENT '展示规则: carousel, random, priority' AFTER `max_ads`;
ALTER TABLE `ad_positions` ADD COLUMN IF NOT EXISTS `min_impression` INT DEFAULT 0 COMMENT '最小曝光要求' AFTER `display_rule`;

-- 3. 创建广告计划表
CREATE TABLE IF NOT EXISTS `ad_campaigns` (
  `id` VARCHAR(36) NOT NULL PRIMARY KEY,
  `name` VARCHAR(128) NOT NULL COMMENT '计划名称',
  `description` TEXT COMMENT '计划描述',

  `start_date` DATE NOT NULL COMMENT '投放开始日期',
  `end_date` DATE NOT NULL COMMENT '投放结束日期',

  `budget` DECIMAL(12, 2) COMMENT '总预算',
  `daily_budget` DECIMAL(12, 2) COMMENT '日限额',
  `pricing_model` VARCHAR(32) DEFAULT 'cpm' COMMENT 'cpm, cpc, cpa',
  `unit_price` DECIMAL(10, 4) COMMENT '单价',

  `position_ids` JSON COMMENT '投放位置ID数组',
  `time_slots` JSON COMMENT '投放时段 [{"start": "08:00", "end": "20:00"}]',

  `advertiser_id` VARCHAR(36) COMMENT '广告主ID',
  `advertiser_name` VARCHAR(96) COMMENT '广告主名称',
  `contact_phone` VARCHAR(32) COMMENT '联系电话',
  `contact_email` VARCHAR(128) COMMENT '联系邮箱',

  `status` VARCHAR(32) DEFAULT 'draft' COMMENT 'draft, pending, active, paused, ended, offline',
  `reject_reason` TEXT COMMENT '拒绝原因',

  `total_impression` BIGINT DEFAULT 0 COMMENT '总曝光',
  `total_click` BIGINT DEFAULT 0 COMMENT '总点击',
  `total_cost` DECIMAL(12, 2) DEFAULT 0 COMMENT '总花费',

  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `started_at` TIMESTAMP NULL COMMENT '实际开始时间',
  `ended_at` TIMESTAMP NULL COMMENT '实际结束时间',

  INDEX `idx_status` (`status`),
  INDEX `idx_dates` (`start_date`, `end_date`),
  INDEX `idx_created` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. 改造广告表为创意表
ALTER TABLE `ads` RENAME TO `ad_creatives`;

-- 5. 为创意表增加新字段
ALTER TABLE `ad_creatives` ADD COLUMN IF NOT EXISTS `campaign_id` VARCHAR(36) COMMENT '关联计划ID' AFTER `id`;
ALTER TABLE `ad_creatives` ADD COLUMN IF NOT EXISTS `description` TEXT COMMENT '创意描述' AFTER `title`;
ALTER TABLE `ad_creatives` DROP FOREIGN KEY IF EXISTS `ads_ibfk_1`;
ALTER TABLE `ad_creatives` DROP INDEX IF EXISTS `idx_position_status`;
ALTER TABLE `ad_creatives` RENAME COLUMN `positionId` TO `position_id`;
ALTER TABLE `ad_creatives` RENAME COLUMN `linkType` TO `link_type`;
ALTER TABLE `ad_creatives` RENAME COLUMN `linkValue` TO `link_value`;
ALTER TABLE `ad_creatives` RENAME COLUMN `startAt` TO `start_at`;
ALTER TABLE `ad_creatives` RENAME COLUMN `endAt` TO `end_at`;

-- 重新添加字段（如果不存在）
ALTER TABLE `ad_creatives` ADD COLUMN IF NOT EXISTS `thumbnail_url` VARCHAR(255) COMMENT '缩略图URL' AFTER `image`;
ALTER TABLE `ad_creatives` ADD COLUMN IF NOT EXISTS `video_url` VARCHAR(255) COMMENT '视频URL' AFTER `thumbnail_url`;
ALTER TABLE `ad_creatives` ADD COLUMN IF NOT EXISTS `reject_reason` TEXT COMMENT '拒绝原因' AFTER `status`;
ALTER TABLE `ad_creatives` ADD COLUMN IF NOT EXISTS `reviewed_by` VARCHAR(64) COMMENT '审核人' AFTER `reject_reason`;
ALTER TABLE `ad_creatives` ADD COLUMN IF NOT EXISTS `reviewed_at` TIMESTAMP NULL COMMENT '审核时间' AFTER `reviewed_by`;
ALTER TABLE `ad_creatives` ADD COLUMN IF NOT EXISTS `impression` BIGINT DEFAULT 0 COMMENT '曝光数' AFTER `reviewed_at`;
ALTER TABLE `ad_creatives` ADD COLUMN IF NOT EXISTS `click` BIGINT DEFAULT 0 COMMENT '点击数' AFTER `impression`;
ALTER TABLE `ad_creatives` ADD COLUMN IF NOT EXISTS `conversion` BIGINT DEFAULT 0 COMMENT '转化数' AFTER `click`;

-- 修复创意表约束
ALTER TABLE `ad_creatives` MODIFY COLUMN `status` VARCHAR(32) DEFAULT 'pending' COMMENT 'pending, approved, rejected';
ALTER TABLE `ad_creatives` ADD CONSTRAINT `fk_creative_campaign` FOREIGN KEY (`campaign_id`) REFERENCES `ad_campaigns`(`id`) ON DELETE CASCADE;
ALTER TABLE `ad_creatives` ADD CONSTRAINT `fk_creative_position` FOREIGN KEY (`position_id`) REFERENCES `ad_positions`(`id`) ON DELETE CASCADE;
ALTER TABLE `ad_creatives` ADD INDEX `idx_campaign_status` (`campaign_id`, `status`);
ALTER TABLE `ad_creatives` ADD INDEX `idx_position_creative` (`position_id`, `status`);

-- 6. 创建投放数据统计表
CREATE TABLE IF NOT EXISTS `ad_performance` (
  `id` VARCHAR(36) NOT NULL PRIMARY KEY,
  `creative_id` VARCHAR(36) NOT NULL COMMENT '创意ID',
  `position_id` VARCHAR(36) NOT NULL COMMENT '广告位ID',
  `campaign_id` VARCHAR(36) NOT NULL COMMENT '计划ID',

  `stat_date` DATE NOT NULL COMMENT '统计日期',

  `impression` BIGINT DEFAULT 0 COMMENT '曝光数',
  `unique_user` BIGINT DEFAULT 0 COMMENT '独立用户数',
  `click` BIGINT DEFAULT 0 COMMENT '点击数',
  `click_rate` DECIMAL(5, 2) DEFAULT 0 COMMENT 'CTR %',

  `conversion` BIGINT DEFAULT 0 COMMENT '转化数',
  `conversion_rate` DECIMAL(5, 2) DEFAULT 0 COMMENT 'CVR %',

  `cost` DECIMAL(12, 2) DEFAULT 0 COMMENT '花费',
  `cpm` DECIMAL(10, 4) DEFAULT 0 COMMENT '千次展示成本',
  `cpc` DECIMAL(10, 4) DEFAULT 0 COMMENT '单次点击成本',

  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  UNIQUE KEY `uniq_performance` (`creative_id`, `position_id`, `stat_date`),
  INDEX `idx_stat_date` (`stat_date`),
  INDEX `idx_campaign` (`campaign_id`),
  INDEX `idx_creative` (`creative_id`),

  FOREIGN KEY (`creative_id`) REFERENCES `ad_creatives`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`position_id`) REFERENCES `ad_positions`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`campaign_id`) REFERENCES `ad_campaigns`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. 插入默认的广告位分类
INSERT IGNORE INTO `ad_position_categories` (`id`, `code`, `name`, `sort_order`) VALUES
  ('cat-home', 'home', '首页', 10),
  ('cat-channel', 'channel', '频道页', 20),
  ('cat-detail', 'detail', '详情页', 30),
  ('cat-list', 'list', '列表页', 40);

-- 8. 创建迁移视图，保留旧 API 兼容性（可选）
-- 该视图将旧的 AdPosition 结构映射到新结构
-- 前端可以继续使用旧 API，直到完全迁移
CREATE OR REPLACE VIEW `ad_positions_legacy` AS
SELECT
  ap.id,
  ap.name,
  ap.scene,
  COALESCE(ap.pv, 0) as pv,
  COALESCE(ap.uv, 0) as uv,
  ap.ctr,
  ap.created_at,
  ap.updated_at
FROM `ad_positions` ap
WHERE ap.status = 'enabled';
