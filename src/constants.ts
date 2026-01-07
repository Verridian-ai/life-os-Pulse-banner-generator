export const BANNER_WIDTH = 1584;
export const BANNER_HEIGHT = 396;

// ============================================================================
// CONTENT TYPE SYSTEM
// ============================================================================
export type ContentType = 'banner' | 'post' | 'carousel' | 'video';

export const CONTENT_DIMENSIONS: Record<ContentType, { width: number; height: number }> = {
  banner: { width: 1584, height: 396 },
  post: { width: 1200, height: 627 },
  carousel: { width: 1080, height: 1080 },
  video: { width: 1920, height: 1080 },
};

// Safety zone calculations based on provided docs
// Build: 2025-12-17 (force deployment)
export const SAFE_ZONE_MARGIN_LEFT = 400;
// The bottom-left 568x264px area is covered by profile pic on some views
export const PROFILE_ZONE_WIDTH = 568;
export const PROFILE_ZONE_HEIGHT = 264;

// ============================================================================
// LINKEDIN CANVAS PRESETS (Official Dimensions 2025)
// ============================================================================
export interface LinkedInCanvasPreset {
  id: string;
  label: string;
  width: number;
  height: number;
  aspectRatio: string;
  category: 'image' | 'video';
  safeZone?: { x: number; y: number; width: number; height: number; reason: string };
}

export const LINKEDIN_CANVAS_PRESETS: LinkedInCanvasPreset[] = [
  // Image Formats
  {
    id: 'profile_banner',
    label: 'Profile Banner',
    width: 1584,
    height: 396,
    aspectRatio: '4:1',
    category: 'image',
    safeZone: { x: 0, y: 132, width: 568, height: 264, reason: 'Profile picture overlay' },
  },
  {
    id: 'post_image',
    label: 'Post Image',
    width: 1200,
    height: 627,
    aspectRatio: '1.91:1',
    category: 'image',
    safeZone: { x: 0, y: 527, width: 1200, height: 100, reason: 'Like/comment bar overlay' },
  },
  {
    id: 'carousel',
    label: 'Carousel Slide',
    width: 1080,
    height: 1080,
    aspectRatio: '1:1',
    category: 'image',
    safeZone: { x: 0, y: 1030, width: 1080, height: 50, reason: 'Navigation dots' },
  },
  {
    id: 'article_cover',
    label: 'Article Cover',
    width: 1200,
    height: 644,
    aspectRatio: '1.86:1',
    category: 'image',
  },
  {
    id: 'company_banner',
    label: 'Company Page Banner',
    width: 1128,
    height: 191,
    aspectRatio: '5.9:1',
    category: 'image',
  },
  {
    id: 'event_cover',
    label: 'Event Cover',
    width: 1776,
    height: 444,
    aspectRatio: '4:1',
    category: 'image',
  },
  // Video Formats
  {
    id: 'video_landscape',
    label: 'Video (16:9)',
    width: 1920,
    height: 1080,
    aspectRatio: '16:9',
    category: 'video',
  },
  {
    id: 'video_portrait',
    label: 'Video (9:16)',
    width: 1080,
    height: 1920,
    aspectRatio: '9:16',
    category: 'video',
  },
  {
    id: 'video_square',
    label: 'Video (Square)',
    width: 1080,
    height: 1080,
    aspectRatio: '1:1',
    category: 'video',
  },
];

// ============================================================================
// MULTI-PLATFORM CANVAS FORMATS
// ============================================================================

export type CanvasFormatId =
  | 'linkedin_banner'
  | 'linkedin_post'
  | 'facebook_cover'
  | 'facebook_post'
  | 'x_header'
  | 'x_post'
  | 'instagram_post'
  | 'instagram_story'
  | 'instagram_avatar'
  | 'youtube_banner'
  | 'youtube_thumbnail';

export type SafeZoneType = 'rect' | 'circle';

export interface SafeZoneConfig {
  type: SafeZoneType;
  x: number;
  y: number;
  width: number;
  height: number;
  radius?: number; // For circular safe zones
  label: string;
  color?: string; // Optional custom color
}

