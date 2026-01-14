/**
 * Admin Agents Page - Phase 9 Enhanced
 *
 * Comprehensive agent configuration panel with:
 * - System prompt editing
 * - Model parameter tuning
 * - Agent testing interface
 * - Cost budget settings
 * - Version history / rollback
 * - Context document management
 * - Pydantic AI Agents visualization (NEW)
 * - API Integration routing (NEW)
 * - Real-time metrics dashboard (NEW)
 */

import React, { useState, useEffect, useCallback, useRef, useLayoutEffect } from 'react';
import { AdminLayout } from '../components/AdminLayout';
import { AdminGuard } from '../components/AdminGuard';
import {
    listAgents,
    updateAgent,
    getAgentDetail,
    addAgentContextDoc,
    removeAgentContextDoc,
} from '../services/adminApi';
import {
    ApiRoutingGraph,
    AgentMetricsDashboard,
} from '../components/agents';
import type {
    AgentConfig,
    AgentModelParameters,
    AgentCostBudget,
    AgentVersionHistory,
    AgentTestResult,
    AgentDashboardSummary,
} from '../types';

type AgentContextDoc = {
    id: string;
    name: string;
    filePath: string | null;
    type: string;
};

type AgentDetail = {
    agent: AgentConfig;
    skills: unknown[];
    mcpConnections: unknown[];
    contextDocs: AgentContextDoc[];
    runtime: {
        metrics: {
            totalCalls: number;
            successCount: number;
            errorCount: number;
            avgLatencyMs: number;
        };
    } | null;
};

// Platform filter type
type PlatformFilter = 'all' | 'general' | 'linkedin' | 'youtube' | 'instagram' | 'facebook' | 'tiktok' | 'x';

// Tab type for detail view
type DetailTab = 'config' | 'parameters' | 'testing' | 'budget' | 'context' | 'history';

// Default model parameters
const DEFAULT_PARAMETERS: AgentModelParameters = {
    temperature: 0.7,
    maxTokens: 4096,
    topP: 1.0,
    frequencyPenalty: 0,
    presencePenalty: 0,
    stopSequences: [],
};

// Default cost budget
const DEFAULT_BUDGET: AgentCostBudget = {
    dailyLimitUsd: null,
    monthlyLimitUsd: null,
    alertThresholdPercent: 80,
    currentDailySpend: 0,
    currentMonthlySpend: 0,
    isOverBudget: false,
};

function BudgetProgressBar({ current, limit }: { current: number; limit: number }): React.ReactElement {
    const barRef = useRef<HTMLDivElement>(null);

    useLayoutEffect(() => {
        if (barRef.current) {
            const percentage = Math.min(100, (current / limit) * 100);
            barRef.current.style.width = `${percentage}%`;
        }
    }, [current, limit]);

    return (
        <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
            <div
                ref={barRef}
                className="h-full bg-gradient-to-r from-green-500 to-amber-500"
            />
        </div>
    );
}

// Mock dashboard summary for Pydantic AI agents
const MOCK_DASHBOARD_SUMMARY: AgentDashboardSummary = {
    totalAgents: 12, activeAgents: 10, totalCalls24h: 302, totalTokens24h: 183000, totalCost24h: 0.54, avgLatencyMs: 340,
    apiHealth: [
        { provider: 'openrouter', status: 'healthy', latencyMs: 120, uptime24h: 0.999, features: ['chat', 'vision'] },
        { provider: 'replicate', status: 'healthy', latencyMs: 200, uptime24h: 0.998, features: ['image-gen', 'upscale'] },
        { provider: 'openai', status: 'healthy', latencyMs: 50, uptime24h: 1.0, features: ['chat', 'embeddings', 'realtime'] },
        { provider: 'cognee', status: 'healthy', latencyMs: 80, uptime24h: 0.995, features: ['search', 'add', 'cognify'] },
        { provider: 'langfuse', status: 'healthy', latencyMs: 45, uptime24h: 1.0, features: ['traces', 'generations'] },
    ],
};

