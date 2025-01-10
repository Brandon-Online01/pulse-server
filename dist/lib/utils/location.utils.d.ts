export declare class LocationUtils {
    static calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number;
    static calculateTotalDistance(trackingPoints: {
        latitude: number;
        longitude: number;
    }[]): number;
    private static toRad;
    static formatDistance(distance: number): string;
}
