import React from 'react';
import { useCanvas } from '../../../context/CanvasContext';
import { BTN_NEU_SOLID } from '../../../styles';

const AssetsPanel: React.FC = () => {
  const {
    refImages,
    setBgImage,
    handleRefUpload: onRefUpload,
    profilePic,
    handleProfileUpload: onProfileUpload,
    isProcessingImg,
    addElement,
    profileTransform,
    setProfileTransform,
  } = useCanvas();

  // Helper for adding ref as layer since it's not directly in context actions yet in the same way
  // Actually we need to make sure onReferenceLayerAdd is handeld.
  // Let's implement local logic if context doesn't have it, or assume context update.
  // Checking Context: it doesn't have onReferenceLayerAdd directly exposing "addElement".

  // Helper function for adding images as layers - currently unused but kept for potential future use
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _handleAddLayer = (img: string) => {
    addElement({
      id: Date.now().toString(),
      type: 'image',
      content: img,
      x: 100,
      y: 100,
      width: 200,
      height: 200,
      rotation: 0,
    });
  };

  return (
    <div className='bg-zinc-900/40 backdrop-blur-md p-6 rounded-3xl border border-white/10 shadow-xl flex flex-col relative group'>
      <div className='absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent rounded-3xl pointer-events-none opacity-0 group-hover:opacity-100 transition duration-500'></div>
      {isProcessingImg && (
        <div className='absolute inset-0 bg-black/60 z-20 rounded-3xl flex items-center justify-center text-xs text-white font-bold backdrop-blur-sm'>
          <span className='animate-pulse'>OPTIMIZING...</span>
        </div>
      )}

      <div className='flex items-center justify-between mb-6 relative z-10'>
        <h3 className='font-black text-sm uppercase tracking-wider text-white flex items-center gap-2 drop-shadow-sm'>
          <span className='material-icons text-blue-400'>inventory_2</span>
          Assets
        </h3>
        <span className='text-[9px] font-bold uppercase tracking-widest bg-white/10 border border-white/5 px-2 py-1 rounded-md text-zinc-400'>
          Uploads
        </span>
      </div>

      <div className='space-y-6 relative z-10 flex-1'>
        {/* Background Upload Section */}
        <div>
          <label className='block text-[10px] font-bold text-zinc-500 mb-3 uppercase tracking-widest'>
            Canvas Background
          </label>
          <div className='flex gap-2'>
            <label
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl cursor-pointer transition ${BTN_NEU_SOLID} group/bg`}
            >
              <span className='material-icons text-zinc-400 group-hover/bg:text-white transition'>
                add_photo_alternate
              </span>
              <span className='text-xs font-bold text-zinc-400 group-hover/bg:text-white transition uppercase tracking-wider'>
                Upload Background
              </span>
              <input
                type='file'
                id='bg-upload'
                aria-label='Upload background image'
                accept='image/*'
                className='hidden'
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = (ev) => {
                      if (typeof ev.target?.result === 'string') {
                        setBgImage(ev.target.result);
                      }
                    };
                    reader.readAsDataURL(file);
                  }
                }}
              />
            </label>
          </div>
        </div>

        <div>
          <label className='block text-[10px] font-bold text-zinc-500 mb-3 uppercase tracking-widest'>
            Logos
          </label>
          <div className='grid grid-cols-4 gap-2'>
            {refImages.map((img: string, idx: number) => (
              <div
                key={idx}
                className='relative group/item aspect-square rounded-xl overflow-hidden border border-white/10 bg-black/50'
              >
                <img src={img} alt='logo' className='w-full h-full object-cover' />
                <div className='absolute inset-0 bg-black/80 opacity-0 group-hover/item:opacity-100 flex flex-col gap-1 items-center justify-center transition-all'>
                  <button
                    type='button'
                    onClick={() =>
                      addElement({
                        id: Date.now().toString(),
                        type: 'image',
                        content: img,
                        x: 1350, // Safe Spot X (Top Right)
                        y: 40, // Safe Spot Y
                        width: 150,
                        height: 150,
                        rotation: 0,
                      })
                    }
                    className='text-[9px] font-black uppercase tracking-wide bg-purple-600 text-white px-3 py-2 rounded-lg hover:scale-105 transition shadow-lg'
                  >
                    Place Logo
                  </button>
                </div>
              </div>
            ))}
            <label
              className={`flex flex-col items-center justify-center h-full min-h-[60px] rounded-xl cursor-pointer transition aspect-square group/add ${BTN_NEU_SOLID}`}
            >
              <span className='material-icons text-zinc-500 group-hover/add:text-white transition'>
                add
              </span>
              <input
                type='file'
                id='ref-upload-1'
                aria-label='Upload reference logos'
                multiple
                onChange={onRefUpload}
                className='hidden'
                accept='image/*'
              />
            </label>
          </div>
        </div>

        <div className='pt-4 border-t border-white/10 mb-4'>
          <label className='block text-[10px] font-bold text-zinc-500 mb-3 uppercase tracking-widest'>
            Logos & Image Overlays
          </label>
          <div className='grid grid-cols-4 gap-2'>
            {/* Reference Images List */}
            {refImages.map((img, i) => (
              <div
                key={i}
                className='aspect-square bg-zinc-800 rounded-lg relative group overflow-hidden border border-zinc-700/50'
              >
                <img
                  src={img}
                  alt='ref'
                  className='w-full h-full object-contain p-2 opacity-70 group-hover:opacity-100 transition'
                />
                <div
                  className='absolute inset-0 bg-black/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition backdrop-blur-sm cursor-pointer'
                  onClick={() =>
                    addElement({
                      id: Date.now().toString(),
                      type: 'image',
                      content: img,
                      x: 1350, // Safe Spot X (Top Right)
                      y: 40, // Safe Spot Y
                      width: 150,
                      height: 150,
                      rotation: 0,
                    })
                  }
                >
                  <button
                    type='button'
                    className='text-[9px] font-black uppercase tracking-wide bg-purple-600 text-white px-3 py-2 rounded-lg hover:scale-105 transition shadow-lg'
                  >
                    Place
                  </button>
                </div>
              </div>
            ))}
            <label
              className={`flex flex-col items-center justify-center h-full min-h-[60px] rounded-xl cursor-pointer transition aspect-square group/add ${BTN_NEU_SOLID}`}
            >
              <span className='material-icons text-zinc-500 group-hover/add:text-white transition'>
                add
              </span>
              <input
                type='file'
                id='ref-upload-2'
                aria-label='Upload image overlays'
                multiple
                onChange={onRefUpload}
                className='hidden'
                accept='image/*'
              />
            </label>
          </div>
        </div>

        <div className='pt-4 border-t border-white/10'>
          <label className='block text-[10px] font-bold text-zinc-500 mb-3 uppercase tracking-widest'>
            Profile Overlay
          </label>
          <div className='flex flex-col gap-3'>
            <div className='flex items-center gap-4'>
              <div className='w-14 h-14 shrink-0 aspect-square rounded-full bg-zinc-800 overflow-hidden border-2 border-zinc-700 relative group/profile shadow-inner'>
                {profilePic ? (
                  <img src={profilePic} alt='profile' className='w-full h-full object-cover' />
                ) : (
                  <span className='material-icons text-zinc-600 absolute inset-0 flex items-center justify-center'>
                    person
                  </span>
                )}
                <label className='absolute inset-0 bg-black/60 opacity-0 group-hover/profile:opacity-100 flex items-center justify-center cursor-pointer transition'>
                  <span className='material-icons text-white text-xs'>edit</span>
                  <input
                    type='file'
                    id='profile-upload'
                    aria-label='Upload profile picture'
                    onChange={onProfileUpload}
                    className='hidden'
                    accept='image/*'
                  />
                </label>
              </div>
              <div className='text-[10px] font-medium text-zinc-400 leading-tight'>
                Adjust your headshot placement within the "OBSTRUCTION ZONE" to ensure visibility.
              </div>
            </div>

            {/* Profile Transform Controls */}
            {profilePic && (
              <div className='bg-black/20 rounded-lg p-3 space-y-2 border border-white/5'>
                <div className='flex items-center gap-2'>
                  <span className='text-[9px] text-zinc-500 w-8 font-bold'>ZOOM</span>
                  <input
                    type='range'
                    min='0.5'
                    max='5'
                    step='0.1'
                    aria-label='Profile Zoom'
                    value={profileTransform?.scale || 1}
                    onChange={(e) =>
                      setProfileTransform({
                        ...profileTransform,
                        scale: parseFloat(e.target.value),
                      })
                    }
                    className='flex-1 accent-purple-500 h-1 bg-zinc-700 rounded-lg appearance-none cursor-pointer'
                  />
                </div>
                <div className='flex items-center gap-2'>
                  <span className='text-[9px] text-zinc-500 w-8 font-bold'>X-POS</span>
                  <input
                    type='range'
                    min='-100'
                    max='100'
                    step='1'
                    aria-label='Profile X Position'
                    value={profileTransform?.x || 0}
                    onChange={(e) =>
                      setProfileTransform({ ...profileTransform, x: parseInt(e.target.value) })
                    }
                    className='flex-1 accent-blue-500 h-1 bg-zinc-700 rounded-lg appearance-none cursor-pointer'
                  />
                </div>
                <div className='flex items-center gap-2'>
                  <span className='text-[9px] text-zinc-500 w-8 font-bold'>Y-POS</span>
                  <input
                    type='range'
                    min='-100'
                    max='100'
                    step='1'
                    aria-label='Profile Y Position'
                    value={profileTransform?.y || 0}
                    onChange={(e) =>
                      setProfileTransform({ ...profileTransform, y: parseInt(e.target.value) })
                    }
                    className='flex-1 accent-blue-500 h-1 bg-zinc-700 rounded-lg appearance-none cursor-pointer'
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssetsPanel;
