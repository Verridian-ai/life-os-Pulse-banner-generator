import React, { useState, useEffect, useCallback } from 'react';
import { getUserImages, toggleImageFavorite, deleteImageRecord } from '../../services/database';
import { useCanvas } from '../../context/CanvasContext';
import { BTN_NEU_SOLID, INPUT_NEU } from '../../styles';

interface ImageData {
  id: string;
  storage_url: string;
  prompt: string;
  model_used: string;
  quality: string;
  generation_type: string;
  tags: string[];
  created_at: string;
  is_favorite: boolean;
  file_name: string;
}

const ImageGallery: React.FC = () => {
  const { setBgImage } = useCanvas();

  // State
  const [images, setImages] = useState<ImageData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [hoveredImageId, setHoveredImageId] = useState<string | null>(null);

  // Load images - wrapped in useCallback to satisfy exhaustive-deps
  const loadImages = useCallback(async () => {
    setLoading(true);
    try {
      const filters: {
        searchQuery?: string;
        generationType?: string;
        favorites?: boolean;
      } = {};

      if (searchQuery) {
        filters.searchQuery = searchQuery;
      }

      if (filterType !== 'all') {
        filters.generationType = filterType;
      }

      if (showFavoritesOnly) {
        filters.favorites = true;
      }

      const data = await getUserImages(filters);
      setImages(data);
      console.log('[Gallery] Loaded', data.length, 'images');
    } catch (error) {
      console.error('[Gallery] Failed to load images:', error);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, filterType, showFavoritesOnly]);

  // Load on mount and when filters change
  useEffect(() => {
    loadImages();
  }, [loadImages]);

  // Handle apply to canvas
  const handleApplyToCanvas = (imageUrl: string) => {
    setBgImage(imageUrl);
    console.log('[Gallery] Applied image to canvas:', imageUrl);
  };

  // Handle toggle favorite
  const handleToggleFavorite = async (imageId: string) => {
    try {
      const success = await toggleImageFavorite(imageId);
      if (success) {
        // Update local state
        setImages((prev) =>
          prev.map((img) => (img.id === imageId ? { ...img, is_favorite: !img.is_favorite } : img)),
        );
      }
    } catch (error) {
      console.error('[Gallery] Failed to toggle favorite:', error);
    }
  };

  // Handle delete
  const handleDelete = async (imageId: string) => {
    if (!confirm('Are you sure you want to delete this image?')) return;

    try {
      const success = await deleteImageRecord(imageId);
      if (success) {
        // Remove from local state
        setImages((prev) => prev.filter((img) => img.id !== imageId));
        console.log('[Gallery] Image deleted:', imageId);
      }
    } catch (error) {
      console.error('[Gallery] Failed to delete image:', error);
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Get type badge color
  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'generate':
        return 'bg-blue-600/20 text-blue-400 border-blue-500/30';
      case 'edit':
        return 'bg-purple-600/20 text-purple-400 border-purple-500/30';
      case 'upscale':
        return 'bg-green-600/20 text-green-400 border-green-500/30';
      case 'remove-bg':
        return 'bg-orange-600/20 text-orange-400 border-orange-500/30';
      case 'restore':
        return 'bg-pink-600/20 text-pink-400 border-pink-500/30';
      case 'face-enhance':
        return 'bg-yellow-600/20 text-yellow-400 border-yellow-500/30';
      default:
        return 'bg-zinc-600/20 text-zinc-400 border-zinc-500/30';
    }
  };

  return (
    <div className='flex-1 p-4 md:p-6 lg:p-8 flex flex-col'>
      <div className='w-full max-w-[1600px] mx-auto'>
        {/* Header */}
        <div className='mb-6'>
          <div className='flex items-center gap-3 mb-4'>
            <span className='bg-white/10 p-2 rounded-lg text-zinc-400'>
              <span className='material-icons text-base'>photo_library</span>
            </span>
            <div>
              <h2 className='text-white text-sm font-black uppercase tracking-wider drop-shadow-sm'>
                Image Gallery
              </h2>
              <p className='text-[10px] text-zinc-500 font-bold uppercase tracking-widest'>
                {images.length} Images
              </p>
            </div>
          </div>

          {/* Search and Filters */}
          <div className='flex flex-col md:flex-row gap-3'>
            {/* Search */}
            <div className='flex-1'>
              <input
                type='text'
                placeholder='Search by prompt...'
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`${INPUT_NEU} w-full h-10 px-4 text-xs font-bold`}
              />
            </div>

            {/* Type Filter */}
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className={`${INPUT_NEU} h-10 px-4 text-xs font-bold uppercase`}
            >
              <option value='all'>All Types</option>
              <option value='generate'>Generate</option>
              <option value='edit'>Magic Edit</option>
              <option value='upscale'>Upscale</option>
              <option value='remove-bg'>Remove BG</option>
              <option value='restore'>Restore</option>
              <option value='face-enhance'>Face Enhance</option>
            </select>

            {/* Favorites Toggle */}
            <button
              onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
              className={`h-10 px-4 rounded-full flex items-center gap-2 font-black uppercase tracking-wider text-[10px] transition-all ${
                showFavoritesOnly
                  ? 'bg-pink-600/20 border border-pink-500 text-pink-400'
                  : BTN_NEU_SOLID
              }`}
            >
              <span className='material-icons text-sm'>
                {showFavoritesOnly ? 'favorite' : 'favorite_border'}
              </span>
              Favorites
            </button>

            {/* Refresh */}
            <button
              onClick={loadImages}
              className={`${BTN_NEU_SOLID} h-10 px-4 rounded-full flex items-center gap-2`}
            >
              <span className='material-icons text-sm'>refresh</span>
            </button>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className='flex items-center justify-center py-20'>
            <div className='flex flex-col items-center gap-3'>
              <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500'></div>
              <p className='text-zinc-400 text-xs font-bold uppercase tracking-wider'>
                Loading images...
              </p>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && images.length === 0 && (
          <div className='flex items-center justify-center py-20'>
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

        {/* Image Grid */}
        {!loading && images.length > 0 && (
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pb-20'>
            {images.map((image) => (
              <div
                key={image.id}
                className='relative group rounded-xl overflow-hidden bg-zinc-900/50 border border-white/5 hover:border-white/10 transition-all duration-300'
                onMouseEnter={() => setHoveredImageId(image.id)}
                onMouseLeave={() => setHoveredImageId(null)}
              >
                {/* Image */}
                <div className='aspect-video w-full bg-zinc-950'>
                  <img
                    src={image.storage_url}
                    alt={image.prompt || image.file_name}
                    className='w-full h-full object-cover'
                    loading='lazy'
                  />
                </div>

                {/* Hover Overlay */}
                {hoveredImageId === image.id && (
                  <div className='absolute inset-0 bg-black/80 backdrop-blur-sm flex flex-col justify-between p-4 animate-fadeIn'>
                    {/* Metadata */}
                    <div className='flex-1 overflow-y-auto'>
                      <div className='space-y-2'>
                        {/* Type Badge */}
                        <span
                          className={`inline-block px-2 py-1 rounded text-[9px] font-black uppercase tracking-wider border ${getTypeBadgeColor(image.generation_type)}`}
                        >
                          {image.generation_type}
                        </span>

                        {/* Prompt */}
                        {image.prompt && (
                          <p className='text-white text-xs font-medium line-clamp-3'>
                            {image.prompt}
                          </p>
                        )}

                        {/* Model & Quality */}
                        <div className='flex flex-wrap gap-2 text-[9px] text-zinc-400 font-bold uppercase'>
                          {image.model_used && <span>{image.model_used}</span>}
                          {image.quality && <span>• {image.quality}</span>}
                        </div>

                        {/* Tags */}
                        {image.tags && image.tags.length > 0 && (
                          <div className='flex flex-wrap gap-1'>
                            {image.tags.map((tag, idx) => (
                              <span
                                key={idx}
                                className='px-1.5 py-0.5 bg-white/5 rounded text-[8px] text-zinc-500 font-bold uppercase'
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Date */}
                        <p className='text-[9px] text-zinc-600 font-bold uppercase tracking-wider'>
                          {formatDate(image.created_at)}
                        </p>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className='flex gap-2 mt-3'>
                      {/* Apply to Canvas */}
                      <button
                        onClick={() => handleApplyToCanvas(image.storage_url)}
                        className='flex-1 h-8 bg-blue-600 hover:bg-blue-500 text-white rounded-lg flex items-center justify-center gap-1.5 font-black uppercase text-[9px] tracking-wider transition-colors'
                        title='Apply to Canvas'
                      >
                        <span className='material-icons text-sm'>add_photo_alternate</span>
                        Apply
                      </button>

                      {/* Toggle Favorite */}
                      <button
                        onClick={() => handleToggleFavorite(image.id)}
                        className={`h-8 w-8 rounded-lg flex items-center justify-center transition-colors ${
                          image.is_favorite
                            ? 'bg-pink-600 hover:bg-pink-500 text-white'
                            : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-400'
                        }`}
                        title={image.is_favorite ? 'Remove from Favorites' : 'Add to Favorites'}
                      >
                        <span className='material-icons text-sm'>
                          {image.is_favorite ? 'favorite' : 'favorite_border'}
                        </span>
                      </button>

                      {/* Delete */}
                      <button
                        onClick={() => handleDelete(image.id)}
                        className='h-8 w-8 bg-red-600 hover:bg-red-500 text-white rounded-lg flex items-center justify-center transition-colors'
                        title='Delete Image'
                      >
                        <span className='material-icons text-sm'>delete</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Favorite Badge (Always Visible) */}
                {image.is_favorite && (
                  <div className='absolute top-2 right-2 bg-pink-600 text-white p-1 rounded-full shadow-lg'>
                    <span className='material-icons text-sm'>favorite</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageGallery;