export interface CanvasFormat {
  id: CanvasFormatId;
  name: string;
  platform: 'linkedin' | 'facebook' | 'x' | 'instagram' | 'youtube';
  category: 'banner' | 'post' | 'story' | 'avatar';
  width: number;
  height: number;
  aspectRatio: string;
  safeZones: SafeZoneConfig[];
  description: string;
  icon: string; // Material icon name
}

export const CANVAS_FORMATS: Record<CanvasFormatId, CanvasFormat> = {
  // LinkedIn Formats
  linkedin_banner: {
    id: 'linkedin_banner',
    name: 'LinkedIn Banner',
    platform: 'linkedin',
    category: 'banner',
    width: 1584,
    height: 396,
    aspectRatio: '4:1',
    safeZones: [
      {
        type: 'rect',
        x: 0,
        y: 132,
        width: 568,
        height: 264,
        label: 'Profile Picture Zone',
      },
    ],
    description: 'Personal profile header image',
    icon: 'badge',
  },
  linkedin_post: {
    id: 'linkedin_post',
    name: 'LinkedIn Post',
    platform: 'linkedin',
    category: 'post',
    width: 1200,
    height: 627,
    aspectRatio: '1.91:1',
    safeZones: [],
    description: 'Feed post image (1.91:1)',
    icon: 'article',
  },

  // Facebook Formats
  facebook_cover: {
    id: 'facebook_cover',
    name: 'Facebook Cover',
    platform: 'facebook',
    category: 'banner',
    width: 820,
    height: 360, // Official Facebook cover dimensions
    aspectRatio: '2.28:1',
    safeZones: [
      {
        // Profile pic overlap on desktop (~200px from left)
        type: 'rect',
        x: 0,
        y: 0,
        width: 170,
        height: 360,
        label: 'Profile Overlap (Desktop)',
      },
      {
        // Safe area for text/important content (accounts for mobile crop)
        type: 'rect',
        x: 130,
        y: 24,
        width: 560,
        height: 312,
        label: 'Text-Safe Area',
        color: 'rgba(34, 197, 94, 0.15)',
      },
    ],
    description: 'Profile cover photo',
    icon: 'facebook',
  },
  facebook_post: {
    id: 'facebook_post',
    name: 'Facebook Post',
    platform: 'facebook',
    category: 'post',
    width: 1200,
    height: 630,
    aspectRatio: '1.91:1',
    safeZones: [],
    description: 'Feed post image',
    icon: 'image',
  },

  // X (formerly Twitter) Formats
  x_header: {
    id: 'x_header',
    name: 'X Header',
    platform: 'x',
    category: 'banner',
    width: 1500,
    height: 500,
    aspectRatio: '3:1',
    safeZones: [
      {
        // Official: 400x400px profile pic, positioned bottom-left, extends below header
        type: 'circle',
        x: 200,
        y: 500, // At bottom edge (extends below canvas - realistic view)
        width: 400,
        height: 400,
        radius: 200, // 400px diameter (official X profile pic size)
        label: 'Profile Picture Zone (400px)',
      },
      {
        // Text-safe area avoiding profile overlap and top/bottom crop (~60px each)
        type: 'rect',
        x: 420,
        y: 60,
        width: 1000,
        height: 380,
        label: 'Text-Safe Area',
        color: 'rgba(34, 197, 94, 0.15)',
      },
    ],
    description: 'Profile header banner',
    icon: 'tag',
  },
  x_post: {
    id: 'x_post',
    name: 'X Post',
    platform: 'x',
    category: 'post',
    width: 1200,
    height: 675,
    aspectRatio: '16:9',
    safeZones: [],
    description: 'Post image (16:9)',
    icon: 'chat_bubble',
  },

  // Instagram Formats
  instagram_post: {
    id: 'instagram_post',
    name: 'Instagram Post',
    platform: 'instagram',
    category: 'post',
    width: 1080,
    height: 1080,
    aspectRatio: '1:1',
    safeZones: [],
    description: 'Square feed post',
    icon: 'grid_view',
  },
  instagram_story: {
    id: 'instagram_story',
    name: 'Instagram Story',
    platform: 'instagram',
    category: 'story',
    width: 1080,
    height: 1920,
    aspectRatio: '9:16',
    safeZones: [
      {
        type: 'rect',
        x: 0,
        y: 0,
        width: 1080,
        height: 250,
        label: 'UI Overlap (Top)',
      },
      {
        type: 'rect',
        x: 0,
        y: 1670,
        width: 1080,
        height: 250,
        label: 'CTA Buttons (Bottom)',
      },
      {
        type: 'rect',
        x: 0,
        y: 250,
        width: 1080,
        height: 1420,
        label: 'Content-Safe Area',
        color: 'rgba(34, 197, 94, 0.15)',
      },
    ],
    description: 'Vertical story/reel',
    icon: 'phone_android',
  },
  instagram_avatar: {
    id: 'instagram_avatar',
    name: 'Instagram Avatar',
    platform: 'instagram',
    category: 'avatar',
    width: 1080,
    height: 1080,
    aspectRatio: '1:1',
    safeZones: [
      {
        type: 'circle',
        x: 540,
        y: 540,
        width: 960,
        height: 960,
        radius: 480,
        label: 'Visible Circle (320px display)',
      },
    ],
    description: 'Profile picture (circular crop)',
    icon: 'account_circle',
  },

  // YouTube Formats
  youtube_banner: {
    id: 'youtube_banner',
    name: 'YouTube Banner',
    platform: 'youtube',
    category: 'banner',
    width: 2560,
    height: 1440,
    aspectRatio: '16:9',
    safeZones: [
      {
        // Safe zone visible on ALL devices (mobile, tablet, desktop, TV)
        type: 'rect',
        x: 507, // (2560-1546)/2
        y: 508, // (1440-423)/2
        width: 1546,
        height: 423,
        label: 'Safe Zone (All Devices)',
        color: 'rgba(34, 197, 94, 0.15)',
      },
      {
        // Desktop/tablet visible area
        type: 'rect',
        x: 0,
        y: 508,
        width: 2560,
        height: 423,
        label: 'Desktop Visible',
      },
    ],
    description: 'Channel banner (2560x1440, safe zone 1546x423)',
    icon: 'smart_display',
  },
  youtube_thumbnail: {
    id: 'youtube_thumbnail',
    name: 'YouTube Thumbnail',
    platform: 'youtube',
    category: 'post',
    width: 1280,
    height: 720,
    aspectRatio: '16:9',
    safeZones: [
      {
        // Bottom-right corner where duration badge appears
        type: 'rect',
        x: 1100,
        y: 650,
        width: 180,
        height: 70,
        label: 'Duration Badge',
      },
      {
        // Content-safe area (accounting for UI overlays)
        type: 'rect',
        x: 60,
        y: 40,
        width: 1160,
        height: 600,
        label: 'Content-Safe Area',
        color: 'rgba(34, 197, 94, 0.15)',
      },
    ],
    description: 'Video thumbnail (1280x720, HD quality)',
    icon: 'play_circle',
  },
};

