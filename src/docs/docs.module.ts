import { Module } from '@nestjs/common';
import { DocsService } from './docs.service';
import { DocsController } from './docs.controller';
import { Doc } from './entities/doc.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LicensingModule } from '../licensing/licensing.module';

@Module({
  imports: [
    LicensingModule,
    TypeOrmModule.forFeature([Doc])
  ],
  controllers: [DocsController],
  providers: [DocsService],
  exports: [DocsService]
})
export class DocsModule { }
