import React, { useState } from 'react';
import { ViralScoreCard, CopywritingPanel, PostPreview } from './components';

// Sample data
const sampleScore = {
  overall: 78,
  factors: [
    {
      id: 'hook',
      name: 'Hook Strength',
      score: 85,
      maxScore: 100,
      weight: 0.25,
      suggestion: 'Strong opening line',
    },
    {
      id: 'structure',
      name: 'Structure',
      score: 70,
      maxScore: 100,
      weight: 0.2,
      suggestion: 'Add more whitespace',
    },
    {
      id: 'engagement',
      name: 'Engagement Potential',
      score: 80,
      maxScore: 100,
      weight: 0.25,
      suggestion: 'Good use of questions',
    },
    {
      id: 'hashtags',
      name: 'Hashtags',
      score: 75,
      maxScore: 100,
      weight: 0.15,
      suggestion: 'Add 1-2 more relevant hashtags',
    },
    {
      id: 'length',
      name: 'Length',
      score: 80,
      maxScore: 100,
      weight: 0.15,
      suggestion: 'Optimal length',
    },
  ],
};

export function LinkedInStudioView() {
  const [content, setContent] = useState(`I've been building AI-powered design tools for 2 years.

Here are 5 things I wish I knew earlier:

1. Start with the user's problem, not your solution
2. Ship fast, iterate faster
3. Community feedback > vanity metrics
4. AI is a tool, not a replacement
5. Focus on one thing and do it exceptionally well

What lessons have you learned building products?

#AI #Startups #ProductDevelopment`);

  const [isRewriting, setIsRewriting] = useState(false);

  const handleRewrite = () => {
    setIsRewriting(true);
    setTimeout(() => {
      setIsRewriting(false);
    }, 2000);
  };

  return (
    <div className='min-h-screen bg-zinc-950 p-4 md:p-6 lg:p-8 relative overflow-hidden'>
      {/* Ambient Background Effects */}
      <div className='absolute inset-0 overflow-hidden pointer-events-none'>
        {/* Primary blue gradient orb */}
        <div className='absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-blue-600/20 rounded-full blur-[120px]' />
        {/* Secondary cyan gradient orb */}
        <div className='absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-cyan-500/15 rounded-full blur-[100px]' />
        {/* Accent orb */}
        <div className='absolute top-[40%] right-[20%] w-[300px] h-[300px] bg-blue-500/10 rounded-full blur-[80px]' />
      </div>

      <div className='max-w-7xl mx-auto relative z-10'>
        {/* Header */}
        <div className='flex items-center justify-between mb-8'>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white font-['Space_Grotesk']">
              LinkedIn Content Studio
            </h1>
            <p className='text-zinc-400 mt-1'>Create viral LinkedIn content with AI assistance</p>
          </div>

          <button
            type='button'
            className='px-6 py-3 bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-400 text-white font-semibold rounded-xl hover:from-blue-500 hover:via-blue-400 hover:to-cyan-300 transition-all flex items-center gap-2 shadow-[0_0_40px_rgba(59,130,246,0.3)]'
          >
            <svg className='w-5 h-5' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z'
              />
            </svg>
            Publish
          </button>
        </div>

        {/* Main Content */}
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
          {/* Left Column - Copywriting */}
          <div className='lg:col-span-2 space-y-6'>
            <CopywritingPanel
              content={content}
              onChange={setContent}
              onRewrite={handleRewrite}
              isRewriting={isRewriting}
            />
          </div>

          {/* Right Column - Score & Preview */}
          <div className='space-y-6'>
            <ViralScoreCard score={sampleScore.overall} factors={sampleScore.factors} />

            {/* Post Preview */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4 font-['Space_Grotesk']">
                Preview
              </h3>
              <PostPreview
                authorName='John Doe'
                authorTitle='Founder @ Signal | AI-Powered Design'
                content={content}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LinkedInStudioView;
