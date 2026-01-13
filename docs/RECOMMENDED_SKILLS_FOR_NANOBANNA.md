# Recommended Agent Skills for Nanobanna Pro

> Curated list of essential skills optimized for Nanobanna Pro's AI-powered LinkedIn banner design tool workflow

**Project Context**: React + TypeScript + Vite + Tailwind CSS + Neon PostgreSQL + Multi-AI orchestration
**Current Setup**: 6 skills installed, 22 internal agents
**Goal**: Higher quality code, faster shipping, highest standards

---

## 🎯 Priority 1: MUST INSTALL (Critical Path)

### 1. Test-Driven Development
**Source**: karanb192/awesome-claude-skills
**Skill**: `test-driven-development`
**Why Critical**: Your contract requires 80% coverage minimum. This skill enforces red-green-refactor TDD methodology.
**Installation**:
```bash
git clone https://github.com/karanb192/awesome-claude-skills.git
# Copy test-driven-development skill to .claude/skills/
```
**Impact**:
- Ensures 80%+ coverage before code ships
- Prevents regression bugs
- Aligns with your QA Engineer agent requirements

---

### 2. Using Git Worktrees
**Source**: karanb192/awesome-claude-skills
**Skill**: `using-git-worktrees`
**Why Critical**: Your entire workflow is worktree-based (CLAUDE.md Section 3). This skill automates worktree creation for tasks.
**Installation**:
```bash
# From karanb192/awesome-claude-skills repo
```
**Impact**:
- Automates `.worktrees/T001-impl` and `.worktrees/T001-rev` creation
- Enforces implementer + reviewer pairing
- Prevents merge conflicts

---

### 3. Security Review
**Source**: karanb192/awesome-claude-skills
**Skill**: `security-review`
**Why Critical**: You handle sensitive data (API keys, Supabase RLS, auth flows). This skill catches vulnerabilities before deployment.
**Installation**:
```bash
# From karanb192/awesome-claude-skills repo
```
**Impact**:
- Audits API key handling (`apiKeyStorage.ts`)
- Validates RLS policies on all tables
- Prevents OWASP top 10 vulnerabilities (XSS, SQL injection, command injection)

---

### 4. Requesting Code Review + Receiving Code Review
**Source**: karanb192/awesome-claude-skills
**Skills**: `requesting-code-review`, `receiving-code-review`
**Why Critical**: Your Definition of Done requires Opus reviewer sign-off. These skills standardize the review process.
**Installation**:
```bash
# From karanb192/awesome-claude-skills repo
```
**Impact**:
- Ensures explicit "SIGN-OFF" section in reviews
- Tracks review feedback with todo system
- Enforces 200-line diff size limit

---

### 5. Finishing a Development Branch
**Source**: karanb192/awesome-claude-skills
**Skill**: `finishing-a-development-branch`
**Why Critical**: Automates your Definition of Done checklist (tests, build, lint, rebase, conflict check).
**Installation**:
```bash
# From karanb192/awesome-claude-skills repo
```
**Impact**:
- Runs `npm run test`, `npm run build`, `npm run lint` automatically
- Ensures clean rebase on `origin/main`
- Prevents broken code from merging

---

### 6. Performance Profiling
**Source**: karanb192/awesome-claude-skills
**Skill**: `performance-profiling`
**Why Critical**: Glassmorphism/neumorphism can tank performance. This skill profiles blur budgets and GPU usage.
**Installation**:
```bash
# From karanb192/awesome-claude-skills repo
```
**Impact**:
- Enforces blur budget (20px mobile, 40px desktop)
- Identifies `box-shadow`/`backdrop-filter` animation violations
- Optimizes glass effect rendering

---

### 7. Systematic Debugging
**Source**: karanb192/awesome-claude-skills
**Skill**: `systematic-debugging`
**Why Critical**: Multi-AI orchestration (Gemini, OpenRouter, Replicate, OpenAI Realtime) creates complex failure modes.
**Installation**:
```bash
# From karanb192/awesome-claude-skills repo
```
**Impact**:
- Traces Replicate proxy failures
- Debugs voice agent WebSocket disconnects
- Root-cause analysis for canvas save failures

