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
const leads_service_1 = require("../leads/leads.service");
const journal_service_1 = require("../journal/journal.service");
const claims_service_1 = require("../claims/claims.service");
const tasks_service_1 = require("../tasks/tasks.service");
const attendance_service_1 = require("../attendance/attendance.service");
const shop_service_1 = require("../shop/shop.service");
const news_service_1 = require("../news/news.service");
const user_service_1 = require("../user/user.service");
const event_emitter_1 = require("@nestjs/event-emitter");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const report_entity_1 = require("./entities/report.entity");
const reports_enums_1 = require("../lib/enums/reports.enums");
const event_emitter_2 = require("@nestjs/event-emitter");
const notification_enums_1 = require("../lib/enums/notification.enums");
const user_enums_1 = require("../lib/enums/user.enums");
const email_enums_1 = require("../lib/enums/email.enums");
const config_1 = require("@nestjs/config");
const rewards_service_1 = require("../rewards/rewards.service");
let ReportsService = class ReportsService {
    constructor(reportRepository, leadService, journalService, claimsService, tasksService, shopService, attendanceService, newsService, userService, eventEmitter, configService, rewardsService) {
        this.reportRepository = reportRepository;
        this.leadService = leadService;
        this.journalService = journalService;
        this.claimsService = claimsService;
        this.tasksService = tasksService;
        this.shopService = shopService;
        this.attendanceService = attendanceService;
        this.newsService = newsService;
        this.userService = userService;
        this.eventEmitter = eventEmitter;
        this.configService = configService;
        this.rewardsService = rewardsService;
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
    calculateGrowth(current, previous) {
        if (previous === 0)
            return '+100%';
        const growth = ((current - previous) / previous) * 100;
        return `${growth >= 0 ? '+' : ''}${growth.toFixed(1)}%`;
    }
    handleError(error) {
        return {
            message: error?.message || 'An error occurred',
            statusCode: error?.status || 500
        };
    }
    async managerDailyReport() {
        try {
            const allData = await Promise.all([
                this.leadService.getLeadsForDate(new Date()),
                this.journalService.getJournalsForDate(new Date()),
                this.claimsService.getClaimsForDate(new Date()),
                this.shopService.getOrdersForDate(new Date()),
                this.tasksService.getTaskStatusSummary(),
                this.attendanceService.getMonthlyAttendanceStats()
            ]);
            const [{ leads: leadsStats }, { journals: journalsStats }, { claims: claimsStats }, { stats: ordersStats }, { byStatus: tasksStats }, { stats: attendanceStats }] = allData;
            const response = {
                leads: {
                    pending: leadsStats?.pending?.length,
                    approved: leadsStats?.approved?.length,
                    inReview: leadsStats?.review?.length,
                    declined: leadsStats?.declined?.length,
                    total: leadsStats?.total
                },
                journals: {
                    total: journalsStats?.length,
                },
                claims: {
                    pending: claimsStats?.pending?.length || 0,
                    approved: claimsStats?.approved?.length || 0,
                    declined: claimsStats?.declined?.length || 0,
                    paid: claimsStats?.paid?.length || 0,
                    totalValue: claimsStats?.totalValue || 0
                },
                tasks: {
                    pending: tasksStats?.pending,
                    completed: tasksStats?.completed,
                    missed: tasksStats?.missed,
                    postponed: tasksStats?.postponed,
                    total: Object?.values(tasksStats)?.reduce((acc, curr) => acc + curr, 0)
                },
                attendance: {
                    attendance: attendanceStats?.metrics?.attendancePercentage,
                    present: attendanceStats?.metrics?.totalPresent,
                    total: attendanceStats?.metrics?.totalEmployees
                },
                orders: {
                    pending: ordersStats?.orders?.pending?.length,
                    processing: ordersStats?.orders?.processing?.length,
                    completed: ordersStats?.orders?.completed?.length,
                    cancelled: ordersStats?.orders?.cancelled?.length,
                    postponed: ordersStats?.orders?.postponed?.length,
                    outForDelivery: ordersStats?.orders?.outForDelivery?.length,
                    delivered: ordersStats?.orders?.delivered?.length,
                    rejected: ordersStats?.orders?.rejected?.length,
                    approved: ordersStats?.orders?.approved?.length,
                    metrics: {
                        totalOrders: ordersStats?.orders?.metrics?.totalOrders,
                        grossOrderValue: ordersStats?.orders?.metrics?.grossOrderValue || 0,
                        averageOrderValue: ordersStats?.orders?.metrics?.averageOrderValue || 0
                    }
                },
            };
            return response;
        }
        catch (error) {
            return this.handleError(error);
        }
    }
    async userDailyReport(reference) {
        try {
            const date = new Date();
            const allData = await Promise.all([
                this.leadService.getLeadsForDate(date),
                this.journalService.getJournalsForDate(date),
                this.claimsService.getClaimsForDate(date),
                this.shopService.getOrdersForDate(date),
                this.tasksService.getTasksForDate(date),
                this.attendanceService.getAttendanceForDate(date),
                this.newsService.findAll(),
                this.rewardsService.getUserRewards(Number(reference)),
                reference ? this.userService.findOne(Number(reference)) : null
            ]);
            const [{ leads: leadsStats }, { journals: journalsStats }, { claims: claimsStats }, { stats: ordersStats }, { total: tasksTotal }, { totalHours: attendanceHours, activeShifts, attendanceRecords }, { data: newsItems }, { rewards: userRewards }, userData] = allData;
            const report = this.reportRepository.create({
                title: 'Daily Report',
                description: `Daily report for the date ${new Date()}`,
                type: reports_enums_1.ReportType.DAILY,
                metadata: {
                    leads: leadsStats,
                    journals: journalsStats,
                    claims: claimsStats,
                    tasks: tasksTotal,
                    attendance: { totalHours: attendanceHours, activeShifts, attendanceRecords },
                    orders: ordersStats?.orders,
                    news: newsItems,
                    rewards: userRewards
                },
                owner: userData?.user,
                branch: userData?.user?.branch
            });
            await this.reportRepository.save(report);
            const notification = {
                type: notification_enums_1.NotificationType.USER,
                title: 'Daily Report Generated',
                message: `Your daily activity report for ${new Date().toLocaleDateString()} has been generated`,
                status: notification_enums_1.NotificationStatus.UNREAD,
                owner: userData?.user
            };
            const recipients = [user_enums_1.AccessLevel.USER];
            this.eventEmitter.emit('send.notification', notification, recipients);
            if (userData?.user?.email) {
                const previousDayOrders = ordersStats?.orders?.metrics?.totalOrders || 0;
                const previousDayRevenue = Number(ordersStats?.orders?.metrics?.grossOrderValue?.replace(/[^0-9.-]+/g, '')) || 0;
                const currentRevenue = Number(ordersStats?.orders?.metrics?.grossOrderValue) || 0;
                const currentOrders = ordersStats?.orders?.metrics?.totalOrders || 0;
                const emailData = {
                    name: userData.user.username,
                    date: new Date(),
                    metrics: {
                        xp: {
                            level: userRewards?.rewards?.rank || 1,
                            currentXP: userRewards?.rewards?.totalXP || 0,
                            todayXP: userRewards?.rewards?.todayXP || 0,
                        },
                        attendance: attendanceRecords[0] ? {
                            startTime: attendanceRecords[0].checkIn.toLocaleTimeString(),
                            endTime: attendanceRecords[0].checkOut?.toLocaleTimeString(),
                            totalHours: attendanceHours,
                            duration: attendanceRecords[0].duration,
                            status: attendanceRecords[0].status,
                            checkInLocation: attendanceRecords[0].checkInLatitude && attendanceRecords[0].checkInLongitude ? {
                                latitude: attendanceRecords[0].checkInLatitude,
                                longitude: attendanceRecords[0].checkInLongitude,
                                notes: attendanceRecords[0].checkInNotes,
                            } : undefined,
                            checkOutLocation: attendanceRecords[0].checkOutLatitude && attendanceRecords[0].checkOutLongitude ? {
                                latitude: attendanceRecords[0].checkOutLatitude,
                                longitude: attendanceRecords[0].checkOutLongitude,
                                notes: attendanceRecords[0].checkOutNotes,
                            } : undefined,
                            verifiedAt: attendanceRecords[0].verifiedAt?.toISOString(),
                            verifiedBy: attendanceRecords[0].verifiedBy,
                        } : undefined,
                        totalOrders: currentOrders,
                        totalRevenue: this.formatCurrency(currentRevenue),
                        newCustomers: leadsStats?.total || 0,
                        orderGrowth: this.calculateGrowth(currentOrders, previousDayOrders),
                        revenueGrowth: this.calculateGrowth(currentRevenue, previousDayRevenue),
                        customerGrowth: this.calculateGrowth(leadsStats?.total || 0, (leadsStats?.total || 0) - (leadsStats?.pending?.length || 0)),
                        userSpecific: {
                            todayLeads: leadsStats?.pending?.length || 0,
                            todayClaims: claimsStats?.pending?.length || 0,
                            todayTasks: tasksTotal || 0,
                            todayOrders: currentOrders,
                            hoursWorked: attendanceHours,
                        },
                    },
                };
                this.eventEmitter.emit('send.email', email_enums_1.EmailType.DAILY_REPORT, [userData.user.email], emailData);
            }
            return report;
        }
        catch (error) {
            return this.handleError(error);
        }
    }
};
exports.ReportsService = ReportsService;
__decorate([
    (0, event_emitter_1.OnEvent)('daily-report'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ReportsService.prototype, "userDailyReport", null);
exports.ReportsService = ReportsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(report_entity_1.Report)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        leads_service_1.LeadsService,
        journal_service_1.JournalService,
        claims_service_1.ClaimsService,
        tasks_service_1.TasksService,
        shop_service_1.ShopService,
        attendance_service_1.AttendanceService,
        news_service_1.NewsService,
        user_service_1.UserService,
        event_emitter_2.EventEmitter2,
        config_1.ConfigService,
        rewards_service_1.RewardsService])
], ReportsService);
//# sourceMappingURL=reports.service.js.map