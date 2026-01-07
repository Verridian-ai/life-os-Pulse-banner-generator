import React, { useState, useEffect } from 'react';
import { AdminLayout } from '../components/AdminLayout';
import { AdminGuard } from '../components/AdminGuard';
import { getDashboardStats } from '../services/adminApi';
import type { DashboardStats } from '../types';

export function AdminDashboard(): React.ReactElement {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        getDashboardStats()
            .then(setStats)
            .catch(console.error)
            .finally(() => setIsLoading(false));
    }, []);

    return (
        <AdminGuard>
            <AdminLayout activeSection="dashboard">
                <div className="space-y-8">
                    {/* Header */}
                    <div>
                        <h1 className="text-3xl font-bold text-white">Dashboard</h1>
                        <p className="text-zinc-400 mt-1">Overview of your admin panel</p>
                    </div>

                    {/* Stats Grid */}
                    {isLoading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {[...Array(4)].map((_, i) => (
                                <div
                                    key={i}
                                    className="bg-zinc-900/50 border border-white/5 rounded-2xl p-6 animate-pulse"
                                >
                                    <div className="h-4 bg-zinc-800 rounded w-20 mb-3"></div>
                                    <div className="h-8 bg-zinc-800 rounded w-16"></div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <StatCard
                                label="Total Users"
                                value={stats?.users.total ?? 0}
                                icon="people"
                                color="purple"
                            />
                            <StatCard
                                label="Admins"
                                value={stats?.users.admins ?? 0}
                                icon="admin_panel_settings"
                                color="blue"
                            />
                            <StatCard
                                label="Agents"
                                value={stats?.agents.total ?? 0}
                                icon="smart_toy"
                                color="green"
                            />
                            <StatCard
                                label="Today's Requests"
                                value={stats?.today.totalRequests ?? 0}
                                icon="trending_up"
                                color="amber"
                            />
                        </div>
                    )}

                    {/* Today's Activity */}
                    {stats && (
                        <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-6">
                            <h2 className="text-xl font-bold text-white mb-4">Today's Activity</h2>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                <div>
                                    <p className="text-zinc-500 text-sm">LLM Calls</p>
                                    <p className="text-2xl font-bold text-white">
                                        {stats.today.totalLlmCalls.toLocaleString()}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-zinc-500 text-sm">Tokens Used</p>
                                    <p className="text-2xl font-bold text-white">
                                        {stats.today.totalTokens.toLocaleString()}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-zinc-500 text-sm">Unique Users</p>
                                    <p className="text-2xl font-bold text-white">
                                        {stats.today.uniqueUsers.toLocaleString()}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-zinc-500 text-sm">Errors</p>
                                    <p className={`text-2xl font-bold ${
                                        stats.today.errorCount > 0 ? 'text-red-400' : 'text-green-400'
                                    }`}>
                                        {stats.today.errorCount}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Quick Links */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <QuickLink
                            href="/admin/users"
                            icon="people"
                            title="Manage Users"
                            description="View, edit, and manage user accounts"
                        />
                        <QuickLink
                            href="/admin/agents"
                            icon="smart_toy"
                            title="Configure Agents"
                            description="Edit agent prompts and settings"
                        />
                        <QuickLink
                            href="/admin/observability"
                            icon="insights"
                            title="Observability"
                            description="View traces, metrics, and logs"
                        />
                    </div>
                </div>
            </AdminLayout>
        </AdminGuard>
    );
}

function StatCard({
    label,
    value,
    icon,
    color,
}: {
    label: string;
    value: number;
    icon: string;
    color: 'purple' | 'blue' | 'green' | 'amber';
}): React.ReactElement {
    const colors = {
        purple: 'from-purple-600/20 to-purple-600/5 border-purple-500/20',
        blue: 'from-blue-600/20 to-blue-600/5 border-blue-500/20',
        green: 'from-green-600/20 to-green-600/5 border-green-500/20',
        amber: 'from-amber-600/20 to-amber-600/5 border-amber-500/20',
    };

    const iconColors = {
        purple: 'text-purple-400',
        blue: 'text-blue-400',
        green: 'text-green-400',
        amber: 'text-amber-400',
    };

    return (
        <div
            className={`bg-gradient-to-br ${colors[color]} border rounded-2xl p-6`}
        >
            <div className="flex items-center justify-between mb-3">
                <span className="text-zinc-400 text-sm font-medium">{label}</span>
                <span className={`material-icons ${iconColors[color]}`}>{icon}</span>
            </div>
            <p className="text-3xl font-bold text-white">{value.toLocaleString()}</p>
        </div>
    );
}

function QuickLink({
    href,
    icon,
    title,
    description,
}: {
    href: string;
    icon: string;
    title: string;
    description: string;
}): React.ReactElement {
    return (
        <a
            href={href}
            className="block bg-zinc-900/50 border border-white/5 hover:border-purple-500/30 rounded-2xl p-6 transition group"
        >
            <div className="flex items-center gap-4 mb-3">
                <div className="w-12 h-12 bg-purple-600/20 rounded-xl flex items-center justify-center group-hover:bg-purple-600/30 transition">
                    <span className="material-icons text-purple-400">{icon}</span>
                </div>
                <h3 className="text-lg font-bold text-white">{title}</h3>
            </div>
            <p className="text-zinc-400 text-sm">{description}</p>
        </a>
    );
}