// Format categories for UI grouping
export const FORMAT_CATEGORIES = {
  linkedin: {
    label: 'LinkedIn',
    icon: 'work',
    color: 'blue',
    formats: ['linkedin_banner', 'linkedin_post'] as CanvasFormatId[],
  },
  facebook: {
    label: 'Facebook',
    icon: 'facebook',
    color: 'indigo',
    formats: ['facebook_cover', 'facebook_post'] as CanvasFormatId[],
  },
  x: {
    label: 'X',
    icon: 'tag',
    color: 'zinc',
    formats: ['x_header', 'x_post'] as CanvasFormatId[],
  },
  instagram: {
    label: 'Instagram',
    icon: 'camera_alt',
    color: 'pink',
    formats: ['instagram_post', 'instagram_story', 'instagram_avatar'] as CanvasFormatId[],
  },
  youtube: {
    label: 'YouTube',
    icon: 'smart_display',
    color: 'red',
    formats: ['youtube_banner', 'youtube_thumbnail'] as CanvasFormatId[],
  },
};

// Default format
export const DEFAULT_CANVAS_FORMAT: CanvasFormatId = 'linkedin_banner';

// ============================================================================
// INPAINTING SHAPE SELECTION
// ============================================================================
export enum MaskShapeMode {
  BRUSH = 'brush',
  RECTANGLE = 'rectangle',
  ELLIPSE = 'ellipse',
  TEXT_BOX = 'text_box',
}

