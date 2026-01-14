/**
 * Platform-specific configuration for the Social Content Studio
 * Each platform has unique content characteristics, tips, and best practices
 *
 * Research Sources (2025-2026):
 * - LinkedIn: growleads.io, socialbee.com, ligosocial.com
 * - YouTube: backlinko.com, learningrevolution.net, joinbrands.com
 * - Instagram: buffer.com, later.com, socialinsider.io
 * - Facebook: buffer.com, socialmediaexaminer.com, brandwatch.com
 * - TikTok: buffer.com, sproutsocial.com, hootsuite.com
 * - X: recurpost.com, avenuez.com, socialbee.com
 */

import type { PlatformType } from '@/components/studios/config/platformConfig';

export interface PlatformPostsConfig {
  id: PlatformType;
  name: string;
  icon: string;
  accentColor: string;
  bgGradient: string;
  borderColor: string;
  maxCharacters: number;
  optimalHashtags: number;
  goldenHour: string;
  linkPenalty: string;
  keyMetrics: string[];
  contentTips: string[];
  avoidList: string[];
  algorithmTip: string;
  placeholderTopic: string;
  toneOptions: string[];
  defaultTone: string;
  postFormats: string[];
  imageDimensions: { width: number; height: number; label: string }[];
  videoSpecs: {
    optimal: string;
    max: string;
    notes: string;
  };
}

