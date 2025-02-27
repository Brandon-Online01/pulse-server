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
exports.TrackingController = void 0;
const common_1 = require("@nestjs/common");
const tracking_service_1 = require("./tracking.service");
const create_tracking_dto_1 = require("./dto/create-tracking.dto");
const jwt_1 = require("@nestjs/jwt");
const swagger_1 = require("@nestjs/swagger");
const role_decorator_1 = require("../decorators/role.decorator");
const public_decorator_1 = require("../decorators/public.decorator");
const user_enums_1 = require("../lib/enums/user.enums");
const auth_guard_1 = require("../guards/auth.guard");
let TrackingController = class TrackingController {
    constructor(trackingService, jwtService) {
        this.trackingService = trackingService;
        this.jwtService = jwtService;
    }
    create(createTrackingDto, req) {
        let userId = createTrackingDto.owner;
        let branchId = null;
        let orgId = null;
        try {
            const authHeader = req.headers.authorization;
            if (authHeader && authHeader.startsWith('Bearer ')) {
                const token = authHeader.substring(7);
                const decodedToken = this.jwtService.decode(token);
                if (decodedToken) {
                    if (decodedToken['uid']) {
                        userId = parseInt(decodedToken['uid'], 10);
                    }
                    if (decodedToken['branch'] && decodedToken['branch'].uid) {
                        branchId = decodedToken['branch'].uid;
                    }
                    if (decodedToken['organisationRef']) {
                        orgId = decodedToken['organisationRef'];
                    }
                }
            }
        }
        catch (error) {
        }
        createTrackingDto.owner = userId;
        return this.trackingService.create(createTrackingDto, branchId, orgId);
    }
    createStopEvent(stopData, req) {
        return this.trackingService.createStopEvent(stopData, req.user.uid);
    }
    findAll() {
        return this.trackingService.findAll();
    }
    getUserStops(req) {
        return this.trackingService.getUserStops(req.user.uid);
    }
    findOne(ref) {
        return this.trackingService.findOne(ref);
    }
    trackingByUser(ref) {
        return this.trackingService.trackingByUser(ref);
    }
    getDailyTracking(ref) {
        return this.trackingService.getDailyTracking(ref);
    }
    restore(ref) {
        return this.trackingService.restore(ref);
    }
    remove(ref) {
        return this.trackingService.remove(ref);
    }
    createDeviceTracking(deviceData, req) {
        let userId = deviceData.owner;
        let branchId = null;
        let orgId = null;
        try {
            const authHeader = req.headers.authorization;
            if (authHeader && authHeader.startsWith('Bearer ')) {
                const token = authHeader.substring(7);
                const decodedToken = this.jwtService.decode(token);
                if (decodedToken) {
                    if (decodedToken['uid']) {
                        userId = parseInt(decodedToken['uid'], 10);
                        if (!deviceData.owner) {
                            deviceData.owner = userId;
                        }
                    }
                    if (decodedToken['branch'] && decodedToken['branch'].uid) {
                        branchId = decodedToken['branch'].uid;
                    }
                    if (decodedToken['organisationRef']) {
                        orgId = decodedToken['organisationRef'];
                    }
                }
            }
        }
        catch (error) {
        }
        if (!deviceData.owner) {
            return {
                message: 'Owner ID is required',
                tracking: null,
                warnings: [{ type: 'VALIDATION_ERROR', message: 'Owner ID is required' }],
            };
        }
        if (!deviceData.coords || !deviceData.coords.latitude || !deviceData.coords.longitude) {
            return {
                message: 'Valid coordinates are required',
                tracking: null,
                warnings: [{ type: 'VALIDATION_ERROR', message: 'Valid coordinates are required' }],
            };
        }
        const createTrackingDto = {
            owner: deviceData.owner,
            latitude: deviceData.coords.latitude,
            longitude: deviceData.coords.longitude,
            accuracy: deviceData.coords.accuracy,
            altitude: deviceData.coords.altitude,
            altitudeAccuracy: deviceData.coords.altitudeAccuracy,
            heading: deviceData.coords.heading,
            speed: deviceData.coords.speed,
            timestamp: deviceData.timestamp,
            batteryLevel: deviceData.batteryLevel,
            batteryState: deviceData.batteryState,
            brand: deviceData.brand,
            manufacturer: deviceData.manufacturer,
            modelID: deviceData.modelID,
            modelName: deviceData.modelName,
            osName: deviceData.osName,
            osVersion: deviceData.osVersion,
            network: deviceData.network,
        };
        const response = this.trackingService.create(createTrackingDto, branchId, orgId);
        return {
            ...response,
            geofenceInfo: 'Geofence checking is being processed asynchronously',
        };
    }
};
exports.TrackingController = TrackingController;
__decorate([
    (0, common_1.Post)(),
    (0, public_decorator_1.isPublic)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Create a new tracking record',
        description: 'Creates a new GPS tracking record with the provided data. This endpoint is public and does not require authentication.',
    }),
    (0, swagger_1.ApiBody)({ type: create_tracking_dto_1.CreateTrackingDto }),
    (0, swagger_1.ApiCreatedResponse)({
        description: 'Tracking record created successfully',
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string', example: 'Success' },
                data: {
                    type: 'object',
                    properties: {
                        uid: { type: 'number', example: 1 },
                        latitude: { type: 'number', example: -33.9249 },
                        longitude: { type: 'number', example: 18.4241 },
                        accuracy: { type: 'number', example: 10.5 },
                        altitude: { type: 'number', example: 100.2 },
                        speed: { type: 'number', example: 5.7 },
                        timestamp: { type: 'number', example: 1625097600000 },
                        trackingRef: { type: 'string', example: 'TRK123456' },
                        createdAt: { type: 'string', format: 'date-time' },
                        updatedAt: { type: 'string', format: 'date-time' },
                    },
                },
            },
        },
    }),
    (0, swagger_1.ApiBadRequestResponse)({ description: 'Invalid input data provided' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_tracking_dto_1.CreateTrackingDto, Object]),
    __metadata("design:returntype", void 0)
], TrackingController.prototype, "create", null);
__decorate([
    (0, common_1.Post)('stops'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Record a stop event',
        description: 'Records a stop event with location, duration, and address information. Requires authentication.',
    }),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                latitude: { type: 'number', example: -33.9249 },
                longitude: { type: 'number', example: 18.4241 },
                startTime: { type: 'number', example: 1625097600000 },
                endTime: { type: 'number', example: 1625098500000 },
                duration: { type: 'number', example: 900 },
                address: { type: 'string', example: '123 Main St, Cape Town, South Africa' },
            },
            required: ['latitude', 'longitude', 'startTime', 'endTime', 'duration'],
        },
    }),
    (0, swagger_1.ApiCreatedResponse)({
        description: 'Stop event recorded successfully',
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string', example: 'Success' },
                data: {
                    type: 'object',
                    properties: {
                        uid: { type: 'number', example: 1 },
                        latitude: { type: 'number', example: -33.9249 },
                        longitude: { type: 'number', example: 18.4241 },
                        startTime: { type: 'number', example: 1625097600000 },
                        endTime: { type: 'number', example: 1625098500000 },
                        duration: { type: 'number', example: 900 },
                        address: { type: 'string', example: '123 Main St, Cape Town, South Africa' },
                        user: {
                            type: 'object',
                            properties: {
                                uid: { type: 'number', example: 1 },
                                name: { type: 'string', example: 'John Doe' },
                            },
                        },
                        createdAt: { type: 'string', format: 'date-time' },
                    },
                },
            },
        },
    }),
    (0, swagger_1.ApiBadRequestResponse)({ description: 'Invalid input data provided' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], TrackingController.prototype, "createStopEvent", null);
