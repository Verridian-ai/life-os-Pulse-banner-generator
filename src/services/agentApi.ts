/**
 * Agent API Client
 *
 * TypeScript client for the Pydantic AI Agent Service.
 * Provides type-safe access to agent invocation with Langfuse tracing and Cognee memory.
 */

const AGENT_SERVICE_URL = import.meta.env.VITE_AGENT_SERVICE_URL || 'http://localhost:8001';

// Types

export interface ColorPalette {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
}

export interface LayoutSuggestion {
  name: string;
  description: string;
  text_position: 'left' | 'center' | 'right';
  image_position?: string;
}

export interface BannerDesignOutput {
  title: string;
  subtitle?: string;
  tagline?: string;
  color_palette: ColorPalette;
  layout: LayoutSuggestion;
  style: 'professional' | 'creative' | 'minimal' | 'bold';
  font_suggestion: string;
  imagery_prompt?: string;
  rationale: string;
}

export interface BannerFeedback {
  overall_score: number;
  strengths: string[];
  improvements: string[];
  specific_changes: string[];
  industry_fit: string;
}

export interface AgentResponse<T = unknown> {
  success: boolean;
  output?: T;
  error?: string;
  trace_id?: string;
  tokens_used: number;
  latency_ms: number;
  memory_used: boolean;
}

export interface BannerDesignRequest {
  prompt: string;
  user_id: string;
  session_id?: string;
  industry?: string;
  target_audience?: string;
  brand_colors?: string[];
  metadata?: Record<string, unknown>;
}

export interface BannerFeedbackRequest {
  prompt: string;
  user_id: string;
  session_id?: string;
  existing_design: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}

export interface MemorySearchResult {
  id: string;
  content: string;
  score: number;
  metadata: Record<string, unknown>;
}

export interface AgentHealthStatus {
  status: string;
  services: {
    cognee_memory: boolean;
    langfuse_tracing: boolean;
  };
}

// API Client

class AgentApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = AGENT_SERVICE_URL) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Agent API error: ${response.status} - ${error}`);
    }

    return response.json();
  }

  /**
   * Check health of the agent service
   */
  async healthCheck(): Promise<AgentHealthStatus> {
    return this.request<AgentHealthStatus>('/agents/health');
  }

  /**
   * Generate a new banner design
   */
  async generateBannerDesign(
    request: BannerDesignRequest
  ): Promise<AgentResponse<BannerDesignOutput>> {
    return this.request<AgentResponse<BannerDesignOutput>>('/agents/banner/design', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  /**
   * Get feedback on an existing banner design
   */
  async getBannerFeedback(
    request: BannerFeedbackRequest
  ): Promise<AgentResponse<BannerFeedback>> {
    return this.request<AgentResponse<BannerFeedback>>('/agents/banner/feedback', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  /**
   * Search agent memory for relevant context
   */
  async searchMemory(
    query: string,
    options: {
      agent_id?: string;
      user_id?: string;
      limit?: number;
    } = {}
  ): Promise<{ success: boolean; results: MemorySearchResult[] }> {
    const params = new URLSearchParams({
      query,
      ...(options.agent_id && { agent_id: options.agent_id }),
      ...(options.user_id && { user_id: options.user_id }),
      ...(options.limit && { limit: options.limit.toString() }),
    });

    return this.request(`/agents/memory/search?${params.toString()}`, {
      method: 'POST',
    });
  }

  /**
   * Store a learning in agent memory
   */
  async storeLearning(
    content: string,
    agentId: string,
    options: {
      category?: 'success' | 'failure' | 'preference' | 'insight';
      user_id?: string;
      metadata?: Record<string, unknown>;
    } = {}
  ): Promise<{ success: boolean; document_id: string }> {
    const params = new URLSearchParams({
      content,
      agent_id: agentId,
      category: options.category || 'insight',
      ...(options.user_id && { user_id: options.user_id }),
    });

    return this.request(`/agents/memory/store?${params.toString()}`, {
      method: 'POST',
      body: JSON.stringify(options.metadata || {}),
    });
  }

  /**
   * Process agent memory into knowledge graph
   */
  async cognifyAgent(agentId: string): Promise<{ success: boolean; message: string }> {
    return this.request(`/agents/memory/cognify/${agentId}`, {
      method: 'POST',
    });
  }
}

// Singleton instance
export const agentApi = new AgentApiClient();

// Utility function for checking if agent service is available
export async function isAgentServiceAvailable(): Promise<boolean> {
  try {
    const health = await agentApi.healthCheck();
    return health.status === 'healthy' || health.status === 'degraded';
  } catch {
    return false;
  }
}
