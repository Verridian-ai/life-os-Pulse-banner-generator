/**
 * InstagramStudio - Platform-specific studio for Instagram content
 *
 * Features:
 * - Filtered format selector (Instagram formats only: reels, story, portrait, post, avatar)
 * - NO profile overlay
 * - Share to Instagram button (disabled until API integration)
 * - Instagram brand colors (pink/purple/orange gradient)
 */

import React from 'react';
import { StudioCanvas } from './shared/StudioCanvas';
import GenerativeSidebar from '../features/GenerativeSidebar';
import { PLATFORM_CONFIGS } from './config/platformConfig';
import { useCanvas } from '@/context/CanvasContext';

interface InstagramStudioProps {
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

export function InstagramStudio({
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
}: InstagramStudioProps) {
  const config = PLATFORM_CONFIGS.instagram;
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

export default InstagramStudio;
