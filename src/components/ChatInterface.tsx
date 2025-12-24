import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { generateDesignChatResponse, generateSearchResponse } from '../services/llm';
import { ChatMessage, Part } from '../types';
import { optimizeImage } from '../utils';
import { SettingsModal } from './features/SettingsModal';
import { getUserAPIKeys } from '../services/apiKeyStorage';
import { ChatAgent } from '../services/chatAgent';
import { ActionExecutor } from '../services/actionExecutor';
import { useCanvas } from '../context/CanvasContext';
import { useAuth } from '../context/AuthContext';
import * as chatPersistence from '../services/chatPersistence';

interface ChatInterfaceProps {
  onGenerateFromPrompt: (prompt: string) => void;
}

// Reusable Neumorphic Button Styles (Matched with App.tsx Responsive Base)
const BTN_BASE =
  'h-10 md:h-12 px-4 md:px-6 rounded-full font-black uppercase tracking-wider text-[10px] md:text-xs transition-all flex items-center justify-center gap-2 drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)] whitespace-nowrap';

const BTN_BLUE_INACTIVE =
  'bg-zinc-900 text-blue-500 shadow-[4px_4px_8px_rgba(0,0,0,0.5),-4px_-4px_8px_rgba(255,255,255,0.05)] border border-blue-500/20 hover:text-blue-400 hover:border-blue-500/50 hover:shadow-[0_0_15px_rgba(59,130,246,0.2)]';
const BTN_BLUE_ACTIVE =
  'bg-gradient-to-br from-blue-600 to-cyan-700 text-white shadow-[0_0_20px_rgba(37,99,235,0.4)] border border-blue-400/30 scale-[1.02]';

const BTN_NEU_WHITE =
  'bg-white text-black shadow-[0_0_15px_rgba(255,255,255,0.2)] hover:bg-zinc-200 active:scale-[0.98]';

const INITIAL_MESSAGE: ChatMessage = {
  role: 'model',
  text: 'HELLO! I AM NANO, YOUR PRO LINKEDIN BANNER STRATEGIST. \n\nUPLOAD YOUR LOGO, PROFILE PICTURE, OR ANY REFERENCE IMAGES, AND WE CAN DISCUSS A DESIGN THAT PERFECTLY MATCHES YOUR BRAND COLORS AND STYLE.',
};

