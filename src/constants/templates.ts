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

// --- GENERATION CONFIGURATION ---

const INDUSTRIES = [
  'Technology', 'Finance', 'Creative', 'Healthcare', 'Real Estate',
  'Marketing', 'Education', 'Legal', 'Fitness', 'Hospitality', 'E-commerce', 'Music'
];

const STYLES = [
  {
    id: 'minimal',
    name: 'Minimalist',
    promptMod: 'minimalist clean aesthetic, plenty of negative space, soft ambient lighting, high key photography, shot on Hasselblad X2D 100C, 55mm lens, sharp focus, 8k',
    textColor: '#1e293b'
  },
  {
    id: 'corporate',
    name: 'Corporate',
    promptMod: 'professional corporate setting, modern glass architecture, depth of field, confident atmosphere, shot on Canon EOS R5, 35mm f/1.4 lens, cinematic lighting, 8k',
    textColor: '#0f172a'
  },
  {
    id: 'dark',
    name: 'Dark Mode',
    promptMod: 'sleek dark mode aesthetic, neon accents, cybernetic undertones, volumetric fog, dramatic rim lighting, low key phtography, shot on Sony A7S III, 24mm G Master lens, 8k',
    textColor: '#f8fafc'
  },
  {
    id: 'luxury',
    name: 'Luxury',
    promptMod: 'high-end luxury vibe, gold and marble textures, elegant composition, warm golden hour lighting, rich details, shot on Fujifilm GFX 100S, 110mm f/2 lens, bokeh, 8k',
    textColor: '#ffffff'
  },
  {
    id: 'vibrant',
    name: 'Vibrant',
    promptMod: 'energetic and vibrant colors, dynamic motion blur, artistic composition, studio lighting with gels, creative and bold, shot on Nikon Z9, 50mm f/1.2 lens, 8k, highly detailed',
    textColor: '#ffffff'
  },
  {
    id: 'ultra-premium',
    name: 'Ultra Premium',
    promptMod: 'award-winning architectural photography, hyper-realistic, 8k resolution, ray tracing global illumination, expensive materials, platinum and obsidian accents, cinematic depth of field, shot on Phase One XF IQ4 150MP, studio perfection',
    textColor: '#ffffff'
  },
  {
    id: '3d-render',
    name: '3D Render',
    promptMod: '3d render, octane render, cinema 4d, unreal engine 5, abstract geometric shapes, floating elements, glass dispersion, subsurface scattering, soft studio lighting, clay material, matte background, 8k, masterpiece',
    textColor: '#ffffff'
  }
];

const INDUSTRY_SUBJECTS: Record<string, string> = {
  'Technology': 'abstract data streams, circuit board background, futuristic server room, coding interface overlays',
  'Finance': 'abstract financial graphs, stock market bull, modern skyscraper low angle, gold coin macro shot',
  'Creative': 'abstract paint splash, designer workspace, colorful geometric shapes, artistic fluid gradients',
  'Healthcare': 'clean medical laboratory, dna double helix, doctor stethoscope macro, wellness spa elements',
  'Real Estate': 'modern luxury villa interior, city skyline at dusk, architectural blueprint close-up, key in door lock',
  'Marketing': 'abstract megaphone concept, social media icons floating, analytical charts rising, team collaboration blurred',
  'Education': 'stack of vintage books, library aisle, graduation cap and diploma, molecular science model',
  'Legal': 'scales of justice, wooden gavel macro, law library shelves, supreme court pillars',
  'Fitness': 'weights in gym, runner starting block, water splash on face, yoga pose silhouette',
  'Hospitality': 'luxury hotel lobby, gourmet food plating macro, cocktail glass condensation, concierge bell',
  'E-commerce': 'shopping cart abstract, delivery drone, package unboxing, credit card chip macro',
  'Music': 'vinyl record textues, microphone close-up, concert crowd silhouette, guitar strings macro'
};

// --- GENERATOR FUNCTION ---

function generateTemplates(): BannerTemplate[] {
  const templates: BannerTemplate[] = [];

  // Generate a set for each industry/style combo
  INDUSTRIES.forEach(industry => {
    STYLES.forEach(style => {
      // 1. LinkedIn Banner
      templates.push(createTemplate('linkedin', 'banner', industry, style));

      // 2. Instagram Post
      templates.push(createTemplate('instagram', 'post', industry, style));

      // 3. X Post
      templates.push(createTemplate('x', 'post', industry, style));
    });
  });

  return templates;
}

function createTemplate(
  platform: 'linkedin' | 'facebook' | 'x' | 'instagram' | 'youtube' | 'tiktok',
  type: 'banner' | 'post' | 'story',
  industry: string,
  style: typeof STYLES[number]
): BannerTemplate {
  const subject = INDUSTRY_SUBJECTS[industry] || 'abstract professional background';

  // Construct the prompt
  const prompt = `${subject}, ${style.promptMod}, ${industry} theme, photorealistic, 8k uhd, highly detailed, professional composition`;

  // Text positioning based on type
  let elements: Partial<BannerElement>[] = [];
  if (type === 'banner') {
    elements = [
      {
        type: 'text',
        content: `${industry} Excellence`,
        x: 800,
        y: 150,
        fontSize: 60,
        fontWeight: '900',
        color: style.textColor,
        textAlign: 'center',
      },
      {
        type: 'text',
        content: `${style.name} Template`,
        x: 800,
        y: 220,
        fontSize: 30,
        fontWeight: '500',
        color: style.textColor,
        textAlign: 'center',
      }
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
        color: style.textColor,
        textAlign: 'center',
      }
    ];
  }

  // Deterministic ID: platform-industry-style-type
  const id = `${platform}-${industry.toLowerCase()}-${style.id}-${type}`;

  return {
    id,
    title: `${industry} ${style.name} ${type === 'banner' ? 'Banner' : 'Post'}`,
    industry,
    description: `A ${style.id} design for ${industry} professionals. Optimized for ${platform}.`,
    backgroundUrl: `/assets/banners/${id}.png`,
    thumbnailUrl: `/assets/banners/${id}.png`,
    prompt,
    platform,
    type,
    elements
  };
}

// Generate the list once
export const BANNER_TEMPLATES: BannerTemplate[] = generateTemplates();
