# Orchestrator Skill

**Role**: Main coordination layer
**Model**: Sonnet 4.5 (your current session)
**Purpose**: Decide when and how to delegate tasks to specialized agents

---

## Decision Matrix

| Task Type | Complexity | Model | Agent | Token Budget | Max Cost |
|-----------|------------|-------|-------|--------------|----------|
| Research | Any | Haiku | research-agent | Unlimited | $0.05 |
| Quick Edit | Simple (<50 lines) | Haiku | quick-tasks-agent | 10k | $0.01 |
| Coding | Medium (50-500 lines) | Sonnet | coding-agent | 50k | $1.20 |
| Debugging | Any | Sonnet | debugging-agent | 30k | $0.72 |
| Decision | Critical | Opus | decision-agent | 20k | $2.40 |

---

## Task Classification Logic

### Step 1: Analyze User Request

```typescript
function classifyTask(userMessage: string): TaskClassification {
  const keywords = userMessage.toLowerCase();

  // Research patterns
  if (keywords.match(/how does|where is|find all|what files|search for/)) {
    return { type: 'research', model: 'haiku', agent: 'research-agent' };
  }

  // Debugging patterns
  if (keywords.match(/error|bug|not working|broken|failing|performance issue|memory leak/)) {
    return { type: 'debugging', model: 'sonnet', agent: 'debugging-agent' };
  }

  // Decision patterns
  if (keywords.match(/should we|migrate to|architecture|trade-off|vs\b|compare|which is better/)) {
    return { type: 'decision', model: 'opus', agent: 'decision-agent' };
  }

  // Quick fix patterns
  if (keywords.match(/fix type|sort imports|format|add comment|rename/)) {
    return { type: 'quick-fix', model: 'haiku', agent: 'quick-tasks-agent' };
  }

  // Coding patterns
  if (keywords.match(/implement|add|create|refactor|update|build/)) {
    return estimateComplexity(userMessage);
  }

  // Default: Handle in main session
  return { type: 'main', model: 'sonnet', agent: 'orchestrator' };
}
```

### Step 2: Estimate Complexity

```typescript
function estimateComplexity(userMessage: string): TaskClassification {
  const indicators = {
    simple: userMessage.match(/simple|quick|small|just/),
    medium: userMessage.match(/feature|component|service|integration/),
    complex: userMessage.match(/system|architecture|migration|refactor entire/),
  };

  if (indicators.simple) {
    return { type: 'coding-simple', model: 'haiku', agent: 'quick-tasks-agent' };
  }

  if (indicators.complex) {
    // Break into smaller tasks or use Decision Agent for planning
    return { type: 'decision', model: 'opus', agent: 'decision-agent' };
  }

  // Default: Medium complexity
  return { type: 'coding', model: 'sonnet', agent: 'coding-agent' };
}
```

---

## Delegation Protocol

### When to Delegate

✅ **DO delegate when:**
- Task clearly matches an agent's specialty
- Estimated tokens > 10,000
- Can save cost with cheaper model (Haiku vs Sonnet)
- Task is well-defined and self-contained
- No back-and-forth needed with user

❌ **DON'T delegate when:**
- Task is trivial (<5k tokens estimated)
- Requires continuous user interaction
- Ambiguous requirements (clarify first)
- Multiple subtasks need coordination
- Real-time collaboration needed

### Delegation Message Format

```
User: [USER_REQUEST]

[Orchestrator]:
I'll delegate this [TASK_TYPE] to [AGENT_NAME] using [MODEL] for cost efficiency.

[Delegating to: AGENT_NAME (MODEL)]
[Estimated cost: $X.XX]
[Token budget: XXk]
[DESCRIPTION_OF_WHAT_AGENT_WILL_DO]

[Wait for agent completion...]

[AGENT_NAME]: [AGENT_RESULT]

[Orchestrator]: [SYNTHESIZE_AND_PRESENT_TO_USER]
```

---

## Example Decision Trees

### Example 1: "How does authentication work?"
```
Input: "How does authentication work in this codebase?"

Classification:
- Keywords: "how does", "work"
- Type: Research
- Model: Haiku
- Agent: research-agent

Decision: DELEGATE
- Estimated tokens: 8k
- Cost: $0.006
- Rationale: Pure exploration, no code changes, use cheapest model

Output:
[Delegating to: research-agent (Haiku)]
[Estimated cost: $0.01]
```

### Example 2: "Add loading spinner"
```
Input: "Add a loading spinner to the generate button"

Classification:
- Keywords: "add"
- Type: Coding
- Estimated lines: ~30
- Files affected: 1-2

Decision: HANDLE DIRECTLY
- Estimated tokens: 6k
- Cost: $0.14 (Sonnet)
- Rationale: Simple enough for main session, no delegation overhead

Output:
[Handling directly without delegation]
```

