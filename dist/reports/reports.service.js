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
let ReportsService = class ReportsService {
    constructor(configService, checkInRepository, taskRepository, claimRepository, leadRepository, journalRepository, userRepository, attendanceRepository, achievementRepository, reportRepository, organisationRepository, branchRepository, clientRepository) {
        this.configService = configService;
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
        this.currencyLocale = this.configService.get('CURRENCY_LOCALE') || 'en-ZA';
        this.currencyCode = this.configService.get('CURRENCY_CODE') || 'ZAR';
        this.currencySymbol = this.configService.get('CURRENCY_SYMBOL') || 'R';
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
        if (options.userId) {
            const user = await this.userRepository.findOne({
                where: { uid: options.userId }
            });
            if (!user)
                throw new common_1.NotFoundException('User not found');
            report.owner = user;
            report.ownerUid = user.uid;
        }
        if (options.organisationRef) {
            const organisation = await this.organisationRepository.findOne({
                where: { ref: options.organisationRef }
            });
            if (!organisation)
                throw new common_1.NotFoundException('Organisation not found');
            report.organisation = organisation;
            report.organisationRef = organisation.ref;
        }
        if (options.branchUid) {
            const branch = await this.branchRepository.findOne({
                where: { uid: options.branchUid }
            });
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
                generationTime: Date.now() - report.createdAt.getTime(),
                dataPoints: this.countDataPoints(data),
                version: '2.0',
                source: 'system'
            };
            return await this.reportRepository.save(report);
        }
        catch (error) {
            report.status = report_enums_1.ReportStatus.FAILED;
            report.errorMessage = error.message;
            await this.reportRepository.save(report);
            throw error;
        }
    }
    async generateDailyUserReport(options) {
        if (!options.userId)
            throw new Error('User ID is required for daily report');
        const dateRange = {
            start: options.startDate,
            end: options.endDate
        };
        const [attendanceRecords, tasks, clientVisits, leads, achievements, journals] = await Promise.all([
            this.attendanceRepository.find({
                where: {
                    owner: { uid: options.userId },
                    checkIn: (0, typeorm_2.Between)(dateRange.start, dateRange.end)
                }
            }),
            this.taskRepository.find({
                where: {
                    creator: { uid: options.userId },
                    createdAt: (0, typeorm_2.Between)(dateRange.start, dateRange.end)
                }
            }),
            this.checkInRepository.find({
                where: {
                    owner: { uid: options.userId },
                    checkInTime: (0, typeorm_2.Between)(dateRange.start, dateRange.end)
                },
                relations: ['client']
            }),
            this.leadRepository.find({
                where: {
                    owner: { uid: options.userId },
                    createdAt: (0, typeorm_2.Between)(dateRange.start, dateRange.end)
                }
            }),
            this.achievementRepository.find({
                where: {
                    userRewards: { owner: { uid: options.userId } },
                    createdAt: (0, typeorm_2.Between)(dateRange.start, dateRange.end)
                }
            }),
            this.journalRepository.find({
                where: {
                    owner: { uid: options.userId },
                    createdAt: (0, typeorm_2.Between)(dateRange.start, dateRange.end)
                }
            })
        ]);
        const attendance = this.calculateAttendanceMetrics(attendanceRecords);
        const clientVisitMetrics = this.calculateClientVisitMetrics(clientVisits);
        const taskMetrics = this.calculateTaskMetrics(tasks);
        const quotationMetrics = this.calculateQuotationMetrics(leads);
        const rewardMetrics = this.calculateRewardMetrics(achievements);
        const journalMetrics = this.calculateJournalMetrics(journals);
        const productivity = this.calculateProductivityMetrics({
            tasks: taskMetrics,
            attendance,
            clientVisits: clientVisitMetrics,
            quotations: quotationMetrics
        });
        return {
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
                productivity
            })
        };
    }
    async generateDashboardReport(options) {
        if (!options.organisationRef)
            throw new Error('Organisation reference is required for dashboard report');
        const dateRange = {
            start: options.startDate,
            end: options.endDate
        };
        const organisation = await this.organisationRepository.findOne({
            where: { ref: options.organisationRef },
            relations: ['users']
        });
        if (!organisation)
            throw new common_1.NotFoundException('Organisation not found');
        const departmentIds = [...new Set(organisation.users.map(u => u.departmentId))];
        const departments = await Promise.all(departmentIds.map(async (deptId) => {
            const users = await this.userRepository.find({
                where: { departmentId: deptId }
            });
            const departmentTasks = await this.taskRepository.find({
                where: {
                    creator: { uid: (0, typeorm_2.In)(users.map(u => u.uid)) },
                    createdAt: (0, typeorm_2.Between)(dateRange.start, dateRange.end)
                }
            });
            const departmentAttendance = await this.attendanceRepository.find({
                where: {
                    owner: { uid: (0, typeorm_2.In)(users.map(u => u.uid)) },
                    checkIn: (0, typeorm_2.Between)(dateRange.start, dateRange.end)
                }
            });
            const taskMetrics = this.calculateTaskMetrics(departmentTasks);
            const attendanceMetrics = this.calculateAttendanceMetrics(departmentAttendance);
            const productivity = this.calculateProductivityMetrics({
                tasks: taskMetrics,
                attendance: attendanceMetrics
            });
            return {
                name: user_enums_1.Department[deptId] || `Department ${deptId}`,
                headCount: users.length,
                attendance: attendanceMetrics,
                tasks: taskMetrics,
                productivity,
                topPerformers: await this.getTopPerformers(users, dateRange)
            };
        }));
        const overview = await this.calculateOrganisationOverview(organisation, dateRange);
        const trends = await this.calculateOrganisationTrends(organisation, dateRange);
        const topMetrics = await this.calculateTopMetrics(organisation, dateRange);
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
                topMetrics
            })
        };
    }
    calculateAttendanceMetrics(records) {
        const totalDays = records.length;
        const presentDays = records.filter(r => r.checkOut).length;
        const lateCheckIns = records.filter(r => this.isLateCheckIn(r.checkIn)).length;
        let totalHours = 0;
        let totalOvertime = 0;
        records.forEach(record => {
            if (record.checkOut) {
                const duration = record.checkOut.getTime() - record.checkIn.getTime();
                const hours = duration / (1000 * 60 * 60);
                totalHours += hours;
                if (hours > 8)
                    totalOvertime += hours - 8;
            }
        });
        return {
            totalDays,
            presentDays,
            absentDays: totalDays - presentDays,
            attendanceRate: (presentDays / totalDays) * 100,
            averageCheckInTime: this.calculateAverageTime(records.map(r => r.checkIn)),
            averageCheckOutTime: this.calculateAverageTime(records.filter(r => r.checkOut).map(r => r.checkOut)),
            averageHoursWorked: totalHours / presentDays,
            totalOvertime,
            onTimeCheckIns: totalDays - lateCheckIns,
            lateCheckIns
        };
    }
    calculateClientVisitMetrics(visits) {
        const uniqueClients = new Set(visits.map(v => v.client?.uid)).size;
        const totalDuration = visits.reduce((sum, v) => sum + (Number(v.duration) || 0), 0);
        return {
            totalVisits: visits.length,
            uniqueClients,
            averageTimePerVisit: totalDuration / visits.length,
            totalDuration,
            byPurpose: this.groupBy(visits, 'checkInLocation'),
            conversionRate: 0
        };
    }
    calculateTaskMetrics(tasks) {
        const completed = tasks.filter(t => t.status === task_enums_1.TaskStatus.COMPLETED).length;
        const total = tasks.length;
        return {
            total,
            completed,
            inProgress: tasks.filter(t => t.status === task_enums_1.TaskStatus.IN_PROGRESS).length,
            pending: tasks.filter(t => t.status === task_enums_1.TaskStatus.PENDING).length,
            overdue: tasks.filter(t => t.isOverdue).length,
            completionRate: (completed / total) * 100,
            averageCompletionTime: this.calculateAverageCompletionTime(tasks),
            byPriority: {
                high: tasks.filter(t => t.priority === task_enums_1.TaskPriority.HIGH).length,
                medium: tasks.filter(t => t.priority === task_enums_1.TaskPriority.MEDIUM).length,
                low: tasks.filter(t => t.priority === task_enums_1.TaskPriority.LOW).length
            },
            byType: this.groupBy(tasks, 'taskType')
        };
    }
    calculateQuotationMetrics(leads) {
        const approved = leads.filter(q => q.status === lead_enums_1.LeadStatus.APPROVED);
        const total = leads.length;
        const totalValue = 0;
        return {
            total,
            approved: approved.length,
            rejected: leads.filter(q => q.status === lead_enums_1.LeadStatus.DECLINED).length,
            pending: leads.filter(q => q.status === lead_enums_1.LeadStatus.PENDING).length,
            conversionRate: (approved.length / total) * 100,
            averageValue: totalValue / approved.length,
            totalValue,
            byProduct: this.groupBy(leads, 'name')
        };
    }
    calculateRewardMetrics(achievements) {
        return {
            totalXP: achievements.reduce((sum, r) => sum + (r.xpValue || 0), 0),
            totalRewards: achievements.length,
            byCategory: this.groupBy(achievements, 'category'),
            achievements: achievements.map(r => ({
                name: r.name,
                earnedAt: r.createdAt,
                xpValue: r.xpValue
            }))
        };
    }
    calculateJournalMetrics(journals) {
        const byCategory = this.groupBy(journals, 'type');
        const sortedCategories = Object.entries(byCategory)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 5)
            .map(([category]) => category);
        return {
            total: journals.length,
            byCategory,
            averageEntriesPerDay: journals.length / this.getDaysBetween(journals[0]?.createdAt, journals[journals.length - 1]?.createdAt),
            topCategories: sortedCategories
        };
    }
    calculateProductivityMetrics(data) {
        const taskEfficiency = (data.tasks.completed / data.tasks.total) * 100;
        const clientHandling = data.clientVisits
            ? (data.clientVisits.conversionRate +
                (data.quotations?.conversionRate || 0)) / 2
            : 0;
        const responseTime = this.calculateAverageResponseTime(data);
        const qualityScore = this.calculateQualityScore(data);
        return {
            score: (taskEfficiency + clientHandling + qualityScore) / 3,
            taskEfficiency,
            clientHandling,
            responseTime,
            qualityScore
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
        const completedTasks = tasks.filter(t => t.status === task_enums_1.TaskStatus.COMPLETED && t.completionDate);
        if (!completedTasks.length)
            return 0;
        return completedTasks.reduce((sum, task) => {
            const duration = task.completionDate.getTime() - task.createdAt.getTime();
            return sum + duration;
        }, 0) / completedTasks.length / (1000 * 60 * 60);
    }
    groupBy(items, key) {
        return items.reduce((acc, item) => {
            const value = String(item[key]);
            acc[value] = (acc[value] || 0) + 1;
            return acc;
        }, {});
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
                    createdAt: (0, typeorm_2.Between)(dateRange.start, dateRange.end)
                }
            });
            const attendance = await this.attendanceRepository.find({
                where: {
                    owner: { uid: user.uid },
                    checkIn: (0, typeorm_2.Between)(dateRange.start, dateRange.end)
                }
            });
            const taskMetrics = this.calculateTaskMetrics(tasks);
            const attendanceMetrics = this.calculateAttendanceMetrics(attendance);
            const productivity = this.calculateProductivityMetrics({
                tasks: taskMetrics,
                attendance: attendanceMetrics
            });
            return {
                userId: user.uid,
                name: `${user.name} ${user.surname}`,
                score: productivity.score
            };
        }));
        return performanceScores.sort((a, b) => b.score - a.score).slice(0, 5);
    }
    async calculateOrganisationOverview(organisation, dateRange) {
        const [tasks, clients, leads] = await Promise.all([
            this.taskRepository.count({
                where: {
                    organisation: { ref: organisation.ref },
                    createdAt: (0, typeorm_2.Between)(dateRange.start, dateRange.end)
                }
            }),
            this.clientRepository.count({
                where: {
                    organisation: { ref: organisation.ref },
                    createdAt: (0, typeorm_2.Between)(dateRange.start, dateRange.end)
                }
            }),
            this.leadRepository.count({
                where: {
                    createdAt: (0, typeorm_2.Between)(dateRange.start, dateRange.end),
                    status: lead_enums_1.LeadStatus.CONVERTED
                }
            })
        ]);
        const activeUsers = await this.userRepository.count({
            where: {
                organisationRef: organisation.ref,
                status: 'active'
            }
        });
        return {
            totalUsers: organisation.users.length,
            activeUsers,
            totalTasks: tasks,
            totalClients: clients,
            totalQuotations: leads,
            totalRevenue: 0
        };
    }
    async calculateOrganisationTrends(organisation, dateRange) {
        return {
            taskCompletion: [],
            clientVisits: [],
            quotationConversion: [],
            revenue: [],
            productivity: []
        };
    }
    async calculateTopMetrics(organisation, dateRange) {
        return {
            performers: [],
            departments: [],
            products: []
        };
    }
};
exports.ReportsService = ReportsService;
exports.ReportsService = ReportsService = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, typeorm_1.InjectRepository)(check_in_entity_1.CheckIn)),
    __param(2, (0, typeorm_1.InjectRepository)(task_entity_1.Task)),
    __param(3, (0, typeorm_1.InjectRepository)(claim_entity_1.Claim)),
    __param(4, (0, typeorm_1.InjectRepository)(lead_entity_1.Lead)),
    __param(5, (0, typeorm_1.InjectRepository)(journal_entity_1.Journal)),
    __param(6, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(7, (0, typeorm_1.InjectRepository)(attendance_entity_1.Attendance)),
    __param(8, (0, typeorm_1.InjectRepository)(achievement_entity_1.Achievement)),
    __param(9, (0, typeorm_1.InjectRepository)(report_entity_1.Report)),
    __param(10, (0, typeorm_1.InjectRepository)(organisation_entity_1.Organisation)),
    __param(11, (0, typeorm_1.InjectRepository)(branch_entity_1.Branch)),
    __param(12, (0, typeorm_1.InjectRepository)(client_entity_1.Client)),
    __metadata("design:paramtypes", [config_1.ConfigService,
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
        typeorm_2.Repository])
], ReportsService);
//# sourceMappingURL=reports.service.js.map