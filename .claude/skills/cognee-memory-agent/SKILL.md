# Cognee Memory Agent

**Model**: Claude Haiku 4.5
**Cost**: $0.80/1M tokens
**Token Budget**: 20,000 tokens/execution
**Execution**: Automatic (pre-task) + on-demand

---

## Purpose

State-of-the-art persistent memory and knowledge management using Cognee GraphRAG. This agent provides intelligent context retrieval, knowledge storage, and cross-agent memory sharing for the entire Claude Skills ecosystem.

**Key Innovation**: Replaces traditional RAG with unified memory layer combining vector embeddings + knowledge graphs for 92.5% accuracy in multi-hop reasoning.

---

## Triggers

### Automatic Pre-Task Activation

All agent skills automatically query Cognee memory before starting work:
- "What do we know about [topic]?"
- "Find similar past solutions"
- "Load context for this task"

### Manual Activation

```bash
/skill cognee-memory-agent "Search for authentication patterns"
/skill cognee-memory-agent "Store this learning: [content]"
/skill cognee-memory-agent "Build knowledge graph from docs"
```

### Background Processing

```bash
# Scheduled: Daily at 3 AM
cognee-memory-agent --mode batch-cognify
```

---

## Capabilities

### 1. Memory Search (Read)

**Vector + Graph Search**:
```typescript
// Semantic similarity search
cognee.search({
  query: "How do we handle authentication?",
  dataset: "nanobanna_global",
  top_k: 5
})

// Multi-hop reasoning
cognee.search({
  query: "What components use useAIContext and how do they connect to LLM services?",
  dataset: "nanobanna_global",
  reasoning: "chain-of-thought"
})
```

**Use Cases**:
- Pre-task context loading
- Pattern discovery
- Solution retrieval
- Dependency mapping

---

### 2. Memory Storage (Write)

**Add to Memory** (batch-friendly):
```typescript
// Store findings
await cognee.add({
  content: "Auth pattern: Supabase RLS with auth.uid() policies",
  dataset: "agent_research",
  metadata: {
    task_id: "T016",
    agent: "research-agent",
    category: "authentication"
  }
})

// Store code pattern
await cognee.add({
  content: `
    React Context Pattern:
    - AuthContext provides user, session, signIn, signOut
    - Wrapped by <AuthProvider> in App.tsx
    - Protected routes check user existence
  `,
  dataset: "agent_coding",
  metadata: {
    file: "src/context/AuthContext.tsx",
    pattern: "context-provider"
  }
})
```

**Important**: Add MANY items, cognify ONCE (batch processing)

---

### 3. Knowledge Graph Generation (Cognify)

**Process Memory** (expensive operation):
```typescript
// Run after batch adds
await cognee.cognify("nanobanna_global")

// What it does:
// 1. Entity extraction (people, places, concepts)
// 2. Relationship mapping (A relates to B)
// 3. Graph construction (Neo4j/NetworkX)
// 4. Vector embeddings (LanceDB)
// 5. Index building
```

**When to Run**:
- ✅ End of work session (10+ new items)
- ✅ Nightly batch (scheduled)
- ✅ After major doc updates
- ❌ After every single add (TOO EXPENSIVE)

---

### 4. Memory Algorithms (Memify)

**Advanced Processing**:
```typescript
// Discover patterns and connections
await cognee.memify("nanobanna_global")

// What it does:
// - Pattern recognition across documents
// - Inferred relationships
// - Concept clustering
// - Anomaly detection
```

---

## Three-Tier Memory Architecture

### Tier 1: Global Memory (nanobanna_global)

**What**: Project-wide knowledge
**Who Reads**: All agents
**Who Writes**: Automated preload script
**Cognify**: On doc changes only

**Contents**:
- CLAUDE.md (orchestration manual)
- shared_contract.md (standards)
- ROUTES.md (routing)
- LIFE_OS_DESIGN_SYSTEM.md (UI patterns)
- README.md (project overview)

**Example Query**:
```typescript
cognee.search({
  query: "What are the neumorphism design requirements?",
  dataset: "nanobanna_global"
})
```

---

### Tier 2: Agent Memory (agent_{name})

**What**: Agent-specific learnings
**Who Reads**: Specific agent + orchestrator
**Who Writes**: Specific agent
**Cognify**: Nightly batch

**Per-Agent Datasets**:
- `agent_research` - Code patterns, file locations
- `agent_coding` - Solutions implemented, bug fixes
- `agent_debugging` - Error patterns, root causes
- `agent_qa` - Test patterns, coverage issues
- `agent_chrome_ui` - Visual bugs, layout issues
- `agent_security` - Vulnerabilities found, fixes applied

**Example Query**:
```typescript
// Research agent finds similar past work
cognee.search({
  query: "Where did we store API keys before?",
  dataset: "agent_research"
})
```

---

### Tier 3: Session Memory (session_{id})

**What**: Current task context
**Who Reads**: Current agent
**Who Writes**: Current agent
**Cognify**: NEVER (ephemeral)

