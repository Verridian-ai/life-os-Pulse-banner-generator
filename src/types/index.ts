export interface BannerElement {
  id: string;
  type: 'text' | 'image' | 'logo';
  content: string; // text content or image url
  x: number;
  y: number;
  width?: number;
  height?: number;
  fontSize?: number;
  fontWeight?: string;
  color?: string;
  fontFamily?: string;
  textAlign?: 'left' | 'center' | 'right';
  rotation?: number; // degrees
  // Text effects
  textShadowColor?: string;
  textShadowBlur?: number;
  textShadowOffsetX?: number;
  textShadowOffsetY?: number;
  textStrokeColor?: string;
  textStrokeWidth?: number;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  images?: string[]; // base64 strings
  isThinking?: boolean;
  groundingUrls?: Array<{ title: string; url: string }>;
}

export interface LiveConnectionState {
  isConnected: boolean;
  isSpeaking: boolean;
  error: string | null;
}

export interface Part {
  text?: string;
  inlineData?: {
    mimeType: string;
    data: string;
  };
}
