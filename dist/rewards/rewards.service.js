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
exports.RewardsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const user_rewards_entity_1 = require("./entities/user-rewards.entity");
const xp_transaction_entity_1 = require("./entities/xp-transaction.entity");
const constants_1 = require("../lib/constants/constants");
let RewardsService = class RewardsService {
    constructor(userRewardsRepository, xpTransactionRepository) {
        this.userRewardsRepository = userRewardsRepository;
        this.xpTransactionRepository = xpTransactionRepository;
    }
    async awardXP(createRewardDto) {
        try {
            let userRewards = await this.userRewardsRepository.findOne({
                where: { owner: { uid: createRewardDto.owner } }
            });
            if (!userRewards) {
                userRewards = this.userRewardsRepository.create({
                    owner: { uid: createRewardDto.owner },
                    xpBreakdown: {
                        tasks: 0,
                        leads: 0,
                        sales: 0,
                        attendance: 0,
                        collaboration: 0,
                        other: 0
                    }
                });
                userRewards = await this.userRewardsRepository.save(userRewards);
            }
            const transaction = this.xpTransactionRepository.create({
                userRewards,
                action: createRewardDto.action,
                xpAmount: createRewardDto.amount,
                metadata: {
                    sourceId: createRewardDto.source.id,
                    sourceType: createRewardDto.source.type,
                    details: createRewardDto.source.details
                }
            });
            await this.xpTransactionRepository.save(transaction);
            const category = this.mapSourceTypeToCategory(createRewardDto.source.type);
            userRewards.xpBreakdown[category] += createRewardDto.amount;
            userRewards.currentXP += createRewardDto.amount;
            userRewards.totalXP += createRewardDto.amount;
            const newLevel = this.calculateLevel(userRewards.totalXP);
            if (newLevel > userRewards.level) {
                userRewards.level = newLevel;
                userRewards.rank = this.calculateRank(newLevel);
            }
            await this.userRewardsRepository.save(userRewards);
            return {
                message: process.env.SUCCESS_MESSAGE,
                data: userRewards
            };
        }
        catch (error) {
            return {
                message: error?.message,
                data: null
            };
        }
    }
    mapSourceTypeToCategory(sourceType) {
        const mapping = {
            login: 'login',
            task: 'task',
            subtask: 'subtask',
            lead: 'lead',
            sale: 'sale',
            collaboration: 'collaboration',
            attendance: 'attendance',
            'check-in-client': 'check-in-client',
            'check-out-client': 'check-out-client',
            claim: 'claim',
            journal: 'journal',
            notification: 'notification'
        };
        return mapping[sourceType] || 'other';
    }
    calculateLevel(xp) {
        for (const [level, range] of Object.entries(constants_1.LEVELS)) {
            if (xp >= range?.min && xp <= range?.max) {
                return parseInt(level);
            }
        }
        return 1;
    }
    calculateRank(level) {
        for (const [rank, range] of Object.entries(constants_1.RANKS)) {
            if (level >= range?.levels[0] && level <= range?.levels[1]) {
                return rank;
            }
        }
        return 'ROOKIE';
    }
    async getUserRewards(reference) {
        try {
            const userRewards = await this.userRewardsRepository.findOne({
                where: {
                    owner: { uid: reference }
                },
                relations: ['xpTransactions', 'achievements', 'inventory']
            });
            if (!userRewards) {
                throw new common_1.NotFoundException(process.env.NOT_FOUND_MESSAGE);
            }
            const response = {
                message: process.env.SUCCESS_MESSAGE,
                data: userRewards
            };
            return response;
        }
        catch (error) {
            const response = {
                message: error?.message,
                data: null
            };
            return response;
        }
    }
    async getLeaderboard() {
        try {
            const leaderboard = await this.userRewardsRepository.find({
                relations: ['user'],
                order: {
                    totalXP: 'DESC'
                },
                take: 10
            });
            const response = {
                message: process.env.SUCCESS_MESSAGE,
                data: leaderboard.map(entry => ({
                    owner: { uid: entry?.owner?.uid },
                    username: entry?.owner?.username,
                    totalXP: entry?.totalXP,
                    level: entry?.level,
                    rank: entry?.rank
                }))
            };
            return response;
        }
        catch (error) {
            const response = {
                message: error?.message,
                data: null
            };
            return response;
        }
    }
};
exports.RewardsService = RewardsService;
exports.RewardsService = RewardsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_rewards_entity_1.UserRewards)),
    __param(1, (0, typeorm_1.InjectRepository)(xp_transaction_entity_1.XPTransaction)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], RewardsService);
//# sourceMappingURL=rewards.service.js.map