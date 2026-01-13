/**
 * StudioCanvas - Shared canvas wrapper for platform-specific studios
 *
 * Composes the BannerCanvas with platform-filtered format selector
 * and platform-specific UI elements (publish button, branding).
 */

import React, { Suspense, lazy, useCallback } from 'react';
import { useCanvas } from '@/context/CanvasContext';
import { useCanvasState } from '@/context/canvas';
import { useToast } from '@/hooks/useToast';
import { PlatformFormatSelector } from './PlatformFormatSelector';
import { shouldShowProfileOverlay } from '../config/platformConfig';
import type { PlatformStudioConfig } from '../config/platformConfig';
import LayersPanel from '../../features/editor/LayersPanel';
import AssetsPanel from '../../features/editor/AssetsPanel';
import { SnapshotsModal } from '../../features/SnapshotsModal';

const BannerCanvas = lazy(() => import('../../BannerCanvas'));

interface StudioCanvasProps {
  platformConfig: PlatformStudioConfig;
  onFormatChange?: (format: { id: string; width: number; height: number }) => void;
}

export function StudioCanvas({ platformConfig, onFormatChange }: StudioCanvasProps) {
  const toast = useToast();
  const [showSnapshots, setShowSnapshots] = React.useState(false);

  // Get canvas format for dynamic dimensions and zoom state
  const { canvasFormat, canvasFormatId, zoom, setZoom } = useCanvasState();

  // Single useCanvas call to avoid duplicate subscriptions
  const {
    canvasRef,
    bgImage,
    elements,
    showSafeZones,
    setShowSafeZones,
    profilePic,
    setProfilePic,
    setElements,
    selectedElementId,
    setSelectedElementId,
    profileTransform,
    setProfileTransform,
    saveCurrentSnapshot,
    setBgImage, // Added setBgImage
  } = useCanvas();

  // Check if profile overlay should show for this platform AND format combination
  const showProfileOverlay = shouldShowProfileOverlay(platformConfig.id, canvasFormatId);

  // Apply default background if specified and canvas is empty
  // Apply default background if specified
  // If canvas is empty OR if the current background is a default asset from ANOTHER platform, update it.
  React.useEffect(() => {
    if (platformConfig.defaultBackground) {
      const isDefaultAsset = bgImage && bgImage.includes('/assets/branding/') && bgImage.includes('_default.png');
      const isWrongPlatformDefault = isDefaultAsset && bgImage !== platformConfig.defaultBackground;

      if (!bgImage || isWrongPlatformDefault) {
        setBgImage(platformConfig.defaultBackground);
      }
    }
  }, [platformConfig.defaultBackground, bgImage, setBgImage]);

  const handleSaveSnapshot = () => {
    const name = `Design ${new Date().toLocaleTimeString()}`;
    saveCurrentSnapshot(name);
    toast.success('Snapshot saved: ' + name, { duration: 2000 });
  };

  // Handle Zoom
  const handleZoomIn = () => setZoom(Math.min(zoom + 0.1, 2.0));
  const handleZoomOut = () => setZoom(Math.max(zoom - 0.1, 0.5));
  const handleZoomReset = () => setZoom(1.0);

  // Placeholder handlers
  const handleProfileFaceEnhance = async () => { };
  const handleProfileRemoveBg = async () => { };

  // Profile upload handler - triggers file input for profile picture
  const handleProfileUpload = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const dataUrl = event.target?.result as string;
          setProfilePic(dataUrl);
          toast.success('Profile picture uploaded');
        };
        reader.onerror = () => {
          toast.error('Failed to read file');
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  }, [setProfilePic, toast]);

  return (
    <div className='flex-1 p-4 md:p-6 lg:p-8 flex flex-col items-center justify-start overflow-auto w-full relative'>
      {/* Platform Brand Accent Line */}
      <div
        className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${platformConfig.brandGradient}`}
      />

      <div className='w-full max-w-[1400px] flex flex-col items-center'>
        {/* Canvas Header */}
        <div className='w-full mb-6 flex flex-wrap justify-between items-center gap-4'>
          {/* Platform-Filtered Format Selector */}
          <PlatformFormatSelector
            platformConfig={platformConfig}
            onFormatChange={onFormatChange}
          />

          {/* Quick Actions */}
          <div className='flex items-center gap-2'>
            {/* Zoom Controls (Desktop) */}
            <div className='hidden md:flex items-center bg-zinc-800 rounded-xl p-1 mr-2'>
              <button
                type="button"
                onClick={handleZoomOut}
                className='w-8 h-8 flex items-center justify-center text-zinc-400 hover:text-white transition'
                title="Zoom Out"
              >
                <span className='material-icons text-sm'>remove</span>
              </button>
              <button
                type="button"
                onClick={handleZoomReset}
                className='px-2 text-xs font-bold text-zinc-300 min-w-[3rem] text-center'
                title="Reset Zoom"
              >
                {Math.round(zoom * 100)}%
              </button>
              <button
                type="button"
                onClick={handleZoomIn}
                className='w-8 h-8 flex items-center justify-center text-zinc-400 hover:text-white transition'
                title="Zoom In"
              >
                <span className='material-icons text-sm'>add</span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => setShowSafeZones(!showSafeZones)}
              className={`min-h-[44px] px-4 py-2 rounded-xl flex items-center gap-2 transition ${showSafeZones
                ? 'bg-purple-600 text-white'
                : 'bg-zinc-800 text-zinc-400 hover:text-white'
                }`}
              title="Toggle Safe Zones"
            >
              <span className='material-icons text-lg'>visibility</span>
              <span className='text-xs font-medium hidden sm:inline'>Safe Zones</span>
            </button>

            <button
              type="button"
              onClick={() => setShowSnapshots(true)}
              className='min-h-[44px] px-4 py-2 rounded-xl flex items-center gap-2 transition bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700'
              title="Load Snapshot"
            >
              <span className='material-icons text-lg'>folder_open</span>
              <span className='text-xs font-medium hidden sm:inline'>Load</span>
            </button>

            <button
              type="button"
              onClick={handleSaveSnapshot}
              className='min-h-[44px] px-4 py-2 rounded-xl flex items-center gap-2 transition bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700'
              title="Save Snapshot"
            >
              <span className='material-icons text-lg'>save</span>
              <span className='text-xs font-medium hidden sm:inline'>Save</span>
            </button>
          </div>
        </div>

        <div className='w-full flex justify-start md:justify-center'>
          <Suspense fallback={<div className="flex-1 flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div></div>}>
            <BannerCanvas
              ref={canvasRef}
              canvasWidth={canvasFormat.width}
              canvasHeight={canvasFormat.height}
              canvasFormatId={canvasFormatId}
              backgroundImage={bgImage}
              elements={elements}
              onElementsChange={setElements}
              selectedElementId={selectedElementId}
              onSelectElement={setSelectedElementId}
              showSafeZones={showSafeZones}
              profilePic={profilePic}
              profileTransform={profileTransform}
              setProfileTransform={setProfileTransform}
              onProfileFaceEnhance={handleProfileFaceEnhance}
              onProfileRemoveBg={handleProfileRemoveBg}
              zoom={zoom}
              showProfileOverlay={showProfileOverlay}
              profileOverlayConfig={showProfileOverlay ? platformConfig.profileOverlay : undefined}
              onProfileUpload={handleProfileUpload}
            />
          </Suspense>
        </div>

        {/* Control Panels - Mobile-first: stack on mobile, 2-col on tablet, 3-col on desktop */}
        <div className='w-full flex flex-col gap-3 mt-4 md:mt-6'>
          {/* Mobile: single column stack */}
          {/* Tablet+: Layers and Assets side by side */}
          <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
            <LayersPanel />
            <AssetsPanel />
          </div>
        </div>
      </div>

      {/* Snapshots Modal */}
      <SnapshotsModal isOpen={showSnapshots} onClose={() => setShowSnapshots(false)} />
    </div>
  );
}

export default StudioCanvas;
