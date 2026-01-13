# Component Inventory

This document provides a comprehensive catalog of all React components in the Nanobanna Pro application.

## 1. Metrics Overview

- **Total Components:** 45+
- **Primary Directories:** `features/`, `ui/`, `layout/`
- **Tech Stack:** React 19, TypeScript, Tailwind CSS

---

## 2. Layout Components

### Header

- **File:** `src/components/layout/Header.tsx`
- **Category:** Layout
- **Purpose:** Main application navigation, user profile access, settings toggle, and connection status.
- **Props Interface:**

  ```typescript
  interface HeaderProps {
    activeTab: Tab;
    setActiveTab: (tab: Tab) => void;
    onOpenSettings: () => void;
    onOpenAuth: () => void;
    onOpenInstructions: () => void;
    onOpenQuickGen?: () => void;
    isVoiceActive?: boolean;
    voiceConnectionState?: ConnectionState;
    onToggleVoice?: () => void;
  }
  ```

- **Styling:** Tailwind CSS (sticky top, glassmorphism `bg-black/60 backdrop-blur-xl`).
- **State Management:** Local state for profile menu visibility; Consumes `AuthContext`.
- **Dependencies:** `useAuth`, `useDropdownKeyboard`.

### StudioSubNav

- **File:** `src/components/layout/StudioSubNav.tsx`
- **Category:** Layout
- **Purpose:** Contextual sub-navigation for the Studio tab (e.g., Editor vs. Library views).
- **Props Interface:** Standard Props
- **Styling:** Tailwind CSS.
- **Dependencies:** None.

---

## 3. UI Primitives

### EnhanceButton

- **File:** `src/components/ui/EnhanceButton.tsx`
- **Category:** UI Primitives
- **Purpose:** Reusable button for enhancing text prompts using AI.
- **Props Interface:**

  ```typescript
  interface EnhanceButtonProps {
    prompt: string;
    onEnhanced: (enhancedPrompt: string) => void;
    disabled?: boolean;
    size?: 'xs' | 'sm' | 'md';
    variant?: 'primary' | 'secondary' | 'ghost';
    context?: PromptEnhanceContext;
    className?: string;
    showLabel?: boolean;
  }
  ```

- **Styling:** Tailwind CSS with gradient variants (`bg-gradient-to-br from-purple-600 to-pink-600`).
- **State Management:** Custom hook `usePromptEnhance`.
- **Dependencies:** `usePromptEnhance`.

### Toast

- **File:** `src/components/ui/Toast.tsx`
- **Category:** UI Primitives
- **Purpose:** Individual toast notification notification.
- **Styling:** Tailwind CSS (Animations, semantic colors).
- **Dependencies:** None.

### ToastContainer

- **File:** `src/components/ui/ToastContainer.tsx`
- **Category:** UI Primitives
- **Purpose:** Portal container for managing multiple toast notifications.
- **Styling:** Fixed overlay positioning.
- **Dependencies:** `useToast`.

### Skeleton

- **File:** `src/components/ui/Skeleton.tsx`
- **Category:** UI Primitives
- **Purpose:** Loading placeholder animation.
- **Styling:** Tailwind animate-pulse.

### ConfirmationModal

- **File:** `src/components/ui/ConfirmationModal.tsx`
- **Category:** UI Primitives
- **Purpose:** Generic modal for confirming destructive actions.
- **Styling:** Glassmorphism overlay.

---

## 4. Feature Components (Core)

### CanvasEditor

- **File:** `src/components/features/CanvasEditor.tsx`
- **Category:** Feature
- **Purpose:** The main workspace for editing banners, handling canvas state, zoom, and interactions.
- **Props Interface:** `React.FC` (No props, uses Context)
- **Styling:** Tailwind CSS, responsive grid layout.
- **State Management:** `CanvasContext`, `CanvasStateContext`.
- **Dependencies:** `BannerCanvas`, `CanvasFormatSelector`, `LayersPanel`, `AssetsPanel`, `ExportPanel`, `SnapshotsModal`.

### GenerativeSidebar

- **File:** `src/components/features/GenerativeSidebar.tsx`
- **Category:** Feature
- **Purpose:** Controls for AI generation, editing, and enhancement tools.
- **Props Interface:** `GenerativeSidebarProps` (Complex interface handling prompts, sizes, generation state, etc.)
- **Styling:** Collapsible sidebar (desktop) / Bottom sheet (mobile).
- **State Management:** Local state for mode (generate/edit/tools), expansion.
- **Dependencies:** `PromptLibrary`, `ImageToolsPanel`, `EnhanceButton`.

---

## 5. Feature Components (Editor Sub-components)

*Located in `src/components/features/editor/`*

