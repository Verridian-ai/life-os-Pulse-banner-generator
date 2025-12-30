// OpenAI Realtime API Client for Voice Chat
// Uses the latest gpt-4o-realtime-preview model (GA December 2024)
// ROBUST AUDIO: Uses ring buffer + continuous playback for smooth audio

declare global {
  interface Window {
    webkitAudioContext: typeof AudioContext;
  }
}

export interface ToolCall {
  name: string;
  args: Record<string, unknown>;
}

export interface TranscriptEntry {
  role: 'user' | 'assistant';
  text: string;
  timestamp: number;
  toolCalls?: ToolCall[];
}

/**
 * Ring buffer for continuous audio streaming
 * Stores audio samples and allows pulling at steady rate
 */
class AudioRingBuffer {
  private buffer: Float32Array;
  private writePos: number = 0;
  private readPos: number = 0;
  private size: number;

  constructor(sizeInSamples: number) {
    this.size = sizeInSamples;
    this.buffer = new Float32Array(sizeInSamples);
  }

  /**
   * Push samples into the ring buffer
   * Returns number of samples actually written
   */
  push(samples: Float32Array): number {
    const available = this.availableWrite();
    const toWrite = Math.min(samples.length, available);

    for (let i = 0; i < toWrite; i++) {
      this.buffer[(this.writePos + i) % this.size] = samples[i];
    }

    this.writePos = (this.writePos + toWrite) % this.size;
    return toWrite;
  }

  /**
   * Pull samples from the ring buffer
   * Fills output array and returns number of samples read
   */
  pull(output: Float32Array): number {
    const available = this.availableRead();
    const toRead = Math.min(output.length, available);

    for (let i = 0; i < toRead; i++) {
      output[i] = this.buffer[(this.readPos + i) % this.size];
    }

    // Fill remainder with silence if not enough data
    for (let i = toRead; i < output.length; i++) {
      output[i] = 0;
    }

    this.readPos = (this.readPos + toRead) % this.size;
    return toRead;
  }

  /**
   * Available space for writing
   */
  availableWrite(): number {
    const used = (this.writePos - this.readPos + this.size) % this.size;
    return this.size - used - 1; // -1 to distinguish full from empty
  }

  /**
   * Available samples for reading
   */
  availableRead(): number {
    return (this.writePos - this.readPos + this.size) % this.size;
  }

  /**
   * Clear the buffer
   */
  clear(): void {
    this.buffer.fill(0);
    this.readPos = 0;
    this.writePos = 0;
  }
}

/**
 * Continuous audio playback queue using ScriptProcessorNode
 * Pulls samples from ring buffer at steady rate for smooth playback
 * Improved for longer responses with pre-buffering and larger buffer
 */
class AudioPlaybackQueue {
  private audioContext: AudioContext;
  private ringBuffer: AudioRingBuffer;
  private playbackProcessor: ScriptProcessorNode | null = null;
  private playbackGain: GainNode | null = null;
  private isPlaying: boolean = false;
  private isBuffering: boolean = true; // Pre-buffer before starting playback
  private underrunCount: number = 0;
  private totalSamplesReceived: number = 0;

  // Pre-buffer threshold: wait for ~100ms of audio before starting playback
  // This prevents choppy start and handles network jitter
  private readonly PRE_BUFFER_SAMPLES = 2400; // 100ms at 24kHz

  constructor(audioContext: AudioContext) {
    this.audioContext = audioContext;
    // 10 seconds buffer at 24kHz = 240,000 samples (handles longer responses)
    this.ringBuffer = new AudioRingBuffer(24000 * 10);
  }

