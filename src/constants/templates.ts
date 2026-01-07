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
}

export const BANNER_TEMPLATES: BannerTemplate[] = [
  {
    id: 'tech-minimal',
    title: 'Tech Minimalist',
    industry: 'Technology',
    description: 'Clean, modern tech vibe with a focus on core value.',
    backgroundUrl: '/assets/banners/tech_minimal_banner_1767818941869.png',
    thumbnailUrl: '/assets/banners/tech_minimal_banner_1767818941869.png',
    prompt: 'Minimalist technology background, abstract circuit patterns, deep blue and teal neon glow, dark sleek cybernetic aesthetic, high tech, futuristic, 8k resolution',
    elements: [
      {
        type: 'text',
        content: 'Engineering the Future',
        x: 800,
        y: 150,
        fontSize: 56,
        fontWeight: '900',
        color: '#ffffff',
        textAlign: 'center',
      },
      {
        type: 'text',
        content: 'Full Stack Developer | AI Enthusiast',
        x: 800,
        y: 220,
        fontSize: 24,
        fontWeight: '500',
        color: '#3b82f6',
        textAlign: 'center',
      }
    ]
  },
  {
    id: 'finance-trust',
    title: 'Corporate Trust',
    industry: 'Finance',
    description: 'Professional and stable look for financial experts.',
    backgroundUrl: '/assets/banners/finance_trust_banner_1767818956850.png',
    thumbnailUrl: '/assets/banners/finance_trust_banner_1767818956850.png',
    prompt: 'Modern architectural glass building facade, corporate skyscraper, financial district abstract, blue sky reflection, professional, trustworthy, clean lines, high quality photorealism',
    elements: [
      {
        type: 'text',
        content: 'Strategic Financial Advisory',
        x: 1000,
        y: 140,
        fontSize: 48,
        fontWeight: '800',
        color: '#1e293b',
        textAlign: 'left',
      },
      {
        type: 'text',
        content: 'Helping you navigate market complexity',
        x: 1000,
        y: 200,
        fontSize: 20,
        fontWeight: '400',
        color: '#475569',
        textAlign: 'left',
      }
    ]
  },
  {
    id: 'creative-portfolio',
    title: 'Creative Portfolio',
    industry: 'Design',
    description: 'Vibrant and artistic for designers and artists.',
    backgroundUrl: '/assets/banners/creative_portfolio_banner_1767818971548.png',
    thumbnailUrl: '/assets/banners/creative_portfolio_banner_1767818971548.png',
    prompt: 'Abstract liquid gradient background, vibrant pink and purple colors, fluid motion, artistic, creative studio vibe, modern graphic design style, 4k wallpaper',
    elements: [
      {
        type: 'text',
        content: 'CREATIVE DIRECTOR',
        x: 1200,
        y: 130,
        fontSize: 64,
        fontWeight: '900',
        color: '#f472b6',
        textAlign: 'right',
      },
      {
        type: 'text',
        content: 'Design • Strategy • Brand',
        x: 1200,
        y: 210,
        fontSize: 24,
        fontWeight: '600',
        color: '#ffffff',
        textAlign: 'right',
      }
    ]
  },
  {
    id: 'healthcare-modern',
    title: 'Modern Healthcare',
    industry: 'Healthcare',
    description: 'Clean and calming for medical professionals.',
    backgroundUrl: '/assets/banners/healthcare_modern_banner_1767818998181.png',
    thumbnailUrl: '/assets/banners/healthcare_modern_banner_1767818998181.png',
    prompt: 'Soft focus medical background, clean sterile environment, hint of dna helix or medical icons, light teal and white color palette, health and wellness, professional care, minimalist',
    elements: [
      {
        type: 'text',
        content: 'Innovation in Patient Care',
        x: 900,
        y: 150,
        fontSize: 48,
        fontWeight: '700',
        color: '#0d9488',
        textAlign: 'center',
      }
    ]
  },
  // Add 16 more to reach 20 as requested
  {
    id: 'marketing-impact',
    title: 'Growth Marketing',
    industry: 'Marketing',
    description: 'Data-driven and high-impact style.',
    backgroundUrl: '/assets/banners/marketing_impact_banner_1767819016117.png',
    thumbnailUrl: '/assets/banners/marketing_impact_banner_1767819016117.png',
    prompt: 'Business analytics dashboard abstract, data visualization streams, upward trending graphs overlay, professional marketing context, blue and red accents, high tech consulting',
    elements: [{ type: 'text', content: 'Scaling Brands with Data', x: 800, y: 180, fontSize: 50, fontWeight: '900', color: 'white' }]
  },
  {
    id: 'education-lead',
    title: 'Thought Leader',
    industry: 'Education',
    description: 'Academic and authoritative.',
    backgroundUrl: '/assets/banners/education_lead_banner_1767819031222.png',
    thumbnailUrl: '/assets/banners/education_lead_banner_1767819031222.png',
    prompt: 'Library or study background, stack of books, soft warm lighting, academic wisdom, knowledge and learning, blurred bookshelf background, intellectual atmosphere',
    elements: [{ type: 'text', content: 'Empowering Minds', x: 1100, y: 150, fontSize: 45, fontWeight: '800', color: '#f59e0b' }]
  },
  {
    id: 'sales-expert',
    title: 'Sales closer',
    industry: 'Sales',
    description: 'Energetic and results-oriented.',
    backgroundUrl: '/assets/banners/sales_expert_banner_1767819060592.png',
    thumbnailUrl: '/assets/banners/sales_expert_banner_1767819060592.png',
    prompt: 'Abstract dynamic business background, handshake concept, upward arrows, success and momentum, energetic orange and blue gradients, corporate achievement',
    elements: [{ type: 'text', content: 'Exceeding Targets', x: 800, y: 180, fontSize: 55, fontWeight: '900', color: 'white' }]
  },
  {
    id: 'hr-people',
    title: 'People Culture',
    industry: 'HR',
    description: 'Warm and inviting for HR professionals.',
    backgroundUrl: '/assets/banners/hr_people_banner_1767819077286.png',
    thumbnailUrl: '/assets/banners/hr_people_banner_1767819077286.png',
    prompt: 'Diverse team collaboration abstract, connecting people, network of human connections, warm and inviting office culture, soft lighting, professional community',
    elements: [{ type: 'text', content: 'Building Great Teams', x: 900, y: 160, fontSize: 40, fontWeight: '700', color: 'white' }]
  },
  {
    id: 'real-estate',
    title: 'Real Estate Elite',
    industry: 'Real Estate',
    description: 'High-end luxury property vibe.',
    backgroundUrl: '/assets/banners/real_estate_banner_1767819092583.png',
    thumbnailUrl: '/assets/banners/real_estate_banner_1767819092583.png',
    prompt: 'Luxury modern apartment interior, blurred background, spacious living room with large windows, city skyline view, high end property, real estate professionalism',
    elements: [{ type: 'text', content: 'Luxury Living', x: 1000, y: 150, fontSize: 50, fontWeight: '800', color: 'white' }]
  },
  {
    id: 'legal-pro',
    title: 'Legal Counsel',
    industry: 'Legal',
    description: 'Traditional, trustworthy, and serious.',
    backgroundUrl: '/assets/banners/legal_pro_banner_1767819108660.png',
    thumbnailUrl: '/assets/banners/legal_pro_banner_1767819108660.png',
    prompt: 'Scales of justice, legal library background, wooden gavel texture, dark wood and gold accents, law firm elegance, trustworthy and authoritative',
    elements: [{ type: 'text', content: 'Justice & Integrity', x: 800, y: 180, fontSize: 45, fontWeight: '700', color: '#f8fafc' }]
  },
  {
    id: 'it-security',
    title: 'Cyber Security',
    industry: 'Technology',
    description: 'High-tech and secure feel.',
    backgroundUrl: '/assets/banners/it_security_banner_1767819134250.png',
    thumbnailUrl: '/assets/banners/it_security_banner_1767819134250.png',
    prompt: 'Cyber security matrix, binary code rain, digital lock shield concept, dark hacker background, neon green datastream, secure network infrastructure',
    elements: [{ type: 'text', content: 'Securing the Digital Frontier', x: 850, y: 170, fontSize: 40, fontWeight: '900', color: '#10b981' }]
  },
  {
    id: 'sustainability',
    title: 'Eco Warrior',
    industry: 'Environmental',
    description: 'Green, organic, and earth-focused.',
    backgroundUrl: '/assets/banners/sustainability_banner_1767819153748.png',
    thumbnailUrl: '/assets/banners/sustainability_banner_1767819153748.png',
    prompt: 'Lush green forest canopy, nature sunlight filtering through leaves, environmental sustainability, clean energy, harmony with nature, organic textures',
    elements: [{ type: 'text', content: 'Sustainable Future', x: 800, y: 180, fontSize: 50, fontWeight: '800', color: '#ecfdf5' }]
  },
  {
    id: 'hospitality',
    title: 'Hospitality Management',
    industry: 'Hospitality',
    description: 'Welcoming and service-oriented.',
    backgroundUrl: '/assets/banners/hospitality_banner_1767819170167.png',
    thumbnailUrl: '/assets/banners/hospitality_banner_1767819170167.png',
    prompt: 'Luxury hotel lobby, warm welcoming lighting, reception desk blur, high end hospitality service, travel and leisure, gold and cream colors, inviting atmosphere',
    elements: [{ type: 'text', content: 'Excellence in Service', x: 900, y: 160, fontSize: 45, fontWeight: '700', color: 'white' }]
  },
  {
    id: 'ai-researcher',
    title: 'AI Researcher',
    industry: 'Technology',
    description: 'Abstract and intellectual vibe.',
    backgroundUrl: '/assets/banners/ai_researcher_banner_1767819186233.png',
    thumbnailUrl: '/assets/banners/ai_researcher_banner_1767819186233.png',
    prompt: 'Artificial intelligence neural network visualization, glowing synaptic connections, deep learning concept, abstract complex data structure, purple and blue neon, futuristic science',
    elements: [{ type: 'text', content: 'Exploring Intelligence', x: 800, y: 180, fontSize: 50, fontWeight: '900', color: '#c084fc' }]
  },
  {
    id: 'content-creator',
    title: 'Content Creator',
    industry: 'Creative',
    description: 'Personalized and high-energy.',
    backgroundUrl: '/assets/banners/content_creator_banner_1767819213280.png',
    thumbnailUrl: '/assets/banners/content_creator_banner_1767819213280.png',
    prompt: 'Camera lens reflection, photography studio backdrop, creative lighting setup, vlog aesthetics, content creation gear, vibrant energy, cinematic look',
    elements: [{ type: 'text', content: 'Storytelling through Lens', x: 1100, y: 150, fontSize: 45, fontWeight: '800', color: '#ffffff' }]
  },
  {
    id: 'fitness-coach',
    title: 'Fitness Pro',
    industry: 'Fitness',
    description: 'Active, strong, and motivational.',
    backgroundUrl: '/assets/banners/fitness_coach_banner_1767819229464.png',
    thumbnailUrl: '/assets/banners/fitness_coach_banner_1767819229464.png',
    prompt: 'Gym atmosphere darker lighting, weights and equipment background, intense workout motivation, red and black theme, strength training, determination',
    elements: [{ type: 'text', content: 'Peak Performance', x: 800, y: 180, fontSize: 60, fontWeight: '900', color: '#ef4444' }]
  },
  {
    id: 'architect',
    title: 'Architectural Vision',
    industry: 'Design',
    description: 'Structured, geometric, and clean.',
    backgroundUrl: '/assets/banners/architect_banner_1767819245579.png',
    thumbnailUrl: '/assets/banners/architect_banner_1767819245579.png',
    prompt: 'Architectural blueprints, white clean minimalist structure, geometric angles, modern building design, concrete surfaces, precision and balance',
    elements: [{ type: 'text', content: 'Designing Space', x: 900, y: 160, fontSize: 45, fontWeight: '700', color: '#1e293b' }]
  },
  {
    id: 'fashion-style',
    title: 'Fashion Forward',
    industry: 'Creative',
    description: 'Chic, stylish, and minimal.',
    backgroundUrl: '/assets/banners/fashion_style_banner_1767819262237.png',
    thumbnailUrl: '/assets/banners/fashion_style_banner_1767819262237.png',
    prompt: 'High fashion editorial background, fabric textures silk and velvet, soft elegant lighting, luxury clothing brand vibe, minimalistic chic, pastel tones',
    elements: [{ type: 'text', content: 'Style & Substance', x: 1200, y: 140, fontSize: 50, fontWeight: '900', color: 'black' }]
  },
  {
    id: 'logistics-global',
    title: 'Global Logistics',
    industry: 'Transportation',
    description: 'Connected and expansive.',
    backgroundUrl: '/assets/banners/logistics_global_banner_1767819286521.png',
    thumbnailUrl: '/assets/banners/logistics_global_banner_1767819286521.png',
    prompt: 'Global map connections, logistics network lines, shipping containers abstract, world trade concept, blue professional business theme, transportation hub',
    elements: [{ type: 'text', content: 'Moving the World', x: 800, y: 180, fontSize: 45, fontWeight: '800', color: 'white' }]
  },
  {
    id: 'energy-future',
    title: 'Renewable Energy',
    industry: 'Energy',
    description: 'Clean energy and power focus.',
    backgroundUrl: '/assets/banners/energy_future_banner_1767819301415.png',
    thumbnailUrl: '/assets/banners/energy_future_banner_1767819301415.png',
    prompt: 'Wind turbines, solar panels background, clean blue sky, bright sun, renewable energy future, eco friendly technology, sustainability power',
    elements: [{ type: 'text', content: 'Powered by Nature', x: 900, y: 160, fontSize: 45, fontWeight: '700', color: '#065f46' }]
  }
];
