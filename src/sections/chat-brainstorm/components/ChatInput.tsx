import React, { useState, useRef } from 'react';

interface ChatInputProps {
  onSend: (message: string, attachments?: File[]) => void;
  isLoading?: boolean;
}

export function ChatInput({ onSend, isLoading }: ChatInputProps) {
  const [message, setMessage] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() || attachments.length > 0) {
      onSend(message, attachments);
      setMessage('');
      setAttachments([]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setAttachments(Array.from(e.target.files));
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <form onSubmit={handleSubmit} className='p-4 border-t border-white/10'>
      {/* Attachments Preview */}
      {attachments.length > 0 && (
        <div className='flex gap-2 mb-3 overflow-x-auto pb-2'>
          {attachments.map((file, i) => (
            <div key={i} className='relative flex-shrink-0'>
              <img
                src={URL.createObjectURL(file)}
                alt={file.name}
                className='w-16 h-16 object-cover rounded-lg border border-white/10 shadow-[0_4px_12px_rgba(0,0,0,0.3)]'
              />
              <button
                type='button'
                onClick={() => removeAttachment(i)}
                className='absolute -top-2 -right-2 w-5 h-5 bg-white/10 backdrop-blur-xl border border-white/20 rounded-full flex items-center justify-center text-zinc-300 hover:bg-white/20 transition-colors'
              >
                <svg className='w-3 h-3' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M6 18L18 6M6 6l12 12'
                  />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Input Area - Neumorphic Container */}
      <div className='flex items-end gap-3 p-3 rounded-2xl bg-zinc-900/50 shadow-[4px_4px_8px_rgba(0,0,0,0.4),-4px_-4px_8px_rgba(255,255,255,0.05)]'>
        {/* Attachment Button - Glass Effect */}
        <button
          type='button'
          onClick={() => fileInputRef.current?.click()}
          className='w-10 h-10 rounded-xl bg-white/5 backdrop-blur-xl border border-white/10 hover:bg-white/10 hover:border-teal-500/30 flex items-center justify-center text-zinc-400 hover:text-teal-400 transition-all flex-shrink-0 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]'
        >
          <svg className='w-5 h-5' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z'
            />
          </svg>
        </button>
        <input
          ref={fileInputRef}
          type='file'
          accept='image/*'
          multiple
          onChange={handleFileChange}
          className='hidden'
        />

        {/* Text Input - Glass Effect */}
        <div className='flex-1 relative'>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
            placeholder='Ask NANO AI anything...'
            rows={1}
            className='w-full px-4 py-3 bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-teal-500/50 focus:shadow-[0_0_20px_rgba(20,184,166,0.15)] transition-all resize-none shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] min-h-12 max-h-[120px]'
          />
        </div>

        {/* Send Button - Gradient with Glow */}
        <button
          type='submit'
          disabled={(!message.trim() && attachments.length === 0) || isLoading}
          className='w-10 h-10 rounded-xl bg-gradient-to-r from-sky-500 via-teal-500 to-cyan-400 flex items-center justify-center text-white disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0 hover:shadow-[0_0_25px_rgba(20,184,166,0.4)] transition-all shadow-[0_0_15px_rgba(20,184,166,0.25)]'
        >
          {isLoading ? (
            <svg className='w-5 h-5 animate-spin' fill='none' viewBox='0 0 24 24'>
              <circle
                className='opacity-25'
                cx='12'
                cy='12'
                r='10'
                stroke='currentColor'
                strokeWidth='4'
              />
              <path
                className='opacity-75'
                fill='currentColor'
                d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z'
              />
            </svg>
          ) : (
            <svg className='w-5 h-5' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M12 19l9 2-9-18-9 18 9-2zm0 0v-8'
              />
            </svg>
          )}
        </button>
      </div>
    </form>
  );
}

export default ChatInput;
