import { Module } from '@nestjs/common';
import { ClientsService } from './clients.service';
import { ClientsController } from './clients.controller';
import { ClientCommunicationScheduleService } from './services/client-communication-schedule.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Client } from './entities/client.entity';
import { ClientCommunicationSchedule } from './entities/client-communication-schedule.entity';
import { LicensingModule } from '../licensing/licensing.module';
import { ConfigModule } from '@nestjs/config';
import { LibModule } from '../lib/lib.module';
import { Organisation } from '../organisation/entities/organisation.entity';
import { OrganisationSettings } from '../organisation/entities/organisation-settings.entity';
import { User } from '../user/entities/user.entity';
import { Task } from '../tasks/entities/task.entity';

@Module({
  imports: [
    LicensingModule,
    TypeOrmModule.forFeature([Client, ClientCommunicationSchedule, Organisation, OrganisationSettings, User, Task]),
    ConfigModule,
    LibModule,
  ],
  controllers: [ClientsController],
  providers: [ClientsService, ClientCommunicationScheduleService],
  exports: [ClientsService, ClientCommunicationScheduleService]
})
export class ClientsModule { }
