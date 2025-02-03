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
const tracking_service_1 = require("../tracking/tracking.service");
let ReportsService = class ReportsService {
    constructor(reportRepository, leadService, journalService, claimsService, tasksService, shopService, attendanceService, newsService, userService, trackingService, eventEmitter, configService, rewardsService) {
        this.reportRepository = reportRepository;
        this.leadService = leadService;
        this.journalService = journalService;
        this.claimsService = claimsService;
        this.tasksService = tasksService;
        this.shopService = shopService;
        this.attendanceService = attendanceService;
        this.newsService = newsService;
        this.userService = userService;
        this.trackingService = trackingService;
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
    formatReportData(leadsStats, journalsStats, claimsStats, quotationsStats, tasksTotal, attendanceRecords, attendanceHours, trackingData, userRewards, previousDayQuotations, previousDayRevenue) {
        const currentRevenue = Number(quotationsStats?.quotations?.metrics?.grossQuotationValue) || 0;
        const currentQuotations = quotationsStats?.quotations?.metrics?.totalQuotations || 0;
        const sortedAttendance = [...attendanceRecords].sort((a, b) => a.checkIn.getTime() - b.checkIn.getTime());
        const firstCheckIn = sortedAttendance[0];
        const lastCheckOut = sortedAttendance[sortedAttendance.length - 1];
        const commonData = {
            leads: {
                total: leadsStats?.total || 0,
                review: leadsStats?.review || [],
                pending: leadsStats?.pending || [],
                approved: leadsStats?.approved || [],
                declined: leadsStats?.declined || []
            },
            journals: journalsStats || [],
            claims: {
                paid: claimsStats?.paid || [],
                pending: claimsStats?.pending || [],
                approved: claimsStats?.approved || [],
                declined: claimsStats?.declined || [],
                totalValue: this.formatCurrency(claimsStats?.totalValue || 0)
            },
            tasks: tasksTotal || 0,
            attendance: sortedAttendance.length > 0 ? {
                totalHours: attendanceHours,
                startTime: firstCheckIn.checkIn.toLocaleTimeString(),
                endTime: lastCheckOut.checkOut?.toLocaleTimeString(),
                duration: `${Math.floor(attendanceHours)}h ${Math.round((attendanceHours % 1) * 60)}m`,
                status: lastCheckOut.status,
                checkInLocation: firstCheckIn.checkInLatitude && firstCheckIn.checkInLongitude ? {
                    latitude: firstCheckIn.checkInLatitude,
                    longitude: firstCheckIn.checkInLongitude,
                    notes: firstCheckIn.checkInNotes || '',
                } : undefined,
                checkOutLocation: lastCheckOut.checkOutLatitude && lastCheckOut.checkOutLongitude ? {
                    latitude: lastCheckOut.checkOutLatitude,
                    longitude: lastCheckOut.checkOutLongitude,
                    notes: lastCheckOut.checkOutNotes || '',
                } : undefined,
                verifiedAt: firstCheckIn.verifiedAt?.toISOString(),
                verifiedBy: firstCheckIn.verifiedBy,
            } : undefined,
            quotations: {
                totalQuotations: currentQuotations,
                grossQuotationValue: this.formatCurrency(currentRevenue),
                averageQuotationValue: this.formatCurrency(currentQuotations > 0 ? currentRevenue / currentQuotations : 0),
                growth: this.calculateGrowth(currentQuotations, previousDayQuotations),
                revenueGrowth: this.calculateGrowth(currentRevenue, previousDayRevenue),
            },
            tracking: trackingData ? {
                totalDistance: trackingData?.totalDistance,
                locationAnalysis: {
                    timeSpentByLocation: trackingData?.locationAnalysis?.timeSpentByLocation || {},
                    averageTimePerLocation: trackingData?.locationAnalysis?.averageTimePerLocation || 0
                }
            } : null,
            xp: {
                level: userRewards?.rank || 1,
                currentXP: userRewards?.totalXP || 0,
                todayXP: userRewards?.todayXP || 0,
            },
            metrics: {
                totalQuotations: currentQuotations,
                totalRevenue: this.formatCurrency(currentRevenue),
                newCustomers: leadsStats?.total || 0,
                customerGrowth: this.calculateGrowth(leadsStats?.total || 0, (leadsStats?.total || 0) - (leadsStats?.pending?.length || 0)),
                userSpecific: {
                    todayLeads: leadsStats?.pending?.length || 0,
                    todayClaims: claimsStats?.pending?.length || 0,
                    todayTasks: tasksTotal || 0,
                    todayQuotations: currentQuotations,
                    hoursWorked: attendanceHours,
                }
            }
        };
        return {
            reportMetadata: commonData,
            emailData: {
                metrics: {
                    ...commonData.metrics,
                    xp: commonData.xp,
                    attendance: commonData.attendance,
                    quotationGrowth: commonData.quotations.growth,
                    revenueGrowth: commonData.quotations.revenueGrowth
                },
                tracking: trackingData ? {
                    totalDistance: trackingData?.totalDistance,
                    locations: Object.entries(trackingData.locationAnalysis.timeSpentByLocation || {}).map(([address, minutes]) => ({
                        address,
                        timeSpent: `${Math.round(Number(minutes))} minutes`
                    })),
                    averageTimePerLocation: `${Math.round(trackingData.locationAnalysis.averageTimePerLocation || 0)} minutes`
                } : undefined
            }
        };
    }
    async managerDailyReport() {
        try {
            const allData = await Promise.all([
                this.leadService.getLeadsForDate(new Date()),
                this.journalService.getJournalsForDate(new Date()),
                this.claimsService.getClaimsForDate(new Date()),
                this.shopService.getQuotationsForDate(new Date()),
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
                    pending: tasksStats?.PENDING,
                    completed: tasksStats?.COMPLETED,
                    missed: tasksStats?.MISSED,
                    postponed: tasksStats?.POSTPONED,
                    total: Object.values(tasksStats || {}).reduce((acc, curr) => acc + curr, 0)
                },
                attendance: {
                    attendance: attendanceStats?.metrics?.attendancePercentage,
                    present: attendanceStats?.metrics?.totalPresent,
                    total: attendanceStats?.metrics?.totalEmployees
                },
                orders: {
                    pending: ordersStats?.quotations?.pending?.length,
                    processing: ordersStats?.quotations?.processing?.length,
                    completed: ordersStats?.quotations?.completed?.length,
                    cancelled: ordersStats?.quotations?.cancelled?.length,
                    postponed: ordersStats?.quotations?.postponed?.length,
                    rejected: ordersStats?.quotations?.rejected?.length,
                    approved: ordersStats?.quotations?.approved?.length,
                    metrics: {
                        totalQuotations: ordersStats?.quotations?.metrics?.totalQuotations,
                        grossQuotationValue: ordersStats?.quotations?.metrics?.grossQuotationValue || 0,
                        averageQuotationValue: ordersStats?.quotations?.metrics?.averageQuotationValue || 0
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
                this.shopService.getQuotationsForDate(date),
                this.tasksService.getTasksForDate(date),
                this.attendanceService.getAttendanceForDate(date),
                reference ? this.rewardsService.getUserRewards(Number(reference)) : null,
                reference ? this.userService.findOne(Number(reference)) : null,
                reference ? this.trackingService.getDailyTracking(Number(reference), date) : null
            ]);
            const [{ leads: leadsStats }, { journals: journalsStats }, { claims: claimsStats }, { stats: quotationsStats }, { total: tasksTotal }, { totalHours: attendanceHours, attendanceRecords }, userRewards, userData, { data: trackingData }] = allData;
            const previousDay = new Date(date);
            previousDay.setDate(previousDay.getDate() - 1);
            const previousDayStats = await this.shopService.getQuotationsForDate(previousDay);
            const previousDayQuotations = previousDayStats?.stats?.quotations?.metrics?.totalQuotations || 0;
            const previousDayRevenue = Number(previousDayStats?.stats?.quotations?.metrics?.grossQuotationValue) || 0;
            const { reportMetadata, emailData } = this.formatReportData(leadsStats, journalsStats, claimsStats, quotationsStats, tasksTotal, attendanceRecords || [], attendanceHours || 0, trackingData, userRewards, previousDayQuotations, previousDayRevenue);
            const report = this.reportRepository.create({
                title: 'Daily Report',
                description: `Daily report for the date ${new Date()}`,
                type: reports_enums_1.ReportType.DAILY,
                metadata: reportMetadata,
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
                const emailTemplate = {
                    name: userData.user.username,
                    date: `${new Date()}`,
                    ...emailData
                };
                this.eventEmitter.emit('send.email', email_enums_1.EmailType.DAILY_REPORT, [userData.user.email], emailTemplate);
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
        tracking_service_1.TrackingService,
        event_emitter_2.EventEmitter2,
        config_1.ConfigService,
        rewards_service_1.RewardsService])
], ReportsService);
//# sourceMappingURL=reports.service.js.map