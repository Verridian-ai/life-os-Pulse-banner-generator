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

type ApiStyle = {
  icon: string;
  bgClass: string;
  borderClass: string;
  iconClass: string;
  badgeClass: string;
};

const API_STYLES: Record<string, ApiStyle> = {
  openrouter: {
    icon: 'hub',
    bgClass: 'bg-purple-500/5',
    borderClass: 'border-purple-500/20 hover:border-purple-500/40',
    iconClass: 'text-purple-400',
    badgeClass: 'bg-purple-500/20 text-purple-300',
  },
  replicate: {
    icon: 'image',
    bgClass: 'bg-blue-500/5',
    borderClass: 'border-blue-500/20 hover:border-blue-500/40',
    iconClass: 'text-blue-400',
    badgeClass: 'bg-blue-500/20 text-blue-300',
  },
  openai: {
    icon: 'psychology',
    bgClass: 'bg-green-500/5',
    borderClass: 'border-green-500/20 hover:border-green-500/40',
    iconClass: 'text-green-400',
    badgeClass: 'bg-green-500/20 text-green-300',
  },
  cognee: {
    icon: 'memory',
    bgClass: 'bg-cyan-500/5',
    borderClass: 'border-cyan-500/20 hover:border-cyan-500/40',
    iconClass: 'text-cyan-400',
    badgeClass: 'bg-cyan-500/20 text-cyan-300',
  },
  langfuse: {
    icon: 'analytics',
    bgClass: 'bg-amber-500/5',
    borderClass: 'border-amber-500/20 hover:border-amber-500/40',
    iconClass: 'text-amber-400',
    badgeClass: 'bg-amber-500/20 text-amber-300',
  },
};

const DEFAULT_STYLE: ApiStyle = {
  icon: 'api',
  bgClass: 'bg-zinc-500/5',
  borderClass: 'border-zinc-500/20 hover:border-zinc-500/40',
  iconClass: 'text-zinc-400',
  badgeClass: 'bg-zinc-500/20 text-zinc-300',
};

const getStatusDotClass = (status: string) => {
  switch (status) {
    case 'healthy':
      return 'bg-emerald-500';
    case 'degraded':
      return 'bg-amber-500';
    case 'down':
      return 'bg-red-500';
    default:
      return 'bg-zinc-500';
  }
};

export function ApiRoutingGraph({
  apiHealth,
  agentConnections,
}: ApiRoutingGraphProps): React.ReactElement {
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
          const style = API_STYLES[api.provider] || DEFAULT_STYLE;
          const connectedAgents = getConnectedAgentCount(api.provider);

          return (
            <div
              key={api.provider}
              className={`${style.bgClass} border ${style.borderClass} rounded-xl p-4 transition`}
            >
              <div className='flex items-center justify-between mb-3'>
                <div className='flex items-center gap-2'>
                  <span className={`material-icons ${style.iconClass}`}>{style.icon}</span>
                  <span className='text-sm font-medium text-white capitalize'>{api.provider}</span>
                </div>
                <div
                  className={`w-2 h-2 rounded-full ${getStatusDotClass(api.status)} animate-pulse`}
                />
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
                    className={`text-[9px] ${style.badgeClass} px-1.5 py-0.5 rounded`}
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
