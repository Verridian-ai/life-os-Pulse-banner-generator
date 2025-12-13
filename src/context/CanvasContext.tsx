import React, { createContext, useContext, useState, useRef, ReactNode, useCallback } from 'react';
import { BannerElement } from '../types';
import { BannerCanvasHandle } from '../components/BannerCanvas';

interface CanvasContextType {
  // Refs
  canvasRef: React.RefObject<BannerCanvasHandle | null>;

  // State
  bgImage: string | null;
  setBgImage: (img: string | null) => void;

  elements: BannerElement[];
  setElements: (elements: BannerElement[] | ((prev: BannerElement[]) => BannerElement[])) => void;

  selectedElementId: string | null;
  setSelectedElementId: (id: string | null) => void;

  showSafeZones: boolean;
  setShowSafeZones: (show: boolean) => void;

  profilePic: string | null;
  setProfilePic: (img: string | null) => void;

  refImages: string[];
  setRefImages: (images: string[] | ((prev: string[]) => string[])) => void;

  isProcessingImg: boolean;
  setIsProcessingImg: (isProcessing: boolean) => void;

  // Image History
  imageHistory: string[];
  historyIndex: number;
  canUndo: boolean;
  canRedo: boolean;
  undo: () => void;
  redo: () => void;
  addToHistory: (img: string) => void;

  // Actions
  addElement: (el: BannerElement) => void;
  updateElement: (id: string, changes: Partial<BannerElement>) => void;
  deleteElement: (id: string) => void;
  centerElement: (id: string, axis: 'horizontal' | 'vertical') => void;

  // File Handlers
  handleProfileUpload: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>;

  handleRefUpload: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
  handleBgUpload: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>;

  // Profile Transform
  profileTransform: { x: number; y: number; scale: number };
  setProfileTransform: (val: { x: number; y: number; scale: number }) => void;

  // AI
  aiSuggestions: { magicEdit: string[]; generation: string[] };
}

const CanvasContext = createContext<CanvasContextType | undefined>(undefined);

export const CanvasProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const canvasRef = useRef<BannerCanvasHandle | null>(null);

  // State
  const [bgImage, setBgImage] = useState<string | null>(null);
  const [elements, setElements] = useState<BannerElement[]>([]);
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [showSafeZones, setShowSafeZones] = useState(true);
  const [profilePic, setProfilePic] = useState<string | null>(null);
  const [profileTransform, setProfileTransform] = useState({ x: 0, y: 0, scale: 1 });
  const [refImages, setRefImages] = useState<string[]>([]);
  const [isProcessingImg, setIsProcessingImg] = useState(false);
  const [aiSuggestions] = useState({ magicEdit: [], generation: [] }); // Placeholder for now

  // Image History State (stack-based undo/redo)
  const [imageHistory, setImageHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);

  // Computed history flags
  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < imageHistory.length - 1;

  // Helpers
  const optimizeImage = (file: File, maxWidth: number, maxHeight: number): Promise<string> => {
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
  };

  const handleBgUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
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

  // Actions
  const addElement = useCallback((el: BannerElement) => {
    setElements((prev) => [...prev, el]);
    setSelectedElementId(el.id);
  }, []);

  const updateElement = useCallback((id: string, changes: Partial<BannerElement>) => {
    setElements((prev) => prev.map((el) => (el.id === id ? { ...el, ...changes } : el)));
  }, []);

  const deleteElement = useCallback(
    (id: string) => {
      setElements((prev) => prev.filter((el) => el.id !== id));
      if (selectedElementId === id) setSelectedElementId(null);
    },
    [selectedElementId],
  );

  const centerElement = useCallback((id: string, axis: 'horizontal' | 'vertical') => {
    setElements((prev) =>
      prev.map((el) => {
        if (el.id !== id) return el;

        // Logic duplicated from App.tsx for now - ideally constants should be used
        const BANNER_WIDTH = 1584;
        const BANNER_HEIGHT = 396;

        const newPos: Partial<BannerElement> = {};
        if (axis === 'horizontal') {
          if (el.type === 'text') {
            // Approximate centering for text if no width
            newPos.x = BANNER_WIDTH / 2;
            newPos.textAlign = 'center';
          } else {
            const w = el.width || 0;
            newPos.x = (BANNER_WIDTH - w) / 2;
          }
        } else {
          const h = el.type === 'text' ? (el.fontSize || 60) * 1.2 : el.height || 0;
          newPos.y = (BANNER_HEIGHT - h) / 2;
        }
        return { ...el, ...newPos };
      }),
    );
  }, []);

  // Image History Management
  const addToHistory = useCallback(
    (img: string) => {
      setImageHistory((prev) => {
        // Remove any "future" history if we're not at the end
        const newHistory = prev.slice(0, historyIndex + 1);
        // Add new image
        newHistory.push(img);
        // Limit history to last 20 images to prevent memory issues
        if (newHistory.length > 20) {
          newHistory.shift();
          setHistoryIndex(newHistory.length - 1);
          return newHistory;
        }
        setHistoryIndex(newHistory.length - 1);
        return newHistory;
      });
    },
    [historyIndex],
  );

  const undo = useCallback(() => {
    if (canUndo) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setBgImage(imageHistory[newIndex]);
      console.log('[History] Undo to index', newIndex);
    }
  }, [canUndo, historyIndex, imageHistory]);

  const redo = useCallback(() => {
    if (canRedo) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setBgImage(imageHistory[newIndex]);
      console.log('[History] Redo to index', newIndex);
    }
  }, [canRedo, historyIndex, imageHistory]);

  // File Handlers
  const handleProfileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
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

  const handleRefUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setIsProcessingImg(true);
      const files = Array.from(e.target.files);
      try {
        const promises = files.map((f) => optimizeImage(f, 1500, 1500));
        const results = await Promise.all(promises);

        // 1. Add to Library
        setRefImages((prev) => [...prev, ...results]);

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

        setElements((prev) => [...prev, ...newElements]);
      } catch (err) {
        console.error('Reference upload failed', err);
      } finally {
        setIsProcessingImg(false);
      }
    }
  };

  return (
    <CanvasContext.Provider
      value={{
        canvasRef,
        bgImage,
        setBgImage,
        elements,
        setElements,
        selectedElementId,
        setSelectedElementId,
        showSafeZones,
        setShowSafeZones,
        profilePic,
        setProfilePic,
        refImages,
        setRefImages,
        isProcessingImg,
        setIsProcessingImg,
        imageHistory,
        historyIndex,
        canUndo,
        canRedo,
        undo,
        redo,
        addToHistory,
        addElement,
        updateElement,
        deleteElement,
        centerElement,
        handleProfileUpload,
        handleRefUpload,
        handleBgUpload,
        profileTransform,
        setProfileTransform,
        aiSuggestions,
      }}
    >
      {children}
    </CanvasContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useCanvas = () => {
  const context = useContext(CanvasContext);
  if (!context) {
    throw new Error('useCanvas must be used within a CanvasProvider');
  }
  return context;
};