  /**
   * Start the continuous playback processor
   */
  start(): void {
    if (this.playbackProcessor) return; // Already started

    // Use 2048 samples buffer for smoother playback (~85ms at 24kHz)
    this.playbackProcessor = this.audioContext.createScriptProcessor(2048, 1, 1);
    this.playbackGain = this.audioContext.createGain();
    this.playbackGain.gain.value = 1.0;

    this.playbackProcessor.onaudioprocess = (e) => {
      const output = e.outputBuffer.getChannelData(0);

      // If still buffering, output silence and check if we have enough
      if (this.isBuffering) {
        output.fill(0);
        if (this.ringBuffer.availableRead() >= this.PRE_BUFFER_SAMPLES) {
          this.isBuffering = false;
          console.log('[AudioPlayback] Pre-buffer complete, starting playback');
        }
        return;
      }

      const samplesRead = this.ringBuffer.pull(output);

      // Track underruns for debugging (only when we're supposed to be playing)
      if (samplesRead < output.length && this.isPlaying && this.totalSamplesReceived > this.PRE_BUFFER_SAMPLES) {
        this.underrunCount++;
        if (this.underrunCount % 20 === 1) {
          console.log(`[AudioPlayback] Buffer underrun #${this.underrunCount} (${this.ringBuffer.availableRead()} samples left)`);
        }
      }
    };

    this.playbackProcessor.connect(this.playbackGain);
    this.playbackGain.connect(this.audioContext.destination);
    console.log('[AudioPlayback] Continuous playback initialized (pre-buffering...)');
  }

  /**
   * Enqueue audio samples for playback
   */
  enqueue(samples: Float32Array): void {
    if (!this.playbackProcessor) {
      this.start();
    }

    const written = this.ringBuffer.push(samples);
    this.totalSamplesReceived += written;

    if (written < samples.length) {
      console.warn(`[AudioPlayback] Buffer overflow, dropped ${samples.length - written} samples`);
    }

    this.isPlaying = true;
  }

  /**
   * Stop playback and clear buffer
   */
  stop(): void {
    this.isPlaying = false;
    this.isBuffering = true;
    this.ringBuffer.clear();
    this.totalSamplesReceived = 0;

    if (this.playbackProcessor) {
      // Clear callback to prevent memory leaks (Fix 4)
      this.playbackProcessor.onaudioprocess = null;
      this.playbackProcessor.disconnect();
      this.playbackProcessor = null;
    }
    if (this.playbackGain) {
      this.playbackGain.disconnect();
      this.playbackGain = null;
    }

    console.log(`[AudioPlayback] Stopped. Total underruns: ${this.underrunCount}`);
    this.underrunCount = 0;
  }

  /**
   * Get metrics for debugging
   */
  getMetrics(): { bufferedSamples: number; underruns: number; totalReceived: number } {
    return {
      bufferedSamples: this.ringBuffer.availableRead(),
      underruns: this.underrunCount,
      totalReceived: this.totalSamplesReceived,
    };
  }
}

export class OpenAIRealtimeClient {
  private ws: WebSocket | null = null;
  private apiKey: string;
  private isConnected: boolean = false;
  private audioContext: AudioContext | null = null;
  private scriptProcessor: ScriptProcessorNode | null = null;
  private sourceNode: MediaStreamAudioSourceNode | null = null;
  private silentGainNode: GainNode | null = null;
  private audioStream: MediaStream | null = null;
  private transcript: TranscriptEntry[] = [];

  // Robust audio playback
  private playbackQueue: AudioPlaybackQueue | null = null;

  // Cached buffers to prevent per-frame allocations (Fix 2, Fix 3)
  private decodeBuffer: Uint8Array | null = null;
  private float32Cache: Float32Array | null = null;
  private inputPcm16Buffer: Int16Array | null = null;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  /**
   * Get the current transcript
   */
  getTranscript(): TranscriptEntry[] {
    return [...this.transcript];
  }

  /**
   * Clear the transcript
   */
  clearTranscript(): void {
    this.transcript = [];
    console.log('[OpenAI Realtime] Transcript cleared');
  }

