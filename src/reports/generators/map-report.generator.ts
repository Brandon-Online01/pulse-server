import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MapReportParamsDto } from '../dto/map-report-params.dto';
import { UserService } from '../../user/user.service';
import { OrganisationService } from '../../organisation/organisation.service';
import { CheckInsService } from '../../check-ins/check-ins.service';
import { ClientsService } from '../../clients/clients.service';
import { CompetitorsService } from '../../competitors/competitors.service';
import { TasksService } from '../../tasks/tasks.service';
import { ShopService } from '../../shop/shop.service';
import { 
  MapDataResponseDto, 
  MapConfigDto,
  WorkerDto,
  ClientDto,
  CompetitorDto,
  QuotationDto,
  EventDto 
} from '../dto/map-data-response.dto';

@Injectable()
export class MapReportGenerator {
  constructor(
    private readonly configService: ConfigService,
    private readonly userService: UserService,
    private readonly organisationService: OrganisationService,
    private readonly checkInsService: CheckInsService,
    private readonly clientsService: ClientsService,
    private readonly competitorsService: CompetitorsService,
    private readonly tasksService: TasksService,
    private readonly shopService: ShopService,
  ) {}

  async generate(params: MapReportParamsDto): Promise<Record<string, any>> {
    const { organisationId, branchId, dateRange, mapFilters } = params;
    
    console.log('Generating map data with params:', {
      organisationId,
      branchId,
      dateRange: dateRange ? {
        start: dateRange.start?.toISOString(),
        end: dateRange.end?.toISOString()
      } : 'none',
      mapFilters
    });
    
    // Prepare the result structure with default empty arrays
    const result: Record<string, any> = {
      workers: [],
      clients: [],
      competitors: [],
      quotations: [],
      events: [],
      mapConfig: {
        defaultCenter: { lat: -26.2041, lng: 28.0473 }, // Default Johannesburg coordinates
        orgRegions: []
      }
    };

    try {
      // 1. Get map configuration
      try {
        result.mapConfig = this.getDefaultMapConfig();
      } catch (configError) {
        console.error('Error in map config:', configError);
      }
      
      // 2. Fetch workers/staff with their latest locations
      try {
        result.workers = await this.getMockWorkers(organisationId, branchId, mapFilters);
      } catch (workersError) {
        console.error('Error getting workers:', workersError);
      }
      
      // 3. Fetch clients if requested
      try {
        result.clients = await this.getMockClients(organisationId, branchId);
      } catch (clientsError) {
        console.error('Error getting clients:', clientsError);
      }
      
      // 4. Fetch competitors if requested
      try {
        result.competitors = await this.getMockCompetitors(organisationId, branchId);
      } catch (competitorsError) {
        console.error('Error getting competitors:', competitorsError);
      }
      
      // 5. Fetch recent quotations
      try {
        result.quotations = await this.getMockQuotations(organisationId, branchId, dateRange);
      } catch (quotationsError) {
        console.error('Error getting quotations:', quotationsError);
      }
      
      // 6. Fetch recent events
      try {
        result.events = await this.getMockEvents(organisationId, branchId, dateRange);
      } catch (eventsError) {
        console.error('Error getting events:', eventsError);
      }
      
      return result;
    } catch (error) {
      console.error('Error generating map report:', error);
      // Return result with whatever data we successfully gathered
      return result;
    }
  }

  private getDefaultMapConfig(): any {
    return {
      defaultCenter: { lat: -26.2041, lng: 28.0473 }, // Johannesburg
      orgRegions: [
        {
          name: 'Main Office',
          center: { lat: -26.2041, lng: 28.0473 },
          zoom: 13
        },
        {
          name: 'Pretoria Branch',
          center: { lat: -25.7461, lng: 28.1881 },
          zoom: 12
        }
      ]
    };
  }

