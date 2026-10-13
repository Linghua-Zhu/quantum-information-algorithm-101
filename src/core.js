var PI=Math.PI,DEG=PI/180,S2=Math.SQRT1_2;
function clamp(x,a,b){return Math.max(a,Math.min(b,x));}
function dot(a,b){return a[0]*b[0]+a[1]*b[1]+a[2]*b[2];}
function cross(a,b){return [a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];}
function scale(a,s){return [a[0]*s,a[1]*s,a[2]*s];}
function add(a,b){return [a[0]+b[0],a[1]+b[1],a[2]+b[2]];}
function unit(a){var l=Math.hypot(a[0],a[1],a[2])||1;return [a[0]/l,a[1]/l,a[2]/l];}
function angDeg(a,b){return Math.acos(clamp(dot(unit(a),unit(b)),-1,1))/DEG;}
function rot(n,a,v){var c=Math.cos(a),s=Math.sin(a),d=dot(n,v),x=cross(n,v);return [v[0]*c+x[0]*s+n[0]*d*(1-c),v[1]*c+x[1]*s+n[1]*d*(1-c),v[2]*c+x[2]*s+n[2]*d*(1-c)];}
function fromAngles(t,p){t*=DEG;p*=DEG;return [Math.sin(t)*Math.cos(p),Math.sin(t)*Math.sin(p),Math.cos(t)];}
function toAngles(v){var u=unit(v),t=Math.acos(clamp(u[2],-1,1))/DEG,p=Math.atan2(u[1],u[0])/DEG;if(p<-0.5)p+=360;if(p<0)p=0;if(t<0.5||t>179.5)p=0;return {theta:t,phi:p};}

function cmul(p,q){return [p[0]*q[0]-p[1]*q[1],p[0]*q[1]+p[1]*q[0]];}
function cadd(p,q){return [p[0]+q[0],p[1]+q[1]];}
function applyU(U,k){return [cadd(cmul(U[0][0],k[0]),cmul(U[0][1],k[1])),cadd(cmul(U[1][0],k[0]),cmul(U[1][1],k[1]))];}
function blochOf(k){var a=k[0],b=k[1];return [2*(a[0]*b[0]+a[1]*b[1]),2*(a[0]*b[1]-a[1]*b[0]),a[0]*a[0]+a[1]*a[1]-b[0]*b[0]-b[1]*b[1]];}
function ketOf(v){var u=unit(v),t=Math.acos(clamp(u[2],-1,1)),p=Math.atan2(u[1],u[0]);return [[Math.cos(t/2),0],[Math.sin(t/2)*Math.cos(p),Math.sin(t/2)*Math.sin(p)]];}
function unitaryOf(n,a){var c=Math.cos(a/2),s=Math.sin(a/2);return [[[c,-s*n[2]],[-s*n[1],-s*n[0]]],[[s*n[1],-s*n[0]],[c,s*n[2]]]];}

