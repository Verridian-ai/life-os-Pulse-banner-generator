# Documentation Index

> Quick reference guide to all Nanobanna Pro documentation

**Last Updated**: 2026-01-13

---

## 🚀 Quick Start

**New to the skills system?** Start here:
1. [COMPLETE_SETUP_GUIDE.md](./COMPLETE_SETUP_GUIDE.md) - 30-minute quick start
2. [CLEANUP_SUMMARY.md](./CLEANUP_SUMMARY.md) - What changed during cleanup
3. [AGENT_ORCHESTRATION_SYSTEM.md](./AGENT_ORCHESTRATION_SYSTEM.md) - How it works

---

## 📚 Documentation by Category

### 🎯 Essential Guides (Start Here)

| Document | Description | Read Time |
|----------|-------------|-----------|
| [COMPLETE_SETUP_GUIDE.md](./COMPLETE_SETUP_GUIDE.md) | Quick start, cost tracking, troubleshooting | 15 min |
| [CLEANUP_SUMMARY.md](./CLEANUP_SUMMARY.md) | What was cleaned up and why | 5 min |
| [AGENT_ORCHESTRATION_SYSTEM.md](./AGENT_ORCHESTRATION_SYSTEM.md) | How automatic delegation works | 20 min |

### 🤖 Skills & Agents

| Document | Description | Read Time |
|----------|-------------|-----------|
| [RECOMMENDED_SKILLS_FOR_NANOBANNA.md](./RECOMMENDED_SKILLS_FOR_NANOBANNA.md) | 22 hand-picked skills for this project | 25 min |
| [CLAUDE_AGENT_SKILLS_REGISTRY.md](./CLAUDE_AGENT_SKILLS_REGISTRY.md) | 52,900+ community skills catalog | 30 min |
| [MCP_SKILLS_MIGRATION_PLAN.md](./MCP_SKILLS_MIGRATION_PLAN.md) | Agent → Skills migration guide | 30 min |

### 🔌 Plugins & Tools

| Document | Description | Read Time |
|----------|-------------|-----------|
| [CLAUDE_PLUGINS_MAXIMIZATION_GUIDE.md](./CLAUDE_PLUGINS_MAXIMIZATION_GUIDE.md) | Unlock full potential of all plugins | 35 min |
| [IMPLEMENTATION_ACTION_PLAN.md](./IMPLEMENTATION_ACTION_PLAN.md) | Day-by-day setup schedule (21 days) | 30 min |

---

## 🗂️ Documentation by Purpose

### "I want to get started quickly"
→ [COMPLETE_SETUP_GUIDE.md](./COMPLETE_SETUP_GUIDE.md)

### "What changed in the cleanup?"
→ [CLEANUP_SUMMARY.md](./CLEANUP_SUMMARY.md)

### "How does automatic delegation work?"
→ [AGENT_ORCHESTRATION_SYSTEM.md](./AGENT_ORCHESTRATION_SYSTEM.md)

### "What skills should I install?"
→ [RECOMMENDED_SKILLS_FOR_NANOBANNA.md](./RECOMMENDED_SKILLS_FOR_NANOBANNA.md)

### "Where can I find more skills?"
→ [CLAUDE_AGENT_SKILLS_REGISTRY.md](./CLAUDE_AGENT_SKILLS_REGISTRY.md)

### "How do I migrate from agents to skills?"
→ [MCP_SKILLS_MIGRATION_PLAN.md](./MCP_SKILLS_MIGRATION_PLAN.md)

### "How do I maximize my plugins?"
→ [CLAUDE_PLUGINS_MAXIMIZATION_GUIDE.md](./CLAUDE_PLUGINS_MAXIMIZATION_GUIDE.md)

### "What's the implementation timeline?"
→ [IMPLEMENTATION_ACTION_PLAN.md](./IMPLEMENTATION_ACTION_PLAN.md)

---

## 📊 By File Size

