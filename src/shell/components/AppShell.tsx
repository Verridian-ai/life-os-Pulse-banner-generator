import { MainNav } from './MainNav';
import { BottomNav } from './BottomNav';
import { UserMenu } from './UserMenu';
import { Menu, Search } from 'lucide-react';

export interface NavigationItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  isActive?: boolean;
}

export interface AppShellProps {
  children: React.ReactNode;
  navigationItems: NavigationItem[];
  user?: {
    name: string;
    avatarUrl?: string;
  };
  logoSrc?: string;
  onNavigate?: (href: string) => void;
  onLogout?: () => void;
  onCreateNew?: () => void;
}

export function AppShell({
  children,
  navigationItems,
  user,
  logoSrc,
  onNavigate,
  onLogout,
  onCreateNew,
}: AppShellProps) {
  return (
    <div className="min-h-screen bg-zinc-950 text-white font-['Space_Grotesk',sans-serif]">
      {/* Header */}
      <header className='fixed top-0 left-0 right-0 h-16 bg-black/60 backdrop-blur-xl border-b border-white/5 z-50 flex items-center justify-between px-4 lg:px-8'>
        <div className='flex items-center gap-3'>
          <button
            type='button'
            className='lg:hidden p-2 -ml-2 text-zinc-400 hover:text-white transition'
          >
            <Menu className='w-6 h-6' />
          </button>
          {logoSrc ? (
            <img src={logoSrc} alt='Signal' className='h-8 w-auto' />
          ) : (
            <span className='text-xl font-bold bg-gradient-to-r from-sky-400 to-teal-400 bg-clip-text text-transparent'>
              Signal
            </span>
          )}
        </div>

        {/* Search (Desktop) */}
        <div className='flex-1 max-w-md mx-4 hidden lg:block'>
          <div className='relative group'>
            <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:text-sky-400 transition' />
            <input
              type='text'
              placeholder='Search designs...'
              className='w-full bg-zinc-900 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/20 transition placeholder:text-zinc-500'
            />
          </div>
        </div>

        {/* User Menu */}
        <UserMenu user={user} onLogout={onLogout} />
      </header>

      {/* Sidebar (Desktop) */}
      <MainNav items={navigationItems} onNavigate={onNavigate} className='hidden lg:flex' />

      {/* Main Content */}
      <main className='lg:ml-64 pt-16 pb-24 lg:pb-0 min-h-screen'>{children}</main>

      {/* Bottom Navigation (Mobile) */}
      <BottomNav
        items={navigationItems}
        onNavigate={onNavigate}
        onCreateNew={onCreateNew}
        className='lg:hidden'
      />
    </div>
  );
}
