import { api } from './api';

export interface UserProfile {
    id: string;
    email: string;
    full_name?: string;
    first_name?: string;
    last_name?: string;
    username?: string;
    avatar_url?: string;
    // Preferences merged in for legacy compatibility or separated?
    // Backend returns { profile, preferences }. We might need to merge them to match UI expectations.
}

export interface UserPreferences {
    theme: 'light' | 'dark' | 'system';
    language: string;
    notifications: any;
    chat_settings: any;
}

// ============================================
// USER PROFILES & ACCOUNTS
// ============================================

export const getUserProfile = async (userId: string) => {
    try {
        const res = await api.get<{ profile: any; preferences: any }>('/api/user/profile');
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

export const updateUserProfile = async (userId: string, updates: Partial<UserProfile>) => {
    try {
        const res = await api.patch<{ profile: any }>('/api/user/profile', updates);
        return { data: res.profile, error: null };
    } catch (error) {
        return { data: null, error };
    }
};

export const updateUserPreferences = async (userId: string, preferences: Partial<UserPreferences>) => {
    try {
        const res = await api.patch<{ preferences: any }>('/api/user/preferences', preferences);
        return { data: res.preferences, error: null };
    } catch (error) {
        return { data: null, error };
    }
};

// ============================================
// API KEYS
// ============================================

export const saveUserAPIKeys = async (userId: string, keys: any) => {
    try {
        const res = await api.post('/api/user/api-keys', keys);
        return { data: res, error: null };
    } catch (error) {
        return { data: null, error };
    }
}

export const getUserAPIKeys = async (userId: string) => {
    try {
        const res = await api.get<{ apiKeys: any }>('/api/user/api-keys');
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
