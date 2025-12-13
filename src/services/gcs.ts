// Google Cloud Storage Service - Image Upload & Management

import type { UploadImageRequest, UploadImageResponse } from '../types/database';

/**
 * Get GCS configuration from environment or user preferences
 */
const getGCSConfig = () => {
  return {
    projectId: import.meta.env.VITE_GCS_PROJECT_ID || localStorage.getItem('gcs_project_id') || '',
    bucketName:
      import.meta.env.VITE_GCS_BUCKET_NAME ||
      localStorage.getItem('gcs_bucket_name') ||
      'nanobanna-pro',
    // For client-side uploads, we'll use signed URLs from a backend endpoint
    // Or use Firebase Storage SDK which integrates well with GCS
  };
};

/**
 * Generate a unique filename
 */
const generateFileName = (file: File, folder?: string): string => {
  const timestamp = Date.now();
  const randomStr = Math.random().toString(36).substring(2, 15);
  const ext = file.name.split('.').pop();
  const prefix = folder ? `${folder}/` : '';
  return `${prefix}${timestamp}-${randomStr}.${ext}`;
};

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
 * Upload image to Google Cloud Storage
 *
 * IMPORTANT: This is a simplified implementation.
 * For production, you should:
 * 1. Create a backend endpoint that generates signed URLs
 * 2. Use the signed URL to upload directly to GCS
 * 3. Or use Firebase Storage SDK for easier client-side uploads
 *
 * For now, this converts to base64 for database storage (not recommended for large images)
 */
export const uploadImageToGCS = async (
  request: UploadImageRequest,
): Promise<UploadImageResponse> => {
  const { file, folder } = request;

  try {
    // Get image dimensions
    const dimensions = await getImageDimensions(file);

    // For demo purposes, convert to base64 and store in localStorage
    // In production, replace this with actual GCS upload using signed URLs
    const base64 = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

    const fileName = generateFileName(file, folder);

    // Store in localStorage as a mock (replace with actual GCS upload)
    const mockUrl = `https://storage.googleapis.com/${getGCSConfig().bucketName}/${fileName}`;
    localStorage.setItem(`gcs_mock_${fileName}`, base64);

    return {
      url: mockUrl,
      file_name: fileName,
      file_size: file.size,
      width: dimensions.width,
      height: dimensions.height,
    };
  } catch (error: unknown) {
    console.error('GCS upload error:', error);
    throw new Error(
      `Failed to upload image: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }
};

/**
 * Upload image via backend signed URL (recommended approach)
 *
 * Backend endpoint should:
 * 1. Receive upload request
 * 2. Generate signed URL with GCS client library
 * 3. Return signed URL to client
 * 4. Client uploads directly to GCS using signed URL
 */
export const uploadImageViaSignedURL = async (
  file: File,
  folder?: string,
): Promise<UploadImageResponse> => {
  const fileName = generateFileName(file, folder);

  try {
    // Step 1: Request signed URL from your backend
    const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';
    const signedUrlResponse = await fetch(`${backendUrl}/api/storage/signed-url`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('supabase.auth.token')}`,
      },
      body: JSON.stringify({
        fileName,
        contentType: file.type,
      }),
    });

    if (!signedUrlResponse.ok) {
      throw new Error('Failed to get signed URL');
    }

    const { signedUrl, publicUrl } = await signedUrlResponse.json();

    // Step 2: Upload file directly to GCS using signed URL
    const uploadResponse = await fetch(signedUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': file.type,
      },
      body: file,
    });

    if (!uploadResponse.ok) {
      throw new Error('Failed to upload to GCS');
    }

    // Step 3: Get image dimensions
    const dimensions = await getImageDimensions(file);

    return {
      url: publicUrl,
      file_name: fileName,
      file_size: file.size,
      width: dimensions.width,
      height: dimensions.height,
    };
  } catch (error: unknown) {
    console.error('Signed URL upload error:', error);
    // Fallback to base64 upload
    return uploadImageToGCS({
      file,
      folder: folder as 'designs' | 'references' | 'avatars' | 'logos' | undefined,
    });
  }
};

/**
 * Delete image from GCS
 */
export const deleteImageFromGCS = async (fileUrl: string): Promise<boolean> => {
  try {
    const fileName = fileUrl.split('/').pop();
    if (!fileName) return false;

    // For mock implementation
    localStorage.removeItem(`gcs_mock_${fileName}`);

    // In production, use backend endpoint to delete:
    // const backendUrl = import.meta.env.VITE_BACKEND_URL;
    // await fetch(`${backendUrl}/api/storage/delete`, {
    //   method: 'DELETE',
    //   body: JSON.stringify({ fileName }),
    // });

    return true;
  } catch (error) {
    console.error('GCS delete error:', error);
    return false;
  }
};

/**
 * Get image URL (handles both GCS and base64 mock)
 */
export const getImageUrl = (fileUrl: string): string => {
  // If it's already a full URL, return it
  if (fileUrl.startsWith('http') || fileUrl.startsWith('data:')) {
    return fileUrl;
  }

  // Check if it's a mock file in localStorage
  const fileName = fileUrl.split('/').pop();
  if (fileName) {
    const mockData = localStorage.getItem(`gcs_mock_${fileName}`);
    if (mockData) return mockData;
  }

  // Otherwise, construct GCS URL
  const { bucketName } = getGCSConfig();
  return `https://storage.googleapis.com/${bucketName}/${fileUrl}`;
};

/**
 * Batch upload multiple images
 */
export const uploadMultipleImages = async (
  files: File[],
  folder?: string,
): Promise<UploadImageResponse[]> => {
  const uploads = files.map((file) => uploadImageViaSignedURL(file, folder));
  return Promise.all(uploads);
};

/**
 * Upload canvas as image
 */
export const uploadCanvasAsImage = async (
  canvas: HTMLCanvasElement,
  fileName: string,
  folder?: string,
): Promise<UploadImageResponse> => {
  return new Promise((resolve, reject) => {
    canvas.toBlob(async (blob) => {
      if (!blob) {
        reject(new Error('Failed to convert canvas to blob'));
        return;
      }

      const file = new File([blob], fileName, { type: 'image/png' });
      try {
        const result = await uploadImageViaSignedURL(file, folder);
        resolve(result);
      } catch (error) {
        reject(error);
      }
    }, 'image/png');
  });
};
