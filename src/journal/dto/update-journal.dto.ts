import { PartialType } from '@nestjs/swagger';
import { CreateJournalDto } from './create-journal.dto';
import { IsOptional, IsString, IsObject } from 'class-validator';

export class UpdateJournalDto extends PartialType(CreateJournalDto) {
    @IsOptional()
    @IsString()
    comments?: string;

    @IsOptional()
    @IsString()
    clientRef?: string;

    @IsOptional()
    @IsString()
    fileURL?: string;

    @IsOptional()
    @IsObject()
    owner?: { uid: number };

    @IsOptional()
    @IsObject()
    branch?: { uid: number };
}
