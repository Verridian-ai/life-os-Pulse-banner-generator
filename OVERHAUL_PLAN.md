# Nanobanna Pro - Comprehensive Overhaul Plan

## Executive Summary

The application has **three major disconnected systems** that need to be integrated:
1. **Voice Agent (Benno)** - Built but never connected
2. **Chat Interface** - Not using OpenRouter
3. **Replicate API** - Authorization bugs + incomplete features

---

## Phase 1: Fix Immediate Bugs (Priority: HIGH)

### 1.1 Fix Replicate Authorization Headers

**File:** `src/services/replicate.ts`

**Problem:** `cancelPrediction()` and `getPredictionStatus()` use wrong header format

**Fix:**
```typescript
// Lines 253-257 and 270-274 - Change from:
headers: {
  Authorization: `Token ${this.apiKey}`,
  'Content-Type': 'application/json',
}

// To:
headers: {
  ...(isDev
    ? { 'x-replicate-token': this.apiKey }
    : { Authorization: `Token ${this.apiKey}` }),
  'Content-Type': 'application/json',
}
```

### 1.2 Fix Magic Edit to Use OpenRouter

**File:** `src/services/llm.ts`

**Problem:** Magic edit was trying to use direct Gemini SDK with wrong model name format

**Status:** FIXED in previous session - now uses OpenRouter first

### 1.3 Implement Remove Background in ActionExecutor

**File:** `src/services/actionExecutor.ts`

**Change:** Replace stub with actual implementation:
```typescript
private async removeBackground(args: { image_url: string }): Promise<ActionResult> {
  const { image_url } = args;
  console.log('[ActionExecutor] Removing background from:', image_url);

  try {
    const replicateService = await getReplicateService();
    const resultUrl = await replicateService.removeBg(image_url);

    return {
      success: true,
      imageUrl: resultUrl,
      action: 'remove_background',
    };
  } catch (error) {
    return {
      success: false,
      error: `Remove background failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}
```

---

## Phase 2: Connect Voice Agent (Benno) to UI

### 2.1 Create Voice Agent Context

**New File:** `src/context/VoiceAgentContext.tsx`

Purpose: Centralized state management for voice agent

```typescript
interface VoiceAgentState {
  isConnected: boolean;
  isListening: boolean;
  isSpeaking: boolean;
  transcript: TranscriptEntry[];
  pendingAction: ActionResult | null;
  executingAction: boolean;
  provider: 'gemini' | 'openai';
  error: string | null;
}

interface VoiceAgentContextType extends VoiceAgentState {
  connect: () => Promise<void>;
  disconnect: () => void;
  approveAction: () => Promise<void>;
  rejectAction: () => void;
  clearTranscript: () => void;
  setProvider: (provider: 'gemini' | 'openai') => void;
}
```

### 2.2 Create Voice Agent Hook

**New File:** `src/hooks/useVoiceAgent.ts`

Purpose: Easy-to-use hook for components

```typescript
export function useVoiceAgent() {
  const context = useContext(VoiceAgentContext);
  if (!context) {
    throw new Error('useVoiceAgent must be used within VoiceAgentProvider');
  }
  return context;
}
```

### 2.3 Add Voice Mode to UI

**Modify:** `src/App.tsx`

Changes:
1. Wrap app with `VoiceAgentProvider`
2. Add voice mode toggle button in header
3. Render `LiveActionPanel` when voice is active

```typescript
// In App.tsx header
<button
  onClick={toggleVoiceMode}
  className={`voice-toggle ${isVoiceActive ? 'active' : ''}`}
>
  {isVoiceActive ? <MicOff /> : <Mic />}
  {isVoiceActive ? 'Stop Benno' : 'Talk to Benno'}
</button>

// Conditional render
{isVoiceActive && (
  <LiveActionPanel
    isConnected={voiceAgent.isConnected}
    transcript={voiceAgent.transcript}
    pendingAction={voiceAgent.pendingAction}
    executingAction={voiceAgent.executingAction}
    onApproveAction={voiceAgent.approveAction}
    onRejectAction={voiceAgent.rejectAction}
  />
)}
```

### 2.4 Wire ActionExecutor to Canvas

**Modify:** `src/services/actionExecutor.ts`

Add proper canvas integration:
```typescript
// Constructor should receive canvas context callbacks
constructor(
  private onUpdate: (result: ActionResult) => void,
  private getCanvasImage: () => string | null,
  private previewMode: boolean = true
) {}
```

---

## Phase 3: Overhaul Chat Interface with OpenRouter

### 3.1 Create New Chat Service

**New File:** `src/services/chatAgent.ts`

Purpose: OpenRouter-based chat with tool execution

```typescript
interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  toolCalls?: ToolCall[];
}

