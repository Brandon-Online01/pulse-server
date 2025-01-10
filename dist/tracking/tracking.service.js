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
            const address = await this.getAddressFromCoordinates(createTrackingDto.latitude, createTrackingDto.longitude);
            const tracking = this.trackingRepository.create({
                ...createTrackingDto,
                address,
            });
            await this.trackingRepository.save(tracking);
            return {
                message: process.env.SUCCESS_MESSAGE,
                data: tracking
            };
        }
        catch (error) {
            return {
                message: error.message,
                tracking: null
            };
        }
    }
    async getAddressFromCoordinates(latitude, longitude) {
        try {
            const response = await axios_1.default.get(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${this.geocodingApiKey}`);
            if (response.data.results && response.data.results.length > 0) {
                return response.data.results[0].formatted_address;
            }
            return null;
        }
        catch (error) {
            console.error('Geocoding error:', error);
            return null;
        }
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
};
exports.TrackingService = TrackingService;
exports.TrackingService = TrackingService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(tracking_entity_1.Tracking)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], TrackingService);
//# sourceMappingURL=tracking.service.js.map