# Enhanced Agents - Quick Reference Guide

**Phase 4 Enhancements** | **Date**: 2026-01-13

---

## Quick Start: Using Enhanced Agents

### Codebase Organization Agent

#### New Commands You Can Use

```bash
# Vertical slice migration
"Migrate src/components/UserProfile.tsx to vertical slice architecture"

# Barrel file generation
"Generate barrel files for all features"
"Create index.ts for the billing feature"

# Feature flag cleanup
"Find and remove expired feature flags"
"Clean up the 'newCheckout' feature flag"

# Stale branch detection
"Show me stale git branches that can be deleted"
"Find branches merged over 30 days ago"

# License headers
"Add MIT license headers to all TypeScript files"
"Update copyright year to 2026"

# TODO tracking
"Show me all FIXMEs in the codebase"
"Generate TODO report for the canvas-editor feature"
"Find all critical TODOs (FIXME/XXX)"

# Weekly PR creation
"Create weekly organization cleanup PR"
```

---

### Coding Agent

#### New Workflow: Implementation with Pre/Post Hooks

**Before (Old Way)**:
```
User: "Add image upload feature"
→ Agent implements directly
→ Manual pattern search
→ Manual commit message
```

**After (Enhanced)**:
```
User: "Add image upload feature"

[Pre-Task Hooks - Automatic]
✓ Cognee search: "Similar image upload implementations"
✓ Found: useFileUpload hook in profile feature
✓ Vertical slice validated: src/features/image-upload/

[Implementation]
→ Reuses useFileUpload pattern
→ Creates mobile-first UI (320px+)
→ Includes a11y support (touch targets, ARIA)
→ Auto-generates JSDoc

[Post-Task Hooks - Automatic]
✓ Airlock validation (TypeScript, ESLint, Tests, Build)
✓ Pattern stored in Cognee
✓ Commit message generated:
  feat(image-upload): Add drag-and-drop image upload

  - Reuse useFileUpload hook pattern
  - Mobile-first responsive (320px+)
  - WCAG 2.1 compliant (a11y)
  - 87% test coverage
```

#### New Commands

```bash
# Pre-implementation review
"Review architecture before implementing dashboard page"
"Search Cognee for similar billing implementations"

# Automatic a11y enforcement (ALWAYS ON)
"Create a new modal component"
→ Automatically includes touch targets, ARIA, reduced motion

# Mobile-first (ALWAYS ON)
"Build a pricing table component"
→ Automatically starts at 320px, uses clamp(), container queries

# Auto-documentation (ALWAYS ON)
"Add a useCredits hook"
→ Automatically generates JSDoc with examples, a11y notes, performance tips
```

---

### Research Agent

#### New Search Capabilities

##### 1. Cross-Reference Search (Automatic)

```bash
User: "How do we handle form validation?"

[Automatic Cross-Reference]:
✓ Context7: React Hook Form docs
✓ Cognee: Past research (2026-01-05)
✓ Codebase: 12 existing form implementations
✓ README: docs/FORM_GUIDELINES.md

[Synthesized Answer]:
Current pattern: React Hook Form + Zod schemas
Reusable hook: useFormValidation (src/hooks/)
Example: src/features/auth/components/LoginForm.tsx
```

##### 2. Cached Research (Zero Cost)

```bash
# First time (costs $0.003)
User: "How do we handle authentication?"
→ Full search, stores result in Cognee

# Second time (costs $0.00)
User: "How do we handle authentication?"
→ Instant answer from Cognee cache
→ Auto-checks if code changed since last search
```

##### 3. Structured Output Formats

**Request Comparison Table**:
```bash
"Compare React Query vs SWR for this project"

Output:
| Feature | React Query | SWR | Winner |
|---------|-------------|-----|--------|
| Bundle size | 41KB | 5KB | SWR |
| Current usage | ✅ 23 files | ❌ 0 files | React Query |
| DevTools | ✅ Excellent | ⚠️ Basic | React Query |
...

Recommendation: KEEP React Query (migration cost too high)
```

**Request Decision Matrix**:
```bash
"Should we migrate to TypeScript strict mode?"

Output:
## Decision Matrix: TypeScript Strict Mode

| Criterion | Weight | Current | Strict |
|-----------|--------|---------|--------|
| Type safety | 30% | 6/10 | 10/10 |
| Migration effort | 25% | 10/10 | 3/10 |
| Bug prevention | 20% | 7/10 | 10/10 |
...

Weighted Score: Current (7.2) vs Strict (7.8)

Recommendation: MIGRATE (incremental, feature-by-feature)
Estimated effort: 2-3 weeks
```

**Request Summary**:
```bash
"Summarize our image handling architecture"

Output:
## Architecture Summary: Image Handling

### Overview
Multi-provider system with Replicate (primary) + OpenAI (fallback)

### Components
1. ImageGenerator (src/services/imageGenerator.ts)
2. useImageGeneration hook
3. Canvas integration (src/features/canvas/)

### Flow
[ASCII diagram]

### Best Practices
- Use Replicate for complex prompts
- Fallback to OpenAI on rate limit
- Cache generated images in Supabase Storage
```

