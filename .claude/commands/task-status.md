# /task-status - Check Task Status

Check the status of a specific task or all active tasks.

## Usage

```
/task-status [T{ID}]
```

If no ID provided, shows all active tasks.

## Procedure

1. **Read WORK_BOARD.md**:
   - Parse Active Tasks table
   - Parse Queue if showing all

2. **For Each Active Task**:
   - Check worktree exists
   - Check branch status
   - Check for uncommitted changes
   - Check for conflicts with main

3. **Report Status**:
   ```
   Task: T{ID} - {Title}
   Status: {In Progress | Review | Ready}
   Branch: task/T{ID}-impl
   Worktree: .worktrees/T{ID}-impl

   Git Status:
   - Uncommitted changes: {Yes/No}
   - Behind main: {N commits}
   - Conflicts: {None/List}

   Implementation:
   - Files changed: {count}
   - Tests: {Passing/Failing/Not Run}

   Review:
   - Reviewer assigned: {Agent}
   - Sign-off: {Pending/Complete}
   ```

## Conflict Detection

```bash
# Check if branch can be cleanly rebased
git fetch origin main
git merge-base --is-ancestor origin/main task/T{ID}-impl
if [ $? -ne 0 ]; then
    echo "Branch needs rebase"
fi

# Check for merge conflicts
git merge --no-commit --no-ff origin/main
git merge --abort
```

## Example

```
User: /task-status T001

Status Report for T001:
- Title: Fix white screen / restore baseline navigation
- Status: In Progress
- Started: 2025-12-20 14:30:00
- Branch: task/T001-impl (5 commits ahead of main)
- Conflicts: None
- Tests: Not Run
- Reviewer Sign-off: Pending
```
