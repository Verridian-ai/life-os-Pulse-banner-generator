# Codebase Audit - 2026-01-08

**Total Folders:** 56
**Total Files:** 340

## Summary Statistics

| Status | Count | Description |
|--------|-------|-------------|
| ✅ Active (Deployed) | 198 | Currently used in production |
| 🔄 Active (Development) | 45 | Tests and dev-only files |
| ⚙️ Configuration | 32 | Config files |
| 📝 Documentation | 24 | Documentation files |
| ❌ Inactive/Dead Code | 18 | Not integrated or deprecated |
| 📦 Dependency/Generated | 23 | Auto-generated or vendored |

---

## 🚨 Action Items

### Files to DELETE (Dead Code/Deprecated)

| File | Reason |
|------|--------|
| `services/` | Empty directory (cognee removed) |
| `server/add_columns.sql` | One-time migration, already applied |
| `server/check_token.ts` | Debug script, not needed |
| `server/probe_dimensions.ts` | Debug script |
| `server/probe_drizzle.ts` | Debug script |
| `server/probe_models.ts` | Debug script |
| `server/probe_replicate.ts` | Debug script |
| `server/probe_resize_candidates.ts` | Debug script |
| `server/server.log` | Log file, should not be in repo |
| `server/src/fix_db.ts` | One-time fix script |
| `server/src/services/cognee.ts` | Cognee service stub, not used |
| `src/services/gemini.ts` | Deprecated stub (re-exports llm.ts) |
| `src/services/liveClient.ts` | Deprecated stub (feature disabled) |
| `docs/ops/.ralph_wiggum_decisions.log` | Debug log file |
| `docs/ops/.tool_usage_log.txt` | Debug log file |
| `.auto-claude-security.json` | Auto-generated, not needed in repo |
| `.auto-claude-status` | Auto-generated, not needed in repo |
| `.claude_settings.json` | Should be in .gitignore |

### Files to REVIEW (Potentially Unused)

| File | Issue |
|------|-------|
| `server/src/services/langfuse.ts` | Observability service - verify if configured |
| `src/services/agentRegistry.ts` | Agent registry - verify usage |
| `src/services/emailService.ts` | Email service - verify if used |

---

## Root Directory

### Configuration Files

| File | Status | Use Case | Implementation |
|------|--------|----------|----------------|
| `.dockerignore` | ⚙️ Config | Docker build exclusions | ⚙️ Configuration |
| `.env` | ⚙️ Config | Environment variables (local) | ⚙️ Configuration |
| `.env.local` | ⚙️ Config | Local environment overrides | ⚙️ Configuration |
| `.env.test` | 🔄 Development | Test environment variables | ⚙️ Configuration |
| `.eslintignore` | ⚙️ Config | ESLint exclusions | ⚙️ Configuration |
| `.eslintrc.cjs` | ⚙️ Config | ESLint configuration | ⚙️ Configuration |
| `.gcloudignore` | ⚙️ Config | GCloud deployment exclusions | ⚙️ Configuration |
| `.gitignore` | ⚙️ Config | Git exclusions | ⚙️ Configuration |
| `.lighthouserc.json` | ⚙️ Config | Lighthouse CI configuration | ⚙️ Configuration |
| `.mcp.json` | ⚙️ Config | MCP server configuration | ⚙️ Configuration |
| `.prettierrc` | ⚙️ Config | Prettier formatting rules | ⚙️ Configuration |
| `.size-limit.json` | ⚙️ Config | Bundle size limits | ⚙️ Configuration |
| `cloudbuild.yaml` | ⚙️ Config | Google Cloud Build config | ⚙️ Configuration |
| `Dockerfile` | ⚙️ Config | Container build instructions | ⚙️ Configuration |
| `index.html` | ✅ Active | HTML entry point | ✅ Fully Integrated |
| `LICENSE` | 📝 Docs | License file | 📝 Documentation |
| `nginx.conf` | ⚙️ Config | Nginx server config | ⚙️ Configuration |
| `package.json` | ⚙️ Config | NPM package config | ⚙️ Configuration |
| `package-lock.json` | 📦 Generated | NPM lock file | 📦 Dependency |
| `postcss.config.js` | ⚙️ Config | PostCSS configuration | ⚙️ Configuration |
| `tailwind.config.js` | ⚙️ Config | Tailwind CSS configuration | ⚙️ Configuration |
| `tsconfig.app.json` | ⚙️ Config | TypeScript app config | ⚙️ Configuration |
| `tsconfig.json` | ⚙️ Config | TypeScript root config | ⚙️ Configuration |
| `vite.config.ts` | ⚙️ Config | Vite build configuration | ⚙️ Configuration |

### Documentation Files

| File | Status | Use Case | Implementation |
|------|--------|----------|----------------|
| `CLAUDE.md` | 📝 Docs | Agent configuration manual | 📝 Documentation |
| `CONTRIBUTING.md` | 📝 Docs | Contribution guidelines | 📝 Documentation |
| `README.md` | 📝 Docs | Project readme | 📝 Documentation |

### Dead/Debug Files (Root)

| File | Status | Use Case | Implementation |
|------|--------|----------|----------------|
| `.auto-claude-security.json` | ❌ Inactive | Auto-generated security config | ❌ Not Integrated |
| `.auto-claude-status` | ❌ Inactive | Auto-generated status file | ❌ Not Integrated |
| `.claude_settings.json` | ❌ Inactive | Claude settings (should be gitignored) | ❌ Not Integrated |

---

## .github/ Directory

