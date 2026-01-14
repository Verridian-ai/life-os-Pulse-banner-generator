// Stub implementation of LiveClient to remove Google GenAI SDK dependency

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
  constructor(_apiKey: string) {
    console.log('[LiveClient] Initialized (Stub Mode)');
  }

  getTranscript(): TranscriptEntry[] {
    return [];
  }

  clearTranscript(): void {
    console.log('[LiveClient] Transcript cleared');
  }

  async connect(
    _onMessage: (text: string) => void,
    onStatus: (status: boolean) => void,
    _onToolCall?: (toolCall: ToolCall) => void,
    _onTranscript?: (entry: TranscriptEntry) => void,
  ) {
    console.warn(
      '[LiveClient] Connect called but feature is temporarily disabled due to SDK removal.',
    );
    onStatus(false);
    throw new Error('Live Audio feature is currently unavailable.');
  }

  async disconnect() {
    console.log('[LiveClient] Disconnected');
  }
}
