// Performance Metrics Panel - Track cost, speed, and performance across all AI operations

import React, { useState, useMemo } from 'react';
import { useAI } from '../../context/AIContext';

interface PerformanceMetricsPanelProps {
  onClearMetrics?: () => void;
}

export const PerformanceMetricsPanel: React.FC<PerformanceMetricsPanelProps> = ({
  onClearMetrics,
}) => {
  const { performanceMetrics } = useAI();
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d' | 'all'>('all');
  const [showDetails, setShowDetails] = useState(false);

  // Filter metrics by time range
  const filteredMetrics = useMemo(() => {
    if (timeRange === 'all') return performanceMetrics;

    const now = new Date().getTime();
    const ranges = {
      '24h': 24 * 60 * 60 * 1000,
      '7d': 7 * 24 * 60 * 60 * 1000,
      '30d': 30 * 24 * 60 * 60 * 1000,
    };

    const cutoff = now - ranges[timeRange];
    return performanceMetrics.filter((m) => m.timestamp >= cutoff);
  }, [performanceMetrics, timeRange]);

  // Calculate statistics
  const stats = useMemo(() => {
    if (filteredMetrics.length === 0) {
      return {
        totalCost: 0,
        avgResponseTime: 0,
        successRate: 0,
        totalOperations: 0,
        costByModel: {},
        operationsByType: {},
      };
    }

    const totalCost = filteredMetrics.reduce((sum, m) => sum + m.cost, 0);
    const avgResponseTime =
      filteredMetrics.reduce((sum, m) => sum + m.responseTime, 0) / filteredMetrics.length;
    const successCount = filteredMetrics.filter((m) => m.success).length;
    const successRate = (successCount / filteredMetrics.length) * 100;

    // Cost by model
    const costByModel: Record<string, number> = {};
    filteredMetrics.forEach((m) => {
      costByModel[m.modelId] = (costByModel[m.modelId] || 0) + m.cost;
    });

    // Operations by type
    const operationsByType: Record<string, number> = {};
    filteredMetrics.forEach((m) => {
      operationsByType[m.operation] = (operationsByType[m.operation] || 0) + 1;
    });

    return {
      totalCost,
      avgResponseTime,
      successRate,
      totalOperations: filteredMetrics.length,
      costByModel,
      operationsByType,
    };
  }, [filteredMetrics]);

  const handleClearMetrics = () => {
    if (confirm('Are you sure you want to clear all performance metrics? This cannot be undone.')) {
      localStorage.removeItem('performance_metrics');
      onClearMetrics?.();
      window.location.reload();
    }
  };

  const formatCost = (cost: number) => {
    return `$${cost.toFixed(4)}`;
  };

  const formatTime = (ms: number) => {
    if (ms < 1000) return `${Math.round(ms)}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  return (
    <div className="bg-black/40 p-5 rounded-3xl border border-white/5">
      <h4 className="text-xs font-bold text-zinc-400 uppercase mb-4 flex items-center gap-2">
        <span className="material-icons text-sm">analytics</span>
        Performance Metrics
      </h4>

      {/* Time Range Selector */}
      <div className="bg-zinc-900/50 rounded-xl p-3 mb-4">
        <label className="text-[10px] text-zinc-500 mb-2 block font-bold">TIME RANGE</label>
        <div className="grid grid-cols-4 gap-2">
          {(['24h', '7d', '30d', 'all'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`py-2 px-3 rounded-lg text-xs font-bold transition ${timeRange === range
                ? 'bg-blue-600 text-white'
                : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                }`}
            >
              {range === 'all' ? 'All Time' : range.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        {/* Total Cost */}
        <div className="bg-gradient-to-br from-green-900/30 to-green-800/20 border border-green-500/30 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="material-icons text-sm text-green-400">attach_money</span>
            <p className="text-[10px] text-green-300 font-bold">TOTAL COST</p>
          </div>
          <p className="text-2xl font-black text-green-400">{formatCost(stats.totalCost)}</p>
        </div>

        {/* Total Operations */}
        <div className="bg-gradient-to-br from-blue-900/30 to-blue-800/20 border border-blue-500/30 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="material-icons text-sm text-blue-400">speed</span>
            <p className="text-[10px] text-blue-300 font-bold">OPERATIONS</p>
          </div>
          <p className="text-2xl font-black text-blue-400">{stats.totalOperations}</p>
        </div>

        {/* Avg Response Time */}
        <div className="bg-gradient-to-br from-purple-900/30 to-purple-800/20 border border-purple-500/30 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="material-icons text-sm text-purple-400">schedule</span>
            <p className="text-[10px] text-purple-300 font-bold">AVG TIME</p>
          </div>
          <p className="text-2xl font-black text-purple-400">
            {formatTime(stats.avgResponseTime)}
          </p>
        </div>

        {/* Success Rate */}
        <div className="bg-gradient-to-br from-orange-900/30 to-orange-800/20 border border-orange-500/30 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="material-icons text-sm text-orange-400">check_circle</span>
            <p className="text-[10px] text-orange-300 font-bold">SUCCESS RATE</p>
          </div>
          <p className="text-2xl font-black text-orange-400">{stats.successRate.toFixed(1)}%</p>
        </div>
      </div>

      {/* Cost by Model */}
      {Object.keys(stats.costByModel).length > 0 && (
        <div className="bg-zinc-900/50 rounded-xl p-4 mb-4">
          <label className="text-[10px] text-zinc-500 mb-3 block font-bold">COST BY MODEL</label>
          <div className="space-y-2">
            {Object.entries(stats.costByModel)
              .sort(([, a], [, b]) => b - a)
              .slice(0, 5)
              .map(([model, cost]) => {
                const percentage = stats.totalCost > 0 ? (cost / stats.totalCost) * 100 : 0;
                return (
                  <div key={model}>
                    <div className="flex justify-between items-center mb-1">
                      <p className="text-xs text-white font-bold truncate">{model}</p>
                      <p className="text-xs text-zinc-400 font-mono">{formatCost(cost)}</p>
                    </div>
                    <div className="w-full bg-zinc-800 rounded-full h-1.5 overflow-hidden">
                      <div
                        className={`h-full bg-gradient-to-r from-blue-500 to-purple-500 w-[${percentage || 0}%]`}
                      ></div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* Operations by Type */}
      {Object.keys(stats.operationsByType).length > 0 && (
        <div className="bg-zinc-900/50 rounded-xl p-4 mb-4">
          <label className="text-[10px] text-zinc-500 mb-3 block font-bold">
            OPERATIONS BY TYPE
          </label>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(stats.operationsByType)
              .sort(([, a], [, b]) => b - a)
              .map(([operation, count]) => (
                <div
                  key={operation}
                  className="bg-zinc-800 border border-white/10 rounded-lg p-3"
                >
                  <p className="text-[10px] text-zinc-400 mb-1 uppercase">{operation}</p>
                  <p className="text-lg font-black text-white">{count}</p>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Recent Operations Details */}
      {showDetails && filteredMetrics.length > 0 && (
        <div className="bg-zinc-900/50 rounded-xl p-4 mb-4">
          <label className="text-[10px] text-zinc-500 mb-3 block font-bold">
            RECENT OPERATIONS
          </label>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {filteredMetrics
              .slice(-10)
              .reverse()
              .map((metric, idx) => (
                <div
                  key={idx}
                  className="bg-zinc-800 border border-white/10 rounded-lg p-3 text-xs"
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-white font-bold">{metric.operation}</span>
                    <span
                      className={`text-[10px] font-bold ${metric.success ? 'text-green-400' : 'text-red-400'
                        }`}
                    >
                      {metric.success ? '✓ Success' : '✗ Failed'}
                    </span>
                  </div>
                  <p className="text-[10px] text-zinc-400 mb-2 truncate">{metric.modelId}</p>
                  <div className="flex justify-between text-[10px]">
                    <span className="text-zinc-500">
                      {formatTime(metric.responseTime)}
                    </span>
                    <span className="text-green-400 font-mono">{formatCost(metric.cost)}</span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Toggle Details Button */}
      {filteredMetrics.length > 0 && (
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="w-full bg-zinc-800 hover:bg-zinc-700 text-white font-bold py-2 px-4 rounded-lg transition text-xs mb-3 flex items-center justify-center gap-2"
        >
          <span className="material-icons text-sm">
            {showDetails ? 'expand_less' : 'expand_more'}
          </span>
          {showDetails ? 'Hide' : 'Show'} Recent Operations
        </button>
      )}

      {/* Clear Metrics Button */}
      {performanceMetrics.length > 0 && (
        <button
          onClick={handleClearMetrics}
          className="w-full bg-red-900/50 hover:bg-red-900/70 text-red-300 font-bold py-2 px-4 rounded-lg transition text-xs flex items-center justify-center gap-2"
        >
          <span className="material-icons text-sm">delete_forever</span>
          Clear All Metrics
        </button>
      )}

      {/* Empty State */}
      {filteredMetrics.length === 0 && (
        <div className="bg-zinc-900/50 rounded-xl p-6 text-center">
          <span className="material-icons text-4xl text-zinc-600 mb-2">analytics</span>
          <p className="text-sm text-zinc-400 mb-1">No Metrics Available</p>
          <p className="text-[10px] text-zinc-600">
            {timeRange === 'all'
              ? 'Start using AI features to track performance'
              : `No operations in the last ${timeRange}`}
          </p>
        </div>
      )}

      {/* Info Text */}
      <p className="text-[9px] text-zinc-600 text-center mt-4">
        Performance metrics help optimize costs and track AI usage patterns
      </p>
    </div>
  );
};
