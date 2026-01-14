import { useState, useRef, useEffect } from 'react';

import { useCanvas } from '@/context/CanvasContext';
import { useAuth } from '@/context/AuthContext';

import { SettingsModal } from '../features/SettingsModal';

// Import extracted components
import {
  ChatHeader,
  ChatMessage,
  ChatInput,
  ConversationHistory,
  LoadingIndicator,
  ExecutingIndicator,
} from './components';

// Import extracted hooks
import { useChatPersistence, useFileAttachment, useChatMessages, useAutoScroll } from './hooks';

// Import types
import type { ChatInterfaceProps, UseChatPersistenceReturn } from './types';

/**
 * ChatInterface Component
 *
 * Main chat interface for NANO AI assistant
 * Refactored from 797 lines to under 300 lines by extracting:
 * - Presentation components (ChatHeader, ChatMessage, ChatInput, etc.)
 * - Custom hooks (useChatPersistence, useFileAttachment, useChatMessages, useAutoScroll)
 * - Constants and utilities to separate files
 *
 * This component now focuses on orchestration and composition of child components.
 */
const ChatInterface: React.FC<ChatInterfaceProps> = ({ onGenerateFromPrompt }) => {
  // Get context
  const { setBgImage } = useCanvas();
  const { user } = useAuth();

  // Local UI state
  const [showSettings, setShowSettings] = useState(false);

  // Persistence Ref to handle circular dependency with useChatMessages
  const persistenceRef = useRef<UseChatPersistenceReturn | null>(null);

  // Initialize file attachment hook
  const fileAttachment = useFileAttachment();

  // Initialize chat messages hook (handles send logic, API integration, tool execution)
  // Note: This must be initialized before persistence to avoid circular dependency
  const chatMessages = useChatMessages({
    userId: user?.id || null,
    setBgImage,
    persistenceRef,
    fileAttachment,
  });

  // Initialize chat persistence hook
  const persistence = useChatPersistence({
    userId: user?.id || null,
    mode: chatMessages.mode,
    onMessagesLoaded: (messages) => {
      chatMessages.setMessages(messages);
    },
    onModeChanged: (mode) => {
      chatMessages.setMode(mode);
    },
  });

  // Update persistence ref
  useEffect(() => {
    persistenceRef.current = persistence;
  }, [persistence]);

  // Initialize auto-scroll hook
  const { bottomRef } = useAutoScroll(chatMessages.messages, chatMessages.loading);

  // Handle mode change
  const handleModeChange = (mode: 'design' | 'search') => {
    chatMessages.setMode(mode);
  };

  // Handle new conversation
  const handleNewChat = () => {
    persistence.startNewConversation();
    chatMessages.setMessages([]);
    // The hook will automatically prepend INITIAL_MESSAGE
  };

  // Handle toggle history
  const handleToggleHistory = () => {
    persistence.setShowHistory(!persistence.showHistory);
  };

  // Handle load conversation
  const handleLoadConversation = async (conversationId: string) => {
    await persistence.loadConversation(conversationId);
  };

  // Handle delete conversation
  const handleDeleteConversation = async (conversationId: string) => {
    await persistence.deleteConversation(conversationId);
  };

  return (
    <div className='flex flex-col h-full bg-zinc-900/40 backdrop-blur-md rounded-3xl border border-white/5 shadow-2xl overflow-hidden relative'>
      {/* Top gradient accent */}
      <div className='absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-50'></div>

      {/* Header */}
      <ChatHeader
        mode={chatMessages.mode}
        onModeChange={handleModeChange}
        onNewChat={handleNewChat}
        showHistory={persistence.showHistory}
        onToggleHistory={handleToggleHistory}
        onShowSettings={() => setShowSettings(true)}
        isAuthenticated={!!user}
      />

      {/* Settings Modal */}
      <SettingsModal isOpen={showSettings} onClose={() => setShowSettings(false)} />

      {/* Conversation History Dropdown */}
      <ConversationHistory
        show={persistence.showHistory}
        onClose={() => persistence.setShowHistory(false)}
        conversations={persistence.conversations}
        activeConversationId={persistence.conversationId}
        loading={persistence.loadingHistory}
        onLoadConversation={handleLoadConversation}
        onDeleteConversation={handleDeleteConversation}
      />

      {/* Messages */}
      <div className='flex-1 overflow-y-auto p-4 md:p-6 space-y-6 scrollbar-hide'>
        {chatMessages.messages.map((message, index) => (
          <ChatMessage key={index} message={message} onGenerateFromPrompt={onGenerateFromPrompt} />
        ))}

        {/* Loading indicator */}
        {chatMessages.loading && <LoadingIndicator />}

        {/* Tool execution indicator */}
        {chatMessages.isExecuting && chatMessages.executingTool && (
          <ExecutingIndicator toolName={chatMessages.executingTool} />
        )}

        {/* Auto-scroll target */}
        <div ref={bottomRef} />
      </div>

      {/* Input Area */}
      <div className='p-4 md:p-6 bg-black/20 border-t border-white/5 backdrop-blur-md relative'>
        {/* Agent Suggestions */}
        {chatMessages.agentSuggestions.length > 0 && (
          <div className='absolute bottom-full left-0 right-0 p-4 flex gap-2 overflow-x-auto scrollbar-hide bg-zinc-950/80 backdrop-blur-md animate-slideUp'>
            {chatMessages.agentSuggestions.map((s) => (
              <button
                key={s.agentId}
                type='button'
                className='px-3 py-1.5 rounded-full bg-purple-600/20 border border-purple-500/30 text-purple-300 text-[10px] font-black uppercase tracking-wider whitespace-nowrap flex items-center gap-1.5 hover:bg-purple-600/30 transition'
              >
                <span className='material-icons text-xs'>bolt</span>
                Route to {s.agentId} ({(s.confidence * 100).toFixed(0)}%)
              </button>
            ))}
          </div>
        )}

        <ChatInput
          value={chatMessages.input}
          onChange={chatMessages.setInput}
          onSend={chatMessages.handleSend}
          loading={chatMessages.loading}
          mode={chatMessages.mode}
          attachedImages={fileAttachment.attachedImages}
          onImageUpload={fileAttachment.handleImageUpload}
          onRemoveImage={fileAttachment.removeImage}
          processingFiles={fileAttachment.processingFiles}
          fileInputRef={fileAttachment.fileInputRef}
        />
      </div>
    </div>
  );
};

export default ChatInterface;
