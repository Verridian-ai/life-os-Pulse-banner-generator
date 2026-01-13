import React from 'react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  attachments?: { type: 'image'; url: string }[];
  timestamp: Date;
}

interface ChatMessageProps {
  message: Message;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user';

  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : ''}`}>
      {/* Avatar */}
      <div
        className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center ${
          isUser
            ? 'bg-gradient-to-br from-sky-500 to-sky-600 shadow-[0_0_15px_rgba(14,165,233,0.3)]'
            : 'bg-gradient-to-br from-sky-500 via-teal-500 to-cyan-400 shadow-[0_0_20px_rgba(20,184,166,0.3)]'
        }`}
      >
        {isUser ? (
          <span className="text-sm font-semibold text-white">U</span>
        ) : (
          <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        )}
      </div>

      {/* Content */}
      <div className={`max-w-[80%] ${isUser ? 'text-right' : ''}`}>
        {/* Attachments */}
        {message.attachments && message.attachments.length > 0 && (
          <div className="mb-2">
            {message.attachments.map((attachment, i) => (
              <img
                key={i}
                src={attachment.url}
                alt="Attachment"
                className="max-w-xs rounded-xl border border-white/10 shadow-[0_4px_20px_rgba(0,0,0,0.3)]"
              />
            ))}
          </div>
        )}

        {/* Text - Glass Effect for both user and assistant */}
        <div
          className={`inline-block px-4 py-3 rounded-2xl ${
            isUser
              ? 'bg-gradient-to-r from-sky-500 via-teal-500 to-cyan-400 text-white rounded-tr-sm shadow-[0_0_25px_rgba(20,184,166,0.25)]'
              : 'bg-white/5 backdrop-blur-xl border border-white/10 text-zinc-100 rounded-tl-sm shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]'
          }`}
        >
          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
        </div>

        {/* Timestamp */}
        <p className="text-xs text-zinc-600 mt-1">
          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
    </div>
  );
}

export default ChatMessage;
