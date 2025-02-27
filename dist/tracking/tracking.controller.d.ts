import { TrackingService } from './tracking.service';
import { CreateTrackingDto } from './dto/create-tracking.dto';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { User } from '../user/entities/user.entity';
interface AuthenticatedRequest extends Request {
    user: User;
}
export declare class TrackingController {
    private readonly trackingService;
    private readonly jwtService;
    constructor(trackingService: TrackingService, jwtService: JwtService);
    create(createTrackingDto: CreateTrackingDto, req: Request): Promise<{
        message: string;
        data: import("./entities/tracking.entity").Tracking;
        warnings: {
            type: string;
            message: string;
        }[];
    } | {
        message: any;
        tracking: any;
        warnings: any[];
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
    findAll(): Promise<{
        tracking: import("./entities/tracking.entity").Tracking[] | null;
        message: string;
    }>;
    getUserStops(req: AuthenticatedRequest): Promise<{
        message: string;
        data: import("./entities/tracking.entity").Tracking[];
    }>;
    findOne(ref: number): Promise<{
        tracking: import("./entities/tracking.entity").Tracking | null;
        message: string;
    }>;
    trackingByUser(ref: number): Promise<{
        message: string;
        tracking: import("./entities/tracking.entity").Tracking[];
    }>;
    getDailyTracking(ref: number): Promise<{
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
    createDeviceTracking(deviceData: any, req: Request): {
        message: string;
        tracking: any;
        warnings: {
            type: string;
            message: string;
        }[];
    } | {
        geofenceInfo: string;
        then<TResult1 = {
            message: string;
            data: import("./entities/tracking.entity").Tracking;
            warnings: {
                type: string;
                message: string;
            }[];
        } | {
            message: any;
            tracking: any;
            warnings: any[];
        }, TResult2 = never>(onfulfilled?: (value: {
            message: string;
            data: import("./entities/tracking.entity").Tracking;
            warnings: {
                type: string;
                message: string;
            }[];
        } | {
            message: any;
            tracking: any;
            warnings: any[];
        }) => TResult1 | PromiseLike<TResult1>, onrejected?: (reason: any) => TResult2 | PromiseLike<TResult2>): Promise<TResult1 | TResult2>;
        catch<TResult = never>(onrejected?: (reason: any) => TResult | PromiseLike<TResult>): Promise<{
            message: string;
            data: import("./entities/tracking.entity").Tracking;
            warnings: {
                type: string;
                message: string;
            }[];
        } | {
            message: any;
            tracking: any;
            warnings: any[];
        } | TResult>;
        finally(onfinally?: () => void): Promise<{
            message: string;
            data: import("./entities/tracking.entity").Tracking;
            warnings: {
                type: string;
                message: string;
            }[];
        } | {
            message: any;
            tracking: any;
            warnings: any[];
        }>;
        [Symbol.toStringTag]: string;
        message?: undefined;
        tracking?: undefined;
        warnings?: undefined;
    };
}
export {};
