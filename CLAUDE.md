# Agent / scheduled-bot write paths

Hard rules for Claude Cowork session bots (`btc-paper-desk`, morning / midday / endday / midnight) and any other agent working this repo.

## Durable writes (ONLY these)

| Path | Purpose |
| --- | --- |
| `public/data/YYYY/MM/YYYY-MM-DD-{session}.json` | Report JSON |
| `public/data/reports/YYYY/MM/YYYY-MM-DD-{session}.md` | Narrative markdown |
| `public/data/manifest.json` | Day index (merge, never rewrite from scratch) |
| `public/data/calibration.json` | Calibration rows (append / backfill) |
| `public/data/portfolio.json` | Wallet — **only** via `scripts/paper_wallet.py` |
| `public/data/RUN_HISTORY.md` | Short run log entry |

Do **not** create backups like `*.pre-*`, `*.bak`, or duplicate copies next to those files.

## Ephemeral scratch (ONLY here)

Prefer OS temp — leftovers must never dirty the git tree:

```text
/tmp/tradding-dashboard/<session>-YYYYMMDD>/
```

Examples:

```bash
SCRATCH=/tmp/tradding-dashboard/morning-20261014
mkdir -p "$SCRATCH"
# intent for the ledger
python3 scripts/paper_wallet.py \
  --portfolio public/data/portfolio.json \
  --intent "$SCRATCH/intent.json"
# one-off zod / node checks — write under $SCRATCH, never at repo root
```

If `/tmp` is unavailable in the sandbox, use **only**:

```text
.agent-scratch/<session>-YYYYMMDD>/
```

That directory is gitignored. Still delete the run folder when finished if deletion is allowed.

## Forbidden (never create)

- Anything at the **repo root** (`val*.ts`, `zcheck*.ts`, `.intent_*`, `.gen_*`, `.tmp_*`, `_val*`, …)
- `scripts/_build_*`, `scripts/_intent_*`, `scripts/_ledger_out_*`
- Scratch under `public/data/` (no `.intent-*.json` beside real data)
- Edits under `src/**` during a scheduled data run (data bots are not app-code tasks)

## Validation without leftover files

Prefer inline one-shots that leave no file:

```bash
npx tsx -e 'import { ReportSchema } from "./src/lib/types.ts"; ...'
# or node -e '...'
```

If a temp file is required, put it under `$SCRATCH` and remove it before ending the run. Unattended runs often cannot delete repo files — that is why scratch must live in `/tmp`.

## Git / publish

Scheduled sandboxes **never** run `git`. Local `scripts/auto-push-data.sh` publishes **only** `public/data`. Keep it that way: do not leave non-data files for the Mac job to trip over.
