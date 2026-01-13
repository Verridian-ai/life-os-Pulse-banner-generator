import React, { useState } from 'react';

interface Design {
  id: string;
  title: string;
  platform: string;
  thumbnailUrl: string;
  updatedAt: string;
}

interface RecentDesignCardProps {
  design: Design;
  onClick: (designId: string) => void;
  onDelete?: (designId: string) => void;
  onDuplicate?: (designId: string) => void;
}

export function RecentDesignCard({ design, onClick, onDelete, onDuplicate }: RecentDesignCardProps) {
  const [showMenu, setShowMenu] = useState(false);

  const getPlatformColor = (platform: string) => {
    const colors: Record<string, string> = {
      linkedin: 'bg-blue-600',
      youtube: 'bg-red-600',
      instagram: 'bg-gradient-to-r from-purple-600 to-pink-500',
      facebook: 'bg-blue-500',
      tiktok: 'bg-zinc-900',
      x: 'bg-zinc-800',
    };
    return colors[platform] || 'bg-zinc-700';
  };

  return (
    <div className="group relative bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden hover:border-zinc-700 transition-all">
      {/* Thumbnail */}
      <button
        onClick={() => onClick(design.id)}
        className="w-full aspect-video bg-zinc-800 relative overflow-hidden"
      >
        {design.thumbnailUrl ? (
          <img
            src={design.thumbnailUrl}
            alt={design.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg className="w-12 h-12 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}

        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <span className="px-4 py-2 bg-white text-black font-medium rounded-lg">
            Open
          </span>
        </div>
      </button>

      {/* Info */}
      <div className="p-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-medium text-white truncate">{design.title}</h4>
            <p className="text-xs text-zinc-500 mt-0.5">{design.updatedAt}</p>
          </div>

          {/* Platform Badge */}
          <div className={`w-6 h-6 rounded-md ${getPlatformColor(design.platform)} flex items-center justify-center flex-shrink-0`}>
            <span className="text-[10px] font-bold text-white uppercase">
              {design.platform.charAt(0)}
            </span>
          </div>
        </div>
      </div>

      {/* Menu Button */}
      <div className="absolute top-2 right-2">
        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowMenu(!showMenu);
          }}
          className="w-8 h-8 rounded-lg bg-black/50 backdrop-blur opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white hover:bg-black/70"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
          </svg>
        </button>

        {/* Dropdown Menu */}
        {showMenu && (
          <div className="absolute top-10 right-0 w-36 bg-zinc-800 border border-zinc-700 rounded-lg shadow-xl overflow-hidden z-10">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDuplicate?.(design.id);
                setShowMenu(false);
              }}
              className="w-full px-3 py-2 text-left text-sm text-zinc-300 hover:bg-zinc-700 transition-colors"
            >
              Duplicate
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete?.(design.id);
                setShowMenu(false);
              }}
              className="w-full px-3 py-2 text-left text-sm text-red-400 hover:bg-zinc-700 transition-colors"
            >
              Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default RecentDesignCard;
