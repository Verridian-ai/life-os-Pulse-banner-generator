# Advanced Claude Skills Architecture: MCP Tool Isolation & Self-Healing System

> Research, design, and implementation plan for context-preserving, self-healing Claude Skills architecture

**Status**: 🔬 Research & Design Phase
**Priority**: Critical
**Expected Impact**: 90% context reduction, infinite extensibility

---

## 🎯 Vision

Create a **self-contained, self-healing agent ecosystem** where:
1. Main orchestrator operates with minimal context usage
2. Each skill agent runs in complete isolation with dedicated MCP tools
3. System automatically creates new skills when gaps are detected
4. Codebase self-organizes through dedicated maintenance agents

---

## 📚 Part 1: Research Plan

### Research Area 1: Claude Skills Advanced Scripting

**Goal**: Understand the full capabilities of Claude Skills beyond basic usage

**Research Questions**:
1. How can skills invoke MCP tools without affecting parent context?
2. What's the maximum isolation achievable between skill execution contexts?
3. Can skills spawn other skills dynamically?
4. How to pass tool results between isolated skill contexts?
5. What's the skill lifecycle (creation, execution, cleanup)?

**Research Sources**:
- Claude Code official documentation
- MCP specification: https://modelcontextprotocol.io/
- Anthropic API tool use patterns
- Community skill implementations (karanb192, obra)
- Existing skill examples in `.claude/skills/`

**Research Methodology**:
```
Phase 1: Documentation Review (2 hours)
├── Read Claude Code skills documentation
├── Study MCP protocol specification
├── Analyze existing skill structures
└── Document capability boundaries

Phase 2: Experimentation (4 hours)
├── Create test skill with MCP tool access
├── Measure context usage with/without isolation
├── Test skill-to-skill communication
├── Profile token consumption patterns
└── Document findings

Phase 3: Architecture Design (3 hours)
├── Design tool routing system
├── Plan context isolation mechanisms
├── Define skill communication protocols
└── Create implementation roadmap
```

**Expected Outputs**:
- `SKILLS_CAPABILITIES_RESEARCH.md`
- `MCP_TOOL_ISOLATION_PATTERNS.md`
- `SKILL_COMMUNICATION_PROTOCOL.md`

---

### Research Area 2: MCP Tool Architecture

**Goal**: Map out how to route MCP tools through skill agents

**Key Questions**:
1. Can MCP servers be configured per-skill?
2. How to prevent tool context leakage to orchestrator?
3. What's the overhead of skill-mediated tool calls?
4. Can tools be dynamically allocated/deallocated?

**Investigation Tasks**:
```typescript
// Test 1: Tool Isolation
// Can we call a tool from a skill without parent context pollution?
async function testToolIsolation() {
  // Invoke skill with MCP tool
  // Measure parent context before/after
  // Validate zero context leakage
}

// Test 2: Tool Routing
// Can we route specific tools to specific skills?
async function testToolRouting() {
  // Configure tool → skill mapping
  // Verify tool only accessible via skill
  // Measure routing overhead
}

// Test 3: Concurrent Tool Use
// Can multiple skills use different tools simultaneously?
async function testConcurrentToolUse() {
  // Spawn multiple skills
  // Each uses different MCP tool
  // Verify no conflicts
}
```

**Expected Outputs**:
- Tool isolation proof-of-concept
- Performance benchmarks
- Tool routing design document

---

### Research Area 3: Self-Healing Skill Creation

**Goal**: Enable system to create skills on-demand when gaps detected

**Key Questions**:
1. How to detect skill gaps automatically?
2. Can a skill generate another skill's definition?
3. What's the minimum viable skill structure?
4. How to validate auto-generated skills?

**Research Approach**:
1. Study meta-programming patterns in Claude Skills
2. Analyze skill template structures
3. Design gap detection heuristics
4. Create skill generation pipeline

**Expected Outputs**:
- `SKILL_GENERATION_SYSTEM.md`
- `skill-creator` skill implementation
- Gap detection algorithm

