// API Request and Response Types
// Centralized type definitions for all API interactions

/**
 * API Request Body Type
 * Union of all allowed request body types for type safety
 * Includes object type to accept any serializable object structure
 */
export type RequestBody =
  | Record<string, unknown>
  | object
  | FormData
  | string
  | null
  | undefined;

/**
 * User Profile Response
 * Returned from /api/user/profile endpoints
 */
export interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  first_name?: string;
  last_name?: string;
  username?: string;
  avatar_url?: string;
}

/**
 * User Preferences Response
 * Returned from /api/user/preferences endpoints
 */
export interface UserPreferences {
  theme?: 'light' | 'dark' | 'system';
  language?: string;
  notifications?: Record<string, boolean>;
  chat_settings?: ChatSettings;
  session_timeout?: number; // Minutes (0 or undefined = disabled)
}

/**
 * Chat Settings
 * User-specific chat preferences
 */
export interface ChatSettings {
  auto_save?: boolean;
  save_images?: boolean;
  default_mode?: 'design' | 'search' | 'voice';
  voice_provider?: 'gemini' | 'openai';
  auto_approve_actions?: boolean;
}

/**
 * API Keys Storage Response
 * Keys are masked (****xxxx) for display - server handles actual API calls
 */
export interface ApiKeysResponse {
  geminiApiKey?: string;
  openaiApiKey?: string;
  openrouterApiKey?: string;
  replicateApiKey?: string;
  llmProvider?: 'gemini' | 'openrouter';
  llmModel?: string;
  llmImageModel?: string;
  llmMagicEditModel?: string;
  llmUpscaleModel?: string;
  // Boolean flags indicating if keys exist
  hasGeminiKey?: boolean;
  hasOpenaiKey?: boolean;
  hasOpenrouterKey?: boolean;
  hasReplicateKey?: boolean;
}

/**
 * Voice API Key Response
 * Contains actual OpenAI key for voice WebSocket connection
 */
export interface VoiceKeyResponse {
  voiceKey?: string;
  error?: string;
  requiresKey?: boolean;
}

/**
 * Tool Call Type
 * Structure for AI tool invocations
 */
export interface ToolCall {
  id: string;
  type: 'function';
  function: {
    name: string;
    arguments: string; // JSON string
  };
}

/**
 * Tool Result Type
 * Structure for AI tool execution results
 */
export interface ToolResult {
  tool_call_id: string;
  role: 'tool';
  content: string;
}

/**
 * Profile and Preferences Combined Response
 * Used when both are fetched together
 */
export interface ProfileWithPreferences {
  profile: UserProfile;
  preferences: UserPreferences;
}

/**
 * Generic API Success Response
 */
export interface ApiSuccessResponse {
  success: boolean;
  error?: string;
}

/**
 * Generic API Error Response
 */
export interface ApiErrorResponse {
  error: string;
  status?: number;
}
