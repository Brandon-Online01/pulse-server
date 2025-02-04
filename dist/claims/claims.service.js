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
                    id: String(createClaimDto?.owner?.uid),
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
                owner: updateClaimDto?.owner?.uid,
                amount: constants_2.XP_VALUES.CLAIM,
                action: constants_1.XP_VALUES_TYPES.CLAIM,
                source: {
                    id: String(updateClaimDto?.owner?.uid),
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
    async getClaimsReport(filter) {
        try {
            const claims = await this.claimsRepository.find({
                where: {
                    ...filter,
                    isDeleted: false,
                    deletedAt: (0, typeorm_2.IsNull)(),
                    status: (0, typeorm_2.Not)(finance_enums_1.ClaimStatus.DELETED)
                },
                relations: ['owner', 'branch']
            });
            if (!claims) {
                throw new common_1.NotFoundException('No claims found for the specified period');
            }
            const groupedClaims = {
                paid: claims.filter(claim => claim.status === finance_enums_1.ClaimStatus.PAID),
                pending: claims.filter(claim => claim.status === finance_enums_1.ClaimStatus.PENDING),
                approved: claims.filter(claim => claim.status === finance_enums_1.ClaimStatus.APPROVED),
                declined: claims.filter(claim => claim.status === finance_enums_1.ClaimStatus.DECLINED)
            };
            const totalValue = claims.reduce((sum, claim) => sum + Number(claim.amount), 0);
            const totalClaims = claims.length;
            const approvedClaims = groupedClaims.approved.length;
            const avgProcessingTime = this.calculateAverageProcessingTime(claims);
            const categoryBreakdown = this.analyzeCategoryBreakdown(claims);
            const topClaimants = this.analyzeTopClaimants(claims);
            return {
                ...groupedClaims,
                total: totalClaims,
                totalValue,
                metrics: {
                    totalClaims,
                    averageClaimValue: totalValue / totalClaims || 0,
                    approvalRate: `${((approvedClaims / totalClaims) * 100).toFixed(1)}%`,
                    averageProcessingTime: `${avgProcessingTime} days`,
                    categoryBreakdown,
                    topClaimants,
                    claimValueDistribution: this.analyzeClaimValueDistribution(claims),
                    monthlyTrends: this.analyzeMonthlyTrends(claims),
                    branchPerformance: this.analyzeBranchPerformance(claims)
                }
            };
        }
        catch (error) {
            return null;
        }
    }
    calculateAverageProcessingTime(claims) {
        const processedClaims = claims.filter(claim => claim.status === finance_enums_1.ClaimStatus.PAID ||
            claim.status === finance_enums_1.ClaimStatus.APPROVED ||
            claim.status === finance_enums_1.ClaimStatus.DECLINED);
        if (processedClaims.length === 0)
            return 0;
        const totalProcessingTime = processedClaims.reduce((sum, claim) => {
            const processingTime = claim.updatedAt.getTime() - claim.createdAt.getTime();
            return sum + processingTime;
        }, 0);
        return Number((totalProcessingTime / (processedClaims.length * 24 * 60 * 60 * 1000)).toFixed(1));
    }
    analyzeCategoryBreakdown(claims) {
        const categoryStats = new Map();
        claims.forEach(claim => {
            if (!categoryStats.has(claim.category)) {
                categoryStats.set(claim.category, {
                    count: 0,
                    totalValue: 0
                });
            }
            const stats = categoryStats.get(claim.category);
            stats.count++;
            stats.totalValue += Number(claim.amount);
        });
        return Array.from(categoryStats.entries())
            .map(([category, stats]) => ({
            category,
            count: stats.count,
            totalValue: this.formatCurrency(stats.totalValue),
            averageValue: this.formatCurrency(stats.totalValue / stats.count)
        }))
            .sort((a, b) => b.count - a.count);
    }
    analyzeTopClaimants(claims) {
        const claimantStats = new Map();
        claims.forEach(claim => {
            const userId = claim.owner?.uid;
            const userName = claim.owner?.username;
            if (userId && userName) {
                if (!claimantStats.has(userId)) {
                    claimantStats.set(userId, {
                        name: userName,
                        claims: 0,
                        totalValue: 0,
                        approved: 0
                    });
                }
                const stats = claimantStats.get(userId);
                stats.claims++;
                stats.totalValue += Number(claim.amount);
                if (claim.status === finance_enums_1.ClaimStatus.APPROVED || claim.status === finance_enums_1.ClaimStatus.PAID) {
                    stats.approved++;
                }
            }
        });
        return Array.from(claimantStats.entries())
            .map(([userId, stats]) => ({
            userId,
            userName: stats.name,
            totalClaims: stats.claims,
            totalValue: this.formatCurrency(stats.totalValue),
            approvalRate: `${((stats.approved / stats.claims) * 100).toFixed(1)}%`
        }))
            .sort((a, b) => b.totalClaims - a.totalClaims)
            .slice(0, 10);
    }
    analyzeClaimValueDistribution(claims) {
        const ranges = {
            'Under 1000': 0,
            '1000-5000': 0,
            '5000-10000': 0,
            '10000-50000': 0,
            'Over 50000': 0
        };
        claims.forEach(claim => {
            const amount = Number(claim.amount);
            if (amount < 1000)
                ranges['Under 1000']++;
            else if (amount < 5000)
                ranges['1000-5000']++;
            else if (amount < 10000)
                ranges['5000-10000']++;
            else if (amount < 50000)
                ranges['10000-50000']++;
            else
                ranges['Over 50000']++;
        });
        return ranges;
    }
    analyzeMonthlyTrends(claims) {
        const monthlyStats = new Map();
        claims.forEach(claim => {
            const month = claim.createdAt.toISOString().slice(0, 7);
            if (!monthlyStats.has(month)) {
                monthlyStats.set(month, {
                    claims: 0,
                    totalValue: 0,
                    approved: 0
                });
            }
            const stats = monthlyStats.get(month);
            stats.claims++;
            stats.totalValue += Number(claim.amount);
            if (claim.status === finance_enums_1.ClaimStatus.APPROVED || claim.status === finance_enums_1.ClaimStatus.PAID) {
                stats.approved++;
            }
        });
        return Array.from(monthlyStats.entries())
            .map(([month, stats]) => ({
            month,
            totalClaims: stats.claims,
            totalValue: this.formatCurrency(stats.totalValue),
            approvalRate: `${((stats.approved / stats.claims) * 100).toFixed(1)}%`
        }))
            .sort((a, b) => a.month.localeCompare(b.month));
    }
    analyzeBranchPerformance(claims) {
        const branchStats = new Map();
        claims.forEach(claim => {
            const branchId = claim.branch?.uid;
            const branchName = claim.branch?.name;
            if (branchId && branchName) {
                if (!branchStats.has(branchId)) {
                    branchStats.set(branchId, {
                        name: branchName,
                        claims: 0,
                        totalValue: 0,
                        approved: 0,
                        totalProcessingTime: 0,
                        processedClaims: 0
                    });
                }
                const stats = branchStats.get(branchId);
                stats.claims++;
                stats.totalValue += Number(claim.amount);
                if (claim.status === finance_enums_1.ClaimStatus.APPROVED || claim.status === finance_enums_1.ClaimStatus.PAID) {
                    stats.approved++;
                }
                if (claim.status !== finance_enums_1.ClaimStatus.PENDING) {
                    stats.processedClaims++;
                    stats.totalProcessingTime +=
                        claim.updatedAt.getTime() - claim.createdAt.getTime();
                }
            }
        });
        return Array.from(branchStats.entries())
            .map(([branchId, stats]) => ({
            branchId,
            branchName: stats.name,
            totalClaims: stats.claims,
            totalValue: this.formatCurrency(stats.totalValue),
            averageProcessingTime: `${(stats.processedClaims > 0
                ? stats.totalProcessingTime / (stats.processedClaims * 24 * 60 * 60 * 1000)
                : 0).toFixed(1)} days`,
            approvalRate: `${((stats.approved / stats.claims) * 100).toFixed(1)}%`
        }))
            .sort((a, b) => b.totalClaims - a.totalClaims);
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