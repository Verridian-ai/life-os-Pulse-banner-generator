/**
 * Agent Context Service - Bridges Cognee RAG with Agent System
 *
 * This service enriches agent context by:
 * 1. Fetching relevant knowledge from Cognee
 * 2. Injecting platform-specific configuration
 * 3. Composing enriched system prompts for LLM calls
 */

import { AGENT_REGISTRY, AgentDefinition } from './agentRegistry';
import {
  getPlatformPostsConfig,
  type PlatformPostsConfig,
} from '@/features/linkedin-posts/config/platformPostsConfig';
import type { PlatformType } from '@/components/studios/config/platformConfig';

// API URL from environment
const getApiUrl = () => {
  const mode = import.meta.env.VITE_API_MODE || 'local';
  if (mode === 'production') {
    return import.meta.env.VITE_PROD_API_URL || 'https://life-os-banner.verridian.ai';
  }
  return import.meta.env.VITE_LOCAL_API_URL || 'http://localhost:8888';
};

const API_URL = getApiUrl();

export interface CogneeSearchResult {
  id: string;
  content: string;
  score: number;
  metadata?: Record<string, unknown>;
}

export interface CogneeQueryResult {
  answer: string;
  sources: CogneeSearchResult[];
}

export interface EnrichedAgentContext {
  agentId: string;
  agentName: string;
  systemPrompt: string;
  knowledgeContext: string;
  platformConfig: PlatformPostsConfig | null;
  platform: PlatformType | null;
}

// In-memory cache for agent context (TTL: 5 minutes)
const contextCache = new Map<string, { data: EnrichedAgentContext; timestamp: number }>();
const CACHE_TTL_MS = 5 * 60 * 1000;

/**
 * Search Cognee for relevant knowledge documents
 */
export async function searchAgentKnowledge(
  query: string,
  agentId: string,
  limit = 3,
): Promise<CogneeSearchResult[]> {
  try {
    const response = await fetch(`${API_URL}/api/cognee/search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ query, agentId, limit }),
    });

    if (!response.ok) {
      console.warn('[AgentContext] Cognee search failed:', response.status);
      return [];
    }

    const data = await response.json();
    return data.results || [];
  } catch (error) {
    console.warn('[AgentContext] Cognee search error:', error);
    return [];
  }
}

/**
 * Get all context documents for an agent
 */
export async function getAgentContextDocuments(agentId: string): Promise<CogneeSearchResult[]> {
  try {
    const response = await fetch(`${API_URL}/api/cognee/agent/${agentId}/context`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });

    if (!response.ok) {
      console.warn('[AgentContext] Failed to fetch agent context:', response.status);
      return [];
    }

    const data = await response.json();
    return data.documents || [];
  } catch (error) {
    console.warn('[AgentContext] Agent context fetch error:', error);
    return [];
  }
}

/**
 * Query Cognee with natural language and get an answer
 */
export async function queryAgentKnowledge(
  question: string,
  agentId: string,
): Promise<CogneeQueryResult | null> {
  try {
    const response = await fetch(`${API_URL}/api/cognee/query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ question, agentId }),
    });

    if (!response.ok) {
      console.warn('[AgentContext] Cognee query failed:', response.status);
      return null;
    }

    return await response.json();
  } catch (error) {
    console.warn('[AgentContext] Cognee query error:', error);
    return null;
  }
}

/**
 * Get enriched agent context with Cognee knowledge and platform config
 *
 * @param agentId - The agent ID to get context for
 * @param platform - Optional platform for platform-specific enrichment
 * @param userQuery - Optional user query for semantic knowledge retrieval
 * @returns Enriched context with system prompt, knowledge, and platform config
 */
