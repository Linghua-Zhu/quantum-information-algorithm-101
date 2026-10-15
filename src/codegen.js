// Qiskit script and OpenQASM for a one-qubit circuit
// op: {t:'gate',name}, {t:'relax',tt,q,a,b,label} or {t:'depol',p,label}
var CG_PREP={zero:[],one:['x'],plus:['h'],minus:['x','h'],plusi:['h','s'],minusi:['h','sdg']};
var CG_GATE={X:'x',Y:'y',Z:'z',H:'h',S:'s',Sdg:'sdg',T:'t',Tdg:'tdg'};
var CG_KET={zero:'|0>',one:'|1>',plus:'|+>',minus:'|->',plusi:'|+i>',minusi:'|-i>'};
var CG_AXIS={
  z:{name:'Z',pre:[],p:'0',m:'1',vp:'n_0',vm:'n_1'},
  x:{name:'X',pre:['h'],p:'+',m:'-',vp:'n_plus',vm:'n_minus'},
  y:{name:'Y',pre:['sdg','h'],p:'+i',m:'-i',vp:'n_plus_i',vm:'n_minus_i'}
};
var CG_TARGETS={
  simulator:{label:'An ideal simulator',pip:'pip install qiskit'},
  fake_device:{label:'A simulator that imitates a real device',pip:'pip install qiskit qiskit-aer qiskit-ibm-runtime'},
  device:{label:'A real quantum computer',pip:'pip install qiskit qiskit-ibm-runtime'}
};
function opPath(op,r){
  if(op.t==='gate'){var g=gateOf(op.name);return function(s){return rot(g.axis,g.angle*s,r);};}
  if(op.t==='relax')return function(s){return chRelax(Math.pow(op.a,s),Math.pow(op.b,s),r);};
  return function(s){return chDepol(op.p*s,r);};
}
function circuitState(start,ops,skipNoise){
  var v=STARTS[start].slice();
  ops.forEach(function(op){if(skipNoise&&op.t!=='gate')return;v=opPath(op,v)(1);});
  return v;
}
function hasNoise(ops){return ops.some(function(op){return op.t!=='gate';});}
function pyNum(x){var r=Math.round(x*1e4)/1e4;if(r===0)r=0;return String(r);}
function circuitAscii(start,ops){
  return CG_KET[start]+ops.map(function(op){
    if(op.t==='gate'){var g=gateOf(op.name);return ' - '+(g.param?'R'+g.param+'('+g.deg+' deg)':op.name.replace('dg','+'));}
    return op.t==='relax'?' - [T1,T2]':' - [depol]';
  }).join('');
}
function gateLines(start,ops,withNoise,L){
  var prep=CG_PREP[start];
  if(prep.length){L.push({t:'# prepare '+CG_KET[start]});prep.forEach(function(m){L.push({t:'qc.'+m+'(0)'});});}
  if(prep.length&&ops.length)L.push({t:'# the gates'});
  ops.forEach(function(op){
    if(op.t==='gate'){
      if(CG_GATE[op.name])L.push({t:'qc.'+CG_GATE[op.name]+'(0)'});
      else{var g=gateOf(op.name);L.push({t:'qc.r'+g.param+'('+g.deg+' * pi / 180, 0)'});}
      return;
    }
    if(!withNoise)return;
    if(op.t==='relax'){
      L.push({t:'# noise step: relaxation and dephasing for t = '+pyNum(op.tt)+' T1, with T2 = '+pyNum(op.q)+' T1'});
      L.push({t:'qc.append(thermal_relaxation_error(1.0, '+pyNum(op.q)+', '+pyNum(op.tt)+').to_instruction(), [0])'});
    }else{
      L.push({t:'# noise step: depolarizing noise with p = '+pyNum(op.p)});
      L.push({t:'qc.append(depolarizing_error('+pyNum(op.p)+', 1).to_instruction(), [0])'});
    }
  });
}
function usesPi(ops){return ops.some(function(op){return op.t==='gate'&&!CG_GATE[op.name];});}
function genQiskit(spec){
  if(spec.mode==='expect')return genQiskitExpect(spec);
  var A=CG_AXIS[spec.axis],noisy=hasNoise(spec.ops),target=noisy?'simulator':spec.target,L=[],shots=spec.shots;
  var r=circuitState(spec.start,spec.ops,false),pr=dot(r,AXM[spec.axis].v);
  function push(t,m){L.push({t:t,m:m||''});}
  push('# Quantum Information and Programming 101');
  push('# Unit 1, one qubit');
  push('# Circuit: '+circuitAscii(spec.start,spec.ops)+', measured along '+spec.axis);
  push('');
  if(usesPi(spec.ops))push('from math import pi');
  push('from qiskit import QuantumCircuit');
  if(noisy){
    push('from qiskit_aer import AerSimulator');
    push('from qiskit_aer.noise import depolarizing_error, thermal_relaxation_error');
    push('');
    push('# This circuit has noise steps from Explore. They are a model of noise,');
    push('# so this script runs on a simulator only. A real device supplies its');
    push('# own noise. Remove the noise steps in Explore to get a script that can');
    push('# also run on a real quantum computer.');
    push('SHOTS = '+shots);
  }else{
    push('');
    push('# Where to run. This is the one line to change:');
    push('#   "simulator"    an ideal simulator on your computer, no account needed');
    push('#   "fake_device"  a simulator that imitates a real device, noise included');
    push('#   "device"       a real quantum computer at IBM, needs a free account');
    push('RUN_ON = "'+target+'"','chg');
    push('SHOTS = '+shots);
  }
  push('');
  push('# 1. Build the circuit. The qubit starts in |0>.');
  push('qc = QuantumCircuit(1, 1)');
  var G=[];gateLines(spec.start,spec.ops,noisy,G);G.forEach(function(x){push(x.t);});
  push('');
  if(spec.axis==='z'){
    push('# 2. Measure. Hardware measures along z, the axis wanted here.');
  }else{
    push('# 2. Choose the measurement axis. Hardware measures along z only,');
    push('#    so to measure along '+spec.axis+' the circuit first turns the '+spec.axis+' axis onto z.');
    A.pre.forEach(function(m){push('qc.'+m+'(0)');});
  }
  push('qc.measure(0, 0)');
  push('');
  if(noisy){
    push('# 3. Run it on a simulator that can apply the noise steps.');
    push('sim = AerSimulator(method="density_matrix", seed_simulator=101)');
    push('job = sim.run(qc, shots=SHOTS)');
    push('counts = job.result().get_counts()');
  }else{
    var s=target==='simulator',f=target==='fake_device',d=target==='device';
    push('# 3. Run it.');
    push('if RUN_ON == "simulator":');
    push('    from qiskit.primitives import StatevectorSampler',s?'act':'');
    push('    sampler = StatevectorSampler(seed=101)',s?'act':'');
    push('    job = sampler.run([qc], shots=SHOTS)',s?'act':'');
    push('else:');
    push('    from qiskit.transpiler import generate_preset_pass_manager',s?'':'act');
    push('    try:                                # qiskit-ibm-runtime 0.50 or later',s?'':'act');
    push('        from qiskit_ibm_runtime.executor_sampler import Sampler',s?'':'act');
    push('    except ImportError:                 # earlier versions',s?'':'act');
    push('        from qiskit_ibm_runtime import SamplerV2 as Sampler',s?'':'act');
    push('    if RUN_ON == "fake_device":');
    push('        from qiskit_ibm_runtime.fake_provider import FakeManilaV2',f?'act':'');
    push('        backend = FakeManilaV2()',f?'act':'');
    push('    else:');
    push('        from qiskit_ibm_runtime import QiskitRuntimeService',d?'act':'');
    push('        service = QiskitRuntimeService()   # reads your saved API key',d?'act':'');
    push('        backend = service.least_busy(simulator=False, operational=True)',d?'act':'');
    push('    print("running on:", backend.name)',s?'':'act');
    push('    # A device has its own small set of gates. Rewrite the circuit in them.',s?'':'act');
    push('    pm = generate_preset_pass_manager(backend=backend, optimization_level=1)',s?'':'act');
    push('    sampler = Sampler(mode=backend)',s?'':'act');
    push('    job = sampler.run([pm.run(qc)], shots=SHOTS)',s?'':'act');
    push('    print("job id:", job.job_id(), "(a real device puts the job in a queue)")',s?'':'act');
    push('counts = job.result()[0].data.c.get_counts()');
  }
  push('');
  push('# 4. Read the result. Bit 0 is the outcome '+A.p+', bit 1 is the outcome '+A.m+'.');
  push(A.vp+' = counts.get("0", 0)');
  push(A.vm+' = counts.get("1", 0)');
  push('print("counts:", counts)');
  push('print("estimate of P('+A.p+'):", '+A.vp+' / SHOTS)');
  push('print("estimate of <'+A.name+'>:", ('+A.vp+' - '+A.vm+') / SHOTS)');
  push('print("'+(noisy?'values in the model':'values without noise')+': P('+A.p+') = '+pyNum((1+pr)/2)+', <'+A.name+'> = '+pyNum(pr)+'")');
  return {lines:L,text:L.map(function(x){return x.t;}).join('\n')+'\n',target:target,simOnly:noisy,
    pip:noisy?'pip install qiskit qiskit-aer':CG_TARGETS[target].pip,p:(1+pr)/2,e:pr,axis:spec.axis,
    spread:Math.sqrt(Math.max(0,1-pr*pr)/shots)};
}
function genQiskitExpect(spec){
  var noisy=hasNoise(spec.ops),target=noisy?'simulator':spec.target,L=[],r=circuitState(spec.start,spec.ops,false);
  var sim=target==='simulator',fake=target==='fake_device',dev=target==='device';
  function push(t,m){L.push({t:t,m:m||''});}
  push('# Quantum Information and Programming 101');
  push('# Unit 1, one qubit');
  push('# Circuit: '+circuitAscii(spec.start,spec.ops)+', expectation values of X, Y and Z');
  push('');
  if(usesPi(spec.ops))push('from math import pi');
  push('from qiskit import QuantumCircuit');
  push('from qiskit.quantum_info import SparsePauliOp');
  if(noisy){
    push('from qiskit_aer import AerSimulator');
    push('from qiskit_aer.noise import depolarizing_error, thermal_relaxation_error');
    push('');
    push('# This circuit has noise steps from Explore. They are a model of noise,');
    push('# so this script runs on a simulator only. A real device supplies its');
    push('# own noise. Remove the noise steps in Explore to get a script that can');
    push('# also run on a real quantum computer.');
  }else{
    push('');
    push('# Where to run. This is the one line to change:');
    push('#   "simulator"    an ideal simulator on your computer, no account needed');
    push('#   "fake_device"  a simulator that imitates a real device, noise included');
    push('#   "device"       a real quantum computer at IBM, needs a free account');
    push('RUN_ON = "'+target+'"','chg');
  }
  push('');
  push('# 1. Build the circuit. The qubit starts in |0>. No measurement is needed.');
  push('qc = QuantumCircuit(1)');
  var G=[];gateLines(spec.start,spec.ops,noisy,G);G.forEach(function(x){push(x.t);});
  push('');
  push('# 2. The observables, one Pauli operator each.');
  push('observables = [SparsePauliOp("X"), SparsePauliOp("Y"), SparsePauliOp("Z")]');
  push('');
  if(noisy){
    push('# 3. Run it on a simulator that can apply the noise steps.');
    push('for name, op in zip("XYZ", observables):');
    push('    qc.save_expectation_value(op, [0], label=name)');
    push('sim = AerSimulator(method="density_matrix")');
    push('data = sim.run(qc).result().data()');
    push('values = [data[name] for name in "XYZ"]');
  }else{
    push('# 3. Run it.');
    push('if RUN_ON == "simulator":');
    push('    from qiskit.primitives import StatevectorEstimator',sim?'act':'');
    push('    estimator = StatevectorEstimator()',sim?'act':'');
    push('    job = estimator.run([(qc, observables)])',sim?'act':'');
    push('else:');
    push('    from qiskit.transpiler import generate_preset_pass_manager',sim?'':'act');
    push('    try:                                # qiskit-ibm-runtime 0.50 or later',sim?'':'act');
    push('        from qiskit_ibm_runtime.executor_estimator import Estimator',sim?'':'act');
    push('    except ImportError:                 # earlier versions',sim?'':'act');
    push('        from qiskit_ibm_runtime import EstimatorV2 as Estimator',sim?'':'act');
    push('    if RUN_ON == "fake_device":');
    push('        from qiskit_ibm_runtime.fake_provider import FakeManilaV2',fake?'act':'');
    push('        backend = FakeManilaV2()',fake?'act':'');
    push('    else:');
    push('        from qiskit_ibm_runtime import QiskitRuntimeService',dev?'act':'');
    push('        service = QiskitRuntimeService()   # reads your saved API key',dev?'act':'');
    push('        backend = service.least_busy(simulator=False, operational=True)',dev?'act':'');
    push('    print("running on:", backend.name)',sim?'':'act');
    push('    # A device has its own small set of gates. Rewrite the circuit in them.',sim?'':'act');
    push('    pm = generate_preset_pass_manager(backend=backend, optimization_level=1)',sim?'':'act');
    push('    isa = pm.run(qc)',sim?'':'act');
    push('    # The device numbers its qubits its own way. Move the observables along.',sim?'':'act');
    push('    observables = [op.apply_layout(isa.layout) for op in observables]',sim?'':'act');
    push('    estimator = Estimator(mode=backend)',sim?'':'act');
    push('    job = estimator.run([(isa, observables)])',sim?'':'act');
    push('    print("job id:", job.job_id(), "(a real device puts the job in a queue)")',sim?'':'act');
    push('values = job.result()[0].data.evs');
  }
  push('');
  push('# 4. Read the result. The three values are the components of the Bloch vector.');
  push('#    Adding 0.0 prints a tiny negative rounding error as 0.0 instead of -0.0.');
  push('print("<X>, <Y>, <Z> =", [round(float(v), 4) + 0.0 for v in values])');
  push('print("'+(noisy?'values in the model':'values without noise')+': <X> = '+pyNum(r[0])+', <Y> = '+pyNum(r[1])+', <Z> = '+pyNum(r[2])+'")');
  return {lines:L,text:L.map(function(x){return x.t;}).join('\n')+'\n',target:target,simOnly:noisy,mode:'expect',
    pip:noisy?'pip install qiskit qiskit-aer':CG_TARGETS[target].pip,r:r};
}
function pyFloat(x){return Number.isInteger(x)?x.toFixed(1):String(x);}
function evsOutput(gen){
  return '<X>, <Y>, <Z> = ['+gen.r.map(function(x){return pyFloat(Number(pyNum(x)));}).join(', ')+']\n'+gen.lines[gen.lines.length-1].t.replace(/^print\("/,'').replace(/"\)$/,'');
}
var PAULI_SNIPPET=[
  '# Pauli operators in Qiskit',
  'from qiskit import QuantumCircuit',
  'from qiskit.quantum_info import Pauli, Statevector',
  '',
  '# Products and commutation',
  'print(Pauli("X").dot(Pauli("Y")))           # the product X times Y',
  'print(Pauli("XX").commutes(Pauli("ZZ")))    # do XX and ZZ commute?',
  'print(Pauli("XI").commutes(Pauli("ZX")))    # do XI and ZX commute?',
  '',
  '# Qubit order. Qiskit writes qubit 0 as the rightmost letter.',
  '# Pauli("ZX") is X on qubit 0 and Z on qubit 1. This course writes it X⊗Z.',
  'qc = QuantumCircuit(2)',
  'qc.h(0)                                     # qubit 0 in |+>, qubit 1 in |0>',
  'state = Statevector(qc)',
  'zx = state.expectation_value(Pauli("ZX")).real   # X on qubit 0, Z on qubit 1',
  'xz = state.expectation_value(Pauli("XZ")).real   # Z on qubit 0, X on qubit 1',
  'print(round(zx, 4))',
  'print(round(xz, 4))'
].join('\n')+'\n';
var PAULI_SNIPPET_OUT='iZ\nTrue\nFalse\n1.0\n0.0\n';
function genQasm(spec){
  var A=CG_AXIS[spec.axis],L=['OPENQASM 3.0;','include "stdgates.inc";','qubit[1] q;','bit[1] c;'],skipped=0;
  CG_PREP[spec.start].forEach(function(m){L.push(m+' q[0];');});
  spec.ops.forEach(function(op){
    if(op.t!=='gate'){skipped++;return;}
    if(CG_GATE[op.name])L.push(CG_GATE[op.name]+' q[0];');
    else{var g=gateOf(op.name);L.push('r'+g.param+'('+g.deg+' * pi / 180) q[0];');}
  });
  if(spec.mode==='expect'){L.splice(L.indexOf('bit[1] c;'),1);return {text:L.join('\n')+'\n',skipped:skipped};}
  A.pre.forEach(function(m){L.push(m+' q[0];');});
  L.push('c[0] = measure q[0];');
  return {text:L.join('\n')+'\n',skipped:skipped};
}

