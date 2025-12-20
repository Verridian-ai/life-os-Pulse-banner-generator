import React, { useState } from 'react';

interface ShortcutGroup {
  title: string;
  shortcuts: { keys: string[]; description: string }[];
}

const SHORTCUT_GROUPS: ShortcutGroup[] = [
  {
    title: 'Canvas Navigation',
    shortcuts: [
      { keys: ['Ctrl', 'Scroll'], description: 'Zoom selected element' },
      { keys: ['Click'], description: 'Select element' },
      { keys: ['Esc'], description: 'Deselect element' },
    ],
  },
  {
    title: 'Element Actions',
    shortcuts: [
      { keys: ['Delete'], description: 'Delete selected element' },
      { keys: ['Backspace'], description: 'Delete selected element' },
      { keys: ['Drag'], description: 'Move element' },
      { keys: ['Corner Handle'], description: 'Resize element' },
      { keys: ['Rotation Handle'], description: 'Rotate element' },
    ],
  },
  {
    title: 'History',
    shortcuts: [
      { keys: ['Ctrl', 'Z'], description: 'Undo last action' },
      { keys: ['Ctrl', 'Y'], description: 'Redo action' },
      { keys: ['Ctrl', 'Shift', 'Z'], description: 'Redo action' },
    ],
  },
  {
    title: 'Text Editing',
    shortcuts: [
      { keys: ['Double Click'], description: 'Edit text content' },
      { keys: ['Enter'], description: 'Confirm text edit' },
    ],
  },
];

export const KeyboardShortcutsPanel: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className='bg-black/40 rounded-2xl border border-white/5 overflow-hidden'>
      {/* Header - always visible */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className='w-full px-4 py-3 flex items-center justify-between hover:bg-white/5 transition'
      >
        <div className='flex items-center gap-2'>
          <span className='material-icons text-zinc-400 text-sm'>keyboard</span>
          <span className='text-xs font-bold text-zinc-400 uppercase tracking-wider'>
            Keyboard Shortcuts
          </span>
        </div>
        <span
          className={`material-icons text-zinc-500 text-sm transition-transform ${isExpanded ? 'rotate-180' : ''}`}
        >
          expand_more
        </span>
      </button>

      {/* Expandable content */}
      {isExpanded && (
        <div className='px-4 pb-4 space-y-4'>
          {SHORTCUT_GROUPS.map((group) => (
            <div key={group.title}>
              <h4 className='text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-2'>
                {group.title}
              </h4>
              <div className='space-y-1.5'>
                {group.shortcuts.map((shortcut, idx) => (
                  <div
                    key={idx}
                    className='flex items-center justify-between py-1 px-2 bg-zinc-900/50 rounded-lg'
                  >
                    <div className='flex items-center gap-1'>
                      {shortcut.keys.map((key, keyIdx) => (
                        <React.Fragment key={keyIdx}>
                          <kbd className='px-1.5 py-0.5 bg-zinc-800 border border-zinc-700 rounded text-[10px] font-mono text-zinc-300'>
                            {key}
                          </kbd>
                          {keyIdx < shortcut.keys.length - 1 && (
                            <span className='text-zinc-600 text-[10px]'>+</span>
                          )}
                        </React.Fragment>
                      ))}
                    </div>
                    <span className='text-[10px] text-zinc-400'>{shortcut.description}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Pro tip */}
          <div className='bg-blue-900/20 border border-blue-500/20 rounded-lg p-3 mt-3'>
            <div className='flex items-start gap-2'>
              <span className='material-icons text-blue-400 text-sm'>lightbulb</span>
              <div>
                <p className='text-[10px] font-bold text-blue-400 uppercase'>Pro Tip</p>
                <p className='text-[10px] text-blue-300/70 mt-1'>
                  Hold Ctrl while scrolling on a selected element to quickly resize it.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default KeyboardShortcutsPanel;
