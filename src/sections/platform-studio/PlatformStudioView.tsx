import React, { useState } from 'react';
import { StudioHeader, CanvasView, GenerativeSidebar, VoiceAgentButton } from './components';

// Sample formats for LinkedIn
const linkedinFormats = [
  { id: 'banner', name: 'Banner', width: 1584, height: 396 },
  { id: 'profile', name: 'Profile Picture', width: 800, height: 800 },
  { id: 'post', name: 'Post Image', width: 1200, height: 627 },
  { id: 'article', name: 'Article Cover', width: 1280, height: 720 },
];

interface PlatformStudioViewProps {
  platform?: string;
}

export function PlatformStudioView({ platform = 'linkedin' }: PlatformStudioViewProps) {
  const [activeTab, setActiveTab] = useState<'canvas' | 'templates' | 'media'>('canvas');
  const [selectedFormat, setSelectedFormat] = useState(linkedinFormats[0]);
  const [zoom, setZoom] = useState(1);
  const [showSafeZones, setShowSafeZones] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = (_prompt: string) => {
    setIsGenerating(true);
    // Simulate generation
    setTimeout(() => {
      setIsGenerating(false);
    }, 3000);
  };

  return (
    <div className='h-screen flex flex-col bg-zinc-950 relative overflow-hidden'>
      {/* Ambient Background Effects */}
      <div className='absolute inset-0 overflow-hidden pointer-events-none'>
        {/* Primary teal orb - top right */}
        <div className='absolute -top-32 -right-32 w-96 h-96 bg-gradient-to-br from-teal-500/20 via-cyan-500/10 to-transparent rounded-full blur-3xl' />
        {/* Secondary sky orb - bottom left */}
        <div className='absolute -bottom-48 -left-48 w-[32rem] h-[32rem] bg-gradient-to-tr from-sky-500/15 via-teal-500/10 to-transparent rounded-full blur-3xl' />
        {/* Accent orb - center */}
        <div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40rem] h-[40rem] bg-gradient-to-r from-teal-500/5 via-cyan-500/5 to-sky-500/5 rounded-full blur-3xl' />
      </div>

      {/* Header */}
      <StudioHeader
        platform={platform}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onBack={() => console.log('Go back')}
      />

      {/* Main Content */}
      <div className='flex-1 flex overflow-hidden relative z-10'>
        {/* Canvas Area */}
        <CanvasView
          format={selectedFormat}
          zoom={zoom}
          onZoomChange={setZoom}
          showSafeZones={showSafeZones}
          onToggleSafeZones={() => setShowSafeZones(!showSafeZones)}
        />

        {/* Sidebar (hidden on mobile) */}
        <div className='hidden lg:block'>
          <GenerativeSidebar
            formats={linkedinFormats}
            selectedFormat={selectedFormat}
            onFormatChange={setSelectedFormat}
            onGenerate={handleGenerate}
            isGenerating={isGenerating}
          />
        </div>
      </div>

      {/* Voice Agent */}
      <VoiceAgentButton onCommand={(cmd) => console.log('Voice command:', cmd)} />

      {/* Mobile Bottom Sheet Trigger */}
      <div className='lg:hidden fixed bottom-0 left-0 right-0 p-4 bg-white/5 backdrop-blur-xl border-t border-white/10 z-20'>
        <button
          type='button'
          className='w-full py-4 bg-gradient-to-r from-sky-500 via-teal-500 to-cyan-400 text-white font-semibold rounded-xl flex items-center justify-center gap-2 shadow-[0_0_40px_rgba(20,184,166,0.3)] hover:shadow-[0_0_60px_rgba(20,184,166,0.4)] transition-shadow'
        >
          <svg className='w-5 h-5' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M13 10V3L4 14h7v7l9-11h-7z'
            />
          </svg>
          Generate
        </button>
      </div>
    </div>
  );
}

export default PlatformStudioView;
