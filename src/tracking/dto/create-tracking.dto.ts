import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateTrackingDto {
    @IsNotEmpty()
    @IsNumber()
    owner: any;

    @IsNotEmpty()
    @IsNumber()
    latitude: number;

    @IsNotEmpty()
    @IsNumber()
    longitude: number;

    @IsOptional()
    @IsString()
    address?: string;

    @IsOptional()
    @IsString()
    notes?: string;

    @IsOptional()
    @IsNumber()
    distance?: number;

    @IsOptional()
    @IsNumber()
    duration?: number;
}
