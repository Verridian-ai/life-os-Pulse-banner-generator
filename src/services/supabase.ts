import { createClient, User, Session, AuthError } from '@supabase/supabase-js';
import { classifyError, getUserFriendlyMessage } from '../utils/errorHandler';

// Supabase configuration
// Supabase configuration
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://bkergrdlytwvdzszmuos.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_kKxTC0aLBuuqzN5QsaaPnw_Wj8FoSEy';

// Create Supabase client
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ============================================
// AUTH FUNCTIONS
// ============================================

export interface SignUpData {
    email: string;
    password: string;
    fullName?: string;
}

export interface SignInData {
    email: string;
    password: string;
}

/**
 * Sign up a new user with email and password
 */
export const signUp = async ({ email, password, fullName }: SignUpData) => {
    console.log('[Auth] Signing up user:', email);

    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                full_name: fullName,
            },
        },
    });

    if (error) {
        console.error('[Auth] Sign up error:', error);
        throw error;
    }

    console.log('[Auth] ✅ Sign up successful');
    return data;
};

/**
 * Sign in an existing user
 */
export const signIn = async ({ email, password }: SignInData) => {
    console.log('[Auth] Signing in user:', email);

    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (error) {
        console.error('[Auth] Sign in error:', error);
        throw error;
    }

    console.log('[Auth] ✅ Sign in successful');
    return data;
};

/**
 * Sign out the current user
 */
export const signOut = async () => {
    console.log('[Auth] Signing out...');

    const { error } = await supabase.auth.signOut();

    if (error) {
        console.error('[Auth] Sign out error:', error);
        throw error;
    }

    console.log('[Auth] ✅ Signed out successfully');
};

/**
 * Get the current user session
 */
export const getSession = async (): Promise<Session | null> => {
    const { data: { session } } = await supabase.auth.getSession();
    return session;
};

/**
 * Get the current user
 */
export const getCurrentUser = async (): Promise<User | null> => {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
};

/**
 * Subscribe to auth state changes
 */
export const onAuthStateChange = (callback: (user: User | null) => void) => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
        console.log('[Auth] State changed:', event, session?.user?.email);
        callback(session?.user ?? null);
    });

    return subscription;
};

/**
 * Send password reset email
 */
export const resetPassword = async (email: string) => {
    console.log('[Auth] Sending password reset email to:', email);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
        console.error('[Auth] Password reset error:', error);
        throw error;
    }

    console.log('[Auth] ✅ Password reset email sent');
};

// Storage bucket name for generated images
const IMAGES_BUCKET = 'generated-images';

/**
 * Get the current user ID from Supabase Auth
 * Falls back to anonymous ID if not authenticated
 */