**Lifecycle**:
1. Created at task start
2. Used during task
3. Deleted at task end

**Example**:
```typescript
// Store temporary context
cognee.add({
  content: "User wants to add credit tracking to dashboard",
  dataset: "session_T016",
  metadata: { ephemeral: true }
})

// Query during task
cognee.search({
  query: "What are the user's requirements?",
  dataset: "session_T016"
})

// Delete after task
cognee.delete("session_T016")
```

---

## Agent-Specific Memory Operations

### Research Agent (Read/Write)

**Pre-Task**:
```typescript
// Load global context
const globalContext = await cognee.search({
  query: task.description,
  dataset: "nanobanna_global"
})

// Load past findings
const agentContext = await cognee.search({
  query: task.description,
  dataset: "agent_research"
})
```

**Post-Task**:
```typescript
// Store findings (batch)
for (const finding of discoveries) {
  await cognee.add({
    content: finding.description,
    dataset: "agent_research",
    metadata: finding.metadata
  })
}

// Cognify if many items added
if (discoveries.length > 5) {
  await cognee.cognify("agent_research")
}
```

---

### Coding Agent (Read/Write)

**Pre-Task**:
```typescript
// Search for similar implementations
const pastSolutions = await cognee.search({
  query: "How did we implement [feature] before?",
  dataset: "agent_coding"
})
```

**Post-Task**:
```typescript
// Store solution
await cognee.add({
  content: `
    Implemented ${feature.name}:
    - Files: ${feature.files.join(', ')}
    - Pattern: ${feature.pattern}
    - Tests: ${feature.tests}
  `,
  dataset: "agent_coding"
})
```

---

### QA Agent (Read Only)

**Pre-Task**:
```typescript
// Find test patterns
const testPatterns = await cognee.search({
  query: "What test patterns exist for [component]?",
  dataset: "agent_qa"
})
```

**No Write**: QA agent only reads, doesn't store

---

### Chrome UI Browser (Write Important Findings)

**Post-Task**:
```typescript
// Store visual bugs found
await cognee.add({
  content: "Layout issue: Canvas safe zone shifted 8px right on /studio",
  dataset: "agent_chrome_ui",
  metadata: {
    url: "/studio",
    severity: "medium",
    screenshot: ".claude/screenshots/diff-studio-2026-01-13.png"
  }
})
```

---

## Tools Available

| Tool | Purpose | Frequency |
|------|---------|-----------|
| **Cognee.search** | Query memory | Very High |
| **Cognee.add** | Store findings | High |
| **Cognee.cognify** | Build knowledge graph | Low (batch) |
| **Cognee.memify** | Advanced processing | Very Low (scheduled) |
| **Read** | Load documents for preload | Low |
| **Grep/Glob** | Find files to index | Medium |

**Forbidden**: `Edit`, `Write` to code (memory only, no code modification)

---

## Configuration

File: `.claude/skills/cognee-memory-agent/config.json`

```json
{
  "enabled": true,
  "auto_activate_pre_task": true,
  "cognee_config": {
    "api_url": "http://localhost:8000",
    "api_key": "${COGNEE_API_KEY}"
  },
  "datasets": {
    "global": "nanobanna_global",
    "agents": {
      "research": "agent_research",
      "coding": "agent_coding",
      "debugging": "agent_debugging",
      "qa": "agent_qa",
      "chrome_ui": "agent_chrome_ui",
      "security": "agent_security"
    }
  },
  "batch_cognify": {
    "enabled": true,
    "schedule": "0 3 * * *",
    "threshold": 10
  },
  "memory_retention": {
    "global": "permanent",
    "agent": "6 months",
    "session": "1 hour"
  }
}
```

---

## Integration with All Skills

### Pre-Task Protocol (All Skills)

```markdown
## Before Starting Work

1. **Load Global Context**:
   ```
   Query: "{task description}"
   Dataset: nanobanna_global
   Result: Project-wide patterns and standards
   ```

2. **Load Agent Context**:
   ```
   Query: "{task description}"
   Dataset: agent_{skill_name}
   Result: Past solutions and learnings
   ```

3. **Start Work**: Use retrieved context to inform decisions
```

### Post-Task Protocol (Write-Enabled Skills)

```markdown
## After Completing Work

1. **Store Learnings**:
   ```
   Add findings to agent_{skill_name}
   Do NOT cognify yet (batch later)
   ```

2. **Batch Cognify** (if threshold met):
   ```
   If 10+ items added today → cognify
   Otherwise → wait for nightly batch
   ```
```

---

## Preload Script

File: `scripts/preload-cognee-memory.ts`

