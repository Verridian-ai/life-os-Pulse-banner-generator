import React, { useState, useEffect } from 'react';
import { AdminLayout } from '../components/AdminLayout';
import { AdminGuard } from '../components/AdminGuard';
import { listAgents, updateAgent } from '../services/adminApi';
import type { AgentConfig } from '../types';

export function AdminAgents(): React.ReactElement {
    const [agents, setAgents] = useState<AgentConfig[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedAgent, setSelectedAgent] = useState<AgentConfig | null>(null);
    const [editedPrompt, setEditedPrompt] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

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

    const handleSelectAgent = (agent: AgentConfig) => {
        setSelectedAgent(agent);
        setEditedPrompt(agent.systemPrompt || '');
        setError(null);
        setSuccessMessage(null);
    };

    const handleSave = async () => {
        if (!selectedAgent) return;

        try {
            setIsSaving(true);
            setError(null);
            await updateAgent(selectedAgent.id, { systemPrompt: editedPrompt });
            setSuccessMessage('Agent configuration saved');
            loadAgents();
            setTimeout(() => setSuccessMessage(null), 3000);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to save');
        } finally {
            setIsSaving(false);
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
        };
        return colors[agentId] || 'zinc';
    };

    return (
        <AdminGuard>
            <AdminLayout activeSection="agents">
                <div className="space-y-6">
                    {/* Header */}
                    <div>
                        <h1 className="text-3xl font-bold text-white">Agent Configuration</h1>
                        <p className="text-zinc-400 mt-1">Manage AI agent prompts and settings</p>
                    </div>

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
                            <h2 className="text-sm font-bold text-zinc-400 uppercase tracking-wider px-1">
                                Available Agents ({agents.length})
                            </h2>

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
                            ) : (
                                <div className="space-y-2">
                                    {agents.map((agent) => {
                                        const color = getAgentColor(agent.agentId);
                                        const isSelected = selectedAgent?.id === agent.id;

                                        return (
                                            <button
                                                key={agent.id}
                                                onClick={() => handleSelectAgent(agent)}
                                                className={`w-full text-left p-4 rounded-xl border transition-all ${
                                                    isSelected
                                                        ? 'bg-purple-500/20 border-purple-500/50'
                                                        : 'bg-zinc-900/50 border-white/5 hover:border-white/20'
                                                }`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-10 h-10 rounded-lg bg-${color}-500/20 flex items-center justify-center`}>
                                                        <span className={`material-icons text-${color}-400`}>
                                                            {getAgentIcon(agent.agentId)}
                                                        </span>
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-white font-medium truncate">
                                                            {agent.name}
                                                        </p>
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
                            {selectedAgent ? (
                                <div className="bg-zinc-900/50 border border-white/5 rounded-2xl overflow-hidden">
                                    {/* Agent Header */}
                                    <div className="p-6 border-b border-white/5">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-14 h-14 rounded-xl bg-${getAgentColor(selectedAgent.agentId)}-500/20 flex items-center justify-center`}>
                                                <span className={`material-icons text-2xl text-${getAgentColor(selectedAgent.agentId)}-400`}>
                                                    {getAgentIcon(selectedAgent.agentId)}
                                                </span>
                                            </div>
                                            <div>
                                                <h2 className="text-xl font-bold text-white">
                                                    {selectedAgent.name}
                                                </h2>
                                                <p className="text-zinc-400 text-sm">
                                                    {selectedAgent.type} &bull; {selectedAgent.provider || 'Default provider'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Settings */}
                                    <div className="p-6 space-y-6">
                                        {/* Model Settings */}
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                            <div className="bg-black/30 rounded-xl p-4">
                                                <p className="text-zinc-500 text-xs mb-1">Model</p>
                                                <p className="text-white font-medium text-sm truncate">
                                                    {selectedAgent.model || 'Default'}
                                                </p>
                                            </div>
                                            <div className="bg-black/30 rounded-xl p-4">
                                                <p className="text-zinc-500 text-xs mb-1">Provider</p>
                                                <p className="text-white font-medium text-sm">
                                                    {selectedAgent.provider || 'Default'}
                                                </p>
                                            </div>
                                            <div className="bg-black/30 rounded-xl p-4">
                                                <p className="text-zinc-500 text-xs mb-1">Skills</p>
                                                <p className="text-white font-medium text-sm">
                                                    {selectedAgent.skillCount}
                                                </p>
                                            </div>
                                            <div className="bg-black/30 rounded-xl p-4">
                                                <p className="text-zinc-500 text-xs mb-1">MCP Connections</p>
                                                <p className="text-white font-medium text-sm">
                                                    {selectedAgent.mcpConnectionCount}
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
                                            <label className="text-sm font-medium text-zinc-400 mb-2 block">
                                                System Prompt
                                            </label>
                                            <textarea
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
                                                onClick={() => setEditedPrompt(selectedAgent.systemPrompt || '')}
                                                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg font-medium transition"
                                            >
                                                Reset
                                            </button>
                                            <button
                                                onClick={handleSave}
                                                disabled={isSaving || editedPrompt === selectedAgent.systemPrompt}
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
                                </div>
                            ) : (
                                <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-12 text-center">
                                    <span className="material-icons text-6xl text-zinc-700 mb-4">smart_toy</span>
                                    <h3 className="text-xl font-bold text-zinc-400 mb-2">
                                        Select an Agent
                                    </h3>
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
