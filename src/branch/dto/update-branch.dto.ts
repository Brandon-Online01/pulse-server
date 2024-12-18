import { IsBoolean, IsDate, IsEnum, IsObject, IsOptional, IsString } from 'class-validator';
import { PartialType } from '@nestjs/swagger';
import { CreateBranchDto } from './create-branch.dto';
import { GeneralStatus } from '../../lib/enums/status.enums';

export class UpdateBranchDto extends PartialType(CreateBranchDto) {
    @IsOptional()
    @IsString()
    name?: string;

    @IsOptional()
    @IsString()
    email?: string;

    @IsOptional()
    @IsString()
    phone?: string;

    @IsOptional()
    @IsString()
    contactPerson?: string;

    @IsOptional()
    @IsString()
    address?: string;

    @IsOptional()
    @IsString()
    website?: string;

    @IsOptional()
    @IsEnum(GeneralStatus)
    status?: GeneralStatus;

    @IsOptional()
    @IsBoolean()
    isDeleted?: boolean;

    @IsOptional()
    @IsDate()
    createdAt?: Date;

    @IsOptional()
    @IsDate()
    updatedAt?: Date;

    @IsOptional()
    @IsObject()
    organisation?: { uid: number };
}