---

## 🏗️ Part 2: Proposed Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────┐
│  Main Orchestrator (Minimal Context)                         │
│  ├── Task Classification                                     │
│  ├── Skill Selection                                         │
│  └── Result Synthesis                                        │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ (Delegates via isolated session)
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  Skill Execution Layer (Isolated Contexts)                   │
│  ┌────────────────┐  ┌────────────────┐  ┌───────────────┐ │
│  │ Research Agent │  │ Coding Agent   │  │ Debug Agent   │ │
│  │ MCP: Grep/Glob │  │ MCP: Edit/Write│  │ MCP: DevTools │ │
│  │ Context: 20k   │  │ Context: 50k   │  │ Context: 30k  │ │
│  └────────────────┘  └────────────────┘  └───────────────┘ │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ (Uses dedicated MCP tools)
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  MCP Tool Layer (Context-Isolated)                           │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐      │
│  │ Supabase │ │ Playwright│ │ Semgrep  │ │ ESLint   │      │
│  │  Server  │ │  Server   │ │  Server  │ │  Server  │      │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘      │
└─────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Part 3: Tool Allocation Matrix

### Complete Tool → Skill Mapping

| Tool | Skill Agent | Purpose | Context Impact |
|------|-------------|---------|----------------|
| **Code Search** | | | |
| Grep | Research Agent | Content search | Low (read-only) |
| Glob | Research Agent | File pattern matching | Low (read-only) |
| Serena (semantic search) | Research Agent | Symbol navigation | Low (read-only) |
| **Code Modification** | | | |
| Read | All agents | File reading | Low |
| Edit | Coding Agent, Quick Tasks | File editing | Medium |
| Write | Coding Agent | File creation | Medium |
| **Testing** | | | |
| Bash (test commands) | QA Agent | Test execution | High |
| Vitest MCP | QA Agent | Test framework | High |
| Playwright MCP | QA Agent | E2E testing | Very High |
| **Database** | | | |
| Neon Manager | Database Agent | PostgreSQL ops | Medium |
| Supabase MCP | Database Agent | DB + RLS | Medium |
| **Security** | | | |
| Semgrep MCP | Security Agent | Static analysis | High |
| OSV Scanner | Security Agent | Vulnerability scan | Medium |
| **Linting/Formatting** | | | |
| ESLint MCP | Quick Tasks Agent | Linting | Low |
| TypeScript MCP | Quick Tasks Agent | Type checking | Medium |
| Prettier | Quick Tasks Agent | Formatting | Low |
| **Performance** | | | |
| Chrome DevTools MCP | Debugging Agent | Performance profiling | Very High |
| Lighthouse MCP | Debugging Agent | Web vitals | High |
| **Git** | | | |
| GitHub MCP | Release Agent | PR management | Medium |
| Conventional Commits | Release Agent | Commit validation | Low |
| **AI/Observability** | | | |
| Langfuse MCP | Observability Agent | LLM tracing | Medium |
| Guardrails MCP | Safety Agent | Prompt safety | Low |
| **Documentation** | | | |
| Context7 | Research Agent | Library docs | Low |
| WebSearch | Research Agent | Web research | Low |
| WebFetch | Research Agent | Content fetch | Low |
| **Codebase Organization** | | | |
| All file operations | Organization Agent | Structure maintenance | Medium |

---

## 🔐 Part 4: Context Isolation Mechanisms

### Isolation Strategy 1: Subprocess Execution

**Concept**: Each skill runs as a completely separate subprocess

