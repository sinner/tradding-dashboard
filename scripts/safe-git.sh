#!/usr/bin/env bash
# Safe git wrapper for agents / scheduled report tasks.
# - Serializes git writes so two Claude jobs don't race
# - Removes stale .git/index.lock left by killed commits
#
# Usage:
#   ./scripts/safe-git.sh status
#   ./scripts/safe-git.sh add -A public/data
#   ./scripts/safe-git.sh commit -m "data: morning report 2026-07-23"
#   ./scripts/safe-git.sh push
#
# Or via pnpm:
#   pnpm git:safe -- add -A public/data
#   pnpm git:safe -- commit -m "..."

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

INDEX_LOCK=".git/index.lock"
AGENT_LOCK=".git/agent-git.lock"
STALE_SECS="${GIT_LOCK_STALE_SECS:-20}"
WAIT_SECS="${GIT_LOCK_WAIT_SECS:-90}"

git_running() {
  pgrep -x git >/dev/null 2>&1 || pgrep -f '/usr/bin/git |/bin/git | git ' >/dev/null 2>&1
}

file_age_secs() {
  local f="$1"
  if [[ "$(uname -s)" == "Darwin" ]]; then
    local m
    m="$(stat -f %m "$f" 2>/dev/null || echo 0)"
    echo $(( $(date +%s) - m ))
  else
    local m
    m="$(stat -c %Y "$f" 2>/dev/null || echo 0)"
    echo $(( $(date +%s) - m ))
  fi
}

clear_stale_index_lock() {
  [[ -f "$INDEX_LOCK" ]] || return 0

  if git_running; then
    local waited=0
    while git_running && (( waited < WAIT_SECS )); do
      sleep 1
      waited=$((waited + 1))
    done
  fi

  if [[ -f "$INDEX_LOCK" ]]; then
    local age
    age="$(file_age_secs "$INDEX_LOCK")"
    if ! git_running && (( age >= STALE_SECS )); then
      echo "safe-git: removing stale index.lock (age ${age}s)" >&2
      rm -f "$INDEX_LOCK"
    elif ! git_running; then
      # No git process — lock is orphaned even if young
      echo "safe-git: removing orphaned index.lock" >&2
      rm -f "$INDEX_LOCK"
    else
      echo "safe-git: index.lock still held by a live git process" >&2
      return 1
    fi
  fi
}

acquire_agent_lock() {
  local waited=0
  while ! mkdir "$AGENT_LOCK" 2>/dev/null; do
    if [[ -d "$AGENT_LOCK" ]]; then
      local age
      age="$(file_age_secs "$AGENT_LOCK")"
      if (( age >= WAIT_SECS )); then
        echo "safe-git: clearing stale agent lock (age ${age}s)" >&2
        rmdir "$AGENT_LOCK" 2>/dev/null || rm -rf "$AGENT_LOCK"
        continue
      fi
    fi
    if (( waited >= WAIT_SECS )); then
      echo "safe-git: timed out waiting for agent lock" >&2
      return 1
    fi
    sleep 1
    waited=$((waited + 1))
  done
  # shellcheck disable=SC2064
  trap 'rmdir "$AGENT_LOCK" 2>/dev/null || true' EXIT INT TERM
}

if [[ ! -d .git ]]; then
  echo "safe-git: not a git repo: $ROOT" >&2
  exit 1
fi

if [[ $# -lt 1 ]]; then
  echo "Usage: $0 <git-args...>" >&2
  exit 1
fi

# pnpm/npm often forward a literal "--" before args
while [[ "${1:-}" == "--" ]]; do
  shift
done

if [[ $# -lt 1 ]]; then
  echo "Usage: $0 <git-args...>" >&2
  exit 1
fi

acquire_agent_lock
clear_stale_index_lock

# Re-clear right before write ops that touch the index
case "$1" in
  add|rm|mv|commit|merge|rebase|cherry-pick|reset|checkout|stash|pull|fetch|am)
    clear_stale_index_lock
    ;;
esac

git "$@"
status=$?

# If git failed because of a lock, clear once and retry
if (( status != 0 )) && [[ -f "$INDEX_LOCK" ]]; then
  echo "safe-git: git failed with index.lock present — clearing and retrying once" >&2
  clear_stale_index_lock || true
  git "$@"
  status=$?
fi

exit "$status"
