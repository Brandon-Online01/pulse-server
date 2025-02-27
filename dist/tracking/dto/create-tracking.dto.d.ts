export declare class CreateTrackingDto {
    owner: number;
    latitude: number;
    longitude: number;
    address?: string;
    notes?: string;
    distance?: number;
    duration?: number;
    accuracy?: number;
    altitude?: number;
    altitudeAccuracy?: number;
    heading?: number;
    speed?: number;
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
}