```typescript
// skill-executor.ts
import { spawn } from 'child_process';

class SkillExecutor {
  async executeIsolated(skillName: string, task: Task): Promise<Result> {
    // Spawn skill in isolated subprocess
    const skillProcess = spawn('claude-skill', [
      '--skill', skillName,
      '--task', JSON.stringify(task),
      '--context-limit', this.getContextLimit(skillName),
      '--tools', this.getAllowedTools(skillName).join(',')
    ]);

    // Capture output without polluting parent context
    const result = await this.captureOutput(skillProcess);

    // Return only final result, not intermediate context
    return this.extractResult(result);
  }

  private getContextLimit(skillName: string): number {
    const limits = {
      'research-agent': 20000,
      'coding-agent': 50000,
      'debugging-agent': 30000,
      'decision-agent': 20000,
      'quick-tasks-agent': 10000
    };
    return limits[skillName] || 10000;
  }

  private getAllowedTools(skillName: string): string[] {
    // Return only tools allowed for this skill
    return TOOL_ALLOCATION_MATRIX[skillName] || [];
  }
}
```

**Benefits**:
- Complete context isolation
- No context leakage to orchestrator
- Independent token budgets
- Parallel execution possible

**Drawbacks**:
- Process spawn overhead (~100-200ms)
- No shared state between skills
- Requires inter-process communication

---

### Isolation Strategy 2: Tool Interception Layer

**Concept**: Intercept all tool calls and route through skill agents

```typescript
// tool-interceptor.ts
class ToolInterceptor {
  private toolRoutes: Map<string, string>; // tool → skill mapping

  async interceptToolCall(toolName: string, params: any): Promise<any> {
    // Check if tool should be routed through skill
    const skillAgent = this.toolRoutes.get(toolName);

    if (skillAgent) {
      // Route through skill agent (isolated context)
      return await this.routeToSkill(skillAgent, toolName, params);
    } else {
      // Execute directly (for orchestrator-level tools only)
      return await this.executeDirect(toolName, params);
    }
  }

  private async routeToSkill(
    skillName: string,
    toolName: string,
    params: any
  ): Promise<any> {
    // Create isolated skill execution
    const skill = await SkillManager.spawn(skillName);

    // Execute tool within skill's context
    const result = await skill.executeTool(toolName, params);

    // Extract result without context pollution
    return this.sanitizeResult(result);
  }
}
```

**Benefits**:
- Automatic tool routing
- No code changes to existing tools
- Centralized control
- Easy to add/remove tool routes

---

### Isolation Strategy 3: Context Budget Management

**Concept**: Enforce strict token budgets per skill

```typescript
// context-budget-manager.ts
class ContextBudgetManager {
  private budgets = {
    'research-agent': 20000,
    'quick-tasks-agent': 10000,
    'coding-agent': 50000,
    'debugging-agent': 30000,
    'decision-agent': 20000
  };

  private usage: Map<string, number> = new Map();

  async trackSkillExecution(skillName: string, execute: () => Promise<any>) {
    const startTokens = this.getCurrentTokenCount();

    const result = await execute();

    const tokensUsed = this.getCurrentTokenCount() - startTokens;
    this.recordUsage(skillName, tokensUsed);

    // Enforce budget
    if (tokensUsed > this.budgets[skillName]) {
      throw new BudgetExceededError(
        `${skillName} exceeded budget: ${tokensUsed}/${this.budgets[skillName]}`
      );
    }

    return result;
  }

  getDailyReport(): BudgetReport {
    return {
      totalBudget: this.getTotalBudget(),
      totalUsed: this.getTotalUsage(),
      bySkill: this.getUsageBySkill(),
      remaining: this.getRemainingBudget()
    };
  }
}
```

---

## 🤖 Part 5: Specialized Skill Agents

### 5.1 Codebase Organization Agent

**Purpose**: Maintain pristine codebase structure

