import { Plus } from 'lucide-react'
import type { NavigationItem } from './AppShell'

interface BottomNavProps {
  items: NavigationItem[]
  onNavigate?: (href: string) => void
  onCreateNew?: () => void
  className?: string
}

export function BottomNav({
  items,
  onNavigate,
  onCreateNew,
  className = '',
}: BottomNavProps) {
  // Show first 4 items max, split around FAB
  const visibleItems = items.slice(0, 4)
  const leftItems = visibleItems.slice(0, 2)
  const rightItems = visibleItems.slice(2, 4)

  return (
    <>
      {/* Bottom Navigation Bar */}
      <nav
        className={`fixed bottom-0 left-0 right-0 bg-black/80 backdrop-blur-xl border-t border-white/5 z-50 ${className}`}
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <div className="flex justify-around items-center h-16 px-2">
          {/* Left Items */}
          {leftItems.map((item) => (
            <button
              key={item.href}
              onClick={() => onNavigate?.(item.href)}
              className={`flex flex-col items-center gap-1 p-2 transition ${
                item.isActive
                  ? 'text-sky-400'
                  : 'text-zinc-500 hover:text-sky-300'
              }`}
            >
              {item.icon}
              <span className="text-[9px] font-bold">{item.label}</span>
            </button>
          ))}

          {/* FAB Placeholder */}
          <div className="w-14" />

          {/* Right Items */}
          {rightItems.map((item) => (
            <button
              key={item.href}
              onClick={() => onNavigate?.(item.href)}
              className={`flex flex-col items-center gap-1 p-2 transition ${
                item.isActive
                  ? 'text-sky-400'
                  : 'text-zinc-500 hover:text-sky-300'
              }`}
            >
              {item.icon}
              <span className="text-[9px] font-bold">{item.label}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* Floating Action Button */}
      <button
        onClick={onCreateNew}
        className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-50 w-14 h-14 rounded-full bg-gradient-to-tr from-sky-500 to-teal-500 shadow-lg shadow-sky-900/40 text-white flex items-center justify-center border-2 border-black transform active:scale-95 transition hover:shadow-xl ${className}`}
      >
        <Plus className="w-6 h-6" />
      </button>
    </>
  )
}
