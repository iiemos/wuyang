-- 简化广告系统：只保留首页轮播图，添加标题和描述
ALTER TABLE `ads` ADD COLUMN IF NOT EXISTS `description` TEXT COMMENT '轮播图描述' AFTER `title`;
ALTER TABLE `ads` MODIFY COLUMN `title` VARCHAR(128) COMMENT '轮播图标题（可选）';

-- 添加索引用于首页轮播查询
ALTER TABLE `ads` ADD INDEX IF NOT EXISTS `idx_home_carousel` (`position_id`, `status`);
