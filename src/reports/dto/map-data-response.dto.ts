import { ApiProperty } from '@nestjs/swagger';

export class GeoPosition {
  @ApiProperty({ description: 'Latitude', example: -26.2041 })
  lat: number;

  @ApiProperty({ description: 'Longitude', example: 28.0473 })
  lng: number;
}

export class TaskDto {
  @ApiProperty({ description: 'Task ID' })
  id: string;

  @ApiProperty({ description: 'Task title' })
  title: string;

  @ApiProperty({ description: 'Client name' })
  client: string;
}

export class LocationDto {
  @ApiProperty({ description: 'Location address' })
  address: string;

  @ApiProperty({ description: 'Location image URL', required: false })
  imageUrl?: string;
}

export class ScheduleDto {
  @ApiProperty({ description: 'Current schedule time range' })
  current: string;

  @ApiProperty({ description: 'Next schedule time range' })
  next: string;
}

export class ActivityDto {
  @ApiProperty({ description: 'Number of claims', required: false })
  claims?: number;

  @ApiProperty({ description: 'Number of journals', required: false })
  journals?: number;

  @ApiProperty({ description: 'Number of leads', required: false })
  leads?: number;

  @ApiProperty({ description: 'Number of check-ins', required: false })
  checkIns?: number;

  @ApiProperty({ description: 'Number of tasks', required: false })
  tasks?: number;

  @ApiProperty({ description: 'Number of quotations', required: false })
  quotations?: number;
}

export class WorkerDto {
  @ApiProperty({ description: 'Worker ID' })
  id: string;

  @ApiProperty({ description: 'Worker name' })
  name: string;

  @ApiProperty({ description: 'Worker status' })
  status: string;

  @ApiProperty({ description: 'Position [lat, lng]', type: [Number] })
  position: [number, number];

  @ApiProperty({ description: 'Marker type', enum: ['check-in', 'shift-start', 'lead', 'journal', 'task'] })
  markerType: string;

  @ApiProperty({ description: 'Worker image URL', required: false })
  image?: string;

  @ApiProperty({ description: 'Can add task flag', required: false })
  canAddTask?: boolean;

  @ApiProperty({ description: 'Current task', required: false, type: TaskDto })
  task?: TaskDto;

  @ApiProperty({ description: 'Location details', type: LocationDto })
  location: LocationDto;

  @ApiProperty({ description: 'Schedule information', type: ScheduleDto })
  schedule: ScheduleDto;

  @ApiProperty({ description: 'Activity counts', required: false, type: ActivityDto })
  activity?: ActivityDto;
}

export class ClientDto {
  @ApiProperty({ description: 'Client ID' })
  id: number;

  @ApiProperty({ description: 'Client name' })
  name: string;

  @ApiProperty({ description: 'Position [lat, lng]', type: [Number] })
  position: [number, number];

  @ApiProperty({ description: 'Client reference' })
  clientRef: string;

  @ApiProperty({ description: 'Contact name', required: false })
  contactName?: string;

  @ApiProperty({ description: 'Email', required: false })
  email?: string;

  @ApiProperty({ description: 'Phone', required: false })
  phone?: string;

  @ApiProperty({ description: 'Status' })
  status: string;

  @ApiProperty({ description: 'Website', required: false })
  website?: string;

  @ApiProperty({ description: 'Logo URL', required: false })
  logoUrl?: string;

  @ApiProperty({ description: 'Address' })
  address: any;

  @ApiProperty({ description: 'Marker type', enum: ['client'] })
  markerType: string;
}

export class CompetitorDto {
  @ApiProperty({ description: 'Competitor ID' })
  id: number;

  @ApiProperty({ description: 'Competitor name' })
  name: string;

  @ApiProperty({ description: 'Position [lat, lng]', type: [Number] })
  position: [number, number];

  @ApiProperty({ description: 'Marker type', enum: ['competitor'] })
  markerType: string;

  @ApiProperty({ description: 'Threat level', required: false })
  threatLevel?: number;

  @ApiProperty({ description: 'Is direct competitor', required: false })
  isDirect?: boolean;

  @ApiProperty({ description: 'Industry', required: false })
  industry?: string;

  @ApiProperty({ description: 'Status' })
  status: string;

  @ApiProperty({ description: 'Website', required: false })
  website?: string;

  @ApiProperty({ description: 'Logo URL', required: false })
  logoUrl?: string;

  @ApiProperty({ description: 'Competitor reference' })
  competitorRef: string;

  @ApiProperty({ description: 'Address' })
  address: any;

  @ApiProperty({ description: 'Geofencing settings', required: false })
  geofencing?: any;
}

export class QuotationDto {
  @ApiProperty({ description: 'Quotation ID' })
  id: number;

  @ApiProperty({ description: 'Quotation number' })
  quotationNumber: string;

  @ApiProperty({ description: 'Client name' })
  clientName: string;

  @ApiProperty({ description: 'Position [lat, lng]', type: [Number] })
  position: [number, number];

  @ApiProperty({ description: 'Total amount' })
  totalAmount: number;

  @ApiProperty({ description: 'Status' })
  status: string;

  @ApiProperty({ description: 'Quotation date' })
  quotationDate: string | Date;

  @ApiProperty({ description: 'Placed by' })
  placedBy: string;

  @ApiProperty({ description: 'Is converted to order' })
  isConverted: boolean;

  @ApiProperty({ description: 'Valid until date', required: false })
  validUntil?: string | Date;

  @ApiProperty({ description: 'Marker type', enum: ['quotation'] })
  markerType: string;
}

export class EventDto {
  @ApiProperty({ description: 'Event ID' })
  id: string;

  @ApiProperty({ description: 'Event type' })
  type: string;

  @ApiProperty({ description: 'Event title' })
  title: string;

  @ApiProperty({ description: 'Event time' })
  time: string;

  @ApiProperty({ description: 'Event location' })
  location: string;

  @ApiProperty({ description: 'User name' })
  user: string;

  @ApiProperty({ description: 'Location coordinates', required: false, type: [Number] })
  position?: [number, number];
}

export class RegionDto {
  @ApiProperty({ description: 'Region name' })
  name: string;

  @ApiProperty({ description: 'Region center', type: GeoPosition })
  center: GeoPosition;

  @ApiProperty({ description: 'Zoom level' })
  zoom: number;
}

export class MapConfigDto {
  @ApiProperty({ description: 'Default map center', type: GeoPosition })
  defaultCenter: GeoPosition;

  @ApiProperty({ description: 'Organization regions', required: false, type: [RegionDto] })
  orgRegions?: RegionDto[];
}

export class MapDataResponseDto {
  @ApiProperty({ description: 'Workers/staff on the map', type: [WorkerDto] })
  workers: WorkerDto[];

  @ApiProperty({ description: 'Clients on the map', required: false, type: [ClientDto] })
  clients?: ClientDto[];

  @ApiProperty({ description: 'Competitors on the map', required: false, type: [CompetitorDto] })
  competitors?: CompetitorDto[];

  @ApiProperty({ description: 'Quotations on the map', required: false, type: [QuotationDto] })
  quotations?: QuotationDto[];

  @ApiProperty({ description: 'Recent events', required: false, type: [EventDto] })
  events?: EventDto[];

  @ApiProperty({ description: 'Map configuration', required: false, type: MapConfigDto })
  mapConfig?: MapConfigDto;
} 