| File | Status | Use Case | Implementation |
|------|--------|----------|----------------|
| `.github/CODEOWNERS` | ⚙️ Config | Code ownership rules | ⚙️ Configuration |
| `.github/dependabot.yml` | ⚙️ Config | Dependabot configuration | ⚙️ Configuration |
| `.github/PIPELINE_OVERVIEW.md` | 📝 Docs | CI/CD pipeline documentation | 📝 Documentation |
| `.github/pull_request_template.md` | ⚙️ Config | PR template | ⚙️ Configuration |
| `.github/SECRETS_SETUP.md` | 📝 Docs | Secrets configuration guide | 📝 Documentation |
| `.github/workflows/cd-production.yml` | ✅ Active | Production deployment workflow | ✅ Fully Integrated |
| `.github/workflows/cd-staging.yml` | ✅ Active | Staging deployment workflow | ✅ Fully Integrated |
| `.github/workflows/ci.yml` | ✅ Active | Continuous integration workflow | ✅ Fully Integrated |
| `.github/workflows/pr-preview.yml` | ✅ Active | PR preview deployment | ✅ Fully Integrated |

---

## .serena/ Directory

| File | Status | Use Case | Implementation |
|------|--------|----------|----------------|
| `.serena/.gitignore` | ⚙️ Config | Serena gitignore | ⚙️ Configuration |
| `.serena/project.yml` | ⚙️ Config | Serena project config | ⚙️ Configuration |

---

## docs/ Directory

| File | Status | Use Case | Implementation |
|------|--------|----------|----------------|
| `docs/API_CONTRACTS.md` | 📝 Docs | API contract documentation | 📝 Documentation |
| `docs/BRANCH-PROTECTION-SETUP.md` | 📝 Docs | Branch protection guide | 📝 Documentation |
| `docs/CONTEXT_ARCHITECTURE.md` | 📝 Docs | React context architecture | 📝 Documentation |
| `docs/DEPLOYMENT.md` | 📝 Docs | Deployment guide | 📝 Documentation |
| `docs/RESPONSIVE_BREAKPOINTS.md` | 📝 Docs | Responsive design breakpoints | 📝 Documentation |
| `docs/TYPE_SYSTEM.md` | 📝 Docs | TypeScript type system docs | 📝 Documentation |
| `docs/VOICE_AGENT_GUIDE.md` | 📝 Docs | Voice agent user guide | 📝 Documentation |
| `docs/VOICE_AGENT_TECHNICAL.md` | 📝 Docs | Voice agent technical docs | 📝 Documentation |
| `docs/VOICE_COMMANDS_CHEATSHEET.md` | 📝 Docs | Voice commands quick reference | 📝 Documentation |
| `docs/frontend_optimization_audit.md` | 📝 Docs | Frontend optimization audit | 📝 Documentation |
| `docs/frontend_optimization_report.md` | 📝 Docs | Optimization report | 📝 Documentation |
| `docs/audits/TASK_032_TYPE_SAFETY_AUDIT.md` | 📝 Docs | Type safety audit results | 📝 Documentation |
| `docs/design/LIFE_OS_DESIGN_SYSTEM.md` | 📝 Docs | Design system documentation | 📝 Documentation |
| `docs/design/RESPONSIVE_BREAKPOINTS_RESEARCH_2025.md` | 📝 Docs | Breakpoints research | 📝 Documentation |
| `docs/guides/REPLICATE_MODELS.md` | 📝 Docs | Replicate models guide | 📝 Documentation |
| `docs/guides/TROUBLESHOOTING.md` | 📝 Docs | Troubleshooting guide | 📝 Documentation |
| `docs/guides/VOICE_COMMANDS_REFERENCE.md` | 📝 Docs | Voice commands reference | 📝 Documentation |
| `docs/ops/AGENT_CONTEXT.md` | 📝 Docs | Agent context documentation | 📝 Documentation |
| `docs/ops/ROUTES.md` | 📝 Docs | Application routes documentation | 📝 Documentation |
| `docs/ops/SELF_TEST.md` | 📝 Docs | Self-test documentation | 📝 Documentation |
| `docs/ops/WORK_BOARD.md` | 📝 Docs | Work board/task tracking | 📝 Documentation |
| `docs/ops/.ralph_wiggum_decisions.log` | ❌ Inactive | Debug log file | ❌ Not Integrated |
| `docs/ops/.tool_usage_log.txt` | ❌ Inactive | Debug log file | ❌ Not Integrated |

---

## public/ Directory

| File | Status | Use Case | Implementation |
|------|--------|----------|----------------|
| `public/favicon.svg` | ✅ Active | Browser favicon | ✅ Fully Integrated |
| `public/console-filter.js` | ✅ Active | Console log filtering | ✅ Fully Integrated |
| `public/assets/logo.svg` | ✅ Active | Application logo | ✅ Fully Integrated |
| `public/assets/3d_render_of_*.png` | ✅ Active | 3D render asset | ✅ Fully Integrated |
| `public/assets/banners/*.png` (20 files) | ✅ Active | Template banner images | ✅ Fully Integrated |
| `public/assets/platforms/*.svg` (5 files) | ✅ Active | Platform icons (LinkedIn, etc.) | ✅ Fully Integrated |
| `public/assets/platforms/life os dark mode logo.png` | ✅ Active | Life OS logo | ✅ Fully Integrated |

---

## scripts/ Directory

