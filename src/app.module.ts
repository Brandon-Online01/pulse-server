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
import { CacheModule } from '@nestjs/cache-manager';
import { redisConfig } from './config/redis.config';
import { AttendanceModule } from './attendance/attendance.module';
import { Attendance } from './attendance/entities/attendance.entity';

@Module({
  imports: [
    EventEmitterModule.forRoot(),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    CacheModule.register(redisConfig),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DATABASE_HOST,
      port: +process.env.DATABASE_PORT,
      username: process.env.DATABASE_USER,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE_NAME,
      entities: [User, UserProfile, UserEmployeementProfile, Attendance],
      synchronize: true,
      retryAttempts: 50,
      retryDelay: 2000,
      extra: {
        connectionLimit: 100,
      },
    }),
    AuthModule,
    UserModule,
    CommunicationModule,
    AttendanceModule,
  ],
  controllers: [],
  providers: [AppService, AppController],
})
export class AppModule { }
