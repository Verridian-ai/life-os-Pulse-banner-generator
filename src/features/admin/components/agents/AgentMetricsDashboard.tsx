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

export function AgentMetricsDashboard({
  summary,
  isLoading,
}: AgentMetricsDashboardProps): React.ReactElement {
  if (isLoading) {
    return (
      <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4'>
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className='bg-zinc-900/50 border border-white/5 rounded-xl p-4 animate-pulse'
          >
            <div className='h-3 bg-zinc-800 rounded w-1/2 mb-2' />
            <div className='h-6 bg-zinc-800 rounded w-3/4' />
          </div>
        ))}
      </div>
    );
  }

  const metrics = [
    {
      label: 'Active Agents',
      value: `${summary.activeAgents}/${summary.totalAgents}`,
      icon: 'smart_toy',
      bgClass: 'bg-purple-500/5',
      borderClass: 'border-purple-500/20 hover:border-purple-500/40',
      iconClass: 'text-purple-400',
      valueClass: 'text-purple-300',
    },
    {
      label: 'API Calls (24h)',
      value: summary.totalCalls24h.toLocaleString(),
      icon: 'api',
      bgClass: 'bg-blue-500/5',
      borderClass: 'border-blue-500/20 hover:border-blue-500/40',
      iconClass: 'text-blue-400',
      valueClass: 'text-blue-300',
    },
    {
      label: 'Tokens Used',
      value: `${(summary.totalTokens24h / 1000).toFixed(1)}k`,
      icon: 'token',
      bgClass: 'bg-cyan-500/5',
      borderClass: 'border-cyan-500/20 hover:border-cyan-500/40',
      iconClass: 'text-cyan-400',
      valueClass: 'text-cyan-300',
    },
    {
      label: 'Cost (24h)',
      value: `$${summary.totalCost24h.toFixed(2)}`,
      icon: 'attach_money',
      bgClass: 'bg-green-500/5',
      borderClass: 'border-green-500/20 hover:border-green-500/40',
      iconClass: 'text-green-400',
      valueClass: 'text-green-300',
    },
    {
      label: 'Avg Latency',
      value: `${summary.avgLatencyMs}ms`,
      icon: 'speed',
      bgClass: 'bg-amber-500/5',
      borderClass: 'border-amber-500/20 hover:border-amber-500/40',
      iconClass: 'text-amber-400',
      valueClass: 'text-amber-300',
    },
    {
      label: 'API Health',
      value: `${summary.apiHealth.filter((a) => a.status === 'healthy').length}/${summary.apiHealth.length}`,
      icon: 'health_and_safety',
      bgClass: 'bg-emerald-500/5',
      borderClass: 'border-emerald-500/20 hover:border-emerald-500/40',
      iconClass: 'text-emerald-400',
      valueClass: 'text-emerald-300',
    },
  ];

  return (
    <div className='bg-zinc-900/30 border border-white/5 rounded-2xl p-4'>
      <div className='flex items-center justify-between mb-4'>
        <h2 className='text-sm font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-2'>
          <span className='material-icons text-purple-500 text-lg'>insights</span>
          Pydantic AI Metrics
        </h2>
        <span className='text-xs text-zinc-500'>Auto-refresh: 30s</span>
      </div>
      <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3'>
        {metrics.map((metric) => (
          <div
            key={metric.label}
            className={`${metric.bgClass} border ${metric.borderClass} rounded-xl p-3 transition`}
          >
            <div className='flex items-center gap-2 mb-1'>
              <span className={`material-icons ${metric.iconClass} text-sm`}>{metric.icon}</span>
              <span className='text-xs text-zinc-500'>{metric.label}</span>
            </div>
            <p className={`text-lg font-bold ${metric.valueClass}`}>{metric.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
