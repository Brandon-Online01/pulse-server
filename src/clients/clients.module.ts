import { Module } from '@nestjs/common';
import { ClientsService } from './clients.service';
import { ClientsController } from './clients.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Client } from './entities/client.entity';
import { LicensingModule } from '../licensing/licensing.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    LicensingModule,
    TypeOrmModule.forFeature([Client]),
    ConfigModule,
  ],
  controllers: [ClientsController],
  providers: [ClientsService],
  exports: [ClientsService]
})
export class ClientsModule { }
