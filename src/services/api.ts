import type { RequestBody } from '@/types/api';

const API_URL = import.meta.env.PROD
    ? '' // Relative path for unified deployment
    : `http://${window.location.hostname}:3000`;

type RequestMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

interface ApiRequestOptions {
    method?: RequestMethod;
    body?: RequestBody;
    headers?: Record<string, string>;
}

export class ApiError extends Error {
    status: number;
    constructor(message: string, status: number) {
        super(message);
        this.status = status;
    }
}

// Request deduplication map
const pendingRequests = new Map<string, Promise<unknown>>();

async function request<T>(endpoint: string, options: ApiRequestOptions = {}): Promise<T> {
    const { method = 'GET', body, headers = {} } = options;

    const config: RequestInit = {
        method,
        headers: {
            'Content-Type': 'application/json',
            ...headers,
        },
        credentials: 'include', // Important for Lucia session cookies
    };

    if (body) {
        config.body = JSON.stringify(body);
    }

    // Handle relative vs absolute URLs
    const url = endpoint.startsWith('http') ? endpoint : `${API_URL}${endpoint}`;

    // Generate a unique key for deduplication
    // Key includes method, full URL, and stringified body to distinguish requests
    const cacheKey = `${method}:${url}:${config.body || ''}`;

    // If a request is already pending, return the existing promise
    if (pendingRequests.has(cacheKey)) {
        return pendingRequests.get(cacheKey) as Promise<T>;
    }

    const requestPromise = (async () => {
        try {
            const response = await fetch(url, config);

            if (!response.ok) {
                let errorMessage = 'An unknown error occurred';
                // Read text first, then try to parse as JSON to avoid "body stream already read" error
                const text = await response.text();
                try {
                    const errorData = JSON.parse(text);
                    errorMessage = errorData.error || response.statusText;
                } catch {
                    errorMessage = text || response.statusText;
                }
                throw new ApiError(errorMessage, response.status);
            }

            // Handle empty responses (e.g. 204)
            if (response.status === 204) {
                return {} as T;
            }

            try {
                return await response.json();
            } catch {
                // Fallback if not JSON
                return {} as T;
            }
        } finally {
            // Remove from pending requests map when complete (success or failure)
            pendingRequests.delete(cacheKey);
        }
    })();

    // Store the pending request
    pendingRequests.set(cacheKey, requestPromise);

    return requestPromise;
}

export const api = {
    get: <T>(endpoint: string) => request<T>(endpoint, { method: 'GET' }),
    post: <T>(endpoint: string, body: RequestBody) => request<T>(endpoint, { method: 'POST', body }),
    patch: <T>(endpoint: string, body: RequestBody) => request<T>(endpoint, { method: 'PATCH', body }),
    put: <T>(endpoint: string, body: RequestBody) => request<T>(endpoint, { method: 'PUT', body }),
    delete: <T>(endpoint: string, body?: RequestBody) => request<T>(endpoint, { method: 'DELETE', body }),
};
