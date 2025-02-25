import { TrackingService } from './tracking.service';
import { CreateTrackingDto } from './dto/create-tracking.dto';
import { Request } from 'express';
import { User } from '../user/entities/user.entity';
interface AuthenticatedRequest extends Request {
    user: User;
}
export declare class TrackingController {
    private readonly trackingService;
    constructor(trackingService: TrackingService);
    create(createTrackingDto: CreateTrackingDto): Promise<{
        message: string;
        data: import("./entities/tracking.entity").Tracking;
        warnings: {
            type: string;
            message: string;
        }[];
        tracking?: undefined;
    } | {
        message: any;
        tracking: any;
        warnings: any[];
        data?: undefined;
    }>;
    createStopEvent(stopData: {
        latitude: number;
        longitude: number;
        startTime: number;
        endTime: number;
        duration: number;
        address?: string;
    }, req: AuthenticatedRequest): Promise<{
        message: string;
        data: import("./entities/tracking.entity").Tracking;
    }>;
    getUserStops(req: AuthenticatedRequest): Promise<{
        message: string;
        data: import("./entities/tracking.entity").Tracking[];
    }>;
    findAll(): Promise<{
        tracking: import("./entities/tracking.entity").Tracking[] | null;
        message: string;
    }>;
    findOne(ref: number): Promise<{
        tracking: import("./entities/tracking.entity").Tracking | null;
        message: string;
    }>;
    trackingByUser(ref: number): Promise<{
        message: string;
        tracking: import("./entities/tracking.entity").Tracking[];
    }>;
    getDailyTracking(userId: number): Promise<{
        message: string;
        data: {
            totalDistance: string;
            trackingPoints: import("./entities/tracking.entity").Tracking[];
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
    restore(ref: number): Promise<{
        message: string;
    }>;
    remove(ref: number): Promise<{
        message: string;
    }>;
}
export {};