```typescript
import { CogneeService } from '../server/src/services/cognee';
import { readFile } from 'fs/promises';

const GLOBAL_NAMESPACE = 'nanobanna_global';

async function preloadGlobalMemory() {
  console.log('🧠 Pre-loading Cognee global memory...');

  const documents = [
    'CLAUDE.md',
    '.claude/rules/shared_contract.md',
    'docs/ops/ROUTES.md',
    'docs/design/LIFE_OS_DESIGN_SYSTEM.md',
    'README.md',
    'package.json'
  ];

  // BATCH ADD (efficient)
  for (const filePath of documents) {
    const content = await readFile(filePath, 'utf-8');
    await CogneeService.addText(GLOBAL_NAMESPACE, content, {
      filename: filePath,
      type: 'documentation'
    });
    console.log(`✅ Queued: ${filePath}`);
  }

  // COGNIFY ONCE (efficient)
  console.log('🔄 Running cognify (1-2 minutes)...');
  await CogneeService.cognify(GLOBAL_NAMESPACE);
  console.log('✅ Global memory ready!');

  // Optional: Memify for advanced processing
  console.log('🧠 Running memify (pattern discovery)...');
  await CogneeService.memify(GLOBAL_NAMESPACE);
  console.log('✅ Memory algorithms complete!');
}

preloadGlobalMemory().catch(console.error);
```

**Run**: `npm run preload-memory` (once at startup)

---

## Nightly Batch Cognify

File: `scripts/batch-cognify-agents.ts`

```typescript
import { CogneeService } from '../server/src/services/cognee';

const AGENT_DATASETS = [
  'agent_research',
  'agent_coding',
  'agent_debugging',
  'agent_qa',
  'agent_chrome_ui',
  'agent_security'
];

async function batchCognifyAllAgents() {
  console.log('🧠 Running nightly batch cognify...');

  for (const dataset of AGENT_DATASETS) {
    console.log(`Processing ${dataset}...`);

    try {
      await CogneeService.cognify(dataset);
      console.log(`✅ ${dataset} cognified`);
    } catch (error) {
      console.error(`❌ ${dataset} failed:`, error);
    }
  }

  console.log('✅ Batch cognify complete!');
}

batchCognifyAllAgents().catch(console.error);
```

**Cron**: `0 3 * * *` (3 AM daily)

---

## Success Metrics

| Metric | Target | Current | Status |
|--------|--------|---------|--------|
| Memory recall accuracy | >90% | TBD | 🟡 |
| Multi-hop reasoning | >85% | TBD | 🟡 |
| Token savings (vs no memory) | >60% | TBD | 🟡 |
| Pre-task context load time | <2s | TBD | 🟡 |
| Cognify execution time | <3min | TBD | 🟡 |
| Agent memory utilization | >80% | TBD | 🟡 |

---

## Example Invocations

### Example 1: Pre-Task Context Loading

```
[Coding Agent - Starting Task T016]

[Cognee Memory]:
Loading context for "Add credit tracking system"...

Global memory found:
- Database schema standards (RLS required)
- React Context patterns (4 existing contexts)
- API structure (FastAPI backend)

Agent memory found:
- Similar feature: User profile credits (T003)
- Pattern: Supabase table + React Query + Context
- Learnings: Use pessimistic updates for credits

Context loaded. Proceeding with informed approach.

[Tokens saved: ~3,000 vs from-scratch approach]
```

---

### Example 2: Storing Learnings

```
[Research Agent - Completed Task]

[Cognee Memory]:
Storing 7 findings to agent_research...

Findings:
1. Auth pattern: Supabase RLS with auth.uid()
2. Context architecture: 4 React contexts (Auth, AI, Canvas, Voice)
3. API routing: /api/* proxied to FastAPI backend
4. Image generation: OpenRouter with Gemini
5. Database: Neon PostgreSQL with RLS enabled
6. Testing: Vitest for unit, Playwright for E2E
7. Deployment: GitHub Actions → Cloud Run

✅ 7 items queued
⏳ Batch cognify scheduled for 3 AM

[Tokens used: 2,400 for storage]
```

---

### Example 3: Multi-Hop Reasoning

```
User: "How does the voice agent connect to AI services?"

[Cognee Memory]:
Performing multi-hop query...

Chain of thought:
1. Voice agent uses OpenAI Realtime API
2. Voice commands trigger ActionExecutor
3. ActionExecutor calls LLM service
4. LLM service uses ModelRouter
5. ModelRouter selects Gemini/OpenRouter
6. Results flow back through contexts

Answer: Voice agent → ActionExecutor → LLM → ModelRouter → AI providers

[Tokens used: 1,800 with memory vs 8,000 without]
```

---

## Notes

- **State-of-the-Art**: Uses GraphRAG (92.5% accuracy vs 40% traditional RAG)
- **Cost-Effective**: Haiku model for memory operations
- **Batch Processing**: Add many, cognify once (efficient)
- **Context Isolation**: Memory queries don't pollute orchestrator context
- **Auto-Integration**: All skills automatically use pre-task memory loading
- **Retention Policies**: Global permanent, agent 6 months, session 1 hour

---

*Cognee Memory Agent - State-of-the-Art Persistent Memory*
*Version: 1.0.0 - 2026-01-13*