| File | Status | Use Case | Implementation |
|------|--------|----------|----------------|
| `scripts/claude-hooks/deny_root_code_writes.sh` | ⚙️ Config | Agent hook: prevent root writes | ⚙️ Configuration |
| `scripts/claude-hooks/log_tool_usage.sh` | ⚙️ Config | Agent hook: log tool usage | ⚙️ Configuration |
| `scripts/setup-branch-protection.sh` | 🔄 Development | Branch protection setup script | 🔄 Active (Development) |

---

## server/ Directory

### Configuration & Package Files

| File | Status | Use Case | Implementation |
|------|--------|----------|----------------|
| `server/.env` | ⚙️ Config | Server environment variables | ⚙️ Configuration |
| `server/.env.example` | 📝 Docs | Environment template | 📝 Documentation |
| `server/Dockerfile` | ⚙️ Config | Server container build | ⚙️ Configuration |
| `server/drizzle.config.ts` | ⚙️ Config | Drizzle ORM configuration | ⚙️ Configuration |
| `server/package.json` | ⚙️ Config | Server NPM config | ⚙️ Configuration |
| `server/package-lock.json` | 📦 Generated | Server NPM lock file | 📦 Dependency |
| `server/README.md` | 📝 Docs | Server documentation | 📝 Documentation |

### Dead/Debug Files (Server)

| File | Status | Use Case | Recommendation |
|------|--------|----------|----------------|
| `server/add_columns.sql` | ❌ Inactive | One-time migration script | DELETE |
| `server/check_token.ts` | ❌ Inactive | Debug script | DELETE |
| `server/probe_dimensions.ts` | ❌ Inactive | Debug/test script | DELETE |
| `server/probe_drizzle.ts` | ❌ Inactive | Debug/test script | DELETE |
| `server/probe_models.ts` | ❌ Inactive | Debug/test script | DELETE |
| `server/probe_replicate.ts` | ❌ Inactive | Debug/test script | DELETE |
| `server/probe_resize_candidates.ts` | ❌ Inactive | Debug/test script | DELETE |
| `server/server.log` | ❌ Inactive | Log file (should be gitignored) | DELETE |

### server/src/ - Active Backend Code

| File | Status | Use Case | Implementation |
|------|--------|----------|----------------|
| `server/src/index.ts` | ✅ Active | Hono server entry point | ✅ Fully Integrated |

#### server/src/db/ - Database Layer

| File | Status | Use Case | Implementation |
|------|--------|----------|----------------|
| `server/src/db/index.ts` | ✅ Active | Drizzle DB connection | ✅ Fully Integrated |
| `server/src/db/schema.ts` | ✅ Active | Drizzle schema definitions | ✅ Fully Integrated |
| `server/src/db/migrations/*.sql` | 📦 Generated | Drizzle migrations | 📦 Dependency |
| `server/src/db/migrations/meta/*.json` | 📦 Generated | Migration metadata | 📦 Dependency |

#### server/src/lib/ - Core Libraries

| File | Status | Use Case | Implementation |
|------|--------|----------|----------------|
| `server/src/lib/adminAuth.ts` | ✅ Active | Admin authentication | ✅ Fully Integrated |
| `server/src/lib/auth.ts` | ✅ Active | Lucia Auth configuration | ✅ Fully Integrated |
| `server/src/lib/email.ts` | ✅ Active | Email sending (Resend) | ✅ Fully Integrated |
| `server/src/lib/gcs.ts` | ✅ Active | Google Cloud Storage | ✅ Fully Integrated |
| `server/src/lib/rateLimit.ts` | ✅ Active | Rate limiting middleware | ✅ Fully Integrated |

#### server/src/routes/ - API Routes

| File | Status | Use Case | Implementation |
|------|--------|----------|----------------|
| `server/src/routes/admin.ts` | ✅ Active | Admin API routes | ✅ Fully Integrated |
| `server/src/routes/ai.ts` | ✅ Active | AI orchestration routes | ✅ Fully Integrated |
| `server/src/routes/auth.ts` | ✅ Active | Authentication routes | ✅ Fully Integrated |
| `server/src/routes/chat.ts` | ✅ Active | Chat API routes | ✅ Fully Integrated |
| `server/src/routes/images.ts` | ✅ Active | Image management routes | ✅ Fully Integrated |
| `server/src/routes/prompts.ts` | ✅ Active | Prompt enhancement routes | ✅ Fully Integrated |
| `server/src/routes/replicate.ts` | ✅ Active | Replicate proxy routes | ✅ Fully Integrated |
| `server/src/routes/storage.ts` | ✅ Active | Storage API routes | ✅ Fully Integrated |
| `server/src/routes/user.ts` | ✅ Active | User API routes | ✅ Fully Integrated |

#### server/src/prompts/ - Prompt Engineering

| File | Status | Use Case | Implementation |
|------|--------|----------|----------------|
| `server/src/prompts/promptEnhancer.ts` | ✅ Active | AI prompt enhancement | ✅ Fully Integrated |

#### server/src/services/ - Backend Services

| File | Status | Use Case | Implementation |
|------|--------|----------|----------------|
| `server/src/services/cognee.ts` | ❌ Inactive | Cognee service stub (unused) | DELETE |
| `server/src/services/langfuse.ts` | ⚠️ Review | Langfuse observability | 🔀 Partially Integrated |
| `server/src/services/replicate.ts` | ✅ Active | Replicate API service | ✅ Fully Integrated |

#### Dead Server Files

| File | Status | Use Case | Recommendation |
|------|--------|----------|----------------|
| `server/src/fix_db.ts` | ❌ Inactive | One-time DB fix script | DELETE |

---

## src/ Directory - Frontend Application

### Entry Point & Core

