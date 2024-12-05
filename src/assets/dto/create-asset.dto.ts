import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsDate, IsNotEmpty, IsObject, IsString } from "class-validator";

export class CreateAssetDto {
    @IsNotEmpty()
    @IsString()
    @ApiProperty({
        example: 'Dell',
        description: 'The brand of the asset'
    })
    brand: string;

    @IsNotEmpty()
    @IsString()
    @ApiProperty({
        example: '1234567890',
        description: 'The serial number of the asset'
    })
    serialNumber: string;

    @IsNotEmpty()
    @IsString()
    @ApiProperty({
        example: '1234567890',
        description: 'The model number of the asset'
    })
    modelNumber: string;

    @IsNotEmpty()
    @IsDate()
    @ApiProperty({
        example: `${new Date()}`,
        description: 'The purchase date of the asset'
    })
    purchaseDate: Date;

    @IsNotEmpty()
    @IsBoolean()
    @ApiProperty({
        example: true,
        description: 'Whether the asset has insurance'
    })
    hasInsurance: boolean;

    @IsNotEmpty()
    @IsString()
    @ApiProperty({
        example: 'ABC Insurance',
        description: 'The insurance provider of the asset'
    })
    insuranceProvider: string;

    @IsNotEmpty()
    @IsDate()
    @ApiProperty({
        example: `${new Date()}`,
        description: 'The insurance expiry date of the asset'
    })
    insuranceExpiryDate: Date;

    @IsNotEmpty()
    @IsObject()
    @ApiProperty({
        example: { uid: 1 },
        description: 'The reference code of the owner of the asset'
    })
    owner: { uid: number };

    @IsNotEmpty()
    @IsObject()
    @ApiProperty({
        example: { uid: 1 },
        description: 'The branch reference code of the asset'
    })
    branch: { uid: number };
}
