# Chrome UI Browser Agent - Setup Complete ✅

> The ONLY agent authorized for visual UI verification and browser-based testing

**Created**: 2026-01-13
**Status**: ✅ **CONFIGURED** and ready for use

---

## What Was Set Up

### 1. ✅ Dedicated Skill Created

**File**: `.claude/skills/chrome-ui-browser-agent/SKILL.md`

**Specifications**:
- **Model**: Haiku 4.5 (fast, cost-effective)
- **Cost**: $0.80/1M tokens
- **Token Budget**: 25,000 per execution
- **Expected Usage**: 20-50 invocations/day (HIGHEST FREQUENCY)
- **Cost per Check**: ~$0.008

---

### 2. ✅ Registered in Skills Config

**File**: `.claude/skills-config.json` (lines 69-76)

```json
"chrome-ui-browser-agent": {
  "enabled": true,
  "model": "haiku",
  "cost_per_1m_tokens": 0.80,
  "token_budget": 25000,
  "cost_threshold": 0.020,
  "auto_activate_on": [
    "check ui", "verify design", "test page",
    "screenshot", "browse to", "visual check",
    "performance test", "accessibility check"
  ]
}
```

**Auto-Activation**: Agent automatically activates when you say any trigger phrase (no need to manually invoke)

---

### 3. ✅ Tool Allocation Configured

**File**: `.claude/tool-allocation-matrix.json` (lines 242-253)

**Allowed Tools**:
- `ChromeDevTools` (PRIMARY - all browser operations)
- `Read` (check test results, logs)
- `Grep` (find related issues in code)
- `Bash(serve)` (start dev server if needed)

**Forbidden Tools**: `Edit`, `Write` (read-only agent - cannot modify code)

**MCP Servers**: `chrome-devtools` (exclusive access)

**Rationale**: "Visual UI verification only, read-only agent, highest frequency usage"

---

### 4. ✅ Context Isolation Enforced

