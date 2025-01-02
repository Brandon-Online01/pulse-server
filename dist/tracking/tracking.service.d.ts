import { CreateTrackingDto } from './dto/create-tracking.dto';
import { UpdateTrackingDto } from './dto/update-tracking.dto';
import { Tracking } from './entities/tracking.entity';
import { Repository } from 'typeorm';
export declare class TrackingService {
    private trackingRepository;
    constructor(trackingRepository: Repository<Tracking>);
    create(createTrackingDto: CreateTrackingDto): Promise<{
        message: string;
        data: Tracking;
    } | {
        message: any;
        tracking: any;
    }>;
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
}
