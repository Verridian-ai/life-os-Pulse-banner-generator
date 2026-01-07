import { useState, useRef, useCallback } from 'react';
import { optimizeImage } from '@/utils';
import type { UseFileAttachmentReturn } from '../types';

/**
 * Custom hook for managing file attachments in chat
 * Handles image upload, optimization, and removal
 */
export function useFileAttachment(): UseFileAttachmentReturn {
  const [attachedImages, setAttachedImages] = useState<string[]>([]);
  const [processingFiles, setProcessingFiles] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  /**
   * Handle image upload from file input
   * Optimizes images to 1024x1024 for Gemini API
   * @param files - FileList from input change event
   */
  const handleImageUpload = useCallback(async (files: FileList): Promise<void> => {
    if (!files || files.length === 0) return;

    setProcessingFiles(true);
    const fileArray: File[] = Array.from(files);
    try {
      // Resize for Gemini API (1024 max dimension is usually safe and efficient for token usage)
      const optimizedPromises = fileArray.map((file) => optimizeImage(file, 1024, 1024));
      const results = await Promise.all(optimizedPromises);
      // Map the result objects to just the base64 strings needed for the chat state
      const base64Images = results.map((r) => r.base64);
      setAttachedImages((prev) => [...prev, ...base64Images]);
      console.log('[useFileAttachment] Uploaded', base64Images.length, 'images');
    } catch (err) {
      console.error('[useFileAttachment] Failed to process chat images:', err);
    } finally {
      setProcessingFiles(false);
    }
  }, []);

  /**
   * Remove an attached image by index
   * @param index - Index of the image to remove
   */
  const removeImage = useCallback((index: number): void => {
    setAttachedImages((prev) => prev.filter((_, i) => i !== index));
    console.log('[useFileAttachment] Removed image at index:', index);
  }, []);

  return {
    attachedImages,
    setAttachedImages,
    processingFiles,
    handleImageUpload,
    removeImage,
    fileInputRef,
  };
}
