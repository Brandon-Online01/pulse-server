import { PartialType } from '@nestjs/swagger';
import { CreatePdfGenerationDto } from './create-pdf-generation.dto';

export class UpdatePdfGenerationDto extends PartialType(CreatePdfGenerationDto) {}
