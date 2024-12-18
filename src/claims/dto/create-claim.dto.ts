import { IsEnum, IsNumber, IsString, IsNotEmpty, IsObject, IsOptional } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { ClaimStatus } from "../../lib/enums/status.enums";
import { ClaimCategory } from "../../lib/enums/finance.enums";

export class CreateClaimDto {
    @IsNumber()
    @IsNotEmpty()
    @ApiProperty({
        description: 'The amount of the claim',
        example: 1000,
    })
    amount: number;

    @IsString()
    @IsNotEmpty()
    @ApiProperty({
        description: 'The file url of the claim',
        example: 'https://example.com/file.pdf',
    })
    fileUrl: string;

    @IsNotEmpty()
    @IsObject()
    @ApiProperty({
        description: 'The user reference code of the person who verified the claim',
        example: { uid: 1 },
    })
    verifiedBy: { uid: number };

    @IsNotEmpty()
    @ApiProperty({
        description: 'The boolean value to check if the claim is deleted',
        example: false,
    })
    isDeleted: boolean;

    @IsEnum(ClaimStatus)
    @ApiProperty({
        description: 'The status of the claim',
        example: ClaimStatus.PENDING,
    })
    status: ClaimStatus;

    @IsNotEmpty()
    @IsObject()
    @ApiProperty({
        description: 'The owner reference code of the claim',
        example: { uid: 1 },
    })
    owner: { uid: number } | null;

    @IsNotEmpty()
    @IsObject()
    @ApiProperty({
        description: 'The branch reference code of the claim',
        example: { uid: 1 },
    })
    branch: { uid: number };

    @IsString()
    @IsOptional()
    @ApiProperty({
        description: 'The comments of the claim',
        example: 'This is a comment',
    })
    comments: string;

    @IsEnum(ClaimCategory)
    @IsOptional()
    @ApiProperty({
        description: 'The category of the claim',
        example: ClaimCategory.GENERAL,
    })
    category: string;
}