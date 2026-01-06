# Voice Agent Technical Documentation

## Table of Contents
1. [Overview](#overview)
2. [Architecture](#architecture)
3. [VoiceAgentContext API](#voiceagentcontext-api)
4. [ActionExecutor Class](#actionexecutor-class)
5. [OpenAI Realtime Client](#openai-realtime-client)
6. [Tool Call Structure](#tool-call-structure)
7. [Integration Patterns](#integration-patterns)
8. [Extending Commands](#extending-commands)
9. [Error Handling](#error-handling)
10. [Audio Pipeline](#audio-pipeline)
11. [Performance Optimization](#performance-optimization)
12. [Testing & Debugging](#testing--debugging)
13. [Security Considerations](#security-considerations)
14. [API Reference](#api-reference)
15. [Related Documentation](#related-documentation)
16. [External Resources](#external-resources)

## Overview

The Voice Agent system enables hands-free interaction with Nanobanna Pro through real-time voice commands. It uses the **OpenAI Realtime API** (gpt-4o-realtime-preview) for voice-to-voice conversations with function calling capabilities.

### Key Components

| Component | File | Purpose |
|-----------|------|---------|
| VoiceAgentContext | `src/context/VoiceAgentContext.tsx` | State management, connection lifecycle |
| ActionExecutor | `src/services/actionExecutor.ts` | Tool call execution, preview mode |
| OpenAIRealtimeClient | `src/services/openaiRealtimeClient.ts` | WebSocket connection, audio pipeline |
| LiveActionPanel | `src/components/features/LiveActionPanel.tsx` | UI for action approval |

### Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│  User Voice Input (Microphone)                              │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│  OpenAIRealtimeClient                                       │
│  ├── Audio Input Processing (Float32 → PCM16)              │
│  ├── WebSocket Connection (WSS)                            │
│  └── Audio Output Playback (Ring Buffer)                   │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│  VoiceAgentContext                                          │
│  ├── Connection State Management                           │
│  ├── Transcript Management                                 │
│  ├── Tool Call Routing                                     │
│  └── Approval Workflow                                     │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│  ActionExecutor                                             │
│  ├── Tool Call Execution (17 commands)                     │
│  ├── Preview Mode Management                               │
│  ├── Canvas Callbacks                                      │
│  └── Result Handling                                       │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│  Application State (Canvas, AI Services, UI)                │
└─────────────────────────────────────────────────────────────┘
```

### Technology Stack

- **OpenAI Realtime API:** gpt-4o-realtime-preview model
- **Audio:** Web Audio API (24kHz PCM16)
- **Protocol:** WebSocket (WSS) with binary audio frames
- **Voice:** Alloy voice model
- **Transcription:** Whisper-1 for user speech
- **VAD:** Server-side voice activity detection

## Architecture

### 5-Phase Connection Lifecycle

#### Phase 1: Initialization
```typescript
const connect = useCallback(async () => {
  // Race condition prevention
  if (connectingRef.current) return;
  connectingRef.current = true;

  // Fetch OpenAI API key from backend
  const keyResult = await getVoiceAPIKey();

  // Create client instance
  const client = new OpenAIRealtimeClient(openaiKey);
  liveClientRef.current = client;

  // Create action executor in preview mode
  const executor = new ActionExecutor(
    onUpdate,
    true,  // preview mode
    undefined,
    promptSetterRef.current || undefined,
    canvasCallbacks
  );
  actionExecutorRef.current = executor;
}, [onUpdate, canvasCallbacks]);
```

#### Phase 2: WebSocket Setup
```typescript
// OpenAIRealtimeClient connects to WSS endpoint
const wsUrl = `wss://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview`;

this.ws = new WebSocket(wsUrl, [
  'realtime',
  `openai-insecure-api-key.${this.apiKey}`,
  'openai-beta.realtime-v1',
]);
```

#### Phase 3: Session Configuration
```typescript
// Send session.update with tools and modalities
this.sendMessage({
  type: 'session.update',
  session: {
    modalities: ['text', 'audio'],
    voice: 'alloy',
    input_audio_format: 'pcm16',
    output_audio_format: 'pcm16',
    input_audio_transcription: {
      model: 'whisper-1',
    },
    turn_detection: {
      type: 'server_vad',  // Voice Activity Detection
    },
    tools: [/* 17 function definitions */],
  },
});
```

#### Phase 4: Active Session
- Continuous audio streaming (mic → server → speaker)
- Real-time transcription
- Tool call execution with preview
- Conversation state management

#### Phase 5: Disconnection
```typescript
async disconnect() {
  // Close WebSocket
  if (this.ws) this.ws.close();

  // Stop audio playback
  if (this.playbackQueue) this.playbackQueue.stop();

  // Stop microphone
  if (this.audioStream) {
    this.audioStream.getTracks().forEach(t => t.stop());
  }

  // Disconnect audio nodes
  if (this.scriptProcessor) {
    this.scriptProcessor.onaudioprocess = null;
    this.scriptProcessor.disconnect();
  }

  // Close audio context
  if (this.audioContext) {
    await this.audioContext.close();
  }

  // Clear cached buffers
  this.decodeBuffer = null;
  this.float32Cache = null;
}
```

### State Management

The VoiceAgentContext manages 7 state variables:

```typescript
interface VoiceAgentContextType {
  // Connection state
  isConnected: boolean;      // WebSocket connection status
  isListening: boolean;      // Microphone active
  isSpeaking: boolean;       // AI is speaking

  // Conversation data
  transcript: TranscriptEntry[];  // Conversation history
  pendingAction: {
    toolCall: ToolCall;
    result: ActionResult;
  } | null;                  // Awaiting user approval
  executingAction: boolean;  // Action in progress
  error: string | null;      // Error message

  // Methods
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  approveAction: () => Promise<void>;
  rejectAction: () => void;
  clearTranscript: () => void;
  registerPromptSetter: (setter: (prompt: string) => void) => void;
}
```

## VoiceAgentContext API

### Provider Setup

```typescript
import { VoiceAgentProvider } from '@/context/VoiceAgentContext';

function App() {
  const handleUpdate = (imageUrl: string, type: 'background' | 'profile') => {
    // Update canvas with new image
    console.log('Updating canvas:', type, imageUrl);
  };

  const canvasCallbacks = {
    addElement: (element) => { /* Add to canvas */ },
    updateElement: (id, updates) => { /* Update element */ },
    deleteElement: (id) => { /* Remove element */ },
    getElements: () => { /* Return all elements */ },
    undo: () => { /* Undo last action */ },
    redo: () => { /* Redo action */ },
    setActiveTab: (tab) => { /* Navigate to tab */ },
  };

  return (
    <VoiceAgentProvider
      onUpdate={handleUpdate}
      setGenPrompt={(prompt) => setPromptField(prompt)}
      canvasCallbacks={canvasCallbacks}
    >
      {children}
    </VoiceAgentProvider>
  );
}
```

### Using the Hook

```typescript
import { useVoiceAgent } from '@/context/VoiceAgentContext';

function VoiceControls() {
  const {
    isConnected,
    isListening,
    isSpeaking,
    transcript,
    pendingAction,
    executingAction,
    error,
    connect,
    disconnect,
    approveAction,
    rejectAction,
    clearTranscript,
  } = useVoiceAgent();

  return (
    <div>
      <button onClick={isConnected ? disconnect : connect}>
        {isConnected ? 'Disconnect' : 'Connect'}
      </button>

      {error && <div className="error">{error}</div>}

      {pendingAction && (
        <div>
          <h3>Preview: {pendingAction.toolCall.name}</h3>
          {pendingAction.result.preview && (
            <img src={pendingAction.result.preview} alt="Preview" />
          )}
          <button onClick={approveAction}>Apply</button>
          <button onClick={rejectAction}>Reject</button>
        </div>
      )}
    </div>
  );
}
```

### Connection Management

#### Connect to Voice Session

```typescript
try {
  await connect();
  console.log('Voice session started');
} catch (error) {
  // Handle connection errors
  if (error.message.includes('Microphone error')) {
    alert('Please allow microphone access');
  } else if (error.message.includes('API key')) {
    alert('OpenAI API key not configured');
  } else {
    console.error('Connection failed:', error);
  }
}
```

#### Disconnect from Session

```typescript
await disconnect();
// All audio processing stops
// WebSocket closes
// State resets to default
```

### Approval Workflow

When the AI calls a tool, it enters preview mode:

```typescript
// 1. Tool call received
onToolCall: async (toolCall: ToolCall) => {
  console.log('Tool call:', toolCall.name, toolCall.args);

  // 2. Execute in preview mode
  const result = await executor.executeToolCall(toolCall);

  // 3. Store for user approval
  setPendingAction({ toolCall, result });
}

// User approves
const approveAction = async () => {
  if (pendingAction.result.success) {
    // Apply the previewed result to canvas
    actionExecutorRef.current.applyPreview(
      pendingAction.result.result
    );
  }
  setPendingAction(null);
};

// User rejects
const rejectAction = () => {
  setPendingAction(null);  // Discard preview
};
```

## ActionExecutor Class

### Constructor

```typescript
constructor(
  onUpdate: OnUpdateCallback,
  previewMode = false,
  getCanvasImage?: () => string | undefined,
  setGenPrompt?: SetGenPromptCallback,
  canvasCallbacks?: CanvasCallbacks
)
```

**Parameters:**
- `onUpdate`: Callback to update canvas with new images
- `previewMode`: If true, return previews instead of auto-applying
- `getCanvasImage`: Function to get current canvas image URL
- `setGenPrompt`: Function to update generation prompt field
- `canvasCallbacks`: Canvas manipulation functions

### Setting Callbacks

```typescript
const executor = new ActionExecutor(onUpdate, true);

// Set canvas image getter for magic edit operations
executor.setCanvasImageGetter(() => canvasImageUrl);

// Set prompt setter for voice-to-prompt enhancement
executor.setPromptSetter((prompt) => {
  setGenerationPrompt(prompt);
});

// Set canvas manipulation callbacks
executor.setCanvasCallbacks({
  addElement: (element) => addToCanvas(element),
  updateElement: (id, updates) => updateCanvas(id, updates),
  deleteElement: (id) => removeFromCanvas(id),
  getElements: () => getAllCanvasElements(),
  undo: () => undoCanvasAction(),
  redo: () => redoCanvasAction(),
  setActiveTab: (tab) => navigateToTab(tab),
});

// Toggle preview mode
executor.setPreviewMode(true);  // Enable preview mode
executor.setPreviewMode(false); // Auto-apply mode
```

### Executing Tool Calls

```typescript
const toolCall: ToolCall = {
  name: 'generate_background',
  args: {
    prompt: 'Mountain landscape at sunset',
    quality: '2K',
  },
};

const result = await executor.executeToolCall(toolCall);

if (result.success) {
  console.log('Success:', result.result);
  if (result.preview) {
    // Show preview image
    displayPreview(result.preview);
  }
} else {
  console.error('Error:', result.error);
}
```

### Available Tools

The ActionExecutor supports 17 tools across 6 categories:

#### Image Generation (1 tool)

```typescript
{
  name: 'generate_background',
  args: {
    prompt: string;      // Generation prompt
    quality?: string;    // '1K' | '2K' | '4K'
  }
}
```

#### Image Processing (5 tools)

```typescript
// Magic Edit
{
  name: 'magic_edit',
  args: {
    base_image: string;  // Image URL or uses canvas
    prompt: string;      // Edit instruction
    mask?: string;       // Optional mask URL
  }
}

// Remove Background
{
  name: 'remove_background',
  args: {
    image_url?: string;  // Optional, uses canvas if not provided
  }
}

// Upscale Image
{
  name: 'upscale_image',
  args: {
    image_url: string;   // Image to upscale
    mode?: string;       // 'fast' | 'balanced' | 'best'
  }
}

// Restore Image
{
  name: 'restore_image',
  args: {
    image_url: string;   // Damaged image URL
  }
}

// Enhance Face
{
  name: 'enhance_face',
  args: {
    image_url: string;   // Portrait image URL
  }
}
```

#### Canvas Manipulation (4 tools)

```typescript
// Add Text Element
{
  name: 'add_text_element',
  args: {
    text: string;         // Text content
    x?: number;           // X position (default: 792)
    y?: number;           // Y position (default: 198)
    fontSize?: number;    // Font size (default: 48)
    color?: string;       // Hex color (default: '#ffffff')
    fontFamily?: string;  // Font name (default: 'Inter')
  }
}

// Update Element
{
  name: 'update_element',
  args: {
    element_id: string;              // Element ID to update
    properties: Partial<BannerElement>;  // Properties to change
  }
}

// Delete Element
{
  name: 'delete_element',
  args: {
    element_id: string;  // Element ID to delete
  }
}

// List Elements
{
  name: 'list_elements',
  args: {}  // No arguments
}
```

#### Navigation (1 tool)

```typescript
{
  name: 'navigate_to_tab',
  args: {
    tab: string;  // 'studio' | 'gallery' | 'brainstorm'
  }
}
```

#### History (2 tools)

```typescript
// Undo
{
  name: 'undo_action',
  args: {}
}

// Redo
{
  name: 'redo_action',
  args: {}
}
```

#### AI Analysis (4 tools)

```typescript
// Suggest Prompts
{
  name: 'suggest_prompts',
  args: {
    industry?: string;  // e.g., 'tech', 'finance'
    role?: string;      // e.g., 'developer', 'designer'
  }
}

// Write Enhanced Prompt
{
  name: 'write_enhanced_prompt',
  args: {
    prompt: string;     // Rough prompt
    industry?: string;  // Industry context
    style?: string;     // Style hint
  }
}

// Analyze Image
{
  name: 'analyze_image',
  args: {
    image_url?: string;  // Optional, uses canvas if not provided
  }
}

// Analyze Banner
{
  name: 'analyze_banner',
  args: {}  // Uses current canvas
}
```

## OpenAI Realtime Client

### Implementation Status

**ACTIVE PRODUCTION IMPLEMENTATION** ✓

The OpenAI Realtime Client is a fully-active, production-ready integration with the OpenAI Realtime API (gpt-4o-realtime-preview model, GA December 2024). This is **not a stub or placeholder**.

**Key Implementation Features:**
- ✓ WebSocket connection to `wss://api.openai.com/v1/realtime`
- ✓ 17 registered function tools for voice commands
- ✓ Bidirectional audio streaming (PCM16 @ 24kHz)
- ✓ Ring buffer architecture for smooth playback
- ✓ Server-side Voice Activity Detection (VAD)
- ✓ Whisper-1 transcription for user speech
- ✓ Memory-optimized with buffer reuse
- ✓ Robust error handling and cleanup

**Migration Notes:**

This implementation has evolved through several optimization phases:

1. **Initial Implementation:** Basic WebSocket connection with simple audio playback
2. **Audio Quality Improvements:** Added ring buffer and continuous playback for smooth audio
3. **Memory Optimization:** Implemented buffer reuse to prevent GC pressure (Fixes #1-5)
4. **Robustness Enhancements:** Added pre-buffering, underrun tracking, and graceful degradation

**No Migration Required:** The current implementation is production-ready. If integrating from an older version:
- Ensure you're using `gpt-4o-realtime-preview` model (not older preview models)
- Update to `openai-beta.realtime-v1` protocol version
- Use the 17-tool configuration for full functionality

### Class Overview

```typescript
export class OpenAIRealtimeClient {
  // Core Properties
  private ws: WebSocket | null = null;
  private apiKey: string;
  private isConnected: boolean = false;

  // Audio Infrastructure
  private audioContext: AudioContext | null = null;
  private scriptProcessor: ScriptProcessorNode | null = null;
  private sourceNode: MediaStreamAudioSourceNode | null = null;
  private silentGainNode: GainNode | null = null;
  private audioStream: MediaStream | null = null;
  private playbackQueue: AudioPlaybackQueue | null = null;

  // Performance Optimization (Buffer Reuse)
  private decodeBuffer: Uint8Array | null = null;
  private float32Cache: Float32Array | null = null;
  private inputPcm16Buffer: Int16Array | null = null;

  // Conversation State
  private transcript: TranscriptEntry[] = [];

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }
}
```

### Creating a Client

```typescript
import { OpenAIRealtimeClient } from '@/services/openaiRealtimeClient';

// Create client with OpenAI API key
const client = new OpenAIRealtimeClient(apiKey);

// Connect with all callback handlers
await client.connect(
  // onMessage: AI is speaking (text deltas during response)
  (text) => {
    console.log('AI:', text);
    // Update UI with AI response text
  },

  // onStatus: Connection status changes
  (connected) => {
    console.log('Connected:', connected);
    // Update connection indicator in UI
  },

  // onToolCall: AI wants to execute a tool (optional)
  async (toolCall) => {
    console.log('Tool call:', toolCall);
    // Execute tool and return result
    const result = await executeToolCall(toolCall);
    return result;
  },

  // onTranscript: Conversation updates (optional)
  (entry) => {
    console.log(entry.role, ':', entry.text);
    // Add to conversation history display
  }
);

// Connection is now active and audio is streaming
```

### Connection Lifecycle Deep Dive

The `connect()` method performs a 7-step initialization sequence:

#### Step 1: Microphone Access
```typescript
// Request microphone with audio enhancements
this.audioStream = await navigator.mediaDevices.getUserMedia({
  audio: {
    echoCancellation: true,    // Remove echo for cleaner audio
    noiseSuppression: true,    // Reduce background noise
    sampleRate: 24000,         // Match OpenAI's expected rate
  },
});
```

**Error Handling:**
- `NotAllowedError`: User denied microphone permission
- `NotFoundError`: No microphone device available
- Generic error: Hardware or driver issues

#### Step 2: Audio Context Creation
```typescript
// Create audio context at 24kHz to match OpenAI
this.audioContext = new (window.AudioContext || window.webkitAudioContext)({
  sampleRate: 24000,
});
```

**Browser Compatibility:**
- Chrome/Edge: Uses `AudioContext`
- Safari: Uses `webkitAudioContext`
- Firefox: Uses `AudioContext` (24kHz support varies)

#### Step 3: Playback Queue Initialization
```typescript
// Initialize robust audio playback with ring buffer
this.playbackQueue = new AudioPlaybackQueue(this.audioContext);
// 10-second buffer (240,000 samples at 24kHz)
// Pre-buffers 100ms before starting playback
```

#### Step 4: WebSocket Connection
```typescript
const wsUrl = `wss://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview`;

this.ws = new WebSocket(wsUrl, [
  'realtime',                              // Protocol identifier
  `openai-insecure-api-key.${this.apiKey}`, // API key authentication
  'openai-beta.realtime-v1',               // Protocol version
]);
```

**WebSocket Headers:**
- Uses subprotocol negotiation for API key (not standard headers)
- WSS (WebSocket Secure) ensures encrypted transmission
- Protocol version ensures compatibility

#### Step 5: Session Configuration
```typescript
// Configure session with tools and modalities
this.sendMessage({
  type: 'session.update',
  session: {
    modalities: ['text', 'audio'],        // Enable both text and voice
    instructions: '...',                   // System prompt for AI
    voice: 'alloy',                        // Voice model (alloy, echo, fable, onyx, nova, shimmer)
    input_audio_format: 'pcm16',          // 16-bit PCM input
    output_audio_format: 'pcm16',         // 16-bit PCM output
    input_audio_transcription: {
      model: 'whisper-1',                  // Transcribe user speech
    },
    turn_detection: {
      type: 'server_vad',                  // Server-side voice activity detection
    },
    tools: [/* 17 function definitions */], // Register all voice commands
  },
});
```

**Session Parameters:**
- **modalities:** `['text', 'audio']` enables voice responses
- **voice:** Options are `alloy` (default), `echo`, `fable`, `onyx`, `nova`, `shimmer`
- **input_audio_transcription:** Whisper-1 provides real-time transcription
- **turn_detection:** Server VAD determines when user stops speaking
- **tools:** 17 functions across 6 categories (see ActionExecutor section)

#### Step 6: Audio Processing Setup
```typescript
// Set up microphone input processing
this.sourceNode = this.audioContext.createMediaStreamSource(this.audioStream);
this.scriptProcessor = this.audioContext.createScriptProcessor(4096, 1, 1);

// Pre-allocate buffer for performance (Fix #3)
this.inputPcm16Buffer = new Int16Array(4096);

this.scriptProcessor.onaudioprocess = (e) => {
  const inputData = e.inputBuffer.getChannelData(0); // Float32Array

  // Convert Float32 → PCM16
  for (let i = 0; i < inputData.length; i++) {
    const s = Math.max(-1, Math.min(1, inputData[i]));
    this.inputPcm16Buffer[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
  }

  // Encode to base64 and send
  const base64 = this.arrayBufferToBase64(this.inputPcm16Buffer.buffer);
  this.sendMessage({
    type: 'input_audio_buffer.append',
    audio: base64,
  });
};

// Connect audio graph (must connect to destination for processing to work)
this.silentGainNode = this.audioContext.createGain();
this.silentGainNode.gain.value = 0; // Mute mic loopback
this.sourceNode.connect(this.scriptProcessor);
this.scriptProcessor.connect(this.silentGainNode);
this.silentGainNode.connect(this.audioContext.destination);
```

**Audio Processing Notes:**
- `ScriptProcessorNode` processes 4096 samples (~170ms at 24kHz)
- Must connect to `destination` for `onaudioprocess` to fire
- Silent `GainNode` prevents mic loopback while keeping graph active
- Buffer reuse prevents garbage collection pressure

#### Step 7: Message Handlers
```typescript
// Handle incoming WebSocket messages
this.ws.onmessage = (event) => {
  const message = JSON.parse(event.data);
  this.handleMessage(message, onMessage, onToolCall, onTranscript);
};

// Handle connection errors
this.ws.onerror = (error) => {
  console.error('[OpenAI Realtime] WebSocket error:', error);
  this.disconnect();
};

// Handle connection close
this.ws.onclose = () => {
  console.log('[OpenAI Realtime] WebSocket closed');
  this.disconnect();
};
```

### Audio Pipeline Architecture

The OpenAI Realtime Client implements a sophisticated audio pipeline:

#### Input Pipeline (Microphone → Server)

```typescript
// 1. Capture audio from microphone
navigator.mediaDevices.getUserMedia({
  audio: {
    echoCancellation: true,
    noiseSuppression: true,
    sampleRate: 24000,
  }
});

// 2. Process with ScriptProcessorNode (4096 samples)
this.scriptProcessor = this.audioContext.createScriptProcessor(4096, 1, 1);

// 3. Convert Float32 → PCM16
for (let i = 0; i < inputData.length; i++) {
  const s = Math.max(-1, Math.min(1, inputData[i]));
  pcm16Buffer[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
}

// 4. Encode to base64
const base64 = arrayBufferToBase64(pcm16Buffer.buffer);

// 5. Send to OpenAI via WebSocket
this.sendMessage({
  type: 'input_audio_buffer.append',
  audio: base64,
});
```

#### Output Pipeline (Server → Speaker)

```typescript
// 1. Receive base64 audio from WebSocket
case 'response.audio.delta':
  this.enqueueAudio(message.delta);
  break;

// 2. Decode base64 → PCM16
const binaryString = atob(base64Audio);
const pcm16 = new Int16Array(/* decoded bytes */);

// 3. Convert PCM16 → Float32
for (let i = 0; i < sampleCount; i++) {
  float32Cache[i] = pcm16[i] / (pcm16[i] < 0 ? 0x8000 : 0x7fff);
}

// 4. Enqueue to ring buffer
this.playbackQueue.enqueue(float32Cache);

// 5. Continuous playback via ScriptProcessorNode
// Ring buffer provides smooth, continuous audio
```

### Ring Buffer Implementation

The audio playback uses a ring buffer for smooth streaming:

```typescript
class AudioRingBuffer {
  private buffer: Float32Array;
  private writePos: number = 0;
  private readPos: number = 0;

  // Push samples into buffer
  push(samples: Float32Array): number {
    const available = this.availableWrite();
    const toWrite = Math.min(samples.length, available);

    for (let i = 0; i < toWrite; i++) {
      this.buffer[(this.writePos + i) % this.size] = samples[i];
    }

    this.writePos = (this.writePos + toWrite) % this.size;
    return toWrite;
  }

  // Pull samples for playback
  pull(output: Float32Array): number {
    const available = this.availableRead();
    const toRead = Math.min(output.length, available);

    for (let i = 0; i < toRead; i++) {
      output[i] = this.buffer[(this.readPos + i) % this.size];
    }

    this.readPos = (this.readPos + toRead) % this.size;
    return toRead;
  }
}
```

**Benefits:**
- Handles network jitter and variable latency
- Pre-buffering prevents choppy playback start
- 10-second buffer handles long responses
- Smooth continuous playback without gaps

### Callback Patterns

The OpenAI Realtime Client uses a callback-based architecture for event handling. All callbacks are provided during `connect()`:

#### onMessage Callback

Called when the AI is speaking (text deltas during response).

```typescript
onMessage: (text: string) => void

// Example: Update UI with streaming text
const onMessage = (text: string) => {
  // Append delta to current response
  setCurrentResponse(prev => prev + text);

  // Or update a message bubble
  updateMessageBubble(text);
};
```

**Event Source:** `response.text.delta` WebSocket message
**Frequency:** Multiple times per AI response (streaming)
**Use Case:** Display AI's text response in real-time

#### onStatus Callback

Called when connection status changes.

```typescript
onStatus: (status: boolean) => void

// Example: Update connection indicator
const onStatus = (connected: boolean) => {
  setIsConnected(connected);

  if (connected) {
    console.log('✓ Voice session active');
    showNotification('Voice agent connected');
  } else {
    console.log('✗ Voice session ended');
    showNotification('Voice agent disconnected');
  }
};
```

**Event Sources:**
- `true`: WebSocket `onopen` event
- `false`: WebSocket `onerror` or `onclose` event

**Frequency:** 2 times per session (connect + disconnect)
**Use Case:** UI connection status indicators, error notifications

#### onToolCall Callback (Optional)

Called when the AI wants to execute a tool/function.

```typescript
onToolCall?: (toolCall: ToolCall) => void | Promise<void>

// Example: Execute tool and handle result
const onToolCall = async (toolCall: ToolCall) => {
  console.log(`[Tool Call] ${toolCall.name}`, toolCall.args);

  // Execute the tool
  const result = await actionExecutor.executeToolCall(toolCall);

  if (result.success) {
    // Handle success
    if (result.preview) {
      // Show preview for user approval
      setPendingAction({ toolCall, result });
    } else {
      // Auto-applied (no preview)
      showNotification(`${toolCall.name} completed`);
    }
  } else {
    // Handle error
    showError(`${toolCall.name} failed: ${result.error}`);
  }
};
```

**Event Source:** `response.function_call_arguments.done` WebSocket message
**Frequency:** 0-N times per user request (depends on AI's response)
**Use Case:** Execute voice commands, trigger app functionality

**Tool Call Structure:**
```typescript
interface ToolCall {
  name: string;                    // Function name (e.g., 'generate_background')
  args: Record<string, unknown>;   // Function arguments as object
}

// Example tool call:
{
  name: 'generate_background',
  args: {
    prompt: 'Mountain landscape at sunset',
    quality: '2K'
  }
}
```

#### onTranscript Callback (Optional)

Called when user speech or AI response is transcribed.

```typescript
onTranscript?: (entry: TranscriptEntry) => void

// Example: Build conversation history
const onTranscript = (entry: TranscriptEntry) => {
  console.log(`[${entry.role.toUpperCase()}]: ${entry.text}`);

  // Add to conversation history
  setTranscript(prev => [...prev, entry]);

  // Scroll to bottom of chat
  scrollToLatestMessage();

  // Analytics tracking
  trackConversationEvent(entry.role, entry.text.length);
};
```

**Event Sources:**
- User speech: `conversation.item.input_audio_transcription.completed`
- AI response: `response.output_item.added`

**Frequency:** 1+ times per conversation turn (user speaks, AI responds)
**Use Case:** Conversation history display, analytics, debugging

**Transcript Entry Structure:**
```typescript
interface TranscriptEntry {
  role: 'user' | 'assistant';  // Who is speaking
  text: string;                 // Transcribed text
  timestamp: number;            // Unix timestamp (ms)
  toolCalls?: ToolCall[];       // Optional: tool calls in this turn
}

// Example user entry:
{
  role: 'user',
  text: 'Generate a professional LinkedIn banner with mountains',
  timestamp: 1704672000000
}

// Example assistant entry with tool call:
{
  role: 'assistant',
  text: 'I'll create that banner for you.',
  timestamp: 1704672001500,
  toolCalls: [
    {
      name: 'generate_background',
      args: { prompt: '...', quality: '2K' }
    }
  ]
}
```

### Transcript Management

The OpenAI Realtime Client maintains an internal transcript of the conversation.

#### Getting the Transcript

```typescript
// Get full conversation history
const transcript: TranscriptEntry[] = client.getTranscript();

// Returns a copy of the internal array (safe to modify)
transcript.forEach(entry => {
  console.log(`[${entry.role}] ${entry.text}`);
});

// Display in UI
setConversationHistory(transcript);
```

**Returns:** Array copy (modifications don't affect internal state)
**Use Case:** Display conversation history, export chat logs, debugging

#### Clearing the Transcript

```typescript
// Clear conversation history
client.clearTranscript();

// Internal transcript array is reset
console.log('[OpenAI Realtime] Transcript cleared');

// UI should also clear
setConversationHistory([]);
```

**Effect:** Clears only the internal transcript array
**Note:** Does not affect the OpenAI session or audio processing
**Use Case:** Start fresh conversation, clear sensitive data, reset state

#### Transcript Entry Structure

```typescript
interface TranscriptEntry {
  role: 'user' | 'assistant';  // Speaker role
  text: string;                 // Transcribed speech
  timestamp: number;            // Unix timestamp in milliseconds
  toolCalls?: ToolCall[];       // Optional: associated tool calls
}
```

**Properties:**
- **role:** Either `'user'` (human speech) or `'assistant'` (AI response)
- **text:** The transcribed text content
- **timestamp:** `Date.now()` when the entry was created
- **toolCalls:** Optional array of tool calls made during this turn

#### Automatic Transcript Updates

The transcript is automatically updated on these WebSocket events:

```typescript
// User speech transcribed
case 'conversation.item.input_audio_transcription.completed':
  const userEntry: TranscriptEntry = {
    role: 'user',
    text: message.transcript,
    timestamp: Date.now(),
  };
  this.transcript.push(userEntry);
  if (onTranscript) onTranscript(userEntry);
  break;

// AI response added
case 'response.output_item.added':
  const assistantEntry: TranscriptEntry = {
    role: 'assistant',
    text: extractedText,
    timestamp: Date.now(),
  };
  this.transcript.push(assistantEntry);
  if (onTranscript) onTranscript(assistantEntry);
  break;
```

**Transcription Provider:** Whisper-1 model (via `input_audio_transcription` session config)
**Accuracy:** High accuracy for English, good for other languages
**Latency:** Near real-time (transcription completes shortly after user stops speaking)

### Message Handling

The `handleMessage()` method processes 8 types of WebSocket messages from the OpenAI Realtime API:

#### Message Types

| Type | Description | Action |
|------|-------------|--------|
| `response.audio.delta` | AI voice audio chunk | Enqueue to playback buffer |
| `response.text.delta` | AI text response chunk | Call `onMessage` callback |
| `response.done` | Response complete | Log metrics, cleanup |
| `conversation.item.input_audio_transcription.completed` | User speech transcribed | Add to transcript as user entry |
| `response.output_item.added` | AI response text | Add to transcript as assistant entry |
| `response.function_call_arguments.done` | AI wants to call a function | Call `onToolCall` callback |
| `error` | API error occurred | Log error, notify user |
| `session.created` | Session initialized | Connection confirmed |

#### Message Flow Diagram

```
User Speaks
    ↓
[Microphone captures audio]
    ↓
[Audio sent via input_audio_buffer.append]
    ↓
[Server VAD detects end of speech]
    ↓
[conversation.item.input_audio_transcription.completed] ← User transcript added
    ↓
[AI processes request]
    ↓
┌─────────────────────────────────────┐
│ AI Response (multiple message types)│
├─────────────────────────────────────┤
│ • response.audio.delta (×N)         │ ← Audio playback
│ • response.text.delta (×N)          │ ← Text display
│ • response.function_call_args.done  │ ← Tool execution
│ • response.output_item.added        │ ← Transcript update
│ • response.done                      │ ← Completion
└─────────────────────────────────────┘
```

### Advanced Usage Patterns

#### Pattern 1: Conversation Export

```typescript
// Export conversation to JSON
function exportConversation() {
  const transcript = client.getTranscript();
  const json = JSON.stringify({
    version: '1.0',
    model: 'gpt-4o-realtime-preview',
    timestamp: Date.now(),
    conversation: transcript,
  }, null, 2);

  downloadFile(json, 'voice-conversation.json');
}
```

#### Pattern 2: Selective Tool Execution

```typescript
// Execute only approved tool categories
const onToolCall = async (toolCall: ToolCall) => {
  const category = getToolCategory(toolCall.name);

  // Auto-approve safe tools
  if (['navigation', 'history', 'ai_analysis'].includes(category)) {
    await actionExecutor.executeToolCall(toolCall);
    return;
  }

  // Require approval for image/canvas tools
  const result = await actionExecutor.executeToolCall(toolCall);
  setPendingAction({ toolCall, result }); // User must approve
};
```

#### Pattern 3: Transcript Search

```typescript
// Search transcript for keywords
function searchTranscript(query: string): TranscriptEntry[] {
  const transcript = client.getTranscript();
  return transcript.filter(entry =>
    entry.text.toLowerCase().includes(query.toLowerCase())
  );
}

// Usage
const mentionsOfGenerate = searchTranscript('generate');
console.log(`Found ${mentionsOfGenerate.length} mentions of "generate"`);
```

#### Pattern 4: Analytics Tracking

```typescript
// Track conversation metrics
const onTranscript = (entry: TranscriptEntry) => {
  // Track user queries
  if (entry.role === 'user') {
    trackEvent('voice_query', {
      length: entry.text.length,
      wordCount: entry.text.split(' ').length,
      timestamp: entry.timestamp,
    });
  }

  // Track tool usage
  if (entry.toolCalls?.length) {
    entry.toolCalls.forEach(tool => {
      trackEvent('voice_tool_call', {
        toolName: tool.name,
        timestamp: entry.timestamp,
      });
    });
  }
};
```

## Tool Call Structure

### ToolCall Interface

```typescript
interface ToolCall {
  name: string;                      // Tool function name
  args: Record<string, unknown>;     // Arguments object
}
```

### ActionResult Interface

```typescript
interface ActionResult {
  success: boolean;     // Execution status
  result?: string;      // Result data or message
  error?: string;       // Error message if failed
  preview?: string;     // Image URL for preview
  imageUrl?: string;    // Image URL for result
  action?: string;      // Action type identifier
}
```

### Example Tool Call Flow

```typescript
// 1. User says: "Generate a sunset over mountains"

// 2. OpenAI Realtime API calls tool
const toolCall: ToolCall = {
  name: 'generate_background',
  args: {
    prompt: 'Sunset over mountains, golden hour lighting, professional landscape photography',
    quality: '2K',
  },
};

// 3. ActionExecutor processes the call
const result = await executor.executeToolCall(toolCall);

// 4. Result returned
const result: ActionResult = {
  success: true,
  result: 'data:image/png;base64,...',
  preview: 'data:image/png;base64,...',
  action: 'generate_background',
};

// 5. User approves in UI
executor.applyPreview(result.result, 'background');
```

## Integration Patterns

### Pattern 1: Basic Integration

```typescript
import { VoiceAgentProvider } from '@/context/VoiceAgentContext';

function App() {
  const handleUpdate = (imageUrl: string, type: 'background' | 'profile') => {
    updateCanvas(imageUrl, type);
  };

  return (
    <VoiceAgentProvider onUpdate={handleUpdate}>
      <YourApp />
    </VoiceAgentProvider>
  );
}
```

### Pattern 2: Full Integration with Canvas

```typescript
function AppWithCanvas() {
  const [canvasImage, setCanvasImage] = useState<string>();
  const [genPrompt, setGenPrompt] = useState('');
  const [elements, setElements] = useState<BannerElement[]>([]);

  const canvasCallbacks: CanvasCallbacks = {
    addElement: (element) => {
      setElements(prev => [...prev, element]);
    },
    updateElement: (id, updates) => {
      setElements(prev =>
        prev.map(el => el.id === id ? { ...el, ...updates } : el)
      );
    },
    deleteElement: (id) => {
      setElements(prev => prev.filter(el => el.id !== id));
    },
    getElements: () => elements,
    undo: () => undoHistory(),
    redo: () => redoHistory(),
    setActiveTab: (tab) => setCurrentTab(tab),
  };

  return (
    <VoiceAgentProvider
      onUpdate={(url, type) => {
        if (type === 'background') setCanvasImage(url);
      }}
      setGenPrompt={setGenPrompt}
      canvasCallbacks={canvasCallbacks}
    >
      <Canvas
        backgroundImage={canvasImage}
        elements={elements}
        prompt={genPrompt}
      />
    </VoiceAgentProvider>
  );
}
```

### Pattern 3: Custom Tool Execution

```typescript
import { ActionExecutor, ToolCall } from '@/services/actionExecutor';

// Create executor with custom logic
const executor = new ActionExecutor(
  (imageUrl, type) => {
    // Custom update logic
    console.log('Updating:', type, imageUrl);
    customCanvasUpdate(imageUrl, type);
  },
  false  // Auto-apply mode
);

// Execute tools programmatically
const executeCommand = async (command: string, args: Record<string, unknown>) => {
  const toolCall: ToolCall = { name: command, args };
  const result = await executor.executeToolCall(toolCall);

  if (!result.success) {
    throw new Error(result.error);
  }

  return result;
};

// Usage
await executeCommand('generate_background', {
  prompt: 'Professional LinkedIn banner',
  quality: '4K',
});
```

### Pattern 4: Programmatic Voice Session

```typescript
import { OpenAIRealtimeClient } from '@/services/openaiRealtimeClient';
import { ActionExecutor } from '@/services/actionExecutor';

async function startVoiceSession(apiKey: string) {
  const client = new OpenAIRealtimeClient(apiKey);
  const executor = new ActionExecutor(updateCanvas, true);

  const transcriptLog: string[] = [];

  await client.connect(
    // AI speaking
    (text) => {
      console.log('[AI]:', text);
    },

    // Connection status
    (connected) => {
      console.log(connected ? 'Connected' : 'Disconnected');
    },

    // Tool calls
    async (toolCall) => {
      console.log('[Tool]:', toolCall.name);
      const result = await executor.executeToolCall(toolCall);

      if (result.success && result.preview) {
        // Auto-approve for this example
        executor.applyPreview(result.preview);
      }
    },

    // Transcript
    (entry) => {
      const line = `[${entry.role.toUpperCase()}]: ${entry.text}`;
      transcriptLog.push(line);
      console.log(line);
    }
  );

  return { client, executor, transcriptLog };
}
```

## Extending Commands

### Adding a New Tool

#### Step 1: Define the Tool in OpenAI Session

Edit `src/services/openaiRealtimeClient.ts` in the `session.update` message:

```typescript
tools: [
  // ... existing tools ...
  {
    type: 'function',
    name: 'export_banner',
    description: 'Export the current banner design to a file format',
    parameters: {
      type: 'object',
      properties: {
        format: {
          type: 'string',
          enum: ['png', 'jpg', 'pdf'],
          description: 'Export file format'
        },
        quality: {
          type: 'number',
          description: 'Export quality (1-100)'
        },
      },
      required: ['format'],
    },
  },
]
```

#### Step 2: Implement the Tool Handler

Add to `src/services/actionExecutor.ts`:

```typescript
export class ActionExecutor {
  // ... existing code ...

  async executeToolCall(toolCall: ToolCall): Promise<ActionResult> {
    switch (toolCall.name) {
      // ... existing cases ...

      case 'export_banner':
        return await this.exportBanner(
          toolCall.args as { format: string; quality?: number }
        );

      default:
        return {
          success: false,
          error: `Unknown tool: ${toolCall.name}`,
        };
    }
  }

  /**
   * Export banner to file
   */
  private async exportBanner(args: {
    format: string;
    quality?: number;
  }): Promise<ActionResult> {
    const { format, quality = 90 } = args;

    console.log('[ActionExecutor] Exporting banner:', { format, quality });

    try {
      // Get canvas image
      const canvasImage = this.getCanvasImage();
      if (!canvasImage) {
        return {
          success: false,
          error: 'No banner available to export',
        };
      }

      // Convert to desired format
      const exportedData = await convertImage(canvasImage, format, quality);

      // Trigger download
      downloadFile(exportedData, `banner.${format}`);

      return {
        success: true,
        result: `Exported banner as ${format.toUpperCase()}`,
        action: 'export_banner',
      };
    } catch (error) {
      console.error('[ActionExecutor] Export failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Export failed',
      };
    }
  }
}
```

#### Step 3: Update TypeScript Types

If adding new interfaces:

```typescript
// In actionExecutor.ts or types file

export interface ExportOptions {
  format: 'png' | 'jpg' | 'pdf';
  quality?: number;
  includeElements?: boolean;
}
```

#### Step 4: Add UI Support (Optional)

If the tool requires manual approval, handle it in `LiveActionPanel.tsx`:

```typescript
// LiveActionPanel already handles all tools generically
// Just ensure your tool returns appropriate preview/result data

// If special UI is needed:
{pendingAction?.toolCall.name === 'export_banner' && (
  <div className="export-preview">
    <p>Export format: {pendingAction.toolCall.args.format}</p>
    <p>Quality: {pendingAction.toolCall.args.quality || 90}%</p>
  </div>
)}
```

### Example: Adding a "Duplicate Element" Command

```typescript
// 1. Add to OpenAI session tools
{
  type: 'function',
  name: 'duplicate_element',
  description: 'Duplicate an existing canvas element',
  parameters: {
    type: 'object',
    properties: {
      element_id: { type: 'string', description: 'ID of element to duplicate' },
      offset_x: { type: 'number', description: 'X offset for duplicate (default: 20)' },
      offset_y: { type: 'number', description: 'Y offset for duplicate (default: 20)' },
    },
    required: ['element_id'],
  },
}

// 2. Add to ActionExecutor switch
case 'duplicate_element':
  return this.duplicateElement(
    toolCall.args as { element_id: string; offset_x?: number; offset_y?: number }
  );

// 3. Implement the method
private duplicateElement(args: {
  element_id: string;
  offset_x?: number;
  offset_y?: number;
}): ActionResult {
  const { element_id, offset_x = 20, offset_y = 20 } = args;

  if (!this.canvasCallbacks.getElements || !this.canvasCallbacks.addElement) {
    return { success: false, error: 'Canvas not connected' };
  }

  // Find element
  const elements = this.canvasCallbacks.getElements();
  const element = elements.find(el => el.id === element_id);

  if (!element) {
    return { success: false, error: `Element ${element_id} not found` };
  }

  // Create duplicate
  const duplicate: BannerElement = {
    ...element,
    id: `${element.type}-${Date.now()}`,
    x: element.x + offset_x,
    y: element.y + offset_y,
  };

  this.canvasCallbacks.addElement(duplicate);

  return {
    success: true,
    result: `Duplicated element ${element_id}`,
    action: 'duplicate_element',
  };
}
```

## Error Handling

### Error Categories

The voice agent system handles 3 categories of errors:

#### 1. Connection Errors

```typescript
// Microphone access denied
try {
  await connect();
} catch (error) {
  if (error.message.includes('Microphone error')) {
    showError('Microphone access required. Please allow in browser settings.');
  }
}

// API key missing
if (error.message.includes('API key')) {
  showError('OpenAI API key not configured. Please add in Settings.');
}

// WebSocket connection failed
if (error.message.includes('connection closed')) {
  showError('Connection to OpenAI failed. Please check your internet.');
}
```

#### 2. Tool Execution Errors

```typescript
const result = await executor.executeToolCall(toolCall);

if (!result.success) {
  // Tool execution failed
  switch (toolCall.name) {
    case 'generate_background':
      if (result.error?.includes('quota')) {
        showError('AI generation quota exceeded. Please check your billing.');
      } else {
        showError(`Generation failed: ${result.error}`);
      }
      break;

    case 'remove_background':
      if (result.error?.includes('No image')) {
        showError('Please generate or upload an image first.');
      } else {
        showError(`Background removal failed: ${result.error}`);
      }
      break;

    default:
      showError(`Command failed: ${result.error}`);
  }
}
```

#### 3. Application State Errors

```typescript
// Canvas not ready
if (!canvasCallbacks.addElement) {
  return {
    success: false,
    error: 'Canvas not initialized. Please wait for app to load.',
  };
}

// Invalid element ID
if (!elements.find(el => el.id === element_id)) {
  return {
    success: false,
    error: `Element ${element_id} not found on canvas.`,
  };
}

// Invalid tab name
if (!['studio', 'gallery', 'brainstorm'].includes(tab)) {
  return {
    success: false,
    error: `Unknown tab: ${tab}. Valid tabs: studio, gallery, brainstorm.`,
  };
}
```

### Error Handling Best Practices

```typescript
// 1. Always use try-catch for async operations
try {
  const result = await executor.executeToolCall(toolCall);
  if (result.success) {
    handleSuccess(result);
  } else {
    handleError(result.error);
  }
} catch (error) {
  // Unexpected error
  console.error('[Voice Agent] Unexpected error:', error);
  showError('An unexpected error occurred. Please try again.');
}

// 2. Provide actionable error messages
// ❌ Bad
return { success: false, error: 'Failed' };

// ✅ Good
return {
  success: false,
  error: 'Image generation failed: API quota exceeded. Please add billing at openai.com/billing.'
};

// 3. Clean up on errors
const connect = async () => {
  try {
    await client.connect(/* ... */);
  } catch (error) {
    // Clean up partial state
    if (liveClientRef.current) {
      await liveClientRef.current.disconnect();
      liveClientRef.current = null;
    }
    actionExecutorRef.current = null;
    connectingRef.current = false;

    throw error;  // Re-throw for caller
  }
};

// 4. Handle race conditions
if (connectingRef.current) {
  console.warn('[Voice Agent] Connection already in progress');
  return;  // Prevent double connection
}

// 5. Log errors for debugging
console.error('[ActionExecutor] Tool execution failed:', {
  tool: toolCall.name,
  args: toolCall.args,
  error: error instanceof Error ? error.message : error,
  stack: error instanceof Error ? error.stack : undefined,
});
```

## Audio Pipeline

### Input Audio Processing

```typescript
// Microphone → ScriptProcessorNode → PCM16 → Base64 → WebSocket

// 1. Get microphone stream
const stream = await navigator.mediaDevices.getUserMedia({
  audio: {
    echoCancellation: true,     // Remove echo
    noiseSuppression: true,     // Reduce background noise
    sampleRate: 24000,          // 24kHz to match OpenAI
  },
});

// 2. Create audio processing chain
const audioContext = new AudioContext({ sampleRate: 24000 });
const source = audioContext.createMediaStreamSource(stream);
const processor = audioContext.createScriptProcessor(4096, 1, 1);

// 3. Process audio frames
processor.onaudioprocess = (e) => {
  const inputData = e.inputBuffer.getChannelData(0);  // Float32Array

  // Convert to PCM16 (Int16)
  const pcm16 = new Int16Array(inputData.length);
  for (let i = 0; i < inputData.length; i++) {
    const s = Math.max(-1, Math.min(1, inputData[i]));
    pcm16[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
  }

  // Encode to base64
  const base64 = btoa(String.fromCharCode(...new Uint8Array(pcm16.buffer)));

  // Send to OpenAI
  ws.send(JSON.stringify({
    type: 'input_audio_buffer.append',
    audio: base64,
  }));
};

// 4. Connect nodes (must connect to destination for onaudioprocess to fire)
const silentGain = audioContext.createGain();
silentGain.gain.value = 0;  // Mute mic loopback

source.connect(processor);
processor.connect(silentGain);
silentGain.connect(audioContext.destination);
```

### Output Audio Playback

```typescript
// WebSocket → Base64 → PCM16 → Float32 → Ring Buffer → Speaker

// 1. Receive audio delta from WebSocket
ws.onmessage = (event) => {
  const message = JSON.parse(event.data);
  if (message.type === 'response.audio.delta') {
    enqueueAudio(message.delta);
  }
};

// 2. Decode and convert
function enqueueAudio(base64Audio: string) {
  // Decode base64 → bytes
  const binaryString = atob(base64Audio);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  // Bytes → PCM16
  const pcm16 = new Int16Array(bytes.buffer);

  // PCM16 → Float32
  const float32 = new Float32Array(pcm16.length);
  for (let i = 0; i < pcm16.length; i++) {
    float32[i] = pcm16[i] / (pcm16[i] < 0 ? 0x8000 : 0x7fff);
  }

  // Enqueue to ring buffer
  playbackQueue.enqueue(float32);
}

// 3. Continuous playback
const playbackProcessor = audioContext.createScriptProcessor(2048, 1, 1);
playbackProcessor.onaudioprocess = (e) => {
  const output = e.outputBuffer.getChannelData(0);

  // Pull samples from ring buffer
  const samplesRead = ringBuffer.pull(output);

  // Fill remainder with silence if buffer empty
  for (let i = samplesRead; i < output.length; i++) {
    output[i] = 0;
  }
};

playbackProcessor.connect(audioContext.destination);
```

### Performance Characteristics

| Metric | Value | Notes |
|--------|-------|-------|
| Sample Rate | 24,000 Hz | Fixed by OpenAI API |
| Input Buffer | 4,096 samples | ~170ms per frame |
| Output Buffer | 2,048 samples | ~85ms per frame |
| Ring Buffer | 240,000 samples | 10 seconds at 24kHz |
| Pre-buffer | 2,400 samples | 100ms before playback starts |
| Latency | 200-500ms | Round-trip (mic → server → speaker) |
| Memory | ~2.3 MB | Audio buffers + WebSocket |
| Bandwidth | ~48 KB/s | Per direction (upload + download) |

## Performance Optimization

### Memory Management

```typescript
// ❌ Bad: Creates new buffers every frame (GC pressure)
processor.onaudioprocess = (e) => {
  const pcm16 = new Int16Array(inputData.length);  // New allocation
  // ... process ...
};

// ✅ Good: Reuse pre-allocated buffers
class OpenAIRealtimeClient {
  private inputPcm16Buffer: Int16Array | null = null;
  private decodeBuffer: Uint8Array | null = null;
  private float32Cache: Float32Array | null = null;

  setupAudioProcessing() {
    // Pre-allocate once
    this.inputPcm16Buffer = new Int16Array(4096);

    this.scriptProcessor.onaudioprocess = (e) => {
      // Reuse existing buffer
      for (let i = 0; i < inputData.length; i++) {
        this.inputPcm16Buffer![i] = /* conversion */;
      }
    };
  }

  disconnect() {
    // Clear cached buffers to free memory
    this.decodeBuffer = null;
    this.float32Cache = null;
    this.inputPcm16Buffer = null;
  }
}
```

### String Concatenation Optimization

```typescript
// ❌ Bad: String concatenation in loop
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);  // Slow!
  }
  return btoa(binary);
}

// ✅ Good: Chunked approach
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  const chunks: string[] = [];
  const chunkSize = 8192;

  for (let i = 0; i < bytes.length; i += chunkSize) {
    const chunk = bytes.subarray(i, Math.min(i + chunkSize, bytes.length));
    chunks.push(String.fromCharCode.apply(null, Array.from(chunk)));
  }

  return btoa(chunks.join(''));
}
```

### Cleanup Best Practices

```typescript
// Always clean up audio resources
async disconnect() {
  console.log('[OpenAI Realtime] Disconnecting...');

  // 1. Close WebSocket
  if (this.ws) {
    this.ws.close();
    this.ws = null;
  }

  // 2. Stop audio playback
  if (this.playbackQueue) {
    this.playbackQueue.stop();
    this.playbackQueue = null;
  }

  // 3. Stop microphone
  if (this.audioStream) {
    this.audioStream.getTracks().forEach(t => t.stop());
    this.audioStream = null;
  }

  // 4. Disconnect audio nodes (prevents memory leaks)
  if (this.scriptProcessor) {
    this.scriptProcessor.onaudioprocess = null;  // Clear callback
    this.scriptProcessor.disconnect();
    this.scriptProcessor = null;
  }

  if (this.sourceNode) {
    this.sourceNode.disconnect();
    this.sourceNode = null;
  }

  if (this.silentGainNode) {
    this.silentGainNode.disconnect();
    this.silentGainNode = null;
  }

  // 5. Close audio context
  if (this.audioContext) {
    await this.audioContext.close();
    this.audioContext = null;
  }

  // 6. Clear cached buffers
  this.decodeBuffer = null;
  this.float32Cache = null;
  this.inputPcm16Buffer = null;

  console.log('[OpenAI Realtime] ✓ Disconnected');
}
```

## Testing & Debugging

### Debug Logging

The voice agent includes comprehensive logging:

```typescript
// Enable detailed logs
// All components use tagged console logs:

[VoiceAgentContext] Starting connection...
[VoiceAgentContext] Connected successfully
[VoiceAgentContext] Tool call received: generate_background

[ActionExecutor] Executing tool: generate_background
[ActionExecutor] Preview mode: ON
[ActionExecutor] Canvas callbacks configured

[OpenAI Realtime] Initializing...
[OpenAI Realtime] ✓ Microphone access granted
[OpenAI Realtime] ✓ WebSocket connected
[OpenAI Realtime] ✓ Audio processing started

[AudioPlayback] Continuous playback initialized
[AudioPlayback] Pre-buffer complete, starting playback
[AudioPlayback] Buffer underrun #1 (1200 samples left)
```

### Testing Tool Execution

```typescript
import { ActionExecutor, ToolCall } from '@/services/actionExecutor';

describe('ActionExecutor', () => {
  let executor: ActionExecutor;
  let mockUpdate: jest.Mock;

  beforeEach(() => {
    mockUpdate = jest.fn();
    executor = new ActionExecutor(mockUpdate, false);
  });

  it('should execute generate_background', async () => {
    const toolCall: ToolCall = {
      name: 'generate_background',
      args: { prompt: 'Test prompt', quality: '2K' },
    };

    const result = await executor.executeToolCall(toolCall);

    expect(result.success).toBe(true);
    expect(result.result).toBeDefined();
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.any(String),
      'background'
    );
  });

  it('should handle missing canvas image', async () => {
    const toolCall: ToolCall = {
      name: 'remove_background',
      args: {},
    };

    const result = await executor.executeToolCall(toolCall);

    expect(result.success).toBe(false);
    expect(result.error).toContain('No image available');
  });

  it('should work in preview mode', async () => {
    executor.setPreviewMode(true);

    const toolCall: ToolCall = {
      name: 'generate_background',
      args: { prompt: 'Test' },
    };

    const result = await executor.executeToolCall(toolCall);

    expect(result.success).toBe(true);
    expect(result.preview).toBeDefined();
    expect(mockUpdate).not.toHaveBeenCalled();  // No auto-apply
  });
});
```

### Manual Testing Checklist

- [ ] Microphone permission granted in browser
- [ ] OpenAI API key configured (Settings or .env)
- [ ] Connection establishes successfully
- [ ] User speech is transcribed correctly
- [ ] AI responses are audible
- [ ] Tool calls trigger preview mode
- [ ] Preview images display correctly
- [ ] Approve/reject buttons work
- [ ] Actions apply to canvas on approval
- [ ] Disconnect cleans up resources
- [ ] No console errors during session
- [ ] Audio is smooth without choppy playback
- [ ] Multiple connect/disconnect cycles work

### Browser DevTools Debugging

```javascript
// In browser console during active session:

// Check connection state
window.__VOICE_DEBUG = {
  ws: liveClientRef.current?.ws,
  isConnected: isConnected,
  audioContext: audioContext,
  ringBuffer: playbackQueue?.ringBuffer,
};

// Monitor audio metrics
playbackQueue.getMetrics();
// { bufferedSamples: 12000, underruns: 2, totalReceived: 48000 }

// Check transcript
client.getTranscript();
// [{ role: 'user', text: '...', timestamp: ... }]

// Inspect pending action
console.log(pendingAction);
```

## Security Considerations

### API Key Storage

```typescript
// ✅ Good: Store in encrypted Supabase per-user
import { getVoiceAPIKey } from '@/services/apiKeyStorage';

const keyResult = await getVoiceAPIKey();
// Fetches from /api/user/voice-key endpoint
// Key is stored encrypted in users table
// Row Level Security (RLS) ensures user can only access their own key

// ❌ Bad: Never commit to code
const API_KEY = 'sk-abc123...';  // NO!

// ❌ Bad: Don't store in localStorage (not encrypted)
localStorage.setItem('openai_key', apiKey);  // NO!
```

### Microphone Permission Handling

```typescript
// Always request permission with proper error handling
try {
  const stream = await navigator.mediaDevices.getUserMedia({
    audio: {
      echoCancellation: true,
      noiseSuppression: true,
      sampleRate: 24000,
    },
  });

  console.log('✓ Microphone access granted');
  return stream;
} catch (error) {
  if (error.name === 'NotAllowedError') {
    throw new Error('Microphone access denied by user');
  } else if (error.name === 'NotFoundError') {
    throw new Error('No microphone found');
  } else {
    throw new Error(`Microphone error: ${error.message}`);
  }
}
```

### Audio Data Privacy

- **Audio is not stored:** Audio streams are sent directly to OpenAI and not saved locally
- **Encrypted transmission:** WebSocket uses WSS (secure WebSocket)
- **Transcript storage:** Transcripts are kept in memory only, not persisted
- **Session isolation:** Each user session is isolated with their own API key

### XSS Prevention

```typescript
// ✅ Good: Sanitize user input before displaying
function displayTranscript(entry: TranscriptEntry) {
  return (
    <div>
      <p>{sanitizeHTML(entry.text)}</p>
    </div>
  );
}

// ✅ Good: Never use dangerouslySetInnerHTML with user content
// ❌ Bad:
<div dangerouslySetInnerHTML={{ __html: entry.text }} />  // NO!
```

### Rate Limiting

```typescript
// Implement client-side rate limiting to prevent abuse
class RateLimiter {
  private requests: number[] = [];
  private readonly maxRequests = 60;  // Max 60 tool calls
  private readonly windowMs = 60000;  // Per minute

  canMakeRequest(): boolean {
    const now = Date.now();
    // Remove old requests outside window
    this.requests = this.requests.filter(t => now - t < this.windowMs);

    if (this.requests.length >= this.maxRequests) {
      return false;
    }

    this.requests.push(now);
    return true;
  }
}
```

## API Reference

### VoiceAgentContext

#### Methods

##### connect()
```typescript
connect: () => Promise<void>
```
Establishes WebSocket connection to OpenAI Realtime API, requests microphone access, and starts audio processing.

**Throws:** Error if microphone denied, API key missing, or connection fails

##### disconnect()
```typescript
disconnect: () => Promise<void>
```
Closes WebSocket, stops audio processing, releases microphone, and resets state.

##### approveAction()
```typescript
approveAction: () => Promise<void>
```
Applies the pending action preview to the canvas.

##### rejectAction()
```typescript
rejectAction: () => void
```
Discards the pending action preview without applying.

##### clearTranscript()
```typescript
clearTranscript: () => void
```
Clears the conversation transcript history.

##### registerPromptSetter()
```typescript
registerPromptSetter: (setter: (prompt: string) => void) => void
```
Registers a callback to update the generation prompt field from voice commands.

### ActionExecutor

#### Constructor
```typescript
new ActionExecutor(
  onUpdate: OnUpdateCallback,
  previewMode?: boolean,
  getCanvasImage?: () => string | undefined,
  setGenPrompt?: SetGenPromptCallback,
  canvasCallbacks?: CanvasCallbacks
)
```

#### Methods

##### executeToolCall()
```typescript
executeToolCall(toolCall: ToolCall): Promise<ActionResult>
```
Executes a tool call and returns the result.

**Parameters:**
- `toolCall`: Object with `name` and `args`

**Returns:** ActionResult with `success`, `result`, `error`, `preview`, etc.

##### setPreviewMode()
```typescript
setPreviewMode(enabled: boolean): void
```
Enables or disables preview mode.

##### applyPreview()
```typescript
applyPreview(imageUrl: string, type?: 'background' | 'profile'): void
```
Applies a previewed image to the canvas.

##### setCanvasCallbacks()
```typescript
setCanvasCallbacks(callbacks: CanvasCallbacks): void
```
Sets the canvas manipulation callbacks for element operations.

##### setPromptSetter()
```typescript
setPromptSetter(setter: SetGenPromptCallback): void
```
Sets the callback to update generation prompt field.

##### setCanvasImageGetter()
```typescript
setCanvasImageGetter(getter: () => string | undefined): void
```
Sets the function to retrieve current canvas image URL.

### OpenAIRealtimeClient

#### Constructor
```typescript
new OpenAIRealtimeClient(apiKey: string)
```

#### Methods

##### connect()
```typescript
connect(
  onMessage: (text: string) => void,
  onStatus: (status: boolean) => void,
  onToolCall?: (toolCall: ToolCall) => void,
  onTranscript?: (entry: TranscriptEntry) => void
): Promise<void>
```
Connects to OpenAI Realtime API with callbacks.

##### disconnect()
```typescript
disconnect(): Promise<void>
```
Disconnects and cleans up all resources.

##### getTranscript()
```typescript
getTranscript(): TranscriptEntry[]
```
Returns the conversation transcript.

##### clearTranscript()
```typescript
clearTranscript(): void
```
Clears the conversation transcript.

---

## Related Documentation

- [Voice Agent User Guide](../VOICE_AGENT_GUIDE.md) - End-user documentation
- [Voice Commands Reference](../VOICE_COMMANDS_REFERENCE.md) - Quick command lookup
- [Voice Commands Cheat Sheet](./VOICE_COMMANDS_CHEATSHEET.md) - Printable reference
- [Replicate Models Integration](../REPLICATE_MODELS.md) - Image processing details
- [Supabase Setup Guide](./SUPABASE_SETUP.md) - Database configuration

## External Resources

- [OpenAI Realtime API Documentation](https://platform.openai.com/docs/guides/realtime) - Official API docs
- [Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API) - Browser audio processing
- [WebSocket API](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket) - WebSocket reference

---

**Last Updated:** January 2026
**Voice Agent Version:** 1.0
**OpenAI Realtime API:** gpt-4o-realtime-preview
**Document Version:** 1.0
