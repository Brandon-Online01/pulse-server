export type MetricTrend = 'up' | 'down' | 'stable';

export interface BreakdownMetric {
    category: string;
    value: number;
    percentage: number;
}

export interface FinancialMetrics {
    revenue: {
        current: number;
        previous: number;
        growth: string;
        trend: MetricTrend;
        breakdown: BreakdownMetric[];
    };
    claims: {
        total: number;
        paid: number;
        pending: number;
        average: number;
        largestClaim: number;
        byType: Record<string, number>;
    };
    quotations: {
        total: number;
        accepted: number;
        pending: number;
        conversion: number;
        averageValue: number;
    };
}

export interface PerformanceMetrics {
    leads: {
        total: number;
        converted: number;
        conversionRate: number;
        averageResponseTime: string;
        bySource: Record<string, number>;
        qualityScore: number;
    };
    tasks: {
        total: number;
        completed: number;
        overdue: number;
        completionRate: number;
        averageCompletionTime: string;
        byPriority: Record<string, number>;
        byType: Record<string, number>;
    };
    attendance: {
        averageHours: number;
        punctuality: number;
        overtime: number;
        absences: number;
        remoteWork: number;
        byDepartment: Record<string, number>;
    };
}

export interface ComparisonMetrics {
    previousPeriod: {
        revenue: number;
        leads: number;
        tasks: number;
        claims: number;
    };
    yearOverYear: {
        revenue: number;
        leads: number;
        tasks: number;
        claims: number;
    };
    targets: {
        revenue: { target: number; achieved: number };
        leads: { target: number; achieved: number };
        tasks: { target: number; achieved: number };
        claims: { target: number; achieved: number };
    };
}

export interface TrendMetrics {
    seasonal: {
        peak: { period: string; value: number };
        low: { period: string; value: number };
    };
    patterns: {
        daily: Record<string, number>;
        weekly: Record<string, number>;
        monthly: Record<string, number>;
    };
    forecast: {
        nextPeriod: number;
        confidence: number;
        factors: string[];
    };
}

export interface ReportResponse {
    metadata: {
        generatedAt: string;
        period: string;
        filters: Record<string, unknown>;
    };
    financial: FinancialMetrics;
    performance: PerformanceMetrics;
    comparison: ComparisonMetrics;
    trends: TrendMetrics;
    summary: {
        highlights: string[];
        recommendations: string[];
    };
} 