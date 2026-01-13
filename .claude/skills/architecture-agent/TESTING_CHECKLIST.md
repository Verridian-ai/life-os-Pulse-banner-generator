# Architecture Analyzer Agent - Testing Checklist

Use this checklist to validate the Architecture Analyzer Agent is working correctly.

---

## Pre-Test Setup

- [ ] Agent registered in `.claude/skills-config.json`
- [ ] Tool allocation configured in `.claude/tool-allocation-matrix.json`
- [ ] Agent frontmatter exists in `.claude/agents/architecture-agent.md`
- [ ] All skill files present:
  - [ ] SKILL.md
  - [ ] README.md
  - [ ] METRICS.md
  - [ ] QUICK_REFERENCE.md
  - [ ] TESTING_CHECKLIST.md
  - [ ] IMPLEMENTATION_SUMMARY.md

---

## Functional Tests

### Test 1: Activation Trigger
**Command**: "Analyze the architecture of the codebase"

**Expected**:
- [ ] Agent activates automatically (no manual selection needed)
- [ ] Uses Claude Sonnet 4.5
- [ ] Token budget: 50,000
- [ ] Cost estimate shown: ~$0.96

**Validates**: Auto-activation trigger works

---

### Test 2: Circular Dependency Detection
**Command**: "Check for circular dependencies"

**Expected**:
- [ ] Scans all TypeScript/JavaScript files
- [ ] Builds import graph
- [ ] Runs DFS cycle detection
- [ ] Reports found cycles (or "None detected")
- [ ] Provides breaking strategy if cycles found
- [ ] Generates Mermaid diagram

**Validates**: Dependency analysis workflow

---

### Test 3: Complexity Analysis
**Command**: "Find the most complex functions"

**Expected**:
- [ ] Analyzes all functions in codebase
- [ ] Calculates cyclomatic complexity
- [ ] Calculates cognitive complexity
- [ ] Ranks by complexity
- [ ] Shows top 5 most complex
- [ ] Provides refactoring recommendations
- [ ] Generates complexity heatmap

**Validates**: Complexity metrics calculation

---

### Test 4: Coupling Metrics
**Command**: "Calculate coupling metrics for src/context/AuthContext.tsx"

**Expected**:
- [ ] Counts afferent coupling (Ca)
- [ ] Counts efferent coupling (Ce)
- [ ] Calculates instability (I)
- [ ] Calculates abstractness (A)
- [ ] Calculates distance from main sequence (D)
- [ ] Identifies zone (Main Sequence / Pain / Uselessness)
- [ ] Provides recommendations

**Validates**: Coupling analysis workflow

---

### Test 5: Architecture Health Score
**Command**: "What's the architecture health score?"

**Expected**:
- [ ] Runs comprehensive analysis
- [ ] Calculates component scores:
  - [ ] Modularity (0-25)
  - [ ] Complexity (0-25)
  - [ ] Coupling (0-25)
  - [ ] Technical Debt (0-25)
- [ ] Generates overall score (0-100)
- [ ] Provides traffic light status (🟢🟡🔴)
- [ ] Lists critical issues
- [ ] Provides improvement roadmap
- [ ] Estimates effort per phase

**Validates**: Health scoring algorithm

---

### Test 6: Dependency Graph Generation
**Command**: "Generate a dependency graph for src/services/"

**Expected**:
- [ ] Scans all files in src/services/
- [ ] Extracts imports
- [ ] Builds graph structure
- [ ] Generates Mermaid diagram
- [ ] Color-codes by stability
- [ ] Highlights circular dependencies (if any)

**Validates**: Mermaid diagram generation

---

### Test 7: Technical Debt Detection
**Command**: "What technical debt exists in the codebase?"

**Expected**:
- [ ] Detects dead code
- [ ] Finds unused imports
- [ ] Identifies large files (>500 LOC)
- [ ] Identifies long functions (>50 LOC)
- [ ] Finds deeply nested code (>4 levels)
- [ ] Checks import order violations
- [ ] Prioritizes by impact

**Validates**: Technical debt detection

---

### Test 8: JSON Output
**Command**: "Analyze architecture and output JSON"

**Expected**:
- [ ] Generates JSON report
- [ ] Contains structured data
- [ ] Includes timestamps
- [ ] Contains metrics arrays
- [ ] Contains recommendations
- [ ] Valid JSON syntax
- [ ] Machine-readable

**Validates**: JSON output format

---

## Non-Functional Tests

### Test 9: Read-Only Enforcement
**Command**: (Internal verification)

**Expected**:
- [ ] Agent CANNOT use Write tool
- [ ] Agent CANNOT use Edit tool
- [ ] Agent CANNOT use Bash tool
- [ ] Agent CAN use Read tool
- [ ] Agent CAN use Grep tool
- [ ] Agent CAN use Glob tool
- [ ] Agent CAN use Serena (read-only)

**Validates**: Read-only mode enforced

---

### Test 10: Cost Management
**Command**: "Analyze the architecture of the codebase"

**Expected**:
- [ ] Cost estimate shown before execution
- [ ] Actual cost matches estimate (±10%)
- [ ] Token usage within budget (50,000)
- [ ] Cost logged to usage log

