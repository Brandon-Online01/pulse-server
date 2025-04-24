import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InteractionsService } from './interactions.service';
import { InteractionsController } from './interactions.controller';
import { Interaction } from './entities/interaction.entity';
import { Lead } from '../leads/entities/lead.entity';
import { Client } from '../clients/entities/client.entity';
import { LicensingModule } from '../licensing/licensing.module';

@Module({
	imports: [TypeOrmModule.forFeature([Interaction, Lead, Client]), LicensingModule],
	controllers: [InteractionsController],
	providers: [InteractionsService],
	exports: [InteractionsService],
})
export class InteractionsModule {}
