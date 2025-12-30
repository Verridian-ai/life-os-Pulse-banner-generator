export interface BannerElement {
  id: string;
  type: 'text' | 'image' | 'logo';
  content: string; // text content or image url
  x: number;
  y: number;
  width?: number;
  height?: number;
  rotation?: number; // degrees

  // Typography
  fontSize?: number;
  fontWeight?: string; // '100' to '900'
  fontFamily?: string;
  fontStyle?: 'normal' | 'italic';
  color?: string;
  textAlign?: 'left' | 'center' | 'right';
  letterSpacing?: number; // px (-10 to 50)
  lineHeight?: number; // multiplier (0.8 to 3.0)

  // Text transforms & decoration
  textTransform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
  textDecoration?: 'none' | 'underline' | 'line-through' | 'underline line-through';

  // Text background/highlight
  backgroundColor?: string;
  backgroundPadding?: number; // px (0-20)

  // Opacity
  opacity?: number; // 0-100

  // Text shadow
  textShadowColor?: string;
  textShadowBlur?: number; // px (0-50)
  textShadowOffsetX?: number; // px (-50 to 50)
  textShadowOffsetY?: number; // px (-50 to 50)

  // Text stroke/outline
  textStrokeColor?: string;
  textStrokeWidth?: number; // px (0-20)
  textStrokeStyle?: 'solid' | 'dashed' | 'dotted';
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