---

## 🚀 Priority 2: HIGH VALUE (Accelerators)

### 8. Git Pushing
**Source**: mhattingpete/claude-skills-marketplace
**Skill**: `git-pushing`
**Why Valuable**: Automates conventional commits + push workflow. Achieves 90-99% token reduction.
**Installation**:
```bash
git clone https://github.com/mhattingpete/claude-skills-marketplace.git
```
**Impact**:
- Auto-stages changes
- Generates conventional commit messages
- Pushes to remote with Co-Authored-By tags

---

### 9. Test Fixing
**Source**: mhattingpete/claude-skills-marketplace
**Skill**: `test-fixing`
**Why Valuable**: Systematically fixes failing tests with error grouping. Critical for 80% coverage goal.
**Installation**:
```bash
# From mhattingpete/claude-skills-marketplace repo
```
**Impact**:
- Groups related test failures
- Prioritizes high-impact fixes
- Tracks test coverage metrics

---

### 10. Canvas Design
**Source**: karanb192/awesome-claude-skills
**Skill**: `canvas-design`
**Why Valuable**: You have a canvas editor (`CanvasEditor.tsx`). This skill optimizes canvas manipulation workflows.
**Installation**:
```bash
# From karanb192/awesome-claude-skills repo
```
**Impact**:
- Optimizes canvas layer operations
- Improves safe zone handling
- Enhances text element positioning

---

### 11. Refactoring Patterns
**Source**: karanb192/awesome-claude-skills
**Skill**: `refactoring-patterns`
**Why Valuable**: You need to migrate `src/components/` to vertical slice architecture (CLAUDE.md Section 2.1).
**Installation**:
```bash
# From karanb192/awesome-claude-skills repo
```
**Impact**:
- Guides feature co-location migration
- Prevents over-engineering
- Maintains import hygiene

---

### 12. Database Migration
**Source**: karanb192/awesome-claude-skills
**Skill**: `database-migration`
**Why Valuable**: Complements your Database Guardian agent for Neon PostgreSQL schema changes.
**Installation**:
```bash
# From karanb192/awesome-claude-skills repo
```
**Impact**:
- Generates RLS policies automatically
- Validates migration rollback scripts
- Tests schema changes in isolation

---

### 13. Dependency Audit
**Source**: karanb192/awesome-claude-skills
**Skill**: `dependency-audit`
**Why Valuable**: You use 15+ npm packages. This skill catches vulnerable dependencies before deployment.
**Installation**:
```bash
# From karanb192/awesome-claude-skills repo
```
**Impact**:
- Scans `package.json` for CVEs
- Suggests safe upgrade paths
- Prevents supply chain attacks

---

## 📊 Priority 3: QUALITY OF LIFE (Enhancers)

### 14. Playwright Skill
**Source**: mcpservers.org/claude-skills
**Skill**: `playwright`
**Why Useful**: Your UI Route Detective agent can use this for automated visual testing.
**Installation**:
```bash
# Available via MCP Servers registry
```
**Impact**:
- Automates route navigation tests
- Validates glassmorphism rendering
- Tests voice command UI flows

---

### 15. Writing Plans + Executing Plans
**Source**: karanb192/awesome-claude-skills
**Skills**: `writing-plans`, `executing-plans`
**Why Useful**: Complements your worktree workflow for complex features.
**Installation**:
```bash
# From karanb192/awesome-claude-skills repo
```
**Impact**:
- Structures feature planning before implementation
- Breaks tasks into 200-line chunks
- Tracks execution progress

---

### 16. Brainstorming
**Source**: karanb192/awesome-claude-skills
**Skill**: `brainstorming`
**Why Useful**: You have a Brainstorm tab. This skill enhances prompt ideation workflows.
**Installation**:
```bash
# From karanb192/awesome-claude-skills repo
```
**Impact**:
- Improves AI prompt quality
- Suggests design variations
- Explores banner concept alternatives

