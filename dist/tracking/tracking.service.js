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
let TrackingService = class TrackingService {
    constructor(trackingRepository) {
        this.trackingRepository = trackingRepository;
    }
    async create(createTrackingDto) {
        try {
            const tracking = this.trackingRepository.create(createTrackingDto);
            await this.trackingRepository.save(tracking);
            const response = {
                message: process.env.SUCCESS_MESSAGE,
                data: tracking
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