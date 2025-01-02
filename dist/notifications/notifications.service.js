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
exports.NotificationsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const notification_entity_1 = require("./entities/notification.entity");
const date_fns_1 = require("date-fns");
const notification_enums_1 = require("../lib/enums/notification.enums");
const rewards_service_1 = require("../rewards/rewards.service");
const constants_1 = require("../lib/constants/constants");
const constants_2 = require("../lib/constants/constants");
let NotificationsService = class NotificationsService {
    constructor(notificationRepository, rewardsService) {
        this.notificationRepository = notificationRepository;
        this.rewardsService = rewardsService;
    }
    async create(createNotificationDto) {
        try {
            const notification = await this.notificationRepository.save(createNotificationDto);
            if (!notification) {
                throw new common_1.NotFoundException(process.env.NOT_FOUND_MESSAGE);
            }
            const response = {
                message: process.env.SUCCESS_MESSAGE,
            };
            return response;
        }
        catch (error) {
            const response = {
                message: error?.message,
            };
            return response;
        }
    }
    async findAll() {
        try {
            const notifications = await this.notificationRepository.find();
            if (!notifications) {
                throw new common_1.NotFoundException(process.env.NOT_FOUND_MESSAGE);
            }
            const response = {
                message: process.env.SUCCESS_MESSAGE,
                notifications: notifications
            };
            return response;
        }
        catch (error) {
            const response = {
                message: error?.message,
                notifications: null
            };
            return response;
        }
    }
    async findOne(ref) {
        try {
            const notification = await this.notificationRepository.findOne({ where: { uid: ref }, relations: ['owner'] });
            if (!notification) {
                throw new common_1.NotFoundException(process.env.NOT_FOUND_MESSAGE);
            }
            const response = {
                message: process.env.SUCCESS_MESSAGE,
                notification: notification
            };
            return response;
        }
        catch (error) {
            const response = {
                message: error?.message,
                notification: null
            };
            return response;
        }
    }
    async findForUser(ref) {
        try {
            const notifications = await this.notificationRepository.find({
                where: {
                    owner: {
                        uid: ref
                    },
                    status: (0, typeorm_2.Not)(notification_enums_1.NotificationStatus.ARCHIVED)
                }
            });
            if (!notifications.length) {
                throw new common_1.NotFoundException(process.env.NOT_FOUND_MESSAGE);
            }
            const response = {
                message: process.env.SUCCESS_MESSAGE,
                notification: notifications.map(notification => ({
                    ...notification,
                    createdAt: `${notification.createdAt}`,
                    updatedAt: `${notification.updatedAt}`,
                    recordAge: (0, date_fns_1.formatDistanceToNow)(new Date(notification.createdAt), { addSuffix: true }),
                    updateAge: (0, date_fns_1.formatDistanceToNow)(new Date(notification.updatedAt), { addSuffix: true })
                }))
            };
            return response;
        }
        catch (error) {
            const response = {
                message: error?.message,
                notification: null
            };
            return response;
        }
    }
    async update(ref, updateNotificationDto) {
        try {
            const notification = await this.notificationRepository.update(ref, updateNotificationDto);
            if (!notification) {
                throw new common_1.NotFoundException(process.env.NOT_FOUND_MESSAGE);
            }
            await this.rewardsService.awardXP({
                owner: updateNotificationDto.owner.uid,
                amount: constants_1.XP_VALUES.NOTIFICATION,
                action: constants_2.XP_VALUES_TYPES.NOTIFICATION,
                source: {
                    id: updateNotificationDto.owner.uid.toString(),
                    type: constants_2.XP_VALUES_TYPES.NOTIFICATION,
                    details: 'Notification reward'
                }
            });
            const response = {
                message: process.env.SUCCESS_MESSAGE,
            };
            return response;
        }
        catch (error) {
            const response = {
                message: error?.message,
            };
            return response;
        }
    }
    async remove(ref) {
        try {
            const notification = await this.notificationRepository.delete(ref);
            if (!notification) {
                throw new common_1.NotFoundException(process.env.NOT_FOUND_MESSAGE);
            }
            const response = {
                message: process.env.SUCCESS_MESSAGE,
            };
            return response;
        }
        catch (error) {
            const response = {
                message: error?.message,
            };
            return response;
        }
    }
};
exports.NotificationsService = NotificationsService;
exports.NotificationsService = NotificationsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(notification_entity_1.Notification)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        rewards_service_1.RewardsService])
], NotificationsService);
//# sourceMappingURL=notifications.service.js.map