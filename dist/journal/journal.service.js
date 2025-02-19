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
exports.JournalService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const journal_entity_1 = require("./entities/journal.entity");
const notification_enums_1 = require("../lib/enums/notification.enums");
const user_enums_1 = require("../lib/enums/user.enums");
const event_emitter_1 = require("@nestjs/event-emitter");
const date_fns_1 = require("date-fns");
const rewards_service_1 = require("../rewards/rewards.service");
const constants_1 = require("../lib/constants/constants");
let JournalService = class JournalService {
    constructor(journalRepository, eventEmitter, rewardsService) {
        this.journalRepository = journalRepository;
        this.eventEmitter = eventEmitter;
        this.rewardsService = rewardsService;
    }
    calculateStats(journals) {
        return {
            total: journals?.length || 0,
        };
    }
    async create(createJournalDto) {
        try {
            const journal = await this.journalRepository.save(createJournalDto);
            if (!journal) {
                throw new common_1.NotFoundException(process.env.NOT_FOUND_MESSAGE);
            }
            const response = {
                message: process.env.SUCCESS_MESSAGE,
            };
            const notification = {
                type: notification_enums_1.NotificationType.USER,
                title: 'Journal Created',
                message: `A journal has been created`,
                status: notification_enums_1.NotificationStatus.UNREAD,
                owner: journal?.owner
            };
            const recipients = [user_enums_1.AccessLevel.ADMIN, user_enums_1.AccessLevel.MANAGER, user_enums_1.AccessLevel.OWNER, user_enums_1.AccessLevel.SUPERVISOR, user_enums_1.AccessLevel.USER];
            this.eventEmitter.emit('send.notification', notification, recipients);
            await this.rewardsService.awardXP({
                owner: createJournalDto.owner.uid,
                amount: 10,
                action: 'JOURNAL',
                source: {
                    id: createJournalDto.owner.uid.toString(),
                    type: 'journal',
                    details: 'Journal reward'
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
    async findAll(filters, page = 1, limit = Number(process.env.DEFAULT_PAGE_LIMIT)) {
        try {
            const queryBuilder = this.journalRepository
                .createQueryBuilder('journal')
                .leftJoinAndSelect('journal.author', 'author')
                .leftJoinAndSelect('journal.category', 'category')
                .where('journal.isDeleted = :isDeleted', { isDeleted: false });
            if (filters?.status) {
                queryBuilder.andWhere('journal.status = :status', { status: filters.status });
            }
            if (filters?.authorId) {
                queryBuilder.andWhere('author.uid = :authorId', { authorId: filters.authorId });
            }
            if (filters?.categoryId) {
                queryBuilder.andWhere('category.uid = :categoryId', { categoryId: filters.categoryId });
            }
            if (filters?.startDate && filters?.endDate) {
                queryBuilder.andWhere('journal.createdAt BETWEEN :startDate AND :endDate', {
                    startDate: filters.startDate,
                    endDate: filters.endDate
                });
            }
            if (filters?.search) {
                queryBuilder.andWhere('(journal.title ILIKE :search OR journal.content ILIKE :search OR author.name ILIKE :search)', { search: `%${filters.search}%` });
            }
            queryBuilder
                .skip((page - 1) * limit)
                .take(limit)
                .orderBy('journal.createdAt', 'DESC');
            const [journals, total] = await queryBuilder.getManyAndCount();
            if (!journals) {
                throw new common_1.NotFoundException(process.env.NOT_FOUND_MESSAGE);
            }
            return {
                data: journals,
                meta: {
                    total,
                    page,
                    limit,
                    totalPages: Math.ceil(total / limit),
                },
                message: process.env.SUCCESS_MESSAGE,
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
                message: error?.message,
            };
        }
    }
    async findOne(ref) {
        try {
            const journal = await this.journalRepository.findOne({
                where: { uid: ref, isDeleted: false },
                relations: ['owner']
            });
            if (!journal) {
                return {
                    message: process.env.NOT_FOUND_MESSAGE,
                    journal: null,
                    stats: null
                };
            }
            const allJournals = await this.journalRepository.find();
            const stats = this.calculateStats(allJournals);
            return {
                journal,
                message: process.env.SUCCESS_MESSAGE,
                stats
            };
        }
        catch (error) {
            return {
                message: error?.message,
                journal: null,
                stats: null
            };
        }
    }
    async journalsByUser(ref) {
        try {
            const journals = await this.journalRepository.find({
                where: { owner: { uid: ref }, isDeleted: false },
                relations: ['owner']
            });
            if (!journals) {
                throw new common_1.NotFoundException(process.env.NOT_FOUND_MESSAGE);
            }
            const stats = this.calculateStats(journals);
            return {
                message: process.env.SUCCESS_MESSAGE,
                journals,
                stats
            };
        }
        catch (error) {
            return {
                message: `could not get journals by user - ${error?.message}`,
                journals: null,
                stats: null
            };
        }
    }
    async getJournalsForDate(date) {
        try {
            const journals = await this.journalRepository.find({
                where: { createdAt: (0, typeorm_2.Between)((0, date_fns_1.startOfDay)(date), (0, date_fns_1.endOfDay)(date)) }
            });
            if (!journals) {
                throw new common_1.NotFoundException(process.env.NOT_FOUND_MESSAGE);
            }
            const response = {
                message: process.env.SUCCESS_MESSAGE,
                journals
            };
            return response;
        }
        catch (error) {
            const response = {
                message: error?.message,
                journals: null
            };
            return response;
        }
    }
    async update(ref, updateJournalDto) {
        try {
            const journal = await this.journalRepository.findOne({ where: { uid: ref, isDeleted: false } });
            if (!journal) {
                const response = {
                    message: process.env.NOT_FOUND_MESSAGE,
                };
                return response;
            }
            await this.journalRepository.update(ref, updateJournalDto);
            const response = {
                message: process.env.SUCCESS_MESSAGE,
            };
            const notification = {
                type: notification_enums_1.NotificationType.USER,
                title: 'Journal Created',
                message: `A journal has been created`,
                status: notification_enums_1.NotificationStatus.UNREAD,
                owner: journal?.owner
            };
            const recipients = [user_enums_1.AccessLevel.ADMIN, user_enums_1.AccessLevel.MANAGER, user_enums_1.AccessLevel.OWNER, user_enums_1.AccessLevel.SUPERVISOR, user_enums_1.AccessLevel.USER];
            this.eventEmitter.emit('send.notification', notification, recipients);
            await this.rewardsService.awardXP({
                owner: updateJournalDto.owner.uid,
                amount: constants_1.XP_VALUES.JOURNAL,
                action: constants_1.XP_VALUES_TYPES.JOURNAL,
                source: {
                    id: updateJournalDto.owner.uid.toString(),
                    type: constants_1.XP_VALUES_TYPES.JOURNAL,
                    details: 'Journal reward'
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
            const journal = await this.journalRepository.findOne({ where: { uid: ref } });
            if (!journal) {
                const response = {
                    message: process.env.NOT_FOUND_MESSAGE,
                };
                return response;
            }
            await this.journalRepository.update(ref, { isDeleted: true });
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
            const journal = await this.journalRepository.findOne({ where: { uid: ref } });
            if (!journal) {
                const response = {
                    message: process.env.NOT_FOUND_MESSAGE,
                };
                return response;
            }
            await this.journalRepository.update(ref, { isDeleted: false });
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
    async count() {
        try {
            const total = await this.journalRepository.count();
            return {
                total
            };
        }
        catch (error) {
            return {
                total: 0
            };
        }
    }
    async getJournalsReport(filter) {
        try {
            const journals = await this.journalRepository.find({
                where: {
                    ...filter,
                    isDeleted: false
                },
                relations: ['owner', 'branch'],
                order: {
                    timestamp: 'DESC'
                }
            });
            if (!journals) {
                throw new common_1.NotFoundException('No journals found for the specified period');
            }
            const totalEntries = journals.length;
            const categories = this.analyzeJournalCategories(journals);
            const entriesPerDay = this.calculateEntriesPerDay(journals);
            const completionRate = this.calculateCompletionRate(journals);
            return {
                entries: journals,
                metrics: {
                    totalEntries,
                    averageEntriesPerDay: entriesPerDay,
                    topCategories: categories,
                    completionRate: `${completionRate}%`
                }
            };
        }
        catch (error) {
            return null;
        }
    }
    analyzeJournalCategories(journals) {
        const categoryCounts = journals.reduce((acc, journal) => {
            const category = this.extractCategory(journal);
            acc[category] = (acc[category] || 0) + 1;
            return acc;
        }, {});
        return Object.entries(categoryCounts)
            .map(([category, count]) => ({ category, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);
    }
    extractCategory(journal) {
        const comments = journal.comments.toLowerCase();
        if (comments.includes('meeting'))
            return 'Meeting';
        if (comments.includes('call'))
            return 'Call';
        if (comments.includes('report'))
            return 'Report';
        if (comments.includes('follow'))
            return 'Follow-up';
        return 'Other';
    }
    calculateEntriesPerDay(journals) {
        if (journals.length === 0)
            return 0;
        const dates = journals.map(j => j.timestamp.toISOString().split('T')[0]);
        const uniqueDates = new Set(dates).size;
        return Number((journals.length / uniqueDates).toFixed(1));
    }
    calculateCompletionRate(journals) {
        if (journals.length === 0)
            return 0;
        const completedEntries = journals.filter(journal => journal.fileURL &&
            journal.comments &&
            journal.comments.length > 10).length;
        return Number(((completedEntries / journals.length) * 100).toFixed(1));
    }
};
exports.JournalService = JournalService;
exports.JournalService = JournalService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(journal_entity_1.Journal)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        event_emitter_1.EventEmitter2,
        rewards_service_1.RewardsService])
], JournalService);
//# sourceMappingURL=journal.service.js.map