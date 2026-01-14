import React, { useState } from 'react';
import { useCanvas } from '../../../context/CanvasContext';
import { BTN_NEU_SOLID } from '../../../styles';
import { ProfileEditorModal } from './ProfileEditorModal';
import { useAuth } from '../../../context/AuthContext';
import { persistFileToGallery } from '../../../utils/imagePersistence';

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
  const { authUser } = useAuth();
  const [showProfileEditor, setShowProfileEditor] = useState(false);

  const handleLocalUploadEnhanced = async (
    e: React.ChangeEvent<HTMLInputElement>,
    type: 'background' | 'ref' | 'profile',
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Persist (Async)
    if (authUser) {
      persistFileToGallery(authUser.id, file, {
        prompt: 'Uploaded Image',
        model_used: 'upload',
        generation_type: 'upload',
        tags: [type],
      }).catch(console.error);
    }

    // Call original handlers
    if (type === 'background') {
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (typeof ev.target?.result === 'string') setBgImage(ev.target.result);
      };
      reader.readAsDataURL(file);
    } else if (type === 'ref') {
      onRefUpload(e);
    } else if (type === 'profile') {
      onProfileUpload(e);
    }
  };

  // Helper for adding ref as layer since it's not directly in context actions yet in the same way
  // ... (comments retained)

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
    <>
      <div className='bg-zinc-900/40 backdrop-blur-md p-3 sm:p-4 md:p-6 rounded-2xl md:rounded-3xl border border-white/10 shadow-xl flex flex-col relative group'>
        <div className='absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent rounded-2xl md:rounded-3xl pointer-events-none opacity-0 group-hover:opacity-100 transition duration-500'></div>
        {isProcessingImg && (
          <div className='absolute inset-0 bg-black/60 z-20 rounded-2xl md:rounded-3xl flex items-center justify-center text-xs text-white font-bold backdrop-blur-sm'>
            <span className='animate-pulse'>OPTIMIZING...</span>
          </div>
        )}

        <div className='flex items-center justify-between mb-3 sm:mb-4 md:mb-6 relative z-10'>
          <h3 className='font-black text-xs sm:text-sm uppercase tracking-wider text-white flex items-center gap-2 drop-shadow-sm'>
            <span className='material-icons text-blue-400 text-lg sm:text-xl'>inventory_2</span>
            Assets
          </h3>
          <span className='text-[8px] sm:text-[9px] font-bold uppercase tracking-widest bg-white/10 border border-white/5 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md text-zinc-400'>
            Uploads
          </span>
        </div>

        <div className='space-y-6 relative z-10 flex-1'>
          {/* Background Upload Section */}
          <div>
            <label className='block text-[10px] font-bold text-zinc-500 mb-3 uppercase tracking-widest'>
              Canvas Background
            </label>
            <label
              className={`w-full flex items-center justify-center gap-2 py-2.5 sm:py-3 px-3 sm:px-4 rounded-xl cursor-pointer transition ${BTN_NEU_SOLID} group/bg`}
            >
              <span className='material-icons text-zinc-400 group-hover/bg:text-white transition text-lg sm:text-xl'>
                add_photo_alternate
              </span>
              <span className='text-[10px] sm:text-xs font-bold text-zinc-400 group-hover/bg:text-white transition uppercase tracking-wider'>
                Upload Background
              </span>
              <input
                type='file'
                id='bg-upload'
                aria-label='Upload background image'
                accept='image/*'
                className='hidden'
                onChange={(e) => handleLocalUploadEnhanced(e, 'background')}
              />
            </label>
          </div>

          <div>
            <label className='block text-[9px] sm:text-[10px] font-bold text-zinc-500 mb-2 sm:mb-3 uppercase tracking-widest'>
              Logos
            </label>
            <div className='grid grid-cols-3 sm:grid-cols-4 gap-1.5 sm:gap-2'>
              {refImages.map((img: string, idx: number) => (
                <div
                  key={idx}
                  className='relative group/item aspect-square rounded-lg sm:rounded-xl overflow-hidden border border-white/10 bg-black/50'
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
                          x: 1350,
                          y: 40,
                          width: 150,
                          height: 150,
                          rotation: 0,
                        })
                      }
                      className='min-h-[36px] sm:min-h-[44px] text-[8px] sm:text-[10px] font-black uppercase tracking-wide bg-purple-600 text-white px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg hover:scale-105 active:scale-95 transition shadow-lg touch-manipulation'
                    >
                      Place
                    </button>
                  </div>
                </div>
              ))}
              <label
                className={`flex flex-col items-center justify-center h-full min-h-[50px] sm:min-h-[60px] rounded-lg sm:rounded-xl cursor-pointer transition aspect-square group/add ${BTN_NEU_SOLID}`}
              >
                <span className='material-icons text-zinc-500 group-hover/add:text-white transition text-lg sm:text-xl'>
                  add
                </span>
                <input
                  type='file'
                  id='ref-upload-1'
                  aria-label='Upload reference logos'
                  multiple
                  onChange={(e) => handleLocalUploadEnhanced(e, 'ref')}
                  className='hidden'
                  accept='image/*'
                />
              </label>
            </div>
          </div>

          <div className='pt-3 sm:pt-4 border-t border-white/10 mb-3 sm:mb-4'>
            <label className='block text-[9px] sm:text-[10px] font-bold text-zinc-500 mb-2 sm:mb-3 uppercase tracking-widest'>
              Image Overlays
            </label>
            <div className='grid grid-cols-3 sm:grid-cols-4 gap-1.5 sm:gap-2'>
              {/* Reference Images List */}
              {refImages.map((img, i) => (
                <div
                  key={i}
                  className='aspect-square bg-zinc-800 rounded-lg relative group overflow-hidden border border-zinc-700/50'
                >
                  <img
                    src={img}
                    alt='ref'
                    className='w-full h-full object-contain p-1.5 sm:p-2 opacity-70 group-hover:opacity-100 transition'
                  />
                  <div
                    className='absolute inset-0 bg-black/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition backdrop-blur-sm cursor-pointer'
                    onClick={() =>
                      addElement({
                        id: Date.now().toString(),
                        type: 'image',
                        content: img,
                        x: 1350,
                        y: 40,
                        width: 150,
                        height: 150,
                        rotation: 0,
                      })
                    }
                  >
                    <button
                      type='button'
                      className='min-h-[36px] sm:min-h-[44px] text-[8px] sm:text-[10px] font-black uppercase tracking-wide bg-purple-600 text-white px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg hover:scale-105 active:scale-95 transition shadow-lg touch-manipulation'
                    >
                      Place
                    </button>
                  </div>
                </div>
              ))}
              <label
                className={`flex flex-col items-center justify-center h-full min-h-[50px] sm:min-h-[60px] rounded-lg sm:rounded-xl cursor-pointer transition aspect-square group/add ${BTN_NEU_SOLID}`}
              >
                <span className='material-icons text-zinc-500 group-hover/add:text-white transition text-lg sm:text-xl'>
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
                <div className='w-14 h-14 shrink-0 aspect-square rounded-full bg-zinc-800 overflow-hidden border-2 border-zinc-700 relative group/profile shadow-inner flex items-center justify-center'>
                  {profilePic ? (
                    <img src={profilePic} alt='profile' className='w-full h-full object-cover' />
                  ) : (
                    <span className='material-icons text-zinc-600 text-3xl'>person</span>
                  )}
                  <label className='absolute inset-0 bg-black/60 opacity-0 group-hover/profile:opacity-100 flex items-center justify-center cursor-pointer transition'>
                    <span className='material-icons text-white text-xs'>edit</span>
                    <input
                      type='file'
                      id='profile-upload'
                      aria-label='Upload profile picture'
                      onChange={(e) => handleLocalUploadEnhanced(e, 'profile')}
                      className='hidden'
                      accept='image/*'
                    />
                  </label>
                </div>
                <div className='text-[10px] font-medium text-zinc-400 leading-tight'>
                  Adjust your headshot placement within the "OBSTRUCTION ZONE" to ensure visibility.
                </div>
              </div>

              {/* New Perfect & Edit Trigger */}
              {profilePic && (
                <button
                  type='button'
                  onClick={() => setShowProfileEditor(true)}
                  className='w-full py-2 mt-2 bg-gradient-to-r from-blue-900/50 to-purple-900/50 border border-blue-500/30 hover:border-blue-400 text-blue-200 hover:text-white rounded-lg text-[10px] font-black uppercase tracking-wider transition flex items-center justify-center gap-2 shadow-lg group-hover:shadow-blue-500/20'
                >
                  <span className='material-icons text-sm text-blue-400'>auto_fix_high</span>
                  Perfect Profile Picture
                </button>
              )}

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

      {/* Modal */}
      <ProfileEditorModal
        isOpen={showProfileEditor}
        onClose={() => setShowProfileEditor(false)}
        initialImage={profilePic}
      />
    </>
  );
};

export default AssetsPanel;
