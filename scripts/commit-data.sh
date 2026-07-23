#!/usr/bin/env bash
# Commit report/data updates safely (for Claude scheduled tasks).
#
# Usage:
#   pnpm data:commit -- "data: add 2026-07-23 morning report"
#   ./scripts/commit-data.sh "data: add 2026-07-23 morning report"
#
# Stages public/data by default. Pass extra paths after -- :
#   pnpm data:commit -- "msg" -- public/data src/lib/types.ts

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SAFE_GIT="$ROOT/scripts/safe-git.sh"

MSG="${1:-}"
if [[ -z "$MSG" ]]; then
  echo "Usage: $0 \"commit message\" [-- extra/paths...]" >&2
  exit 1
fi
shift || true

PATHS=(public/data)
if [[ "${1:-}" == "--" ]]; then
  shift
  if [[ $# -gt 0 ]]; then
    PATHS=("$@")
  fi
fi

cd "$ROOT"
chmod +x "$SAFE_GIT" 2>/dev/null || true

"$SAFE_GIT" add -- "${PATHS[@]}"

# Nothing to commit?
if "$SAFE_GIT" diff --cached --quiet; then
  echo "commit-data: nothing staged — skipping commit"
  exit 0
fi

"$SAFE_GIT" commit -m "$MSG"
echo "commit-data: committed OK"
