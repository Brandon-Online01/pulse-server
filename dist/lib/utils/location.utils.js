"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LocationUtils = void 0;
class LocationUtils {
    static calculateDistance(lat1, lon1, lat2, lon2) {
        const R = 6371;
        const dLat = this.toRad(lat2 - lat1);
        const dLon = this.toRad(lon2 - lon1);
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }
    static calculateTotalDistance(trackingPoints) {
        let totalDistance = 0;
        for (let i = 1; i < trackingPoints.length; i++) {
            const prevPoint = trackingPoints[i - 1];
            const currentPoint = trackingPoints[i];
            totalDistance += this.calculateDistance(prevPoint.latitude, prevPoint.longitude, currentPoint.latitude, currentPoint.longitude);
        }
        return totalDistance;
    }
    static toRad(degrees) {
        return degrees * (Math.PI / 180);
    }
    static formatDistance(distance) {
        if (distance < 1) {
            return `${Math.round(distance * 1000)} meters`;
        }
        return `${distance.toFixed(2)} km`;
    }
}
exports.LocationUtils = LocationUtils;
//# sourceMappingURL=location.utils.js.map