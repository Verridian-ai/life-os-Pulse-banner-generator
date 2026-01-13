# Agent Skills Registry

> **This directory contains 14 registered agent skills for Claude Code orchestration.**
> **Each `.md` file with YAML frontmatter becomes an invokable skill.**
> **ALL agents have Cognee memory access for persistent knowledge.**

**Last Updated**: 2026-01-13
**Architecture**: Skills-First Orchestration with Cognee Memory
**Total Agents**: 14

---

## Communication Flow

```
User Request
      |
      v
MAIN CLAUDE AGENT (You)
      |
      v
ORCHESTRATOR (routes ALL requests)
   |-- Loads context from Cognee
   |-- Classifies task
   |-- Delegates to specialized agent
      |
      v
SPECIALIZED AGENT (isolated execution)
   |-- Uses dedicated tools
   |-- Stores learnings in Cognee
   |-- Returns result
      |
      v
ORCHESTRATOR
   |-- Synthesizes result
   |-- Presents to user
```

---

## Active Agent Skills (14 Total)

### Core Agents (10)
| Skill | Model | Cost/Task | Cognee Dataset | Purpose |
|-------|-------|-----------|----------------|---------|
| `orchestrator` | Sonnet | $0.05 | ALL | Routes ALL tasks, memory coordination |
| `research-agent` | Haiku | $0.01 | agent_research | Codebase exploration, docs |
| `quick-tasks-agent` | Haiku | $0.003 | global (read) | Type fixes, imports, formatting |
| `coding-agent` | Sonnet | $1.20 | agent_coding | Feature implementation |
| `debugging-agent` | Sonnet | $0.72 | agent_debugging | Bug investigation and fixes |
| `decision-agent` | Opus | $2.40 | agent_decisions | Architecture decisions (approval needed) |
| `codebase-organization-agent` | Haiku | $0.02 | global (read) | Code hygiene, import sorting |
| `skill-creator-agent` | Opus | $3.00 | ALL | Auto-create missing skills |
| `chrome-ui-browser-agent` | Haiku | $0.03 | agent_chrome_ui | Visual verification via Chrome |
| `cognee-memory-agent` | Haiku | $0.02 | ALL | Memory search, context loading |

### Infrastructure Agents - FULL CONTROL (4)
| Skill | Model | Cost/Task | Cognee Dataset | Purpose |
|-------|-------|-----------|----------------|---------|
| `workos-manager` | Sonnet | $0.60 | global | OAuth, SSO, SCIM, users, orgs |
| `neon-manager` | Sonnet | $0.72 | agent_database | PostgreSQL, branches, schemas, SQL |
| `cloud-run-manager` | Sonnet | $0.72 | agent_release | Deployments, traffic, domains, IAM |
| `gcloud-services` | Sonnet | $0.84 | global | All GCP services, IAM, Storage |

---

## Cognee Memory Integration

**ALL agents have Cognee access** for persistent memory:

| Permission | Agents |
|------------|--------|
| **search** (read) | ALL 14 agents |
| **add** (write) | 12 agents (not quick-tasks, codebase-org) |
| **cognify** (graph) | 8 agents (research, coding, debugging, decision, database, security, skill-creator, cognee-memory) |
| **ALL datasets** | orchestrator, skill-creator, cognee-memory |

### Cognee Datasets
| Dataset | Purpose | Retention |
|---------|---------|-----------|
| `nanobanna_global` | Project knowledge (CLAUDE.md, contracts) | Permanent |
| `agent_research` | Research findings | 30 days |
| `agent_coding` | Implementation patterns | 30 days |
| `agent_debugging` | Root causes and fixes | 30 days |
| `agent_decisions` | Architectural decisions | Permanent |
| `agent_database` | Schema/migration history | Permanent |
| `agent_chrome_ui` | Visual baselines | 7 days |
| `agent_qa` | Test results | 14 days |
| `agent_security` | Vulnerability findings | 90 days |
| `agent_release` | Deployment history | 90 days |

---

## Chrome UI Browser Agent

The `chrome-ui-browser-agent` uses the **Claude Chrome extension** for visual verification:

### Prerequisites
1. Google Chrome browser
2. Claude in Chrome extension (v1.0.36+)
3. Claude Code CLI (v2.0.73+)
4. Enable with: `claude --chrome` or `/chrome`

### Capabilities
- Navigate pages, click, type, fill forms
- Take screenshots, record GIFs
- Read console logs and network requests
- Verify responsive design

---

## How Skills Work

### File Format

Each skill requires YAML frontmatter:

```markdown
---
name: Skill Name
description: One-line description with Cognee access noted.
---

# Skill Name

[Detailed instructions...]

## Cognee Integration
cognee_permissions:
  search: true
  add: true
  cognify: false
  dataset: agent_name
```

### Skill Invocation

Skills become available as `agent_skill_name`:
- `research-agent.md` → `agent_research_agent`
- `neon-manager.md` → `agent_neon_manager`

---

## Orchestration Flow

1. **User sends request** to main Claude agent
2. **Orchestrator activates** and classifies task
3. **Cognee context loaded** (pre-task)
4. **Specialized agent invoked** via Skill tool
5. **Agent executes** with dedicated tools
6. **Learnings stored** in Cognee (post-task)
7. **Result returned** to user

---

## Cost Optimization

| Model | Cost/1M | Use For |
|-------|---------|---------|
| Haiku | $0.80 | Research, quick fixes, visual checks, memory |
| Sonnet | $24 | Implementation, debugging, infrastructure |
| Opus | $120 | Critical decisions only (requires approval) |

**Daily budget**: $50
**Monthly budget**: $1,000
**Savings vs Opus-only**: 87%

---

## Self-Healing System

When a task doesn't match any skill:

1. **First occurrence**: Logged to `.claude/detected-gaps.json`
2. **Second occurrence**: User notified of pattern
3. **Third occurrence**: Prompted to create new skill
4. **On approval**: `skill-creator-agent` generates new skill

---

## Configuration Files

| File | Purpose |
|------|---------|
| `.claude/skills-config.json` | Skill triggers, budgets, models |
| `.claude/tool-allocation-matrix.json` | Tool → agent mappings, Cognee permissions |
| `.claude/detected-gaps.json` | Self-healing gap tracking |
| `.claude/skills/*/SKILL.md` | Detailed skill specifications |
| `.claude/skills/cognee-memory-agent/config.json` | Cognee dataset configuration |

---

## Quick Reference

### Invoke an Agent
```
Skill(skill="agent_research_agent", args="Find all auth code")
```

### Check Chrome Status
```
/chrome
```

### Search Memory
```
"What do we know about authentication?"
```

### Create New Skill
```
"Create a skill for Kubernetes validation"
```

---

*Architecture Version: 2.0.0 - Skills-First with Cognee Memory*
*All 14 agents configured with Cognee integration*
