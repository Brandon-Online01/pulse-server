import { Module } from '@nestjs/common';
import { DocsService } from './docs.service';
import { DocsController } from './docs.controller';
import { Doc } from './entities/doc.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LicensingModule } from '../licensing/licensing.module';
import { StorageService } from '../lib/services/storage.service';

@Module({
  imports: [
    LicensingModule,
    TypeOrmModule.forFeature([Doc])
  ],
  controllers: [DocsController],
  providers: [DocsService, StorageService],
  exports: [DocsService]
})
export class DocsModule { }
