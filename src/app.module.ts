import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { User } from './user/entities/user.entity';
import { CommunicationModule } from './communication/communication.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { UserProfile } from './user/entities/user.profile.entity';
import { UserEmployeementProfile } from './user/entities/user.employeement.profile.entity';
import { AttendanceModule } from './attendance/attendance.module';
import { Attendance } from './attendance/entities/attendance.entity';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { RoleGuard } from './guards/role.guard';
import { TrackingModule } from './tracking/tracking.module';
import { DocsModule } from './docs/docs.module';
import { ClaimsModule } from './claims/claims.module';
import { Claim } from './claims/entities/claim.entity';
import { Doc } from './docs/entities/doc.entity';
import { LeadsModule } from './leads/leads.module';
import { Lead } from './leads/entities/lead.entity';
import { JournalModule } from './journal/journal.module';
import { Journal } from './journal/entities/journal.entity';
import { TasksModule } from './tasks/tasks.module';
import { Task } from './tasks/entities/task.entity';
import { OrganisationModule } from './organisation/organisation.module';
import { BranchModule } from './branch/branch.module';
import { Branch } from './branch/entities/branch.entity';
import { Organisation } from './organisation/entities/organisation.entity';
import { NewsModule } from './news/news.module';
import { News } from './news/entities/news.entity';
import { AssetsModule } from './assets/assets.module';
import { Asset } from './assets/entities/asset.entity';
import { Tracking } from './tracking/entities/tracking.entity';
import { ShopModule } from './shop/shop.module';
import { ResellersModule } from './resellers/resellers.module';
import { Quotation } from './shop/entities/quotation.entity';
import { NotificationsModule } from './notifications/notifications.module';
import { Notification } from './notifications/entities/notification.entity';
import { ClientsModule } from './clients/clients.module';
import { Client } from './clients/entities/client.entity';
import { ProductsModule } from './products/products.module';
import { Product } from './products/entities/product.entity';
import { Reseller } from './resellers/entities/reseller.entity';
import { ReportsModule } from './reports/reports.module';
import { QuotationItem } from './shop/entities/quotation-item.entity';
import { Banners } from './shop/entities/banners.entity';
import { SubTask } from './tasks/entities/subtask.entity';
import { CommunicationLog } from './communication/entities/communication-log.entity';
import { CheckInsModule } from './check-ins/check-ins.module';
import { CheckIn } from './check-ins/entities/check-in.entity';
import { RewardsModule } from './rewards/rewards.module';
import { UserRewards } from './rewards/entities/user-rewards.entity';
import { Achievement } from './rewards/entities/achievement.entity';
import { UnlockedItem } from './rewards/entities/unlocked-item.entity';
import { XPTransaction } from './rewards/entities/xp-transaction.entity';
import { CacheModule } from '@nestjs/cache-manager';
import { Report } from './reports/entities/report.entity';
import { PendingSignup } from './auth/entities/pending-signup.entity';
import { PasswordReset } from './auth/entities/password-reset.entity';
import { License } from './licensing/entities/license.entity';
import { LicenseUsage } from './licensing/entities/license-usage.entity';
import { LicenseEvent } from './licensing/entities/license-event.entity';
import { LicensingModule } from './licensing/licensing.module';
import { LicenseUsageInterceptor } from './licensing/license-usage.interceptor';
import { OrganisationSettings } from './organisation/entities/organisation-settings.entity';
import { OrganisationAppearance } from './organisation/entities/organisation-appearance.entity';
import { OrganisationHours } from './organisation/entities/organisation-hours.entity';
import { ProductAnalytics } from './products/entities/product-analytics.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    CacheModule.register({
      ttl: +process.env.CACHE_EXPIRATION_TIME || 300,
      max: +process.env.CACHE_MAX_ITEMS || 200,
      isGlobal: true,
    }),
    EventEmitterModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DATABASE_HOST,
      port: +process.env.DATABASE_PORT,
      username: process.env.DATABASE_USER,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE_NAME,
      entities: [
        User,
        UserProfile,
        UserEmployeementProfile,
        Attendance,
        Claim,
        Doc,
        Lead,
        Journal,
        Task,
        Organisation,
        Branch,
        News,
        Asset,
        Tracking,
        Notification,
        Task,
        Client,
        Product,
        ProductAnalytics, 
        Reseller,
        Quotation,
        QuotationItem,
        Banners,
        SubTask,
        CommunicationLog,
        CheckIn,
        UserRewards,
        Achievement,
        UnlockedItem,
        XPTransaction,
        Report,
        PendingSignup,
        PasswordReset,
        License,
        LicenseUsage,
        LicenseEvent,
        OrganisationSettings,
        OrganisationAppearance,
        OrganisationHours,
      ],
      synchronize: true,
      retryAttempts: 100,
      retryDelay: 2000,
      extra: {
        connectionLimit: 100000,
      },
    }),
    AssetsModule,
    AttendanceModule,
    AuthModule,
    BranchModule,
    ClaimsModule,
    ClientsModule,
    CommunicationModule,
    DocsModule,
    JournalModule,
    LeadsModule,
    NewsModule,
    NotificationsModule,
    OrganisationModule,
    ProductsModule,
    ReportsModule,
    ResellersModule,
    ShopModule,
    TasksModule,
    TrackingModule,
    UserModule,
    CheckInsModule,
    RewardsModule,
    LicensingModule,
  ],
  controllers: [],
  providers: [
    AppService,
    AppController,
    {
      provide: APP_GUARD,
      useClass: RoleGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: LicenseUsageInterceptor,
    },
  ],
})
export class AppModule { }
