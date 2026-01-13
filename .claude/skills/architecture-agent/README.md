# Architecture Analyzer Agent - Usage Guide

A READ-ONLY agent that analyzes codebase architecture, generates dependency graphs, calculates complexity metrics, and identifies technical debt.

## Quick Start

```bash
# Analyze entire architecture
"Analyze the architecture of the codebase"

# Check for circular dependencies
"Check for circular dependencies"

# Find complex code
"Find the most complex functions"

# Generate dependency graph
"Generate a dependency graph for the services folder"

# Calculate coupling metrics
"Calculate coupling metrics for all modules"

# Architecture health check
"What's the architecture health score?"
```

## Features

### 1. Dependency Analysis
- Complete module dependency graphs
- Circular dependency detection
- Import chain visualization
- Orphaned module detection

### 2. Complexity Metrics
- Cyclomatic complexity (McCabe)
- Cognitive complexity (SonarSource)
- Lines of code analysis
- Nesting depth tracking

### 3. Coupling Analysis
- Afferent/Efferent coupling
- Instability index
- Abstractness calculation
- Distance from main sequence

### 4. Technical Debt
- Dead code detection
- Large file identification
- Complex function flagging
- Import order violations

### 5. Architecture Health
- Overall health score (0-100)
- Prioritized improvement roadmap
- Zone analysis (Pain/Uselessness)

## Output Formats

### Markdown Reports
Human-readable analysis with:
- Tables and metrics
- Recommendations
- Embedded Mermaid diagrams

### JSON Reports
Machine-readable data:
```json
{
  "analysis_type": "dependency_graph",
  "timestamp": "2026-01-13T14:30:00Z",
  "total_files": 127,
  "circular_dependencies": [...],
  "high_coupling_modules": [...],
  "recommendations": [...]
}
```

### Mermaid Diagrams
Visual representations:
- Dependency graphs
- Coupling matrices
- Complexity heatmaps

## Example Workflows

### Full Architecture Review
```
User: "Run a full architecture analysis"

Agent Output:
- Architecture health score: 72/100
- Dependency graph with 127 nodes
- 1 circular dependency detected
- 3 high-complexity functions
- 4 large files (>500 LOC)
- Prioritized improvement roadmap
```

### Pre-Refactoring Analysis
```
User: "Analyze coupling for src/context/AuthContext.tsx"

Agent Output:
- Afferent coupling: 23 (23 files depend on it)
- Efferent coupling: 5 (depends on 5 files)
- Instability: 0.179 (stable)
- Recommendations:
  1. Extract auth service (reduce efferent coupling)
  2. Use context for state only
```

### Code Review Preparation
```
User: "Find hotspots in src/services/"

Agent Output:
- Most complex: handleImageGeneration (complexity: 18)
- Most coupled: llm.ts (12 dependencies)
- Largest: llm.ts (423 LOC)
- Recommendations with priority
```

## Metrics Reference

### Cyclomatic Complexity
- **1-10**: ✅ Simple, easy to test
- **11-15**: 🟡 Moderate, requires attention
- **16+**: 🔴 Complex, refactor recommended

### Cognitive Complexity
- **1-15**: ✅ Easy to understand
- **16-25**: 🟡 Moderate cognitive load
- **26+**: 🔴 Hard to understand, refactor

### Instability Index
- **0.0-0.3**: Stable (depended on by many)
- **0.3-0.7**: Balanced (good for business logic)
- **0.7-1.0**: Unstable (many dependencies)

### Lines of Code
- **1-200**: ✅ Good
- **201-500**: 🟡 Large, consider splitting
- **500+**: 🔴 Too large, must split

## Integration Examples

### With CI/CD
```bash
# Generate architecture report on every PR
- name: Architecture Analysis
  run: |
    claude-agent --subagent "Architecture Agent" \
      --task "Analyze architecture and output JSON" \
      --output architecture-report.json

    # Fail if health score < 70
    SCORE=$(jq '.health_score' architecture-report.json)
    if [ $SCORE -lt 70 ]; then exit 1; fi
```

### With Pre-Commit Hook
```bash
# Check for new circular dependencies
#!/bin/bash
CHANGED_FILES=$(git diff --cached --name-only --diff-filter=ACM | grep '\.tsx\?$')

if [ -n "$CHANGED_FILES" ]; then
  claude-agent --subagent "Architecture Agent" \
    --task "Check for circular dependencies" \
    --quick
fi
```

### With Code Review
```markdown
## Pre-Review Checklist

1. Run architecture analysis:
   - [ ] No new circular dependencies
   - [ ] Complexity metrics within thresholds
   - [ ] Coupling metrics acceptable
   - [ ] Architecture health score maintained/improved

2. Address findings before review
```

## Cost Analysis

| Analysis Type | Avg Tokens | Avg Cost | Time |
|---------------|------------|----------|------|
| Full architecture | 40,000 | $0.96 | 20-30s |
| Circular dependencies | 8,000 | $0.19 | 5-10s |
| Complexity metrics | 15,000 | $0.36 | 10-15s |
| Coupling analysis | 12,000 | $0.29 | 8-12s |
| Architecture health | 25,000 | $0.60 | 15-20s |

**ROI**: One architecture analysis ($1) can prevent hours of refactoring ($500+).

## Best Practices

### When to Use
- ✅ Before major refactoring
- ✅ During code review
- ✅ Monthly architecture health checks
- ✅ Pre-release quality gates
- ✅ Onboarding new developers

### When NOT to Use
- ❌ For code modifications (use Coding Agent)
- ❌ For bug fixes (use Debugging Agent)
- ❌ For simple questions (use Research Agent)

### Tips
1. **Run regularly**: Monthly health checks prevent debt accumulation
2. **Automate**: Integrate with CI/CD for continuous monitoring
3. **Act on findings**: Analysis is worthless without action
4. **Track trends**: Compare scores over time
5. **Combine with other agents**: Use Decision Agent for trade-off analysis

## Troubleshooting

### "Analysis taking too long"
- Specify smaller scope: "Analyze only src/features/"
- Use quick mode: "Quick dependency check"

### "Too much output"
- Request specific analysis: "Only show circular dependencies"
- Use JSON format: "Output as JSON only"

### "Unclear recommendations"
- Ask for details: "Explain how to fix the circular dependency"
- Request examples: "Show code example for extracting interface"

## Advanced Usage

### Custom Metrics
```
"Calculate cyclomatic complexity for all functions in src/services/llm.ts"
```

### Focused Analysis
```
"Analyze coupling only for files changed in last commit"
```

### Trend Analysis
```
"Compare architecture health to last month's score"
```

### Dependency Paths
```
"Show all dependency paths from Dashboard.tsx to llm.ts"
```

## Resources

- [SKILL.md](./SKILL.md) - Full agent specification
- [METRICS.md](./METRICS.md) - Detailed metrics reference
- [.claude/agents/architecture-agent.md](../../agents/architecture-agent.md) - Agent configuration

## Support

For questions or issues:
1. Check METRICS.md for threshold definitions
2. Review SKILL.md for workflow details
3. File issue in project repo
