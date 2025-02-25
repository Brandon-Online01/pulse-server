import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateNewsDto } from './create-news.dto';
import { IsEnum, IsOptional } from 'class-validator';
import { GeneralStatus } from 'src/lib/enums/status.enums';

export class UpdateNewsDto extends PartialType(CreateNewsDto) {
	@IsEnum(GeneralStatus)
	@IsOptional()
	@ApiProperty({
		example: GeneralStatus.ACTIVE,
		description: 'The status of the news',
	})
	status: GeneralStatus;  
}
