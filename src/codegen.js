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
function genQasm(spec){
  var A=CG_AXIS[spec.axis],L=['OPENQASM 3.0;','include "stdgates.inc";','qubit[1] q;','bit[1] c;'],skipped=0;
  CG_PREP[spec.start].forEach(function(m){L.push(m+' q[0];');});
  spec.ops.forEach(function(op){
    if(op.t!=='gate'){skipped++;return;}
    if(CG_GATE[op.name])L.push(CG_GATE[op.name]+' q[0];');
    else{var g=gateOf(op.name);L.push('r'+g.param+'('+g.deg+' * pi / 180) q[0];');}
  });
  A.pre.forEach(function(m){L.push(m+' q[0];');});
  L.push('c[0] = measure q[0];');
  return {text:L.join('\n')+'\n',skipped:skipped};
}
