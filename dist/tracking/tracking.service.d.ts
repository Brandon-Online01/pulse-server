import { CreateTrackingDto } from './dto/create-tracking.dto';
import { UpdateTrackingDto } from './dto/update-tracking.dto';
import { Tracking } from './entities/tracking.entity';
import { Repository } from 'typeorm';
import { User } from '../user/entities/user.entity';
export declare class TrackingService {
    private trackingRepository;
    private userRepository;
    private readonly geocodingApiKey;
    constructor(trackingRepository: Repository<Tracking>, userRepository: Repository<User>);
    create(createTrackingDto: CreateTrackingDto, branchId?: string | number | null, orgId?: string | number | null): Promise<{
        message: string;
        data: Tracking;
        warnings: {
            type: string;
            message: string;
        }[];
    } | {
        message: any;
        tracking: any;
        warnings: any[];
    }>;
    private getAddressFromCoordinates;
    getDailyTracking(userId: number, date?: Date): Promise<{
        message: string;
        data: {
            totalDistance: string;
            trackingPoints: Tracking[];
            locationAnalysis: {
                timeSpentByLocation: {
                    [k: string]: number;
                };
                averageTimePerLocation: number;
            };
        };
    } | {
        message: any;
        data: any;
    }>;
    private calculateTimeSpentAtLocations;
    private calculateAverageTimePerLocation;
    findAll(): Promise<{
        tracking: Tracking[] | null;
        message: string;
    }>;
    findOne(ref: number): Promise<{
        tracking: Tracking | null;
        message: string;
    }>;
    trackingByUser(ref: number): Promise<{
        message: string;
        tracking: Tracking[];
    }>;
    update(ref: number, updateTrackingDto: UpdateTrackingDto): Promise<{
        message: any;
    }>;
    remove(ref: number): Promise<{
        message: string;
    }>;
    restore(ref: number): Promise<{
        message: string;
    }>;
    createStopEvent(stopData: {
        latitude: number;
        longitude: number;
        startTime: number;
        endTime: number;
        duration: number;
        address?: string;
    }, userId: number): Promise<{
        message: string;
        data: Tracking;
    }>;
    getUserStops(userId: number): Promise<{
        message: string;
        data: Tracking[];
    }>;
}