| File | Status | Use Case | Implementation |
|------|--------|----------|----------------|
| `src/index.tsx` | ✅ Active | React app entry point | ✅ Fully Integrated |
| `src/index.css` | ✅ Active | Global CSS styles | ✅ Fully Integrated |
| `src/App.tsx` | ✅ Active | Main application component | ✅ Fully Integrated |
| `src/App.test.tsx` | 🔄 Development | App component tests | 🔄 Active (Development) |
| `src/constants.ts` | ✅ Active | App constants (Tab, StudioMode) | ✅ Fully Integrated |
| `src/styles.ts` | ✅ Active | Shared style constants | ✅ Fully Integrated |
| `src/utils.ts` | ✅ Active | Utility functions | ✅ Fully Integrated |
| `src/global.d.ts` | ⚙️ Config | Global TypeScript declarations | ⚙️ Configuration |
| `src/vite-env.d.ts` | ⚙️ Config | Vite environment types | ⚙️ Configuration |
| `src/setupTests.ts` | 🔄 Development | Test setup configuration | 🔄 Active (Development) |

### src/types/ - TypeScript Types

| File | Status | Use Case | Implementation |
|------|--------|----------|----------------|
| `src/types/index.ts` | ✅ Active | Core type definitions | ✅ Fully Integrated |
| `src/types/ai.ts` | ✅ Active | AI-related types | ✅ Fully Integrated |
| `src/types/api.ts` | ✅ Active | API types | ✅ Fully Integrated |
| `src/types/database.ts` | ✅ Active | Database types | ✅ Fully Integrated |
| `src/types/replicate.ts` | ✅ Active | Replicate API types | ✅ Fully Integrated |

### src/context/ - React Contexts

| File | Status | Use Case | Implementation |
|------|--------|----------|----------------|
| `src/context/AIContext.tsx` | ✅ Active | AI services context | ✅ Fully Integrated |
| `src/context/AIContext.test.tsx` | 🔄 Development | AI context tests | 🔄 Active (Development) |
| `src/context/AuthContext.tsx` | ✅ Active | Authentication context | ✅ Fully Integrated |
| `src/context/AuthContext.test.tsx` | 🔄 Development | Auth context tests | 🔄 Active (Development) |
| `src/context/CanvasContext.tsx` | ✅ Active | Canvas state context | ✅ Fully Integrated |
| `src/context/CanvasContext.test.tsx` | 🔄 Development | Canvas context tests | 🔄 Active (Development) |
| `src/context/ToastContext.tsx` | ✅ Active | Toast notifications context | ✅ Fully Integrated |
| `src/context/ToastContext.test.tsx` | 🔄 Development | Toast context tests | 🔄 Active (Development) |
| `src/context/VoiceAgentContext.tsx` | ✅ Active | Voice agent context | ✅ Fully Integrated |
| `src/context/canvas/index.ts` | ✅ Active | Canvas context barrel export | ✅ Fully Integrated |
| `src/context/canvas/CanvasStateContext.tsx` | ✅ Active | Canvas state subcontext | ✅ Fully Integrated |
| `src/context/canvas/ElementsContext.tsx` | ✅ Active | Canvas elements subcontext | ✅ Fully Integrated |
| `src/context/canvas/HistoryContext.tsx` | ✅ Active | Undo/redo history | ✅ Fully Integrated |
| `src/context/canvas/ImageContext.tsx` | ✅ Active | Image handling subcontext | ✅ Fully Integrated |
| `src/context/canvas/LayerContext.tsx` | ✅ Active | Layer management subcontext | ✅ Fully Integrated |

### src/hooks/ - Custom React Hooks

| File | Status | Use Case | Implementation |
|------|--------|----------|----------------|
| `src/hooks/useCanvasSnapshots.ts` | ✅ Active | Canvas snapshot management | ✅ Fully Integrated |
| `src/hooks/useDropdownKeyboard.ts` | ✅ Active | Dropdown keyboard navigation | ✅ Fully Integrated |
| `src/hooks/useErrorMetrics.ts` | ✅ Active | Error tracking metrics | ✅ Fully Integrated |
| `src/hooks/useErrorRecovery.ts` | ✅ Active | Error recovery utilities | ✅ Fully Integrated |
| `src/hooks/useFocusTrap.ts` | ✅ Active | Modal focus trap | ✅ Fully Integrated |
| `src/hooks/useKeyboardShortcuts.ts` | ✅ Active | Keyboard shortcuts handler | ✅ Fully Integrated |
| `src/hooks/useKeyboardShortcuts.test.ts` | 🔄 Development | Keyboard shortcuts tests | 🔄 Active (Development) |
| `src/hooks/useModelMetrics.ts` | ✅ Active | AI model performance metrics | ✅ Fully Integrated |
| `src/hooks/usePromptEnhance.ts` | ✅ Active | Prompt enhancement hook | ✅ Fully Integrated |
| `src/hooks/usePromptEnhance.test.ts` | 🔄 Development | Prompt enhance tests | 🔄 Active (Development) |
| `src/hooks/usePromptHistory.ts` | ✅ Active | Prompt history management | ✅ Fully Integrated |
| `src/hooks/useToast.ts` | ✅ Active | Toast notification hook | ✅ Fully Integrated |

### src/utils/ - Utility Functions