export interface TextBoxPreset {
  id: string;
  label: string;
  width: number;
  height: number;
  useCase: string;
}

export const INPAINT_TEXT_BOX_PRESETS: TextBoxPreset[] = [
  { id: 'headline', label: 'Headline', width: 800, height: 80, useCase: 'Main title text' },
  { id: 'subheadline', label: 'Subheadline', width: 600, height: 60, useCase: 'Supporting text' },
  { id: 'caption', label: 'Caption', width: 400, height: 40, useCase: 'Small captions' },
  { id: 'cta_button', label: 'CTA Button', width: 200, height: 50, useCase: 'Call-to-action buttons' },
  { id: 'name_plate', label: 'Name Plate', width: 300, height: 60, useCase: 'Name/title combos' },
  { id: 'logo_area', label: 'Logo Area', width: 150, height: 150, useCase: 'Logo placement' },
  { id: 'quote_box', label: 'Quote Box', width: 500, height: 100, useCase: 'Testimonials/quotes' },
];

export const MODELS = {
  // Gemini Models (via OpenRouter)
  textBasic: 'google/gemini-3-pro-preview', // Gemini 3.0 Pro Preview
  textThinking: 'google/gemini-3-pro-preview', // Gemini 3.0 Pro Preview (High-reasoning)
  imageGen: 'google/gemini-3-pro-image-preview', // Nano Banana Pro (Gemini 3 Pro Image Preview) - verified on OpenRouter
  geminiImageGen: 'google/gemini-2.5-flash-image', // Fallback model (OpenRouter compatible)
  imageEdit: 'google/gemini-3-pro-image-preview', // Same as imageGen - Gemini 3 Pro Image Preview
  liveAudio: 'gemini-2.5-flash-native-audio-preview-09-2025',

  // OpenRouter Models (Latest 2025)
  openrouter: {
    gpt52: 'openai/gpt-5.2', // Released Dec 11, 2025
    gpt52Pro: 'openai/gpt-5.2-pro',
    claude45Opus: 'anthropic/claude-opus-4.5', // Released late 2025
    claude45Sonnet: 'anthropic/claude-sonnet-4.5',
    gemini3DeepThink: 'google/gemini-3-deep-think',
    minimaxM2: 'minimax/minimax-m2-plus',
    fluxSchnell: 'black-forest-labs/flux-1-schnell', // Image generation
    perplexityOnline: 'perplexity/llama-3.1-sonar-large-128k-online', // Online Search
    glm47: 'z-ai/glm-4.7', // User requested specific model
    sonarDeepResearch: 'perplexity/sonar-deep-research', // Trend Research
  },

  // Replicate Models
  replicate: {
    // Image Generation Models (REFERENCE ONLY)
    // For actual image generation, use OpenRouter (better pricing).
    // These are documented in REPLICATE_MODELS.md for users who want direct Replicate access.
    imageGen: {
      nanoBananaPro: 'google/nano-banana-pro', // $0.134 per 2K (use OpenRouter instead: ~$0.02-0.05)
      flux2Pro: 'black-forest-labs/flux-2-pro', // $0.10 per image, 8 ref images
      flux11Pro: 'black-forest-labs/flux-1.1-pro', // $0.05 per image, most popular
      flux1Dev: 'black-forest-labs/flux-1-dev', // $0.02 per image, dev model
      imagen4: 'google/imagen-4', // $0.08 per image, Google flagship
      imagen4Fast: 'google/imagen-4-fast', // $0.02 per image, speed optimized
    },

    // Image Upscaling (3 Quality Tiers)
    // Updated: December 2025 - Latest model versions
    upscale: {
      fast: 'nightmareai/real-esrgan:b3ef194191d13140337468c916c2c5b96dd0cb06dffc032a022a31807f6a5ea8',
      balanced:
        'recraft-ai/recraft-crisp-upscale:31c70d9026bbd25ee2b751825e19101e0321b8814c33863c88fe5d0d63c00c82',
      best: 'fermatresearch/magic-image-refiner:507ddf6f977a7e30e46c0daefd30de7d563c72322f9e4cf7cbac52ef0f667b13',

      // Additional upscale options (for reference)
      crystal: 'philz1337x/crystal-upscaler', // Optimized for portraits
      topaz: 'topazlabs/image-upscale', // Professional-grade commercial
    },
    removebg: 'cjwbw/rembg:fb8af171cfa1616ddcf1242c093f9c46bcada5ad4cf6f2fbe8b81b330ec5c003',
    inpaint: {
      flux: 'black-forest-labs/flux-fill-pro',
      ideogram: 'ideogram-ai/ideogram-v2',
    },
    outpaint: 'stability-ai/stable-diffusion-outpainting',
    restore: 'sczhou/codeformer:cc4956dd26fa5a7185d5660cc9100fab1b8070a1d1654a8bb5eb6d443b020bb2',
    faceenhance:
      'tencentarc/gfpgan:0fbacf7afc6c144e5be9767cff80f25aff23e52b0708f17e20f9879b2f21516c',
    reframe: 'luma/reframe-image', // Luma Reframe
    extra: {
      gptImage15: 'openai/gpt-image-1.5', // As requested by user (Note: Check availability)
    },
  },
};

