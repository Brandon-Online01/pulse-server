import { Module } from '@nestjs/common';
import { ResellersService } from './resellers.service';
import { ResellersController } from './resellers.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Reseller } from './entities/reseller.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Reseller])],
  controllers: [ResellersController],
  providers: [ResellersService],
  exports: [ResellersService]
})
export class ResellersModule { }
