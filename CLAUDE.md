# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Nanobanna Pro is an AI-powered LinkedIn banner design tool built for the Careersy Community. It combines multiple AI services (Gemini, OpenRouter, Replicate) with a React-based canvas editor for professional banner creation.

**Core Concept**: Multi-AI orchestration for image generation, editing, and enhancement with voice-powered workflows and brand consistency features.

## Essential Commands

### Development

```bash
npm run dev          # Start Vite dev server on port 5173
npm run build        # TypeScript compilation + Vite production build
npm run preview      # Preview production build locally
npm run lint         # ESLint with TypeScript + React rules
npm run format       # Prettier code formatting
```

### Testing

```bash
npx vitest           # Run tests (configured in vite.config.ts)
npx vitest run       # Run tests once
```

**Note**: Test configuration lives in `vite.config.ts` (lines 59-63), not a separate vitest config file.

## Architecture & Key Patterns

### Multi-Provider AI Architecture

The application uses a **model routing system** that intelligently selects between providers:

- **Gemini**: Primary for image generation (`gemini-3-pro-image-preview`), text/vision tasks, and live audio
- **OpenRouter**: Access to GPT-5.1, GLM 4.6, MiniMax M2 for specialized tasks
- **Replicate**: Image processing operations (upscaling, background removal, restoration)

**Critical File**: `src/services/modelRouter.ts` - Contains the routing logic and model metadata. This is the source of truth for which models handle which operations.

**API Key Management**:

- Keys stored in Supabase per-user (encrypted) via `src/services/apiKeyStorage.ts`
- Fallback to localStorage for backward compatibility
- Migration logic runs on app mount (`App.tsx:244-248`)

### Context Architecture

Three main React contexts manage global state:

1. **AIContext** (`src/context/AIContext.tsx`)
   - Model selection and routing
   - Performance metrics tracking
   - Tool chain orchestration
   - Brand profile management
   - Edit history for multi-turn editing

2. **CanvasContext** (`src/context/CanvasContext.tsx`)
   - Canvas state (background image, reference images, canvas objects)
   - Shared between Studio and other tabs

3. **AuthContext** (`src/context/AuthContext.tsx`)
   - Supabase authentication
   - User session management

**Pattern**: All three contexts wrap the app in `App.tsx:629-639`. Components access via hooks (`useAI()`, `useCanvas()`, `useAuth()`).

### Live Voice Agent System

**Two Providers Supported**:

- **Gemini Live** (`src/services/liveClient.ts`) - WebSocket-based audio streaming
- **OpenAI Realtime** (`src/services/openaiRealtimeClient.ts`) - WebRTC audio streaming

**Action Execution Flow**:

1. User speaks → Voice provider transcribes + generates tool calls
2. `ActionExecutor` (`src/services/actionExecutor.ts`) executes tool calls in **preview mode**
3. Pending action shown in `LiveActionPanel` for user approval
4. User approves → Action applied to canvas

**Tool Call Format**:

```typescript
interface ToolCall {
  name:
    | 'generate_background'
    | 'magic_edit'
    | 'remove_background'
    | 'upscale_image'
    | 'restore_image'
    | 'enhance_face';
  args: Record<string, any>;
}
```

### Image Generation Flow

**Path**: User prompt → `generateImage()` in `src/services/llm.ts` → Model Router → Provider API

**Critical Logic**:

- Reference images (up to 14) can be passed for style matching
- Size options: '1K' (1024x1024), '2K' (2048x2048), '4K' (4096x4096)
- Automatic fallback if Gemini 3 Pro unavailable (checks model availability and downgrades to 2.5 Flash)
- Results saved to Supabase Storage + PostgreSQL database

**Multi-Turn Editing**:

- Edit history stored in `AIContext.editHistory`
- Each turn includes: prompt, input image, output image, timestamp, reference images
- Enables AI to "remember" previous edits when making iterative changes

### Replicate Integration

See [REPLICATE_MODELS.md](./REPLICATE_MODELS.md) for comprehensive documentation on:
- Available models and features
- Pricing and cost optimization
- API usage examples
- Troubleshooting guide

**Current Implementation**:
- ReplicateService class with polling mechanism (`src/services/replicate.ts`)
- 4 core features: upscale, removeBg, restore, faceEnhance
- 3 quality tiers for upscaling: fast (Real-ESRGAN), balanced (Recraft Clarity), best (Magic Refiner)
- API key stored per-user in Supabase (`user_api_keys` table)
- Error handling with actionable messages and links to documentation
- Progress tracking with callback support
- Integrated with ImageToolsPanel UI and ActionExecutor for voice commands