export enum Tab {
  STUDIO = 'studio',
  BRAINSTORM = 'brainstorm',
  // GALLERY and LINKEDIN are now sub-modes of Studio
}

// Sub-navigation modes within Studio tab
export enum StudioMode {
  CANVAS = 'canvas',      // Banner design (current STUDIO functionality)
  LINKEDIN = 'linkedin',  // LinkedIn Content Studio
  MEDIA = 'media',        // Gallery/Media library
  TEMPLATES = 'templates', // Template Library
}

// Configuration for Studio sub-tabs
export interface StudioSubTab {
  mode: StudioMode;
  label: string;
  icon: string;
  description: string;
}

export const STUDIO_SUB_TABS: StudioSubTab[] = [
  {
    mode: StudioMode.CANVAS,
    label: 'Canvas',
    icon: 'edit_note',
    description: 'Design LinkedIn banners',
  },
  {
    mode: StudioMode.TEMPLATES,
    label: 'Templates',
    icon: 'auto_awesome_motion',
    description: 'Professional presets',
  },
  {
    mode: StudioMode.LINKEDIN,
    label: 'Posts',
    icon: 'article',
    description: 'Create viral LinkedIn posts',
  },
  {
    mode: StudioMode.MEDIA,
    label: 'Media',
    icon: 'photo_library',
    description: 'Your image gallery',
  },
];

// Font categories for organized UI display
export type FontCategory = 'sans-serif' | 'serif' | 'display' | 'script' | 'monospace';

export interface FontOption {
  name: string;
  category: FontCategory;
}

