"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TrackingService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const tracking_entity_1 = require("./entities/tracking.entity");
const typeorm_2 = require("typeorm");
const location_utils_1 = require("../lib/utils/location.utils");
const date_fns_1 = require("date-fns");
const axios_1 = require("axios");
let TrackingService = class TrackingService {
    constructor(trackingRepository) {
        this.trackingRepository = trackingRepository;
        this.geocodingApiKey = process.env.GOOGLE_MAPS_API_KEY;
    }
    async create(createTrackingDto) {
        try {
            const { address, error: geocodingError } = await this.getAddressFromCoordinates(createTrackingDto.latitude, createTrackingDto.longitude);
            const tracking = this.trackingRepository.create({
                ...createTrackingDto,
                address,
                addressDecodingError: geocodingError || null,
                rawLocation: `${createTrackingDto.latitude},${createTrackingDto.longitude}`,
            });
            await this.trackingRepository.save(tracking);
            return {
                message: process.env.SUCCESS_MESSAGE,
                data: tracking,
                warnings: geocodingError ? [{ type: 'GEOCODING_ERROR', message: geocodingError }] : []
            };
        }
        catch (error) {
            return {
                message: error.message,
                tracking: null,
                warnings: []
            };
        }
    }
    async getAddressFromCoordinates(latitude, longitude) {
        const MAX_RETRIES = 3;
        const RETRY_DELAY = 1000;
        for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
            try {
                if (!this.geocodingApiKey) {
                    return {
                        address: null,
                        error: 'Geocoding API key not configured'
                    };
                }
                const response = await axios_1.default.get(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${this.geocodingApiKey}`, { timeout: 5000 });
                if (response.data.status === 'ZERO_RESULTS') {
                    return {
                        address: null,
                        error: 'No address found for these coordinates'
                    };
                }
                if (response.data.status !== 'OK') {
                    return {
                        address: null,
                        error: `Geocoding API error: ${response.data.status}`
                    };
                }
                if (response.data.results && response.data.results.length > 0) {
                    return {
                        address: response.data.results[0].formatted_address
                    };
                }
                return {
                    address: null,
                    error: 'No results in geocoding response'
                };
            }
            catch (error) {
                const isLastAttempt = attempt === MAX_RETRIES;
                if (error.response?.status === 429) {
                    if (!isLastAttempt) {
                        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * attempt));
                        continue;
                    }
                    return {
                        address: null,
                        error: 'Geocoding API rate limit exceeded'
                    };
                }
                if (isLastAttempt) {
                    console.error('Geocoding error after max retries:', {
                        error: error.message,
                        coordinates: { latitude, longitude },
                        attempts: attempt
                    });
                    return {
                        address: null,
                        error: `Geocoding failed: ${error.message}`
                    };
                }
                await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * attempt));
            }
        }
        return {
            address: null,
            error: 'Max retries exceeded for geocoding request'
        };
    }
    async getDailyTracking(userId, date = new Date()) {
        try {
            const trackingPoints = await this.trackingRepository.find({
                where: {
                    owner: { uid: userId },
                    createdAt: (0, typeorm_2.Between)((0, date_fns_1.startOfDay)(date), (0, date_fns_1.endOfDay)(date))
                },
                order: {
                    createdAt: 'ASC'
                }
            });
            if (!trackingPoints.length) {
                return {
                    message: 'No tracking data found for the specified date',
                    data: null
                };
            }
            const totalDistance = location_utils_1.LocationUtils.calculateTotalDistance(trackingPoints);
            const formattedDistance = location_utils_1.LocationUtils.formatDistance(totalDistance);
            const locationTimeSpent = this.calculateTimeSpentAtLocations(trackingPoints);
            const averageTimePerLocation = this.calculateAverageTimePerLocation(locationTimeSpent);
            return {
                message: process.env.SUCCESS_MESSAGE,
                data: {
                    totalDistance: formattedDistance,
                    trackingPoints,
                    locationAnalysis: {
                        timeSpentByLocation: locationTimeSpent,
                        averageTimePerLocation: averageTimePerLocation
                    }
                }
            };
        }
        catch (error) {
            return {
                message: error.message,
                data: null
            };
        }
    }
    calculateTimeSpentAtLocations(trackingPoints) {
        const locationMap = new Map();
        for (let i = 0; i < trackingPoints.length - 1; i++) {
            const currentPoint = trackingPoints[i];
            const nextPoint = trackingPoints[i + 1];
            const timeSpent = (new Date(nextPoint.createdAt).getTime() - new Date(currentPoint.createdAt).getTime()) / 1000 / 60;
            if (currentPoint.address) {
                locationMap.set(currentPoint.address, (locationMap.get(currentPoint.address) || 0) + timeSpent);
            }
        }
        return Object.fromEntries(locationMap);
    }
    calculateAverageTimePerLocation(locationTimeSpent) {
        const locations = Object.values(locationTimeSpent);
        if (!locations.length)
            return 0;
        return locations.reduce((sum, time) => sum + time, 0) / locations.length;
    }
    async findAll() {
        try {
            const tracking = await this.trackingRepository.find({
                where: {
                    deletedAt: (0, typeorm_2.IsNull)()
                }
            });
            const response = {
                message: process.env.SUCCESS_MESSAGE,
                tracking: tracking
            };
            return response;
        }
        catch (error) {
            const response = {
                message: error.message,
                tracking: null
            };
            return response;
        }
    }
    async findOne(ref) {
        try {
            const tracking = await this.trackingRepository.findOne({
                where: {
                    uid: ref,
                    deletedAt: (0, typeorm_2.IsNull)()
                },
                relations: ['branch', 'owner']
            });
            const response = {
                message: process.env.SUCCESS_MESSAGE,
                tracking: tracking
            };
            return response;
        }
        catch (error) {
            const response = {
                message: error.message,
                tracking: null
            };
            return response;
        }
    }
    async trackingByUser(ref) {
        try {
            const tracking = await this.trackingRepository.find({
                where: { owner: { uid: ref } }
            });
            if (!tracking) {
                throw new common_1.NotFoundException(process.env.NOT_FOUND_MESSAGE);
            }
            const response = {
                message: process.env.SUCCESS_MESSAGE,
                tracking
            };
            return response;
        }
        catch (error) {
            const response = {
                message: `could not get tracking by user - ${error?.message}`,
                tracking: null
            };
            return response;
        }
    }
    async update(ref, updateTrackingDto) {
        try {
            await this.trackingRepository.update(ref, updateTrackingDto);
            const response = {
                message: process.env.SUCCESS_MESSAGE,
            };
            return response;
        }
        catch (error) {
            const response = {
                message: error.message,
            };
            return response;
        }
    }
    async remove(ref) {
        try {
            await this.trackingRepository.update(ref, {
                deletedAt: new Date(),
                deletedBy: 'system'
            });
            const response = {
                message: process.env.SUCCESS_MESSAGE,
            };
            return response;
        }
        catch (error) {
            const response = {
                message: error.message,
            };
            return response;
        }
    }
    async restore(ref) {
        try {
            await this.trackingRepository.update(ref, {
                deletedAt: null,
                deletedBy: null
            });
            const response = {
                message: process.env.SUCCESS_MESSAGE,
            };
            return response;
        }
        catch (error) {
            const response = {
                message: error.message,
            };
            return response;
        }
    }
    async createStopEvent(stopData, userId) {
        try {
            if (!stopData.address) {
                const { address } = await this.getAddressFromCoordinates(stopData.latitude, stopData.longitude);
                if (address) {
                    stopData.address = address;
                }
            }
            const tracking = this.trackingRepository.create({
                latitude: stopData.latitude,
                longitude: stopData.longitude,
                owner: { uid: userId },
                address: stopData.address,
                rawLocation: `${stopData.latitude},${stopData.longitude}`,
                metadata: {
                    isStop: true,
                    startTime: new Date(stopData.startTime).toISOString(),
                    endTime: new Date(stopData.endTime).toISOString(),
                    durationMinutes: Math.round(stopData.duration / 60000),
                }
            });
            await this.trackingRepository.save(tracking);
            return {
                message: 'Stop event recorded successfully',
                data: tracking
            };
        }
        catch (error) {
            return {
                message: `Failed to record stop event: ${error.message}`,
                data: null
            };
        }
    }
    async getUserStops(userId) {
        try {
            const stops = await this.trackingRepository
                .createQueryBuilder('tracking')
                .where('tracking.owner.uid = :userId', { userId })
                .andWhere('tracking.deletedAt IS NULL')
                .andWhere("JSON_EXTRACT(tracking.metadata, '$.isStop') = :isStop", { isStop: true })
                .orderBy('tracking.createdAt', 'DESC')
                .getMany();
            return {
                message: process.env.SUCCESS_MESSAGE,
                data: stops
            };
        }
        catch (error) {
            return {
                message: `Failed to get user stops: ${error.message}`,
                data: null
            };
        }
    }
};
exports.TrackingService = TrackingService;
exports.TrackingService = TrackingService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(tracking_entity_1.Tracking)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], TrackingService);
//# sourceMappingURL=tracking.service.js.map