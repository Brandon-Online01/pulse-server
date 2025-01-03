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
var ReportsService_1;
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
let ReportsService = ReportsService_1 = class ReportsService {
    constructor(reportRepository, leadService, journalService, claimsService, tasksService, shopService, attendanceService, newsService, userService, eventEmitter, configService) {
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
        this.logger = new common_1.Logger(ReportsService_1.name);
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
                reference ? this.userService.findOne(reference.toString()) : null
            ]);
            const [{ leads: leadsStats }, { journals: journalsStats }, { claims: claimsStats }, { stats: ordersStats }, { total: tasksTotal }, { totalHours: attendanceHours }, { data: newsItems }, userData] = allData;
            const response = {
                date: new Date().toISOString(),
                overview: {
                    leads: {
                        pending: leadsStats?.pending?.length || 0,
                        approved: leadsStats?.approved?.length || 0,
                        inReview: leadsStats?.review?.length || 0,
                        declined: leadsStats?.declined?.length || 0,
                        total: leadsStats?.total || 0
                    },
                    journals: {
                        total: journalsStats?.length || 0,
                    },
                    claims: {
                        pending: claimsStats?.pending?.length || 0,
                        approved: claimsStats?.approved?.length || 0,
                        declined: claimsStats?.declined?.length || 0,
                        paid: claimsStats?.paid?.length || 0,
                        totalValue: claimsStats?.totalValue || 0
                    },
                    tasks: {
                        total: tasksTotal || 0,
                        pending: tasksTotal || 0
                    },
                    attendance: {
                        hoursWorked: attendanceHours || 0
                    },
                    orders: {
                        pending: ordersStats?.orders?.pending?.length || 0,
                        processing: ordersStats?.orders?.processing?.length || 0,
                        completed: ordersStats?.orders?.completed?.length || 0,
                        metrics: ordersStats?.orders?.metrics || {
                            totalOrders: 0,
                            grossOrderValue: '0',
                            averageOrderValue: '0'
                        }
                    },
                    news: {
                        total: newsItems?.filter(item => new Date(item.createdAt).toDateString() === new Date().toDateString()).length || 0
                    }
                }
            };
            if (reference && userData?.user) {
                const userSpecificData = await Promise.all([
                    this.leadService.leadsByUser(Number(userData.user.uid)),
                    this.claimsService.claimsByUser(Number(userData.user.uid)),
                    this.tasksService.tasksByUser(Number(userData.user.uid)),
                    this.shopService.getOrdersByUser(Number(userData.user.uid)),
                    this.attendanceService.getCurrentShiftHours(Number(userData.user.uid))
                ]);
                const [userLeads, userClaims, userTasks, userOrders, currentShiftHours] = userSpecificData;
                response['userSpecific'] = {
                    user: {
                        uid: Number(userData.user.uid),
                        name: userData.user.username,
                    },
                    todaysActivity: {
                        leads: userLeads?.leads?.filter(lead => new Date(lead?.createdAt).toDateString() === new Date().toDateString()).length || 0,
                        claims: userClaims?.claims?.filter(claim => new Date(claim?.createdAt).toDateString() === new Date().toDateString()).length || 0,
                        tasks: userTasks?.tasks?.filter(task => new Date(task?.createdAt).toDateString() === new Date().toDateString()).length || 0,
                        orders: userOrders?.orders?.filter(order => new Date(order?.orderDate).toDateString() === new Date().toDateString()).length || 0,
                        currentShiftHours: currentShiftHours || 0
                    }
                };
            }
            const report = this.reportRepository.create({
                title: 'Daily Report',
                description: `Daily report for the date ${new Date()}`,
                type: reports_enums_1.ReportType.DAILY,
                metadata: response,
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
            const recipients = [user_enums_1.AccessLevel.ADMIN, user_enums_1.AccessLevel.MANAGER, user_enums_1.AccessLevel.OWNER, user_enums_1.AccessLevel.SUPERVISOR, user_enums_1.AccessLevel.USER];
            this.eventEmitter.emit('send.notification', notification, recipients);
            if (userData?.user?.email) {
                const previousDayOrders = ordersStats?.orders?.metrics?.totalOrders || 0;
                const previousDayRevenue = Number(ordersStats?.orders?.metrics?.grossOrderValue?.replace(/[^0-9.-]+/g, '')) || 0;
                const currentRevenue = Number(response?.overview?.orders?.metrics?.grossOrderValue) || 0;
                const currentOrders = response?.overview?.orders?.metrics?.totalOrders || 0;
                const totalTasks = response?.overview?.tasks?.total || 0;
                const pendingTasks = response?.overview?.tasks?.pending || 0;
                const satisfactionRate = totalTasks > 0
                    ? Math.round(((totalTasks - pendingTasks) / totalTasks) * 100)
                    : 98;
                const emailData = {
                    name: userData?.user?.username,
                    date: new Date(),
                    metrics: {
                        totalOrders: currentOrders,
                        totalRevenue: this.formatCurrency(currentRevenue),
                        newCustomers: response.overview?.leads?.total || 0,
                        satisfactionRate: Math.max(0, Math.min(100, satisfactionRate)),
                        orderGrowth: this.calculateGrowth(currentOrders, previousDayOrders),
                        revenueGrowth: this.calculateGrowth(currentRevenue, previousDayRevenue),
                        customerGrowth: this.calculateGrowth(response.overview?.leads?.total || 0, (response.overview?.leads?.total || 0) - (response.overview?.leads?.pending || 0))
                    }
                };
                this.eventEmitter.emit('send.email', email_enums_1.EmailType.DAILY_REPORT, [userData?.user?.email], emailData);
                const userSpecificData = response['userSpecific'];
                if (userSpecificData) {
                    const internalEmailData = {
                        name: 'Management Team',
                        date: new Date(),
                        metrics: {
                            ...emailData.metrics,
                            userSpecific: {
                                name: userSpecificData.user?.name,
                                todayLeads: userSpecificData.todaysActivity?.leads || 0,
                                todayClaims: userSpecificData.todaysActivity?.claims || 0,
                                todayTasks: userSpecificData.todaysActivity?.tasks || 0,
                                todayOrders: userSpecificData.todaysActivity?.orders || 0,
                                hoursWorked: userSpecificData.todaysActivity?.currentShiftHours || 0
                            }
                        }
                    };
                    const internalEmail = this.configService.get('INTERNAL_BROADCAST_EMAIL');
                    if (internalEmail) {
                        this.eventEmitter.emit('send.email', email_enums_1.EmailType.DAILY_REPORT, [internalEmail], internalEmailData);
                    }
                }
            }
            return response;
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
exports.ReportsService = ReportsService = ReportsService_1 = __decorate([
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
        config_1.ConfigService])
], ReportsService);
//# sourceMappingURL=reports.service.js.map