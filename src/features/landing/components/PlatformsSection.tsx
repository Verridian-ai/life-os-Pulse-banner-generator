/**
 * Platforms Section Component
 *
 * Showcases platform-specific studios (LinkedIn, YouTube, etc.)
 * Life OS Design: Interactive cards with platform branding.
 */

import React from 'react';

const PLATFORMS = [
    {
        id: 'linkedin',
        name: 'LinkedIn',
        description: 'Professional banners & cover images for your personal brand',
        icon: (
            <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
            </svg>
        ),
        color: 'from-[#0077B5] to-[#005885]',
        bgColor: 'bg-[#0077B5]/10',
        formats: ['Banner (1584×396)', 'Profile (400×400)', 'Post (1200×628)'],
    },
    {
        id: 'youtube',
        name: 'YouTube',
        description: 'Eye-catching thumbnails & channel art that get clicks',
        icon: (
            <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
            </svg>
        ),
        color: 'from-[#FF0000] to-[#CC0000]',
        bgColor: 'bg-[#FF0000]/10',
        formats: ['Thumbnail (1280×720)', 'Banner (2560×1440)', 'Profile (800×800)'],
    },
    {
        id: 'instagram',
        name: 'Instagram',
        description: 'Stunning posts, stories, and reels covers',
        icon: (
            <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z" />
            </svg>
        ),
        color: 'from-[#E4405F] via-[#C13584] to-[#833AB4]',
        bgColor: 'bg-[#E4405F]/10',
        formats: ['Post (1080×1080)', 'Story (1080×1920)', 'Reel Cover (1080×1920)'],
    },
    {
        id: 'facebook',
        name: 'Facebook',
        description: 'Cover photos and post images that engage',
        icon: (
            <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
        ),
        color: 'from-[#1877F2] to-[#0D65D9]',
        bgColor: 'bg-[#1877F2]/10',
        formats: ['Cover (820×312)', 'Post (1200×630)', 'Profile (180×180)'],
    },
    {
        id: 'tiktok',
        name: 'TikTok',
        description: 'Viral-ready profile pics and video covers',
        icon: (
            <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
            </svg>
        ),
        color: 'from-[#00F2EA] via-[#FF0050] to-[#000000]',
        bgColor: 'bg-[#FF0050]/10',
        formats: ['Profile (200×200)', 'Video Cover (1080×1920)'],
    },
    {
        id: 'x',
        name: 'X (Twitter)',
        description: 'Headers and posts for maximum engagement',
        icon: (
            <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
        ),
        color: 'from-zinc-700 to-zinc-900',
        bgColor: 'bg-zinc-500/10',
        formats: ['Header (1500×500)', 'Post (1600×900)', 'Profile (400×400)'],
    },
];

interface PlatformsSectionProps {
    onSelectPlatform?: (platformId: string) => void;
}

export function PlatformsSection({ onSelectPlatform }: PlatformsSectionProps): React.ReactElement {
    return (
        <section className="relative py-24 sm:py-32 overflow-hidden" id="platforms">
            {/* Background */}
            <div className="absolute inset-0 bg-gradient-to-b from-zinc-950 via-zinc-900 to-zinc-950" />
            <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px]" />
            <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-purple-600/10 rounded-full blur-[100px]" />

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Section Header */}
                <div className="text-center mb-16">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full mb-6 backdrop-blur-sm">
                        <span className="material-icons text-blue-400 text-sm">devices</span>
                        <span className="text-sm text-zinc-300">Multi-Platform Support</span>
                    </div>
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white mb-4">
                        One Tool,
                        <span className="block bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                            Every Platform
                        </span>
                    </h2>
                    <p className="text-lg text-zinc-400 max-w-2xl mx-auto">
                        Create optimized designs for every major social platform. Perfect sizes, every time.
                    </p>
                </div>

                {/* Platforms Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {PLATFORMS.map((platform) => (
                        <button
                            key={platform.id}
                            onClick={() => onSelectPlatform?.(platform.id)}
                            className="group relative text-left"
                        >
                            {/* Glow */}
                            <div
                                className={`absolute inset-0 ${platform.bgColor} rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
                            />

                            {/* Card */}
                            <div className="relative h-full bg-gradient-to-br from-zinc-900/90 to-zinc-900/50 border border-white/5 rounded-3xl p-6 backdrop-blur-sm hover:border-white/10 transition-all duration-300 hover:-translate-y-1">
                                {/* Header */}
                                <div className="flex items-start justify-between mb-4">
                                    <div
                                        className={`w-14 h-14 bg-gradient-to-br ${platform.color} rounded-2xl flex items-center justify-center text-white shadow-lg`}
                                    >
                                        {platform.icon}
                                    </div>
                                    <span className="material-icons text-zinc-600 group-hover:text-white/50 transition-colors">
                                        arrow_outward
                                    </span>
                                </div>

                                {/* Content */}
                                <h3 className="text-xl font-bold text-white mb-2">{platform.name}</h3>
                                <p className="text-zinc-400 text-sm mb-4">{platform.description}</p>

                                {/* Formats */}
                                <div className="flex flex-wrap gap-2">
                                    {platform.formats.map((format) => (
                                        <span
                                            key={format}
                                            className="px-2 py-1 bg-white/5 rounded-lg text-xs text-zinc-400"
                                        >
                                            {format}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Accessibility */}
            <style>{`
                @media (prefers-contrast: more) {
                    button:focus {
                        outline: 3px solid white;
                        outline-offset: 2px;
                    }
                }
                @media (forced-colors: active) {
                    button {
                        border: 2px solid ButtonText !important;
                    }
                }
            `}</style>
        </section>
    );
}
