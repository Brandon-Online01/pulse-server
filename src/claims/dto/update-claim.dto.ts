import { PartialType } from '@nestjs/swagger';
import { CreateClaimDto } from './create-claim.dto';
import { ClaimCategory, ClaimStatus } from '../../lib/enums/finance.enums';
import { IsEnum, IsOptional, IsNumber, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateClaimDto extends PartialType(CreateClaimDto) {
    @IsOptional()
    @ApiProperty({
        example: ClaimStatus.PENDING,
        description: 'Status of the claim'
    })
    @IsEnum(ClaimStatus)
    status: ClaimStatus = ClaimStatus.PENDING;

    @ApiProperty({
        example: 'This is a description of the claim',
        description: 'Description of the claim'
    })
    @IsOptional()
    @IsString()
    comment: string;

    @ApiProperty({
        example: 1000,
        description: 'Amount being claimed'
    })
    @IsOptional() 
    @IsNumber()
    amount: number;

    @ApiProperty({
        example: 'https://example.com/document.pdf',
        description: 'URL reference to the uploaded document',
        required: false
    })
    @IsOptional()
    @IsString()
    documentUrl?: string;

    @ApiProperty({
        example: ClaimCategory.GENERAL,
        description: 'Category of the claim'
    })
    @IsOptional()
    @IsEnum(ClaimCategory)
    category: ClaimCategory;

    @ApiProperty({
        example: 1,
        description: 'UID of the owner of the claim'
    })
    @IsOptional()
    @IsNumber()
    owner: number;
}
