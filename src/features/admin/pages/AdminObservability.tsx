import React, { useState, useEffect, useCallback } from 'react';
import { AdminLayout } from '../components/AdminLayout';
import { AdminGuard } from '../components/AdminGuard';
import { listTraces, getMetrics, listAuditLogs, type ListAuditLogsResponse } from '../services/adminApi';
import type { LlmTrace, ApiMetric, AuditLogEntry } from '../types';

export function AdminObservability(): React.ReactElement {
    const [traces, setTraces] = useState<LlmTrace[]>([]);
    const [metrics, setMetrics] = useState<ApiMetric[]>([]);
    const [isLoading, setIsLoading] = useState(true);

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

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [tracesData, metricsData] = await Promise.all([
                    listTraces({ limit: 50 }),
                    getMetrics(),
                ]);
                // Casting to any to avoid generic unknown[] issues from api types until fully typed

                setTraces(tracesData.traces as LlmTrace[]);
                setMetrics(metricsData.metrics as ApiMetric[]);
            } catch (err) {
                console.error('Failed to load observability data', err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

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
        value: string
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
            case 'success': return 'text-green-400 bg-green-400/10';
            case 'error': return 'text-red-400 bg-red-400/10';
            default: return 'text-zinc-400 bg-zinc-800';
        }
    };

    return (
        <AdminGuard>
            <AdminLayout activeSection="observability">
                <div className="space-y-8">
                    {/* Header */}
                    <div>
                        <h1 className="text-3xl font-bold text-white">Observability</h1>
                        <p className="text-zinc-400 mt-1">Monitor AI agent performance and traces</p>
                    </div>

                    {/* Metrics Overview */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-zinc-900 border border-white/10 rounded-xl p-6">
                            <h3 className="text-zinc-500 text-sm font-medium mb-2">Total Requests (24h)</h3>
                            <p className="text-3xl font-bold text-white">
                                {metrics.reduce((acc, m) => acc + m.requestCount, 0).toLocaleString()}
                            </p>
                        </div>
                        <div className="bg-zinc-900 border border-white/10 rounded-xl p-6">
                            <h3 className="text-zinc-500 text-sm font-medium mb-2">Avg Latency (24h)</h3>
                            <p className="text-3xl font-bold text-blue-400">
                                {Math.round(metrics.reduce((acc, m) => acc + m.avgLatency, 0) / (metrics.length || 1))}ms
                            </p>
                        </div>
                        <div className="bg-zinc-900 border border-white/10 rounded-xl p-6">
                            <h3 className="text-zinc-500 text-sm font-medium mb-2">Error Rate</h3>
                            <p className="text-3xl font-bold text-green-400">0.0%</p>
                        </div>
                    </div>

                    {/* Traces Table */}
                    <div className="bg-zinc-900 border border-white/10 rounded-xl overflow-hidden">
                        <div className="p-6 border-b border-white/10 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-white">Recent LLM Traces</h2>
                            <div className="flex gap-2">
                                <button className="px-3 py-1.5 text-xs font-medium text-zinc-400 bg-black/30 rounded-lg hover:text-white">
                                    Refresh
                                </button>
                                <button className="px-3 py-1.5 text-xs font-medium text-purple-400 bg-purple-500/10 rounded-lg hover:bg-purple-500/20">
                                    View in Langfuse ↗
                                </button>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-white/5 text-zinc-400 font-medium">
                                    <tr>
                                        <th className="px-6 py-3">Timestamp</th>
                                        <th className="px-6 py-3">Agent / Model</th>
                                        <th className="px-6 py-3">Input Preview</th>
                                        <th className="px-6 py-3">Tokens</th>
                                        <th className="px-6 py-3">Duration</th>
                                        <th className="px-6 py-3">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {isLoading ? (
                                        <tr>
                                            <td colSpan={6} className="px-6 py-8 text-center text-zinc-500">
                                                Loading traces...
                                            </td>
                                        </tr>
                                    ) : traces.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="px-6 py-8 text-center text-zinc-500">
                                                No traces found
                                            </td>
                                        </tr>
                                    ) : (
                                        traces.map((trace, i) => (
                                            <tr key={i} className="hover:bg-white/5 transition">
                                                <td className="px-6 py-4 text-zinc-300">
                                                    {trace.createdAt ? new Date(trace.createdAt).toLocaleString(undefined, {
                                                        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit'
                                                    }) : '-'}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-col">
                                                        <span className="text-white font-medium">{trace.agentId || 'Unknown'}</span>
                                                        <span className="text-zinc-500 text-xs">{trace.model}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <p className="text-zinc-400 truncate max-w-[200px]">
                                                        {typeof trace.input === 'string' ? trace.input : JSON.stringify(trace.input)}
                                                    </p>
                                                </td>
                                                <td className="px-6 py-4 text-zinc-300">
                                                    {trace.totalTokens || 0}
                                                </td>
                                                <td className="px-6 py-4 text-zinc-300">
                                                    {trace.durationMs}ms
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(trace.status)}`}>
                                                        {trace.status || 'success'}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Audit Logs Section */}
                    <div className="bg-zinc-900 border border-white/10 rounded-xl overflow-hidden">
                        <div className="p-6 border-b border-white/10">
                            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                                <div>
                                    <h2 className="text-xl font-bold text-white">Admin Audit Logs</h2>
                                    <p className="text-zinc-500 text-sm mt-1">
                                        {auditLogsTotal} total entries
                                        {hasActiveFilters && ' (filtered)'}
                                    </p>
                                </div>
                                <button
                                    onClick={fetchAuditLogs}
                                    className="px-3 py-1.5 text-xs font-medium text-zinc-400 bg-black/30 rounded-lg hover:text-white"
                                >
                                    Refresh
                                </button>
                            </div>

                            {/* Filters */}
                            <div className="mt-4 flex flex-wrap gap-3">
                                {/* Action Filter */}
                                <select
                                    value={actionFilter}
                                    onChange={(e) => handleFilterChange(setActionFilter, e.target.value)}
                                    className="px-3 py-2 bg-zinc-800 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500"
                                >
                                    <option value="">All Actions</option>
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
                                    className="px-3 py-2 bg-zinc-800 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500"
                                >
                                    <option value="">All Resources</option>
                                    {availableResources.map((resource) => (
                                        <option key={resource} value={resource}>
                                            {resource}
                                        </option>
                                    ))}
                                </select>

                                {/* Date From */}
                                <div className="flex items-center gap-2">
                                    <span className="text-zinc-500 text-sm">From:</span>
                                    <input
                                        type="date"
                                        value={dateFromFilter}
                                        onChange={(e) => handleFilterChange(setDateFromFilter, e.target.value)}
                                        className="px-3 py-2 bg-zinc-800 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500"
                                    />
                                </div>

                                {/* Date To */}
                                <div className="flex items-center gap-2">
                                    <span className="text-zinc-500 text-sm">To:</span>
                                    <input
                                        type="date"
                                        value={dateToFilter}
                                        onChange={(e) => handleFilterChange(setDateToFilter, e.target.value)}
                                        className="px-3 py-2 bg-zinc-800 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500"
                                    />
                                </div>

                                {/* Clear Filters */}
                                {hasActiveFilters && (
                                    <button
                                        onClick={clearFilters}
                                        className="px-3 py-2 text-sm font-medium text-red-400 bg-red-500/10 rounded-lg hover:bg-red-500/20 transition"
                                    >
                                        Clear Filters
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Audit Logs Table */}
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-white/5 text-zinc-400 font-medium">
                                    <tr>
                                        <th className="px-6 py-3">Timestamp</th>
                                        <th className="px-6 py-3">Action</th>
                                        <th className="px-6 py-3">Resource</th>
                                        <th className="px-6 py-3">Admin ID</th>
                                        <th className="px-6 py-3">Details</th>
                                        <th className="px-6 py-3">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {auditLogsLoading ? (
                                        <tr>
                                            <td colSpan={6} className="px-6 py-8 text-center text-zinc-500">
                                                Loading audit logs...
                                            </td>
                                        </tr>
                                    ) : auditLogs.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="px-6 py-8 text-center text-zinc-500">
                                                No audit logs found
                                            </td>
                                        </tr>
                                    ) : (
                                        auditLogs.map((log) => (
                                            <tr key={log.id} className="hover:bg-white/5 transition">
                                                <td className="px-6 py-4 text-zinc-300">
                                                    {log.createdAt ? new Date(log.createdAt).toLocaleString(undefined, {
                                                        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit'
                                                    }) : '-'}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="px-2 py-1 bg-purple-500/10 text-purple-400 rounded text-xs font-medium">
                                                        {log.action}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-col">
                                                        <span className="text-white">{log.resource || '-'}</span>
                                                        {log.resourceId && (
                                                            <span className="text-zinc-500 text-xs truncate max-w-[150px]">
                                                                {log.resourceId}
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="text-zinc-400 text-xs truncate max-w-[100px] block">
                                                        {log.adminUserId}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <p className="text-zinc-400 truncate max-w-[200px]" title={JSON.stringify(log.details)}>
                                                        {log.details ? JSON.stringify(log.details) : '-'}
                                                    </p>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(log.status)}`}>
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
                            <div className="px-6 py-4 border-t border-white/5 flex items-center justify-between">
                                <p className="text-zinc-500 text-sm">
                                    Page {auditLogsPage} of {Math.ceil(auditLogsTotal / auditLogsLimit)}
                                </p>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setAuditLogsPage((p) => Math.max(1, p - 1))}
                                        disabled={auditLogsPage === 1}
                                        className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg text-sm transition"
                                    >
                                        Previous
                                    </button>
                                    <button
                                        onClick={() => setAuditLogsPage((p) => Math.min(Math.ceil(auditLogsTotal / auditLogsLimit), p + 1))}
                                        disabled={auditLogsPage >= Math.ceil(auditLogsTotal / auditLogsLimit)}
                                        className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg text-sm transition"
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
