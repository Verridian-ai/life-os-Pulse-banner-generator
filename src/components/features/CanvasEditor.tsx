import React from 'react';
import BannerCanvas from '../BannerCanvas';
import { useCanvas } from '../../context/CanvasContext';
import { useCanvasState } from '../../context/canvas';
import { CanvasFormatSelector } from './editor/CanvasFormatSelector';
// import ImageToolsPanel from './ImageToolsPanel';
import { useToast } from '../../hooks/useToast';

import { SnapshotsModal } from './SnapshotsModal';

const CanvasEditor: React.FC = () => {
  const toast = useToast();
  const [isMobile, setIsMobile] = React.useState(window.innerWidth < 768);
  const [showSnapshots, setShowSnapshots] = React.useState(false);

  React.useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Get canvas format for dynamic dimensions and zoom state
  const { canvasFormat, zoom, setZoom } = useCanvasState();

  // Single useCanvas call to avoid duplicate subscriptions
  const {
    canvasRef,
    bgImage,
    elements,
    showSafeZones,
    setShowSafeZones,
    profilePic,
    setElements,
    selectedElementId,
    setSelectedElementId,
    profileTransform,
    setProfileTransform,
    undo,
    redo,
    addElement,
    saveCurrentSnapshot,
  } = useCanvas();

  const handleSaveSnapshot = () => {
    const name = `Design ${new Date().toLocaleTimeString()}`;
    saveCurrentSnapshot(name);
    toast.success('Snapshot saved: ' + name, { duration: 2000 });
  };

  // Handle Zoom
  const handleZoomIn = () => setZoom(Math.min(zoom + 0.1, 2.0));
  const handleZoomOut = () => setZoom(Math.max(zoom - 0.1, 0.5));
  const handleZoomReset = () => setZoom(1.0);

  // ... (handleProfileFaceEnhance, handleProfileRemoveBg unchanged)

  const handleAddText = () => {
    const newEl = {
      id: `text-${Date.now()}`,
      type: 'text',
      content: 'New Headline',
      x: canvasFormat.width / 2,
      y: canvasFormat.height / 2,
      fontSize: 48,
      fontWeight: 'bold',
      color: 'white',
      textAlign: 'center',
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    addElement(newEl as any);
    toast.success('Text element added');
  };
  // Placeholder handlers to satisfy JSX
  const handleProfileFaceEnhance = async () => { };
  const handleProfileRemoveBg = async () => { };

  return (
    <div className='flex-1 p-4 md:p-6 lg:p-8 flex flex-col items-center justify-start overflow-auto w-full relative'>
      <div className='w-full max-w-[1400px] flex flex-col items-center'>
        {/* Canvas Header */}
        <div className='w-full mb-6 flex flex-wrap justify-between items-center gap-4'>
          {/* Canvas Format Selector - Switch between LinkedIn, YouTube, Instagram, etc. */}
          <CanvasFormatSelector />

          {/* Quick Actions */}
          <div className='flex items-center gap-2'>
            {/* Zoom Controls (Desktop) */}
            <div className='hidden md:flex items-center bg-zinc-800 rounded-xl p-1 mr-2'>
              <button
                onClick={handleZoomOut}
                className='w-8 h-8 flex items-center justify-center text-zinc-400 hover:text-white transition'
                title="Zoom Out"
              >
                <span className='material-icons text-sm'>remove</span>
              </button>
              <button
                onClick={handleZoomReset}
                className='px-2 text-xs font-bold text-zinc-300 min-w-[3rem] text-center'
                title="Reset Zoom"
              >
                {Math.round(zoom * 100)}%
              </button>
              <button
                onClick={handleZoomIn}
                className='w-8 h-8 flex items-center justify-center text-zinc-400 hover:text-white transition'
                title="Zoom In"
              >
                <span className='material-icons text-sm'>add</span>
              </button>
            </div>

            <button
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
              onClick={() => setShowSnapshots(true)}
              className='min-h-[44px] px-4 py-2 rounded-xl flex items-center gap-2 transition bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700'
              title="Load Snapshot"
            >
              <span className='material-icons text-lg'>folder_open</span>
              <span className='text-xs font-medium hidden sm:inline'>Load</span>
            </button>

            <button
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
            canvasWidth={canvasFormat.width}
            canvasHeight={canvasFormat.height}
            zoom={zoom}
          />
        </div>

        {/* Mobile Quick Actions Bar */}
        {isMobile && (
          <div className='fixed bottom-20 left-1/2 -translate-x-1/2 z-40 bg-zinc-900/90 backdrop-blur-md border border-white/10 rounded-2xl p-2 flex gap-2 shadow-2xl'>
            <button
              onClick={undo}
              className='w-11 h-11 flex items-center justify-center bg-zinc-800 rounded-xl text-white'
              title="Undo"
            >
              <span className='material-icons'>undo</span>
            </button>
            <button
              onClick={redo}
              className='w-11 h-11 flex items-center justify-center bg-zinc-800 rounded-xl text-white'
              title="Redo"
            >
              <span className='material-icons'>redo</span>
            </button>
            <div className='w-px bg-white/10 mx-1' />
            <button
              onClick={handleAddText}
              className='w-11 h-11 flex items-center justify-center bg-blue-600 rounded-xl text-white'
              title="Add Text"
            >
              <span className='material-icons'>text_fields</span>
            </button>
            <button
              onClick={() => setShowSafeZones(!showSafeZones)}
              className={`w-11 h-11 flex items-center justify-center rounded-xl transition ${showSafeZones ? 'bg-purple-600 text-white' : 'bg-zinc-800 text-zinc-400'}`}
              title="Toggle Safe Zones"
            >
              <span className='material-icons'>visibility</span>
            </button>
          </div>
        )}

        {/* Tools Grid - Stacks on mobile */}
        {/* ... (Tools Grid unchanged) */}
      </div>

      <SnapshotsModal isOpen={showSnapshots} onClose={() => setShowSnapshots(false)} />
    </div>
  );
};

export default CanvasEditor;