__decorate([
    (0, common_1.Get)(),
    (0, role_decorator_1.Roles)(user_enums_1.AccessLevel.ADMIN, user_enums_1.AccessLevel.MANAGER, user_enums_1.AccessLevel.SUPPORT, user_enums_1.AccessLevel.DEVELOPER, user_enums_1.AccessLevel.USER),
    (0, swagger_1.ApiOperation)({
        summary: 'Get all tracking records',
        description: 'Retrieves all GPS tracking records. Accessible by all authenticated users with appropriate roles.',
    }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Tracking records retrieved successfully',
        schema: {
            type: 'object',
            properties: {
                data: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            uid: { type: 'number', example: 1 },
                            latitude: { type: 'number', example: -33.9249 },
                            longitude: { type: 'number', example: 18.4241 },
                            accuracy: { type: 'number', example: 10.5 },
                            altitude: { type: 'number', example: 100.2 },
                            speed: { type: 'number', example: 5.7 },
                            timestamp: { type: 'number', example: 1625097600000 },
                            trackingRef: { type: 'string', example: 'TRK123456' },
                            createdAt: { type: 'string', format: 'date-time' },
                            updatedAt: { type: 'string', format: 'date-time' },
                            isDeleted: { type: 'boolean', example: false },
                        },
                    },
                },
                message: { type: 'string', example: 'Success' },
                meta: {
                    type: 'object',
                    properties: {
                        total: { type: 'number', example: 100 },
                    },
                },
            },
        },
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], TrackingController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('stops'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Get all stops for the current user',
        description: 'Retrieves all stop events for the authenticated user. Requires authentication.',
    }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Stop events retrieved successfully',
        schema: {
            type: 'object',
            properties: {
                data: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            uid: { type: 'number', example: 1 },
                            latitude: { type: 'number', example: -33.9249 },
                            longitude: { type: 'number', example: 18.4241 },
                            startTime: { type: 'number', example: 1625097600000 },
                            endTime: { type: 'number', example: 1625098500000 },
                            duration: { type: 'number', example: 900 },
                            address: { type: 'string', example: '123 Main St, Cape Town, South Africa' },
                            createdAt: { type: 'string', format: 'date-time' },
                        },
                    },
                },
                message: { type: 'string', example: 'Success' },
            },
        },
    }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], TrackingController.prototype, "getUserStops", null);
