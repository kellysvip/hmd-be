-- CreateTable
CREATE TABLE `world_countries` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `uid` BINARY(16) NOT NULL,
    `code` CHAR(5) NULL,
    `money_code` CHAR(6) NOT NULL,
    `name` VARCHAR(50) NOT NULL,
    `continent` VARCHAR(30) NOT NULL,
    `timezone` VARCHAR(20) NOT NULL,
    `language` VARCHAR(20) NOT NULL,
    `tax_rate` DOUBLE NOT NULL DEFAULT 0.1,
    `icon_src` VARCHAR(255) NOT NULL DEFAULT 'no-icon.png',
    `created_at` DATETIME(3) NOT NULL,
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,
    `created_by` BINARY(16) NOT NULL,
    `updated_by` BINARY(16) NOT NULL,
    `deleted_by` BINARY(16) NULL,

    UNIQUE INDEX `world_countries_uid_key`(`uid`),
    UNIQUE INDEX `world_countries_code_key`(`code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `world_areas` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `uid` BINARY(16) NOT NULL,
    `country_id` INTEGER NOT NULL,
    `parent_id` INTEGER NULL,
    `vi_name` VARCHAR(50) NOT NULL,
    `en_name` VARCHAR(50) NOT NULL,
    `level` INTEGER NOT NULL DEFAULT 1,
    `level_title` CHAR(10) NOT NULL DEFAULT 'Tỉnh',
    `zip` CHAR(10) NULL,
    `created_at` DATETIME(3) NOT NULL,
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,
    `created_by` BINARY(16) NOT NULL,
    `updated_by` BINARY(16) NOT NULL,
    `deleted_by` BINARY(16) NULL,

    UNIQUE INDEX `world_areas_uid_key`(`uid`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `system_services` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `uid` BINARY(16) NOT NULL,
    `code` VARCHAR(20) NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `description` VARCHAR(255) NULL,
    `created_at` DATETIME(3) NOT NULL,
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,
    `created_by` BINARY(16) NOT NULL,
    `updated_by` BINARY(16) NOT NULL,
    `deleted_by` BINARY(16) NULL,

    UNIQUE INDEX `system_services_uid_key`(`uid`),
    UNIQUE INDEX `system_services_code_key`(`code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `system_features` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `uid` BINARY(16) NOT NULL,
    `code` VARCHAR(20) NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `latest_version` CHAR(5) NOT NULL DEFAULT '0.0.1',
    `is_beta` BOOLEAN NOT NULL DEFAULT false,
    `description` VARCHAR(255) NULL,
    `logo_src` VARCHAR(255) NOT NULL DEFAULT 'no-logo.png',
    `service_id` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL,
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,
    `created_by` BINARY(16) NOT NULL,
    `updated_by` BINARY(16) NOT NULL,
    `deleted_by` BINARY(16) NULL,

    UNIQUE INDEX `system_features_uid_key`(`uid`),
    UNIQUE INDEX `system_features_code_key`(`code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `system_parameters` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `key` VARCHAR(100) NOT NULL,
    `feature_uid` INTEGER NOT NULL,
    `value` VARCHAR(255) NOT NULL,
    `default_value` VARCHAR(255) NOT NULL,
    `type` ENUM('int', 'json', 'str', 'float', 'file') NOT NULL DEFAULT 'str',
    `created_at` DATETIME(3) NOT NULL,
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `unique_key_feature`(`key`, `feature_uid`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `saas_modules` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `uid` BINARY(16) NOT NULL,
    `code` VARCHAR(20) NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `description` VARCHAR(255) NULL,
    `fixed_price_monthly_usd` DOUBLE NOT NULL DEFAULT 0,
    `fixed_price_annually_usd` DOUBLE NOT NULL DEFAULT 0,
    `trial_days` INTEGER NOT NULL DEFAULT 14,
    `allowed_overdue_pay_days` INTEGER NOT NULL DEFAULT 7,
    `charged_by_demand` BOOLEAN NOT NULL DEFAULT false,
    `created_at` DATETIME(3) NOT NULL,
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,
    `created_by` BINARY(16) NOT NULL,
    `updated_by` BINARY(16) NOT NULL,
    `deleted_by` BINARY(16) NULL,

    UNIQUE INDEX `saas_modules_uid_key`(`uid`),
    UNIQUE INDEX `saas_modules_code_key`(`code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `saas_demand_metrics` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `uid` BINARY(16) NOT NULL,
    `code` VARCHAR(20) NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `description` VARCHAR(255) NULL,
    `value_type` ENUM('numeric', 'percent') NOT NULL DEFAULT 'numeric',
    `is_better_if_descrease` BOOLEAN NOT NULL DEFAULT false,
    `step_value` DOUBLE NOT NULL DEFAULT 1,
    `start_at` DOUBLE NOT NULL DEFAULT 0,

    UNIQUE INDEX `saas_demand_metrics_uid_key`(`uid`),
    UNIQUE INDEX `saas_demand_metrics_code_key`(`code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `saas_demand_metric_lines` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `uid` BINARY(16) NOT NULL,
    `metric_id` INTEGER NOT NULL,
    `min` DOUBLE NOT NULL,
    `max` DOUBLE NOT NULL,
    `rate` DOUBLE NOT NULL,

    UNIQUE INDEX `saas_demand_metric_lines_uid_key`(`uid`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `saas_demand_metric_values_bydate` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `uid` BINARY(16) NOT NULL,
    `metric_id` INTEGER NOT NULL,
    `before_value` DOUBLE NOT NULL,
    `changed_value` DOUBLE NOT NULL,
    `changed_direction` CHAR(3) NOT NULL DEFAULT 'add',
    `after_value` DOUBLE NOT NULL,
    `created_at` DATETIME(3) NOT NULL,
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,
    `created_by` BINARY(16) NOT NULL,
    `updated_by` BINARY(16) NOT NULL,
    `deleted_by` BINARY(16) NULL,

    UNIQUE INDEX `saas_demand_metric_values_bydate_uid_key`(`uid`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `saas_module_has_system_features` (
    `module_id` INTEGER NOT NULL,
    `feature_id` INTEGER NOT NULL,

    PRIMARY KEY (`module_id`, `feature_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `saas_module_has_demand_metrics` (
    `module_id` INTEGER NOT NULL,
    `metric_id` INTEGER NOT NULL,

    PRIMARY KEY (`module_id`, `metric_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `users` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `uid` BINARY(16) NOT NULL,
    `username` VARCHAR(20) NOT NULL,
    `password` CHAR(76) NOT NULL,
    `email` VARCHAR(50) NOT NULL,
    `phone` VARCHAR(20) NOT NULL,
    `type` ENUM('saas', 'internal') NOT NULL DEFAULT 'saas',
    `login_attempts` INTEGER NOT NULL DEFAULT 0,
    `is_blocked_by_tenant_owner` BOOLEAN NOT NULL DEFAULT false,
    `is_banned_by_system` BOOLEAN NOT NULL DEFAULT false,
    `email_verified` BOOLEAN NOT NULL DEFAULT false,
    `phone_verified` BOOLEAN NOT NULL DEFAULT false,
    `password_updated_at` DATETIME(3) NOT NULL,
    `created_at` DATETIME(3) NOT NULL,
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,
    `created_by` BINARY(16) NOT NULL,
    `updated_by` BINARY(16) NOT NULL,
    `deleted_by` BINARY(16) NULL,

    UNIQUE INDEX `users_uid_key`(`uid`),
    UNIQUE INDEX `users_username_key`(`username`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user_metadatas` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `uid` BINARY(16) NOT NULL,
    `user_id` INTEGER NOT NULL,
    `area_id` INTEGER NOT NULL,
    `first_name` VARCHAR(50) NOT NULL,
    `last_name` VARCHAR(50) NOT NULL,
    `career_title` VARCHAR(50) NULL,
    `birthday` DATETIME(3) NULL,
    `gender` CHAR(1) NOT NULL DEFAULT 'U',
    `avatar_src` VARCHAR(255) NOT NULL DEFAULT 'no-avatar.png',
    `created_at` DATETIME(3) NOT NULL,
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,
    `created_by` BINARY(16) NOT NULL,
    `updated_by` BINARY(16) NOT NULL,
    `deleted_by` BINARY(16) NULL,

    UNIQUE INDEX `user_metadatas_uid_key`(`uid`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user_devices` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `uid` BINARY(16) NOT NULL,
    `user_id` INTEGER NOT NULL,
    `fingerprint` VARCHAR(255) NOT NULL,
    `agent` VARCHAR(255) NOT NULL,
    `device_type` ENUM('desktop', 'mobile', 'tablet') NOT NULL DEFAULT 'desktop',
    `device_os` ENUM('windows', 'macos', 'ios', 'android', 'linux') NOT NULL DEFAULT 'windows',
    `ip_address` CHAR(32) NOT NULL,
    `mac_address` CHAR(10) NOT NULL,
    `created_at` DATETIME(3) NOT NULL,
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,
    `created_by` BINARY(16) NOT NULL,
    `updated_by` BINARY(16) NOT NULL,
    `deleted_by` BINARY(16) NULL,

    UNIQUE INDEX `user_devices_uid_key`(`uid`),
    UNIQUE INDEX `user_devices_fingerprint_key`(`fingerprint`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user_logged_devices` (
    `user_id` INTEGER NOT NULL,
    `device_id` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL,
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,
    `created_by` BINARY(16) NOT NULL,
    `updated_by` BINARY(16) NOT NULL,
    `deleted_by` BINARY(16) NULL,

    PRIMARY KEY (`user_id`, `device_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `organizations` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `uid` BINARY(16) NOT NULL,
    `short_name` VARCHAR(20) NOT NULL,
    `full_name` VARCHAR(100) NOT NULL,
    `email` VARCHAR(50) NULL,
    `phone` VARCHAR(20) NULL,
    `area_id` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL,
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,
    `created_by` BINARY(16) NOT NULL,
    `updated_by` BINARY(16) NOT NULL,
    `deleted_by` BINARY(16) NULL,

    UNIQUE INDEX `organizations_uid_key`(`uid`),
    UNIQUE INDEX `organizations_short_name_key`(`short_name`),
    UNIQUE INDEX `organizations_full_name_key`(`full_name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `organization_has_users` (
    `org_id` INTEGER NOT NULL,
    `user_id` INTEGER NOT NULL,
    `is_owner` BOOLEAN NOT NULL DEFAULT false,
    `created_at` DATETIME(3) NOT NULL,
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,
    `created_by` BINARY(16) NOT NULL,
    `updated_by` BINARY(16) NOT NULL,
    `deleted_by` BINARY(16) NULL,

    PRIMARY KEY (`org_id`, `user_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `payment_payout_profiles` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `uid` BINARY(16) NOT NULL,
    `organization_id` INTEGER NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `bank_name` VARCHAR(100) NOT NULL,
    `bank_account_fullname` VARCHAR(100) NOT NULL,
    `bank_account_number` VARCHAR(20) NOT NULL,
    `settlement_legal_name` VARCHAR(100) NOT NULL,
    `settlement_tax_code` VARCHAR(20) NOT NULL,
    `settlement_email` VARCHAR(50) NOT NULL,
    `settlement_phone` VARCHAR(20) NOT NULL,
    `settlement_address` VARCHAR(255) NOT NULL,
    `settlement_approval_fullname` VARCHAR(100) NOT NULL,
    `settlement_approval_email` VARCHAR(50) NOT NULL,
    `settlement_approval_phone` VARCHAR(20) NOT NULL,
    `settlement_rotation_days` INTEGER NOT NULL DEFAULT 120,
    `created_at` DATETIME(3) NOT NULL,
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,
    `created_by` BINARY(16) NOT NULL,
    `updated_by` BINARY(16) NOT NULL,
    `deleted_by` BINARY(16) NULL,

    UNIQUE INDEX `payment_payout_profiles_uid_key`(`uid`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `payment_billing_profiles` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `uid` BINARY(16) NOT NULL,
    `organization_id` INTEGER NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `type` CHAR(6) NOT NULL DEFAULT 'debit',
    `invoice_legal_name` VARCHAR(100) NOT NULL,
    `invoice_tax_code` VARCHAR(20) NOT NULL,
    `invoice_email` VARCHAR(50) NOT NULL,
    `invoice_phone` VARCHAR(20) NOT NULL,
    `invoice_address` VARCHAR(255) NOT NULL,
    `receipt_email` VARCHAR(50) NOT NULL,
    `payment_merchant_customer_id` VARCHAR(255) NULL,
    `payment_merchant_source_id` VARCHAR(255) NULL,
    `last_success_charge_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL,
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,
    `created_by` BINARY(16) NOT NULL,
    `updated_by` BINARY(16) NOT NULL,
    `deleted_by` BINARY(16) NULL,

    UNIQUE INDEX `payment_billing_profiles_uid_key`(`uid`),
    UNIQUE INDEX `unique_merchant_ids`(`payment_merchant_customer_id`, `payment_merchant_source_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `payment_invoices` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `uid` BINARY(16) NOT NULL,
    `tenant_id` INTEGER NOT NULL,
    `subtotal` DOUBLE NOT NULL,
    `discount_on_subtotal_rate` DOUBLE NULL,
    `tax_rate` DOUBLE NOT NULL,
    `total` DOUBLE NOT NULL,
    `currency` VARCHAR(10) NOT NULL DEFAULT 'VND',
    `must_pay_date` DATETIME(3) NOT NULL,
    `status` ENUM('waiting', 'paid', 'partial_paid') NOT NULL DEFAULT 'waiting',
    `attachment_src` VARCHAR(255) NULL,
    `created_at` DATETIME(3) NOT NULL,
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,
    `created_by` BINARY(16) NOT NULL,
    `updated_by` BINARY(16) NOT NULL,
    `deleted_by` BINARY(16) NULL,

    UNIQUE INDEX `payment_invoices_uid_key`(`uid`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `payment_invoice_details` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `uid` BINARY(16) NOT NULL,
    `invoice_id` INTEGER NOT NULL,
    `subject` VARCHAR(255) NOT NULL,
    `unit` VARCHAR(10) NULL,
    `price` DOUBLE NOT NULL,
    `discount_on_price_rate` DOUBLE NULL,
    `quantity` DOUBLE NOT NULL DEFAULT 1,
    `cost` DOUBLE NOT NULL,
    `discount_on_cost_rate` DOUBLE NULL,
    `created_at` DATETIME(3) NOT NULL,
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,
    `created_by` BINARY(16) NOT NULL,
    `updated_by` BINARY(16) NOT NULL,
    `deleted_by` BINARY(16) NULL,

    UNIQUE INDEX `payment_invoice_details_uid_key`(`uid`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `payment_settlements` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `uid` BINARY(16) NOT NULL,
    `tenant_id` INTEGER NOT NULL,
    `before` DOUBLE NOT NULL,
    `change` DOUBLE NOT NULL,
    `after` DOUBLE NOT NULL,
    `payable` DOUBLE NOT NULL,
    `freezed` DOUBLE NOT NULL,
    `freezed_reason` VARCHAR(255) NULL,
    `currency` VARCHAR(10) NOT NULL DEFAULT 'VND',
    `status` ENUM('waiting', 'rejected', 'approved', 'paid', 'partial_paid') NOT NULL DEFAULT 'waiting',
    `must_pay_date` DATETIME(3) NOT NULL,
    `attachment_src` VARCHAR(255) NULL,
    `created_at` DATETIME(3) NOT NULL,
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,
    `created_by` BINARY(16) NOT NULL,
    `updated_by` BINARY(16) NOT NULL,
    `deleted_by` BINARY(16) NULL,

    UNIQUE INDEX `payment_settlements_uid_key`(`uid`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `payment_settlements_details` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `uid` BINARY(16) NOT NULL,
    `settlement_id` INTEGER NOT NULL,
    `subject` VARCHAR(255) NOT NULL,
    `value` DOUBLE NOT NULL,
    `created_at` DATETIME(3) NOT NULL,
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,
    `created_by` BINARY(16) NOT NULL,
    `updated_by` BINARY(16) NOT NULL,
    `deleted_by` BINARY(16) NULL,

    UNIQUE INDEX `payment_settlements_details_uid_key`(`uid`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tenants` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `uid` BINARY(16) NOT NULL,
    `organization_id` INTEGER NOT NULL,
    `payout_profile_id` INTEGER NOT NULL,
    `billing_profile_id` INTEGER NOT NULL,
    `short_name` VARCHAR(20) NOT NULL,
    `full_name` VARCHAR(100) NOT NULL,
    `logo_src` VARCHAR(255) NOT NULL DEFAULT 'no-logo.png',
    `infra_type` ENUM('shared', 'dedicated') NOT NULL DEFAULT 'shared',
    `created_at` DATETIME(3) NOT NULL,
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,
    `created_by` BINARY(16) NOT NULL,
    `updated_by` BINARY(16) NOT NULL,
    `deleted_by` BINARY(16) NULL,

    UNIQUE INDEX `tenants_uid_key`(`uid`),
    UNIQUE INDEX `tenants_short_name_key`(`short_name`),
    UNIQUE INDEX `tenants_full_name_key`(`full_name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `rbac_roles` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `uid` BINARY(16) NOT NULL,
    `tenant_id` INTEGER NOT NULL,
    `name` VARCHAR(50) NOT NULL,
    `description` VARCHAR(255) NULL,
    `is_system_default` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL,
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,
    `created_by` BINARY(16) NOT NULL,
    `updated_by` BINARY(16) NOT NULL,
    `deleted_by` BINARY(16) NULL,

    UNIQUE INDEX `rbac_roles_uid_key`(`uid`),
    UNIQUE INDEX `rbac_roles_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `rbac_resources` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `uid` BINARY(16) NOT NULL,
    `tenant_id` INTEGER NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `db_identity` VARCHAR(50) NULL,
    `type` ENUM('feat', 'func', 'tbl', 'col', 'rec', 'spec') NOT NULL DEFAULT 'feat',
    `description` VARCHAR(255) NULL,
    `is_system_default` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL,
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,
    `created_by` BINARY(16) NOT NULL,
    `updated_by` BINARY(16) NOT NULL,
    `deleted_by` BINARY(16) NULL,

    UNIQUE INDEX `rbac_resources_uid_key`(`uid`),
    UNIQUE INDEX `rbac_resources_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `rbac_permissions` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `uid` BINARY(16) NOT NULL,
    `tenant_id` INTEGER NOT NULL,
    `name` VARCHAR(50) NOT NULL,
    `description` VARCHAR(255) NULL,
    `is_system_default` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL,
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,
    `created_by` BINARY(16) NOT NULL,
    `updated_by` BINARY(16) NOT NULL,
    `deleted_by` BINARY(16) NULL,

    UNIQUE INDEX `rbac_permissions_uid_key`(`uid`),
    UNIQUE INDEX `rbac_permissions_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `rbac_user_has_roles` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `uid` BINARY(16) NOT NULL,
    `role_id` INTEGER NOT NULL,
    `user_id` INTEGER NOT NULL,
    `is_system_default` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL,
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,
    `created_by` BINARY(16) NOT NULL,
    `updated_by` BINARY(16) NOT NULL,
    `deleted_by` BINARY(16) NULL,

    UNIQUE INDEX `rbac_user_has_roles_uid_key`(`uid`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `rbac_role_has_policies` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `uid` BINARY(16) NOT NULL,
    `role_id` INTEGER NOT NULL,
    `resource_id` INTEGER NOT NULL,
    `permission_id` INTEGER NOT NULL,
    `is_system_default` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL,
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,
    `created_by` BINARY(16) NOT NULL,
    `updated_by` BINARY(16) NOT NULL,
    `deleted_by` BINARY(16) NULL,

    UNIQUE INDEX `rbac_role_has_policies_uid_key`(`uid`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `rbac_user_has_policies` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `uid` BINARY(16) NOT NULL,
    `user_id` INTEGER NOT NULL,
    `resource_id` INTEGER NOT NULL,
    `permission_id` INTEGER NOT NULL,
    `is_system_default` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL,
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,
    `created_by` BINARY(16) NOT NULL,
    `updated_by` BINARY(16) NOT NULL,
    `deleted_by` BINARY(16) NULL,

    UNIQUE INDEX `rbac_user_has_policies_uid_key`(`uid`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `world_areas` ADD CONSTRAINT `world_areas_country_id_fkey` FOREIGN KEY (`country_id`) REFERENCES `world_countries`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `world_areas` ADD CONSTRAINT `world_areas_parent_id_fkey` FOREIGN KEY (`parent_id`) REFERENCES `world_areas`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `system_features` ADD CONSTRAINT `system_features_service_id_fkey` FOREIGN KEY (`service_id`) REFERENCES `system_services`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `system_parameters` ADD CONSTRAINT `system_parameters_feature_uid_fkey` FOREIGN KEY (`feature_uid`) REFERENCES `system_features`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `saas_demand_metric_lines` ADD CONSTRAINT `saas_demand_metric_lines_metric_id_fkey` FOREIGN KEY (`metric_id`) REFERENCES `saas_demand_metrics`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `saas_demand_metric_values_bydate` ADD CONSTRAINT `saas_demand_metric_values_bydate_metric_id_fkey` FOREIGN KEY (`metric_id`) REFERENCES `saas_demand_metrics`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `saas_module_has_system_features` ADD CONSTRAINT `saas_module_has_system_features_module_id_fkey` FOREIGN KEY (`module_id`) REFERENCES `saas_modules`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `saas_module_has_system_features` ADD CONSTRAINT `saas_module_has_system_features_feature_id_fkey` FOREIGN KEY (`feature_id`) REFERENCES `system_features`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `saas_module_has_demand_metrics` ADD CONSTRAINT `saas_module_has_demand_metrics_module_id_fkey` FOREIGN KEY (`module_id`) REFERENCES `saas_modules`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `saas_module_has_demand_metrics` ADD CONSTRAINT `saas_module_has_demand_metrics_metric_id_fkey` FOREIGN KEY (`metric_id`) REFERENCES `saas_demand_metrics`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_metadatas` ADD CONSTRAINT `user_metadatas_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_metadatas` ADD CONSTRAINT `user_metadatas_area_id_fkey` FOREIGN KEY (`area_id`) REFERENCES `world_areas`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_devices` ADD CONSTRAINT `user_devices_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_logged_devices` ADD CONSTRAINT `user_logged_devices_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_logged_devices` ADD CONSTRAINT `user_logged_devices_device_id_fkey` FOREIGN KEY (`device_id`) REFERENCES `user_devices`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `organizations` ADD CONSTRAINT `organizations_area_id_fkey` FOREIGN KEY (`area_id`) REFERENCES `world_areas`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `organization_has_users` ADD CONSTRAINT `organization_has_users_org_id_fkey` FOREIGN KEY (`org_id`) REFERENCES `organizations`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `organization_has_users` ADD CONSTRAINT `organization_has_users_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `payment_payout_profiles` ADD CONSTRAINT `payment_payout_profiles_organization_id_fkey` FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `payment_billing_profiles` ADD CONSTRAINT `payment_billing_profiles_organization_id_fkey` FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `payment_invoice_details` ADD CONSTRAINT `payment_invoice_details_invoice_id_fkey` FOREIGN KEY (`invoice_id`) REFERENCES `payment_invoices`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `payment_settlements_details` ADD CONSTRAINT `payment_settlements_details_settlement_id_fkey` FOREIGN KEY (`settlement_id`) REFERENCES `payment_settlements`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tenants` ADD CONSTRAINT `tenants_organization_id_fkey` FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tenants` ADD CONSTRAINT `tenants_payout_profile_id_fkey` FOREIGN KEY (`payout_profile_id`) REFERENCES `payment_payout_profiles`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tenants` ADD CONSTRAINT `tenants_billing_profile_id_fkey` FOREIGN KEY (`billing_profile_id`) REFERENCES `payment_billing_profiles`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `rbac_roles` ADD CONSTRAINT `rbac_roles_tenant_id_fkey` FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `rbac_resources` ADD CONSTRAINT `rbac_resources_tenant_id_fkey` FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `rbac_permissions` ADD CONSTRAINT `rbac_permissions_tenant_id_fkey` FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `rbac_user_has_roles` ADD CONSTRAINT `rbac_user_has_roles_role_id_fkey` FOREIGN KEY (`role_id`) REFERENCES `rbac_roles`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `rbac_user_has_roles` ADD CONSTRAINT `rbac_user_has_roles_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `rbac_role_has_policies` ADD CONSTRAINT `rbac_role_has_policies_role_id_fkey` FOREIGN KEY (`role_id`) REFERENCES `rbac_roles`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `rbac_role_has_policies` ADD CONSTRAINT `rbac_role_has_policies_resource_id_fkey` FOREIGN KEY (`resource_id`) REFERENCES `rbac_resources`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `rbac_role_has_policies` ADD CONSTRAINT `rbac_role_has_policies_permission_id_fkey` FOREIGN KEY (`permission_id`) REFERENCES `rbac_permissions`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `rbac_user_has_policies` ADD CONSTRAINT `rbac_user_has_policies_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `rbac_user_has_policies` ADD CONSTRAINT `rbac_user_has_policies_resource_id_fkey` FOREIGN KEY (`resource_id`) REFERENCES `rbac_resources`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `rbac_user_has_policies` ADD CONSTRAINT `rbac_user_has_policies_permission_id_fkey` FOREIGN KEY (`permission_id`) REFERENCES `rbac_permissions`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