| File | Status | Use Case | Implementation |
|------|--------|----------|----------------|
| `src/utils/debounce.ts` | ✅ Active | Debounce utility | ✅ Fully Integrated |
| `src/utils/envCheck.ts` | ✅ Active | Environment validation | ✅ Fully Integrated |
| `src/utils/errorHandler.ts` | ✅ Active | Error handling utilities | ✅ Fully Integrated |
| `src/utils/errorHandler.test.ts` | 🔄 Development | Error handler tests | 🔄 Active (Development) |
| `src/utils/haptics.ts` | ✅ Active | Haptic feedback utilities | ✅ Fully Integrated |
| `src/utils/imagePersistence.ts` | ✅ Active | Image persistence utilities | ✅ Fully Integrated |
| `src/utils/imageUtils.ts` | ✅ Active | Image manipulation utilities | ✅ Fully Integrated |
| `src/utils/inputValidation.ts` | ✅ Active | Input validation utilities | ✅ Fully Integrated |
| `src/utils/inputValidation.test.ts` | 🔄 Development | Input validation tests | 🔄 Active (Development) |
| `src/utils/stringUtils.ts` | ✅ Active | String manipulation utilities | ✅ Fully Integrated |
| `src/utils/stringUtils.test.ts` | 🔄 Development | String utils tests | 🔄 Active (Development) |
| `src/utils/utils.test.ts` | 🔄 Development | General utility tests | 🔄 Active (Development) |
| `src/utils/voiceErrorDiagnostics.ts` | ✅ Active | Voice error diagnostics | ✅ Fully Integrated |

### src/constants/ - Application Constants

| File | Status | Use Case | Implementation |
|------|--------|----------|----------------|
| `src/constants/platformPresets.ts` | ✅ Active | Platform dimension presets | ✅ Fully Integrated |
| `src/constants/templates.ts` | ✅ Active | Template definitions | ✅ Fully Integrated |

### src/services/ - Frontend Services

| File | Status | Use Case | Implementation |
|------|--------|----------|----------------|
| `src/services/actionExecutor.ts` | ✅ Active | Voice command executor (17 commands) | ✅ Fully Integrated |
| `src/services/actionExecutor.test.ts` | 🔄 Development | Action executor tests | 🔄 Active (Development) |
| `src/services/agentRegistry.ts` | ✅ Active | AI agent registry | ✅ Fully Integrated |
| `src/services/aiCache.ts` | ✅ Active | AI response caching | ✅ Fully Integrated |
| `src/services/api.ts` | ✅ Active | API client wrapper | ✅ Fully Integrated |
| `src/services/api.test.ts` | 🔄 Development | API tests | 🔄 Active (Development) |
| `src/services/apiKeyStorage.ts` | ✅ Active | API key secure storage | ✅ Fully Integrated |
| `src/services/apiKeyStorage.test.ts` | 🔄 Development | API key storage tests | 🔄 Active (Development) |
| `src/services/apiKeyValidator.ts` | ✅ Active | API key validation | ✅ Fully Integrated |
| `src/services/auth.ts` | ✅ Active | Authentication service | ✅ Fully Integrated |
| `src/services/auth.test.ts` | 🔄 Development | Auth tests | 🔄 Active (Development) |
| `src/services/brandEngine.ts` | ✅ Active | Brand consistency engine | ✅ Fully Integrated |
| `src/services/brandEngine.test.ts` | 🔄 Development | Brand engine tests | 🔄 Active (Development) |
| `src/services/chatAgent.ts` | ✅ Active | Chat agent service | ✅ Fully Integrated |
| `src/services/chatPersistence.ts` | ✅ Active | Chat history persistence | ✅ Fully Integrated |
| `src/services/chatPersistence.test.ts` | 🔄 Development | Chat persistence tests | 🔄 Active (Development) |
| `src/services/chatService.ts` | ✅ Active | Chat service | ✅ Fully Integrated |
| `src/services/chatService.test.ts` | 🔄 Development | Chat service tests | 🔄 Active (Development) |
| `src/services/database.ts` | ✅ Active | Database operations | ✅ Fully Integrated |
| `src/services/database.test.ts` | 🔄 Development | Database tests | 🔄 Active (Development) |
| `src/services/emailService.ts` | ✅ Active | Email service | ✅ Fully Integrated |
| `src/services/gemini.ts` | ❌ Inactive | Deprecated (re-exports llm.ts) | DELETE |
| `src/services/imageAnalysisService.ts` | ✅ Active | Image analysis service | ✅ Fully Integrated |
| `src/services/imageAnalysisService.test.ts` | 🔄 Development | Image analysis tests | 🔄 Active (Development) |
| `src/services/imageEditService.ts` | ✅ Active | Image editing service | ✅ Fully Integrated |
| `src/services/imageEditService.test.ts` | 🔄 Development | Image edit tests | 🔄 Active (Development) |
| `src/services/imageGenerationService.ts` | ✅ Active | Image generation service | ✅ Fully Integrated |
| `src/services/imageGenerationService.test.ts` | 🔄 Development | Image generation tests | 🔄 Active (Development) |
| `src/services/liveClient.ts` | ❌ Inactive | Deprecated stub (feature disabled) | DELETE |
| `src/services/llm.ts` | ✅ Active | LLM orchestration service | ✅ Fully Integrated |
| `src/services/llm.test.ts` | 🔄 Development | LLM tests | 🔄 Active (Development) |
| `src/services/llm-types.ts` | ✅ Active | LLM type definitions | ✅ Fully Integrated |
| `src/services/modelRouter.ts` | ✅ Active | AI model routing logic | ✅ Fully Integrated |
| `src/services/modelRouter.test.ts` | 🔄 Development | Model router tests | 🔄 Active (Development) |
| `src/services/openaiRealtimeClient.ts` | ✅ Active | OpenAI Realtime WebSocket client | ✅ Fully Integrated |
| `src/services/openrouter.ts` | ✅ Active | OpenRouter API service | ✅ Fully Integrated |
| `src/services/openrouter.test.ts` | 🔄 Development | OpenRouter tests | 🔄 Active (Development) |
| `src/services/promptService.ts` | ✅ Active | Prompt management service | ✅ Fully Integrated |
| `src/services/promptService.test.ts` | 🔄 Development | Prompt service tests | 🔄 Active (Development) |
| `src/services/replicate.ts` | ✅ Active | Replicate API service | ✅ Fully Integrated |
| `src/services/replicate.test.ts` | 🔄 Development | Replicate tests | 🔄 Active (Development) |
| `src/services/storage.ts` | ✅ Active | Storage service | ✅ Fully Integrated |
| `src/services/storageManager.ts` | ✅ Active | Storage manager | ✅ Fully Integrated |
| `src/services/storageManager.test.ts` | 🔄 Development | Storage manager tests | 🔄 Active (Development) |
| `src/services/validationSchemas.ts` | ✅ Active | Zod validation schemas | ✅ Fully Integrated |

