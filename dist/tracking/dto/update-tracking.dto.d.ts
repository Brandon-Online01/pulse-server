import { CreateTrackingDto } from './create-tracking.dto';
declare const UpdateTrackingDto_base: import("@nestjs/common").Type<Partial<CreateTrackingDto>>;
export declare class UpdateTrackingDto extends UpdateTrackingDto_base {
    latitude?: number;
    longitude?: number;
    speed?: number;
    heading?: number;
    altitude?: number;
    accuracy?: number;
    altitudeAccuracy?: number;
    timestamp?: number;
    batteryLevel?: number;
    batteryState?: number;
    brand?: string;
    manufacturer?: string;
    modelID?: string;
    modelName?: string;
    osName?: string;
    osVersion?: string;
    network?: Record<string, any>;
    deviceId?: string;
    deviceName?: string;
    macAddress?: string;
    signalStrength?: number;
    isActive?: boolean;
    status?: string;
    metadata?: Record<string, any>;
    branch?: {
        uid: number;
    };
    owner?: number;
}
export {};