interface ChatAgentConfig {
  model: string; // Default: 'google/gemini-2.5-pro' via OpenRouter
  systemPrompt: string;
  tools: ToolDefinition[];
  onToolCall: (toolCall: ToolCall) => Promise<ToolResult>;
}

export class ChatAgent {
  private messages: ChatMessage[] = [];
  private config: ChatAgentConfig;

  async chat(userMessage: string): Promise<string> {
    // 1. Add user message to history
    // 2. Call OpenRouter with tools
    // 3. If tool call detected, execute via ActionExecutor
    // 4. Return assistant response
  }
}
```

### 3.2 Define Chat Tools

```typescript
const CHAT_TOOLS = [
  {
    name: 'generate_background',
    description: 'Generate a new LinkedIn banner background',
    parameters: {
      prompt: { type: 'string', description: 'Image description' },
      style: { type: 'string', enum: ['professional', 'creative', 'minimal'] }
    }
  },
  {
    name: 'magic_edit',
    description: 'Edit the current banner with AI',
    parameters: {
      instruction: { type: 'string', description: 'Edit instruction' }
    }
  },
  {
    name: 'upscale_image',
    description: 'Upscale the current image to higher resolution',
    parameters: {
      quality: { type: 'string', enum: ['fast', 'balanced', 'best'] }
    }
  },
  {
    name: 'remove_background',
    description: 'Remove background from an image',
    parameters: {}
  },
  {
    name: 'restore_image',
    description: 'Restore and enhance a damaged or low-quality image',
    parameters: {}
  },
  {
    name: 'enhance_face',
    description: 'Enhance facial features in the image',
    parameters: {}
  },
  {
    name: 'suggest_prompts',
    description: 'Suggest creative prompts based on user industry/role',
    parameters: {
      industry: { type: 'string' },
      role: { type: 'string' }
    }
  }
];
```

### 3.3 Update ChatInterface Component

**Modify:** `src/components/ChatInterface.tsx`

Changes:
1. Use new `ChatAgent` service
2. Display tool execution progress
3. Show image previews for generated content
4. Add action approval UI (like LiveActionPanel)

```typescript
const ChatInterface = () => {
  const [chatAgent] = useState(() => new ChatAgent({
    model: 'google/gemini-2.5-pro',
    systemPrompt: BENNO_SYSTEM_PROMPT,
    tools: CHAT_TOOLS,
    onToolCall: handleToolCall
  }));

  const handleToolCall = async (toolCall: ToolCall) => {
    // Show preview
    setPendingAction(toolCall);

    // Wait for user approval
    const approved = await waitForApproval();

    if (approved) {
      const result = await actionExecutor.executeToolCall(toolCall);
      return result;
    }
    return { cancelled: true };
  };
};
```

### 3.4 Create Benno System Prompt

```typescript
const BENNO_SYSTEM_PROMPT = `You are Benno, a friendly AI assistant specialized in creating professional LinkedIn banners.

Your capabilities:
- Generate stunning banner backgrounds using AI image generation
- Edit existing banners with magic edit (add elements, change style, adjust colors)
- Upscale images to higher resolution
- Remove backgrounds from images
- Restore and enhance old or low-quality images
- Enhance facial features in portraits

When the user describes what they want:
1. Understand their professional context (industry, role, brand)
2. Suggest creative ideas if they're unsure
3. Use the appropriate tool to execute their request
4. Ask for approval before making changes

Be conversational, helpful, and creative. Guide users through creating their perfect LinkedIn banner.`;
```

---

## Phase 4: Unified Tool Execution System

### 4.1 Merge Voice + Chat Tool Execution

Both voice and chat should use the same `ActionExecutor`:

```typescript
// Shared action executor instance
const actionExecutor = new ActionExecutor(
  (result) => updateCanvas(result),
  () => getCanvasImage(),
  true // preview mode
);

// Voice agent uses it
liveClient.onToolCall = async (toolCall) => {
  return actionExecutor.executeToolCall(toolCall);
};

// Chat agent uses it
chatAgent.onToolCall = async (toolCall) => {
  return actionExecutor.executeToolCall(toolCall);
};
```

### 4.2 Add Preview/Approval Flow

```typescript
interface PendingAction {
  toolCall: ToolCall;
  preview: string | null; // Preview image URL
  timestamp: number;
  source: 'voice' | 'chat';
}

