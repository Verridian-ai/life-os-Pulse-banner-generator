import React, { useState } from 'react';

// Types for dashboard components
export type PlatformId = 'linkedin' | 'youtube' | 'instagram' | 'facebook' | 'tiktok' | 'x';

export interface Platform {
  id: PlatformId;
  name: string;
  description: string;
}

export interface Design {
  id: string;
  title: string;
  platform: PlatformId;
  updatedAt: string;
  thumbnailUrl?: string;
}

// Neumorphic + Glass Design System utilities
const glassStyles = {
  card: 'bg-white/5 backdrop-blur-xl border border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]',
  cardHover: 'hover:bg-white/10 hover:border-white/20 hover:shadow-[0_8px_32px_rgba(0,0,0,0.3),inset_0_1px_1px_rgba(255,255,255,0.15)]',
  neumorphicInset: 'shadow-[inset_2px_2px_4px_rgba(0,0,0,0.3),inset_-2px_-2px_4px_rgba(255,255,255,0.05)]',
  neumorphicRaised: 'shadow-[4px_4px_8px_rgba(0,0,0,0.4),-4px_-4px_8px_rgba(255,255,255,0.05)]',
  glow: 'shadow-[0_0_30px_rgba(56,189,248,0.3)]',
};

// Platform brand colors and 3D gradient effects
const platformBranding = {
  linkedin: {
    gradient: 'from-blue-600 via-blue-500 to-cyan-400',
    glow: 'shadow-[0_0_40px_rgba(59,130,246,0.4)]',
    accent: 'sky-500',
    bgGradient: 'bg-gradient-to-br from-blue-600/30 via-blue-500/20 to-cyan-400/10',
    icon3D: 'drop-shadow-[0_0_10px_rgba(59,130,246,0.8)]',
  },
  youtube: {
    gradient: 'from-red-600 via-red-500 to-rose-400',
    glow: 'shadow-[0_0_40px_rgba(239,68,68,0.4)]',
    accent: 'red-500',
    bgGradient: 'bg-gradient-to-br from-red-600/30 via-red-500/20 to-rose-400/10',
    icon3D: 'drop-shadow-[0_0_10px_rgba(239,68,68,0.8)]',
  },
  instagram: {
    gradient: 'from-purple-600 via-pink-500 to-orange-400',
    glow: 'shadow-[0_0_40px_rgba(168,85,247,0.4)]',
    accent: 'pink-500',
    bgGradient: 'bg-gradient-to-br from-purple-600/30 via-pink-500/20 to-orange-400/10',
    icon3D: 'drop-shadow-[0_0_10px_rgba(236,72,153,0.8)]',
  },
  facebook: {
    gradient: 'from-blue-700 via-blue-600 to-indigo-500',
    glow: 'shadow-[0_0_40px_rgba(37,99,235,0.4)]',
    accent: 'blue-600',
    bgGradient: 'bg-gradient-to-br from-blue-700/30 via-blue-600/20 to-indigo-500/10',
    icon3D: 'drop-shadow-[0_0_10px_rgba(37,99,235,0.8)]',
  },
  tiktok: {
    gradient: 'from-cyan-400 via-pink-500 to-black',
    glow: 'shadow-[0_0_40px_rgba(236,72,153,0.4)]',
    accent: 'cyan-400',
    bgGradient: 'bg-gradient-to-br from-cyan-400/30 via-pink-500/20 to-zinc-900/10',
    icon3D: 'drop-shadow-[0_0_10px_rgba(34,211,238,0.8)]',
  },
  x: {
    gradient: 'from-zinc-600 via-zinc-500 to-zinc-400',
    glow: 'shadow-[0_0_40px_rgba(161,161,170,0.3)]',
    accent: 'zinc-400',
    bgGradient: 'bg-gradient-to-br from-zinc-600/30 via-zinc-500/20 to-zinc-400/10',
    icon3D: 'drop-shadow-[0_0_10px_rgba(161,161,170,0.8)]',
  },
};

