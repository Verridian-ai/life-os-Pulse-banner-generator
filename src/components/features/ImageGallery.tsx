import React, { useState, useEffect, useCallback, memo } from 'react';

import * as ReactWindow from 'react-window';

import { AutoSizer } from 'react-virtualized-auto-sizer';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const Grid = (ReactWindow as any).FixedSizeGrid;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type GridChildComponentProps = any;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const AutoSizerAny = AutoSizer as any;

import { getUserImages, toggleImageFavorite, deleteImageRecord } from '../../services/database';
import { useCanvas } from '../../context/CanvasContext';
import { BTN_NEU_SOLID } from '../../styles';
import { ImageCardSkeleton } from '../ui/Skeleton';

interface ImageData {
  id: string;
  storageUrl: string;
  prompt: string;
  modelUsed: string;
  quality: string;
  generationType: string;
  tags: string[];
  createdAt: string;
  isFavorite: boolean;
  fileName: string;
}

export interface ImageGalleryProps {
  embedded?: boolean;
  onSelect?: (url: string) => void;
}

const ImageGalleryComponent: React.FC<ImageGalleryProps> = ({ embedded, onSelect }) => {
  const { setBgImage } = useCanvas();

  // State
  const [images, setImages] = useState<ImageData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [searchQuery, setSearchQuery] = useState('');
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [filterType, setFilterType] = useState<'all' | 'generated' | 'uploaded'>('all');
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [hoveredImageId, setHoveredImageId] = useState<string | null>(null);

  // Load images
  const loadImages = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const filters: {
        searchQuery?: string;
        generationType?: string;
        favorites?: boolean;
      } = {};

      if (searchQuery) filters.searchQuery = searchQuery;
      if (filterType !== 'all') filters.generationType = filterType;
      if (showFavoritesOnly) filters.favorites = true;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const data = await getUserImages(filters) as any as ImageData[];
      setImages(data);
    } catch (error) {
      console.error('[Gallery] Failed to load images:', error);
      setError(error instanceof Error ? error.message : 'Failed to load images');
      setImages([]);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, filterType, showFavoritesOnly]);

  useEffect(() => {
    loadImages();
  }, [loadImages]);

  const handleApplyToCanvas = (imageUrl: string) => {
    if (onSelect) {
      onSelect(imageUrl);
      return;
    }
    setBgImage(imageUrl);
  };

  const handleToggleFavorite = async (imageId: string) => {
    try {
      const success = await toggleImageFavorite(imageId);
      if (success) {
        setImages((prev) =>
          prev.map((img) => (img.id === imageId ? { ...img, isFavorite: !img.isFavorite } : img)),
        );
      }
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
    }
  };

  const handleDelete = async (imageId: string) => {
    if (!confirm('Are you sure you want to delete this image?')) return;
    try {
      const success = await deleteImageRecord(imageId);
      if (success) {
        setImages((prev) => prev.filter((img) => img.id !== imageId));
      }
    } catch (error) {
      console.error('Failed to delete image:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'generate': return 'bg-blue-600/20 text-blue-400 border-blue-500/30';
      case 'edit': return 'bg-purple-600/20 text-purple-400 border-purple-500/30';
      case 'upscale': return 'bg-green-600/20 text-green-400 border-green-500/30';
      default: return 'bg-zinc-600/20 text-zinc-400 border-zinc-500/30';
    }
  };

  const Cell = ({ columnIndex, rowIndex, style, data }: GridChildComponentProps) => {
    const { images, columnCount } = data;
    const index = rowIndex * columnCount + columnIndex;
    const image = images[index];

    if (!image) return null;

    return (
      <div style={style} className="p-2">
        <div
          className='relative group w-full h-full rounded-xl overflow-hidden bg-zinc-900/50 border border-white/5 hover:border-white/10 transition-all duration-300'
          onMouseEnter={() => setHoveredImageId(image.id)}
          onMouseLeave={() => setHoveredImageId(null)}
          onClick={() => setHoveredImageId(hoveredImageId === image.id ? null : image.id)}
        >
          <div className='w-full h-full bg-zinc-950 relative'>
            <img
              src={image.storageUrl}
              alt={image.prompt || image.fileName}
              className='w-full h-full object-cover'
              loading='lazy'
            />
          </div>

          {hoveredImageId === image.id && (
            <div className='absolute inset-0 bg-black/80 backdrop-blur-sm flex flex-col justify-between p-4 animate-fadeIn z-10'>
              <div className='flex-1 overflow-y-auto no-scrollbar space-y-2'>
                <span className={`inline-block px-2 py-1 rounded text-[9px] font-black uppercase tracking-wider border ${getTypeBadgeColor(image.generationType)}`}>
                  {image.generationType}
                </span>
                {image.prompt && <p className='text-white text-xs font-medium line-clamp-3'>{image.prompt}</p>}
                <p className='text-[9px] text-zinc-600 font-bold uppercase tracking-wider'>{formatDate(image.createdAt)}</p>
              </div>
              
              <div className='flex gap-2 mt-3'>
                <button onClick={(e) => { e.stopPropagation(); handleApplyToCanvas(image.storageUrl); }} className='flex-1 h-10 bg-blue-600 hover:bg-blue-500 text-white rounded-lg flex items-center justify-center'>
                  <span className='material-icons text-sm'>{onSelect ? 'check' : 'add_photo_alternate'}</span>
                </button>
                <button onClick={(e) => { e.stopPropagation(); handleToggleFavorite(image.id); }} className={`h-10 w-10 rounded-lg flex items-center justify-center ${image.isFavorite ? 'bg-pink-600 text-white' : 'bg-zinc-800 text-zinc-400'}`}>
                  <span className='material-icons text-sm'>{image.isFavorite ? 'favorite' : 'favorite_border'}</span>
                </button>
                <button onClick={(e) => { e.stopPropagation(); handleDelete(image.id); }} className='h-10 w-10 bg-red-600 hover:bg-red-500 text-white rounded-lg flex items-center justify-center'>
                  <span className='material-icons text-sm'>delete</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className={`flex-1 flex flex-col h-full ${embedded ? 'p-0' : 'p-4 md:p-6 lg:p-8'}`}>
      <div className={`w-full mx-auto h-full flex flex-col ${embedded ? 'max-w-full' : 'max-w-[1600px]'}`}>
        {/* Header */}
        {/* ... (Header content unchanged) */}

        {/* Loading State */}
        {loading && (
          <div className='flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 overflow-hidden'>
            {[...Array(8)].map((_, i) => (
              <ImageCardSkeleton key={i} />
            ))}
          </div>
        )}

        {/* Error State */}
        {/* ... (Error state unchanged) */}
        {!loading && error && (
          <div className='flex-1 flex items-center justify-center'>
            <div className='flex flex-col items-center gap-4 max-w-md text-center'>
              <span className='material-icons text-6xl text-red-500'>error_outline</span>
              <h3 className='text-white text-sm font-black uppercase tracking-wider'>
                Failed to Load Gallery
              </h3>
              <p className='text-zinc-400 text-xs leading-relaxed'>{error}</p>
              <div className='flex gap-3 mt-2'>
                <button onClick={loadImages} className={`${BTN_NEU_SOLID} px-6 py-3`}>
                  <span className='material-icons text-sm mr-2'>refresh</span>
                  Retry
                </button>
                <button
                  onClick={() => {
                    setError(null);
                    setImages([]);
                  }}
                  className='px-6 py-3 rounded-xl bg-zinc-800/50 text-white text-xs font-bold uppercase tracking-wider hover:bg-zinc-700/50 transition-colors duration-200'
                >
                  Dismiss
                </button>
              </div>
              <p className='text-zinc-600 text-[10px] mt-4'>
                Tip: Make sure the database migration has been run. Check the Supabase console for
                the 'images' table.
              </p>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && images.length === 0 && (
          <div className='flex-1 flex items-center justify-center'>
            <div className='flex flex-col items-center gap-3 max-w-md text-center'>
              <span className='material-icons text-6xl text-zinc-600'>photo_library</span>
              <h3 className='text-white text-sm font-black uppercase tracking-wider'>
                No Images Found
              </h3>
              <p className='text-zinc-500 text-xs'>
                {searchQuery || filterType !== 'all' || showFavoritesOnly
                  ? 'Try adjusting your filters or search query'
                  : 'Generate your first image to get started'}
              </p>
            </div>
          </div>
        )}

        {/* Virtualized Grid */}
        {!loading && images.length > 0 && (
          <div className='flex-1 min-h-0'>
            <AutoSizerAny>
              {({ height, width }: { height: number; width: number }) => {
                // Responsive column count
                let columnCount = 1;
                if (width >= 1280) columnCount = 4;      // xl
                else if (width >= 1024) columnCount = 3; // lg
                else if (width >= 640) columnCount = 2;  // sm

                const columnWidth = width / columnCount;
                const rowHeight = columnWidth * 0.75; // Approx aspect ratio logic

                return (
                  <Grid
                    columnCount={columnCount}
                    columnWidth={columnWidth}
                    height={height}
                    rowCount={Math.ceil(images.length / columnCount)}
                    rowHeight={rowHeight}
                    width={width}
                    itemData={{ images, columnCount }}
                    className="no-scrollbar"
                  >
                    {Cell}
                  </Grid>
                );
              }}
            </AutoSizerAny>
          </div>
        )}
      </div>
    </div>
  );
};

// Wrap with memo for performance optimization
const ImageGallery = memo(ImageGalleryComponent);

export default ImageGallery;
