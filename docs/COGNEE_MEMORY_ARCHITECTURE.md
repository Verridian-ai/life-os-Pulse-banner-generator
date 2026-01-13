# Cognee Memory Architecture for Claude Code Agents

> **Research-Based Design**: Best practices from Cognee + LangChain + Claude SDK integration patterns

---

## Executive Summary

**Decision**: Use a **HYBRID approach** - NO dedicated "memory capture agent" needed.

Instead:
- ✅ **Pre-loading** for global knowledge (startup)
- ✅ **Agent-driven** via MCP tools (as needed)
- ✅ **Batch processing** for efficiency (scheduled cognify)

**Why**: Research shows batch processing is more efficient, and agents should control their own memory operations rather than a centralized capture agent.

---

## 1. Memory Capture Patterns (Research Summary)

### 1.1 Automatic vs Manual (From Claude SDK Integration)

| Approach | How It Works | Best For |
|----------|--------------|----------|
| **Automatic** | MCP tools exposed to agents; Claude decides when to store | Dynamic learning during conversations |
| **Manual** | Programmatic `cognee.add()` calls during setup | Pre-loading baseline knowledge |
| **Batch** | Queue many `add()` calls, single `cognify()` | Efficient processing of large datasets |

**Source**: [Claude SDK + Cognee Integration](https://www.cognee.ai/blog/integrations/claude-agent-sdk-persistent-memory-with-cognee-integration)

### 1.2 When to Call cognify() (Critical!)

From research: **"Add in batches and cognify once"** - NOT after every document!

**Why**:
- `cognify()` is computationally expensive (entity extraction, graph building, embeddings)
- Batch processing is "cheaper and easier to reason about"
- Best done during startup or scheduled maintenance windows

**Anti-Pattern** ❌:
```typescript
for (const doc of documents) {
  await cognee.add(doc);
  await cognee.cognify(); // DON'T DO THIS - Very expensive!
}
```

**Correct Pattern** ✅:
```typescript
// Add all documents first
for (const doc of documents) {
  await cognee.add(doc);
}
// Cognify once at the end
await cognee.cognify();
```

---

## 2. Recommended Architecture for Nanobanna Pro

### 2.1 Three-Tier Memory System

```
┌─────────────────────────────────────────────────────────────┐
│                   Memory Tier Structure                      │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. GLOBAL MEMORY (nanobanna_global)                        │
│     - Pre-loaded at startup                                 │
│     - CLAUDE.md, contracts, routes, design docs             │
│     - READ by all agents                                    │
│     - UPDATE via manual script only                         │
│                                                              │
│  2. AGENT MEMORY (agent_{name})                             │
│     - Agent-specific learnings                              │
│     - READ/WRITE by specific agent                          │
│     - Automatic via MCP tools                               │
│     - Batch cognify nightly                                 │
│                                                              │
│  3. SESSION MEMORY (session_{id})                           │
│     - Current task context                                  │
│     - READ/WRITE during session                             │
│     - DELETED after task completion                         │
│     - No cognify needed (ephemeral)                         │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 Agent Memory Operations (via MCP)

Each agent has access to these MCP tools:

| Tool | When to Use | Cognify? |
|------|-------------|----------|
| `mcp__cognee__search` | Query memory for context | N/A (read-only) |
| `mcp__cognee__add` | Store important finding | NO (batch later) |
| `mcp__cognee__cognify` | Process added content | ONLY at end of session |

**Flow Example**:
```
1. Agent starts task → search global + agent memory
2. Agent discovers pattern → add to agent memory
3. Agent discovers pattern → add to agent memory
4. Agent discovers pattern → add to agent memory
5. Agent completes task → cognify ONCE
```

### 2.3 Separation of Concerns (Multi-Agent)

**Research Finding**: Separate read and write permissions prevent "accidental pollution"

| Agent Type | Add | Search | Cognify | Use Case |
|------------|-----|--------|---------|----------|
| **Research Agent** | ✅ | ✅ | ✅ | Collector - gathers knowledge |
| **Coding Agent** | ✅ | ✅ | ✅ | Implementer - stores solutions |
| **QA Agent** | ❌ | ✅ | ❌ | Analyst - queries only |
| **Security Warden** | ❌ | ✅ | ❌ | Auditor - reads security patterns |

**Implementation**: Use sessionized tools per agent role.

---

## 3. Concrete Implementation Plan

### 3.1 Phase 4: Pre-Loading (Startup Script)

**File**: `scripts/preload-cognee-memory.ts`

```typescript
import { CogneeService } from '../server/src/services/cognee';

const GLOBAL_NAMESPACE = 'nanobanna_global';

async function preloadGlobalMemory() {
  console.log('🧠 Pre-loading global knowledge...');

  const documents = [
    'CLAUDE.md',
    '.claude/rules/shared_contract.md',
    'docs/ops/ROUTES.md',
    'docs/design/LIFE_OS_DESIGN_SYSTEM.md',
    'docs/ops/AGENT_CONTEXT.md',
    'README.md'
  ];

  // Add all documents FIRST (batch)
  for (const filePath of documents) {
    const content = await readFile(filePath, 'utf-8');
    await CogneeService.addText(GLOBAL_NAMESPACE, content, {
      filename: filePath,
      type: 'documentation'
    });
    console.log(`✅ Queued: ${filePath}`);
  }

  // Cognify ONCE at the end (efficient)
  console.log('🔄 Running cognify (this may take 1-2 minutes)...');
  await CogneeService.cognify(GLOBAL_NAMESPACE);
  console.log('✅ Global memory ready!');
}
```

**Run**: Once at startup, or when docs change significantly.

### 3.2 Phase 5: Agent Integration (MCP Tools)

**Update each agent skill** to include memory hooks:

```markdown
## Pre-Task Protocol

1. **Load Context from Memory**:
   ```typescript
   // Search global knowledge
   const globalContext = await mcp__cognee__search({
     query: "authentication patterns",
     dataset: "nanobanna_global",
     top_k: 5
   });

   // Search agent-specific learnings
   const agentContext = await mcp__cognee__search({
     query: "past solutions for similar tasks",
     dataset: "agent_research",
     top_k: 3
   });
   ```

2. **Work on Task**: Use retrieved context to inform decisions

3. **Store Learnings** (at end):
   ```typescript
   // Add findings (NO cognify yet)
   await mcp__cognee__add({
     content: "Found auth pattern in AuthContext.tsx using Supabase RLS with user.id filtering",
     dataset: "agent_research",
     metadata: { task_id: "T016", date: "2026-01-13" }
   });

   await mcp__cognee__add({
     content: "Best practice: Always include accessibility fallbacks for glass effects",
     dataset: "agent_research",
     metadata: { category: "ui-patterns" }
   });

   // Cognify ONCE at end
   await mcp__cognee__cognify({ dataset: "agent_research" });
   ```
```

**Key Point**: Agents control their own memory operations via MCP tools.

### 3.3 Optional: Scheduled Batch Cognify

**For heavy usage**, run a nightly job to process accumulated memories:

```typescript
// scripts/nightly-cognify.ts
async function cognifyAllAgentMemories() {
  const agents = ['agent_research', 'agent_coding', 'agent_debugging'];

  for (const agent of agents) {
    console.log(`Processing ${agent}...`);
    await CogneeService.cognify(agent);
  }

  console.log('✅ All agent memories processed');
}
```

**Run**: Via cron or Task Scheduler at 2 AM daily.

---

## 4. Do We Need a Dedicated "Memory Capture Agent"?

### Answer: **NO** ❌

**Why Not**:

1. **Overhead**: Extra agent adds latency and cost
2. **Loss of Control**: Agents know best when findings are important
3. **Batch Inefficiency**: Central agent would need to buffer/batch anyway
4. **Research Finding**: "Separation of concerns" means agents manage their own memory

**Instead**: Use the hybrid approach above.

### What About Automatic Hooks?

**Optional Enhancement** (not required):

You could add a `PostToolUse` hook that automatically captures important outputs:

```typescript
// scripts/claude-hooks/post-tool-use.ts
export async function postToolUse(toolName: string, result: any) {
  // Auto-capture significant events
  if (toolName === 'Write' || toolName === 'Edit') {
    await cognee.add(
      `Agent modified ${result.file_path}: ${result.summary}`,
      `session_${getCurrentSessionId()}`
    );
  }
}
```

**But**: This is an optimization, not a requirement. Start with explicit agent control.

---

## 5. Cost Analysis

### Embedding Model: text-embedding-3-small

| Operation | Tokens | Cost |
|-----------|--------|------|
| **Embed 1,000 docs** | ~500K tokens | **$0.01** |
| **Embed 10,000 docs** | ~5M tokens | **$0.10** |
| **Search query** | ~1K tokens | **$0.00002** |

**vs text-embedding-3-large**:
- Large: $0.13 per 1M tokens
- Small: $0.02 per 1M tokens
- **Savings**: 6.5x cheaper!

**Performance**:
- Small: 1536 dimensions (same as Ada-002)
- Large: 3072 dimensions (better accuracy, but 6.5x cost)

**Verdict**: text-embedding-3-small is perfect for code/docs - excellent accuracy at 6.5x lower cost.

**Source**: [OpenAI Pricing](https://openai.com/api/pricing/)

### LLM Model: GPT-5.2

| Operation | Tokens | Cost |
|-----------|--------|------|
| **Cognify 100 docs** | ~50K tokens | ~$0.05 |
| **Extract entities** | ~10K per doc | $0.10 per 100 docs |

**Total Cost Estimate**: $5-10/month for heavy usage (10K+ docs)

---

## 6. Implementation Checklist

### Phase 4: Pre-Loading ✅
- [ ] Create `scripts/preload-cognee-memory.ts`
- [ ] Add global docs (CLAUDE.md, contracts, routes)
- [ ] Run cognify ONCE
- [ ] Verify search returns relevant results
- [ ] Document update procedure

### Phase 5: Agent Integration ✅
- [ ] Update Research Agent with memory hooks
- [ ] Update Coding Agent with memory hooks
- [ ] Update Debugging Agent with memory hooks
- [ ] Update Decision Agent with memory hooks
- [ ] Update Quick Tasks Agent with memory hooks
- [ ] Test cross-agent memory sharing
- [ ] Measure token savings

### Optional Enhancements 🔮
- [ ] PostToolUse hook for automatic capture
- [ ] Nightly batch cognify job
- [ ] Memory dashboard (stats, graph viz)
- [ ] Cleanup job for old session memory

---

## 7. Key Takeaways

1. **No dedicated memory agent needed** - Agents manage their own memory
2. **Batch cognify() calls** - Add many, cognify once
3. **Pre-load global knowledge** - One-time startup operation
4. **Agent-driven via MCP** - Each agent controls what/when to store
5. **Separation of concerns** - Some agents read-only, some read/write
6. **text-embedding-3-small** - 6.5x cheaper, excellent for code/docs
7. **GPT-5.2** - 400K context, perfect for large codebases

---

## References

**Memory Capture Patterns**:
- [Claude SDK + Cognee Integration](https://www.cognee.ai/blog/integrations/claude-agent-sdk-persistent-memory-with-cognee-integration)
- [Building Persistent Memory in AI Agents](https://www.cognee.ai/blog/tutorials/beyond-recall-building-persistent-memory-in-ai-agents-with-cognee)
- [LangChain Middleware Patterns](https://medium.com/@ale.garavaglia/langchain-middlewares-lightweight-hooks-for-more-structured-agents-f0abba828934)

**Best Practices**:
- [Cognee Multi-Agent Systems](https://www.cognee.ai/blog/integrations/google-adk-cognee-integration-build-agents-with-persistent-memory)
- [LangGraph + Cognee Integration](https://www.cognee.ai/blog/integrations/langgraph-cognee-integration-build-langgraph-agents-with-persistent-cognee-memory)

---

*Last Updated: 2026-01-13*
*Architecture Version: 1.0*
