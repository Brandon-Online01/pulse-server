import { IsNotEmpty, IsNumber, IsString, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ClaimCategory, ClaimStatus } from '../../lib/enums/finance.enums';

export class CreateClaimDto {
    @ApiProperty({ description: 'Description of the claim' })
    @IsNotEmpty()
    @IsString()
    comment: string;

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

    @ApiProperty({ description: 'UID of the owner of the claim' })
    @IsNotEmpty()
    @IsNumber()
    owner: number;
}