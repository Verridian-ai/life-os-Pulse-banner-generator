import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ADMIN_INPUT, ADMIN_SELECT } from '../../../styles';
import { AdminLayout } from '../components/AdminLayout';
import { AdminGuard } from '../components/AdminGuard';
import {
  listTraces,
  getMetrics,
  listAuditLogs,
  getCostBreakdown,
  getDailyMetrics,
  type ListAuditLogsResponse,
} from '../services/adminApi';
import type { LlmTrace, ApiMetric, AuditLogEntry, CostBreakdownItem, DailyMetric } from '../types';

// Format currency
const formatCurrency = (value: number): string => {
  if (value < 0.01) return '$' + value.toFixed(4);
  if (value < 1) return '$' + value.toFixed(3);
  return '$' + value.toFixed(2);
};

export function AdminObservability(): React.ReactElement {
  const [traces, setTraces] = useState<LlmTrace[]>([]);
  const [metrics, setMetrics] = useState<ApiMetric[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPolling, setIsPolling] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  // Cost breakdown state
  const [costBreakdown, setCostBreakdown] = useState<CostBreakdownItem[]>([]);
  const [costTotals, setCostTotals] = useState({ totalCost: 0, totalCalls: 0, totalTokens: 0 });
  const [costGroupBy, setCostGroupBy] = useState<'model' | 'user' | 'operation'>('model');
  const [costDays, setCostDays] = useState(7);
  const [costLoading, setCostLoading] = useState(true);

  // Daily metrics state (data loaded for future chart visualization)
  const [, setDailyMetrics] = useState<DailyMetric[]>([]);

  // Langfuse host for deep links
  const langfuseHost = import.meta.env.VITE_LANGFUSE_HOST || 'http://localhost:3001';

  // Audit logs state
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [auditLogsTotal, setAuditLogsTotal] = useState(0);
  const [auditLogsLoading, setAuditLogsLoading] = useState(true);
  const [availableActions, setAvailableActions] = useState<string[]>([]);
  const [availableResources, setAvailableResources] = useState<string[]>([]);

  // Audit logs filters
  const [actionFilter, setActionFilter] = useState('');
  const [resourceFilter, setResourceFilter] = useState('');
  const [dateFromFilter, setDateFromFilter] = useState('');
  const [dateToFilter, setDateToFilter] = useState('');
  const [auditLogsPage, setAuditLogsPage] = useState(1);
  const auditLogsLimit = 20;

  // Fetch traces and metrics
  const fetchData = useCallback(async () => {
    setIsPolling(true);
    try {
      const [tracesData, metricsData, dailyData] = await Promise.all([
        listTraces({ limit: 50 }),
        getMetrics(),
        getDailyMetrics(7),
      ]);

      setTraces(tracesData.traces as LlmTrace[]);
      setMetrics(metricsData.metrics as ApiMetric[]);
      setDailyMetrics(dailyData.daily || []);
    } catch (err) {
      console.error('Failed to load observability data', err);
    } finally {
      setIsLoading(false);
      setIsPolling(false);
    }
  }, []);

  // Fetch cost breakdown
  const fetchCostBreakdown = useCallback(async () => {
    setCostLoading(true);
    try {
      const data = await getCostBreakdown({ days: costDays, groupBy: costGroupBy });
      setCostBreakdown(data.breakdown);
      setCostTotals(data.totals);
    } catch (err) {
      console.error('Failed to load cost breakdown', err);
    } finally {
      setCostLoading(false);
    }
  }, [costDays, costGroupBy]);

  // Initial load
  useEffect(() => {
    fetchData();
    fetchCostBreakdown();
  }, [fetchData, fetchCostBreakdown]);

  // Auto-refresh polling
  useEffect(() => {
    if (autoRefresh) {
      pollingRef.current = setInterval(fetchData, 10000); // Poll every 10 seconds
    } else if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }

    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
    };
  }, [autoRefresh, fetchData]);

  // Fetch audit logs with filters
  const fetchAuditLogs = useCallback(async () => {
    try {
      setAuditLogsLoading(true);
      const offset = (auditLogsPage - 1) * auditLogsLimit;
      const result: ListAuditLogsResponse = await listAuditLogs({
        limit: auditLogsLimit,
        offset,
        action: actionFilter || undefined,
        resource: resourceFilter || undefined,
        dateFrom: dateFromFilter || undefined,
        dateTo: dateToFilter || undefined,
      });
      setAuditLogs(result.logs);
      setAuditLogsTotal(result.total);
      if (result.filters) {
        setAvailableActions(result.filters.actions);
        setAvailableResources(result.filters.resources);
      }
    } catch (err) {
      console.error('Failed to load audit logs', err);
    } finally {
      setAuditLogsLoading(false);
    }
  }, [auditLogsPage, actionFilter, resourceFilter, dateFromFilter, dateToFilter]);

  useEffect(() => {
    fetchAuditLogs();
  }, [fetchAuditLogs]);

  // Handle filter changes with debounce reset to page 1
  const handleFilterChange = (
    setter: React.Dispatch<React.SetStateAction<string>>,
    value: string,
  ) => {
    setter(value);
    setAuditLogsPage(1);
  };

  const clearFilters = () => {
    setActionFilter('');
    setResourceFilter('');
    setDateFromFilter('');
    setDateToFilter('');
    setAuditLogsPage(1);
  };

  const hasActiveFilters = actionFilter || resourceFilter || dateFromFilter || dateToFilter;

  const getStatusColor = (status: string | null) => {
    switch (status) {
      case 'success':
        return 'text-green-400 bg-green-400/10';
      case 'error':
        return 'text-red-400 bg-red-400/10';
      default:
        return 'text-zinc-400 bg-zinc-800';
    }
  };

  // Open trace in Langfuse
  const openTraceInLangfuse = (traceId: string) => {
    window.open(`${langfuseHost}/trace/${traceId}`, '_blank');
  };

  return (
    <AdminGuard>
      <AdminLayout activeSection='observability'>
        <div className='space-y-8'>
          {/* Header */}
          <div className='flex justify-between items-start'>
            <div>
              <h1 className='text-3xl font-bold text-white'>Observability</h1>
              <p className='text-zinc-400 mt-1'>Monitor AI agent performance, costs, and traces</p>
            </div>
            <div className='flex gap-2 items-center'>
              <label className='flex items-center gap-2 text-sm text-zinc-400'>
                <input
                  type='checkbox'
                  checked={autoRefresh}
                  onChange={(e) => setAutoRefresh(e.target.checked)}
                  className='rounded border-white/20 bg-zinc-800'
                />
                Auto-refresh
              </label>
              {isPolling && (
                <span className='text-xs text-blue-400 animate-pulse'>Updating...</span>
              )}
            </div>
          </div>

          {/* Metrics Overview */}
          <div className='grid grid-cols-1 md:grid-cols-4 gap-6'>
            <div className='bg-zinc-900 border border-white/10 rounded-xl p-6'>
              <h3 className='text-zinc-500 text-sm font-medium mb-2'>Total Requests (24h)</h3>
              <p className='text-3xl font-bold text-white'>
                {metrics.reduce((acc, m) => acc + m.requestCount, 0).toLocaleString()}
              </p>
            </div>
            <div className='bg-zinc-900 border border-white/10 rounded-xl p-6'>
              <h3 className='text-zinc-500 text-sm font-medium mb-2'>Avg Latency (24h)</h3>
              <p className='text-3xl font-bold text-blue-400'>
                {Math.round(
                  metrics.reduce((acc, m) => acc + m.avgLatency, 0) / (metrics.length || 1),
                )}
                ms
              </p>
            </div>
            <div className='bg-zinc-900 border border-white/10 rounded-xl p-6'>
              <h3 className='text-zinc-500 text-sm font-medium mb-2'>Total Cost ({costDays}d)</h3>
              <p className='text-3xl font-bold text-amber-400'>
                {formatCurrency(costTotals.totalCost)}
              </p>
            </div>
            <div className='bg-zinc-900 border border-white/10 rounded-xl p-6'>
              <h3 className='text-zinc-500 text-sm font-medium mb-2'>Total Tokens ({costDays}d)</h3>
              <p className='text-3xl font-bold text-purple-400'>
                {costTotals.totalTokens.toLocaleString()}
              </p>
            </div>
          </div>

          {/* Cost Breakdown */}
          <div className='bg-zinc-900 border border-white/10 rounded-xl overflow-hidden'>
            <div className='p-6 border-b border-white/10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4'>
              <div>
                <h2 className='text-xl font-bold text-white'>Cost Breakdown</h2>
                <p className='text-zinc-500 text-sm mt-1'>
                  {costTotals.totalCalls} calls totaling {formatCurrency(costTotals.totalCost)}
                </p>
              </div>
              <div className='flex gap-2 flex-wrap'>
                <select
                  value={costGroupBy}
                  onChange={(e) => setCostGroupBy(e.target.value as 'model' | 'user' | 'operation')}
                  className={ADMIN_SELECT}
                  aria-label='Group costs by'
                >
                  <option value='model'>By Model</option>
                  <option value='user'>By User</option>
                  <option value='operation'>By Operation</option>
                </select>
                <select
                  value={costDays}
                  onChange={(e) => setCostDays(parseInt(e.target.value))}
                  className={ADMIN_SELECT}
                  aria-label='Select date range'
                >
                  <option value='1'>Last 24h</option>
                  <option value='7'>Last 7 days</option>
                  <option value='30'>Last 30 days</option>
                </select>
              </div>
            </div>

            <div className='overflow-x-auto'>
              <table className='w-full text-left text-sm'>
                <thead className='bg-white/5 text-zinc-400 font-medium'>
                  <tr>
                    <th className='px-6 py-3'>
                      {costGroupBy === 'user'
                        ? 'User'
                        : costGroupBy === 'model'
                          ? 'Model'
                          : 'Operation'}
                    </th>
                    <th className='px-6 py-3 text-right'>Calls</th>
                    <th className='px-6 py-3 text-right'>Total Cost</th>
                    <th className='px-6 py-3 text-right'>Avg Cost</th>
                    <th className='px-6 py-3 text-right'>Tokens</th>
                  </tr>
                </thead>
                <tbody className='divide-y divide-white/5'>
                  {costLoading ? (
                    <tr>
                      <td colSpan={5} className='px-6 py-8 text-center text-zinc-500'>
                        Loading cost breakdown...
                      </td>
                    </tr>
                  ) : costBreakdown.length === 0 ? (
                    <tr>
                      <td colSpan={5} className='px-6 py-8 text-center text-zinc-500'>
                        No cost data found
                      </td>
                    </tr>
                  ) : (
                    costBreakdown.map((item, i) => (
                      <tr key={i} className='hover:bg-white/5 transition'>
                        <td className='px-6 py-4'>
                          <div className='flex flex-col'>
                            <span className='text-white font-medium'>{item.key || 'Unknown'}</span>
                            {item.email && (
                              <span className='text-zinc-500 text-xs'>{item.email}</span>
                            )}
                          </div>
                        </td>
                        <td className='px-6 py-4 text-right text-zinc-300'>
                          {item.callCount.toLocaleString()}
                        </td>
                        <td className='px-6 py-4 text-right text-amber-400 font-medium'>
                          {formatCurrency(item.totalCost)}
                        </td>
                        <td className='px-6 py-4 text-right text-zinc-400'>
                          {formatCurrency(item.avgCost)}
                        </td>
                        <td className='px-6 py-4 text-right text-zinc-300'>
                          {item.totalTokens.toLocaleString()}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Traces Table */}
          <div className='bg-zinc-900 border border-white/10 rounded-xl overflow-hidden'>
            <div className='p-6 border-b border-white/10 flex justify-between items-center'>
              <h2 className='text-xl font-bold text-white'>Recent LLM Traces</h2>
              <div className='flex gap-2'>
                <button
                  onClick={fetchData}
                  disabled={isPolling}
                  className='px-3 py-1.5 text-xs font-medium text-zinc-400 bg-black/30 rounded-lg hover:text-white disabled:opacity-50'
                >
                  Refresh
                </button>
                <a
                  href={langfuseHost}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='px-3 py-1.5 text-xs font-medium text-purple-400 bg-purple-500/10 rounded-lg hover:bg-purple-500/20'
                >
                  Open Langfuse
                </a>
              </div>
            </div>

            <div className='overflow-x-auto'>
              <table className='w-full text-left text-sm'>
                <thead className='bg-white/5 text-zinc-400 font-medium'>
                  <tr>
                    <th className='px-6 py-3'>Timestamp</th>
                    <th className='px-6 py-3'>Agent / Model</th>
                    <th className='px-6 py-3'>Input Preview</th>
                    <th className='px-6 py-3'>Tokens</th>
                    <th className='px-6 py-3'>Duration</th>
                    <th className='px-6 py-3'>Cost</th>
                    <th className='px-6 py-3'>Status</th>
                    <th className='px-6 py-3'>Link</th>
                  </tr>
                </thead>
                <tbody className='divide-y divide-white/5'>
                  {isLoading ? (
                    <tr>
                      <td colSpan={8} className='px-6 py-8 text-center text-zinc-500'>
                        Loading traces...
                      </td>
                    </tr>
                  ) : traces.length === 0 ? (
                    <tr>
                      <td colSpan={8} className='px-6 py-8 text-center text-zinc-500'>
                        No traces found
                      </td>
                    </tr>
                  ) : (
                    traces.map((trace, i) => (
                      <tr key={i} className='hover:bg-white/5 transition'>
                        <td className='px-6 py-4 text-zinc-300'>
                          {trace.createdAt
                            ? new Date(trace.createdAt).toLocaleString(undefined, {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                                second: '2-digit',
                              })
                            : '-'}
                        </td>
                        <td className='px-6 py-4'>
                          <div className='flex flex-col'>
                            <span className='text-white font-medium'>
                              {trace.agentId || 'Unknown'}
                            </span>
                            <span className='text-zinc-500 text-xs'>{trace.model}</span>
                          </div>
                        </td>
                        <td className='px-6 py-4'>
                          <p className='text-zinc-400 truncate max-w-[200px]'>
                            {typeof trace.input === 'string'
                              ? trace.input
                              : JSON.stringify(trace.input)}
                          </p>
                        </td>
                        <td className='px-6 py-4 text-zinc-300'>{trace.totalTokens || 0}</td>
                        <td className='px-6 py-4 text-zinc-300'>
                          {trace.durationMs || trace.latencyMs || 0}ms
                        </td>
                        <td className='px-6 py-4 text-amber-400'>
                          {trace.costUsd ? formatCurrency(trace.costUsd) : '-'}
                        </td>
                        <td className='px-6 py-4'>
                          <span
                            className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(trace.status)}`}
                          >
                            {trace.status || 'success'}
                          </span>
                        </td>
                        <td className='px-6 py-4'>
                          {(trace.traceId || trace.id) && (
                            <button
                              onClick={() => openTraceInLangfuse(trace.traceId || trace.id)}
                              className='text-purple-400 hover:text-purple-300 text-xs'
                              title='Open in Langfuse'
                            >
                              View
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Audit Logs Section */}
          <div className='bg-zinc-900 border border-white/10 rounded-xl overflow-hidden'>
            <div className='p-6 border-b border-white/10'>
              <div className='flex flex-col lg:flex-row lg:items-center justify-between gap-4'>
                <div>
                  <h2 className='text-xl font-bold text-white'>Admin Audit Logs</h2>
                  <p className='text-zinc-500 text-sm mt-1'>
                    {auditLogsTotal} total entries
                    {hasActiveFilters && ' (filtered)'}
                  </p>
                </div>
                <button
                  onClick={fetchAuditLogs}
                  className='px-3 py-1.5 text-xs font-medium text-zinc-400 bg-black/30 rounded-lg hover:text-white'
                >
                  Refresh
                </button>
              </div>

              {/* Filters */}
              <div className='mt-4 flex flex-wrap gap-3'>
                {/* Action Filter */}
                <select
                  value={actionFilter}
                  onChange={(e) => handleFilterChange(setActionFilter, e.target.value)}
                  className={ADMIN_SELECT}
                  aria-label='Filter by action'
                >
                  <option value=''>All Actions</option>
                  {availableActions.map((action) => (
                    <option key={action} value={action}>
                      {action}
                    </option>
                  ))}
                </select>

                {/* Resource Filter */}
                <select
                  value={resourceFilter}
                  onChange={(e) => handleFilterChange(setResourceFilter, e.target.value)}
                  className={ADMIN_SELECT}
                  aria-label='Filter by resource'
                >
                  <option value=''>All Resources</option>
                  {availableResources.map((resource) => (
                    <option key={resource} value={resource}>
                      {resource}
                    </option>
                  ))}
                </select>

                {/* Date From */}
                <div className='flex items-center gap-2'>
                  <span className='text-zinc-500 text-sm'>From:</span>
                  <input
                    type='date'
                    value={dateFromFilter}
                    onChange={(e) => handleFilterChange(setDateFromFilter, e.target.value)}
                    className={ADMIN_INPUT}
                    aria-label='Filter from date'
                  />
                </div>

                {/* Date To */}
                <div className='flex items-center gap-2'>
                  <span className='text-zinc-500 text-sm'>To:</span>
                  <input
                    type='date'
                    value={dateToFilter}
                    onChange={(e) => handleFilterChange(setDateToFilter, e.target.value)}
                    className={ADMIN_INPUT}
                    aria-label='Filter to date'
                  />
                </div>

                {/* Clear Filters */}
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className='px-3 py-2 text-sm font-medium text-red-400 bg-red-500/10 rounded-lg hover:bg-red-500/20 transition'
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            </div>

            {/* Audit Logs Table */}
            <div className='overflow-x-auto'>
              <table className='w-full text-left text-sm'>
                <thead className='bg-white/5 text-zinc-400 font-medium'>
                  <tr>
                    <th className='px-6 py-3'>Timestamp</th>
                    <th className='px-6 py-3'>Action</th>
                    <th className='px-6 py-3'>Resource</th>
                    <th className='px-6 py-3'>Admin ID</th>
                    <th className='px-6 py-3'>Details</th>
                    <th className='px-6 py-3'>Status</th>
                  </tr>
                </thead>
                <tbody className='divide-y divide-white/5'>
                  {auditLogsLoading ? (
                    <tr>
                      <td colSpan={6} className='px-6 py-8 text-center text-zinc-500'>
                        Loading audit logs...
                      </td>
                    </tr>
                  ) : auditLogs.length === 0 ? (
                    <tr>
                      <td colSpan={6} className='px-6 py-8 text-center text-zinc-500'>
                        No audit logs found
                      </td>
                    </tr>
                  ) : (
                    auditLogs.map((log) => (
                      <tr key={log.id} className='hover:bg-white/5 transition'>
                        <td className='px-6 py-4 text-zinc-300'>
                          {log.createdAt
                            ? new Date(log.createdAt).toLocaleString(undefined, {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                                second: '2-digit',
                              })
                            : '-'}
                        </td>
                        <td className='px-6 py-4'>
                          <span className='px-2 py-1 bg-purple-500/10 text-purple-400 rounded text-xs font-medium'>
                            {log.action}
                          </span>
                        </td>
                        <td className='px-6 py-4'>
                          <div className='flex flex-col'>
                            <span className='text-white'>{log.resource || '-'}</span>
                            {log.resourceId && (
                              <span className='text-zinc-500 text-xs truncate max-w-[150px]'>
                                {log.resourceId}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className='px-6 py-4'>
                          <span className='text-zinc-400 text-xs truncate max-w-[100px] block'>
                            {log.adminUserId}
                          </span>
                        </td>
                        <td className='px-6 py-4'>
                          <p
                            className='text-zinc-400 truncate max-w-[200px]'
                            title={JSON.stringify(log.details)}
                          >
                            {log.details ? JSON.stringify(log.details) : '-'}
                          </p>
                        </td>
                        <td className='px-6 py-4'>
                          <span
                            className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(log.status)}`}
                          >
                            {log.status || 'success'}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {auditLogsTotal > auditLogsLimit && (
              <div className='px-6 py-4 border-t border-white/5 flex items-center justify-between'>
                <p className='text-zinc-500 text-sm'>
                  Page {auditLogsPage} of {Math.ceil(auditLogsTotal / auditLogsLimit)}
                </p>
                <div className='flex gap-2'>
                  <button
                    onClick={() => setAuditLogsPage((p) => Math.max(1, p - 1))}
                    disabled={auditLogsPage === 1}
                    className='px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg text-sm transition'
                  >
                    Previous
                  </button>
                  <button
                    onClick={() =>
                      setAuditLogsPage((p) =>
                        Math.min(Math.ceil(auditLogsTotal / auditLogsLimit), p + 1),
                      )
                    }
                    disabled={auditLogsPage >= Math.ceil(auditLogsTotal / auditLogsLimit)}
                    className='px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg text-sm transition'
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </AdminLayout>
    </AdminGuard>
  );
}
