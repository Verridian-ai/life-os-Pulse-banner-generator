import type {
    AdminStatus,
    AdminUser,
    AdminUserDetail,
    AgentConfig,
    DashboardStats,
    AuditLogEntry,
} from '../types';

const API_BASE = '/api/admin';

async function fetchWithCredentials<T>(url: string, options?: RequestInit): Promise<T> {
    const response = await fetch(url, {
        ...options,
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
            ...options?.headers,
        },
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Request failed' }));
        throw new Error(error.error || `HTTP ${response.status}`);
    }

    return response.json();
}

// ============================================================================
// Admin Status
// ============================================================================

export async function checkAdminStatus(): Promise<AdminStatus> {
    try {
        return await fetchWithCredentials<AdminStatus>(`${API_BASE}/check`);
    } catch {
        return { isAdmin: false };
    }
}

export async function getDashboardStats(): Promise<DashboardStats> {
    return fetchWithCredentials<DashboardStats>(`${API_BASE}/dashboard`);
}

// ============================================================================
// User Management
// ============================================================================

export type ListUsersParams = {
    page?: number;
    limit?: number;
    search?: string;
};

export type ListUsersResponse = {
    users: AdminUser[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
};

export async function listUsers(params: ListUsersParams = {}): Promise<ListUsersResponse> {
    const searchParams = new URLSearchParams();
    if (params.page) searchParams.set('page', String(params.page));
    if (params.limit) searchParams.set('limit', String(params.limit));
    if (params.search) searchParams.set('search', params.search);

    const url = `${API_BASE}/users?${searchParams.toString()}`;
    return fetchWithCredentials<ListUsersResponse>(url);
}

export async function getUserDetail(userId: string): Promise<AdminUserDetail> {
    return fetchWithCredentials<AdminUserDetail>(`${API_BASE}/users/${userId}`);
}

export async function updateUser(
    userId: string,
    data: { fullName?: string; username?: string }
): Promise<{ success: boolean }> {
    return fetchWithCredentials(`${API_BASE}/users/${userId}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
    });
}

export async function grantAdminPrivileges(
    userId: string,
    role: 'admin' | 'super_admin' = 'admin'
): Promise<{ success: boolean }> {
    return fetchWithCredentials(`${API_BASE}/users/${userId}/grant-admin`, {
        method: 'POST',
        body: JSON.stringify({ role }),
    });
}

export async function revokeAdminPrivileges(userId: string): Promise<{ success: boolean }> {
    return fetchWithCredentials(`${API_BASE}/users/${userId}/revoke-admin`, {
        method: 'DELETE',
    });
}

export async function addCredits(
    userId: string,
    amount: number,
    description?: string
): Promise<{ success: boolean; newBalance: number }> {
    return fetchWithCredentials(`${API_BASE}/users/${userId}/add-credits`, {
        method: 'POST',
        body: JSON.stringify({ amount, description }),
    });
}

// ============================================================================
// Agent Configuration
// ============================================================================

export type ListAgentsResponse = {
    agents: AgentConfig[];
};

export async function listAgents(): Promise<ListAgentsResponse> {
    return fetchWithCredentials<ListAgentsResponse>(`${API_BASE}/agents`);
}

export async function getAgentDetail(agentId: string): Promise<{
    agent: AgentConfig;
    skills: unknown[];
    mcpConnections: unknown[];
    contextDocs: unknown[];
    runtime: unknown;
}> {
    return fetchWithCredentials(`${API_BASE}/agents/${agentId}`);
}

export async function updateAgent(
    agentId: string,
    data: Partial<AgentConfig>
): Promise<{ success: boolean; agent: AgentConfig }> {
    return fetchWithCredentials(`${API_BASE}/agents/${agentId}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
    });
}

// ============================================================================
// Observability
// ============================================================================

export type ListTracesParams = {
    limit?: number;
    offset?: number;
};

export async function listTraces(params: ListTracesParams = {}): Promise<{
    traces: unknown[];
    total: number;
}> {
    const searchParams = new URLSearchParams();
    if (params.limit) searchParams.set('limit', String(params.limit));
    if (params.offset) searchParams.set('offset', String(params.offset));

    return fetchWithCredentials(`${API_BASE}/observability/traces?${searchParams.toString()}`);
}

export async function getMetrics(): Promise<{
    metrics: Array<{
        endpoint: string;
        method: string;
        avgLatency: number;
        requestCount: number;
    }>;
}> {
    return fetchWithCredentials(`${API_BASE}/observability/metrics`);
}

export async function getDailyStats(days = 7): Promise<{
    stats: unknown[];
}> {
    return fetchWithCredentials(`${API_BASE}/observability/stats?days=${days}`);
}

// ============================================================================
// Audit Logs
// ============================================================================

export async function listAuditLogs(params: { limit?: number; offset?: number } = {}): Promise<{
    logs: AuditLogEntry[];
    total: number;
}> {
    const searchParams = new URLSearchParams();
    if (params.limit) searchParams.set('limit', String(params.limit));
    if (params.offset) searchParams.set('offset', String(params.offset));

    return fetchWithCredentials(`${API_BASE}/audit-logs?${searchParams.toString()}`);
}
