import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useCanvas } from '../../../context/CanvasContext';
import { restoreImage, editImage, removeBackground } from '../../../services/llm';
import { BTN_PRIMARY, BTN_NEU_SOLID, BTN_SECONDARY } from '../../../styles';
import { EnhanceButton } from '../../ui/EnhanceButton';

interface ProfileEditorModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialImage: string | null;
}

const CANVAS_SIZE = 400; // Working resolution
const OUTPUT_SIZE = 800; // High res output

export const ProfileEditorModal: React.FC<ProfileEditorModalProps> = ({
    isOpen,
    onClose,
    initialImage,
}) => {
    const { setProfilePic } = useCanvas();
    const canvasRef = useRef<HTMLCanvasElement>(null);

    // Image State
    const [imgObj, setImgObj] = useState<HTMLImageElement | null>(null);
    const [currentImageSrc, setCurrentImageSrc] = useState<string | null>(initialImage);

    // Transform State (Crop)
    const [scale, setScale] = useState(1);
    const [pos, setPos] = useState({ x: 0, y: 0 });

    // Operation State
    const [isProcessing, setIsProcessing] = useState(false);
    const [editPrompt, setEditPrompt] = useState('');
    const [activeTab, setActiveTab] = useState<'crop' | 'enhance' | 'edit'>('crop');
    const [statusMsg, setStatusMsg] = useState('');

    // Drag State
    const [isDragging, setIsDragging] = useState(false);
    const dragStart = useRef({ x: 0, y: 0 });

    // Init Image
    useEffect(() => {
        if (initialImage) {
            const img = new Image();
            img.src = initialImage;
            img.crossOrigin = 'anonymous';
            img.onload = () => {
                setImgObj(img);
                // Reset transform to center
                setScale(1);
                setPos({ x: 0, y: 0 });
            };
            setCurrentImageSrc(initialImage);
        }
    }, [initialImage]);

    // Handle Canvas Drawing (The "Crop" View)
    const drawList = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas || !imgObj) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Clear
        ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

        // Draw Background (Checkerboard)
        ctx.fillStyle = '#18181b';
        ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

        // Grid center
        const cx = CANVAS_SIZE / 2;
        const cy = CANVAS_SIZE / 2;

        ctx.save();
        // Move to center
        ctx.translate(cx + pos.x, cy + pos.y);
        ctx.scale(scale, scale);

        // Draw Image Centered
        const iw = imgObj.width;
        const ih = imgObj.height;
        ctx.drawImage(imgObj, -iw / 2, -ih / 2);
        ctx.restore();

        // Overlay: Circular Mask Guide (Inverse)
        // Darken outside the circle
        ctx.save();
        ctx.fillStyle = 'rgba(0,0,0,0.7)';
        ctx.beginPath();
        // Full Rect
        ctx.rect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
        // Cut out circle
        ctx.arc(cx, cy, CANVAS_SIZE / 2 - 20, 0, Math.PI * 2, true);
        ctx.fill();

        // Light Border around circle
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(cx, cy, CANVAS_SIZE / 2 - 20, 0, Math.PI * 2);
        ctx.stroke();

        ctx.restore();

    }, [imgObj, pos, scale]);

    useEffect(() => {
        drawList();
    }, [drawList]);

    // Drag Handlers
    const handleMouseDown = (e: React.MouseEvent) => {
        setIsDragging(true);
        dragStart.current = { x: e.clientX - pos.x, y: e.clientY - pos.y };
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging) return;
        setPos({
            x: e.clientX - dragStart.current.x,
            y: e.clientY - dragStart.current.y
        });
    };

    const handleMouseUp = () => setIsDragging(false);

    // --- ACTIONS ---

    // 1. Crop & Save Internal State
    const applyCrop = async () => {
        if (!imgObj) return;
        // Create high-res output
        const oc = document.createElement('canvas');
        oc.width = OUTPUT_SIZE;
        oc.height = OUTPUT_SIZE;
        const ctx = oc.getContext('2d');
        if (!ctx) return;

        // Calculate source rect based on current view
        // The view shows CANVAS_SIZE window.
        // We want to capture exactly what is inside the Circle (or the full square for compatibility).
        // Let's capture the full square view as seen.

        const cx = OUTPUT_SIZE / 2;
        const cy = OUTPUT_SIZE / 2;
        const ratio = OUTPUT_SIZE / CANVAS_SIZE; // 2x

        ctx.fillStyle = '#ffffff'; // Default bg? Or Transparent?
        // Profile pics support transparency usually, but JPG doesn't.
        // Let's keep transparent.

        ctx.translate(cx + pos.x * ratio, cy + pos.y * ratio);
        ctx.scale(scale * ratio, scale * ratio);
        ctx.drawImage(imgObj, -imgObj.width / 2, -imgObj.height / 2);

        const dataUrl = oc.toDataURL('image/png');

        // Update local image object to be this cropped version
        const newImg = new Image();
        newImg.src = dataUrl;
        newImg.onload = () => {
            setImgObj(newImg);
            setCurrentImageSrc(dataUrl);
            // Reset transform
            setPos({ x: 0, y: 0 });
            setScale(1);
        };

        return dataUrl;
    };

    // 2. Enhance (Face)
    const handleEnhance = async () => {
        if (!currentImageSrc) return;
        setIsProcessing(true);
        setStatusMsg('Enhancing facial features (Identity Preserved)...');
        try {
            const cropped = await applyCrop();
            if (!cropped) throw new Error("Failed to capture image");

            const service = await import('../../../services/replicate').then(m => m.getReplicateService());
            // Face Enhance
            const res = await service.faceEnhance(cropped);

            if (res) {
                setCurrentImageSrc(res);
                const i = new Image();
                i.src = res;
                i.crossOrigin = 'anonymous';
                i.onload = () => {
                    setImgObj(i);
                    setPos({ x: 0, y: 0 });
                    setScale(1);
                };
            }
        } catch (e: any) {
            console.error(e);
            alert('Enhancement failed: ' + (e.message || 'Unknown error'));
        } finally {
            setIsProcessing(false);
            setStatusMsg('');
        }
    };

    // 3. Edit (Background/Clothing)
    const handleMagicEdit = async () => {
        if (!currentImageSrc || !editPrompt) return;
        setIsProcessing(true);
        setStatusMsg('Applying Magic Edit (Strict Identity Mode)...');
        try {
            const cropped = await applyCrop();
            if (!cropped) throw new Error("Failed to capture image");

            const strictPrompt = `${editPrompt}. Keep the person's face and facial features EXACTLY the same. Do not alter identity. High quality, photorealistic.`;

            const service = await import('../../../services/replicate').then(m => m.getReplicateService());
            const res = await service.magicEdit(cropped, strictPrompt, 0.9); // High strength for edit, but prompt safeguards identity

            if (res) {
                setCurrentImageSrc(res);
                const i = new Image();
                i.src = res;
                i.crossOrigin = 'anonymous';
                i.onload = () => {
                    setImgObj(i);
                    setPos({ x: 0, y: 0 });
                    setScale(1);
                };
            }
        } catch (e: any) {
            console.error(e);
            alert('Edit failed: ' + (e.message || 'Unknown error'));
        } finally {
            setIsProcessing(false);
            setStatusMsg('');
        }
    };

    // 4. Download
    const handleDownload = async () => {
        const finalUrl = await applyCrop();
        if (!finalUrl) return;
        const a = document.createElement('a');
        a.href = finalUrl;
        a.download = `nano-profile-${Date.now()}.png`;
        a.click();
    };

    // 5. Save to Context
    const handleSaveToProfile = async () => {
        const finalUrl = await applyCrop();
        if (finalUrl) {
            setProfilePic(finalUrl);
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md">
            <div className="bg-zinc-900 border border-zinc-700 rounded-3xl w-full max-w-4xl max-h-[90vh] flex overflow-hidden shadow-2xl">

                {/* Left: Preview / Canvas */}
                <div className="flex-1 bg-black/50 p-8 flex items-center justify-center relative">
                    <canvas
                        ref={canvasRef}
                        width={CANVAS_SIZE}
                        height={CANVAS_SIZE}
                        className={`rounded-full shadow-2xl border-4 border-white/10 cursor-move ${isProcessing ? 'opacity-50' : ''}`}
                        onMouseDown={handleMouseDown}
                        onMouseMove={handleMouseMove}
                        onMouseUp={handleMouseUp}
                        onMouseLeave={handleMouseUp}
                    />
                    {isProcessing && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center z-20">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mb-4"></div>
                            <div className="text-white font-bold animate-pulse text-sm uppercase tracking-widest">{statusMsg}</div>
                        </div>
                    )}

                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-4 bg-zinc-900/90 p-2 rounded-xl border border-white/10">
                        <button onClick={() => setScale(s => Math.max(0.1, s - 0.1))} className="p-2 hover:bg-white/10 rounded-lg text-white material-icons">remove</button>
                        <span className="text-xs text-zinc-400 font-mono py-2">{Math.round(scale * 100)}%</span>
                        <button onClick={() => setScale(s => Math.min(5, s + 0.1))} className="p-2 hover:bg-white/10 rounded-lg text-white material-icons">add</button>
                    </div>
                </div>

                {/* Right: Controls */}
                <div className="w-[350px] bg-zinc-900 border-l border-white/10 flex flex-col">
                    <div className="p-6 border-b border-white/10 flex justify-between items-center">
                        <h2 className="text-white font-black text-lg uppercase tracking-wide">
                            Profile Perfector
                        </h2>
                        <button onClick={onClose} className="text-zinc-500 hover:text-white material-icons">close</button>
                    </div>

                    <div className="flex-1 p-6 space-y-8 overflow-y-auto">

                        {/* 1. Face Enhance */}
                        <div>
                            <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-3">
                                1. Enhance
                            </div>
                            <button
                                onClick={handleEnhance}
                                disabled={isProcessing}
                                className="w-full py-4 bg-gradient-to-r from-blue-600 to-blue-500 rounded-xl text-white font-bold text-sm uppercase tracking-wide hover:shadow-lg hover:brightness-110 transition flex items-center justify-center gap-2"
                            >
                                <span className="material-icons">face_retouching_natural</span>
                                Enhance Face Details
                            </button>
                            <p className="text-[10px] text-zinc-500 mt-2 leading-tight">
                                Smooths skin and fixes lighting while strictly preserving your identity.
                            </p>
                        </div>

                        {/* 2. Magic Edit */}
                        <div>
                            <div className="flex items-center justify-between mb-3">
                                <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                                    2. Magic Edit (Beta)
                                </div>
                                <EnhanceButton
                                    prompt={editPrompt}
                                    onEnhanced={setEditPrompt}
                                    size="xs"
                                    variant="ghost"
                                    showLabel={true}
                                />
                            </div>
                            <textarea
                                value={editPrompt}
                                onChange={(e) => setEditPrompt(e.target.value)}
                                placeholder="E.g., Change suit to navy blue tuxedo, cyberpunk background..."
                                className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-xs text-white placeholder-zinc-600 mb-3 focus:outline-none focus:border-purple-500 h-24 resize-none"
                            />
                            <button
                                onClick={handleMagicEdit}
                                disabled={isProcessing || !editPrompt}
                                className="w-full py-3 bg-zinc-800 hover:bg-zinc-700 rounded-xl text-white font-bold text-xs uppercase tracking-wide transition flex items-center justify-center gap-2 border border-white/5"
                            >
                                <span className="material-icons text-purple-400">auto_fix_high</span>
                                Apply Magic Edit
                            </button>
                        </div>

                        {/* 3. Download */}
                        <div>
                            <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-3">
                                3. Export
                            </div>
                            <button
                                onClick={handleDownload}
                                className="w-full py-3 border border-zinc-600 hover:bg-zinc-800 rounded-xl text-zinc-300 font-bold text-xs uppercase tracking-wide transition flex items-center justify-center gap-2 mb-3"
                            >
                                <span className="material-icons">download</span>
                                Download PNG
                            </button>
                            <button
                                onClick={handleSaveToProfile}
                                className={`w-full py-4 ${BTN_PRIMARY} flex items-center justify-center gap-2 shadow-xl shadow-purple-900/20`}
                            >
                                <span className="material-icons">save</span>
                                Save to Canvas
                            </button>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};