// Show preview before applying
const handlePendingAction = async (action: PendingAction) => {
  // Generate preview
  const preview = await actionExecutor.preview(action.toolCall);
  setPreviewImage(preview);

  // Wait for user decision
  const decision = await waitForUserDecision();

  if (decision === 'approve') {
    await actionExecutor.apply(action.toolCall);
  }
};
```

---

## Phase 5: Fix OpenAI Realtime Authentication

### 5.1 Create Backend Proxy

**New File:** `api/openai-realtime/route.ts` (for Vercel Edge)

```typescript
export const config = { runtime: 'edge' };

export default async function handler(req: Request) {
  const token = req.headers.get('x-openai-token');

  const response = await fetch('wss://api.openai.com/v1/realtime', {
    headers: {
      'Authorization': `Bearer ${token}`,
      'OpenAI-Beta': 'realtime=v1'
    },
    // WebSocket upgrade handling
  });

  return response;
}
```

### 5.2 Update OpenAI Client

**Modify:** `src/services/openaiRealtimeClient.ts`

```typescript
// Use proxy endpoint instead of direct connection
const wsUrl = import.meta.env.DEV
  ? 'ws://localhost:5173/api/openai-realtime'
  : 'wss://your-domain.com/api/openai-realtime';
```

---

## Phase 6: Security & Production Fixes

### 6.1 Fix CORS in Vercel Proxy

**Modify:** `api/replicate/[...path].ts`

```typescript
// Replace wildcard with specific origin
const allowedOrigins = [
  'https://life-os-banner.verridian.ai',
  'https://nanobanna-pro.vercel.app',
  'http://localhost:5173'
];

const origin = req.headers.get('origin');
if (allowedOrigins.includes(origin)) {
  res.setHeader('Access-Control-Allow-Origin', origin);
}
```

### 6.2 Add Retry Logic to Replicate

```typescript
async function fetchWithRetry(url: string, options: RequestInit, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(url, options);
      if (response.status === 429) {
        // Rate limited - exponential backoff
        await sleep(Math.pow(2, i) * 1000);
        continue;
      }
      return response;
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await sleep(Math.pow(2, i) * 1000);
    }
  }
}
```

### 6.3 Increase Replicate Timeout

```typescript
// In replicate.ts
const maxAttempts = 600; // 10 minutes max for large images
```

---

## Implementation Order

### Week 1: Critical Fixes
- [ ] Fix Replicate authorization headers
- [ ] Fix Magic Edit (already done)
- [ ] Implement Remove Background in ActionExecutor
- [ ] Fix CORS in production proxy

### Week 2: Voice Agent Connection
- [ ] Create VoiceAgentContext
- [ ] Add voice toggle to UI
- [ ] Wire LiveActionPanel to app
- [ ] Test with Gemini Live

### Week 3: Chat Overhaul
- [ ] Create ChatAgent service with OpenRouter
- [ ] Define tool schemas
- [ ] Update ChatInterface component
- [ ] Add preview/approval flow

### Week 4: Integration & Polish
- [ ] Merge voice + chat execution paths
- [ ] Add OpenAI Realtime backend proxy
- [ ] Comprehensive testing
- [ ] Production deployment

---

## Files to Create

1. `src/context/VoiceAgentContext.tsx` - Voice state management
2. `src/hooks/useVoiceAgent.ts` - Voice hook
3. `src/services/chatAgent.ts` - OpenRouter chat service
4. `api/openai-realtime/route.ts` - WebSocket proxy

## Files to Modify

1. `src/services/replicate.ts` - Fix auth headers
2. `src/services/actionExecutor.ts` - Add removeBackground
3. `src/components/ChatInterface.tsx` - Use ChatAgent
4. `src/App.tsx` - Add VoiceAgentProvider, voice toggle
5. `api/replicate/[...path].ts` - Fix CORS
6. `src/services/openaiRealtimeClient.ts` - Use proxy

---

## Testing Checklist

- [ ] Magic Edit works (OpenRouter → Gemini → Replicate fallback)
- [ ] Image generation works
- [ ] Upscale works (all 3 tiers)
- [ ] Remove Background works
- [ ] Restore works
- [ ] Face Enhance works
- [ ] Voice agent connects (Gemini)
- [ ] Voice commands execute with preview
- [ ] Chat uses OpenRouter
- [ ] Chat tool calls execute
- [ ] Production deployment works
- [ ] Custom domain works (life-os-banner.verridian.ai)