export const PLATFORM_POSTS_CONFIG: Record<PlatformType, PlatformPostsConfig> = {
  linkedin: {
    id: 'linkedin',
    name: 'LinkedIn',
    icon: 'work',
    accentColor: 'blue-500',
    bgGradient: 'from-blue-600/10 to-transparent',
    borderColor: 'blue-500/20',
    maxCharacters: 3000,
    optimalHashtags: 3, // Updated: 3-5 niche-focused
    goldenHour: 'First 60 minutes - engagement quality determines algorithm boost',
    linkPenalty: '60% reach reduction for external links',
    keyMetrics: [
      'Comments (ranked #1 for reach)',
      'Dwell time (how long users read)',
      'Creator authenticity signals',
      'Engagement within first 60 mins',
    ],
    contentTips: [
      'First 210 chars = hook (See More cutoff)',
      'Carousels get 303% more engagement than single images',
      'Videos under 30 secs = 200% higher completion',
      'Break into 3-4 sentence paragraphs max',
      'End with specific question (+40% reach)',
      'LinkedIn Live = 29.6% engagement (highest format)',
    ],
    avoidList: [
      'External links in post body',
      'Walls of text without breaks',
      'Generic hashtags (#business #success)',
      'More than 5 hashtags',
    ],
    algorithmTip:
      '2026 algorithm uses semantic ranking with 3 signals: engagement quality (first 60 mins), dwell time, and creator authenticity. Comments are #1 for reach expansion - posts with comments are 2-3x more likely to appear in 2nd/3rd-degree feeds.',
    placeholderTopic: 'professional branding',
    toneOptions: [
      'Thought Leader',
      'Personal Story',
      'Educational',
      'Contrarian Take',
      'Data-Driven',
    ],
    defaultTone: 'Thought Leader',
    postFormats: ['Text Post', 'Carousel (Best)', 'Document', 'Poll', 'LinkedIn Live'],
    imageDimensions: [
      { width: 1200, height: 627, label: 'Link Preview' },
      { width: 1080, height: 1080, label: 'Square' },
      { width: 1080, height: 1350, label: 'Portrait (Best)' },
    ],
    videoSpecs: {
      optimal: 'Under 30 seconds',
      max: '10 minutes',
      notes: '200% higher completion rate for short videos',
    },
  },
  youtube: {
    id: 'youtube',
    name: 'YouTube',
    icon: 'play_circle',
    accentColor: 'red-500',
    bgGradient: 'from-red-600/10 to-transparent',
    borderColor: 'red-500/20',
    maxCharacters: 5000,
    optimalHashtags: 3, // Only 37% of top videos use hashtags
    goldenHour: 'First 48 hours - determines viral potential',
    linkPenalty: 'Minimal (YouTube allows external links)',
    keyMetrics: [
      'AVD (Average View Duration)',
      'Completion rate',
      'Click-Through Rate (CTR)',
      'Rewatch ratio (>100% = rewatched)',
    ],
    contentTips: [
      'Primary keyword in first 125 chars of description',
      'Include #Shorts in title AND description',
      'Hook viewers in first 2-3 seconds',
      'Design content for rewatchability (loops boost AVD)',
      'Add timestamps for long-form videos',
      'Only 37% of top videos use hashtags',
    ],
    avoidList: [
      'Hashtag stuffing (relevance > quantity)',
      'Clickbait titles without value',
      'Missing #Shorts tag on Shorts',
      'Slow intros without hooks',
    ],
    algorithmTip:
      "2025-2026: Viewer satisfaction beats raw watch time. YouTube's LLM now analyzes content before distribution. Shorts hit 200B+ daily views - optimal length is 15-30 secs for completion. Design for rewatchability to push AVD above 100%.",
    placeholderTopic: 'video content strategy',
    toneOptions: ['Educational', 'Entertainment', 'Tutorial', 'Commentary', 'Vlog'],
    defaultTone: 'Educational',
    postFormats: ['Long-form Video', 'Shorts (15-30s)', 'Community Post', 'Live Stream'],
    imageDimensions: [
      { width: 1280, height: 720, label: 'Thumbnail' },
      { width: 1080, height: 1920, label: 'Shorts' },
      { width: 2560, height: 1440, label: 'Banner' },
    ],
    videoSpecs: {
      optimal: '15-30 seconds (Shorts)',
      max: 'No limit for long-form',
      notes: 'Rewatchability boosts AVD >100%',
    },
  },
  instagram: {
    id: 'instagram',
    name: 'Instagram',
    icon: 'photo_camera',
    accentColor: 'pink-500',
    bgGradient: 'from-pink-600/10 via-purple-600/10 to-transparent',
    borderColor: 'pink-500/20',
    maxCharacters: 2200,
    optimalHashtags: 5, // Instagram recommends 5-10, not 30
    goldenHour: 'First few hours - Watch Time is #1 signal',
    linkPenalty: 'No links in captions (bio link only)',
    keyMetrics: [
      'Watch Time (#1 signal - Adam Mosseri 2025)',
      'Likes Per Reach',
      'DM Sends Per Reach (quality signal)',
      'Saves (weighted higher than likes)',
    ],
    contentTips: [
      'Watch Time is #1 algorithm signal (Adam Mosseri 2025)',
      'Keyword SEO in captions > hashtags for discovery',
      'Saves and DM shares weighted higher than likes',
      'Carousels: up to 20 slides, 10.15% avg engagement',
      'Reels sweet spot: 30-90 seconds',
      'Caption mix: 60% short, 30% medium, 10% long',
    ],
    avoidList: [
      '30 hashtags (use 5-10 instead)',
      'Hashtag-only discovery strategy',
      'Generic hashtags (#love #instagood)',
      'Ignoring caption SEO keywords',
    ],
    algorithmTip:
      '2026: Watch Time is THE most important signal per Adam Mosseri. DM shares = strong quality indicator that boosts Explore reach. Hashtag following removed Dec 2024 - use caption keywords for SEO instead. Carousels get reshown to users who missed slides.',
    placeholderTopic: 'lifestyle branding',
    toneOptions: ['Authentic', 'Aesthetic', 'Educational', 'Behind-the-scenes', 'Inspirational'],
    defaultTone: 'Authentic',
    postFormats: ['Carousel (Best)', 'Reel', 'Feed Post', 'Story', 'Guide'],
    imageDimensions: [
      { width: 1080, height: 1080, label: 'Square' },
      { width: 1080, height: 1350, label: 'Portrait (4:5)' },
      { width: 1080, height: 1920, label: 'Story/Reel' },
    ],
    videoSpecs: {
      optimal: '30-90 seconds (Reels)',
      max: '90 seconds (Reels), 60 mins (IGTV)',
      notes: 'Watch Time > views for algorithm ranking',
    },
  },
  facebook: {
    id: 'facebook',
    name: 'Facebook',
    icon: 'thumb_up',
    accentColor: 'blue-600',
    bgGradient: 'from-blue-700/10 to-transparent',
    borderColor: 'blue-600/20',
    maxCharacters: 63206,
    optimalHashtags: 2, // Less is more on Facebook
    goldenHour: 'First few hours - DM shares determine reach',
    linkPenalty: '70-80% reach reduction (SEVERE in 2025)',
    keyMetrics: [
      'DM shares (#1 indicator of reach potential)',
      'Meaningful comments (multi-thread discussions)',
      'Video completion rate',
      'Profile clicks after viewing',
    ],
    contentTips: [
      'ALL video now auto-classified as Reels',
      'Reels get 2-3x more reach than regular posts',
      'Groups: 30-60% reach vs 2-6% for Pages (10x!)',
      'DM shares are #1 indicator of reach potential',
      'Go Live for priority placement + notifications',
      '40%+ of News Feed is AI-recommended content',
    ],
    avoidList: [
      'External links (70-80% reach penalty)',
      'Clickbait titles',
      'Engagement bait ("Like if you agree")',
      'Reposted/stolen content',
      'Contests and giveaways',
    ],
    algorithmTip:
      '2025: Link posts nearly INVISIBLE for reach. 40%+ of News Feed is now AI-recommended content. Use Groups for organic reach (10x vs Pages). All video auto-classifies as Reels. DM shares are the #1 indicator of viral potential. Native short-form video <90 secs preferred.',
    placeholderTopic: 'community building',
    toneOptions: [
      'Community-focused',
      'Conversational',
      'Personal',
      'News/Updates',
      'Live/Real-time',
    ],
    defaultTone: 'Conversational',
    postFormats: ['Reel (Best)', 'Live Video', 'Group Post', 'Photo', 'Text Post'],
    imageDimensions: [
      { width: 1200, height: 630, label: 'Link Preview' },
      { width: 1080, height: 1080, label: 'Square' },
      { width: 1080, height: 1920, label: 'Reel/Story' },
    ],
    videoSpecs: {
      optimal: 'Under 90 seconds (Reels)',
      max: '240 minutes',
      notes: 'All video now auto-classified as Reels',
    },
  },
  tiktok: {
    id: 'tiktok',
    name: 'TikTok',
    icon: 'music_note',
    accentColor: 'cyan-400',
    bgGradient: 'from-cyan-500/10 via-pink-500/10 to-transparent',
    borderColor: 'cyan-400/20',
    maxCharacters: 4000, // Updated from 2200
    optimalHashtags: 4, // 3-5 mix of broad + niche + trending
    goldenHour: 'Algorithm tests with small audience first',
    linkPenalty: 'Bio link only (no links in captions)',
    keyMetrics: [
      'Watch time percentage (not 3-sec rule)',
      'Video completion rate',
      'Rewatch ratio',
      'Engagement rate (5%+ target)',
    ],
    contentTips: [
      'Main keyword in first 30 caption characters',
      'Keywords in 3 places: hook text, voiceover, caption',
      'Hook viewers in first 1-3 seconds',
      'Rehook viewers for longer content',
      'Use trending sounds for discovery',
      'Film natively in TikTok app for algorithm edge',
      'High-quality videos = 40x follower growth',
    ],
    avoidList: [
      'Irrelevant hashtags (confuses algorithm)',
      'Banned hashtags',
      'Slow hooks (need 1-3 second hook)',
      'Low-quality video (40x penalty)',
    ],
    algorithmTip:
      '2025: FYP now acts like a SEARCH ENGINE. Total watch time (not 3-sec retention) is central. High-quality TikTok-first videos get 40x more follower growth. Test 20, 40, and 60-second versions monthly. Aim for 5%+ engagement rate.',
    placeholderTopic: 'viral trends',
    toneOptions: ['Trendy', 'Educational (Edutok)', 'Comedy', 'Raw/Authentic', 'Challenge'],
    defaultTone: 'Trendy',
    postFormats: ['TikTok Video', 'Duet', 'Stitch', 'LIVE', 'Photo Carousel'],
    imageDimensions: [
      { width: 1080, height: 1920, label: 'Video (9:16)' },
      { width: 1080, height: 1080, label: 'Square' },
    ],
    videoSpecs: {
      optimal: '15-60 seconds',
      max: '10 minutes',
      notes: 'High-quality = 40x follower growth vs low-quality',
    },
  },
  x: {
    id: 'x',
    name: 'X (Twitter)',
    icon: 'tag',
    accentColor: 'zinc-200',
    bgGradient: 'from-zinc-600/10 to-transparent',
    borderColor: 'zinc-400/20',
    maxCharacters: 280, // Premium: 25,000
    optimalHashtags: 1, // More than 2 = 17% engagement drop
    goldenHour: 'First 15 minutes - engagement velocity critical',
    linkPenalty: 'Near-invisible for non-Premium since March 2026',
    keyMetrics: [
      'Engagement velocity (first 15 mins)',
      'Reply engagement',
      'Retweets and Quote Tweets',
      'Thread completion rate',
    ],
    contentTips: [
      'Threads get 3x more engagement than single tweets',
      'Optimal thread: 4-8 tweets with visuals',
      'Tweets <100 chars get 17% higher engagement',
      'Reply to comments within 15 minutes',
      'Engage with others BEFORE posting your own',
      'Put hashtags at END of threads only',
      'Images/videos = 40% more engagement',
    ],
    avoidList: [
      'More than 2 hashtags (17% engagement drop)',
      'External links (unless Premium)',
      'Bare links without context',
      'Hashtags in every thread tweet',
    ],
    algorithmTip:
      '2026: Engagement velocity in first 15 mins determines reach. Link posts near-invisible for non-Premium. Threads = 3x engagement vs single tweets (use 4-8 tweets with visuals). Premium = 2-4x visibility boost. Native video priority over external links.',
    placeholderTopic: 'hot takes',
    toneOptions: ['Hot Take', 'Thread/Educational', 'Witty', 'News/Commentary', 'Personal Update'],
    defaultTone: 'Hot Take',
    postFormats: ['Thread (Best)', 'Tweet', 'Quote Tweet', 'Poll', 'Spaces'],
    imageDimensions: [
      { width: 1200, height: 675, label: 'Landscape (16:9)' },
      { width: 1080, height: 1080, label: 'Square' },
      { width: 1080, height: 1350, label: 'Portrait' },
    ],
    videoSpecs: {
      optimal: 'Under 60 seconds',
      max: '140 seconds (free), 60 mins (Premium)',
      notes: 'Native video gets 40% more engagement',
    },
  },
};

export function getPlatformPostsConfig(platform: PlatformType): PlatformPostsConfig {
  return PLATFORM_POSTS_CONFIG[platform] || PLATFORM_POSTS_CONFIG.linkedin;
}
