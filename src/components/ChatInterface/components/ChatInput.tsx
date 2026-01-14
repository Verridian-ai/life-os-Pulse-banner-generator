import React from 'react';
import { ChatInputProps } from '../types';

/**
 * ChatInput Component
 *
 * Renders the chat input area including:
 * - Textarea for message input with proper styling
 * - File upload button for attaching images
 * - Attached image preview with remove buttons
 * - Send button
 * - Enter key submission (Shift+Enter for new line)
 */
export const ChatInput: React.FC<ChatInputProps> = ({
  value,
  onChange,
  onSend,
  loading,
  mode,
  attachedImages,
  onImageUpload,
  onRemoveImage,
  processingFiles,
  fileInputRef,
}) => {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      onImageUpload(e.target.files);
    }
  };

  return (
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
                type='button'
                onClick={() => onRemoveImage(idx)}
                className='absolute -top-2 -right-2 bg-zinc-800 text-white border border-zinc-700 rounded-full w-6 h-6 flex items-center justify-center text-xs shadow-lg hover:bg-red-500 transition'
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      <div className='flex gap-4 items-end'>
        {/* File Upload Button */}
        <button
          type='button'
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

        {/* Hidden File Input */}
        <input
          type='file'
          id='chat-file-upload'
          aria-label='Upload images'
          multiple
          ref={fileInputRef}
          className='hidden'
          accept='image/*'
          onChange={handleFileChange}
        />

        {/* Message Input Textarea */}
        <div className='flex-1 relative'>
          <textarea
            className='w-full bg-black/40 border border-white/10 rounded-3xl px-6 py-3.5 text-white font-bold placeholder-zinc-500 focus:border-white/20 focus-ring focus:bg-black/60 resize-none h-[52px] max-h-[120px] shadow-[inset_0_2px_6px_rgba(0,0,0,0.5)] transition-all'
            placeholder={mode === 'design' ? 'CHAT WITH NANO...' : 'SEARCH TRENDS...'}
            aria-label='Chat message'
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        </div>

        {/* Send Button */}
        <button
          type='button'
          onClick={onSend}
          disabled={loading || (!value.trim() && attachedImages.length === 0)}
          className={`h-12 w-12 rounded-full font-bold transition flex items-center justify-center shrink-0 ${
            loading
              ? 'bg-zinc-700 opacity-50'
              : 'bg-white text-black shadow-[0_0_15px_rgba(255,255,255,0.2)] hover:scale-[1.05] active:scale-[0.95]'
          }`}
        >
          <span className='material-icons drop-shadow-sm'>arrow_upward</span>
        </button>
      </div>
    </div>
  );
};
