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

def exact_bloch(script):
    """Bloch vector of the state the script builds, noise steps included."""
    import numpy as np
    from qiskit_aer import AerSimulator
    ns = {}
    exec(script.split("# 2. The observables")[0], ns)
    qc = ns["qc"].copy()
    qc.save_density_matrix()
    m = np.asarray(AerSimulator(method="density_matrix").run(qc).result().data()["density_matrix"])
    return [2 * m[1, 0].real, 2 * m[1, 0].imag, (m[0, 0] - m[1, 1]).real]

def qasm_bloch(text):
    from qiskit import qasm3
    from qiskit.quantum_info import Statevector, Pauli
    sv = Statevector.from_instruction(qasm3.loads(text))
    return [sv.expectation_value(Pauli(k)).real for k in "XYZ"]

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

def check_expect(c):
    tag = f"case {c['i']:2d} {c['target']:11s} <X>,<Y>,<Z>"
    d_exact = max(abs(a - b) for a, b in zip(exact_bloch(c["script"]), c["bloch"]))
    d_qasm = max(abs(a - b) for a, b in zip(qasm_bloch(c["qasm"]), c["blochIdeal"]))
    p = run(c["script"], STUB if c["target"] == "device" else "")
    if p.returncode != 0:
        print(tag, "FAILED TO RUN\n", p.stderr[-900:]); return 1
    out = p.stdout
    vals = [float(v) for v in re.search(r"<X>, <Y>, <Z> = \[([^\]]*)\]", out).group(1).split(",")]
    last = out.rstrip("\n").split("\n")[-1]
    want_last = c["expected"].split("\n")[-1]
    if c["target"] == "simulator":
        ok = out == c["expected"] + "\n"
        dev = max(abs(a - b) for a, b in zip(vals, c["bloch"]))
    else:  # device noise and finite shots shift the values
        dev = max(abs(a - b) for a, b in zip(vals, c["bloch"]))
        ok = dev <= 0.15 and last == want_last and not re.search(r"-0\.0(?![0-9])", out.split("\n")[-3])
    ok = ok and d_exact < 1e-9 and d_qasm < 1e-9
    stub = ""
    if c["target"] == "device":
        m = re.search(r"STUB least_busy called with (.*)", out); stub = " | " + (m.group(1) if m else "STUB NOT CALLED")
        ok = ok and "('operational', True), ('simulator', False)" in out
    warn = " | stderr: " + p.stderr.strip().splitlines()[-1][:120] if p.stderr.strip() else ""
    print(f"{tag}: exact diff={d_exact:.1e} qasm diff={d_qasm:.1e} printed {vals} largest deviation {dev:.3f} "
          f"{'OK' if ok else 'MISMATCH'}{stub}{warn}")
    if not ok and c["target"] == "simulator":
        print("   expected:", repr(c["expected"]), "\n   got:     ", repr(out))
    return 0 if ok else 1

def check_snippet(c):
    p = run(c["script"])
    ok = p.returncode == 0 and p.stdout == c["expected"]
    print("Pauli snippet:", "OK" if ok else "MISMATCH", repr(p.stdout), p.stderr[-400:] if p.returncode else "")
    return 0 if ok else 1

bad = 0
for c in cases:
    if c["mode"] == "expect":
        bad += check_expect(c); continue
    if c["mode"] == "snippet":
        bad += check_snippet(c); continue
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
