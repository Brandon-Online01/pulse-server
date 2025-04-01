import { IsOptional, IsNumber, IsString, IsEnum, IsArray, ValidateNested, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';
import { ReportParamsDto } from './report-params.dto';
import { ApiProperty } from '@nestjs/swagger';

export class MapFilterDto {
  @ApiProperty({ description: 'User ID to filter by', required: false })
  @IsOptional()
  @IsNumber()
  userId?: number;

  @ApiProperty({ description: 'Filter by marker types', required: false, example: ['check-in', 'task', 'client'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  markerTypes?: string[];

  @ApiProperty({ description: 'Filter active users only', required: false, default: false })
  @IsOptional()
  @IsBoolean()
  activeOnly?: boolean;
}

export class MapReportParamsDto extends ReportParamsDto {
  @ApiProperty({ description: 'Map-specific filters', required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => MapFilterDto)
  mapFilters?: MapFilterDto;
} 