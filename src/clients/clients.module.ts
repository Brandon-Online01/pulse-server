import { Module } from '@nestjs/common';
import { ClientsService } from './clients.service';
import { ClientsController } from './clients.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Client } from './entities/client.entity';
import { LicensingModule } from '../licensing/licensing.module';
import { ConfigModule } from '@nestjs/config';
import { LibModule } from '../lib/lib.module';
import { Organisation } from '../organisation/entities/organisation.entity';
import { OrganisationSettings } from '../organisation/entities/organisation-settings.entity';

@Module({
  imports: [
    LicensingModule,
    TypeOrmModule.forFeature([Client, Organisation, OrganisationSettings]),
    ConfigModule,
    LibModule,
  ],
  controllers: [ClientsController],
  providers: [ClientsService],
  exports: [ClientsService]
})
export class ClientsModule { }
