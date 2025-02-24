import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { Product } from './entities/product.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LicensingModule } from '../licensing/licensing.module';
import { ProductAnalytics } from './entities/product-analytics.entity';

@Module({
  imports: [
    LicensingModule,
    TypeOrmModule.forFeature([Product, ProductAnalytics])
  ],
  controllers: [ProductsController],
  providers: [ProductsService],
  exports: [ProductsService]
})
export class ProductsModule { }
