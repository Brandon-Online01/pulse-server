import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, IsBoolean, IsNumber, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { CompetitorStatus } from '../../lib/enums/competitor.enums';

export class FilterCompetitorDto {
  @IsEnum(CompetitorStatus)
  @IsOptional()
  @ApiProperty({
    description: 'Filter by competitor status',
    enum: CompetitorStatus,
    required: false,
  })
  status?: CompetitorStatus;

  @IsBoolean()
  @IsOptional()
  @ApiProperty({
    description: 'Filter by direct competitor status',
    type: Boolean,
    required: false,
  })
  isDirect?: boolean;

  @IsString()
  @IsOptional()
  @ApiProperty({
    description: 'Filter by industry',
    type: String,
    required: false,
  })
  industry?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    description: 'Filter by name (partial match)',
    type: String,
    required: false,
  })
  name?: string;

  @IsNumber()
  @Min(1)
  @Max(5)
  @IsOptional()
  @Type(() => Number)
  @ApiProperty({
    description: 'Filter by minimum threat level (1-5)',
    type: Number,
    minimum: 1,
    maximum: 5,
    required: false,
  })
  minThreatLevel?: number;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  @ApiProperty({
    description: 'Organisation ID to filter by',
    type: Number,
    required: false,
  })
  organisationId?: number;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  @ApiProperty({
    description: 'Branch ID to filter by',
    type: Number,
    required: false,
  })
  branchId?: number;

  @IsBoolean()
  @IsOptional()
  @ApiProperty({
    description: 'Include deleted records',
    type: Boolean,
    default: false,
    required: false,
  })
  isDeleted?: boolean;
} 