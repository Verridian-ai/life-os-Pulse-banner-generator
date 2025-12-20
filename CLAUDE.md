# CLAUDE.md - Orchestrator Manual

> This is the operator manual for Claude Code agents working on this repository.
> All agents MUST read this file and `.claude/rules/shared_contract.md` before any work.

---

## Project Overview

**Nanobanna Pro** is an AI-powered LinkedIn banner design tool for the Careersy Community.

- **Tech Stack**: React + TypeScript + Vite + Tailwind CSS + Supabase
- **AI Services**: Gemini, OpenRouter, Replicate
- **Core Concept**: Multi-AI orchestration for image generation, editing, and enhancement with voice-powered workflows

---

## 1. HARD CONTRACT (Non-Negotiables)

These constraints CANNOT be overridden without explicit user approval:

| Rule | Description |
|------|-------------|
| A | Orchestrator does NOT write production code |
| B | Implementation ONLY in `.worktrees/` via delegated subagents |
| C | Every task uses TWO agents: Sonnet (impl) + Opus (review) |
| D | No merge without: reviewer sign-off, clean rebase, tests passing, user approval |
| E | Feature co-location mandatory (vertical slice) |
| F | Import hygiene: explicit imports, strict ordering, no wildcards |
| G | UI depth effects MUST include accessibility fallbacks |
| H | "Member" is base account; modules add capabilities |

Full details: `.claude/rules/shared_contract.md`

---

## 2. HOW WORK STARTS

### 2.1 Task Creation Flow

1. User describes work needed
2. Orchestrator creates task in `docs/ops/WORK_BOARD.md`
3. Task includes:
   - Unique ID (T001, T002, ...)
   - Title and Description
   - Acceptance Criteria
   - Affected Files/Areas
   - Assigned Agents
   - Test Plan

### 2.2 Required Artifacts Before Implementation

Before ANY code is written:
- [ ] Task exists in WORK_BOARD
- [ ] Acceptance criteria defined
- [ ] Test plan documented
- [ ] Affected areas identified
- [ ] Agent pairing assigned

---

## 3. PARALLELISATION MODEL

### 3.1 Worktree Structure

```
.worktrees/
  T001-auth-impl/      # Implementer worktree
  T001-auth-rev/       # Reviewer worktree
  T002-gallery-impl/   # Another task (parallel)
  T002-gallery-rev/
```

### 3.2 Agent Pairing

| Task Type | Implementer | Reviewer |
|-----------|-------------|----------|
| Feature Development | Claude Sonnet | Claude Opus |
| Bug Fix | Claude Sonnet | Claude Opus |
| Refactor | Claude Sonnet | Claude Opus |
| Research Only | Claude Haiku | N/A |

### 3.3 Git Commands for Worktrees

```bash
# Create implementation worktree
git worktree add .worktrees/T001-impl -b task/T001-impl

# Create review worktree (tracks impl branch)
git worktree add .worktrees/T001-rev task/T001-impl

# After work complete, rebase on main
cd .worktrees/T001-impl
git fetch origin main
git rebase origin/main

# Clean up after merge
git worktree remove .worktrees/T001-impl
git worktree remove .worktrees/T001-rev
```

---

## 4. DEFINITION OF DONE

A task is DONE when:

1. **Code Complete**: All acceptance criteria met
2. **Tests Passing**: `npm run test` passes
3. **Build Clean**: `npm run build` succeeds with no errors
4. **Lint Clean**: `npm run lint` passes
5. **Reviewer Sign-Off**: Opus review complete with explicit SIGN-OFF
6. **Rebased**: Clean rebase on `origin/main`
7. **No Conflicts**: Merge dry-run shows no conflicts
8. **User Approved**: Human has approved the merge

---

## 5. ROUTING CANON

Full route map: `docs/ops/ROUTES.md`

### 5.1 Current Routes (App.tsx)

| Route | Component | Access |
|-------|-----------|--------|
| `/` | Landing Page | Public |
| `/studio` | Tab.STUDIO | Authenticated |
| `/gallery` | Tab.GALLERY | Authenticated |
| `/brainstorm` | Tab.BRAINSTORM | Authenticated |

### 5.2 Canonical Pattern (Target)

