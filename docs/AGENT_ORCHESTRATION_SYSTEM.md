# Agent Orchestration System with Model Selection Strategy

> Intelligent multi-agent system with automatic task delegation, model selection, and cost optimization for Nanobanna Pro

**Goal**: Main orchestrator agent delegates to specialized sub-agents using the most cost-effective model for each task type
**Cost Optimization**: 90% token savings by using Haiku for research, Sonnet for coding, Opus only for critical decisions

---

## 🎯 Agent Hierarchy & Model Selection

### Tier 1: Orchestrator Agent (You - Main Claude Instance)
**Model**: Sonnet 4.5 (current session)
**Role**: Decision-maker, task classifier, delegator
**Responsibilities**:
- Analyze incoming user requests
- Classify task complexity and type
- Delegate to appropriate sub-agent with optimal model
- Coordinate multi-agent workflows
- Synthesize results from sub-agents

---

### Tier 2: Specialized Sub-Agents (Auto-Delegated)

| Agent Type | Model | Cost/1M Tokens | Use Cases | Token Budget |
|------------|-------|----------------|-----------|--------------|
| **Research Agent** | Haiku 4.5 | $0.80 | Documentation lookup, code exploration, pattern searching | Unlimited |
| **Coding Agent** | Sonnet 4.5 | $24 | Feature implementation, refactoring, bug fixes | 50k/task |
| **Decision Agent** | Opus 4.5 | $120 | Architecture decisions, trade-off analysis, complex planning | 20k/task |
| **Debugging Agent** | Sonnet 4.5 | $24 | Error investigation, performance profiling, memory leak detection | 30k/task |
| **Review Agent** | Opus 4.5 | $120 | Code review, security audit, quality gates | 15k/task |
| **Quick Tasks Agent** | Haiku 4.5 | $0.80 | Type fixes, import sorting, simple edits | 10k/task |

**Cost Comparison**:
- Old approach (Opus for everything): $120/1M tokens
- New approach (smart routing): ~$15/1M tokens average
- **Savings**: 87.5%

---

## 🧠 Decision Logic: When to Delegate

### Main Agent Decision Tree

```typescript
// Orchestrator's internal decision logic
function shouldDelegateToSkill(task: Task): DelegationDecision {
  // 1. Check task complexity
  const complexity = analyzeComplexity(task);

  // 2. Check if skill exists for this task
  const matchingSkills = findMatchingSkills(task);

  // 3. Estimate token usage
  const estimatedTokens = estimateTokens(task);

  // Decision matrix
  if (complexity === 'simple' && estimatedTokens < 5000) {
    return {
      delegate: false,
      reason: 'Task too simple for delegation overhead'
    };
  }

  if (matchingSkills.length > 0 && estimatedTokens > 10000) {
    return {
      delegate: true,
      skill: matchingSkills[0],
      model: selectOptimalModel(task),
      reason: `Delegating to ${matchingSkills[0]} with ${selectOptimalModel(task)}`
    };
  }

  if (complexity === 'research') {
    return {
      delegate: true,
      skill: 'research-agent',
      model: 'haiku',
      reason: 'Research task - using Haiku for cost efficiency'
    };
  }

  if (complexity === 'coding' && estimatedTokens > 20000) {
    return {
      delegate: true,
      skill: 'coding-agent',
      model: 'sonnet',
      reason: 'Complex coding task - delegating to Sonnet agent'
    };
  }

  if (complexity === 'decision' || task.requires_architecture) {
    return {
      delegate: true,
      skill: 'decision-agent',
      model: 'opus',
      reason: 'Critical decision - using Opus for best reasoning'
    };
  }

  return {
    delegate: false,
    reason: 'Handling directly in current session'
  };
}
```

---

## 🤖 Agent Skill Configurations

### 1. Research Agent (Haiku)

**File**: `.claude/skills/research-agent/SKILL.md`

