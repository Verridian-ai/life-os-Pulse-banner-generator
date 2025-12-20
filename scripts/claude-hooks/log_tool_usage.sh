#!/bin/bash
# log_tool_usage.sh
# Logs all tool usage for audit trail
#
# This hook is called after Write/Edit/Bash tools complete

set -e

# Get timestamp
TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

# Get current directory
CURRENT_DIR=$(pwd)

# Get tool info from environment (if available)
TOOL_NAME="${CLAUDE_TOOL_NAME:-unknown}"
TOOL_INPUT="${CLAUDE_TOOL_INPUT:-}"

# Log file location
LOG_FILE="docs/ops/.tool_usage_log.txt"

# Create log directory if needed
mkdir -p "$(dirname "$LOG_FILE")"

# Append log entry
echo "[$TIMESTAMP] Tool: $TOOL_NAME | Dir: $CURRENT_DIR" >> "$LOG_FILE"

# Keep log file manageable (last 1000 entries)
if [ -f "$LOG_FILE" ]; then
    tail -n 1000 "$LOG_FILE" > "$LOG_FILE.tmp" && mv "$LOG_FILE.tmp" "$LOG_FILE"
fi

exit 0
