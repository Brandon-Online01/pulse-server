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
exports.CheckInsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("typeorm");
const check_in_entity_1 = require("./entities/check-in.entity");
const typeorm_2 = require("@nestjs/typeorm");
const date_fns_1 = require("date-fns");
const rewards_service_1 = require("../rewards/rewards.service");
const constants_1 = require("../lib/constants/constants");
const constants_2 = require("../lib/constants/constants");
const user_entity_1 = require("../user/entities/user.entity");
let CheckInsService = class CheckInsService {
    constructor(checkInRepository, rewardsService, userRepository) {
        this.checkInRepository = checkInRepository;
        this.rewardsService = rewardsService;
        this.userRepository = userRepository;
    }
    async checkIn(createCheckInDto) {
        try {
            if (!createCheckInDto?.owner) {
                throw new common_1.BadRequestException(process.env.NOT_FOUND_MESSAGE);
            }
            if (!createCheckInDto?.branch) {
                throw new common_1.BadRequestException(process.env.NOT_FOUND_MESSAGE);
            }
            const ownerInformation = await this.userRepository.findOne({
                where: {
                    uid: createCheckInDto?.owner?.uid,
                },
                relations: ['organisation'],
            });
            if (!ownerInformation?.organisation) {
                throw new common_1.BadRequestException('User organization not found');
            }
            await this.checkInRepository.save({
                ...createCheckInDto,
                organization: {
                    uid: ownerInformation.organisation.uid,
                },
            });
            const response = {
                message: process.env.SUCCESS_MESSAGE,
            };
            await this.rewardsService.awardXP({
                owner: createCheckInDto.owner.uid,
                amount: constants_2.XP_VALUES.CHECK_IN_CLIENT,
                action: constants_1.XP_VALUES_TYPES.CHECK_IN_CLIENT,
                source: {
                    id: String(createCheckInDto.owner),
                    type: constants_1.XP_VALUES_TYPES.CHECK_IN_CLIENT,
                    details: 'Check-in reward',
                },
            });
            return response;
        }
        catch (error) {
            const response = {
                message: error?.message,
            };
            return response;
        }
    }
    async checkOut(createCheckOutDto) {
        try {
            if (!createCheckOutDto?.owner) {
                throw new common_1.BadRequestException(process.env.NOT_FOUND_MESSAGE);
            }
            if (!createCheckOutDto?.branch) {
                throw new common_1.BadRequestException(process.env.NOT_FOUND_MESSAGE);
            }
            const checkIn = await this.checkInRepository.findOne({
                where: {
                    owner: {
                        uid: createCheckOutDto.owner.uid,
                    },
                },
                order: {
                    checkInTime: 'DESC',
                },
            });
            if (!checkIn) {
                throw new common_1.NotFoundException(process.env.NOT_FOUND_MESSAGE);
            }
            const checkOutTime = new Date(createCheckOutDto.checkOutTime);
            const checkInTime = new Date(checkIn.checkInTime);
            const minutesWorked = (0, date_fns_1.differenceInMinutes)(checkOutTime, checkInTime);
            const hoursWorked = (0, date_fns_1.differenceInHours)(checkOutTime, checkInTime);
            const remainingMinutes = minutesWorked % 60;
            const duration = `${hoursWorked}h ${remainingMinutes}m`;
            await this.checkInRepository.update(checkIn.uid, {
                checkOutTime: createCheckOutDto?.checkOutTime,
                checkOutPhoto: createCheckOutDto?.checkOutPhoto,
                checkOutLocation: createCheckOutDto?.checkOutLocation,
                duration: duration,
            });
            const response = {
                message: process.env.SUCCESS_MESSAGE,
            };
            await this.rewardsService.awardXP({
                owner: createCheckOutDto.owner.uid,
                amount: 10,
                action: 'CHECK_OUT',
                source: {
                    id: createCheckOutDto.owner.toString(),
                    type: 'check-in',
                    details: 'Check-out reward',
                },
            });
            return response;
        }
        catch (error) {
            const response = {
                message: error?.message,
            };
            return response;
        }
    }
    async checkInStatus(reference) {
        try {
            const [checkIn] = await this.checkInRepository.find({
                where: {
                    owner: {
                        uid: reference,
                    },
                },
                order: {
                    checkInTime: 'DESC',
                },
                relations: ['owner', 'client'],
            });
            if (!checkIn) {
                throw new common_1.NotFoundException('Check-in not found');
            }
            const nextAction = checkIn.checkInTime && checkIn.checkInLocation && !checkIn.checkOutTime ? 'checkOut' : 'checkIn';
            const response = {
                message: process.env.SUCCESS_MESSAGE,
                nextAction,
                checkedIn: nextAction === 'checkOut',
                ...checkIn,
            };
            return response;
        }
        catch (error) {
            const response = {
                message: error?.message,
                nextAction: 'Check In',
                checkedIn: false,
            };
            return response;
        }
    }
};
exports.CheckInsService = CheckInsService;
exports.CheckInsService = CheckInsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_2.InjectRepository)(check_in_entity_1.CheckIn)),
    __param(2, (0, typeorm_2.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_1.Repository,
        rewards_service_1.RewardsService,
        typeorm_1.Repository])
], CheckInsService);
//# sourceMappingURL=check-ins.service.js.map