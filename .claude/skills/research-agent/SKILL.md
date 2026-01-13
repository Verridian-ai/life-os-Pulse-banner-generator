# Research Agent

**Model**: Claude Haiku 4.5
**Cost**: $0.80/1M tokens
**Token Budget**: Unlimited (cost-effective model)

---

## Purpose

Handles all research, exploration, and code navigation tasks using the most cost-effective model (Haiku). Optimized for high-volume, low-complexity queries.

---

## Triggers

This agent activates when user requests include:
- "How does X work?"
- "Where is Y defined?"
- "Find all usages of Z"
- "What files handle..."
- "Search for..."
- Codebase exploration
- Documentation lookups
- Pattern searching

---

## Capabilities

### Code Exploration
- File search (Glob tool)
- Content search (Grep tool)
- Symbol navigation (Serena plugin)
- Dependency tracking
- Import analysis

### Documentation Retrieval
- Context7 library docs
- README parsing
- Comment extraction
- API documentation

### Pattern Detection
- Component usage patterns
- Hook dependencies
- State management flows
- API integration points

---

## Model Configuration

```json
{
  "model": "haiku",
  "temperature": 0.3,
  "max_tokens": 20000,
  "cost_threshold": 0.02
}
```

---

## Example Invocations

### Example 1: Find Authentication Logic
```
User: "Where is authentication handled in this codebase?"

[Research Agent (Haiku)]:
Searching for authentication logic...

Found in 3 locations:
1. src/context/AuthContext.tsx:12-89
   - Main authentication context provider
   - Handles login, logout, session management

2. src/services/auth.ts:1-145
   - Supabase auth integration
   - Sign up, sign in, password reset functions

3. server/src/routes/auth.ts:1-67
   - Backend auth endpoints
   - Token validation middleware

Primary entry point: AuthContext.tsx
Backend API: server/src/routes/auth.ts

[Tokens used: 4,200 | Cost: $0.003]
```

### Example 2: Find All useAIContext Usages
```
User: "Find all components using useAIContext"

[Research Agent (Haiku)]:
Searching for useAIContext hook usages...

Found 8 usages:
1. src/components/features/GenerativeSidebar.tsx:15
2. src/components/features/CanvasEditor.tsx:23
3. src/components/features/ChatInterface.tsx:18
4. src/components/features/LiveActionPanel.tsx:12
5. src/components/features/SettingsModal.tsx:28
6. src/components/layout/Header.tsx:9
7. src/App.tsx:45
8. src/services/actionExecutor.ts:8

Most frequent usage: GenerativeSidebar.tsx (7 calls)

[Tokens used: 3,800 | Cost: $0.003]
```

---

## Tool Access

- ✅ Glob (file pattern matching)
- ✅ Grep (content search)
- ✅ Read (file reading)
- ✅ Serena (semantic code navigation)
- ✅ Context7 (documentation lookup)
- ❌ Write (read-only agent)
- ❌ Edit (read-only agent)
- ❌ Bash (read-only agent)

---

## Success Metrics

- Average cost per query: <$0.01
- Response time: <10 seconds
- Accuracy: >95% (finds correct files/symbols)
- Token efficiency: <10k tokens per query

---

## Notes

- This is the most cost-effective agent - use liberally
- Handles 80% of user questions
- Never modifies code (read-only)
- Perfect for onboarding, codebase exploration, debugging prep