```markdown
# Research Agent

**Model**: Claude Haiku 4.5
**Cost**: $0.80/1M tokens
**Token Budget**: Unlimited (cheap model)

## Triggers
- User asks "How does X work?"
- User asks "Find all usages of Y"
- User asks "What files handle Z?"
- Codebase exploration tasks
- Documentation lookups

## Capabilities
- Code search (grep, glob)
- File reading and analysis
- Pattern detection
- Documentation retrieval (Context7)
- Symbol navigation (Serena)

## Example Delegations
```bash
# User: "Where is authentication handled?"
[Orchestrator] → Delegating to research-agent (Haiku)
[Research Agent] → Searching for "authentication" in codebase...
[Research Agent] → Found: src/context/AuthContext.tsx, src/services/auth.ts
[Research Agent] → Returning findings to orchestrator
[Orchestrator] → Synthesizing response for user
```

## Model Configuration
```json
{
  "model": "haiku",
  "temperature": 0.3,
  "max_tokens": 20000,
  "cost_threshold": 0.02 // Max $0.02 per invocation
}
```
```

---

### 2. Coding Agent (Sonnet)

**File**: `.claude/skills/coding-agent/SKILL.md`

```markdown
# Coding Agent

**Model**: Claude Sonnet 4.5
**Cost**: $24/1M tokens
**Token Budget**: 50,000 tokens/task

## Triggers
- Feature implementation
- Refactoring requests
- Component creation
- Service integration
- State management updates

## Capabilities
- Write production code
- Implement React components
- Create database migrations
- Integrate AI services
- Write tests (minimum 80% coverage)

## Guardrails
- MUST read existing code before modifying
- MUST follow shared_contract.md
- MUST include tests
- MUST validate with pre-commit hooks

## Example Delegations
```bash
# User: "Add a credit system to track user usage"
[Orchestrator] → Analyzing task: Feature implementation, multi-file, database changes
[Orchestrator] → Delegating to coding-agent (Sonnet) with 50k token budget
[Coding Agent] → Reading: server/src/db/schema.ts
[Coding Agent] → Creating migration: add_credits_to_users.sql
[Coding Agent] → Updating: src/context/AuthContext.tsx
[Coding Agent] → Writing tests: src/context/AuthContext.test.tsx
[Coding Agent] → Running pre-commit hooks...
[Coding Agent] → Task complete. Used 32k tokens ($0.77)
[Orchestrator] → Reviewing changes and presenting to user
```

## Model Configuration
```json
{
  "model": "sonnet",
  "temperature": 0.5,
  "max_tokens": 50000,
  "cost_threshold": 1.20, // Max $1.20 per task
  "enforce_tests": true,
  "enforce_types": true
}
```
```

---

### 3. Decision Agent (Opus)

**File**: `.claude/skills/decision-agent/SKILL.md`

```markdown
# Decision Agent

**Model**: Claude Opus 4.5
**Cost**: $120/1M tokens
**Token Budget**: 20,000 tokens/task (use sparingly!)

## Triggers
- Architecture decisions
- Trade-off analysis
- Complex refactoring plans
- Migration strategies
- Critical security decisions

## Capabilities
- Deep reasoning
- Multi-factor analysis
- Long-term consequence prediction
- Architectural pattern selection
- Risk assessment

## When NOT to Use
- Simple coding tasks (use Sonnet)
- Research/exploration (use Haiku)
- Bug fixes (use Debugging Agent)

## Example Delegations
```bash
# User: "Should we migrate from Vite to Next.js?"
[Orchestrator] → Critical architectural decision detected
[Orchestrator] → Delegating to decision-agent (Opus) with 20k token budget
[Decision Agent] → Analyzing current architecture...
[Decision Agent] → Evaluating migration costs:
  - Development time: 3-4 weeks
  - Risk level: Medium-High
  - Benefits: SSR, API routes, better SEO
  - Costs: Learning curve, breaking changes, testing overhead
[Decision Agent] → Trade-off analysis:
  For: Improved SEO, unified framework, better DX
  Against: High migration cost, current Vite setup works well