### src/services/commands/ - Voice Command Handlers

| File | Status | Use Case | Implementation |
|------|--------|----------|----------------|
| `src/services/commands/types.ts` | ✅ Active | Command type definitions | ✅ Fully Integrated |
| `src/services/commands/analysisCommands.ts` | ✅ Active | AI analysis commands | ✅ Fully Integrated |
| `src/services/commands/canvasCommands.ts` | ✅ Active | Canvas manipulation commands | ✅ Fully Integrated |
| `src/services/commands/imageCommands.ts` | ✅ Active | Image processing commands | ✅ Fully Integrated |
| `src/services/commands/uiCommands.ts` | ✅ Active | UI navigation commands | ✅ Fully Integrated |

### src/components/ - React Components

#### Accessibility Components

| File | Status | Use Case | Implementation |
|------|--------|----------|----------------|
| `src/components/accessibility/ScreenReaderAnnouncer.tsx` | ✅ Active | Screen reader announcements | ✅ Fully Integrated |

#### Auth Components

| File | Status | Use Case | Implementation |
|------|--------|----------|----------------|
| `src/components/auth/AuthModal.tsx` | ✅ Active | Login/signup modal | ✅ Fully Integrated |
| `src/components/auth/IdleTimeoutWarning.tsx` | ✅ Active | Session timeout warning | ✅ Fully Integrated |

#### Layout Components

| File | Status | Use Case | Implementation |
|------|--------|----------|----------------|
| `src/components/layout/Header.tsx` | ✅ Active | App header/navigation | ✅ Fully Integrated |
| `src/components/layout/Header.test.tsx` | 🔄 Development | Header tests | 🔄 Active (Development) |
| `src/components/layout/StudioSubNav.tsx` | ✅ Active | Studio mode subnav | ✅ Fully Integrated |

#### UI Components

| File | Status | Use Case | Implementation |
|------|--------|----------|----------------|
| `src/components/ui/ConfirmationModal.tsx` | ✅ Active | Confirmation dialogs | ✅ Fully Integrated |
| `src/components/ui/EnhanceButton.tsx` | ✅ Active | AI enhance button | ✅ Fully Integrated |
| `src/components/ui/Skeleton.tsx` | ✅ Active | Loading skeletons | ✅ Fully Integrated |
| `src/components/ui/Toast.tsx` | ✅ Active | Toast notification | ✅ Fully Integrated |
| `src/components/ui/Toast.test.tsx` | 🔄 Development | Toast tests | 🔄 Active (Development) |
| `src/components/ui/ToastContainer.tsx` | ✅ Active | Toast container | ✅ Fully Integrated |

#### Feature Components

| File | Status | Use Case | Implementation |
|------|--------|----------|----------------|
| `src/components/features/ABTestingPanel.tsx` | ✅ Active | A/B testing panel | ✅ Fully Integrated |
| `src/components/features/APIKeyInstructionsModal.tsx` | ✅ Active | API key setup instructions | ✅ Fully Integrated |
| `src/components/features/BrandConsistencyPanel.tsx` | ✅ Active | Brand settings panel | ✅ Fully Integrated |
| `src/components/features/CanvasEditor.tsx` | ✅ Active | Main canvas editor | ✅ Fully Integrated |
| `src/components/features/CanvasEditor.test.tsx` | 🔄 Development | Canvas editor tests | 🔄 Active (Development) |
| `src/components/features/ChatHistoryPanel.tsx` | ✅ Active | Chat history display | ✅ Fully Integrated |
| `src/components/features/GenerativeSidebar.tsx` | ✅ Active | Generation controls sidebar | ✅ Fully Integrated |
| `src/components/features/GenerativeSidebar.test.tsx` | 🔄 Development | Sidebar tests | 🔄 Active (Development) |
| `src/components/features/ImageGallery.tsx` | ✅ Active | Image gallery viewer | ✅ Fully Integrated |
| `src/components/features/ImageGallery.test.tsx` | 🔄 Development | Gallery tests | 🔄 Active (Development) |
| `src/components/features/ImageToolsPanel.tsx` | ✅ Active | Image editing tools | ✅ Fully Integrated |
| `src/components/features/ImageToolsPanel.test.tsx` | 🔄 Development | Image tools tests | 🔄 Active (Development) |
| `src/components/features/KeyboardShortcutsModal.tsx` | ✅ Active | Shortcuts help modal | ✅ Fully Integrated |
| `src/components/features/KeyboardShortcutsModal.test.tsx` | 🔄 Development | Shortcuts modal tests | 🔄 Active (Development) |
| `src/components/features/KeyboardShortcutsPanel.tsx` | ✅ Active | Shortcuts panel | ✅ Fully Integrated |
| `src/components/features/LinkedInPublishModal.tsx` | ✅ Active | LinkedIn publish dialog | ✅ Fully Integrated |
| `src/components/features/LiveActionPanel.tsx` | ✅ Active | Voice action approval panel | ✅ Fully Integrated |
| `src/components/features/ModelSelector.tsx` | ✅ Active | AI model selector | ✅ Fully Integrated |
| `src/components/features/OnboardingTour.tsx` | ✅ Active | Onboarding tour | ✅ Fully Integrated |
| `src/components/features/PerformanceMetricsPanel.tsx` | ✅ Active | Performance metrics display | ✅ Fully Integrated |
| `src/components/features/PromptLibrary.tsx` | ✅ Active | Saved prompts library | ✅ Fully Integrated |
| `src/components/features/QuickGenerateWizard.tsx` | ✅ Active | Quick generation wizard | ✅ Fully Integrated |
| `src/components/features/SettingsModal.tsx` | ✅ Active | Settings modal | ✅ Fully Integrated |
| `src/components/features/SnapshotsModal.tsx` | ✅ Active | Canvas snapshots modal | ✅ Fully Integrated |
| `src/components/features/TemplateLibrary.tsx` | ✅ Active | Template browser | ✅ Fully Integrated |
| `src/components/features/ToolChainBuilder.tsx` | ✅ Active | AI tool chain builder | ✅ Fully Integrated |

