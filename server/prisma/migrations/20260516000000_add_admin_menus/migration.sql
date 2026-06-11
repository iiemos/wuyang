CREATE TABLE `admin_menus` (
  `id` VARCHAR(191) NOT NULL,
  `parent_id` VARCHAR(191) NULL,
  `title` VARCHAR(64) NOT NULL,
  `path` VARCHAR(160) NOT NULL,
  `component` VARCHAR(160) NULL,
  `icon` VARCHAR(64) NULL,
  `permission` VARCHAR(96) NULL,
  `sort_order` INTEGER NOT NULL DEFAULT 0,
  `status` VARCHAR(32) NOT NULL DEFAULT 'enabled',
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL,

  UNIQUE INDEX `admin_menus_path_key`(`path`),
  INDEX `admin_menus_parent_id_sort_order_idx`(`parent_id`, `sort_order`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `admin_menus`
  ADD CONSTRAINT `admin_menus_parent_id_fkey`
  FOREIGN KEY (`parent_id`) REFERENCES `admin_menus`(`id`)
  ON DELETE CASCADE ON UPDATE CASCADE;
