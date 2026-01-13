# Skill Creator Agent - Self-Healing System

**Model**: Claude Opus 4.5 (requires high-quality skill generation)
**Cost**: $120/1M tokens
**Token Budget**: 30,000 tokens/execution
**Execution**: On-demand (when skill gaps detected)

---

## Purpose

Create a **self-healing agent ecosystem** that automatically detects capability gaps and generates new Claude Skills to fill them, ensuring the system continuously evolves to meet emerging needs.

---

## Core Capabilities

### 1. Skill Gap Detection

**Detection Triggers**:
- User request doesn't match any existing skill's triggers
- Task requires tools not allocated to any skill
- Repeated manual orchestrator interventions for similar tasks
- User explicitly requests "create a skill for X"

**Gap Detection Algorithm**:
```typescript
interface SkillGap {
  id: string;
  detectedAt: Date;
  missingCapability: string;
  frequency: number;
  contextSamples: string[];
  suggestedSkillName: string;
  estimatedComplexity: 'simple' | 'medium' | 'complex';
  requiredTools: string[];
  suggestedModel: 'haiku' | 'sonnet' | 'opus';
}

function detectGap(task: Task, availableSkills: Skill[]): SkillGap | null {
  // 1. Analyze task requirements
  const requirements = extractRequirements(task);

  // 2. Calculate coverage by existing skills
  const coverage = calculateCoverage(requirements, availableSkills);

  // 3. If coverage < 80%, gap detected
  if (coverage < 0.8) {
    return {
      id: generateGapId(),
      detectedAt: new Date(),
      missingCapability: identifyMissing(requirements, coverage),
      frequency: 1,
      contextSamples: [task.description],
      suggestedSkillName: generateSkillName(requirements),
      estimatedComplexity: estimateComplexity(requirements),
      requiredTools: identifyRequiredTools(requirements),
      suggestedModel: selectOptimalModel(requirements)
    };
  }

  return null;
}
```

---

### 2. Gap Frequency Tracking

**Threshold System**:
- **1 occurrence**: Log gap, no action
- **2 occurrences**: Alert user, ask if skill needed
- **3+ occurrences**: Auto-generate skill (with approval)

**Storage**: `.claude/detected-gaps.json`

```json
{
  "gaps": [
    {
      "id": "gap-001",
      "capability": "kubernetes-manifest-validation",
      "frequency": 3,
      "last_seen": "2026-01-13T15:30:00Z",
      "status": "skill-generated",
      "skill_name": "k8s-validator-agent"
    },
    {
      "id": "gap-002",
      "capability": "sql-query-optimization",
      "frequency": 2,
      "last_seen": "2026-01-13T14:15:00Z",
      "status": "pending",
      "user_notified": true
    }
  ]
}
```

---

### 3. Skill Generation Pipeline

**Step 1: Requirements Analysis**

```
Input: Skill gap data
Output: Detailed skill specification

Process:
1. Analyze task patterns that triggered gap
2. Identify common tools/capabilities needed
3. Determine optimal model (Haiku/Sonnet/Opus)
4. Calculate token budget
5. Define success metrics
```

**Step 2: Skill Definition Generation**

Uses **Decision Agent (Opus)** to generate high-quality skill definition:

