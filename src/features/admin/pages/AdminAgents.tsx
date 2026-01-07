import React, { useState, useEffect } from 'react';
import { AdminLayout } from '../components/AdminLayout';
import { AdminGuard } from '../components/AdminGuard';
import { listAgents, updateAgent, getAgentDetail, addAgentContextDoc, removeAgentContextDoc } from '../services/adminApi';
import type { AgentConfig } from '../types';

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

export function AdminAgents(): React.ReactElement {
    const [agents, setAgents] = useState<AgentConfig[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedAgent, setSelectedAgent] = useState<AgentDetail | null>(null);
    const [isDetailLoading, setIsDetailLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<'config' | 'context'>('config');

    const [editedPrompt, setEditedPrompt] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Context Doc State
    const [newDocName, setNewDocName] = useState('');
    const [newDocPath, setNewDocPath] = useState('');

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
            const detail = await getAgentDetail(agent.agentId) as unknown as AgentDetail;
            // Asserting type until adminApi types are fully tightened
            setSelectedAgent(detail);
            setEditedPrompt(detail.agent.systemPrompt || '');
            setError(null);
            setSuccessMessage(null);
            setActiveTab('config');
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
            await updateAgent(selectedAgent.agent.id, { systemPrompt: editedPrompt });
            setSuccessMessage('Agent configuration saved');

            // Refresh details
            const updated = await getAgentDetail(selectedAgent.agent.agentId) as unknown as AgentDetail;
            setSelectedAgent(updated);

            loadAgents(); // Refresh list just in case
            setTimeout(() => setSuccessMessage(null), 3000);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to save');
        } finally {
            setIsSaving(false);
        }
    };

    const handleAddDoc = async () => {
        if (!selectedAgent || !newDocName) return;
        try {
            await addAgentContextDoc(selectedAgent.agent.agentId, {
                name: newDocName,
                type: 'reference', // default
                filePath: newDocPath,
                metadata: { source: 'admin_ui' }
            });
            // Refresh
            const updated = await getAgentDetail(selectedAgent.agent.agentId) as unknown as AgentDetail;
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
            // Refresh
            const updated = await getAgentDetail(selectedAgent.agent.agentId) as unknown as AgentDetail;
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
                        <p className="text-zinc-400 mt-1">Manage AI agent prompts, knowledge, and settings</p>
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
                                        const isSelected = selectedAgent?.agent.id === agent.id;

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
                            {isDetailLoading ? (
                                <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-12 text-center">
                                    <span className="material-icons text-4xl text-purple-500 animate-spin mb-4">sync</span>
                                    <p className="text-zinc-400">Loading agent details...</p>
                                </div>
                            ) : selectedAgent ? (
                                <div className="bg-zinc-900/50 border border-white/5 rounded-2xl overflow-hidden">
                                    {/* Agent Header */}
                                    <div className="p-6 border-b border-white/5">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className={`w-14 h-14 rounded-xl bg-${getAgentColor(selectedAgent.agent.agentId)}-500/20 flex items-center justify-center`}>
                                                    <span className={`material-icons text-2xl text-${getAgentColor(selectedAgent.agent.agentId)}-400`}>
                                                        {getAgentIcon(selectedAgent.agent.agentId)}
                                                    </span>
                                                </div>
                                                <div>
                                                    <h2 className="text-xl font-bold text-white">
                                                        {selectedAgent.agent.name}
                                                    </h2>
                                                    <p className="text-zinc-400 text-sm">
                                                        {selectedAgent.agent.type} &bull; {selectedAgent.agent.provider || 'Default provider'}
                                                    </p>
                                                </div>
                                            </div>
                                            {/* Tabs */}
                                            <div className="flex gap-1 bg-black/30 rounded-lg p-1">
                                                <button
                                                    onClick={() => setActiveTab('config')}
                                                    className={`px-4 py-2 text-sm font-medium rounded-md transition ${activeTab === 'config' ? 'bg-zinc-700 text-white shadow-sm' : 'text-zinc-400 hover:text-white'}`}
                                                >
                                                    Configuration
                                                </button>
                                                <button
                                                    onClick={() => setActiveTab('context')}
                                                    className={`px-4 py-2 text-sm font-medium rounded-md transition ${activeTab === 'context' ? 'bg-zinc-700 text-white shadow-sm' : 'text-zinc-400 hover:text-white'}`}
                                                >
                                                    Context ({selectedAgent.contextDocs.length})
                                                </button>
                                            </div>
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
                                                    onClick={() => setEditedPrompt(selectedAgent.agent.systemPrompt || '')}
                                                    className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg font-medium transition"
                                                >
                                                    Reset
                                                </button>
                                                <button
                                                    onClick={handleSave}
                                                    disabled={isSaving || editedPrompt === selectedAgent.agent.systemPrompt}
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

                                    {/* Context Tab */}
                                    {activeTab === 'context' && (
                                        <div className="p-6 space-y-6">
                                            <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
                                                <h3 className="text-blue-400 font-medium mb-1">Cognee Context</h3>
                                                <p className="text-zinc-400 text-sm">
                                                    Documents added here are processed by Cognee RAG and injected into the agent's context window during execution.
                                                </p>
                                            </div>

                                            {/* Add Document */}
                                            <div className="bg-zinc-800/50 rounded-xl p-4 space-y-4">
                                                <h4 className="text-white font-medium text-sm">Add Context Document</h4>
                                                <div className="flex gap-2">
                                                    <input
                                                        type="text"
                                                        value={newDocName}
                                                        onChange={(e) => setNewDocName(e.target.value)}
                                                        placeholder="Document Name (e.g. 'Brand Guidelines')"
                                                        className="flex-1 px-3 py-2 bg-zinc-900 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500"
                                                    />
                                                    <input
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
                                                    <p className="text-center text-zinc-500 py-8">No context documents assigned</p>
                                                ) : (
                                                    selectedAgent.contextDocs.map((doc: AgentContextDoc) => (
                                                        <div key={doc.id} className="bg-zinc-900/50 border border-white/5 rounded-xl p-4 flex items-center justify-between group hover:border-white/20 transition">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center">
                                                                    <span className="material-icons text-zinc-400">description</span>
                                                                </div>
                                                                <div>
                                                                    <p className="text-white font-medium">{doc.name}</p>
                                                                    <p className="text-zinc-500 text-xs">{doc.filePath || 'No path'} &bull; {doc.type}</p>
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
