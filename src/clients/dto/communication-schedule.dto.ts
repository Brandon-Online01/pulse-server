import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, IsNumber, IsArray, IsBoolean, IsObject, IsDateString, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { CommunicationFrequency, CommunicationType } from '../../lib/enums/client.enums';

export class CreateCommunicationScheduleDto {
    @IsEnum(CommunicationType)
    @ApiProperty({
        enum: CommunicationType,
        example: CommunicationType.PHONE_CALL,
        description: 'Type of communication to schedule'
    })
    communicationType: CommunicationType;

    @IsEnum(CommunicationFrequency)
    @ApiProperty({
        enum: CommunicationFrequency,
        example: CommunicationFrequency.WEEKLY,
        description: 'How often the communication should occur'
    })
    frequency: CommunicationFrequency;

    @IsNumber()
    @IsOptional()
    @Min(1)
    @Max(365)
    @ApiProperty({
        example: 7,
        description: 'Custom frequency in days (required if frequency is CUSTOM)',
        required: false,
        minimum: 1,
        maximum: 365
    })
    customFrequencyDays?: number;

    @IsString()
    @IsOptional()
    @ApiProperty({
        example: '09:00',
        description: 'Preferred time of day in HH:MM format',
        required: false
    })
    preferredTime?: string;

    @IsArray()
    @IsNumber({}, { each: true })
    @IsOptional()
    @ApiProperty({
        example: [1, 2, 3, 4, 5],
        description: 'Preferred days of the week (0=Sunday, 1=Monday, etc.)',
        required: false,
        type: [Number]
    })
    preferredDays?: number[];

    @IsDateString()
    @IsOptional()
    @ApiProperty({
        example: '2024-03-15T09:00:00Z',
        description: 'Next scheduled communication date',
        required: false
    })
    nextScheduledDate?: string;

    @IsBoolean()
    @IsOptional()
    @ApiProperty({
        example: true,
        description: 'Whether this schedule is active',
        required: false,
        default: true
    })
    isActive?: boolean;

    @IsString()
    @IsOptional()
    @ApiProperty({
        example: 'Call every Monday to discuss weekly updates',
        description: 'Additional notes about this communication schedule',
        required: false
    })
    notes?: string;

    @IsNumber()
    @IsOptional()
    @ApiProperty({
        example: 1,
        description: 'User ID to assign this communication to (defaults to assigned sales rep)',
        required: false
    })
    assignedToUserId?: number;

    @IsObject()
    @IsOptional()
    @ApiProperty({
        example: { reminder: 24, priority: 'high' },
        description: 'Additional metadata for the schedule',
        required: false
    })
    metadata?: Record<string, any>;
}

export class UpdateCommunicationScheduleDto {
    @IsEnum(CommunicationType)
    @IsOptional()
    @ApiProperty({
        enum: CommunicationType,
        example: CommunicationType.EMAIL,
        description: 'Type of communication to schedule',
        required: false
    })
    communicationType?: CommunicationType;

    @IsEnum(CommunicationFrequency)
    @IsOptional()
    @ApiProperty({
        enum: CommunicationFrequency,
        example: CommunicationFrequency.MONTHLY,
        description: 'How often the communication should occur',
        required: false
    })
    frequency?: CommunicationFrequency;

    @IsNumber()
    @IsOptional()
    @Min(1)
    @Max(365)
    @ApiProperty({
        example: 14,
        description: 'Custom frequency in days',
        required: false
    })
    customFrequencyDays?: number;

    @IsString()
    @IsOptional()
    @ApiProperty({
        example: '14:00',
        description: 'Preferred time of day in HH:MM format',
        required: false
    })
    preferredTime?: string;

    @IsArray()
    @IsNumber({}, { each: true })
    @IsOptional()
    @ApiProperty({
        example: [1, 3, 5],
        description: 'Preferred days of the week',
        required: false
    })
    preferredDays?: number[];

    @IsDateString()
    @IsOptional()
    @ApiProperty({
        example: '2024-04-01T14:00:00Z',
        description: 'Next scheduled communication date',
        required: false
    })
    nextScheduledDate?: string;

    @IsBoolean()
    @IsOptional()
    @ApiProperty({
        example: false,
        description: 'Whether this schedule is active',
        required: false
    })
    isActive?: boolean;

    @IsString()
    @IsOptional()
    @ApiProperty({
        example: 'Updated to monthly calls due to client preference',
        description: 'Additional notes about this communication schedule',
        required: false
    })
    notes?: string;

    @IsNumber()
    @IsOptional()
    @ApiProperty({
        example: 2,
        description: 'User ID to assign this communication to',
        required: false
    })
    assignedToUserId?: number;

    @IsObject()
    @IsOptional()
    @ApiProperty({
        example: { reminder: 48, priority: 'medium' },
        description: 'Additional metadata for the schedule',
        required: false
    })
    metadata?: Record<string, any>;
}

export class CommunicationScheduleQueryDto {
    @IsNumber()
    @IsOptional()
    @Type(() => Number)
    @ApiProperty({
        example: 1,
        description: 'Page number for pagination',
        required: false,
        default: 1
    })
    page?: number;

    @IsNumber()
    @IsOptional()
    @Type(() => Number)
    @ApiProperty({
        example: 10,
        description: 'Number of items per page',
        required: false,
        default: 10
    })
    limit?: number;

    @IsEnum(CommunicationType)
    @IsOptional()
    @ApiProperty({
        enum: CommunicationType,
        description: 'Filter by communication type',
        required: false
    })
    communicationType?: CommunicationType;

    @IsEnum(CommunicationFrequency)
    @IsOptional()
    @ApiProperty({
        enum: CommunicationFrequency,
        description: 'Filter by frequency',
        required: false
    })
    frequency?: CommunicationFrequency;

    @IsBoolean()
    @IsOptional()
    @Type(() => Boolean)
    @ApiProperty({
        example: true,
        description: 'Filter by active status',
        required: false
    })
    isActive?: boolean;

    @IsNumber()
    @IsOptional()
    @Type(() => Number)
    @ApiProperty({
        example: 1,
        description: 'Filter by assigned user ID',
        required: false
    })
    assignedToUserId?: number;
} 