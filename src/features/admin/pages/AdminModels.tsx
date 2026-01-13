import React, { useState, useEffect, useMemo } from 'react';
import { AdminLayout } from '../components/AdminLayout';
import { AdminGuard } from '../components/AdminGuard';
import { getModelPerformance } from '../services/adminApi';
import type { ModelPerformanceStats, ModelPerformanceResponse } from '../types';

type ComparisonCriteria = 'speed' | 'quality' | 'cost' | 'balanced';
type TimeRange = 7 | 14 | 30;

// Provider colors for visual distinction
const PROVIDER_COLORS: Record<string, { bg: string; text: string; border: string }> = {
    gemini: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/30' },
    openrouter: { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/30' },
    replicate: { bg: 'bg-orange-500/10', text: 'text-orange-400', border: 'border-orange-500/30' },
};

// Capability badge colors
const CAPABILITY_COLORS: Record<string, string> = {
    text: 'bg-emerald-500/20 text-emerald-400',
    vision: 'bg-cyan-500/20 text-cyan-400',
    thinking: 'bg-yellow-500/20 text-yellow-400',
    image_gen: 'bg-pink-500/20 text-pink-400',
    image_edit: 'bg-rose-500/20 text-rose-400',
    image_upscale: 'bg-violet-500/20 text-violet-400',
    background_removal: 'bg-indigo-500/20 text-indigo-400',
    image_restoration: 'bg-amber-500/20 text-amber-400',
    face_enhancement: 'bg-lime-500/20 text-lime-400',
};

function StatCard({ label, value, subValue, icon, color = 'text-white' }: {
    label: string;
    value: string | number;
    subValue?: string;
    icon: string;
    color?: string;
}): React.ReactElement {
    return (
        <div className="bg-zinc-900 border border-white/10 rounded-xl p-6">
            <div className="flex items-start justify-between">
                <div>
                    <h3 className="text-zinc-500 text-sm font-medium mb-2">{label}</h3>
                    <p className={`text-3xl font-bold ${color}`}>{value}</p>
                    {subValue && <p className="text-zinc-500 text-sm mt-1">{subValue}</p>}
                </div>
                <div className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center">
                    <span className="material-icons text-zinc-400">{icon}</span>
                </div>
            </div>
        </div>
    );
}

function ModelCard({ model, ranking }: { model: ModelPerformanceStats; ranking?: number }): React.ReactElement {
    const providerStyle = PROVIDER_COLORS[model.provider] || PROVIDER_COLORS.openrouter;

    return (
        <div className={`bg-zinc-900 border ${providerStyle.border} rounded-xl p-5 hover:bg-zinc-800/50 transition`}>
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                    {ranking && (
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                            ranking === 1 ? 'bg-yellow-500/20 text-yellow-400' :
                            ranking === 2 ? 'bg-zinc-400/20 text-zinc-300' :
                            ranking === 3 ? 'bg-amber-600/20 text-amber-500' :
                            'bg-zinc-700/50 text-zinc-400'
                        }`}>
                            #{ranking}
                        </div>
                    )}
                    <div>
                        <h3 className="text-white font-semibold">{model.modelName}</h3>
                        <p className="text-zinc-500 text-xs font-mono truncate max-w-[200px]">{model.modelId}</p>
                    </div>
                </div>
                <span className={`px-2 py-1 rounded text-xs font-medium ${providerStyle.bg} ${providerStyle.text}`}>
                    {model.provider}
                </span>
            </div>

            {/* Capabilities */}
            <div className="flex flex-wrap gap-1.5 mb-4">
                {model.capabilities.map((cap: string) => (
                    <span
                        key={cap}
                        className={`px-2 py-0.5 rounded text-xs font-medium ${CAPABILITY_COLORS[cap] || 'bg-zinc-700 text-zinc-300'}`}
                    >
                        {cap.replace(/_/g, ' ')}
                    </span>
                ))}
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-3">
                <div className="bg-black/30 rounded-lg p-3">
                    <p className="text-zinc-500 text-xs mb-1">Total Calls</p>
                    <p className="text-white font-semibold">{model.totalCalls.toLocaleString()}</p>
                </div>
                <div className="bg-black/30 rounded-lg p-3">
                    <p className="text-zinc-500 text-xs mb-1">Success Rate</p>
                    <p className={`font-semibold ${model.successRate >= 95 ? 'text-green-400' : model.successRate >= 80 ? 'text-yellow-400' : 'text-red-400'}`}>
                        {model.successRate.toFixed(1)}%
                    </p>
                </div>
                <div className="bg-black/30 rounded-lg p-3">
                    <p className="text-zinc-500 text-xs mb-1">Avg Latency</p>
                    <p className="text-blue-400 font-semibold">{Math.round(model.avgLatencyMs)}ms</p>
                </div>
                <div className="bg-black/30 rounded-lg p-3">
                    <p className="text-zinc-500 text-xs mb-1">Total Tokens</p>
                    <p className="text-white font-semibold">{(model.totalTokens / 1000).toFixed(1)}K</p>
                </div>
            </div>

            {/* Cost Footer */}
            <div className="mt-4 pt-4 border-t border-white/5 flex justify-between items-center">
                <div>
                    <p className="text-zinc-500 text-xs">Total Cost</p>
                    <p className="text-green-400 font-semibold">${model.totalCostUsd.toFixed(4)}</p>
                </div>
                <div className="text-right">
                    <p className="text-zinc-500 text-xs">Avg/Call</p>
                    <p className="text-zinc-300 font-medium">${model.avgCostPerCall.toFixed(6)}</p>
                </div>
            </div>

            {/* Last Used */}
            {model.lastUsedAt && (
                <p className="text-zinc-600 text-xs mt-3">
                    Last used: {new Date(model.lastUsedAt).toLocaleString(undefined, {
                        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                    })}
                </p>
            )}
        </div>
    );
}

function ComparisonTable({ models, criteria }: { models: ModelPerformanceStats[]; criteria: ComparisonCriteria }): React.ReactElement {
    // Calculate scores based on criteria
    const rankedModels = useMemo(() => {
        return models
            .map((model) => {
                // Normalize metrics (0-1 scale, higher is better)
                const normalizedSpeed = Math.max(0, 1 - model.avgLatencyMs / 15000);
                const normalizedSuccess = model.successRate / 100;
                const normalizedCost = Math.max(0, 1 - model.avgCostPerCall * 100);
                const normalizedVolume = Math.min(1, model.totalCalls / 1000);

                let score = 0;
                switch (criteria) {
                    case 'speed':
                        score = normalizedSpeed * 0.6 + normalizedSuccess * 0.3 + normalizedCost * 0.1;
                        break;
                    case 'quality':
                        score = normalizedSuccess * 0.7 + normalizedVolume * 0.2 + normalizedSpeed * 0.1;
                        break;
                    case 'cost':
                        score = normalizedCost * 0.7 + normalizedSuccess * 0.2 + normalizedSpeed * 0.1;
                        break;
                    case 'balanced':
                    default:
                        score = normalizedSuccess * 0.35 + normalizedSpeed * 0.3 + normalizedCost * 0.25 + normalizedVolume * 0.1;
                        break;
                }

                return { ...model, score };
            })
            .sort((a, b) => b.score - a.score)
            .map((model, index) => ({ ...model, ranking: index + 1 }));
    }, [models, criteria]);

    if (rankedModels.length === 0) {
        return (
            <div className="text-center py-8 text-zinc-500">
                No models to compare
            </div>
        );
    }

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
                <thead className="bg-white/5 text-zinc-400 font-medium">
                    <tr>
                        <th className="px-4 py-3">Rank</th>
                        <th className="px-4 py-3">Model</th>
                        <th className="px-4 py-3">Provider</th>
                        <th className="px-4 py-3 text-right">Calls</th>
                        <th className="px-4 py-3 text-right">Success</th>
                        <th className="px-4 py-3 text-right">Avg Latency</th>
                        <th className="px-4 py-3 text-right">Avg Cost</th>
                        <th className="px-4 py-3 text-right">Score</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                    {rankedModels.map((model) => {
                        const providerStyle = PROVIDER_COLORS[model.provider] || PROVIDER_COLORS.openrouter;
                        return (
                            <tr key={model.modelId} className="hover:bg-white/5 transition">
                                <td className="px-4 py-3">
                                    <span className={`inline-flex w-6 h-6 items-center justify-center rounded-full text-xs font-bold ${
                                        model.ranking === 1 ? 'bg-yellow-500/20 text-yellow-400' :
                                        model.ranking === 2 ? 'bg-zinc-400/20 text-zinc-300' :
                                        model.ranking === 3 ? 'bg-amber-600/20 text-amber-500' :
                                        'bg-zinc-700/50 text-zinc-400'
                                    }`}>
                                        {model.ranking}
                                    </span>
                                </td>
                                <td className="px-4 py-3">
                                    <div>
                                        <span className="text-white font-medium">{model.modelName}</span>
                                        <p className="text-zinc-500 text-xs font-mono truncate max-w-[180px]">{model.modelId}</p>
                                    </div>
                                </td>
                                <td className="px-4 py-3">
                                    <span className={`px-2 py-1 rounded text-xs font-medium ${providerStyle.bg} ${providerStyle.text}`}>
                                        {model.provider}
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-right text-zinc-300">
                                    {model.totalCalls.toLocaleString()}
                                </td>
                                <td className="px-4 py-3 text-right">
                                    <span className={model.successRate >= 95 ? 'text-green-400' : model.successRate >= 80 ? 'text-yellow-400' : 'text-red-400'}>
                                        {model.successRate.toFixed(1)}%
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-right text-blue-400">
                                    {Math.round(model.avgLatencyMs)}ms
                                </td>
                                <td className="px-4 py-3 text-right text-green-400">
                                    ${model.avgCostPerCall.toFixed(5)}
                                </td>
                                <td className="px-4 py-3 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <div className="w-16 h-2 bg-zinc-700 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full"
                                                style={{ width: `${model.score * 100}%` }}
                                            />
                                        </div>
                                        <span className="text-white font-medium w-12 text-right">
                                            {(model.score * 100).toFixed(0)}
                                        </span>
                                    </div>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}

export function AdminModels(): React.ReactElement {
    const [data, setData] = useState<ModelPerformanceResponse | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [timeRange, setTimeRange] = useState<TimeRange>(7);
    const [viewMode, setViewMode] = useState<'cards' | 'comparison'>('cards');
    const [comparisonCriteria, setComparisonCriteria] = useState<ComparisonCriteria>('balanced');
    const [providerFilter, setProviderFilter] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const response = await getModelPerformance({ days: timeRange });
                setData(response);
            } catch (err) {
                console.error('[AdminModels] Failed to load model performance:', err);
                setError(err instanceof Error ? err.message : 'Failed to load data');
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [timeRange]);

    const filteredModels = useMemo((): ModelPerformanceStats[] => {
        if (!data?.models) return [];
        if (!providerFilter) return data.models;
        return data.models.filter((m: ModelPerformanceStats) => m.provider === providerFilter);
    }, [data?.models, providerFilter]);

    const providers = useMemo((): string[] => {
        if (!data?.models) return [];
        return [...new Set(data.models.map((m: ModelPerformanceStats) => m.provider))];
    }, [data?.models]);

    return (
        <AdminGuard>
            <AdminLayout activeSection="models">
                <div className="space-y-8">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-white">AI Model Performance</h1>
                            <p className="text-zinc-400 mt-1">Monitor and compare AI model metrics</p>
                        </div>
                        <div className="flex gap-2">
                            {/* Time Range Selector */}
                            <div className="flex bg-zinc-800 rounded-lg p-1">
                                {([7, 14, 30] as TimeRange[]).map((days) => (
                                    <button
                                        key={days}
                                        onClick={() => setTimeRange(days)}
                                        className={`px-3 py-1.5 text-xs font-medium rounded-md transition ${
                                            timeRange === days
                                                ? 'bg-purple-600 text-white'
                                                : 'text-zinc-400 hover:text-white'
                                        }`}
                                    >
                                        {days}d
                                    </button>
                                ))}
                            </div>
                            {/* View Mode Toggle */}
                            <div className="flex bg-zinc-800 rounded-lg p-1">
                                <button
                                    onClick={() => setViewMode('cards')}
                                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition flex items-center gap-1 ${
                                        viewMode === 'cards'
                                            ? 'bg-purple-600 text-white'
                                            : 'text-zinc-400 hover:text-white'
                                    }`}
                                >
                                    <span className="material-icons text-sm">grid_view</span>
                                    Cards
                                </button>
                                <button
                                    onClick={() => setViewMode('comparison')}
                                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition flex items-center gap-1 ${
                                        viewMode === 'comparison'
                                            ? 'bg-purple-600 text-white'
                                            : 'text-zinc-400 hover:text-white'
                                    }`}
                                >
                                    <span className="material-icons text-sm">leaderboard</span>
                                    Compare
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Error State */}
                    {error && (
                        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-red-400">
                            <span className="material-icons text-sm mr-2">error</span>
                            {error}
                        </div>
                    )}

                    {/* Loading State */}
                    {isLoading && (
                        <div className="flex items-center justify-center py-12">
                            <span className="material-icons text-3xl text-purple-500 animate-spin">sync</span>
                        </div>
                    )}

                    {/* Summary Stats */}
                    {!isLoading && data && (
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                            <StatCard
                                label="Total Calls"
                                value={data.summary.totalCalls.toLocaleString()}
                                icon="api"
                                color="text-white"
                            />
                            <StatCard
                                label="Total Tokens"
                                value={`${(data.summary.totalTokens / 1000).toFixed(1)}K`}
                                icon="token"
                                color="text-blue-400"
                            />
                            <StatCard
                                label="Total Cost"
                                value={`$${data.summary.totalCostUsd.toFixed(2)}`}
                                icon="payments"
                                color="text-green-400"
                            />
                            <StatCard
                                label="Avg Success Rate"
                                value={`${data.summary.avgSuccessRate.toFixed(1)}%`}
                                icon="check_circle"
                                color={data.summary.avgSuccessRate >= 95 ? 'text-green-400' : 'text-yellow-400'}
                            />
                            <StatCard
                                label="Avg Latency"
                                value={`${Math.round(data.summary.avgLatencyMs)}ms`}
                                icon="speed"
                                color="text-purple-400"
                            />
                        </div>
                    )}

                    {/* Filters & Controls */}
                    {!isLoading && data && (
                        <div className="flex flex-wrap gap-3 items-center">
                            {/* Provider Filter */}
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setProviderFilter(null)}
                                    className={`px-3 py-1.5 text-xs font-medium rounded-lg transition ${
                                        providerFilter === null
                                            ? 'bg-white/10 text-white'
                                            : 'text-zinc-400 hover:text-white'
                                    }`}
                                >
                                    All Providers
                                </button>
                                {providers.map((provider) => {
                                    const style = PROVIDER_COLORS[provider] || PROVIDER_COLORS.openrouter;
                                    return (
                                        <button
                                            key={provider}
                                            onClick={() => setProviderFilter(provider)}
                                            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition ${
                                                providerFilter === provider
                                                    ? `${style.bg} ${style.text} border ${style.border}`
                                                    : 'text-zinc-400 hover:text-white'
                                            }`}
                                        >
                                            {provider}
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Comparison Criteria (only in comparison view) */}
                            {viewMode === 'comparison' && (
                                <div className="flex gap-2 ml-auto">
                                    <span className="text-zinc-500 text-xs self-center">Optimize for:</span>
                                    {(['balanced', 'speed', 'quality', 'cost'] as ComparisonCriteria[]).map((c) => (
                                        <button
                                            key={c}
                                            onClick={() => setComparisonCriteria(c)}
                                            className={`px-3 py-1.5 text-xs font-medium rounded-lg capitalize transition ${
                                                comparisonCriteria === c
                                                    ? 'bg-purple-600 text-white'
                                                    : 'text-zinc-400 hover:text-white bg-zinc-800'
                                            }`}
                                        >
                                            {c}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Content */}
                    {!isLoading && data && (
                        <>
                            {viewMode === 'cards' ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {filteredModels.length === 0 ? (
                                        <div className="col-span-full text-center py-12 text-zinc-500">
                                            No model data available for the selected period
                                        </div>
                                    ) : (
                                        filteredModels.map((model: ModelPerformanceStats) => (
                                            <ModelCard key={model.modelId} model={model} />
                                        ))
                                    )}
                                </div>
                            ) : (
                                <div className="bg-zinc-900 border border-white/10 rounded-xl overflow-hidden">
                                    <div className="p-4 border-b border-white/10 flex justify-between items-center">
                                        <h2 className="text-lg font-semibold text-white">Model Comparison</h2>
                                        <p className="text-zinc-500 text-sm">
                                            {filteredModels.length} models ranked by{' '}
                                            <span className="text-purple-400 capitalize">{comparisonCriteria}</span>
                                        </p>
                                    </div>
                                    <ComparisonTable models={filteredModels} criteria={comparisonCriteria} />
                                </div>
                            )}
                        </>
                    )}

                    {/* Quick Links */}
                    {!isLoading && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <a
                                href="/admin/observability"
                                className="bg-zinc-900 border border-white/10 rounded-xl p-4 hover:bg-zinc-800/50 transition flex items-center gap-3"
                            >
                                <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center">
                                    <span className="material-icons text-blue-400">insights</span>
                                </div>
                                <div>
                                    <p className="text-white font-medium">View Traces</p>
                                    <p className="text-zinc-500 text-sm">Detailed LLM call logs</p>
                                </div>
                            </a>
                            <a
                                href="/admin/agents"
                                className="bg-zinc-900 border border-white/10 rounded-xl p-4 hover:bg-zinc-800/50 transition flex items-center gap-3"
                            >
                                <div className="w-10 h-10 bg-purple-500/10 rounded-lg flex items-center justify-center">
                                    <span className="material-icons text-purple-400">smart_toy</span>
                                </div>
                                <div>
                                    <p className="text-white font-medium">Agent Config</p>
                                    <p className="text-zinc-500 text-sm">Configure agent models</p>
                                </div>
                            </a>
                            <a
                                href="/admin/finance"
                                className="bg-zinc-900 border border-white/10 rounded-xl p-4 hover:bg-zinc-800/50 transition flex items-center gap-3"
                            >
                                <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center">
                                    <span className="material-icons text-green-400">payments</span>
                                </div>
                                <div>
                                    <p className="text-white font-medium">Cost Analysis</p>
                                    <p className="text-zinc-500 text-sm">Detailed cost breakdown</p>
                                </div>
                            </a>
                        </div>
                    )}
                </div>
            </AdminLayout>
        </AdminGuard>
    );
}