__decorate([
    (0, common_1.Get)(':ref'),
    (0, role_decorator_1.Roles)(user_enums_1.AccessLevel.ADMIN, user_enums_1.AccessLevel.MANAGER, user_enums_1.AccessLevel.SUPPORT, user_enums_1.AccessLevel.DEVELOPER, user_enums_1.AccessLevel.USER),
    (0, swagger_1.ApiOperation)({
        summary: 'Get a tracking record by reference code',
        description: 'Retrieves a specific GPS tracking record by its reference code. Accessible by all authenticated users with appropriate roles.',
    }),
    (0, swagger_1.ApiParam)({
        name: 'ref',
        description: 'Tracking reference code',
        type: 'number',
        example: 1,
    }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Tracking record found',
        schema: {
            type: 'object',
            properties: {
                data: {
                    type: 'object',
                    properties: {
                        uid: { type: 'number', example: 1 },
                        latitude: { type: 'number', example: -33.9249 },
                        longitude: { type: 'number', example: 18.4241 },
                        accuracy: { type: 'number', example: 10.5 },
                        altitude: { type: 'number', example: 100.2 },
                        speed: { type: 'number', example: 5.7 },
                        timestamp: { type: 'number', example: 1625097600000 },
                        trackingRef: { type: 'string', example: 'TRK123456' },
                        createdAt: { type: 'string', format: 'date-time' },
                        updatedAt: { type: 'string', format: 'date-time' },
                        isDeleted: { type: 'boolean', example: false },
                        user: {
                            type: 'object',
                            properties: {
                                uid: { type: 'number', example: 1 },
                                name: { type: 'string', example: 'John Doe' },
                                email: { type: 'string', example: 'john.doe@example.com' },
                            },
                        },
                    },
                },
                message: { type: 'string', example: 'Success' },
            },
        },
    }),
    (0, swagger_1.ApiNotFoundResponse)({ description: 'Tracking record not found' }),
    __param(0, (0, common_1.Param)('ref')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], TrackingController.prototype, "findOne", null);
