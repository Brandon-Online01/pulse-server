import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { LicensingService } from './licensing.service';
import { LicensingController } from './licensing.controller';
import { LicensingNotificationsService } from './licensing-notifications.service';
import { LicenseUsageService } from './license-usage.service';
import { License } from './entities/license.entity';
import { LicenseUsage } from './entities/license-usage.entity';
import { LicenseEvent } from './entities/license-event.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([License, LicenseUsage, LicenseEvent]),
        ScheduleModule.forRoot(),
    ],
    controllers: [LicensingController],
    providers: [
        LicensingService,
        LicensingNotificationsService,
        LicenseUsageService,
    ],
    exports: [LicensingService, LicenseUsageService],
})
export class LicensingModule { } 