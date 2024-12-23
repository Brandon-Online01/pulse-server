import { IsEnum, IsNotEmpty, IsString } from "class-validator";
import { ProductStatus } from "src/lib/enums/product.enums";

export class CreateBannerDto {
    @IsNotEmpty()
    @IsString()
    title: string;

    @IsNotEmpty()
    @IsString()
    subtitle: string;

    @IsNotEmpty()
    @IsString()
    description: string;

    @IsNotEmpty()
    @IsString()
    image: string;

    @IsNotEmpty()
    @IsEnum(ProductStatus)
    category: ProductStatus;
} 