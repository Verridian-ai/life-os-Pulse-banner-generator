# File Audit - Nanobanna Pro

Generated: 2026-01-08

This document provides a comprehensive audit of every file in the project, organizing them by module and describing their purpose. The project is a full-stack React + Node (Hono) application, deployed on Google Cloud Run.

## 1. Root Configuration & Documentation

| File | Purpose |
| --- | --- |
| `Dockerfile` | Multi-stage Docker build configuration for Google Cloud Run deployment (Frontend Build + Backend Runtime). |
| `cloudbuild.yaml` | Google Cloud Build configuration for CI/CD pipeline. |
| `package.json` | Project metadata, scripts, and dependencies for the frontend workspace. |
| `vite.config.ts` | build configuration for the Vite frontend bundler. |
| `tsconfig.json` | TypeScript compiler configuration (base). |
| `eslintrc.cjs` | ESLint configuration for code quality rules. |
| `postcss.config.js` | PostCSS configuration (Tailwind processing). |
| `tailwind.config.js` | Tailwind CSS configuration (theme, content paths). |
| `nginx.conf` | Web server configuration (legacy or alternative serving context). |
| `README.md` | Project overview and quick start guide. |
| `CLAUDE.md` | Developer guide and project context for AI assistants. |
| `DEPLOYMENT.md` | Detailed deployment instructions for Vercel and Cloud Run. |
| `SETUP_GUIDE.md` | Local development environment setup guide. |
| `REPLICATE_MODELS.md` | Documentation of AI models used via Replicate API. |

## 2. Frontend Source Code (`src/`)

### 2.1 Core Application

| File | Purpose |
| --- | --- |
| `src/main.tsx` | Entry point for the React application. |
| `src/App.tsx` | Main application component, layout shell, routing, global providers, and key feature wiring. |
| `src/index.css` | Global CSS styles and Tailwind directives. |

### 2.2 Global State (`src/context`)

| File | Purpose |
| --- | --- |
| `AIContext.tsx` | Manages AI-related state (model selection, prompts, history). |
| `AuthContext.tsx` | Manages user authentication state (session, login/logout). |
| `CanvasContext.tsx` | Manages the banner designer state (elements, background, selection). |
| `ToastContext.tsx` | Provides a global notification (toast) system. |
| `VoiceAgentContext.tsx` | Manages the voice interface state and WebRTC connection. |

### 2.3 Custom Hooks (`src/hooks`)

| File | Purpose |
| --- | --- |
| `useAuth.ts` | Hook to access authentication state. |
| `useCanvas.ts` | Hook to access canvas operations (add, remove, update elements). |
| `useToast.ts` | Hook to trigger toast notifications. |
| `useAI.ts` | Hook to access AI context. |
| `useVoiceAgent.ts` | Hook to interact with the voice agent. |
| `useKeyboardShortcuts.ts` | Manages global keyboard shortcuts mapping. |
| `useDropdownKeyboard.ts` | Helper for keyboard navigation in dropdowns. |
| `usePromptHistory.ts` | Manages local storage persistence for AI prompts. |
| `useCanvasSnapshots.ts` | Manages history (undo/redo) for the canvas. |

### 2.4 Feature Components (`src/components/features`)

| File | Purpose |
| --- | --- |
| `GenerativeSidebar.tsx` | Main control panel for AI generation (text-to-image, magic edit). |
| `TemplateLibrary.tsx` | Modal/Panel for browsing and applying banner templates. |
| `ImageGallery.tsx` | Gallery for viewing and managing generated assets. |
| `CanvasEditor.tsx` | The visual drag-and-drop editor canvas area. |
| `ImageToolsPanel.tsx` | Tools for specific image manipulations (inpainting, upscale, remove BG). |
| `LiveActionPanel.tsx` | UI overlay for the active voice agent session. |
| `ChatInterface.tsx` | Text-based chat interface for brainstorming (Brainstorm Tab). |
| `APIKeyInstructionsModal.tsx` | Helper modal for guiding users to set up API keys. |
| `AuthModal.tsx` | Modal for user login and registration. |
| `SettingsModal.tsx` | Application settings (theme, API keys, preferences). |
| `OnboardingTour.tsx` | Interactive tour guiding new users through the UI. |
| `KeyboardShortcutsModal.tsx` | Reference modal showing available shortcuts. |
| `QuickGenerateWizard.tsx` | Step-by-step wizard for rapid initial creation. |

