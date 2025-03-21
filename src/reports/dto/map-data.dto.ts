import { ApiProperty } from '@nestjs/swagger';
import { CreateGeofenceDto } from 'src/tracking/dto/create-geofence.dto';

export enum MapMarkerType {
	CHECK_IN = 'check-in',
	SHIFT_START = 'shift-start',
	LEAD = 'lead',
	JOURNAL = 'journal',
	TASK = 'task',
	CHECK_OUT = 'check-out',
	SHIFT_END = 'shift-end',
	BREAK_START = 'break-start',
	BREAK_END = 'break-end',
	JOB_START = 'job-start',
	JOB_END = 'job-end',
	JOB_PAUSE = 'job-pause',
	JOB_RESUME = 'job-resume',
	JOB_CANCEL = 'job-cancel',
	JOB_COMPLETE = 'job-complete',
	COMPETITOR = 'competitor',
}

export enum MapEventCategory {
	TASK = 'task',
	LEAD = 'lead',
	CHECK_IN = 'check-in',
	JOURNAL = 'journal',
	CLAIM = 'claim',
	QUOTATION = 'quotation',
	ATTENDANCE = 'attendance',
	SYSTEM = 'system',
	SUMMARY = 'summary',
}

export class LocationDto {
	@ApiProperty({ description: 'Physical address of the location (if available)' })
	address: string;

	@ApiProperty({ description: 'Image URL of the location', required: false })
	imageUrl?: string;
}

export class TaskDto {
	@ApiProperty({ description: 'Task identifier' })
	id: string;

	@ApiProperty({ description: 'Task title' })
	title: string;

	@ApiProperty({ description: 'Client name' })
	client: string;
}

export class ScheduleDto {
	@ApiProperty({ description: 'Current schedule' })
	current: string;

	@ApiProperty({ description: 'Next schedule' })
	next: string;
}

export class JobStatusDto {
	@ApiProperty({ description: 'Job start time' })
	startTime: string;

	@ApiProperty({ description: 'Job end time' })
	endTime: string;

	@ApiProperty({ description: 'Job duration' })
	duration: string;

	@ApiProperty({ description: 'Current job status' })
	status: string;

	@ApiProperty({ description: 'Job completion percentage' })
	completionPercentage: number;
}

export class BreakDataDto {
	@ApiProperty({ description: 'Break start time' })
	startTime: string;

	@ApiProperty({ description: 'Break end time' })
	endTime: string;

	@ApiProperty({ description: 'Break duration' })
	duration: string;

	@ApiProperty({ description: 'Break location' })
	location: string;

	@ApiProperty({ description: 'Remaining break time' })
	remainingTime: string;
}

export class ActivityDto {
	@ApiProperty({ description: 'Number of claims created by the worker' })
	claims: number;

	@ApiProperty({ description: 'Number of journal entries created by the worker' })
	journals: number;

	@ApiProperty({ description: 'Number of leads created by the worker' })
	leads: number;

	@ApiProperty({ description: 'Number of check-ins performed by the worker' })
	checkIns: number;

	@ApiProperty({ description: 'Number of tasks completed by the worker' })
	tasks: number;

	@ApiProperty({ description: 'Number of quotations created by the worker', required: false })
	quotations?: number;
}

export class WorkerLocationDto {
	@ApiProperty({ description: 'Unique identifier for the worker' })
	id: string;

	@ApiProperty({ description: 'Name of the worker/user' })
	name: string;

	@ApiProperty({
		description: 'Current position as [latitude, longitude] tuple',
		type: 'array',
		items: {
			type: 'number',
		},
		required: false,
	})
	position?: [number, number];

	@ApiProperty({ description: 'Type of marker to display for this worker', enum: MapMarkerType })
	markerType: MapMarkerType;

	@ApiProperty({ description: 'Current status of the worker' })
	status: string;

	@ApiProperty({ description: 'Avatar/profile image URL', required: false })
	image?: string;

	@ApiProperty({ description: 'Whether this worker can be assigned a task', required: false })
	canAddTask?: boolean;

	@ApiProperty({ description: 'Current task details', type: TaskDto, required: false })
	task?: TaskDto;

	@ApiProperty({ description: 'Location details', type: LocationDto })
	location: LocationDto;

