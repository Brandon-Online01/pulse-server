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
exports.LeadsService = void 0;
const typeorm_1 = require("typeorm");
const typeorm_2 = require("@nestjs/typeorm");
const common_1 = require("@nestjs/common");
const lead_entity_1 = require("./entities/lead.entity");
const user_enums_1 = require("../lib/enums/user.enums");
const event_emitter_1 = require("@nestjs/event-emitter");
const date_fns_1 = require("date-fns");
const date_fns_2 = require("date-fns");
const notification_enums_1 = require("../lib/enums/notification.enums");
const lead_enums_1 = require("../lib/enums/lead.enums");
const rewards_service_1 = require("../rewards/rewards.service");
const constants_1 = require("../lib/constants/constants");
const constants_2 = require("../lib/constants/constants");
let LeadsService = class LeadsService {
    constructor(leadRepository, eventEmitter, rewardsService) {
        this.leadRepository = leadRepository;
        this.eventEmitter = eventEmitter;
        this.rewardsService = rewardsService;
    }
    async create(createLeadDto) {
        try {
            const lead = await this.leadRepository.save(createLeadDto);
            const response = {
                message: process.env.SUCCESS_MESSAGE,
                data: lead
            };
            await this.rewardsService.awardXP({
                owner: createLeadDto.owner.uid,
                amount: 10,
                action: 'LEAD',
                source: {
                    id: createLeadDto.owner.uid.toString(),
                    type: 'lead',
                    details: 'Lead reward'
                }
            });
            const notification = {
                type: notification_enums_1.NotificationType.USER,
                title: 'Lead Created',
                message: `A lead has been created`,
                status: notification_enums_1.NotificationStatus.UNREAD,
                owner: lead?.owner
            };
            const recipients = [user_enums_1.AccessLevel.ADMIN, user_enums_1.AccessLevel.MANAGER, user_enums_1.AccessLevel.OWNER, user_enums_1.AccessLevel.SUPERVISOR, user_enums_1.AccessLevel.USER];
            this.eventEmitter.emit('send.notification', notification, recipients);
            await this.rewardsService.awardXP({
                owner: createLeadDto.owner.uid,
                amount: constants_1.XP_VALUES.LEAD,
                action: constants_2.XP_VALUES_TYPES.LEAD,
                source: {
                    id: createLeadDto.owner.uid.toString(),
                    type: constants_2.XP_VALUES_TYPES.LEAD,
                    details: 'Lead reward'
                }
            });
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
    async findAll(filters, page = 1, limit = Number(process.env.DEFAULT_PAGE_LIMIT)) {
        try {
            const queryBuilder = this.leadRepository
                .createQueryBuilder('lead')
                .leftJoinAndSelect('lead.owner', 'owner')
                .leftJoinAndSelect('lead.branch', 'branch')
                .where('lead.isDeleted = :isDeleted', { isDeleted: false });
            if (filters?.status) {
                queryBuilder.andWhere('lead.status = :status', { status: filters.status });
            }
            if (filters?.search) {
                queryBuilder.andWhere('(lead.name ILIKE :search OR lead.email ILIKE :search OR lead.phone ILIKE :search)', { search: `%${filters.search}%` });
            }
            if (filters?.startDate && filters?.endDate) {
                queryBuilder.andWhere('lead.createdAt BETWEEN :startDate AND :endDate', {
                    startDate: filters.startDate,
                    endDate: filters.endDate
                });
            }
            queryBuilder
                .skip((page - 1) * limit)
                .take(limit)
                .orderBy('lead.createdAt', 'DESC');
            const [leads, total] = await queryBuilder.getManyAndCount();
            if (!leads) {
                throw new common_1.NotFoundException(process.env.NOT_FOUND_MESSAGE);
            }
            const stats = this.calculateStats(leads);
            return {
                data: leads,
                meta: {
                    total,
                    page,
                    limit,
                    totalPages: Math.ceil(total / limit),
                },
                message: process.env.SUCCESS_MESSAGE
            };
        }
        catch (error) {
            return {
                data: [],
                meta: {
                    total: 0,
                    page,
                    limit,
                    totalPages: 0,
                },
                message: error?.message
            };
        }
    }
    async findOne(ref) {
        try {
            const lead = await this.leadRepository.findOne({
                where: { uid: ref, isDeleted: false },
                relations: ['owner']
            });
            if (!lead) {
                return {
                    lead: null,
                    message: process.env.NOT_FOUND_MESSAGE,
                    stats: null
                };
            }
            const allLeads = await this.leadRepository.find();
            const stats = this.calculateStats(allLeads);
            const response = {
                lead: lead,
                message: process.env.SUCCESS_MESSAGE,
                stats
            };
            return response;
        }
        catch (error) {
            const response = {
                message: error?.message,
                lead: null,
                stats: null
            };
            return response;
        }
    }
    async leadsByUser(ref) {
        try {
            const leads = await this.leadRepository.find({
                where: { owner: { uid: ref } }
            });
            if (!leads) {
                throw new common_1.NotFoundException(process.env.NOT_FOUND_MESSAGE);
            }
            const stats = this.calculateStats(leads);
            const response = {
                message: process.env.SUCCESS_MESSAGE,
                leads,
                stats
            };
            return response;
        }
        catch (error) {
            const response = {
                message: `could not get leads by user - ${error?.message}`,
                leads: null,
                stats: null
            };
            return response;
        }
    }
    async update(ref, updateLeadDto) {
        try {
            await this.leadRepository.update(ref, updateLeadDto);
            const updatedLead = await this.leadRepository.findOne({
                where: { uid: ref, isDeleted: false },
                relations: ['owner']
            });
            if (!updatedLead) {
                return {
                    message: process.env.NOT_FOUND_MESSAGE,
                };
            }
            const response = {
                message: process.env.SUCCESS_MESSAGE,
            };
            const notification = {
                type: notification_enums_1.NotificationType.USER,
                title: 'Lead Updated',
                message: `A lead has been updated`,
                status: notification_enums_1.NotificationStatus.UNREAD,
                owner: updatedLead?.owner
            };
            const recipients = [user_enums_1.AccessLevel.ADMIN, user_enums_1.AccessLevel.MANAGER, user_enums_1.AccessLevel.OWNER, user_enums_1.AccessLevel.SUPERVISOR, user_enums_1.AccessLevel.USER];
            this.eventEmitter.emit('send.notification', notification, recipients);
            await this.rewardsService.awardXP({
                owner: updateLeadDto.owner.uid,
                amount: constants_1.XP_VALUES.LEAD,
                action: constants_2.XP_VALUES_TYPES.LEAD,
                source: {
                    id: updateLeadDto.owner.uid.toString(),
                    type: constants_2.XP_VALUES_TYPES.LEAD,
                    details: 'Lead reward'
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
            const lead = await this.leadRepository.findOne({
                where: { uid: ref, isDeleted: false }
            });
            if (!lead) {
                throw new common_1.NotFoundException(process.env.NOT_FOUND_MESSAGE);
            }
            ;
            await this.leadRepository.update({ uid: ref }, { isDeleted: true });
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
            await this.leadRepository.update({ uid: ref }, { isDeleted: false });
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
    calculateStats(leads) {
        return {
            total: leads?.length || 0,
            pending: leads?.filter(lead => lead?.status === lead_enums_1.LeadStatus.PENDING)?.length || 0,
            approved: leads?.filter(lead => lead?.status === lead_enums_1.LeadStatus.APPROVED)?.length || 0,
            inReview: leads?.filter(lead => lead?.status === lead_enums_1.LeadStatus.REVIEW)?.length || 0,
            declined: leads?.filter(lead => lead?.status === lead_enums_1.LeadStatus.DECLINED)?.length || 0,
        };
    }
    async getLeadsForDate(date) {
        try {
            const leads = await this.leadRepository.find({
                where: { createdAt: (0, typeorm_1.Between)((0, date_fns_2.startOfDay)(date), (0, date_fns_1.endOfDay)(date)) }
            });
            if (!leads) {
                throw new common_1.NotFoundException(process.env.NOT_FOUND_MESSAGE);
            }
            const groupedLeads = {
                pending: leads.filter(lead => lead.status === lead_enums_1.LeadStatus.PENDING),
                approved: leads.filter(lead => lead.status === lead_enums_1.LeadStatus.APPROVED),
                review: leads.filter(lead => lead.status === lead_enums_1.LeadStatus.REVIEW),
                declined: leads.filter(lead => lead.status === lead_enums_1.LeadStatus.DECLINED),
                total: leads?.length
            };
            const response = {
                message: process.env.SUCCESS_MESSAGE,
                leads: groupedLeads
            };
            return response;
        }
        catch (error) {
            const response = {
                message: error?.message,
                leads: null
            };
            return response;
        }
    }
    async getLeadsReport(filter) {
        try {
            const leads = await this.leadRepository.find({
                where: {
                    ...filter,
                    isDeleted: false
                },
                relations: ['owner', 'branch', 'client']
            });
            if (!leads) {
                throw new common_1.NotFoundException('No leads found for the specified period');
            }
            const groupedLeads = {
                review: leads.filter(lead => lead.status === lead_enums_1.LeadStatus.REVIEW),
                pending: leads.filter(lead => lead.status === lead_enums_1.LeadStatus.PENDING),
                approved: leads.filter(lead => lead.status === lead_enums_1.LeadStatus.APPROVED),
                declined: leads.filter(lead => lead.status === lead_enums_1.LeadStatus.DECLINED)
            };
            const totalLeads = leads.length;
            const approvedLeads = groupedLeads.approved.length;
            const avgResponseTime = this.calculateAverageResponseTime(leads);
            const sources = this.analyzeLeadSources(leads);
            const sourceEffectiveness = this.analyzeSourceEffectiveness(leads);
            const geographicDistribution = this.analyzeGeographicDistribution(leads);
            const leadQualityBySource = this.analyzeLeadQualityBySource(leads);
            const conversionTrends = this.analyzeConversionTrends(leads);
            const responseTimeDistribution = this.analyzeResponseTimeDistribution(leads);
            return {
                ...groupedLeads,
                total: totalLeads,
                metrics: {
                    conversionRate: `${((approvedLeads / totalLeads) * 100).toFixed(1)}%`,
                    averageResponseTime: `${avgResponseTime} hours`,
                    topSources: sources,
                    qualityScore: this.calculateQualityScore(leads),
                    sourceEffectiveness,
                    geographicDistribution,
                    leadQualityBySource,
                    conversionTrends,
                    responseTimeDistribution
                }
            };
        }
        catch (error) {
            return null;
        }
    }
    calculateAverageResponseTime(leads) {
        const respondedLeads = leads.filter(lead => lead.status === lead_enums_1.LeadStatus.APPROVED ||
            lead.status === lead_enums_1.LeadStatus.DECLINED);
        if (respondedLeads.length === 0)
            return 0;
        const totalResponseTime = respondedLeads.reduce((sum, lead) => {
            const responseTime = lead.updatedAt.getTime() - lead.createdAt.getTime();
            return sum + responseTime;
        }, 0);
        return Number((totalResponseTime / (respondedLeads.length * 60 * 60 * 1000)).toFixed(1));
    }
    analyzeLeadSources(leads) {
        const sourceCounts = leads.reduce((acc, lead) => {
            const source = lead.client?.category || 'Direct';
            acc[source] = (acc[source] || 0) + 1;
            return acc;
        }, {});
        return Object.entries(sourceCounts)
            .map(([source, count]) => ({ source, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);
    }
    calculateQualityScore(leads) {
        if (leads.length === 0)
            return 0;
        const approvedLeads = leads.filter(lead => lead.status === lead_enums_1.LeadStatus.APPROVED).length;
        const responseTimeScore = this.calculateAverageResponseTime(leads) < 24 ? 1 : 0.5;
        const conversionRate = approvedLeads / leads.length;
        const score = ((conversionRate * 0.6 + responseTimeScore * 0.4) * 100);
        return Number(score.toFixed(1));
    }
    analyzeSourceEffectiveness(leads) {
        const sourceStats = new Map();
        leads.forEach(lead => {
            const source = lead.client?.category || 'Direct';
            if (!sourceStats.has(source)) {
                sourceStats.set(source, {
                    total: 0,
                    converted: 0,
                    totalResponseTime: 0,
                    respondedLeads: 0,
                    qualityScores: []
                });
            }
            const stats = sourceStats.get(source);
            stats.total++;
            if (lead.status === lead_enums_1.LeadStatus.APPROVED) {
                stats.converted++;
            }
            if (lead.status !== lead_enums_1.LeadStatus.PENDING) {
                stats.respondedLeads++;
                stats.totalResponseTime += lead.updatedAt.getTime() - lead.createdAt.getTime();
            }
            stats.qualityScores.push(this.calculateIndividualLeadQualityScore(lead));
        });
        return Array.from(sourceStats.entries())
            .map(([source, stats]) => ({
            source,
            totalLeads: stats.total,
            convertedLeads: stats.converted,
            conversionRate: `${((stats.converted / stats.total) * 100).toFixed(1)}%`,
            averageResponseTime: `${(stats.respondedLeads > 0
                ? stats.totalResponseTime / (stats.respondedLeads * 60 * 60 * 1000)
                : 0).toFixed(1)} hours`,
            qualityScore: Number((stats.qualityScores.reduce((sum, score) => sum + score, 0) / stats.total).toFixed(1))
        }))
            .sort((a, b) => b.convertedLeads - a.convertedLeads);
    }
    analyzeGeographicDistribution(leads) {
        const geoStats = new Map();
        leads.forEach(lead => {
            const region = lead.client?.address?.split(',').pop()?.trim() || 'Unknown';
            if (!geoStats.has(region)) {
                geoStats.set(region, {
                    total: 0,
                    converted: 0
                });
            }
            const stats = geoStats.get(region);
            stats.total++;
            if (lead.status === lead_enums_1.LeadStatus.APPROVED) {
                stats.converted++;
            }
        });
        return Object.fromEntries(Array.from(geoStats.entries())
            .map(([region, stats]) => [
            region,
            {
                total: stats.total,
                converted: stats.converted,
                conversionRate: `${((stats.converted / stats.total) * 100).toFixed(1)}%`
            }
        ]));
    }
    analyzeLeadQualityBySource(leads) {
        const sourceQuality = new Map();
        leads.forEach(lead => {
            const source = lead.client?.category || 'Direct';
            const qualityScore = this.calculateIndividualLeadQualityScore(lead);
            if (!sourceQuality.has(source)) {
                sourceQuality.set(source, {
                    scores: [],
                    distribution: {
                        high: 0,
                        medium: 0,
                        low: 0
                    }
                });
            }
            const stats = sourceQuality.get(source);
            stats.scores.push(qualityScore);
            if (qualityScore >= 80)
                stats.distribution.high++;
            else if (qualityScore >= 50)
                stats.distribution.medium++;
            else
                stats.distribution.low++;
        });
        return Array.from(sourceQuality.entries())
            .map(([source, stats]) => ({
            source,
            averageQualityScore: Number((stats.scores.reduce((sum, score) => sum + score, 0) / stats.scores.length).toFixed(1)),
            leadDistribution: stats.distribution
        }))
            .sort((a, b) => b.averageQualityScore - a.averageQualityScore);
    }
    analyzeConversionTrends(leads) {
        const dailyStats = new Map();
        leads.forEach(lead => {
            const date = lead.createdAt.toISOString().split('T')[0];
            if (!dailyStats.has(date)) {
                dailyStats.set(date, {
                    total: 0,
                    converted: 0
                });
            }
            const stats = dailyStats.get(date);
            stats.total++;
            if (lead.status === lead_enums_1.LeadStatus.APPROVED) {
                stats.converted++;
            }
        });
        return Array.from(dailyStats.entries())
            .map(([date, stats]) => ({
            date,
            totalLeads: stats.total,
            convertedLeads: stats.converted,
            conversionRate: `${((stats.converted / stats.total) * 100).toFixed(1)}%`
        }))
            .sort((a, b) => a.date.localeCompare(b.date));
    }
    analyzeResponseTimeDistribution(leads) {
        const distribution = {
            'Under 1 hour': 0,
            '1-4 hours': 0,
            '4-12 hours': 0,
            '12-24 hours': 0,
            'Over 24 hours': 0
        };
        leads.forEach(lead => {
            if (lead.status === lead_enums_1.LeadStatus.PENDING)
                return;
            const responseTime = (lead.updatedAt.getTime() - lead.createdAt.getTime()) / (60 * 60 * 1000);
            if (responseTime < 1)
                distribution['Under 1 hour']++;
            else if (responseTime < 4)
                distribution['1-4 hours']++;
            else if (responseTime < 12)
                distribution['4-12 hours']++;
            else if (responseTime < 24)
                distribution['12-24 hours']++;
            else
                distribution['Over 24 hours']++;
        });
        return distribution;
    }
    calculateIndividualLeadQualityScore(lead) {
        let score = 0;
        if (lead.status !== lead_enums_1.LeadStatus.PENDING) {
            const responseTime = (lead.updatedAt.getTime() - lead.createdAt.getTime()) / (60 * 60 * 1000);
            if (responseTime < 1)
                score += 40;
            else if (responseTime < 4)
                score += 30;
            else if (responseTime < 12)
                score += 20;
            else if (responseTime < 24)
                score += 10;
        }
        if (lead.status === lead_enums_1.LeadStatus.APPROVED)
            score += 30;
        else if (lead.status === lead_enums_1.LeadStatus.REVIEW)
            score += 15;
        if (lead.client) {
            if (lead.client.email)
                score += 10;
            if (lead.client.phone)
                score += 10;
            if (lead.client.address)
                score += 10;
        }
        return score;
    }
};
exports.LeadsService = LeadsService;
exports.LeadsService = LeadsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_2.InjectRepository)(lead_entity_1.Lead)),
    __metadata("design:paramtypes", [typeorm_1.Repository,
        event_emitter_1.EventEmitter2,
        rewards_service_1.RewardsService])
], LeadsService);
//# sourceMappingURL=leads.service.js.map