/**
 * ProfileOverlay - Profile picture overlay for banners
 *
 * Displays the profile picture overlay for formats that support it
 * (LinkedIn banner, Facebook cover). Supports both circular and square shapes.
 */

import React, { useState, useCallback } from 'react';
import type { ProfileOverlayConfig } from '../../studios/config/platformConfig';

export interface ProfileTransform {
  x: number;
  y: number;
  scale: number;
}

export interface ProfileOverlayProps {
  /** Profile picture URL */
  profilePic: string | null;
  /** Current transform (position and scale) */
  profileTransform?: ProfileTransform;
  /** Callback to update transform */
  setProfileTransform?: (val: ProfileTransform) => void;
  /** Configuration for the overlay */
  profileOverlayConfig: ProfileOverlayConfig;
  /** Canvas width for sizing calculations */
  canvasWidth: number;
  /** Callback for face enhancement */
  onProfileFaceEnhance?: () => Promise<void>;
  /** Callback for background removal */
  onProfileRemoveBg?: () => Promise<void>;
  /** Callback for profile upload */
  onProfileUpload?: () => void;
}

/**
 * Profile picture overlay component
 */
export function ProfileOverlay({
  profilePic,
  profileTransform,
  setProfileTransform,
  profileOverlayConfig,
  canvasWidth,
  onProfileFaceEnhance,
  onProfileRemoveBg,
  onProfileUpload,
}: ProfileOverlayProps): React.ReactElement {
  const [isEnhancingProfile, setIsEnhancingProfile] = useState(false);
  const [isRemovingBgProfile, setIsRemovingBgProfile] = useState(false);
  const [profileDrag, setProfileDrag] = useState<{
    startX: number;
    startY: number;
    startPX: number;
    startPY: number;
  } | null>(null);

  /**
   * Handle profile drag start
   */
  const handleProfileMouseDown = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      if (!setProfileTransform) return;

      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      const button = 'touches' in e ? 0 : e.button;

      if (button !== 0) return; // Only left click / touch

      e.stopPropagation();
      setProfileDrag({
        startX: clientX,
        startY: clientY,
        startPX: profileTransform?.x || 0,
        startPY: profileTransform?.y || 0,
      });
    },
    [setProfileTransform, profileTransform],
  );

  /**
   * Handle profile drag move
   */
  const handleProfileMouseMove = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      if (!profileDrag || !setProfileTransform) return;

      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

      e.preventDefault();
      const dx = clientX - profileDrag.startX;
      const dy = clientY - profileDrag.startY;

      setProfileTransform({
        x: profileDrag.startPX + dx,
        y: profileDrag.startPY + dy,
        scale: profileTransform?.scale || 1,
      });
    },
    [profileDrag, setProfileTransform, profileTransform?.scale],
  );

  /**
   * Handle profile drag end
   */
  const handleProfileMouseUp = useCallback(() => {
    setProfileDrag(null);
  }, []);

  /**
   * Handle profile wheel (Ctrl+scroll to zoom)
   */
  const handleProfileWheel = useCallback(
    (e: React.WheelEvent) => {
      if (!setProfileTransform) return;
      e.stopPropagation();

      if (e.ctrlKey) {
        e.preventDefault();
        const delta = -e.deltaY * 0.002;
        const currentScale = profileTransform?.scale || 1;
        const newScale = Math.min(Math.max(0.5, currentScale + delta), 5);
        setProfileTransform({
          x: profileTransform?.x || 0,
          y: profileTransform?.y || 0,
          scale: newScale,
        });
      }
    },
    [setProfileTransform, profileTransform],
  );

  /**
   * Handle face enhance button click
   */
  const handleFaceEnhance = useCallback(
    async (e: React.MouseEvent) => {
      e.stopPropagation();
      if (onProfileFaceEnhance && !isEnhancingProfile) {
        setIsEnhancingProfile(true);
        try {
          await onProfileFaceEnhance();
        } catch (error) {
          console.error('[Profile] Face enhance failed:', error);
        } finally {
          setIsEnhancingProfile(false);
        }
      }
    },
    [onProfileFaceEnhance, isEnhancingProfile],
  );

  /**
   * Handle remove background button click
   */
  const handleRemoveBg = useCallback(
    async (e: React.MouseEvent) => {
      e.stopPropagation();
      if (onProfileRemoveBg && !isRemovingBgProfile) {
        setIsRemovingBgProfile(true);
        try {
          await onProfileRemoveBg();
        } catch (error) {
          console.error('[Profile] Remove BG failed:', error);
        } finally {
          setIsRemovingBgProfile(false);
        }
      }
    },
    [onProfileRemoveBg, isRemovingBgProfile],
  );

  return (
    <div
      className={`absolute border-4 border-white overflow-hidden shadow-lg z-10 bg-slate-100 group pointer-events-auto ${
        profilePic
          ? profileDrag
            ? 'cursor-grabbing'
            : 'cursor-grab'
          : profileOverlayConfig.interactive
            ? 'cursor-pointer hover:bg-slate-200/50'
            : 'cursor-default'
      }`}
      style={{
        // Dynamic size based on config - percentage of canvas width
        width: `${(profileOverlayConfig.size / canvasWidth) * 100}%`,
        // For circles, use aspect-square; for squares, set explicit height
        aspectRatio: profileOverlayConfig.shape === 'circle' ? '1/1' : undefined,
        height:
          profileOverlayConfig.shape === 'square'
            ? `${(profileOverlayConfig.size / canvasWidth) * 100}%`
            : undefined,
        // Position from config
        left: profileOverlayConfig.position.x,
        top: profileOverlayConfig.position.y,
        // Shape-specific border radius
        borderRadius: profileOverlayConfig.borderRadius,
        // Center the overlay on its position point
        transform: 'translate(-50%, -50%)',
      }}
      onMouseDown={profilePic ? handleProfileMouseDown : undefined}
      onMouseMove={profilePic ? handleProfileMouseMove : undefined}
      onMouseUp={profilePic ? handleProfileMouseUp : undefined}
      onMouseLeave={profilePic ? handleProfileMouseUp : undefined}
      onTouchStart={profilePic ? handleProfileMouseDown : undefined}
      onTouchMove={profilePic ? handleProfileMouseMove : undefined}
      onTouchEnd={profilePic ? handleProfileMouseUp : undefined}
      onWheel={profilePic ? handleProfileWheel : undefined}
      onClick={!profilePic && profileOverlayConfig.interactive ? onProfileUpload : undefined}
    >
      {profilePic ? (
        <div className='w-full h-full relative pointer-events-none'>
          <img
            src={profilePic}
            alt='Profile'
            className={`w-full h-full object-cover select-none ${
              profileDrag ? 'transition-none' : 'transition-transform duration-100 ease-out'
            }`}
            style={{
              transform: `scale(${profileTransform?.scale || 1}) translate(${profileTransform?.x || 0}px, ${profileTransform?.y || 0}px)`,
            }}
          />
          {/* Action buttons - Appears on hover */}
          <div className='absolute inset-0 bg-black/60 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-auto'>
            <button
              type='button'
              onClick={handleFaceEnhance}
              disabled={isEnhancingProfile}
              className='bg-gradient-to-br from-pink-600 to-pink-700 hover:from-pink-500 hover:to-pink-600 disabled:from-pink-800 disabled:to-pink-800 text-white font-bold py-2 px-4 rounded-xl transition flex items-center justify-center gap-2 text-xs shadow-lg'
              title='Enhance face quality with AI'
            >
              {isEnhancingProfile ? (
                <>
                  <span className='material-icons text-sm animate-spin'>refresh</span>
                  Enhancing...
                </>
              ) : (
                <>
                  <span className='material-icons text-sm'>face</span>
                  Face Enhance
                </>
              )}
            </button>

            <button
              type='button'
              onClick={handleRemoveBg}
              disabled={isRemovingBgProfile}
              className='bg-gradient-to-br from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 disabled:from-indigo-800 disabled:to-indigo-800 text-white font-bold py-2 px-4 rounded-xl transition flex items-center justify-center gap-2 text-xs shadow-lg'
              title='Remove Background'
            >
              {isRemovingBgProfile ? (
                <span className='material-icons text-sm animate-spin'>refresh</span>
              ) : (
                <span className='material-icons text-sm'>branding_watermark</span>
              )}
            </button>
          </div>
        </div>
      ) : (
        <div className='w-full h-full flex flex-col items-center justify-center text-slate-400 font-bold text-center leading-tight select-none'>
          <span className='material-icons text-3xl block md:text-4xl lg:text-5xl mb-1'>
            {profileOverlayConfig.interactive ? 'add_photo_alternate' : 'person'}
          </span>
          <span className='text-[8px] md:text-[10px] lg:text-sm whitespace-nowrap px-2'>
            {profileOverlayConfig.label}
          </span>
          {profileOverlayConfig.interactive ? (
            <span className='mt-1 text-[8px] text-slate-500'>Click to upload</span>
          ) : (
            <div className='mt-2 text-[10px] text-slate-300 opacity-60'>
              Ctrl+Scroll to Zoom
              <br />
              Drag to Move
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default ProfileOverlay;
