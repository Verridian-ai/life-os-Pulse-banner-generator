// Settings Types

export interface UserSettings {
  userId: string;
  theme: ThemeOption;
  accentColor: string;
  fontSize: FontSizeOption;
  reducedMotion: boolean;
  showCanvasGrid: boolean;
  autoSave: boolean;
  notifications: NotificationPreferences;
  shortcuts: Record<string, string[]>;
}

export type ThemeOption = 'light' | 'dark' | 'system';
export type FontSizeOption = 'small' | 'medium' | 'large';

export interface NotificationPreferences {
  email: boolean;
  inApp: boolean;
  generationComplete: boolean;
  weeklyDigest: boolean;
  marketing: boolean;
}

export interface APIKeyConfig {
  provider: APIProvider;
  label: string;
  isSet: boolean;
  isValid?: boolean;
  lastValidated?: Date;
  usageCount?: number;
  placeholder: string;
  helpUrl: string;
}

export type APIProvider = 'openai' | 'replicate' | 'openrouter' | 'google';

export interface Subscription {
  id: string;
  plan: PlanType;
  status: SubscriptionStatus;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  paymentMethod?: PaymentMethod;
}

export type PlanType = 'free' | 'pro' | 'team' | 'enterprise';
export type SubscriptionStatus = 'active' | 'canceled' | 'past_due' | 'trialing';

export interface PaymentMethod {
  id: string;
  type: 'card' | 'paypal';
  last4?: string;
  brand?: string;
  expiryMonth?: number;
  expiryYear?: number;
}

export interface UsageStats {
  period: string;
  generationsUsed: number;
  generationsLimit: number;
  storageUsed: number;
  storageLimit: number;
  apiCallsUsed: number;
  apiCallsLimit: number;
}

export interface Shortcut {
  id: string;
  action: string;
  keys: string[];
  category: ShortcutCategory;
  description: string;
  isCustom: boolean;
}

export type ShortcutCategory =
  | 'canvas'
  | 'generation'
  | 'navigation'
  | 'editing'
  | 'export';

export interface ConnectedAccount {
  provider: 'google' | 'github' | 'linkedin';
  email: string;
  connectedAt: Date;
  avatar?: string;
}

export type SettingsTab =
  | 'account'
  | 'api-keys'
  | 'appearance'
  | 'shortcuts'
  | 'notifications'
  | 'billing';
