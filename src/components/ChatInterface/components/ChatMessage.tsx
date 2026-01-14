import React from 'react';
import { ChatMessageProps } from '../types';
import { BTN_BASE, BTN_NEU_WHITE } from '../constants';
import { extractPrompts } from '../utils';

/**
 * ChatMessage Component
 *
 * Renders a single chat message with:
 * - Message content with proper styling for user/model roles
 * - Image attachments display
 * - PROMPT: extraction and generate buttons
 * - Grounding URLs (search mode)
 * - Thinking indicator (Gemini reasoning)
 */
export const ChatMessage: React.FC<ChatMessageProps> = ({ message, onGenerateFromPrompt }) => {
  const detectedPrompts = message.role === 'model' ? extractPrompts(message.text) : [];

  return (
    <div className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[85%] md:max-w-[70%] rounded-2xl p-6 shadow-sm ${
          message.role === 'user'
            ? 'bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-br-sm shadow-[0_0_15px_rgba(37,99,235,0.2)]'
            : 'bg-white/5 text-zinc-200 rounded-bl-sm border border-white/5 shadow-lg'
        }`}
      >
        {/* Images in message */}
        {message.images && message.images.length > 0 && (
          <div className='flex flex-wrap gap-2 mb-3'>
            {message.images.map((img, idx) => (
              <img
                key={idx}
                src={img}
                alt='attachment'
                className='w-24 h-24 object-cover rounded-xl border border-white/10 shadow-md'
              />
            ))}
          </div>
        )}

        {/* Message Text - Hide PROMPT: markers */}
        <div className='whitespace-pre-wrap leading-relaxed text-sm font-medium drop-shadow-[0_1px_1px_rgba(0,0,0,0.5)]'>
          {message.text.split('PROMPT:').map((part, partIdx) => {
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
                  type='button'
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

        {/* Thinking Indicator */}
        {message.isThinking && (
          <div className='mt-4 text-[10px] text-zinc-500 font-black uppercase tracking-widest flex items-center gap-2 opacity-70'>
            <span className='w-1.5 h-1.5 bg-purple-500 rounded-full animate-pulse'></span>
            Gemini 3 Pro Reasoning
          </div>
        )}

        {/* Grounding URLs (Search Mode) */}
        {message.groundingUrls && (
          <div className='mt-4 pt-4 border-t border-white/10'>
            <p className='text-[10px] font-black mb-2 text-zinc-500 uppercase tracking-widest'>
              References
            </p>
            <ul className='space-y-2'>
              {message.groundingUrls.map((g, idx) => (
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
};
