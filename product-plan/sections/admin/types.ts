// Admin Dashboard Types

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  plan: PlanType;
  status: UserStatus;
  role: UserRole;
  generationCount: number;
  lastActiveAt: Date;
  createdAt: Date;
  subscription?: AdminSubscription;
  usage?: UserUsage;
}

export type PlanType = 'free' | 'pro' | 'team' | 'enterprise';
export type UserStatus = 'active' | 'suspended' | 'deleted' | 'pending';
export type UserRole = 'user' | 'admin' | 'super_admin';

export interface AdminSubscription {
  plan: PlanType;
  status: 'active' | 'canceled' | 'past_due';
  mrr: number;
  startedAt: Date;
  currentPeriodEnd: Date;
}

export interface UserUsage {
  generations: number;
  storage: number;
  apiCalls: number;
  costThisMonth: number;
}

export interface AIAgent {
  id: string;
  name: string;
  type: AgentType;
  enabled: boolean;
  model: string;
  version: string;
  config: AgentConfig;
  status: AgentStatus;
}

export type AgentType =
  | 'voice'
  | 'generation'
  | 'analysis'
  | 'editing'
  | 'upscaling'
  | 'background_removal';

export type AgentStatus = 'healthy' | 'degraded' | 'down' | 'maintenance';

export interface AgentConfig {
  maxConcurrent?: number;
  timeout?: number;
  retryAttempts?: number;
  costPerCall?: number;
  modelVersion?: string;
}

export interface AgentMetrics {
  agentId: string;
  period: string;
  calls: number;
  successRate: number;
  avgLatency: number;
  p95Latency: number;
  p99Latency: number;
  totalCost: number;
  errorBreakdown: Record<string, number>;
}

export interface LogEntry {
  id: string;
  timestamp: Date;
  level: LogLevel;
  service: string;
  message: string;
  userId?: string;
  requestId?: string;
  metadata?: Record<string, unknown>;
  stack?: string;
}

export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal';

export interface LogFilters {
  level?: LogLevel[];
  service?: string[];
  userId?: string;
  timeRange: TimeRange;
  search?: string;
}

export interface TimeRange {
  start: Date;
  end: Date;
}

export interface FinanceData {
  period: string;
  revenue: RevenueData;
  costs: CostData;
  profit: number;
  usersByPlan: Record<PlanType, number>;
  projections?: ProjectionData;
}

export interface RevenueData {
  total: number;
  mrr: number;
  arr: number;
  growth: number;
  byPlan: Record<PlanType, number>;
}

export interface CostData {
  total: number;
  openai: number;
  replicate: number;
  google: number;
  infrastructure: number;
  other: number;
}

export interface ProjectionData {
  nextMonth: number;
  nextQuarter: number;
  nextYear: number;
  confidence: number;
}

export interface DashboardStats {
  activeUsers: StatValue;
  generationsToday: StatValue;
  revenue: StatValue;
  errorRate: StatValue;
  avgLatency: StatValue;
  activeAgents: StatValue;
}

export interface StatValue {
  current: number;
  previous: number;
  change: number;
  trend: 'up' | 'down' | 'neutral';
}

export interface AdminAction {
  type: AdminActionType;
  targetId: string;
  targetType: 'user' | 'agent' | 'subscription';
  reason?: string;
  performedBy: string;
  performedAt: Date;
}

export type AdminActionType =
  | 'suspend_user'
  | 'reactivate_user'
  | 'delete_user'
  | 'impersonate_user'
  | 'refund_subscription'
  | 'upgrade_plan'
  | 'downgrade_plan'
  | 'enable_agent'
  | 'disable_agent'
  | 'update_agent_config';

export type AdminSection =
  | 'overview'
  | 'users'
  | 'agents'
  | 'observability'
  | 'finance';
