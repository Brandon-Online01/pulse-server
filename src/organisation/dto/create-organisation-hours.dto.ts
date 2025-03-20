import { IsString, IsOptional, IsArray, ValidateNested, Matches } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { WeeklyScheduleDto } from './weekly-schedule.dto';
import { SpecialHoursDto } from './special-hours.dto';

export class CreateOrganisationHoursDto {
	@ApiProperty({ 
		description: 'Default opening time in 24-hour format (HH:mm) - used if specific days are not configured', 
		example: '08:30', 
		required: false 
	})
	@IsString()
	@Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
	openTime: string;

	@ApiProperty({ 
		description: 'Default closing time in 24-hour format (HH:mm) - used if specific days are not configured', 
		example: '18:00', 
		required: false 
	})
	@IsString()
	@Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
	closeTime: string;

	@ApiProperty({
		type: WeeklyScheduleDto,
		required: false,
		description: 'Detailed business hours for each day of the week, allowing for different schedules by day',
		example: {
			monday: {
				openTime: '08:30',
				closeTime: '17:30',
			},
			tuesday: {
				openTime: '08:30',
				closeTime: '17:30',
			},
			wednesday: {
				openTime: '08:30',
				closeTime: '17:30',
			},
			thursday: {
				openTime: '08:30',
				closeTime: '19:00', // Extended hours
			},
			friday: {
				openTime: '08:30',
				closeTime: '17:00', // Early close
			},
			saturday: {
				openTime: '10:00',
				closeTime: '15:00', // Weekend hours
			},
			sunday: {
				openTime: '00:00',
				closeTime: '00:00', // Closed
			},
		},
	})
	@ValidateNested()
	@Type(() => WeeklyScheduleDto)
	weeklySchedule: WeeklyScheduleDto;

	@ApiProperty({
		type: [SpecialHoursDto],
		required: false,
		description: 'Special business hours for holidays, events, or temporary schedule changes',
		example: [
			{
				date: '2024-01-01',
				openTime: '00:00',
				closeTime: '00:00',
				reason: 'New Year\'s Day - Closed',
			},
			{
				date: '2024-07-04',
				openTime: '10:00',
				closeTime: '14:00',
				reason: 'Independence Day - Limited Hours',
			},
			{
				date: '2024-11-29',
				openTime: '00:00',
				closeTime: '00:00',
				reason: 'Black Friday - Closed for Staff Holiday',
			},
			{
				date: '2024-12-24',
				openTime: '08:30',
				closeTime: '13:00',
				reason: 'Christmas Eve - Early Closing',
			},
		],
	})
	@IsArray()
	@IsOptional()
	@ValidateNested({ each: true })
	@Type(() => SpecialHoursDto)
	specialHours?: SpecialHoursDto[];
}
