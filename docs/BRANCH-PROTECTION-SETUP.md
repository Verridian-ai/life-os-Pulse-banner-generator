# 🔒 Branch Protection Setup Guide

This guide will walk you through setting up comprehensive branch protection for your repository to ensure code quality and prevent accidental deployments.

## Why Branch Protection?

Branch protection prevents:

- ❌ Direct pushes to main branch
- ❌ Merging untested code
- ❌ Deploying without code review
- ❌ Breaking changes without approval
- ❌ Accidental force pushes or deletions

## Quick Setup (Recommended)

### Step 1: Install GitHub CLI

**Windows:**

```powershell
winget install --id GitHub.cli
```

**macOS:**

```bash
brew install gh
```

**Linux:**

```bash
# Debian/Ubuntu
sudo apt install gh

# Fedora/RHEL
sudo dnf install gh
```

### Step 2: Authenticate

```bash
gh auth login
```

Follow the prompts to authenticate with your GitHub account.

### Step 3: Run Setup Script

```bash
bash scripts/setup-branch-protection.sh
```

The script will automatically:

- ✅ Detect your repository
- ✅ Apply branch protection rules
- ✅ Configure status checks
- ✅ Set up PR requirements
- ✅ Display a summary of applied rules

### Step 4: Verify

Go to your repository settings:

```
https://github.com/Verridian-ai/life-os-Pulse-banner-generator/settings/branches
```

You should see protection rules applied to the `main` branch.

## Manual Setup (Alternative)

If you prefer to set up protection manually or the script doesn't work:

### 1. Navigate to Branch Settings

1. Go to your GitHub repository
2. Click **Settings** (top menu)
3. Click **Branches** (left sidebar)
4. Click **Add rule** next to "Branch protection rules"

### 2. Configure Branch Name Pattern

- Branch name pattern: `main`

### 3. Enable Protection Rules

#### ✅ Protect matching branches

Check the following options:

##### **Require a pull request before merging**

- ✅ Require approvals: `1`
- ✅ Dismiss stale pull request approvals when new commits are pushed
- ✅ Require approval of the most recent reviewable push

##### **Require status checks to pass before merging**

- ✅ Require branches to be up to date before merging
- Add these required status checks:
  - `Code Quality`
  - `Test Suite`
  - `Build Check`
  - `Security Scan`
  - `CI Status`

##### **Require conversation resolution before merging**

- ✅ Enabled

##### **Require linear history**

- ✅ Enabled

##### **Do not allow bypassing the above settings**

- ✅ Enabled

##### **Restrict who can push to matching branches**

- Leave unchecked (unless you want specific user restrictions)

##### **Allow force pushes**

- ❌ Disabled (unchecked)

##### **Allow deletions**

- ❌ Disabled (unchecked)

### 4. Save Changes

Click **Create** or **Save changes**

## Understanding the Protection Rules

### 🔍 Status Checks

Every PR must pass these checks before merging:

| Check             | What it does                                 |
| ----------------- | -------------------------------------------- |
| **Code Quality**  | Runs ESLint, Prettier, and TypeScript checks |
| **Test Suite**    | Executes all unit and integration tests      |
| **Build Check**   | Verifies the application builds successfully |
| **Security Scan** | Runs CodeQL, Trivy, and npm audit            |
| **CI Status**     | Overall gate ensuring all checks passed      |

### 👥 Pull Request Reviews

- At least **1 approving review** required
- Reviews become **stale** when new commits are pushed
- Latest push must be **approved** before merging
- All **conversations must be resolved**

### 📋 Additional Protections

- **Linear history**: No merge commits allowed (use squash or rebase)
- **Enforce for admins**: Even repository admins must follow these rules
- **No force pushes**: Prevents rewriting history
- **No deletions**: Prevents accidental branch deletion

## CODEOWNERS Configuration

The `.github/CODEOWNERS` file automatically assigns reviewers:

```
# Global owner (reviews all changes)
* @Verridian-ai

# Frontend components
/src/components/** @Verridian-ai

# Critical configuration files
/.github/workflows/** @Verridian-ai
/vercel.json @Verridian-ai
```

### Adding More Reviewers

Edit `.github/CODEOWNERS`:

```
# Security team reviews authentication code
/src/services/auth.ts @Verridian-ai @security-team

# Frontend team reviews UI components
/src/components/** @Verridian-ai @frontend-team

# Backend team reviews API services
/src/services/** @Verridian-ai @backend-team
```

## Setting Up Required Environments

### Production Environment Protection

1. Go to **Settings** → **Environments**
2. Click **New environment**
3. Name it `production`
4. Configure protection rules:
   - ✅ Required reviewers: Add yourself or team members
   - ✅ Deployment branches: `main` only
   - ⏰ Wait timer: `0` minutes (or set a delay)

This ensures production deployments require manual approval.

### Staging Environment (Optional)

1. Create another environment named `staging`
2. Set deployment branch to `develop`
3. No required reviewers needed (auto-deploy)

## Testing the Protection

### Test 1: Try Direct Push (Should Fail)

```bash
git checkout main
echo "test" >> test.txt
git add test.txt
git commit -m "test: direct push"
git push origin main
```

**Expected Result:** ❌ Push rejected (protected branch)

### Test 2: Create PR (Should Work)

```bash
git checkout -b test/branch-protection
echo "test" >> test.txt
git add test.txt
git commit -m "test: branch protection"
git push origin test/branch-protection
```

