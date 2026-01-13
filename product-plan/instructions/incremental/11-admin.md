# Milestone 11: Admin Dashboard

Build administrative controls for platform management.

## Prerequisites
- All user-facing features complete
- User role system implemented

## Deliverables

### Pages
1. **AdminDashboard** — Overview with key metrics
2. **AdminUsers** — User management
3. **AdminAgents** — AI agent monitoring
4. **AdminObservability** — Logs and system health
5. **AdminFinance** — Revenue and cost tracking

### Components
1. **AdminLayout** — Admin page wrapper with nav
2. **AdminNav** — Sidebar navigation
3. **AdminGuard** — Role-based access control
4. **MetricCard** — Key stat display
5. **UsageChart** — Time-series visualization
6. **UserTable** — Paginated user list
7. **UserDetailDrawer** — User details panel
8. **AgentCard** — AI agent status card
9. **LogViewer** — Real-time log stream
10. **FinanceChart** — Revenue/cost charts

### Services
1. **adminApi** — Admin API endpoints
2. **analyticsService** — Metrics aggregation
3. **auditService** — Admin action logging

## Data Model

```typescript
interface AdminUser {
  id: string;
  email: string;
  name: string;
  plan: 'free' | 'pro' | 'team' | 'enterprise';
  status: 'active' | 'suspended' | 'deleted';
  role: 'user' | 'admin' | 'super_admin';
  generationCount: number;
  lastActiveAt: Date;
}

interface AIAgent {
  id: string;
  name: string;
  type: 'voice' | 'generation' | 'analysis' | 'editing';
  enabled: boolean;
  model: string;
  status: 'healthy' | 'degraded' | 'down';
}

interface LogEntry {
  id: string;
  timestamp: Date;
  level: 'info' | 'warn' | 'error';
  service: string;
  message: string;
  metadata?: Record<string, unknown>;
}
```

## Implementation Notes

### Overview Dashboard
- Key metrics: Active users, generations, revenue, error rate
- Usage chart with time range selector
- Recent activity feed
- System status indicators

### User Management
- Searchable, sortable table
- Click for detail drawer
- Admin actions: suspend, delete, impersonate
- Audit logging for all actions

### Agent Monitoring
- Card per agent with status
- Performance metrics: latency, success rate, cost
- Enable/disable toggle
- Configuration access

### Observability
- Real-time log stream
- Filter by level, service, time
- Search log content
- Error grouping

### Finance
- Revenue chart (MRR, ARR)
- Cost breakdown by provider
- User distribution by plan
- Projections

## Security

### Access Control
- Admin role check on every request
- Audit log for all admin actions
- Session timeout
- IP allowlisting (optional)

### Sensitive Operations
- Confirmation dialogs for destructive actions
- Two-step for user deletion
- Impersonation logging

## Mobile Considerations
- Responsive tables with scroll
- Card layout on mobile
- Bottom sheet for user details
- Simplified charts
