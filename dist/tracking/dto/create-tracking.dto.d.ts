export declare class CreateTrackingDto {
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
    isActive?: boolean;
    status?: string;
    metadata?: Record<string, any>;
    branch: {
        uid: number;
    };
    owner: {
        uid: number;
    };
}
