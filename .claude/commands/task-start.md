# /task-start - Start Task Implementation

Create worktrees and begin implementation for a task.

## Usage

```
/task-start T{ID}
```

## Procedure

1. **Validate Task**:
   - Confirm task exists in WORK_BOARD.md
   - Confirm task is in Queue or Pending status
   - Confirm all required fields are present

2. **Create Worktrees**:
   ```bash
   # Implementation worktree
   git worktree add .worktrees/T{ID}-impl -b task/T{ID}-impl

   # Review worktree
   git worktree add .worktrees/T{ID}-rev task/T{ID}-impl
   ```

3. **Update WORK_BOARD**:
   - Move task from Queue to Active Tasks
   - Set status to "In Progress"
   - Record start timestamp
   - Record worktree paths

4. **Update Agent Context**:
   - Update assigned agents' sections
   - Set "Current Assignments"

5. **Delegate to Implementer**:
   - Spawn Sonnet subagent in impl worktree
   - Provide task context
   - Agent reads shared_contract.md + their agent prompt

## Pre-Flight Checks

- [ ] Task has acceptance criteria
- [ ] Task has test plan
- [ ] Implementer agent assigned
- [ ] Reviewer agent assigned
- [ ] No blockers listed

## Example

```
User: /task-start T001

Orchestrator:
1. Validated T001 exists and is queued
2. Created .worktrees/T001-impl with branch task/T001-impl
3. Created .worktrees/T001-rev tracking same branch
4. Updated WORK_BOARD: T001 now Active
5. Delegating to Frontend Architect (Sonnet)...
```

## Notes

- Orchestrator NEVER enters worktrees to write code
- Orchestrator only manages worktree creation/cleanup
- Implementation is done by delegated subagents
