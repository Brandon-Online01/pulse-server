import { registerAs } from '@nestjs/config';
import { SubscriptionPlan } from '../lib/enums/license.enums';

export interface PlanConfig {
    maxUsers: number;
    maxBranches: number;
    storageLimit: number; // in MB
    apiCallLimit: number;
    integrationLimit: number;
    price: number;
    features: string[];
}

export type LicensePlansConfig = Record<SubscriptionPlan, PlanConfig>;

const defaultConfig: LicensePlansConfig = {
    [SubscriptionPlan.STARTER]: {
        maxUsers: Number(process.env.STARTER_MAX_USERS) || 5,
        maxBranches: Number(process.env.STARTER_MAX_BRANCHES) || 1,
        storageLimit: Number(process.env.STARTER_STORAGE_LIMIT) || 5120, // 5GB
        apiCallLimit: Number(process.env.STARTER_API_CALL_LIMIT) || 10000,
        integrationLimit: Number(process.env.STARTER_INTEGRATION_LIMIT) || 2,
        price: Number(process.env.STARTER_PRICE) || 49,
        features: process.env.STARTER_FEATURES?.split(',') || [
            'leads_management_basic',
            'clients_management_basic',
            'tasks_management_basic',
            'shop_basic',
            'quotations_basic',
            'inventory_single_location',
            'reporting_basic',
            'mobile_app_access',
            'email_support',
        ],
    },
    [SubscriptionPlan.PROFESSIONAL]: {
        maxUsers: Number(process.env.PROFESSIONAL_MAX_USERS) || 20,
        maxBranches: Number(process.env.PROFESSIONAL_MAX_BRANCHES) || 3,
        storageLimit: Number(process.env.PROFESSIONAL_STORAGE_LIMIT) || 20480, // 20GB
        apiCallLimit: Number(process.env.PROFESSIONAL_API_CALL_LIMIT) || 50000,
        integrationLimit: Number(process.env.PROFESSIONAL_INTEGRATION_LIMIT) || 5,
        price: Number(process.env.PROFESSIONAL_PRICE) || 99,
        features: process.env.PROFESSIONAL_FEATURES?.split(',') || [
            'leads_management_advanced',
            'clients_management_advanced',
            'tasks_management_advanced',
            'claims_management',
            'competitor_analysis',
            'tracking_mapping',
            'geofencing_basic',
            'route_optimization',
            'shop_advanced',
            'quotations_advanced',
            'inventory_multi_location',
            'reporting_advanced',
            'mobile_app_offline',
            'priority_support',
        ],
    },
    [SubscriptionPlan.BUSINESS]: {
        maxUsers: Number(process.env.BUSINESS_MAX_USERS) || 50,
        maxBranches: Number(process.env.BUSINESS_MAX_BRANCHES) || 10,
        storageLimit: Number(process.env.BUSINESS_STORAGE_LIMIT) || 102400, // 100GB
        apiCallLimit: Number(process.env.BUSINESS_API_CALL_LIMIT) || 200000,
        integrationLimit: Number(process.env.BUSINESS_INTEGRATION_LIMIT) || 15,
        price: Number(process.env.BUSINESS_PRICE) || 499,
        features: process.env.BUSINESS_FEATURES?.split(',') || [
            'unlimited_tracking_mapping',
            'unlimited_geofencing',
            'advanced_route_optimization',
            'multi_branch_management',
            'asset_tracking',
            'rewards_gamification',
            'advanced_feedback',
            'news_announcements',
            'reseller_management',
            'api_access',
            'custom_integrations',
            'priority_technical_support',
            'dedicated_account_manager',
            'white_label_options',
            'predictive_analytics',
        ],
    },
    [SubscriptionPlan.ENTERPRISE]: {
        maxUsers: Number(process.env.ENTERPRISE_MAX_USERS) || 999999,
        maxBranches: Number(process.env.ENTERPRISE_MAX_BRANCHES) || 999999,
        storageLimit: Number(process.env.ENTERPRISE_STORAGE_LIMIT) || 1024 * 1024, // 1TB
        apiCallLimit: Number(process.env.ENTERPRISE_API_CALL_LIMIT) || 1000000,
        integrationLimit: Number(process.env.ENTERPRISE_INTEGRATION_LIMIT) || 999999,
        price: Number(process.env.ENTERPRISE_PRICE) || 999,
        features: process.env.ENTERPRISE_FEATURES?.split(',') || [
            'basic_crm',
            'advanced_reporting',
            'dedicated_support',
            'api_access',
            'custom_branding',
            'white_label',
            'advanced_automation',
            'custom_development',
            'dedicated_infrastructure',
        ],
    },
};

export const licenseConfig = registerAs('license', () => ({
    plans: defaultConfig,
    gracePeriodDays: Number(process.env.LICENSE_GRACE_PERIOD_DAYS) || 15,
    renewalWindowDays: Number(process.env.LICENSE_RENEWAL_WINDOW_DAYS) || 30,
    maxTransferAttempts: Number(process.env.LICENSE_MAX_TRANSFER_ATTEMPTS) || 3,
    fingerprintTolerance: Number(process.env.LICENSE_FINGERPRINT_TOLERANCE) || 0.9,
    encryptionKey: process.env.LICENSE_ENCRYPTION_KEY,
})); 