var AX={x:[1,0,0],y:[0,1,0],z:[0,0,1]};
var NAMED={
  X:{label:'X',axis:AX.x,angle:PI,std:[[[0,0],[1,0]],[[1,0],[0,0]]]},
  Y:{label:'Y',axis:AX.y,angle:PI,std:[[[0,0],[0,-1]],[[0,1],[0,0]]]},
  Z:{label:'Z',axis:AX.z,angle:PI,std:[[[1,0],[0,0]],[[0,0],[-1,0]]]},
  H:{label:'H',axis:[S2,0,S2],angle:PI,std:[[[S2,0],[S2,0]],[[S2,0],[-S2,0]]]},
  S:{label:'S',axis:AX.z,angle:PI/2,std:[[[1,0],[0,0]],[[0,0],[0,1]]]},
  Sdg:{label:'S\u2020',axis:AX.z,angle:-PI/2,std:[[[1,0],[0,0]],[[0,0],[0,-1]]]},
  T:{label:'T',axis:AX.z,angle:PI/4,std:[[[1,0],[0,0]],[[0,0],[S2,S2]]]},
  Tdg:{label:'T\u2020',axis:AX.z,angle:-PI/4,std:[[[1,0],[0,0]],[[0,0],[S2,-S2]]]}
};
function fmtDeg(d){return (d<0?'\u2212':'')+Math.abs(d)+'\u00b0';}
function gateOf(name){
  if(NAMED[name]){var g=NAMED[name];return {name:name,label:g.label,axis:g.axis,angle:g.angle,std:g.std};}
  var m=/^R([xyz])\((-?\d+(?:\.\d+)?)\)$/.exec(name);
  if(m){var deg=parseFloat(m[2]);return {name:name,label:'R'+m[1]+'('+fmtDeg(deg)+')',axis:AX[m[1]],angle:deg*DEG,param:m[1],deg:deg};}
  throw new Error('Unknown gate '+name);
}
function matrixOf(g){return g.std||unitaryOf(g.axis,g.angle);}
function actOn(g,r){return unit(blochOf(applyU(matrixOf(g),ketOf(r))));}
function turnWords(a){var d=Math.round(Math.abs(a)/DEG);return d===180?'a half turn':d===90?'a quarter turn':d===45?'an eighth turn':'a turn of '+d+'\u00b0';}
function describe(g){
  if(g.name==='H')return 'H is a half turn about the axis halfway between +x and +z.';
  if(g.name==='X'||g.name==='Y'||g.name==='Z')return g.label+' is a half turn about the '+g.name.toLowerCase()+' axis.';
  if(!g.param)return g.label+' is '+turnWords(g.angle)+' about +z, '+(g.angle>0?'counterclockwise':'clockwise')+' seen from above.';
  var ax='+'+g.param,d=Math.round(Math.abs(g.angle)/DEG);
  return g.label+' turns the state '+d+'\u00b0 about '+ax+(g.angle>0?', the way the fingers of your right hand curl when the thumb points along ':', against the way the fingers of your right hand curl when the thumb points along ')+ax+'.';
}
var CARD=[{k:'|0\u27e9',v:[0,0,1]},{k:'|1\u27e9',v:[0,0,-1]},{k:'|+\u27e9',v:[1,0,0]},{k:'|\u2212\u27e9',v:[-1,0,0]},{k:'|+i\u27e9',v:[0,1,0]},{k:'|\u2212i\u27e9',v:[0,-1,0]}];
function isCardinal(v){for(var i=0;i<CARD.length;i++)if(angDeg(CARD[i].v,v)<1.5)return CARD[i].k;return null;}
function labelOf(v){var c=isCardinal(v);if(c)return c;var a=toAngles(v);return '\u03b8 = '+Math.round(a.theta)+'\u00b0, \u03c6 = '+(Math.round(a.phi)%360)+'\u00b0';}

