import React from 'react';

interface PostPreviewProps {
  content: string;
  image?: string | null;
}

export const PostPreview: React.FC<PostPreviewProps> = ({ content, image }) => {
  return (
    <div className='bg-zinc-900/50 backdrop-blur-md rounded-3xl border border-white/5 p-6 shadow-2xl space-y-4'>
      <div className='flex items-center justify-between'>
        <h3 className='text-[10px] font-black text-zinc-500 uppercase tracking-widest'>
          LIVE PREVIEW
        </h3>
        <span className='material-icons text-zinc-500 text-sm'>devices</span>
      </div>

      <div className='bg-white/5 border border-white/10 rounded-2xl overflow-hidden shadow-inner'>
        {/* Post Content Area */}
        <div className='p-5 space-y-4'>
          {/* Mock Header */}
          <div className='flex items-center gap-3 mb-4'>
            <div className='w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600' />
            <div className='space-y-1'>
              <div className='h-3 w-24 bg-zinc-700 rounded-sm' />
              <div className='h-2 w-32 bg-zinc-800 rounded-sm' />
            </div>
          </div>

          {/* Actual Content */}
          <div className='text-zinc-200 text-sm leading-relaxed whitespace-pre-wrap break-words min-h-[100px]'>
            {content || (
              <span className='text-zinc-600 italic'>Post content will appear here...</span>
            )}
          </div>

          {/* Social Proof Placeholder */}
          <div className='pt-4 border-t border-white/5 flex items-center justify-between text-zinc-500'>
            <div className='flex items-center gap-4'>
              <span className='material-icons text-sm'>thumb_up_off_alt</span>
              <span className='material-icons text-sm'>chat_bubble_outline</span>
              <span className='material-icons text-sm'>share</span>
            </div>
            <div className='flex items-center gap-1'>
              <div className='h-2 w-12 bg-zinc-800 rounded-sm' />
            </div>
          </div>
        </div>

        {/* Post Media (Optional) */}
        {image && (
          <div className='border-t border-white/5 aspect-video overflow-hidden'>
            <img src={image} alt='Post Content' className='w-full h-full object-cover' />
          </div>
        )}
      </div>

      <p className='text-[9px] text-zinc-600 text-center tracking-wide uppercase font-bold'>
        Simulated LinkedIn Desktop View
      </p>
    </div>
  );
};
