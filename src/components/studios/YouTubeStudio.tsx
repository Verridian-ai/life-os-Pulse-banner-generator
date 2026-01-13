/**
 * YouTubeStudio - Platform-specific studio for YouTube content
 *
 * Features:
 * - Filtered format selector (YouTube formats only: shorts, thumbnail, banner, endscreen)
 * - NO profile overlay (YouTube doesn't have banner profile overlap)
 * - Upload to YouTube button (disabled until API integration)
 * - YouTube brand colors (red gradient)
 */

import React from 'react';
import { StudioCanvas } from './shared/StudioCanvas';
import GenerativeSidebar from '../features/GenerativeSidebar';
import { PLATFORM_CONFIGS } from './config/platformConfig';
import { useCanvas } from '@/context/CanvasContext';

interface YouTubeStudioProps {
  genPrompt?: string;
  setGenPrompt?: (prompt: string) => void;
  genSize?: '1K' | '2K' | '4K';
  setGenSize?: (size: '1K' | '2K' | '4K') => void;
  isGenerating?: boolean;
  onGenerate?: () => void;
  isMagicPrompting?: boolean;
  onMagicPrompt?: () => void;
  isEnhancing?: boolean;
  onEnhancePrompt?: () => void;
  editPrompt?: string;
  setEditPrompt?: (prompt: string) => void;
  isEditing?: boolean;
  onEdit?: () => void;
  onRemoveBg?: () => void;
  onUpscale?: () => void;
}

export function YouTubeStudio({
  genPrompt = '',
  setGenPrompt = () => {},
  genSize = '1K',
  setGenSize = () => {},
  isGenerating = false,
  onGenerate = () => {},
  isMagicPrompting = false,
  onMagicPrompt = () => {},
  isEnhancing = false,
  onEnhancePrompt = () => {},
  editPrompt = '',
  setEditPrompt = () => {},
  isEditing = false,
  onEdit = () => {},
  onRemoveBg = () => {},
  onUpscale = () => {},
}: YouTubeStudioProps) {
  const config = PLATFORM_CONFIGS.youtube;
  const { refImages, bgImage, setBgImage } = useCanvas();

  return (
    <div className="flex-1 flex flex-col md:flex-row h-auto w-full overflow-hidden">
      <StudioCanvas platformConfig={config} />
      <GenerativeSidebar
        refImages={refImages}
        genPrompt={genPrompt}
        setGenPrompt={setGenPrompt}
        genSize={genSize}
        setGenSize={setGenSize}
        isGenerating={isGenerating}
        onGenerate={onGenerate}
        isMagicPrompting={isMagicPrompting}
        onMagicPrompt={onMagicPrompt}
        isEnhancing={isEnhancing}
        onEnhancePrompt={onEnhancePrompt}
        editPrompt={editPrompt}
        setEditPrompt={setEditPrompt}
        isEditing={isEditing}
        onEdit={onEdit}
        onRemoveBg={onRemoveBg}
        onUpscale={onUpscale}
        bgImage={bgImage}
        onImageUpdate={(img: string) => setBgImage(img)}
      />
    </div>
  );
}

export default YouTubeStudio;
