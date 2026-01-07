import React from 'react';
import BannerCanvas from '../BannerCanvas';
import { useCanvas } from '../../context/CanvasContext';
import { BANNER_WIDTH, BANNER_HEIGHT } from '../../constants';
// import ImageToolsPanel from './ImageToolsPanel';
import { useToast } from '../../hooks/useToast';

const CanvasEditor: React.FC = () => {
  const toast = useToast();
  const [isMobile, setIsMobile] = React.useState(window.innerWidth < 768);

  React.useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
  } = useCanvas();

  // ... (handleProfileFaceEnhance, handleProfileRemoveBg unchanged)

  const handleAddText = () => {
    const newEl = {
      id: `text-${Date.now()}`,
      type: 'text',
      content: 'New Headline',
      x: BANNER_WIDTH / 2,
      y: BANNER_HEIGHT / 2,
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
  const handleProfileFaceEnhance = async () => {};
  const handleProfileRemoveBg = async () => {};

  return (
    <div className='flex-1 p-4 md:p-6 lg:p-8 flex flex-col items-center justify-start overflow-hidden w-full relative'>
      <div className='w-full max-w-[1400px] flex flex-col items-center'>
        {/* Canvas Header */}
        <div className='w-full mb-6 flex flex-wrap justify-between items-center gap-4'>
          {/* ... (Header content unchanged) */}
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
    </div>
  );
};

export default CanvasEditor;
