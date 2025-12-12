#!/bin/bash

# ============================================================================
# Branch Protection Setup Script
# ============================================================================
# This script sets up comprehensive branch protection rules for the main branch
# to ensure code quality and prevent accidental deployments.
#
# Prerequisites:
# - GitHub CLI (gh) installed and authenticated
# - Admin access to the repository
#
# Usage:
#   bash scripts/setup-branch-protection.sh
# ============================================================================

set -e

echo "🔒 Setting up branch protection for main branch..."
echo ""

# Repository details (extracted from git remote)
REPO_URL=$(git remote get-url origin)
REPO_OWNER=$(echo "$REPO_URL" | sed -E 's/.*[:/]([^/]+)\/([^/]+)(\.git)?$/\1/')
REPO_NAME=$(echo "$REPO_URL" | sed -E 's/.*[:/]([^/]+)\/([^/]+)(\.git)?$/\2/' | sed 's/\.git$//')

echo "📦 Repository: $REPO_OWNER/$REPO_NAME"
echo ""

# Check if gh CLI is installed
if ! command -v gh &> /dev/null; then
    echo "❌ GitHub CLI (gh) is not installed."
    echo ""
    echo "Please install it from: https://cli.github.com/"
    echo ""
    echo "After installation, authenticate with:"
    echo "  gh auth login"
    exit 1
fi

# Check if authenticated
if ! gh auth status &> /dev/null; then
    echo "❌ Not authenticated with GitHub CLI."
    echo ""
    echo "Please authenticate with:"
    echo "  gh auth login"
    exit 1
fi

echo "✅ GitHub CLI is authenticated"
echo ""

# Set up branch protection rules using GitHub API
echo "🛡️  Applying branch protection rules..."
echo ""

gh api \
  --method PUT \
  -H "Accept: application/vnd.github+json" \
  -H "X-GitHub-Api-Version: 2022-11-28" \
  "/repos/$REPO_OWNER/$REPO_NAME/branches/main/protection" \
  -f required_status_checks='{"strict":true,"contexts":["Code Quality","Test Suite","Build Check","Security Scan","CI Status"]}' \
  -f enforce_admins=true \
  -f required_pull_request_reviews='{"dismiss_stale_reviews":true,"require_code_owner_reviews":false,"required_approving_review_count":1,"require_last_push_approval":true}' \
  -f restrictions=null \
  -f required_linear_history=true \
  -f allow_force_pushes=false \
  -f allow_deletions=false \
  -f block_creations=false \
  -f required_conversation_resolution=true \
  -f lock_branch=false \
  -f allow_fork_syncing=true

echo ""
echo "✅ Branch protection rules applied successfully!"
echo ""

# Summary of protection rules
cat << 'EOF'
📋 Protection Rules Summary:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✓ Required Status Checks:
  - Code Quality (ESLint, Prettier, TypeScript)
  - Test Suite (Unit & Integration tests)
  - Build Check (Successful build required)
  - Security Scan (CodeQL, Trivy, npm audit)
  - CI Status (Overall pipeline status)

✓ Pull Request Requirements:
  - At least 1 approving review required
  - Dismiss stale reviews on new commits
  - Require approval on latest push
  - All conversations must be resolved

✓ Branch Restrictions:
  - Enforce for administrators
  - Require linear history (no merge commits)
  - Force pushes blocked
  - Branch deletion blocked
  - Require up-to-date branches before merging

✓ Additional Protections:
  - Conversation resolution required
  - Fork syncing allowed

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔐 Your main branch is now protected!

Next steps:
1. Review the settings at: https://github.com/$REPO_OWNER/$REPO_NAME/settings/branches
2. Configure required reviewers in CODEOWNERS file (optional)
3. Set up deployment environments with manual approval (recommended)

EOF

echo ""
echo "🎉 Branch protection setup complete!"
