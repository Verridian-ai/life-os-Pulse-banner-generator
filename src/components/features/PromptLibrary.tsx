import React, { useState, useMemo } from 'react';
import { INPUT_NEU } from '../../styles';
import { useToast } from '../../hooks/useToast';
import { usePromptHistory } from '../../hooks/usePromptHistory';

interface PromptLibraryProps {
  onSelect: (prompt: string) => void;
  onClose?: () => void;
}

export const PromptLibrary: React.FC<PromptLibraryProps> = ({ onSelect, onClose }) => {
  const { history, toggleFavorite, deletePrompt } = usePromptHistory();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const toast = useToast();

  const categories = ['All', 'Favorites', 'Recent', 'Most Used'];

  const displayedPrompts = useMemo(() => {
    let result = [...history];

    // 1. Filter by Category/Tab
    if (activeCategory === 'Favorites') {
      result = result.filter(p => p.isFavorite);
      result.sort((a, b) => b.lastUsedAt - a.lastUsedAt);
    } else if (activeCategory === 'Recent') {
      result.sort((a, b) => b.lastUsedAt - a.lastUsedAt);
    } else if (activeCategory === 'Most Used') {
      result.sort((a, b) => b.useCount - a.useCount);
    } else {
      // All - default sort by recent
      result.sort((a, b) => b.lastUsedAt - a.lastUsedAt);
    }

    // 2. Filter by Search
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(p =>
        p.prompt.toLowerCase().includes(q) ||
        p.title?.toLowerCase().includes(q) ||
        p.tags.some(t => t.toLowerCase().includes(q))
      );
    }

    return result;
  }, [history, activeCategory, searchQuery]);

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!globalThis.confirm('Delete this prompt from history?')) return;
    deletePrompt(id);
    toast.info('Prompt deleted');
  };

  const handleToggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFavorite(id);
  };

  return (
    <div className='flex flex-col h-full bg-zinc-900 border border-white/10 rounded-2xl overflow-hidden'>
      {/* Header */}
      <div className='p-4 border-b border-white/5 flex items-center justify-between bg-zinc-950/50'>
        <h3 className='text-xs font-black uppercase tracking-wider text-white flex items-center gap-2'>
          <span className='material-icons text-sm text-purple-500'>history</span>
          Prompt History
        </h3>
        {onClose && (
          <button type="button" onClick={onClose} className='text-zinc-500 hover:text-white transition'>
            <span className='material-icons text-sm'>close</span>
          </button>
        )}
      </div>

      {/* Filters */}
      <div className='p-4 space-y-3'>
        <input
          type='text'
          placeholder='Search history...'
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={`${INPUT_NEU} w-full h-10 px-3 text-xs`}
        />

        <div className='flex gap-2 overflow-x-auto pb-1 scrollbar-hide'>
          {categories.map(cat => (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider whitespace-nowrap transition ${activeCategory === cat ? 'bg-purple-600 text-white' : 'bg-zinc-800 text-zinc-500 hover:text-zinc-300'
                }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Prompt List */}
      <div className='flex-1 overflow-y-auto p-4 space-y-3'>
        {displayedPrompts.length === 0 ? (
          <div className='flex flex-col items-center justify-center py-10 gap-3'>
            <span className='material-icons text-4xl text-zinc-700'>history_toggle_off</span>
            <p className='text-xs text-zinc-500'>No history found</p>
            {(searchQuery || activeCategory !== 'All') && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setActiveCategory('All');
                }}
                className='text-[10px] text-purple-400 hover:text-purple-300 font-bold uppercase tracking-wider'
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          displayedPrompts.map(prompt => (
            <div
              key={prompt.id}
              className='group bg-zinc-950/50 border border-white/5 hover:border-purple-500/30 rounded-xl p-3 transition-all cursor-pointer'
              onClick={() => onSelect(prompt.prompt)}
            >
              <div className='flex justify-between items-start mb-2'>
                <h4 className='text-[10px] font-black text-zinc-400 uppercase truncate pr-4 max-w-[70%]'>
                  {prompt.title || prompt.prompt}
                </h4>
                <div className='flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity'>
                  <button
                    type="button"
                    onClick={(e) => handleToggleFavorite(prompt.id, e)}
                    className={`text-sm material-icons ${prompt.isFavorite ? 'text-pink-500' : 'text-zinc-600 hover:text-pink-400'}`}
                    title="Toggle Favorite"
                  >
                    {prompt.isFavorite ? 'favorite' : 'favorite_border'}
                  </button>
                  <button
                    type="button"
                    onClick={(e) => handleDelete(prompt.id, e)}
                    className='text-sm material-icons text-zinc-600 hover:text-red-400'
                    title="Delete"
                  >
                    delete
                  </button>
                </div>
              </div>
              <p className='text-[11px] text-zinc-300 line-clamp-2 leading-relaxed italic'>"{prompt.prompt}"</p>
              <div className='mt-2 flex items-center justify-between'>
                <span className='text-[8px] text-zinc-600 font-bold uppercase'>
                  {new Date(prompt.lastUsedAt).toLocaleDateString()}
                </span>

                <div className="flex items-center gap-2">
                  {prompt.useCount > 1 && (
                    <span className='px-1.5 py-0.5 bg-zinc-800 rounded text-[8px] text-zinc-400 font-bold uppercase border border-white/5'>
                      Used {prompt.useCount}x
                    </span>
                  )}
                  {prompt.category !== 'general' && (
                    <span className='px-1.5 py-0.5 bg-purple-900/20 rounded text-[8px] text-purple-400 font-bold uppercase border border-purple-500/10'>
                      {prompt.category}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
