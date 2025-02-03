import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { SyncController } from './sync.controller';
import { SyncService } from './sync.service';
import { UserModule } from '../user/user.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Client } from '../clients/entities/client.entity';
import { ClientsModule } from '../clients/clients.module';
import { Product } from 'src/products/entities/product.entity';
@Module({
  imports: [
    ConfigModule,
    ScheduleModule.forRoot(),
    UserModule,
    ClientsModule,
    TypeOrmModule.forFeature([Client, Product])
  ],
  controllers: [SyncController],
  providers: [SyncService],
  exports: [SyncService]
})
export class SyncModule { }
