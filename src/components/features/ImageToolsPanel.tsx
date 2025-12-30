// Image Tools Panel - Intelligent Workflow System
// Integrates Replicate models: Face Enhance, Remove BG, Inpainting, Upscale, Magic Edit, Generate Layer

import React, { useState, useEffect, useRef } from 'react';
import { useCanvas } from '../../context/CanvasContext';
import { useAI } from '../../context/AIContext';
import { getReplicateService } from '../../services/replicate';
import { BTN_NEU_SOLID } from '../../styles';
import { EnhanceButton } from '../ui/EnhanceButton';

interface ImageToolsPanelProps {
  // Props are now largely handled via Context, but keeping for compatibility if needed
}


// Helper to ensure image is a Data URI (Replicate needs URI, and relative paths fail)
const urlToDataUri = async (url: string): Promise<string> => {
  if (url.startsWith('data:')) return url;
  if (url.startsWith('http') && !url.includes(window.location.origin)) {
    // External URL: Return as is (Replicate can fetch public URLs), unless it fails CORS then we try to proxy/fetch.
    // Ideally we try to fetch it to convert to base64 to avoid any access issues.
    try {
      const response = await fetch(url, { mode: 'cors' });
      if (!response.ok) return url;
      const blob = await response.blob();
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (e) {
      return url; // Usage as public URL
    }
  }

  // Relative or same-origin URL: Fetch and convert
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (e) {
    console.error("Failed to convert image to Data URI:", e);
    return url;
  }
};

export const ImageToolsPanel: React.FC<ImageToolsPanelProps> = () => {
  const {
    bgImage,
    setBgImage,
    selectedElementId,
    elements,
    updateElement,
    profilePic,
    setProfilePic,
    addToHistory,
  } = useCanvas();
  const { setReplicateOperation } = useAI();

  const [activeContext, setActiveContext] = useState<'banner' | 'profile' | 'layer' | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingLabel, setProcessingLabel] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Magic Edit State
  const [magicPrompt, setMagicPrompt] = useState('');
  const [showMagicInput, setShowMagicInput] = useState(false);

  // Inpainting State
  const [showInpaintModal, setShowInpaintModal] = useState(false);
  const [inpaintPrompt, setInpaintPrompt] = useState('');
  const [maskBrushSize, setMaskBrushSize] = useState(20);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  // Determine Active Context
  useEffect(() => {
    if (selectedElementId) {
      const el = elements.find((e) => e.id === selectedElementId);
      if (el?.type === 'image') {
        setActiveContext('layer');
        return;
      }
    }
    // If no layer selected, check if we entered "Profile Mode" (managed externally usually, but we can detect if profile exists and no other selection)
    // For now, if no element selected, default to Banner Background
    setActiveContext('banner');
  }, [selectedElementId, elements]);

  // Handle Replicate Operations
  const runOperation = async (
    name: string,
    operationFn: (service: any) => Promise<string>,
    target: 'banner' | 'profile' | 'layer' = 'banner'
  ) => {
    setIsProcessing(true);
    setProcessingLabel(name);
    setError(null);

    try {
      const service = await getReplicateService();
      const resultUrl = await operationFn(service);

      // Apply Result
      if (target === 'banner') {
        setBgImage(resultUrl);
        addToHistory(resultUrl); // Simplified history for now
      } else if (target === 'profile' && setProfilePic) {
        setProfilePic(resultUrl);
      } else if (target === 'layer' && selectedElementId) {
        updateElement(selectedElementId, { content: resultUrl });
      }

      console.log(`[Replicate] ${name} Success:`, resultUrl);
    } catch (err: any) {
      console.error(`[Replicate] ${name} Failed:`, err);
      setError(err.message || 'Operation failed');
    } finally {
      setIsProcessing(false);
      setProcessingLabel('');
    }
  };

  // --- Tool Handlers ---

  const handleUpscale = async () => {
    const target = activeContext === 'layer' ? 'layer' : 'banner';
    const image = activeContext === 'layer'
      ? elements.find(e => e.id === selectedElementId)?.content
      : bgImage;

    if (!image) return;

    // Convert to Data URI so Replicate accepts it (handles relative paths)
    const validImage = await urlToDataUri(image);

    runOperation('Enhance Quality', (s) => s.upscale(validImage, 'balanced'), target as any);
  };

  const handleMagicEdit = async () => {
    if (!magicPrompt) return;
    const target = activeContext === 'layer' ? 'layer' : 'banner';
    const image = activeContext === 'layer'
      ? elements.find(e => e.id === selectedElementId)?.content
      : bgImage;

    if (!image) return;

    // Convert to Data URI
    const validImage = await urlToDataUri(image);

    runOperation('Magic Edit', (s) => s.magicEdit(validImage, magicPrompt), target as any);
    setShowMagicInput(false);
    setMagicPrompt('');
  };

  const handleRemoveBg = async () => {
    // Context: Layer or Profile (if we supported profile context switching here)
    if (activeContext !== 'layer') return;
    const image = elements.find(e => e.id === selectedElementId)?.content;
    if (!image) return;

    // Convert to Data URI
    const validImage = await urlToDataUri(image);

    runOperation('Remove Background', (s) => s.removeBg(validImage), 'layer');
  };

  const handleFaceEnhance = async () => {
    if (activeContext !== 'layer') return;
    const image = elements.find(e => e.id === selectedElementId)?.content;
    if (!image) return;

    // Convert to Data URI
    const validImage = await urlToDataUri(image);

    runOperation('Face Enhance', (s) => s.faceEnhance(validImage), 'layer');
  };

  // --- Inpainting Logic (Banner Only) ---
  const prepareInpainting = () => {
    if (!bgImage) return;
    setShowInpaintModal(true);
    // Initialize canvas with image after render
    setTimeout(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = bgImage;
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
      };
    }, 100);
  };

  const handleCanvasDraw = (e: React.MouseEvent) => {
    if (!isDrawing || !canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const scaleX = canvasRef.current.width / rect.width;
    const scaleY = canvasRef.current.height / rect.height; // Should be same ratio

    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    ctx.fillStyle = 'rgba(255, 0, 255, 1)'; // Mask color (magenta usually)
    ctx.globalCompositeOperation = 'source-over';
    ctx.beginPath();
    ctx.arc(x, y, maskBrushSize, 0, Math.PI * 2);
    ctx.fill();
  };

  const submitInpainting = async () => {
    if (!bgImage || !canvasRef.current || !inpaintPrompt) return;

    // Generate mask from canvas (assuming we drew on top of image, we need ONLY the mask)
    // Actually, typically we send the original image and a black/white mask.
    // Current simple canvas approach draws ON the image. 
    // Better approach: Draw on a separate transparent canvas ON TOP of the image in the UI.
    // For this step, let's create a temporary canvas to extract the mask.
    // Since we drew on the image pixel data, extracting is hard unless we tracked paths.
    // SIMPLIFICATION: We will assume we drew pure magenta #FF00FF. 
    // We process the canvas data to create a B&W mask.

    const ctx = canvasRef.current.getContext('2d');
    const imageData = ctx!.getImageData(0, 0, canvasRef.current.width, canvasRef.current.height);
    const data = imageData.data;

    // Create new canvas for mask
    const maskCanvas = document.createElement('canvas');
    maskCanvas.width = canvasRef.current.width;
    maskCanvas.height = canvasRef.current.height;
    const maskCtx = maskCanvas.getContext('2d');
    if (!maskCtx) return;

    const maskImgData = maskCtx.createImageData(maskCanvas.width, maskCanvas.height);
    const maskData = maskImgData.data;

    for (let i = 0; i < data.length; i += 4) {
      // Detect Magenta (R=255, G=0, B=255)
      // Allow some tolerance
      if (data[i] > 200 && data[i + 1] < 50 && data[i + 2] > 200) {
        // Mask Area -> White
        maskData[i] = 255;
        maskData[i + 1] = 255;
        maskData[i + 2] = 255;
        maskData[i + 3] = 255;
      } else {
        // Background -> Black
        maskData[i] = 0;
        maskData[i + 1] = 0;
        maskData[i + 2] = 0;
        maskData[i + 3] = 255;
      }
    }
    maskCtx.putImageData(maskImgData, 0, 0);
    const maskUrl = maskCanvas.toDataURL('image/png');

    // Also convert the Source Image to Data URI (crucial fix for 422 error)
    const validBgImage = await urlToDataUri(bgImage);

    setShowInpaintModal(false);

    runOperation('Inpainting', (s) => s.inpaint(validBgImage, maskUrl, inpaintPrompt), 'banner');
  };

  return (
    <div className='bg-zinc-900/40 backdrop-blur-md p-6 rounded-3xl border border-white/10 shadow-xl flex flex-col relative group overflow-hidden'>
      {/* Background Ambient Glow */}
      <div className={`absolute inset-0 bg-gradient-to-br transition duration-500 opacity-0 group-hover:opacity-10 rounded-3xl pointer-events-none
           ${activeContext === 'banner' ? 'from-blue-500' : 'from-purple-500'}
       `}></div>

      {/* Header */}
      <div className='flex items-center justify-between mb-6 relative z-10'>
        <h3 className='font-black text-sm uppercase tracking-wider text-white flex items-center gap-2 drop-shadow-sm'>
          <span className={`material-icons ${activeContext === 'banner' ? 'text-blue-400' : 'text-purple-400'}`}>
            {activeContext === 'banner' ? 'wallpaper' : 'layers'}
          </span>
          {activeContext === 'banner' ? 'Banner Workflow' : 'Layer Workflow'}
        </h3>
        {isProcessing && (
          <span className='text-[10px] font-bold text-yellow-500 animate-pulse flex items-center gap-1'>
            <span className='material-icons text-xs'>sync</span>
            {processingLabel}...
          </span>
        )}
      </div>

      {/* Tools Grid */}
      <div className='relative z-10 space-y-4'>

        {/* Banner Context Tools */}
        {activeContext === 'banner' && (
          <>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={prepareInpainting}
                disabled={!bgImage || isProcessing}
                className={`flex flex-col items-center justify-center p-4 rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 hover:border-blue-500/50 transition-all group/btn ${!bgImage ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <span className="material-icons text-2xl text-blue-400 mb-2 group-hover/btn:scale-110 transition">brush</span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-300">Inpaint</span>
              </button>

              <button
                onClick={() => setShowMagicInput(!showMagicInput)}
                disabled={!bgImage || isProcessing}
                className={`flex flex-col items-center justify-center p-4 rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 hover:border-purple-500/50 transition-all group/btn ${!bgImage ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <span className="material-icons text-2xl text-purple-400 mb-2 group-hover/btn:scale-110 transition">auto_fix_normal</span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-300">Magic Edit</span>
              </button>

              <button
                onClick={handleUpscale}
                disabled={!bgImage || isProcessing}
                className={`flex flex-col items-center justify-center p-4 rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 hover:border-green-500/50 transition-all group/btn ${!bgImage ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <span className="material-icons text-2xl text-green-400 mb-2 group-hover/btn:scale-110 transition">hd</span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-300">Enhance Quality</span>
              </button>

              {/* Placeholder for Generate Layer trigger if needed here */}
            </div>
          </>
        )}

        {/* Layer/Profile Context Tools */}
        {activeContext === 'layer' && (
          <>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleFaceEnhance}
                disabled={isProcessing}
                className="flex flex-col items-center justify-center p-4 rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 hover:border-pink-500/50 transition-all group/btn"
              >
                <span className="material-icons text-2xl text-pink-400 mb-2 group-hover/btn:scale-110 transition">face</span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-300">Face Enhance</span>
              </button>

              <button
                onClick={handleRemoveBg}
                disabled={isProcessing}
                className="flex flex-col items-center justify-center p-4 rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 hover:border-orange-500/50 transition-all group/btn"
              >
                <span className="material-icons text-2xl text-orange-400 mb-2 group-hover/btn:scale-110 transition">layers_clear</span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-300">Remove BG</span>
              </button>

              <button
                onClick={() => setShowMagicInput(!showMagicInput)}
                disabled={isProcessing}
                className="flex flex-col items-center justify-center p-4 rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 hover:border-purple-500/50 transition-all group/btn"
              >
                <span className="material-icons text-2xl text-purple-400 mb-2 group-hover/btn:scale-110 transition">auto_fix_normal</span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-300">Magic Edit</span>
              </button>

              <button
                onClick={handleUpscale}
                disabled={isProcessing}
                className="flex flex-col items-center justify-center p-4 rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 hover:border-green-500/50 transition-all group/btn"
              >
                <span className="material-icons text-2xl text-green-400 mb-2 group-hover/btn:scale-110 transition">hd</span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-300">Enhance</span>
              </button>
            </div>
          </>
        )}

        {/* Magic Edit Input */}
        {showMagicInput && (
          <div className="mt-4 p-3 bg-black/30 rounded-xl border border-white/10 animate-in fade-in slide-in-from-top-2">
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={magicPrompt}
                onChange={(e) => setMagicPrompt(e.target.value)}
                placeholder={activeContext === 'banner' ? "e.g., Make it a sunset..." : "e.g., Turn into a cartoon..."}
                className="flex-1 bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-white placeholder-zinc-500 focus:border-purple-500 outline-none"
                onKeyDown={(e) => e.key === 'Enter' && handleMagicEdit()}
              />
              <EnhanceButton
                prompt={magicPrompt}
                onEnhanced={setMagicPrompt}
                size="sm"
                variant="secondary"
                showLabel={false}
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleMagicEdit}
                disabled={!magicPrompt}
                className="flex-1 bg-purple-600 hover:bg-purple-500 text-white rounded-lg py-1.5 text-[10px] font-bold uppercase"
              >
                Apply
              </button>
              <button
                onClick={() => setShowMagicInput(false)}
                className="px-3 bg-zinc-700 hover:bg-zinc-600 text-white rounded-lg py-1.5 text-[10px] font-bold uppercase"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mt-4 p-3 bg-red-500/20 border border-red-500/50 rounded-xl">
            <p className="text-[10px] font-medium text-red-200">{error}</p>
          </div>
        )}
      </div>

      {/* Inpainting Modal (Simple Canvas Overlay) */}
      {showInpaintModal && bgImage && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-4">
          <div className="w-full max-w-4xl flex justify-between items-center mb-4">
            <h3 className="text-white font-bold uppercase tracking-wider">Paint area to modify (Mask)</h3>
            <div className="flex gap-4 items-center">
              <div className="flex items-center gap-2">
                <span className="text-xs text-zinc-400">Brush Size</span>
                <input
                  type="range"
                  min="5"
                  max="100"
                  value={maskBrushSize}
                  onChange={(e) => setMaskBrushSize(parseInt(e.target.value))}
                  className="w-24 accent-purple-500"
                />
              </div>
              <button onClick={() => setShowInpaintModal(false)} className="text-zinc-400 hover:text-white">
                <span className="material-icons">close</span>
              </button>
            </div>
          </div>

          <div className="relative border border-white/20 rounded-lg overflow-hidden cursor-crosshair max-h-[70vh]">
            <canvas
              ref={canvasRef}
              onMouseDown={(e) => { setIsDrawing(true); handleCanvasDraw(e); }}
              onMouseMove={handleCanvasDraw}
              onMouseUp={() => setIsDrawing(false)}
              onMouseLeave={() => setIsDrawing(false)}
              className="max-w-full h-auto"
            />
          </div>

          <div className="w-full max-w-lg mt-6 bg-zinc-900 border border-white/10 rounded-xl p-2 flex gap-2">
            <input
              type="text"
              value={inpaintPrompt}
              onChange={(e) => setInpaintPrompt(e.target.value)}
              placeholder="Describe what should fill the masked area..."
              className="flex-1 bg-transparent px-3 text-sm text-white focus:outline-none"
            />
            <EnhanceButton
              prompt={inpaintPrompt}
              onEnhanced={setInpaintPrompt}
              size="sm"
              variant="ghost"
              showLabel={false}
            />
            <button
              onClick={submitInpainting}
              disabled={!inpaintPrompt}
              className="bg-purple-600 hover:bg-purple-500 text-white font-bold px-6 py-2 rounded-lg text-xs uppercase"
            >
              Generate
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageToolsPanel;
