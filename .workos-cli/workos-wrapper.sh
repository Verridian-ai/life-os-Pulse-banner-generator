#!/bin/bash
# WorkOS CLI Wrapper Script
# This script sets up the environment variables and runs the WorkOS CLI

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Load API key from .env.local
if [ -f "$PROJECT_ROOT/.env.local" ]; then
    WORKOS_API_KEY=$(grep "^WORKOS_API_KEY=" "$PROJECT_ROOT/.env.local" | cut -d'=' -f2)
fi

# Set up headless mode environment variables
export WORKOS_ACTIVE_ENVIRONMENT=headless
export WORKOS_ENVIRONMENTS_HEADLESS_NAME=production
export WORKOS_ENVIRONMENTS_HEADLESS_ENDPOINT=https://api.workos.com
export WORKOS_ENVIRONMENTS_HEADLESS_API_KEY="$WORKOS_API_KEY"
export WORKOS_ENVIRONMENTS_HEADLESS_TYPE=Production

# Run the WorkOS CLI with all passed arguments
"$SCRIPT_DIR/bin/workos.exe" "$@"