const ChatInterface: React.FC<ChatInterfaceProps> = ({ onGenerateFromPrompt }) => {
  // Get canvas context for ActionExecutor
  const { bgImage, setBgImage } = useCanvas();
  const { user } = useAuth();

  const [input, setInput] = useState('');
  const [attachedImages, setAttachedImages] = useState<string[]>([]);
  const [mode, setMode] = useState<'design' | 'search'>('design');
  const [loading, setLoading] = useState(false);
  const [processingFiles, setProcessingFiles] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Persistence state
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [conversations, setConversations] = useState<chatPersistence.ChatConversation[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // State for chat agent and pending actions
  const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_MESSAGE]);
  const [pendingAction, setPendingAction] = useState<{
    name: string;
    args: Record<string, unknown>;
    preview?: string;
  } | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [executingTool, setExecutingTool] = useState<string | null>(null);

  // Create action executor
  const actionExecutor = useMemo(
    () =>
      new ActionExecutor(
        (imageUrl, type) => {
          console.log('[ChatInterface] Applying action result:', { imageUrl, type });
          if (type === 'background') {
            setBgImage(imageUrl);
          }
          // TODO: Handle profile updates if needed
        },
        false, // Not in preview mode - apply directly
      ),
    [setBgImage],
  );

  // Handle tool calls from chat agent
  const handleToolCall = async (
    name: string,
    args: Record<string, unknown>,
  ): Promise<unknown> => {
    console.log('[ChatInterface] Tool call:', name, args);

    // Show executing indicator
    setExecutingTool(name);
    setIsExecuting(true);

    try {
      // Execute the tool call
      const result = await actionExecutor.executeToolCall({ name, args });

      // Show success/failure in chat
      if (result.success) {
        setMessages((prev) => [
          ...prev,
          {
            role: 'model',
            text: `✓ EXECUTED: ${name.toUpperCase().replace(/_/g, ' ')}\n\nResult: ${result.result || 'Success'}`,
          },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            role: 'model',
            text: `✗ FAILED: ${name.toUpperCase().replace(/_/g, ' ')}\n\nError: ${result.error || 'Unknown error'}`,
          },
        ]);
      }

      return result;
    } catch (error) {
      console.error('[ChatInterface] Tool execution error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    } finally {
      setIsExecuting(false);
      setExecutingTool(null);
      setPendingAction(null);
    }
  };

  // Handle conversation updates from chat agent
  const handleConversationUpdate = (updatedMessages: ChatMessage[]) => {
    // ChatAgent already returns the correct display format
    setMessages(updatedMessages);
  };

  // Create chat agent (only once)
  const chatAgent = useMemo(
    () =>
      new ChatAgent({
        onToolCall: handleToolCall,
        onUpdate: handleConversationUpdate,
      }),
    [], // Empty deps - we want this to persist
  );

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // ============================================================================
  // CHAT PERSISTENCE
  // ============================================================================

  // Load conversations list when user is authenticated
  useEffect(() => {
    if (!user) return;

    const loadConversations = async () => {
      setLoadingHistory(true);
      try {
        const convos = await chatPersistence.getConversations({ mode, limit: 20 });
        setConversations(convos);
        console.log('[ChatInterface] Loaded', convos.length, 'conversations');
      } catch (error) {
        console.error('[ChatInterface] Failed to load conversations:', error);
      } finally {
        setLoadingHistory(false);
      }
    };

    loadConversations();
  }, [user, mode]);

  // Create or load conversation when starting a chat
  const ensureConversation = useCallback(async (): Promise<string | null> => {
    if (!user) return null;

    // If we already have a conversation, return its ID
    if (conversationId) return conversationId;

    // Create new conversation
    try {
      const conversation = await chatPersistence.createConversation(mode);
      if (conversation) {
        setConversationId(conversation.id);
        console.log('[ChatInterface] Created conversation:', conversation.id);
        return conversation.id;
      }
    } catch (error) {
      console.error('[ChatInterface] Failed to create conversation:', error);
    }
    return null;
  }, [user, conversationId, mode]);

  // Save a message to the database
  const saveMessage = useCallback(
    async (
      convId: string,
      role: 'user' | 'assistant' | 'system',
      content: string,
      extra?: {
        images?: string[];
        generated_images?: string[];
        model_used?: string;
        tokens_used?: number;
        response_time_ms?: number;
      },
    ) => {
      if (!user || !convId) return;

      try {
        await chatPersistence.addMessage(convId, {
          role,
          content,
          images: extra?.images,
          generatedImages: extra?.generated_images,
          modelUsed: extra?.model_used,
          tokensUsed: extra?.tokens_used,
          responseTimeMs: extra?.response_time_ms,
        });
        console.log('[ChatInterface] Saved message to conversation:', convId);
      } catch (error) {
        console.error('[ChatInterface] Failed to save message:', error);
      }
    },
    [user],
  );

  // Start a new conversation
  const startNewConversation = useCallback(() => {
    setConversationId(null);
    setMessages([INITIAL_MESSAGE]);
    chatAgent.clearHistory(); // Clear chat agent history
    console.log('[ChatInterface] Started new conversation');
  }, [chatAgent]);

  // Load an existing conversation
  const loadConversation = useCallback(
    async (convId: string) => {
      if (!user) return;

      setLoadingHistory(true);
      try {
        const result = await chatPersistence.getConversationWithMessages(convId);
        if (result) {
          setConversationId(result.conversation.id);
          setMode(result.conversation.mode as 'design' | 'search');

          // Convert saved messages to ChatMessage format
          // Filter out system messages and map roles
          const loadedMessages: ChatMessage[] = result.messages
            .filter((msg) => msg.role !== 'system')
            .map((msg) => ({
              role: (msg.role === 'assistant' ? 'model' : 'user') as 'model' | 'user',
              text: msg.content,
              images: msg.images?.length ? msg.images : undefined,
            }));

          // Prepend initial message if not present
          if (loadedMessages.length === 0 || loadedMessages[0].role !== 'model') {
            loadedMessages.unshift(INITIAL_MESSAGE);
          }

          setMessages(loadedMessages);
          console.log('[ChatInterface] Loaded conversation:', convId, 'with', result.messages.length, 'messages');
        }
      } catch (error) {
        console.error('[ChatInterface] Failed to load conversation:', error);
      } finally {
        setLoadingHistory(false);
        setShowHistory(false);
      }
    },
    [user],
  );

  // Delete a conversation
  const deleteConversation = useCallback(
    async (convId: string) => {
      if (!user) return;

      try {
        await chatPersistence.deleteConversation(convId);
        setConversations((prev) => prev.filter((c) => c.id !== convId));

        // If we deleted the current conversation, start fresh
        if (convId === conversationId) {
          startNewConversation();
        }

        console.log('[ChatInterface] Deleted conversation:', convId);
      } catch (error) {
        console.error('[ChatInterface] Failed to delete conversation:', error);
      }
    },
    [user, conversationId, startNewConversation],
  );

  // Refresh conversations list
  const refreshConversations = useCallback(async () => {
    if (!user) return;

    try {
      const convos = await chatPersistence.getConversations({ mode, limit: 20 });
      setConversations(convos);
    } catch (error) {
      console.error('[ChatInterface] Failed to refresh conversations:', error);
    }
  }, [user, mode]);

  // ============================================================================
  // FILE HANDLING
  // ============================================================================

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setProcessingFiles(true);
      const files: File[] = Array.from(e.target.files);
      try {
        // Resize for Gemini API (1024 max dimension is usually safe and efficient for token usage)
        const optimizedPromises = files.map((file) => optimizeImage(file, 1024, 1024));
        const results = await Promise.all(optimizedPromises);
        // Map the result objects to just the base64 strings needed for the chat state
        const base64Images = results.map((r) => r.base64);
        setAttachedImages((prev) => [...prev, ...base64Images]);
      } catch (err) {
        console.error('Failed to process chat images', err);
      } finally {
        setProcessingFiles(false);
      }
    }
  };

  const removeImage = (index: number) => {
    setAttachedImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSend = async () => {
    if ((!input.trim() && attachedImages.length === 0) || loading) return;

    const userMsg = input;
    const currentImages = [...attachedImages];
    const startTime = Date.now();

    // Clear inputs immediately
    setInput('');
    setAttachedImages([]);

    // Add user message to state
    setMessages((prev) => [
      ...prev,
      { role: 'user', text: userMsg, images: currentImages.length > 0 ? currentImages : undefined },
    ]);
    setLoading(true);

    // Ensure conversation exists and save user message (async, don't block)
    let activeConvId: string | null = null;
    if (user) {
      activeConvId = await ensureConversation();
      if (activeConvId) {
        // Save user message in background
        saveMessage(activeConvId, 'user', userMsg, {
          images: currentImages.length > 0 ? currentImages : undefined,
        });
      }
    }

    try {
      // Pre-flight API key validation
      // Skip check if product has server-side API keys configured
      const keys = await getUserAPIKeys();
      const hasAnyKeys = keys.openrouter_api_key || keys.gemini_api_key || keys.hasProductKeys;
      if (!hasAnyKeys) {
        setMessages((prev) => [
          ...prev,
          {
            role: 'model',
            text: '⚠️ NO API KEYS CONFIGURED\n\nI need an OpenRouter or Gemini API key to respond to your message.\n\nPlease add at least one API key in Settings (gear icon in the top-right corner).',
          },
        ]);
        setLoading(false);
        return;
      }

      if (mode === 'design') {
        // Use new ChatAgent for design mode
        const response = await chatAgent.chat(userMsg, currentImages.length > 0 ? currentImages : undefined);

        // Save assistant message if we have a conversation
        if (activeConvId && response) {
          const responseTime = Date.now() - startTime;
          saveMessage(activeConvId, 'assistant', response, {
            model_used: 'openrouter/gemini-2.5-pro',
            response_time_ms: responseTime,
          });
          // Refresh conversation list to update last_message_at
          refreshConversations();
        }
      } else {
        // Keep existing search mode implementation
        // Build history
        const history = messages.map((m) => {
          const parts: Part[] = [{ text: m.text }];
          if (m.images) {
            m.images.forEach((img) => {
              const base64Data = img.split(',')[1] || img;
              const mimeType = img.substring(img.indexOf(':') + 1, img.indexOf(';')) || 'image/png';
              parts.push({ inlineData: { mimeType, data: base64Data } });
            });
          }
          return { role: m.role, parts };
        });

        const response = await generateSearchResponse(userMsg, history);

        // Grounding extraction removed as we are no longer using Gemini SDK
        const groundings: { title: string; url: string }[] = [];

        setMessages((prev) => [
          ...prev,
          {
            role: 'model',
            text: response.text,
            groundingUrls: groundings.length > 0 ? groundings : undefined,
          },
        ]);

        // Save search response if we have a conversation
        if (activeConvId && response.text) {
          const responseTime = Date.now() - startTime;
          saveMessage(activeConvId, 'assistant', response.text, {
            model_used: 'gemini-search',
            response_time_ms: responseTime,
          });
          refreshConversations();
        }
      }
    } catch (e) {
      console.error('[Chat] Error:', e);

      // Parse error type and provide specific messages
      let errorMessage = 'SORRY, I ENCOUNTERED AN ERROR. PLEASE TRY AGAIN.';

      if (e instanceof Error) {
        const errorText = e.message.toLowerCase();

        if (errorText.includes('api key') || errorText.includes('unauthorized') || errorText.includes('401')) {
          errorMessage =
            '⚠️ API KEY ERROR\n\nYour API key is invalid or expired. Please check your API keys in Settings (gear icon in the top-right corner).';
        } else if (errorText.includes('quota') || errorText.includes('rate limit') || errorText.includes('429')) {
          errorMessage =
            '⚠️ QUOTA EXCEEDED\n\nYour API quota has been exceeded or rate limit reached. Please try again later or check your API provider dashboard.';
        } else if (errorText.includes('network') || errorText.includes('fetch') || errorText.includes('connection')) {
          errorMessage =
            '⚠️ NETWORK ERROR\n\nFailed to connect to the AI service. Please check your internet connection and try again.';
        } else {
          errorMessage = `⚠️ ERROR\n\n${e.message}\n\nPlease try again or contact support if the issue persists.`;
        }
      }

      setMessages((prev) => [
        ...prev,
        {
          role: 'model',
          text: errorMessage,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const extractPrompts = (text: string) => {
    const regex = /PROMPT:(.*?)(?=\n|$)/g;
    const matches = [];
    let match;
    while ((match = regex.exec(text)) !== null) {
      matches.push(match[1].trim());
    }
    return matches;
  };

  return (
    <div className='flex flex-col h-full bg-zinc-900/40 backdrop-blur-md rounded-3xl border border-white/5 shadow-2xl overflow-hidden relative'>
      <div className='absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-50'></div>

      {/* Header */}
      <div className='flex items-center justify-between p-4 md:p-6 border-b border-white/5 bg-black/20'>
        <div className='flex space-x-2 md:space-x-4'>
          <button
            onClick={() => setMode('design')}
            className={`${BTN_BASE} ${mode === 'design' ? BTN_BLUE_ACTIVE : BTN_BLUE_INACTIVE}`}
          >
            <span className='material-icons text-sm md:text-base drop-shadow-md'>psychology</span>
            Designer Logic
          </button>
          <button
            onClick={() => setMode('search')}
            className={`${BTN_BASE} ${mode === 'search' ? BTN_BLUE_ACTIVE : BTN_BLUE_INACTIVE}`}
          >
            <span className='material-icons text-sm md:text-base drop-shadow-md'>public</span>
            Trend Search
          </button>
        </div>

        <div className='flex items-center gap-2'>
          {/* New Chat Button */}
          {user && (
            <button
              onClick={startNewConversation}
              className='h-10 w-10 md:h-12 md:w-12 rounded-full bg-zinc-800 border border-white/5 text-zinc-400 hover:text-white transition flex items-center justify-center hover:bg-zinc-700'
              title='New Conversation'
            >
              <span className='material-icons'>add</span>
            </button>
          )}

          {/* History Button */}
          {user && (
            <div className='relative'>
              <button
                onClick={() => setShowHistory(!showHistory)}
                className={`h-10 w-10 md:h-12 md:w-12 rounded-full border border-white/5 text-zinc-400 hover:text-white transition flex items-center justify-center ${showHistory ? 'bg-blue-600 text-white' : 'bg-zinc-800 hover:bg-zinc-700'}`}
                title='Chat History'
              >
                <span className='material-icons'>history</span>
              </button>

              {/* History Dropdown */}
              {showHistory && (
                <div className='absolute right-0 top-14 w-80 max-h-96 overflow-y-auto bg-zinc-900 border border-white/10 rounded-2xl shadow-2xl z-50'>
                  <div className='p-3 border-b border-white/10 flex items-center justify-between'>
                    <span className='text-sm font-bold text-zinc-300 uppercase tracking-wider'>Chat History</span>
                    <button
                      onClick={() => setShowHistory(false)}
                      className='text-zinc-500 hover:text-white'
                    >
                      <span className='material-icons text-sm'>close</span>
                    </button>
                  </div>

                  {loadingHistory ? (
                    <div className='p-4 text-center'>
                      <span className='material-icons animate-spin text-blue-400'>refresh</span>
                    </div>
                  ) : conversations.length === 0 ? (
                    <div className='p-4 text-center text-zinc-500 text-sm'>
                      No conversations yet
                    </div>
                  ) : (
                    <div className='p-2 space-y-1'>
                      {conversations.map((conv) => (
                        <div
                          key={conv.id}
                          className={`p-3 rounded-xl cursor-pointer transition group flex items-center justify-between ${conversationId === conv.id ? 'bg-blue-600/20 border border-blue-500/30' : 'hover:bg-white/5'}`}
                        >
                          <div
                            onClick={() => loadConversation(conv.id)}
                            className='flex-1 min-w-0'
                          >
                            <div className='text-sm font-medium text-white truncate'>
                              {conv.title}
                            </div>
                            <div className='text-xs text-zinc-500'>
                              {new Date(conv.lastMessageAt).toLocaleDateString()}
                            </div>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (confirm('Delete this conversation?')) {
                                deleteConversation(conv.id);
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
              )}
            </div>
          )}

          {/* Settings Button */}
          <button
            onClick={() => setShowSettings(true)}
            className='h-10 w-10 md:h-12 md:w-12 rounded-full bg-zinc-800 border border-white/5 text-zinc-400 hover:text-white transition flex items-center justify-center hover:bg-zinc-700'
            title='AI Settings'
          >
            <span className='material-icons'>settings</span>
          </button>
        </div>
      </div>

      <SettingsModal isOpen={showSettings} onClose={() => setShowSettings(false)} />

      {/* Messages */}
      <div className='flex-1 overflow-y-auto p-4 md:p-6 space-y-6 scrollbar-hide'>
        {messages.map((m, i) => {
          const detectedPrompts = m.role === 'model' ? extractPrompts(m.text) : [];
          return (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[85%] md:max-w-[70%] rounded-2xl p-6 shadow-sm ${m.role === 'user' ? 'bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-br-sm shadow-[0_0_15px_rgba(37,99,235,0.2)]' : 'bg-white/5 text-zinc-200 rounded-bl-sm border border-white/5 shadow-lg'}`}
              >
                {/* Images in message */}
                {m.images && m.images.length > 0 && (
                  <div className='flex flex-wrap gap-2 mb-3'>
                    {m.images.map((img, idx) => (
                      <img
                        key={idx}
                        src={img}
                        alt='attachment'
                        className='w-24 h-24 object-cover rounded-xl border border-white/10 shadow-md'
                      />
                    ))}
                  </div>
                )}

                <div className='whitespace-pre-wrap leading-relaxed text-sm font-medium drop-shadow-[0_1px_1px_rgba(0,0,0,0.5)]'>
                  {m.text.split('PROMPT:').map((part, partIdx) => {
                    if (partIdx === 0) return <span key={partIdx}>{part}</span>;
                    return (
                      <span key={partIdx} className='hidden'>
                        {' '}
                        PROMPT: {part}
                      </span>
                    );
                  })}
                </div>

                {/* Detected Prompts Actions */}
                {detectedPrompts.length > 0 && (
                  <div className='mt-4 space-y-2'>
                    {detectedPrompts.map((prompt, pIdx) => (
                      <div
                        key={pIdx}
                        className='bg-black/30 p-4 rounded-xl border border-purple-500/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 group hover:border-purple-500/40 transition shadow-inner'
                      >
                        <div className='text-xs text-purple-300 italic line-clamp-2 flex-1 font-medium'>
                          "{prompt}"
                        </div>
                        <button
                          onClick={() => onGenerateFromPrompt(prompt)}
                          className={`${BTN_BASE} ${BTN_NEU_WHITE} h-8 px-4 text-[10px] w-full md:w-auto`}
                        >
                          <span className='material-icons text-xs'>auto_awesome</span>
                          Generate
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {m.isThinking && (
                  <div className='mt-4 text-[10px] text-zinc-500 font-black uppercase tracking-widest flex items-center gap-2 opacity-70'>
                    <span className='w-1.5 h-1.5 bg-purple-500 rounded-full animate-pulse'></span>
                    Gemini 3 Pro Reasoning
                  </div>
                )}

                {m.groundingUrls && (
                  <div className='mt-4 pt-4 border-t border-white/10'>
                    <p className='text-[10px] font-black mb-2 text-zinc-500 uppercase tracking-widest'>
                      References
                    </p>
                    <ul className='space-y-2'>
                      {m.groundingUrls.map((g, idx) => (
                        <li key={idx}>
                          <a
                            href={g.url}
                            target='_blank'
                            rel='noreferrer'
                            className='text-xs font-bold text-blue-400 hover:text-blue-300 hover:underline truncate block flex items-center gap-2 bg-black/20 p-2 rounded-lg border border-white/5 transition hover:bg-black/40'
                          >
                            <span className='material-icons text-[12px]'>link</span> {g.title}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          );
        })}
        {loading && (
          <div className='flex justify-start'>
            <div className='bg-white/5 border border-white/5 rounded-2xl rounded-bl-sm p-4 flex items-center gap-2 shadow-lg'>
              <div className='w-2 h-2 bg-purple-500 rounded-full animate-bounce'></div>
              <div className='w-2 h-2 bg-purple-500 rounded-full animate-bounce [animation-delay:0.2s]'></div>
              <div className='w-2 h-2 bg-purple-500 rounded-full animate-bounce [animation-delay:0.4s]'></div>
            </div>
          </div>
        )}
        {isExecuting && executingTool && (
          <div className='flex justify-start'>
            <div className='bg-blue-500/10 border border-blue-500/30 rounded-2xl rounded-bl-sm p-4 flex items-center gap-3 shadow-lg'>
              <span className='material-icons text-blue-400 animate-spin'>settings</span>
              <div className='text-sm font-bold text-blue-300 uppercase tracking-wider'>
                Executing: {executingTool.replace(/_/g, ' ')}
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input Area */}
      <div className='p-4 md:p-6 bg-black/20 border-t border-white/5 backdrop-blur-md'>
        {/* Attached Image Preview */}
        {attachedImages.length > 0 && (
          <div className='flex gap-2 mb-4 overflow-x-auto pb-2'>
            {attachedImages.map((img, idx) => (
              <div key={idx} className='relative group shrink-0'>
                <img
                  src={img}
                  alt='preview'
                  className='h-20 w-20 object-cover rounded-xl border border-white/10 shadow-md'
                />
                <button
                  onClick={() => removeImage(idx)}
                  className='absolute -top-2 -right-2 bg-zinc-800 text-white border border-zinc-700 rounded-full w-6 h-6 flex items-center justify-center text-xs shadow-lg hover:bg-red-500 transition'
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

        <div className='flex gap-4 items-end'>
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={processingFiles}
            className='h-12 w-12 rounded-full bg-zinc-800 border border-white/5 text-zinc-400 hover:text-white transition disabled:opacity-50 shrink-0 flex items-center justify-center shadow-[4px_4px_8px_rgba(0,0,0,0.5),-4px_-4px_8px_rgba(255,255,255,0.05)] hover:scale-[1.05] active:scale-[0.95]'
            title='Upload references'
          >
            {processingFiles ? (
              <span className='material-icons animate-spin text-lg'>refresh</span>
            ) : (
              <span className='material-icons text-xl drop-shadow-md'>add_photo_alternate</span>
            )}
          </button>
          <input
            type='file'
            id='chat-file-upload' // Added ID
            aria-label='Upload images' // Added accessible name
            multiple
            ref={fileInputRef}
            className='hidden'
            accept='image/*'
            onChange={handleImageUpload}
          />

          <div className='flex-1 relative'>
            <textarea
              className='w-full bg-black/40 border border-white/10 rounded-3xl px-6 py-3.5 text-white font-bold placeholder-zinc-500 focus:outline-none focus:border-white/20 focus:bg-black/60 resize-none h-[52px] max-h-[120px] shadow-[inset_0_2px_6px_rgba(0,0,0,0.5)] transition-all'
              placeholder={mode === 'design' ? 'CHAT WITH NANO...' : 'SEARCH TRENDS...'}
              aria-label='Chat message'
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
            />
          </div>
          <button
            onClick={handleSend}
            disabled={loading || (!input.trim() && attachedImages.length === 0)}
            className={`h-12 w-12 rounded-full font-bold transition flex items-center justify-center shrink-0 ${loading ? 'bg-zinc-700 opacity-50' : 'bg-white text-black shadow-[0_0_15px_rgba(255,255,255,0.2)] hover:scale-[1.05] active:scale-[0.95]'}`}
          >
            <span className='material-icons drop-shadow-sm'>arrow_upward</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
