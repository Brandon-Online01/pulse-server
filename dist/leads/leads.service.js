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
const leads_enums_1 = require("../lib/enums/leads.enums");
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
    async findAll() {
        try {
            const leads = await this.leadRepository.find({ where: { isDeleted: false } });
            if (!leads) {
                return {
                    leads: null,
                    message: process.env.NOT_FOUND_MESSAGE,
                    stats: null
                };
            }
            const stats = this.calculateStats(leads);
            const response = {
                leads: leads,
                message: process.env.SUCCESS_MESSAGE,
                stats
            };
            return response;
        }
        catch (error) {
            const response = {
                message: error?.message,
                leads: null,
                stats: null
            };
            return response;
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
            pending: leads?.filter(lead => lead?.status === leads_enums_1.LeadStatus.PENDING)?.length || 0,
            approved: leads?.filter(lead => lead?.status === leads_enums_1.LeadStatus.APPROVED)?.length || 0,
            inReview: leads?.filter(lead => lead?.status === leads_enums_1.LeadStatus.REVIEW)?.length || 0,
            declined: leads?.filter(lead => lead?.status === leads_enums_1.LeadStatus.DECLINED)?.length || 0,
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
                pending: leads.filter(lead => lead.status === leads_enums_1.LeadStatus.PENDING),
                approved: leads.filter(lead => lead.status === leads_enums_1.LeadStatus.APPROVED),
                review: leads.filter(lead => lead.status === leads_enums_1.LeadStatus.REVIEW),
                declined: leads.filter(lead => lead.status === leads_enums_1.LeadStatus.DECLINED),
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