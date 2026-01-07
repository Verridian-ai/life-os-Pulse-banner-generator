

export interface AgentDefinition {
  id: string;
  name: string;
  description: string;
  capabilities: string[];
  systemPrompt: string;
  keywords: string[];
  icon: string;
}

export const AGENT_REGISTRY: AgentDefinition[] = [
  {
    id: 'benno',
    name: 'Benno',
    description: 'Your primary LinkedIn banner assistant. Great for general design and getting started.',
    capabilities: ['chat', 'generate_background', 'suggest_prompts'],
    icon: 'smart_toy',
    keywords: ['banner', 'linkedin', 'help', 'start', 'how to', 'create', 'new'],
    systemPrompt: `You are Benno, a friendly AI assistant specialized in creating professional LinkedIn banners.
Focus on understanding the user's needs and guiding them through the initial creation process.`
  },
  {
    id: 'art-director',
    name: 'Art Director',
    description: 'Expert in visual style, color theory, and professional aesthetics.',
    capabilities: ['analyze_banner', 'suggest_prompts', 'magic_edit'],
    icon: 'palette',
    keywords: ['color', 'style', 'aesthetic', 'look', 'feel', 'brand', 'professional', 'modern', 'minimalist'],
    systemPrompt: `You are the Art Director. You have an expert eye for design, color theory, and composition.
Your goal is to ensure the user's banner looks high-end and professional.`
  },
  {
    id: 'copy-specialist',
    name: 'Copy Specialist',
    description: 'Specializes in punchy headlines and value-driven taglines for your banner.',
    capabilities: ['add_text_element', 'update_element', 'suggest_prompts'],
    icon: 'text_fields',
    keywords: ['text', 'headline', 'tagline', 'words', 'slogan', 'font', 'typography', 'write'],
    systemPrompt: `You are the Copy Specialist. You know how to write text that grabs attention and communicates value.
Focus on helping the user craft the perfect message for their banner.`
  },
  {
    id: 'tech-wizard',
    name: 'Tech Wizard',
    description: 'Expert in image processing: upscaling, background removal, and restoration.',
    capabilities: ['upscale_image', 'remove_background', 'restore_image', 'enhance_face'],
    icon: 'auto_fix_high',
    keywords: ['upscale', 'quality', 'blur', 'pixelated', 'background', 'remove', 'face', 'fix', 'enhance'],
    systemPrompt: `You are the Tech Wizard. You specialize in the technical side of image editing.
Your goal is to make sure every image is crisp, clear, and perfectly processed.`
  }
];

export interface AgentSuggestion {
  agentId: string;
  confidence: number; // 0-1
  reason: string;
}

/**
 * Intelligent routing logic to suggest the best agent for a given query
 */
export const getAgentSuggestions = (input: string): AgentSuggestion[] => {
  const query = input.toLowerCase();
  
  const suggestions: AgentSuggestion[] = AGENT_REGISTRY.map(agent => {
    let score = 0;
    const matchingKeywords: string[] = [];

    // 1. Keyword matching
    agent.keywords.forEach(keyword => {
      if (query.includes(keyword)) {
        score += 0.3;
        matchingKeywords.push(keyword);
      }
    });

    // 2. Capability matching (implied by input)
    if (agent.id === 'tech-wizard' && (query.includes('clear') || query.includes('sharp'))) score += 0.4;
    if (agent.id === 'copy-specialist' && (query.includes('say') || query.includes('name'))) score += 0.4;
    if (agent.id === 'art-director' && (query.includes('vibe') || query.includes('mood'))) score += 0.4;

    // Normalize score
    const confidence = Math.min(score, 0.95);

    return {
      agentId: agent.id,
      confidence,
      reason: matchingKeywords.length > 0 
        ? `Matches keywords: ${matchingKeywords.slice(0, 2).join(', ')}`
        : `General capability match`
    };
  });

  // Sort by confidence and return top suggestions
  return suggestions
    .filter(s => s.confidence > 0.1)
    .sort((a, b) => b.confidence - a.confidence);
};

/**
 * Legacy support for getting a default agent
 */
export const getDefaultAgentForTask = (query: string): string => {
  const suggestions = getAgentSuggestions(query);
  return suggestions.length > 0 ? suggestions[0].agentId : 'benno';
};