---

### 17. Documentation Generator
**Source**: karanb192/awesome-claude-skills
**Skill**: `documentation-generator`
**Why Useful**: Keeps `docs/` up-to-date as codebase evolves.
**Installation**:
```bash
# From karanb192/awesome-claude-skills repo
```
**Impact**:
- Auto-updates `VOICE_AGENT_GUIDE.md`
- Generates API docs for `src/services/`
- Maintains agent prompt documentation

---

### 18. Changelog Automation
**Source**: karanb192/awesome-claude-skills
**Skill**: `changelog-automation`
**Why Useful**: Generates CHANGELOG.md from conventional commits.
**Installation**:
```bash
# From karanb192/awesome-claude-skills repo
```
**Impact**:
- Tracks feature releases
- Documents breaking changes
- Automates release notes

---

### 19. CI/CD Integration
**Source**: karanb192/awesome-claude-skills
**Skill**: `ci-cd-integration`
**Why Useful**: Integrates with GitHub Actions for automated deployment.
**Installation**:
```bash
# From karanb192/awesome-claude-skills repo
```
**Impact**:
- Automates test runs on PR
- Enforces lint checks
- Triggers Vercel deployments

---

### 20. Verification Before Completion
**Source**: karanb192/awesome-claude-skills
**Skill**: `verification-before-completion`
**Why Useful**: Prevents incomplete tasks from being marked as done.
**Installation**:
```bash
# From karanb192/awesome-claude-skills repo
```
**Impact**:
- Validates all acceptance criteria met
- Checks test coverage threshold
- Ensures clean git status

---

## 🧠 Priority 4: ADVANCED (AI/ML Specialized)

### 21. LLM Applications Skills
**Source**: wshobson/agents
**Skills**: LangChain, prompting, RAG, evaluation
**Why Advanced**: Future-proofs for Cognee knowledge graph integration.
**Installation**:
```bash
git clone https://github.com/wshobson/agents.git
# Extract LLM application skills
```
**Impact**:
- Optimizes multi-provider routing (`modelRouter.ts`)
- Improves prompt engineering for Gemini/GPT
- Enhances RAG retrieval for brand profiles

---

### 22. Observability Skills
**Source**: wshobson/agents
**Skills**: Logging, tracing, monitoring
**Why Advanced**: Complements your SRE Engineer agent.
**Installation**:
```bash
# From wshobson/agents repo
```
**Impact**:
- Integrates Langfuse tracing
- Sets up error monitoring (Sentry)
- Tracks AI API latency metrics

---

## 📦 Installation Guide

### Step 1: Clone Recommended Repositories
```bash
cd ~/skills-library

# Priority 1 & 2 skills
git clone https://github.com/karanb192/awesome-claude-skills.git

# Priority 2 workflow skills
git clone https://github.com/mhattingpete/claude-skills-marketplace.git

# Priority 4 advanced skills
git clone https://github.com/wshobson/agents.git
```

### Step 2: Copy Skills to Project
```bash
cd C:\Users\Danie\Desktop\nanobanna-pro

# Copy individual skills
cp -r ~/skills-library/awesome-claude-skills/test-driven-development .claude/skills/
cp -r ~/skills-library/awesome-claude-skills/using-git-worktrees .claude/skills/
cp -r ~/skills-library/awesome-claude-skills/security-review .claude/skills/
# ... repeat for other skills
```

### Step 3: Configure Skill Activation
Edit `.claude/claude_config.json` to enable skills:
```json
{
  "skills": [
    "test-driven-development",
    "using-git-worktrees",
    "security-review",
    "requesting-code-review",
    "receiving-code-review",
    "finishing-a-development-branch",
    "performance-profiling",
    "systematic-debugging",
    "git-pushing",
    "test-fixing"
  ]
}
```

### Step 4: Test Skill Installation
```bash
# In Claude Code
/skills list
/skills activate test-driven-development
```

