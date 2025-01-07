import { Module } from '@nestjs/common';
import { ShopService } from './shop.service';
import { ShopController } from './shop.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { Product } from '../products/entities/product.entity';
import { Banners } from './entities/banners.entity';
import { ClientsModule } from '../clients/clients.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { CommunicationModule } from '../communication/communication.module';
import { LicensingModule } from '../licensing/licensing.module';

@Module({
  imports: [
    LicensingModule,
    ClientsModule,
    NotificationsModule,
    CommunicationModule,
    TypeOrmModule.forFeature([Order, Product, Banners])
  ],
  controllers: [ShopController],
  providers: [ShopService],
  exports: [ShopService]
})
export class ShopModule { }
