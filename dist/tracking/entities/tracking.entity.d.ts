import { User } from 'src/user/entities/user.entity';
import { Branch } from '../../branch/entities/branch.entity';
export declare class Tracking {
    uid: number;
    latitude?: number;
    longitude?: number;
    speed?: number;
    heading?: number;
    altitude?: number;
    accuracy?: number;
    deviceId?: string;
    deviceName?: string;
    macAddress?: string;
    batteryLevel?: number;
    signalStrength?: number;
    isActive: boolean;
    status?: string;
    createdAt: Date;
    updatedAt: Date;
    metadata?: Record<string, any>;
    deletedAt: Date;
    deletedBy?: string;
    branch: Branch;
    owner: User;
}