---

## Cost Comparison: Before vs After

### Research Agent

| Query Type | Before (No Cache) | After (Cached) | Savings |
|------------|-------------------|----------------|---------|
| First time | $0.003 | $0.003 | 0% |
| Repeat (same) | $0.003 | $0.00 | 100% |
| Repeat (updated) | $0.003 | $0.001 | 67% |

**Estimated Savings**: 30-50% reduction in research costs

### Coding Agent

| Task | Before | After (with patterns) | Savings |
|------|--------|----------------------|---------|
| New feature | 38k tokens | 28k tokens | 26% |
| Similar feature | 35k tokens | 15k tokens | 57% |

**Estimated Savings**: 30-40% reduction via pattern reuse

---

## How to Leverage Cognee Learning

### For Coding Agent

**Pattern Storage** (Automatic after implementation):
```
Agent stores:
- Component patterns
- Hook implementations
- Service integrations
- A11y solutions
- Mobile-first patterns
```

**Pattern Reuse** (Automatic before implementation):
```
Agent searches:
- "Similar {feature_name} implementations"
- "Reusable hooks for {use_case}"
- "Existing patterns for {component_type}"
```

### For Research Agent

**Research History** (Automatic):
```
Agent tracks:
- All research queries
- Results and recommendations
- Code references
- Timestamps
```

**Smart Caching** (Automatic):
```
Agent returns cached results when:
- Same question asked before
- Related code unchanged
- Result still valid (<7 days old)
```

---

## Best Practices: Working with Enhanced Agents

### 1. Ask the Same Question Twice (Research Agent)

If researching a complex topic, ask the same question a few days later. The agent will:
- Return instant cached answer (if nothing changed)
- Update only if related code changed
- Save you tokens and time

### 2. Reference Similar Features (Coding Agent)

When requesting new features, mention similar existing features:
```
Good: "Add a settings page similar to the profile page"
→ Agent finds profile patterns, reuses them

Better: "Add settings page"
→ Agent automatically searches for similar patterns
```

### 3. Request Structured Output (Research Agent)

Be explicit about desired format:
```
"Compare X vs Y" → Agent may give paragraph
"Compare X vs Y in a table" → Agent gives structured table
"Compare X vs Y with decision matrix" → Agent gives weighted analysis
```

### 4. Weekly Organization PR (Codebase Org Agent)

Set up weekly PR creation:
```bash
# Add to crontab or GitHub Actions
0 2 * * 1 claude-skill --skill codebase-organization-agent --mode pr-incremental

# Creates PR with:
- Import cleanup
- Barrel file generation
- Documentation updates
- License headers
- Zero risk (safe changes only)
```

---

## Common Scenarios

### Scenario 1: Starting a New Feature

```bash
1. Research: "How have we built similar features?"
   → Agent cross-references Context7 + Cognee + Codebase

2. Coding: "Implement [feature]"
   → Agent pre-checks patterns, implements, post-validates

3. Organization: "Organize the new feature"
   → Agent creates barrel files, fixes imports
```

### Scenario 2: Debugging an Issue

```bash
1. Research: "Find all usages of [buggy_function]"
   → Agent searches codebase + checks Cognee for known issues

2. Debugging Agent: "Debug [error]"
   → Agent investigates

3. Coding: "Fix [error] using [solution]"
   → Agent implements fix, stores pattern
```

### Scenario 3: Refactoring

```bash
1. Research: "Analyze dependencies for [component]"
   → Agent maps all references

2. Organization: "Migrate [component] to vertical slice"
   → Agent creates migration plan

3. Coding: "Execute migration"
   → Agent moves files, updates imports

4. Organization: "Generate barrel file for [feature]"
   → Agent creates index.ts
```

---

## Troubleshooting

### Issue: Cognee search returns no results

**Cause**: Dataset not populated yet
**Solution**: Use agents for a few days to build knowledge base

### Issue: Cached research is outdated

**Cause**: Code changed but cache not updated
**Solution**: Agent automatically detects this and re-searches

### Issue: Pre-task hooks slow down implementation

**Cause**: First-time search (no cache)
**Solution**: Normal behavior, subsequent searches faster

---

## Next Steps

1. **Try the enhanced agents** in real scenarios
2. **Observe pattern learning** (check Cognee after a few implementations)
3. **Leverage cached research** (ask recurring questions)
4. **Weekly organization PR** (set up automation)
5. **Provide feedback** on new capabilities

---

## Support

- **Agent Documentation**: `.claude/skills/{agent-name}/SKILL.md`
- **Configuration**: `.claude/tool-allocation-matrix.json`
- **Cognee Docs**: `docs/COGNEE_MEMORY_ARCHITECTURE.md`
- **Shared Contract**: `.claude/rules/shared_contract.md`

---

*Quick Reference - Phase 4 Enhancements*
*Last Updated: 2026-01-13*
