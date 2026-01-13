/**
 * PlatformCard - Social platform entry card
 *
 * Signal Design System: Glass effect with platform-specific accent colors
 * Features: Hover animation, platform icon, description, loading state
 */

import React, { useState } from 'react';
import {
  Linkedin,
  Youtube,
  Instagram,
  Facebook,
  Twitter,
  Music2,
} from 'lucide-react';

export type PlatformType = 'linkedin' | 'youtube' | 'instagram' | 'facebook' | 'tiktok' | 'x';

interface PlatformCardProps {
  platform: PlatformType;
  onClick: () => void;
  className?: string;
  isLoading?: boolean;
}

const platformConfig: Record<PlatformType, {
  name: string;
  description: string;
  icon: React.ElementType;
  color: string;
  iconColor: string;
  bgGradient: string;
  hoverGlow: string;
  borderColor: string;
  image: string;
}> = {
  linkedin: {
    name: 'LinkedIn',
    description: 'Professional',
    icon: Linkedin,
    color: '#0077b5',
    iconColor: 'text-[#0077b5]',
    bgGradient: 'bg-[#0077b5]/20',
    hoverGlow: 'shadow-[#0077b5]/40',
    borderColor: 'border-[#0077b5]/30 hover:border-[#0077b5]/60',
    image: '/assets/platforms/linkedin_3d.png',
  },
  youtube: {
    name: 'YouTube',
    description: 'Video & Shorts',
    icon: Youtube,
    color: '#ef4444',
    iconColor: 'text-red-500',
    bgGradient: 'bg-red-500/20',
    hoverGlow: 'shadow-red-500/40',
    borderColor: 'border-red-500/30 hover:border-red-500/60',
    image: '/assets/platforms/youtube_3d.png',
  },
  instagram: {
    name: 'Instagram',
    description: 'Social Feed',
    icon: Instagram,
    color: '#ec4899',
    iconColor: 'text-pink-500',
    bgGradient: 'bg-pink-500/20',
    hoverGlow: 'shadow-pink-500/40',
    borderColor: 'border-pink-500/30 hover:border-pink-500/60',
    image: '/assets/platforms/instagram_3d.png',
  },
  facebook: {
    name: 'Facebook',
    description: 'Community',
    icon: Facebook,
    color: '#3b82f6',
    iconColor: 'text-blue-500',
    bgGradient: 'bg-blue-500/20',
    hoverGlow: 'shadow-blue-500/40',
    borderColor: 'border-blue-500/30 hover:border-blue-500/60',
    image: '/assets/platforms/facebook_3d.png',
  },
  tiktok: {
    name: 'TikTok',
    description: 'Viral Short',
    icon: Music2,
    color: '#00f2ea',
    iconColor: 'text-[#00f2ea]',
    bgGradient: 'bg-[#00f2ea]/20',
    hoverGlow: 'shadow-[#00f2ea]/40',
    borderColor: 'border-white/20 hover:border-[#00f2ea]/60',
    image: '/assets/platforms/tiktok_3d.png',
  },
  x: {
    name: 'X',
    description: 'Threads',
    icon: Twitter,
    color: '#ffffff',
    iconColor: 'text-white',
    bgGradient: 'bg-white/15',
    hoverGlow: 'shadow-white/30',
    borderColor: 'border-white/20 hover:border-white/50',
    image: '/assets/platforms/x_3d.png',
  },
};

export function PlatformCard({ platform, onClick, className = '', isLoading = false }: PlatformCardProps) {
  const config = platformConfig[platform];
  const Icon = config.icon;
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  if (isLoading) {
    return (
      <div className={`aspect-[4/5] bg-zinc-900 border border-white/10 rounded-2xl overflow-hidden animate-pulse ${className}`}>
        <div className="w-full h-full bg-gradient-to-b from-zinc-800 to-zinc-900" />
      </div>
    );
  }

  return (
    <button
      onClick={onClick}
      type="button"
      className={`aspect-[4/5] bg-zinc-900 border ${config.borderColor} rounded-2xl p-4 flex flex-col items-start justify-end group transition-all duration-300 relative overflow-hidden hover:-translate-y-2 hover:shadow-2xl ${config.hoverGlow} focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:ring-offset-2 focus:ring-offset-zinc-950 ${className}`}
    >
      {/* Background gradient overlay - stronger gradient for better text contrast */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black/95 z-[1]" />

      {/* Shimmer effect on hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 z-[2] pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
      </div>

      {/* 3D Platform Image - Full Cover */}
      {!imageError && (
        <img
          src={config.image}
          alt={`${config.name} logo - 3D illustration`}
          onLoad={() => setImageLoaded(true)}
          onError={() => setImageError(true)}
          className={`absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-all duration-500 ease-out ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
        />
      )}

      {/* Fallback gradient background when image fails */}
      {(imageError || !imageLoaded) && (
        <div
          className="absolute inset-0 bg-gradient-to-br from-zinc-800 to-zinc-900"
          style={{
            background: `linear-gradient(135deg, ${config.color}15 0%, ${config.color}05 50%, transparent 100%)`
          }}
        />
      )}

      {/* Glow effect on hover - more vibrant */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-40 transition-opacity duration-500 blur-3xl z-0"
        style={{ backgroundColor: config.color }}
      />

      {/* Content */}
      <div className="relative z-10 w-full">
        {/* Icon badge - improved design */}
        <div className={`w-11 h-11 rounded-xl ${config.bgGradient} backdrop-blur-xl border border-white/20 flex items-center justify-center mb-3 shadow-xl group-hover:scale-110 group-hover:shadow-2xl transition-all duration-300`}>
          <Icon className={`w-5 h-5 ${config.iconColor}`} />
        </div>

        {/* Text - improved spacing and styling */}
        <div className="space-y-0.5">
          <span className="text-sm font-bold text-white block drop-shadow-lg tracking-tight">{config.name}</span>
          <span className="text-[11px] text-zinc-400 font-medium tracking-wide">{config.description}</span>
        </div>

        {/* Subtle arrow indicator on hover */}
        <div className="absolute right-0 bottom-0 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
          <div className="w-8 h-8 rounded-full bg-white/10 backdrop-blur flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </div>
    </button>
  );
}

export default PlatformCard;
