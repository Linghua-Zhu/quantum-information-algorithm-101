// Writes NumPy scripts for a set of vector pairs, with the page's own expected output.
const fs=require('fs'),vm=require('vm');
const ctx={Math,console,window:{},document:{}};vm.createContext(ctx);
vm.runInContext(['core','items','paulis','sphere','plane','unit0','codegen'].map(f=>fs.readFileSync(__dirname+'/../src/'+f+'.js','utf8')).join('\n')+';this.api={genNumpy};',ctx);
const pairs=[[[2,1],[1,2]],[[3,0],[-2,2]],[[1,3],[2,0]],[[-1,2],[1,-2]],[[0,0],[1,1]],[[2,2],[0,0]],[[-3,-1],[-1,3]],[[0.25,-1.75],[3.5,0.5]],[[4,-4],[-4,4]],[[1,0],[0,1]],[[-2,0],[-2,0]],[[0.1,0.2],[0.3,-0.4]]];
const out=pairs.map(([a,b])=>{const g=ctx.api.genNumpy(a,b);return {a,b,script:g.text,expected:g.out,maxLine:Math.max(...g.text.split('\n').map(l=>l.length))};});
fs.writeFileSync(process.argv[2],JSON.stringify(out));
console.log('wrote',out.length,'scripts; longest line',Math.max(...out.map(o=>o.maxLine)),'chars');
