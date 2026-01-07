import { BannerElement } from '../types';

export interface BannerTemplate {
  id: string;
  title: string;
  industry: string;
  description: string;
  backgroundUrl: string;
  elements: Partial<BannerElement>[];
  thumbnailUrl: string;
}

export const BANNER_TEMPLATES: BannerTemplate[] = [
  {
    id: 'tech-minimal',
    title: 'Tech Minimalist',
    industry: 'Technology',
    description: 'Clean, modern tech vibe with a focus on core value.',
    backgroundUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=1584&h=396',
    thumbnailUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=400&h=100',
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
    backgroundUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=1584&h=396',
    thumbnailUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=400&h=100',
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
    backgroundUrl: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&q=80&w=1584&h=396',
    thumbnailUrl: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&q=80&w=400&h=100',
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
    backgroundUrl: 'https://images.unsplash.com/photo-1505751172107-573225a91200?auto=format&fit=crop&q=80&w=1584&h=396',
    thumbnailUrl: 'https://images.unsplash.com/photo-1505751172107-573225a91200?auto=format&fit=crop&q=80&w=400&h=100',
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
    backgroundUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=1584&h=396',
    thumbnailUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=400&h=100',
    elements: [{ type: 'text', content: 'Scaling Brands with Data', x: 800, y: 180, fontSize: 50, fontWeight: '900', color: 'white' }]
  },
  {
    id: 'education-lead',
    title: 'Thought Leader',
    industry: 'Education',
    description: 'Academic and authoritative.',
    backgroundUrl: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&q=80&w=1584&h=396',
    thumbnailUrl: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&q=80&w=400&h=100',
    elements: [{ type: 'text', content: 'Empowering Minds', x: 1100, y: 150, fontSize: 45, fontWeight: '800', color: '#f59e0b' }]
  },
  {
    id: 'sales-expert',
    title: 'Sales closer',
    industry: 'Sales',
    description: 'Energetic and results-oriented.',
    backgroundUrl: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&q=80&w=1584&h=396',
    thumbnailUrl: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&q=80&w=400&h=100',
    elements: [{ type: 'text', content: 'Exceeding Targets', x: 800, y: 180, fontSize: 55, fontWeight: '900', color: 'white' }]
  },
  {
    id: 'hr-people',
    title: 'People Culture',
    industry: 'HR',
    description: 'Warm and inviting for HR professionals.',
    backgroundUrl: 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&q=80&w=1584&h=396',
    thumbnailUrl: 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&q=80&w=400&h=100',
    elements: [{ type: 'text', content: 'Building Great Teams', x: 900, y: 160, fontSize: 40, fontWeight: '700', color: 'white' }]
  },
  {
    id: 'real-estate',
    title: 'Real Estate Elite',
    industry: 'Real Estate',
    description: 'High-end luxury property vibe.',
    backgroundUrl: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=80&w=1584&h=396',
    thumbnailUrl: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=80&w=400&h=100',
    elements: [{ type: 'text', content: 'Luxury Living', x: 1000, y: 150, fontSize: 50, fontWeight: '800', color: 'white' }]
  },
  {
    id: 'legal-pro',
    title: 'Legal Counsel',
    industry: 'Legal',
    description: 'Traditional, trustworthy, and serious.',
    backgroundUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&q=80&w=1584&h=396',
    thumbnailUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&q=80&w=400&h=100',
    elements: [{ type: 'text', content: 'Justice & Integrity', x: 800, y: 180, fontSize: 45, fontWeight: '700', color: '#f8fafc' }]
  },
  {
    id: 'it-security',
    title: 'Cyber Security',
    industry: 'Technology',
    description: 'High-tech and secure feel.',
    backgroundUrl: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=1584&h=396',
    thumbnailUrl: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=400&h=100',
    elements: [{ type: 'text', content: 'Securing the Digital Frontier', x: 850, y: 170, fontSize: 40, fontWeight: '900', color: '#10b981' }]
  },
  {
    id: 'sustainability',
    title: 'Eco Warrior',
    industry: 'Environmental',
    description: 'Green, organic, and earth-focused.',
    backgroundUrl: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=1584&h=396',
    thumbnailUrl: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=400&h=100',
    elements: [{ type: 'text', content: 'Sustainable Future', x: 800, y: 180, fontSize: 50, fontWeight: '800', color: '#ecfdf5' }]
  },
  {
    id: 'hospitality',
    title: 'Hospitality Management',
    industry: 'Hospitality',
    description: 'Welcoming and service-oriented.',
    backgroundUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=1584&h=396',
    thumbnailUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=400&h=100',
    elements: [{ type: 'text', content: 'Excellence in Service', x: 900, y: 160, fontSize: 45, fontWeight: '700', color: 'white' }]
  },
  {
    id: 'ai-researcher',
    title: 'AI Researcher',
    industry: 'Technology',
    description: 'Abstract and intellectual vibe.',
    backgroundUrl: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=1584&h=396',
    thumbnailUrl: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=400&h=100',
    elements: [{ type: 'text', content: 'Exploring Intelligence', x: 800, y: 180, fontSize: 50, fontWeight: '900', color: '#c084fc' }]
  },
  {
    id: 'content-creator',
    title: 'Content Creator',
    industry: 'Creative',
    description: 'Personalized and high-energy.',
    backgroundUrl: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&q=80&w=1584&h=396',
    thumbnailUrl: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&q=80&w=400&h=100',
    elements: [{ type: 'text', content: 'Storytelling through Lens', x: 1100, y: 150, fontSize: 45, fontWeight: '800', color: '#ffffff' }]
  },
  {
    id: 'fitness-coach',
    title: 'Fitness Pro',
    industry: 'Fitness',
    description: 'Active, strong, and motivational.',
    backgroundUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=1584&h=396',
    thumbnailUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=400&h=100',
    elements: [{ type: 'text', content: 'Peak Performance', x: 800, y: 180, fontSize: 60, fontWeight: '900', color: '#ef4444' }]
  },
  {
    id: 'architect',
    title: 'Architectural Vision',
    industry: 'Design',
    description: 'Structured, geometric, and clean.',
    backgroundUrl: 'https://images.unsplash.com/photo-1487958449943-2429e8be8625?auto=format&fit=crop&q=80&w=1584&h=396',
    thumbnailUrl: 'https://images.unsplash.com/photo-1487958449943-2429e8be8625?auto=format&fit=crop&q=80&w=400&h=100',
    elements: [{ type: 'text', content: 'Designing Space', x: 900, y: 160, fontSize: 45, fontWeight: '700', color: '#1e293b' }]
  },
  {
    id: 'fashion-style',
    title: 'Fashion Forward',
    industry: 'Creative',
    description: 'Chic, stylish, and minimal.',
    backgroundUrl: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&q=80&w=1584&h=396',
    thumbnailUrl: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&q=80&w=400&h=100',
    elements: [{ type: 'text', content: 'Style & Substance', x: 1200, y: 140, fontSize: 50, fontWeight: '900', color: 'black' }]
  },
  {
    id: 'logistics-global',
    title: 'Global Logistics',
    industry: 'Transportation',
    description: 'Connected and expansive.',
    backgroundUrl: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=1584&h=396',
    thumbnailUrl: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=400&h=100',
    elements: [{ type: 'text', content: 'Moving the World', x: 800, y: 180, fontSize: 45, fontWeight: '800', color: 'white' }]
  },
  {
    id: 'energy-future',
    title: 'Renewable Energy',
    industry: 'Energy',
    description: 'Clean energy and power focus.',
    backgroundUrl: 'https://images.unsplash.com/photo-1466611653911-95282fc3656b?auto=format&fit=crop&q=80&w=1584&h=396',
    thumbnailUrl: 'https://images.unsplash.com/photo-1466611653911-95282fc3656b?auto=format&fit=crop&q=80&w=400&h=100',
    elements: [{ type: 'text', content: 'Powered by Nature', x: 900, y: 160, fontSize: 45, fontWeight: '700', color: '#065f46' }]
  }
];
