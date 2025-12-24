const API_URL = import.meta.env.PROD
    ? '' // Relative path for unified deployment
    : `http://${window.location.hostname}:3000`;

type RequestMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

interface ApiRequestOptions {
    method?: RequestMethod;
    body?: any;
    headers?: Record<string, string>;
}

export class ApiError extends Error {
    status: number;
    constructor(message: string, status: number) {
        super(message);
        this.status = status;
    }
}

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
    // If we serve frontend from the same domain as backend (e.g. via Nginx or similar), relative is fine.
    // But typically we have separated deployments here.
    const url = endpoint.startsWith('http') ? endpoint : `${API_URL}${endpoint}`;

    const response = await fetch(url, config);

    if (!response.ok) {
        let errorMessage = 'An unknown error occurred';
        try {
            const errorData = await response.json();
            errorMessage = errorData.error || response.statusText;
        } catch (e) {
            errorMessage = await response.text();
        }
        throw new ApiError(errorMessage, response.status);
    }

    // Handle empty responses (e.g. 204)
    if (response.status === 204) {
        return {} as T;
    }

    try {
        return await response.json();
    } catch (e) {
        // Fallback if not JSON
        return {} as T;
    }
}

export const api = {
    get: <T>(endpoint: string) => request<T>(endpoint, { method: 'GET' }),
    post: <T>(endpoint: string, body: any) => request<T>(endpoint, { method: 'POST', body }),
    patch: <T>(endpoint: string, body: any) => request<T>(endpoint, { method: 'PATCH', body }),
    put: <T>(endpoint: string, body: any) => request<T>(endpoint, { method: 'PUT', body }),
    delete: <T>(endpoint: string, body?: any) => request<T>(endpoint, { method: 'DELETE', body }),
};