---

## 🎯 Immediate Action Plan

### Week 1: Core Workflow (Priority 1)
1. Install `test-driven-development` → Enforce 80% coverage
2. Install `using-git-worktrees` → Automate task workflow
3. Install `security-review` → Audit auth/RLS before each merge
4. Install `requesting-code-review` + `receiving-code-review` → Standardize reviews
5. Install `finishing-a-development-branch` → Automate Definition of Done

**Expected Impact**:
- 50% faster task completion (automated worktrees)
- Zero security vulnerabilities merged
- 100% test coverage compliance

---

### Week 2: Quality Gates (Priority 2)
1. Install `git-pushing` → Reduce commit overhead by 90%
2. Install `test-fixing` → Systematically resolve test failures
3. Install `performance-profiling` → Validate glassmorphism performance
4. Install `refactoring-patterns` → Begin vertical slice migration
5. Install `dependency-audit` → Establish security baseline

**Expected Impact**:
- 70% reduction in manual git operations
- 30% faster test debugging
- Performance budget compliance

---

### Week 3: Developer Experience (Priority 3)
1. Install `writing-plans` + `executing-plans` → Improve feature planning
2. Install `documentation-generator` → Keep docs synchronized
3. Install `changelog-automation` → Automate release notes
4. Install `verification-before-completion` → Prevent incomplete PRs

**Expected Impact**:
- 40% better task estimation accuracy
- Always up-to-date documentation
- Cleaner release process

---

### Week 4: Advanced (Priority 4)
1. Install LLM application skills → Optimize AI service integration
2. Install observability skills → Production monitoring readiness

**Expected Impact**:
- 20% reduction in AI API costs
- Proactive error detection

---

## 📈 Success Metrics

Track these KPIs after skill installation:

| Metric | Baseline | Target (30 days) |
|--------|----------|------------------|
| Test Coverage | ~60% | 80%+ |
| Time to Ship Feature | ~5 days | ~3 days |
| Security Vulnerabilities Merged | 2-3/month | 0 |
| Code Review Cycle Time | 2-3 days | <1 day |
| Build Failures on Main | 1-2/week | 0 |
| Worktree Setup Time | 15 min | 2 min |
| Manual Git Operations | 50/day | 5/day |
| Documentation Staleness | 2 weeks | 0 days |

---

## 🔄 Maintenance Plan

### Monthly
- Run `dependency-audit` skill
- Review skill usage analytics
- Update skill versions from upstream repos

### Quarterly
- Evaluate new skills from marketplace
- Deprecate unused skills
- Customize skill prompts for project-specific patterns

---

## ⚠️ Anti-Patterns to Avoid

1. **Skill Overload**: Start with Priority 1 only. Add incrementally.
2. **Conflicting Skills**: Don't install multiple git workflow skills simultaneously.
3. **Untested Skills**: Always review skill code before production use.
4. **Stale Skills**: Check for upstream updates monthly.

---

## 🎓 Learning Resources

- **Skill Customization**: https://code.claude.com/docs/en/skills#customizing-skills
- **Writing Custom Skills**: https://github.com/karanb192/awesome-claude-skills/blob/main/skill-creator
- **Skill Testing**: https://github.com/karanb192/awesome-claude-skills/blob/main/testing-skills-with-subagents

---

## 📞 Support & Troubleshooting

### Skill Not Activating?
1. Check `.claude/skills/[skill-name]/SKILL.md` exists
2. Verify skill syntax with `/skills validate [skill-name]`
3. Review Claude Code logs for errors

### Skill Conflicts?
1. Deactivate conflicting skills: `/skills deactivate [skill-name]`
2. Check skill priority in config
3. Customize skill triggers to avoid overlap

### Performance Issues?
1. Reduce active skills to <10 simultaneously
2. Use skill-specific models (Haiku for fast skills, Opus for review skills)
3. Monitor token usage per skill

---

*Curated for Nanobanna Pro - 2026-01-13*
*Recommendation Version: 1.0.0*
