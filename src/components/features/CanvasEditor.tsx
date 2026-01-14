import React from 'react';
import BannerCanvas from '../BannerCanvas';
import { useCanvas } from '../../context/CanvasContext';
import { useCanvasState } from '../../context/canvas';
import { CanvasFormatSelector } from './editor/CanvasFormatSelector';
import LayersPanel from './editor/LayersPanel';
import AssetsPanel from './editor/AssetsPanel';
import ExportPanel from './editor/ExportPanel';
import { SafeZoneWarningPanel } from './editor/SafeZoneWarningPanel';
// import ImageToolsPanel from './ImageToolsPanel';
import { useToast } from '../../hooks/useToast';
import { useSafeZoneWarnings } from '../../hooks/useSafeZoneWarnings';
import { validateAndFixSafeZones } from '../../utils/layoutScalingUtils';
import { useIsMobile } from '../../hooks/useBreakpoint';

import { SnapshotsModal } from './SnapshotsModal';

const CanvasEditor: React.FC = () => {
  const toast = useToast();
  const isMobile = useIsMobile();
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
    setElements,
    selectedElementId,
    setSelectedElementId,
    profileTransform,
    setProfileTransform,
    undo,
    redo,
    addElement,
    saveCurrentSnapshot,
    updateElement,
  } = useCanvas();

  // Safe zone warnings - reactive detection of elements in danger zones
  const { warnings, hasWarnings, dangerCount, warningCount, snapToSafe } = useSafeZoneWarnings(
    elements,
    canvasFormatId,
  );

  // Handler for auto-snap to safe position
  const handleSnapToSafe = React.useCallback(
    (element: (typeof elements)[number]) => {
      snapToSafe(element, updateElement);
      toast.success(
        `"${element.type === 'text' ? element.content.slice(0, 20) : 'Element'}" moved to safe zone`,
      );
    },
    [snapToSafe, updateElement, toast],
  );

  // Handler for re-optimizing layout (manual trigger)
  const handleReoptimizeLayout = React.useCallback(() => {
    if (elements.length === 0) return;

    // Same format = just safe zone validation, no scaling
    const result = validateAndFixSafeZones(elements, canvasFormat);

    if (result.repositionedCount > 0) {
      setElements(result.optimizedElements);
      toast.success(
        `${result.repositionedCount} element${result.repositionedCount > 1 ? 's' : ''} moved to safe zones`,
      );
    } else {
      toast.info('All elements are already in safe zones');
    }
  }, [elements, canvasFormat, setElements, toast]);

  const handleSaveSnapshot = () => {
    const name = `Design ${new Date().toLocaleTimeString()}`;
    saveCurrentSnapshot(name);
    toast.success('Snapshot saved: ' + name, { duration: 2000 });
  };

  // Handle Zoom
  const handleZoomIn = () => setZoom(Math.min(zoom + 0.1, 2.0));
  const handleZoomOut = () => setZoom(Math.max(zoom - 0.1, 0.5));
  const handleZoomReset = () => setZoom(1.0);

  // Placeholder handlers to satisfy JSX - functionality moved to panels/context but kept for compatibility
  const handleProfileFaceEnhance = async () => {};
  const handleProfileRemoveBg = async () => {};

  const handleAddText = () => {
    const newEl = {
      id: `text-${Date.now()}`,
      type: 'text',
      content: 'New Headline',
      x: canvasFormat.width / 2,
      y: canvasFormat.height / 2,
      fontSize: 48,
      fontWeight: 'bold',
      fontFamily: 'Inter',
      color: 'white',
      textAlign: 'center',
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    addElement(newEl as any);
    toast.success('Text element added');
  };

  return (
    <div className='flex-1 p-4 md:p-6 lg:p-8 flex flex-col items-center justify-start overflow-auto w-full relative'>
      <div className='w-full max-w-[1400px] flex flex-col items-center'>
        {/* Canvas Header */}
        <div className='w-full mb-6 flex flex-wrap justify-between items-center gap-4'>
          {/* Canvas Format Selector - Switch between LinkedIn, YouTube, Instagram, etc. */}
          <CanvasFormatSelector
            elements={elements}
            setElements={setElements}
            onOptimize={(result) => {
              if (result.repositionedCount > 0) {
                toast.success(
                  `${result.repositionedCount} element${result.repositionedCount > 1 ? 's' : ''} auto-repositioned to safe zones`,
                );
              }
            }}
          />

          {/* Quick Actions */}
          <div className='flex items-center gap-2'>
            {/* Zoom Controls (Desktop) */}
            <div className='hidden md:flex items-center bg-zinc-800 rounded-xl p-1 mr-2'>
              <button
                type='button'
                onClick={handleZoomOut}
                className='w-8 h-8 flex items-center justify-center text-zinc-400 hover:text-white transition'
                title='Zoom Out'
              >
                <span className='material-icons text-sm'>remove</span>
              </button>
              <button
                type='button'
                onClick={handleZoomReset}
                className='px-2 text-xs font-bold text-zinc-300 min-w-[3rem] text-center'
                title='Reset Zoom'
              >
                {Math.round(zoom * 100)}%
              </button>
              <button
                type='button'
                onClick={handleZoomIn}
                className='w-8 h-8 flex items-center justify-center text-zinc-400 hover:text-white transition'
                title='Zoom In'
              >
                <span className='material-icons text-sm'>add</span>
              </button>
            </div>

            <button
              type='button'
              onClick={() => setShowSafeZones(!showSafeZones)}
              className={`min-h-[44px] px-4 py-2 rounded-xl flex items-center gap-2 transition relative ${
                showSafeZones
                  ? 'bg-purple-600 text-white'
                  : 'bg-zinc-800 text-zinc-400 hover:text-white'
              }`}
              title='Toggle Safe Zones'
            >
              <span className='material-icons text-lg'>visibility</span>
              <span className='text-xs font-medium hidden sm:inline'>Safe Zones</span>
              {/* Warning Badge - Shows when elements are in danger zones */}
              {hasWarnings && !showSafeZones && (
                <span
                  className={`absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center text-[10px] font-bold rounded-full ${
                    dangerCount > 0 ? 'bg-red-500 text-white' : 'bg-yellow-500 text-black'
                  }`}
                >
                  {dangerCount + warningCount}
                </span>
              )}
            </button>

            <button
              type='button'
              onClick={handleReoptimizeLayout}
              disabled={elements.length === 0}
              className={`min-h-[44px] px-4 py-2 rounded-xl flex items-center gap-2 transition ${
                elements.length === 0
                  ? 'bg-zinc-800/50 text-zinc-600 cursor-not-allowed'
                  : 'bg-emerald-700/50 text-emerald-200 hover:bg-emerald-600/50 border border-emerald-500/30'
              }`}
              title='Re-optimize Layout for Safe Zones'
            >
              <span className='material-icons text-lg'>auto_fix_high</span>
              <span className='text-xs font-medium hidden sm:inline'>Optimize</span>
            </button>

            <button
              type='button'
              onClick={() => setShowSnapshots(true)}
              className='min-h-[44px] px-4 py-2 rounded-xl flex items-center gap-2 transition bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700'
              title='Load Snapshot'
            >
              <span className='material-icons text-lg'>folder_open</span>
              <span className='text-xs font-medium hidden sm:inline'>Load</span>
            </button>

            <button
              type='button'
              onClick={handleSaveSnapshot}
              className='min-h-[44px] px-4 py-2 rounded-xl flex items-center gap-2 transition bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700'
              title='Save Snapshot'
            >
              <span className='material-icons text-lg'>save</span>
              <span className='text-xs font-medium hidden sm:inline'>Save</span>
            </button>
          </div>
        </div>

        <div className='w-full flex justify-start md:justify-center relative'>
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
            canvasFormatId={canvasFormatId}
            zoom={zoom}
            onZoomChange={setZoom}
            showProfileOverlay={canvasFormatId === 'linkedin_banner'}
          />

          {/* Floating Warning Indicator - Compact badge near canvas */}
          {showSafeZones && hasWarnings && (
            <div className='absolute bottom-4 right-4 z-20 animate-pulse'>
              <div
                className={`flex items-center gap-2 px-3 py-2 rounded-xl shadow-lg border ${
                  dangerCount > 0
                    ? 'bg-red-900/90 border-red-500/50 text-red-200'
                    : 'bg-yellow-900/90 border-yellow-500/50 text-yellow-200'
                }`}
              >
                <span className='material-icons text-sm'>
                  {dangerCount > 0 ? 'error' : 'warning'}
                </span>
                <span className='text-xs font-medium'>
                  {dangerCount > 0
                    ? `${dangerCount} element${dangerCount > 1 ? 's' : ''} in danger zone`
                    : `${warningCount} element${warningCount > 1 ? 's' : ''} near edge`}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Safe Zone Warnings - Only show when safe zones are visible and there are warnings */}
        {showSafeZones && hasWarnings && (
          <div className='w-full mt-4'>
            <SafeZoneWarningPanel
              warnings={warnings}
              elements={elements}
              onSnapToSafe={handleSnapToSafe}
              onSelectElement={setSelectedElementId}
              selectedElementId={selectedElementId}
            />
          </div>
        )}

        {/* Tools Grid - Stacks on mobile */}
        <div className='w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8 pb-20'>
          <AssetsPanel />
          <LayersPanel />
          <ExportPanel />
        </div>

        {/* Mobile Quick Actions Bar */}
        {isMobile && (
          <div className='fixed bottom-20 left-1/2 -translate-x-1/2 z-40 bg-zinc-900/90 backdrop-blur-md border border-white/10 rounded-2xl p-2 flex gap-2 shadow-2xl'>
            <button
              type='button'
              onClick={undo}
              className='w-11 h-11 flex items-center justify-center bg-zinc-800 rounded-xl text-white'
              title='Undo (Ctrl+Z)'
            >
              <span className='material-icons'>undo</span>
            </button>
            <button
              type='button'
              onClick={redo}
              className='w-11 h-11 flex items-center justify-center bg-zinc-800 rounded-xl text-white'
              title='Redo (Ctrl+Shift+Z)'
            >
              <span className='material-icons'>redo</span>
            </button>
            <div className='w-px bg-white/10 mx-1' />
            <button
              type='button'
              onClick={handleAddText}
              className='w-11 h-11 flex items-center justify-center bg-blue-600 rounded-xl text-white'
              title='Add Text'
            >
              <span className='material-icons'>text_fields</span>
            </button>
            <button
              type='button'
              onClick={() => setShowSafeZones(!showSafeZones)}
              className={`w-11 h-11 flex items-center justify-center rounded-xl transition relative ${showSafeZones ? 'bg-purple-600 text-white' : 'bg-zinc-800 text-zinc-400'}`}
              title='Toggle Safe Zones (Ctrl+;)'
            >
              <span className='material-icons'>visibility</span>
              {/* Mobile Warning Badge */}
              {hasWarnings && !showSafeZones && (
                <span
                  className={`absolute -top-1 -right-1 w-4 h-4 flex items-center justify-center text-[9px] font-bold rounded-full ${
                    dangerCount > 0 ? 'bg-red-500 text-white' : 'bg-yellow-500 text-black'
                  }`}
                >
                  {dangerCount + warningCount}
                </span>
              )}
            </button>
          </div>
        )}
      </div>

      <SnapshotsModal isOpen={showSnapshots} onClose={() => setShowSnapshots(false)} />
    </div>
  );
};

export default CanvasEditor;
