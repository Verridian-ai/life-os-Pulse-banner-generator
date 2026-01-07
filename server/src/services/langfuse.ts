import { config } from 'dotenv';
config();

const LANGFUSE_PUBLIC_KEY = process.env.LANGFUSE_PUBLIC_KEY;
const LANGFUSE_SECRET_KEY = process.env.LANGFUSE_SECRET_KEY;
const LANGFUSE_HOST = process.env.LANGFUSE_HOST || 'https://cloud.langfuse.com';

// Langfuse API uses Basic Auth with PK as username and SK as password
const getAuthHeader = () => {
    const credentials = Buffer.from(`${LANGFUSE_PUBLIC_KEY}:${LANGFUSE_SECRET_KEY}`).toString('base64');
    return `Basic ${credentials}`;
};

export class LangfuseService {
    static async getTraces(limit: number = 50, page: number = 1): Promise<{ data: any[], meta: any }> {
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

    static async getDailyMetrics(days: number = 7): Promise<any> {
        if (!LANGFUSE_PUBLIC_KEY || !LANGFUSE_SECRET_KEY) return { daily: [] };

        // Langfuse Public API might not have a direct "daily metrics" endpoint easy to consume
        // We might just return mock or aggregate traces if critical.
        // For now, let's focus on Traces.
        return { daily: [] };
    }
}
