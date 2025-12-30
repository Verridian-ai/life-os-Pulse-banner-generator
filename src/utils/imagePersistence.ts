import { uploadImage } from '../services/storage';
import { createImage } from '../services/database';

/**
 * Downloads an image from a temporary URL (e.g. Replicate) and uploads it to permanent storage (GCS),
 * then saves the record in the database.
 */
export const persistImageToGallery = async (
    userId: string,
    url: string,
    metadata: {
        prompt: string;
        model_used: string;
        quality?: string;
        generation_type?: 'generate' | 'edit' | 'upscale' | 'remove-bg' | 'restore' | 'face-enhance';
        tags?: string[];
    }
) => {
    try {
        console.log('[Persistence] Requesting server-side persistence for:', url);

        // Use the new server-side endpoint that handles download -> upload -> db
        // This avoids client-side CORS issues with Replicate/GCS
        const response = await fetch('/api/images/persist', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                url,
                prompt: metadata.prompt,
                model_used: metadata.model_used,
                quality: metadata.quality,
                generation_type: metadata.generation_type,
                tags: metadata.tags,
                width: 1024, // Default, could be refined
                height: 1024
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Server persistence failed: ${response.status} ${errorText}`);
        }

        const data = await response.json();
        console.log('[Persistence] Success:', data);
        return true;
    } catch (e) {
        console.error('[Persistence] Failed:', e);
        return false;
    }
};

/**
 * Persists a local file upload to GCS and Database
 */
export const persistFileToGallery = async (
    userId: string,
    file: File,
    metadata: {
        prompt?: string;
        model_used?: string;
        generation_type?: 'generate' | 'edit' | 'upscale' | 'remove-bg' | 'restore' | 'face-enhance' | 'upload';
        tags?: string[];
    }
) => {
    try {
        console.log('[Persistence] Uploading local file:', file.name);
        const { data: uploadData, error } = await uploadImage(userId, file);

        if (error || !uploadData) {
            console.error('[Persistence] Storage upload failed:', error);
            throw new Error('Storage upload failed');
        }

        await createImage({
            storage_url: uploadData.path,
            file_name: file.name,
            file_size_bytes: file.size,
            prompt: metadata.prompt || 'Uploaded Image',
            model_used: metadata.model_used || 'upload',
            quality: 'original',
            generation_type: 'upload',
            tags: metadata.tags || ['upload']
        });

        console.log('[Persistence] Local file persisted successfully');
        return true;
    } catch (e) {
        console.error('[Persistence] Local file persistence failed:', e);
        return false;
    }
};