[Decision Agent] → Recommendation: Stay with Vite for now
  Reasoning: Current setup meets requirements, migration cost too high for current ROI
[Decision Agent] → Task complete. Used 18k tokens ($2.16)
[Orchestrator] → Presenting recommendation with reasoning to user
```

## Model Configuration
```json
{
  "model": "opus",
  "temperature": 0.7,
  "max_tokens": 20000,
  "cost_threshold": 2.40, // Max $2.40 per decision
  "require_reasoning": true,
  "require_alternatives": true
}
```
```

---

### 4. Debugging Agent (Sonnet)

**File**: `.claude/skills/debugging-agent/SKILL.md`

```markdown
# Debugging Agent

**Model**: Claude Sonnet 4.5
**Cost**: $24/1M tokens
**Token Budget**: 30,000 tokens/task

## Triggers
- Error messages in logs
- Performance issues
- Memory leaks
- API failures
- Unexpected behavior

## Capabilities
- Systematic debugging (root cause analysis)
- Stack trace interpretation
- Performance profiling
- Memory leak detection
- Chrome DevTools integration

## Debugging Methodology
1. Reproduce the issue
2. Gather context (logs, traces, state)
3. Hypothesize root causes
4. Test hypotheses systematically
5. Implement fix with regression test

## Example Delegations
```bash
# User: "Voice agent WebSocket keeps disconnecting"
[Orchestrator] → Debugging task detected
[Orchestrator] → Delegating to debugging-agent (Sonnet) with 30k token budget
[Debugging Agent] → Reading: src/services/openaiRealtimeClient.ts
[Debugging Agent] → Analyzing WebSocket lifecycle...
[Debugging Agent] → Checking logs for disconnect patterns...
[Debugging Agent] → Hypothesis 1: Network timeout (checking config)
[Debugging Agent] → Hypothesis 2: Token expiration (checking auth)
[Debugging Agent] → Found issue: No reconnect logic on connection drop
[Debugging Agent] → Implementing fix: Exponential backoff reconnect
[Debugging Agent] → Writing test: websocket-reconnect.test.ts
[Debugging Agent] → Task complete. Used 25k tokens ($0.60)
[Orchestrator] → Fix implemented, presenting to user
```

## Model Configuration
```json
{
  "model": "sonnet",
  "temperature": 0.3,
  "max_tokens": 30000,
  "cost_threshold": 0.72, // Max $0.72 per debugging session
  "require_tests": true,
  "systematic_methodology": true
}
```
```

---

### 5. Quick Tasks Agent (Haiku)

**File**: `.claude/skills/quick-tasks-agent/SKILL.md`

```markdown
# Quick Tasks Agent

**Model**: Claude Haiku 4.5
**Cost**: $0.80/1M tokens
**Token Budget**: 10,000 tokens/task

## Triggers
- Type error fixes
- Import sorting
- Linting fixes
- Simple text edits
- File renames/moves

## Capabilities
- Auto-fix TypeScript errors
- Sort imports
- Fix lint violations
- Update package versions
- Generate boilerplate

## Example Delegations
```bash
# User: "Fix the TypeScript errors in CanvasEditor.tsx"
[Orchestrator] → Simple type fixes, delegating to quick-tasks-agent (Haiku)
[Quick Tasks Agent] → Running: npx tsc --noEmit CanvasEditor.tsx
[Quick Tasks Agent] → Found 3 type errors
[Quick Tasks Agent] → Fixing: Missing return type on handleSave()
[Quick Tasks Agent] → Fixing: Implicit any on event parameter
[Quick Tasks Agent] → Fixing: Unused import 'React'
[Quick Tasks Agent] → Task complete. Used 4k tokens ($0.003)
[Orchestrator] → All type errors fixed
```

## Model Configuration
```json
{
  "model": "haiku",
  "temperature": 0.1,
  "max_tokens": 10000,
  "cost_threshold": 0.01 // Max $0.01 per task
}
```
```