// 3D Platform Icons with depth effects
function Platform3DIcon({ platformId, className = '' }: { platformId: string; className?: string }) {
  const branding = platformBranding[platformId as keyof typeof platformBranding] || platformBranding.linkedin;

  const icons: Record<string, React.ReactNode> = {
    linkedin: (
      <div className={`relative ${className}`}>
        {/* 3D Shadow Layer */}
        <div className="absolute inset-0 transform translate-x-1 translate-y-1 opacity-30 blur-sm">
          <svg className="w-full h-full" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
          </svg>
        </div>
        {/* Main Icon with Gradient */}
        <svg className={`w-full h-full relative ${branding.icon3D}`} viewBox="0 0 24 24">
          <defs>
            <linearGradient id={`linkedin-gradient`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0A66C2" />
              <stop offset="50%" stopColor="#0077B5" />
              <stop offset="100%" stopColor="#00A0DC" />
            </linearGradient>
          </defs>
          <path fill="url(#linkedin-gradient)" d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
        </svg>
      </div>
    ),
    youtube: (
      <div className={`relative ${className}`}>
        <div className="absolute inset-0 transform translate-x-1 translate-y-1 opacity-30 blur-sm">
          <svg className="w-full h-full" viewBox="0 0 24 24" fill="currentColor">
            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
          </svg>
        </div>
        <svg className={`w-full h-full relative ${branding.icon3D}`} viewBox="0 0 24 24">
          <defs>
            <linearGradient id="youtube-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FF0000" />
              <stop offset="50%" stopColor="#FF4444" />
              <stop offset="100%" stopColor="#FF6B6B" />
            </linearGradient>
          </defs>
          <path fill="url(#youtube-gradient)" d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
        </svg>
      </div>
    ),
    instagram: (
      <div className={`relative ${className}`}>
        <div className="absolute inset-0 transform translate-x-1 translate-y-1 opacity-30 blur-sm">
          <svg className="w-full h-full" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
          </svg>
        </div>
        <svg className={`w-full h-full relative ${branding.icon3D}`} viewBox="0 0 24 24">
          <defs>
            <linearGradient id="instagram-gradient" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#FFDC80" />
              <stop offset="25%" stopColor="#F77737" />
              <stop offset="50%" stopColor="#E1306C" />
              <stop offset="75%" stopColor="#C13584" />
              <stop offset="100%" stopColor="#833AB4" />
            </linearGradient>
          </defs>
          <path fill="url(#instagram-gradient)" d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
        </svg>
      </div>
    ),
    facebook: (
      <div className={`relative ${className}`}>
        <div className="absolute inset-0 transform translate-x-1 translate-y-1 opacity-30 blur-sm">
          <svg className="w-full h-full" viewBox="0 0 24 24" fill="currentColor">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
          </svg>
        </div>
        <svg className={`w-full h-full relative ${branding.icon3D}`} viewBox="0 0 24 24">
          <defs>
            <linearGradient id="facebook-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1877F2" />
              <stop offset="50%" stopColor="#2196F3" />
              <stop offset="100%" stopColor="#42A5F5" />
            </linearGradient>
          </defs>
          <path fill="url(#facebook-gradient)" d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
      </div>
    ),
    tiktok: (
      <div className={`relative ${className}`}>
        <div className="absolute inset-0 transform translate-x-1 translate-y-1 opacity-30 blur-sm">
          <svg className="w-full h-full" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
          </svg>
        </div>
        <svg className={`w-full h-full relative ${branding.icon3D}`} viewBox="0 0 24 24">
          <defs>
            <linearGradient id="tiktok-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#00F2EA" />
              <stop offset="50%" stopColor="#FF0050" />
              <stop offset="100%" stopColor="#000000" />
            </linearGradient>
          </defs>
          <path fill="url(#tiktok-gradient)" d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
        </svg>
      </div>
    ),
    x: (
      <div className={`relative ${className}`}>
        <div className="absolute inset-0 transform translate-x-1 translate-y-1 opacity-30 blur-sm">
          <svg className="w-full h-full" viewBox="0 0 24 24" fill="currentColor">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
          </svg>
        </div>
        <svg className={`w-full h-full relative ${branding.icon3D}`} viewBox="0 0 24 24">
          <defs>
            <linearGradient id="x-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="50%" stopColor="#A3A3A3" />
              <stop offset="100%" stopColor="#525252" />
            </linearGradient>
          </defs>
          <path fill="url(#x-gradient)" d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
        </svg>
      </div>
    ),
  };

  return icons[platformId] || icons.linkedin;
}

// Live indicator pulse animation
function LiveIndicator({ isLive = true }: { isLive?: boolean }) {
  if (!isLive) return null;
  return (
    <div className="flex items-center gap-1.5">
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
      </span>
      <span className="text-[10px] font-medium text-green-400 uppercase tracking-wider">Live</span>
    </div>
  );
}

// Platform Card with Neumorphic + Glass styling and 3D image
export function PlatformCard({ platform, onClick }: { platform: Platform; onClick: (id: string) => void }) {
  const [isHovered, setIsHovered] = useState(false);
  const branding = platformBranding[platform.id as keyof typeof platformBranding] || platformBranding.linkedin;

  return (
    <button
      onClick={() => onClick(platform.id)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`
        relative group rounded-2xl sm:rounded-3xl aspect-[4/5] overflow-hidden
        ${glassStyles.card}
        ${isHovered ? branding.glow : ''}
        transition-all duration-500 ease-out
        hover:scale-[1.02] hover:-translate-y-1
        focus:outline-none focus:ring-2 focus:ring-white/20
      `}
    >
      {/* Background gradient layer */}
      <div className={`
        absolute inset-0 ${branding.bgGradient}
        opacity-60 group-hover:opacity-100 transition-opacity duration-500
      `} />

      {/* Animated gradient orbs */}
      <div className="absolute inset-0 overflow-hidden">
        <div className={`
          absolute -top-1/2 -left-1/2 w-full h-full
          bg-gradient-to-br ${branding.gradient}
          rounded-full blur-3xl opacity-20
          group-hover:opacity-40 transition-opacity duration-700
          animate-pulse
        `} />
        <div className={`
          absolute -bottom-1/2 -right-1/2 w-full h-full
          bg-gradient-to-br ${branding.gradient}
          rounded-full blur-3xl opacity-10
          group-hover:opacity-30 transition-opacity duration-700
          animate-pulse delay-500
        `} />
      </div>

      {/* Glass inner border effect */}
      <div className="absolute inset-[1px] rounded-2xl sm:rounded-3xl border border-white/5 pointer-events-none" />

      {/* Content */}
      <div className="relative h-full flex flex-col items-center justify-center p-3 sm:p-4 z-10">
        {/* 3D Icon - responsive sizing based on card width */}
        <div className={`
          w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 lg:w-12 lg:h-12 xl:w-14 xl:h-14 2xl:w-16 2xl:h-16
          mb-2 sm:mb-3 md:mb-4
          transform transition-all duration-500
          ${isHovered ? 'scale-110 -translate-y-2' : ''}
        `}>
          <Platform3DIcon platformId={platform.id} className="w-full h-full" />
        </div>

        {/* Platform name with glass pill */}
        <div className={`
          px-2 py-1 sm:px-3 sm:py-1.5 md:px-4 md:py-2 rounded-full
          bg-white/10 backdrop-blur-md
          border border-white/20
          ${glassStyles.neumorphicInset}
          transform transition-all duration-300
          ${isHovered ? 'bg-white/20' : ''}
        `}>
          <span className="text-[10px] sm:text-xs md:text-sm font-semibold text-white tracking-wide whitespace-nowrap">
            {platform.name}
          </span>
        </div>

        {/* Description on hover */}
        <p className={`
          mt-2 sm:mt-3 text-[10px] sm:text-xs text-white/60 text-center px-1
          transform transition-all duration-300 line-clamp-2
          ${isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}
        `}>
          {platform.description}
        </p>

        {/* Live features indicator */}
        <div className={`
          absolute top-2 right-2 sm:top-3 sm:right-3
          transform transition-all duration-300 scale-75 sm:scale-100
          ${isHovered ? 'opacity-100 scale-75 sm:scale-100' : 'opacity-0 scale-50 sm:scale-90'}
        `}>
          <LiveIndicator />
        </div>

        {/* Arrow indicator */}
        <div className={`
          absolute bottom-2 right-2 sm:bottom-3 sm:right-3 md:bottom-4 md:right-4
          w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 rounded-full
          bg-white/10 backdrop-blur-sm
          flex items-center justify-center
          transform transition-all duration-300
          ${isHovered ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2'}
        `}>
          <svg className="w-3 h-3 sm:w-4 sm:h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </button>
  );
}

// Recent Design Card with Neumorphic + Glass styling
export function RecentDesignCard({
  design,
  onClick,
  onDelete,
  onDuplicate
}: {
  design: Design;
  onClick: (id: string) => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void
}) {
  const [showMenu, setShowMenu] = useState(false);
  const branding = platformBranding[design.platform as keyof typeof platformBranding] || platformBranding.linkedin;

  return (
    <div className={`
      ${glassStyles.card} rounded-2xl overflow-hidden group
      ${glassStyles.cardHover}
      transition-all duration-300
    `}>
      {/* Thumbnail area */}
      <div className="aspect-video relative overflow-hidden">
        {/* Gradient background if no thumbnail */}
        <div className={`absolute inset-0 ${branding.bgGradient} opacity-50`} />

        {/* Glass overlay pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent" />

        {/* Neumorphic inset effect */}
        <div className={`absolute inset-2 rounded-lg ${glassStyles.neumorphicInset} bg-black/20`} />

        {/* Platform badge */}
        <div className="absolute top-3 left-3 z-10">
          <div className={`
            w-8 h-8 rounded-lg
            bg-white/10 backdrop-blur-md
            border border-white/20
            flex items-center justify-center
            ${glassStyles.neumorphicRaised}
          `}>
            <Platform3DIcon platformId={design.platform} className="w-5 h-5" />
          </div>
        </div>

        {/* Hover overlay */}
        <div className={`
          absolute inset-0 bg-black/60 backdrop-blur-sm
          flex items-center justify-center gap-3
          opacity-0 group-hover:opacity-100 transition-all duration-300
        `}>
          <button
            onClick={() => onClick(design.id)}
            className={`
              px-4 py-2 rounded-xl
              bg-white/20 backdrop-blur-md border border-white/30
              text-white text-sm font-medium
              hover:bg-white/30 transition-colors
              ${glassStyles.neumorphicRaised}
            `}
          >
            Open
          </button>
          <button
            onClick={() => onDuplicate(design.id)}
            className={`
              w-10 h-10 rounded-xl
              bg-white/10 backdrop-blur-md border border-white/20
              flex items-center justify-center text-white
              hover:bg-white/20 transition-colors
            `}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Info section */}
      <div className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-medium text-white truncate">{design.title}</h3>
            <p className="text-xs text-zinc-500 mt-0.5">{design.updatedAt}</p>
          </div>

          {/* Menu button */}
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className={`
                w-8 h-8 rounded-lg
                bg-white/5 hover:bg-white/10
                flex items-center justify-center
                transition-colors
              `}
            >
              <svg className="w-4 h-4 text-zinc-400" fill="currentColor" viewBox="0 0 24 24">
                <circle cx="12" cy="6" r="2" />
                <circle cx="12" cy="12" r="2" />
                <circle cx="12" cy="18" r="2" />
              </svg>
            </button>

            {/* Dropdown menu */}
            {showMenu && (
              <div className={`
                absolute right-0 top-full mt-1 z-20
                w-32 py-1 rounded-xl
                ${glassStyles.card}
                border border-white/10
              `}>
                <button
                  onClick={() => { onDuplicate(design.id); setShowMenu(false); }}
                  className="w-full px-3 py-2 text-left text-sm text-white hover:bg-white/10 transition-colors"
                >
                  Duplicate
                </button>
                <button
                  onClick={() => { onDelete(design.id); setShowMenu(false); }}
                  className="w-full px-3 py-2 text-left text-sm text-red-400 hover:bg-white/10 transition-colors"
                >
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Empty State with Neumorphic + Glass styling
export function EmptyState({
  title,
  description,
  actionLabel,
  onAction
}: {
  title: string;
  description: string;
  actionLabel: string;
  onAction: () => void
}) {
  return (
    <div className={`
      ${glassStyles.card} rounded-3xl p-12
      text-center
    `}>
      {/* Decorative icon */}
      <div className={`
        w-20 h-20 mx-auto mb-6 rounded-2xl
        bg-gradient-to-br from-sky-500/20 to-teal-500/20
        ${glassStyles.neumorphicInset}
        flex items-center justify-center
      `}>
        <svg className="w-10 h-10 text-sky-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      </div>

      <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
      <p className="text-zinc-400 mb-6 max-w-sm mx-auto">{description}</p>

      <button
        onClick={onAction}
        className={`
          px-8 py-3 rounded-2xl
          bg-gradient-to-r from-sky-500 to-teal-500
          text-white font-medium
          shadow-lg shadow-sky-500/25
          hover:shadow-xl hover:shadow-sky-500/30
          hover:-translate-y-0.5
          transition-all duration-300
        `}
      >
        {actionLabel}
      </button>
    </div>
  );
}

// Live Features Section Component
export function LiveFeaturesSection() {
  const features = [
    { id: 1, name: 'AI Generation', status: 'active', users: 847 },
    { id: 2, name: 'Real-time Collaboration', status: 'active', users: 234 },
    { id: 3, name: 'Auto-scheduling', status: 'active', users: 156 },
    { id: 4, name: 'Analytics Sync', status: 'syncing', users: 523 },
  ];

  return (
    <div className={`${glassStyles.card} rounded-2xl p-4`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-white">Live Features</h3>
        <LiveIndicator />
      </div>
      <div className="space-y-2">
        {features.map((feature) => (
          <div
            key={feature.id}
            className={`
              flex items-center justify-between p-3 rounded-xl
              bg-white/5 border border-white/5
              hover:bg-white/10 transition-colors
            `}
          >
            <div className="flex items-center gap-3">
              <div className={`
                w-2 h-2 rounded-full
                ${feature.status === 'active' ? 'bg-green-500' : 'bg-yellow-500 animate-pulse'}
              `} />
              <span className="text-sm text-white">{feature.name}</span>
            </div>
            <span className="text-xs text-zinc-500">{feature.users} users</span>
          </div>
        ))}
      </div>
    </div>
  );
}
