import { GoogleGenAI, LiveServerMessage, Modality } from "@google/genai";
import { MODELS } from "../constants";

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

export class LiveClient {
    private client: GoogleGenAI;
    private sessionPromise: Promise<unknown> | null = null;
    private session: { sendRealtimeInput: (input: { audio: { mimeType: string; data: string } }) => Promise<void>; close?: () => Promise<void> } | null = null;
    private inputAudioContext: AudioContext | null = null;
    private outputAudioContext: AudioContext | null = null;
    private nextStartTime = 0;
    private cleanup: (() => void) | null = null;
    private transcript: TranscriptEntry[] = [];
    private isConnected: boolean = false;
    private audioStream: MediaStream | null = null;
    private scriptProcessor: ScriptProcessorNode | null = null;
    private sourceNode: MediaStreamAudioSourceNode | null = null;

    constructor(apiKey: string) {
        this.client = new GoogleGenAI({ apiKey });
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
        console.log('[LiveClient] Transcript cleared');
    }

    async connect(
        onMessage: (text: string) => void,
        onStatus: (status: boolean) => void,
        onToolCall?: (toolCall: ToolCall) => void,
        onTranscript?: (entry: TranscriptEntry) => void
    ) {
        console.log('[LiveClient] Initializing audio contexts...');
        this.inputAudioContext = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 16000 });
        this.outputAudioContext = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 24000 });

        const outputNode = this.outputAudioContext!.createGain();
        outputNode.connect(this.outputAudioContext!.destination);

        console.log('[LiveClient] Requesting microphone access...');

        // Check if getUserMedia is supported
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            throw new Error('Microphone not supported in this browser');
        }

        let stream: MediaStream;
        try {
            stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    sampleRate: 16000
                }
            });
            console.log('[LiveClient] ✓ Microphone access granted');
        } catch (error: unknown) {
            console.error('[LiveClient] Microphone access failed:', error);
            const err = error as { name?: string; message?: string };

            try {
                await this.inputAudioContext?.close();
                await this.outputAudioContext?.close();
            } catch {
                // Ignore cleanup errors
            }
            this.inputAudioContext = null;
            this.outputAudioContext = null;

            if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
                throw new Error('Permission denied: Please allow microphone access');
            } else if (err.name === 'NotFoundError') {
                throw new Error('No microphone found on this device');
            } else if (err.name === 'NotReadableError') {
                throw new Error('Microphone is already in use by another application');
            } else {
                throw new Error(`Microphone error: ${err.message || 'Unknown error'}`);
            }
        }

        // Store stream early so unexpected disconnects can still clean up the mic.
        this.audioStream = stream;

        console.log('[LiveClient] Connecting to Gemini Live API...');
        this.sessionPromise = this.client.live.connect({
            model: MODELS.liveAudio,
            config: {
                responseModalities: [Modality.AUDIO],
                inputAudioTranscription: {},
                outputAudioTranscription: {},
                systemInstruction: "You are a helpful creative director assisting a user in designing their LinkedIn banner. Keep responses concise and focused on design advice, color psychology, and professional branding.",
            },
            callbacks: {
                onopen: () => {
                    console.log('[LiveClient] ✓ WebSocket connection opened');
                    this.isConnected = true;
                    onStatus(true);
                },
                onmessage: async (msg: LiveServerMessage) => {
                    const parts = msg.serverContent?.modelTurn?.parts || [];
                    const serverContent = msg.serverContent;
                    const hasTextPart = parts.some((p: { text?: string }) => !!p?.text);

                    // Process all parts
                    for (const part of parts) {
                        // Handle audio data
                        if (part.inlineData?.data && this.outputAudioContext) {
                            this.playAudio(part.inlineData.data);
                        }

                        // Handle text data
                        if (part.text) {
                            console.log('[LiveClient] Received text:', part.text);
                            onMessage(part.text);

                            // Add to transcript
                            const entry: TranscriptEntry = {
                                role: 'assistant',
                                text: part.text,
                                timestamp: Date.now()
                            };
                            this.transcript.push(entry);

                            if (onTranscript) {
                                onTranscript(entry);
                            }
                        }

                        // Handle function calls (tool use)
                        if (part.functionCall) {
                            const toolCall: ToolCall = {
                                name: part.functionCall.name || 'unknown',
                                args: part.functionCall.args || {}
                            };

                            console.log('[LiveClient] Function call detected:', toolCall);

                            if (onToolCall) {
                                onToolCall(toolCall);
                            }

                            // Add tool call to last transcript entry
                            if (this.transcript.length > 0) {
                                const lastEntry = this.transcript[this.transcript.length - 1];
                                if (!lastEntry.toolCalls) {
                                    lastEntry.toolCalls = [];
                                }
                                lastEntry.toolCalls.push(toolCall);
                            }
                        }
                    }

                    // Handle input/output transcriptions (useful when response modality is AUDIO)
                    if (serverContent?.inputTranscription?.text) {
                        const entry: TranscriptEntry = {
                            role: 'user',
                            text: serverContent.inputTranscription.text,
                            timestamp: Date.now()
                        };
                        this.transcript.push(entry);

                        if (onTranscript) {
                            onTranscript(entry);
                        }
                    }

                    if (serverContent?.outputTranscription?.text && !hasTextPart) {
                        const text = serverContent.outputTranscription.text;
                        onMessage(text);

                        const entry: TranscriptEntry = {
                            role: 'assistant',
                            text,
                            timestamp: Date.now()
                        };
                        this.transcript.push(entry);

                        if (onTranscript) {
                            onTranscript(entry);
                        }
                    }

                    // Handle user turns (for transcript)
                    const legacyServerContent = msg.serverContent as { userTurn?: { parts?: Array<{ text?: string }> } } | undefined;
                    if (legacyServerContent?.userTurn) {
                        const userParts = legacyServerContent.userTurn.parts || [];
                        for (const part of userParts) {
                            if (part.text) {
                                const entry: TranscriptEntry = {
                                    role: 'user',
                                    text: part.text,
                                    timestamp: Date.now()
                                };
                                this.transcript.push(entry);

                                if (onTranscript) {
                                    onTranscript(entry);
                                }
                            }
                        }
                    }

                    // Handle dedicated tool call messages
                    if (msg.toolCall?.functionCalls && Array.isArray(msg.toolCall.functionCalls)) {
                        for (const fc of msg.toolCall.functionCalls) {
                            const toolCall: ToolCall = {
                                name: fc.name || 'unknown',
                                args: (fc.args as Record<string, unknown>) || {}
                            };

                            console.log('[LiveClient] Tool call detected:', toolCall);

                            if (onToolCall) {
                                onToolCall(toolCall);
                            }

                            // Attach tool call to the last transcript entry if present
                            if (this.transcript.length > 0) {
                                const lastEntry = this.transcript[this.transcript.length - 1];
                                if (!lastEntry.toolCalls) {
                                    lastEntry.toolCalls = [];
                                }
                                lastEntry.toolCalls.push(toolCall);
                            }
                        }
                    }
                },
                onclose: () => {
                    console.log('[LiveClient] WebSocket connection closed');
                    this.isConnected = false;
                    onStatus(false);

                    if (this.cleanup) {
                        this.cleanup();
                        this.cleanup = null;
                    }
                },
                onerror: (err) => {
                    console.error('[LiveClient] WebSocket error:', err);
                    this.isConnected = false;
                    onStatus(false);

                    if (this.cleanup) {
                        this.cleanup();
                        this.cleanup = null;
                    }
                }
            }
        });

        // Store the session for proper cleanup
        try {
            this.session = await this.sessionPromise as { sendRealtimeInput: (input: { audio: { mimeType: string; data: string } }) => Promise<void>; close?: () => Promise<void> };
            console.log('[LiveClient] ✓ Session established');
        } catch (error) {
            console.error('[LiveClient] Failed to establish session:', error);

            // Clean up mic + audio contexts on connection failures.
            try {
                stream.getTracks().forEach((t) => t.stop());
            } catch {
                // Ignore
            }
            try {
                await this.inputAudioContext?.close();
                await this.outputAudioContext?.close();
            } catch {
                // Ignore
            }
            this.audioStream = null;
            this.inputAudioContext = null;
            this.outputAudioContext = null;

            throw error;
        }

        // NOW set up audio processing AFTER session is ready
        console.log('[LiveClient] Setting up audio processing...');
        this.sourceNode = this.inputAudioContext.createMediaStreamSource(stream);
        this.scriptProcessor = this.inputAudioContext.createScriptProcessor(4096, 1, 1);

        this.scriptProcessor.onaudioprocess = (e) => {
            // Double-check we're still connected
            if (!this.isConnected || !this.session) {
                return;
            }

            const inputData = e.inputBuffer.getChannelData(0);
            const b64Data = this.float32ToBase64(inputData);

            // Send audio data through the session (non-blocking)
            // We don't await here to keep the audio processor synchronous
            try {
                const promise = this.session.sendRealtimeInput({
                    audio: {
                        mimeType: 'audio/pcm;rate=16000',
                        data: b64Data
                    }
                });

                // Handle async errors without blocking the audio thread
                if (promise && typeof promise.catch === 'function') {
                    promise.catch((error: { name?: string }) => {
                        // Only disconnect on persistent errors, not transient ones
                        if (this.isConnected && error.name !== 'AbortError') {
                            console.error('[LiveClient] Audio send failed:', error);
                            // Don't disconnect immediately - connection might recover
                        }
                    });
                }
            } catch (error) {
                // Synchronous errors are more serious
                if (this.isConnected) {
                    console.error('[LiveClient] Audio processing error:', error);
                }
            }
        };

        this.sourceNode.connect(this.scriptProcessor);
        this.scriptProcessor.connect(this.inputAudioContext.destination);
        console.log('[LiveClient] ✓ Audio processing started');

        this.cleanup = () => {
            console.log('[LiveClient] Running cleanup...');

            // Stop audio tracks
            if (this.audioStream) {
                this.audioStream.getTracks().forEach(t => {
                    t.stop();
                });
                this.audioStream = null;
                console.log('[LiveClient] Audio tracks stopped');
            }

            // Disconnect audio nodes
            if (this.scriptProcessor) {
                try {
                    this.scriptProcessor.disconnect();
                    this.scriptProcessor.onaudioprocess = null;
                } catch {
                    // Already disconnected
                }
                this.scriptProcessor = null;
            }
            if (this.sourceNode) {
                try {
                    this.sourceNode.disconnect();
                } catch {
                    // Already disconnected
                }
                this.sourceNode = null;
            }

            // Close audio contexts
            try {
                this.inputAudioContext?.close();
                this.outputAudioContext?.close();
            } catch {
                // Already closed
            }
            console.log('[LiveClient] ✓ Audio resources cleaned up');
        };
    }

    async disconnect() {
        console.log('[LiveClient] Disconnecting...');

        // Set connection flag to false immediately to stop audio processing
        this.isConnected = false;

        // Close the WebSocket session properly
        if (this.session) {
            try {
                // Try to close the session if the method exists
                if (typeof this.session.close === 'function') {
                    await this.session.close();
                    console.log('[LiveClient] ✓ Session closed');
                }
            } catch (error) {
                console.error('[LiveClient] Error closing session:', error);
            }
            this.session = null;
        }

        // Clean up audio resources
        if (this.cleanup) {
            this.cleanup();
            this.cleanup = null;
        }

        // Reset session promise
        this.sessionPromise = null;

        // Close audio contexts
        this.inputAudioContext = null;
        this.outputAudioContext = null;

        console.log('[LiveClient] ✓ Disconnect complete');
    }

    private async playAudio(base64Data: string) {
        if (!this.outputAudioContext) return;

        const binaryString = atob(base64Data);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }

        // Convert PCM to AudioBuffer
        const dataInt16 = new Int16Array(bytes.buffer);
        const buffer = this.outputAudioContext.createBuffer(1, dataInt16.length, 24000);
        const channelData = buffer.getChannelData(0);
        for (let i = 0; i < dataInt16.length; i++) {
            channelData[i] = dataInt16[i] / 32768.0;
        }

        const source = this.outputAudioContext.createBufferSource();
        source.buffer = buffer;
        source.connect(this.outputAudioContext.destination);

        const currentTime = this.outputAudioContext.currentTime;
        if (this.nextStartTime < currentTime) {
            this.nextStartTime = currentTime;
        }

        source.start(this.nextStartTime);
        this.nextStartTime += buffer.duration;
    }

    private float32ToBase64(data: Float32Array): string {
        const l = data.length;
        const int16 = new Int16Array(l);
        for (let i = 0; i < l; i++) {
            int16[i] = Math.max(-1, Math.min(1, data[i])) * 32767;
        }
        const bytes = new Uint8Array(int16.buffer);
        let binary = '';
        const len = bytes.byteLength;
        for (let i = 0; i < len; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return btoa(binary);
    }
}
