# Architecture Analyzer Agent - Quick Reference

**One-line summary**: READ-ONLY agent that analyzes architecture, generates dependency graphs, calculates complexity metrics, and identifies technical debt.

---

## Quick Commands

```bash
# Full architecture analysis (health score + recommendations)
"Analyze the architecture of the codebase"

# Check for circular dependencies
"Check for circular dependencies"

# Find complex code
"Find the most complex functions"

# Generate dependency graph
"Generate a dependency graph for src/services/"

# Calculate coupling metrics
"Calculate coupling metrics for all modules"

# Identify technical debt
"What technical debt exists in the codebase?"

# Architecture health check
"What's the architecture health score?"
```

---

## Key Metrics at a Glance

| Metric | Threshold | Action |
|--------|-----------|--------|
| **Cyclomatic Complexity** | >15 | Refactor function |
| **Cognitive Complexity** | >25 | Refactor function |
| **Function LOC** | >100 | Split function |
| **File LOC** | >1000 | Split file |
| **Instability (I)** | 0.0-0.3 | Stable (OK) |
| **Instability (I)** | 0.3-0.7 | Balanced (OK) |
| **Instability (I)** | 0.7-1.0 | Unstable (OK for UI) |
| **Distance (D)** | >0.6 | In Zone of Pain/Uselessness |
| **Circular Dependencies** | >0 | Break immediately |

---

## Output Formats

### Markdown Report
- Executive summary
- Tables with metrics
- Prioritized recommendations
- Embedded Mermaid diagrams

### JSON Report
```json
{
  "health_score": 72,
  "circular_dependencies": [...],
  "high_complexity_functions": [...],
  "recommendations": [...]
}
```

### Mermaid Diagrams
- Dependency graphs (color-coded)
- Coupling matrices
- Complexity heatmaps

---

## Cost Guide

| Analysis | Cost | Time |
|----------|------|------|
| Full architecture | $0.96 | 20-30s |
| Circular deps | $0.19 | 5-10s |
| Complexity | $0.36 | 10-15s |
| Coupling | $0.29 | 8-12s |
| Health score | $0.60 | 15-20s |

---

## Common Use Cases

### Before Refactoring
```
"Analyze coupling for src/context/AuthContext.tsx"
```

### Code Review
```
"Find hotspots in src/services/"
```

### Monthly Health Check
```
"Generate architecture health report"
```

### Pre-Release Quality Gate
```
"Check for circular dependencies and high complexity"
```

---

## Integration

### Pre-Commit Hook
```bash
# .git/hooks/pre-commit
claude-agent --subagent "Architecture Agent" \
  --task "Check for circular dependencies" --quick
```

### CI/CD Quality Gate
```yaml
- name: Architecture Gate
  run: |
    claude-agent --subagent "Architecture Agent" \
      --task "Architecture health score" \
      --output health.json
    if [ $(jq '.health_score' health.json) -lt 70 ]; then exit 1; fi
```

---

## When to Use

✅ **Use for**:
- Pre-refactoring analysis
- Code review preparation
- Monthly health checks
- Pre-release quality gates
- Onboarding new developers

❌ **Don't use for**:
- Code modifications (use Coding Agent)
- Bug fixes (use Debugging Agent)
- Simple questions (use Research Agent)

---

## Key Features

- ✅ **Dependency Analysis** - Circular deps, import chains
- ✅ **Complexity Metrics** - Cyclomatic, cognitive, nesting
- ✅ **Coupling Analysis** - Ca, Ce, I, A, D
- ✅ **Technical Debt** - Dead code, large files
- ✅ **Health Score** - 0-100 with roadmap
- ✅ **Visual Reports** - Mermaid diagrams
- ✅ **JSON Export** - Machine-readable
- ✅ **Actionable Recommendations** - Specific fixes

---

## Files

- **SKILL.md** - Complete specification with workflows
- **METRICS.md** - Detailed metrics reference with formulas
- **README.md** - User guide with examples
- **QUICK_REFERENCE.md** - This file

---

## Support

For detailed information:
1. **SKILL.md** - Technical workflows and algorithms
2. **METRICS.md** - Metric definitions and thresholds
3. **README.md** - Usage examples and best practices

---

*Architecture Analyzer Agent - v1.0.0*
*READ-ONLY Analysis Specialist*
