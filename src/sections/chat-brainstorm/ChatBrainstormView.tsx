import React, { useState } from 'react';
import { ChatMessage, ChatInput, ChatSidebar } from './components';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  attachments?: { type: 'image'; url: string }[];
  timestamp: Date;
}

// Sample data
const sampleConversations = [
  {
    id: '1',
    title: 'LinkedIn Banner Ideas',
    preview: "Let's create a professional banner...",
    updatedAt: new Date(),
  },
  {
    id: '2',
    title: 'Product Launch Campaign',
    preview: 'I need help designing graphics...',
    updatedAt: new Date(Date.now() - 86400000),
  },
];

const sampleMessages: Message[] = [
  {
    id: '1',
    role: 'user',
    content:
      'I need to create a LinkedIn banner for my tech startup. We focus on AI-powered design tools.',
    timestamp: new Date(Date.now() - 60000),
  },
  {
    id: '2',
    role: 'assistant',
    content: `Great! I'd love to help you create a compelling LinkedIn banner. Here are some ideas:

**Option 1: Minimalist Tech**
- Clean gradient background (sky blue to teal)
- Your logo on the left
- A simple tagline: "Design powered by AI"

**Option 2: Abstract AI**
- Neural network visualization
- Floating geometric shapes
- Bold typography with your company name

**Option 3: Product Showcase**
- Show your tool's interface
- Before/after design examples
- Social proof elements

Which direction appeals to you? I can generate some concepts once you choose.`,
    timestamp: new Date(),
  },
];