```
PROMPT TEMPLATE:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Generate a Claude Skill definition for:

Missing Capability: ${gap.missingCapability}
Frequency: ${gap.frequency} occurrences
Complexity: ${gap.estimatedComplexity}

Context (sample tasks that triggered this gap):
${gap.contextSamples.map((s, i) => `${i+1}. ${s}`).join('\n')}

Required Tools: ${gap.requiredTools.join(', ')}
Suggested Model: ${gap.suggestedModel}

Generate a complete SKILL.md with:
1. Purpose (1 paragraph)
2. Triggers (5-10 patterns)
3. Capabilities (detailed list)
4. Tools Available (with usage examples)
5. Model Configuration (model, cost, budget)
6. Example Invocations (3 real-world scenarios)
7. Success Metrics (measurable KPIs)
8. Integration Instructions

Format as professional SKILL.md markdown.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**Step 3: Skill Validation**

```typescript
async function validateGeneratedSkill(skillDef: SkillDefinition): Promise<ValidationResult> {
  const checks = [
    validateStructure(skillDef),      // Has all required sections
    validateTools(skillDef),           // Tools exist and are allowed
    validateTriggers(skillDef),        // Trigger patterns are valid regex
    validateBudget(skillDef),          // Token budget is reasonable
    validateNoConflicts(skillDef),     // Doesn't overlap existing skills
    validateMetrics(skillDef)          // Success metrics are measurable
  ];

  const results = await Promise.all(checks);

  return {
    valid: results.every(r => r.passed),
    errors: results.filter(r => !r.passed),
    warnings: results.filter(r => r.hasWarnings)
  };
}
```

**Step 4: Skill Registration**

```typescript
async function registerSkill(skillName: string, skillDef: SkillDefinition): Promise<void> {
  // 1. Write SKILL.md to .claude/skills/
  await writeFile(
    `.claude/skills/${skillName}/SKILL.md`,
    skillDef.markdown
  );

  // 2. Update skills-config.json
  const config = await readJSON('.claude/skills-config.json');
  config.agent_skills[skillName] = {
    enabled: true,
    model: skillDef.model,
    cost_per_1m_tokens: getModelCost(skillDef.model),
    token_budget: skillDef.tokenBudget,
    auto_activate_on: skillDef.triggers
  };
  await writeJSON('.claude/skills-config.json', config);

  // 3. Update tool-allocation-matrix.json
  const matrix = await readJSON('.claude/tool-allocation-matrix.json');
  matrix.skill_tool_map[skillName] = {
    allowed_tools: skillDef.allowedTools,
    forbidden_tools: skillDef.forbiddenTools,
    context_budget: skillDef.tokenBudget,
    mcp_servers: skillDef.mcpServers,
    rationale: skillDef.purpose
  };
  await writeJSON('.claude/tool-allocation-matrix.json', matrix);

  // 4. Mark gap as resolved
  await resolveGap(skillDef.gapId, skillName);
}
```

---

## Execution Workflow

### Automatic Detection Mode

```
User Request → Orchestrator
                    ↓
            No matching skill?
                    ↓
            Detect Gap (1st occurrence)
                    ↓
            Log to detected-gaps.json
                    ↓
            Handle manually this time
                    ↓
            (Next similar request)
                    ↓
            Gap frequency = 2
                    ↓
            Notify user: "I've noticed you've asked for X twice.
                         Should I create a skill for this?"
                    ↓
            User: "Yes" → Queue for generation
            User: "No"  → Suppress gap detection
                    ↓
            (3rd occurrence or user approval)
                    ↓
            Generate Skill
                    ↓
            Validate
                    ↓
            Register
                    ↓
            Notify user: "New skill created: X"
```

---

### Manual Creation Mode

```bash
# User explicitly requests skill creation
User: "Create a skill for validating Kubernetes manifests"

[Skill Creator Agent]:
Analyzing requirements for "kubernetes-manifest-validation" skill...

Required capabilities:
- Parse YAML manifests
- Validate against Kubernetes API schemas
- Check best practices (resource limits, labels, etc.)
- Detect security issues

Suggested model: Sonnet 4.5
Token budget: 25,000
Required tools: Read, Bash(kubectl), Grep

Generating skill definition...
✓ SKILL.md generated (2,847 tokens)
✓ Validation passed
✓ Registered in skills-config.json
✓ Added to tool-allocation-matrix.json

New skill created: k8s-validator-agent
Location: .claude/skills/k8s-validator-agent/SKILL.md

Test it: "Validate the Kubernetes manifests in k8s/"
```

---

## Tools Available

| Tool | Purpose |
|------|---------|
| **Read** | Read existing skills for reference |
| **Write** | Create new SKILL.md files |
| **Grep/Glob** | Analyze codebase patterns |
| **Decision Agent** | Generate high-quality skill definitions |

**Note**: This agent uses Decision Agent (Opus) internally for skill generation quality.

---

## Skill Templates

### Template 1: Simple Tool Wrapper

```markdown
# ${SKILL_NAME}

**Model**: Haiku 4.5
**Token Budget**: 10,000

## Purpose
Wrapper for ${TOOL_NAME} with ${PROJECT_NAME}-specific configurations.

## Triggers
- "${ACTION} ${RESOURCE}"

## Tools
- ${TOOL_NAME}

## Example
User: "${EXAMPLE_QUERY}"
[Agent]: ${EXAMPLE_RESULT}
```

### Template 2: Complex Workflow

```markdown
# ${SKILL_NAME}

**Model**: Sonnet 4.5
**Token Budget**: 40,000

## Purpose
Multi-step workflow for ${WORKFLOW_NAME}.

## Workflow
1. ${STEP_1}
2. ${STEP_2}
3. ${STEP_3}

## Tools
- ${TOOL_1}
- ${TOOL_2}
- ${TOOL_3}