__decorate([
    (0, common_1.Get)('for/:ref'),
    (0, role_decorator_1.Roles)(user_enums_1.AccessLevel.ADMIN, user_enums_1.AccessLevel.MANAGER, user_enums_1.AccessLevel.SUPPORT, user_enums_1.AccessLevel.DEVELOPER, user_enums_1.AccessLevel.USER),
    (0, swagger_1.ApiOperation)({
        summary: 'Get tracking by user reference code',
        description: 'Retrieves all GPS tracking records for a specific user. Accessible by all authenticated users with appropriate roles.',
    }),
    (0, swagger_1.ApiParam)({
        name: 'ref',
        description: 'User reference code',
        type: 'number',
        example: 1,
    }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Tracking records for user retrieved successfully',
        schema: {
            type: 'object',
            properties: {
                data: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            uid: { type: 'number', example: 1 },
                            latitude: { type: 'number', example: -33.9249 },
                            longitude: { type: 'number', example: 18.4241 },
                            accuracy: { type: 'number', example: 10.5 },
                            altitude: { type: 'number', example: 100.2 },
                            speed: { type: 'number', example: 5.7 },
                            timestamp: { type: 'number', example: 1625097600000 },
                            trackingRef: { type: 'string', example: 'TRK123456' },
                            createdAt: { type: 'string', format: 'date-time' },
                            updatedAt: { type: 'string', format: 'date-time' },
                        },
                    },
                },
                message: { type: 'string', example: 'Success' },
                meta: {
                    type: 'object',
                    properties: {
                        total: { type: 'number', example: 50 },
                    },
                },
            },
        },
    }),
    (0, swagger_1.ApiNotFoundResponse)({ description: 'User not found or has no tracking records' }),
    __param(0, (0, common_1.Param)('ref')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], TrackingController.prototype, "trackingByUser", null);
__decorate([
    (0, common_1.Get)('daily/:ref'),
    (0, role_decorator_1.Roles)(user_enums_1.AccessLevel.ADMIN, user_enums_1.AccessLevel.MANAGER, user_enums_1.AccessLevel.SUPPORT, user_enums_1.AccessLevel.DEVELOPER, user_enums_1.AccessLevel.USER),
    (0, swagger_1.ApiOperation)({
        summary: 'Get daily tracking summary for a user',
        description: 'Retrieves a daily summary of GPS tracking data for a specific user. Accessible by all authenticated users with appropriate roles.',
    }),
    (0, swagger_1.ApiParam)({
        name: 'ref',
        description: 'User ID',
        type: 'number',
        example: 1,
    }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Daily tracking summary retrieved successfully',
        schema: {
            type: 'object',
            properties: {
                data: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            date: { type: 'string', example: '2023-07-01' },
                            totalDistance: { type: 'number', example: 15.7 },
                            totalDuration: { type: 'number', example: 7200 },
                            averageSpeed: { type: 'number', example: 35.5 },
                            stops: { type: 'number', example: 5 },
                            points: {
                                type: 'array',
                                items: {
                                    type: 'object',
                                    properties: {
                                        latitude: { type: 'number', example: -33.9249 },
                                        longitude: { type: 'number', example: 18.4241 },
                                        timestamp: { type: 'number', example: 1625097600000 },
                                    },
                                },
                            },
                        },
                    },
                },
                message: { type: 'string', example: 'Success' },
            },
        },
    }),
    (0, swagger_1.ApiNotFoundResponse)({ description: 'User not found or has no tracking data' }),
    __param(0, (0, common_1.Param)('ref')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], TrackingController.prototype, "getDailyTracking", null);
__decorate([
    (0, common_1.Patch)('/restore/:ref'),
    (0, role_decorator_1.Roles)(user_enums_1.AccessLevel.ADMIN, user_enums_1.AccessLevel.MANAGER, user_enums_1.AccessLevel.SUPPORT, user_enums_1.AccessLevel.DEVELOPER, user_enums_1.AccessLevel.USER),
    (0, swagger_1.ApiOperation)({
        summary: 'Restore a deleted tracking record by reference code',
        description: 'Restores a previously deleted GPS tracking record. Accessible by all authenticated users with appropriate roles.',
    }),
    (0, swagger_1.ApiParam)({
        name: 'ref',
        description: 'Tracking reference code',
        type: 'number',
        example: 1,
    }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Tracking record restored successfully',
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string', example: 'Success' },
            },
        },
    }),
    (0, swagger_1.ApiNotFoundResponse)({ description: 'Tracking record not found' }),
    __param(0, (0, common_1.Param)('ref')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], TrackingController.prototype, "restore", null);
