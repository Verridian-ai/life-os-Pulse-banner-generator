/**
 * Admin Audit Logs Page
 *
 * View and filter admin action audit logs.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { ADMIN_SELECT } from '../../../styles';
import { AdminLayout } from '../components/AdminLayout';
import { AdminGuard } from '../components/AdminGuard';
import { listAuditLogs } from '../services/adminApi';
import type { AuditLogEntry } from '../types';

export function AdminAudit(): React.ReactElement {
    const [logs, setLogs] = useState<AuditLogEntry[]>([]);
    const [total, setTotal] = useState(0);
    const [filters, setFilters] = useState<{ actions: string[]; resources: string[] }>({
        actions: [],
        resources: [],
    });
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Filter state
    const [selectedAction, setSelectedAction] = useState('');
    const [selectedResource, setSelectedResource] = useState('');
    const [page, setPage] = useState(1);
    const limit = 20;

    const loadLogs = useCallback(async () => {
        try {
            setIsLoading(true);
            const result = await listAuditLogs({
                limit,
                offset: (page - 1) * limit,
                action: selectedAction || undefined,
                resource: selectedResource || undefined,
            });
            setLogs(result.logs);
            setTotal(result.total);
            setFilters(result.filters);
            setError(null);
        } catch (err) {
            console.error('[AdminAudit] Error:', err);
            setError('Failed to load audit logs');
        } finally {
            setIsLoading(false);
        }
    }, [selectedAction, selectedResource, page, limit]);

    useEffect(() => {
        loadLogs();
    }, [loadLogs]);

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString();
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'success':
                return (
                    <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-green-500/10 text-green-400">
                        Success
                    </span>
                );
            case 'failure':
                return (
                    <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-red-500/10 text-red-400">
                        Failed
                    </span>
                );
            default:
                return (
                    <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-zinc-500/10 text-zinc-400">
                        {status}
                    </span>
                );
        }
    };

    const totalPages = Math.ceil(total / limit);

    return (
        <AdminGuard>
            <AdminLayout activeSection="audit">
                <div className="space-y-6">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-white">Audit Logs</h1>
                            <p className="text-zinc-400 mt-1">Track admin actions and changes</p>
                        </div>
                        <button
                            onClick={loadLogs}
                            className="p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-white/5 transition"
                            title="Refresh"
                        >
                            <span className={`material-icons ${isLoading ? 'animate-spin' : ''}`}>refresh</span>
                        </button>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                            <p className="text-red-400 text-sm">{error}</p>
                        </div>
                    )}

                    {/* Filters */}
                    <div className="flex flex-wrap gap-4">
                        <div className="flex-1 min-w-[200px]">
                            <label className="block text-xs text-zinc-500 uppercase tracking-wider mb-2">
                                Action
                            </label>
                            <select
                                value={selectedAction}
                                onChange={(e) => {
                                    setSelectedAction(e.target.value);
                                    setPage(1);
                                }}
                                className={ADMIN_SELECT}
                                aria-label="Filter by action"
                            >
                                <option value="">All Actions</option>
                                {filters.actions.map((action) => (
                                    <option key={action} value={action}>
                                        {action}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="flex-1 min-w-[200px]">
                            <label className="block text-xs text-zinc-500 uppercase tracking-wider mb-2">
                                Resource
                            </label>
                            <select
                                value={selectedResource}
                                onChange={(e) => {
                                    setSelectedResource(e.target.value);
                                    setPage(1);
                                }}
                                className={ADMIN_SELECT}
                                aria-label="Filter by resource"
                            >
                                <option value="">All Resources</option>
                                {filters.resources.map((resource) => (
                                    <option key={resource} value={resource}>
                                        {resource}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Logs Table */}
                    <div className="bg-zinc-900/50 border border-white/5 rounded-2xl overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b border-white/5 text-zinc-400 text-xs uppercase tracking-wider">
                                        <th className="p-4 font-medium">Timestamp</th>
                                        <th className="p-4 font-medium">Action</th>
                                        <th className="p-4 font-medium">Resource</th>
                                        <th className="p-4 font-medium">Resource ID</th>
                                        <th className="p-4 font-medium">Status</th>
                                        <th className="p-4 font-medium">Details</th>
                                    </tr>
                                </thead>
                                <tbody className="text-sm divide-y divide-white/5">
                                    {isLoading && logs.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="p-8 text-center text-zinc-500">
                                                <span className="material-icons animate-spin mr-2">sync</span>
                                                Loading...
                                            </td>
                                        </tr>
                                    ) : logs.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="p-8 text-center text-zinc-500">
                                                No audit logs found
                                            </td>
                                        </tr>
                                    ) : (
                                        logs.map((log) => (
                                            <tr key={log.id} className="hover:bg-white/5 transition">
                                                <td className="p-4 text-zinc-400 whitespace-nowrap">
                                                    {formatDate(log.createdAt)}
                                                </td>
                                                <td className="p-4">
                                                    <span className="px-2 py-1 bg-purple-500/20 text-purple-300 text-xs rounded font-medium">
                                                        {log.action}
                                                    </span>
                                                </td>
                                                <td className="p-4 text-white">
                                                    {log.resource}
                                                </td>
                                                <td className="p-4 text-zinc-400 font-mono text-xs">
                                                    {log.resourceId ? (
                                                        <span title={log.resourceId}>
                                                            {log.resourceId.substring(0, 12)}...
                                                        </span>
                                                    ) : (
                                                        '-'
                                                    )}
                                                </td>
                                                <td className="p-4">
                                                    {getStatusBadge(log.status)}
                                                </td>
                                                <td className="p-4 text-zinc-400 max-w-xs truncate">
                                                    {log.details ? (
                                                        <span title={JSON.stringify(log.details, null, 2)}>
                                                            {JSON.stringify(log.details).substring(0, 50)}...
                                                        </span>
                                                    ) : (
                                                        '-'
                                                    )}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="p-4 border-t border-white/5 flex items-center justify-between">
                                <p className="text-sm text-zinc-500">
                                    Showing {((page - 1) * limit) + 1} - {Math.min(page * limit, total)} of {total}
                                </p>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setPage(p => Math.max(1, p - 1))}
                                        disabled={page === 1}
                                        className="px-3 py-1 text-sm bg-zinc-800 text-zinc-300 rounded hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Previous
                                    </button>
                                    <span className="px-3 py-1 text-sm text-zinc-400">
                                        Page {page} of {totalPages}
                                    </span>
                                    <button
                                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                        disabled={page === totalPages}
                                        className="px-3 py-1 text-sm bg-zinc-800 text-zinc-300 rounded hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </AdminLayout >
        </AdminGuard >
    );
}
