/**
 * System Health Component
 *
 * Displays real-time health status for all integrated services.
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  getSystemHealth,
  type SystemHealthResponse,
  type ServiceHealth,
} from '../services/adminApi';

interface SystemHealthProps {
  autoRefresh?: boolean;
  refreshInterval?: number;
}

const SERVICE_NAMES: Record<string, { name: string; icon: string }> = {
  database: { name: 'PostgreSQL', icon: 'storage' },
  cognee: { name: 'Cognee RAG', icon: 'psychology' },
  langfuse: { name: 'Langfuse', icon: 'analytics' },
  stripe: { name: 'Stripe', icon: 'credit_card' },
  workos: { name: 'WorkOS', icon: 'security' },
};

function StatusBadge({ status }: { status: ServiceHealth['status'] }): React.ReactElement {
  const config = {
    healthy: { bg: 'bg-green-500/20', text: 'text-green-400', label: 'Healthy' },
    degraded: { bg: 'bg-amber-500/20', text: 'text-amber-400', label: 'Degraded' },
    down: { bg: 'bg-red-500/20', text: 'text-red-400', label: 'Down' },
  };

  const { bg, text, label } = config[status];

  return <span className={`px-2 py-0.5 rounded text-xs font-medium ${bg} ${text}`}>{label}</span>;
}

function StatusDot({ status }: { status: ServiceHealth['status'] }): React.ReactElement {
  const colors = {
    healthy: 'bg-green-500',
    degraded: 'bg-amber-500',
    down: 'bg-red-500',
  };

  return (
    <span
      className={`inline-block w-2 h-2 rounded-full ${colors[status]} ${status === 'healthy' ? '' : 'animate-pulse'}`}
    />
  );
}

export function SystemHealth({
  autoRefresh = true,
  refreshInterval = 30000,
}: SystemHealthProps): React.ReactElement {
  const [health, setHealth] = useState<SystemHealthResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  const loadHealth = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await getSystemHealth();
      setHealth(data);
      setLastRefresh(new Date());
      setError(null);
    } catch (err) {
      setError('Failed to fetch system health');
      console.error('[SystemHealth] Error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadHealth();

    if (autoRefresh && refreshInterval > 0) {
      const interval = setInterval(loadHealth, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [loadHealth, autoRefresh, refreshInterval]);

  const overallStatusColor =
    health?.overall === 'healthy'
      ? 'text-green-400'
      : health?.overall === 'degraded'
        ? 'text-amber-400'
        : 'text-red-400';

  return (
    <div className='bg-zinc-900/50 border border-white/5 rounded-2xl overflow-hidden'>
      {/* Header */}
      <div className='p-4 border-b border-white/5 flex items-center justify-between'>
        <div className='flex items-center gap-3'>
          <span className='material-icons text-purple-500'>monitor_heart</span>
          <h3 className='text-lg font-bold text-white'>System Health</h3>
          {health && (
            <span className={`flex items-center gap-1.5 ${overallStatusColor}`}>
              <StatusDot status={health.overall} />
              <span className='text-sm font-medium capitalize'>{health.overall}</span>
            </span>
          )}
        </div>
        <div className='flex items-center gap-2'>
          {lastRefresh && (
            <span className='text-xs text-zinc-500'>
              Updated {lastRefresh.toLocaleTimeString()}
            </span>
          )}
          <button
            onClick={loadHealth}
            disabled={isLoading}
            className='p-1.5 text-zinc-400 hover:text-white rounded hover:bg-white/5 transition disabled:opacity-50'
            title='Refresh'
          >
            <span className={`material-icons text-sm ${isLoading ? 'animate-spin' : ''}`}>
              refresh
            </span>
          </button>
        </div>
      </div>

      {/* Service List */}
      <div className='p-4'>
        {error && (
          <div className='p-3 bg-red-500/10 border border-red-500/20 rounded-lg mb-4'>
            <p className='text-red-400 text-sm'>{error}</p>
          </div>
        )}

        {isLoading && !health ? (
          <div className='space-y-3'>
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className='flex items-center justify-between p-3 bg-zinc-800/30 rounded-lg animate-pulse'
              >
                <div className='flex items-center gap-3'>
                  <div className='w-8 h-8 bg-zinc-700 rounded'></div>
                  <div className='w-24 h-4 bg-zinc-700 rounded'></div>
                </div>
                <div className='w-16 h-5 bg-zinc-700 rounded'></div>
              </div>
            ))}
          </div>
        ) : health ? (
          <div className='space-y-2'>
            {Object.entries(health.services).map(([key, service]) => {
              const meta = SERVICE_NAMES[key] || { name: key, icon: 'help' };
              return (
                <div
                  key={key}
                  className='flex items-center justify-between p-3 bg-zinc-800/30 rounded-lg hover:bg-zinc-800/50 transition'
                >
                  <div className='flex items-center gap-3'>
                    <div
                      className={`w-8 h-8 rounded flex items-center justify-center ${
                        service.status === 'healthy'
                          ? 'bg-green-500/10'
                          : service.status === 'degraded'
                            ? 'bg-amber-500/10'
                            : 'bg-red-500/10'
                      }`}
                    >
                      <span
                        className={`material-icons text-lg ${
                          service.status === 'healthy'
                            ? 'text-green-400'
                            : service.status === 'degraded'
                              ? 'text-amber-400'
                              : 'text-red-400'
                        }`}
                      >
                        {meta.icon}
                      </span>
                    </div>
                    <div>
                      <p className='text-white text-sm font-medium'>{meta.name}</p>
                      {service.message && (
                        <p className='text-zinc-500 text-xs'>{service.message}</p>
                      )}
                    </div>
                  </div>
                  <div className='flex items-center gap-3'>
                    {service.latencyMs !== undefined && (
                      <span className='text-xs text-zinc-500'>{service.latencyMs}ms</span>
                    )}
                    <StatusBadge status={service.status} />
                  </div>
                </div>
              );
            })}
          </div>
        ) : null}
      </div>
    </div>
  );
}
