import React from 'react';
import { ConversationHistoryProps } from '../types';

/**
 * ConversationHistory Component
 *
 * Renders a dropdown with conversation history including:
 * - Loading state while fetching
 * - Empty state when no conversations exist
 * - List of conversations with title and date
 * - Active conversation highlighting
 * - Delete conversation with confirmation
 * - Close button
 */
export const ConversationHistory: React.FC<ConversationHistoryProps> = ({
  show,
  onClose,
  conversations,
  activeConversationId,
  loading,
  onLoadConversation,
  onDeleteConversation,
}) => {
  // Don't render if not visible
  if (!show) return null;

  return (
    <div className='absolute right-0 top-14 w-80 max-h-96 overflow-y-auto bg-zinc-900 border border-white/10 rounded-2xl shadow-2xl z-50'>
      {/* Header */}
      <div className='p-3 border-b border-white/10 flex items-center justify-between'>
        <span className='text-sm font-bold text-zinc-300 uppercase tracking-wider'>Chat History</span>
        <button
          type="button"
          onClick={onClose}
          className='text-zinc-500 hover:text-white'
        >
          <span className='material-icons text-sm'>close</span>
        </button>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className='p-4 text-center'>
          <span className='material-icons animate-spin text-blue-400'>refresh</span>
        </div>
      ) : conversations.length === 0 ? (
        /* Empty State */
        <div className='p-4 text-center text-zinc-500 text-sm'>
          No conversations yet
        </div>
      ) : (
        /* Conversation List */
        <div className='p-2 space-y-1'>
          {conversations.map((conv) => (
            <div
              key={conv.id}
              className={`p-3 rounded-xl cursor-pointer transition group flex items-center justify-between ${
                activeConversationId === conv.id
                  ? 'bg-blue-600/20 border border-blue-500/30'
                  : 'hover:bg-white/5'
              }`}
            >
              {/* Conversation Info - Click to load */}
              <div
                onClick={() => onLoadConversation(conv.id)}
                className='flex-1 min-w-0'
              >
                <div className='text-sm font-medium text-white truncate'>
                  {conv.title}
                </div>
                <div className='text-xs text-zinc-500'>
                  {new Date(conv.lastMessageAt).toLocaleDateString()}
                </div>
              </div>

              {/* Delete Button - Hidden until hover */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (confirm('Delete this conversation?')) {
                    onDeleteConversation(conv.id);
                  }
                }}
                className='opacity-0 group-hover:opacity-100 transition text-zinc-500 hover:text-red-400 ml-2'
              >
                <span className='material-icons text-sm'>delete</span>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
