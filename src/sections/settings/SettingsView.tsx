import React, { useState } from 'react';

type SettingsTab = 'account' | 'api' | 'appearance' | 'shortcuts' | 'notifications';

export function SettingsView() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('account');
  const [theme, setTheme] = useState<'dark' | 'light' | 'system'>('dark');

  const tabs = [
    { id: 'account', label: 'Account', icon: '👤' },
    { id: 'api', label: 'API Keys', icon: '🔑' },
    { id: 'appearance', label: 'Appearance', icon: '🎨' },
    { id: 'shortcuts', label: 'Shortcuts', icon: '⌨️' },
    { id: 'notifications', label: 'Notifications', icon: '🔔' },
  ];

  return (
    <div className='min-h-screen bg-zinc-950 p-4 md:p-6 lg:p-8 relative overflow-hidden'>
      {/* Ambient Background Effects */}
      <div className='absolute inset-0 overflow-hidden pointer-events-none'>
        <div className='absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-gradient-to-br from-teal-500/20 via-cyan-500/10 to-transparent rounded-full blur-3xl' />
        <div className='absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-gradient-to-tl from-sky-500/15 via-teal-500/10 to-transparent rounded-full blur-3xl' />
        <div className='absolute top-[40%] right-[20%] w-[300px] h-[300px] bg-gradient-to-br from-cyan-400/10 to-transparent rounded-full blur-2xl' />
      </div>

      <div className='max-w-4xl mx-auto relative z-10'>
        {/* Header */}
        <div className='mb-8'>
          <h1 className="text-2xl md:text-3xl font-bold text-white font-['Space_Grotesk'] drop-shadow-lg">
            Settings
          </h1>
          <p className='text-zinc-400 mt-1'>Manage your account and preferences</p>
        </div>

        <div className='flex flex-col md:flex-row gap-6'>
          {/* Sidebar Tabs - Glass Panel */}
          <nav className='md:w-48 flex md:flex-col gap-1 overflow-x-auto md:overflow-visible pb-2 md:pb-0 bg-white/5 backdrop-blur-xl border border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] rounded-2xl p-2'>
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type='button'
                onClick={() => setActiveTab(tab.id as SettingsTab)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-300 ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-sky-500/20 via-teal-500/20 to-cyan-400/20 text-white shadow-[0_0_20px_rgba(20,184,166,0.2)] border border-white/10'
                    : 'text-zinc-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>

          {/* Content - Glass Card with Neumorphic Shadow */}
          <div className='flex-1 bg-white/5 backdrop-blur-xl border border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1),4px_4px_8px_rgba(0,0,0,0.4),-4px_-4px_8px_rgba(255,255,255,0.05)] rounded-2xl p-6'>
            {/* Account Tab */}
            {activeTab === 'account' && (
              <div className='space-y-6'>
                <h2 className="text-lg font-semibold text-white font-['Space_Grotesk']">
                  Account Settings
                </h2>

                <div className='flex items-center gap-4'>
                  <div className='w-16 h-16 rounded-full bg-gradient-to-br from-sky-500 via-teal-500 to-cyan-400 shadow-[0_0_40px_rgba(20,184,166,0.3)]' />
                  <button
                    type='button'
                    className='px-4 py-2 bg-white/5 backdrop-blur-xl border border-white/10 hover:bg-white/10 text-white rounded-xl text-sm transition-all duration-300 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]'
                  >
                    Change Avatar
                  </button>
                </div>

                <div className='space-y-4'>
                  <div>
                    <label className='text-sm text-zinc-400 block mb-2'>Full Name</label>
                    <input
                      type='text'
                      defaultValue='John Doe'
                      className='w-full px-4 py-3 bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-teal-500/50 focus:shadow-[0_0_20px_rgba(20,184,166,0.2)] transition-all duration-300 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]'
                    />
                  </div>
                  <div>
                    <label className='text-sm text-zinc-400 block mb-2'>Email</label>
                    <input
                      type='email'
                      defaultValue='john@example.com'
                      className='w-full px-4 py-3 bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-teal-500/50 focus:shadow-[0_0_20px_rgba(20,184,166,0.2)] transition-all duration-300 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]'
                    />
                  </div>
                </div>

                <hr className='border-white/10' />

                <div>
                  <h3 className='text-sm font-medium text-red-400 mb-2'>Danger Zone</h3>
                  <button
                    type='button'
                    className='px-4 py-2 bg-red-500/10 backdrop-blur-xl border border-red-500/30 hover:bg-red-500/20 text-red-400 rounded-xl text-sm transition-all duration-300 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]'
                  >
                    Delete Account
                  </button>
                </div>
              </div>
            )}

            {/* API Keys Tab */}
            {activeTab === 'api' && (
              <div className='space-y-6'>
                <h2 className="text-lg font-semibold text-white font-['Space_Grotesk']">
                  API Keys
                </h2>
                <p className='text-sm text-zinc-400'>
                  Configure your AI provider API keys for image generation
                </p>

                <div className='space-y-4'>
                  {[
                    { id: 'openai', name: 'OpenAI', status: 'connected' },
                    { id: 'replicate', name: 'Replicate', status: 'not_connected' },
                    { id: 'openrouter', name: 'OpenRouter', status: 'connected' },
                    { id: 'google', name: 'Google Gemini', status: 'not_connected' },
                  ].map((api) => (
                    <div
                      key={api.id}
                      className='flex items-center justify-between p-4 bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.1),4px_4px_8px_rgba(0,0,0,0.4),-4px_-4px_8px_rgba(255,255,255,0.05)] transition-all duration-300 hover:bg-white/10'
                    >
                      <div className='flex items-center gap-3'>
                        <div
                          className={`w-2 h-2 rounded-full ${
                            api.status === 'connected'
                              ? 'bg-teal-400 shadow-[0_0_10px_rgba(20,184,166,0.5)]'
                              : 'bg-zinc-600'
                          }`}
                        />
                        <span className='text-sm text-white'>{api.name}</span>
                      </div>
                      <button
                        type='button'
                        className='px-4 py-2 bg-white/5 backdrop-blur-xl border border-white/10 hover:bg-white/10 text-white rounded-xl text-sm transition-all duration-300 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]'
                      >
                        {api.status === 'connected' ? 'Update' : 'Configure'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Appearance Tab */}
            {activeTab === 'appearance' && (
              <div className='space-y-6'>
                <h2 className="text-lg font-semibold text-white font-['Space_Grotesk']">
                  Appearance
                </h2>

                <div>
                  <label className='text-sm text-zinc-400 block mb-3'>Theme</label>
                  <div className='flex gap-3'>
                    {[
                      { id: 'dark', label: 'Dark' },
                      { id: 'light', label: 'Light' },
                      { id: 'system', label: 'System' },
                    ].map((t) => (
                      <button
                        key={t.id}
                        type='button'
                        onClick={() => setTheme(t.id as typeof theme)}
                        className={`flex-1 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
                          theme === t.id
                            ? 'bg-gradient-to-r from-sky-500 via-teal-500 to-cyan-400 text-white shadow-[0_0_40px_rgba(20,184,166,0.3)]'
                            : 'bg-white/5 backdrop-blur-xl border border-white/10 text-zinc-400 hover:text-white hover:bg-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]'
                        }`}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className='text-sm text-zinc-400 block mb-3'>Reduced Motion</label>
                  <div className='flex items-center justify-between p-4 bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.1),4px_4px_8px_rgba(0,0,0,0.4),-4px_-4px_8px_rgba(255,255,255,0.05)]'>
                    <span className='text-sm text-white'>Reduce animations</span>
                    <button
                      type='button'
                      className='w-12 h-6 bg-white/10 backdrop-blur-xl border border-white/10 rounded-full relative shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]'
                    >
                      <div className='w-5 h-5 bg-zinc-400 rounded-full absolute left-0.5 top-0.5 shadow-[2px_2px_4px_rgba(0,0,0,0.3)]' />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Shortcuts Tab */}
            {activeTab === 'shortcuts' && (
              <div className='space-y-6'>
                <h2 className="text-lg font-semibold text-white font-['Space_Grotesk']">
                  Keyboard Shortcuts
                </h2>

                <div className='space-y-2'>
                  {[
                    { action: 'Generate Image', shortcut: '⌘ + G' },
                    { action: 'Undo', shortcut: '⌘ + Z' },
                    { action: 'Redo', shortcut: '⌘ + Shift + Z' },
                    { action: 'Save', shortcut: '⌘ + S' },
                    { action: 'Export', shortcut: '⌘ + E' },
                    { action: 'Voice Mode', shortcut: '⌘ + V' },
                  ].map((item) => (
                    <div
                      key={item.action}
                      className='flex items-center justify-between p-3 bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] hover:bg-white/10 transition-all duration-300'
                    >
                      <span className='text-sm text-white'>{item.action}</span>
                      <kbd className='px-3 py-1.5 bg-white/10 backdrop-blur-xl border border-white/10 rounded-lg text-xs text-zinc-300 font-mono shadow-[inset_0_1px_1px_rgba(255,255,255,0.1),2px_2px_4px_rgba(0,0,0,0.3)]'>
                        {item.shortcut}
                      </kbd>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <div className='space-y-6'>
                <h2 className="text-lg font-semibold text-white font-['Space_Grotesk']">
                  Notifications
                </h2>

                <div className='space-y-4'>
                  {[
                    {
                      id: 'email',
                      label: 'Email Notifications',
                      description: 'Receive updates via email',
                      enabled: true,
                    },
                    {
                      id: 'marketing',
                      label: 'Marketing',
                      description: 'News and product updates',
                      enabled: false,
                    },
                    {
                      id: 'tips',
                      label: 'Tips & Tutorials',
                      description: 'Get design tips and tricks',
                      enabled: true,
                    },
                  ].map((notification) => (
                    <div
                      key={notification.id}
                      className='flex items-center justify-between p-4 bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.1),4px_4px_8px_rgba(0,0,0,0.4),-4px_-4px_8px_rgba(255,255,255,0.05)] transition-all duration-300 hover:bg-white/10'
                    >
                      <div>
                        <p className='text-sm text-white'>{notification.label}</p>
                        <p className='text-xs text-zinc-500'>{notification.description}</p>
                      </div>
                      <button
                        type='button'
                        className={`w-12 h-6 rounded-full relative transition-all duration-300 backdrop-blur-xl border border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] ${
                          notification.enabled
                            ? 'bg-gradient-to-r from-sky-500 via-teal-500 to-cyan-400 shadow-[0_0_20px_rgba(20,184,166,0.3)]'
                            : 'bg-white/10'
                        }`}
                      >
                        <div
                          className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all duration-300 shadow-[2px_2px_4px_rgba(0,0,0,0.3)] ${
                            notification.enabled ? 'right-0.5' : 'left-0.5'
                          }`}
                        />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Save Button */}
            <div className='mt-8 pt-6 border-t border-white/10'>
              <button
                type='button'
                className='w-full py-3 bg-gradient-to-r from-sky-500 via-teal-500 to-cyan-400 text-white font-semibold rounded-xl hover:from-sky-400 hover:via-teal-400 hover:to-cyan-300 transition-all duration-300 shadow-[0_0_40px_rgba(20,184,166,0.3),4px_4px_8px_rgba(0,0,0,0.4),-4px_-4px_8px_rgba(255,255,255,0.05)]'
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SettingsView;
