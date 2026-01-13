/**
 * Settings Section Types
 */

export type SettingsSection =
  | 'account'
  | 'appearance'
  | 'integrations'
  | 'billing'
  | 'data'
  | 'help'
  | 'about';

export type ThemeMode = 'light' | 'dark' | 'system';

export type MotionLevel = 'full' | 'reduced' | 'none';

export interface UserPreferences {
  theme: ThemeMode;
  motionLevel: MotionLevel;
  luxuryLagAmount: number;
  enableGoodFriction: boolean;
  emailPreferences: {
    productUpdates: boolean;
    marketing: boolean;
    designTips: boolean;
  };
}

export interface Integration {
  id: string;
  name: string;
  icon: string;
  description: string;
  isConnected: boolean;
  connectedAt?: string;
}

export interface Subscription {
  tier: 'free' | 'pro' | 'team';
  status: 'active' | 'cancelled' | 'past_due';
  creditsRemaining: number;
  creditsTotal: number;
  currentPeriodEnd: string;
  pricePerMonth: number;
}

export interface BillingHistory {
  id: string;
  date: string;
  description: string;
  amount: number;
  status: 'paid' | 'pending' | 'failed';
  invoiceUrl?: string;
}

export interface SettingsViewProps {
  activeSection: SettingsSection;
  user: {
    name: string;
    email: string;
    avatarUrl?: string;
  };
  preferences: UserPreferences;
  integrations: Integration[];
  subscription: Subscription;
  billingHistory: BillingHistory[];
  onNavigateSection: (section: SettingsSection) => void;
  onUpdateProfile: (updates: { name?: string; email?: string }) => void;
  onChangePassword: () => void;
  onUpdatePreferences: (updates: Partial<UserPreferences>) => void;
  onConnectIntegration: (integrationId: string) => void;
  onDisconnectIntegration: (integrationId: string) => void;
  onManageSubscription: () => void;
  onExportData: () => void;
  onDeleteAccount: () => void;
}