---

## 🔄 Session Management: Collaborative Workflow

### Orchestrator-Agent Communication Protocol

```typescript
// Main Orchestrator Session
class OrchestratorSession {
  private activeAgents: Map<string, AgentSession> = new Map();

  async delegateTask(task: Task): Promise<Result> {
    // 1. Select appropriate agent and model
    const { agentType, model } = this.selectAgent(task);

    // 2. Create or resume agent session
    let agent = this.activeAgents.get(agentType);
    if (!agent) {
      agent = await this.spawnAgent(agentType, model);
      this.activeAgents.set(agentType, agent);
    }

    // 3. Send task with context
    const result = await agent.execute(task, {
      project_context: this.getProjectContext(),
      user_preferences: this.getUserPreferences(),
      token_budget: this.getTokenBudget(agentType),
      deadline: task.deadline
    });

    // 4. Monitor token usage
    this.trackTokenUsage(agentType, result.tokens_used);

    // 5. Return result to user
    return result;
  }

  private selectAgent(task: Task): { agentType: string; model: string } {
    const complexity = this.analyzeComplexity(task);
    const taskType = this.classifyTask(task);

    // Decision matrix
    if (taskType === 'research') {
      return { agentType: 'research-agent', model: 'haiku' };
    }

    if (taskType === 'coding' && complexity === 'simple') {
      return { agentType: 'quick-tasks-agent', model: 'haiku' };
    }

    if (taskType === 'coding' && complexity === 'medium') {
      return { agentType: 'coding-agent', model: 'sonnet' };
    }

    if (taskType === 'debugging') {
      return { agentType: 'debugging-agent', model: 'sonnet' };
    }

    if (taskType === 'decision' || complexity === 'critical') {
      return { agentType: 'decision-agent', model: 'opus' };
    }

    // Default: Handle in main session (orchestrator = Sonnet)
    return { agentType: 'main', model: 'sonnet' };
  }

  private analyzeComplexity(task: Task): 'simple' | 'medium' | 'complex' | 'critical' {
    const indicators = {
      simple: task.estimated_lines < 50 && !task.requires_tests && !task.touches_db,
      medium: task.estimated_lines < 200 && task.touches_files < 5,
      complex: task.estimated_lines > 200 || task.touches_files > 5,
      critical: task.architecture_decision || task.security_sensitive
    };

    if (indicators.critical) return 'critical';
    if (indicators.complex) return 'complex';
    if (indicators.medium) return 'medium';
    return 'simple';
  }

  private classifyTask(task: Task): string {
    const keywords = task.description.toLowerCase();

    if (keywords.includes('how') || keywords.includes('where') || keywords.includes('find')) {
      return 'research';
    }

    if (keywords.includes('fix error') || keywords.includes('debug') || keywords.includes('not working')) {
      return 'debugging';
    }

    if (keywords.includes('should we') || keywords.includes('architecture') || keywords.includes('migrate')) {
      return 'decision';
    }

    if (keywords.includes('implement') || keywords.includes('add') || keywords.includes('create')) {
      return 'coding';
    }

    return 'unknown';
  }
}
```

---

## 💬 User Communication: Transparent Delegation

### Orchestrator Messages to User