**Key Files**:
- `src/services/replicate.ts` - Service implementation
- `src/components/features/ImageToolsPanel.tsx` - UI component with API key check
- `src/constants.ts` - Model version hashes and configurations
- `src/services/modelRouter.ts` - Model metadata (cost, speed, quality scores)

**Why Replicate for Enhancement vs OpenRouter for Generation?**
- OpenRouter: ~$0.02-0.05 per image (Nano Banana Pro) - better for image generation
- Replicate: $0.134-0.24 per image - expensive for generation but excellent for specialized enhancement
- Replicate offers industry-leading upscaling and restoration models not available elsewhere

### Database Schema (Supabase)

**Key Tables**:

- `users` - User profiles, onboarding status, subscription tier
- `designs` - Saved canvas states (JSON), metadata, public/private flag
- `generated_images` - AI-generated images with prompts, models used, metadata
- `brand_profiles` - Extracted brand colors, fonts, style keywords per user
- `reference_images` - User-uploaded reference library
- `usage_metrics` - Performance tracking (cost, response time, success rate)

**Row Level Security (RLS)**: Enabled on all tables. Users can only access their own data via `auth.uid()` policies.

**Storage Buckets**:

- `generated-images` - AI outputs
- `reference-images` - User uploads
- `design-exports` - Canvas exports

### Services Layer

**Pattern**: All external API calls go through service modules in `src/services/`:

- `llm.ts` - Main orchestrator for all AI operations (image gen, edit, upscale, etc.)
- `gemini.ts` - DEPRECATED (now re-exports from llm.ts)
- `openrouter.ts` - OpenRouter API client
- `replicate.ts` - Replicate API client with polling logic (see [REPLICATE_MODELS.md](./REPLICATE_MODELS.md) for details)
- `modelRouter.ts` - Model selection and routing
- `brandEngine.ts` - Brand extraction and consistency checking
- `actionExecutor.ts` - Voice agent tool call execution
- `database.ts` - Supabase PostgreSQL operations
- `storage.ts` - Supabase Storage operations
- `auth.ts` - Supabase authentication
- `apiKeyStorage.ts` - API key management (Supabase + localStorage)

**Error Handling**: `src/utils/errorHandler.ts` provides retry logic, timeout handling, error classification, and user-friendly messages.

## Component Structure

### Tab System

Three main tabs (`src/constants.ts:Tab` enum):

- **STUDIO**: Canvas editor + generative sidebar
- **GALLERY**: Saved designs browser
- **BRAINSTORM**: Chat interface for prompt ideation

**Navigation**: Controlled in `App.tsx` via `activeTab` state.

### Key Components

- `CanvasEditor` (`src/components/features/CanvasEditor.tsx`) - Main canvas with safe zones, layers
- `GenerativeSidebar` (`src/components/features/GenerativeSidebar.tsx`) - Generation/editing controls
- `ChatInterface` (`src/components/ChatInterface.tsx`) - Brainstorming tab UI
- `LiveActionPanel` (`src/components/features/LiveActionPanel.tsx`) - Voice agent action approval
- `SettingsModal` (`src/components/features/SettingsModal.tsx`) - API keys, model selection, preferences

**Accessibility**: `ScreenReaderAnnouncer` component provides ARIA live regions for screen reader announcements.

## Configuration Files

### TypeScript

- Path aliases: `@/*` → `./src/*` (configured in `tsconfig.json:23-26`)
- React JSX: `react-jsx` transform (line 22)
- Experimental decorators enabled for future features (line 4)

### Vite

- Dev server: Port 5173, HMR enabled
- **Replicate Proxy**: `/api/replicate` proxied to `https://api.replicate.com` with token injection (lines 15-47)
  - Handles `x-replicate-token` header → `Authorization: Token` conversion
  - Critical for CORS bypass during development
- Test config embedded (no separate vitest.config.ts)

### ESLint

- TypeScript + React rules
- Max warnings: 0 (strict mode)
- Plugins: `@typescript-eslint`, `react`, `react-hooks`, `react-refresh`

## Environment Variables

**Required**:

- `VITE_SUPABASE_URL` - Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Supabase anonymous key

