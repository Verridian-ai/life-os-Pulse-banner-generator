import React from 'react';
import BannerCanvas from '../BannerCanvas';
import { useCanvas } from '../../context/CanvasContext';
import { BANNER_WIDTH, BANNER_HEIGHT } from '../../constants';
import AssetsPanel from './editor/AssetsPanel';
import LayersPanel from './editor/LayersPanel';
import ExportPanel from './editor/ExportPanel';
import { KeyboardShortcutsPanel } from './KeyboardShortcutsPanel';
import { BTN_NEU_SOLID } from '../../styles';
import { getReplicateService } from '../../services/replicate';
import { removeBackground } from '../../services/llm';
import ImageToolsPanel from './ImageToolsPanel';

const CanvasEditor: React.FC = () => {
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
  } = useCanvas();

  // Responsive canvas scaling handling is now done via CSS in BannerCanvas


  // Handle profile face enhance
  const handleProfileFaceEnhance = async () => {
    if (!profilePic) return;

    console.log('[Profile] Starting face enhance...');
    const service = await getReplicateService();

    try {
      const enhancedImage = await service.faceEnhance(profilePic);
      setProfilePic(enhancedImage);
      console.log('[Profile] ✅ Face enhance complete');
    } catch (error) {
      console.error('[Profile] Face enhance failed:', error);
      throw error;
    }
  };

  // Handle profile remove bg
  const handleProfileRemoveBg = async () => {
    if (!profilePic) return;
    console.log('[Profile] Starting bg removal...');
    try {
      const cleanImage = await removeBackground(profilePic);
      setProfilePic(cleanImage);
      console.log('[Profile] ✅ BG Removal complete');
    } catch (error) {
      console.error('[Profile] BG Removal failed:', error);
      alert('Failed to remove background. Please try again.');
    }
  };

  return (
    <div className='flex-1 p-4 md:p-6 lg:p-8 flex flex-col items-center justify-start overflow-hidden w-full'>
      <div className='w-full max-w-[1400px] flex flex-col items-center'>
        {/* Canvas Header */}
        <div className='w-full mb-6 flex flex-wrap justify-between items-center gap-4'>
          <div className='flex items-center gap-3'>
            <span className='bg-white/10 p-2 rounded-lg text-zinc-400'>
              <span className='material-icons text-base'>aspect_ratio</span>
            </span>
            <div>
              <h2 className='text-white text-sm font-black uppercase tracking-wider drop-shadow-sm'>
                Canvas View
              </h2>
              <p className='text-[10px] md:text-xs text-zinc-500 font-bold uppercase tracking-widest'>
                {BANNER_WIDTH} x {BANNER_HEIGHT} PX
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowSafeZones(!showSafeZones)}
            className={`min-h-[44px] px-4 rounded-full flex items-center gap-2 font-black uppercase tracking-wider text-[10px] transition-all ${showSafeZones ? 'bg-blue-600/20 border border-blue-500 text-blue-400' : BTN_NEU_SOLID}`}
          >
            <span className='material-icons text-sm'>
              {showSafeZones ? 'visibility' : 'visibility_off'}
            </span>
            Safe Zones: {showSafeZones ? 'ON' : 'OFF'}
          </button>
        </div>

        {/* The Canvas - Responsive Container */}
        <div className='w-full flex justify-start md:justify-center'>
          <BannerCanvas
            ref={canvasRef}
            backgroundImage={bgImage}
            elements={elements}
            showSafeZones={showSafeZones}
            profilePic={profilePic}
            profileTransform={profileTransform}
            setProfileTransform={setProfileTransform}
            onElementsChange={setElements}
            selectedElementId={selectedElementId}
            onSelectElement={setSelectedElementId}
            onProfileFaceEnhance={handleProfileFaceEnhance}
            onProfileRemoveBg={handleProfileRemoveBg}
          />
        </div>

        {/* Tools Grid - Stacks on mobile */}
        <div className='mt-8 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 pb-20'>
          <AssetsPanel />
          <LayersPanel />
          <div className='space-y-6'>
            <ImageToolsPanel />
            <ExportPanel />
            <KeyboardShortcutsPanel />
          </div>
        </div>
      </div >
    </div >
  );
};

export default CanvasEditor;