```bash
# Example 1: Research Task
User: "How does the voice agent handle reconnections?"

[Orchestrator]:
I'll delegate this research to a Haiku agent for cost efficiency.

[Delegating to: research-agent (Haiku)]
[Estimated cost: $0.01]
[Searching codebase for voice agent reconnection logic...]

[Research Agent]: Found reconnection logic in src/services/openaiRealtimeClient.ts:245
- Uses exponential backoff (2s, 4s, 8s, 16s, 32s max)
- Max 5 reconnection attempts
- Resets connection state on successful reconnect

[Tokens used: 5,200 | Cost: $0.004]

---

# Example 2: Coding Task
User: "Add a loading spinner to the generation button"

[Orchestrator]:
This is a simple UI task. I'll handle it directly without delegation.

[Reading: src/components/features/GenerativeSidebar.tsx]
[Adding loading state and spinner component]
[Writing test: GenerativeSidebar.test.tsx]
[Running pre-commit hooks...]

✅ Done. Added loading spinner with tests.
[Tokens used: 8,400 | Cost: $0.20]

---

# Example 3: Complex Feature
User: "Implement a credit system for tracking user AI usage"

[Orchestrator]:
This is a complex multi-component feature. Let me analyze the scope:
- Database schema change (users table)
- Backend API (credit deduction logic)
- Frontend state management (credit display)
- Estimated: 250 lines across 6 files

I recommend delegating this to a Sonnet coding agent.

[Delegating to: coding-agent (Sonnet)]
[Token budget: 50,000]
[Estimated cost: $1.20]

Proceed? (y/n)

User: y

[Coding Agent]: Starting implementation...
[Coding Agent]: Created migration: 20260113_add_credits.sql
[Coding Agent]: Updated: server/src/db/schema.ts
[Coding Agent]: Created: server/src/routes/credits.ts
[Coding Agent]: Updated: src/context/AuthContext.tsx
[Coding Agent]: Created: src/components/features/CreditDisplay.tsx
[Coding Agent]: Writing tests...
[Coding Agent]: All tests passing (85% coverage)

✅ Feature complete.
[Tokens used: 38,200 | Cost: $0.92]

---

# Example 4: Critical Decision
User: "Should we use Cognee or LangChain for our RAG pipeline?"

[Orchestrator]:
This is a critical architectural decision with long-term implications.
I recommend delegating to an Opus decision agent for deep analysis.

[Delegating to: decision-agent (Opus)]
[Token budget: 20,000]
[Estimated cost: $2.40]

Proceed? (y/n)

User: y

[Decision Agent]: Analyzing both options...
[Decision Agent]: Evaluating across 7 dimensions:
1. Integration complexity
2. Cost implications
3. Performance characteristics
4. Community support
5. Future scalability
6. Learning curve
7. Alignment with tech stack

[Decision Agent]: Trade-off Analysis:

**Cognee**
Pros:
- Already integrated in your stack
- Optimized for knowledge graphs
- Lower complexity for your use case
Cons:
- Smaller community
- Fewer pre-built chains

**LangChain**
Pros:
- Massive ecosystem
- Extensive documentation
- More flexibility
Cons:
- Overkill for current needs
- Steeper learning curve
- Higher token costs

**Recommendation**: Stay with Cognee
Reasoning:
- You're already using it successfully
- Simpler mental model for your team
- Lower migration risk
- Sufficient for current RAG needs
- Can migrate to LangChain later if requirements change

[Tokens used: 18,500 | Cost: $2.22]
```

---

## 📊 Cost Tracking Dashboard

### Token Usage Analytics

```typescript
// Real-time cost tracking
interface TokenUsageStats {
  session_id: string;
  agent_type: string;
  model: string;
  tasks_completed: number;
  total_tokens: number;
  total_cost_usd: number;
  avg_tokens_per_task: number;
  cost_savings_vs_opus: number; // If we used Opus for everything
}

// Example daily report
const dailyReport: TokenUsageStats[] = [
  {
    session_id: '2026-01-13',
    agent_type: 'research-agent',
    model: 'haiku',
    tasks_completed: 15,
    total_tokens: 78000,
    total_cost_usd: 0.062,
    avg_tokens_per_task: 5200,
    cost_savings_vs_opus: 9.36 // Would have cost $9.424 with Opus
  },
  {
    session_id: '2026-01-13',
    agent_type: 'coding-agent',
    model: 'sonnet',
    tasks_completed: 5,
    total_tokens: 145000,
    total_cost_usd: 3.48,
    avg_tokens_per_task: 29000,
    cost_savings_vs_opus: 13.92 // Would have cost $17.40 with Opus
  },
  {
    session_id: '2026-01-13',
    agent_type: 'decision-agent',
    model: 'opus',
    tasks_completed: 2,
    total_tokens: 35000,
    total_cost_usd: 4.20,
    avg_tokens_per_task: 17500,
    cost_savings_vs_opus: 0 // Already using Opus
  },
  {
    session_id: '2026-01-13',
    agent_type: 'quick-tasks-agent',
    model: 'haiku',
    tasks_completed: 12,
    total_tokens: 42000,
    total_cost_usd: 0.034,
    avg_tokens_per_task: 3500,
    cost_savings_vs_opus: 5.04 // Would have cost $5.074 with Opus
  }
];

// Daily totals
const dailyTotals = {
  total_tasks: 34,
  total_tokens: 300000,
  total_cost_usd: 7.776,
  cost_if_all_opus: 36.00,
  savings_percentage: 78.4%
};
```

