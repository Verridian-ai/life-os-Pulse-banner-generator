import { Sparkles } from 'lucide-react'
import type { NavigationItem } from './AppShell'

interface MainNavProps {
  items: NavigationItem[]
  onNavigate?: (href: string) => void
  className?: string
}

export function MainNav({ items, onNavigate, className = '' }: MainNavProps) {
  return (
    <aside
      className={`fixed top-16 left-0 bottom-0 w-64 bg-zinc-900/50 backdrop-blur-xl border-r border-white/5 flex-col p-4 z-40 ${className}`}
    >
      {/* Navigation Items */}
      <nav className="space-y-1 mb-8">
        {items.map((item) => (
          <button
            key={item.href}
            onClick={() => onNavigate?.(item.href)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition group ${
              item.isActive
                ? 'bg-sky-500/10 text-sky-400 border border-sky-500/20 font-bold'
                : 'hover:bg-white/5 text-zinc-400 hover:text-white border border-transparent'
            }`}
          >
            <span
              className={`transition ${
                item.isActive
                  ? 'text-sky-400'
                  : 'group-hover:text-sky-400'
              }`}
            >
              {item.icon}
            </span>
            <span className="text-sm font-medium">{item.label}</span>
          </button>
        ))}
      </nav>

      {/* Pro Upgrade Card */}
      <div className="mt-auto">
        <div className="p-4 rounded-2xl bg-gradient-to-br from-zinc-800 to-black border border-white/5 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-3 opacity-20">
            <Sparkles className="w-10 h-10 text-teal-500" />
          </div>
          <h3 className="font-bold text-white mb-1 relative z-10">Pro Plan</h3>
          <p className="text-[10px] text-zinc-400 mb-3 relative z-10">
            Unlock all AI features
          </p>
          <button className="w-full py-2 bg-white text-black rounded-lg text-xs font-bold hover:bg-zinc-200 transition relative z-10">
            Upgrade
          </button>
        </div>
      </div>
    </aside>
  )
}
