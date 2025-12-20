#!/bin/bash
# deny_root_code_writes.sh
# Blocks production code writes when operating in the root worktree
#
# This hook is called before Write/Edit tools targeting src/**
# It checks if we're in a worktree or the main repo root

set -e

# Get current working directory
CURRENT_DIR=$(pwd)

# Get the git root
GIT_ROOT=$(git rev-parse --show-toplevel 2>/dev/null || echo "$CURRENT_DIR")

# Check if we're in a worktree by looking for .worktrees in the path
if [[ "$CURRENT_DIR" == *".worktrees"* ]]; then
    # We're in a worktree - allow the operation
    echo "[Hook] Worktree detected. Production code write allowed."
    exit 0
fi

# Check if we're in the root worktree
WORKTREE_PATH=$(git rev-parse --show-superproject-working-tree 2>/dev/null || echo "")

if [ -z "$WORKTREE_PATH" ]; then
    # We're in the main repository root
    # Block writes to src/**
    echo "[Hook] ERROR: Production code writes are blocked in root worktree."
    echo "[Hook] Use a worktree under .worktrees/ for implementation."
    echo "[Hook] Example: git worktree add .worktrees/T001-impl -b task/T001-impl"
    exit 1
fi

# Default: allow
exit 0
