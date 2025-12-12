// Storage Service - Supabase Storage Client

import { supabase as supabaseClient } from './auth';
import type { UploadImageRequest, UploadImageResponse } from '../types/database';

type BucketName = 'designs' | 'references' | 'avatars' | 'logos';

/**
 * Get Supabase client or return null if not configured
 */
const getSupabase = () => {
  if (!supabaseClient) {
    console.warn('Supabase not configured - storage operations disabled');
    return null;
  }
  return supabaseClient;
};

// Create a proxy that we can use throughout the file
const supabase = new Proxy({} as any, {
  get(target, prop) {
    const client = getSupabase();
    if (!client) {
      throw new Error('Supabase not configured');
    }
    return client[prop as keyof typeof client];
  }
});

/**
 * Get image dimensions from file
 */
const getImageDimensions = (file: File): Promise<{ width: number; height: number }> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({ width: img.width, height: img.height });
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image'));
    };

    img.src = url;
  });
};

/**
 * Generate a unique filename with user folder structure
 */
const generateFileName = async (file: File, bucket: BucketName): Promise<string> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const timestamp = Date.now();
  const randomStr = Math.random().toString(36).substring(2, 15);
  const ext = file.name.split('.').pop();

  // Structure: {userId}/{timestamp}-{random}.{ext}
  return `${user.id}/${timestamp}-${randomStr}.${ext}`;
};

/**
 * Upload image to Supabase Storage
 */
export const uploadImage = async (
  file: File,
  bucket: BucketName = 'designs'
): Promise<UploadImageResponse> => {
  try {
    // Generate unique filename
    const fileName = await generateFileName(file, bucket);

    // Get image dimensions
    const dimensions = await getImageDimensions(file);

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) throw error;

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(fileName);

    return {
      url: publicUrl,
      file_name: fileName,
      file_size: file.size,
      width: dimensions.width,
      height: dimensions.height,
    };
  } catch (error: any) {
    console.error('Upload error:', error);
    throw new Error(`Failed to upload image: ${error.message}`);
  }
};

/**
 * Upload image with request object
 */
export const uploadImageToStorage = async (
  request: UploadImageRequest
): Promise<UploadImageResponse> => {
  const bucket = (request.folder || 'designs') as BucketName;
  return uploadImage(request.file, bucket);
};

/**
 * Delete image from Supabase Storage
 */
export const deleteImage = async (
  fileUrl: string,
  bucket: BucketName = 'designs'
): Promise<boolean> => {
  try {
    // Extract file path from URL
    const urlParts = fileUrl.split(`/storage/v1/object/public/${bucket}/`);
    if (urlParts.length < 2) {
      throw new Error('Invalid file URL');
    }

    const filePath = urlParts[1];

    const { error } = await supabase.storage
      .from(bucket)
      .remove([filePath]);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Delete error:', error);
    return false;
  }
};

/**
 * Upload multiple images
 */
export const uploadMultipleImages = async (
  files: File[],
  bucket: BucketName = 'designs'
): Promise<UploadImageResponse[]> => {
  const uploads = files.map((file) => uploadImage(file, bucket));
  return Promise.all(uploads);
};

/**
 * Upload canvas as PNG image
 */
export const uploadCanvasAsImage = async (
  canvas: HTMLCanvasElement,
  fileName: string,
  bucket: BucketName = 'designs'
): Promise<UploadImageResponse> => {
  return new Promise((resolve, reject) => {
    canvas.toBlob(async (blob) => {
      if (!blob) {
        reject(new Error('Failed to convert canvas to blob'));
        return;
      }

      const file = new File([blob], fileName, { type: 'image/png' });

      try {
        const result = await uploadImage(file, bucket);
        resolve(result);
      } catch (error) {
        reject(error);
      }
    }, 'image/png', 0.95);
  });
};

/**
 * Get signed URL for private files (not needed for public buckets, but included for completeness)
 */
export const getSignedUrl = async (
  filePath: string,
  bucket: BucketName = 'designs',
  expiresIn: number = 3600
): Promise<string> => {
  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(filePath, expiresIn);

  if (error) throw error;
  return data.signedUrl;
};

/**
 * List files for current user
 */
export const listUserFiles = async (
  bucket: BucketName = 'designs'
): Promise<any[]> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase.storage
    .from(bucket)
    .list(user.id, {
      sortBy: { column: 'created_at', order: 'desc' },
    });

  if (error) {
    console.error('List files error:', error);
    return [];
  }

  return data || [];
};

/**
 * Get file metadata
 */
export const getFileMetadata = async (
  filePath: string,
  bucket: BucketName = 'designs'
): Promise<any | null> => {
  const { data, error } = await supabase.storage
    .from(bucket)
    .list(filePath.split('/')[0], {
      search: filePath.split('/').pop(),
    });

  if (error || !data || data.length === 0) {
    console.error('Get metadata error:', error);
    return null;
  }

  return data[0];
};

/**
 * Download file as blob
 */
export const downloadFile = async (
  filePath: string,
  bucket: BucketName = 'designs'
): Promise<Blob | null> => {
  const { data, error } = await supabase.storage
    .from(bucket)
    .download(filePath);

  if (error) {
    console.error('Download error:', error);
    return null;
  }

  return data;
};

/**
 * Move/Rename file
 */
export const moveFile = async (
  fromPath: string,
  toPath: string,
  bucket: BucketName = 'designs'
): Promise<boolean> => {
  const { error } = await supabase.storage
    .from(bucket)
    .move(fromPath, toPath);

  if (error) {
    console.error('Move error:', error);
    return false;
  }

  return true;
};

/**
 * Copy file
 */
export const copyFile = async (
  fromPath: string,
  toPath: string,
  bucket: BucketName = 'designs'
): Promise<boolean> => {
  const { error } = await supabase.storage
    .from(bucket)
    .copy(fromPath, toPath);

  if (error) {
    console.error('Copy error:', error);
    return false;
  }

  return true;
};

/**
 * Get public URL for a file
 */
export const getPublicUrl = (filePath: string, bucket: BucketName = 'designs'): string => {
  const { data } = supabase.storage
    .from(bucket)
    .getPublicUrl(filePath);

  return data.publicUrl;
};

/**
 * Upload user avatar
 */
export const uploadAvatar = async (file: File): Promise<string> => {
  const result = await uploadImage(file, 'avatars');
  return result.url;
};

/**
 * Upload brand logo
 */
export const uploadLogo = async (file: File): Promise<string> => {
  const result = await uploadImage(file, 'logos');
  return result.url;
};

/**
 * Upload reference image
 */
export const uploadReference = async (file: File): Promise<UploadImageResponse> => {
  return uploadImage(file, 'references');
};

/**
 * Upload design
 */
export const uploadDesign = async (file: File): Promise<UploadImageResponse> => {
  return uploadImage(file, 'designs');
};
