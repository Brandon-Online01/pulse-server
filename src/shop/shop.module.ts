import { Module } from '@nestjs/common';
import { ShopService } from './shop.service';
import { ShopController } from './shop.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Quotation } from './entities/quotation.entity';
import { Product } from '../products/entities/product.entity';
import { Banners } from './entities/banners.entity';
import { ClientsModule } from '../clients/clients.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { CommunicationModule } from '../communication/communication.module';
import { LicensingModule } from '../licensing/licensing.module';
import { ShopGateway } from './shop.gateway';

@Module({
  imports: [
    LicensingModule,
    ClientsModule,
    NotificationsModule,
    CommunicationModule,
    TypeOrmModule.forFeature([Quotation, Product, Banners])
  ],
  controllers: [ShopController],
  providers: [ShopService, ShopGateway],
  exports: [ShopService]
})
export class ShopModule { }
