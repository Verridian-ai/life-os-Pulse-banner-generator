/**
 * TemplatesGrid - Browse templates from Dashboard
 *
 * Signal Design System: Glass cards with template previews
 * Features: Filter by industry, search, quick apply, loading states
 */

import { useState } from 'react';
import { Search, Sparkles, X, Layout, ArrowRight, Filter } from 'lucide-react';
import { BANNER_TEMPLATES, BannerTemplate } from '../../constants/templates';

interface TemplatesGridProps {
  onSelectTemplate: (template: BannerTemplate) => void;
  className?: string;
  isLoading?: boolean;
}

function TemplateCard({ template, onSelect }: { template: BannerTemplate; onSelect: () => void }) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  return (
    <button
      onClick={onSelect}
      type="button"
      className="group bg-zinc-900/80 backdrop-blur-sm border border-white/10 hover:border-sky-500/40 rounded-2xl overflow-hidden transition-all duration-300 text-left hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-sky-900/20 focus-ring"
    >
      {/* Preview */}
      <div className="aspect-video bg-zinc-800/50 relative overflow-hidden">
        {template.backgroundUrl && !imageError ? (
          <>
            {!imageLoaded && (
              <div className="absolute inset-0 bg-gradient-to-r from-zinc-800 via-zinc-700 to-zinc-800 animate-pulse" />
            )}
            <img
              src={template.backgroundUrl}
              alt={template.title}
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageError(true)}
              className={`w-full h-full object-cover group-hover:scale-105 transition-all duration-500 ease-out ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
            />
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-sky-500/10 to-teal-500/10">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-sky-500/20 to-teal-500/20 flex items-center justify-center">
              <Layout className="w-7 h-7 text-sky-400" />
            </div>
          </div>
        )}

        {/* Hover overlay with gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
          <span className="px-5 py-2.5 bg-sky-500 rounded-xl text-sm font-bold text-white shadow-xl shadow-sky-900/30 transform scale-90 group-hover:scale-100 transition-all duration-300 flex items-center gap-2">
            Use Template
            <ArrowRight className="w-4 h-4" />
          </span>
        </div>

        {/* Industry badge on card */}
        <div className="absolute top-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <span className="px-2.5 py-1 bg-black/60 backdrop-blur-sm rounded-lg text-[10px] text-white/80 font-medium uppercase tracking-wider">
            {template.industry}
          </span>
        </div>
      </div>

      {/* Info */}
      <div className="p-4">
        <h3 className="font-bold text-white text-sm mb-1.5 truncate group-hover:text-sky-100 transition-colors">{template.title}</h3>
        <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">{template.description}</p>
        <div className="flex items-center gap-2 mt-3">
          <span className="px-2.5 py-1 bg-white/5 rounded-lg text-[10px] text-zinc-400 font-medium uppercase tracking-wide">
            {template.industry}
          </span>
        </div>
      </div>
    </button>
  );
}

function SkeletonTemplateCard() {
  return (
    <div className="bg-zinc-900/80 border border-white/5 rounded-2xl overflow-hidden">
      <div className="aspect-video bg-zinc-800/50 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer bg-[length:200%_100%]" />
      </div>
      <div className="p-4 space-y-3">
        <div className="h-4 bg-zinc-800/50 rounded-lg w-3/4" />
        <div className="h-3 bg-zinc-800/30 rounded-lg w-full" />
        <div className="h-3 bg-zinc-800/30 rounded-lg w-2/3" />
        <div className="h-5 w-16 bg-zinc-800/30 rounded-lg mt-3" />
      </div>
    </div>
  );
}

export function TemplatesGrid({ onSelectTemplate, className = '', isLoading = false }: TemplatesGridProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState('All');

  const industries = ['All', ...new Set(BANNER_TEMPLATES.map(t => t.industry))];

  const filteredTemplates = BANNER_TEMPLATES.filter(t => {
    const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesIndustry = selectedIndustry === 'All' || t.industry === selectedIndustry;
    return matchesSearch && matchesIndustry;
  });

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500/20 to-teal-500/20 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-sky-400" />
            </div>
            <h1 className="text-2xl font-bold text-white">Templates</h1>
          </div>
          <p className="text-zinc-400 text-sm">
            <span className="text-sky-400 font-semibold">{BANNER_TEMPLATES.length}</span> professional templates to jumpstart your designs
          </p>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500 group-focus-within:text-sky-400 transition-colors" />
          <input
            type="text"
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-12 pl-12 pr-10 bg-zinc-900/80 backdrop-blur-sm border border-white/10 rounded-xl text-white placeholder:text-zinc-500 focus-ring transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-white/10 text-zinc-500 hover:text-white transition-colors"
              aria-label="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-2 text-zinc-500 text-sm">
            <Filter className="w-4 h-4" />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {industries.map(ind => (
              <button
                key={ind}
                type="button"
                onClick={() => setSelectedIndustry(ind)}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all duration-200 ${selectedIndustry === ind
                  ? 'bg-gradient-to-r from-sky-500 to-teal-500 text-white shadow-lg shadow-sky-900/30'
                  : 'bg-zinc-800/80 text-zinc-400 hover:text-white hover:bg-zinc-700/80 border border-white/5'
                  }`}
              >
                {ind}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results count */}
      {searchQuery || selectedIndustry !== 'All' ? (
        <div className="flex items-center gap-2 text-sm text-zinc-400">
          <span>Showing <span className="text-white font-medium">{filteredTemplates.length}</span> templates</span>
          {(searchQuery || selectedIndustry !== 'All') && (
            <button
              type="button"
              onClick={() => { setSearchQuery(''); setSelectedIndustry('All'); }}
              className="text-sky-400 hover:text-sky-300 font-medium transition-colors"
            >
              Clear filters
            </button>
          )}
        </div>
      ) : null}

      {/* Templates Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {Array.from({ length: 8 }).map((_, i) => (
            <SkeletonTemplateCard key={i} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredTemplates.map(template => (
            <TemplateCard
              key={template.id}
              template={template}
              onSelect={() => onSelectTemplate(template)}
            />
          ))}
        </div>
      )}

      {filteredTemplates.length === 0 && !isLoading && (
        <div className="bg-gradient-to-br from-zinc-900/80 to-zinc-900/40 backdrop-blur-sm border border-white/5 rounded-2xl p-10 text-center relative overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-sky-500/5 to-teal-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

          <div className="relative z-10">
            <div className="w-16 h-16 rounded-2xl bg-zinc-800/50 flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-zinc-500" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">No templates found</h3>
            <p className="text-sm text-zinc-400 max-w-sm mx-auto">
              Try adjusting your search or filter to find what you're looking for
            </p>
            <button
              type="button"
              onClick={() => { setSearchQuery(''); setSelectedIndustry('All'); }}
              className="mt-6 px-5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm font-medium text-white transition-colors"
            >
              Reset Filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default TemplatesGrid;
