import { PartialType } from '@nestjs/swagger';
import { CreateResellerDto } from './create-reseller.dto';
import { IsEmail, IsEnum, IsOptional, IsString } from 'class-validator';
import { ResellerStatus } from '../../lib/enums/product.enums';

export class UpdateResellerDto extends PartialType(CreateResellerDto) {
    @IsString()
    @IsOptional()
    name?: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsString()
    @IsOptional()
    logo?: string;

    @IsString()
    @IsOptional()
    website?: string;

    @IsString()
    @IsOptional()
    @IsEnum(ResellerStatus)
    status?: ResellerStatus;

    @IsString()
    @IsOptional()
    contactPerson?: string;

    @IsString()
    @IsOptional()
    phone?: string;

    @IsEmail()
    @IsOptional()
    email?: string;

    @IsString()
    @IsOptional()
    address?: string;
}
