export interface APIUsageMetadata {
    endpoints: Record<string, number>;     // endpoint -> call count
    methods: Record<string, number>;       // HTTP method -> call count
    statusCodes: Record<string, number>;   // status code -> count
    performance: {
        averageResponseTime: number;
        maxResponseTime: number;
        minResponseTime: number;
        p95ResponseTime: number;
        errorRate: number;
    };
    clients: {
        browsers: Record<string, number>;  // browser -> count
        os: Record<string, number>;        // OS -> count
        devices: Record<string, number>;   // device type -> count
        locations: Record<string, number>; // country -> count
    };
    timeDistribution: {
        hourly: number[];    // 24 slots for each hour
        daily: number[];     // 7 slots for each day of week
        monthly: number[];   // 12 slots for each month
    };
}
