import os, subprocess, sys, tempfile, time
HERE = os.path.dirname(os.path.abspath(__file__)); SCRIPT = os.path.join(HERE, "clean_repo.py")
R = tempfile.mkdtemp(); old = time.time() - 3 * 86400
files = {"public/data/portfolio.json": False, "public/data/portfolio.json.pre-midday12": True,
         "public/data/2026/11/x.json.bak": True, "public/data/.intent-2026-09-01-endday.json": True,
         "scripts/build-20261109-midday.tmp.py": True, "scripts/paper_wallet.py": False,
         "src/lib/a.tmp.py": False, "node_modules/x/.DS_Store": False, "build-1.tmp.py": True,
         "check.js": True, "types.js": False, "_to_delete/old.json": True, "public/data/fresh.pre-x": False}
for rel in files:
    p = os.path.join(R, rel); os.makedirs(os.path.dirname(p), exist_ok=True)
    open(p, "w").write("const p='/sessions/x'" if rel == "check.js" else "{}")
    os.utime(p, (old, old) if rel != "public/data/fresh.pre-x" else None)
subprocess.run([sys.executable, SCRIPT, "--root", R, "--apply"], check=True, capture_output=True)
fails = [rel for rel, junk in files.items() if os.path.exists(os.path.join(R, rel)) == junk]
print("ALL TESTS PASSED" if not fails else f"FAILED: {fails}"); sys.exit(1 if fails else 0)
