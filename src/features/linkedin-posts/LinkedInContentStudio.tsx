import React, { useState, useCallback } from 'react';
import { CopywritingPanel } from './components/CopywritingPanel';
import { ViralScoreCard } from './components/ViralScoreCard';
import { PostPreview } from './components/PostPreview';
import { LinkedInImageGenerator } from './components/LinkedInImageGenerator';
import { CopywritingRequest, ImageGenerationRequest } from './types';
import { useToast } from '@/hooks/useToast';
import { getPlatformPostsConfig } from './config/platformPostsConfig';
import type { PlatformType } from '@/components/studios/config/platformConfig';

interface SocialContentStudioProps {
  platform?: PlatformType;
}

/**
 * SocialContentStudio - Unified workspace for creating viral social media posts.
 * Supports all platforms: LinkedIn, YouTube, Instagram, Facebook, TikTok, X
 * Adapts UI, tips, and content generation based on platform.
 */
export const LinkedInContentStudio: React.FC<SocialContentStudioProps> = ({
  platform = 'linkedin',
}) => {
  const config = getPlatformPostsConfig(platform);
  const [content, setContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [postImage, setPostImage] = useState<string | null>(null);
  const [topic, setTopic] = useState('');
  const toast = useToast();

  const handleGenerate = useCallback(
    async (request: CopywritingRequest) => {
      setIsGenerating(true);
      try {
        // In a real implementation, this would call a service like gemini-3-pro
        // For now, we simulate the AI thinking process
        await new Promise((resolve) => setTimeout(resolve, 2500));

        const mockResult = `🚀 **Mastering Personal Branding in 2026**

The rules of the game have shifted. It's no longer about just "being present." It's about intentionality and authenticity.

Here's exactly what you need to know about ${request.topic}:

1️⃣ **Authenticity over Polish**: People want real stories, not corporate jargon.
2️⃣ **Value First**: If you aren't solving a problem, you're just adding to the noise.
3️⃣ **Consistency is Key**: Your brand is built in the daily actions, not the one-off viral post.

What's the one thing you've changed about your brand this year? Drop it in the comments! 👇

#PersonalBranding #LinkedInStrategy #CareerGrowth #TechTrends2026`;

        setContent(mockResult);
        setTopic(request.topic); // Set topic for image generation
        toast.success('Viral content generated successfully!');
      } catch (error) {
        console.error('LinkedIn Generation Error:', error);
        toast.error('Failed to generate content. Please try again.');
      } finally {
        setIsGenerating(false);
      }
    },
    [toast],
  );

  const handleGenerateImage = useCallback(
    async (request: ImageGenerationRequest) => {
      setIsGeneratingImage(true);
      try {
        await new Promise((resolve) => setTimeout(resolve, 3000));
        // In production, this would call our Replicate/OpenRouter image service
        const mockImage = `https://picsum.photos/seed/${Math.random()}/${request.dimensions.width}/${request.dimensions.height}`;
        setPostImage(mockImage);
        toast.success('Professional asset generated!');
      } catch (error) {
        console.error('Image Generation Error:', error);
        toast.error('Failed to generate image.');
      } finally {
        setIsGeneratingImage(false);
      }
    },
    [toast],
  );

  return (
    <div className='flex-1 flex flex-col h-full bg-zinc-950 overflow-hidden animate-in fade-in duration-700'>
      {/* Scrollable Container */}
      <div className='flex-1 flex overflow-hidden lg:flex-row flex-col'>
        {/* Left Column: Editor Workspace (Main) */}
        <div className='flex-1 overflow-y-auto custom-scrollbar border-r border-white/5'>
          <div className='max-w-4xl mx-auto p-6 md:p-10 lg:p-16 space-y-12'>
            {/* Page Header */}
            <header className='space-y-4'>
              <div className='flex items-center gap-3'>
                <div
                  className={`w-12 h-12 bg-${config.accentColor}/20 rounded-2xl flex items-center justify-center border border-${config.accentColor}/30`}
                >
                  <span className={`material-icons text-${config.accentColor} text-3xl`}>
                    {config.icon}
                  </span>
                </div>
                <div>
                  <h1 className='text-3xl sm:text-4xl font-black text-white tracking-tighter'>
                    {config.name.toUpperCase()} POSTS
                  </h1>
                  <p className='text-zinc-500 text-[10px] sm:text-xs font-black uppercase tracking-[0.2em]'>
                    AI-Powered Viral Content Creator
                  </p>
                </div>
              </div>
            </header>

            {/* Editor Component */}
            <section className='bg-zinc-900/40 backdrop-blur-xl rounded-[2.5rem] border border-white/5 p-8 md:p-12 shadow-2xl'>
              <CopywritingPanel
                content={content}
                onContentChange={setContent}
                onGenerate={handleGenerate}
                isGenerating={isGenerating}
              />
            </section>

            {/* Space at bottom for scroll comfort */}
            <div className='h-20' />
          </div>
        </div>

        {/* Right Column: Intelligence & Preview Panel */}
        <aside className='w-full lg:w-[450px] bg-zinc-900/80 backdrop-blur-3xl border-l border-white/10 overflow-y-auto custom-scrollbar shadow-[-20px_0_50px_rgba(0,0,0,0.3)] z-10'>
          <div className='p-6 md:p-10 space-y-8'>
            {/* Viral Metrics */}
            <ViralScoreCard content={content} />

            {/* Live Preview */}
            <PostPreview content={content} image={postImage} />

            {/* Image Generator */}
            <LinkedInImageGenerator
              topic={topic || config.placeholderTopic}
              isLoading={isGeneratingImage}
              onGenerate={handleGenerateImage}
            />

            {/* Platform-Specific Tips Card */}
            <div
              className={`bg-gradient-to-br ${config.bgGradient} border border-${config.borderColor} rounded-3xl p-4 sm:p-6 space-y-3`}
            >
              <h4
                className={`text-[10px] sm:text-xs font-black text-${config.accentColor} uppercase tracking-widest flex items-center gap-2`}
              >
                <span className='material-icons text-sm'>info</span>
                {config.name} Pro Tip
              </h4>
              <p className='text-[10px] sm:text-[11px] text-zinc-400 leading-relaxed font-medium'>
                {config.algorithmTip}
              </p>
              {/* Content Tips List */}
              <ul className='space-y-1.5 pt-2 border-t border-white/5'>
                {config.contentTips.slice(0, 3).map((tip, i) => (
                  <li
                    key={i}
                    className='text-[9px] sm:text-[10px] text-zinc-500 flex items-start gap-2'
                  >
                    <span className={`text-${config.accentColor} mt-0.5`}>*</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>

            {/* Footer space */}
            <div className='h-10' />
          </div>
        </aside>
      </div>
    </div>
  );
};

export default LinkedInContentStudio;
