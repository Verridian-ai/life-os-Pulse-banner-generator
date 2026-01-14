/**
 * Agent Metrics Dashboard
 * 
 * Real-time metrics display for Pydantic AI agents
 */

import React from 'react';
import type { AgentDashboardSummary } from '../../types';

type AgentMetricsDashboardProps = {
    summary: AgentDashboardSummary;
    isLoading?: boolean;
};

export function AgentMetricsDashboard({ summary, isLoading }: AgentMetricsDashboardProps): React.ReactElement {
    if (isLoading) {
        return (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {[...Array(6)].map((_, i) => (
                    <div key={i} className="bg-zinc-900/50 border border-white/5 rounded-xl p-4 animate-pulse">
                        <div className="h-3 bg-zinc-800 rounded w-1/2 mb-2" />
                        <div className="h-6 bg-zinc-800 rounded w-3/4" />
                    </div>
                ))}
            </div>
        );
    }

    const metrics = [
        { label: 'Active Agents', value: `${summary.activeAgents}/${summary.totalAgents}`, icon: 'smart_toy', color: 'purple' },
        { label: 'API Calls (24h)', value: summary.totalCalls24h.toLocaleString(), icon: 'api', color: 'blue' },
        { label: 'Tokens Used', value: `${(summary.totalTokens24h / 1000).toFixed(1)}k`, icon: 'token', color: 'cyan' },
        { label: 'Cost (24h)', value: `$${summary.totalCost24h.toFixed(2)}`, icon: 'attach_money', color: 'green' },
        { label: 'Avg Latency', value: `${summary.avgLatencyMs}ms`, icon: 'speed', color: 'amber' },
        { label: 'API Health', value: `${summary.apiHealth.filter(a => a.status === 'healthy').length}/${summary.apiHealth.length}`, icon: 'health_and_safety', color: 'emerald' },
    ];

    return (
        <div className="bg-zinc-900/30 border border-white/5 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
                    <span className="material-icons text-purple-500 text-lg">insights</span>
                    Pydantic AI Metrics
                </h2>
                <span className="text-xs text-zinc-500">Auto-refresh: 30s</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                {metrics.map((metric) => (
                    <div
                        key={metric.label}
                        className={`bg-${metric.color}-500/5 border border-${metric.color}-500/20 rounded-xl p-3 hover:border-${metric.color}-500/40 transition`}
                    >
                        <div className="flex items-center gap-2 mb-1">
                            <span className={`material-icons text-${metric.color}-400 text-sm`}>{metric.icon}</span>
                            <span className="text-xs text-zinc-500">{metric.label}</span>
                        </div>
                        <p className={`text-lg font-bold text-${metric.color}-300`}>{metric.value}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}