### Cost Optimization Recommendations

```bash
# Automated cost analysis
[Orchestrator]: Daily cost report (2026-01-13)
Total spent: $7.78
Budget: $50/day
Remaining: $42.22 (84%)

Top cost drivers:
1. Decision Agent (Opus): $4.20 (54%)
2. Coding Agent (Sonnet): $3.48 (45%)
3. Research Agent (Haiku): $0.062 (<1%)
4. Quick Tasks Agent (Haiku): $0.034 (<1%)

Optimization opportunities:
- 2 decision tasks could have been handled by Sonnet (-$1.68 savings)
- Consider batching quick tasks to reduce session overhead

Projected monthly cost: $233.40 (well under $1000 budget)
```

---

## 🎯 Implementation: Orchestrator Skill

**File**: `.claude/skills/orchestrator/SKILL.md`

```markdown
# Orchestrator Skill

The main coordination layer that decides when to delegate and which model to use.

## Decision Matrix

| Task Type | Complexity | Model | Agent | Token Budget | Max Cost |
|-----------|------------|-------|-------|--------------|----------|
| Research | Any | Haiku | research-agent | Unlimited | $0.05 |
| Quick Edit | Simple | Haiku | quick-tasks-agent | 10k | $0.01 |
| Coding | Medium | Sonnet | coding-agent | 50k | $1.20 |
| Debugging | Any | Sonnet | debugging-agent | 30k | $0.72 |
| Decision | Critical | Opus | decision-agent | 20k | $2.40 |
| Review | Any | Opus | review-agent | 15k | $1.80 |

## Delegation Prompt Template

When delegating, the orchestrator uses this prompt:

```
You are a specialized {AGENT_TYPE} using {MODEL} model.

**Task**: {TASK_DESCRIPTION}

**Context**:
- Project: Nanobanna Pro (AI-powered LinkedIn banner design tool)
- Tech Stack: React + TypeScript + Vite + Tailwind CSS + Neon PostgreSQL
- Standards: See .claude/rules/shared_contract.md
- Budget: {TOKEN_BUDGET} tokens (${MAX_COST})

**Constraints**:
- Follow shared_contract.md strictly
- Include tests for all code changes (80% coverage minimum)
- Run pre-commit hooks before completing
- Return results in structured format

**Expected Output**:
{EXPECTED_OUTPUT_FORMAT}

Begin.
```

## Session State Management

```typescript
class OrchestratorState {
  activeAgents: Map<string, AgentSession>;
  taskQueue: Task[];
  tokenUsage: TokenTracker;
  costBudget: BudgetManager;

  async processTask(task: Task) {
    // 1. Classify and route
    const route = this.classifyAndRoute(task);

    // 2. Check budget
    if (!this.costBudget.canAfford(route.estimatedCost)) {
      return this.handleBudgetExceeded(task);
    }

    // 3. Delegate or handle directly
    if (route.delegate) {
      return await this.delegateToAgent(route.agentType, route.model, task);
    } else {
      return await this.handleDirectly(task);
    }
  }
}
```
```

---

*Agent Orchestration System for Nanobanna Pro - 2026-01-13*
*Version: 1.0.0*