### 2.5 UI Components (`src/components/ui`, etc.)

| File | Purpose |
| --- | --- |
| `Header.tsx` | Global top navigation bar. |
| `EnhanceButton.tsx` | Smart button for prompt enhancement. |
| `Skeleton.tsx` | Loading placeholder component. |
| `ToastContainer.tsx` | Rendering container for toast notifications. |

### 2.6 Services & Clients (`src/services`)

| File | Purpose |
| --- | --- |
| `api.ts` | Core Axios instance for backend communication. |
| `auth.ts` | Authentication API methods. |
| `replicate.ts` | Replicate API client wrapper (frontend side). |
| `brandEngine.ts` | Logic for brand consistency enforcement. |
| `actionExecutor.ts` | Executes abstract actions (e.g., from voice or AI) on the UI. |
| `validationSchemas.ts` | Zod schemas for validating inputs and commands. |

### 2.7 Types & constants (`src/types`, `src/constants`)

| File | Purpose |
| --- | --- |
| `src/types/ai.ts` | Interfaces for AI models, tool chains, and metrics. |
| `src/constants/templates.ts` | Definitions of preset banner templates (layouts, prompts). |
| `src/constants/index.ts` | Global constants (model lists, default values). |

## 3. Backend Source Code (`server/src/`)

### 3.1 Server Core

| File | Purpose |
| --- | --- |
| `src/index.ts` | Main Hono server entrypoint. Configures middleware, security headers, and routes. |
| `src/db/index.ts` | Database connection setup (Drizzle ORM + Neon/Postgres). |
| `src/db/schema.ts` | Drizzle schema definitions (Users, Sessions, Images, etc.). |

### 3.2 Authentication & Libraries (`src/lib`)

| File | Purpose |
| --- | --- |
| `src/lib/auth.ts` | Lucia Auth configuration (Session management). |
| `src/lib/adminAuth.ts` | Middleware for admin-only route protection. |
| `src/lib/email.ts` | Email sending utility (Transactional emails). |
| `src/lib/gcs.ts` | Google Cloud Storage client for asset persistence. |
| `src/lib/rateLimit.ts` | Redis-based rate limiting utility. |

### 3.3 API Routes (`src/routes`)

| File | Purpose |
| --- | --- |
| `src/routes/auth.ts` | Authentication endpoints (login, signup, verify). |
| `src/routes/user.ts` | User profile endpoints. |
| `src/routes/storage.ts` | Endpoints for generating signed URLs for GCS upload/download. |
| `src/routes/ai.ts` | AI orchestration endpoints (Gemini, etc.). |
| `src/routes/replicate.ts` | Replicate proxy endpoints (hides API key). |
| `src/routes/images.ts` | Image asset management endpoints. |
| `src/routes/prompts.ts` | Prompt library management endpoints. |
| `src/routes/admin.ts` | Admin dashboard data endpoints. |

### 3.4 Services (`src/services`)

| File | Purpose |
| --- | --- |
| `src/services/replicate.ts` | Backend wrapper for Replicate API operations. |

## 4. Test Suite

| File | Purpose |
| --- | --- |
| `src/**/*.test.ts` | Unit tests colocated with source files (e.g., `api.test.ts`). |
| `browser-test-script.js` | Puppeteer/Playwright script for end-to-end browser testing. |

This audit confirms that the project is structured as a modern Monorepo-style application (Frontend and Backend in one repo), configured for containerized deployment on Google Cloud Run via Docker.
