import { useState, useCallback, useEffect } from 'react';
import { promptHistoryStorage } from '../services/storageManager';

export interface PromptRecord {
    id: string;
    prompt: string;
    title?: string;
    category: string;
    tags: string[];
    isFavorite: boolean;
    useCount: number;
    lastUsedAt: number;
    createdAt: number;
}

const STORAGE_KEY = 'history';

export const usePromptHistory = () => {
    const [history, setHistory] = useState<PromptRecord[]>([]);

    // Load history on mount
    useEffect(() => {
        const loaded = promptHistoryStorage.get<PromptRecord[]>(STORAGE_KEY) || [];
        setHistory(loaded);
    }, []);

    // Save whenever history changes
    const saveHistory = useCallback((newHistory: PromptRecord[]) => {
        promptHistoryStorage.set(STORAGE_KEY, newHistory);
        setHistory(newHistory);
    }, []);

    /**
     * Add or update a prompt in history
     */
    const addPrompt = useCallback((promptText: string, category: string = 'general', tags: string[] = []) => {
        const loaded = promptHistoryStorage.get<PromptRecord[]>(STORAGE_KEY) || [];
        const normalizedText = promptText.trim();

        if (!normalizedText) return;

        // Check if exists
        const existingIndex = loaded.findIndex(p => p.prompt.toLowerCase() === normalizedText.toLowerCase());

        if (existingIndex >= 0) {
            // Update existing
            const updated = [...loaded];
            updated[existingIndex] = {
                ...updated[existingIndex],
                useCount: updated[existingIndex].useCount + 1,
                lastUsedAt: Date.now(),
                category: category !== 'general' ? category : updated[existingIndex].category, // update category if specifics provided
                tags: [...new Set([...updated[existingIndex].tags, ...tags])]
            };
            saveHistory(updated);
        } else {
            // Add new
            const newPrompt: PromptRecord = {
                id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(),
                prompt: normalizedText,
                title: normalizedText.slice(0, 30) + (normalizedText.length > 30 ? '...' : ''),
                category,
                tags,
                isFavorite: false,
                useCount: 1,
                lastUsedAt: Date.now(),
                createdAt: Date.now()
            };
            saveHistory([newPrompt, ...loaded]);
        }
    }, [saveHistory]);

    /**
     * Toggle favorite status
     */
    const toggleFavorite = useCallback((id: string) => {
        const loaded = promptHistoryStorage.get<PromptRecord[]>(STORAGE_KEY) || [];
        const updated = loaded.map(p =>
            p.id === id ? { ...p, isFavorite: !p.isFavorite } : p
        );
        saveHistory(updated);
    }, [saveHistory]);

    /**
     * Delete a prompt
     */
    const deletePrompt = useCallback((id: string) => {
        const loaded = promptHistoryStorage.get<PromptRecord[]>(STORAGE_KEY) || [];
        const updated = loaded.filter(p => p.id !== id);
        saveHistory(updated);
    }, [saveHistory]);

    /**
     * Get filtered/sorted lists
     */
    const getRecentPrompts = useCallback((limit = 20) => {
        return [...history].sort((a, b) => b.lastUsedAt - a.lastUsedAt).slice(0, limit);
    }, [history]);

    const getFavoritePrompts = useCallback(() => {
        return history.filter(p => p.isFavorite).sort((a, b) => b.lastUsedAt - a.lastUsedAt);
    }, [history]);

    const getFrequentPrompts = useCallback((limit = 20) => {
        return [...history].sort((a, b) => b.useCount - a.useCount).slice(0, limit);
    }, [history]);

    const searchPrompts = useCallback((query: string) => {
        const q = query.toLowerCase();
        return history.filter(p =>
            p.prompt.toLowerCase().includes(q) ||
            p.title?.toLowerCase().includes(q) ||
            p.tags.some(t => t.toLowerCase().includes(q))
        );
    }, [history]);

    return {
        history,
        addPrompt,
        toggleFavorite,
        deletePrompt,
        getRecentPrompts,
        getFavoritePrompts,
        getFrequentPrompts,
        searchPrompts
    };
};
