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
exports.ClaimsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const claim_entity_1 = require("./entities/claim.entity");
const typeorm_2 = require("typeorm");
const event_emitter_1 = require("@nestjs/event-emitter");
const date_fns_1 = require("date-fns");
const date_fns_2 = require("date-fns");
const finance_enums_1 = require("../lib/enums/finance.enums");
const user_enums_1 = require("../lib/enums/user.enums");
const notification_enums_1 = require("../lib/enums/notification.enums");
const config_1 = require("@nestjs/config");
const rewards_service_1 = require("../rewards/rewards.service");
const constants_1 = require("../lib/constants/constants");
const constants_2 = require("../lib/constants/constants");
let ClaimsService = class ClaimsService {
    constructor(claimsRepository, rewardsService, eventEmitter, configService) {
        this.claimsRepository = claimsRepository;
        this.rewardsService = rewardsService;
        this.eventEmitter = eventEmitter;
        this.configService = configService;
        this.currencyLocale = this.configService.get('CURRENCY_LOCALE') || 'en-ZA';
        this.currencyCode = this.configService.get('CURRENCY_CODE') || 'ZAR';
        this.currencySymbol = this.configService.get('CURRENCY_SYMBOL') || 'R';
    }
    formatCurrency(amount) {
        return new Intl.NumberFormat(this.currencyLocale, {
            style: 'currency',
            currency: this.currencyCode
        })
            .format(amount)
            .replace(this.currencyCode, this.currencySymbol);
    }
    calculateStats(claims) {
        return {
            total: claims?.length || 0,
            pending: claims?.filter(claim => claim?.status === finance_enums_1.ClaimStatus.PENDING)?.length || 0,
            approved: claims?.filter(claim => claim?.status === finance_enums_1.ClaimStatus.APPROVED)?.length || 0,
            declined: claims?.filter(claim => claim?.status === finance_enums_1.ClaimStatus.DECLINED)?.length || 0,
            paid: claims?.filter(claim => claim?.status === finance_enums_1.ClaimStatus.PAID)?.length || 0,
        };
    }
    async create(createClaimDto) {
        try {
            const claim = await this.claimsRepository.save(createClaimDto);
            if (!claim) {
                throw new common_1.NotFoundException(process.env.CREATE_ERROR_MESSAGE);
            }
            const response = {
                message: process.env.SUCCESS_MESSAGE,
            };
            const notification = {
                type: notification_enums_1.NotificationType.USER,
                title: 'New Claim',
                message: `A new claim has been created`,
                status: notification_enums_1.NotificationStatus.UNREAD,
                owner: claim?.owner
            };
            const recipients = [user_enums_1.AccessLevel.ADMIN, user_enums_1.AccessLevel.MANAGER, user_enums_1.AccessLevel.OWNER, user_enums_1.AccessLevel.SUPERVISOR, user_enums_1.AccessLevel.USER];
            this.eventEmitter.emit('send.notification', notification, recipients);
            await this.rewardsService.awardXP({
                owner: createClaimDto.owner.uid,
                amount: constants_2.XP_VALUES.CLAIM,
                action: constants_1.XP_VALUES_TYPES.CLAIM,
                source: {
                    id: createClaimDto.owner.uid.toString(),
                    type: constants_1.XP_VALUES_TYPES.CLAIM,
                    details: 'Claim reward'
                }
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
    async findAll() {
        try {
            const claims = await this.claimsRepository.find({
                where: {
                    isDeleted: false,
                    deletedAt: (0, typeorm_2.IsNull)(),
                    status: (0, typeorm_2.Not)(finance_enums_1.ClaimStatus.DELETED)
                },
                relations: ['owner']
            });
            if (!claims) {
                throw new common_1.NotFoundException(process.env.SEARCH_ERROR_MESSAGE);
            }
            const formattedClaims = claims?.map(claim => ({
                ...claim,
                amount: this.formatCurrency(Number(claim?.amount) || 0)
            }));
            const stats = this.calculateStats(claims);
            const response = {
                stats: {
                    total: stats?.total,
                    pending: stats?.pending,
                    approved: stats?.approved,
                    declined: stats?.declined,
                    paid: stats?.paid,
                },
                claims: formattedClaims,
            };
            return {
                message: process.env.SUCCESS_MESSAGE,
                claims: formattedClaims,
                stats: response
            };
        }
        catch (error) {
            return {
                message: error?.message,
                claims: null,
                stats: null
            };
        }
    }
    async findOne(ref) {
        try {
            const claim = await this.claimsRepository.findOne({
                where: {
                    uid: ref,
                    isDeleted: false
                },
                relations: ['owner']
            });
            if (!claim) {
                throw new common_1.NotFoundException(process.env.SEARCH_ERROR_MESSAGE);
            }
            const allClaims = await this.claimsRepository.find();
            const stats = this.calculateStats(allClaims);
            const formattedClaim = {
                ...claim,
                amount: this.formatCurrency(Number(claim?.amount) || 0)
            };
            return {
                message: process.env.SUCCESS_MESSAGE,
                claim: formattedClaim,
                stats
            };
        }
        catch (error) {
            return {
                message: error?.message,
                claim: null,
                stats: null
            };
        }
    }
    async claimsByUser(ref) {
        try {
            const claims = await this.claimsRepository.find({
                where: { owner: { uid: ref, isDeleted: false } }
            });
            if (!claims) {
                throw new common_1.NotFoundException(process.env.NOT_FOUND_MESSAGE);
            }
            const formattedClaims = claims?.map(claim => ({
                ...claim,
                amount: this.formatCurrency(Number(claim?.amount) || 0)
            }));
            const stats = this.calculateStats(claims);
            return {
                message: process.env.SUCCESS_MESSAGE,
                claims: formattedClaims,
                stats
            };
        }
        catch (error) {
            return {
                message: `could not get claims by user - ${error?.message}`,
                claims: null,
                stats: null
            };
        }
    }
    async getClaimsForDate(date) {
        try {
            const claims = await this.claimsRepository.find({
                where: { createdAt: (0, typeorm_2.Between)((0, date_fns_2.startOfDay)(date), (0, date_fns_1.endOfDay)(date)) }
            });
            if (!claims) {
                throw new common_1.NotFoundException(process.env.NOT_FOUND_MESSAGE);
            }
            const groupedClaims = {
                pending: claims.filter(claim => claim.status === finance_enums_1.ClaimStatus.PENDING),
                approved: claims.filter(claim => claim.status === finance_enums_1.ClaimStatus.APPROVED),
                declined: claims.filter(claim => claim.status === finance_enums_1.ClaimStatus.DECLINED),
                paid: claims.filter(claim => claim.status === finance_enums_1.ClaimStatus.PAID),
            };
            return {
                message: process.env.SUCCESS_MESSAGE,
                claims: {
                    ...groupedClaims,
                    totalValue: this.formatCurrency(claims?.reduce((sum, claim) => sum + (Number(claim?.amount) || 0), 0))
                }
            };
        }
        catch (error) {
            return {
                message: error?.message,
                claims: null
            };
        }
    }
    async update(ref, updateClaimDto) {
        try {
            const claim = await this.claimsRepository.findOne({
                where: { uid: ref, isDeleted: false },
                relations: ['owner']
            });
            if (!claim) {
                throw new common_1.NotFoundException(process.env.SEARCH_ERROR_MESSAGE);
            }
            await this.claimsRepository.update(ref, updateClaimDto);
            const response = {
                message: process.env.SUCCESS_MESSAGE,
            };
            const notification = {
                type: notification_enums_1.NotificationType.USER,
                title: 'Claim Updated',
                message: `A claim has been updated`,
                status: notification_enums_1.NotificationStatus.UNREAD,
                owner: claim?.owner
            };
            const recipients = [user_enums_1.AccessLevel.ADMIN, user_enums_1.AccessLevel.MANAGER, user_enums_1.AccessLevel.OWNER, user_enums_1.AccessLevel.SUPERVISOR, user_enums_1.AccessLevel.USER];
            this.eventEmitter.emit('send.notification', notification, recipients);
            await this.rewardsService.awardXP({
                owner: updateClaimDto.owner.uid,
                amount: constants_2.XP_VALUES.CLAIM,
                action: constants_1.XP_VALUES_TYPES.CLAIM,
                source: {
                    id: updateClaimDto.owner.uid.toString(),
                    type: constants_1.XP_VALUES_TYPES.CLAIM,
                    details: 'Claim reward'
                }
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
    async remove(ref) {
        try {
            const claim = await this.claimsRepository.findOne({
                where: { uid: ref, isDeleted: false }
            });
            if (!claim) {
                throw new common_1.NotFoundException(process.env.DELETE_ERROR_MESSAGE);
            }
            ;
            await this.claimsRepository.update({ uid: ref }, { isDeleted: true });
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
    async restore(ref) {
        try {
            await this.claimsRepository.update({ uid: ref }, {
                isDeleted: false,
                status: finance_enums_1.ClaimStatus.DELETED
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
    async getTotalClaimsStats() {
        try {
            const claims = await this.claimsRepository.find({
                where: {
                    deletedAt: (0, typeorm_2.IsNull)(),
                    status: (0, typeorm_2.Not)(finance_enums_1.ClaimStatus.DELETED)
                }
            });
            const byCategory = {
                [finance_enums_1.ClaimCategory.GENERAL]: 0,
                [finance_enums_1.ClaimCategory.PROMOTION]: 0,
                [finance_enums_1.ClaimCategory.EVENT]: 0,
                [finance_enums_1.ClaimCategory.ANNOUNCEMENT]: 0,
                [finance_enums_1.ClaimCategory.OTHER]: 0,
                [finance_enums_1.ClaimCategory.HOTEL]: 0,
                [finance_enums_1.ClaimCategory.TRAVEL]: 0,
                [finance_enums_1.ClaimCategory.TRANSPORT]: 0,
                [finance_enums_1.ClaimCategory.OTHER_EXPENSES]: 0,
                [finance_enums_1.ClaimCategory.ACCOMMODATION]: 0,
                [finance_enums_1.ClaimCategory.MEALS]: 0,
                [finance_enums_1.ClaimCategory.TRANSPORTATION]: 0,
                [finance_enums_1.ClaimCategory.ENTERTAINMENT]: 0
            };
            claims.forEach(claim => {
                if (claim?.category)
                    byCategory[claim?.category]++;
            });
            return {
                totalClaims: claims.length,
                totalValue: this.formatCurrency(claims.reduce((sum, claim) => sum + (Number(claim.amount) || 0), 0)),
                byCategory
            };
        }
        catch (error) {
            return {
                totalClaims: 0,
                totalValue: this.formatCurrency(0),
                byCategory: {
                    [finance_enums_1.ClaimCategory.GENERAL]: 0,
                    [finance_enums_1.ClaimCategory.PROMOTION]: 0,
                    [finance_enums_1.ClaimCategory.EVENT]: 0,
                    [finance_enums_1.ClaimCategory.ANNOUNCEMENT]: 0,
                    [finance_enums_1.ClaimCategory.OTHER]: 0,
                    [finance_enums_1.ClaimCategory.HOTEL]: 0,
                    [finance_enums_1.ClaimCategory.TRAVEL]: 0,
                    [finance_enums_1.ClaimCategory.TRANSPORT]: 0,
                    [finance_enums_1.ClaimCategory.OTHER_EXPENSES]: 0,
                    [finance_enums_1.ClaimCategory.ACCOMMODATION]: 0,
                    [finance_enums_1.ClaimCategory.MEALS]: 0,
                    [finance_enums_1.ClaimCategory.TRANSPORTATION]: 0,
                    [finance_enums_1.ClaimCategory.ENTERTAINMENT]: 0
                }
            };
        }
    }
};
exports.ClaimsService = ClaimsService;
exports.ClaimsService = ClaimsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(claim_entity_1.Claim)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        rewards_service_1.RewardsService,
        event_emitter_1.EventEmitter2,
        config_1.ConfigService])
], ClaimsService);
//# sourceMappingURL=claims.service.js.map