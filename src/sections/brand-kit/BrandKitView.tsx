import React, { useState } from 'react';

interface BrandProfile {
  id: string;
  name: string;
  colors: { hex: string; name: string }[];
  font: string;
  industry: string;
  isActive: boolean;
}

const sampleBrands: BrandProfile[] = [
  {
    id: '1',
    name: 'Signal',
    colors: [
      { hex: '#0ea5e9', name: 'Sky' },
      { hex: '#14b8a6', name: 'Teal' },
      { hex: '#18181b', name: 'Zinc' },
      { hex: '#ffffff', name: 'White' },
    ],
    font: 'Space Grotesk',
    industry: 'Technology',
    isActive: true,
  },
  {
    id: '2',
    name: 'Client Brand',
    colors: [
      { hex: '#8b5cf6', name: 'Purple' },
      { hex: '#ec4899', name: 'Pink' },
      { hex: '#f59e0b', name: 'Amber' },
    ],
    font: 'Inter',
    industry: 'Marketing',
    isActive: false,
  },
];

export function BrandKitView() {
  const [brands, setBrands] = useState<BrandProfile[]>(sampleBrands);

  const setActiveBrand = (id: string) => {
    setBrands(brands.map((b) => ({ ...b, isActive: b.id === id })));
  };

  return (
    <div className='min-h-screen bg-zinc-950 p-4 md:p-6 lg:p-8 relative overflow-hidden'>
      {/* Ambient background effects */}
      <div className='absolute inset-0 overflow-hidden pointer-events-none'>
        <div className='absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-gradient-to-br from-teal-500/20 via-cyan-500/10 to-transparent blur-3xl' />
        <div className='absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-gradient-to-tl from-sky-500/15 via-teal-500/10 to-transparent blur-3xl' />
        <div className='absolute top-[40%] right-[20%] w-[300px] h-[300px] rounded-full bg-gradient-to-br from-cyan-400/10 to-transparent blur-2xl' />
      </div>

      <div className='max-w-7xl mx-auto relative z-10'>
        {/* Header */}
        <div className='flex items-center justify-between mb-8'>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white font-['Space_Grotesk']">
              Brand Kit
            </h1>
            <p className='text-zinc-400 mt-1'>Manage your brand colors, fonts, and assets</p>
          </div>

          <button
            type='button'
            className='px-6 py-3 bg-gradient-to-r from-sky-500 via-teal-500 to-cyan-400 text-white font-semibold rounded-xl hover:shadow-[0_0_40px_rgba(20,184,166,0.3)] transition-all duration-300 flex items-center gap-2 shadow-[4px_4px_8px_rgba(0,0,0,0.4),-4px_-4px_8px_rgba(255,255,255,0.05)]'
          >
            <svg className='w-5 h-5' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M12 4v16m8-8H4'
              />
            </svg>
            New Brand
          </button>
        </div>

        {/* Brand Cards */}
        {brands.length > 0 ? (
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
            {brands.map((brand) => (
              <div
                key={brand.id}
                className={`
                  bg-white/5 backdrop-blur-xl border rounded-2xl p-6
                  shadow-[4px_4px_8px_rgba(0,0,0,0.4),-4px_-4px_8px_rgba(255,255,255,0.05)]
                  transition-all duration-300 group
                  ${
                    brand.isActive
                      ? 'border-teal-500/50 shadow-[0_0_40px_rgba(20,184,166,0.3),4px_4px_8px_rgba(0,0,0,0.4),-4px_-4px_8px_rgba(255,255,255,0.05)]'
                      : 'border-white/10 hover:border-white/20 hover:shadow-[0_0_30px_rgba(20,184,166,0.15),4px_4px_8px_rgba(0,0,0,0.4),-4px_-4px_8px_rgba(255,255,255,0.05)]'
                  }
                `}
              >
                {/* Inner glow effect */}
                <div className='absolute inset-0 rounded-2xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] pointer-events-none' />

                {/* Header */}
                <div className='flex items-start justify-between mb-4 relative'>
                  <div>
                    <h3 className="text-lg font-semibold text-white font-['Space_Grotesk']">
                      {brand.name}
                    </h3>
                    <p className='text-sm text-zinc-500'>{brand.industry}</p>
                  </div>
                  {brand.isActive && (
                    <span className='px-3 py-1 bg-gradient-to-r from-sky-500/20 via-teal-500/20 to-cyan-400/20 text-teal-400 text-xs rounded-full border border-teal-500/30 backdrop-blur-sm'>
                      Active
                    </span>
                  )}
                </div>

                {/* Colors - Glass swatches */}
                <div className='mb-4 relative'>
                  <p className='text-xs text-zinc-500 mb-2'>Colors</p>
                  <div className='flex gap-2'>
                    {brand.colors.slice(0, 5).map((color, index) => (
                      <div
                        key={index}
                        className='w-8 h-8 rounded-lg ring-1 ring-white/20 shadow-[inset_0_1px_1px_rgba(255,255,255,0.2),2px_2px_4px_rgba(0,0,0,0.3)] backdrop-blur-sm transition-transform duration-200 hover:scale-110'
                        style={{ backgroundColor: color.hex }}
                        title={color.name}
                      />
                    ))}
                    {brand.colors.length > 5 && (
                      <div className='w-8 h-8 rounded-lg bg-white/5 backdrop-blur-sm border border-white/10 flex items-center justify-center text-xs text-zinc-400 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]'>
                        +{brand.colors.length - 5}
                      </div>
                    )}
                  </div>
                </div>

                {/* Font - Glass preview */}
                <div className='mb-6 relative'>
                  <p className='text-xs text-zinc-500 mb-1'>Font</p>
                  <div className='bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg px-3 py-2 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]'>
                    <p className='text-sm text-white'>{brand.font}</p>
                  </div>
                </div>

                {/* Actions */}
                <div className='flex gap-2 relative'>
                  {!brand.isActive && (
                    <button
                      type='button'
                      onClick={() => setActiveBrand(brand.id)}
                      className='flex-1 py-2 bg-white/5 backdrop-blur-sm border border-white/10 hover:border-white/20 text-white rounded-lg text-sm transition-all duration-200 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] hover:bg-white/10'
                    >
                      Set Active
                    </button>
                  )}
                  <button
                    type='button'
                    className='flex-1 py-2 bg-gradient-to-r from-sky-500 via-teal-500 to-cyan-400 hover:shadow-[0_0_20px_rgba(20,184,166,0.4)] text-white rounded-lg text-sm transition-all duration-300 shadow-[2px_2px_4px_rgba(0,0,0,0.3),-1px_-1px_2px_rgba(255,255,255,0.05)]'
                  >
                    Use Brand
                  </button>
                  <button
                    type='button'
                    className='w-10 h-10 bg-white/5 backdrop-blur-sm border border-white/10 hover:border-white/20 rounded-lg flex items-center justify-center text-zinc-400 hover:text-white transition-all duration-200 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] hover:bg-white/10'
                  >
                    <svg className='w-4 h-4' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z'
                      />
                    </svg>
                  </button>
                </div>
              </div>
            ))}

            {/* Add Brand Card - Glass style */}
            <button
              type='button'
              className='bg-white/5 backdrop-blur-xl border-2 border-dashed border-white/10 hover:border-teal-500/30 rounded-2xl p-6 flex flex-col items-center justify-center min-h-[240px] transition-all duration-300 group hover:shadow-[0_0_30px_rgba(20,184,166,0.15)] shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]'
            >
              <div className='w-12 h-12 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 group-hover:border-teal-500/30 flex items-center justify-center mb-3 transition-all duration-300 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] group-hover:shadow-[0_0_20px_rgba(20,184,166,0.2)]'>
                <svg
                  className='w-6 h-6 text-zinc-500 group-hover:text-teal-400 transition-colors duration-300'
                  fill='none'
                  viewBox='0 0 24 24'
                  stroke='currentColor'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M12 4v16m8-8H4'
                  />
                </svg>
              </div>
              <p className='text-sm text-zinc-500 group-hover:text-teal-400 transition-colors duration-300'>
                Add new brand
              </p>
            </button>
          </div>
        ) : (
          <div className='text-center py-16 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-[4px_4px_8px_rgba(0,0,0,0.4),-4px_-4px_8px_rgba(255,255,255,0.05),inset_0_1px_1px_rgba(255,255,255,0.1)]'>
            <svg
              className='w-16 h-16 text-zinc-700 mx-auto mb-4'
              fill='none'
              viewBox='0 0 24 24'
              stroke='currentColor'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={1}
                d='M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01'
              />
            </svg>
            <h3 className='text-lg font-medium text-white mb-1'>No brands yet</h3>
            <p className='text-zinc-500 mb-4'>Create your first brand to get started</p>
            <button
              type='button'
              className='px-6 py-3 bg-gradient-to-r from-sky-500 via-teal-500 to-cyan-400 text-white font-medium rounded-xl hover:shadow-[0_0_40px_rgba(20,184,166,0.3)] transition-all duration-300 shadow-[4px_4px_8px_rgba(0,0,0,0.4),-4px_-4px_8px_rgba(255,255,255,0.05)]'
            >
              Create Brand
            </button>
          </div>
        )}

        {/* Pro Tip Card - Glass style */}
        <div className='mt-8 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-[4px_4px_8px_rgba(0,0,0,0.4),-4px_-4px_8px_rgba(255,255,255,0.05),inset_0_1px_1px_rgba(255,255,255,0.1)]'>
          <div className='flex items-start gap-4'>
            <div className='w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500/20 via-teal-500/20 to-cyan-400/20 border border-teal-500/30 flex items-center justify-center flex-shrink-0 shadow-[0_0_20px_rgba(20,184,166,0.2),inset_0_1px_1px_rgba(255,255,255,0.1)]'>
              <svg
                className='w-5 h-5 text-teal-400'
                fill='none'
                viewBox='0 0 24 24'
                stroke='currentColor'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
                />
              </svg>
            </div>
            <div>
              <h4 className='text-sm font-medium text-white mb-1'>Pro Tip</h4>
              <p className='text-sm text-zinc-400'>
                Set an active brand and AI will automatically use your brand colors and fonts when
                generating designs. You can also extract colors from any image!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BrandKitView;
