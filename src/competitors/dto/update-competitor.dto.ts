import { PartialType } from '@nestjs/swagger';
import { IsNumber, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { CreateCompetitorDto } from './create-competitor.dto';

export class UpdateCompetitorDto extends PartialType(CreateCompetitorDto) {
  @IsNumber()
  @IsOptional()
  @ApiProperty({
    description: 'Organisation ID this competitor belongs to',
    example: 1,
    required: false,
  })
  organisationId?: number;

  @IsNumber()
  @IsOptional()
  @ApiProperty({
    description: 'Branch ID this competitor belongs to',
    example: 1,
    required: false,
  })
  branchId?: number;
}