export const getUserId = async (): Promise<string> => {
    const user = await getCurrentUser();

    if (user) {
        console.log('[Supabase] Using authenticated user ID:', user.id);
        return user.id;
    }

    // Fallback to anonymous user (for testing without auth)
    let anonId = localStorage.getItem('nanobanna_anon_id');

    if (!anonId) {
        anonId = `anon_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        localStorage.setItem('nanobanna_anon_id', anonId);
        console.log('[Supabase] Created anonymous ID:', anonId);
    }

    console.log('[Supabase] Using anonymous ID (not authenticated)');
    return anonId;
};

/**
 * Upload a base64 image to Supabase Storage
 * @param base64Image - Base64 encoded image (with or without data URI prefix)
 * @param fileName - Optional custom filename
 * @returns Public URL of the uploaded image
 */
export const uploadImage = async (
    base64Image: string,
    fileName?: string
): Promise<string> => {
    try {
        const userId = await getUserId();

        // Remove data URI prefix if present
        let base64Data = base64Image;
        let mimeType = 'image/png';

        if (base64Image.startsWith('data:')) {
            const matches = base64Image.match(/^data:([^;]+);base64,(.+)$/);
            if (matches) {
                mimeType = matches[1];
                base64Data = matches[2];
            }
        }

        // Convert base64 to blob
        const byteCharacters = atob(base64Data);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: mimeType });

        // Generate filename
        const timestamp = Date.now();
        const extension = mimeType.split('/')[1] || 'png';
        const finalFileName = fileName || `${timestamp}.${extension}`;
        const filePath = `${userId}/${finalFileName}`;

        console.log('[Supabase] Uploading image:', { filePath, size: blob.size, mimeType });

        // Upload to Supabase Storage
        const { data, error } = await supabase.storage
            .from(IMAGES_BUCKET)
            .upload(filePath, blob, {
                contentType: mimeType,
                upsert: true // Overwrite if exists
            });

        if (error) {
            console.error('[Supabase] Upload error:', error);

            // Classify error for better handling
            const networkError = classifyError(error);
            console.log('[Supabase] Error type:', networkError.type);

            if (networkError.type === 'cors') {
                throw new Error('Supabase CORS error - Check storage bucket permissions and ensure bucket is public.');
            } else if (networkError.type === 'network' || networkError.type === 'fetch') {
                throw new Error('Network error during upload - Check your internet connection and try again.');
            } else if (networkError.type === 'timeout') {
                throw new Error('Upload timeout - File may be too large or server is busy.');
            }

            throw new Error(`Supabase upload failed: ${error.message}`);
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
            .from(IMAGES_BUCKET)
            .getPublicUrl(filePath);

        console.log('[Supabase] ✅ Upload successful:', publicUrl);

        return publicUrl;
    } catch (error) {
        console.error('[Supabase] Upload failed:', error);

        // Re-classify in catch block for any unexpected errors
        const networkError = classifyError(error);
        const friendlyMessage = getUserFriendlyMessage(error);

        // Add context to error message
        if (networkError.type === 'cors' || networkError.type === 'network' || networkError.type === 'fetch') {
            throw new Error(`${friendlyMessage} (Upload to Supabase Storage failed)`);
        }

        throw error;
    }
};

/**
 * List all images for the current user
 */
export const listUserImages = async (): Promise<string[]> => {
    try {
        const userId = await getUserId();

        const { data, error } = await supabase.storage
            .from(IMAGES_BUCKET)
            .list(userId, {
                limit: 100,
                offset: 0,
                sortBy: { column: 'created_at', order: 'desc' }
            });

        if (error) {
            console.error('[Supabase] List error:', error);
            throw error;
        }

        // Get public URLs for all images
        const imageUrls = data.map(file => {
            const { data: { publicUrl } } = supabase.storage
                .from(IMAGES_BUCKET)
                .getPublicUrl(`${userId}/${file.name}`);
            return publicUrl;
        });

        console.log('[Supabase] Found', imageUrls.length, 'images for user');
        return imageUrls;
    } catch (error) {
        console.error('[Supabase] List failed:', error);
        return [];
    }
};

/**
 * Delete an image from Supabase Storage
 */
export const deleteImage = async (imageUrl: string): Promise<boolean> => {
    try {
        const userId = await getUserId();

        // Extract filename from URL
        const urlParts = imageUrl.split('/');
        const fileName = urlParts[urlParts.length - 1];
        const filePath = `${userId}/${fileName}`;

        const { error } = await supabase.storage
            .from(IMAGES_BUCKET)
            .remove([filePath]);

        if (error) {
            console.error('[Supabase] Delete error:', error);
            return false;
        }

        console.log('[Supabase] ✅ Image deleted:', filePath);
        return true;
    } catch (error) {
        console.error('[Supabase] Delete failed:', error);
        return false;
    }
};

/**
 * Initialize Supabase Storage bucket (run once)
 * This should be done from Supabase Dashboard or with service role key
 */
export const initializeBucket = async (): Promise<void> => {
    console.log('[Supabase] Bucket initialization should be done via Supabase Dashboard');
    console.log('[Supabase] Create a public bucket named:', IMAGES_BUCKET);
    console.log('[Supabase] Enable public access for image URLs');
};
