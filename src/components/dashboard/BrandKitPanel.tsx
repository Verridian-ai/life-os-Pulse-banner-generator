/**
 * BrandKitPanel - Manage brand profiles from Dashboard
 *
 * Signal Design System: Glass cards with brand colors
 * Features: View/create brand profiles, set active brand, improved loading states
 */

import { useState, useEffect, useRef } from 'react';
import {
  Plus,
  Check,
  Trash2,
  Upload,
  Palette,
  MoreVertical,
  Sparkles,
  ArrowRight,
  Type,
  Droplets,
} from 'lucide-react';
import type { BrandProfile } from '../../types/database';
import {
  getUserBrandProfiles,
  getActiveBrandProfile,
  setActiveBrandProfile,
  deleteBrandProfile,
} from '../../services/database';
import { useToast } from '../../hooks/useToast';
import { useAuth } from '../../context/AuthContext';

interface BrandKitPanelProps {
  onCreateBrand: () => void;
  className?: string;
}

function BrandCardSkeleton() {
  return (
    <div className='bg-zinc-900/80 border border-white/5 rounded-2xl p-6 overflow-hidden'>
      <div className='h-6 bg-zinc-800/50 rounded-lg w-1/2 mb-5' />
      <div className='flex gap-2 mb-5'>
        {[1, 2, 3, 4].map((j) => (
          <div
            key={j}
            className={`w-9 h-9 bg-zinc-800/50 rounded-full animate-pulse ${j === 1 ? 'delay-100' : j === 2 ? 'delay-200' : j === 3 ? 'delay-300' : j === 4 ? 'delay-[400ms]' : ''}`}
          />
        ))}
      </div>
      <div className='space-y-2'>
        <div className='h-4 bg-zinc-800/30 rounded-lg w-3/4' />
        <div className='h-4 bg-zinc-800/30 rounded-lg w-1/2' />
      </div>
      <div className='h-10 bg-zinc-800/30 rounded-xl w-full mt-5' />
    </div>
  );
}

