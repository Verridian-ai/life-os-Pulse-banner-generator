/**
 * Agent Router - Routes voice commands to specialized agents
 *
 * This module provides intelligent routing of user commands to the most
 * appropriate specialized agent based on command type and context.
 */

import { AGENT_REGISTRY, AgentDefinition, getAgentSuggestions } from './agentRegistry';
import type { PlatformType } from '@/components/studios/config/platformConfig';

export interface RouteResult {
  agentId: string;
  agent: AgentDefinition;
  confidence: number;
  reason: string;
  fallbackAgentId?: string;
}

export interface CommandRouteContext {
  currentTab?: string;
  hasImage?: boolean;
  hasText?: boolean;
  previousAgentId?: string;
  platform?: PlatformType;
}

// Platform-to-specialist agent mapping
const PLATFORM_AGENT_MAP: Record<PlatformType, string> = {
  linkedin: 'linkedin-specialist',
  youtube: 'youtube-specialist',
  instagram: 'instagram-specialist',
  facebook: 'facebook-specialist',
  tiktok: 'tiktok-specialist',
  x: 'x-specialist',
};

// Command to agent capability mapping
const COMMAND_CAPABILITY_MAP: Record<string, string[]> = {
  // Image generation & processing
  generate_background: ['benno', 'art-director'],
  magic_edit: ['art-director', 'tech-wizard'],
  remove_background: ['tech-wizard'],
  upscale_image: ['tech-wizard'],
  restore_image: ['tech-wizard'],
  enhance_face: ['tech-wizard'],
  batch_upscale: ['tech-wizard'],
  batch_remove_background: ['tech-wizard'],

  // Canvas element commands
  add_text_element: ['copy-specialist', 'layout-expert'],
  update_element: ['layout-expert', 'copy-specialist'],
  delete_element: ['layout-expert'],
  list_elements: ['layout-expert'],
  bring_to_front: ['layout-expert'],
  send_to_back: ['layout-expert'],
  duplicate_element: ['layout-expert'],
  lock_element: ['layout-expert'],
  group_elements: ['layout-expert'],
  batch_delete_elements: ['layout-expert'],
  batch_update_elements: ['layout-expert'],
  batch_move_elements: ['layout-expert'],

  // Analysis commands
  suggest_prompts: ['benno', 'art-director', 'industry-specialist'],
  write_enhanced_prompt: ['copy-specialist', 'art-director'],
  analyze_image: ['art-director', 'accessibility-expert'],
  analyze_banner: ['art-director', 'accessibility-expert', 'layout-expert'],
  compare_images: ['art-director'],

  // Gallery commands
  save_design: ['benno'],
  load_design: ['benno'],
  delete_design: ['benno'],
  export_design: ['benno'],
  list_designs: ['benno'],

  // Template commands
  apply_template: ['art-director', 'industry-specialist'],
  list_templates: ['benno', 'industry-specialist'],
  search_templates: ['benno', 'industry-specialist'],

  // Brand commands
  extract_brand: ['art-director'],
  check_brand_consistency: ['art-director', 'accessibility-expert'],
  apply_brand_profile: ['art-director'],
  list_brand_profiles: ['benno'],

  // Profile picture commands
  set_profile_picture: ['layout-expert'],
  remove_profile_picture: ['layout-expert'],
  transform_profile: ['layout-expert'],

  // Canvas state commands
  toggle_safe_zones: ['layout-expert'],
  reset_canvas: ['benno'],
  set_zoom: ['layout-expert'],
  center_canvas: ['layout-expert'],

  // Navigation commands
  navigate_to_tab: ['benno'],
  undo_action: ['benno'],
  redo_action: ['benno'],
};

/**
 * Route a command to the most appropriate agent
 * Platform-specific agents take priority when a platform context is provided
 */
export function routeCommand(commandName: string, context?: CommandRouteContext): RouteResult {
  // PRIORITY 1: If platform specified, try platform-specialist agent first
  if (context?.platform) {
    const platformAgentId = PLATFORM_AGENT_MAP[context.platform];
    const platformAgent = AGENT_REGISTRY.find((a) => a.id === platformAgentId);

    if (platformAgent) {
      // Check if platform agent has this capability
      const hasCapability =
        platformAgent.capabilities.includes(commandName) ||
        platformAgent.capabilities.some((cap) => commandName.includes(cap));

      if (hasCapability) {
        return {
          agentId: platformAgentId,
          agent: platformAgent,
          confidence: 0.95,
          reason: `${platformAgent.name} is the expert for ${context.platform} platform`,
          fallbackAgentId: 'benno',
        };
      }
    }
  }

  // PRIORITY 2: Use command capability mapping
  const capableAgentIds = COMMAND_CAPABILITY_MAP[commandName] || ['benno'];

  // Find the primary agent
  const primaryAgentId = capableAgentIds[0];
  const primaryAgent = AGENT_REGISTRY.find((a) => a.id === primaryAgentId);

  if (!primaryAgent) {
    // Fallback to Benno
    const benno = AGENT_REGISTRY.find((a) => a.id === 'benno')!;
    return {
      agentId: 'benno',
      agent: benno,
      confidence: 0.5,
      reason: 'Default fallback to primary assistant',
    };
  }

  // Calculate confidence based on context
  let confidence = 0.8;
  let reason = `${primaryAgent.name} specializes in this command`;

  // Boost confidence if continuing with same agent
  if (context?.previousAgentId === primaryAgentId) {
    confidence = Math.min(confidence + 0.1, 0.95);
    reason = `Continuing with ${primaryAgent.name}`;
  }

  return {
    agentId: primaryAgentId,
    agent: primaryAgent,
    confidence,
    reason,
    fallbackAgentId: capableAgentIds[1],
  };
}

/**
 * Get the platform-specific agent for a given platform
 */
export function getPlatformAgent(platform: PlatformType): AgentDefinition | undefined {
  const agentId = PLATFORM_AGENT_MAP[platform];
  return AGENT_REGISTRY.find((a) => a.id === agentId);
}

/**
 * Route a natural language query to the best agent
 */
export function routeQuery(query: string, _context?: CommandRouteContext): RouteResult {
  const suggestions = getAgentSuggestions(query);

  if (suggestions.length === 0) {
    // Default to Benno
    const benno = AGENT_REGISTRY.find((a) => a.id === 'benno')!;
    return {
      agentId: 'benno',
      agent: benno,
      confidence: 0.5,
      reason: 'No specific agent matched, using primary assistant',
    };
  }

  const topSuggestion = suggestions[0];
  const agent = AGENT_REGISTRY.find((a) => a.id === topSuggestion.agentId)!;

  return {
    agentId: topSuggestion.agentId,
    agent,
    confidence: topSuggestion.confidence,
    reason: topSuggestion.reason,
    fallbackAgentId: suggestions[1]?.agentId,
  };
}

/**
 * Get the system prompt for a specific agent
 */
export function getAgentSystemPrompt(agentId: string): string {
  const agent = AGENT_REGISTRY.find((a) => a.id === agentId);
  return agent?.systemPrompt || AGENT_REGISTRY[0].systemPrompt;
}

/**
 * Get all agents that can handle a specific capability
 */
export function getAgentsForCapability(capability: string): AgentDefinition[] {
  return AGENT_REGISTRY.filter((a) => a.capabilities.includes(capability));
}
