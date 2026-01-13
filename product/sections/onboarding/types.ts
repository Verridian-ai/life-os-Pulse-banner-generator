/**
 * Onboarding Section Types
 */

export type OnboardingStep =
  | 'welcome'
  | 'brand-colors'
  | 'first-design'
  | 'generating'
  | 'complete';

export interface OnboardingProgress {
  currentStep: OnboardingStep;
  completedSteps: OnboardingStep[];
  skippedSteps: OnboardingStep[];
}

export interface ColorOption {
  id: string;
  name: string;
  hex: string;
  isAntiSlop: boolean;
}

export interface DesignTemplateOption {
  id: string;
  name: string;
  platform: string;
  thumbnailUrl: string;
  suggestedPrompt: string;
}

export interface OnboardingFlowProps {
  progress: OnboardingProgress;
  brandColors: {
    primary?: string;
    secondary?: string;
  };
  colorOptions: ColorOption[];
  templateOptions: DesignTemplateOption[];
  firstDesign?: {
    id: string;
    imageUrl: string;
  };
  isGenerating: boolean;
  onSelectColor: (type: 'primary' | 'secondary', color: string) => void;
  onSelectTemplate: (templateId: string) => void;
  onGenerateDesign: (prompt: string) => void;
  onSkipStep: () => void;
  onNextStep: () => void;
  onPreviousStep: () => void;
  onComplete: () => void;
}