| Size | Document | Type |
|------|----------|------|
| 22 KB | CLAUDE_PLUGINS_MAXIMIZATION_GUIDE.md | Advanced Guide |
| 21 KB | IMPLEMENTATION_ACTION_PLAN.md | Action Plan |
| 20 KB | AGENT_ORCHESTRATION_SYSTEM.md | Technical Deep Dive |
| 19 KB | MCP_SKILLS_MIGRATION_PLAN.md | Migration Guide |
| 15 KB | COMPLETE_SETUP_GUIDE.md | Quick Start |
| 14 KB | RECOMMENDED_SKILLS_FOR_NANOBANNA.md | Curated Skills |
| 8 KB | CLEANUP_SUMMARY.md | Status Report |
| 6 KB | CLAUDE_AGENT_SKILLS_REGISTRY.md | Skills Catalog |

**Total**: ~125 KB of documentation

---

## 🎯 Learning Path

### Beginner (Day 1)
1. ✅ [COMPLETE_SETUP_GUIDE.md](./COMPLETE_SETUP_GUIDE.md) - Understand the system
2. ✅ [CLEANUP_SUMMARY.md](./CLEANUP_SUMMARY.md) - See what changed
3. ✅ Try asking: "Find all authentication code" (test Research Agent)

### Intermediate (Week 1)
1. ✅ [AGENT_ORCHESTRATION_SYSTEM.md](./AGENT_ORCHESTRATION_SYSTEM.md) - Deep dive on routing
2. ✅ [RECOMMENDED_SKILLS_FOR_NANOBANNA.md](./RECOMMENDED_SKILLS_FOR_NANOBANNA.md) - Install Priority 1 skills
3. ✅ Configure pre-commit hooks
4. ✅ Track daily costs

### Advanced (Week 2-4)
1. ✅ [MCP_SKILLS_MIGRATION_PLAN.md](./MCP_SKILLS_MIGRATION_PLAN.md) - Create custom skills
2. ✅ [CLAUDE_PLUGINS_MAXIMIZATION_GUIDE.md](./CLAUDE_PLUGINS_MAXIMIZATION_GUIDE.md) - Advanced plugin usage
3. ✅ [IMPLEMENTATION_ACTION_PLAN.md](./IMPLEMENTATION_ACTION_PLAN.md) - Full implementation
4. ✅ Setup Greptile custom context
5. ✅ Configure Langfuse observability

### Expert (Ongoing)
1. ✅ [CLAUDE_AGENT_SKILLS_REGISTRY.md](./CLAUDE_AGENT_SKILLS_REGISTRY.md) - Explore 52,900+ skills
2. ✅ Create project-specific skills
3. ✅ Optimize delegation thresholds
4. ✅ Contribute back to community

---

## 🔍 Key Concepts

### Agent Skills
Cost-optimized AI agents that automatically handle different task types:
- **Research Agent** (Haiku) - Code exploration, documentation
- **Quick Tasks Agent** (Haiku) - Type fixes, simple edits
- **Coding Agent** (Sonnet) - Feature implementation
- **Debugging Agent** (Sonnet) - Error investigation
- **Decision Agent** (Opus) - Architecture decisions

→ See: [AGENT_ORCHESTRATION_SYSTEM.md](./AGENT_ORCHESTRATION_SYSTEM.md)

### MCP (Model Context Protocol)
Standard for connecting AI models to specialized tools:
- Database operations (Supabase, Neon)
- Browser automation (Playwright)
- Testing (Vitest)
- Security scanning (Semgrep)

→ See: [MCP_SKILLS_MIGRATION_PLAN.md](./MCP_SKILLS_MIGRATION_PLAN.md)

### Cost Optimization
Smart routing saves 87% vs Opus-only:
- Haiku: $0.80/1M tokens (research, quick fixes)
- Sonnet: $24/1M tokens (coding, debugging)
- Opus: $120/1M tokens (critical decisions only)