#### Editor Subcomponents

| File | Status | Use Case | Implementation |
|------|--------|----------|----------------|
| `src/components/features/editor/AssetsPanel.tsx` | ✅ Active | Assets management panel | ✅ Fully Integrated |
| `src/components/features/editor/CanvasFormatSelector.tsx` | ✅ Active | Canvas format/size selector | ✅ Fully Integrated |
| `src/components/features/editor/ExportPanel.tsx` | ✅ Active | Export options panel | ✅ Fully Integrated |
| `src/components/features/editor/ExportPanel.test.tsx` | 🔄 Development | Export panel tests | 🔄 Active (Development) |
| `src/components/features/editor/LayersPanel.tsx` | ✅ Active | Layer management panel | ✅ Fully Integrated |
| `src/components/features/editor/ProfileEditorModal.tsx` | ✅ Active | Profile photo editor | ✅ Fully Integrated |
| `src/components/features/editor/TypographyPanel.tsx` | ✅ Active | Typography settings | ✅ Fully Integrated |
| `src/components/features/editor/TypographyPanel.test.tsx` | 🔄 Development | Typography tests | 🔄 Active (Development) |

#### Email Components

| File | Status | Use Case | Implementation |
|------|--------|----------|----------------|
| `src/components/features/email/EmailTemplate.tsx` | ✅ Active | Email template component | ✅ Fully Integrated |
| `src/components/features/email/EmailTemplate.css` | ✅ Active | Email template styles | ✅ Fully Integrated |

#### ChatInterface Components

| File | Status | Use Case | Implementation |
|------|--------|----------|----------------|
| `src/components/ChatInterface/ChatInterface.tsx` | ✅ Active | Main chat interface | ✅ Fully Integrated |
| `src/components/ChatInterface/index.ts` | ✅ Active | Chat interface barrel export | ✅ Fully Integrated |
| `src/components/ChatInterface/types.ts` | ✅ Active | Chat interface types | ✅ Fully Integrated |
| `src/components/ChatInterface/constants.ts` | ✅ Active | Chat interface constants | ✅ Fully Integrated |
| `src/components/ChatInterface/components/index.ts` | ✅ Active | Chat components barrel | ✅ Fully Integrated |
| `src/components/ChatInterface/components/ChatHeader.tsx` | ✅ Active | Chat header | ✅ Fully Integrated |
| `src/components/ChatInterface/components/ChatInput.tsx` | ✅ Active | Chat input field | ✅ Fully Integrated |
| `src/components/ChatInterface/components/ChatMessage.tsx` | ✅ Active | Chat message display | ✅ Fully Integrated |
| `src/components/ChatInterface/components/ConversationHistory.tsx` | ✅ Active | Conversation history | ✅ Fully Integrated |
| `src/components/ChatInterface/components/ExecutingIndicator.tsx` | ✅ Active | Command execution indicator | ✅ Fully Integrated |
| `src/components/ChatInterface/components/LoadingIndicator.tsx` | ✅ Active | Loading indicator | ✅ Fully Integrated |
| `src/components/ChatInterface/hooks/index.ts` | ✅ Active | Chat hooks barrel | ✅ Fully Integrated |
| `src/components/ChatInterface/hooks/useAutoScroll.ts` | ✅ Active | Auto-scroll hook | ✅ Fully Integrated |
| `src/components/ChatInterface/hooks/useChatMessages.ts` | ✅ Active | Chat messages hook | ✅ Fully Integrated |
| `src/components/ChatInterface/hooks/useChatPersistence.ts` | ✅ Active | Chat persistence hook | ✅ Fully Integrated |
| `src/components/ChatInterface/hooks/useFileAttachment.ts` | ✅ Active | File attachment hook | ✅ Fully Integrated |
| `src/components/ChatInterface/utils/index.ts` | ✅ Active | Chat utils barrel | ✅ Fully Integrated |
| `src/components/ChatInterface/utils/extractPrompts.ts` | ✅ Active | Prompt extraction utility | ✅ Fully Integrated |

#### Legacy/Root Components