**Validates**: Cost tracking

---

### Test 11: Context Preservation
**Command**: (After running analysis)

**Expected**:
- [ ] Orchestrator context usage <100 tokens
- [ ] Agent execution isolated
- [ ] No context leakage to orchestrator
- [ ] Results returned cleanly

**Validates**: Context isolation

---

### Test 12: Memory Integration (Cognee)
**Command**: "Analyze architecture" (run twice)

**Expected**:
- [ ] First run stores results in Cognee
- [ ] Second run references previous analysis
- [ ] Tracks trends (if metrics changed)
- [ ] Dataset: `agent_architecture`

**Validates**: Cognee memory integration

---

## Edge Cases

### Test 13: Empty Scope
**Command**: "Analyze architecture of src/nonexistent/"

**Expected**:
- [ ] Graceful error handling
- [ ] Clear message: "No files found"
- [ ] No crash
- [ ] Cost minimal (<$0.05)

**Validates**: Error handling

---

### Test 14: Very Large Codebase
**Command**: "Analyze architecture" (on 1000+ files)

**Expected**:
- [ ] Completes within 60 seconds
- [ ] Token usage stays under 50,000
- [ ] Results summarized (not overwhelming)
- [ ] Cost stays under $1.50

**Validates**: Scalability

---

### Test 15: Concurrent Execution
**Command**: Run 3 architecture analyses simultaneously

**Expected**:
- [ ] All 3 execute in parallel
- [ ] No context interference
- [ ] All complete successfully
- [ ] Results independent

**Validates**: Parallel execution

---

## Integration Tests

### Test 16: Pre-Commit Hook
**Setup**: Add to `.git/hooks/pre-commit`
```bash
claude-agent --subagent "Architecture Agent" \
  --task "Check for circular dependencies" --quick
```

**Expected**:
- [ ] Runs on `git commit`
- [ ] Blocks commit if circular dependency found
- [ ] Completes in <10 seconds

**Validates**: Git hook integration

---

### Test 17: CI/CD Pipeline
**Setup**: Add to CI config
```yaml
- name: Architecture Gate
  run: |
    claude-agent --subagent "Architecture Agent" \
      --task "Architecture health score" \
      --output health.json
    if [ $(jq '.health_score' health.json) -lt 70 ]; then exit 1; fi
```

**Expected**:
- [ ] Runs in CI pipeline
- [ ] Fails build if health <70
- [ ] Generates JSON artifact

**Validates**: CI/CD integration

---

## Performance Tests

### Test 18: Speed Test
**Command**: "Check for circular dependencies"

**Expected**:
- [ ] Completes in <10 seconds (for 100 files)
- [ ] Completes in <30 seconds (for 500 files)

**Validates**: Performance

---

### Test 19: Cost Efficiency
**Command**: Run 10 different analyses

**Expected**:
- [ ] Average cost <$0.50 per analysis
- [ ] Total cost <$5.00 for 10 analyses

**Validates**: Cost efficiency

---

## Documentation Tests

### Test 20: METRICS.md Accuracy
**Validation**: Manual review

**Expected**:
- [ ] Formulas are correct
- [ ] Thresholds are industry-standard
- [ ] Examples are accurate
- [ ] References are valid

**Validates**: Metrics documentation

---

## Pass Criteria

Agent is production-ready if:
- ✅ All functional tests pass (Tests 1-8)
- ✅ All non-functional tests pass (Tests 9-12)
- ✅ At least 2 edge cases pass (Tests 13-15)
- ✅ At least 1 integration test passes (Tests 16-17)
- ✅ Both performance tests pass (Tests 18-19)
- ✅ Documentation review complete (Test 20)

---

## Test Results Log

| Test | Status | Date | Notes |
|------|--------|------|-------|
| Test 1 | ⬜ Not Run | - | - |
| Test 2 | ⬜ Not Run | - | - |
| Test 3 | ⬜ Not Run | - | - |
| Test 4 | ⬜ Not Run | - | - |
| Test 5 | ⬜ Not Run | - | - |
| Test 6 | ⬜ Not Run | - | - |
| Test 7 | ⬜ Not Run | - | - |
| Test 8 | ⬜ Not Run | - | - |
| Test 9 | ⬜ Not Run | - | - |
| Test 10 | ⬜ Not Run | - | - |
| Test 11 | ⬜ Not Run | - | - |
| Test 12 | ⬜ Not Run | - | - |
| Test 13 | ⬜ Not Run | - | - |
| Test 14 | ⬜ Not Run | - | - |
| Test 15 | ⬜ Not Run | - | - |
| Test 16 | ⬜ Not Run | - | - |
| Test 17 | ⬜ Not Run | - | - |
| Test 18 | ⬜ Not Run | - | - |
| Test 19 | ⬜ Not Run | - | - |
| Test 20 | ⬜ Not Run | - | - |

**Legend**: ⬜ Not Run | 🟡 In Progress | ✅ Pass | ❌ Fail

---

*Update this log as you run tests*
*Date: 2026-01-13*
*Version: 1.0.0*
