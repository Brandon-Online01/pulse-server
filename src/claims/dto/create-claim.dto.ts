import { IsNotEmpty, IsNumber, IsString, IsEnum, ValidateNested, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ClaimCategory, ClaimStatus } from '../../lib/enums/finance.enums';
import { User } from '../../user/entities/user.entity';

export class CreateClaimDto {
    @ApiProperty({ description: 'Title of the claim' })
    @IsNotEmpty()
    @IsString()
    title: string;

    @ApiProperty({ description: 'Description of the claim' })
    @IsNotEmpty()
    @IsString()
    description: string;

    @ApiProperty({ description: 'Amount being claimed' })
    @IsNotEmpty()
    @IsNumber()
    amount: number;

    @ApiProperty({ description: 'URL reference to the uploaded document', required: false })
    @IsOptional()
    @IsString()
    documentUrl?: string;

    @ApiProperty({ enum: ClaimCategory, description: 'Category of the claim' })
    @IsNotEmpty()
    @IsEnum(ClaimCategory)
    category: ClaimCategory;

    @ApiProperty({ enum: ClaimStatus, description: 'Status of the claim' })
    @IsEnum(ClaimStatus)
    status: ClaimStatus = ClaimStatus.PENDING;

    @ApiProperty({ type: () => User })
    @ValidateNested()
    @Type(() => User)
    owner: User;
}