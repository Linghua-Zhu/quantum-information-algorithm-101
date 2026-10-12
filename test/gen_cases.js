// Writes Qiskit scripts and OpenQASM for a set of circuits, with the page's own exact numbers.
const fs=require('fs'),vm=require('vm');
const ctx={Math,console};vm.createContext(ctx);
vm.runInContext(['core','items','codegen'].map(f=>fs.readFileSync(__dirname+'/../src/'+f+'.js','utf8')).join('\n')+
  ';this.api={genQiskit,genQasm,circuitState,AXM,dot};',ctx);
const A=ctx.api;
const G=n=>({t:'gate',name:n});
const relax=(tt,q)=>({t:'relax',tt,q,a:Math.exp(-tt),b:Math.exp(-tt/q),label:'T1, T2'});
const depol=p=>({t:'depol',p,label:'depol '+p});
const cases=[
  {start:'zero',ops:[G('H'),G('S')],axis:'x'},
  {start:'zero',ops:[G('H'),G('S')],axis:'y'},
  {start:'plus',ops:[G('T'),G('Rx(90)')],axis:'z'},
  {start:'minusi',ops:[G('Ry(-90)'),G('Sdg'),G('H')],axis:'x'},
  {start:'one',ops:[G('Rz(45)'),G('X'),G('Tdg')],axis:'y'},
  {start:'zero',ops:[],axis:'z'},
  {start:'zero',ops:[G('Rx(37.5)'),G('Rz(-120)')],axis:'y'},
  {start:'minus',ops:[G('Y'),G('Z'),G('T'),G('Ry(60)')],axis:'z'},
  {start:'plusi',ops:[G('H')],axis:'x'},
  {start:'zero',ops:[G('H'),relax(0.5,1),G('S'),depol(0.2)],axis:'y'},
  {start:'one',ops:[relax(0.7,2)],axis:'z'},
  {start:'plus',ops:[depol(0.5),G('Rx(30)')],axis:'x'},
  {start:'zero',ops:[G('Ry(90)'),relax(1.2,0.6)],axis:'x'}
];
const out=[];
cases.forEach((c,i)=>{
  const targets=c.ops.some(o=>o.t!=='gate')?['simulator']:['simulator','fake_device','device'];
  targets.forEach(target=>{
    const spec=Object.assign({shots:4000,target},c),g=A.genQiskit(spec),q=A.genQasm(spec);
    const r=A.circuitState(c.start,c.ops,false),ri=A.circuitState(c.start,c.ops,true);
    out.push({i,target,axis:c.axis,noisy:g.simOnly,script:g.text,qasm:q.text,p:g.p,e:g.e,
      pIdeal:(1+A.dot(ri,A.AXM[c.axis].v))/2,bloch:r,maxLine:Math.max(...g.lines.map(l=>l.t.length)),pip:g.pip});
  });
});
fs.writeFileSync(process.argv[2],JSON.stringify(out));
console.log('wrote',out.length,'scripts; longest line',Math.max(...out.map(o=>o.maxLine)),'chars');
console.log('\n===== sample: case 0, simulator =====\n'+out[0].script);
console.log('===== sample: noisy case =====\n'+out.find(o=>o.noisy).script);
console.log('===== sample qasm =====\n'+out[6].qasm);
