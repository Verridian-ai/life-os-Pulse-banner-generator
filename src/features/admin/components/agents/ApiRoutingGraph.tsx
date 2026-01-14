/**
 * API Routing Graph
 *
 * Visual display of API integrations and their health status
 */

import React from 'react';
import type { ApiHealthStatus } from '../../types';

type ApiRoutingGraphProps = {
  apiHealth: ApiHealthStatus[];
  agentConnections: Array<{
    agentId: string;
    agentName: string;
    apis: Array<'openrouter' | 'replicate' | 'openai' | 'cognee' | 'langfuse'>;
  }>;
};

const API_ICONS: Record<string, string> = {
  openrouter: 'hub',
  replicate: 'image',
  openai: 'psychology',
  cognee: 'memory',
  langfuse: 'analytics',
};

const API_COLORS: Record<string, string> = {
  openrouter: 'purple',
  replicate: 'blue',
  openai: 'green',
  cognee: 'cyan',
  langfuse: 'amber',
};

export function ApiRoutingGraph({
  apiHealth,
  agentConnections,
}: ApiRoutingGraphProps): React.ReactElement {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'emerald';
      case 'degraded':
        return 'amber';
      case 'down':
        return 'red';
      default:
        return 'zinc';
    }
  };

  const getConnectedAgentCount = (provider: string) => {
    return agentConnections.filter((c) =>
      c.apis.includes(provider as 'openrouter' | 'replicate' | 'openai' | 'cognee' | 'langfuse'),
    ).length;
  };

  return (
    <div className='bg-zinc-900/30 border border-white/5 rounded-2xl p-4'>
      <div className='flex items-center justify-between mb-4'>
        <h2 className='text-sm font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-2'>
          <span className='material-icons text-blue-500 text-lg'>account_tree</span>
          API Integrations
        </h2>
      </div>
      <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3'>
        {apiHealth.map((api) => {
          const color = API_COLORS[api.provider] || 'zinc';
          const statusColor = getStatusColor(api.status);
          const connectedAgents = getConnectedAgentCount(api.provider);

          return (
            <div
              key={api.provider}
              className={`bg-${color}-500/5 border border-${color}-500/20 rounded-xl p-4 hover:border-${color}-500/40 transition`}
            >
              <div className='flex items-center justify-between mb-3'>
                <div className='flex items-center gap-2'>
                  <span className={`material-icons text-${color}-400`}>
                    {API_ICONS[api.provider] || 'api'}
                  </span>
                  <span className='text-sm font-medium text-white capitalize'>{api.provider}</span>
                </div>
                <div className={`w-2 h-2 rounded-full bg-${statusColor}-500 animate-pulse`} />
              </div>
              <div className='space-y-2 text-xs'>
                <div className='flex justify-between text-zinc-400'>
                  <span>Latency</span>
                  <span className='text-white'>{api.latencyMs}ms</span>
                </div>
                <div className='flex justify-between text-zinc-400'>
                  <span>Uptime</span>
                  <span className='text-white'>{(api.uptime24h * 100).toFixed(1)}%</span>
                </div>
                <div className='flex justify-between text-zinc-400'>
                  <span>Agents</span>
                  <span className='text-white'>{connectedAgents}</span>
                </div>
              </div>
              <div className='mt-3 flex flex-wrap gap-1'>
                {api.features?.slice(0, 3).map((feature) => (
                  <span
                    key={feature}
                    className={`text-[9px] bg-${color}-500/20 text-${color}-300 px-1.5 py-0.5 rounded`}
                  >
                    {feature}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
