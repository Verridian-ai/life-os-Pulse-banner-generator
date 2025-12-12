
import React from 'react';
import { useCanvas } from '../../../context/CanvasContext';
import { BTN_BASE } from '../../../styles';

const ExportPanel: React.FC = () => {
    const { canvasRef } = useCanvas();

    const handleDownload = () => {
        if (canvasRef.current) {
            const link = document.createElement('a');
            link.download = 'linkedin-banner-nanobanna.png';
            link.href = canvasRef.current.generateStageImage();
            link.click();
        }
    };

    return (
        <div className="bg-zinc-900/40 backdrop-blur-md p-6 rounded-3xl border border-white/10 shadow-xl flex flex-col justify-center items-center text-center relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent rounded-3xl pointer-events-none opacity-0 group-hover:opacity-100 transition duration-500"></div>
            <div className="relative z-10 w-full">
                <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4 border border-green-500/30 shadow-[0_0_15px_rgba(34,197,94,0.3)]">
                    <span className="material-icons text-3xl text-green-400">download</span>
                </div>
                <h3 className="font-black text-white mb-2 uppercase tracking-wide drop-shadow-sm">Ready to Launch?</h3>
                <p className="text-[11px] text-zinc-400 mb-6 leading-relaxed font-medium">
                    Export your design as a high-fidelity PNG. <br />(Profile picture and guides are excluded automatically).
                </p>
                <button
                    onClick={handleDownload}
                    className={`${BTN_BASE} w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white shadow-lg shadow-green-900/30`}
                >
                    Download Banner
                    <span className="material-icons text-sm">arrow_forward</span>
                </button>
            </div>
        </div>
    );
};

export default ExportPanel;
