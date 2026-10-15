"""Runs every generated NumPy script and compares its output with the page's expected output."""
import json, subprocess, sys, tempfile, os

cases = json.load(open(sys.argv[1]))
bad = 0
for c in cases:
    with tempfile.NamedTemporaryFile("w", suffix=".py", delete=False) as f:
        f.write(c["script"]); path = f.name
    p = subprocess.run([sys.executable, "-W", "error", path], capture_output=True, text=True, timeout=120)
    os.unlink(path)
    tag = "a = %s, b = %s" % (c["a"], c["b"])
    if p.returncode != 0:
        bad += 1; print(tag, "FAILED TO RUN\n", p.stderr[-600:]); continue
    ok = p.stdout == c["expected"]
    bad += 0 if ok else 1
    print(tag, "OK" if ok else "MISMATCH")
    if not ok:
        print("  expected:", repr(c["expected"]))
        print("  got:     ", repr(p.stdout))
print("\n%d scripts checked, %d problems" % (len(cases), bad))
sys.exit(1 if bad else 0)
