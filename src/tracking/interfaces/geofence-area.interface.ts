/**
 * Interface for geofence area data sent to mobile app
 */
export interface GeofenceArea {
    identifier: string;
    latitude: number;
    longitude: number;
    radius: number;
    name: string;
    description?: string;
} 