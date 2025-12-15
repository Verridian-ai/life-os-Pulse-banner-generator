// Image Tools Panel - UI for all Replicate image processing operations

import React, { useState } from 'react';
import { getReplicateService } from '../../services/replicate';
import type { ReplicateQuality } from '../../types/replicate';
import { useAI } from '../../context/AIContext';
import { useCanvas } from '../../context/CanvasContext';

interface ImageToolsPanelProps {
  bgImage: string | null;
  onImageUpdate: (newImage: string) => void;
}

export const ImageToolsPanel: React.FC<ImageToolsPanelProps> = ({ bgImage, onImageUpdate }) => {
  const { setReplicateOperation } = useAI();
  const { addToHistory, canUndo, canRedo, undo, redo } = useCanvas();
  const [quality, setQuality] = useState<ReplicateQuality>('balanced');
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentOperation, setCurrentOperation] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Before/After comparison state
  const [showComparison, setShowComparison] = useState(false);
  const [beforeImage, setBeforeImage] = useState<string | null>(null);
  const [afterImage, setAfterImage] = useState<string | null>(null);
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);

  // Handle progress updates
  const handleProgress = (progressValue: number) => {
    setProgress(progressValue);
    if (setReplicateOperation) {
      setReplicateOperation((prev) => (prev ? { ...prev, progress: progressValue } : prev));
    }
  };

  // Generic operation handler
  const handleOperation = async (operation: string, operationFn: () => Promise<string>) => {
    if (!bgImage) {
      setError('No image selected. Please generate or upload a background image first.');
      return;
    }

    // Save original image for comparison
    setBeforeImage(bgImage);

    setIsProcessing(true);
    setCurrentOperation(operation);
    setProgress(0);
    setError(null);

    // Update Replicate operation state
    if (setReplicateOperation) {
      setReplicateOperation({
        id: Date.now().toString(),
        type: operation as 'upscale' | 'removebg' | 'restore' | 'faceenhance',
        status: 'starting',
        progress: 0,
        inputImage: bgImage,
      });
    }

    try {
      const result = await operationFn();
      onImageUpdate(result);

      // Add to history
      addToHistory(result);
      console.log('[History] Added to history after', operation);

      // Update operation to succeeded
      if (setReplicateOperation) {
        setReplicateOperation((prev) =>
          prev ? { ...prev, status: 'succeeded', progress: 100, outputImage: result } : null,
        );
      }

      setProgress(100);
      setTimeout(() => {
        setIsProcessing(false);
        setCurrentOperation(null);
        if (setReplicateOperation) setReplicateOperation(null);

        // Show before/after comparison
        setAfterImage(result);
        setSliderPosition(50);
        setShowComparison(true);

        // Auto-dismiss after 8 seconds
        setTimeout(() => {
          setShowComparison(false);
        }, 8000);
      }, 1000);
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Operation failed';
      setError(errorMsg);

      // Update operation to failed
      if (setReplicateOperation) {
        setReplicateOperation((prev) =>
          prev ? { ...prev, status: 'failed', error: errorMsg } : null,
        );
      }

      setIsProcessing(false);
      setCurrentOperation(null);
    }
  };

  // Upscale handler
  const handleUpscale = async () => {
    await handleOperation('upscale', async () => {
      const service = await getReplicateService(handleProgress);
      return await service.upscale(bgImage!, quality);
    });
  };

  // Remove background handler
  const handleRemoveBg = async () => {
    await handleOperation('removebg', async () => {
      const service = await getReplicateService(handleProgress);
      return await service.removeBg(bgImage!);
    });
  };

  // Restore handler
  const handleRestore = async () => {
    await handleOperation('restore', async () => {
      const service = await getReplicateService(handleProgress);
      return await service.restore(bgImage!);
    });
  };

  // Face enhance handler
  const handleFaceEnhance = async () => {
    await handleOperation('faceenhance', async () => {
      const service = await getReplicateService(handleProgress);
      return await service.faceEnhance(bgImage!);
    });
  };

  // Comparison slider drag handlers
  const handleMouseDown = () => {
    setIsDragging(true);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = (x / rect.width) * 100;
    setSliderPosition(Math.max(0, Math.min(100, percentage)));
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Close comparison
  const handleCloseComparison = () => {
    setShowComparison(false);
  };

  return (
    <div className='bg-black/40 p-5 rounded-3xl border border-white/5 mt-4'>
      <h4 className='text-xs font-bold text-zinc-400 uppercase mb-4 flex items-center gap-2'>
        <span className='material-icons text-sm'>auto_fix_high</span>
        Advanced Tools
      </h4>

      {/* Image Preview */}
      <div className='mb-4'>
        <label className='block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2'>
          <span className='material-icons text-sm align-middle mr-1'>image</span>
          Current Image
        </label>
        {bgImage ? (
          <div className='relative aspect-[1584/396] bg-zinc-900/50 rounded-xl overflow-hidden border border-white/10'>
            <img src={bgImage} alt='Current background' className='w-full h-full object-cover' />
            {isProcessing && (
              <div className='absolute inset-0 bg-black/90 backdrop-blur-sm flex flex-col items-center justify-center'>
                <div className='w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-3' />
                <p className='text-sm font-bold text-white capitalize'>{currentOperation}...</p>
                <p className='text-xs text-zinc-400 mt-2'>
                  {progress === 10 && 'Starting operation...'}
                  {progress === 50 && 'Processing image...'}
                  {progress === 100 && 'Almost done...'}
                  {progress === 0 && 'Initializing...'}
                </p>
                <div className='w-48 bg-zinc-800 rounded-full h-2 overflow-hidden mt-3'>
                  <div
                    className={`h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300 w-[${progress || 0}%]`}
                  />
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className='aspect-[1584/396] bg-zinc-900/50 rounded-xl border-2 border-dashed border-white/10 flex flex-col items-center justify-center'>
            <span className='material-icons text-4xl text-zinc-700'>image_not_supported</span>
            <p className='text-xs text-zinc-600 mt-2'>No background image loaded</p>
            <p className='text-[10px] text-zinc-700 mt-1'>Generate or upload an image first</p>
          </div>
        )}
      </div>

      {/* Quality Selector */}
      <div className='bg-zinc-900/50 rounded-xl p-3 mb-4'>
        <label htmlFor='quality-select' className='text-[10px] text-zinc-500 mb-2 block font-bold'>
          QUALITY
        </label>
        <select
          id='quality-select'
          className='w-full bg-zinc-800 border border-white/10 rounded-lg p-2 text-sm text-white focus:border-blue-500 focus:outline-none transition'
          value={quality}
          onChange={(e) => setQuality(e.target.value as ReplicateQuality)}
          disabled={isProcessing}
        >
          <option value='fast'>Fast - Real-ESRGAN (~2s, good quality)</option>
          <option value='balanced'>Balanced - Recraft Crisp (recommended)</option>
          <option value='best'>Best - Magic Refiner (highest quality)</option>
        </select>
        <p className='text-[9px] text-zinc-600 mt-1'>
          {quality === 'fast' && 'Fastest processing, great for previews'}
          {quality === 'balanced' && 'Best balance of speed and quality'}
          {quality === 'best' && 'Slowest but best results for final output'}
        </p>
      </div>

      {/* Undo/Redo Buttons */}
      <div className='flex gap-2 mb-4'>
        <button
          onClick={undo}
          disabled={!canUndo || isProcessing}
          className='flex-1 bg-zinc-800 hover:bg-zinc-700 disabled:bg-zinc-900 disabled:text-zinc-700 text-white font-bold py-2 px-3 rounded-lg transition flex items-center justify-center gap-2 text-xs'
          title='Undo last operation'
        >
          <span className='material-icons text-sm'>undo</span>
          Undo
        </button>
        <button
          onClick={redo}
          disabled={!canRedo || isProcessing}
          className='flex-1 bg-zinc-800 hover:bg-zinc-700 disabled:bg-zinc-900 disabled:text-zinc-700 text-white font-bold py-2 px-3 rounded-lg transition flex items-center justify-center gap-2 text-xs'
          title='Redo last undone operation'
        >
          <span className='material-icons text-sm'>redo</span>
          Redo
        </button>
      </div>

      {/* Tool Grid */}
      <div className='grid grid-cols-2 gap-2 mb-4'>
        <button
          onClick={handleUpscale}
          disabled={!bgImage || isProcessing}
          className='bg-gradient-to-br from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 disabled:from-zinc-800 disabled:to-zinc-800 disabled:text-zinc-600 text-white font-bold py-3 px-4 rounded-xl transition flex items-center justify-center gap-2 text-sm'
        >
          <span className='material-icons text-base'>hd</span>
          Upscale
        </button>

        <button
          onClick={handleRemoveBg}
          disabled={!bgImage || isProcessing}
          className='bg-gradient-to-br from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 disabled:from-zinc-800 disabled:to-zinc-800 disabled:text-zinc-600 text-white font-bold py-3 px-4 rounded-xl transition flex items-center justify-center gap-2 text-sm'
        >
          <span className='material-icons text-base'>layers_clear</span>
          Remove BG
        </button>

        <button
          onClick={handleRestore}
          disabled={!bgImage || isProcessing}
          className='bg-gradient-to-br from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 disabled:from-zinc-800 disabled:to-zinc-800 disabled:text-zinc-600 text-white font-bold py-3 px-4 rounded-xl transition flex items-center justify-center gap-2 text-sm'
        >
          <span className='material-icons text-base'>auto_awesome</span>
          Restore
        </button>

        <button
          onClick={handleFaceEnhance}
          disabled={!bgImage || isProcessing}
          className='bg-gradient-to-br from-pink-600 to-pink-700 hover:from-pink-500 hover:to-pink-600 disabled:from-zinc-800 disabled:to-zinc-800 disabled:text-zinc-600 text-white font-bold py-3 px-4 rounded-xl transition flex items-center justify-center gap-2 text-sm'
        >
          <span className='material-icons text-base'>face</span>
          Face Enhance
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div className='bg-red-900/20 border border-red-500/50 rounded-lg p-3 mb-3'>
          <div className='flex items-start gap-2'>
            <span className='material-icons text-sm text-red-400'>error</span>
            <div>
              <p className='text-xs font-bold text-red-400'>Operation Failed</p>
              <p className='text-[10px] text-red-300 mt-1'>{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Before/After Comparison Overlay */}
      {showComparison && beforeImage && afterImage && (
        <div className='fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4'>
          <div className='bg-zinc-900 border border-white/10 rounded-2xl p-6 max-w-5xl w-full mx-4'>
            {/* Header */}
            <div className='flex items-center justify-between mb-4'>
              <div>
                <h3 className='text-lg font-bold text-white flex items-center gap-2'>
                  <span className='material-icons'>compare</span>
                  Before & After Comparison
                </h3>
                <p className='text-xs text-zinc-500 mt-1'>
                  Drag the slider to compare • Auto-closes in 8 seconds
                </p>
              </div>
              <button
                onClick={handleCloseComparison}
                className='text-zinc-500 hover:text-white transition'
              >
                <span className='material-icons'>close</span>
              </button>
            </div>

            {/* Comparison Container */}
            <div
              className='relative aspect-[1584/396] bg-zinc-950 rounded-xl overflow-hidden cursor-ew-resize select-none'
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            >
              {/* After Image (Full) */}
              <img
                src={afterImage}
                alt='After'
                className='absolute inset-0 w-full h-full object-cover'
                draggable={false}
              />

              {/* Before Image (Clipped) */}
              <div className={`absolute inset-0 overflow-hidden w-[${sliderPosition || 50}%]`}>
                <img
                  src={beforeImage}
                  alt='Before'
                  className={`absolute inset-0 w-full h-full object-cover w-[${(100 / (sliderPosition || 1)) * 100}%]`}
                  draggable={false}
                />
              </div>

              {/* Slider Line */}
              <div
                className={`absolute top-0 bottom-0 w-1 bg-white shadow-lg left-[${sliderPosition || 50}%]`}
              >
                {/* Slider Handle */}
                <div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-white rounded-full shadow-xl flex items-center justify-center cursor-ew-resize'>
                  <span className='material-icons text-zinc-900 text-lg'>drag_indicator</span>
                </div>
              </div>

              {/* Labels */}
              <div className='absolute top-4 left-4 bg-black/70 backdrop-blur-sm px-3 py-1.5 rounded-lg'>
                <p className='text-xs font-bold text-white uppercase tracking-wider'>Before</p>
              </div>
              <div className='absolute top-4 right-4 bg-black/70 backdrop-blur-sm px-3 py-1.5 rounded-lg'>
                <p className='text-xs font-bold text-white uppercase tracking-wider'>After</p>
              </div>
            </div>

            {/* Footer */}
            <div className='mt-4 flex items-center justify-between'>
              <p className='text-xs text-zinc-600'>The new image has been applied to your canvas</p>
              <button
                onClick={handleCloseComparison}
                className='bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-lg text-sm font-bold transition flex items-center gap-2'
              >
                <span className='material-icons text-base'>check</span>
                Got It
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
