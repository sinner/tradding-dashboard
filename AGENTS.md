# Agent instructions

See **[CLAUDE.md](./CLAUDE.md)** for the hard write-path allowlist.

**Summary:** durable output only under `public/data/…`; ephemeral files only under `/tmp/tradding-dashboard/…` (fallback: `.agent-scratch/…`). Never create files at the repo root.