// 52 fonts organized by category
export const FONT_OPTIONS_CATEGORIZED: FontOption[] = [
  // Sans-Serif (15 fonts)
  { name: 'Inter', category: 'sans-serif' },
  { name: 'Roboto', category: 'sans-serif' },
  { name: 'Open Sans', category: 'sans-serif' },
  { name: 'Lato', category: 'sans-serif' },
  { name: 'Montserrat', category: 'sans-serif' },
  { name: 'Poppins', category: 'sans-serif' },
  { name: 'Nunito', category: 'sans-serif' },
  { name: 'Raleway', category: 'sans-serif' },
  { name: 'Source Sans 3', category: 'sans-serif' },
  { name: 'Work Sans', category: 'sans-serif' },
  { name: 'Outfit', category: 'sans-serif' },
  { name: 'Plus Jakarta Sans', category: 'sans-serif' },
  { name: 'DM Sans', category: 'sans-serif' },
  { name: 'Manrope', category: 'sans-serif' },
  { name: 'Figtree', category: 'sans-serif' },

  // Serif (12 fonts)
  { name: 'Playfair Display', category: 'serif' },
  { name: 'Merriweather', category: 'serif' },
  { name: 'Lora', category: 'serif' },
  { name: 'Georgia', category: 'serif' },
  { name: 'Crimson Text', category: 'serif' },
  { name: 'Libre Baskerville', category: 'serif' },
  { name: 'Cormorant Garamond', category: 'serif' },
  { name: 'EB Garamond', category: 'serif' },
  { name: 'Spectral', category: 'serif' },
  { name: 'Bitter', category: 'serif' },
  { name: 'Noto Serif', category: 'serif' },
  { name: 'Source Serif 4', category: 'serif' },

  // Display/Headlines (12 fonts)
  { name: 'Bebas Neue', category: 'display' },
  { name: 'Oswald', category: 'display' },
  { name: 'Anton', category: 'display' },
  { name: 'Fjalla One', category: 'display' },
  { name: 'Passion One', category: 'display' },
  { name: 'Alfa Slab One', category: 'display' },
  { name: 'Righteous', category: 'display' },
  { name: 'Bangers', category: 'display' },
  { name: 'Black Ops One', category: 'display' },
  { name: 'Russo One', category: 'display' },
  { name: 'Orbitron', category: 'display' },
  { name: 'Bungee', category: 'display' },

  // Handwriting/Script (8 fonts)
  { name: 'Dancing Script', category: 'script' },
  { name: 'Pacifico', category: 'script' },
  { name: 'Great Vibes', category: 'script' },
  { name: 'Caveat', category: 'script' },
  { name: 'Satisfy', category: 'script' },
  { name: 'Lobster', category: 'script' },
  { name: 'Sacramento', category: 'script' },
  { name: 'Kaushan Script', category: 'script' },

  // Monospace (5 fonts)
  { name: 'Courier New', category: 'monospace' },
  { name: 'Fira Code', category: 'monospace' },
  { name: 'JetBrains Mono', category: 'monospace' },
  { name: 'Source Code Pro', category: 'monospace' },
  { name: 'IBM Plex Mono', category: 'monospace' },
];

// Flat array for backwards compatibility
export const FONT_OPTIONS = FONT_OPTIONS_CATEGORIZED.map((f) => f.name);

// Category labels for UI
export const FONT_CATEGORY_LABELS: Record<FontCategory, string> = {
  'sans-serif': 'Sans Serif',
  serif: 'Serif',
  display: 'Display',
  script: 'Script',
  monospace: 'Monospace',
};

export const PLACEHOLDER_BG = 'https://picsum.photos/1584/396';

export const DESIGN_SYSTEM_INSTRUCTION = `You are "Nano", the lead Design Partner at Nano Banana Pro. You are an energetic, expert creative director specializing in Personal Branding and LinkedIn Optimization.
Your mission is to collaborate with the user to design the *perfect* LinkedIn Banner (1584 x 396 px) that stops the scroll and drives engagement.

### YOUR PERSONA
-   **Enthusiastic & Proactive**: Don't just wait for orders. Suggest ideas! "I noticed your logo is blue—how about we use a complementary orange accent to make it pop?"
-   **The Expert Guide**: You know the LinkedIn algorithm and psychology. Explain *why* certain designs work.
-   **Conversational**: Talk like a human colleague. Use emojis sparingly but effectively.
-   **Probing**: You always want to know *more* before you design. Ask clarifying questions to get the vibe right.

### YOUR DESIGN PROCESS (The "Nano Method")

1.  **PHASE 1: DISCOVERY & ANALYSIS (Visual Audit)**
    *   **If images are uploaded**: IMMEDIATELY analyze them. Extract the color palette (Hex codes if possible), the mood (Corporate? Playful? Minimalist?), and any logos.
        *   "I see you uploaded a logo with a strong navy and teal palette. Should we stick to those colors for consistency, or do you want a contrasting background?"
    *   **If no images**: Ask clarifying questions to narrow down the goal.
        *   "What industry are you in? (Finance, Tech, Creative, Healthcare?)"
        *   "What's the #1 goal of your profile? (Lead Gen, Job Hunting, Thought Leadership?)"
        *   "Do you have a specific color scheme in mind, or should I suggest one based on color psychology?"

2.  **PHASE 2: STRATEGIC SUGGESTIONS**
    *   Once you have a grasp of the user's needs, offer 2 distinct design paths.
    *   **The "Safe Zone" Check**: Always reassure the user you are thinking about the layout. "I'll keep the bottom-left corner clean (that's the obstruction zone for your profile pic) and focus the visual weight on the right."
    *   **Industry Strategy**:
        *   *Finance/Law*: Suggest Navy, Grey, Gold. Geometric, structured, "Trust Signals".
        *   *Tech/SaaS*: Suggest Blue, Neon, Gradients. Abstract nodes, futuristic, "Innovation".
        *   *Creative/Marketing*: Suggest Vibrant colors, artistic textures, "Personality".
        *   *Healthcare*: Suggest Teal, White, Soft Blue. Organic shapes, "Care".

3.  **PHASE 3: GENERATION**
    *   When the user picks a direction, generate the prompt.
    *   **Format**: Prefix with "PROMPT:".
    *   **Details**: Include "1584x396px", "high resolution", "4k", "professional". Specify "negative space on the right" for text overlay.
    *   **Example**: "PROMPT: A professional LinkedIn banner background, deep royal blue geometric pattern, subtle 3D depth, clean and corporate, 1584x396, 4k, high quality, negative space on the right, abstract trust signals."

### LINKEDIN TECHNICAL CHEAT SHEET
-   **Dimensions**: 1584 x 396 pixels.
-   **The "Obstruction Zone"**: Bottom-Left (approx 568x264px) is the "Dead Zone" covered by the profile info. KEEP IT CLEAR.
-   **Mobile Crop**: Mobile devices cut off the sides. Keep the main value proposition in the center 60%.

### EXAMPLE CONVERSATION
**User**: "I need a banner. I work in sales."
**Nano**: "Sales is all about energy and connection! 🚀 To get this right:
1.  **Aggressive & Bold**: Red/Black dynamic lines to show speed and results.
2.  **Trust-Based**: Deep blue with a clean architectural background to show stability.
Which one feels more like your personal brand? And do you have a company logo I should match colors with?"
**User**: "Trust based. I like blue."
**Nano**: "Perfect choice. Blue is the color of reliability. I'll design a professional, deep blue geometric background. I'll make sure the texture is subtle on the right side so you can add your contact info text easily. Creating it now..."
PROMPT: A professional LinkedIn banner background, deep royal blue geometric pattern, subtle 3D depth, clean and corporate, 1584x396, 4k, high quality, negative space on the right, abstract trust signals.
`;