  private async getMockWorkers(organisationId: number, branchId?: number, filters?: any): Promise<any[]> {
    // Filter mock data based on parameters
    const workers = [
      {
        id: '1',
        name: 'John Doe',
        status: 'Active',
        position: [-26.2041, 28.0473],
        markerType: 'check-in',
        image: '/placeholder.svg',
        canAddTask: true,
        location: {
          address: 'Sandton City Mall, Johannesburg'
        },
        schedule: {
          current: '09:00 AM - 05:00 PM',
          next: 'Tomorrow 09:00 AM'
        },
        activity: {
          claims: 3,
          journals: 8,
          leads: 2,
          checkIns: 15,
          tasks: 4,
          quotations: 3
        }
      },
      {
        id: '2',
        name: 'Jane Smith',
        status: 'On task',
        position: [-26.1867, 28.0568],
        markerType: 'task',
        task: {
          id: 'T123',
          title: 'Site visit',
          client: 'ABC Company'
        },
        location: {
          address: 'West Street, Sandton'
        },
        schedule: {
          current: '10:00 AM - 06:00 PM',
          next: 'Tomorrow 10:00 AM'
        }
      }
    ];
    
    // Apply filters if provided
    return workers.filter(worker => {
      // Filter by user ID if specified
      if (filters?.userId && worker.id !== filters.userId.toString()) {
        return false;
      }
      
      // Filter by marker types if specified
      if (filters?.markerTypes && 
          filters.markerTypes.length > 0 && 
          !filters.markerTypes.includes(worker.markerType)) {
        return false;
      }
      
      return true;
    });
  }

  private async getMockClients(organisationId: number, branchId?: number): Promise<any[]> {
    return [
      {
        id: 101,
        name: 'ABC Corporation',
        position: [-26.1052, 28.0560],
        clientRef: 'ABC001',
        contactName: 'Michael Brown',
        email: 'michael@abc.com',
        phone: '+27731234567',
        status: 'Active',
        website: 'www.abc.com',
        address: {
          address: 'Midrand, Johannesburg'
        },
        markerType: 'client'
      },
      {
        id: 102,
        name: 'XYZ Industries',
        position: [-26.2485, 28.1300],
        clientRef: 'XYZ001',
        contactName: 'Sarah Johnson',
        email: 'sarah@xyz.com',
        phone: '+27829876543',
        status: 'Active',
        website: 'www.xyz.com',
        address: {
          address: 'Kempton Park, Johannesburg'
        },
        markerType: 'client'
      }
    ];
  }

  private async getMockCompetitors(organisationId: number, branchId?: number): Promise<any[]> {
    return [
      {
        id: 201,
        name: 'Competitor A',
        position: [-26.1719, 27.9695],
        markerType: 'competitor',
        threatLevel: 8,
        isDirect: true,
        industry: 'Manufacturing',
        status: 'Active',
        website: 'www.competitora.com',
        competitorRef: 'COMP001',
        address: {
          address: 'Randburg, Johannesburg'
        }
      }
    ];
  }

  private async getMockQuotations(organisationId: number, branchId?: number, dateRange?: any): Promise<any[]> {
    return [
      {
        id: 301,
        quotationNumber: 'Q2023-001',
        clientName: 'ABC Corporation',
        position: [-26.1052, 28.0560],
        totalAmount: 15000,
        status: 'Pending',
        quotationDate: new Date(),
        placedBy: 'John Doe',
        isConverted: false,
        validUntil: new Date(new Date().setDate(new Date().getDate() + 30)),
        markerType: 'quotation'
      }
    ];
  }

  private async getMockEvents(organisationId: number, branchId?: number, dateRange?: any): Promise<any[]> {
    return [
      {
        id: '401',
        type: 'check-in',
        title: 'Staff Check-in',
        time: new Date().toISOString(),
        location: 'Sandton City Mall, Johannesburg',
        user: 'John Doe',
        position: [-26.2041, 28.0473]
      },
      {
        id: '402',
        type: 'task',
        title: 'Task Completed',
        time: new Date(new Date().setHours(new Date().getHours() - 2)).toISOString(),
        location: 'West Street, Sandton',
        user: 'Jane Smith',
        position: [-26.1867, 28.0568]
      }
    ];
  }
} 