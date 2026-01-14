import { useState, useEffect, useCallback, memo } from 'react';

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
import { ConfirmationModal } from '../ui/ConfirmationModal';

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
  onNavigateToStudio?: () => void;
}

// ============================================================================
// Pure helper functions (module scope for stability)
// ============================================================================

/**
 * Format date string to readable format
 */
function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/**
 * Get badge color classes based on generation type
 */
function getTypeBadgeColor(type: string): string {
  switch (type) {
    case 'generate':
      return 'bg-blue-600/20 text-blue-400 border-blue-500/30';
    case 'edit':
      return 'bg-purple-600/20 text-purple-400 border-purple-500/30';
    case 'upscale':
      return 'bg-green-600/20 text-green-400 border-green-500/30';
    default:
      return 'bg-zinc-600/20 text-zinc-400 border-zinc-500/30';
  }
}

// ============================================================================
// Cell item data interface (passed through react-window itemData)
// ============================================================================

interface CellItemData {
  images: ImageData[];
  columnCount: number;
  hoveredImageId: string | null;
  onHover: (id: string | null) => void;
  onApplyToCanvas: (url: string) => void;
  onToggleFavorite: (id: string) => void;
  onDeleteClick: (id: string) => void;
  hasOnSelect: boolean;
}

// ============================================================================
// Memoized Cell component (module scope for react-window optimization)
// ============================================================================

/**
 * Virtualized grid cell for image gallery.
 * Defined at module scope to prevent recreation on parent re-renders.
 * Uses React.memo with custom areEqual for optimal performance.
 */