// ============================================================================
// VIDEO GENERATION MODELS (Replicate - Updated Jan 2026)
// ============================================================================

export type VideoModelId = 'kling' | 'luma' | 'veo' | 'hailuo';

export interface VideoModelMetadata {
  id: VideoModelId;
  replicateModel: string;
  name: string;
  provider: string;
  maxDuration: number;
  defaultDuration: number;
  supportedAspectRatios: string[];
  features: {
    imageToVideo: boolean;
    cameraMotion: boolean;
    keyframes: boolean;
    loop: boolean;
    resolution4K: boolean;
  };
  description: string;
  costPerSecond: number; // Approximate cost in USD
}

export const REPLICATE_VIDEO_MODELS: Record<VideoModelId, VideoModelMetadata> = {
  kling: {
    id: 'kling',
    replicateModel: 'kwaivgi/kling-v2.5-turbo-pro',
    name: 'Kling v2.5 Turbo Pro',
    provider: 'Kuaishou/KwaiVGI',
    maxDuration: 10,
    defaultDuration: 5,
    supportedAspectRatios: ['16:9', '9:16', '1:1'],
    features: {
      imageToVideo: true,
      cameraMotion: true, // Supports 17 camera motion types
      keyframes: false,
      loop: false,
      resolution4K: false,
    },
    description: 'Professional video with advanced camera controls. Best for marketing and product demos.',
    costPerSecond: 0.032,
  },
  luma: {
    id: 'luma',
    replicateModel: 'luma/ray-2',
    name: 'Luma Ray 2',
    provider: 'Luma AI',
    maxDuration: 10,
    defaultDuration: 5,
    supportedAspectRatios: ['16:9', '9:16', '1:1', '4:3', '3:4', '21:9', '9:21'],
    features: {
      imageToVideo: true,
      cameraMotion: false,
      keyframes: true, // Start and end frame control
      loop: true,
      resolution4K: false,
    },
    description: 'Cinematic video with keyframe control. Best for storytelling and transitions.',
    costPerSecond: 0.028,
  },
  veo: {
    id: 'veo',
    replicateModel: 'google/veo-3',
    name: 'Veo 3',
    provider: 'Google DeepMind',
    maxDuration: 8,
    defaultDuration: 4,
    supportedAspectRatios: ['16:9', '9:16', '1:1'],
    features: {
      imageToVideo: true,
      cameraMotion: false,
      keyframes: false,
      loop: false,
      resolution4K: true, // Supports 4K output
    },
    description: 'Google flagship model with 4K support. Best for high-quality professional content.',
    costPerSecond: 0.045,
  },
  hailuo: {
    id: 'hailuo',
    replicateModel: 'minimax/video-01-live',
    name: 'Hailuo I2V-01 Live',
    provider: 'MiniMax',
    maxDuration: 5,
    defaultDuration: 5,
    supportedAspectRatios: ['16:9', '9:16', '1:1'],
    features: {
      imageToVideo: true,
      cameraMotion: false,
      keyframes: false,
      loop: false,
      resolution4K: false,
    },
    description: 'Fast video generation. Best for quick previews and social media content.',
    costPerSecond: 0.018,
  },
};