  async connect(
    onMessage: (text: string) => void,
    onStatus: (status: boolean) => void,
    onToolCall?: (toolCall: ToolCall) => void,
    onTranscript?: (entry: TranscriptEntry) => void,
  ) {
    console.log('[OpenAI Realtime] Initializing...');

    // Request microphone access
    try {
      this.audioStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 24000,
        },
      });
      console.log('[OpenAI Realtime] ✓ Microphone access granted');
    } catch (error: unknown) {
      console.error('[OpenAI Realtime] Microphone access failed:', error);
      throw new Error(
        `Microphone error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }

    // Create audio context at 24kHz to match OpenAI
    this.audioContext = new (window.AudioContext || window.webkitAudioContext)({
      sampleRate: 24000,
    });

    // Initialize robust audio playback queue
    this.playbackQueue = new AudioPlaybackQueue(this.audioContext);

    const wsUrl = `wss://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview`;

    return new Promise<void>((resolve, reject) => {
      let didOpen = false;
      let didSettle = false;
      const safeResolve = () => {
        if (didSettle) return;
        didSettle = true;
        resolve();
      };
      const safeReject = (error: unknown) => {
        if (didSettle) return;
        didSettle = true;
        reject(error);
      };

      try {
        this.ws = new WebSocket(wsUrl, [
          'realtime',
          `openai-insecure-api-key.${this.apiKey}`,
          'openai-beta.realtime-v1',
        ]);
      } catch (error) {
        console.error('[OpenAI Realtime] Failed to create WebSocket:', error);
        safeReject(error);
        return;
      }

      this.ws.onopen = () => {
        console.log('[OpenAI Realtime] ✓ WebSocket connected');
        didOpen = true;
        this.isConnected = true;
        onStatus(true);

        // Initialize session with tools
        this.sendMessage({
          type: 'session.update',
          session: {
            modalities: ['text', 'audio'],
            instructions: `You are Nano, a helpful creative director assisting with LinkedIn banner design.

When users describe a banner idea, use the write_enhanced_prompt tool to enhance their prompt and write it to the generation field.
Keep responses concise and focused on helping create professional LinkedIn banners.

Available tools:
- write_enhanced_prompt: Enhance a prompt and write it to the generation input field
- generate_background: Generate a banner image directly
- remove_background: Remove background from an image
- upscale_image: Upscale an image to higher resolution
- restore_image: Restore old or damaged photos
- enhance_face: Enhance faces in an image`,
            voice: 'alloy',
            input_audio_format: 'pcm16',
            output_audio_format: 'pcm16',
            input_audio_transcription: {
              model: 'whisper-1',
            },
            turn_detection: {
              type: 'server_vad',
            },
            tools: [
              {
                type: 'function',
                name: 'write_enhanced_prompt',
                description: 'Enhance the user spoken prompt using AI and write it to the generation input field. Use this when the user describes a banner idea they want to create.',
                parameters: {
                  type: 'object',
                  properties: {
                    prompt: { type: 'string', description: 'The rough prompt to enhance' },
                    industry: { type: 'string', description: 'Optional industry context (e.g., tech, finance, healthcare)' },
                    style: { type: 'string', description: 'Optional style (e.g., professional, creative, minimal)' },
                  },
                  required: ['prompt'],
                },
              },
              {
                type: 'function',
                name: 'generate_background',
                description: 'Generate a LinkedIn banner background image from a prompt',
                parameters: {
                  type: 'object',
                  properties: {
                    prompt: { type: 'string', description: 'The detailed prompt for image generation' },
                    quality: { type: 'string', enum: ['1K', '2K', '4K'], description: 'Image quality level' },
                  },
                  required: ['prompt'],
                },
              },
              {
                type: 'function',
                name: 'remove_background',
                description: 'Remove the background from the current canvas image',
                parameters: {
                  type: 'object',
                  properties: {
                    image_url: { type: 'string', description: 'Optional image URL. Uses canvas if not provided.' },
                  },
                },
              },
              {
                type: 'function',
                name: 'upscale_image',
                description: 'Upscale the current image to higher resolution',
                parameters: {
                  type: 'object',
                  properties: {
                    image_url: { type: 'string', description: 'The image URL to upscale' },
                    mode: { type: 'string', enum: ['fast', 'balanced', 'best'], description: 'Upscale mode' },
                  },
                  required: ['image_url'],
                },
              },
              {
                type: 'function',
                name: 'restore_image',
                description: 'Restore and enhance old or damaged photos',
                parameters: {
                  type: 'object',
                  properties: {
                    image_url: { type: 'string', description: 'The image URL to restore' },
                  },
                  required: ['image_url'],
                },
              },
              {
                type: 'function',
                name: 'enhance_face',
                description: 'Enhance faces in the image for better quality',
                parameters: {
                  type: 'object',
                  properties: {
                    image_url: { type: 'string', description: 'The image URL with faces to enhance' },
                  },
                  required: ['image_url'],
                },
              },
              // Image editing tools
              {
                type: 'function',
                name: 'magic_edit',
                description: 'Edit or transform the current canvas image using a text prompt. Use this when user wants to modify, change, or transform aspects of the image like "make the background blue", "add a sunset", "change the lighting", "make it look more professional". This is powerful for creative edits.',
                parameters: {
                  type: 'object',
                  properties: {
                    prompt: { type: 'string', description: 'The edit instruction describing what to change (e.g., "make the background a sunset", "add warm lighting")' },
                    base_image: { type: 'string', description: 'Optional image URL. Uses current canvas image if not provided.' },
                  },
                  required: ['prompt'],
                },
              },
              {
                type: 'function',
                name: 'analyze_image',
                description: 'Analyze the current canvas image and suggest creative edit prompts or new generation ideas. Use when user asks for suggestions, ideas, or wants to know what edits would look good.',
                parameters: {
                  type: 'object',
                  properties: {
                    image_url: { type: 'string', description: 'Optional image URL. Uses current canvas image if not provided.' },
                  },
                },
              },
              {
                type: 'function',
                name: 'analyze_banner',
                description: 'Analyze the current banner design and provide professional improvement suggestions. Use when user wants feedback, critique, or ideas to make their banner better.',
                parameters: {
                  type: 'object',
                  properties: {},
                },
              },
              // Canvas manipulation tools
              {
                type: 'function',
                name: 'add_text_element',
                description: 'Add a text element to the canvas banner. Use this when user wants to add text, a title, name, tagline, or any text content to their banner.',
                parameters: {
                  type: 'object',
                  properties: {
                    text: { type: 'string', description: 'The text content to add' },
                    x: { type: 'number', description: 'X position (default: center at 792)' },
                    y: { type: 'number', description: 'Y position (default: center at 198)' },
                    fontSize: { type: 'number', description: 'Font size in pixels (default: 48)' },
                    color: { type: 'string', description: 'Text color in hex format (default: #ffffff)' },
                    fontFamily: { type: 'string', description: 'Font family name (default: Inter)' },
                  },
                  required: ['text'],
                },
              },
              {
                type: 'function',
                name: 'update_element',
                description: 'Update properties of an existing canvas element like changing text, color, size, or position.',
                parameters: {
                  type: 'object',
                  properties: {
                    element_id: { type: 'string', description: 'The ID of the element to update' },
                    properties: {
                      type: 'object',
                      description: 'Properties to update (e.g., content, color, fontSize, x, y, fontFamily)',
                    },
                  },
                  required: ['element_id', 'properties'],
                },
              },
              {
                type: 'function',
                name: 'delete_element',
                description: 'Delete an element from the canvas.',
                parameters: {
                  type: 'object',
                  properties: {
                    element_id: { type: 'string', description: 'The ID of the element to delete' },
                  },
                  required: ['element_id'],
                },
              },
              {
                type: 'function',
                name: 'list_elements',
                description: 'List all current elements on the canvas. Use this to see what elements exist before updating or deleting.',
                parameters: {
                  type: 'object',
                  properties: {},
                },
              },
              // Navigation tools
              {
                type: 'function',
                name: 'navigate_to_tab',
                description: 'Navigate to a different tab in the application. Use "studio" for design editing, "gallery" for saved designs, "brainstorm" for chat and ideation.',
                parameters: {
                  type: 'object',
                  properties: {
                    tab: { type: 'string', enum: ['studio', 'gallery', 'brainstorm'], description: 'The tab to navigate to' },
                  },
                  required: ['tab'],
                },
              },
              // History tools
              {
                type: 'function',
                name: 'undo_action',
                description: 'Undo the last canvas action. Use when user wants to undo, go back, or revert.',
                parameters: {
                  type: 'object',
                  properties: {},
                },
              },
              {
                type: 'function',
                name: 'redo_action',
                description: 'Redo a previously undone action. Use when user wants to redo or restore an action.',
                parameters: {
                  type: 'object',
                  properties: {},
                },
              },
            ],
          },
        });

        // Set up audio processing for microphone input
        this.setupAudioProcessing();
        safeResolve();
      };

      this.ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          this.handleMessage(message, onMessage, onToolCall, onTranscript);
        } catch (error) {
          console.error('[OpenAI Realtime] Failed to parse message:', error);
        }
      };

      this.ws.onerror = (error) => {
        console.error('[OpenAI Realtime] WebSocket error:', error);
        this.isConnected = false;
        onStatus(false);
        this.disconnect().catch((disconnectError) => {
          console.error('[OpenAI Realtime] Cleanup after error failed:', disconnectError);
        });
        safeReject(error);
      };

      this.ws.onclose = () => {
        console.log('[OpenAI Realtime] WebSocket closed');
        this.isConnected = false;
        onStatus(false);
        this.disconnect().catch((disconnectError) => {
          console.error('[OpenAI Realtime] Cleanup after close failed:', disconnectError);
        });

        if (!didOpen) {
          safeReject(new Error('OpenAI Realtime connection closed before it was established'));
        }
      };
    });
  }

  private setupAudioProcessing() {
    if (!this.audioContext || !this.audioStream) return;

    this.sourceNode = this.audioContext.createMediaStreamSource(this.audioStream);
    this.scriptProcessor = this.audioContext.createScriptProcessor(4096, 1, 1);

    // Pre-allocate input buffer to prevent per-frame allocations (Fix 3)
    this.inputPcm16Buffer = new Int16Array(4096);

    this.scriptProcessor.onaudioprocess = (e) => {
      if (!this.isConnected || !this.ws || this.ws.readyState !== WebSocket.OPEN) {
        return;
      }

      const inputData = e.inputBuffer.getChannelData(0);

      // Reuse pre-allocated buffer (Fix 3)
      if (!this.inputPcm16Buffer) {
        this.inputPcm16Buffer = new Int16Array(inputData.length);
      }

      // Convert Float32Array to Int16Array (PCM16) using cached buffer
      for (let i = 0; i < inputData.length; i++) {
        const s = Math.max(-1, Math.min(1, inputData[i]));
        this.inputPcm16Buffer[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
      }

      // Convert to base64 (slice to exact size needed)
      const base64 = this.arrayBufferToBase64((this.inputPcm16Buffer.buffer as ArrayBuffer).slice(0, inputData.length * 2));

      // Send audio to OpenAI
      this.sendMessage({
        type: 'input_audio_buffer.append',
        audio: base64,
      });
    };

    // Connect audio nodes:
    // ScriptProcessorNode MUST be connected to destination for onaudioprocess to fire
    // Use silent GainNode to mute mic loopback while keeping graph connected
    this.silentGainNode = this.audioContext.createGain();
    this.silentGainNode.gain.value = 0; // Mute the mic loopback

    this.sourceNode.connect(this.scriptProcessor);
    this.scriptProcessor.connect(this.silentGainNode);
    this.silentGainNode.connect(this.audioContext.destination);
    console.log('[OpenAI Realtime] ✓ Audio processing started');
  }

  private handleMessage(
    message: {
      type: string;
      delta?: string;
      transcript?: string;
      item?: { content?: Array<{ text?: string }> };
      name?: string;
      arguments?: string;
      error?: unknown;
    },
    onMessage: (text: string) => void,
    onToolCall?: (toolCall: ToolCall) => void,
    onTranscript?: (entry: TranscriptEntry) => void,
  ) {
    switch (message.type) {
      case 'response.audio.delta':
        // Handle audio response with robust buffered playback
        if (message.delta) {
          this.enqueueAudio(message.delta);
        }
        break;

      case 'response.text.delta':
        // Handle text response
        if (message.delta) {
          onMessage(message.delta);
        }
        break;

      case 'response.done':
        // Response complete
        console.log('[OpenAI Realtime] Response complete');
        if (this.playbackQueue) {
          const metrics = this.playbackQueue.getMetrics();
          const durationSec = (metrics.totalReceived / 24000).toFixed(1);
          console.log(`[OpenAI Realtime] Audio metrics: ${durationSec}s received, ${metrics.bufferedSamples} buffered, ${metrics.underruns} underruns`);
        }
        break;

      case 'conversation.item.input_audio_transcription.completed':
        // User speech transcribed
        if (message.transcript) {
          const entry: TranscriptEntry = {
            role: 'user',
            text: message.transcript,
            timestamp: Date.now(),
          };
          this.transcript.push(entry);
          if (onTranscript) onTranscript(entry);
        }
        break;

      case 'response.output_item.added':
        // Assistant response added
        if (message.item?.content) {
          const text = message.item.content
            .map((c) => c.text)
            .filter(Boolean)
            .join('');
          if (text) {
            const entry: TranscriptEntry = {
              role: 'assistant',
              text: text,
              timestamp: Date.now(),
            };
            this.transcript.push(entry);
            if (onTranscript) onTranscript(entry);
          }
        }
        break;

      case 'response.function_call_arguments.done':
        // Function call detected
        if (onToolCall && message.name && message.arguments) {
          const toolCall: ToolCall = {
            name: message.name,
            args: JSON.parse(message.arguments),
          };
          onToolCall(toolCall);
        }
        break;

      case 'error':
        console.error('[OpenAI Realtime] API Error:', message.error);
        break;
    }
  }

  /**
   * Enqueue audio for smooth continuous playback
   * Uses ring buffer to prevent choppy audio from individual buffer sources
   * OPTIMIZED: Reuses cached buffers to prevent GC pressure (Fix 2)
   */
  private enqueueAudio(base64Audio: string) {
    if (!this.audioContext || !this.playbackQueue) return;

    try {
      // Ensure AudioContext is running (may be suspended)
      if (this.audioContext.state === 'suspended') {
        this.audioContext.resume();
      }

      // Decode base64 to ArrayBuffer
      const binaryString = atob(base64Audio);
      const byteLength = binaryString.length;

      // Reuse or resize decode buffer (Fix 2)
      if (!this.decodeBuffer || this.decodeBuffer.length < byteLength) {
        this.decodeBuffer = new Uint8Array(byteLength);
      }

      for (let i = 0; i < byteLength; i++) {
        this.decodeBuffer[i] = binaryString.charCodeAt(i);
      }

      // Create view of exact size needed from cached buffer
      const pcm16 = new Int16Array(this.decodeBuffer.buffer, 0, byteLength / 2);
      const sampleCount = pcm16.length;

      // Reuse or resize float32 cache (Fix 2)
      if (!this.float32Cache || this.float32Cache.length < sampleCount) {
        this.float32Cache = new Float32Array(sampleCount);
      }

      // Convert PCM16 to Float32
      for (let i = 0; i < sampleCount; i++) {
        this.float32Cache[i] = pcm16[i] / (pcm16[i] < 0 ? 0x8000 : 0x7fff);
      }

      // Enqueue only the valid portion to playback buffer
      this.playbackQueue.enqueue(this.float32Cache.subarray(0, sampleCount));
    } catch (error) {
      console.error('[OpenAI Realtime] Audio enqueue error:', error);
    }
  }

  private sendMessage(message: Record<string, unknown>) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    }
  }

  /**
   * Convert ArrayBuffer to base64
   * OPTIMIZED: Uses chunked approach to avoid string concatenation in loop (Fix 1)
   */
  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    // Use chunked approach instead of per-character string concatenation
    const chunks: string[] = [];
    const chunkSize = 8192; // Process 8KB chunks at a time

    for (let i = 0; i < bytes.length; i += chunkSize) {
      const chunk = bytes.subarray(i, Math.min(i + chunkSize, bytes.length));
      chunks.push(String.fromCharCode.apply(null, Array.from(chunk)));
    }

    return btoa(chunks.join(''));
  }

  async disconnect() {
    console.log('[OpenAI Realtime] Disconnecting...');
    this.isConnected = false;

    // Close WebSocket
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }

    // Stop audio playback queue
    if (this.playbackQueue) {
      this.playbackQueue.stop();
      this.playbackQueue = null;
    }

    // Stop audio
    if (this.audioStream) {
      this.audioStream.getTracks().forEach((t) => t.stop());
      this.audioStream = null;
    }

    // Disconnect audio nodes
    if (this.scriptProcessor) {
      // Clear callback to prevent memory leaks (Fix 4)
      this.scriptProcessor.onaudioprocess = null;
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

    // Close audio context
    if (this.audioContext) {
      await this.audioContext.close();
      this.audioContext = null;
    }

    // Clear cached buffers to free memory (Fix 5)
    this.decodeBuffer = null;
    this.float32Cache = null;
    this.inputPcm16Buffer = null;

    console.log('[OpenAI Realtime] ✓ Disconnected');
  }
}
