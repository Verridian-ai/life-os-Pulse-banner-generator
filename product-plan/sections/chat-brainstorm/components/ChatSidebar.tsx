import React from 'react';

interface Conversation {
  id: string;
  title: string;
  preview: string;
  updatedAt: Date;
  archived?: boolean;
}

interface ChatSidebarProps {
  conversations: Conversation[];
  activeConversationId?: string;
  onSelectConversation: (id: string) => void;
  onNewConversation: () => void;
  onArchive: (id: string) => void;
}

export function ChatSidebar({
  conversations,
  activeConversationId,
  onSelectConversation,
  onNewConversation,
  onArchive,
}: ChatSidebarProps) {
  return (
    <aside className="w-72 bg-white/5 backdrop-blur-xl border-r border-white/10 flex flex-col shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]">
      {/* Header */}
      <div className="p-4 border-b border-white/10">
        <button
          onClick={onNewConversation}
          className="w-full py-3 px-4 bg-gradient-to-r from-sky-500 via-teal-500 to-cyan-400 text-white font-semibold rounded-xl hover:shadow-[0_0_30px_rgba(20,184,166,0.4)] transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(20,184,166,0.25)]"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Chat
        </button>
      </div>

      {/* Search - Glass Effect */}
      <div className="p-4">
        <div className="relative">
          <svg className="w-5 h-5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search chats..."
            className="w-full pl-10 pr-4 py-2 bg-white/5 backdrop-blur-xl border border-white/10 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-teal-500/50 focus:shadow-[0_0_15px_rgba(20,184,166,0.15)] transition-all text-sm shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]"
          />
        </div>
      </div>

      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto">
        {conversations.length > 0 ? (
          <div className="px-2 space-y-1">
            {conversations.map((conversation) => (
              <button
                key={conversation.id}
                onClick={() => onSelectConversation(conversation.id)}
                className={`w-full p-3 rounded-xl text-left transition-all group ${
                  activeConversationId === conversation.id
                    ? 'bg-white/10 backdrop-blur-xl border border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1),0_0_15px_rgba(20,184,166,0.1)]'
                    : 'hover:bg-white/5 border border-transparent hover:border-white/5'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <h4 className={`text-sm font-medium truncate ${
                      activeConversationId === conversation.id
                        ? 'text-teal-400'
                        : 'text-white'
                    }`}>
                      {conversation.title}
                    </h4>
                    <p className="text-xs text-zinc-500 truncate mt-0.5">
                      {conversation.preview}
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onArchive(conversation.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 w-6 h-6 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-zinc-500 hover:text-white transition-all"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                    </svg>
                  </button>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="px-4 py-8 text-center">
            <p className="text-sm text-zinc-500">No conversations yet</p>
          </div>
        )}
      </div>
    </aside>
  );
}

export default ChatSidebar;
