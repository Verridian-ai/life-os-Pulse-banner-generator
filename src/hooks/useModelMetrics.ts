import { useState, useEffect, useCallback, useMemo } from 'react';
import { PerformanceMetric } from '../types/ai';
import { modelMetricsStorage } from '../services/storageManager';

const METRICS_KEY = 'performance_log';

export interface ModelPerformanceStats {
  totalCalls: number;
  totalCost: number;
  avgResponseTime: number;
  successRate: number;
  byModel: Record<
    string,
    {
      calls: number;
      avgTime: number;
      totalCost: number;
      successRate: number;
      errors: number;
    }
  >;
  recentMetrics: PerformanceMetric[];
}

/**
 * Hook to aggregate and surface AI model performance trends from storage
 */
export const useModelMetrics = () => {
  // Load initial metrics with legacy migration support
  const [metrics, setMetrics] = useState<PerformanceMetric[]>(() => {
    // Check for legacy metrics first
    try {
      const legacy = localStorage.getItem('performance_metrics');
      if (legacy) {
        const parsed = JSON.parse(legacy);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Migrate to new storage
          console.log('[useModelMetrics] Migrating legacy metrics');
          modelMetricsStorage.set(METRICS_KEY, parsed);
          localStorage.removeItem('performance_metrics');
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Failed to migrate legacy metrics:', e);
    }

    return modelMetricsStorage.get<PerformanceMetric[]>(METRICS_KEY) || [];
  });

  const loadMetrics = useCallback(() => {
    const stored = modelMetricsStorage.get<PerformanceMetric[]>(METRICS_KEY);
    if (stored) {
      setMetrics(stored);
    }
  }, []);

  useEffect(() => {
    // Listen for new metrics being tracked
    const handleTracked = () => loadMetrics();
    window.addEventListener('model-metric-tracked', handleTracked);

    return () => window.removeEventListener('model-metric-tracked', handleTracked);
  }, [loadMetrics]);

  // Aggregate stats
  const stats = useMemo<ModelPerformanceStats | null>(() => {
    if (metrics.length === 0) return null;

    const byModel: ModelPerformanceStats['byModel'] = {};
    let totalCost = 0;
    let totalTime = 0;
    let successfulCalls = 0;

    metrics.forEach((m) => {
      // Initialize model stats if needed
      if (!byModel[m.modelId]) {
        byModel[m.modelId] = {
          calls: 0,
          avgTime: 0,
          totalCost: 0,
          successRate: 0,
          errors: 0,
        };
      }

      const modelStats = byModel[m.modelId];

      // Update totals
      totalCost += m.cost;
      totalTime += m.responseTime;
      if (m.success) successfulCalls++;

      // Update model stats
      modelStats.calls++;
      modelStats.totalCost += m.cost;
      if (m.success) {
        // Running average for response time
        // avg_new = (avg_old * (n-1) + new_val) / n
        // OR simply sum and divide later. Summing is safer for now.
        // We'll store sum temporarily in avgTime and divide at end
        modelStats.avgTime += m.responseTime;
      } else {
        modelStats.errors++;
      }
    });

    // Finalize averages
    Object.keys(byModel).forEach((modelId) => {
      const m = byModel[modelId];

      // Avg time is only relevant for successful calls usually, or all calls?
      // Typically response time includes failures, but timeouts might skew it.
      // Let's use all calls for now, but `modelStats.avgTime` accumulated sum above.
      m.avgTime = m.calls > 0 ? m.avgTime / m.calls : 0;
      m.successRate = m.calls > 0 ? ((m.calls - m.errors) / m.calls) * 100 : 0;
    });

    return {
      totalCalls: metrics.length,
      totalCost,
      avgResponseTime: metrics.length > 0 ? totalTime / metrics.length : 0,
      successRate: metrics.length > 0 ? (successfulCalls / metrics.length) * 100 : 0,
      byModel,
      recentMetrics: metrics.slice(-10).reverse(),
    };
  }, [metrics]);

  const clearMetrics = () => {
    modelMetricsStorage.remove(METRICS_KEY);
    setMetrics([]);
  };

  return {
    metrics,
    stats,
    clearMetrics,
    refresh: loadMetrics,
  };
};
