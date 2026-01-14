import { PostTemplate, EmotionalTone } from './types';

export const POST_TEMPLATES: {
  id: PostTemplate;
  label: string;
  icon: string;
  description: string;
}[] = [
  {
    id: 'story',
    label: 'Personal Story',
    icon: 'auto_stories',
    description: 'High-engagement personal narratives with a lesson.',
  },
  {
    id: 'educational',
    label: 'Tutorial/Value',
    icon: 'school',
    description: 'Step-by-step guides and educational "How-To" posts.',
  },
  {
    id: 'listicle',
    label: 'Listicle',
    icon: 'format_list_numbered',
    description: 'Structured points or "X things I learned" format.',
  },
  {
    id: 'contrarian',
    label: 'Hot Take',
    icon: 'bolt',
    description: 'Challenging common wisdom to start a discussion.',
  },
  {
    id: 'video',
    label: 'Video Script',
    icon: 'movie',
    description: 'Short, punchy script for video-based content.',
  },
];

export const EMOTIONAL_TONES: { id: EmotionalTone; label: string; color: string }[] = [
  { id: 'educational', label: 'Educational', color: 'blue' },
  { id: 'inspirational', label: 'Inspirational', color: 'amber' },
  { id: 'bold', label: 'Bold', color: 'purple' },
  { id: 'minimalist', label: 'Minimalist', color: 'zinc' },
  { id: 'dramatic', label: 'Dramatic', color: 'red' },
  { id: 'professional', label: 'Professional', color: 'indigo' },
];
