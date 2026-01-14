import { AppShell } from './components/AppShell';
import {
  LayoutDashboard,
  FolderOpen,
  Palette,
  Sparkles,
  Linkedin,
  Youtube,
  Instagram,
  Facebook,
} from 'lucide-react';

// Platform card component for the dashboard preview
function PlatformCard({
  name,
  icon: Icon,
  color,
  description,
}: {
  name: string;
  icon: React.ElementType;
  color: string;
  description: string;
}) {
  return (
    <button
      type='button'
      className={`aspect-[4/5] bg-zinc-900 border border-white/5 rounded-2xl p-4 flex flex-col items-start justify-end group hover:border-${color}/50 transition relative overflow-hidden`}
    >
      <div className='absolute inset-0 bg-gradient-to-b from-transparent to-black/80' />
      <div className='relative z-10'>
        <div
          className={`w-10 h-10 rounded-full bg-${color}/20 backdrop-blur border border-${color}/30 flex items-center justify-center mb-3`}
        >
          <Icon className={`w-5 h-5 text-${color}`} />
        </div>
        <span className='text-sm font-bold text-white'>{name}</span>
        <span className='text-[10px] text-zinc-400 block'>{description}</span>
      </div>
    </button>
  );
}

export default function ShellPreview() {
  const navigationItems = [
    {
      label: 'Dashboard',
      href: '/dashboard',
      icon: <LayoutDashboard className='w-5 h-5' />,
      isActive: true,
    },
    {
      label: 'Projects',
      href: '/projects',
      icon: <FolderOpen className='w-5 h-5' />,
    },
    {
      label: 'Templates',
      href: '/templates',
      icon: <Sparkles className='w-5 h-5' />,
    },
    {
      label: 'Brand Kit',
      href: '/brand-kit',
      icon: <Palette className='w-5 h-5' />,
    },
  ];

  const user = {
    name: 'Alex Morgan',
    avatarUrl: undefined,
  };

  return (
    <AppShell
      navigationItems={navigationItems}
      user={user}
      onNavigate={(href) => console.log('Navigate to:', href)}
      onLogout={() => console.log('Logout')}
      onCreateNew={() => console.log('Create new design')}
    >
      <div className='px-4 lg:px-8 py-8 max-w-[1600px] mx-auto'>
        {/* Welcome Section */}
        <div className='mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4'>
          <div>
            <h1 className='text-2xl md:text-3xl font-bold text-white mb-2'>Welcome back, Alex</h1>
            <p className='text-sm text-zinc-400'>Choose a platform to start creating.</p>
          </div>
          <button
            type='button'
            className='w-full md:w-auto py-3 px-6 bg-gradient-to-r from-sky-400 to-teal-500 hover:from-sky-300 hover:to-teal-400 rounded-xl font-bold text-white shadow-lg shadow-sky-900/30 flex items-center justify-center gap-2 transform transition hover:scale-[1.02]'
          >
            <Sparkles className='w-5 h-5' />
            Create New
          </button>
        </div>

        {/* Platform Cards */}
        <h2 className='text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4'>
          Start Creating
        </h2>
        <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4'>
          <PlatformCard
            name='LinkedIn'
            icon={Linkedin}
            color='sky-500'
            description='Professional'
          />
          <PlatformCard
            name='YouTube'
            icon={Youtube}
            color='red-500'
            description='Video & Shorts'
          />
          <PlatformCard
            name='Instagram'
            icon={Instagram}
            color='pink-500'
            description='Social Feed'
          />
          <PlatformCard name='Facebook' icon={Facebook} color='blue-500' description='Community' />
          <PlatformCard name='TikTok' icon={Sparkles} color='white' description='Viral Short' />
          <PlatformCard name='X' icon={Sparkles} color='white' description='Threads' />
        </div>

        {/* Recent Designs */}
        <div className='mt-12'>
          <div className='flex items-center justify-between mb-4'>
            <h2 className='text-xs font-bold text-zinc-500 uppercase tracking-widest'>
              Recent Designs
            </h2>
            <button type='button' className='text-xs font-bold text-sky-400 hover:text-sky-300'>
              View All
            </button>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6'>
            {/* Recent Design Placeholder */}
            <div className='group relative bg-zinc-900 border border-white/5 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition hover:-translate-y-1'>
              <div className='aspect-[2/1] bg-gradient-to-br from-sky-900 to-teal-900 relative flex items-center justify-center'>
                <span className='text-white font-black text-xl tracking-tighter opacity-80'>
                  DESIGN
                </span>
              </div>
              <div className='p-3'>
                <div className='flex items-center justify-between mb-1'>
                  <h3 className='font-bold text-sm text-white truncate'>Personal Brand Banner</h3>
                </div>
                <p className='text-[10px] text-zinc-500'>Edited 2 hours ago</p>
              </div>
            </div>

            {/* Empty State */}
            <div className='group relative bg-zinc-900/50 border border-dashed border-white/10 rounded-2xl overflow-hidden flex items-center justify-center aspect-[2/1] md:aspect-auto md:h-auto'>
              <div className='text-center p-4'>
                <p className='text-zinc-500 text-sm'>Your designs will appear here</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
