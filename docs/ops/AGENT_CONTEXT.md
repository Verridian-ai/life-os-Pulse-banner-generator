# Agent Context

> Memory system for agents. Each agent reads ONLY their section + shared_contract.md + claude.md.
> Maximum ~80 lines per agent context to keep focus.

---

## 01. Lead Architect (Orchestrator)

### Latest Context
- Project: Nanobanna Pro - AI-powered LinkedIn banner design tool
- Stack: React + TypeScript + Vite + Tailwind + Supabase
- Bootstrap completed: 2025-12-20
- Governance structure in place

### Current Assignments
- None (orchestrator role)

### Last Outputs
- Created `.claude/rules/shared_contract.md`
- Updated `CLAUDE.md` with governance structure
- Created `docs/ops/WORK_BOARD.md`
- Initialized task queue with T001, T002, T003

---

## 02. Database Guardian

### Latest Context
- Database: Supabase PostgreSQL
- RLS enabled on all tables
- Key tables: users, designs, generated_images, brand_profiles, reference_images
- API keys stored encrypted per-user

### Current Assignments
- None

### Last Outputs
- None

---

## 03. FastAPI Sentinel

### Latest Context
- Backend: Currently Vite proxy for Replicate
- Future: FastAPI backend planned
- Proxy config: `vite.config.ts:15-47`

### Current Assignments
- None (backend not yet implemented)

### Last Outputs
- None

---

## 04. Frontend Architect

### Latest Context
- Framework: React 18 with TypeScript
- Build: Vite
- State: Three React contexts (Auth, Canvas, AI)
- Styling: Tailwind CSS + custom styles
- Tab system: STUDIO, GALLERY, BRAINSTORM

### Current Assignments
- T001: Fix white screen (queued)

### Last Outputs
- None

---

## 05. Depth UI Engineer

### Latest Context
- Style: Neumorphism + Glassmorphism hybrid
- Constraints: Blur budget 20px mobile, 40px desktop
- Required: prefers-contrast + forced-colors overrides
- Baseline references: Pulse page, Landing page

### Current Assignments
- T003: Design system extraction (queued)

### Last Outputs
- None

---

## 06. Security Warden

### Latest Context
- Auth: Supabase Auth
- RLS: Enabled on all tables with auth.uid() policies
- API Keys: Never logged, stored encrypted
- CORS: Handled by Vite proxy in dev

### Current Assignments
- None

### Last Outputs
- None

---

## 07. QA Engineer

### Latest Context
- Test framework: Vitest with jsdom
- Config: `vite.config.ts:59-63`
- Setup: `src/setupTests.ts`
- Key test: `src/services/llm.test.ts`

### Current Assignments
- None

### Last Outputs
- None

---

## 08. Accessibility Officer

### Latest Context
- Screen reader support: `ScreenReaderAnnouncer` component
- Required: WCAG 2.1 AA compliance
- Depth UI: Must include high-contrast overrides
- Focus: Never shadow-only affordances

### Current Assignments
- None

### Last Outputs
- None

---

## 09. SRE Engineer

### Latest Context
- Deployment: Vercel
- Monitoring: Performance tracked in AIContext.performanceMetrics
- Error handling: `src/utils/errorHandler.ts`
- Logging: Tagged logs `[ServiceName]`

### Current Assignments
- None

### Last Outputs
- None

---

## 10. Release Governor

### Latest Context
- Git: Main branch protected
- Workflow: Worktree-based parallel delivery
- Merge requirements: Rebase, tests pass, reviewer sign-off, user approval
- Commit format: Conventional commits

### Current Assignments
- None

### Last Outputs
- None

---

## 11. Realtime Engineer

### Latest Context
- Voice providers: Gemini Live (WebSocket), OpenAI Realtime (WebRTC)
- Action flow: Voice -> Transcribe -> Tool calls -> Preview -> Approval
- Key files: `liveClient.ts`, `openaiRealtimeClient.ts`, `actionExecutor.ts`

### Current Assignments
- None

### Last Outputs
- None

---

## 12. AI Safety Engineer

### Latest Context
- AI providers: Gemini, OpenRouter, Replicate
- Input: Sanitized before API calls
- Output: Validated before display
- Key file: `src/services/llm.ts`

### Current Assignments
- None

### Last Outputs
- None

---

## 13. AI Services Integrator

### Latest Context
- Current integrations: Gemini, OpenRouter, Replicate
- Model router: `src/services/modelRouter.ts`
- Future: Cognee, Docling (not implemented)

### Current Assignments
- None

### Last Outputs
- None

---

## 14. Code Standards Auditor

### Latest Context
- Standards: `.claude/rules/shared_contract.md`
- Import ordering: React -> Third-party -> Internal -> Relative -> Styles
- No wildcards: Explicit imports only
- Named exports: Default exports only for page components

### Current Assignments
- None

### Last Outputs
- None

---

## 15. UI Route Detective

### Latest Context
- Current routes: /, /studio, /gallery, /brainstorm
- Target pattern: /member/{module}/{feature}/{action}
- Tools: Playwright, chrome-devtools

### Current Assignments
- T002: Route audit (queued)

### Last Outputs
- None

---

## 16. UX Analytics Engineer

### Latest Context
- Current: Not implemented
- Hooks present but not wired
- Future: Telemetry, heatmaps, event tracking

### Current Assignments
- None

### Last Outputs
- None

---

*Last Updated: 2025-12-20*