export async function getEnrichedAgentContext(
  agentId: string,
  platform?: PlatformType,
  userQuery?: string,
): Promise<EnrichedAgentContext> {
  // Check cache first
  const cacheKey = `${agentId}:${platform || 'none'}:${userQuery || 'default'}`;
  const cached = contextCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.data;
  }

  // 1. Get base agent from registry
  const agent = AGENT_REGISTRY.find((a) => a.id === agentId);
  if (!agent) {
    // Fallback to Benno if agent not found
    const benno = AGENT_REGISTRY.find((a) => a.id === 'benno')!;
    return createFallbackContext(benno, platform);
  }

  // 2. Query Cognee for relevant knowledge
  let knowledgeContext = '';
  try {
    let searchResults: CogneeSearchResult[] = [];

    if (userQuery) {
      // Semantic search based on user query
      searchResults = await searchAgentKnowledge(userQuery, agentId, 3);
    } else {
      // Get general agent context documents
      searchResults = await getAgentContextDocuments(agentId);
    }

    if (searchResults.length > 0) {
      knowledgeContext = searchResults
        .slice(0, 3)
        .map((r) => r.content)
        .join('\n\n---\n\n');
    }
  } catch (error) {
    console.warn('[AgentContext] Knowledge retrieval failed, using static prompt', error);
  }

  // 3. Get platform-specific config if platform provided
  let platformConfig: PlatformPostsConfig | null = null;
  if (platform) {
    try {
      platformConfig = getPlatformPostsConfig(platform);
    } catch {
      console.warn('[AgentContext] Platform config not found for:', platform);
    }
  }

  // 4. Compose enriched system prompt
  const enrichedPrompt = composeEnrichedPrompt(agent, platformConfig, knowledgeContext);

  const result: EnrichedAgentContext = {
    agentId: agent.id,
    agentName: agent.name,
    systemPrompt: enrichedPrompt,
    knowledgeContext,
    platformConfig,
    platform: platform || null,
  };

  // Cache the result
  contextCache.set(cacheKey, { data: result, timestamp: Date.now() });

  return result;
}

/**
 * Compose enriched system prompt with all context layers
 */
function composeEnrichedPrompt(
  agent: AgentDefinition,
  platformConfig: PlatformPostsConfig | null,
  knowledgeContext: string,
): string {
  let enrichedPrompt = agent.systemPrompt;

  // Add platform context if available
  if (platformConfig) {
    enrichedPrompt += `

## Platform Context: ${platformConfig.name}
- Max Characters: ${platformConfig.maxCharacters}
- Optimal Hashtags: ${platformConfig.optimalHashtags}
- Golden Hour: ${platformConfig.goldenHour}
- Link Penalty: ${platformConfig.linkPenalty}
- Key Metrics: ${platformConfig.keyMetrics.join(', ')}
- Algorithm Tip: ${platformConfig.algorithmTip}

### Content Tips
${platformConfig.contentTips
  .slice(0, 4)
  .map((tip) => `- ${tip}`)
  .join('\n')}

### Avoid
${platformConfig.avoidList
  .slice(0, 3)
  .map((item) => `- ${item}`)
  .join('\n')}`;
  }

  // Add knowledge context if available
  if (knowledgeContext) {
    enrichedPrompt += `

## Knowledge Base
The following knowledge has been retrieved from your training documents:

${knowledgeContext}

Use this knowledge to inform your responses when relevant.`;
  }

  return enrichedPrompt;
}

/**
 * Create fallback context when agent not found
 */
function createFallbackContext(
  agent: AgentDefinition,
  platform?: PlatformType,
): EnrichedAgentContext {
  let platformConfig: PlatformPostsConfig | null = null;
  if (platform) {
    try {
      platformConfig = getPlatformPostsConfig(platform);
    } catch {
      // Ignore
    }
  }

  return {
    agentId: agent.id,
    agentName: agent.name,
    systemPrompt: agent.systemPrompt,
    knowledgeContext: '',
    platformConfig,
    platform: platform || null,
  };
}

/**
 * Clear the context cache (useful for testing or after document updates)
 */
export function clearContextCache(): void {
  contextCache.clear();
  console.log('[AgentContext] Cache cleared');
}

/**
 * Get cache statistics for debugging
 */
export function getCacheStats(): { size: number; keys: string[] } {
  return {
    size: contextCache.size,
    keys: Array.from(contextCache.keys()),
  };
}
