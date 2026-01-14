export type AdminRole = 'super_admin' | 'admin';

export type AdminPermissions = {
    user_management: boolean;
    agent_configuration: boolean;
    audit_log_access: boolean;
    system_settings: boolean;
    observability_config: boolean;
    financial_access: boolean;
};

export type AdminStatus = {
    isAdmin: boolean;
    role?: AdminRole;
    permissions?: AdminPermissions;
};

export type AdminUser = {
    id: string;
    email: string;
    createdAt: string;
    profile: {
        fullName: string | null;
        username: string | null;
        avatarUrl: string | null;
        imagesGenerated: number | null;
    } | null;
    credits: {
        balance: number | null;
        tierId: string | null;
    } | null;
};

export type AdminUserDetail = {
    user: {
        id: string;
        email: string;
        createdAt: string;
        updatedAt: string;
        failedLoginAttempts: number;
        lockedUntil: string | null;
    };
    profile: {
        id: string;
        email: string;
        fullName: string | null;
        username: string | null;
        avatarUrl: string | null;
        imagesGenerated: number;
        storageUsedMb: string;
    } | null;
    creditAccount: {
        creditBalance: number;
        tierId: string | null;
        lifetimeCreditsUsed: number;
        lifetimeCreditsGranted: number;
    } | null;
    isAdmin: boolean;
    adminRole?: AdminRole;
    recentTransactions: Array<{
        id: string;
        amount: number;
        type: string;
        description: string | null;
        createdAt: string;
    }>;
};

export type AgentConfig = {
    id: string;
    agentId: string;
    name: string;
    type: string;
    model: string | null;
    provider: string | null;
    systemPrompt: string | null;
    capabilities: unknown[];
    parameters: Record<string, unknown>;
    enabled: boolean;
    version: number;
    runtime: {
        status: string;
        metrics: {
            totalCalls: number;
            successCount: number;
            errorCount: number;
            avgLatencyMs: number;
        };
    } | null;
    skillCount: number;
    mcpConnectionCount: number;
};

export type DashboardStats = {
    users: {
        total: number;
        admins: number;
    };
    agents: {
        total: number;
    };
    today: {
        totalRequests: number;
        totalLlmCalls: number;
        totalTokens: number;
        uniqueUsers: number;
        errorCount: number;
    };
};

export type AuditLogEntry = {
    id: string;
    adminUserId: string;
    action: string;
    resource: string | null;
    resourceId: string | null;
    details: unknown;
    ipAddress: string | null;
    userAgent: string | null;
    status: string;
    createdAt: string;
};

export type LlmTrace = {
    id: string;
    traceId?: string;
    agentId: string | null;
    model: string;
    input: unknown;
    output: unknown;
    totalTokens: number | null;
    durationMs: number | null;
    latencyMs?: number | null;
    status: string | null;
    costUsd?: number | null;
    deepLink?: string | null;
    userId?: string | null;
    createdAt: string;
};

export type CostBreakdownItem = {
    key: string;
    email?: string;
    totalCost: number;
    callCount: number;
    avgCost: number;
    totalTokens: number;
};

export type CostBreakdownResponse = {
    breakdown: CostBreakdownItem[];
    totals: {
        totalCost: number;
        totalCalls: number;
        totalTokens: number;
    };
    groupBy: 'model' | 'user' | 'operation';
    days: number;
};

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

export type ApiMetric = {
    endpoint: string;
    method: string;
    avgLatency: number;
    requestCount: number;
};

// Model Performance Types
export type ModelPerformanceStats = {
    modelId: string;
    modelName: string;
    provider: 'gemini' | 'openrouter' | 'replicate';
    capabilities: string[];
    totalCalls: number;
    successCount: number;
    errorCount: number;
    successRate: number;
    avgLatencyMs: number;
    totalTokens: number;
    totalCostUsd: number;
    avgCostPerCall: number;
    lastUsedAt: string | null;
};

export type ModelPerformanceResponse = {
    models: ModelPerformanceStats[];
    summary: {
        totalCalls: number;
        totalTokens: number;
        totalCostUsd: number;
        avgSuccessRate: number;
        avgLatencyMs: number;
    };
};

export type ModelComparisonCriteria = 'speed' | 'quality' | 'cost' | 'balanced';

export type ModelRanking = {
    modelId: string;
    score: number;
    ranking: number;
    reason: string;
    metrics: {
        avgTime: number | null;
        successRate: number | null;
        cost: number;
    };
};

// Agent Enhancement Types (Phase 8)
export type AgentModelParameters = {
    temperature: number;
    maxTokens: number;
    topP: number;
    frequencyPenalty: number;
    presencePenalty: number;
    stopSequences: string[];
};

export type AgentCostBudget = {
    dailyLimitUsd: number | null;
    monthlyLimitUsd: number | null;
    alertThresholdPercent: number;
    currentDailySpend: number;
    currentMonthlySpend: number;
    isOverBudget: boolean;
};

export type AgentVersionHistory = {
    id: string;
    version: number;
    systemPrompt: string;
    parameters: AgentModelParameters;
    changedBy: string | null;
    changedAt: string;
    changeReason: string | null;
};

export type AgentTestResult = {
    id: string;
    input: string;
    output: string;
    model: string;
    tokensUsed: number;
    latencyMs: number;
    costUsd: number;
    status: 'success' | 'error';
    error?: string;
    createdAt: string;
};

// Pydantic AI Agent Types (Phase 9)
export type ApiHealthStatus = {
    provider: 'openrouter' | 'replicate' | 'openai' | 'cognee' | 'langfuse';
    status: 'healthy' | 'degraded' | 'down';
    latencyMs: number;
    uptime24h: number;
    features?: string[];
};

export type AgentDashboardSummary = {
    totalAgents: number;
    activeAgents: number;
    totalCalls24h: number;
    totalTokens24h: number;
    totalCost24h: number;
    avgLatencyMs: number;
    apiHealth: ApiHealthStatus[];
};