### CanvasFormatSelector

- **File:** `src/components/features/editor/CanvasFormatSelector.tsx`
- **Purpose:** Dropdown/UI to switch between banner sizes (LinkedIn, X, etc.).

### LayersPanel

- **File:** `src/components/features/editor/LayersPanel.tsx`
- **Purpose:** Manages z-index and visibility of canvas elements.

### AssetsPanel

- **File:** `src/components/features/editor/AssetsPanel.tsx`
- **Purpose:** Library of drag-and-drop assets (images, shapes).

### ExportPanel

- **File:** `src/components/features/editor/ExportPanel.tsx`
- **Purpose:** Controls for downloading or posting the final design.

### TypographyPanel

- **File:** `src/components/features/editor/TypographyPanel.tsx`
- **Purpose:** Text editing controls (font family, weight, color).

---

## 6. Feature Components (Modals & Panels)

### SettingsModal

- **File:** `src/components/features/SettingsModal.tsx`
- **Purpose:** Application-wide settings (API keys, theme preferences).

### KeyboardShortcutsModal

- **File:** `src/components/features/KeyboardShortcutsModal.tsx`
- **Purpose:** Reference for keyboard hotkeys.

### LinkedInPublishModal

- **File:** `src/components/features/LinkedInPublishModal.tsx`
- **Purpose:** Interface for drafting and posting to LinkedIn.

### ProfileEditorModal

- **File:** `src/components/features/editor/ProfileEditorModal.tsx`
- **Purpose:** Specialized editor for user profile pictures within the banner.

### SnapshotsModal

- **File:** `src/components/features/SnapshotsModal.tsx`
- **Purpose:** Version history viewer and restorer.

### KeyboardShortcutsPanel

- **File:** `src/components/features/KeyboardShortcutsPanel.tsx`
- **Purpose:** Inline shortcut cheat sheet (likely sidebar or helper).

---

## 7. Feature Components (AI & Tools)

### ChatHistoryPanel

- **File:** `src/components/features/ChatHistoryPanel.tsx`
- **Purpose:** Displays past conversations with the AI agent.

### PromptLibrary

- **File:** `src/components/features/PromptLibrary.tsx`
- **Purpose:** Saved prompts management and selection.

### ImageToolsPanel

- **File:** `src/components/features/ImageToolsPanel.tsx`
- **Purpose:** Advanced image manipulation tools (upscale, remove bg).

### QuickGenerateWizard

- **File:** `src/components/features/QuickGenerateWizard.tsx`
- **Purpose:** Step-by-step wizard for fast asset creation.

### ToolChainBuilder

- **File:** `src/components/features/ToolChainBuilder.tsx`
- **Purpose:** Advanced feature for chaining AI operations.

### ModelSelector

- **File:** `src/components/features/ModelSelector.tsx`
- **Purpose:** UI for choosing the AI model (Gemini, etc.).

---

## 8. Feature Components (Misc)

### OnboardingTour

- **File:** `src/components/features/OnboardingTour.tsx`
- **Purpose:** Guided tour for new users.

### ABTestingPanel

- **File:** `src/components/features/ABTestingPanel.tsx`
- **Purpose:** Tools for A/B testing designs (experimental).

### PerformanceMetricsPanel

- **File:** `src/components/features/PerformanceMetricsPanel.tsx`
- **Purpose:** Analytics display for engagement or system performance.

### BrandConsistencyPanel

- **File:** `src/components/features/BrandConsistencyPanel.tsx`
- **Purpose:** Enforces brand guidelines (colors, fonts).

### LiveActionPanel

- **File:** `src/components/features/LiveActionPanel.tsx`
- **Purpose:** Real-time feedback or actions system.

### TemplateLibrary

- **File:** `src/components/features/TemplateLibrary.tsx`
- **Purpose:** Gallery of pre-made banner templates.

### APIKeyInstructionsModal

- **File:** `src/components/features/APIKeyInstructionsModal.tsx`
- **Purpose:** Helper guide for obtaining necessary API keys.

---

## 9. Auth & Accessibility

### AuthModal

- **File:** `src/components/auth/AuthModal.tsx`
- **Purpose:** Login/Signup modal interface interaction.

### IdleTimeoutWarning

- **File:** `src/components/auth/IdleTimeoutWarning.tsx`
- **Purpose:** Modal displaying warning before session timeout.

### ScreenReaderAnnouncer

- **File:** `src/components/accessibility/ScreenReaderAnnouncer.tsx`
- **Purpose:** Hidden component for managing ARIA live region announcements.

---

## 10. Email

### EmailTemplate

- **File:** `src/components/features/email/EmailTemplate.tsx`
- **Purpose:** Component structure for generating email HTML content.