Then create a PR on GitHub:

1. Go to repository
2. Click **Pull requests** → **New pull request**
3. Select your branch
4. Create PR
5. Wait for status checks
6. Request review
7. Merge after approval

**Expected Result:** ✅ PR created, checks run, requires approval

### Test 3: Try Merging Without Approval (Should Fail)

After creating a PR:

1. Don't request/approve review
2. Try to click **Merge pull request**

**Expected Result:** ❌ Merge button disabled (requires approval)

### Test 4: Verify Status Checks

1. Create a PR with failing tests
2. Status checks should fail
3. Merge button should be disabled

**Expected Result:** ❌ Can't merge with failing checks

## Workflow After Protection

### Normal Development

```bash
# 1. Create feature branch
git checkout -b feature/my-feature

# 2. Make changes
# ... edit files ...

# 3. Commit
git add .
git commit -m "feat: add my feature"

# 4. Push
git push origin feature/my-feature

# 5. Create PR on GitHub

# 6. Wait for CI checks

# 7. Request review from code owners

# 8. Address feedback

# 9. Get approval

# 10. Merge PR
```

### Hotfix Flow

For urgent production fixes:

```bash
# 1. Create hotfix branch from main
git checkout main
git pull
git checkout -b hotfix/critical-fix

# 2. Make the fix
# ... fix code ...

# 3. Commit
git add .
git commit -m "fix: critical production issue"

# 4. Push
git push origin hotfix/critical-fix

# 5. Create PR with "hotfix" label

# 6. Request immediate review

# 7. Merge and deploy
```

## Emergency Bypass (Use with Caution)

If you absolutely need to bypass protection temporarily:

### Option 1: Use Admin Override

GitHub repository admins can temporarily disable protection:

1. Go to **Settings** → **Branches**
2. Edit the `main` branch rule
3. Uncheck "Do not allow bypassing the above settings"
4. Make your emergency push
5. **Immediately re-enable** the protection

⚠️ **Only use this for emergencies!**

### Option 2: Use Deployment Workflow

Instead of bypassing protection, use the manual workflow:

1. Go to **Actions** → **Deploy to Production**
2. Click **Run workflow**
3. Set `skip_tests: true` if needed
4. Deploy directly

This maintains audit trail and safety.

## Troubleshooting

### Issue: "Required status checks are not passing"

**Cause:** CI checks failed

**Solution:**

1. Click "Details" next to failed check
2. Review error logs
3. Fix the issue in your branch
4. Push again (checks re-run automatically)

### Issue: "Review required"

**Cause:** No approving review yet

**Solution:**

1. Request review from code owner
2. Wait for approval
3. Address any feedback
4. Get approval before merging

### Issue: "Branch is out of date"

**Cause:** Main branch has new commits

**Solution:**

```bash
git checkout your-branch
git pull origin main
git push
```

Or use GitHub's "Update branch" button.

### Issue: "GitHub CLI not authenticated"

**Cause:** Not logged into gh CLI

**Solution:**

```bash
gh auth login
# Follow the prompts
```

### Issue: "Permission denied"

**Cause:** Not a repository admin

**Solution:**

- Ask repository owner to run the setup script
- Or request admin access

### Issue: Status checks not appearing

**Cause:** Workflows haven't run yet

**Solution:**

1. Make sure workflows are in `.github/workflows/`
2. Push a commit to trigger workflows
3. After first run, checks will appear

## Verification Checklist

After setup, verify:

- [ ] Branch protection rules visible in Settings → Branches
- [ ] Status checks listed in protection rules
- [ ] Direct push to main is blocked
- [ ] PRs require approval before merging
- [ ] PRs require passing CI checks
- [ ] CODEOWNERS file assigns reviewers automatically
- [ ] Production environment requires manual approval

## Best Practices

### 1. Always Use Pull Requests

Even for small changes:

```bash
git checkout -b fix/typo
# ... make fix ...
git commit -m "fix: correct typo in documentation"
git push origin fix/typo
# Create PR
```

### 2. Keep Branches Up to Date

Before merging:

```bash
git checkout your-branch
git pull origin main
git push
```

### 3. Write Descriptive PR Titles

❌ Bad: "Fixed stuff"
✅ Good: "fix: resolve canvas rendering issue on mobile devices"

### 4. Link Issues in PRs

```
Fixes #123
Closes #456
Resolves #789
```

### 5. Request Review Early

Don't wait until everything is perfect:

1. Push your branch
2. Create **draft PR**
3. Request feedback
4. Mark as **Ready for review** when done

## Next Steps

After setting up branch protection:

1. ✅ Review the [Deployment Guide](./DEPLOYMENT.md)
2. ✅ Set up GitHub Secrets for CI/CD
3. ✅ Configure production environment protection
4. ✅ Test the workflow with a small PR
5. ✅ Share this guide with your team

## Summary

Your main branch is now protected with:

- ✅ **Required status checks** - All CI must pass
- ✅ **Required reviews** - At least 1 approval needed
- ✅ **Stale review dismissal** - New commits require new approval
- ✅ **Conversation resolution** - All comments must be addressed
- ✅ **Linear history** - No merge commits
- ✅ **No force pushes** - History cannot be rewritten
- ✅ **No deletions** - Branch cannot be deleted
- ✅ **Admin enforcement** - Rules apply to everyone

**Your repository is now production-ready!** 🎉

---

**Questions?** Check the [Deployment Guide](./DEPLOYMENT.md) or open an issue.
