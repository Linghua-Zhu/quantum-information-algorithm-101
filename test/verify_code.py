"""Runs every generated script with Qiskit and compares the results with the page's own numbers.

The device branch runs with QiskitRuntimeService replaced by a local stand-in that returns a fake backend.
"""
import json, math, re, subprocess, sys, tempfile, os, textwrap

cases = json.load(open(sys.argv[1]))
STUB = textwrap.dedent('''
    import qiskit_ibm_runtime as _r
    from qiskit_ibm_runtime.fake_provider import FakeManilaV2 as _F
    class _Service:
        def __init__(self, *a, **k): print("STUB service created with", a, k)
        def least_busy(self, *a, **k):
            print("STUB least_busy called with", a, sorted(k.items())); return _F()
    _r.QiskitRuntimeService = _Service
''')

def exact_probability(script):
    """P(bit 0) for the circuit the script builds, computed without sampling."""
    head = script.split("# 3. Run it")[0]
    ns = {}
    exec(head, ns)
    qc = ns["qc"].remove_final_measurements(inplace=False)
    from qiskit_aer import AerSimulator
    qc.save_probabilities()
    res = AerSimulator(method="density_matrix").run(qc).result()
    return float(res.data()["probabilities"][0])

def qasm_probability(text):
    from qiskit import qasm3
    from qiskit.quantum_info import Statevector
    qc = qasm3.loads(text).remove_final_measurements(inplace=False)
    return float(Statevector.from_instruction(qc).probabilities()[0])

def run(script, prefix=""):
    with tempfile.NamedTemporaryFile("w", suffix=".py", delete=False) as f:
        f.write(prefix + script); path = f.name
    p = subprocess.run([sys.executable, "-W", "error::DeprecationWarning:__main__", path],
                       capture_output=True, text=True, timeout=300)
    os.unlink(path)
    return p

bad = 0
for c in cases:
    tag = f"case {c['i']:2d} {c['target']:11s} axis {c['axis']}"
    pe = exact_probability(c["script"])
    d_exact = abs(pe - c["p"])
    pq = qasm_probability(c["qasm"])
    d_qasm = abs(pq - c["pIdeal"])
    prefix = STUB if c["target"] == "device" else ""
    p = run(c["script"], prefix)
    if p.returncode != 0:
        bad += 1; print(tag, "FAILED TO RUN\n", p.stderr[-900:]); continue
    out = p.stdout
    est = float(re.search(r"estimate of P\([^)]*\): ([0-9.eE+-]+)", out).group(1))
    printed = float(re.search(r"values (?:without noise|in the model): P\([^)]*\) = ([0-9.eE+-]+)", out).group(1))
    shots = 4000
    sigma = math.sqrt(max(c["p"] * (1 - c["p"]), 1e-12) / shots)
    if c["target"] == "simulator":
        ok_est = abs(est - c["p"]) <= 5 * sigma + 1e-9
    else:  # device noise shifts the estimate; allow a wide margin
        ok_est = abs(est - c["p"]) <= 0.08
    ok = d_exact < 1e-9 and d_qasm < 1e-9 and ok_est and abs(printed - c["p"]) < 6e-5
    stub = ""
    if c["target"] == "device":
        m = re.search(r"STUB least_busy called with (.*)", out); stub = " | " + (m.group(1) if m else "STUB NOT CALLED")
        ok = ok and "('operational', True), ('simulator', False)" in out
    warn = " | stderr: " + p.stderr.strip().splitlines()[-1][:120] if p.stderr.strip() else ""
    bad += 0 if ok else 1
    print(f"{tag}: tool P={c['p']:.6f} qiskit exact diff={d_exact:.1e} qasm diff={d_qasm:.1e} "
          f"sampled={est:.4f} {'OK' if ok else 'MISMATCH'}{stub}{warn}")
print("\n%d scripts checked, %d problems" % (len(cases), bad))
sys.exit(1 if bad else 0)
