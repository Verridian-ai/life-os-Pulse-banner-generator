# Component Inventory - Nanobanna Pro

This document provides a comprehensive catalog of all components in the Nanobanna Pro React application, categorized by their role and functionality.

## 1. Metrics & Tech Stack

- **Total Components**: 60+
- **Primary Tech Stack**: React 19, TypeScript, Tailwind CSS
- **State Management**: React Context (`CanvasContext`, `AuthContext`, etc.)
- **Design Paradigm**: Obsidian Dark Mode, Glassmorphism, Neumorphism

---

## 2. Layout Components

Components that define the structural shell of the application.

| Component | Path | Purpose | Key Props | Dependencies |
| :--- | :--- | :--- | :--- | :--- |
| **Header** | `src/components/layout/Header.tsx` | Global navigation, profile access, voice agent status. | `activeTab`, `onOpenSettings`, `isVoiceActive` | `AuthContext`, `useDropdownKeyboard` |
| **StudioSubNav** | `src/components/layout/StudioSubNav.tsx` | Contextual tabs for Studio (Editor/Library). | `activeTab`, `onTabChange` | None |
| **AdminLayout** | `src/features/admin/components/AdminLayout.tsx` | Structural shell for admin pages. | `activeSection`, `children` | None |

---

## 3. UI Primitives (Shared)

Atomic components used across multiple features.

| Component | Path | Purpose | Key Props |
| :--- | :--- | :--- | :--- |
| **EnhanceButton** | `src/components/ui/EnhanceButton.tsx` | AI-powered prompt refiner. | `prompt`, `onEnhanced`, `size`, `variant` |
| **Toast** | `src/components/ui/Toast.tsx` | Semantic notifications. | `message`, `type`, `onClose` |
| **Skeleton** | `src/components/ui/Skeleton.tsx` | Loading state placeholders. | `className` |
| **ConfirmationModal** | `src/components/ui/ConfirmationModal.tsx` | Generic destructive action confirmation. | `title`, `message`, `onConfirm`, `onCancel` |

---

## 4. Canvas Editor Feature

The core design workspace of Nanobanna Pro.

| Component | Path | Purpose | Key Props | Context |
| :--- | :--- | :--- | :--- | :--- |
| **CanvasEditor** | `src/components/features/CanvasEditor.tsx` | Main orchestrator for the design view. | None | `CanvasContext` |
| **BannerCanvas** | `src/components/BannerCanvas.tsx` | The HTML5 Canvas drawing engine. | `elements`, `backgroundImage`, `profilePic` | Ref-based imperative handle |
| **GenerativeSidebar** | `src/components/features/GenerativeSidebar.tsx` | AI controls for image generation. | `onGenerate`, `loading` | Local UI state |
| **TypographyPanel** | `src/components/features/editor/TypographyPanel.tsx` | Text styling controls. | None | `CanvasContext` |
| **LayersPanel** | `src/components/features/editor/LayersPanel.tsx` | Z-index and visibility management. | None | `CanvasContext` |
| **ProfileEditorModal** | `src/components/features/editor/ProfileEditorModal.tsx` | Specialized PFP manipulation tools. | `profilePic`, `transform` | None |

---

## 5. AI Chat & Assistance

Natural language interface for asset creation and help.

| Component | Path | Purpose | Key Props |
| :--- | :--- | :--- | :--- |
| **ChatInterface** | `src/components/ChatInterface/ChatInterface.tsx` | Main NANO AI assistant hub. | `onGenerateFromPrompt` |
| **ChatMessage** | `src/components/ChatInterface/components/ChatMessage.tsx` | Renders AI/User messages & tool outputs. | `message`, `onGenerateFromPrompt` |
| **ChatInput** | `src/components/ChatInterface/components/ChatInput.tsx` | Text & file attachment input. | `onSend`, `attachedImages` |
| **ConversationHistory** | `src/components/ChatInterface/components/ConversationHistory.tsx` | Saved session switcher. | `conversations`, `onLoadConversation` |

---

## 6. Social Media Studios

Tailored workflows for specific platforms.

| Component | Path | Purpose | Key Props |
| :--- | :--- | :--- | :--- |
| **LinkedInContentStudio**| `src/features/linkedin-posts/LinkedInContentStudio.tsx` | Specialized LinkedIn workflow. | None |
| **CopywritingPanel** | `src/features/linkedin-posts/components/CopywritingPanel.tsx` | AI post generator with viral hooks. | `baseContext`, `onCopyGenerated` |
| **ViralScoreCard** | `src/features/linkedin-posts/components/ViralScoreCard.tsx` | Performance prediction visualization. | `score`, `metrics` |

---

## 7. Admin & Operations

Internal tools for platform governance.

| Component | Path | Purpose | Key Props |
| :--- | :--- | :--- | :--- |
| **AdminDashboard** | `src/features/admin/pages/AdminDashboard.tsx` | Overview of system stats (Users, API, Tokens). | None |
| **AdminAgents** | `src/features/admin/pages/AdminAgents.tsx` | Configuration hub for AI persona prompts. | None |
| **AdminObservability** | `src/features/admin/pages/AdminObservability.tsx` | Performance metrics and trace viewing. | None |
| **AdminGuard** | `src/features/admin/components/AdminGuard.tsx` | RBAC protection for admin routes. | `children` |

---

## 8. Auth & Utility Modals

Infrastructure and session management.

| Component | Path | Purpose | Context Dependencies |
| :--- | :--- | :--- | :--- |
| **AuthModal** | `src/components/auth/AuthModal.tsx` | Login, Signup, Social Auth. | `AuthContext` |
| **SettingsModal** | `src/components/features/SettingsModal.tsx` | API keys, Global Prefs. | None |
| **QuickGenerateWizard**| `src/components/features/QuickGenerateWizard.tsx` | Multi-step fast creation path. | None |
| **OnboardingTour** | `src/components/features/OnboardingTour.tsx` | Guided user introduction. | None |
