// ChatAgent Service - Chat with tool calling support via backend API
// Provides a conversational interface for the Brainstorm tab with action execution

import { MODELS } from '@/constants';
import { ChatMessage } from '@/types';

// Internal message format for OpenRouter API (OpenAI-compatible)
interface OpenRouterMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  tool_calls?: ToolCall[];
}

// OpenAI-compatible tool call format
export interface ToolCall {
  id: string;
  type: 'function';
  function: {
    name: string;
    arguments: string; // JSON string
  };
}

// Tool result format
interface ToolResult {
  tool_call_id: string;
  role: 'tool';
  name: string;
  content: string;
}

// OpenRouter API response format
interface OpenRouterResponse {
  choices: Array<{
    message: {
      role: string;
      content: string | null;
      tool_calls?: ToolCall[];
    };
    finish_reason: string;
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

// Tool callback function type
export type ToolCallCallback = (name: string, args: Record<string, unknown>) => Promise<unknown>;

// Conversation update callback
export type ConversationUpdateCallback = (messages: ChatMessage[]) => void;

// Benno's system prompt - friendly LinkedIn banner assistant
const SYSTEM_PROMPT = `You are Benno, a friendly AI assistant specialized in creating professional LinkedIn banners.

Your capabilities:
- Generate stunning banner backgrounds using AI image generation
- Edit existing banners with magic edit
- Upscale images to higher resolution (fast, balanced, or best quality)
- Remove backgrounds from images
- Restore and enhance old or low-quality images
- Enhance facial features in portraits
- Suggest creative prompts for banners tailored to different industries and roles

When the user describes what they want, use the appropriate tool. Be conversational and creative.

Guidelines:
- Always ask about the user's industry, role, or goals to provide personalized suggestions
- Explain why certain design choices work for LinkedIn banners
- Consider the LinkedIn banner safe zones (bottom-left 568x264px is covered by profile)
- Suggest color schemes based on industry psychology (e.g., blue for trust, red for energy)
- When generating images, be specific about style, mood, and professional quality
- Keep conversations friendly and encouraging

Remember: You're helping people make a great first impression on LinkedIn!`;

// Tool definitions in OpenAI function calling format
const TOOLS = [
  {
    type: 'function',
    function: {
      name: 'generate_background',
      description:
        'Generate a professional LinkedIn banner background image using AI. Creates high-quality images based on text prompts.',
      parameters: {
        type: 'object',
        properties: {
          prompt: {
            type: 'string',
            description:
              'Detailed description of the banner background to generate. Include style, colors, mood, and professional elements.',
          },
          style: {
            type: 'string',
            enum: ['professional', 'creative', 'minimal'],
            description: 'Overall style approach for the banner (optional)',
          },
          quality: {
            type: 'string',
            enum: ['1K', '2K', '4K'],
            description: 'Output resolution quality. Default is 2K (2048x2048)',
          },
        },
        required: ['prompt'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'magic_edit',
      description:
        'Edit an existing banner image using AI. Requires the user to have a banner already loaded in the canvas.',
      parameters: {
        type: 'object',
        properties: {
          instruction: {
            type: 'string',
            description: 'Instruction for how to modify the existing banner image',
          },
        },
        required: ['instruction'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'upscale_image',
      description:
        'Upscale and enhance image quality to higher resolution. Three quality tiers available.',
      parameters: {
        type: 'object',
        properties: {
          quality: {
            type: 'string',
            enum: ['fast', 'balanced', 'best'],
            description:
              'Quality tier: fast (Real-ESRGAN), balanced (Recraft Clarity), best (Magic Refiner). Default is balanced.',
          },
        },
        required: [],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'remove_background',
      description: 'Remove the background from an image, making it transparent.',
      parameters: {
        type: 'object',
        properties: {},
        required: [],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'restore_image',
      description: 'Restore and enhance old, damaged, or low-quality images using AI.',
      parameters: {
        type: 'object',
        properties: {},
        required: [],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'enhance_face',
      description: 'Enhance facial features in portrait images for professional appearance.',
      parameters: {
        type: 'object',
        properties: {},
        required: [],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'suggest_prompts',
      description:
        'Generate creative prompt suggestions for LinkedIn banners based on industry and role.',
      parameters: {
        type: 'object',
        properties: {
          industry: {
            type: 'string',
            description: 'The user\'s industry (e.g., "technology", "finance", "healthcare")',
          },
          role: {
            type: 'string',
            description: 'The user\'s role (e.g., "software engineer", "sales manager", "designer")',
          },
        },
        required: [],
      },
    },
  },
];

/**
 * ChatAgent - OpenRouter-based conversational agent with tool calling
 */
export class ChatAgent {
  private internalHistory: OpenRouterMessage[]; // Internal OpenRouter format
  private displayHistory: ChatMessage[]; // External display format
  private onToolCall: ToolCallCallback;
  private onUpdate?: ConversationUpdateCallback;
  private model: string;

  constructor(config: { onToolCall: ToolCallCallback; onUpdate?: ConversationUpdateCallback }) {
    this.internalHistory = [
      {
        role: 'system',
        content: SYSTEM_PROMPT,
      },
    ];
    this.displayHistory = [
      {
        role: 'model',
        text: 'Hi! I\'m Benno, your LinkedIn banner assistant. What kind of banner are you looking to create today?',
      },
    ];
    this.onToolCall = config.onToolCall;
    this.onUpdate = config.onUpdate;
    this.model = MODELS.textBasic; // google/gemini-2.5-pro via OpenRouter

    console.log('[ChatAgent] Initialized with model:', this.model);
  }

  /**
   * Send a user message and get AI response
   * Handles tool calls automatically and returns the final text response
   */
  async chat(userMessage: string, images?: string[]): Promise<string> {
    console.log('[ChatAgent] User message:', userMessage);

    // Add user message to both histories
    this.internalHistory.push({
      role: 'user',
      content: userMessage,
    });

    this.displayHistory.push({
      role: 'user',
      text: userMessage,
      images,
    });

    this.notifyUpdate();

    try {
      // Call backend API which handles API key resolution (product keys or BYOK)
      const response = await this.callBackendChat();

      // Extract assistant message
      const assistantMessage = response.choices[0]?.message;

      if (!assistantMessage) {
        throw new Error('No response from AI model');
      }

      // Handle tool calls if present
      if (assistantMessage.tool_calls && assistantMessage.tool_calls.length > 0) {
        console.log('[ChatAgent] Processing tool calls:', assistantMessage.tool_calls.length);

        // Add assistant message with tool calls to internal history
        this.internalHistory.push({
          role: 'assistant',
          content: assistantMessage.content || '',
          tool_calls: assistantMessage.tool_calls,
        });

        // Add thinking indicator to display history
        this.displayHistory.push({
          role: 'model',
          text: assistantMessage.content || 'Executing action...',
          isThinking: true,
        });

        this.notifyUpdate();

        // Execute each tool call
        const toolResults: ToolResult[] = [];

        for (const toolCall of assistantMessage.tool_calls) {
          try {
            const args = JSON.parse(toolCall.function.arguments);
            console.log('[ChatAgent] Executing tool:', toolCall.function.name, args);

            const result = await this.onToolCall(toolCall.function.name, args);

            toolResults.push({
              tool_call_id: toolCall.id,
              role: 'tool',
              name: toolCall.function.name,
              content: JSON.stringify({ success: true, result }),
            });
          } catch (error) {
            console.error('[ChatAgent] Tool execution error:', error);
            toolResults.push({
              tool_call_id: toolCall.id,
              role: 'tool',
              name: toolCall.function.name,
              content: JSON.stringify({
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
              }),
            });
          }
        }

        // Add tool results to internal history
        // Note: OpenAI format uses role: 'tool', but we store as system for simplicity
        for (const toolResult of toolResults) {
          this.internalHistory.push({
            role: 'system',
            content: `Tool ${toolResult.name} result: ${toolResult.content}`,
          });
        }

        // Get final response after tool execution
        const finalResponse = await this.callBackendChat();
        const finalMessage = finalResponse.choices[0]?.message;

        // Remove thinking indicator
        this.displayHistory = this.displayHistory.filter((msg) => !msg.isThinking);

        if (finalMessage?.content) {
          this.internalHistory.push({
            role: 'assistant',
            content: finalMessage.content,
          });

          this.displayHistory.push({
            role: 'model',
            text: finalMessage.content,
          });

          this.notifyUpdate();

          return finalMessage.content;
        }

        const defaultResponse = "I've completed the action. Let me know if you'd like any adjustments!";

        this.displayHistory.push({
          role: 'model',
          text: defaultResponse,
        });

        this.notifyUpdate();

        return defaultResponse;
      }

      // No tool calls - just return the text response
      if (assistantMessage.content) {
        this.internalHistory.push({
          role: 'assistant',
          content: assistantMessage.content,
        });

        this.displayHistory.push({
          role: 'model',
          text: assistantMessage.content,
        });

        this.notifyUpdate();

        return assistantMessage.content;
      }

      throw new Error('No content in assistant response');
    } catch (error) {
      console.error('[ChatAgent] Chat error:', error);
      const errorMessage =
        error instanceof Error ? error.message : 'An unexpected error occurred';

      // Add error message to display history
      const errorText = `Sorry, I encountered an error: ${errorMessage}`;

      this.displayHistory.push({
        role: 'model',
        text: errorText,
      });

      this.notifyUpdate();

      throw error;
    }
  }

  /**
   * Call backend chat API (handles API key resolution - product keys or BYOK)
   */
  private async callBackendChat(): Promise<OpenRouterResponse> {
    const requestBody = {
      model: this.model,
      messages: this.internalHistory.map((msg) => ({
        role: msg.role,
        content: msg.content,
        ...(msg.tool_calls && { tool_calls: msg.tool_calls }),
      })),
      tools: TOOLS,
      tool_choice: 'auto', // Let the model decide when to use tools
    };

    console.log('[ChatAgent] Calling backend chat API:', {
      model: this.model,
      messageCount: requestBody.messages.length,
      hasTools: true,
    });

    const response = await fetch('/api/ai/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Include auth cookies
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[ChatAgent] Backend chat error:', errorText);
      throw new Error(`Chat API error: ${response.status} ${errorText}`);
    }

    const data = await response.json();

    console.log('[ChatAgent] Backend chat response:', {
      hasContent: !!data.choices[0]?.message?.content,
      hasToolCalls: !!data.choices[0]?.message?.tool_calls,
      finishReason: data.choices[0]?.finish_reason,
    });

    return data;
  }

  /**
   * Get conversation history (returns display format)
   */
  getHistory(): ChatMessage[] {
    return [...this.displayHistory];
  }

  /**
   * Clear conversation history (except system prompt)
   */
  clearHistory(): void {
    console.log('[ChatAgent] Clearing conversation history');
    this.internalHistory = [
      {
        role: 'system',
        content: SYSTEM_PROMPT,
      },
    ];
    this.displayHistory = [
      {
        role: 'model',
        text: 'Hi! I\'m Benno, your LinkedIn banner assistant. What kind of banner are you looking to create today?',
      },
    ];
    this.notifyUpdate();
  }

  /**
   * Notify subscribers of conversation updates
   */
  private notifyUpdate(): void {
    if (this.onUpdate) {
      this.onUpdate(this.getHistory());
    }
  }
}
