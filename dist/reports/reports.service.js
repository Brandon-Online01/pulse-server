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
const rewards_service_1 = require("../rewards/rewards.service");
const tracking_service_1 = require("../tracking/tracking.service");
const generate_report_dto_1 = require("./dto/generate-report.dto");
const date_fns_1 = require("date-fns");
const check_in_entity_1 = require("../check-ins/entities/check-in.entity");
const date_fns_2 = require("date-fns");
const typeorm_3 = require("typeorm");
let ReportsService = ReportsService_1 = class ReportsService {
    constructor(reportRepository, checkInRepository, leadService, journalService, claimsService, tasksService, shopService, attendanceService, newsService, userService, trackingService, eventEmitter, configService, rewardsService) {
        this.reportRepository = reportRepository;
        this.checkInRepository = checkInRepository;
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
        this.logger = new common_1.Logger(ReportsService_1.name);
        this.currencyLocale = this.configService.get('CURRENCY_LOCALE') || 'en-ZA';
        this.currencyCode = this.configService.get('CURRENCY_CODE') || 'ZAR';
        this.currencySymbol = this.configService.get('CURRENCY_SYMBOL') || 'R';
    }
    formatCurrency(amount) {
        if (isNaN(amount) || amount === null || amount === undefined)
            return `${this.currencySymbol}0`;
        return new Intl.NumberFormat(this.currencyLocale, {
            style: 'currency',
            currency: this.currencyCode,
        })
            .format(amount)
            .replace(this.currencyCode, this.currencySymbol);
    }
    getDateRange(date) {
        const startDate = new Date(date);
        startDate.setHours(0, 0, 0, 0);
        const endDate = new Date(date);
        endDate.setHours(23, 59, 59, 999);
        return { startDate, endDate };
    }
    getPreviousDateRange(date) {
        const previousDate = new Date(date);
        previousDate.setDate(previousDate.getDate() - 1);
        return this.getDateRange(previousDate);
    }
    calculateGrowth(current, previous) {
        if (current === 0 && previous === 0)
            return '0%';
        if (previous === 0) {
            if (current === 0)
                return '0%';
            return 'New';
        }
        const growth = ((current - previous) / previous) * 100;
        if (isNaN(growth) || !isFinite(growth))
            return '0%';
        return `${growth > 0 ? '+' : ''}${growth.toFixed(1)}%`;
    }
    calculateTrend(current, previous, type) {
        if (previous === 0)
            return '0%';
        const growth = ((current - previous) / previous) * 100;
        if (isNaN(growth) || !isFinite(growth))
            return '0%';
        switch (type) {
            case 'leads':
                return growth > 100 ? '+100%' : `${growth > 0 ? '+' : ''}${Math.min(Math.abs(growth), 100).toFixed(1)}%`;
            case 'claims':
                return `${growth > 0 ? '+' : ''}${Math.min(Math.abs(growth), 200).toFixed(1)}%`;
            case 'tasks':
                const completionRate = (current / (previous + current)) * 100;
                return `${completionRate.toFixed(1)}%`;
            case 'quotations':
                const normalizedGrowth = Math.min(Math.abs(growth), 150);
                return `${growth > 0 ? '+' : ''}${normalizedGrowth.toFixed(1)}%`;
            case 'attendance':
                return `${Math.min(Math.max(growth, 0), 100).toFixed(1)}%`;
            default:
                return `${growth > 0 ? '+' : ''}${growth.toFixed(1)}%`;
        }
    }
    handleError(error) {
        return {
            message: error?.message || 'An error occurred',
            statusCode: error?.status || 500,
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
                declined: leadsStats?.declined || [],
            },
            journals: journalsStats || [],
            claims: {
                paid: claimsStats?.paid || [],
                pending: claimsStats?.pending || [],
                approved: claimsStats?.approved || [],
                declined: claimsStats?.declined || [],
                totalValue: this.formatCurrency(claimsStats?.totalValue || 0),
            },
            tasks: tasksTotal || 0,
            attendance: sortedAttendance.length > 0
                ? {
                    totalHours: attendanceHours,
                    startTime: firstCheckIn.checkIn.toLocaleTimeString(),
                    endTime: lastCheckOut.checkOut?.toLocaleTimeString(),
                    duration: `${Math.floor(attendanceHours)}h ${Math.round((attendanceHours % 1) * 60)}m`,
                    status: lastCheckOut.status,
                    checkInLocation: firstCheckIn.checkInLatitude && firstCheckIn.checkInLongitude
                        ? {
                            latitude: firstCheckIn.checkInLatitude,
                            longitude: firstCheckIn.checkInLongitude,
                            notes: firstCheckIn.checkInNotes || '',
                        }
                        : undefined,
                    checkOutLocation: lastCheckOut.checkOutLatitude && lastCheckOut.checkOutLongitude
                        ? {
                            latitude: lastCheckOut.checkOutLatitude,
                            longitude: lastCheckOut.checkOutLongitude,
                            notes: lastCheckOut.checkOutNotes || '',
                        }
                        : undefined,
                    verifiedAt: firstCheckIn.verifiedAt?.toISOString(),
                    verifiedBy: firstCheckIn.verifiedBy,
                }
                : undefined,
            quotations: {
                totalQuotations: currentQuotations,
                grossQuotationValue: this.formatCurrency(currentRevenue),
                averageQuotationValue: this.formatCurrency(currentQuotations > 0 ? currentRevenue / currentQuotations : 0),
                growth: this.calculateGrowth(currentQuotations, previousDayQuotations),
                revenueGrowth: this.calculateGrowth(currentRevenue, previousDayRevenue),
            },
            tracking: trackingData
                ? {
                    totalDistance: trackingData?.totalDistance,
                    locationAnalysis: {
                        timeSpentByLocation: trackingData?.locationAnalysis?.timeSpentByLocation || {},
                        averageTimePerLocation: trackingData?.locationAnalysis?.averageTimePerLocation || 0,
                    },
                }
                : null,
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
                },
            },
        };
        return {
            reportMetadata: commonData,
            emailData: {
                metrics: {
                    ...commonData.metrics,
                    xp: commonData.xp,
                    attendance: commonData.attendance,
                    quotationGrowth: commonData.quotations.growth,
                    revenueGrowth: commonData.quotations.revenueGrowth,
                },
                tracking: trackingData
                    ? {
                        totalDistance: trackingData?.totalDistance,
                        locations: Object.entries(trackingData.locationAnalysis.timeSpentByLocation || {}).map(([address, minutes]) => ({
                            address,
                            timeSpent: `${Math.round(Number(minutes))} minutes`,
                        })),
                        averageTimePerLocation: `${Math.round(trackingData.locationAnalysis.averageTimePerLocation || 0)} minutes`,
                    }
                    : undefined,
            },
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
                this.attendanceService.getMonthlyAttendanceStats(),
            ]);
            const [{ leads: leadsStats }, { journals: journalsStats }, { claims: claimsStats }, { stats: ordersStats }, { byStatus: tasksStats }, { stats: attendanceStats },] = allData;
            const previousDate = new Date();
            previousDate.setDate(previousDate.getDate() - 1);
            const [previousClaims, previousQuotations] = await Promise.all([
                this.claimsService.getClaimsForDate(previousDate),
                this.shopService.getQuotationsForDate(previousDate),
            ]);
            const response = {
                leads: {
                    pending: leadsStats?.pending?.length || 0,
                    approved: leadsStats?.approved?.length || 0,
                    inReview: leadsStats?.review?.length || 0,
                    declined: leadsStats?.declined?.length || 0,
                    total: leadsStats?.total || 0,
                    metrics: {
                        leadTrends: {
                            growth: this.calculateTrend(leadsStats?.total || 0, (leadsStats?.total || 0) - (leadsStats?.pending?.length || 0), 'leads')
                        }
                    }
                },
                claims: {
                    pending: claimsStats?.pending?.length || 0,
                    approved: claimsStats?.approved?.length || 0,
                    declined: claimsStats?.declined?.length || 0,
                    paid: claimsStats?.paid?.length || 0,
                    total: (claimsStats?.paid?.length || 0) + (claimsStats?.pending?.length || 0) +
                        (claimsStats?.approved?.length || 0) + (claimsStats?.declined?.length || 0),
                    totalValue: this.formatCurrency(Number(claimsStats?.totalValue || 0)),
                    metrics: {
                        valueGrowth: this.calculateTrend(Number(claimsStats?.totalValue || 0), Number(previousClaims?.claims?.totalValue || 0), 'claims')
                    }
                },
                tasks: {
                    pending: tasksStats?.PENDING || 0,
                    completed: tasksStats?.COMPLETED || 0,
                    missed: tasksStats?.MISSED || 0,
                    postponed: tasksStats?.POSTPONED || 0,
                    total: Object.values(tasksStats || {}).reduce((acc, curr) => acc + curr, 0),
                    metrics: {
                        taskTrends: {
                            growth: this.calculateTrend(tasksStats?.COMPLETED || 0, tasksStats?.PENDING || 0, 'tasks')
                        }
                    }
                },
                orders: {
                    pending: ordersStats?.quotations?.pending?.length || 0,
                    processing: ordersStats?.quotations?.processing?.length || 0,
                    completed: ordersStats?.quotations?.completed?.length || 0,
                    cancelled: ordersStats?.quotations?.cancelled?.length || 0,
                    postponed: ordersStats?.quotations?.postponed?.length || 0,
                    rejected: ordersStats?.quotations?.rejected?.length || 0,
                    approved: ordersStats?.quotations?.approved?.length || 0,
                    metrics: {
                        totalQuotations: ordersStats?.quotations?.metrics?.totalQuotations || 0,
                        grossQuotationValue: this.formatCurrency(Number(ordersStats?.quotations?.metrics?.grossQuotationValue || 0)),
                        averageQuotationValue: this.formatCurrency(Number(ordersStats?.quotations?.metrics?.averageQuotationValue || 0)),
                        quotationTrends: {
                            growth: this.calculateTrend(ordersStats?.quotations?.metrics?.totalQuotations || 0, previousQuotations?.stats?.quotations?.metrics?.totalQuotations || 0, 'quotations')
                        }
                    }
                },
                attendance: {
                    attendance: attendanceStats?.metrics?.attendancePercentage || 0,
                    present: attendanceStats?.metrics?.totalPresent || 0,
                    total: attendanceStats?.metrics?.totalEmployees || 0,
                    metrics: {
                        attendanceTrends: {
                            growth: this.calculateTrend(attendanceStats?.metrics?.attendancePercentage || 0, attendanceStats?.metrics?.attendancePercentage || 0, 'attendance')
                        }
                    }
                }
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
            const { startDate, endDate } = this.getDateRange(date);
            const { startDate: prevStartDate, endDate: prevEndDate } = this.getPreviousDateRange(date);
            const [{ leads: leadsStats }, { journals: journalsStats }, { claims: claimsStats }, { stats: quotationsStats }, { total: tasksTotal }, { totalHours: attendanceHours, attendanceRecords }, userRewards, userData, { data: trackingData }, previousDayStats, previousClaims] = await Promise.all([
                this.leadService.getLeadsForDate(date),
                this.journalService.getJournalsForDate(date),
                this.claimsService.getClaimsForDate(date),
                this.shopService.getQuotationsForDate(date),
                this.tasksService.getTasksForDate(date),
                this.attendanceService.getAttendanceForDate(date),
                reference ? this.rewardsService.getUserRewards(Number(reference)) : null,
                reference ? this.userService.findOne(Number(reference)) : null,
                reference ? this.trackingService.getDailyTracking(Number(reference), date) : null,
                this.shopService.getQuotationsForDate(prevStartDate),
                this.claimsService.getClaimsForDate(prevStartDate)
            ]);
            const previousDayQuotations = previousDayStats?.stats?.quotations?.metrics?.totalQuotations || 0;
            const previousDayRevenue = Number(previousDayStats?.stats?.quotations?.metrics?.grossQuotationValue) || 0;
            const { reportMetadata, emailData } = this.formatReportData(leadsStats, journalsStats, claimsStats, quotationsStats, tasksTotal, attendanceRecords || [], attendanceHours || 0, trackingData, userRewards, previousDayQuotations, previousDayRevenue);
            const report = this.reportRepository.create({
                title: 'Daily Report',
                description: `Daily report for ${startDate.toLocaleDateString()}`,
                type: reports_enums_1.ReportType.DAILY,
                metadata: reportMetadata,
                owner: userData?.user,
                branch: userData?.user?.branch,
            });
            await this.reportRepository.save(report);
            const notification = {
                type: notification_enums_1.NotificationType.USER,
                title: 'Daily Report Generated',
                message: `Your daily activity report for ${startDate.toLocaleDateString()} has been generated`,
                status: notification_enums_1.NotificationStatus.UNREAD,
                owner: userData?.user,
            };
            const recipients = [user_enums_1.AccessLevel.USER];
            this.eventEmitter.emit('send.notification', notification, recipients);
            if (userData?.user?.email) {
                const emailTemplate = {
                    name: userData.user.username,
                    date: startDate.toLocaleDateString(),
                    ...emailData,
                };
                this.eventEmitter.emit('send.email', email_enums_1.EmailType.DAILY_REPORT, [userData.user.email], emailTemplate);
            }
            return report;
        }
        catch (error) {
            return this.handleError(error);
        }
    }
    async getComparisonData(params) {
        const startDate = new Date(params.startDate);
        const endDate = new Date(params.endDate);
        let comparisonStartDate;
        let comparisonEndDate;
        switch (params.comparison?.type) {
            case generate_report_dto_1.ComparisonType.YEAR_OVER_YEAR:
                comparisonStartDate = (0, date_fns_2.subYears)(startDate, 1);
                comparisonEndDate = (0, date_fns_2.subYears)(endDate, 1);
                break;
            case generate_report_dto_1.ComparisonType.MONTH_OVER_MONTH:
                comparisonStartDate = (0, date_fns_2.subMonths)(startDate, 1);
                comparisonEndDate = (0, date_fns_2.subMonths)(endDate, 1);
                break;
            case generate_report_dto_1.ComparisonType.CUSTOM:
                comparisonStartDate = new Date(params.comparison.customStartDate);
                comparisonEndDate = new Date(params.comparison.customEndDate);
                break;
            default:
                comparisonStartDate = (0, date_fns_2.subMonths)(startDate, 1);
                comparisonEndDate = (0, date_fns_2.subMonths)(endDate, 1);
        }
        const [currentPeriod, comparisonPeriod] = await Promise.all([
            this.getPeriodMetrics(startDate, endDate, params),
            this.getPeriodMetrics(comparisonStartDate, comparisonEndDate, params),
        ]);
        return {
            previousPeriod: {
                revenue: comparisonPeriod.revenue,
                leads: comparisonPeriod.leads,
                tasks: comparisonPeriod.tasks,
                claims: comparisonPeriod.claims,
            },
            yearOverYear: {
                revenue: (await this.getPeriodMetrics((0, date_fns_2.subYears)(startDate, 1), (0, date_fns_2.subYears)(endDate, 1), params)).revenue,
                leads: (await this.getPeriodMetrics((0, date_fns_2.subYears)(startDate, 1), (0, date_fns_2.subYears)(endDate, 1), params)).leads,
                tasks: (await this.getPeriodMetrics((0, date_fns_2.subYears)(startDate, 1), (0, date_fns_2.subYears)(endDate, 1), params)).tasks,
                claims: (await this.getPeriodMetrics((0, date_fns_2.subYears)(startDate, 1), (0, date_fns_2.subYears)(endDate, 1), params)).claims,
            },
            targets: await this.getTargetMetrics(startDate, endDate, params),
        };
    }
    async getPeriodMetrics(startDate, endDate, params) {
        const [leadsStats, claimsStats, quotationsStats, tasksStats] = await Promise.all([
            this.leadService.getLeadsReport({ createdAt: { gte: startDate, lte: endDate } }),
            this.claimsService.getClaimsReport({ createdAt: { gte: startDate, lte: endDate } }),
            this.shopService.getQuotationsReport({ createdAt: { gte: startDate, lte: endDate } }),
            this.tasksService.getTasksReport({ createdAt: { gte: startDate, lte: endDate } }),
        ]).catch(error => {
            return [null, null, null, null];
        });
        return {
            revenue: Number(quotationsStats?.metrics?.grossQuotationValue || 0),
            leads: Number(leadsStats?.total || 0),
            tasks: Number(tasksStats?.total || 0),
            claims: Number(claimsStats?.totalValue || 0),
        };
    }
    async getTargetMetrics(startDate, endDate, params) {
        return {
            revenue: { target: 100000, achieved: 75000 },
            leads: { target: 100, achieved: 85 },
            tasks: { target: 200, achieved: 180 },
            claims: { target: 50, achieved: 45 },
        };
    }
    async getFinancialMetrics(startDate, endDate, params) {
        try {
            const [currentPeriod, previousPeriod] = await Promise.all([
                this.getPeriodMetrics(startDate, endDate, params),
                this.getPeriodMetrics((0, date_fns_2.subMonths)(startDate, 1), (0, date_fns_2.subMonths)(endDate, 1), params),
            ]);
            const claimsData = await this.claimsService.getClaimsReport({
                createdAt: { gte: startDate, lte: endDate },
            });
            const quotationsData = await this.shopService.getQuotationsReport({
                createdAt: { gte: startDate, lte: endDate },
            });
            const claimsBreakdown = claimsData?.metrics?.categoryBreakdown || [];
            const paidClaims = claimsBreakdown.reduce((sum, cat) => (cat?.category?.toString() === 'PAID' ? sum + (cat?.count || 0) : sum), 0);
            const pendingClaims = claimsBreakdown.reduce((sum, cat) => (cat?.category?.toString() === 'PENDING' ? sum + (cat?.count || 0) : sum), 0);
            const largestClaim = claimsData?.metrics?.topClaimants?.[0]?.totalValue
                ? parseFloat(claimsData.metrics.topClaimants[0].totalValue.replace(/[^0-9.-]+/g, ''))
                : 0;
            const acceptedQuotations = (quotationsData?.metrics?.topProducts || []).reduce((sum, p) => sum + (p?.totalSold || 0), 0);
            const totalQuotations = quotationsData?.metrics?.totalQuotations || 0;
            const pendingQuotations = totalQuotations - acceptedQuotations;
            return {
                revenue: {
                    current: currentPeriod?.revenue || 0,
                    previous: previousPeriod?.revenue || 0,
                    growth: this.calculateGrowth(currentPeriod?.revenue || 0, previousPeriod?.revenue || 0),
                    trend: (currentPeriod?.revenue || 0) >= (previousPeriod?.revenue || 0) ? 'up' : 'down',
                    breakdown: await this.getRevenueBreakdown(startDate, endDate),
                },
                claims: {
                    total: claimsData?.metrics?.totalClaims || 0,
                    paid: paidClaims,
                    pending: pendingClaims,
                    average: parseFloat((claimsData?.metrics?.averageClaimValue || 0).toString()),
                    largestClaim,
                    byType: claimsBreakdown.reduce((acc, cat) => {
                        if (cat?.category) {
                            acc[cat.category.toString()] = cat?.count || 0;
                        }
                        return acc;
                    }, {}),
                },
                quotations: {
                    total: totalQuotations,
                    accepted: acceptedQuotations,
                    pending: pendingQuotations,
                    conversion: parseFloat((quotationsData?.metrics?.conversionRate || '0%').replace('%', '')),
                    averageValue: parseFloat((quotationsData?.metrics?.averageQuotationValue || '0').replace(/[^0-9.-]+/g, '')),
                },
            };
        }
        catch (error) {
            return {
                revenue: {
                    current: 0,
                    previous: 0,
                    growth: '0%',
                    trend: 'down',
                    breakdown: [],
                },
                claims: {
                    total: 0,
                    paid: 0,
                    pending: 0,
                    average: 0,
                    largestClaim: 0,
                    byType: {},
                },
                quotations: {
                    total: 0,
                    accepted: 0,
                    pending: 0,
                    conversion: 0,
                    averageValue: 0,
                },
            };
        }
    }
    async getPerformanceMetrics(startDate, endDate, params) {
        const [leadsData, tasksData] = await Promise.all([
            this.leadService.getLeadsReport({ createdAt: { gte: startDate, lte: endDate } }),
            this.tasksService.getTasksReport({ createdAt: { gte: startDate, lte: endDate } }),
        ]);
        const attendanceData = await this.checkInRepository.find({
            where: {
                checkInTime: (0, typeorm_3.Between)(startDate, endDate),
                checkOutTime: (0, typeorm_3.Between)(startDate, endDate),
            },
            relations: ['owner', 'branch'],
        });
        const sourceEffectiveness = leadsData.metrics.sourceEffectiveness.reduce((acc, source) => {
            acc[source.source] = source.totalLeads;
            return acc;
        }, {});
        const totalLeads = leadsData.metrics.sourceEffectiveness.reduce((sum, source) => sum + source.totalLeads, 0);
        const convertedLeads = leadsData.metrics.sourceEffectiveness.reduce((sum, source) => sum + source.convertedLeads, 0);
        return {
            leads: {
                total: totalLeads,
                converted: convertedLeads,
                conversionRate: parseFloat(leadsData.metrics.conversionRate.replace('%', '')),
                averageResponseTime: leadsData.metrics.averageResponseTime,
                bySource: sourceEffectiveness,
                qualityScore: leadsData.metrics.qualityScore,
            },
            tasks: {
                total: Object.values(tasksData.metrics.taskDistribution).reduce((sum, count) => sum + count, 0),
                completed: tasksData.metrics.taskDistribution['COMPLETED'] || 0,
                overdue: tasksData.metrics.taskDistribution['OVERDUE'] || 0,
                completionRate: parseFloat(tasksData.metrics.completionRate.replace('%', '')),
                averageCompletionTime: tasksData.metrics.averageCompletionTime,
                byPriority: tasksData.metrics.taskPriorityDistribution,
                byType: tasksData.metrics.taskDistribution,
            },
            attendance: {
                averageHours: this.calculateAverageHours(attendanceData),
                punctuality: this.calculatePunctualityRate(attendanceData),
                overtime: this.calculateOvertime(attendanceData),
                absences: this.calculateAbsences(attendanceData),
                remoteWork: this.calculateRemoteWork(attendanceData),
                byDepartment: this.groupByDepartment(attendanceData),
            },
        };
    }
    async getTrendMetrics(startDate, endDate, params) {
        return {
            seasonal: {
                peak: { period: 'December', value: 150000 },
                low: { period: 'January', value: 80000 },
            },
            patterns: {
                daily: this.calculateDailyPatterns(startDate, endDate),
                weekly: this.calculateWeeklyPatterns(startDate, endDate),
                monthly: this.calculateMonthlyPatterns(startDate, endDate),
            },
            forecast: {
                nextPeriod: 120000,
                confidence: 85,
                factors: ['Seasonal trend', 'Market conditions', 'Historical performance'],
            },
        };
    }
    async generateReport(params) {
        try {
            const startDate = new Date(params.startDate);
            const endDate = new Date(params.endDate);
            const [financial, performance, comparison, trends] = await Promise.all([
                this.getFinancialMetrics(startDate, endDate, params),
                this.getPerformanceMetrics(startDate, endDate, params),
                this.getComparisonData(params),
                this.getTrendMetrics(startDate, endDate, params),
            ]);
            const response = {
                metadata: {
                    generatedAt: new Date().toISOString(),
                    period: `${(0, date_fns_2.format)(startDate, 'PP')} - ${(0, date_fns_2.format)(endDate, 'PP')}`,
                    filters: params.filters,
                },
                financial,
                performance,
                comparison,
                trends,
                summary: {
                    highlights: this.generateHighlights(financial, performance, comparison),
                    recommendations: this.generateRecommendations(financial, performance, trends),
                },
            };
            if (params.visualization?.format === generate_report_dto_1.ReportFormat.PDF) {
                return response;
            }
            else if (params.visualization?.format === generate_report_dto_1.ReportFormat.EXCEL) {
                return response;
            }
            return response;
        }
        catch (error) {
            throw error;
        }
    }
    async getRevenueBreakdown(startDate, endDate) {
        try {
            const quotationsData = await this.shopService.getQuotationsReport({
                createdAt: { gte: startDate, lte: endDate },
            });
            const totalRevenue = Number(quotationsData?.metrics?.grossQuotationValue || 0);
            const categories = quotationsData?.metrics?.topProducts || [];
            return categories.map((product) => ({
                category: product?.productName || 'Unknown',
                value: Number(product?.totalValue || 0),
                percentage: totalRevenue > 0 ? (Number(product?.totalValue || 0) / totalRevenue) * 100 : 0,
            }));
        }
        catch (error) {
            return [];
        }
    }
    groupByType(items) {
        return items.reduce((acc, item) => {
            if (item.type) {
                acc[item.type] = (acc[item.type] || 0) + 1;
            }
            return acc;
        }, {});
    }
    groupBySource(items) {
        return items.reduce((acc, item) => {
            if (item.source) {
                acc[item.source] = (acc[item.source] || 0) + 1;
            }
            return acc;
        }, {});
    }
    groupByPriority(items) {
        return items.reduce((acc, item) => {
            if (item.priority) {
                acc[item.priority] = (acc[item.priority] || 0) + 1;
            }
            return acc;
        }, {});
    }
    groupByDepartment(attendanceData) {
        return attendanceData.reduce((acc, record) => {
            const branch = record.branch?.name || 'Unknown';
            acc[branch] = (acc[branch] || 0) + 1;
            return acc;
        }, {});
    }
    calculateAverageResponseTime(leads) {
        const totalResponseTime = leads.reduce((sum, lead) => {
            if (lead.firstResponseAt && lead.createdAt) {
                return sum + (0, date_fns_1.differenceInMinutes)(new Date(lead.firstResponseAt), new Date(lead.createdAt));
            }
            return sum;
        }, 0);
        const avgMinutes = Math.round(totalResponseTime / leads.length);
        return `${avgMinutes} minutes`;
    }
    calculateAverageCompletionTime(tasks) {
        const totalCompletionTime = tasks.reduce((sum, task) => {
            if (task.completedAt && task.createdAt) {
                return sum + (0, date_fns_1.differenceInMinutes)(new Date(task.completedAt), new Date(task.createdAt));
            }
            return sum;
        }, 0);
        const avgMinutes = Math.round(totalCompletionTime / tasks.length);
        return `${avgMinutes} minutes`;
    }
    calculateLeadQualityScore(leads) {
        const totalScore = leads.reduce((sum, lead) => {
            let score = 0;
            if (lead.converted)
                score += 5;
            if (lead.budget && lead.budget > 0)
                score += 2;
            if (lead.notes && lead.notes.length > 0)
                score += 1;
            if (lead.followUps && lead.followUps.length > 0)
                score += 2;
            return sum + score;
        }, 0);
        return Math.round((totalScore / (leads.length * 10)) * 100);
    }
    calculateAverageHours(attendance) {
        const totalHours = attendance.reduce((sum, record) => {
            if (record.checkOutTime && record.checkInTime) {
                return sum + (0, date_fns_1.differenceInMinutes)(new Date(record.checkOutTime), new Date(record.checkInTime)) / 60;
            }
            return sum;
        }, 0);
        return Math.round((totalHours / attendance.length) * 10) / 10;
    }
    calculatePunctualityRate(attendance) {
        const onTimeCount = attendance.filter((record) => {
            const checkInTime = new Date(record.checkInTime);
            const scheduledTime = new Date(record.scheduledStartTime);
            return checkInTime <= scheduledTime;
        }).length;
        return Math.round((onTimeCount / attendance.length) * 100);
    }
    calculateOvertime(attendance) {
        const totalOvertime = attendance.reduce((sum, record) => {
            if (record.checkOutTime && record.scheduledEndTime) {
                const overtime = Math.max(0, (0, date_fns_1.differenceInMinutes)(new Date(record.checkOutTime), new Date(record.scheduledEndTime))) /
                    60;
                return sum + overtime;
            }
            return sum;
        }, 0);
        return Math.round(totalOvertime * 10) / 10;
    }
    calculateAbsences(attendance) {
        return attendance.filter((record) => record.status === 'ABSENT').length;
    }
    calculateRemoteWork(attendance) {
        const remoteCount = attendance.filter((record) => record.workMode === 'REMOTE').length;
        return Math.round((remoteCount / attendance.length) * 100);
    }
    calculateDailyPatterns(startDate, endDate) {
        return {
            Monday: 100,
            Tuesday: 120,
            Wednesday: 115,
            Thursday: 125,
            Friday: 90,
        };
    }
    calculateWeeklyPatterns(startDate, endDate) {
        return {
            'Week 1': 450,
            'Week 2': 480,
            'Week 3': 520,
            'Week 4': 490,
        };
    }
    calculateMonthlyPatterns(startDate, endDate) {
        return {
            Jan: 1200,
            Feb: 1300,
            Mar: 1450,
            Apr: 1380,
        };
    }
    generateHighlights(financial, performance, comparison) {
        const highlights = [];
        if (financial.revenue.growth.startsWith('+')) {
            highlights.push(`Revenue increased by ${financial.revenue.growth} compared to previous period`);
        }
        if (performance.leads.conversionRate > 20) {
            highlights.push(`Strong lead conversion rate of ${performance.leads.conversionRate.toFixed(1)}%`);
        }
        if (performance.tasks.completionRate > 80) {
            highlights.push(`High task completion rate of ${performance.tasks.completionRate.toFixed(1)}%`);
        }
        if (financial.quotations.conversion > 50) {
            highlights.push(`Above average quotation conversion rate of ${financial.quotations.conversion.toFixed(1)}%`);
        }
        return highlights;
    }
    generateRecommendations(financial, performance, trends) {
        const recommendations = [];
        if (financial.revenue.trend === 'down') {
            recommendations.push('Consider reviewing pricing strategy and implementing targeted promotions');
        }
        if (performance.leads.conversionRate < 20) {
            recommendations.push('Focus on lead qualification process and sales team training');
        }
        if (performance.tasks.overdue > performance.tasks.completed) {
            recommendations.push('Review task allocation and implement better tracking of deadlines');
        }
        if (performance.attendance.punctuality < 80) {
            recommendations.push('Address attendance issues through team meetings and policy reviews');
        }
        return recommendations;
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
    __param(1, (0, typeorm_1.InjectRepository)(check_in_entity_1.CheckIn)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
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