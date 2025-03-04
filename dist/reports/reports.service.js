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
exports.ReportsService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const check_in_entity_1 = require("../check-ins/entities/check-in.entity");
const task_entity_1 = require("../tasks/entities/task.entity");
const claim_entity_1 = require("../claims/entities/claim.entity");
const lead_entity_1 = require("../leads/entities/lead.entity");
const journal_entity_1 = require("../journal/entities/journal.entity");
const user_entity_1 = require("../user/entities/user.entity");
const attendance_entity_1 = require("../attendance/entities/attendance.entity");
const organisation_entity_1 = require("../organisation/entities/organisation.entity");
const branch_entity_1 = require("../branch/entities/branch.entity");
const report_entity_1 = require("./entities/report.entity");
const report_enums_1 = require("../lib/enums/report.enums");
const task_enums_1 = require("../lib/enums/task.enums");
const lead_enums_1 = require("../lib/enums/lead.enums");
const user_enums_1 = require("../lib/enums/user.enums");
const achievement_entity_1 = require("../rewards/entities/achievement.entity");
const client_entity_1 = require("../clients/entities/client.entity");
const event_emitter_1 = require("@nestjs/event-emitter");
const eventemitter2_1 = require("eventemitter2");
const communication_service_1 = require("../communication/communication.service");
const email_enums_1 = require("../lib/enums/email.enums");
const tracking_entity_1 = require("../tracking/entities/tracking.entity");
const live_user_report_service_1 = require("./live-user-report.service");
const cache_manager_1 = require("@nestjs/cache-manager");
const common_2 = require("@nestjs/common");
let ReportsService = class ReportsService {
    constructor(configService, eventEmitter, communicationService, checkInRepository, taskRepository, claimRepository, leadRepository, journalRepository, userRepository, attendanceRepository, achievementRepository, reportRepository, organisationRepository, branchRepository, clientRepository, trackingRepository, liveUserReportService, cacheManager) {
        this.configService = configService;
        this.eventEmitter = eventEmitter;
        this.communicationService = communicationService;
        this.checkInRepository = checkInRepository;
        this.taskRepository = taskRepository;
        this.claimRepository = claimRepository;
        this.leadRepository = leadRepository;
        this.journalRepository = journalRepository;
        this.userRepository = userRepository;
        this.attendanceRepository = attendanceRepository;
        this.achievementRepository = achievementRepository;
        this.reportRepository = reportRepository;
        this.organisationRepository = organisationRepository;
        this.branchRepository = branchRepository;
        this.clientRepository = clientRepository;
        this.trackingRepository = trackingRepository;
        this.liveUserReportService = liveUserReportService;
        this.cacheManager = cacheManager;
        this.WORK_HOURS_PER_DAY = 8;
        this.MINUTES_PER_HOUR = 60;
        this.BRANCH_CACHE_PREFIX = 'branch';
        this.CACHE_TTL = 3600;
        this.currencyLocale = this.configService.get('CURRENCY_LOCALE') || 'en-ZA';
        this.currencyCode = this.configService.get('CURRENCY_CODE') || 'ZAR';
        this.currencySymbol = this.configService.get('CURRENCY_SYMBOL') || 'R';
    }
    getBranchCacheKey(branchUid) {
        return `${this.BRANCH_CACHE_PREFIX}:uid:${branchUid}`;
    }
    async getCachedBranch(branchUid) {
        return this.cacheManager.get(this.getBranchCacheKey(branchUid));
    }
    async cacheBranch(branch) {
        await this.cacheManager.set(this.getBranchCacheKey(branch.uid), branch, this.CACHE_TTL);
    }
    async generateReport(options) {
        const report = new report_entity_1.Report();
        report.type = options.type;
        report.format = options.format;
        report.timeframe = options.timeframe;
        report.startDate = options.startDate;
        report.endDate = options.endDate;
        report.filters = options.filters;
        report.status = report_enums_1.ReportStatus.GENERATING;
        report.createdAt = new Date();
        if (options.userId) {
            const user = await this.userRepository.findOne({
                where: { uid: options.userId },
            });
            if (!user)
                throw new common_1.NotFoundException('User not found');
            report.owner = user;
            report.ownerUid = user.uid;
        }
        if (options.organisationRef) {
            const organisation = await this.organisationRepository.findOne({
                where: { ref: options.organisationRef },
            });
            if (!organisation)
                throw new common_1.NotFoundException('Organisation not found');
            report.organisation = organisation;
            report.organisationRef = organisation.ref;
        }
        if (options.branchUid) {
            let branch = await this.getCachedBranch(options.branchUid);
            if (!branch) {
                branch = await this.branchRepository.findOne({
                    where: { uid: options.branchUid },
                });
                if (branch) {
                    await this.cacheBranch(branch);
                }
            }
            if (!branch)
                throw new common_1.NotFoundException('Branch not found');
            report.branch = branch;
            report.branchUid = branch.uid;
        }
        try {
            let data;
            if (options.type === report_enums_1.ReportType.DAILY_USER) {
                data = await this.generateDailyUserReport(options);
            }
            else {
                data = await this.generateDashboardReport(options);
            }
            report.data = data;
            report.status = report_enums_1.ReportStatus.COMPLETED;
            report.completedAt = new Date();
            report.metrics = this.calculateReportMetrics(data);
            report.summary = this.generateReportSummary(data);
            report.metadata = {
                generatedBy: options.userId?.toString(),
                generationTime: report?.createdAt ? Date.now() - report?.createdAt?.getTime() : 0,
                dataPoints: this.countDataPoints(data),
                version: '2.0',
                source: 'system',
            };
            const savedReport = await this.reportRepository.save(report);
            if (options.type === report_enums_1.ReportType.DAILY_USER && report.owner) {
                await this.sendDailyReportEmail(report.owner, data);
            }
            return savedReport;
        }
        catch (error) {
            report.status = report_enums_1.ReportStatus.FAILED;
            report.errorMessage = error.message;
            await this.reportRepository.save(report);
            throw error;
        }
    }
    async handleDailyReport(payload) {
        try {
            await this.generateReport(payload);
        }
        catch (error) {
            console.error('Failed to generate daily report:', error);
            this.eventEmitter.emit('daily-report-failed', {
                userId: payload.userId,
                error: error.message,
            });
        }
    }
    async generateDailyUserReport(options) {
        try {
            if (!options.userId) {
                throw new Error('User ID is required for daily report');
            }
            const dateRange = {
                start: options.startDate,
                end: options.endDate,
            };
            const [attendanceRecords, tasks, clientVisits, leads, achievements, journals, userRewards, user,] = await Promise.all([
                this.fetchAttendanceRecords(options.userId, dateRange),
                this.fetchTasks(options.userId, dateRange),
                this.fetchClientVisits(options.userId, dateRange),
                this.fetchLeads(options.userId, dateRange),
                this.fetchAchievements(options.userId, dateRange),
                this.fetchJournals(options.userId, dateRange),
                this.fetchUserRewards(options.userId),
                this.userRepository.findOne({ where: { uid: options.userId } }),
            ]).catch((error) => {
                throw new Error(`Failed to fetch report data: ${error.message}`);
            });
            if (!user) {
                throw new common_1.NotFoundException(`User with ID ${options.userId} not found`);
            }
            const [attendance, clientVisitMetrics, taskMetrics, quotationMetrics, rewardMetrics, journalMetrics,] = await Promise.all([
                this.calculateAttendanceMetrics(attendanceRecords),
                this.calculateClientVisitMetrics(clientVisits),
                this.calculateTaskMetrics(tasks),
                this.calculateQuotationMetrics(leads),
                this.calculateRewardMetrics([...achievements, ...userRewards]),
                this.calculateJournalMetrics(journals),
            ]);
            const productivity = this.calculateProductivityMetrics({
                tasks: taskMetrics,
                attendance,
                clientVisits: clientVisitMetrics,
                quotations: quotationMetrics,
            });
            const report = {
                userId: options.userId,
                date: options.startDate,
                attendance,
                clientVisits: clientVisitMetrics,
                tasks: taskMetrics,
                quotations: quotationMetrics,
                rewards: rewardMetrics,
                journals: journalMetrics,
                productivity,
                summary: this.generateDailyReportSummary({
                    attendance,
                    tasks: taskMetrics,
                    clientVisits: clientVisitMetrics,
                    quotations: quotationMetrics,
                    productivity,
                }),
            };
            return report;
        }
        catch (error) {
            throw new Error(`Failed to generate daily report: ${error.message}`);
        }
    }
    async fetchAttendanceRecords(userId, dateRange) {
        return this.attendanceRepository.find({
            where: {
                owner: { uid: userId },
                checkIn: (0, typeorm_2.Between)(dateRange.start, dateRange.end),
            },
            order: { checkIn: 'ASC' },
        });
    }
    async fetchTasks(userId, dateRange) {
        return this.taskRepository.find({
            where: {
                creator: { uid: userId },
                createdAt: (0, typeorm_2.Between)(dateRange.start, dateRange.end),
            },
            order: { createdAt: 'ASC' },
        });
    }
    async fetchClientVisits(userId, dateRange) {
        return this.checkInRepository.find({
            where: {
                owner: { uid: userId },
                checkInTime: (0, typeorm_2.Between)(dateRange.start, dateRange.end),
            },
            relations: ['client'],
            order: { checkInTime: 'ASC' },
        });
    }
    async fetchLeads(userId, dateRange) {
        return this.leadRepository.find({
            where: {
                owner: { uid: userId },
                createdAt: (0, typeorm_2.Between)(dateRange.start, dateRange.end),
            },
            order: { createdAt: 'ASC' },
        });
    }
    async fetchAchievements(userId, dateRange) {
        return this.achievementRepository.find({
            where: {
                userRewards: { owner: { uid: userId } },
                createdAt: (0, typeorm_2.Between)(dateRange.start, dateRange.end),
            },
            order: { createdAt: 'ASC' },
        });
    }
    async fetchJournals(userId, dateRange) {
        return this.journalRepository.find({
            where: {
                owner: { uid: userId },
                createdAt: (0, typeorm_2.Between)(dateRange.start, dateRange.end),
            },
            order: { createdAt: 'ASC' },
        });
    }
    async fetchUserRewards(userId) {
        return this.achievementRepository
            .createQueryBuilder('achievement')
            .innerJoin('achievement.userRewards', 'userReward')
            .innerJoin('userReward.owner', 'user')
            .where('user.uid = :userId', { userId })
            .orderBy('achievement.createdAt', 'ASC')
            .getMany();
    }
    calculateAttendanceMetrics(records) {
        try {
            if (!records.length) {
                return this.getDefaultAttendanceMetrics();
            }
            const today = new Date();
            const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0);
            const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);
            const todaysRecords = records.filter((record) => new Date(record.checkIn) >= startOfDay && new Date(record.checkIn) <= endOfDay);
            const activeShifts = todaysRecords.filter((record) => record.status === 'present' && !record.checkOut);
            let latestRecord = null;
            if (activeShifts.length > 0) {
                latestRecord = [...activeShifts].sort((a, b) => {
                    return new Date(b.checkIn).getTime() - new Date(a.checkIn).getTime();
                })[0];
            }
            else if (todaysRecords.length > 0) {
                latestRecord = [...todaysRecords].sort((a, b) => {
                    return new Date(b.checkIn).getTime() - new Date(a.checkIn).getTime();
                })[0];
            }
            const totalDays = this.getDaysBetween(new Date(records[0].checkIn), new Date(records[records.length - 1].checkIn));
            const presentDays = new Set(records.map((record) => new Date(record.checkIn).toDateString())).size;
            const attendanceRate = totalDays ? (presentDays / totalDays) * 100 : 0;
            let checkInTime = '--:--';
            let checkOutTime = '--:--';
            if (latestRecord) {
                if (latestRecord.checkIn) {
                    const checkInDate = new Date(latestRecord.checkIn);
                    checkInTime = `${checkInDate.getHours().toString().padStart(2, '0')}:${checkInDate
                        .getMinutes()
                        .toString()
                        .padStart(2, '0')}`;
                }
                if (latestRecord.checkOut) {
                    const checkOutDate = new Date(latestRecord.checkOut);
                    checkOutTime = `${checkOutDate.getHours().toString().padStart(2, '0')}:${checkOutDate
                        .getMinutes()
                        .toString()
                        .padStart(2, '0')}`;
                }
            }
            let totalHoursWorked = 0;
            let totalOvertime = 0;
            let lateCheckIns = 0;
            let totalBreakTime = 0;
            let todaysTotalHours = 0;
            let todaysTotalMinutes = 0;
            for (const record of records) {
                let hoursWorked = 0;
                if (record.duration) {
                    const durationMatch = record.duration.match(/(\d+)h\s+(\d+)m/);
                    if (durationMatch) {
                        const hours = parseInt(durationMatch[1], 10);
                        const minutes = parseInt(durationMatch[2], 10);
                        hoursWorked = hours + minutes / 60;
                        if (todaysRecords.includes(record)) {
                            todaysTotalHours += hours;
                            todaysTotalMinutes += minutes;
                        }
                    }
                }
                else if (record.checkIn && record.checkOut) {
                    const checkInTime = new Date(record.checkIn).getTime();
                    const checkOutTime = new Date(record.checkOut).getTime();
                    hoursWorked = (checkOutTime - checkInTime) / (1000 * 60 * 60);
                    if (todaysRecords.includes(record)) {
                        const minutesWorked = Math.floor((checkOutTime - checkInTime) / (1000 * 60));
                        todaysTotalHours += Math.floor(minutesWorked / 60);
                        todaysTotalMinutes += minutesWorked % 60;
                    }
                }
                totalHoursWorked += hoursWorked;
                if (this.isLateCheckIn(new Date(record.checkIn))) {
                    lateCheckIns++;
                }
                if (hoursWorked > this.WORK_HOURS_PER_DAY) {
                    totalOvertime += hoursWorked - this.WORK_HOURS_PER_DAY;
                }
                if (record.breakStartTime && record.breakEndTime) {
                    const breakStartTime = new Date(record.breakStartTime).getTime();
                    const breakEndTime = new Date(record.breakEndTime).getTime();
                    const breakDurationMinutes = (breakEndTime - breakStartTime) / (1000 * 60);
                    totalBreakTime += breakDurationMinutes;
                }
            }
            if (todaysTotalMinutes >= 60) {
                todaysTotalHours += Math.floor(todaysTotalMinutes / 60);
                todaysTotalMinutes = todaysTotalMinutes % 60;
            }
            const todaysHoursFormatted = `${todaysTotalHours}h ${todaysTotalMinutes}m`;
            const averageHoursWorked = totalDays ? totalHoursWorked / totalDays : 0;
            const averageBreakTime = totalDays ? totalBreakTime / totalDays : 0;
            const onTimeCheckIns = records.length - lateCheckIns;
            return {
                totalDays,
                presentDays,
                absentDays: totalDays - presentDays,
                attendanceRate: Number(attendanceRate.toFixed(2)),
                averageCheckInTime: checkInTime,
                averageCheckOutTime: checkOutTime,
                averageHoursWorked,
                todaysHoursFormatted,
                totalOvertime: Number(totalOvertime.toFixed(2)),
                onTimeCheckIns,
                lateCheckIns,
                averageBreakTime: Number(averageBreakTime.toFixed(2)),
                efficiency: Number(this.calculateWorkEfficiency(averageHoursWorked, averageBreakTime).toFixed(2)),
            };
        }
        catch (error) {
            console.error('Error calculating attendance metrics:', error);
            return this.getDefaultAttendanceMetrics();
        }
    }
    calculateWorkEfficiency(averageHoursWorked, averageBreakTime) {
        const totalWorkMinutes = averageHoursWorked * this.MINUTES_PER_HOUR;
        const expectedWorkMinutes = this.WORK_HOURS_PER_DAY * this.MINUTES_PER_HOUR;
        const efficiency = ((totalWorkMinutes - averageBreakTime) / expectedWorkMinutes) * 100;
        return Math.min(Math.max(efficiency, 0), 100);
    }
    getDefaultAttendanceMetrics() {
        return {
            totalDays: 0,
            presentDays: 0,
            absentDays: 0,
            attendanceRate: 0,
            averageCheckInTime: '00:00',
            averageCheckOutTime: '00:00',
            averageHoursWorked: 0,
            todaysHoursFormatted: '0h 0m',
            totalOvertime: 0,
            onTimeCheckIns: 0,
            lateCheckIns: 0,
            averageBreakTime: 0,
            efficiency: 0,
        };
    }
    calculateClientVisitMetrics(visits) {
        const uniqueClients = new Set(visits?.map((v) => v?.client?.uid))?.size || 0;
        const totalDuration = visits?.reduce((sum, v) => sum + (Number(v?.duration) || 0), 0) || 0;
        return {
            totalVisits: visits?.length || 0,
            uniqueClients,
            averageTimePerVisit: visits?.length ? totalDuration / visits.length : 0,
            totalDuration,
            byPurpose: this.groupBy(visits || [], 'checkInLocation'),
            conversionRate: 0,
        };
    }
    calculateTaskMetrics(tasks) {
        const completed = tasks.filter((t) => t.status === task_enums_1.TaskStatus.COMPLETED).length;
        const total = tasks.length;
        return {
            total,
            completed,
            inProgress: tasks.filter((t) => t.status === task_enums_1.TaskStatus.IN_PROGRESS).length,
            pending: tasks.filter((t) => t.status === task_enums_1.TaskStatus.PENDING).length,
            overdue: tasks.filter((t) => t.isOverdue).length,
            completionRate: (completed / total) * 100,
            averageCompletionTime: this.calculateAverageCompletionTime(tasks),
            byPriority: {
                high: tasks.filter((t) => t.priority === task_enums_1.TaskPriority.HIGH).length,
                medium: tasks.filter((t) => t.priority === task_enums_1.TaskPriority.MEDIUM).length,
                low: tasks.filter((t) => t.priority === task_enums_1.TaskPriority.LOW).length,
            },
            byType: this.groupBy(tasks, 'taskType'),
        };
    }
    calculateQuotationMetrics(leads) {
        const approved = leads?.filter((q) => q?.status === lead_enums_1.LeadStatus.APPROVED) || [];
        const total = leads?.length || 0;
        const totalValue = leads?.reduce((sum, lead) => {
            const leadValue = lead?.value || lead?.amount || lead?.quotationValue || 0;
            return sum + leadValue;
        }, 0) || 0;
        return {
            total,
            approved: approved?.length || 0,
            rejected: leads?.filter((q) => q?.status === lead_enums_1.LeadStatus.DECLINED)?.length || 0,
            pending: leads?.filter((q) => q?.status === lead_enums_1.LeadStatus.PENDING)?.length || 0,
            conversionRate: total > 0 ? ((approved?.length || 0) / total) * 100 : 0,
            averageValue: approved?.length > 0 ? totalValue / approved.length : 0,
            totalValue,
            byProduct: this.groupBy(leads || [], 'name'),
        };
    }
    calculateRewardMetrics(achievements) {
        return {
            totalXP: achievements.reduce((sum, r) => sum + (r.xpValue || 0), 0),
            totalRewards: achievements.length,
            byCategory: this.groupBy(achievements, 'category'),
            achievements: achievements.map((r) => ({
                name: r.name,
                earnedAt: r.createdAt,
                xpValue: r.xpValue,
            })),
        };
    }
    calculateJournalMetrics(journals) {
        const byCategory = this.groupBy(journals || [], 'type');
        const sortedCategories = Object.entries(byCategory)
            ?.sort(([, a], [, b]) => b - a)
            ?.slice(0, 5)
            ?.map(([category]) => category) || [];
        return {
            total: journals?.length || 0,
            byCategory,
            averageEntriesPerDay: journals?.length ?
                journals.length / this.getDaysBetween(journals[0]?.createdAt, journals[journals.length - 1]?.createdAt) :
                0,
            topCategories: sortedCategories,
        };
    }
    calculateProductivityMetrics(data) {
        const taskEfficiency = (data.tasks.completed / data.tasks.total) * 100;
        const clientHandling = data.clientVisits
            ? (data.clientVisits.conversionRate + (data.quotations?.conversionRate || 0)) / 2
            : 0;
        const responseTime = this.calculateAverageResponseTime(data);
        const qualityScore = this.calculateQualityScore(data);
        return {
            score: (taskEfficiency + clientHandling + qualityScore) / 3,
            taskEfficiency,
            clientHandling,
            responseTime,
            qualityScore,
        };
    }
    isLateCheckIn(time) {
        const hour = time.getHours();
        const minutes = time.getMinutes();
        return hour > 9 || (hour === 9 && minutes > 0);
    }
    calculateAverageTime(times) {
        if (!times.length)
            return '00:00';
        const avgMinutes = times.reduce((sum, time) => {
            return sum + time.getHours() * 60 + time.getMinutes();
        }, 0) / times.length;
        const hours = Math.floor(avgMinutes / 60);
        const minutes = Math.floor(avgMinutes % 60);
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    }
    calculateAverageCompletionTime(tasks) {
        const completedTasks = tasks.filter((t) => t.status === task_enums_1.TaskStatus.COMPLETED && t.completionDate);
        if (!completedTasks.length)
            return 0;
        return (completedTasks.reduce((sum, task) => {
            const duration = task.completionDate.getTime() - task.createdAt.getTime();
            return sum + duration;
        }, 0) /
            completedTasks.length /
            (1000 * 60 * 60));
    }
    groupBy(items, key) {
        return items?.reduce((acc, item) => {
            const value = String(item?.[key]);
            acc[value] = (acc[value] || 0) + 1;
            return acc;
        }, {}) || {};
    }
    getDaysBetween(start, end) {
        if (!start || !end)
            return 1;
        return Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
    }
    calculateAverageResponseTime(data) {
        return 0;
    }
    calculateQualityScore(data) {
        return 0;
    }
    countDataPoints(data) {
        return Object.keys(data).length;
    }
    generateReportSummary(data) {
        return '';
    }
    generateDailyReportSummary(data) {
        return '';
    }
    generateDashboardSummary(data) {
        return '';
    }
    calculateReportMetrics(data) {
        return {};
    }
    async getTopPerformers(users, dateRange) {
        const performanceScores = await Promise.all(users.map(async (user) => {
            const tasks = await this.taskRepository.find({
                where: {
                    creator: { uid: user.uid },
                    createdAt: (0, typeorm_2.Between)(dateRange.start, dateRange.end),
                },
            });
            const attendance = await this.attendanceRepository.find({
                where: {
                    owner: { uid: user.uid },
                    checkIn: (0, typeorm_2.Between)(dateRange.start, dateRange.end),
                },
            });
            const taskMetrics = this.calculateTaskMetrics(tasks);
            const attendanceMetrics = this.calculateAttendanceMetrics(attendance);
            const productivity = this.calculateProductivityMetrics({
                tasks: taskMetrics,
                attendance: attendanceMetrics,
            });
            return {
                userId: user.uid,
                name: `${user.name} ${user.surname}`,
                score: productivity.score,
            };
        }));
        return performanceScores.sort((a, b) => b.score - a.score).slice(0, 5);
    }
    async calculateOrganisationOverview(organisation, dateRange) {
        const [tasks, clients, leads] = await Promise.all([
            this.taskRepository.count({
                where: {
                    organisation: { ref: organisation.ref },
                    createdAt: (0, typeorm_2.Between)(dateRange.start, dateRange.end),
                },
            }),
            this.clientRepository.count({
                where: {
                    organisation: { ref: organisation.ref },
                    createdAt: (0, typeorm_2.Between)(dateRange.start, dateRange.end),
                },
            }),
            this.leadRepository.count({
                where: {
                    createdAt: (0, typeorm_2.Between)(dateRange.start, dateRange.end),
                    status: lead_enums_1.LeadStatus.CONVERTED,
                },
            }),
        ]);
        const activeUsers = await this.userRepository.count({
            where: {
                organisationRef: organisation.ref,
                status: 'active',
            },
        });
        return {
            totalUsers: organisation.users.length,
            activeUsers,
            totalTasks: tasks,
            totalClients: clients,
            totalQuotations: leads,
            totalRevenue: 0,
        };
    }
    async calculateOrganisationTrends(organisation, dateRange) {
        return {
            taskCompletion: [],
            clientVisits: [],
            quotationConversion: [],
            revenue: [],
            productivity: [],
        };
    }
    async calculateTopMetrics(organisation, dateRange) {
        return {
            performers: [],
            departments: [],
            products: [],
        };
    }
    async sendDailyReportEmail(user, reportData) {
        const dailyReportData = {
            name: `${user.name} ${user.surname}`,
            date: reportData.date.toISOString().split('T')[0],
            metrics: {
                xp: {
                    level: reportData.rewards.totalXP > 0 ? Math.floor(reportData.rewards.totalXP / 100) : 0,
                    currentXP: reportData.rewards.totalXP,
                    todayXP: reportData.rewards.achievements.reduce((sum, a) => sum + (a.xpValue || 0), 0),
                },
                attendance: {
                    status: reportData.attendance.presentDays > 0 ? 'Present' : 'Absent',
                    startTime: reportData.attendance.averageCheckInTime,
                    endTime: reportData.attendance.averageCheckOutTime,
                    totalHours: reportData.attendance.averageHoursWorked,
                    duration: `${Math.floor(reportData.attendance.averageHoursWorked)}h ${Math.round((reportData.attendance.averageHoursWorked % 1) * 60)}m`,
                },
                totalQuotations: reportData.quotations.total,
                totalRevenue: this.formatCurrency(reportData.quotations.totalValue),
                newCustomers: reportData.clientVisits.uniqueClients,
                quotationGrowth: '0%',
                revenueGrowth: '0%',
                customerGrowth: '0%',
                userSpecific: {
                    todayLeads: reportData.quotations.total,
                    todayClaims: 0,
                    todayTasks: reportData.tasks.total,
                    todayQuotations: reportData.quotations.approved,
                    hoursWorked: reportData.attendance.averageHoursWorked,
                },
            },
            tracking: {
                totalDistance: '0 km',
                locations: reportData.clientVisits.byPurpose ?
                    Object.entries(reportData.clientVisits.byPurpose).map(([address, timeSpent]) => ({
                        address,
                        timeSpent: `${timeSpent} visits`,
                    })) : [],
                averageTimePerLocation: `${Math.round(reportData.clientVisits.averageTimePerVisit)} minutes`,
            },
        };
        await this.communicationService.sendEmail(email_enums_1.EmailType.DAILY_REPORT, [user.email], dailyReportData);
    }
    formatCurrency(amount) {
        return new Intl.NumberFormat(this.currencyLocale, {
            style: 'currency',
            currency: this.currencyCode,
        }).format(amount);
    }
    async generateDashboardReport(options) {
        if (!options.organisationRef) {
            throw new Error('Organisation reference is required for dashboard report');
        }
        const dateRange = {
            start: options.startDate,
            end: options.endDate,
        };
        const organisation = await this.organisationRepository.findOne({
            where: { ref: options.organisationRef },
            relations: ['users'],
        });
        if (!organisation) {
            throw new common_1.NotFoundException('Organisation not found');
        }
        const overview = await this.calculateOrganisationOverview(organisation, dateRange);
        const trends = await this.calculateOrganisationTrends(organisation, dateRange);
        const topMetrics = await this.calculateTopMetrics(organisation, dateRange);
        const departments = await this.calculateDepartmentMetrics(organisation, dateRange);
        return {
            timeframe: options.timeframe,
            startDate: dateRange.start,
            endDate: dateRange.end,
            organisationRef: options.organisationRef,
            branchUid: options.branchUid,
            overview,
            departments,
            trends,
            topMetrics,
            summary: this.generateDashboardSummary({
                overview,
                departments,
                trends,
                topMetrics,
            }),
        };
    }
    async calculateDepartmentMetrics(organisation, dateRange) {
        const departmentIds = [...new Set(organisation.users.map((u) => u.departmentId))];
        return Promise.all(departmentIds.map(async (deptId) => {
            const users = await this.userRepository.find({
                where: { departmentId: deptId },
            });
            const departmentTasks = await this.taskRepository.find({
                where: {
                    creator: { uid: (0, typeorm_2.In)(users.map((u) => u.uid)) },
                    createdAt: (0, typeorm_2.Between)(dateRange.start, dateRange.end),
                },
            });
            const departmentAttendance = await this.attendanceRepository.find({
                where: {
                    owner: { uid: (0, typeorm_2.In)(users.map((u) => u.uid)) },
                    checkIn: (0, typeorm_2.Between)(dateRange.start, dateRange.end),
                },
            });
            const taskMetrics = this.calculateTaskMetrics(departmentTasks);
            const attendanceMetrics = this.calculateAttendanceMetrics(departmentAttendance);
            const productivity = this.calculateProductivityMetrics({
                tasks: taskMetrics,
                attendance: attendanceMetrics,
            });
            return {
                name: user_enums_1.Department[deptId] || `Department ${deptId}`,
                headCount: users.length,
                attendance: attendanceMetrics,
                tasks: taskMetrics,
                productivity,
                topPerformers: await this.getTopPerformers(users, dateRange),
            };
        }));
    }
    async userLiveOverview(userId) {
        try {
            const now = new Date();
            const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
            const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
            const user = await this.userRepository
                .createQueryBuilder('user')
                .leftJoinAndSelect('user.userProfile', 'userProfile')
                .leftJoinAndSelect('user.branch', 'branch')
                .leftJoinAndSelect('user.organisation', 'organisation')
                .where('user.uid = :userId', { userId })
                .getOne();
            if (!user) {
                throw new common_1.NotFoundException(`User with ID ${userId} not found`);
            }
            const options = {
                type: report_enums_1.ReportType.DAILY_USER,
                format: report_enums_1.ReportFormat.JSON,
                timeframe: report_enums_1.ReportTimeframe.DAILY,
                startDate: startOfDay,
                endDate: endOfDay,
                userId: userId
            };
            const dailyReport = await this.generateDailyUserReport(options);
            const currentTasksInProgress = await this.liveUserReportService.getCurrentTasksInProgress(userId);
            const nextTasks = await this.liveUserReportService.getNextTasks(userId);
            const taskTimeline = await this.liveUserReportService.getTaskTimeline(userId);
            const overdueTasks = await this.liveUserReportService.getOverdueTasks(userId);
            const taskEfficiency = await this.liveUserReportService.getTaskEfficiency(userId);
            const recentActivities = await this.liveUserReportService.getRecentActivities(userId);
            const isOnline = await this.liveUserReportService.checkUserOnlineStatus(userId);
            const currentActivity = await this.liveUserReportService.getCurrentActivity(userId);
            const location = await this.liveUserReportService.getUserLocation(userId);
            const liveReport = {
                ...dailyReport,
                lastUpdated: now,
                isOnline,
                currentActivity,
                location,
                currentTasksInProgress,
                nextTasks: nextTasks?.map(task => ({
                    ...task,
                    deadline: task?.deadline || new Date()
                })),
                taskTimeline: taskTimeline?.map(task => ({
                    ...task,
                    startTime: task?.startDate || new Date(),
                    endTime: task?.endDate || new Date(),
                    isCompleted: task?.status === task_enums_1.TaskStatus.COMPLETED
                })),
                overdueTasks,
                taskEfficiency,
                recentActivities,
                summary: this.liveUserReportService.generateLiveReportSummary(user, dailyReport, {
                    currentTasksInProgress,
                    nextTasks: nextTasks?.map(task => ({
                        ...task,
                        deadline: task.deadline || new Date()
                    })),
                    overdueTasks,
                    taskEfficiency,
                    isOnline
                })
            };
            return liveReport;
        }
        catch (error) {
            throw new Error(`Failed to generate live user report: ${error.message}`);
        }
    }
};
exports.ReportsService = ReportsService;
__decorate([
    (0, event_emitter_1.OnEvent)('daily-report'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ReportsService.prototype, "handleDailyReport", null);
exports.ReportsService = ReportsService = __decorate([
    (0, common_1.Injectable)(),
    __param(3, (0, typeorm_1.InjectRepository)(check_in_entity_1.CheckIn)),
    __param(4, (0, typeorm_1.InjectRepository)(task_entity_1.Task)),
    __param(5, (0, typeorm_1.InjectRepository)(claim_entity_1.Claim)),
    __param(6, (0, typeorm_1.InjectRepository)(lead_entity_1.Lead)),
    __param(7, (0, typeorm_1.InjectRepository)(journal_entity_1.Journal)),
    __param(8, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(9, (0, typeorm_1.InjectRepository)(attendance_entity_1.Attendance)),
    __param(10, (0, typeorm_1.InjectRepository)(achievement_entity_1.Achievement)),
    __param(11, (0, typeorm_1.InjectRepository)(report_entity_1.Report)),
    __param(12, (0, typeorm_1.InjectRepository)(organisation_entity_1.Organisation)),
    __param(13, (0, typeorm_1.InjectRepository)(branch_entity_1.Branch)),
    __param(14, (0, typeorm_1.InjectRepository)(client_entity_1.Client)),
    __param(15, (0, typeorm_1.InjectRepository)(tracking_entity_1.Tracking)),
    __param(17, (0, common_2.Inject)(cache_manager_1.CACHE_MANAGER)),
    __metadata("design:paramtypes", [config_1.ConfigService,
        eventemitter2_1.EventEmitter2,
        communication_service_1.CommunicationService,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        live_user_report_service_1.LiveUserReportService, Object])
], ReportsService);
//# sourceMappingURL=reports.service.js.map