__decorate([
    (0, common_1.Delete)(':ref'),
    (0, role_decorator_1.Roles)(user_enums_1.AccessLevel.ADMIN, user_enums_1.AccessLevel.MANAGER, user_enums_1.AccessLevel.SUPPORT, user_enums_1.AccessLevel.DEVELOPER, user_enums_1.AccessLevel.USER),
    (0, swagger_1.ApiOperation)({
        summary: 'Soft delete a tracking record by reference code',
        description: 'Performs a soft delete on a GPS tracking record. Accessible by all authenticated users with appropriate roles.',
    }),
    (0, swagger_1.ApiParam)({
        name: 'ref',
        description: 'Tracking reference code',
        type: 'number',
        example: 1,
    }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Tracking record deleted successfully',
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string', example: 'Success' },
            },
        },
    }),
    (0, swagger_1.ApiNotFoundResponse)({ description: 'Tracking record not found' }),
    __param(0, (0, common_1.Param)('ref')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], TrackingController.prototype, "remove", null);
__decorate([
    (0, common_1.Post)('device-tracking'),
    (0, public_decorator_1.isPublic)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Create a tracking record from device data',
        description: 'Creates a new GPS tracking record from device data. This endpoint accepts the new data format with device information and checks for geofence events.',
    }),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                batteryLevel: { type: 'number', example: -1 },
                batteryState: { type: 'number', example: 0 },
                brand: { type: 'string', example: 'Apple' },
                coords: {
                    type: 'object',
                    properties: {
                        accuracy: { type: 'number', example: 5 },
                        altitude: { type: 'number', example: 0 },
                        altitudeAccuracy: { type: 'number', example: -1 },
                        heading: { type: 'number', example: -1 },
                        latitude: { type: 'number', example: 37.785834 },
                        longitude: { type: 'number', example: -122.406417 },
                        speed: { type: 'number', example: -1 },
                    },
                },
                manufacturer: { type: 'string', example: 'Apple' },
                modelID: { type: 'string', example: 'arm64' },
                modelName: { type: 'string', example: 'Simulator iOS' },
                network: {
                    type: 'object',
                    properties: {
                        ipAddress: { type: 'string', example: '192.168.0.189' },
                        state: {
                            type: 'object',
                            properties: {
                                isConnected: { type: 'boolean', example: true },
                                isInternetReachable: { type: 'boolean', example: true },
                                type: { type: 'string', example: 'WIFI' },
                            },
                        },
                    },
                },
                osName: { type: 'string', example: 'iOS' },
                osVersion: { type: 'string', example: '18.1' },
                timestamp: { type: 'number', example: 1740670776637 },
                owner: { type: 'number', example: 1 },
            },
            required: ['coords', 'owner'],
        },
    }),
    (0, swagger_1.ApiCreatedResponse)({
        description: 'Device tracking record created successfully',
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string', example: 'Success' },
                data: {
                    type: 'object',
                    properties: {
                        uid: { type: 'number', example: 1 },
                        latitude: { type: 'number', example: 37.785834 },
                        longitude: { type: 'number', example: -122.406417 },
                        accuracy: { type: 'number', example: 5 },
                        altitude: { type: 'number', example: 0 },
                        speed: { type: 'number', example: -1 },
                        timestamp: { type: 'number', example: 1740670776637 },
                        createdAt: { type: 'string', format: 'date-time' },
                        updatedAt: { type: 'string', format: 'date-time' },
                    },
                },
                geofenceInfo: {
                    type: 'string',
                    example: 'Geofence checking is being processed asynchronously',
                },
            },
        },
    }),
    (0, swagger_1.ApiBadRequestResponse)({ description: 'Invalid input data provided' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], TrackingController.prototype, "createDeviceTracking", null);
exports.TrackingController = TrackingController = __decorate([
    (0, swagger_1.ApiTags)('gps'),
    (0, common_1.Controller)('gps'),
    (0, swagger_1.ApiUnauthorizedResponse)({ description: 'Unauthorized access due to invalid credentials or missing token' }),
    __metadata("design:paramtypes", [tracking_service_1.TrackingService,
        jwt_1.JwtService])
], TrackingController);
//# sourceMappingURL=tracking.controller.js.map