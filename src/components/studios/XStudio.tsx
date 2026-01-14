/**
 * XStudio - Platform-specific studio for X (Twitter) content
 *
 * Features:
 * - Filtered format selector (X formats only: post, card, header, profile)
 * - NO profile overlay
 * - Post to X button (disabled until API integration)
 * - X brand colors (gray/black gradient)
 */

import React from 'react';
import { StudioCanvas } from './shared/StudioCanvas';
import GenerativeSidebar from '../features/GenerativeSidebar';
import { PLATFORM_CONFIGS } from './config/platformConfig';
import { useCanvas } from '@/context/CanvasContext';

interface XStudioProps {
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

export function XStudio({
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
}: XStudioProps) {
  const config = PLATFORM_CONFIGS.x;
  const { refImages, bgImage, setBgImage } = useCanvas();

  return (
    <div className='flex-1 flex flex-col md:flex-row h-auto w-full overflow-hidden'>
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

export default XStudio;
