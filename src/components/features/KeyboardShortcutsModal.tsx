import React from 'react';

import { formatShortcut, type KeyboardShortcut } from '@/hooks/useKeyboardShortcuts';
import { useFocusTrap } from '../../hooks/useFocusTrap';

type ShortcutCategory = {
  title: string;
  shortcuts: KeyboardShortcut[];
};

type KeyboardShortcutsModalProps = {
  isOpen: boolean;
  onClose: () => void;
  shortcuts: KeyboardShortcut[];
};

/**
 * Modal overlay showing all available keyboard shortcuts
 * Triggered by pressing `?` key
 * Follows glassmorphism design system from shared_contract.md
 */
export function KeyboardShortcutsModal({
  isOpen,
  onClose,
  shortcuts,
}: KeyboardShortcutsModalProps): React.JSX.Element | null {
  
  // Use Focus Trap (Replaces manual focus management and escape listener)
  const modalRef = useFocusTrap(isOpen, onClose);

  if (!isOpen) return null;

  // Organize shortcuts into categories
  const categories: ShortcutCategory[] = [
    {
      title: 'Generation',
      shortcuts: shortcuts.filter(
        (s) =>
          s.description.toLowerCase().includes('generate') ||
          s.description.toLowerCase().includes('enhance')
      ),
    },
    {
      title: 'Navigation',
      shortcuts: shortcuts.filter(
        (s) =>
          s.description.toLowerCase().includes('tab') ||
          s.description.toLowerCase().includes('switch')
      ),
    },
    {
      title: 'History',
      shortcuts: shortcuts.filter(
        (s) =>
          s.description.toLowerCase().includes('undo') ||
          s.description.toLowerCase().includes('redo') ||
          s.description.toLowerCase().includes('history')
      ),
    },
    {
      title: 'UI Controls',
      shortcuts: shortcuts.filter(
        (s) =>
          s.description.toLowerCase().includes('close') ||
          s.description.toLowerCase().includes('toggle') ||
          s.description.toLowerCase().includes('settings') ||
          s.description.toLowerCase().includes('save')
      ),
    },
  ].filter((cat) => cat.shortcuts.length > 0);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="shortcuts-modal-title"
    >
      {/* Backdrop with glassmorphism */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md" />

      {/* Modal Content */}
      <div
        ref={modalRef}
        className="relative w-full max-w-3xl max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
        style={{ transform: 'translateZ(0)' }} // GPU optimization
        tabIndex={-1} // Ensure the container itself can be focused if needed programmatically, though hook focuses children
      >
        {/* Glass card - 4 layers per shared_contract.md section 5.4 */}
        <div
          className="relative rounded-2xl border border-white/20 overflow-hidden"
          style={{
            background: 'rgba(18, 18, 18, 0.85)',
            backdropFilter: 'blur(20px) saturate(180%)',
          }}
        >
          {/* Noise overlay (layer 3) */}
          <div
            className="absolute inset-0 pointer-events-none opacity-[0.03]"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' /%3E%3C/svg%3E")`,
            }}
          />

          {/* Header */}
          <div className="relative border-b border-white/10 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="material-icons text-amber-400 text-2xl" aria-hidden="true">
                keyboard
              </span>
              <h2 id="shortcuts-modal-title" className="text-xl font-bold text-white">
                Keyboard Shortcuts
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors group"
              aria-label="Close shortcuts modal"
            >
              <span className="material-icons text-zinc-400 group-hover:text-white transition-colors">
                close
              </span>
            </button>
          </div>

          {/* Content */}
          <div className="relative px-6 py-5 space-y-6">
            {categories.map((category) => (
              <div key={category.title}>
                <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-3">
                  {category.title}
                </h3>
                <div className="space-y-2">
                  {category.shortcuts.map((shortcut, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between py-2.5 px-3 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
                    >
                      <span className="text-sm text-zinc-300">{shortcut.description}</span>
                      <kbd className="px-3 py-1.5 bg-zinc-800/80 border border-zinc-700/50 rounded-md text-xs font-mono text-amber-400 shadow-sm">
                        {formatShortcut(shortcut)}
                      </kbd>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {/* Footer Tip */}
            <div className="bg-blue-900/20 border border-blue-500/20 rounded-lg p-4 flex items-start gap-3">
              <span className="material-icons text-blue-400 text-lg" aria-hidden="true">
                lightbulb
              </span>
              <div>
                <p className="text-xs font-bold text-blue-400 uppercase tracking-wide">Pro Tip</p>
                <p className="text-xs text-blue-300/80 mt-1.5 leading-relaxed">
                  Press <kbd className="px-1.5 py-0.5 bg-blue-900/40 border border-blue-500/30 rounded text-blue-200">?</kbd> anytime to view this shortcuts reference.
                  Press <kbd className="px-1.5 py-0.5 bg-blue-900/40 border border-blue-500/30 rounded text-blue-200">Esc</kbd> to close.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* High contrast override (MANDATORY per shared_contract.md section 5.2) */}
        <style>{`
          @media (prefers-contrast: more) {
            .shortcuts-modal-glass {
              background: white !important;
              backdrop-filter: none !important;
              border: 2px solid black !important;
            }
            .shortcuts-modal-glass * {
              color: black !important;
            }
          }

          @media (forced-colors: active) {
            .shortcuts-modal-glass {
              background: Canvas !important;
              border: 2px solid ButtonText !important;
              backdrop-filter: none !important;
            }
          }
        `}</style>
      </div>
    </div>
  );
}

export default KeyboardShortcutsModal;