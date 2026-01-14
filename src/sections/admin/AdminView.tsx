import React, { useState } from 'react';

type AdminTab = 'overview' | 'users' | 'agents' | 'observability' | 'finance';

interface StatCard {
  label: string;
  value: string;
  change: string;
  changeType: 'up' | 'down' | 'neutral';
}

const stats: StatCard[] = [
  { label: 'Active Users', value: '2,847', change: '+12%', changeType: 'up' },
  { label: 'Generations Today', value: '15,432', change: '+8%', changeType: 'up' },
  { label: 'API Cost', value: '$847', change: '-3%', changeType: 'down' },
  { label: 'Error Rate', value: '0.12%', change: '-15%', changeType: 'down' },
];

const recentActivity = [
  { user: 'john@example.com', action: 'Generated 5 images', time: '2 min ago' },
  { user: 'sarah@example.com', action: 'Created new brand', time: '5 min ago' },
  { user: 'mike@example.com', action: 'Signed up', time: '12 min ago' },
  { user: 'lisa@example.com', action: 'Exported design', time: '18 min ago' },
];

const sampleUsers = [
  {
    id: '1',
    email: 'john@example.com',
    name: 'John Doe',
    plan: 'Pro',
    generations: 234,
    lastActive: '2 hours ago',
  },
  {
    id: '2',
    email: 'sarah@example.com',
    name: 'Sarah Smith',
    plan: 'Free',
    generations: 45,
    lastActive: '1 day ago',
  },
  {
    id: '3',
    email: 'mike@example.com',
    name: 'Mike Johnson',
    plan: 'Pro',
    generations: 567,
    lastActive: '5 min ago',
  },
];

// Glass card style helper
const glassCard =
  'bg-white/5 backdrop-blur-xl border border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] rounded-2xl';

// Neumorphic raised effect helper
const neumorphicRaised =
  'shadow-[4px_4px_8px_rgba(0,0,0,0.4),-4px_-4px_8px_rgba(255,255,255,0.05)]';

