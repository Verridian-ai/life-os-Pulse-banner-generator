import React, { useState, useEffect } from 'react';
import { AdminLayout } from '../components/AdminLayout';
import { AdminGuard } from '../components/AdminGuard';
import { listTraces, getMetrics } from '../services/adminApi';
import type { LlmTrace, ApiMetric } from '../types';

export function AdminObservability(): React.ReactElement {
    const [traces, setTraces] = useState<LlmTrace[]>([]);
    const [metrics, setMetrics] = useState<ApiMetric[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const [tracesData, metricsData] = await Promise.all([
                    listTraces({ limit: 50 }),
                    getMetrics(),
                ]) as any;
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
                </div>
            </AdminLayout>
        </AdminGuard>
    );
}
