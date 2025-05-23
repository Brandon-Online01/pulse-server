import { IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterPushTokenDto {
	@ApiProperty({ description: 'Expo push token', example: 'ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]' })
	@IsString()
	token: string;

	@ApiProperty({ description: 'Device identifier', required: false })
	@IsOptional()
	@IsString()
	deviceId?: string;

	@ApiProperty({ description: 'Platform (ios/android)', required: false, enum: ['ios', 'android'] })
	@IsOptional()
	@IsString()
	platform?: string;
} 