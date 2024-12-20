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
import { APP_GUARD } from '@nestjs/core';
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
import { Order } from './shop/entities/order.entity';
import { NotificationsModule } from './notifications/notifications.module';
import { Notification } from './notifications/entities/notification.entity';
import { ClientsModule } from './clients/clients.module';
import { Client } from './clients/entities/client.entity';
import { ProductsModule } from './products/products.module';
import { Product } from './products/entities/product.entity';
import { Reseller } from './resellers/entities/reseller.entity';
import { ReportsModule } from './reports/reports.module';
import { OrderItem } from './shop/entities/order-item.entity';
import { Banners } from './shop/entities/banners.entity';

@Module({
  imports: [
    AssetsModule,
    AttendanceModule,
    AuthModule,
    BranchModule,
    ClaimsModule,
    ClientsModule,
    CommunicationModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    DocsModule,
    EventEmitterModule.forRoot(),
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
        Reseller,
        Order,
        OrderItem,
        Banners
      ],
      synchronize: true,
      retryAttempts: 50,
      retryDelay: 2000,
      extra: {
        connectionLimit: 100,
      },
    }),
    UserModule,
  ],
  controllers: [],
  providers: [
    AppService,
    AppController,
    {
      provide: APP_GUARD,
      useClass: RoleGuard,
    },
  ],
})
export class AppModule { }