**Orchestrator Protection**: Orchestrator CANNOT use ChromeDevTools directly
**Skill-Based Execution**: All Chrome operations go through chrome-ui-browser-agent
**Context Budget**: 25k tokens (isolated from orchestrator's 5k budget)
**Cleanup**: Context freed after each execution

**How It Works**:
```
User: "Check the studio page"
   ↓
Orchestrator (5k budget)
   ├── Detects: Visual check request
   ├── Selects: chrome-ui-browser-agent
   └── Delegates (isolated execution)
       ↓
   Subprocess Created
       ↓
   Chrome UI Browser Agent (25k budget)
       ├── Launches Chrome DevTools
       ├── Captures screenshot
       ├── Runs audits (8k tokens consumed)
       └── Returns: Visual report
           ↓
       Subprocess Cleanup (8k freed)
           ↓
   Orchestrator (still at 5k + 200 = 5.2k)
       ├── Receives: Summary only (200 tokens)
       └── Presents to user
```

**Orchestrator Impact**: Only 200 tokens (summary)
**Agent Impact**: 8,000 tokens (isolated and freed)
**No Context Pollution**: ✅

---

## Capabilities Overview

### 🎯 Primary Use Cases

| Capability | What It Does | Frequency |
|------------|--------------|-----------|
| **Visual Verification** | Screenshots, layout checks, component inspection | Very High |
| **Performance Profiling** | Web Vitals (LCP, FID, CLS), blur budget, memory leaks | High |
| **Accessibility Auditing** | WCAG 2.1 AA compliance, contrast ratios, keyboard nav | Medium |
| **Regression Testing** | Compare against baseline screenshots | High |
| **Real-Time Debugging** | Console monitoring, network analysis | Medium |

---

### 🚀 Quick Examples

#### Example 1: Quick Visual Check
```
You: "Check if the canvas editor looks right"

[Chrome UI Browser Agent]:
🚀 Launching Chrome...
📸 Capturing screenshot: /studio
✓ Layout verified
✓ Neumorphic effects rendering correctly
⚠️ Blur budget at 38px (95% of 40px max)

[Tokens: 8,200 | Cost: $0.007]
```

#### Example 2: Performance Test
```
You: "Test studio page performance"

[Chrome UI Browser Agent]:
📊 Running Web Vitals audit...

Results:
✓ LCP: 1.8s (target: 2.5s)
✓ FID: 45ms (target: 100ms)
✓ CLS: 0.05 (target: 0.1)
⚠️ Blur budget: 35px (88% of 40px)

[Tokens: 12,400 | Cost: $0.010]
```

#### Example 3: Accessibility Audit
```
You: "Run accessibility check on landing page"

[Chrome UI Browser Agent]:
♿ Running WCAG 2.1 AA audit...

Issues Found: 2
🔴 Button contrast 3.8:1 (needs 4.5:1)
🟡 Missing alt text on logo

[Tokens: 9,800 | Cost: $0.008]
```

---

## Auto-Activation Triggers

The agent automatically activates when your message contains:

### Visual Verification
- "check ui"
- "verify design"
- "see how it looks"
- "inspect [component]"

### Screenshots
- "screenshot"
- "take a picture"
- "show me [page]"

### Navigation
- "browse to [URL]"
- "test [page]"
- "open [route]"

### Performance
- "performance test"
- "web vitals"
- "how fast is"

### Accessibility
- "accessibility check"
- "a11y audit"
- "contrast check"

**No Manual Invocation Needed**: Just say any trigger phrase naturally in conversation!

---

## Screenshot Storage

```
.claude/screenshots/
  baseline/               # Reference images for comparison
    landing-1920x1080.png
    studio-1920x1080.png
    landing-375x812.png   # Mobile
  current/                # Recent captures
    landing-2026-01-13-1430.png
  diff/                   # Visual regression diffs
    studio-diff-2026-01-13-1430.png
  components/             # Component-specific
    canvas-editor-2026-01-13.png
```

**Auto-Cleanup**: Screenshots older than 7 days automatically removed
**Max Storage**: 100 screenshots total

---

## Integration with Other Skills

| Your Skill | Works With | How |
|------------|------------|-----|
| **Debugging Agent** | Chrome UI Browser | Browser finds visual bug → Debug agent traces code cause |
| **Coding Agent** | Chrome UI Browser | Coding fixes bug → Browser confirms fix visually |
| **QA Agent** | Chrome UI Browser | QA runs tests → Browser screenshots failure states |
| **Accessibility Officer** | Chrome UI Browser | Browser finds contrast issue → Accessibility suggests fix |

---

## Cost Tracking

### Expected Daily Usage

| Activity | Frequency | Tokens/Call | Daily Cost |
|----------|-----------|-------------|------------|
| Quick visual checks | 15 | 8,000 | $0.096 |
| Performance tests | 5 | 12,000 | $0.048 |
| Accessibility audits | 3 | 10,000 | $0.024 |
| Visual regression | 10 | 11,000 | $0.088 |

**Total Daily Cost**: ~$0.256 (25.6 cents)
**Monthly Cost**: ~$7.68
**Value**: Catches UI bugs before production (priceless)

---

## Verification Steps

### ✅ Configuration Complete

- [x] Skill created (`.claude/skills/chrome-ui-browser-agent/SKILL.md`)
- [x] Registered in skills-config.json
- [x] Added to tool-allocation-matrix.json
- [x] Auto-activation triggers configured
- [x] Context isolation enforced
- [x] MCP server assignment (chrome-devtools)

### ⏳ Testing Required

- [ ] Test: "Check the landing page" (should auto-activate agent)
- [ ] Test: ChromeDevTools MCP is installed and working
- [ ] Test: Screenshots are saved to `.claude/screenshots/`
- [ ] Test: Context isolation (orchestrator budget unaffected)
- [ ] Test: Performance profiling (Web Vitals)
- [ ] Test: Accessibility auditing (WCAG)

---

## Chrome DevTools MCP Installation

### Check Installation Status

```bash
# Check if chrome-devtools MCP is available
claude mcp list | findstr chrome

# If not installed, install it
npm install -g @modelcontextprotocol/server-chrome-devtools

# Verify installation
npx @modelcontextprotocol/server-chrome-devtools --version
```

### Add to MCP Config

Create/update `.claude/mcp-config.json`:

```json
{
  "mcpServers": {
    "chrome-devtools": {
      "command": "npx",
      "args": ["@modelcontextprotocol/server-chrome-devtools"],
      "env": {}
    }
  }
}
```

---

## Testing the Agent

### Test 1: Basic Visual Check

```
You: "Check if the landing page looks correct"

Expected:
- Agent auto-activates
- Chrome launches
- Screenshot captured
- Layout verified
- Result returned
```

### Test 2: Performance Audit

```
You: "Test studio page performance"

Expected:
- Web Vitals measured (LCP, FID, CLS)
- Blur budget checked
- Performance report generated
```

### Test 3: Accessibility Check

```
You: "Run accessibility audit on /studio"

Expected:
- WCAG 2.1 AA audit runs
- Contrast issues detected
- Keyboard nav verified
- ARIA labels checked
```

---

## Troubleshooting

### Issue: Agent not auto-activating

**Solution**: Check skills-config.json has `"auto_activate_on"` triggers configured

### Issue: ChromeDevTools not found

**Solution**: Install MCP server:
```bash
npm install -g @modelcontextprotocol/server-chrome-devtools
```

### Issue: Screenshots not saving

**Solution**: Create screenshots directory:
```bash
mkdir -p .claude/screenshots/baseline
mkdir -p .claude/screenshots/current
mkdir -p .claude/screenshots/diff
```

### Issue: Context pollution (orchestrator using too many tokens)

**Solution**: Context isolation is already configured. Verify tool-allocation-matrix.json has orchestrator restricted to 3 tools only.

---

## Summary

✅ **Chrome UI Browser Agent is CONFIGURED**
✅ **Highest frequency skill** (20-50 uses/day expected)
✅ **Context isolated** (won't affect orchestrator)
✅ **Cost-effective** ($0.008 per check)
✅ **Auto-activating** (natural language triggers)
✅ **Read-only** (cannot modify code)
✅ **PRIMARY visual authority** (only agent for UI checks)

**Next Step**: Install Chrome DevTools MCP server and test the agent!

---

*Chrome UI Browser Agent - Visual Authority*
*Setup Complete: 2026-01-13*