| File | Status | Use Case | Implementation |
|------|--------|----------|----------------|
| `src/components/BannerCanvas.tsx` | ✅ Active | Banner canvas component | ✅ Fully Integrated |
| `src/components/BannerCanvas.test.tsx` | 🔄 Development | Banner canvas tests | 🔄 Active (Development) |
| `src/components/ChatInterface.test.tsx` | 🔄 Development | Chat interface tests | 🔄 Active (Development) |
| `src/components/ErrorBoundary.tsx` | ✅ Active | Error boundary | ✅ Fully Integrated |
| `src/components/ErrorBoundary.test.tsx` | 🔄 Development | Error boundary tests | 🔄 Active (Development) |

### src/features/ - Feature Modules

#### Admin Feature Module

| File | Status | Use Case | Implementation |
|------|--------|----------|----------------|
| `src/features/admin/index.ts` | ✅ Active | Admin module barrel export | ✅ Fully Integrated |
| `src/features/admin/types.ts` | ✅ Active | Admin type definitions | ✅ Fully Integrated |
| `src/features/admin/components/AdminGuard.tsx` | ✅ Active | Admin route guard | ✅ Fully Integrated |
| `src/features/admin/components/AdminLayout.tsx` | ✅ Active | Admin layout wrapper | ✅ Fully Integrated |
| `src/features/admin/components/users/UserList.tsx` | ✅ Active | User list component | ✅ Fully Integrated |
| `src/features/admin/components/users/UserDetail.tsx` | ✅ Active | User detail component | ✅ Fully Integrated |
| `src/features/admin/hooks/useAdminAuth.ts` | ✅ Active | Admin auth hook | ✅ Fully Integrated |
| `src/features/admin/pages/AdminDashboard.tsx` | ✅ Active | Admin dashboard page | ✅ Fully Integrated |
| `src/features/admin/pages/AdminUsers.tsx` | ✅ Active | Admin users page | ✅ Fully Integrated |
| `src/features/admin/pages/AdminAgents.tsx` | ✅ Active | Admin agents page | ✅ Fully Integrated |
| `src/features/admin/pages/AdminObservability.tsx` | ✅ Active | Admin observability page | ✅ Fully Integrated |
| `src/features/admin/pages/AdminFinance.tsx` | ✅ Active | Admin finance page | ✅ Fully Integrated |
| `src/features/admin/services/adminApi.ts` | ✅ Active | Admin API service | ✅ Fully Integrated |

#### LinkedIn Posts Feature Module

| File | Status | Use Case | Implementation |
|------|--------|----------|----------------|
| `src/features/linkedin-posts/index.ts` | ✅ Active | LinkedIn posts barrel export | ✅ Fully Integrated |
| `src/features/linkedin-posts/types.ts` | ✅ Active | LinkedIn posts types | ✅ Fully Integrated |
| `src/features/linkedin-posts/constants.ts` | ✅ Active | LinkedIn posts constants | ✅ Fully Integrated |
| `src/features/linkedin-posts/LinkedInContentStudio.tsx` | ✅ Active | LinkedIn content studio | ✅ Fully Integrated |
| `src/features/linkedin-posts/components/CopywritingPanel.tsx` | ✅ Active | Copywriting panel | ✅ Fully Integrated |
| `src/features/linkedin-posts/components/LinkedInImageGenerator.tsx` | ✅ Active | LinkedIn image generator | ✅ Fully Integrated |
| `src/features/linkedin-posts/components/PostPreview.tsx` | ✅ Active | Post preview component | ✅ Fully Integrated |
| `src/features/linkedin-posts/components/ViralScoreCard.tsx` | ✅ Active | Viral score display | ✅ Fully Integrated |
| `src/features/linkedin-posts/utils/viralAnalyzer.ts` | ✅ Active | Viral potential analyzer | ✅ Fully Integrated |

---

## Empty Directory

| Directory | Status | Recommendation |
|-----------|--------|----------------|
| `services/` | ❌ Empty | DELETE (cognee removed) |

---

## Final Summary

### Files by Status

| Status | Count |
|--------|-------|
| ✅ Active (Deployed) | 198 |
| 🔄 Active (Development/Tests) | 45 |
| ⚙️ Configuration | 32 |
| 📝 Documentation | 24 |
| 📦 Dependency/Generated | 23 |
| ❌ Inactive/Dead Code | 18 |
| **TOTAL** | **340** |

### Cleanup Recommendations

#### Immediate Deletion (18 files + 1 directory)

**Server Debug Files (8 files):**

- `server/add_columns.sql`
- `server/check_token.ts`
- `server/probe_dimensions.ts`
- `server/probe_drizzle.ts`
- `server/probe_models.ts`
- `server/probe_replicate.ts`
- `server/probe_resize_candidates.ts`
- `server/server.log`

**Server Source (2 files):**

- `server/src/fix_db.ts`
- `server/src/services/cognee.ts`

**Frontend Services (2 files):**

- `src/services/gemini.ts` (deprecated stub)
- `src/services/liveClient.ts` (deprecated stub)

**Root Files (3 files):**

- `.auto-claude-security.json`
- `.auto-claude-status`
- `.claude_settings.json`

**Docs Log Files (2 files):**

- `docs/ops/.ralph_wiggum_decisions.log`
- `docs/ops/.tool_usage_log.txt`

**Empty Directory:**

- `services/`

### Files to Review

| File | Issue |
|------|-------|
| `server/src/services/langfuse.ts` | Verify if Langfuse observability is configured |

---

*Audit completed: 2026-01-08*
*Total files audited: 340*
*Total folders audited: 56*
