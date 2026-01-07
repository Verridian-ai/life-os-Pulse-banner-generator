import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../../services/api';
import { INPUT_NEU } from '../../styles';
import { useToast } from '../../hooks/useToast';

interface PromptData {
  id: string;
  prompt: string;
  title: string;
  category: string;
  tags: string[];
  isFavorite: boolean;
  createdAt: string;
}

interface PromptLibraryProps {
  onSelect: (prompt: string) => void;
  onClose?: () => void;
}

export const PromptLibrary: React.FC<PromptLibraryProps> = ({ onSelect, onClose }) => {
  const [prompts, setPrompts] = useState<PromptData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveService] = useState('all');
  const toast = useToast();

  const loadPrompts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      if (activeCategory !== 'all') params.append('category', activeCategory);
      
      const response = await api.get<{ prompts: PromptData[] }>(`/api/prompts?${params.toString()}`);
      setPrompts(response?.prompts || []);
    } catch (error) {
      console.error('[PromptLibrary] Failed to load:', error);
      toast.error('Failed to load prompt library');
    } finally {
      setLoading(false);
    }
  }, [searchQuery, activeCategory, toast]);

  useEffect(() => {
    loadPrompts();
  }, [loadPrompts]);

  const handleToggleFavorite = async (id: string) => {
    try {
      const response = await api.post<{ success: boolean; isFavorite: boolean }>(`/api/prompts/${id}/toggle-favorite`, {});
      if (response.success) {
        setPrompts(prev => prev.map(p => p.id === id ? { ...p, isFavorite: response.isFavorite } : p));
      }
    } catch {
      // Ignore error
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this prompt?')) return;
    try {
      const response = await api.delete<{ success: boolean }>(`/api/prompts/${id}`);
      if (response.success) {
        setPrompts(prev => prev.filter(p => p.id !== id));
        toast.info('Prompt deleted');
      }
    } catch {
      toast.error('Failed to delete prompt');
    }
  };

  const categories = ['all', 'general', 'background', 'abstract', 'corporate'];

  return (
    <div className='flex flex-col h-full bg-zinc-900 border border-white/10 rounded-2xl overflow-hidden'>
      {/* Header */}
      <div className='p-4 border-b border-white/5 flex items-center justify-between bg-zinc-950/50'>
        <h3 className='text-xs font-black uppercase tracking-wider text-white flex items-center gap-2'>
          <span className='material-icons text-sm text-purple-500'>Auto_awesome</span>
          Prompt Library
        </h3>
        {onClose && (
          <button onClick={onClose} className='text-zinc-500 hover:text-white transition'>
            <span className='material-icons text-sm'>close</span>
          </button>
        )}
      </div>

      {/* Filters */}
      <div className='p-4 space-y-3'>
        <input
          type='text'
          placeholder='Search prompts...'
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={`${INPUT_NEU} w-full h-10 px-3 text-xs`}
        />
        
        <div className='flex gap-2 overflow-x-auto pb-1 scrollbar-hide'>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveService(cat)}
              className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider whitespace-nowrap transition ${
                activeCategory === cat ? 'bg-purple-600 text-white' : 'bg-zinc-800 text-zinc-500 hover:text-zinc-300'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Prompt List */}
      <div className='flex-1 overflow-y-auto p-4 space-y-3'>
        {loading ? (
          <div className='flex justify-center py-10'>
            <div className='animate-spin rounded-full h-6 w-6 border-b-2 border-purple-500'></div>
          </div>
        ) : prompts.length === 0 ? (
          <div className='text-center py-10'>
            <p className='text-xs text-zinc-600'>No prompts found</p>
          </div>
        ) : (
          prompts.map(prompt => (
            <div 
              key={prompt.id}
              className='group bg-zinc-950/50 border border-white/5 hover:border-purple-500/30 rounded-xl p-3 transition-all cursor-pointer'
              onClick={() => onSelect(prompt.prompt)}
            >
              <div className='flex justify-between items-start mb-2'>
                <h4 className='text-[10px] font-black text-zinc-400 uppercase truncate pr-4'>{prompt.title}</h4>
                <div className='flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity'>
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleToggleFavorite(prompt.id); }}
                    className={`text-sm material-icons ${prompt.isFavorite ? 'text-pink-500' : 'text-zinc-600 hover:text-pink-400'}`}
                  >
                    {prompt.isFavorite ? 'favorite' : 'favorite_border'}
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleDelete(prompt.id); }}
                    className='text-sm material-icons text-zinc-600 hover:text-red-400'
                  >
                    delete
                  </button>
                </div>
              </div>
              <p className='text-[11px] text-zinc-300 line-clamp-2 leading-relaxed italic'>"{prompt.prompt}"</p>
              <div className='mt-2 flex items-center justify-between'>
                <span className='text-[8px] text-zinc-600 font-bold uppercase'>{new Date(prompt.createdAt).toLocaleDateString()}</span>
                <span className='px-1.5 py-0.5 bg-purple-900/20 rounded text-[8px] text-purple-400 font-bold uppercase border border-purple-500/10'>
                  {prompt.category}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