export function BrandKitPanel({ onCreateBrand, className = '' }: BrandKitPanelProps) {
  const [brandProfiles, setBrandProfiles] = useState<BrandProfile[]>([]);
  const [activeBrandId, setActiveBrandId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [settingActive, setSettingActive] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const toast = useToast();
  const { isAuthenticated } = useAuth();

  // Close menu on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpenId(null);
      }
    };
    if (menuOpenId) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [menuOpenId]);

  useEffect(() => {
    async function loadBrands() {
      if (!isAuthenticated) {
        setIsLoading(false);
        return;
      }

      try {
        const [profiles, active] = await Promise.all([
          getUserBrandProfiles(),
          getActiveBrandProfile(),
        ]);
        setBrandProfiles(profiles);
        setActiveBrandId(active?.id || null);
      } catch (error) {
        console.error('Failed to load brand profiles:', error);
      } finally {
        setIsLoading(false);
      }
    }

    loadBrands();
  }, [isAuthenticated]);

  const handleSetActive = async (profileId: string) => {
    setSettingActive(profileId);
    try {
      await setActiveBrandProfile(profileId);
      setActiveBrandId(profileId);
      toast.info('Brand profile activated');
    } catch (error) {
      console.error('Failed to set active brand:', error);
      toast.error('Failed to activate brand');
    } finally {
      setSettingActive(null);
    }
  };

  const handleDelete = async (profileId: string) => {
    try {
      await deleteBrandProfile(profileId);
      setBrandProfiles((prev) => prev.filter((p) => p.id !== profileId));
      if (activeBrandId === profileId) {
        setActiveBrandId(null);
      }
      toast.info('Brand profile deleted');
    } catch (error) {
      console.error('Failed to delete brand:', error);
      toast.error('Failed to delete brand');
    }
    setMenuOpenId(null);
  };

  if (isLoading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className='flex flex-col md:flex-row md:items-end justify-between gap-4'>
          <div>
            <div className='flex items-center gap-3 mb-2'>
              <div className='w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500/20 to-teal-500/20 flex items-center justify-center'>
                <Palette className='w-5 h-5 text-sky-400' />
              </div>
              <h1 className='text-2xl font-bold text-white'>Brand Kit</h1>
            </div>
            <p className='text-zinc-400 text-sm'>Loading your brand profiles...</p>
          </div>
          <div className='h-11 w-32 bg-zinc-800/50 rounded-xl animate-pulse' />
        </div>
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5'>
          {[1, 2, 3].map((i) => (
            <BrandCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className='flex flex-col md:flex-row md:items-end justify-between gap-4'>
        <div>
          <div className='flex items-center gap-3 mb-2'>
            <div className='w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500/20 to-teal-500/20 flex items-center justify-center'>
              <Palette className='w-5 h-5 text-sky-400' />
            </div>
            <h1 className='text-2xl font-bold text-white'>Brand Kit</h1>
          </div>
          <p className='text-zinc-400 text-sm'>
            Manage your brand colors, fonts, and visual identity
          </p>
        </div>
        <button
          onClick={onCreateBrand}
          type='button'
          className='group flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-sky-500 to-teal-500 text-white rounded-xl font-bold text-sm hover:brightness-110 hover:shadow-lg hover:shadow-sky-900/30 transition-all focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:ring-offset-2 focus:ring-offset-zinc-950'
        >
          <Plus className='w-4 h-4' />
          New Brand
          <ArrowRight className='w-4 h-4 opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all duration-300' />
        </button>
      </div>

      {/* Brand Profiles Grid */}
      {brandProfiles.length > 0 ? (
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5'>
          {brandProfiles.map((profile) => {
            const isActive = profile.id === activeBrandId;
            const isSettingActive = settingActive === profile.id;
            return (
              <div
                key={profile.id}
                className={`group relative bg-zinc-900/80 backdrop-blur-sm border rounded-2xl p-6 transition-all duration-300 hover:-translate-y-0.5 ${
                  isActive
                    ? 'border-sky-500/50 ring-2 ring-sky-500/20 shadow-lg shadow-sky-900/10'
                    : 'border-white/10 hover:border-white/20 hover:shadow-lg hover:shadow-black/20'
                }`}
              >
                {/* Active Badge */}
                {isActive && (
                  <div className='absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1.5 bg-sky-500/20 rounded-full'>
                    <Check className='w-3.5 h-3.5 text-sky-400' />
                    <span className='text-[10px] font-bold text-sky-400 uppercase tracking-wide'>
                      Active
                    </span>
                  </div>
                )}

                {/* Menu */}
                <div
                  className='absolute top-4 right-4'
                  ref={menuOpenId === profile.id ? menuRef : undefined}
                >
                  {!isActive && (
                    <div className='relative'>
                      <button
                        type='button'
                        onClick={() => setMenuOpenId(menuOpenId === profile.id ? null : profile.id)}
                        className='p-2 rounded-lg hover:bg-white/10 text-zinc-500 hover:text-white transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100'
                        aria-label='More options'
                      >
                        <MoreVertical className='w-4 h-4' />
                      </button>
                      {menuOpenId === profile.id && (
                        <div className='absolute right-0 top-full mt-1 w-40 bg-zinc-900/98 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200'>
                          <button
                            type='button'
                            onClick={() => {
                              handleSetActive(profile.id);
                              setMenuOpenId(null);
                            }}
                            className='w-full flex items-center gap-3 px-4 py-2.5 text-sm text-zinc-400 hover:text-white hover:bg-white/5 transition-colors'
                          >
                            <Check className='w-4 h-4' />
                            Set Active
                          </button>
                          <button
                            type='button'
                            onClick={() => handleDelete(profile.id)}
                            className='w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors'
                          >
                            <Trash2 className='w-4 h-4' />
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Brand Name */}
                <h3 className='font-bold text-white text-lg mb-5 pr-16 group-hover:text-sky-100 transition-colors'>
                  {profile.name}
                </h3>

                {/* Colors */}
                <div className='flex gap-2 mb-5'>
                  {profile.colors?.slice(0, 5).map((color, i) => (
                    <div
                      key={i}
                      className='w-9 h-9 rounded-full border-2 border-zinc-800 shadow-lg ring-1 ring-white/10 transition-transform hover:scale-110 cursor-pointer'
                      style={{ backgroundColor: color.hex }}
                      title={`${color.name} (${color.usage})`}
                    />
                  ))}
                  {(profile.colors?.length || 0) > 5 && (
                    <div className='w-9 h-9 rounded-full bg-zinc-800/80 border-2 border-zinc-700 flex items-center justify-center'>
                      <span className='text-[10px] text-zinc-400 font-medium'>
                        +{profile.colors!.length - 5}
                      </span>
                    </div>
                  )}
                  {(!profile.colors || profile.colors.length === 0) && (
                    <div className='flex items-center gap-2 text-zinc-500 text-xs'>
                      <Droplets className='w-4 h-4' />
                      <span>No colors defined</span>
                    </div>
                  )}
                </div>

                {/* Meta - Industry & Fonts */}
                <div className='flex flex-wrap items-center gap-2 text-xs'>
                  {profile.industry && (
                    <span className='px-2.5 py-1 bg-white/5 rounded-lg text-zinc-400 font-medium'>
                      {profile.industry}
                    </span>
                  )}
                  {profile.fonts && profile.fonts.length > 0 && (
                    <span className='flex items-center gap-1.5 px-2.5 py-1 bg-white/5 rounded-lg text-zinc-400 font-medium'>
                      <Type className='w-3 h-3' />
                      {profile.fonts[0].name}
                    </span>
                  )}
                </div>

                {/* Set Active Button (if not active) */}
                {!isActive && (
                  <button
                    type='button'
                    onClick={() => handleSetActive(profile.id)}
                    disabled={isSettingActive}
                    className='mt-5 w-full py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-xl text-sm font-medium text-zinc-300 hover:text-white transition-all disabled:opacity-50 disabled:cursor-wait flex items-center justify-center gap-2'
                  >
                    {isSettingActive ? (
                      <>
                        <span className='w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin' />
                        Activating...
                      </>
                    ) : (
                      'Use This Brand'
                    )}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className='bg-gradient-to-br from-zinc-900/80 to-zinc-900/40 backdrop-blur-sm border border-white/5 rounded-2xl p-10 text-center relative overflow-hidden'>
          {/* Decorative background elements */}
          <div className='absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-sky-500/5 to-teal-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2' />
          <div className='absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-sky-500/5 to-teal-500/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2' />

          <div className='relative z-10'>
            <div className='w-20 h-20 rounded-2xl bg-gradient-to-br from-sky-500/20 to-teal-500/20 flex items-center justify-center mx-auto mb-5 shadow-xl shadow-sky-900/10'>
              <Sparkles className='w-10 h-10 text-sky-400' />
            </div>
            <h3 className='text-xl font-bold text-white mb-2'>No Brand Profiles Yet</h3>
            <p className='text-sm text-zinc-400 mb-8 max-w-md mx-auto leading-relaxed'>
              Create a brand profile to maintain consistent colors, fonts, and style across all your
              designs.
            </p>
            <button
              type='button'
              onClick={onCreateBrand}
              className='group inline-flex items-center gap-2 px-7 py-3.5 bg-gradient-to-r from-sky-500 to-teal-500 text-white rounded-xl font-bold text-sm hover:brightness-110 hover:shadow-xl hover:shadow-sky-900/30 transition-all focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:ring-offset-2 focus:ring-offset-zinc-950'
            >
              <Plus className='w-5 h-5' />
              Create Your First Brand
              <ArrowRight className='w-4 h-4 opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all duration-300' />
            </button>
          </div>
        </div>
      )}

      {/* Tips Section */}
      {brandProfiles.length > 0 && (
        <div className='bg-gradient-to-r from-sky-500/10 to-teal-500/10 border border-sky-500/20 rounded-2xl p-6 relative overflow-hidden'>
          {/* Subtle glow */}
          <div className='absolute top-0 right-0 w-32 h-32 bg-sky-500/10 rounded-full blur-3xl' />

          <div className='flex items-start gap-4 relative z-10'>
            <div className='w-12 h-12 rounded-xl bg-sky-500/20 flex items-center justify-center shrink-0'>
              <Upload className='w-6 h-6 text-sky-400' />
            </div>
            <div>
              <h4 className='font-bold text-white mb-1.5'>Pro Tip: Extract Brand from Images</h4>
              <p className='text-sm text-zinc-400 leading-relaxed'>
                Upload reference images in the Studio and use AI to automatically extract your brand
                colors and style.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default BrandKitPanel;