```markdown
# Codebase Organization Agent

**Model**: Haiku 4.5 (cost-effective for repetitive tasks)
**Token Budget**: 15,000
**Execution**: Scheduled (daily) + on-demand

## Responsibilities

1. **Import Organization**
   - Enforce import order (React → Third-party → Internal → Relative → Styles)
   - Remove unused imports
   - Consolidate duplicate imports

2. **File Structure Maintenance**
   - Ensure vertical slice architecture compliance
   - Move misplaced files to correct locations
   - Create missing index.ts barrel files

3. **Dead Code Removal**
   - Detect unused functions/components
   - Find unreachable code
   - Remove commented-out code blocks

4. **Naming Convention Enforcement**
   - PascalCase for components
   - camelCase for functions
   - UPPER_SNAKE_CASE for constants

5. **Documentation Hygiene**
   - Ensure all exports have JSDoc
   - Flag missing README files
   - Update outdated documentation

## Tools Available

- Grep (find pattern violations)
- Glob (scan file structure)
- Edit (fix violations)
- Serena (semantic analysis)
- ESLint MCP (linting rules)

## Execution Schedule

```bash
# Daily automated run
0 2 * * * /usr/bin/claude-skill --skill codebase-organization-agent --mode full-scan

# On-demand (pre-commit)
git add . && claude-skill --skill codebase-organization-agent --mode incremental
```

## Success Metrics

- Zero import order violations
- 100% vertical slice compliance
- Zero dead code remaining
- 100% export documentation coverage
```

---

### 5.2 Self-Healing Skill Creator Agent

**Purpose**: Detect gaps and auto-generate missing skills

```typescript
// skill-creator-agent.ts

interface SkillGap {
  missingCapability: string;
  frequency: number; // How often this gap was encountered
  context: string[]; // Sample tasks that triggered gap
  suggestedSkillName: string;
  estimatedComplexity: 'simple' | 'medium' | 'complex';
}

class SkillCreatorAgent {
  private detectedGaps: SkillGap[] = [];

  // Detect skill gaps during orchestration
  detectGap(task: Task, availableSkills: string[]): SkillGap | null {
    // Analyze task requirements
    const requiredCapabilities = this.analyzeTaskRequirements(task);

    // Check if existing skills cover requirements
    const coverage = this.calculateSkillCoverage(requiredCapabilities, availableSkills);

    if (coverage < 0.8) {
      // Gap detected - 80% threshold
      return {
        missingCapability: this.identifyMissingCapability(requiredCapabilities, coverage),
        frequency: 1,
        context: [task.description],
        suggestedSkillName: this.generateSkillName(requiredCapabilities),
        estimatedComplexity: this.estimateComplexity(requiredCapabilities)
      };
    }

    return null;
  }

  // Auto-generate skill when gap frequency exceeds threshold
  async autoGenerateSkill(gap: SkillGap): Promise<void> {
    if (gap.frequency < 3) {
      // Wait for 3 occurrences before creating skill
      return;
    }

    console.log(`🔧 Auto-generating skill: ${gap.suggestedSkillName}`);

    // Generate skill definition using Decision Agent (Opus for quality)
    const skillDefinition = await this.generateSkillDefinition(gap);

    // Validate generated skill
    const isValid = await this.validateSkill(skillDefinition);

    if (!isValid) {
      console.warn(`⚠️  Generated skill ${gap.suggestedSkillName} failed validation`);
      return;
    }

    // Write skill to .claude/skills/
    await this.writeSkill(gap.suggestedSkillName, skillDefinition);

    // Register skill in skills-config.json
    await this.registerSkill(gap.suggestedSkillName, skillDefinition.metadata);

    // Notify user
    console.log(`✅ New skill created: ${gap.suggestedSkillName}`);
    console.log(`   Location: .claude/skills/${gap.suggestedSkillName}/SKILL.md`);
    console.log(`   Capabilities: ${skillDefinition.capabilities.join(', ')}`);
  }

  private async generateSkillDefinition(gap: SkillGap): Promise<SkillDefinition> {
    // Use Opus Decision Agent for high-quality skill generation
    const prompt = `
Generate a Claude Skill definition for the following capability gap:

Missing Capability: ${gap.missingCapability}
Complexity: ${gap.estimatedComplexity}
Context (sample tasks):
${gap.context.map((ctx, i) => `${i + 1}. ${ctx}`).join('\n')}

Required output:
- Skill name
- Model to use (Haiku/Sonnet/Opus)
- Token budget
- Capabilities list
- Required MCP tools
- Triggers (when to activate)
- Example invocations
- Success metrics

