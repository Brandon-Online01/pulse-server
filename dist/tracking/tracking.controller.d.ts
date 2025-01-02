import { TrackingService } from './tracking.service';
import { CreateTrackingDto } from './dto/create-tracking.dto';
export declare class TrackingController {
    private readonly trackingService;
    constructor(trackingService: TrackingService);
    create(createTrackingDto: CreateTrackingDto): Promise<{
        message: string;
        data: import("./entities/tracking.entity").Tracking;
    } | {
        message: any;
        tracking: any;
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
    restore(ref: number): Promise<{
        message: string;
    }>;
    remove(ref: number): Promise<{
        message: string;
    }>;
}
