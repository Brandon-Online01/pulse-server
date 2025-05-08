import { Module } from '@nestjs/common';
import { PdfGenerationService } from './pdf-generation.service';
import { PdfGenerationController } from './pdf-generation.controller';
import { StorageService } from '../lib/services/storage.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Doc } from '../docs/entities/doc.entity';

@Module({
	imports: [TypeOrmModule.forFeature([Doc])],
	controllers: [PdfGenerationController],
	providers: [PdfGenerationService, StorageService],
	exports: [PdfGenerationService],
})
export class PdfGenerationModule {}
