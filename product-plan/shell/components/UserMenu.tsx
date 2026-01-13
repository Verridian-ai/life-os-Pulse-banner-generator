import { useState } from 'react'
import { Settings, LogOut, User, ChevronDown } from 'lucide-react'

interface UserMenuProps {
  user?: {
    name: string
    avatarUrl?: string
  }
  onLogout?: () => void
}

export function UserMenu({ user, onLogout }: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false)

  const initials = user?.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'U'

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 group"
      >
        {user?.avatarUrl ? (
          <img
            src={user.avatarUrl}
            alt={user.name}
            className="w-10 h-10 rounded-full ring-2 ring-sky-500/50 ring-offset-2 ring-offset-zinc-950"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-sky-400 to-teal-500 flex items-center justify-center shadow-lg shadow-sky-900/20 text-xs font-bold ring-2 ring-black">
            {initials}
          </div>
        )}
        <ChevronDown
          className={`w-4 h-4 text-zinc-400 transition hidden sm:block ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Menu */}
          <div className="absolute right-0 top-full mt-2 w-56 bg-zinc-900/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden">
            {/* User Info */}
            <div className="px-4 py-3 border-b border-white/5">
              <p className="font-bold text-white text-sm">{user?.name || 'User'}</p>
              <p className="text-xs text-zinc-500">Free Plan</p>
            </div>

            {/* Menu Items */}
            <div className="py-2">
              <button className="w-full flex items-center gap-3 px-4 py-2 text-sm text-zinc-400 hover:text-white hover:bg-white/5 transition">
                <User className="w-4 h-4" />
                Profile
              </button>
              <button className="w-full flex items-center gap-3 px-4 py-2 text-sm text-zinc-400 hover:text-white hover:bg-white/5 transition">
                <Settings className="w-4 h-4" />
                Settings
              </button>
            </div>

            {/* Logout */}
            <div className="border-t border-white/5 py-2">
              <button
                onClick={() => {
                  setIsOpen(false)
                  onLogout?.()
                }}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition"
              >
                <LogOut className="w-4 h-4" />
                Sign out
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
