/**
 * Templates Gallery Section Types
 */

export interface Template {
  id: string;
  name: string;
  description: string;
  thumbnailUrl: string;
  previewUrl: string;
  platform: string;
  category: string;
  aspectRatio: string;
  isPremium: boolean;
  usageCount: number;
  isFavorite: boolean;
  tags: string[];
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  count: number;
}

export interface Platform {
  id: string;
  name: string;
  icon: string;
}

export interface TemplatesGalleryViewProps {
  templates: Template[];
  platforms: Platform[];
  categories: Category[];
  selectedPlatform: string | null;
  selectedCategory: string | null;
  searchQuery: string;
  isLoading: boolean;
  userTier: 'free' | 'pro' | 'team';
  onSearch: (query: string) => void;
  onFilterPlatform: (platformId: string | null) => void;
  onFilterCategory: (categoryId: string | null) => void;
  onSelectTemplate: (templateId: string) => void;
  onUseTemplate: (templateId: string) => void;
  onToggleFavorite: (templateId: string) => void;
}
