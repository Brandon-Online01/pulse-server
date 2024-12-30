import { Module } from '@nestjs/common';
import { CheckInsService } from './check-ins.service';
import { CheckInsController } from './check-ins.controller';
import { CheckIn } from './entities/check-in.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([CheckIn])],
  controllers: [CheckInsController],
  providers: [CheckInsService],
  exports: [CheckInsService]
})
export class CheckInsModule { }
