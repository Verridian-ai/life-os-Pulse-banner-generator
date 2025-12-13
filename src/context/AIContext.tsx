// AI Context - Global state management for AI features

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type {
  AIContextType,
  PerformanceMetric,
  ToolChain,
  BrandProfile,
  ImageEditTurn,
  ReplicateOperation,
  ModelMetadata,
} from '../types/ai';
import { loadBrandProfile, saveBrandProfile } from '../services/brandEngine';
import { getModelMetadata } from '../services/modelRouter';

const AIContext = createContext<AIContextType | undefined>(undefined);

// eslint-disable-next-line react-refresh/only-export-components
export const useAI = () => {
  const context = useContext(AIContext);
  if (!context) {
    throw new Error('useAI must be used within AIProvider');
  }
  return context;
};

interface AIProviderProps {
  children: ReactNode;
}

export const AIProvider: React.FC<AIProviderProps> = ({ children }) => {
  // Model Selection
  const [selectedProvider, setSelectedProvider] = useState<'gemini' | 'openrouter' | 'replicate'>(
    () => (localStorage.getItem('llm_provider') as 'gemini' | 'openrouter' | 'replicate') || 'gemini'
  );
  const [selectedModel, setSelectedModel] = useState<string>(
    () => localStorage.getItem('llm_model') || ''
  );
  const [availableModels, setAvailableModels] = useState<ModelMetadata[]>([]);
  const [modelOverride, setModelOverride] = useState<string | null>(null);

  // Performance Tracking
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetric[]>(() => {
    try {
      const stored = localStorage.getItem('performance_metrics');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Tool Chaining
  const [activeChain, setActiveChain] = useState<ToolChain | null>(null);
  const [chainProgress, setChainProgress] = useState(0);

  // Brand Consistency
  const [brandProfile, setBrandProfile] = useState<BrandProfile | null>(() =>
    loadBrandProfile()
  );

  // Multi-turn Image Editing
  const [editHistory, setEditHistory] = useState<ImageEditTurn[]>(() => {
    try {
      const stored = localStorage.getItem('gemini_edit_history');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Replicate Operations
  const [replicateOperation, setReplicateOperation] = useState<ReplicateOperation | null>(null);

  // Load available models on mount
  useEffect(() => {
    const models = Object.values(getModelMetadata());
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setAvailableModels(models);
  }, []);

  // Persist performance metrics
  useEffect(() => {
    try {
      localStorage.setItem('performance_metrics', JSON.stringify(performanceMetrics));
    } catch (error) {
      console.error('Failed to persist performance metrics:', error);
    }
  }, [performanceMetrics]);

  // Persist edit history
  useEffect(() => {
    try {
      localStorage.setItem('gemini_edit_history', JSON.stringify(editHistory));
    } catch (error) {
      console.error('Failed to persist edit history:', error);
    }
  }, [editHistory]);

  // Update chain progress based on active chain
  useEffect(() => {
    if (!activeChain) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setChainProgress(0);
      return;
    }

    const completedSteps = activeChain.steps.filter(s => s.status === 'completed').length;
    const progress = (completedSteps / activeChain.steps.length) * 100;
    setChainProgress(progress);
  }, [activeChain]);

  // Add performance metric
  const addMetric = (metric: PerformanceMetric) => {
    setPerformanceMetrics(prev => {
      const updated = [...prev, metric];
      // Keep only last 1000 metrics to avoid storage bloat
      return updated.slice(-1000);
    });
  };

  // Get total cost
  const getTotalCost = () => {
    return performanceMetrics.reduce((sum, m) => sum + m.cost, 0);
  };

  // Get average response time
  const getAvgResponseTime = () => {
    if (performanceMetrics.length === 0) return 0;
    const total = performanceMetrics.reduce((sum, m) => sum + m.responseTime, 0);
    return total / performanceMetrics.length;
  };

  // Update brand profile
  const updateBrandProfile = (updates: Partial<BrandProfile>) => {
    const updated = brandProfile
      ? { ...brandProfile, ...updates, lastUpdated: Date.now() }
      : ({
        ...updates,
        colors: updates.colors || [],
        fonts: updates.fonts || [],
        styleKeywords: updates.styleKeywords || [],
        lastUpdated: Date.now(),
        version: 1,
      } as BrandProfile);

    setBrandProfile(updated);
    saveBrandProfile(updated);
  };

  // Add edit turn
  const addEditTurn = (turn: ImageEditTurn) => {
    setEditHistory(prev => [...prev, turn]);
  };

  // Clear edit history
  const clearEditHistory = () => {
    setEditHistory([]);
    localStorage.removeItem('gemini_edit_history');
  };

  const value: AIContextType = {
    selectedProvider,
    setSelectedProvider,
    selectedModel,
    setSelectedModel,
    availableModels,
    modelOverride,
    setModelOverride,
    performanceMetrics,
    addMetric,
    getTotalCost,
    getAvgResponseTime,
    activeChain,
    setActiveChain,
    chainProgress,
    brandProfile,
    updateBrandProfile,
    editHistory,
    addEditTurn,
    clearEditHistory,
    replicateOperation,
    setReplicateOperation,
  };

  return <AIContext.Provider value={value}>{children}</AIContext.Provider>;
};
