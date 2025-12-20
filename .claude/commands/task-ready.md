# /task-ready - Prepare Task for Approval

Run final checks and prepare task for user approval.

## Usage

```
/task-ready T{ID}
```

## Procedure

1. **Pre-Flight Checks**:
   ```bash
   cd .worktrees/T{ID}-impl

   # Run tests
   npm run test

   # Run build
   npm run build

   # Run lint
   npm run lint
   ```

2. **Rebase on Main**:
   ```bash
   git fetch origin main
   git rebase origin/main

   # If conflicts, report and stop
   ```

3. **Verify Reviewer Sign-Off**:
   - Check WORK_BOARD for reviewer status
   - If not signed off, prompt for review

4. **Generate Summary**:
   ```
   ## Task Ready for Approval: T{ID}

   **Title**: {Title}

   ### Changes
   - {List of files changed}
   - {Summary of changes}

   ### Acceptance Criteria
   - [x] Criterion 1
   - [x] Criterion 2

   ### Verification
   - Tests: PASSING (X passed, 0 failed)
   - Build: SUCCESS
   - Lint: CLEAN
   - Rebase: CLEAN (no conflicts)

   ### Reviewer Sign-Off
   - Reviewer: {Agent Name}
   - Status: APPROVED
   - Comments: {Any comments}

   ### Ready to Merge
   Target: main
   Method: --no-ff

   **Awaiting user approval to merge.**
   ```

5. **Update WORK_BOARD**:
   - Change status to "Ready for Approval"
   - Add summary link

## Merge Procedure (After User Approval)

```bash
# Orchestrator executes after user says "approved"
git checkout main
git merge task/T{ID}-impl --no-ff -m "Merge T{ID}: {Title}"
git push origin main

# Cleanup
git worktree remove .worktrees/T{ID}-impl
git worktree remove .worktrees/T{ID}-rev
git branch -d task/T{ID}-impl
```

## Example

```
User: /task-ready T001

Running pre-flight checks...
- npm test: PASSED (12 tests)
- npm run build: SUCCESS
- npm run lint: CLEAN
- Rebase on main: CLEAN

Checking reviewer sign-off...
- Reviewer: Frontend Architect (Opus)
- Status: APPROVED
- Comment: "Code looks good. All edge cases handled."

## Ready for Approval

Changes:
- Modified src/App.tsx (fixed context initialization)
- Modified src/context/AIContext.tsx (error handling)
- Added src/components/ErrorBoundary.tsx

All checks passed. Awaiting your approval to merge.
Reply "approved" to merge, or provide feedback.
```