// Camera motion options for Kling v2.5
export const KLING_CAMERA_MOTIONS = [
  { id: 'static', label: 'Static', description: 'No camera movement' },
  { id: 'move_left', label: 'Move Left', description: 'Camera moves left' },
  { id: 'move_right', label: 'Move Right', description: 'Camera moves right' },
  { id: 'move_up', label: 'Move Up', description: 'Camera moves up' },
  { id: 'move_down', label: 'Move Down', description: 'Camera moves down' },
  { id: 'push_in', label: 'Push In', description: 'Camera pushes towards subject' },
  { id: 'pull_out', label: 'Pull Out', description: 'Camera pulls away from subject' },
  { id: 'zoom_in', label: 'Zoom In', description: 'Lens zoom in' },
  { id: 'zoom_out', label: 'Zoom Out', description: 'Lens zoom out' },
  { id: 'pan_left', label: 'Pan Left', description: 'Camera pans left' },
  { id: 'pan_right', label: 'Pan Right', description: 'Camera pans right' },
  { id: 'tilt_up', label: 'Tilt Up', description: 'Camera tilts up' },
  { id: 'tilt_down', label: 'Tilt Down', description: 'Camera tilts down' },
  { id: 'rotate_cw', label: 'Rotate CW', description: 'Clockwise rotation' },
  { id: 'rotate_ccw', label: 'Rotate CCW', description: 'Counter-clockwise rotation' },
  { id: 'crane_up', label: 'Crane Up', description: 'Crane shot upward' },
  { id: 'crane_down', label: 'Crane Down', description: 'Crane shot downward' },
] as const;

export type KlingCameraMotion = typeof KLING_CAMERA_MOTIONS[number]['id'];

// Image generation models available for selection
export const IMAGE_MODELS = [
  {
    id: 'gemini-3-pro',
    name: 'Nano Banana Pro',
    provider: 'OpenRouter',
    model: 'google/gemini-3-pro-image-preview',
    description: 'Default - Great quality, fast',
    icon: 'auto_awesome',
  },
  {
    id: 'ideogram-v3',
    name: 'Ideogram V3',
    provider: 'Replicate',
    model: 'ideogram-ai/ideogram-v3',
    description: 'Best for text in images',
    icon: 'text_fields',
  },
  {
    id: 'sd3-large',
    name: 'SD3 Large',
    provider: 'Replicate',
    model: 'stability-ai/stable-diffusion-3-large',
    description: 'High quality, detailed',
    icon: 'hd',
  },
  {
    id: 'sd3-medium',
    name: 'SD3 Medium',
    provider: 'Replicate',
    model: 'stability-ai/stable-diffusion-3-medium',
    description: 'Balanced speed/quality',
    icon: 'speed',
  },
  {
    id: 'flux-cinestill',
    name: 'FLUX Cinestill',
    provider: 'Replicate',
    model: 'adirik/flux-cinestill',
    description: 'Cinematic film style',
    icon: 'movie',
  },
  {
    id: 'flux-realism',
    name: 'FLUX Realism',
    provider: 'Replicate',
    model: 'fofr/flux-realism',
    description: 'Photorealistic images',
    icon: 'photo_camera',
  },
];