export function ChatBrainstormView() {
  const [messages, setMessages] = useState<Message[]>(sampleMessages);
  const [isLoading, setIsLoading] = useState(false);
  const [activeConversationId, setActiveConversationId] = useState('1');
  const [showSidebar, setShowSidebar] = useState(true);

  const handleSend = React.useCallback((content: string, _attachments?: File[]) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, newMessage]);
    setIsLoading(true);

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content:
          "I'll help you with that! Let me think about the best approach...\n\nBased on your request, here are my suggestions:\n\n1. **First Option** - A clean, modern approach\n2. **Second Option** - A bold, eye-catching design\n3. **Third Option** - A professional, corporate style\n\nWhich one would you like to explore further?",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiResponse]);
      setIsLoading(false);
    }, 2000);
  }, []);

  return (
    <div className='h-screen flex bg-zinc-950 relative overflow-hidden'>
      {/* Ambient Background Effects */}
      <div className='absolute inset-0 pointer-events-none overflow-hidden'>
        {/* Top-right teal orb */}
        <div className='absolute -top-32 -right-32 w-96 h-96 bg-gradient-to-br from-teal-500/20 via-cyan-500/10 to-transparent rounded-full blur-3xl' />
        {/* Bottom-left teal orb */}
        <div className='absolute -bottom-48 -left-48 w-[500px] h-[500px] bg-gradient-to-tr from-sky-500/15 via-teal-500/10 to-transparent rounded-full blur-3xl' />
        {/* Center subtle glow */}
        <div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-teal-500/5 via-cyan-500/5 to-sky-500/5 rounded-full blur-3xl' />
      </div>

      {/* Sidebar (hidden on mobile) */}
      <div className={`hidden md:block ${showSidebar ? '' : 'md:hidden'} relative z-10`}>
        <ChatSidebar
          conversations={sampleConversations}
          activeConversationId={activeConversationId}
          onSelectConversation={setActiveConversationId}
          onNewConversation={() => {
            setMessages([]);
            setActiveConversationId('new');
          }}
          onArchive={(id) => console.log('Archive:', id)}
        />
      </div>

      {/* Main Chat Area */}
      <div className='flex-1 flex flex-col relative z-10'>
        {/* Header - Glass Effect */}
        <header className='h-14 bg-white/5 backdrop-blur-xl border-b border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] flex items-center px-4 gap-4'>
          {/* Menu Button (mobile) */}
          <button
            type='button'
            onClick={() => setShowSidebar(!showSidebar)}
            className='md:hidden w-8 h-8 rounded-lg bg-white/5 backdrop-blur-xl border border-white/10 hover:bg-white/10 flex items-center justify-center text-zinc-400 hover:text-white transition-colors'
          >
            <svg className='w-5 h-5' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M4 6h16M4 12h16M4 18h16'
              />
            </svg>
          </button>

          {/* Title with gradient */}
          <h1 className="text-lg font-semibold bg-gradient-to-r from-sky-500 via-teal-500 to-cyan-400 bg-clip-text text-transparent font-['Space_Grotesk']">
            Chat with NANO AI
          </h1>

          {/* Spacer */}
          <div className='flex-1' />

          {/* Mode Tabs - Glass Effect */}
          <div className='hidden sm:flex items-center gap-1 bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-1'>
            <button
              type='button'
              className='px-3 py-1.5 rounded-lg text-sm font-medium bg-gradient-to-r from-sky-500 via-teal-500 to-cyan-400 text-white shadow-[0_0_20px_rgba(20,184,166,0.3)]'
            >
              Design
            </button>
            <button
              type='button'
              className='px-3 py-1.5 rounded-lg text-sm font-medium text-zinc-400 hover:text-white hover:bg-white/5 transition-colors'
            >
              Search
            </button>
            <button
              type='button'
              className='px-3 py-1.5 rounded-lg text-sm font-medium text-zinc-400 hover:text-white hover:bg-white/5 transition-colors'
            >
              Voice
            </button>
          </div>
        </header>

        {/* Messages Area - Glass Container */}
        <div className='flex-1 overflow-y-auto p-4'>
          <div className='max-w-4xl mx-auto space-y-6'>
            {messages.length > 0 ? (
              messages.map((message) => <ChatMessage key={message.id} message={message} />)
            ) : (
              <div className='h-full flex flex-col items-center justify-center text-center px-4 py-20'>
                {/* Logo with glow */}
                <div className='w-20 h-20 rounded-2xl bg-gradient-to-br from-sky-500 via-teal-500 to-cyan-400 flex items-center justify-center mb-6 shadow-[0_0_40px_rgba(20,184,166,0.3)]'>
                  <svg
                    className='w-10 h-10 text-white'
                    fill='none'
                    viewBox='0 0 24 24'
                    stroke='currentColor'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M13 10V3L4 14h7v7l9-11h-7z'
                    />
                  </svg>
                </div>
                <h2 className="text-xl font-semibold bg-gradient-to-r from-sky-500 via-teal-500 to-cyan-400 bg-clip-text text-transparent mb-2 font-['Space_Grotesk']">
                  How can I help you today?
                </h2>
                <p className='text-zinc-400 max-w-md'>
                  Ask me to brainstorm ideas, create designs, or help with your content strategy.
                </p>

                {/* Quick Prompts - Glass Pills */}
                <div className='mt-8 flex flex-wrap gap-2 justify-center max-w-lg'>
                  {[
                    'Create a LinkedIn banner',
                    'Design a YouTube thumbnail',
                    'Brainstorm content ideas',
                    'Help with my brand colors',
                  ].map((prompt) => (
                    <button
                      key={prompt}
                      type='button'
                      onClick={() => handleSend(prompt)}
                      className='px-4 py-2 bg-white/5 backdrop-blur-xl border border-white/10 hover:bg-white/10 hover:border-teal-500/30 rounded-full text-sm text-zinc-300 transition-all shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]'
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Loading Indicator - Glass Effect */}
            {isLoading && (
              <div className='flex gap-3'>
                <div className='w-8 h-8 rounded-full bg-gradient-to-br from-sky-500 via-teal-500 to-cyan-400 flex items-center justify-center flex-shrink-0 shadow-[0_0_20px_rgba(20,184,166,0.3)]'>
                  <svg
                    className='w-4 h-4 text-white'
                    fill='none'
                    viewBox='0 0 24 24'
                    stroke='currentColor'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M13 10V3L4 14h7v7l9-11h-7z'
                    />
                  </svg>
                </div>
                <div className='px-4 py-3 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl rounded-tl-sm shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]'>
                  <div className='flex gap-1'>
                    <div className='w-2 h-2 rounded-full bg-teal-400 animate-bounce delay-0' />
                    <div className='w-2 h-2 rounded-full bg-teal-400 animate-bounce delay-150' />
                    <div className='w-2 h-2 rounded-full bg-teal-400 animate-bounce delay-300' />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Input */}
        <ChatInput onSend={handleSend} isLoading={isLoading} />
      </div>
    </div>
  );
}

export default ChatBrainstormView;
