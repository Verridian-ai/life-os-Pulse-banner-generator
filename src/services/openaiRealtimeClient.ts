// OpenAI Realtime API Client for Voice Chat
// Uses the latest gpt-realtime-2025-08-28 model

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

export class OpenAIRealtimeClient {
    private ws: WebSocket | null = null;
    private apiKey: string;
    private isConnected: boolean = false;
    private audioContext: AudioContext | null = null;
    private scriptProcessor: ScriptProcessorNode | null = null;
    private sourceNode: MediaStreamAudioSourceNode | null = null;
    private audioStream: MediaStream | null = null;
    private transcript: TranscriptEntry[] = [];

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
        onTranscript?: (entry: TranscriptEntry) => void
    ) {
        console.log('[OpenAI Realtime] Initializing...');

        // Request microphone access
        try {
            this.audioStream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    sampleRate: 24000 // OpenAI uses 24kHz
                }
            });
            console.log('[OpenAI Realtime] ✓ Microphone access granted');
        } catch (error: unknown) {
            console.error('[OpenAI Realtime] Microphone access failed:', error);
            throw new Error(`Microphone error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }

        // Create audio context
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 24000 });

        // Connect to OpenAI Realtime API via WebSocket
        // NOTE: Browser WebSocket API doesn't support custom headers.
        // OpenAI Realtime API requires Authorization and OpenAI-Beta headers.
        //
        // WORKAROUND: We try passing the API key as a query parameter, but if OpenAI
        // doesn't support this, you'll need to:
        // 1. Use the official OpenAI Realtime SDK/library, OR
        // 2. Set up a backend proxy to add the required headers
        const wsUrl = `wss://api.openai.com/v1/realtime?model=gpt-realtime-2025-08-28`;

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
                    'openai-beta.realtime-v1'
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

                // Initialize session
                this.sendMessage({
                    type: 'session.update',
                    session: {
                        modalities: ['text', 'audio'],
                        instructions: 'You are a helpful creative director assisting with LinkedIn banner design. Keep responses concise and focused.',
                        voice: 'alloy',
                        input_audio_format: 'pcm16',
                        output_audio_format: 'pcm16',
                        input_audio_transcription: {
                            model: 'whisper-1'
                        },
                        turn_detection: {
                            type: 'server_vad'
                        }
                    }
                });

                // Set up audio processing
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

        this.scriptProcessor.onaudioprocess = (e) => {
            if (!this.isConnected || !this.ws || this.ws.readyState !== WebSocket.OPEN) {
                return;
            }

            const inputData = e.inputBuffer.getChannelData(0);

            // Convert Float32Array to Int16Array (PCM16)
            const pcm16 = new Int16Array(inputData.length);
            for (let i = 0; i < inputData.length; i++) {
                const s = Math.max(-1, Math.min(1, inputData[i]));
                pcm16[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
            }

            // Convert to base64
            const base64 = this.arrayBufferToBase64(pcm16.buffer);

            // Send audio to OpenAI
            this.sendMessage({
                type: 'input_audio_buffer.append',
                audio: base64
            });
        };

        this.sourceNode.connect(this.scriptProcessor);
        this.scriptProcessor.connect(this.audioContext.destination);
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
        onTranscript?: (entry: TranscriptEntry) => void
    ) {
        switch (message.type) {
            case 'response.audio.delta':
                // Handle audio response
                if (message.delta) {
                    this.playAudio(message.delta);
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
                break;

            case 'conversation.item.input_audio_transcription.completed':
                // User speech transcribed
                if (message.transcript) {
                    const entry: TranscriptEntry = {
                        role: 'user',
                        text: message.transcript,
                        timestamp: Date.now()
                    };
                    this.transcript.push(entry);
                    if (onTranscript) onTranscript(entry);
                }
                break;

            case 'response.output_item.added':
                // Assistant response added
                if (message.item?.content) {
                    const text = message.item.content.map((c) => c.text).filter(Boolean).join('');
                    if (text) {
                        const entry: TranscriptEntry = {
                            role: 'assistant',
                            text: text,
                            timestamp: Date.now()
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
                        args: JSON.parse(message.arguments)
                    };
                    onToolCall(toolCall);
                }
                break;

            case 'error':
                console.error('[OpenAI Realtime] API Error:', message.error);
                break;
        }
    }

    private playAudio(base64Audio: string) {
        if (!this.audioContext) return;

        try {
            // Decode base64 to ArrayBuffer
            const binaryString = atob(base64Audio);
            const bytes = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) {
                bytes[i] = binaryString.charCodeAt(i);
            }

            // Convert PCM16 to Float32
            const pcm16 = new Int16Array(bytes.buffer);
            const float32 = new Float32Array(pcm16.length);
            for (let i = 0; i < pcm16.length; i++) {
                float32[i] = pcm16[i] / (pcm16[i] < 0 ? 0x8000 : 0x7FFF);
            }

            // Create audio buffer and play
            const audioBuffer = this.audioContext.createBuffer(1, float32.length, this.audioContext.sampleRate);
            audioBuffer.getChannelData(0).set(float32);

            const source = this.audioContext.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(this.audioContext.destination);
            source.start();
        } catch (error) {
            console.error('[OpenAI Realtime] Audio playback error:', error);
        }
    }

    private sendMessage(message: Record<string, unknown>) {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify(message));
        }
    }

    private arrayBufferToBase64(buffer: ArrayBuffer): string {
        const bytes = new Uint8Array(buffer);
        let binary = '';
        for (let i = 0; i < bytes.byteLength; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return btoa(binary);
    }

    async disconnect() {
        console.log('[OpenAI Realtime] Disconnecting...');
        this.isConnected = false;

        // Close WebSocket
        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }

        // Stop audio
        if (this.audioStream) {
            this.audioStream.getTracks().forEach(t => t.stop());
            this.audioStream = null;
        }

        // Disconnect audio nodes
        if (this.scriptProcessor) {
            this.scriptProcessor.disconnect();
            this.scriptProcessor = null;
        }
        if (this.sourceNode) {
            this.sourceNode.disconnect();
            this.sourceNode = null;
        }

        // Close audio context
        if (this.audioContext) {
            await this.audioContext.close();
            this.audioContext = null;
        }

        console.log('[OpenAI Realtime] ✓ Disconnected');
    }
}