// NumPy script for Unit 0
function pyf(x){var r=Math.round(x*1e4)/1e4;if(r===0)r=0;return Number.isInteger(r)?r.toFixed(1):String(r);}
function pyv(v){return '['+v.map(pyf).join(', ')+']';}
function genNumpy(a,b){
  var L=[],la=v2len(a),lb=v2len(b),d=v2dot(a,b),ok=la>1e-9&&lb>1e-9,pr=lb>1e-9?v2proj(a,b):[0,0],r90=v2rot(a,90),prod=[a[0]*b[0]-a[1]*b[1],a[0]*b[1]+a[1]*b[0]];
  function push(t){L.push(t);}
  push('# Quantum Information and Programming 101');
  push('# Unit 0, vectors and complex numbers');
  push('# a = '+vt(a).replace(/−/g,'-')+', b = '+vt(b).replace(/−/g,'-'));
  push('import numpy as np');
  push('');
  push('a = np.array(['+pyf(a[0])+', '+pyf(a[1])+'])');
  push('b = np.array(['+pyf(b[0])+', '+pyf(b[1])+'])');
  push('');
  push('# 1. Length and sum. Adding 0.0 turns a -0.0 into 0.0 in the output.');
  push('print("|a| =", round(float(np.linalg.norm(a)), 4))');
  push('print("a + b =", (np.round(a + b, 4) + 0.0).tolist())');
  push('print("a - b =", (np.round(a - b, 4) + 0.0).tolist())');
  push('');
  push('# 2. Dot product, angle and projection');
  push('d = float(np.dot(a, b))');
  push('print("a . b =", round(d, 4) + 0.0)');
  if(ok){push('cos_theta = d / (np.linalg.norm(a) * np.linalg.norm(b))');push('angle = np.degrees(np.arccos(np.clip(cos_theta, -1, 1)))');push('print("angle =", round(float(angle), 2), "degrees")');}
  if(lb>1e-9){push('proj = d / float(np.dot(b, b)) * b');push('print("projection of a onto b =", (np.round(proj, 4) + 0.0).tolist())');}
  push('');
  push('# 3. Cross product. The vectors get a z component of 0 first.');
  push('a3 = np.append(a, 0.0)');
  push('b3 = np.append(b, 0.0)');
  push('print("a x b =", (np.round(np.cross(a3, b3), 4) + 0.0).tolist())');
  push('');
  push('# 4. A turn by 90 degrees is a matrix');
  push('t = np.radians(90)');
  push('R = np.array([[np.cos(t), -np.sin(t)], [np.sin(t), np.cos(t)]])');
  push('print("a turned by 90 degrees =", (np.round(R @ a, 4) + 0.0).tolist())');
  push('');
  push('# 5. The same vectors as complex numbers: x + iy');
  push('za = complex(a[0], a[1])');
  push('zb = complex(b[0], b[1])');
  push('angle_a = np.degrees(np.angle(za))');
  push('print("|za| =", round(abs(za), 4), " angle of za =", round(float(angle_a), 2), "degrees")');
  push('zab = za * zb');
  push('print("za * zb =", round(zab.real, 4) + 0.0, "+", round(zab.imag, 4) + 0.0, "i")');
  var out=['|a| = '+pyf(la),'a + b = '+pyv(v2add(a,b)),'a - b = '+pyv(v2sub(a,b)),'a . b = '+pyf(d)];
  if(ok)out.push('angle = '+pyf2(v2between(a,b))+' degrees');
  if(lb>1e-9)out.push('projection of a onto b = '+pyv(pr));
  out.push('a x b = '+pyv([0,0,v2cross(a,b)]),'a turned by 90 degrees = '+pyv(r90));
  out.push('|za| = '+pyf(la)+'  angle of za = '+pyf2(la>1e-9?argDeg(a):0)+' degrees');
  out.push('za * zb = '+pyf(prod[0])+' + '+pyf(prod[1])+' i');
  return {text:L.join('\n')+'\n',out:out.join('\n')+'\n'};
}
function pyf2(x){var r=Math.round(x*100)/100;if(r===0)r=0;return Number.isInteger(r)?r.toFixed(1):String(r);}
