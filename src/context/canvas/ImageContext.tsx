import React, { createContext, useContext, useState, ReactNode } from 'react';

import { BannerElement } from '../../types';

import { useCanvasState } from './CanvasStateContext';
import { useElements } from './ElementsContext';

/**
 * ImageContext - Image and profile management
 *
 * Handles:
 * - Profile picture state and upload
 * - Profile transform (position and scale)
 * - Reference images state and upload
 * - Background image upload
 * - AI suggestions (placeholder)
 *
 * Note: This context depends on CanvasStateContext and ElementsContext.
 * It must be used within those providers.
 */

// Types
export type ImageContextType = {
  profilePic: string | null;
  setProfilePic: (img: string | null) => void;

  profileTransform: { x: number; y: number; scale: number };
  setProfileTransform: (val: { x: number; y: number; scale: number }) => void;

  refImages: string[];
  setRefImages: (images: string[] | ((prev: string[]) => string[])) => void;

  // File Handlers
  handleProfileUpload: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
  handleRefUpload: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
  handleBgUpload: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>;

  // AI (placeholder for now)
  aiSuggestions: { magicEdit: string[]; generation: string[] };
};

// Context
const ImageContext = createContext<ImageContextType | undefined>(undefined);

// Export for testing
export { ImageContext };

// Helper function for image optimization
function optimizeImage(file: File, maxWidth: number, maxHeight: number): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (e) => {
      const img = new Image();
      img.src = e.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height *= maxWidth / width;
          width = maxWidth;
        }
        if (height > maxHeight) {
          width *= maxHeight / height;
          height = maxHeight;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/png', 0.9));
      };
      img.onerror = reject;
    };
    reader.onerror = reject;
  });
}

// Provider Props
type ImageProviderProps = {
  children: ReactNode;
};

// Provider Component
export function ImageProvider({ children }: ImageProviderProps): React.ReactElement {
  const { setBgImage, setIsProcessingImg } = useCanvasState();
  const { setElements } = useElements();

  const [profilePic, setProfilePic] = useState<string | null>(null);
  const [profileTransform, setProfileTransform] = useState({ x: 0, y: 0, scale: 1 });
  const [refImages, setRefImages] = useState<string[]>([]);
  const [aiSuggestions] = useState({ magicEdit: [], generation: [] });

  // File Handlers
  const handleBgUpload = async (e: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
    if (e.target.files?.[0]) {
      setIsProcessingImg(true);
      try {
        const base64 = await optimizeImage(e.target.files[0], 1920, 1080);
        setBgImage(base64);
      } catch (err) {
        console.error('BG upload failed', err);
      } finally {
        setIsProcessingImg(false);
      }
    }
  };

  const handleProfileUpload = async (e: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
    if (e.target.files?.[0]) {
      setIsProcessingImg(true);
      try {
        const base64 = await optimizeImage(e.target.files[0], 500, 500);
        setProfilePic(base64);
      } catch (err) {
        console.error('Profile upload failed', err);
      } finally {
        setIsProcessingImg(false);
      }
    }
  };

  const handleRefUpload = async (e: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
    if (e.target.files) {
      setIsProcessingImg(true);
      const files = Array.from(e.target.files);
      try {
        const promises = files.map((f: File) => optimizeImage(f, 1500, 1500));
        const results = await Promise.all(promises);

        // 1. Add to Library
        setRefImages((prev: string[]) => [...prev, ...results]);

        // 2. Auto-add to Banner (Safe Spot)
        const newElements = results.map((img, idx) => ({
          id: Date.now().toString() + idx,
          type: 'image' as const,
          content: img,
          x: 1350 - idx * 20, // Slight cascade if multiple
          y: 40 + idx * 20,
          width: 150,
          height: 150,
          rotation: 0,
        }));

        setElements((prev: BannerElement[]) => [...prev, ...newElements]);
      } catch (err) {
        console.error('Reference upload failed', err);
      } finally {
        setIsProcessingImg(false);
      }
    }
  };

  const value: ImageContextType = {
    profilePic,
    setProfilePic,
    profileTransform,
    setProfileTransform,
    refImages,
    setRefImages,
    handleProfileUpload,
    handleRefUpload,
    handleBgUpload,
    aiSuggestions,
  };

  return <ImageContext.Provider value={value}>{children}</ImageContext.Provider>;
}

// Hook
// eslint-disable-next-line react-refresh/only-export-components
export function useImages(): ImageContextType {
  const context = useContext(ImageContext);
  if (!context) {
    throw new Error('useImages must be used within ImageProvider');
  }
  return context;
}
