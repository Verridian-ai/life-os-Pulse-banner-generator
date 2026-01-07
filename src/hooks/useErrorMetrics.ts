import { useState, useEffect, useCallback, useMemo } from 'react';
import { ErrorMetric } from '../utils/errorHandler';

/**
 * Hook to aggregate and surface error trends from localStorage
 */
export const useErrorMetrics = () => {
  // Load initial metrics lazily
  const [metrics, setMetrics] = useState<ErrorMetric[]>(() => {
    try {
      const stored = localStorage.getItem('error_metrics');
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      console.error('Failed to load error metrics:', e);
      return [];
    }
  });

  const loadMetrics = useCallback(() => {
    try {
      const stored = localStorage.getItem('error_metrics');
      if (stored) {
        setMetrics(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Failed to load error metrics:', e);
    }
  }, []);

  useEffect(() => {
    // Listen for new errors being tracked
    const handleTracked = () => loadMetrics();
    window.addEventListener('error-tracked', handleTracked);
    
    return () => window.removeEventListener('error-tracked', handleTracked);
  }, [loadMetrics]);

  // Aggregate stats
  const stats = useMemo(() => {
    if (metrics.length === 0) return null;

    const errorCountByType: Record<string, number> = {};
    const errorCountByContext: Record<string, number> = {};
    
    metrics.forEach(m => {
      errorCountByType[m.type] = (errorCountByType[m.type] || 0) + 1;
      if (m.context) {
        errorCountByContext[m.context] = (errorCountByContext[m.context] || 0) + 1;
      }
    });

    // Calculate rates (errors per hour/day if needed, but for now just counts)
    const totalErrors = metrics.length;
    
    // Sort types by frequency
    const topErrorTypes = Object.entries(errorCountByType)
      .sort(([, a], [, b]) => b - a)
      .map(([type, count]) => ({ type, count }));

    return {
      totalErrors,
      errorCountByType,
      errorCountByContext,
      topErrorTypes,
      recentErrors: metrics.slice(-5).reverse(),
    };
  }, [metrics]);

  const clearMetrics = () => {
    localStorage.removeItem('error_metrics');
    setMetrics([]);
  };

  return {
    metrics,
    stats,
    clearMetrics,
    refresh: loadMetrics,
  };
};
