# /task-new - Create New Task

Create a new task entry in the work board.

## Usage

```
/task-new [title]
```

## Procedure

1. **Generate Task ID**: Get next available ID from `docs/ops/WORK_BOARD.md`

2. **Gather Information**: Ask user for:
   - Title (if not provided)
   - Description
   - Acceptance criteria
   - Priority (P0-P3)

3. **Identify Affected Areas**:
   - Search codebase for related files
   - List suspected areas

4. **Assign Agents**:
   - Select appropriate implementer agent
   - Select appropriate reviewer agent

5. **Create Entry**:
   - Add to Queue section in WORK_BOARD.md
   - Add detailed task to Task Details section

6. **Update Agent Context**:
   - Add assignment to relevant agent section in AGENT_CONTEXT.md

## Template

```markdown
### T{ID}: {Title}

**Description**: {Description}

**Acceptance Criteria**:
- [ ] {Criterion 1}
- [ ] {Criterion 2}
- [ ] All tests pass
- [ ] Build succeeds

**Affected Areas**:
- `src/path/to/file.tsx`

**Assigned Agents**:
- Implementer: {Agent} (Sonnet)
- Reviewer: {Agent} (Opus)

**Test Plan**:
- {Test items}

**Status**: Queued
**Created**: {YYYY-MM-DD}
```

## Example

```
User: /task-new Fix login button not responding

Orchestrator:
1. Generated ID: T004
2. Created task entry
3. Assigned: Frontend Architect (impl) + Security Warden (review)
4. Added to WORK_BOARD.md Queue
```
