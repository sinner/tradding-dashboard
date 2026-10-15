# Agent scratch (fallback only)

Prefer `/tmp/tradding-dashboard/<session>-YYYYMMDD>/` so leftovers never touch git.

Use this directory **only** when `/tmp` is unavailable in the sandbox:

```bash
SCRATCH=.agent-scratch/morning-20261014
mkdir -p "$SCRATCH"
# write intent / harnesses here, then delete the folder if allowed
```

Everything under this folder except this README is gitignored. See `CLAUDE.md`.