Format as SKILL.md markdown.
`;

    return await this.invokeDecisionAgent(prompt);
  }
}
```

---

## 📋 Part 6: Implementation Roadmap

### Phase 1: Foundation (Week 1)

**Day 1-2: Research & Validation**
- [ ] Complete Claude Skills capability research
- [ ] Test context isolation mechanisms
- [ ] Validate MCP tool routing feasibility
- [ ] Document findings

**Day 3-4: Core Infrastructure**
- [ ] Implement `SkillExecutor` (subprocess isolation)
- [ ] Create `ToolInterceptor` (tool routing)
- [ ] Build `ContextBudgetManager` (budget enforcement)
- [ ] Write unit tests

**Day 5-7: Tool Allocation**
- [ ] Implement tool → skill mapping
- [ ] Configure MCP servers per skill
- [ ] Test isolated tool execution
- [ ] Measure performance benchmarks

---

### Phase 2: Specialized Agents (Week 2)

**Day 8-10: Codebase Organization Agent**
- [ ] Define agent responsibilities
- [ ] Implement import organization logic
- [ ] Build file structure validator
- [ ] Create dead code detector
- [ ] Test on real codebase

**Day 11-14: Self-Healing System**
- [ ] Implement gap detection algorithm
- [ ] Build skill generation pipeline
- [ ] Create skill validation system
- [ ] Test auto-generation with real gaps

---

### Phase 3: Integration (Week 3)

**Day 15-17: Orchestrator Rewrite**
- [ ] Rewrite CLAUDE.md for skills-first workflow
- [ ] Update orchestrator decision logic
- [ ] Integrate tool interceptor
- [ ] Enable subprocess execution

**Day 18-21: Testing & Optimization**
- [ ] End-to-end system testing
- [ ] Performance optimization
- [ ] Token usage validation
- [ ] User acceptance testing

---

## 📊 Part 7: Success Metrics

### Context Efficiency

| Metric | Before | Target | How to Measure |
|--------|--------|--------|----------------|
| Orchestrator context usage | 100k tokens/day | <10k tokens/day | Token tracking |
| Skill isolation success rate | N/A | >99% | Context leak detection |
| Tool routing overhead | N/A | <100ms | Performance profiling |
| Total system token usage | 372k/day | <200k/day | Daily cost reports |

### Self-Healing Capabilities

| Metric | Target | How to Measure |
|--------|--------|----------------|
| Skill gap detection accuracy | >90% | Manual validation |
| Auto-generated skill success rate | >80% | Validation tests |
| Time to fill gap | <2 hours | Timestamp tracking |
| Codebase organization score | >95% | Linting + structure checks |

---

## 🔬 Part 8: Research Deliverables

### Deliverable 1: SKILLS_CAPABILITIES_RESEARCH.md

**Contents**:
- Full capability inventory of Claude Skills
- Context isolation patterns discovered
- Skill-to-skill communication protocols
- Performance characteristics
- Limitations and workarounds

### Deliverable 2: MCP_TOOL_ROUTING_GUIDE.md

**Contents**:
- Tool → skill allocation best practices
- Configuration examples
- Performance benchmarks
- Troubleshooting guide

### Deliverable 3: SELF_HEALING_SYSTEM_SPEC.md

**Contents**:
- Gap detection algorithm specification
- Skill generation pipeline design
- Validation criteria
- Auto-registration process

---

## 🎯 Next Steps

1. **Immediate**: Complete Phase 1 research (estimated: 9 hours)
2. **Week 1**: Implement core infrastructure
3. **Week 2**: Build specialized agents
4. **Week 3**: Integrate and test

**Ready to begin?** I can start with any of these:
- A: Complete the research phase (documentation review + experiments)
- B: Implement subprocess execution for skill isolation
- C: Build the tool allocation matrix and routing system
- D: Create the codebase organization agent

Which would you like me to tackle first?

---

*Advanced Skills Architecture Design - 2026-01-13*
*Version: 1.0.0 - Research & Design Phase*