const Cell = memo(
  function Cell({ columnIndex, rowIndex, style, data }: GridChildComponentProps) {
    const {
      images,
      columnCount,
      hoveredImageId,
      onHover,
      onApplyToCanvas,
      onToggleFavorite,
      onDeleteClick,
      hasOnSelect,
    } = data as CellItemData;

    const index = rowIndex * columnCount + columnIndex;
    const image = images[index];

    if (!image) return null;

    const isHovered = hoveredImageId === image.id;

    return (
      <div style={style} className='p-2'>
        <div
          className='relative group w-full h-full rounded-xl overflow-hidden bg-zinc-900/50 border border-white/5 hover:border-white/10 active:border-purple-500/50 transition-all duration-300 touch-manipulation tap-highlight-transparent'
          onMouseEnter={() => onHover(image.id)}
          onMouseLeave={() => onHover(null)}
          onClick={() => {
            if (window.navigator.vibrate) window.navigator.vibrate(10);
            onHover(isHovered ? null : image.id);
          }}
        >
          <div className='w-full h-full bg-zinc-950 relative'>
            <img
              src={image.storageUrl}
              alt={image.prompt || image.fileName}
              className='w-full h-full object-cover'
              loading='lazy'
            />
          </div>

          {isHovered && (
            <div className='absolute inset-0 bg-black/80 backdrop-blur-sm flex flex-col justify-between p-4 animate-fadeIn z-10'>
              <div className='flex-1 overflow-y-auto no-scrollbar space-y-2'>
                <span
                  className={`inline-block px-2 py-1 rounded text-[9px] font-black uppercase tracking-wider border ${getTypeBadgeColor(image.generationType)}`}
                >
                  {image.generationType}
                </span>
                {image.prompt && (
                  <p className='text-white text-xs font-medium line-clamp-3'>{image.prompt}</p>
                )}
                <p className='text-[9px] text-zinc-600 font-bold uppercase tracking-wider'>
                  {formatDate(image.createdAt)}
                </p>
              </div>

              <div className='flex gap-2 mt-3'>
                <button
                  type='button'
                  onClick={(e) => {
                    e.stopPropagation();
                    if (window.navigator.vibrate) window.navigator.vibrate(10);
                    onApplyToCanvas(image.storageUrl);
                  }}
                  className='flex-1 lg:h-10 min-h-[44px] bg-blue-600 hover:bg-blue-500 active:scale-95 text-white rounded-lg flex items-center justify-center transition-transform touch-manipulation'
                >
                  <span className='material-icons text-sm'>
                    {hasOnSelect ? 'check' : 'add_photo_alternate'}
                  </span>
                </button>
                <button
                  type='button'
                  onClick={(e) => {
                    e.stopPropagation();
                    if (window.navigator.vibrate) window.navigator.vibrate(10);
                    onToggleFavorite(image.id);
                  }}
                  className={`lg:h-10 lg:w-10 min-h-[44px] min-w-[44px] rounded-lg flex items-center justify-center active:scale-95 transition-transform touch-manipulation ${image.isFavorite ? 'bg-pink-600 text-white' : 'bg-zinc-800 text-zinc-400'}`}
                >
                  <span className='material-icons text-sm'>
                    {image.isFavorite ? 'favorite' : 'favorite_border'}
                  </span>
                </button>
                <button
                  type='button'
                  onClick={(e) => {
                    e.stopPropagation();
                    if (window.navigator.vibrate) window.navigator.vibrate(10);
                    onDeleteClick(image.id);
                  }}
                  className='lg:h-10 lg:w-10 min-h-[44px] min-w-[44px] bg-red-600 hover:bg-red-500 active:scale-95 text-white rounded-lg flex items-center justify-center transition-transform touch-manipulation'
                >
                  <span className='material-icons text-sm'>delete</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  },
  (prevProps, nextProps) => {
    // Custom areEqual for optimal memoization
    const prevData = prevProps.data as CellItemData;
    const nextData = nextProps.data as CellItemData;
    const prevIndex = prevProps.rowIndex * prevData.columnCount + prevProps.columnIndex;
    const nextIndex = nextProps.rowIndex * nextData.columnCount + nextProps.columnIndex;

    // If indices don't match, re-render
    if (prevIndex !== nextIndex) return false;

    const prevImage = prevData.images[prevIndex];
    const nextImage = nextData.images[nextIndex];

    // If image doesn't exist in one but does in other, re-render
    if (!prevImage || !nextImage) return prevImage === nextImage;

    // Check if this specific cell's hover state changed
    const prevHovered = prevData.hoveredImageId === prevImage.id;
    const nextHovered = nextData.hoveredImageId === nextImage.id;
    if (prevHovered !== nextHovered) return false;

    // Check if image data changed
    if (prevImage.id !== nextImage.id) return false;
    if (prevImage.isFavorite !== nextImage.isFavorite) return false;
    if (prevImage.storageUrl !== nextImage.storageUrl) return false;

    // Style changes
    if (prevProps.style !== nextProps.style) return false;

    return true;
  },
);

const ImageGalleryComponent: React.FC<ImageGalleryProps> = ({
  embedded,
  onSelect,
  onNavigateToStudio,
}) => {
  const { setBgImage } = useCanvas();

  // State
  const [images, setImages] = useState<ImageData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'generated' | 'uploaded'>('all');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [hoveredImageId, setHoveredImageId] = useState<string | null>(null);
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; imageId: string | null }>({
    isOpen: false,
    imageId: null,
  });

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
      const data = (await getUserImages(filters)) as any as ImageData[];
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

  // Stable callback refs for Cell component (prevents recreation)
  const handleApplyToCanvas = useCallback(
    (imageUrl: string) => {
      if (onSelect) {
        onSelect(imageUrl);
        return;
      }
      setBgImage(imageUrl);
    },
    [onSelect, setBgImage],
  );

  const handleToggleFavorite = useCallback(async (imageId: string) => {
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
  }, []);

  const handleDeleteClick = useCallback((imageId: string) => {
    setDeleteModal({ isOpen: true, imageId });
  }, []);

  const handleHover = useCallback((id: string | null) => {
    setHoveredImageId(id);
  }, []);

  const handleConfirmDelete = async () => {
    if (!deleteModal.imageId) return;

    try {
      const success = await deleteImageRecord(deleteModal.imageId);
      if (success) {
        setImages((prev) => prev.filter((img) => img.id !== deleteModal.imageId));
      }
    } catch (error) {
      console.error('Failed to delete image:', error);
    }
  };

  return (
    <div className={`flex-1 flex flex-col h-full ${embedded ? 'p-0' : 'p-4 md:p-6 lg:p-8'}`}>
      <div
        className={`w-full mx-auto h-full flex flex-col ${embedded ? 'max-w-full' : 'max-w-[1600px]'}`}
      >
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
                <button type='button' onClick={loadImages} className={`${BTN_NEU_SOLID} px-6 py-3`}>
                  <span className='material-icons text-sm mr-2'>refresh</span>
                  Retry
                </button>
                <button
                  type='button'
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
                Tip: Make sure the database migration has been run. Check the database for the
                'images' table.
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

              {searchQuery || filterType !== 'all' || showFavoritesOnly ? (
                <button
                  type='button'
                  onClick={() => {
                    setSearchQuery('');
                    setFilterType('all');
                    setShowFavoritesOnly(false);
                  }}
                  className={`${BTN_NEU_SOLID} px-6 py-2`}
                >
                  Clear Filters
                </button>
              ) : onNavigateToStudio ? (
                <button
                  type='button'
                  onClick={onNavigateToStudio}
                  className={`${BTN_NEU_SOLID} px-6 py-2 bg-purple-600 hover:bg-purple-500 border-purple-500 text-white shadow-[0_0_20px_rgba(168,85,247,0.3)]`}
                >
                  <span className='material-icons text-sm mr-2'>auto_awesome</span>
                  Create in Studio
                </button>
              ) : null}
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
                if (width >= 1280)
                  columnCount = 4; // xl
                else if (width >= 1024)
                  columnCount = 3; // lg
                else if (width >= 640) columnCount = 2; // sm

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
                    itemData={
                      {
                        images,
                        columnCount,
                        hoveredImageId,
                        onHover: handleHover,
                        onApplyToCanvas: handleApplyToCanvas,
                        onToggleFavorite: handleToggleFavorite,
                        onDeleteClick: handleDeleteClick,
                        hasOnSelect: !!onSelect,
                      } satisfies CellItemData
                    }
                    className='no-scrollbar'
                  >
                    {Cell}
                  </Grid>
                );
              }}
            </AutoSizerAny>
          </div>
        )}
      </div>

      <ConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, imageId: null })}
        onConfirm={handleConfirmDelete}
        title='Delete Image'
        message='Are you sure you want to delete this image? This action cannot be undone.'
        confirmText='Delete'
        isDestructive={true}
      />
    </div>
  );
};

// Wrap with memo for performance optimization
const ImageGallery = memo(ImageGalleryComponent);

export default ImageGallery;
