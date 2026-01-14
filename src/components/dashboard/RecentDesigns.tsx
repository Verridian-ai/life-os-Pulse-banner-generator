/**
 * RecentDesigns - Grid of recent design cards
 *
 * Signal Design System: Glass cards with hover effects
 * Features: Thumbnail preview, title, date, quick actions, improved empty state
 * Enhanced: Platform badges, search, duplicate, dimensions display
 */

import React, { useState, useMemo } from 'react';
import {
  MoreVertical,
  Trash2,
  Share2,
  Clock,
  Sparkles,
  ArrowRight,
  Image,
  Search,
  Copy,
  X,
} from 'lucide-react';
import type { Design } from '../../types/database';

// Platform badge styles matching CanvasFormatSelector
const PLATFORM_BADGE_STYLES: Record<string, { bg: string; text: string; border: string }> = {
  linkedin: {
    bg: 'bg-blue-500/20',
    text: 'text-blue-400',
    border: 'border-blue-500/30',
  },
  facebook: {
    bg: 'bg-indigo-500/20',
    text: 'text-indigo-400',
    border: 'border-indigo-500/30',
  },
  x: {
    bg: 'bg-zinc-500/20',
    text: 'text-zinc-300',
    border: 'border-zinc-500/30',
  },
  instagram: {
    bg: 'bg-pink-500/20',
    text: 'text-pink-400',
    border: 'border-pink-500/30',
  },
  youtube: {
    bg: 'bg-red-500/20',
    text: 'text-red-400',
    border: 'border-red-500/30',
  },
  tiktok: {
    bg: 'bg-cyan-500/20',
    text: 'text-cyan-400',
    border: 'border-cyan-500/30',
  },
};

// Platform logo paths
const PLATFORM_LOGOS: Record<string, string> = {
  linkedin: '/assets/platforms/linkedin.svg',
  facebook: '/assets/platforms/facebook.svg',
  x: '/assets/platforms/x.svg',
  instagram: '/assets/platforms/instagram.svg',
  youtube: '/assets/platforms/youtube.svg',
  tiktok: '/assets/platforms/tiktok.svg',
};

interface RecentDesignsProps {
  designs: Design[];
  onDesignClick: (design: Design) => void;
  onDeleteDesign?: (design: Design) => void;
  onShareDesign?: (design: Design) => void;
  onDuplicateDesign?: (design: Design) => void;
  onViewAll?: () => void;
  isLoading?: boolean;
  className?: string;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMinutes = Math.floor(diffMs / (1000 * 60));