→ See: [COMPLETE_SETUP_GUIDE.md](./COMPLETE_SETUP_GUIDE.md#cost-savings-calculator)

### Automatic Delegation
Orchestrator analyzes your request and routes to optimal agent:
- No manual agent selection needed
- Always uses cheapest appropriate model
- Asks approval for expensive operations

→ See: [AGENT_ORCHESTRATION_SYSTEM.md](./AGENT_ORCHESTRATION_SYSTEM.md#decision-logic)

---

## 📈 Success Metrics

Track these KPIs after implementation:

| Metric | Target | Check Command |
|--------|--------|---------------|
| Cost savings | 87% | "Show me cost breakdown" |
| Daily budget | <$50 | "Am I under budget?" |
| Task completion rate | >95% | "Show task stats" |
| Test coverage | >80% | `npm run test -- --coverage` |
| Build success | 100% | `npm run build` |

---

## 🛠️ Configuration Files

| File | Purpose | Location |
|------|---------|----------|
| `skills-config.json` | Skills configuration | `.claude/skills-config.json` |
| `CLAUDE.md` | Main orchestrator manual | `CLAUDE.md` |
| `shared_contract.md` | Non-negotiable standards | `.claude/rules/shared_contract.md` |
| Agent skills | Individual skill configs | `.claude/skills/*/SKILL.md` |

---

## 🆘 Troubleshooting

### "Agent not delegating"
→ See: [COMPLETE_SETUP_GUIDE.md#troubleshooting](./COMPLETE_SETUP_GUIDE.md#troubleshooting)

### "Pre-commit hooks failing"
→ See: [COMPLETE_SETUP_GUIDE.md#pre-commit-hooks-failing](./COMPLETE_SETUP_GUIDE.md#pre-commit-hooks-failing)

### "MCP tool not found"
→ See: [COMPLETE_SETUP_GUIDE.md#mcp-tool-not-found](./COMPLETE_SETUP_GUIDE.md#mcp-tool-not-found)

### "Cost too high"
→ Check: [COMPLETE_SETUP_GUIDE.md#cost-tracking-dashboard](./COMPLETE_SETUP_GUIDE.md#cost-tracking-dashboard)

---

## 📞 Support

### Ask Claude
Just ask in conversation:
- "Explain the new skills system"
- "Show me how to use the coding agent"
- "What's my cost breakdown today?"
- "Help me install a specific skill"

### Documentation
- Main manual: `CLAUDE.md`
- Skills overview: `.claude/skills/README.md`
- Migration notice: `.claude/agents/README.md`

### External Resources
- Claude Code Docs: https://code.claude.com/docs
- MCP Specification: https://modelcontextprotocol.io/
- Skills Registry: https://claude-plugins.dev/

---

## ✅ Quick Reference

### Most Used Commands

```bash
# Check what's installed
ls .claude/skills/

# View cost config
cat .claude/skills-config.json

# Read a skill
cat .claude/skills/coding-agent/SKILL.md

# Install community skill
cp -r ~/skills-library/awesome-claude-skills/test-driven-development .claude/skills/
```

### Common Questions

**Q**: How do I know which agent will handle my request?
**A**: Just ask! The orchestrator tells you: "[Delegating to: research-agent (Haiku)]"

**Q**: Can I force a specific agent?
**A**: Yes: "Please use coding-agent to implement X"

**Q**: How much will this cost?
**A**: The orchestrator shows estimated cost before expensive operations

**Q**: Where are the old agents?
**A**: Backed up in `.claude/agents.deprecated/`

---

## 🎓 Additional Resources

### Community
- Awesome Claude Skills: https://github.com/karanb192/awesome-claude-skills
- Claude Plugins Registry: https://claude-plugins.dev/
- Skills Marketplace: https://skillsmp.com/

### Tools
- Greptile (Code Review): https://app.greptile.com/
- Langfuse (Observability): https://cloud.langfuse.com/
- Semgrep (Security): https://semgrep.dev/

---

*Documentation Index - Last updated: 2026-01-13*
*Total documentation: 8 files, ~125 KB*
*Setup status: ✅ Complete*