## Success Metrics
- ${METRIC_1}
- ${METRIC_2}
```

---

## Example: Auto-Generated Skills

### Example 1: SQL Query Optimizer

**Gap Detected**: User repeatedly asks "Optimize this SQL query"

**Generated Skill**: `sql-optimizer-agent`

```markdown
# SQL Query Optimizer Agent

**Model**: Sonnet 4.5
**Cost**: $24/1M tokens
**Token Budget**: 20,000

## Purpose
Analyzes and optimizes SQL queries for performance, readability, and best practices.

## Triggers
- "optimize this query"
- "make this SQL faster"
- "improve query performance"

## Capabilities
1. Explain query execution plan
2. Suggest index improvements
3. Rewrite for better performance
4. Detect N+1 query problems
5. Recommend query caching strategies

## Tools
- Read (analyze query files)
- Postgres MCP (EXPLAIN ANALYZE)
- Neon Manager (index recommendations)

## Example
User: "Optimize this query: SELECT * FROM users JOIN designs ON users.id = designs.user_id WHERE users.created_at > NOW() - INTERVAL '30 days'"

[SQL Optimizer]:
Analyzing query...
Issues found:
1. SELECT * is inefficient (fetches all columns)
2. Missing index on users.created_at
3. JOIN could benefit from covering index

Optimized query:
SELECT users.id, users.email, designs.id, designs.title
FROM users
JOIN designs ON users.id = designs.user_id
WHERE users.created_at > NOW() - INTERVAL '30 days'

Recommended indexes:
CREATE INDEX idx_users_created_at ON users(created_at);
CREATE INDEX idx_designs_user_id ON designs(user_id);

Expected improvement: 10x faster (300ms → 30ms)
```

---

## Configuration

File: `.claude/skills/skill-creator-agent/config.json`

```json
{
  "gap_detection": {
    "enabled": true,
    "frequency_threshold": 3,
    "auto_generate": false,
    "require_approval": true
  },
  "generation": {
    "use_decision_agent": true,
    "validation_required": true,
    "test_generated_skills": true
  },
  "model_selection": {
    "simple_skills": "haiku",
    "medium_skills": "sonnet",
    "complex_skills": "opus"
  },
  "budget_defaults": {
    "haiku_skills": 10000,
    "sonnet_skills": 30000,
    "opus_skills": 20000
  }
}
```

---

## Success Metrics

| Metric | Target | How to Measure |
|--------|--------|----------------|
| Gap detection accuracy | >90% | Manual validation of detected gaps |
| Skill generation quality | >80% | User satisfaction + validation pass rate |
| Time to fill gap | <2 hours | Timestamp: detection → registration |
| Auto-generated skills still in use after 30 days | >70% | Usage tracking |

---

## Notifications

### Gap Detected (Frequency = 2)

```
🔔 Skill Gap Detected

I've noticed you've requested "kubernetes manifest validation" twice.

Would you like me to create a dedicated skill for this?
- Faster responses (dedicated context)
- Cost-effective (optimized model selection)
- Reusable for future similar tasks

Create skill? (y/n)
```

### Skill Generated

```
✅ New Skill Created: k8s-validator-agent

Location: .claude/skills/k8s-validator-agent/SKILL.md
Model: Sonnet 4.5
Token Budget: 25,000
Cost: ~$0.60/execution

Capabilities:
- Validate Kubernetes YAML syntax
- Check resource limits and requests
- Detect security misconfigurations
- Suggest best practices

Try it: "Validate the manifests in k8s/deployment/"
```

---

## Notes

- **Quality First**: Uses Opus Decision Agent for skill generation
- **User Control**: Requires approval before creating new skills
- **Gap Tracking**: Maintains historical gap data for analysis
- **Template-Based**: Uses proven templates for consistency
- **Validation**: Every generated skill passes validation checks
- **Audit Trail**: Logs all skill creations to `.claude/logs/skill-creator.log`

---

## Integration with Orchestrator

```typescript
// orchestrator.ts
async function handleUserRequest(request: string): Promise<Response> {
  // 1. Try to route to existing skill
  const skill = await findMatchingSkill(request);

  if (skill) {
    return await executeSkill(skill, request);
  }

  // 2. No skill found - detect gap
  const gap = await skillCreatorAgent.detectGap(request);

  if (gap) {
    // 3. Track gap frequency
    await skillCreatorAgent.recordGap(gap);

    // 4. Check if threshold reached
    if (gap.frequency >= 3) {
      // 5. Auto-generate skill (with approval)
      await skillCreatorAgent.generateSkill(gap);
    }
  }

  // 6. Handle manually this time
  return await handleManually(request);
}
```

---

*Skill Creator Agent - Self-Healing System*
*Version: 1.0.0 - 2026-01-13*
