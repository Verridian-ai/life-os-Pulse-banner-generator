import { config } from 'dotenv';
config();

/**
 * Represents daily aggregated metrics matching the dailyStats schema
 */
export type DailyMetric = {
    date: string;
    totalRequests: number;
    totalLlmCalls: number;
    totalTokens: number;
    totalCostUsd: string;
    uniqueUsers: number;
    avgLatencyMs: number | null;
    errorCount: number;
};

const LANGFUSE_PUBLIC_KEY = process.env.LANGFUSE_PUBLIC_KEY;
const LANGFUSE_SECRET_KEY = process.env.LANGFUSE_SECRET_KEY;
const LANGFUSE_HOST = process.env.LANGFUSE_HOST || 'https://cloud.langfuse.com';

// Langfuse API uses Basic Auth with PK as username and SK as password
const getAuthHeader = () => {
    const credentials = Buffer.from(`${LANGFUSE_PUBLIC_KEY}:${LANGFUSE_SECRET_KEY}`).toString('base64');
    return `Basic ${credentials}`;
};

interface LangfuseTraceData {
    id: string;
    name?: string;
    model?: string;
    status?: string;
    latency?: number;
    usage?: { totalTokens?: number; totalCost?: number };
    timestamp?: string;
    userId?: string;
    input?: unknown;
    output?: unknown;
}

interface LangfuseMeta {
    totalItems?: number;
    page?: number;
    limit?: number;
}

interface LangfuseDailyMetricItem {
    date?: string;
    timestamp?: string;
    countTraces?: number;
    traceCount?: number;
    countObservations?: number;
    observationCount?: number;
    usage?: { totalTokens?: number };
    totalTokens?: number;
    totalCost?: string;
    cost?: string;
    uniqueUsers?: number;
    userCount?: number;
    avgLatency?: number;
    latencyMs?: number;
    errorCount?: number;
    errors?: number;
}

interface LangfuseAggregatedMetricItem {
    timestamp?: string;
    date?: string;
    count_count?: number;
    count?: number;
    totalTokens_sum?: number;
    latency_avg?: number;
}

export class LangfuseService {
    static async getTraces(limit: number = 50, page: number = 1): Promise<{ data: LangfuseTraceData[], meta: LangfuseMeta }> {
        if (!LANGFUSE_PUBLIC_KEY || !LANGFUSE_SECRET_KEY) {
            console.warn('[Langfuse] Missing credentials, returning empty list');
            return { data: [], meta: { totalItems: 0 } };
        }

        try {
            const query = new URLSearchParams({
                limit: limit.toString(),
                page: page.toString(),
            });

            const response = await fetch(`${LANGFUSE_HOST}/api/public/traces?${query.toString()}`, {
                headers: {
                    'Authorization': getAuthHeader(),
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                const text = await response.text();
                throw new Error(`Langfuse API error: ${response.status} ${text}`);
            }

            return await response.json();
        } catch (error) {
            console.error('[Langfuse] Get traces failed:', error);
            throw error; // Propagate to let route handle 500
        }
    }

    /**
     * Fetches daily aggregated metrics from Langfuse.
     * Uses the /api/public/metrics/daily endpoint for pre-aggregated data,
     * with fallback to manual trace aggregation if needed.
     *
     * @param days Number of days of history to fetch (default: 7)
     * @returns Daily metrics matching the dailyStats schema structure
     */
    static async getDailyMetrics(days: number = 7): Promise<{ daily: DailyMetric[] }> {
        if (!LANGFUSE_PUBLIC_KEY || !LANGFUSE_SECRET_KEY) {
            console.warn('[Langfuse] Missing credentials, returning empty daily metrics');
            return { daily: [] };
        }

        try {
            // Try the dedicated daily metrics endpoint first
            const dailyResponse = await fetch(
                `${LANGFUSE_HOST}/api/public/metrics/daily?limit=${days}`,
                {
                    headers: {
                        'Authorization': getAuthHeader(),
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (dailyResponse.ok) {
                const dailyData = await dailyResponse.json();
                return {
                    daily: this.transformDailyMetrics(dailyData.data || dailyData)
                };
            }

            // Fallback: Use metrics API with custom query
            console.log('[Langfuse] Daily endpoint unavailable, using metrics API fallback');
            return await this.aggregateMetricsFromAPI(days);

        } catch (error) {
            console.error('[Langfuse] Get daily metrics failed:', error);
            // Return empty array instead of throwing to avoid breaking the dashboard
            return { daily: [] };
        }
    }

    /**
     * Transforms Langfuse daily metrics response to match our dailyStats schema
     */
    private static transformDailyMetrics(data: LangfuseDailyMetricItem[]): DailyMetric[] {
        if (!Array.isArray(data)) return [];

        return data.map(item => ({
            date: item.date || item.timestamp,
            totalRequests: item.countTraces || item.traceCount || 0,
            totalLlmCalls: item.countObservations || item.observationCount || 0,
            totalTokens: (item.usage?.totalTokens) || item.totalTokens || 0,
            totalCostUsd: item.totalCost || item.cost || '0',
            uniqueUsers: item.uniqueUsers || item.userCount || 0,
            avgLatencyMs: item.avgLatency || item.latencyMs || null,
            errorCount: item.errorCount || item.errors || 0
        }));
    }

    /**
     * Fallback method: Aggregates metrics using the general metrics API
     */
    private static async aggregateMetricsFromAPI(days: number): Promise<{ daily: DailyMetric[] }> {
        const toDate = new Date();
        const fromDate = new Date();
        fromDate.setDate(fromDate.getDate() - days);

        const query = {
            view: 'traces',
            metrics: [
                { measure: 'count', aggregation: 'count' },
                { measure: 'totalTokens', aggregation: 'sum' },
                { measure: 'latency', aggregation: 'avg' }
            ],
            dimensions: [{ field: 'timestamp', granularity: 'day' }],
            fromTimestamp: fromDate.toISOString(),
            toTimestamp: toDate.toISOString(),
            orderBy: [{ field: 'timestamp', direction: 'desc' }]
        };

        const response = await fetch(
            `${LANGFUSE_HOST}/api/public/metrics?query=${encodeURIComponent(JSON.stringify(query))}`,
            {
                headers: {
                    'Authorization': getAuthHeader(),
                    'Content-Type': 'application/json'
                }
            }
        );

        if (!response.ok) {
            const text = await response.text();
            console.error('[Langfuse] Metrics API error:', response.status, text);
            return { daily: [] };
        }

        const result = await response.json();
        return {
            daily: this.transformAggregatedMetrics(result.data || [])
        };
    }

    /**
     * Transforms aggregated metrics API response to dailyStats format
     */
    private static transformAggregatedMetrics(data: LangfuseAggregatedMetricItem[]): DailyMetric[] {
        return data.map(item => ({
            date: item.timestamp || item.date,
            totalRequests: item.count_count || item.count || 0,
            totalLlmCalls: 0, // Not available from traces view
            totalTokens: item.totalTokens_sum || 0,
            totalCostUsd: '0', // Would need cost calculation
            uniqueUsers: 0, // Would need separate query
            avgLatencyMs: Math.round(item.latency_avg || 0),
            errorCount: 0 // Would need separate query with error filter
        }));
    }
}
