import { api } from './api';
import type { UserProfile, UserPreferences, ProfileWithPreferences, ApiKeysResponse } from '@/types/api';

// Re-export types for backward compatibility
export type { UserProfile, UserPreferences };

// ============================================
// USER PROFILES & ACCOUNTS
// ============================================

export const getUserProfile = async (_userId: string) => {
    try {
        const res = await api.get<ProfileWithPreferences>('/api/user/profile');
        if (!res.profile) return { data: null, error: new Error('Profile not found') };

        // Merge for compatibility if needed, or return as is.
        // The UI likely expects a single object for "User Settings".
        const merged = { ...res.profile, user_preferences: res.preferences };
        return { data: merged, error: null };
    } catch (error) {
        console.error('Error fetching user profile:', error);
        return { data: null, error };
    }
};

export const updateUserProfile = async (_userId: string, updates: Partial<UserProfile>) => {
    try {
        const res = await api.patch<{ profile: UserProfile }>('/api/user/profile', updates);
        return { data: res.profile, error: null };
    } catch (error) {
        return { data: null, error };
    }
};

export const updateUserPreferences = async (_userId: string, preferences: Partial<UserPreferences>) => {
    try {
        const res = await api.patch<{ preferences: UserPreferences }>('/api/user/preferences', preferences);
        return { data: res.preferences, error: null };
    } catch (error) {
        return { data: null, error };
    }
};

// ============================================
// API KEYS
// ============================================

export const saveUserAPIKeys = async (_userId: string, keys: Record<string, unknown>) => {
    try {
        const res = await api.post<{ success?: boolean }>('/api/user/api-keys', keys);
        return { data: res, error: null };
    } catch (error) {
        return { data: null, error };
    }
}

export const getUserAPIKeys = async (_userId: string) => {
    try {
        const res = await api.get<{ apiKeys: ApiKeysResponse }>('/api/user/api-keys');
        return { data: res.apiKeys, error: null };
    } catch (error) {
        return { data: null, error };
    }
}

// ... Additional entities (Designs, Brands) would follow this pattern.
// For now, I will leave the existing file mostly intact but replace these specific functions
// in the *actual* replace_file_content call, or rewrite the whole file if I'm confident.
// Given the file size (800 lines), I should likely replace it incrementally or use multi_replace.
// But wait, the objective is "no reference to supabase".
// I will create a `database.ts` that just exports these and maybe mocks the rest or throws errors?
// No, I need to keep the app working. I should implement the other endpoints on the backend OR
// leave the old code commented out/disabled if the features aren't critical for "Phase 1".
// But "Designs" are core.
// I will rewrite `database.ts` to use `api.ts` for EVERY call, assuming standard REST endpoints.