**Optional** (users can provide in Settings):

- `VITE_GEMINI_API_KEY`
- `VITE_OPENROUTER_API_KEY`
- `VITE_REPLICATE_API_KEY`
- `VITE_OPENAI_API_KEY`

**Deployment Modes**:

1. **User-Hosted**: Users provide their own API keys
2. **Pilot Mode**: Admin keys in .env for shared usage (Careersy Community)

## Common Development Patterns

### Adding a New AI Tool

1. Define tool in `ActionExecutor` (`src/services/actionExecutor.ts`)
2. Add corresponding function in `llm.ts` if calling external API
3. Update voice provider's tool definitions (`liveClient.ts` or `openaiRealtimeClient.ts`)
4. Add UI controls in `GenerativeSidebar` or `LiveActionPanel`

### Adding a New Model

1. Add model metadata to `src/services/modelRouter.ts` → `getModelMetadata()`
2. Update `MODELS` constant in `src/constants.ts`
3. Update `selectModelForTask()` routing logic if auto-selection needed
4. Add provider-specific call logic in `llm.ts`

### Working with Canvas

**Canvas Library**: Fabric.js (not directly imported, accessed via refs)

**State Management**:

- Background image: `CanvasContext.bgImage` (string URL or data URI)
- Canvas objects: Managed in `CanvasEditor` component state
- Reference images: `CanvasContext.refImages` (array of strings)

**Saving**: Canvas state serialized to JSON and stored in `designs` table.

### Database Operations

**Pattern**: Always use service functions from `database.ts`, never raw Supabase calls.

**Example**:

```typescript
import { createDesign, getUserDesigns } from '@/services/database';

// Create new design
const design = await createDesign({
  name: 'My Banner',
  canvas_data: canvasJSON,
  thumbnail_url: thumbnailDataUri,
  is_public: false,
});

// Fetch user designs
const designs = await getUserDesigns();
```

## Testing Strategy

- Test files: `*.test.ts` or `*.test.tsx`
- Setup: `src/setupTests.ts` (imports `@testing-library/jest-dom`)
- Run via Vitest with jsdom environment

**Key Test**: `src/services/llm.test.ts` - Tests model routing and fallback logic.

## Debugging Tips

### Logging Patterns

Services use tagged console logs:

```typescript
console.log('[ServiceName] Message', data);
console.error('[ServiceName] Error:', error);
```

Examples: `[Live]`, `[Replicate]`, `[App]`, `[ActionExecutor]`

### Common Issues

1. **"API key not found"**: Check `apiKeyStorage.ts` migration and Supabase `user_preferences.api_keys` column
2. **Replicate proxy fails**: Verify `x-replicate-token` header in request (see `vite.config.ts:24-44`)
3. **Canvas not saving**: Ensure user is authenticated and RLS policies are correct
4. **Voice not working**: Check microphone permissions and browser compatibility (Chrome/Edge recommended)

## Code Style Conventions

- **Function naming**: camelCase for functions, PascalCase for components
- **File naming**: PascalCase for components (`CanvasEditor.tsx`), camelCase for utilities (`errorHandler.ts`)
- **Imports**: Absolute imports using `@/` alias preferred
- **Types**: Import from `@/types/*` (split across `ai.ts`, `database.ts`, `index.ts`)
- **Comments**: Use `//` for inline, `/** */` for function documentation
- **Async**: Always use async/await, never raw Promises

## Security Considerations

- **API Keys**: Never log or expose full keys. Only log presence (`!!key`)
- **RLS**: All database operations automatically filtered by `auth.uid()`
- **CORS**: Replicate proxy handles CORS, don't bypass security elsewhere
- **User Input**: Sanitize before sending to AI APIs (checked in `llm.ts`)

## Performance Optimizations

- **Lazy Loading**: Components and services dynamically imported where possible
- **Caching**: Model selections cached in localStorage via `modelRouter.ts`
- **Polling**: Replicate uses exponential backoff (see `replicate.ts`)
- **Metrics**: Performance tracked in `AIContext.performanceMetrics` for monitoring

## Future Features (Not Yet Implemented)

- A/B Testing Panel (`ABTestingPanel.tsx` - UI exists, logic incomplete)
- Tool Chain Builder automation (`ToolChainBuilder.tsx` - UI exists, execution incomplete)
- Analytics integration (hooks present, not wired)
