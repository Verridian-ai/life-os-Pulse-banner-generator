import React, { useRef, useEffect } from 'react';
import { TranscriptEntry } from '../../services/liveClient';

interface ChatHistoryPanelProps {
  isOpen: boolean;
  onClose: () => void;
  transcript: TranscriptEntry[];
}

const ChatHistoryPanel: React.FC<ChatHistoryPanelProps> = ({ isOpen, onClose, transcript }) => {
  const panelRef = useRef<HTMLDivElement>(null);
  const endRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (isOpen) {
      endRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [transcript, isOpen]);

  // Handle escape key to close
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Focus trap - keep focus within panel when open
  useEffect(() => {
    if (isOpen && panelRef.current) {
      const focusableElements = panelRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      const firstElement = focusableElements[0] as HTMLElement;
      firstElement?.focus();
    }
  }, [isOpen]);

  // Format timestamp
  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Format date
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined,
      });
    }
  };

  // Group messages by date
  const groupedTranscript = transcript.reduce(
    (groups, entry) => {
      const dateKey = formatDate(entry.timestamp);
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(entry);
      return groups;
    },
    {} as Record<string, TranscriptEntry[]>,
  );

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className='fixed inset-0 bg-black/50 backdrop-blur-sm z-50 transition-opacity'
        onClick={onClose}
        aria-hidden='true'
      />

      {/* Panel */}
      <div
        ref={panelRef}
        className='fixed right-0 top-0 bottom-0 w-full sm:w-96 bg-zinc-950 border-l border-white/10 z-50 flex flex-col animate-slideInFromRight'
        role='dialog'
        aria-modal='true'
        aria-labelledby='chat-history-title'
      >
        {/* Header */}
        <div className='flex items-center justify-between p-4 border-b border-white/10 bg-zinc-900/50'>
          <h2
            id='chat-history-title'
            className='text-sm font-black uppercase tracking-wider text-white'
          >
            <span className='material-icons text-sm align-middle mr-2'>history</span>
            Chat History
          </h2>
          <button
            onClick={onClose}
            className='w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-zinc-400 hover:text-white transition'
            aria-label='Close chat history'
          >
            <span className='material-icons text-sm'>close</span>
          </button>
        </div>

        {/* Content */}
        <div className='flex-1 overflow-y-auto p-4 space-y-6'>
          {transcript.length === 0 ? (
            <div className='flex flex-col items-center justify-center h-full text-center'>
              <span className='material-icons text-6xl text-zinc-700 mb-3'>
                chat_bubble_outline
              </span>
              <p className='text-zinc-500 text-sm font-bold uppercase tracking-wider'>
                No messages yet
              </p>
              <p className='text-zinc-700 text-xs mt-2'>Start a live session to begin</p>
            </div>
          ) : (
            <>
              {Object.entries(groupedTranscript).map(([date, entries]) => (
                <div key={date}>
                  {/* Date Divider */}
                  <div className='flex items-center justify-center mb-4'>
                    <div className='h-px bg-white/10 flex-1' />
                    <span className='px-3 text-[9px] font-bold uppercase tracking-widest text-zinc-600'>
                      {date}
                    </span>
                    <div className='h-px bg-white/10 flex-1' />
                  </div>

                  {/* Messages */}
                  <div className='space-y-3'>
                    {entries.map((entry, idx) => (
                      <div
                        key={`${date}-${idx}`}
                        className={`flex gap-3 ${
                          entry.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                        }`}
                      >
                        {/* Avatar */}
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                            entry.role === 'user'
                              ? 'bg-blue-600 text-white'
                              : 'bg-purple-600 text-white'
                          }`}
                          aria-label={entry.role === 'user' ? 'You' : 'Assistant'}
                        >
                          <span className='material-icons text-sm'>
                            {entry.role === 'user' ? 'person' : 'smart_toy'}
                          </span>
                        </div>

                        {/* Message Bubble */}
                        <div
                          className={`flex-1 ${entry.role === 'user' ? 'text-right' : 'text-left'}`}
                        >
                          <div
                            className={`inline-block max-w-[85%] rounded-lg px-3 py-2 ${
                              entry.role === 'user'
                                ? 'bg-blue-600/20 border border-blue-500/30 text-blue-100'
                                : 'bg-purple-600/20 border border-purple-500/30 text-purple-100'
                            }`}
                          >
                            <p className='text-xs font-medium break-words'>{entry.text}</p>

                            {/* Tool Calls */}
                            {entry.toolCalls && entry.toolCalls.length > 0 && (
                              <div className='mt-2 space-y-1'>
                                {entry.toolCalls.map((tool, toolIdx) => (
                                  <div
                                    key={toolIdx}
                                    className='flex items-center gap-2 bg-black/30 rounded px-2 py-1'
                                  >
                                    <span className='material-icons text-xs text-yellow-400'>
                                      build
                                    </span>
                                    <span className='text-[9px] font-bold uppercase text-yellow-400'>
                                      {tool.name.replace(/_/g, ' ')}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>

                          <p className='text-[8px] text-zinc-600 font-bold uppercase tracking-widest mt-1'>
                            {formatTime(entry.timestamp)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              <div ref={endRef} />
            </>
          )}
        </div>

        {/* Footer with keyboard hint */}
        <div className='p-3 border-t border-white/10 bg-zinc-900/50'>
          <p className='text-[9px] text-zinc-600 font-bold uppercase tracking-wider text-center'>
            <kbd className='px-1.5 py-0.5 bg-white/5 rounded border border-white/10'>Esc</kbd> to
            close
            {' • '}
            <kbd className='px-1.5 py-0.5 bg-white/5 rounded border border-white/10'>Ctrl+H</kbd> to
            toggle
          </p>
        </div>
      </div>

      <style>{`
                @keyframes slideInFromRight {
                    from {
                        transform: translateX(100%);
                    }
                    to {
                        transform: translateX(0);
                    }
                }

                .animate-slideInFromRight {
                    animation: slideInFromRight 0.3s ease-out;
                }
            `}</style>
    </>
  );
};

export default ChatHistoryPanel;
