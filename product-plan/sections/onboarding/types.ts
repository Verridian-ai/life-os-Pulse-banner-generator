/**
 * Onboarding Section Types
 * Types for the first-time user experience flow
 */

export type OnboardingStep = 'welcome' | 'profile' | 'platforms' | 'api-keys' | 'first-design';

export type PlatformType = 'linkedin' | 'youtube' | 'instagram' | 'facebook' | 'tiktok' | 'x';

export interface OnboardingState {
  currentStep: OnboardingStep;
  completedSteps: OnboardingStep[];
  skippedSteps: OnboardingStep[];
  isComplete: boolean;
}

export interface UserProfile {
  firstName: string;
  lastName: string;
  username?: string;
  avatarUrl?: string;
}

export interface PlatformSelection {
  selectedPlatforms: PlatformType[];
}

export interface ApiKeyConfig {
  provider: 'gemini' | 'openrouter' | 'replicate';
  name: string;
  description: string;
  helpUrl: string;
  isConfigured: boolean;
  isRequired: boolean;
}

export interface ApiKeysState {
  gemini?: string;
  openrouter?: string;
  replicate?: string;
}

export interface OnboardingTemplate {
  id: string;
  title: string;
  thumbnailUrl: string;
  platform: PlatformType;
}

export interface OnboardingData {
  profile: UserProfile;
  platforms: PlatformSelection;
  apiKeys: ApiKeysState;
  completedAt?: string;
}

export interface WelcomeStepProps {
  onContinue: () => void;
}

export interface ProfileStepProps {
  profile: UserProfile;
  onUpdateProfile: (profile: UserProfile) => void;
  onContinue: () => void;
  onSkip: () => void;
}

export interface PlatformsStepProps {
  selectedPlatforms: PlatformType[];
  onTogglePlatform: (platform: PlatformType) => void;
  onContinue: () => void;
}

export interface ApiKeysStepProps {
  apiKeys: ApiKeysState;
  providers: ApiKeyConfig[];
  onUpdateApiKey: (provider: string, key: string) => void;
  onContinue: () => void;
  onSkip: () => void;
}

export interface FirstDesignStepProps {
  templates: OnboardingTemplate[];
  onSelectTemplate: (templateId: string) => void;
  onStartFromScratch: () => void;
}

export interface ProgressIndicatorProps {
  steps: OnboardingStep[];
  currentStep: OnboardingStep;
  completedSteps: OnboardingStep[];
}

export interface OnboardingProps {
  initialData?: Partial<OnboardingData>;
  onComplete: (data: OnboardingData) => void;
  onSkip: () => void;
}