export function AdminView() {
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'users', label: 'Users' },
    { id: 'agents', label: 'Agents' },
    { id: 'observability', label: 'Observability' },
    { id: 'finance', label: 'Finance' },
  ];

  // Get glow color based on stat type
  const getStatGlow = (label: string) => {
    switch (label) {
      case 'Active Users':
        return 'shadow-[0_0_40px_rgba(20,184,166,0.3)]'; // Teal glow
      case 'Generations Today':
        return 'shadow-[0_0_40px_rgba(56,189,248,0.3)]'; // Sky glow
      case 'API Cost':
        return 'shadow-[0_0_40px_rgba(251,191,36,0.2)]'; // Amber glow
      case 'Error Rate':
        return 'shadow-[0_0_40px_rgba(239,68,68,0.2)]'; // Red glow
      default:
        return '';
    }
  };

  return (
    <div className='min-h-screen bg-zinc-950 p-4 md:p-6 lg:p-8 relative overflow-hidden'>
      {/* Ambient Background Effects */}
      <div className='absolute inset-0 overflow-hidden pointer-events-none'>
        {/* Primary teal gradient orb */}
        <div className='absolute top-20 left-1/4 w-96 h-96 bg-gradient-to-br from-teal-500/20 via-cyan-500/10 to-transparent rounded-full blur-3xl' />
        {/* Secondary sky gradient orb */}
        <div className='absolute bottom-40 right-1/4 w-80 h-80 bg-gradient-to-br from-sky-500/15 via-teal-500/10 to-transparent rounded-full blur-3xl' />
        {/* Subtle accent orb */}
        <div className='absolute top-1/2 right-10 w-64 h-64 bg-gradient-to-br from-cyan-400/10 to-transparent rounded-full blur-2xl' />
      </div>

      <div className='max-w-7xl mx-auto relative z-10'>
        {/* Header */}
        <div className='mb-8'>
          <h1 className="text-2xl md:text-3xl font-bold text-white font-['Space_Grotesk'] bg-gradient-to-r from-sky-500 via-teal-500 to-cyan-400 bg-clip-text text-transparent">
            Admin Dashboard
          </h1>
          <p className='text-zinc-400 mt-1'>Monitor and manage your Signal instance</p>
        </div>

        {/* Tabs - Glass Style */}
        <div className={`${glassCard} p-1 mb-6 inline-flex gap-1 overflow-x-auto`}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type='button'
              onClick={() => setActiveTab(tab.id as AdminTab)}
              className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-sky-500 via-teal-500 to-cyan-400 text-white shadow-[0_0_20px_rgba(20,184,166,0.4)]'
                  : 'text-zinc-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className='space-y-6'>
            {/* Stats Grid - Neumorphic Cards */}
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
              {stats.map((stat) => (
                <div
                  key={stat.label}
                  className={`${glassCard} ${neumorphicRaised} ${getStatGlow(stat.label)} p-6 transition-all duration-300 hover:scale-[1.02]`}
                >
                  <p className='text-sm text-zinc-400 mb-1'>{stat.label}</p>
                  <div className='flex items-end justify-between'>
                    <span className='text-2xl font-bold text-white'>{stat.value}</span>
                    <span
                      className={`text-sm font-medium px-2 py-0.5 rounded-full ${
                        stat.changeType === 'up'
                          ? 'text-green-400 bg-green-500/10'
                          : stat.changeType === 'down' && stat.label === 'Error Rate'
                            ? 'text-green-400 bg-green-500/10'
                            : stat.changeType === 'down'
                              ? 'text-amber-400 bg-amber-500/10'
                              : 'text-zinc-400'
                      }`}
                    >
                      {stat.change}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Charts & Activity - Glass Panels */}
            <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
              {/* Usage Chart */}
              <div className={`${glassCard} p-6`}>
                <h3 className="text-lg font-semibold text-white mb-4 font-['Space_Grotesk']">
                  Usage Over Time
                </h3>
                <div className='h-48 flex items-end gap-2'>
                  {[40, 65, 45, 80, 55, 70, 85, 60, 75, 90, 70, 95].map((height, i) => (
                    <div key={i} className='flex-1 bg-white/5 rounded-t relative group'>
                      <div
                        className='absolute bottom-0 left-0 right-0 bg-gradient-to-t from-sky-500 via-teal-500 to-cyan-400 rounded-t transition-all group-hover:shadow-[0_0_20px_rgba(20,184,166,0.5)]'
                        style={{ height: `${height}%` }}
                      />
                    </div>
                  ))}
                </div>
                <div className='flex justify-between mt-2 text-xs text-zinc-500'>
                  <span>Jan</span>
                  <span>Dec</span>
                </div>
              </div>

              {/* Recent Activity */}
              <div className={`${glassCard} p-6`}>
                <h3 className="text-lg font-semibold text-white mb-4 font-['Space_Grotesk']">
                  Recent Activity
                </h3>
                <div className='space-y-4'>
                  {recentActivity.map((activity, i) => (
                    <div
                      key={i}
                      className='flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 transition-colors'
                    >
                      <div className='w-8 h-8 rounded-full bg-gradient-to-br from-sky-500/30 to-teal-500/30 backdrop-blur-sm border border-white/10 flex items-center justify-center text-xs text-white font-medium'>
                        {activity.user.charAt(0).toUpperCase()}
                      </div>
                      <div className='flex-1 min-w-0'>
                        <p className='text-sm text-white truncate'>{activity.user}</p>
                        <p className='text-xs text-zinc-500'>{activity.action}</p>
                      </div>
                      <span className='text-xs text-zinc-500'>{activity.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className={`${glassCard} overflow-hidden`}>
            {/* Search */}
            <div className='p-4 border-b border-white/10'>
              <div className='relative'>
                <svg
                  className='absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500'
                  fill='none'
                  viewBox='0 0 24 24'
                  stroke='currentColor'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'
                  />
                </svg>
                <input
                  type='text'
                  placeholder='Search users...'
                  className='w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-teal-500/50 focus:shadow-[0_0_20px_rgba(20,184,166,0.2)] transition-all backdrop-blur-sm'
                />
              </div>
            </div>

            {/* Table */}
            <div className='overflow-x-auto'>
              <table className='w-full'>
                <thead>
                  <tr className='border-b border-white/10'>
                    <th className='text-left text-xs text-zinc-500 font-medium p-4'>User</th>
                    <th className='text-left text-xs text-zinc-500 font-medium p-4'>Plan</th>
                    <th className='text-left text-xs text-zinc-500 font-medium p-4'>Generations</th>
                    <th className='text-left text-xs text-zinc-500 font-medium p-4'>Last Active</th>
                    <th className='text-left text-xs text-zinc-500 font-medium p-4'>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sampleUsers.map((user) => (
                    <tr
                      key={user.id}
                      className='border-b border-white/5 hover:bg-white/5 transition-colors'
                    >
                      <td className='p-4'>
                        <div className='flex items-center gap-3'>
                          <div className='w-8 h-8 rounded-full bg-gradient-to-br from-sky-500/30 to-teal-500/30 backdrop-blur-sm border border-white/10 flex items-center justify-center text-xs text-white font-medium'>
                            {user.name.charAt(0)}
                          </div>
                          <div>
                            <p className='text-sm text-white'>{user.name}</p>
                            <p className='text-xs text-zinc-500'>{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className='p-4'>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            user.plan === 'Pro'
                              ? 'bg-gradient-to-r from-sky-500/20 to-teal-500/20 text-teal-400 border border-teal-500/30'
                              : 'bg-white/5 text-zinc-400 border border-white/10'
                          }`}
                        >
                          {user.plan}
                        </span>
                      </td>
                      <td className='p-4 text-sm text-white'>{user.generations}</td>
                      <td className='p-4 text-sm text-zinc-400'>{user.lastActive}</td>
                      <td className='p-4'>
                        <button
                          type='button'
                          className='text-sm text-teal-400 hover:text-teal-300 transition-colors'
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Agents Tab */}
        {activeTab === 'agents' && (
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
            {[
              { name: 'Image Generation', status: 'healthy', requests: '12.4K', latency: '2.3s' },
              { name: 'Voice Agent', status: 'healthy', requests: '3.2K', latency: '0.8s' },
              { name: 'Background Removal', status: 'degraded', requests: '5.1K', latency: '4.2s' },
              { name: 'Upscaling', status: 'healthy', requests: '2.8K', latency: '3.1s' },
              { name: 'Prompt Enhancement', status: 'healthy', requests: '8.9K', latency: '0.5s' },
            ].map((agent) => (
              <div
                key={agent.name}
                className={`${glassCard} ${neumorphicRaised} p-6 transition-all duration-300 hover:scale-[1.02] ${
                  agent.status === 'healthy'
                    ? 'hover:shadow-[0_0_30px_rgba(34,197,94,0.2)]'
                    : 'hover:shadow-[0_0_30px_rgba(251,191,36,0.2)]'
                }`}
              >
                <div className='flex items-center justify-between mb-4'>
                  <h3 className='text-sm font-medium text-white'>{agent.name}</h3>
                  <span
                    className={`w-3 h-3 rounded-full ${
                      agent.status === 'healthy'
                        ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]'
                        : 'bg-amber-500 shadow-[0_0_10px_rgba(251,191,36,0.5)]'
                    }`}
                  />
                </div>
                <div className='grid grid-cols-2 gap-4'>
                  <div className='p-3 rounded-xl bg-white/5 border border-white/5'>
                    <p className='text-xs text-zinc-500'>Requests (24h)</p>
                    <p className='text-lg font-semibold text-white'>{agent.requests}</p>
                  </div>
                  <div className='p-3 rounded-xl bg-white/5 border border-white/5'>
                    <p className='text-xs text-zinc-500'>Avg Latency</p>
                    <p className='text-lg font-semibold text-white'>{agent.latency}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Observability Tab */}
        {activeTab === 'observability' && (
          <div className='space-y-6'>
            <div className={`${glassCard} p-6`}>
              <h3 className="text-lg font-semibold text-white mb-4 font-['Space_Grotesk']">
                Recent Logs
              </h3>
              <div className='space-y-2 font-mono text-sm'>
                {[
                  {
                    level: 'info',
                    message: '[2024-01-15 10:23:45] User john@example.com generated image',
                    time: '2 min ago',
                  },
                  {
                    level: 'warn',
                    message: '[2024-01-15 10:22:12] High latency detected on image generation',
                    time: '3 min ago',
                  },
                  {
                    level: 'info',
                    message: '[2024-01-15 10:21:00] New user signup: mike@example.com',
                    time: '4 min ago',
                  },
                  {
                    level: 'error',
                    message: '[2024-01-15 10:20:30] Replicate API rate limit exceeded',
                    time: '5 min ago',
                  },
                ].map((log, i) => (
                  <div
                    key={i}
                    className={`p-3 rounded-xl border transition-all ${
                      log.level === 'error'
                        ? 'bg-red-500/10 border-red-500/20 shadow-[inset_0_0_20px_rgba(239,68,68,0.1)]'
                        : log.level === 'warn'
                          ? 'bg-amber-500/10 border-amber-500/20 shadow-[inset_0_0_20px_rgba(251,191,36,0.1)]'
                          : 'bg-white/5 border-white/5'
                    }`}
                  >
                    <span
                      className={`${
                        log.level === 'error'
                          ? 'text-red-400'
                          : log.level === 'warn'
                            ? 'text-amber-400'
                            : 'text-zinc-400'
                      }`}
                    >
                      {log.message}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Finance Tab */}
        {activeTab === 'finance' && (
          <div className='space-y-6'>
            <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
              {/* Revenue Card */}
              <div
                className={`${glassCard} ${neumorphicRaised} p-6 shadow-[0_0_40px_rgba(34,197,94,0.15)]`}
              >
                <p className='text-sm text-zinc-400 mb-1'>Monthly Revenue</p>
                <p className='text-2xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent'>
                  $12,847
                </p>
                <p className='text-sm text-green-400 mt-2 flex items-center gap-1'>
                  <svg className='w-4 h-4' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M5 10l7-7m0 0l7 7m-7-7v18'
                    />
                  </svg>
                  +18% from last month
                </p>
              </div>
              {/* API Costs Card */}
              <div
                className={`${glassCard} ${neumorphicRaised} p-6 shadow-[0_0_40px_rgba(251,191,36,0.15)]`}
              >
                <p className='text-sm text-zinc-400 mb-1'>API Costs</p>
                <p className='text-2xl font-bold bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent'>
                  $2,341
                </p>
                <p className='text-sm text-amber-400 mt-2 flex items-center gap-1'>
                  <svg className='w-4 h-4' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M5 10l7-7m0 0l7 7m-7-7v18'
                    />
                  </svg>
                  +5% from last month
                </p>
              </div>
              {/* Net Margin Card */}
              <div
                className={`${glassCard} ${neumorphicRaised} p-6 shadow-[0_0_40px_rgba(20,184,166,0.2)]`}
              >
                <p className='text-sm text-zinc-400 mb-1'>Net Margin</p>
                <p className='text-2xl font-bold bg-gradient-to-r from-sky-500 via-teal-500 to-cyan-400 bg-clip-text text-transparent'>
                  $10,506
                </p>
                <p className='text-sm text-teal-400 mt-2 flex items-center gap-1'>
                  <svg className='w-4 h-4' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M5 10l7-7m0 0l7 7m-7-7v18'
                    />
                  </svg>
                  +21% from last month
                </p>
              </div>
            </div>

            <div className={`${glassCard} p-6`}>
              <h3 className="text-lg font-semibold text-white mb-4 font-['Space_Grotesk']">
                Cost Breakdown by Model
              </h3>
              <div className='space-y-4'>
                {[
                  {
                    model: 'GPT-4 Vision',
                    cost: '$890',
                    percentage: 38,
                    color: 'from-sky-500 to-cyan-400',
                  },
                  {
                    model: 'DALL-E 3',
                    cost: '$654',
                    percentage: 28,
                    color: 'from-teal-500 to-emerald-400',
                  },
                  {
                    model: 'Replicate (SDXL)',
                    cost: '$432',
                    percentage: 18,
                    color: 'from-violet-500 to-purple-400',
                  },
                  {
                    model: 'Whisper',
                    cost: '$234',
                    percentage: 10,
                    color: 'from-amber-500 to-orange-400',
                  },
                  {
                    model: 'Other',
                    cost: '$131',
                    percentage: 6,
                    color: 'from-zinc-500 to-zinc-400',
                  },
                ].map((item) => (
                  <div key={item.model}>
                    <div className='flex items-center justify-between mb-2'>
                      <span className='text-sm text-white'>{item.model}</span>
                      <span className='text-sm text-zinc-400'>{item.cost}</span>
                    </div>
                    <div className='h-2 bg-white/5 rounded-full overflow-hidden border border-white/5'>
                      <div
                        className={`h-full bg-gradient-to-r ${item.color} rounded-full transition-all`}
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminView;
