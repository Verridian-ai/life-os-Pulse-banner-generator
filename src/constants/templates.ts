import { BannerElement } from '../types';

export interface BannerTemplate {
  id: string;
  title: string;
  industry: string;
  description: string;
  backgroundUrl: string;
  elements: Partial<BannerElement>[];
  thumbnailUrl: string;
  prompt: string;
  platform: 'linkedin' | 'facebook' | 'x' | 'instagram' | 'youtube' | 'tiktok';
  type: 'banner' | 'post' | 'story';
}

// --- NANO BANANA PRO CONFIGURATION ---

const INDUSTRIES = [
  'Technology',
  'Finance',
  'Creative',
  'Healthcare',
  'Real Estate',
  'Marketing',
  'Education',
  'Legal',
  'Fitness',
  'Hospitality',
  'E-commerce',
  'Music',
];

interface NanoStyle {
  id: string;
  label: string;
  camera: string;
  lens: string;
  lighting: string;
  film: string;
  anchor: string; // Filename anchor
  promptMod: string; // Visual description filler
}

// ------------------------------------------------------------------
// NANO BANANA PRO: THE SECRET KEYWORD ARSENAL (EXPANDED)
// ------------------------------------------------------------------

const STYLES: NanoStyle[] = [
  {
    id: 'minimal',
    label: 'Minimalist Tech',
    camera: 'Hasselblad X2D 100C',
    lens: '80mm f/1.9',
    lighting: 'soft natural window lighting with subtle cool fill',
    film: 'Kodak Portra 400',
    anchor: 'IMG_2847.HEIC',
    promptMod:
      'minimalist composition, vast negative space, matte textures, clean geometric lines, zen-like atmosphere, architectural purity, soft shadows, high-key lighting',
  },
  {
    id: 'corporate',
    label: 'Modern Corporate',
    camera: 'Canon EOS R5',
    lens: '35mm f/1.4',
    lighting: 'professional studio softbox lighting',
    film: 'Kodak Ektar 100',
    anchor: 'IMG_4022.CR3',
    promptMod:
      'modern corporate atmosphere, glass architecture, confident energy, deep perspective, platinum and obsidian accents, sharp focus, executive aesthetic',
  },
  {
    id: 'dark',
    label: 'Neon Noir (Dark Mode)',
    camera: 'Sony A1',
    lens: '50mm f/1.2 GM',
    lighting: 'cybernetic blue neon rim lights with volumetric fog',
    film: 'CineStill 800T',
    anchor: 'DSC_9934.NEF',
    promptMod:
      'dark mode aesthetic, deep shadows, tech-noir atmosphere, rain-slicked surfaces, holographic reflections, moody chiaroscuro, cinematic depth',
  },
  {
    id: 'luxury',
    label: 'Architectural Luxury',
    camera: 'ARRI ALEXA 65',
    lens: 'Canon RF 15-35mm f/2.8',
    lighting: 'warm golden hour cinematic lighting',
    film: 'Kodak Vision3 500T',
    anchor: '_MG_8821.CR3',
    promptMod:
      'art deco futurism, biblical grandeur, opulent textures of marble and gold, sleek furniture, soft organic shapes, mesmerizing geometric patterns, designcore masterpiece',
  },
  {
    id: 'vibrant',
    label: 'Ethereal Futurist',
    camera: 'Leica M10-R',
    lens: 'Noctilux-M 50mm f/0.95',
    lighting: 'bioluminescent glow with neon fractal patterns',
    film: 'Fujifilm Velvia 50',
    anchor: 'IMG_3392.HEIC',
    promptMod:
      'ethereal trails of light, quantum energy ripples, iridescent scale patterns, magnetic atmosphere, translucent surfaces, celestial harmony, dreamlike bokeh',
  },
  {
    id: 'cinematic',
    label: 'Cinematic Documentary',
    camera: 'Leica Summilux-M',
    lens: '35mm f/1.4 ASPH',
    lighting: 'dramatic natural chiaroscuro',
    film: 'Ilford HP5 Plus',
    anchor: 'DSC_1102.NEF',
    promptMod:
      'award-winning documentary photography, tactile details, raw emotion, intimate perspective, cinematic composition, timeless quality, magical realism',
  },
  {
    id: '3d-render',
    label: '3D Pixar/Dreamworks',
    camera: 'Virtual Camera',
    lens: '50mm Prime',
    lighting: 'Octane Render global illumination',
    film: 'Digital Render',
    anchor: 'render.png',
    promptMod:
      'Pixar style animation, vibrant color gradients, plush doll art texture, detailed miniatures, enchanting lighting, smooth clay render, Unreal Engine 5 Lumen, whimsical and polished',
  },
];

