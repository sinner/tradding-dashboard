#!/usr/bin/env python3
"""clean_repo.py — remove temp/junk files that scheduled runs leave in the repo.

Only files matching the explicit JUNK patterns below are touched, and only when they are older
than --min-age-hours (default 24) so a backup a running session just made is never removed.
Never touches src/, node_modules/, .git/, .pnpm-store/, dist/, logs/ or the real data files.
Dry-run by default; --apply deletes. If deleting is not permitted, the file is MOVED into
_to_delete/ (gitignored) instead. Never runs git.

USAGE: python3 scripts/clean_repo.py [--root .] [--apply] [--min-age-hours 24]
"""
import argparse, fnmatch, os, shutil, sys, time

SKIP_DIRS = {"node_modules", ".git", ".pnpm-store", "dist", "logs", "src", "docs", ".vscode", ".idea"}
# (directory relative to root, glob) — "" = repo root; "**" suffix = also in sub-directories
JUNK = [
    ("", "build-*.tmp.py"), ("", "intent-*.tmp.json"), ("", "*.tmp.cjs"), ("", "*.tmp.py"),
    ("", ".intent_*"), ("", ".intent-*"), ("", "_intent_*"), ("", "_tmp_*"),
    ("scripts", "build-*.tmp.py"), ("scripts", "intent-*.tmp.json"), ("scripts", ".intent_*"),
    ("scripts", "_build_*"), ("scripts", "_intent_*"), ("scripts", "ledger_out_*.txt"),
    ("scripts", "_ledger_out_*"), ("scripts", ".write_test"),
    ("public/data**", "*.pre-*"), ("public/data**", "*.bak"), ("public/data**", "*.bak-*"),
    ("public/data**", "*.tmp"), ("public/data**", "build-*.tmp.py"), ("public/data**", "intent-*.tmp.json"),
    ("public/data", ".intent-*"), ("public/data", ".intent_*"), ("public/data", ".run_history_entry_new.md"),
    ("**", ".DS_Store"),
    ("_to_delete**", "*"),
]
# root-level agent validator artefacts, identified by content (not just name)
SIGNED = {"check.js": "/sessions/", "types.js": "exports.PortfolioSchema"}
PROTECTED = {"public/data/manifest.json", "public/data/calibration.json", "public/data/portfolio.json",
             "public/data/lessons-archive.json", "public/data/RUN_HISTORY.md"}

def matches(rel):
    d, name = os.path.dirname(rel), os.path.basename(rel)
    for pdir, pat in JUNK:
        rec = pdir.endswith("**"); base = pdir[:-2] if rec else pdir
        in_dir = (d == base) or (rec and (base == "" or d.startswith(base + "/") or d == base))
        if in_dir and fnmatch.fnmatch(name, pat):
            return True
    return False

def candidates(root, min_age_h):
    now = time.time()
    for dp, dns, fns in os.walk(root):
        rel_dir = os.path.relpath(dp, root).replace("\\", "/"); rel_dir = "" if rel_dir == "." else rel_dir
        if rel_dir == "":
            dns[:] = [x for x in dns if x not in SKIP_DIRS]
        for fn in fns:
            rel = f"{rel_dir}/{fn}" if rel_dir else fn
            p = os.path.join(dp, fn)
            if rel in PROTECTED or not os.path.isfile(p) or os.path.islink(p):
                continue
            junk = matches(rel)
            if not junk and rel in SIGNED:
                try: junk = SIGNED[rel] in open(p, errors="ignore").read(4096)
                except OSError: junk = False
            if junk and (now - os.path.getmtime(p)) >= min_age_h * 3600:
                yield rel, p

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--root", default=os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))
    ap.add_argument("--apply", action="store_true"); ap.add_argument("--min-age-hours", type=float, default=24)
    a = ap.parse_args(); root = os.path.abspath(a.root)
    found = list(candidates(root, a.min_age_hours)); size = sum(os.path.getsize(p) for _, p in found)
    deleted = moved = failed = 0
    if a.apply:
        for rel, p in found:
            try:
                os.remove(p); deleted += 1
            except PermissionError:
                if rel.startswith("_to_delete/"):
                    failed += 1; continue
                dest = os.path.join(root, "_to_delete", rel)
                os.makedirs(os.path.dirname(dest), exist_ok=True)
                if os.path.exists(dest): dest += f".{int(time.time())}"
                try: shutil.move(p, dest); moved += 1
                except OSError: failed += 1
        for dp, dns, fns in os.walk(os.path.join(root, "_to_delete"), topdown=False):  # prune empty dirs
            if dp != os.path.join(root, "_to_delete") and not os.listdir(dp):
                try: os.rmdir(dp)
                except OSError: pass
    mode = "APPLY" if a.apply else "DRY-RUN"
    print(f"{mode}: {len(found)} junk files, {size/1e6:.1f} MB · deleted {deleted} · moved to _to_delete {moved} · failed {failed}")
    if not a.apply:
        groups = {}
        for rel, _ in found: groups[os.path.dirname(rel) or "."] = groups.get(os.path.dirname(rel) or ".", 0) + 1
        for k, v in sorted(groups.items()): print(f"  {k}: {v}")
    if moved and not deleted:
        print("NOTE: deleting is not permitted here; files were moved to _to_delete/. Allow deletion and re-run to purge them.")

if __name__ == "__main__":
    main()
