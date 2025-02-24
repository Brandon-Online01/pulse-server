"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const auth_module_1 = require("./auth/auth.module");
const user_module_1 = require("./user/user.module");
const user_entity_1 = require("./user/entities/user.entity");
const communication_module_1 = require("./communication/communication.module");
const event_emitter_1 = require("@nestjs/event-emitter");
const user_profile_entity_1 = require("./user/entities/user.profile.entity");
const user_employeement_profile_entity_1 = require("./user/entities/user.employeement.profile.entity");
const attendance_module_1 = require("./attendance/attendance.module");
const attendance_entity_1 = require("./attendance/entities/attendance.entity");
const core_1 = require("@nestjs/core");
const role_guard_1 = require("./guards/role.guard");
const tracking_module_1 = require("./tracking/tracking.module");
const docs_module_1 = require("./docs/docs.module");
const claims_module_1 = require("./claims/claims.module");
const claim_entity_1 = require("./claims/entities/claim.entity");
const doc_entity_1 = require("./docs/entities/doc.entity");
const leads_module_1 = require("./leads/leads.module");
const lead_entity_1 = require("./leads/entities/lead.entity");
const journal_module_1 = require("./journal/journal.module");
const journal_entity_1 = require("./journal/entities/journal.entity");
const tasks_module_1 = require("./tasks/tasks.module");
const task_entity_1 = require("./tasks/entities/task.entity");
const organisation_module_1 = require("./organisation/organisation.module");
const branch_module_1 = require("./branch/branch.module");
const branch_entity_1 = require("./branch/entities/branch.entity");
const organisation_entity_1 = require("./organisation/entities/organisation.entity");
const news_module_1 = require("./news/news.module");
const news_entity_1 = require("./news/entities/news.entity");
const assets_module_1 = require("./assets/assets.module");
const asset_entity_1 = require("./assets/entities/asset.entity");
const tracking_entity_1 = require("./tracking/entities/tracking.entity");
const shop_module_1 = require("./shop/shop.module");
const resellers_module_1 = require("./resellers/resellers.module");
const quotation_entity_1 = require("./shop/entities/quotation.entity");
const notifications_module_1 = require("./notifications/notifications.module");
const notification_entity_1 = require("./notifications/entities/notification.entity");
const clients_module_1 = require("./clients/clients.module");
const client_entity_1 = require("./clients/entities/client.entity");
const products_module_1 = require("./products/products.module");
const product_entity_1 = require("./products/entities/product.entity");
const reseller_entity_1 = require("./resellers/entities/reseller.entity");
const reports_module_1 = require("./reports/reports.module");
const quotation_item_entity_1 = require("./shop/entities/quotation-item.entity");
const banners_entity_1 = require("./shop/entities/banners.entity");
const subtask_entity_1 = require("./tasks/entities/subtask.entity");
const communication_log_entity_1 = require("./communication/entities/communication-log.entity");
const check_ins_module_1 = require("./check-ins/check-ins.module");
const check_in_entity_1 = require("./check-ins/entities/check-in.entity");
const rewards_module_1 = require("./rewards/rewards.module");
const user_rewards_entity_1 = require("./rewards/entities/user-rewards.entity");
const achievement_entity_1 = require("./rewards/entities/achievement.entity");
const unlocked_item_entity_1 = require("./rewards/entities/unlocked-item.entity");
const xp_transaction_entity_1 = require("./rewards/entities/xp-transaction.entity");
const cache_manager_1 = require("@nestjs/cache-manager");
const report_entity_1 = require("./reports/entities/report.entity");
const pending_signup_entity_1 = require("./auth/entities/pending-signup.entity");
const password_reset_entity_1 = require("./auth/entities/password-reset.entity");
const license_entity_1 = require("./licensing/entities/license.entity");
const license_usage_entity_1 = require("./licensing/entities/license-usage.entity");
const license_event_entity_1 = require("./licensing/entities/license-event.entity");
const licensing_module_1 = require("./licensing/licensing.module");
const license_usage_interceptor_1 = require("./licensing/license-usage.interceptor");
const organisation_settings_entity_1 = require("./organisation/entities/organisation-settings.entity");
const organisation_appearance_entity_1 = require("./organisation/entities/organisation-appearance.entity");
const organisation_hours_entity_1 = require("./organisation/entities/organisation-hours.entity");
const product_analytics_entity_1 = require("./products/entities/product-analytics.entity");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
            }),
            cache_manager_1.CacheModule.register({
                ttl: +process.env.CACHE_EXPIRATION_TIME || 300,
                max: +process.env.CACHE_MAX_ITEMS || 200,
                isGlobal: true,
            }),
            event_emitter_1.EventEmitterModule.forRoot(),
            typeorm_1.TypeOrmModule.forRoot({
                type: 'mysql',
                host: process.env.DATABASE_HOST,
                port: +process.env.DATABASE_PORT,
                username: process.env.DATABASE_USER,
                password: process.env.DATABASE_PASSWORD,
                database: process.env.DATABASE_NAME,
                entities: [
                    user_entity_1.User,
                    user_profile_entity_1.UserProfile,
                    user_employeement_profile_entity_1.UserEmployeementProfile,
                    attendance_entity_1.Attendance,
                    claim_entity_1.Claim,
                    doc_entity_1.Doc,
                    lead_entity_1.Lead,
                    journal_entity_1.Journal,
                    task_entity_1.Task,
                    organisation_entity_1.Organisation,
                    branch_entity_1.Branch,
                    news_entity_1.News,
                    asset_entity_1.Asset,
                    tracking_entity_1.Tracking,
                    notification_entity_1.Notification,
                    task_entity_1.Task,
                    client_entity_1.Client,
                    product_entity_1.Product,
                    product_analytics_entity_1.ProductAnalytics,
                    reseller_entity_1.Reseller,
                    quotation_entity_1.Quotation,
                    quotation_item_entity_1.QuotationItem,
                    banners_entity_1.Banners,
                    subtask_entity_1.SubTask,
                    communication_log_entity_1.CommunicationLog,
                    check_in_entity_1.CheckIn,
                    user_rewards_entity_1.UserRewards,
                    achievement_entity_1.Achievement,
                    unlocked_item_entity_1.UnlockedItem,
                    xp_transaction_entity_1.XPTransaction,
                    report_entity_1.Report,
                    pending_signup_entity_1.PendingSignup,
                    password_reset_entity_1.PasswordReset,
                    license_entity_1.License,
                    license_usage_entity_1.LicenseUsage,
                    license_event_entity_1.LicenseEvent,
                    organisation_settings_entity_1.OrganisationSettings,
                    organisation_appearance_entity_1.OrganisationAppearance,
                    organisation_hours_entity_1.OrganisationHours,
                ],
                synchronize: true,
                retryAttempts: 100,
                retryDelay: 2000,
                extra: {
                    connectionLimit: 100000,
                },
            }),
            assets_module_1.AssetsModule,
            attendance_module_1.AttendanceModule,
            auth_module_1.AuthModule,
            branch_module_1.BranchModule,
            claims_module_1.ClaimsModule,
            clients_module_1.ClientsModule,
            communication_module_1.CommunicationModule,
            docs_module_1.DocsModule,
            journal_module_1.JournalModule,
            leads_module_1.LeadsModule,
            news_module_1.NewsModule,
            notifications_module_1.NotificationsModule,
            organisation_module_1.OrganisationModule,
            products_module_1.ProductsModule,
            reports_module_1.ReportsModule,
            resellers_module_1.ResellersModule,
            shop_module_1.ShopModule,
            tasks_module_1.TasksModule,
            tracking_module_1.TrackingModule,
            user_module_1.UserModule,
            check_ins_module_1.CheckInsModule,
            rewards_module_1.RewardsModule,
            licensing_module_1.LicensingModule,
        ],
        controllers: [],
        providers: [
            app_service_1.AppService,
            app_controller_1.AppController,
            {
                provide: core_1.APP_GUARD,
                useClass: role_guard_1.RoleGuard,
            },
            {
                provide: core_1.APP_INTERCEPTOR,
                useClass: license_usage_interceptor_1.LicenseUsageInterceptor,
            },
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map