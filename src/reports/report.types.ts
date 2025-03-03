import { ReportType, ReportFormat, ReportTimeframe, ReportMetricType } from '../lib/enums/report.enums';

export interface ReportGenerationOptions {
    type: ReportType;
    format: ReportFormat;
    timeframe: ReportTimeframe;
    startDate: Date;
    endDate: Date;
    filters?: {
        products?: string[];
        status?: string[];
        locations?: string[];
    };
    userId?: number;
    organisationRef?: string;
    branchUid?: number;
}

export interface TaskMetrics {
    total: number;
    completed: number;
    inProgress: number;
    pending: number;
    overdue: number;
    completionRate: number;
    averageCompletionTime: number;
    byPriority: {
        high: number;
        medium: number;
        low: number;
    };
    byType: Record<string, number>;
}

export interface AttendanceMetrics {
    totalDays: number;
    presentDays: number;
    absentDays: number;
    attendanceRate: number;
    averageCheckInTime: string;
    averageCheckOutTime: string;
    averageHoursWorked: number;
    todaysHoursFormatted: string;
    totalOvertime: number;
    onTimeCheckIns: number;
    lateCheckIns: number;
    averageBreakTime: number;
    efficiency: number;
}

export interface ClientVisitMetrics {
    totalVisits: number;
    uniqueClients: number;
    averageTimePerVisit: number;
    totalDuration: number;
    byPurpose: Record<string, number>;
    conversionRate: number;
}

export interface QuotationMetrics {
    total: number;
    approved: number;
    rejected: number;
    pending: number;
    conversionRate: number;
    averageValue: number;
    totalValue: number;
    byProduct: Record<string, number>;
}

export interface RewardMetrics {
    totalXP: number;
    totalRewards: number;
    byCategory: Record<string, number>;
    achievements: Array<{
        name: string;
        earnedAt: Date;
        xpValue: number;
    }>;
}

export interface JournalMetrics {
    total: number;
    byCategory: Record<string, number>;
    averageEntriesPerDay: number;
    topCategories: string[];
}

export interface ProductivityMetrics {
    score: number;
    taskEfficiency: number;
    clientHandling: number;
    responseTime: number;
    qualityScore: number;
}

export interface DepartmentMetrics {
    name: string;
    headCount: number;
    attendance: AttendanceMetrics;
    tasks: TaskMetrics;
    productivity: ProductivityMetrics;
    topPerformers: Array<{
        userId: number;
        name: string;
        score: number;
    }>;
}

export interface DailyUserActivityReport {
    userId: number;
    date: Date;
    attendance: AttendanceMetrics;
    clientVisits: ClientVisitMetrics;
    tasks: TaskMetrics;
    quotations: QuotationMetrics;
    rewards: RewardMetrics;
    journals: JournalMetrics;
    productivity: ProductivityMetrics;
    summary: string;
}

export interface DashboardAnalyticsReport {
    timeframe: ReportTimeframe;
    startDate: Date;
    endDate: Date;
    organisationRef: string;
    branchUid?: number;
    overview: {
        totalUsers: number;
        activeUsers: number;
        totalTasks: number;
        totalClients: number;
        totalQuotations: number;
        totalRevenue: number;
    };
    departments: DepartmentMetrics[];
    trends: {
        taskCompletion: number[];
        clientVisits: number[];
        quotationConversion: number[];
        revenue: number[];
        productivity: number[];
    };
    topMetrics: {
        performers: Array<{
            userId: number;
            name: string;
            score: number;
            metrics: Record<ReportMetricType, number>;
        }>;
        departments: Array<{
            name: string;
            score: number;
            metrics: Record<ReportMetricType, number>;
        }>;
        products: Array<{
            name: string;
            quotations: number;
            revenue: number;
            growth: number;
        }>;
    };
    summary: string;
}

export interface LiveUserReport extends DailyUserActivityReport {
    lastUpdated: Date;
    isOnline: boolean;
    currentActivity?: string;
    location?: {
        latitude: number;
        longitude: number;
        address?: string;
    };
    currentTasksInProgress?: Array<{
        uid: number;
        title: string;
        startedAt: Date;
        estimatedCompletion?: Date;
        progress?: number;
    }>;
    nextTasks?: Array<{
        uid: number;
        title: string;
        priority: string;
        deadline: Date;
        estimatedDuration?: number;
    }>;
    taskTimeline?: Array<{
        uid: number;
        title: string;
        startTime: Date;
        endTime?: Date;
        status: string;
        isCompleted: boolean;
    }>;
    overdueTasks?: Array<{
        uid: number;
        title: string;
        deadline: Date;
        priority: string;
        daysOverdue: number;
    }>;
    taskEfficiency?: {
        averageCompletionTime: number;
        userCompletionTime: number;
        efficiencyRatio: number;
        trend: 'improving' | 'declining' | 'stable';
        comparisonToTeam: number;
    };
    recentActivities: Array<{
        type: string;
        timestamp: Date;
        description: string;
    }>;
} 