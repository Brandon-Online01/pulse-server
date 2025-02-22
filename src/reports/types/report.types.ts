import { Task } from '../../tasks/entities/task.entity';
import { Claim } from '../../claims/entities/claim.entity';
import { Lead } from '../../leads/entities/lead.entity';
import { Reward } from '../../rewards/entities/reward.entity';
import { Journal } from 'src/journal/entities/journal.entity';
import { User } from 'src/user/entities/user.entity';

export type TimeRange = {
    start: Date;
    end: Date;
};

export type ClientVisit = {
    clientId: string;
    clientName: string;
    checkInTime: Date;
    checkOutTime: Date;
    duration: string;
    location: string;
};

export type DailyUserActivityReport = {
    user: User;
    date: Date;
    attendance: {
        shiftStart: Date;
        shiftEnd: Date;
        shiftDuration: string;
        status: 'present' | 'absent' | 'late';
        breakTime: string;
        overtime: string;
    };
    clientVisits: {
        visits: ClientVisit[];
        total: number;
        averageTimePerClient: string;
        totalDuration: string;
    };
    tasks: {
        completed: Task[];
        pending: Task[];
        total: number;
        completionRate: number;
        byStatus: {
            status: string;
            count: number;
            percentage: number;
        }[];
    };
    quotations: {
        created: Lead[];
        converted: Lead[];
        total: number;
        conversionRate: number;
        value: {
            total: number;
            average: number;
            currency: string;
        };
    };
    claims: {
        processed: Claim[];
        total: number;
        value: number;
        averageProcessingTime: string;
        byStatus: {
            status: string;
            count: number;
            percentage: number;
        }[];
    };
    rewards: {
        earned: Reward[];
        total: number;
        xpGained: number;
        achievements: {
            name: string;
            points: number;
            timestamp: Date;
        }[];
    };
    journals: {
        entries: Journal[]; 
        total: number;
        categories: {
            category: string;
            count: number;
        }[];
    };
    metrics: {
        productivityScore: number;
        customerSatisfaction: number;
        responseTime: number;
        efficiency: number;
    };
};

export type DashboardAnalyticsReport = {
    timeRange: TimeRange;
    overview: {
        totalSales: number;
        averageDailySales: number;
        salesGrowth: string;
        conversionRate: number;
        activeUsers: number;
        totalClients: number;
    };
    sales: {
        daily: Array<{
            date: Date;
            value: number;
            transactions: number;
        }>;
        monthly: Array<{
            month: string;
            value: number;
            growth: string;
        }>;
    };
    clientVisits: {
        daily: Array<{
            date: Date;
            visits: number;
            uniqueClients: number;
            averageDuration: string;
        }>;
        byLocation: Array<{
            location: string;
            visits: number;
            percentage: number;
        }>;
    };
    attendance: {
        daily: Array<{
            date: Date;
            present: number;
            absent: number;
            late: number;
            averageShiftDuration: string;
        }>;
        summary: {
            totalShifts: number;
            averageAttendance: number;
            latePercentage: number;
            overtimeHours: string;
        };
    };
    claims: {
        monthly: Array<{
            month: string;
            claims: number;
            payouts: number;
            averageProcessingTime: string;
        }>;
        total: number;
        averageProcessingTime: string;
        byStatus: Array<{
            status: string;
            count: number;
            percentage: number;
        }>;
    };
    staff: {
        attendance: Array<{
            date: Date;
            present: number;
            absent: number;
            late: number;
        }>;
        composition: Array<{
            role: string;
            count: number;
            percentage: number;
        }>;
        performance: Array<{
            metric: string;
            score: number;
            trend: string;
        }>;
    };
    quotations: {
        total: number;
        conversion: {
            successful: number;
            rate: number;
            averageTime: string;
        };
        byStage: Array<{
            stage: string;
            count: number;
            percentage: number;
        }>;
        averageValue: number;
        topPerformers: Array<{
            userId: string;
            userName: string;
            conversions: number;
            value: number;
        }>;
    };
    filters: {
        dateRange?: TimeRange;
        departments?: string[];
        products?: string[];
        status?: string[];
        locations?: string[];
    };
};

export type ReportGenerationOptions = {
    userId?: string;
    timeRange: TimeRange;
    format?: 'PDF' | 'CSV' | 'JSON';
    includeMetrics?: boolean;
    filters?: {
        departments?: string[];
        products?: string[];
        status?: string[];
        locations?: string[];
    };
}; 