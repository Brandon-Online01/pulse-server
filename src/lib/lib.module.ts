import { Module } from '@nestjs/common';
import { GoogleMapsService } from './services/google-maps.service';
import { ConfigModule } from '@nestjs/config';
import { ImporterService } from './services/importer';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from '../products/entities/product.entity';
import { User } from '../user/entities/user.entity';
import { Quotation } from '../shop/entities/quotation.entity';
import { QuotationItem } from '../shop/entities/quotation-item.entity';
import { Client } from '../clients/entities/client.entity';
import { Organisation } from '../organisation/entities/organisation.entity';
import { Branch } from '../branch/entities/branch.entity';

@Module({
	imports: [
		ConfigModule,
		TypeOrmModule.forFeature([Product, User, Quotation, QuotationItem, Client, Organisation, Branch]),
	],
	providers: [GoogleMapsService, ImporterService],
	exports: [GoogleMapsService, ImporterService],
})
export class LibModule {}
