import React from 'react';

interface PostPreviewProps {
  authorName: string;
  authorTitle: string;
  authorAvatar?: string;
  content: string;
  imageUrl?: string;
}

export function PostPreview({ authorName, authorTitle, authorAvatar, content, imageUrl }: PostPreviewProps) {
  return (
    <div className="bg-white/5 backdrop-blur-xl border border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] rounded-2xl overflow-hidden">
      {/* LinkedIn-style white card preview */}
      <div className="bg-white rounded-xl m-3 overflow-hidden shadow-lg">
        {/* Post Header */}
        <div className="p-4 flex items-start gap-3">
          {/* Avatar with LinkedIn blue gradient */}
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-600 via-blue-500 to-cyan-400 flex items-center justify-center text-white font-semibold flex-shrink-0 shadow-[0_0_15px_rgba(59,130,246,0.3)]">
            {authorAvatar ? (
              <img src={authorAvatar} alt={authorName} className="w-full h-full rounded-full object-cover" />
            ) : (
              authorName.charAt(0)
            )}
          </div>

          {/* Author Info */}
          <div className="flex-1">
            <h4 className="font-semibold text-zinc-900">{authorName}</h4>
            <p className="text-sm text-zinc-500 line-clamp-1">{authorTitle}</p>
            <p className="text-xs text-zinc-400 mt-0.5">Just now</p>
          </div>

          {/* More Button */}
          <button className="text-zinc-400 hover:text-zinc-600">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="px-4 pb-3">
          <p className="text-zinc-900 text-sm whitespace-pre-wrap leading-relaxed">
            {content || 'Your post content will appear here...'}
          </p>
        </div>

        {/* Image */}
        {imageUrl && (
          <div className="w-full aspect-video bg-zinc-100">
            <img src={imageUrl} alt="Post" className="w-full h-full object-cover" />
          </div>
        )}

        {/* Engagement Stats */}
        <div className="px-4 py-2 flex items-center justify-between border-b border-zinc-100">
          <div className="flex items-center gap-1">
            <div className="flex -space-x-1">
              <span className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center text-[10px] text-white">+</span>
              <span className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center text-[10px] text-white">+</span>
              <span className="w-5 h-5 rounded-full bg-yellow-500 flex items-center justify-center text-[10px] text-white">+</span>
            </div>
            <span className="text-xs text-zinc-500 ml-1">1,234</span>
          </div>
          <span className="text-xs text-zinc-500">89 comments - 23 reposts</span>
        </div>

        {/* Action Buttons */}
        <div className="px-2 py-1 flex items-center justify-around">
          {[
            { icon: 'like', label: 'Like' },
            { icon: 'comment', label: 'Comment' },
            { icon: 'repost', label: 'Repost' },
            { icon: 'send', label: 'Send' },
          ].map((action) => (
            <button
              key={action.label}
              className="flex items-center gap-2 px-4 py-3 text-zinc-600 hover:bg-zinc-50 rounded-lg transition-colors"
            >
              {action.icon === 'like' && (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                </svg>
              )}
              {action.icon === 'comment' && (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              )}
              {action.icon === 'repost' && (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
              )}
              {action.icon === 'send' && (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              )}
              <span className="text-sm font-medium">{action.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default PostPreview;