```
/member/{module}/{feature}/{action}

Examples:
/member/studio/canvas/edit
/member/gallery/designs/view
/member/settings/api-keys/manage
```

---

## 6. DESIGN SYSTEM CANON

Full design system: `docs/design/LIFE_OS_DESIGN_SYSTEM.md`

### 6.1 Visual Baselines

- **Primary Reference**: Pulse page (existing)
- **Secondary Reference**: Landing page (existing)
- **Style**: Neumorphism + Glassmorphism hybrid

### 6.2 Key Constraints

- Blur budget: 20px mobile, 40px desktop
- MUST include `@media (prefers-contrast: more)` overrides
- MUST include `@media (forced-colors: active)` overrides
- Never animate `box-shadow` or `backdrop-filter`

---

## 7. AGENT INDEX

16 specialized agents handle different domains:

| ID | Name | Model | Role |
|----|------|-------|------|
| 01 | Lead Architect | Orchestrator | Planning, delegation, coordination |
| 02 | Database Guardian | Opus | Supabase schema, RLS, migrations |
| 03 | FastAPI Sentinel | Sonnet | (Future) Backend API development |
| 04 | Frontend Architect | Opus | React patterns, component design |
| 05 | Depth UI Engineer | Sonnet | Neumorphism, glass, accessibility |
| 06 | Security Warden | Opus | Auth, RLS, API key handling |
| 07 | QA Engineer | Sonnet | Test coverage, integration tests |
| 08 | Accessibility Officer | Opus | WCAG compliance, screen readers |
| 09 | SRE Engineer | Sonnet | Deployment, monitoring, errors |
| 10 | Release Governor | Opus | Merge workflow, version control |
| 11 | Realtime Engineer | Sonnet | WebSocket, live updates |
| 12 | AI Safety Engineer | Opus | Prompt safety, output validation |
| 13 | AI Services Integrator | Sonnet | Cognee, Docling, ingestion |
| 14 | Code Standards Auditor | Opus | Style enforcement, citations |
| 15 | UI Route Detective | Sonnet | Visual route testing, link checks |
| 16 | UX Analytics Engineer | Sonnet | Telemetry, heatmaps, events |

Agent prompts: `.claude/agents/`

---

## 8. COMMANDS & HOOKS

### 8.1 Slash Commands

| Command | Description |
|---------|-------------|
| `/task-new` | Create new task in WORK_BOARD |
| `/task-start` | Create worktrees, assign agents |
| `/task-status` | Check task progress, conflicts |
| `/task-ready` | Run tests, prepare for approval |

Command files: `.claude/commands/`

### 8.2 Enforcement Hooks

Hooks prevent orchestrator from writing production code in root worktree:

- `PreToolUse`: Blocks Write/Edit to `src/` in root worktree
- `PostToolUse`: Logs all modifications to WORK_BOARD

Hook scripts: `scripts/claude-hooks/`

### 8.3 Allowed Write Paths in Root

The orchestrator CAN write to these paths in the root worktree:
- `CLAUDE.md`
- `.claude/**`
- `docs/**`
- `*.md` (documentation)
- `.worktrees/` (worktree management)

---

## 9. MCP/PLUGINS INVENTORY

Available MCP tools:

| Server | Purpose |
|--------|---------|
| `plugin:serena:serena` | Semantic code tools, symbol navigation |
| `plugin:context7:context7` | Library documentation lookup |
| `plugin:supabase:supabase` | Database operations, migrations |
| `plugin:playwright:playwright` | Browser automation |
| `plugin:greptile:greptile` | Code review, PR analysis |
| `chrome-devtools` | Chrome debugging, performance |
| `claude-in-chrome` | Browser interaction |

---

## 10. ESSENTIAL COMMANDS

### Development

```bash
npm run dev          # Start dev server (port 5173)
npm run build        # Production build
npm run preview      # Preview production
npm run lint         # ESLint check
npm run format       # Prettier format
```

### Testing

```bash
npx vitest           # Watch mode
npx vitest run       # Single run
```

---

## 11. ARCHITECTURE QUICK REFERENCE

### Multi-Provider AI Architecture

The application uses a **model routing system** that intelligently selects between providers:

