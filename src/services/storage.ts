import { api } from './api';

export const uploadImage = async (userId: string, file: File, bucket = 'user-data') => {
  try {
    // 1. Get Signed Upload URL from Backend
    const { url, filePath } = await api.post<{ url: string; filePath: string }>('/api/storage/upload-url', {
      filename: file.name,
      contentType: file.type,
      sizeBytes: file.size
    });

    // 2. Upload to GCS directly
    const uploadRes = await fetch(url, {
      method: 'PUT',
      body: file,
      headers: {
        'Content-Type': file.type
      }
    });

    if (!uploadRes.ok) {
      throw new Error('Failed to upload to storage');
    }

    // 3. Confirm (Optional, for quota usage tracking)
    await api.post('/api/storage/confirm-upload', { filePath });

    return {
      data: { path: filePath, fullPath: filePath },
      error: null
    };

  } catch (error) {
    console.error('Upload error:', error);
    return { data: null, error };
  }
};

export const getPublicUrl = async (path: string, bucket = 'user-data') => {
  // We treat "public URL" as a signed read URL for private user data
  try {
    const { url } = await api.post<{ url: string }>('/api/storage/read-url', { filePath: path });
    return { data: { publicUrl: url } };
  } catch (e) {
    console.error('Get URL error:', e);
    return { data: { publicUrl: '' } }; // Fallback
  }
};

export const deleteImage = async (path: string, bucket = 'user-data') => {
  try {
    await api.post('/api/storage/delete', { filePath: path });
    return { data: {}, error: null };
  } catch (error) {
    return { data: null, error };
  }
};