	@ApiProperty({ description: 'Worker schedule', type: ScheduleDto })
	schedule: ScheduleDto;

	@ApiProperty({ description: 'Job status details', type: JobStatusDto, required: false })
	jobStatus?: JobStatusDto;

	@ApiProperty({ description: 'Break details if worker is on break', type: BreakDataDto, required: false })
	breakData?: BreakDataDto;

	@ApiProperty({ description: 'Activity statistics for the worker', type: ActivityDto, required: false })
	activity?: ActivityDto;
}

export class MapEventDto {
	@ApiProperty({ description: 'Unique identifier for the event' })
	id: string;

	@ApiProperty({ description: 'Username associated with this event' })
	user: string;

	@ApiProperty({ description: 'Type of event', enum: MapMarkerType })
	type: MapMarkerType;

	@ApiProperty({ description: 'Category of event for filtering/grouping', enum: MapEventCategory })
	category: MapEventCategory;

	@ApiProperty({ description: 'Human-readable time string' })
	time: string;

	@ApiProperty({ description: 'Location string' })
	location: string;

	@ApiProperty({ description: 'Title of the event' })
	title: string;

	@ApiProperty({ description: 'Time period (Today, Yesterday, This Week, Earlier)', required: false })
	timePeriod?: string;

	@ApiProperty({ description: 'Additional event context data', required: false })
	context?: Record<string, any>;
}

export class MapConfigDto {
	@ApiProperty({ description: 'Default map center coordinates' })
	defaultCenter: { lat: number; lng: number };

	@ApiProperty({ description: 'Organization map regions' })
	orgRegions: Array<{
		name: string;
		center: { lat: number; lng: number };
		zoom: number;
	}>;
}

export class GeofenceDto {
	@ApiProperty({
		description: 'Whether geofencing is enabled for this competitor',
		example: true,
	})
	enabled: boolean;

	@ApiProperty({
		description: 'Type of geofence action',
		example: 'NOTIFY',
	})
	type: string;

	@ApiProperty({
		description: 'Radius of geofence in meters',
		example: 500,
	})
	radius: number;
}

export class CompetitorLocationDto {
	@ApiProperty({ description: 'Unique identifier for the competitor' })
	id: number;

	@ApiProperty({ description: 'Name of the competitor' })
	name: string;

	@ApiProperty({
		description: 'Latitude and longitude coordinates',
		example: [51.5074, -0.1278],
		required: false,
	})
	position?: [number, number];

	@ApiProperty({
		description: 'Marker type for map display',
		enum: MapMarkerType,
		example: MapMarkerType.COMPETITOR,
	})
	markerType: MapMarkerType;

	@ApiProperty({
		description: 'Threat level (1-5)',
		example: 3,
	})
	threatLevel: number;

	@ApiProperty({
		description: 'Whether this is a direct competitor',
		example: true,
	})
	isDirect: boolean;

	@ApiProperty({
		description: 'Industry category',
		example: 'Software',
	})
	industry: string;

	@ApiProperty({
		description: 'Status of the competitor',
		example: 'ACTIVE',
	})
	status: string;

	@ApiProperty({
		description: 'Website URL',
		example: 'https://example.com',
		required: false,
	})
	website?: string;

	@ApiProperty({
		description: 'Logo URL',
		example: 'https://example.com/logo.png',
		required: false,
	})
	logoUrl?: string;

	@ApiProperty({
		description: 'Unique reference code',
		example: 'COMP-1234',
	})
	competitorRef: string;

	// @ApiProperty({
	//   description: 'Physical address',
	//   type: 'object',
	// })
	address: any;

	@ApiProperty({
		description: 'Geofencing configuration',
		type: GeofenceDto,
	})
	geofencing: GeofenceDto;
}

export class MapDataResponseDto {
	@ApiProperty({ description: 'List of workers with their current locations', type: [WorkerLocationDto] })
	workers: WorkerLocationDto[];

	@ApiProperty({ description: 'List of recent events with location data', type: [MapEventDto] })
	events: MapEventDto[];

	@ApiProperty({ description: 'Map configuration data', type: MapConfigDto })
	mapConfig: MapConfigDto;

	@ApiProperty({
		description: 'List of competitors with their locations',
		type: [CompetitorLocationDto],
		required: false,
	})
	competitors?: CompetitorLocationDto[];
}
