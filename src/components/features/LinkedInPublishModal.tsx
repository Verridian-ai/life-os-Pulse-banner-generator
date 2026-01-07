import React, { useState } from 'react';
import { useCanvas } from '../../context/CanvasContext';
import { useToast } from '../../hooks/useToast';
import { BTN_BASE } from '../../styles';

interface LinkedInPublishModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LinkedInPublishModal: React.FC<LinkedInPublishModalProps> = ({ isOpen, onClose }) => {
  const { canvasRef } = useCanvas();
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishMode, setPublishMode] = useState<'profile' | 'post'>('profile');
  const [previewImage, setPreviewImage] = useState<string | undefined>(undefined);
  const toast = useToast();

  React.useEffect(() => {
    if (isOpen && canvasRef.current) {
      setPreviewImage(canvasRef.current.generateStageImage());
    }
  }, [isOpen, canvasRef]);

  const handlePublish = async () => {
    if (!canvasRef.current) return;
    
    setIsPublishing(true);
    // Simulate LinkedIn API call
    await new Promise(r => setTimeout(r, 2000));
    
    setIsPublishing(false);
    toast.success(publishMode === 'profile' ? 'Banner published to your LinkedIn profile!' : 'Banner shared as a LinkedIn post!');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 z-[250] flex items-center justify-center bg-black/80 backdrop-blur-md p-4'>
      <div className='bg-zinc-900 border border-white/10 rounded-3xl p-8 w-full max-w-lg shadow-2xl relative'>
        <button onClick={onClose} className='absolute top-4 right-4 text-zinc-500 hover:text-white transition'>
          <span className='material-icons'>close</span>
        </button>

        <div className='text-center mb-8'>
          <div className='inline-flex items-center justify-center w-16 h-16 bg-[#0077b5] rounded-2xl mb-4 shadow-lg shadow-blue-500/20'>
            <span className='material-icons text-3xl text-white'>linkedin</span>
          </div>
          <h2 className='text-2xl font-black text-white uppercase tracking-wider mb-2'>Publish to LinkedIn</h2>
          <p className='text-sm text-zinc-400'>Update your profile or share your creation instantly.</p>
        </div>

        <div className='grid grid-cols-2 gap-4 mb-8'>
          <button 
            onClick={() => setPublishMode('profile')}
            className={`p-4 rounded-2xl border transition-all text-left ${publishMode === 'profile' ? 'bg-blue-600/10 border-blue-500 text-white' : 'bg-zinc-950 border-white/5 text-zinc-500 hover:border-white/10'}`}
          >
            <span className='material-icons mb-2'>badge</span>
            <div className='font-bold text-sm'>Profile Banner</div>
            <div className='text-[10px] opacity-60'>Update your 1584x396 header</div>
          </button>
          <button 
            onClick={() => setPublishMode('post')}
            className={`p-4 rounded-2xl border transition-all text-left ${publishMode === 'post' ? 'bg-blue-600/10 border-blue-500 text-white' : 'bg-zinc-950 border-white/5 text-zinc-500 hover:border-white/10'}`}
          >
            <span className='material-icons mb-2'>share</span>
            <div className='font-bold text-sm'>Share as Post</div>
            <div className='text-[10px] opacity-60'>Create a feed update</div>
          </button>
        </div>

        {/* LinkedIn Preview Simulation */}
        <div className='bg-zinc-950 rounded-xl p-4 mb-8 border border-white/5'>
          <div className='text-[9px] font-bold text-zinc-600 uppercase tracking-widest mb-2'>Preview</div>
          <div className='relative aspect-[1584/396] w-full rounded bg-zinc-900 overflow-hidden'>
            {previewImage && <img src={previewImage} className='w-full h-full object-cover' alt="Preview" />}
            {publishMode === 'profile' && (
              <div className='absolute bottom-0 left-4 w-12 h-12 bg-zinc-800 rounded-full border-2 border-zinc-950 -mb-6' />
            )}
          </div>
        </div>

        <button 
          onClick={handlePublish}
          disabled={isPublishing}
          className={`w-full ${BTN_BASE} bg-[#0077b5] text-white hover:bg-[#00639b] shadow-lg shadow-blue-900/30`}
        >
          {isPublishing ? (
            <>
              <div className='w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin'></div>
              PUBLISHING...
            </>
          ) : (
            <>
              <span className='material-icons text-sm'>rocket_launch</span>
              {publishMode === 'profile' ? 'Publish to Profile' : 'Share to Feed'}
            </>
          )}
        </button>
      </div>
    </div>
  );
};