### Example 3: "Implement credit system"
```
Input: "Implement a credit system for tracking user AI usage"

Classification:
- Keywords: "implement", "system"
- Type: Coding
- Estimated lines: 200-300
- Files affected: 6+

Decision: DELEGATE
- Model: Sonnet
- Agent: coding-agent
- Token budget: 50k
- Cost: ~$1.00

Output:
[Delegating to: coding-agent (Sonnet)]
[Estimated cost: $1.20]
[Will implement database migration, API routes, frontend state, tests]
```

### Example 4: "Fix TypeScript errors"
```
Input: "Fix the TypeScript errors in CanvasEditor.tsx"

Classification:
- Keywords: "fix", "errors"
- Type: Quick Fix
- Estimated errors: 2-3
- Files: 1

Decision: DELEGATE
- Model: Haiku
- Agent: quick-tasks-agent
- Rationale: Simple fixes, use cheapest model

Output:
[Delegating to: quick-tasks-agent (Haiku)]
[Estimated cost: $0.003]
```

### Example 5: "Voice agent disconnects"
```
Input: "Voice agent WebSocket keeps disconnecting after 30 seconds"

Classification:
- Keywords: "disconnecting", "issue"
- Type: Debugging
- Complexity: Medium

Decision: DELEGATE
- Model: Sonnet
- Agent: debugging-agent
- Token budget: 30k
- Cost: ~$0.60

Output:
[Delegating to: debugging-agent (Sonnet)]
[Estimated cost: $0.72]
[Will investigate, find root cause, implement fix with regression test]
```

### Example 6: "Should we use Redux?"
```
Input: "Should we switch from Context API to Redux Toolkit?"

Classification:
- Keywords: "should we", "switch"
- Type: Decision
- Impact: High (state management affects everything)

Decision: DELEGATE
- Model: Opus
- Agent: decision-agent
- Token budget: 20k
- Cost: ~$2.00

Output:
[Delegating to: decision-agent (Opus)]
[Estimated cost: $2.40]
[Will analyze trade-offs, provide recommendation with reasoning]

Note: First ask user for approval due to high cost
```

---

## Cost Awareness

### Before Delegating

```typescript
function shouldDelegate(task: Task): { delegate: boolean; reason: string } {
  const localCost = estimateTokens(task) * SONNET_COST_PER_TOKEN;
  const delegatedCost = estimateTokens(task) * getModelCost(task.agent);
  const savings = localCost - delegatedCost;

  if (savings > 0.10) {
    return {
      delegate: true,
      reason: `Save $${savings.toFixed(2)} by using ${task.model}`
    };
  }

  if (task.estimatedTokens > 20000) {
    return {
      delegate: true,
      reason: `Large task (${task.estimatedTokens} tokens) - isolate in separate session`
    };
  }

  return {
    delegate: false,
    reason: `Too simple for delegation overhead (${task.estimatedTokens} tokens)`
  };
}
```

---

## Session Management

### Active Agent Tracking

```typescript
interface ActiveSession {
  agent_id: string;
  agent_type: string;
  model: string;
  task: Task;
  start_time: number;
  tokens_used: number;
  cost_usd: number;
  status: 'running' | 'completed' | 'failed';
}

class SessionManager {
  private activeSessions: Map<string, ActiveSession> = new Map();

  async delegateTask(task: Task) {
    const session: ActiveSession = {
      agent_id: generateId(),
      agent_type: task.agent,
      model: task.model,
      task,
      start_time: Date.now(),
      tokens_used: 0,
      cost_usd: 0,
      status: 'running'
    };

    this.activeSessions.set(session.agent_id, session);

    try {
      const result = await this.executeAgent(session);
      session.status = 'completed';
      session.tokens_used = result.tokens;
      session.cost_usd = result.cost;
      return result;
    } catch (error) {
      session.status = 'failed';
      throw error;
    } finally {
      this.logSession(session);
    }
  }
}
```

---

## Success Metrics

Track these for each delegation:
- **Cost savings** vs handling in main session
- **Time to completion**
- **User satisfaction** (task completed correctly)
- **Escalation rate** (agent had to escalate)

---

## Notes

- Always explain delegation to user ("I'll delegate this to...")
- Show estimated cost before expensive delegations (>$1)
- For Opus delegations, ask user approval first
- Track daily/weekly/monthly agent usage and costs
- Optimize delegation thresholds based on actual results