var STARTS={zero:[0,0,1],one:[0,0,-1],plus:[1,0,0],minus:[-1,0,0],plusi:[0,1,0],minusi:[0,-1,0]};
function startVec(s){return typeof s==='string'?STARTS[s].slice():fromAngles(s[0],s[1]);}
var CONCEPTS={S1:'State as a point',S2:'Global and relative phase',G1:'Gates as rotations',G2:'Rotation sense',G3:'States on the rotation axis',G4:'Gate order',M1:'Probability from projection',M2:'Measuring along other axes',M3:'State after a measurement',O1:'Pauli operators',O2:'Products and commutation',O3:'Pauli strings',N1:'Mixed states inside the ball',N2:'Shapes of noise',N3:'Shots and estimation'};
var STARTER_G=[
  {id:'r01',concept:'G1',level:1,start:'zero',gates:['X']},
  {id:'r02',concept:'G1',level:1,start:'plus',gates:['Z']},
  {id:'r03',concept:'G2',level:1,start:'plus',gates:['S']},
  {id:'r04',concept:'G2',level:2,start:'plus',gates:['Sdg']},
  {id:'r05',concept:'G2',level:2,start:'zero',gates:['Rx(90)']},
  {id:'r06',concept:'G1',level:2,start:'zero',gates:['H']},
  {id:'r07',concept:'G1',level:3,start:'plus',gates:['H']},
  {id:'r08',concept:'G3',level:2,start:'plus',gates:['X']},
  {id:'r09',concept:'G3',level:3,start:'plusi',gates:['Z']},
  {id:'r10',concept:'G2',level:3,start:'zero',gates:['Ry(90)']},
  {id:'r11',concept:'G1',level:3,start:'plus',gates:['T']},
  {id:'r12',concept:'G4',level:3,start:'zero',gates:['H','S']},
  {id:'r13',concept:'G4',level:3,start:'plus',gates:['S','H']},
  {id:'r14',concept:'G4',level:3,start:'zero',gates:['H','Z','H']}
];
var SNAP=(function(){var a=[[0,0,1],[0,0,-1]];[45,90,135].forEach(function(t){for(var p=0;p<360;p+=45)a.push(fromAngles(t,p));});return a;})();
function snapPoint(p){var best=null,bd=1e9;for(var i=0;i<SNAP.length;i++){var d=angDeg(SNAP[i],p);if(d<bd){bd=d;best=SNAP[i];}}return bd<=10?best.slice():p;}
function onGrid(v){for(var i=0;i<SNAP.length;i++)if(angDeg(SNAP[i],v)<1)return true;return false;}
function runGates(r0,gs){var v=r0;for(var i=0;i<gs.length;i++)v=rot(gs[i].axis,gs[i].angle,v);return unit(v);}
var TOL=14;
function distractorsFor(r0,gs,rf){
  var out=[],multi=gs.length>1;
  function push(tag,v){
    v=unit(v);if(angDeg(v,rf)<10)return;
    for(var i=0;i<out.length;i++)if(angDeg(out[i].v,v)<10){if(multi)out[i].tags.push(tag);return;}
    out.push({tag:tag,tags:[tag],v:v});
  }
  if(!multi){
    var g=gs[0],half=Math.abs(Math.abs(g.angle)-PI)<1e-9;
    if(!half)push('wrong-sense',rot(g.axis,-g.angle,r0));
    if(g.name==='H')push('h-quarter',rot(AX.y,PI/2,r0));
    push('half-angle',rot(g.axis,g.angle/2,r0));
    if(!half)push('double-angle',rot(g.axis,2*g.angle,r0));
    push('no-change',r0);
    push('flip',scale(r0,-1));
    ['x','y','z'].forEach(function(k){if(Math.abs(dot(AX[k],g.axis))>0.999)return;push('axis-'+k,rot(AX[k],g.angle,r0));});
  }else{
    push('order-reversed',runGates(r0,gs.slice().reverse()));
    push('first-only',runGates(r0,gs.slice(0,1)));
    push('last-only',runGates(r0,gs.slice(-1)));
    push('no-change',r0);
  }
  return out;
}
function resolve(item){
  var r0=unit(startVec(item.start)),gs=item.gates.map(gateOf),path=[r0],v=r0;
  for(var i=0;i<gs.length;i++){v=actOn(gs[i],v);path.push(v);}
  var rf=path[path.length-1];
  return {item:item,r0:r0,gs:gs,path:path,rf:rf,fixed:angDeg(r0,rf)<1,distractors:distractorsFor(r0,gs,rf)};
}
function classify(R,p){
  var dC=angDeg(p,R.rf);
  if(dC<=TOL)return {tag:'correct',dist:dC,off:dC};
  var best=null;
  R.distractors.forEach(function(d){var a=angDeg(p,d.v);if(a<=TOL&&(!best||a<best.dist))best={tag:d.tags.join('+'),tags:d.tags,dist:a,off:dC};});
  if(best)return best;
  return {tag:R.fixed?'moved-fixed':'unclassified',dist:dC,off:dC};
}
function orderWords(R){var L=R.gs.map(function(g){return g.label;});return 'first '+L[0]+L.slice(1).map(function(x){return ', then '+x;}).join('');}
function feedbackText(R,cls){
  var g=R.gs[0],multi=R.gs.length>1,sL=labelOf(R.r0);
  if(cls.tag==='correct')return 'Correct.';
  if(multi){
    var T=cls.tags||[],facts=[],first=R.gs[0].label,last=R.gs[R.gs.length-1].label;
    if(T.indexOf('no-change')>=0)return 'The state does move. Take the gates one at a time: '+orderWords(R)+'.';
    var fo=T.indexOf('first-only')>=0,lo=T.indexOf('last-only')>=0;
    if(fo&&lo&&first===last)facts.push('after a single '+first);
    else{if(fo)facts.push('after '+first+' alone');if(lo)facts.push('after '+last+' alone');}
    if(T.indexOf('order-reversed')>=0)facts.push('with the gates applied in reverse order');
    if(facts.length)return 'Your point is where the state is '+facts.join(', and also ')+'. A circuit reads left to right: '+orderWords(R)+'.';
    if(cls.tag==='moved-fixed')return 'The gates bring the state back to where it started. Take them one at a time: '+orderWords(R)+'.';
    return 'Not there. Your point is '+Math.round(cls.off)+'\u00b0 away from where the state ends. Take the gates one at a time: '+orderWords(R)+'.';
  }
  switch(cls.tag){
    case 'wrong-sense':return 'Wrong sense. '+describe(g)+' You turned the state the other way.';
    case 'half-angle':return 'Right axis, but half the angle. '+describe(g);
    case 'double-angle':return 'Right axis, but twice the angle. '+describe(g);
    case 'h-quarter':return 'H is not a quarter turn about the y axis. '+describe(g)+' It swaps |0\u27e9 with |+\u27e9 and |1\u27e9 with |\u2212\u27e9.';
    case 'no-change':
      if(Math.abs(g.axis[2])>0.999)return 'The state does move. '+g.label+' leaves the outcome probabilities of a Z measurement unchanged, but it changes the relative phase, and the relative phase is the angle around the z axis.';
      return 'The state does move. '+sL+' is not on the rotation axis of '+g.label+'. '+describe(g);
    case 'flip':
      if(R.fixed)return 'This state does not move. '+describe(g)+' '+sL+' lies on that axis, and a rotation leaves the points on its axis in place.';
      return g.label+' does not send this state to the opposite point. '+describe(g);
    case 'axis-x':case 'axis-y':case 'axis-z':return 'Wrong axis. You rotated about the '+cls.tag.slice(-1)+' axis. '+describe(g);
    case 'moved-fixed':return 'This state does not move. '+describe(g)+' '+sL+' lies on that axis.';
    default:return 'Not there. Your point is '+Math.round(cls.off)+'\u00b0 away from where the state ends. '+describe(g);
  }
}
function referenceText(R){
  if(R.gs.length===1){
    var g=R.gs[0];
    if(R.fixed)return describe(g)+' '+labelOf(R.r0)+' lies on that axis, so the state stays where it is.';
    return describe(g)+' Starting from '+labelOf(R.r0)+', the state ends at '+labelOf(R.rf)+'.';
  }
  var s='Gates act left to right.';
  for(var i=0;i<R.gs.length;i++){var a=labelOf(R.path[i]),b=labelOf(R.path[i+1]);s+=' '+R.gs[i].label+(angDeg(R.path[i],R.path[i+1])<1?' leaves '+a+' in place.':' takes '+a+' to '+b+'.');}
  return s;
}
function mulberry32(a){return function(){a|=0;a=a+0x6D2B79F5|0;var t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
var POOL_STARTS=['zero','one','plus','minus','plusi','minusi',[90,45],[90,135],[90,225],[90,315],[45,0],[45,90],[45,180],[45,270],[135,0],[135,90],[135,180],[135,270]];
var POOL_GATES=['X','Y','Z','H','S','Sdg','T','Tdg','Rx(90)','Rx(-90)','Ry(90)','Ry(-90)','Rz(90)','Rz(-90)'];
function conceptFor(R){if(R.gs.length>1)return 'G4';if(R.fixed)return 'G3';return Math.abs(Math.abs(R.gs[0].angle)-PI)<1e-9?'G1':'G2';}
function genItem(n,seed){
  var rnd=mulberry32((seed|0)+n*7919);
  for(var tries=0;tries<400;tries++){
    var start=POOL_STARTS[Math.floor(rnd()*POOL_STARTS.length)],two=rnd()<0.35,g1=POOL_GATES[Math.floor(rnd()*POOL_GATES.length)],gates=[g1];
    if(two){var g2=POOL_GATES[Math.floor(rnd()*POOL_GATES.length)];if(g2===g1)continue;gates=[g1,g2];}
    var it={id:'g'+n,concept:'G1',level:3,start:start,gates:gates,generated:true},R=resolve(it);
    if(!onGrid(R.rf))continue;
    if(two&&angDeg(runGates(R.r0,R.gs.slice().reverse()),R.rf)<10)continue;
    it.concept=conceptFor(R);return it;
  }
  return {id:'g'+n,concept:'G1',level:3,start:'zero',gates:['X'],generated:true};
}
function countItems(){
  var one=0,two=0;
  POOL_STARTS.forEach(function(s){POOL_GATES.forEach(function(a){
    if(onGrid(resolve({start:s,gates:[a]}).rf))one++;
    POOL_GATES.forEach(function(b){if(a===b)return;var R=resolve({start:s,gates:[a,b]});if(onGrid(R.rf)&&angDeg(runGates(R.r0,R.gs.slice().reverse()),R.rf)>=10)two++;});
  });});
  return {one:one,two:two};
}
function selfChecks(){
  var out=[],test=[[0,0,1],[0,0,-1],[1,0,0],[0,1,0],fromAngles(60,40),fromAngles(130,250)];
  function near(a,b){return angDeg(a,b)<1e-4;}
  function run(names,r){var v=r;names.forEach(function(n){v=actOn(gateOf(n),v);});return v;}
  Object.keys(NAMED).forEach(function(name){
    var g=gateOf(name),ok=true;
    test.forEach(function(r){var viaR=rot(g.axis,g.angle,r);if(!near(actOn(g,r),viaR))ok=false;if(!near(unit(blochOf(applyU(unitaryOf(g.axis,g.angle),ketOf(r)))),viaR))ok=false;});
    out.push({name:'The '+g.label+' matrix acts as its rotation',ok:ok});
  });
  out.push({name:'H, Z, H in sequence acts as X',ok:test.every(function(r){return near(run(['H','Z','H'],r),run(['X'],r));})});
  out.push({name:'S followed by S\u2020 returns every state',ok:test.every(function(r){return near(run(['S','Sdg'],r),r);})});
  out.push({name:'T applied twice acts as S',ok:test.every(function(r){return near(run(['T','T'],r),run(['S'],r));})});
  out.push({name:'Rz(90\u00b0) takes |+\u27e9 to |+i\u27e9',ok:near(run(['Rz(90)'],[1,0,0]),[0,1,0])});
  out.push({name:'Rx(90\u00b0) takes |0\u27e9 to |\u2212i\u27e9',ok:near(run(['Rx(90)'],[0,0,1]),[0,-1,0])});
  out.push({name:'Ry(90\u00b0) takes |0\u27e9 to |+\u27e9',ok:near(run(['Ry(90)'],[0,0,1]),[1,0,0])});
  out.push({name:'Every starter item ends on a point that can be placed',ok:STARTER_G.every(function(it){return onGrid(resolve(it).rf);})});
  return out;
}
