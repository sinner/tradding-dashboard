#!/usr/bin/env bash
# auto-push-data.sh — publish public/data to GitHub from the LOCAL machine.
#
# WHY: the Cowork scheduled task writes public/data into this repo but its
# sandbox has no network egress, so it cannot push. This script runs on your
# Mac (real git works here — no read-only .git, no stuck index.lock) and
# commits + pushes natively, so the working tree stays CLEAN and in sync.
#
# It deliberately does NOT use publish-data.mjs: that path commits via the
# GitHub API and moves only the REMOTE ref, leaving the local repo dirty and
# behind. Native git records the commit locally, so there is nothing dirty
# left over.
#
# COMMIT MESSAGE: derived from the most recently written per-session report
# file (public/data/YYYY/MM/<date>-<session>.json). Falls back to a timestamp.
set -euo pipefail

cd "$(dirname "$0")/.."

# launchd/cron start with a minimal PATH — make sure git is findable.
export PATH="/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:$PATH"

REPO="${GITHUB_REPO:-sinner/tradding-dashboard}"
BRANCH="${GITHUB_BRANCH:-main}"

# --- 1. anything to publish? (only look at public/data) ------------------
if [ -z "$(git status --porcelain -- public/data)" ]; then
  echo "$(date '+%F %T') nothing to publish"
  exit 0
fi

# --- 2. derive a meaningful commit message -------------------------------
NEWEST="$(find public/data -type f \
  \( -name '*-morning.json' -o -name '*-midday.json' -o -name '*-endday.json' \) \
  -exec stat -f '%m %N' {} + 2>/dev/null | sort -nr | head -1 | cut -d' ' -f2- || true)"
if [ -n "${NEWEST:-}" ]; then
  BASE="$(basename "$NEWEST" .json)"      # 2026-07-23-midday
  MESSAGE="data: ${BASE##*-} report ${BASE%-*}"   # data: midday report 2026-07-23
else
  MESSAGE="data: auto-publish $(date '+%F %T %z')"
fi

# --- 3. commit ONLY public/data ------------------------------------------
git add -- public/data
git commit -m "$MESSAGE" >/dev/null
echo "$(date '+%F %T') committed: $MESSAGE"

# --- 4. reconcile with remote, then push ---------------------------------
# --autostash keeps us safe if anything else is uncommitted; ff-only rebase
# is a no-op when nothing else has pushed. On conflict we STOP (never force).
if ! git pull --rebase --autostash origin "$BRANCH"; then
  echo "ERROR: rebase hit a conflict — resolve manually, not auto-pushing." >&2
  exit 1
fi

# Push. Prefer the repo's saved credentials; fall back to .github-token
# without persisting it in git config.
if git push origin "HEAD:${BRANCH}" 2>/dev/null; then
  :
elif [ -n "${GITHUB_TOKEN:-}" ] || [ -f .github-token ]; then
  TOKEN="${GITHUB_TOKEN:-$(cat .github-token)}"
  git -c credential.helper= push \
    "https://x-access-token:${TOKEN}@github.com/${REPO}.git" "HEAD:${BRANCH}"
else
  echo "ERROR: push failed and no credentials/.github-token available." >&2
  exit 1
fi
echo "$(date '+%F %T') pushed to ${REPO} ${BRANCH} — working tree clean"
