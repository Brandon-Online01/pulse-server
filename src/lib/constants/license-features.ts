import { SubscriptionPlan } from '../enums/license.enums';

// Temporary constant for enforcing enterprise-only access
export const ENTERPRISE_ONLY_FEATURES = {
    // Assets
    'assets.access': true,
    // Claims
    'claims.access': true,
    // Clients
    'clients.access': true,
    // Communication
    'communication.access': true,
    // Docs
    'docs.access': true,
    // Journal
    'journal.access': true,
    // Leads
    'leads.access': true,
    // Leave
    'leave.access': true,
    // Licensing
    'licensing.access': true,
    // News
    'news.access': true,
    // Notifications
    'notifications.access': true,
    // Organisation
    'organisation.access': true,
    // Products
    'products.access': true,
    // Reports
    'reports.access': true,
    // Resellers
    'resellers.access': true,
    // Rewards
    'rewards.access': true,
    // Shop
    'shop.access': true,
    // Tasks
    'tasks.access': true,
    // Tracking
    'tracking.access': true,
    // Users
    'users.access': true,
};

const STARTER_FEATURES = {
    // Basic Features
    'assets.view': true,
    'assets.create': true,
    'claims.view': true,
    'clients.view': true,
    'clients.create': true,
    'communication.basic': true,
    'docs.basic': true,
    'journal.basic': true,
    'leads.view': true,
    'leads.create': true,
    'news.view': true,
    'notifications.basic': true,
    'organisation.basic': true,
    'products.view': true,
    'reports.basic': true,
    'shop.basic': true,
    'tasks.basic': true,
    'tracking.basic': true,
    'users.basic': true,
};

const PROFESSIONAL_FEATURES = {
    ...STARTER_FEATURES,
    // Enhanced Features
    'assets.advanced': true,
    'assets.bulk': true,
    'claims.advanced': true,
    'claims.bulk': true,
    'clients.advanced': true,
    'clients.bulk': true,
    'communication.advanced': true,
    'docs.advanced': true,
    'journal.advanced': true,
    'leads.advanced': true,
    'leads.bulk': true,
    'news.create': true,
    'notifications.advanced': true,
    'organisation.advanced': true,
    'products.advanced': true,
    'reports.advanced': true,
    'rewards.basic': true,
    'shop.advanced': true,
    'tasks.advanced': true,
    'tracking.advanced': true,
    'users.advanced': true,
};

const BUSINESS_FEATURES = {
    ...PROFESSIONAL_FEATURES,
    // Premium Features
    'assets.premium': true,
    'claims.premium': true,
    'clients.premium': true,
    'communication.premium': true,
    'docs.premium': true,
    'journal.premium': true,
    'leads.premium': true,
    'news.premium': true,
    'notifications.premium': true,
    'organisation.premium': true,
    'products.premium': true,
    'reports.premium': true,
    'resellers.basic': true,
    'resellers.advanced': true,
    'rewards.advanced': true,
    'shop.premium': true,
    'tasks.premium': true,
    'tracking.premium': true,
    'users.premium': true,
};

const ENTERPRISE_FEATURES = {
    ...BUSINESS_FEATURES,
    ...ENTERPRISE_ONLY_FEATURES,
    // Enterprise Features
    'assets.enterprise': true,
    'claims.enterprise': true,
    'clients.enterprise': true,
    'communication.enterprise': true,
    'docs.enterprise': true,
    'journal.enterprise': true,
    'leads.enterprise': true,
    'licensing.manage': true,
    'news.enterprise': true,
    'notifications.enterprise': true,
    'organisation.enterprise': true,
    'products.enterprise': true,
    'reports.enterprise': true,
    'resellers.enterprise': true,
    'rewards.enterprise': true,
    'shop.enterprise': true,
    'tasks.enterprise': true,
    'tracking.enterprise': true,
    'users.enterprise': true,
};

export const PLAN_FEATURES = {
    [SubscriptionPlan.STARTER]: STARTER_FEATURES,
    [SubscriptionPlan.PROFESSIONAL]: PROFESSIONAL_FEATURES,
    [SubscriptionPlan.BUSINESS]: BUSINESS_FEATURES,
    [SubscriptionPlan.ENTERPRISE]: ENTERPRISE_FEATURES,
}; 