export function AdminAgents(): React.ReactElement {
    const [agents, setAgents] = useState<AgentConfig[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedAgent, setSelectedAgent] = useState<AgentDetail | null>(null);
    const [isDetailLoading, setIsDetailLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<DetailTab>('config');
    const [platformFilter, setPlatformFilter] = useState<PlatformFilter>('all');

    // Dashboard summary state
    const [dashboardSummary] = useState<AgentDashboardSummary>(MOCK_DASHBOARD_SUMMARY);

    // Edit states
    const [editedPrompt, setEditedPrompt] = useState('');
    const [editedParameters, setEditedParameters] = useState<AgentModelParameters>(DEFAULT_PARAMETERS);
    const [editedBudget, setEditedBudget] = useState<AgentCostBudget>(DEFAULT_BUDGET);
    const [isSaving, setIsSaving] = useState(false);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Context Doc State
    const [newDocName, setNewDocName] = useState('');
    const [newDocPath, setNewDocPath] = useState('');

    // Testing State
    const [testPrompt, setTestPrompt] = useState('');
    const [isTestRunning, setIsTestRunning] = useState(false);
    const [testResults, setTestResults] = useState<AgentTestResult[]>([]);

    // Version History State (mock data for now)
    const [versionHistory, setVersionHistory] = useState<AgentVersionHistory[]>([]);

    useEffect(() => {
        loadAgents();
    }, []);

    const loadAgents = async () => {
        try {
            setIsLoading(true);
            const data = await listAgents();
            setAgents(data.agents);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load agents');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSelectAgent = async (agent: AgentConfig) => {
        try {
            setIsDetailLoading(true);
            const detail = (await getAgentDetail(agent.agentId)) as unknown as AgentDetail;
            setSelectedAgent(detail);
            setEditedPrompt(detail.agent.systemPrompt || '');

            // Parse parameters from agent config
            const params = detail.agent.parameters as Partial<AgentModelParameters> || {};
            setEditedParameters({
                temperature: params.temperature ?? DEFAULT_PARAMETERS.temperature,
                maxTokens: params.maxTokens ?? DEFAULT_PARAMETERS.maxTokens,
                topP: params.topP ?? DEFAULT_PARAMETERS.topP,
                frequencyPenalty: params.frequencyPenalty ?? DEFAULT_PARAMETERS.frequencyPenalty,
                presencePenalty: params.presencePenalty ?? DEFAULT_PARAMETERS.presencePenalty,
                stopSequences: params.stopSequences ?? DEFAULT_PARAMETERS.stopSequences,
            });

            // Mock version history
            setVersionHistory([
                {
                    id: '1',
                    version: detail.agent.version,
                    systemPrompt: detail.agent.systemPrompt || '',
                    parameters: editedParameters,
                    changedBy: 'admin@example.com',
                    changedAt: new Date().toISOString(),
                    changeReason: 'Current version',
                },
                {
                    id: '2',
                    version: detail.agent.version - 1,
                    systemPrompt: 'Previous system prompt...',
                    parameters: DEFAULT_PARAMETERS,
                    changedBy: 'admin@example.com',
                    changedAt: new Date(Date.now() - 86400000).toISOString(),
                    changeReason: 'Updated prompt for better responses',
                },
            ]);

            setError(null);
            setSuccessMessage(null);
            setActiveTab('config');
            setTestResults([]);
        } catch {
            setError('Failed to load agent details');
        } finally {
            setIsDetailLoading(false);
        }
    };

    const handleSave = async () => {
        if (!selectedAgent) return;

        try {
            setIsSaving(true);
            setError(null);
            await updateAgent(selectedAgent.agent.id, {
                systemPrompt: editedPrompt,
                parameters: editedParameters,
            });
            setSuccessMessage('Agent configuration saved');

            const updated = (await getAgentDetail(selectedAgent.agent.agentId)) as unknown as AgentDetail;
            setSelectedAgent(updated);

            loadAgents();
            setTimeout(() => setSuccessMessage(null), 3000);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to save');
        } finally {
            setIsSaving(false);
        }
    };

    const handleSaveBudget = async () => {
        if (!selectedAgent) return;

        try {
            setIsSaving(true);
            setError(null);
            // In a real implementation, this would call an API
            setSuccessMessage('Budget settings saved');
            setTimeout(() => setSuccessMessage(null), 3000);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to save budget');
        } finally {
            setIsSaving(false);
        }
    };

    const handleRunTest = useCallback(async () => {
        if (!selectedAgent || !testPrompt.trim()) return;

        setIsTestRunning(true);
        try {
            // Simulate test run (in production, this would call the actual agent)
            await new Promise((resolve) => setTimeout(resolve, 2000));

            const mockResult: AgentTestResult = {
                id: Date.now().toString(),
                input: testPrompt,
                output: `This is a simulated response from ${selectedAgent.agent.name}. In production, this would be the actual agent response based on the system prompt and parameters configured above.`,
                model: selectedAgent.agent.model || 'default',
                tokensUsed: Math.floor(Math.random() * 500) + 100,
                latencyMs: Math.floor(Math.random() * 2000) + 500,
                costUsd: Math.random() * 0.05,
                status: 'success',
                createdAt: new Date().toISOString(),
            };

            setTestResults((prev) => [mockResult, ...prev]);
            setTestPrompt('');
        } catch (err) {
            const errorResult: AgentTestResult = {
                id: Date.now().toString(),
                input: testPrompt,
                output: '',
                model: selectedAgent.agent.model || 'default',
                tokensUsed: 0,
                latencyMs: 0,
                costUsd: 0,
                status: 'error',
                error: err instanceof Error ? err.message : 'Test failed',
                createdAt: new Date().toISOString(),
            };
            setTestResults((prev) => [errorResult, ...prev]);
        } finally {
            setIsTestRunning(false);
        }
    }, [selectedAgent, testPrompt]);

    const handleRestoreVersion = async (version: AgentVersionHistory) => {
        if (!selectedAgent) return;

        setEditedPrompt(version.systemPrompt);
        setEditedParameters(version.parameters);
        setSuccessMessage(`Restored to version ${version.version}. Click Save to apply.`);
        setActiveTab('config');
        setTimeout(() => setSuccessMessage(null), 5000);
    };

    const handleAddDoc = async () => {
        if (!selectedAgent || !newDocName) return;
        try {
            await addAgentContextDoc(selectedAgent.agent.agentId, {
                name: newDocName,
                type: 'reference',
                filePath: newDocPath,
                metadata: { source: 'admin_ui' },
            });
            const updated = (await getAgentDetail(selectedAgent.agent.agentId)) as unknown as AgentDetail;
            setSelectedAgent(updated);
            setNewDocName('');
            setNewDocPath('');
            setSuccessMessage('Document added');
            setTimeout(() => setSuccessMessage(null), 3000);
        } catch {
            setError('Failed to add document');
        }
    };

    const handleRemoveDoc = async (docId: string) => {
        if (!selectedAgent) return;
        try {
            await removeAgentContextDoc(selectedAgent.agent.agentId, docId);
            const updated = (await getAgentDetail(selectedAgent.agent.agentId)) as unknown as AgentDetail;
            setSelectedAgent(updated);
            setSuccessMessage('Document removed');
            setTimeout(() => setSuccessMessage(null), 3000);
        } catch {
            setError('Failed to remove document');
        }
    };

    const getAgentIcon = (agentId: string): string => {
        const icons: Record<string, string> = {
            benno: 'psychology',
            'art-director': 'palette',
            'copy-specialist': 'edit_note',
            'tech-wizard': 'code',
            'accessibility-expert': 'accessibility',
            'industry-specialist': 'business',
            'layout-composer': 'dashboard',
            'linkedin-specialist': 'work',
            'youtube-specialist': 'play_circle',
            'instagram-specialist': 'camera_alt',
            'facebook-specialist': 'group',
            'tiktok-specialist': 'music_note',
            'x-specialist': 'tag',
        };
        return icons[agentId] || 'smart_toy';
    };

    const getAgentColor = (agentId: string): string => {
        const colors: Record<string, string> = {
            benno: 'purple',
            'art-director': 'pink',
            'copy-specialist': 'blue',
            'tech-wizard': 'cyan',
            'accessibility-expert': 'green',
            'industry-specialist': 'amber',
            'layout-composer': 'indigo',
            'linkedin-specialist': 'blue',
            'youtube-specialist': 'red',
            'instagram-specialist': 'pink',
            'facebook-specialist': 'blue',
            'tiktok-specialist': 'cyan',
            'x-specialist': 'zinc',
        };
        return colors[agentId] || 'zinc';
    };

    const getAgentPlatform = (agentId: string): PlatformFilter => {
        if (agentId.endsWith('-specialist')) {
            const platform = agentId.replace('-specialist', '') as PlatformFilter;
            if (['linkedin', 'youtube', 'instagram', 'facebook', 'tiktok', 'x'].includes(platform)) {
                return platform;
            }
        }
        return 'general';
    };

    const filteredAgents = agents.filter((agent) => {
        if (platformFilter === 'all') return true;
        const agentPlatform = getAgentPlatform(agent.agentId);
        return agentPlatform === platformFilter;
    });

    // Tab configuration
    const tabs: { id: DetailTab; label: string; icon: string }[] = [
        { id: 'config', label: 'Config', icon: 'settings' },
        { id: 'parameters', label: 'Parameters', icon: 'tune' },
        { id: 'testing', label: 'Testing', icon: 'science' },
        { id: 'budget', label: 'Budget', icon: 'attach_money' },
        { id: 'context', label: 'Context', icon: 'folder' },
        { id: 'history', label: 'History', icon: 'history' },
    ];

    // Build agent connections for API routing graph
    const agentConnections = agents.map(agent => ({
        agentId: agent.agentId,
        agentName: agent.name,
        apis: ['openrouter', 'cognee', 'langfuse'] as Array<'openrouter' | 'replicate' | 'openai' | 'cognee' | 'langfuse'>,
    }));

    return (
        <AdminGuard>
            <AdminLayout activeSection="agents">
                <div className="space-y-6">
                    {/* Header */}
                    <div>
                        <h1 className="text-3xl font-bold text-white">Agent Command Center</h1>
                        <p className="text-zinc-400 mt-1">
                            Manage AI agents, monitor API integrations, and configure Cognee RAG
                        </p>
                    </div>

                    {/* Pydantic AI Metrics Dashboard */}
                    <AgentMetricsDashboard summary={dashboardSummary} isLoading={isLoading} />

                    {/* API Integration Routing Graph */}
                    <ApiRoutingGraph
                        apiHealth={dashboardSummary.apiHealth}
                        agentConnections={agentConnections}
                    />

                    {/* Messages */}
                    {error && (
                        <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                            <p className="text-red-400 text-sm">{error}</p>
                        </div>
                    )}
                    {successMessage && (
                        <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                            <p className="text-green-400 text-sm">{successMessage}</p>
                        </div>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Agent List */}
                        <div className="lg:col-span-1 space-y-3">
                            <div className="flex items-center justify-between px-1">
                                <h2 className="text-sm font-bold text-zinc-400 uppercase tracking-wider">
                                    Agents ({filteredAgents.length})
                                </h2>
                            </div>

                            {/* Platform Filter */}
                            <div className="flex flex-wrap gap-1.5 p-1 bg-black/30 rounded-xl">
                                {(
                                    [
                                        'all',
                                        'general',
                                        'linkedin',
                                        'youtube',
                                        'instagram',
                                        'facebook',
                                        'tiktok',
                                        'x',
                                    ] as PlatformFilter[]
                                ).map((filter) => (
                                    <button
                                        key={filter}
                                        onClick={() => setPlatformFilter(filter)}
                                        className={`px-2.5 py-1 text-[10px] font-semibold rounded-lg uppercase tracking-wide transition ${platformFilter === filter
                                            ? 'bg-purple-500/30 text-purple-300 border border-purple-500/50'
                                            : 'text-zinc-500 hover:text-zinc-300 border border-transparent'
                                            }`}
                                    >
                                        {filter === 'all' ? 'All' : filter === 'general' ? 'General' : filter}
                                    </button>
                                ))}
                            </div>

                            {isLoading ? (
                                <div className="space-y-2">
                                    {[...Array(5)].map((_, i) => (
                                        <div
                                            key={i}
                                            className="bg-zinc-900/50 border border-white/5 rounded-xl p-4 animate-pulse"
                                        >
                                            <div className="h-4 bg-zinc-800 rounded w-3/4 mb-2"></div>
                                            <div className="h-3 bg-zinc-800 rounded w-1/2"></div>
                                        </div>
                                    ))}
                                </div>
                            ) : agents.length === 0 ? (
                                <div className="bg-zinc-900/50 border border-white/5 rounded-xl p-6 text-center">
                                    <span className="material-icons text-4xl text-zinc-600 mb-2">smart_toy</span>
                                    <p className="text-zinc-500">No agents configured</p>
                                </div>
                            ) : filteredAgents.length === 0 ? (
                                <div className="bg-zinc-900/50 border border-white/5 rounded-xl p-6 text-center">
                                    <span className="material-icons text-4xl text-zinc-600 mb-2">filter_alt_off</span>
                                    <p className="text-zinc-500">No agents match filter</p>
                                </div>
                            ) : (
                                <div className="space-y-2 max-h-[calc(100vh-320px)] overflow-y-auto">
                                    {filteredAgents.map((agent) => {
                                        const color = getAgentColor(agent.agentId);
                                        const isSelected = selectedAgent?.agent.id === agent.id;
                                        const platform = getAgentPlatform(agent.agentId);
                                        const isPlatformAgent = platform !== 'general';

                                        return (
                                            <button
                                                key={agent.id}
                                                onClick={() => handleSelectAgent(agent)}
                                                className={`w-full text-left p-4 rounded-xl border transition-all ${isSelected
                                                    ? 'bg-purple-500/20 border-purple-500/50'
                                                    : 'bg-zinc-900/50 border-white/5 hover:border-white/20'
                                                    }`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div
                                                        className={`w-10 h-10 rounded-lg bg-${color}-500/20 flex items-center justify-center`}
                                                    >
                                                        <span className={`material-icons text-${color}-400`}>
                                                            {getAgentIcon(agent.agentId)}
                                                        </span>
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2">
                                                            <p className="text-white font-medium truncate">
                                                                {agent.name}
                                                            </p>
                                                            {isPlatformAgent && (
                                                                <span
                                                                    className={`text-[9px] bg-${color}-500/20 text-${color}-400 px-1.5 py-0.5 rounded uppercase font-semibold`}
                                                                >
                                                                    {platform}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <p className="text-zinc-500 text-xs truncate">
                                                            {agent.model || 'No model'} &bull; v{agent.version}
                                                        </p>
                                                    </div>
                                                    {!agent.enabled && (
                                                        <span className="text-[9px] bg-zinc-700 text-zinc-400 px-2 py-0.5 rounded uppercase">
                                                            Disabled
                                                        </span>
                                                    )}
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* Agent Editor */}
                        <div className="lg:col-span-2">
                            {isDetailLoading ? (
                                <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-12 text-center">
                                    <span className="material-icons text-4xl text-purple-500 animate-spin mb-4">
                                        sync
                                    </span>
                                    <p className="text-zinc-400">Loading agent details...</p>
                                </div>
                            ) : selectedAgent ? (
                                <div className="bg-zinc-900/50 border border-white/5 rounded-2xl overflow-hidden">
                                    {/* Agent Header */}
                                    <div className="p-6 border-b border-white/5">
                                        <div className="flex items-center justify-between flex-wrap gap-4">
                                            <div className="flex items-center gap-4">
                                                <div
                                                    className={`w-14 h-14 rounded-xl bg-${getAgentColor(
                                                        selectedAgent.agent.agentId
                                                    )}-500/20 flex items-center justify-center`}
                                                >
                                                    <span
                                                        className={`material-icons text-2xl text-${getAgentColor(
                                                            selectedAgent.agent.agentId
                                                        )}-400`}
                                                    >
                                                        {getAgentIcon(selectedAgent.agent.agentId)}
                                                    </span>
                                                </div>
                                                <div>
                                                    <h2 className="text-xl font-bold text-white">
                                                        {selectedAgent.agent.name}
                                                    </h2>
                                                    <p className="text-zinc-400 text-sm">
                                                        {selectedAgent.agent.type} &bull;{' '}
                                                        {selectedAgent.agent.provider || 'Default provider'}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Tabs */}
                                        <div className="flex gap-1 mt-4 bg-black/30 rounded-lg p-1 overflow-x-auto">
                                            {tabs.map((tab) => (
                                                <button
                                                    key={tab.id}
                                                    onClick={() => setActiveTab(tab.id)}
                                                    className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-md transition whitespace-nowrap ${activeTab === tab.id
                                                        ? 'bg-zinc-700 text-white shadow-sm'
                                                        : 'text-zinc-400 hover:text-white'
                                                        }`}
                                                >
                                                    <span className="material-icons text-sm">{tab.icon}</span>
                                                    {tab.label}
                                                    {tab.id === 'context' && (
                                                        <span className="text-[10px] bg-purple-500/30 text-purple-300 px-1.5 rounded">
                                                            {selectedAgent.contextDocs.length}
                                                        </span>
                                                    )}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Config Tab */}
                                    {activeTab === 'config' && (
                                        <div className="p-6 space-y-6">
                                            {/* Model Settings */}
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                <div className="bg-black/30 rounded-xl p-4">
                                                    <p className="text-zinc-500 text-xs mb-1">Model</p>
                                                    <p className="text-white font-medium text-sm truncate">
                                                        {selectedAgent.agent.model || 'Default'}
                                                    </p>
                                                </div>
                                                <div className="bg-black/30 rounded-xl p-4">
                                                    <p className="text-zinc-500 text-xs mb-1">Provider</p>
                                                    <p className="text-white font-medium text-sm">
                                                        {selectedAgent.agent.provider || 'Default'}
                                                    </p>
                                                </div>
                                                <div className="bg-black/30 rounded-xl p-4">
                                                    <p className="text-zinc-500 text-xs mb-1">Skills</p>
                                                    <p className="text-white font-medium text-sm">
                                                        {selectedAgent.agent.skillCount}
                                                    </p>
                                                </div>
                                                <div className="bg-black/30 rounded-xl p-4">
                                                    <p className="text-zinc-500 text-xs mb-1">MCP Connections</p>
                                                    <p className="text-white font-medium text-sm">
                                                        {selectedAgent.agent.mcpConnectionCount}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Runtime Stats */}
                                            {selectedAgent.runtime && (
                                                <div className="bg-black/30 rounded-xl p-4">
                                                    <p className="text-zinc-500 text-xs mb-3">Runtime Metrics</p>
                                                    <div className="grid grid-cols-4 gap-4">
                                                        <div>
                                                            <p className="text-2xl font-bold text-white">
                                                                {selectedAgent.runtime.metrics.totalCalls}
                                                            </p>
                                                            <p className="text-zinc-500 text-xs">Total Calls</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-2xl font-bold text-green-400">
                                                                {selectedAgent.runtime.metrics.successCount}
                                                            </p>
                                                            <p className="text-zinc-500 text-xs">Success</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-2xl font-bold text-red-400">
                                                                {selectedAgent.runtime.metrics.errorCount}
                                                            </p>
                                                            <p className="text-zinc-500 text-xs">Errors</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-2xl font-bold text-blue-400">
                                                                {selectedAgent.runtime.metrics.avgLatencyMs}ms
                                                            </p>
                                                            <p className="text-zinc-500 text-xs">Avg Latency</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {/* System Prompt */}
                                            <div>
                                                <label htmlFor="system-prompt" className="text-sm font-medium text-zinc-400 mb-2 block">
                                                    System Prompt
                                                </label>
                                                <textarea
                                                    id="system-prompt"
                                                    value={editedPrompt}
                                                    onChange={(e) => setEditedPrompt(e.target.value)}
                                                    rows={12}
                                                    className="w-full bg-black/30 border border-white/10 rounded-xl p-4 text-white text-sm font-mono focus:outline-none focus:border-purple-500 resize-none"
                                                    placeholder="Enter the system prompt for this agent..."
                                                />
                                                <p className="text-zinc-600 text-xs mt-2">
                                                    {editedPrompt.length} characters
                                                </p>
                                            </div>

                                            {/* Actions */}
                                            <div className="flex gap-3 pt-4 border-t border-white/5">
                                                <button
                                                    onClick={() =>
                                                        setEditedPrompt(selectedAgent.agent.systemPrompt || '')
                                                    }
                                                    className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg font-medium transition"
                                                >
                                                    Reset
                                                </button>
                                                <button
                                                    onClick={handleSave}
                                                    disabled={
                                                        isSaving || editedPrompt === selectedAgent.agent.systemPrompt
                                                    }
                                                    className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium transition flex items-center justify-center gap-2"
                                                >
                                                    {isSaving ? (
                                                        <>
                                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                                            Saving...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <span className="material-icons text-sm">save</span>
                                                            Save Changes
                                                        </>
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {/* Parameters Tab */}
                                    {activeTab === 'parameters' && (
                                        <div className="p-6 space-y-6">
                                            <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
                                                <h3 className="text-blue-400 font-medium mb-1">Model Parameters</h3>
                                                <p className="text-zinc-400 text-sm">
                                                    Fine-tune the AI model behavior. Changes affect all future calls
                                                    to this agent.
                                                </p>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                {/* Temperature */}
                                                <div className="space-y-2">
                                                    <div className="flex items-center justify-between">
                                                        <label htmlFor="param-temperature" className="text-sm font-medium text-zinc-400">
                                                            Temperature
                                                        </label>
                                                        <span className="text-sm text-white font-mono">
                                                            {editedParameters.temperature.toFixed(2)}
                                                        </span>
                                                    </div>
                                                    <input
                                                        id="param-temperature"
                                                        type="range"
                                                        min="0"
                                                        max="2"
                                                        step="0.1"
                                                        value={editedParameters.temperature}
                                                        onChange={(e) =>
                                                            setEditedParameters((p) => ({
                                                                ...p,
                                                                temperature: parseFloat(e.target.value),
                                                            }))
                                                        }
                                                        className="w-full accent-purple-500"
                                                    />
                                                    <p className="text-zinc-600 text-xs">
                                                        Higher = more creative, Lower = more focused
                                                    </p>
                                                </div>

                                                {/* Max Tokens */}
                                                <div className="space-y-2">
                                                    <label htmlFor="param-max-tokens" className="text-sm font-medium text-zinc-400 block">
                                                        Max Tokens
                                                    </label>
                                                    <input
                                                        id="param-max-tokens"
                                                        type="number"
                                                        value={editedParameters.maxTokens}
                                                        onChange={(e) =>
                                                            setEditedParameters((p) => ({
                                                                ...p,
                                                                maxTokens: parseInt(e.target.value) || 0,
                                                            }))
                                                        }
                                                        min="1"
                                                        max="128000"
                                                        className="w-full px-4 py-2 bg-black/30 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500"
                                                    />
                                                    <p className="text-zinc-600 text-xs">
                                                        Maximum response length (1-128000)
                                                    </p>
                                                </div>

                                                {/* Top P */}
                                                <div className="space-y-2">
                                                    <div className="flex items-center justify-between">
                                                        <label htmlFor="param-top-p" className="text-sm font-medium text-zinc-400">
                                                            Top P (Nucleus Sampling)
                                                        </label>
                                                        <span className="text-sm text-white font-mono">
                                                            {editedParameters.topP.toFixed(2)}
                                                        </span>
                                                    </div>
                                                    <input
                                                        id="param-top-p"
                                                        type="range"
                                                        min="0"
                                                        max="1"
                                                        step="0.05"
                                                        value={editedParameters.topP}
                                                        onChange={(e) =>
                                                            setEditedParameters((p) => ({
                                                                ...p,
                                                                topP: parseFloat(e.target.value),
                                                            }))
                                                        }
                                                        className="w-full accent-purple-500"
                                                    />
                                                    <p className="text-zinc-600 text-xs">
                                                        Alternative to temperature for sampling
                                                    </p>
                                                </div>

                                                {/* Frequency Penalty */}
                                                <div className="space-y-2">
                                                    <div className="flex items-center justify-between">
                                                        <label htmlFor="param-freq-penalty" className="text-sm font-medium text-zinc-400">
                                                            Frequency Penalty
                                                        </label>
                                                        <span className="text-sm text-white font-mono">
                                                            {editedParameters.frequencyPenalty.toFixed(2)}
                                                        </span>
                                                    </div>
                                                    <input
                                                        id="param-freq-penalty"
                                                        type="range"
                                                        min="-2"
                                                        max="2"
                                                        step="0.1"
                                                        value={editedParameters.frequencyPenalty}
                                                        onChange={(e) =>
                                                            setEditedParameters((p) => ({
                                                                ...p,
                                                                frequencyPenalty: parseFloat(e.target.value),
                                                            }))
                                                        }
                                                        className="w-full accent-purple-500"
                                                    />
                                                    <p className="text-zinc-600 text-xs">Reduces word repetition</p>
                                                </div>

                                                {/* Presence Penalty */}
                                                <div className="space-y-2">
                                                    <div className="flex items-center justify-between">
                                                        <label htmlFor="param-presence-penalty" className="text-sm font-medium text-zinc-400">
                                                            Presence Penalty
                                                        </label>
                                                        <span className="text-sm text-white font-mono">
                                                            {editedParameters.presencePenalty.toFixed(2)}
                                                        </span>
                                                    </div>
                                                    <input
                                                        id="param-presence-penalty"
                                                        type="range"
                                                        min="-2"
                                                        max="2"
                                                        step="0.1"
                                                        value={editedParameters.presencePenalty}
                                                        onChange={(e) =>
                                                            setEditedParameters((p) => ({
                                                                ...p,
                                                                presencePenalty: parseFloat(e.target.value),
                                                            }))
                                                        }
                                                        className="w-full accent-purple-500"
                                                    />
                                                    <p className="text-zinc-600 text-xs">
                                                        Encourages topic diversity
                                                    </p>
                                                </div>

                                                {/* Stop Sequences */}
                                                <div className="space-y-2">
                                                    <label htmlFor="param-stop-sequences" className="text-sm font-medium text-zinc-400 block">
                                                        Stop Sequences
                                                    </label>
                                                    <input
                                                        id="param-stop-sequences"
                                                        type="text"
                                                        value={editedParameters.stopSequences.join(', ')}
                                                        onChange={(e) =>
                                                            setEditedParameters((p) => ({
                                                                ...p,
                                                                stopSequences: e.target.value
                                                                    .split(',')
                                                                    .map((s) => s.trim())
                                                                    .filter(Boolean),
                                                            }))
                                                        }
                                                        placeholder="e.g., ###, END, STOP"
                                                        className="w-full px-4 py-2 bg-black/30 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500"
                                                    />
                                                    <p className="text-zinc-600 text-xs">
                                                        Comma-separated sequences to stop generation
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Actions */}
                                            <div className="flex gap-3 pt-4 border-t border-white/5">
                                                <button
                                                    onClick={() => setEditedParameters(DEFAULT_PARAMETERS)}
                                                    className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg font-medium transition"
                                                >
                                                    Reset to Defaults
                                                </button>
                                                <button
                                                    onClick={handleSave}
                                                    disabled={isSaving}
                                                    className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded-lg font-medium transition flex items-center justify-center gap-2"
                                                >
                                                    {isSaving ? (
                                                        <>
                                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                                            Saving...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <span className="material-icons text-sm">save</span>
                                                            Save Parameters
                                                        </>
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {/* Testing Tab */}
                                    {activeTab === 'testing' && (
                                        <div className="p-6 space-y-6">
                                            <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4">
                                                <h3 className="text-purple-400 font-medium mb-1">Agent Testing</h3>
                                                <p className="text-zinc-400 text-sm">
                                                    Test your agent with sample prompts. Results show response
                                                    quality, latency, and cost.
                                                </p>
                                            </div>

                                            {/* Test Input */}
                                            <div className="space-y-3">
                                                <label htmlFor="test-prompt" className="text-sm font-medium text-zinc-400 block">
                                                    Test Prompt
                                                </label>
                                                <textarea
                                                    id="test-prompt"
                                                    value={testPrompt}
                                                    onChange={(e) => setTestPrompt(e.target.value)}
                                                    rows={4}
                                                    placeholder="Enter a test prompt to send to this agent..."
                                                    className="w-full bg-black/30 border border-white/10 rounded-xl p-4 text-white text-sm focus:outline-none focus:border-purple-500 resize-none"
                                                />
                                                <button
                                                    onClick={handleRunTest}
                                                    disabled={isTestRunning || !testPrompt.trim()}
                                                    className="px-6 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded-lg font-medium transition flex items-center gap-2"
                                                >
                                                    {isTestRunning ? (
                                                        <>
                                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                                            Running Test...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <span className="material-icons text-sm">play_arrow</span>
                                                            Run Test
                                                        </>
                                                    )}
                                                </button>
                                            </div>

                                            {/* Test Results */}
                                            <div className="space-y-3">
                                                <h4 className="text-sm font-medium text-zinc-400">
                                                    Test Results ({testResults.length})
                                                </h4>
                                                {testResults.length === 0 ? (
                                                    <p className="text-center text-zinc-500 py-8">
                                                        No tests run yet. Enter a prompt above to test this agent.
                                                    </p>
                                                ) : (
                                                    <div className="space-y-3 max-h-[400px] overflow-y-auto">
                                                        {testResults.map((result) => (
                                                            <div
                                                                key={result.id}
                                                                className={`bg-black/30 border rounded-xl p-4 ${result.status === 'success'
                                                                    ? 'border-green-500/30'
                                                                    : 'border-red-500/30'
                                                                    }`}
                                                            >
                                                                <div className="flex items-start justify-between mb-3">
                                                                    <div className="flex items-center gap-2">
                                                                        <span
                                                                            className={`material-icons text-sm ${result.status === 'success'
                                                                                ? 'text-green-400'
                                                                                : 'text-red-400'
                                                                                }`}
                                                                        >
                                                                            {result.status === 'success'
                                                                                ? 'check_circle'
                                                                                : 'error'}
                                                                        </span>
                                                                        <span className="text-xs text-zinc-500">
                                                                            {new Date(
                                                                                result.createdAt
                                                                            ).toLocaleTimeString()}
                                                                        </span>
                                                                    </div>
                                                                    <div className="flex gap-3 text-xs text-zinc-500">
                                                                        <span>{result.tokensUsed} tokens</span>
                                                                        <span>{result.latencyMs}ms</span>
                                                                        <span>${result.costUsd.toFixed(4)}</span>
                                                                    </div>
                                                                </div>
                                                                <div className="space-y-2">
                                                                    <div>
                                                                        <p className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1">
                                                                            Input
                                                                        </p>
                                                                        <p className="text-sm text-zinc-300 bg-black/30 rounded-lg p-2">
                                                                            {result.input}
                                                                        </p>
                                                                    </div>
                                                                    <div>
                                                                        <p className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1">
                                                                            Output
                                                                        </p>
                                                                        <p className="text-sm text-white bg-black/30 rounded-lg p-2">
                                                                            {result.status === 'success'
                                                                                ? result.output
                                                                                : result.error}
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* Budget Tab */}
                                    {activeTab === 'budget' && (
                                        <div className="p-6 space-y-6">
                                            <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4">
                                                <h3 className="text-amber-400 font-medium mb-1">Cost Budget</h3>
                                                <p className="text-zinc-400 text-sm">
                                                    Set spending limits to prevent runaway costs. Alerts are sent
                                                    when thresholds are reached.
                                                </p>
                                            </div>

                                            {/* Current Spend */}
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="bg-black/30 rounded-xl p-4">
                                                    <p className="text-zinc-500 text-xs mb-1">Today's Spend</p>
                                                    <p className="text-2xl font-bold text-white">
                                                        ${editedBudget.currentDailySpend.toFixed(2)}
                                                    </p>
                                                    {editedBudget.dailyLimitUsd && (
                                                        <div className="mt-2">
                                                            <BudgetProgressBar
                                                                current={editedBudget.currentDailySpend}
                                                                limit={editedBudget.dailyLimitUsd}
                                                            />
                                                            <p className="text-xs text-zinc-500 mt-1">
                                                                of ${editedBudget.dailyLimitUsd.toFixed(2)} limit
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="bg-black/30 rounded-xl p-4">
                                                    <p className="text-zinc-500 text-xs mb-1">This Month's Spend</p>
                                                    <p className="text-2xl font-bold text-white">
                                                        ${editedBudget.currentMonthlySpend.toFixed(2)}
                                                    </p>
                                                    {editedBudget.monthlyLimitUsd && (
                                                        <div className="mt-2">
                                                            <BudgetProgressBar
                                                                current={editedBudget.currentMonthlySpend}
                                                                limit={editedBudget.monthlyLimitUsd}
                                                            />
                                                            <p className="text-xs text-zinc-500 mt-1">
                                                                of ${editedBudget.monthlyLimitUsd.toFixed(2)} limit
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Budget Settings */}
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div className="space-y-2">
                                                    <label htmlFor="budget-daily-limit" className="text-sm font-medium text-zinc-400 block">
                                                        Daily Limit (USD)
                                                    </label>
                                                    <input
                                                        id="budget-daily-limit"
                                                        type="number"
                                                        value={editedBudget.dailyLimitUsd ?? ''}
                                                        onChange={(e) =>
                                                            setEditedBudget((b) => ({
                                                                ...b,
                                                                dailyLimitUsd: e.target.value
                                                                    ? parseFloat(e.target.value)
                                                                    : null,
                                                            }))
                                                        }
                                                        placeholder="No limit"
                                                        min="0"
                                                        step="0.01"
                                                        className="w-full px-4 py-2 bg-black/30 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500"
                                                    />
                                                    <p className="text-zinc-600 text-xs">
                                                        Leave empty for no daily limit
                                                    </p>
                                                </div>

                                                <div className="space-y-2">
                                                    <label htmlFor="budget-monthly-limit" className="text-sm font-medium text-zinc-400 block">
                                                        Monthly Limit (USD)
                                                    </label>
                                                    <input
                                                        id="budget-monthly-limit"
                                                        type="number"
                                                        value={editedBudget.monthlyLimitUsd ?? ''}
                                                        onChange={(e) =>
                                                            setEditedBudget((b) => ({
                                                                ...b,
                                                                monthlyLimitUsd: e.target.value
                                                                    ? parseFloat(e.target.value)
                                                                    : null,
                                                            }))
                                                        }
                                                        placeholder="No limit"
                                                        min="0"
                                                        step="0.01"
                                                        className="w-full px-4 py-2 bg-black/30 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500"
                                                    />
                                                    <p className="text-zinc-600 text-xs">
                                                        Leave empty for no monthly limit
                                                    </p>
                                                </div>

                                                <div className="space-y-2 md:col-span-2">
                                                    <div className="flex items-center justify-between">
                                                        <label htmlFor="budget-alert-threshold" className="text-sm font-medium text-zinc-400">
                                                            Alert Threshold
                                                        </label>
                                                        <span className="text-sm text-white font-mono">
                                                            {editedBudget.alertThresholdPercent}%
                                                        </span>
                                                    </div>
                                                    <input
                                                        id="budget-alert-threshold"
                                                        type="range"
                                                        min="50"
                                                        max="100"
                                                        step="5"
                                                        value={editedBudget.alertThresholdPercent}
                                                        onChange={(e) =>
                                                            setEditedBudget((b) => ({
                                                                ...b,
                                                                alertThresholdPercent: parseInt(e.target.value),
                                                            }))
                                                        }
                                                        className="w-full accent-amber-500"
                                                    />
                                                    <p className="text-zinc-600 text-xs">
                                                        Send alert when spend reaches this % of limit
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Actions */}
                                            <div className="flex gap-3 pt-4 border-t border-white/5">
                                                <button
                                                    onClick={() => setEditedBudget(DEFAULT_BUDGET)}
                                                    className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg font-medium transition"
                                                >
                                                    Remove Limits
                                                </button>
                                                <button
                                                    onClick={handleSaveBudget}
                                                    disabled={isSaving}
                                                    className="flex-1 px-4 py-2 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white rounded-lg font-medium transition flex items-center justify-center gap-2"
                                                >
                                                    {isSaving ? (
                                                        <>
                                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                                            Saving...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <span className="material-icons text-sm">save</span>
                                                            Save Budget Settings
                                                        </>
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {/* Context Tab */}
                                    {activeTab === 'context' && (
                                        <div className="p-6 space-y-6">
                                            <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
                                                <h3 className="text-blue-400 font-medium mb-1">Cognee Context</h3>
                                                <p className="text-zinc-400 text-sm">
                                                    Documents added here are processed by Cognee RAG and injected
                                                    into the agent's context window during execution.
                                                </p>
                                            </div>

                                            {/* Add Document */}
                                            <div className="bg-zinc-800/50 rounded-xl p-4 space-y-4">
                                                <h4 className="text-white font-medium text-sm">
                                                    Add Context Document
                                                </h4>
                                                <div className="flex gap-2">
                                                    <input
                                                        aria-label="Document Name"
                                                        type="text"
                                                        value={newDocName}
                                                        onChange={(e) => setNewDocName(e.target.value)}
                                                        placeholder="Document Name (e.g. 'Brand Guidelines')"
                                                        className="flex-1 px-3 py-2 bg-zinc-900 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500"
                                                    />
                                                    <input
                                                        aria-label="File Path or URL"
                                                        type="text"
                                                        value={newDocPath}
                                                        onChange={(e) => setNewDocPath(e.target.value)}
                                                        placeholder="File Path or URL"
                                                        className="flex-1 px-3 py-2 bg-zinc-900 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500"
                                                    />
                                                    <button
                                                        onClick={handleAddDoc}
                                                        disabled={!newDocName}
                                                        className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded-lg font-medium transition"
                                                    >
                                                        Add
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Document List */}
                                            <div className="space-y-2">
                                                {selectedAgent.contextDocs.length === 0 ? (
                                                    <p className="text-center text-zinc-500 py-8">
                                                        No context documents assigned
                                                    </p>
                                                ) : (
                                                    selectedAgent.contextDocs.map((doc: AgentContextDoc) => (
                                                        <div
                                                            key={doc.id}
                                                            className="bg-zinc-900/50 border border-white/5 rounded-xl p-4 flex items-center justify-between group hover:border-white/20 transition"
                                                        >
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center">
                                                                    <span className="material-icons text-zinc-400">
                                                                        description
                                                                    </span>
                                                                </div>
                                                                <div>
                                                                    <p className="text-white font-medium">{doc.name}</p>
                                                                    <p className="text-zinc-500 text-xs">
                                                                        {doc.filePath || 'No path'} &bull; {doc.type}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            <button
                                                                onClick={() => handleRemoveDoc(doc.id)}
                                                                className="opacity-0 group-hover:opacity-100 p-2 text-zinc-400 hover:text-red-400 transition"
                                                                title="Remove Document"
                                                            >
                                                                <span className="material-icons">delete</span>
                                                            </button>
                                                        </div>
                                                    ))
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* History Tab */}
                                    {activeTab === 'history' && (
                                        <div className="p-6 space-y-6">
                                            <div className="bg-zinc-500/10 border border-zinc-500/30 rounded-xl p-4">
                                                <h3 className="text-zinc-300 font-medium mb-1">Version History</h3>
                                                <p className="text-zinc-400 text-sm">
                                                    View and restore previous configurations. Click "Restore" to
                                                    load a previous version into the editor.
                                                </p>
                                            </div>

                                            {/* Version List */}
                                            <div className="space-y-3">
                                                {versionHistory.length === 0 ? (
                                                    <p className="text-center text-zinc-500 py-8">
                                                        No version history available
                                                    </p>
                                                ) : (
                                                    versionHistory.map((version, index) => (
                                                        <div
                                                            key={version.id}
                                                            className={`bg-black/30 border rounded-xl p-4 ${index === 0
                                                                ? 'border-green-500/30'
                                                                : 'border-white/5'
                                                                }`}
                                                        >
                                                            <div className="flex items-start justify-between mb-3">
                                                                <div className="flex items-center gap-3">
                                                                    <div
                                                                        className={`w-10 h-10 rounded-lg flex items-center justify-center ${index === 0
                                                                            ? 'bg-green-500/20'
                                                                            : 'bg-zinc-800'
                                                                            }`}
                                                                    >
                                                                        <span
                                                                            className={`text-lg font-bold ${index === 0
                                                                                ? 'text-green-400'
                                                                                : 'text-zinc-400'
                                                                                }`}
                                                                        >
                                                                            v{version.version}
                                                                        </span>
                                                                    </div>
                                                                    <div>
                                                                        <div className="flex items-center gap-2">
                                                                            <p className="text-white font-medium">
                                                                                Version {version.version}
                                                                            </p>
                                                                            {index === 0 && (
                                                                                <span className="text-[10px] bg-green-500/20 text-green-400 px-2 py-0.5 rounded uppercase font-semibold">
                                                                                    Current
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                        <p className="text-zinc-500 text-xs">
                                                                            {version.changedBy || 'Unknown'} &bull;{' '}
                                                                            {new Date(
                                                                                version.changedAt
                                                                            ).toLocaleDateString()}
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                                {index !== 0 && (
                                                                    <button
                                                                        onClick={() => handleRestoreVersion(version)}
                                                                        className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-white text-sm rounded-lg font-medium transition flex items-center gap-1"
                                                                    >
                                                                        <span className="material-icons text-sm">
                                                                            restore
                                                                        </span>
                                                                        Restore
                                                                    </button>
                                                                )}
                                                            </div>
                                                            {version.changeReason && (
                                                                <p className="text-zinc-400 text-sm bg-black/30 rounded-lg p-2 mb-3">
                                                                    {version.changeReason}
                                                                </p>
                                                            )}
                                                            <div className="grid grid-cols-3 gap-2 text-xs">
                                                                <div className="bg-black/30 rounded-lg p-2">
                                                                    <p className="text-zinc-500">Temperature</p>
                                                                    <p className="text-white font-mono">
                                                                        {version.parameters.temperature}
                                                                    </p>
                                                                </div>
                                                                <div className="bg-black/30 rounded-lg p-2">
                                                                    <p className="text-zinc-500">Max Tokens</p>
                                                                    <p className="text-white font-mono">
                                                                        {version.parameters.maxTokens}
                                                                    </p>
                                                                </div>
                                                                <div className="bg-black/30 rounded-lg p-2">
                                                                    <p className="text-zinc-500">Prompt Length</p>
                                                                    <p className="text-white font-mono">
                                                                        {version.systemPrompt.length} chars
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-12 text-center">
                                    <span className="material-icons text-6xl text-zinc-700 mb-4">smart_toy</span>
                                    <h3 className="text-xl font-bold text-zinc-400 mb-2">Select an Agent</h3>
                                    <p className="text-zinc-500">
                                        Choose an agent from the list to view and edit its configuration
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </AdminLayout>
        </AdminGuard>
    );
}
