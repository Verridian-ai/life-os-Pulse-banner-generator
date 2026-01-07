import React, { useState } from 'react';
import { useAdminAuth } from '../hooks/useAdminAuth';

type AdminLayoutProps = {
    children: React.ReactNode;
    activeSection?: string;
};

type NavItem = {
    id: string;
    label: string;
    icon: string;
    href: string;
    permission?: 'user_management' | 'agent_configuration' | 'audit_log_access' | 'system_settings' | 'observability_config';
};

const navItems: NavItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: 'dashboard', href: '/admin' },
    { id: 'users', label: 'Users', icon: 'people', href: '/admin/users', permission: 'user_management' },
    { id: 'agents', label: 'Agents', icon: 'smart_toy', href: '/admin/agents', permission: 'agent_configuration' },
    { id: 'observability', label: 'Observability', icon: 'insights', href: '/admin/observability', permission: 'audit_log_access' },
    { id: 'audit', label: 'Audit Logs', icon: 'history', href: '/admin/audit', permission: 'audit_log_access' },
];

export function AdminLayout({ children, activeSection = 'dashboard' }: AdminLayoutProps): React.ReactElement {
    const { role, hasPermission } = useAdminAuth();
    const [sidebarOpen, setSidebarOpen] = useState(true);

    const filteredNavItems = navItems.filter(
        (item) => !item.permission || hasPermission(item.permission)
    );

    return (
        <div className="min-h-screen bg-black flex">
            {/* Sidebar */}
            <aside
                className={`${
                    sidebarOpen ? 'w-64' : 'w-20'
                } bg-zinc-900/50 border-r border-white/5 flex flex-col transition-all duration-300`}
            >
                {/* Logo */}
                <div className="p-4 border-b border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl flex items-center justify-center">
                            <span className="material-icons text-white text-xl">admin_panel_settings</span>
                        </div>
                        {sidebarOpen && (
                            <div>
                                <h1 className="text-white font-bold text-sm">Admin</h1>
                                <p className="text-zinc-500 text-xs capitalize">{role}</p>
                            </div>
                        )}
                    </div>
                    <button
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="w-8 h-8 rounded-lg bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center text-zinc-400 hover:text-white transition"
                    >
                        <span className="material-icons text-lg">
                            {sidebarOpen ? 'chevron_left' : 'chevron_right'}
                        </span>
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-3 space-y-1">
                    {filteredNavItems.map((item) => {
                        const isActive = activeSection === item.id;
                        return (
                            <a
                                key={item.id}
                                href={item.href}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition ${
                                    isActive
                                        ? 'bg-gradient-to-r from-purple-600/20 to-blue-600/20 text-white border border-purple-500/30'
                                        : 'text-zinc-400 hover:text-white hover:bg-white/5'
                                }`}
                            >
                                <span className="material-icons text-xl">{item.icon}</span>
                                {sidebarOpen && (
                                    <span className="text-sm font-medium">{item.label}</span>
                                )}
                            </a>
                        );
                    })}
                </nav>

                {/* Footer */}
                <div className="p-3 border-t border-white/5">
                    <a
                        href="/"
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-zinc-400 hover:text-white hover:bg-white/5 transition"
                    >
                        <span className="material-icons text-xl">arrow_back</span>
                        {sidebarOpen && <span className="text-sm font-medium">Back to App</span>}
                    </a>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-auto">
                <div className="p-6 lg:p-8">{children}</div>
            </main>
        </div>
    );
}
