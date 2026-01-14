/**
 * LinkedInStudio - Platform-specific studio for LinkedIn content
 *
 * Features:
 * - Filtered format selector (LinkedIn formats only)
 * - "524 px zone" profile overlay on Banner format ONLY
 * - Publish to LinkedIn button (enabled)
 * - LinkedIn brand colors (blue gradient)
 */

import React from 'react';
import { StudioCanvas } from './shared/StudioCanvas';
import GenerativeSidebar from '../features/GenerativeSidebar';
import { PLATFORM_CONFIGS } from './config/platformConfig';
import { useCanvas } from '@/context/CanvasContext';

interface LinkedInStudioProps {
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

export function LinkedInStudio({
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
}: LinkedInStudioProps) {
  const config = PLATFORM_CONFIGS.linkedin;
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

export default LinkedInStudio;
