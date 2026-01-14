import React, { useState } from 'react';

interface Template {
  id: string;
  title: string;
  industry: string;
  platform: string;
  thumbnailUrl: string;
}

const industries = [
  'All',
  'Technology',
  'Finance',
  'Marketing',
  'Healthcare',
  'Education',
  'E-commerce',
  'Creative',
];

const sampleTemplates: Template[] = [
  {
    id: '1',
    title: 'Tech Startup Banner',
    industry: 'Technology',
    platform: 'linkedin',
    thumbnailUrl: '',
  },
  {
    id: '2',
    title: 'Product Launch',
    industry: 'Marketing',
    platform: 'instagram',
    thumbnailUrl: '',
  },
  {
    id: '3',
    title: 'Financial Report',
    industry: 'Finance',
    platform: 'linkedin',
    thumbnailUrl: '',
  },
  {
    id: '4',
    title: 'Course Promotion',
    industry: 'Education',
    platform: 'youtube',
    thumbnailUrl: '',
  },
  {
    id: '5',
    title: 'E-commerce Sale',
    industry: 'E-commerce',
    platform: 'facebook',
    thumbnailUrl: '',
  },
  {
    id: '6',
    title: 'Portfolio Showcase',
    industry: 'Creative',
    platform: 'instagram',
    thumbnailUrl: '',
  },
  { id: '7', title: 'Health Tips', industry: 'Healthcare', platform: 'tiktok', thumbnailUrl: '' },
  { id: '8', title: 'SaaS Feature', industry: 'Technology', platform: 'youtube', thumbnailUrl: '' },
];

export function TemplatesView() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState('All');

  const filteredTemplates = sampleTemplates.filter((template) => {
    const matchesSearch = template.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesIndustry = selectedIndustry === 'All' || template.industry === selectedIndustry;
    return matchesSearch && matchesIndustry;
  });

  return (
    <div className='min-h-screen bg-zinc-950 p-4 md:p-6 lg:p-8 relative overflow-hidden'>
      {/* Ambient Background Effects */}
      <div className='absolute inset-0 overflow-hidden pointer-events-none'>
        {/* Primary teal orb - top right */}
        <div className='absolute -top-32 -right-32 w-96 h-96 bg-gradient-to-br from-teal-500/20 via-cyan-500/10 to-transparent rounded-full blur-3xl' />
        {/* Secondary sky orb - bottom left */}
        <div className='absolute -bottom-48 -left-48 w-[500px] h-[500px] bg-gradient-to-tr from-sky-500/15 via-teal-500/10 to-transparent rounded-full blur-3xl' />
        {/* Accent orb - center */}
        <div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-cyan-500/5 via-teal-500/5 to-sky-500/5 rounded-full blur-3xl' />
      </div>

      <div className='max-w-7xl mx-auto relative z-10'>
        {/* Header */}
        <div className='mb-8'>
          <h1 className="text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-sky-500 via-teal-500 to-cyan-400 font-['Space_Grotesk']">
            Templates
          </h1>
          <p className='text-zinc-400 mt-1'>Start with a professional template and customize it</p>
        </div>

        {/* Search & Filters - Glass Card */}
        <div className='flex flex-col sm:flex-row gap-4 mb-8'>
          {/* Search Input with Glass Effect */}
          <div className='relative flex-1'>
            <svg
              className='absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400'
              fill='none'
              viewBox='0 0 24 24'
              stroke='currentColor'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'
              />
            </svg>
            <input
              type='text'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder='Search templates...'
              className='w-full pl-12 pr-4 py-3 bg-white/5 backdrop-blur-xl border border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-teal-500/50 focus:shadow-[0_0_20px_rgba(20,184,166,0.15)] transition-all duration-300'
            />
          </div>
        </div>

        {/* Industry Pills with Neumorphic Style */}
        <div className='flex gap-3 overflow-x-auto pb-4 mb-6 scrollbar-hide'>
          {industries.map((industry) => (
            <button
              key={industry}
              type='button'
              onClick={() => setSelectedIndustry(industry)}
              className={`px-5 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-300 ${
                selectedIndustry === industry
                  ? 'bg-gradient-to-r from-sky-500 via-teal-500 to-cyan-400 text-white shadow-[0_0_20px_rgba(20,184,166,0.4)]'
                  : 'bg-zinc-900 text-zinc-400 hover:text-white shadow-[4px_4px_8px_rgba(0,0,0,0.4),-4px_-4px_8px_rgba(255,255,255,0.05)] hover:shadow-[0_0_15px_rgba(20,184,166,0.2)]'
              }`}
            >
              {industry}
            </button>
          ))}
        </div>

        {/* Templates Grid */}
        {filteredTemplates.length > 0 ? (
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5'>
            {filteredTemplates.map((template) => (
              <div
                key={template.id}
                className='bg-white/5 backdrop-blur-xl border border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] rounded-2xl overflow-hidden group hover:shadow-[0_0_40px_rgba(20,184,166,0.3)] hover:border-teal-500/30 transition-all duration-500'
              >
                {/* Thumbnail */}
                <div className='aspect-video bg-gradient-to-br from-zinc-800/50 to-zinc-900/50 relative'>
                  <div className='absolute inset-0 flex items-center justify-center text-zinc-600'>
                    <svg
                      className='w-12 h-12'
                      fill='none'
                      viewBox='0 0 24 24'
                      stroke='currentColor'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={1}
                        d='M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z'
                      />
                    </svg>
                  </div>

                  {/* Hover Overlay with Glass Effect */}
                  <div className='absolute inset-0 bg-black/40 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center'>
                    <button
                      type='button'
                      className='px-6 py-2.5 bg-gradient-to-r from-sky-500 via-teal-500 to-cyan-400 text-white font-medium rounded-xl shadow-[0_0_20px_rgba(20,184,166,0.5)] hover:shadow-[0_0_30px_rgba(20,184,166,0.7)] transition-all duration-300 transform hover:scale-105'
                    >
                      Use Template
                    </button>
                  </div>

                  {/* Platform Badge with Glass Style */}
                  <div className='absolute top-3 left-3 px-3 py-1.5 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg text-xs text-zinc-200 capitalize font-medium'>
                    {template.platform}
                  </div>
                </div>

                {/* Info */}
                <div className='p-4'>
                  <h3 className='text-sm font-medium text-white mb-1 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-sky-400 group-hover:to-teal-400 transition-all duration-300'>
                    {template.title}
                  </h3>
                  <p className='text-xs text-zinc-500'>{template.industry}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Empty State with Glass Card */
          <div className='bg-white/5 backdrop-blur-xl border border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] rounded-2xl p-16 text-center'>
            <svg
              className='w-16 h-16 text-zinc-600 mx-auto mb-4'
              fill='none'
              viewBox='0 0 24 24'
              stroke='currentColor'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={1}
                d='M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z'
              />
            </svg>
            <h3 className='text-lg font-medium text-white mb-1'>No templates found</h3>
            <p className='text-zinc-500'>Try adjusting your search or filter</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default TemplatesView;