- **Gemini**: Primary for image generation (`gemini-3-pro-image-preview`), text/vision tasks, and live audio
- **OpenRouter**: Access to GPT-5.1, GLM 4.6, MiniMax M2 for specialized tasks
- **Replicate**: Image processing operations (upscaling, background removal, restoration)

**Critical File**: `src/services/modelRouter.ts` - Contains the routing logic and model metadata.

### Context Architecture

```typescript
<AuthProvider>           // Authentication (Supabase)
  <CanvasProvider>       // Canvas state
    <AIProvider>         // AI services, model routing
      <App />
    </AIProvider>
  </CanvasProvider>
</AuthProvider>
```

Three main React contexts:

1. **AIContext** (`src/context/AIContext.tsx`) - Model selection, metrics, tool chains
2. **CanvasContext** (`src/context/CanvasContext.tsx`) - Canvas state, images
3. **AuthContext** (`src/context/AuthContext.tsx`) - Supabase auth, sessions

### Key Services

| Service | Purpose | File |
|---------|---------|------|
| LLM | AI orchestration | `src/services/llm.ts` |
| ModelRouter | Model selection | `src/services/modelRouter.ts` |
| Replicate | Image processing | `src/services/replicate.ts` |
| ActionExecutor | Voice tool calls | `src/services/actionExecutor.ts` |
| Database | Supabase operations | `src/services/database.ts` |

### Database Tables (Supabase)

| Table | Purpose |
|-------|---------|
| `users` | Profiles, subscription tier |
| `designs` | Saved canvas states (JSON) |
| `generated_images` | AI outputs with metadata |
| `brand_profiles` | User brand settings |
| `reference_images` | User uploads |
| `usage_metrics` | Performance tracking |

**Row Level Security (RLS)**: Enabled on all tables via `auth.uid()` policies.

### Component Structure

**Tab System** (`src/constants.ts:Tab` enum):
- **STUDIO**: Canvas editor + generative sidebar
- **GALLERY**: Saved designs browser
- **BRAINSTORM**: Chat interface for prompt ideation

**Key Components**:
- `CanvasEditor` - Main canvas with safe zones, layers
- `GenerativeSidebar` - Generation/editing controls
- `ChatInterface` - Brainstorming tab UI
- `LiveActionPanel` - Voice agent action approval
- `SettingsModal` - API keys, model selection

---

## 12. DEBUGGING

### Log Tags

Services use tagged logs: `[ServiceName] Message`

Examples:
- `[Live]` - Voice agent
- `[Replicate]` - Image processing
- `[App]` - Main application
- `[ActionExecutor]` - Tool execution

### Common Issues

1. **"API key not found"**: Check `apiKeyStorage.ts` migration
2. **Replicate proxy fails**: Verify `x-replicate-token` header
3. **Canvas not saving**: Check auth + RLS policies
4. **Voice not working**: Check mic permissions, use Chrome/Edge

---

## 13. SECURITY

- **API Keys**: Never log full keys, use `!!key`
- **RLS**: All tables use `auth.uid()` policies
- **CORS**: Replicate proxy handles CORS in dev
- **Input**: Sanitize before AI API calls

---

## 14. PROTECTED AREAS

Do NOT modify without explicit approval:

1. **Landing Page** (`/`) - Visual baseline
2. **Pulse Page** - Reference implementation
3. **Auth Flow** - Security critical
4. **RLS Policies** - Data security

---

## 15. CODE STYLE CONVENTIONS

- **Function naming**: camelCase for functions, PascalCase for components
- **File naming**: PascalCase for components (`CanvasEditor.tsx`), camelCase for utilities
- **Imports**: Absolute imports using `@/` alias preferred
- **Types**: Import from `@/types/*` (split across `ai.ts`, `database.ts`, `index.ts`)
- **Async**: Always use async/await, never raw Promises

---

## Quick Links

- Shared Contract: `.claude/rules/shared_contract.md`
- Work Board: `docs/ops/WORK_BOARD.md`
- Agent Context: `docs/ops/AGENT_CONTEXT.md`
- Route Map: `docs/ops/ROUTES.md`
- Design System: `docs/design/LIFE_OS_DESIGN_SYSTEM.md`

---

*Last Updated: 2025-12-20*
*Manual Version: 1.0.0*