  if (diffMinutes < 1) return 'Just now';
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// Extract platform from canvas_data or infer from dimensions
function getPlatformFromDesign(design: Design): string | null {
  // Try to get from canvas_data
  const canvasData = design.canvas_data as Record<string, unknown> | undefined;
  if (canvasData?.canvasFormatId) {
    const formatId = canvasData.canvasFormatId as string;
    if (formatId.startsWith('linkedin')) return 'linkedin';
    if (formatId.startsWith('facebook')) return 'facebook';
    if (formatId.startsWith('x_')) return 'x';
    if (formatId.startsWith('instagram')) return 'instagram';
    if (formatId.startsWith('youtube')) return 'youtube';
    if (formatId.startsWith('tiktok')) return 'tiktok';
  }

  // Infer from dimensions
  const { width, height } = design;
  if (width === 1584 && height === 396) return 'linkedin';
  if (width === 1128 && height === 191) return 'linkedin';
  if (width === 820 && height === 360) return 'facebook';
  if (width === 1500 && height === 500) return 'x';
  if (width === 1080 && height === 1080) return 'instagram';
  if (width === 1080 && height === 1920) return 'instagram'; // Could be TikTok too
  if (width === 2560 && height === 1440) return 'youtube';
  if (width === 1280 && height === 720) return 'youtube';

  return null;
}

function PlatformBadge({ platform }: { platform: string | null }) {
  if (!platform) return null;

  const styles = PLATFORM_BADGE_STYLES[platform] || PLATFORM_BADGE_STYLES.linkedin;
  const logo = PLATFORM_LOGOS[platform];

  return (
    <div
      className={`absolute top-3 left-3 px-2 py-1 rounded-lg backdrop-blur-sm flex items-center gap-1.5 border ${styles.bg} ${styles.border}`}
    >
      {logo && <img src={logo} alt={platform} className='w-3.5 h-3.5' />}
      <span className={`text-[10px] font-bold uppercase tracking-wide ${styles.text}`}>
        {platform}
      </span>
    </div>
  );
}

function DesignCard({
  design,
  onClick,
  onDelete,
  onShare,
  onDuplicate,
}: {
  design: Design;
  onClick: () => void;
  onDelete?: () => void;
  onShare?: () => void;
  onDuplicate?: () => void;
}) {
  const [showMenu, setShowMenu] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const menuRef = React.useRef<HTMLDivElement>(null);

  const platform = getPlatformFromDesign(design);

  // Close menu on click outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };
    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showMenu]);

  return (
    <div className='group relative bg-zinc-900/80 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden transition-all duration-300 hover:border-sky-500/40 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-sky-900/20'>
      {/* Thumbnail */}
      <button
        onClick={onClick}
        type='button'
        className='w-full aspect-video bg-zinc-800/50 relative overflow-hidden focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:ring-inset'
      >
        {design.thumbnail_url && !imageError ? (
          <>
            {/* Loading shimmer */}
            {!imageLoaded && (
              <div className='absolute inset-0 bg-gradient-to-r from-zinc-800 via-zinc-700 to-zinc-800 animate-pulse' />
            )}
            <img
              src={design.thumbnail_url}
              alt={design.title}
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageError(true)}
              className={`w-full h-full object-cover group-hover:scale-105 transition-all duration-500 ease-out ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
            />
          </>
        ) : (
          <div className='w-full h-full flex items-center justify-center bg-gradient-to-br from-zinc-800/80 to-zinc-900'>
            <div className='text-center'>
              <div className='w-12 h-12 rounded-xl bg-zinc-700/50 flex items-center justify-center mx-auto mb-2'>
                <Image className='w-6 h-6 text-zinc-500' />
              </div>
              <span className='text-xs text-zinc-500 font-medium'>No preview</span>
            </div>
          </div>
        )}

        {/* Platform Badge */}
        <PlatformBadge platform={platform} />

        {/* Hover overlay with gradient */}
        <div className='absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center'>
          <span className='px-5 py-2.5 bg-sky-500 backdrop-blur rounded-xl text-sm font-bold text-white shadow-xl shadow-sky-900/30 transform scale-90 group-hover:scale-100 transition-transform duration-300'>
            Open Design
          </span>
        </div>
      </button>

      {/* Content */}
      <div className='p-4'>
        <div className='flex items-start justify-between gap-2'>
          <div className='flex-1 min-w-0'>
            <h3 className='font-bold text-white text-sm truncate group-hover:text-sky-100 transition-colors'>
              {design.title}
            </h3>
            <div className='flex items-center gap-1.5 mt-1.5 text-zinc-500'>
              <Clock className='w-3 h-3' />
              <span className='text-xs font-medium'>{formatDate(design.updated_at)}</span>
              {/* Dimensions display */}
              {design.width && design.height && (
                <>
                  <span className='text-zinc-600 mx-1'>•</span>
                  <span className='text-xs text-zinc-500 font-medium'>
                    {design.width}×{design.height}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Menu Button */}
          <div className='relative' ref={menuRef}>
            <button
              type='button'
              onClick={(e) => {
                e.stopPropagation();
                setShowMenu(!showMenu);
              }}
              className='p-2 rounded-lg hover:bg-white/10 text-zinc-500 hover:text-white transition-all duration-200 opacity-0 group-hover:opacity-100 focus:opacity-100'
              aria-label='More options'
            >
              <MoreVertical className='w-4 h-4' />
            </button>

            {/* Dropdown Menu */}
            {showMenu && (
              <div className='absolute right-0 top-full mt-1 w-44 bg-zinc-900/98 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200'>
                {onDuplicate && (
                  <button
                    type='button'
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowMenu(false);
                      onDuplicate();
                    }}
                    className='w-full flex items-center gap-3 px-4 py-2.5 text-sm text-zinc-400 hover:text-white hover:bg-white/5 transition-colors'
                  >
                    <Copy className='w-4 h-4' />
                    Duplicate
                  </button>
                )}
                {onShare && (
                  <button
                    type='button'
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowMenu(false);
                      onShare();
                    }}
                    className='w-full flex items-center gap-3 px-4 py-2.5 text-sm text-zinc-400 hover:text-white hover:bg-white/5 transition-colors'
                  >
                    <Share2 className='w-4 h-4' />
                    Share
                  </button>
                )}
                {onDelete && (
                  <button
                    type='button'
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowMenu(false);
                      onDelete();
                    }}
                    className='w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors'
                  >
                    <Trash2 className='w-4 h-4' />
                    Delete
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Tags - improved styling */}
        {design.tags && design.tags.length > 0 && (
          <div className='flex flex-wrap gap-1.5 mt-3'>
            {design.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className='px-2.5 py-1 bg-white/5 hover:bg-white/10 rounded-lg text-[10px] text-zinc-400 font-medium transition-colors cursor-default'
              >
                {tag}
              </span>
            ))}
            {design.tags.length > 3 && (
              <span className='px-2.5 py-1 text-[10px] text-zinc-500 font-medium'>
                +{design.tags.length - 3}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className='bg-zinc-900/80 border border-white/5 rounded-2xl overflow-hidden'>
      {/* Thumbnail skeleton with shimmer */}
      <div className='aspect-video bg-zinc-800/50 relative overflow-hidden'>
        <div className='absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer bg-[length:200%_100%]' />
      </div>
      <div className='p-4 space-y-3'>
        <div className='h-4 bg-zinc-800/50 rounded-lg w-3/4' />
        <div className='h-3 bg-zinc-800/30 rounded-lg w-1/2' />
        <div className='flex gap-1.5 mt-3'>
          <div className='h-5 w-12 bg-zinc-800/30 rounded-md' />
          <div className='h-5 w-16 bg-zinc-800/30 rounded-md' />
        </div>
      </div>
    </div>
  );
}

export function RecentDesigns({
  designs,
  onDesignClick,
  onDeleteDesign,
  onShareDesign,
  onDuplicateDesign,
  onViewAll,
  isLoading = false,
  className = '',
}: RecentDesignsProps) {
  const [searchQuery, setSearchQuery] = useState('');

  // Filter designs based on search query
  const filteredDesigns = useMemo(() => {
    if (!searchQuery.trim()) return designs;

    const query = searchQuery.toLowerCase();
    return designs.filter((design) => {
      const matchesTitle = design.title.toLowerCase().includes(query);
      const matchesTags = design.tags?.some((tag) => tag.toLowerCase().includes(query));
      const platform = getPlatformFromDesign(design);
      const matchesPlatform = platform?.toLowerCase().includes(query);
      return matchesTitle || matchesTags || matchesPlatform;
    });
  }, [designs, searchQuery]);

  if (isLoading) {
    return (
      <section className={`${className}`}>
        <div className='flex items-center justify-between mb-5'>
          <div className='flex items-center gap-3'>
            <div className='w-1 h-6 bg-gradient-to-b from-sky-400 to-teal-400 rounded-full' />
            <h2 className='text-lg font-bold text-white'>Recent Designs</h2>
          </div>
          <div className='h-5 w-16 bg-zinc-800/50 rounded-lg animate-pulse' />
        </div>
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5'>
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </section>
    );
  }

  if (designs.length === 0) {
    return (
      <section className={`${className}`}>
        <div className='flex items-center justify-between mb-5'>
          <div className='flex items-center gap-3'>
            <div className='w-1 h-6 bg-gradient-to-b from-sky-400 to-teal-400 rounded-full' />
            <h2 className='text-lg font-bold text-white'>Recent Designs</h2>
          </div>
        </div>
        <div className='bg-gradient-to-br from-zinc-900/80 to-zinc-900/40 backdrop-blur-sm border border-white/5 rounded-2xl p-10 text-center relative overflow-hidden'>
          {/* Decorative background elements */}
          <div className='absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-sky-500/5 to-teal-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2' />
          <div className='absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-sky-500/5 to-teal-500/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2' />

          <div className='relative z-10'>
            <div className='w-20 h-20 rounded-2xl bg-gradient-to-br from-sky-500/20 to-teal-500/20 flex items-center justify-center mx-auto mb-5 shadow-xl shadow-sky-900/10'>
              <Sparkles className='w-10 h-10 text-sky-400' />
            </div>
            <h3 className='text-xl font-bold text-white mb-2'>Start Creating</h3>
            <p className='text-sm text-zinc-400 max-w-sm mx-auto leading-relaxed'>
              Choose a platform above to create your first stunning design with AI assistance
            </p>
            <div className='flex items-center justify-center gap-2 mt-6 text-sky-400 text-sm font-medium'>
              <span>Select a platform to begin</span>
              <ArrowRight className='w-4 h-4 animate-bounce-x' />
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={`${className}`}>
      {/* Header with search */}
      <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5'>
        <div className='flex items-center gap-3'>
          <div className='w-1 h-6 bg-gradient-to-b from-sky-400 to-teal-400 rounded-full' />
          <h2 className='text-lg font-bold text-white'>Recent Designs</h2>
          <span className='px-2.5 py-1 bg-white/5 rounded-full text-xs text-zinc-400 font-medium'>
            {filteredDesigns.length}
            {searchQuery && ` / ${designs.length}`}
          </span>
        </div>

        <div className='flex items-center gap-3'>
          {/* Search bar */}
          <div className='relative'>
            <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500' />
            <input
              type='text'
              placeholder='Search designs...'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className='w-full sm:w-64 pl-10 pr-8 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-sky-500/50 transition-colors'
            />
            {searchQuery && (
              <button
                type='button'
                onClick={() => setSearchQuery('')}
                className='absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-md hover:bg-white/10 text-zinc-500 hover:text-white transition-colors'
              >
                <X className='w-3.5 h-3.5' />
              </button>
            )}
          </div>

          {/* View All button */}
          <button
            type='button'
            onClick={onViewAll}
            className='group flex items-center gap-1.5 text-sm text-sky-400 hover:text-sky-300 font-medium transition-colors whitespace-nowrap'
          >
            View All
            <ArrowRight className='w-4 h-4 group-hover:translate-x-0.5 transition-transform' />
          </button>
        </div>
      </div>

      {/* No results message */}
      {filteredDesigns.length === 0 && searchQuery && (
        <div className='bg-zinc-900/50 border border-white/5 rounded-2xl p-8 text-center'>
          <Search className='w-10 h-10 text-zinc-600 mx-auto mb-3' />
          <p className='text-zinc-400 text-sm'>No designs found for "{searchQuery}"</p>
          <button
            type='button'
            onClick={() => setSearchQuery('')}
            className='mt-3 text-sky-400 hover:text-sky-300 text-sm font-medium transition-colors'
          >
            Clear search
          </button>
        </div>
      )}

      {/* Design grid */}
      {filteredDesigns.length > 0 && (
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5'>
          {filteredDesigns.map((design) => (
            <DesignCard
              key={design.id}
              design={design}
              onClick={() => onDesignClick(design)}
              onDelete={onDeleteDesign ? () => onDeleteDesign(design) : undefined}
              onShare={onShareDesign ? () => onShareDesign(design) : undefined}
              onDuplicate={onDuplicateDesign ? () => onDuplicateDesign(design) : undefined}
            />
          ))}
        </div>
      )}
    </section>
  );
}

export default RecentDesigns;