// Expanded Industry Subjects for "Nano Banana Pro" richness
const INDUSTRY_SUBJECTS: Record<string, string> = {
  technology:
    'a futuristic server room datacenter with overlaying abstract data streams and holographic circuit board patterns, humming with quantum energy',
  marketing:
    'a creative modern workspace with mood boards, branding materials, and scattered sketches, bathed in inspiring northern light',
  finance:
    'a high-stakes trading floor with panoramic city views, screens displaying complex fractal market data, atmosphere of intense focus and wealth',
  consulting:
    'an executive boardroom with floor-to-ceiling windows overlooking a metropolis at twilight, reflecting strategy and power',
  healthcare:
    'a pristine, advanced medical laboratory with molecular holograms and white futuristic equipment, symbolizing hope and precision',
  education:
    'a modern sunlit library with floating digital knowledge nodes and students collaborating in a futuristic learning pod',
  creative:
    'an artist loft exploding with color, paint splatters suspended in mid-air, bohemian vibrancy, chaotic yet beautiful',
  'real-estate':
    'a breathtaking luxury villa interior facing the ocean, infinity pool horizon, ultra-high-end furniture, golden hour serenity',
};

// --- GENERATOR FUNCTION ---

function generateTemplates(): BannerTemplate[] {
  const templates: BannerTemplate[] = [];

  // Generate a set for each industry/style combo
  INDUSTRIES.forEach((industry) => {
    STYLES.forEach((style) => {
      // 1. LinkedIn Banner
      templates.push(createTemplate('linkedin', 'banner', industry, style));

      // 2. Instagram Post
      templates.push(createTemplate('instagram', 'post', industry, style));

      // 3. X Post
      templates.push(createTemplate('x', 'post', industry, style));

      // 4. TikTok Post (9:16 Vertical video/image)
      templates.push(createTemplate('tiktok', 'post', industry, style));

      // 5. YouTube Banner (16:9)
      templates.push(createTemplate('youtube', 'banner', industry, style)); // treating youtube as banner type for 16:9
    });
  });

  return templates;
}

function createTemplate(
  platform: 'linkedin' | 'facebook' | 'x' | 'instagram' | 'youtube' | 'tiktok',
  type: 'banner' | 'post' | 'story',
  industry: string,
  style: (typeof STYLES)[number],
): BannerTemplate {
  const subject =
    INDUSTRY_SUBJECTS[industry.toLowerCase()] || `${industry} professional conceptual scene`;

  // --- MASTER PROMPT FORMULA ---
  // A [PUBLICATION CONTEXT] photograph of [SUBJECT] [ACTION/POSE] in/at [LOCATION] during [TIME OF DAY] with [LIGHTING],
  // shot with [CAMERA] and [LENS], [COMPOSITION], captured on [FILM STOCK], 8K resolution, photorealistic, [FILENAME ANCHOR]

  // Construct the prompt using the "Nano Banana Pro" formula
  const prompt = `${style.promptMod}, ${subject}, ${style.lighting}, shot on ${style.camera} with ${style.lens}, ${style.film} film look, 8k resolution, photorealistic, ${style.anchor}`;

  // Text positioning based on type
  let elements: Partial<BannerElement>[] = [];
  // Default text color (can be overridden if needed, but removed from style for now)
  const defaultTextColor = '#ffffff'; // A neutral default

  if (type === 'banner') {
    elements = [
      {
        type: 'text',
        content: `${industry} Excellence`,
        x: 800,
        y: 150,
        fontSize: 60,
        fontWeight: '900',
        color: defaultTextColor,
        textAlign: 'center',
      },
      {
        type: 'text',
        content: `${style.label} Template`,
        x: 800,
        y: 220,
        fontSize: 30,
        fontWeight: '500',
        color: defaultTextColor,
        textAlign: 'center',
      },
    ];
  } else {
    // Post/Story
    elements = [
      {
        type: 'text',
        content: `New in ${industry}`,
        x: 500,
        y: 500, // Center-ish for posts
        fontSize: 80,
        fontWeight: '900',
        color: defaultTextColor,
        textAlign: 'center',
      },
    ];
  }

  // Deterministic ID: platform-industry-style-type
  // Consistent with the file naming convention we found in the assets folder
  const id = `${platform}-${industry.toLowerCase()}-${style.id}-${type}`;

  return {
    id,
    title: `${industry} ${style.label} ${type === 'banner' ? 'Banner' : 'Post'}`,
    industry,
    description: `A ${style.id} design for ${industry} professionals. Optimized for ${platform}.`,
    backgroundUrl: `/assets/banners/${id}.png`,
    thumbnailUrl: `/assets/banners/${id}.png`,
    prompt,
    platform,
    type,
    elements,
  };
}

// Generate the list once
import { GENERATED_LOGO_TEMPLATES } from './generated_logo_templates';

// Generate the list once
export const BANNER_TEMPLATES: BannerTemplate[] = [
  ...generateTemplates(),
  ...(GENERATED_LOGO_TEMPLATES as BannerTemplate[]),
];
