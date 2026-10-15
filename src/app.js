(function(){
function $(id){return document.getElementById(id);}
function esc(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}
function show(el,on){if(el)el.hidden=!on;}
function each(list,fn){Array.prototype.forEach.call(list,fn);}
function copyOf(o){var c={},k;for(k in o)c[k]=o[k];return c;}
function num(x){var r=Math.round(x*100)/100;if(r===0)r=0;return r.toFixed(2).replace('-','−');}
function count(n){return n.toLocaleString('en-US');}
function plural(n,one,many){return n+' '+(n===1?one:many);}
function link(cls,route,label){return '<a class="'+cls+'" href="#'+route+'" data-go="'+route+'">'+label+'</a>';}
function closest(el,sel){while(el&&el.nodeType===1){if(el.matches(sel))return el;el=el.parentNode;}return null;}
function toTop(el){try{el.scrollIntoView({block:'start'});}catch(_){}}

function has(o,k){return o!=null&&Object.prototype.hasOwnProperty.call(o,k);}
function isInt(x,lo,hi){return typeof x==='number'&&x===Math.floor(x)&&x>=lo&&x<=hi;}
var ITEM=Object.create(null),ITEM_GROUP=Object.create(null),ITEM_UNIT=Object.create(null),CONCEPT_ITEMS=Object.create(null),UNIT_N={};
UNIT_ORDER.forEach(function(u){UNIT_N[u]=0;UNITS[u].groups.forEach(function(k){GROUPS[k].starter.forEach(function(it){
  ITEM[it.id]=it;ITEM_GROUP[it.id]=k;ITEM_UNIT[it.id]=u;(CONCEPT_ITEMS[it.concept]||(CONCEPT_ITEMS[it.concept]=[])).push(it.id);UNIT_N[u]++;
});});});
var PARTS=['goals','start','practice','discuss','explore','code'];
var ROUTES=['home','units','research','about'],VIEW={home:'home',units:'units',research:'research',about:'about'};
UNIT_ORDER.forEach(function(u){PARTS.forEach(function(p){var r=u+'-'+p;ROUTES.push(r);VIEW[r]=(p==='explore'||p==='code')?UNITS[u][p]:p;});});
function partRoutes(u){return PARTS.map(function(p){return u+'-'+p;});}
var VIEWS=[];ROUTES.forEach(function(x){if(VIEWS.indexOf(VIEW[x])<0)VIEWS.push(VIEW[x]);});
var UID='u1';
function U(){return UNITS[UID];}
function US(){return S.units[UID];}
var LET='ABCD';
var KETS={zero:'|0⟩',one:'|1⟩',plus:'|+⟩',minus:'|−⟩',plusi:'|+i⟩',minusi:'|−i⟩'};

// Tagged wrong answers
var COUNTS=countItems();
var TAGINFO={
  'theta-not-doubled':['Half the polar angle','The point at θ/2 instead of θ','Hu, Li, Mong, Singh 2024'],
  'swap-01':['|0⟩ and |1⟩ swapped','The mirror point below or above the equator','Hu, Li, Mong, Singh 2024'],
  'phase-ignored':['Relative phase left out','The right height at φ = 0',''],
  'phase-sign':['Phase in the wrong direction','The right height at −φ',''],
  'perpendicular':['Orthogonal placed at a right angle','A point 90° away from the given state','Hu, Li, Mong, Singh 2024'],
  'same':['Same state','The given state itself',''],
  'global-as-relative':['Global phase moved the point','The state turned about z by the global phase','Hu, Li, Mong, Singh 2024'],
  'relative-ignored':['Relative phase ignored','The start state after a relative phase change','Wan, Emigh, Shaffer 2019'],
  'phase-as-height':['Phase read as height','The state moved toward a pole by the phase angle',''],
  'wrong-sense':['Wrong sense','The end of the same turn made in the opposite sense',''],
  'half-angle':['Half the angle','The same axis and sense, half the angle',''],
  'double-angle':['Twice the angle','The same axis and sense, twice the angle',''],
  'axis-x':['Wrong axis','The same angle about a different coordinate axis',''],
  'h-quarter':['H as a quarter turn','A quarter turn about the y axis in place of H',''],
  'no-change':['State left in place','The start state, when the operation moves it',''],
  'flip':['Flip to the opposite point','The point opposite the start state',''],
  'order-reversed':['Reversed gate order','The result of the gates applied right to left',''],
  'first-only':['Part of the circuit','The state after the first gate alone, or the last gate alone',''],
  'moved-fixed':['Moved a state that stays','Any other point, when the state does not move',''],
  'complement':['Other outcome','The probability of the other outcome',''],
  'z-for-all':['Z probability on another axis','The Z probability given for an X or Y measurement','Wan, Emigh, Shaffer 2019'],
  'full-angle':['cos² of the full angle','cos² of the angle instead of half the angle','Hu, Li, Mong, Singh 2024'],
  'linear-angle':['Probability proportional to angle','One minus the angle over 180°',''],
  'expectation':['Projection given as probability','The projection onto the axis itself',''],
  'no-collapse':['State unchanged by measurement','The state from before the measurement','Hu, Li, Singh 2024'],
  'projection-point':['Projection taken as the new state','The foot of the projection, inside the ball',''],
  'other-pole':['State of the other outcome','The opposite end of the measurement axis',''],
  'centre':['Centre of the ball','The maximally mixed state',''],
  'to-centre':['All the way to the centre','The centre, when the noise is partial',''],
  'uniform-shrink':['Even shrinking','The start vector scaled evenly',''],
  'wrong-pole':['Relaxation toward |1⟩','The mirror image below the equator',''],
  'fully-relaxed':['Fully relaxed','|0⟩, when relaxation is partial',''],
  'on-surface':['Point kept on the surface','Any pure state, when the result is mixed',''],
  'superposition':['Mixture placed as a superposition','A point on the surface for a random mixture','Passante, Emigh, Shaffer 2015'],
  'pole':['One part of the mixture','|0⟩ or |1⟩ for a mixture of both',''],
  'off-axis':['Mixture given an x or y component','A point off the z axis for a mixture of |0⟩ and |1⟩',''],
  'same-state-separated':['Global phase treated as measurable','A measurement chosen for two states at the same point','Hu, Li, Mong, Singh 2024'],
  'separable-called-same':['Distinct states called the same','No measurement chosen for two different states','Wan, Emigh, Shaffer 2019; Passante, Emigh, Shaffer 2015'],
  'extra-axis':['Measurement that cannot tell them apart','An axis on which both states project equally',''],
  'missed-axis':['Missed a measurement that works','A working axis left out',''],
  'no-shot-noise':['No shot noise','An exact value from a finite number of shots',''],
  'spread-too-large':['Spread too large','A spread far above 1/√N',''],
  'x-for-z':['Wrong axis for the estimate','The value for a different measurement axis',''],
  'z-for-x':['Wrong axis for the estimate','The value for a different measurement axis',''],
  'shot-noise-everywhere':['Shot noise on an eigenstate','Scatter where every shot gives the same outcome',''],
  'shrink-as-shot-noise':['Systematic gap read as shot noise','A gap that does not shrink with more shots',''],
  'more-shots':['More shots for a converged estimate','More shots asked for after convergence',''],
  'eigen-sign':['Eigenvalue sign swapped','The other end of the axis',''],
  'eigen-axis':['Eigenstate of another operator','An end of a different axis',''],
  'eigen-assume':['State taken as an eigenstate','The state left in place by an operator that moves it',''],
  'prob-for-exp':['Probability given as expectation value','(1 + ⟨P⟩)/2 in place of ⟨P⟩',''],
  'exp-wrong-component':['Wrong component','The component along another axis',''],
  'exp-sign':['Expectation value with the wrong sign','−⟨P⟩ in place of ⟨P⟩',''],
  'op-sign':['Product in the wrong order','The sign of the reversed product',''],
  'missing-i':['Factor i left out','The result without its factor ±i',''],
  'product-identity':['Product taken as the identity','I for a product of two different Pauli operators',''],
  'y-sign':['Sign of i in Y','−i in place of i, or the reverse',''],
  'commute-all':['Pauli operators taken to commute','XZ = ZX',''],
  'half-commutator':['Commutator off by a factor 2','iZ in place of 2iZ',''],
  'global-phase-matrix':['Matrix taken up to a phase','X in place of −iX',''],
  'rot-sign':['Rotation with the wrong sign','iX in place of −iX',''],
  'any-anticommute':['Strings judged position by position','Anticommute because some letters anticommute',''],
  'count-identity':['Identity counted as anticommuting','Positions with I counted',''],
  'parity-miscount':['Anticommuting positions miscounted','The wrong parity of anticommuting positions',''],
  'neither':['Neither commuting nor anticommuting','An option that Pauli strings never have',''],
  'string-sign':['Sign of a string product','The product with the opposite sign',''],
  'phase-dropped':['Phase factor dropped','The product without its factor ±i or −1',''],
  'phase-added':['Phase factor added','A factor ±i where the product has none',''],
  'square-not-identity':['Square kept as the letter','Z·Z kept as Z instead of I',''],
  'string-order':['Qubits swapped in a string','The value with the two qubits exchanged',''],
  'string-average':['Average in place of product','(⟨P⟩₁ + ⟨Q⟩₂)/2 in place of the product',''],
  'one-factor':['One qubit only','The value for one of the two qubits',''],
  'sub-for-add':['Difference for a sum','a − b or b − a in place of a + b, the tip-to-tip error','Nguyen and Meltzer 2003; Barniol and Zavala 2014'],
  'add-for-sub':['Sum for a difference','a + b in place of a − b',''],
  'rev-sub':['Difference reversed','b − a in place of a − b',''],
  'average-for-sum':['Average for a sum','Half the sum, the midpoint between the tips','Nguyen and Meltzer 2003; Barniol and Zavala 2014'],
  'only-one-vector':['One vector alone','One of the two vectors, unchanged',''],
  'only-one-charge':['One charge alone','The field of one charge, the other left out',''],
  'component-sign':['Component sign','One component with the wrong sign',''],
  'scaled-wrong':['Coefficient dropped','A sum with a coefficient left out',''],
  'sin-cos-swapped':['Sine and cosine swapped','The other component','Barniol and Zavala 2014'],
  'length-for-component':['Length for a component','The whole length in place of a component',''],
  'added-components':['Components added','The components added instead of combined by Pythagoras or paired in a product',''],
  'no-sqrt':['Square root missing','The sum of squares, without the root',''],
  'one-component':['One component for the length','The larger component in place of the length',''],
  'dot-product-of-lengths':['Dot product without the cosine','|a| |b| in place of a · b','Barniol and Zavala 2014'],
  'dot-sign':['Dot product sign','−a · b in place of a · b',''],
  'cross-for-dot':['Cross product for the dot product','|a| |b| sin θ in place of a · b','Barniol and Zavala 2014'],
  'supplement':['Supplementary angle','180° minus the angle between the vectors',''],
  'one-vector-angle':['Angle from the x axis','The angle of one vector with the x axis, not between the two',''],
  'assumed-perpendicular':['Assumed perpendicular','90° for vectors that are not perpendicular',''],
  'proj-swapped':['Projection the other way','The projection of b onto a',''],
  'unit-vector':['Unit vector for the projection','The unit vector along b',''],
  'no-projection':['Vector not projected','a itself in place of its projection',''],
  'perp-component':['Perpendicular part','The part of a perpendicular to b',''],
  'unnormalized':['Projection not normalised','(a · b) b without the division by |b|²',''],
  'proj-sign':['Projection reversed','The projection pointing the wrong way',''],
  'off-the-line':['Projection off the line','A point not on the line of b',''],
  'left-hand':['Left-hand rule','The opposite direction: b × a, or the sense of a negative turn','Barniol and Zavala 2014'],
  'in-plane':['Cross product in the plane','One of the two vectors in place of their cross product',''],
  'sum-for-cross':['Sum for the cross product','The sum or difference of the vectors',''],
  'cos-for-sin':['Cosine for sine','|a| |b| cos θ in place of |a| |b| sin θ','Barniol and Zavala 2014'],
  'ignored-angle':['Angle ignored','|a| |b| without the sine',''],
  'toward-axis':['Motion toward the axis','A point moved toward the rotation axis',''],
  'stays':['Point taken as fixed','No motion for a point off the axis',''],
  'sign-of-charge':['Sign of a charge','The field with a charge’s sign reversed',''],
  'added-magnitudes':['Sizes added','The sizes added along one direction, or lengths added in a product',''],
  'inverse-not-square':['1/r in place of 1/r²','A field falling off as 1/r, or as 1/r³',''],
  'wrong-way':['Ratio inverted','The ratio of fields the wrong way round',''],
  'ignored-distance':['Distance ignored','The same field at every distance',''],
  'conjugate':['Complex conjugate','The imaginary part with the wrong sign',''],
  'parts-swapped':['Real and imaginary swapped','(b, a) in place of (a, b)',''],
  'negated':['Negative of the number','−z in place of z',''],
  'angle-sign':['Angle sign','The angle measured clockwise',''],
  'magnitude-dropped':['Length r dropped','e^(i\u03b8) in place of r e^(i\u03b8)',''],
  'cross-sign':['Cross terms added','a\u2093b\u1d67 + a\u1d67b\u2093 in place of a\u2093b\u1d67 \u2212 a\u1d67b\u2093',''],
  'magnitude-as-real':['Angle dropped','r e^(iθ) placed at angle 0',''],
  'phase-as-magnitude':['Angle used as a length','The angle taken for the modulus, or angles multiplied',''],
  'added-not-multiplied':['Sum for a product','z + w in place of z w',''],
  'componentwise-product':['Parts multiplied separately','(ac, bd) in place of (ac − bd, ad + bc)',''],
  'phase-subtracted':['Angles subtracted','The angle of a quotient in place of a product',''],
  'magnitudes-added':['Lengths added in a product','|z| + |w| in place of |z| |w|',''],
  'conjugate-real':['Real part flipped','−a + bi in place of a − bi',''],
  'added-parts':['Parts added for the modulus','|a| + |b| in place of √(a² + b²)',''],
  'real-part-only':['One part for the modulus','|a| or |b| in place of the modulus',''],
  'quadrant':['Quadrant missed','The arctangent without the quadrant',''],
  'magnitude-for-phase':['Modulus for the angle','|z| in place of arg z',''],
  'rotated-clockwise':['Turned the wrong way','A turn by −φ in place of φ',''],
  'unclassified':['Unclassified','No tagged answer nearby','']
};
TAGINFO['axis-y']=TAGINFO['axis-z']=TAGINFO['axis-x'];TAGINFO['last-only']=TAGINFO['first-only'];
function tagName(t){var first=String(t).split('+')[0];return has(TAGINFO,first)?TAGINFO[first][0]:first;}

// Saved state
// item record: n tries, m misses, first and last result, review box, due day, day of last try
var KEY='qip101-v3',OLDKEY='bloch-v2',GAPS=[1,3,7,14,30];
var store={
  load:function(k){try{return JSON.parse(localStorage.getItem(k));}catch(e){return null;}},
  save:function(s){var ok=true;try{localStorage.setItem(KEY,JSON.stringify(s));}catch(e){ok=false;}show($('f-nosave'),!ok);return ok;},
  drop:function(k){try{localStorage.removeItem(k);}catch(e){}},
  clear:function(){this.drop(KEY);this.drop(OLDKEY);}
};
function dayOf(d){return Math.floor((d.getTime()-d.getTimezoneOffset()*60000)/86400000);}
function today(){return dayOf(new Date());}
function mark(items,id,ok,retry,day){
  var r=items[id]||(items[id]={n:0,m:0,first:0,last:0,box:0,due:0,day:-1});
  if(!retry){
    if(r.n===0)r.first=ok?1:0;
    r.box=ok?(r.n===0?1:Math.min(r.box+1,GAPS.length-1)):0;
    r.due=day+GAPS[r.box];r.n++;
  }
  if(!ok)r.m++;
  r.last=ok?1:0;r.day=day;
  return r;
}
function freshGroup(k){return {mode:'starter',queue:GROUPS[k].starter.map(function(i){return {id:i.id};}),pos:0,freeN:0};}
function freshUnit(u){return {group:UNITS[u].groups[0],dq:0,tab:u+'-goals',review:{day:-1,queue:[],pos:0}};}
function freshUnits(){var o={};UNIT_ORDER.forEach(function(u){o[u]=freshUnit(u);});return o;}
function freshPractice(){var g={};GROUP_ORDER.forEach(function(k){g[k]=freshGroup(k);});return {groups:g,items:{},free:{},tags:{}};}
function fresh(){
  var p=freshPractice();
  return {v:3,seed:20261006,units:freshUnits(),groups:p.groups,items:p.items,free:p.free,tags:p.tags,log:[],
    discuss:{},explore:{start:'zero',ops:[]},code:{axis:'y',shots:1000,target:'simulator',mode:'counts'},
    explore0:{a:[2,1],b:[1,2],show:{sum:true,diff:false,proj:false}},lastUnit:'u0',seenStart:{}};
}
function opValid(op){
  if(!op||typeof op!=='object')return false;
  function num(x,lo,hi){return typeof x==='number'&&x>=lo&&x<=hi;}
  if(op.t==='gate'){
    if(typeof op.name!=='string')return false;
    if(has(NAMED,op.name))return true;
    var m=/^R[xyz]\((-?\d+(?:\.\d+)?)\)$/.exec(op.name),d=m?parseFloat(m[1]):0;
    return !!m&&d!==0&&Math.abs(d)<=360;
  }
  if(op.t==='relax')return num(op.tt,1e-6,10)&&num(op.q,0.1,2);
  if(op.t==='depol')return num(op.p,1e-6,1);
  return false;
}
function cleanOp(op){
  if(op.t==='gate')return {t:'gate',name:op.name};
  if(op.t==='relax')return {t:'relax',tt:op.tt,q:op.q,a:Math.exp(-op.tt),b:Math.exp(-op.tt/op.q),label:'T1, T2'};
  return {t:'depol',p:op.p,label:'depol '+op.p};
}
function cleanEntry(q){var e={id:q.id};if(q.retry){e.retry=true;if(typeof q.day==='number')e.day=q.day;}return e;}
function repair(s){
  var f=fresh(),out={},k,r;
  if(!s||typeof s!=='object'||s.v!==3)return f;
  if(!s.units||typeof s.units!=='object'){s.units={u1:{group:s.group,dq:s.dq,tab:s.unitTab,review:s.review}};if(s.seenStart===true)s.seenStart={u1:true};if(UNIT_ORDER.indexOf(s.lastUnit)<0)s.lastUnit='u1';}
  for(k in f)out[k]=(s[k]==null||typeof s[k]!==typeof f[k]||Array.isArray(s[k])!==Array.isArray(f[k]))?f[k]:s[k];
  if(!isFinite(out.seed))out.seed=f.seed;
  out.seed|=0;
  var seen={};UNIT_ORDER.forEach(function(u){if(has(out.seenStart,u)&&out.seenStart[u])seen[u]=true;});out.seenStart=seen;
  if(UNIT_ORDER.indexOf(out.lastUnit)<0)out.lastUnit='u0';
  var items={};
  for(k in out.items){
    r=out.items[k];
    if(!has(out.items,k)||!ITEM[k]||!r||typeof r!=='object'||!isInt(r.n,1,1e6)||!isInt(r.due,-1e7,1e7)||!isInt(r.day,-1e7,1e7))continue;
    items[k]={n:r.n,m:isInt(r.m,0,1e6)?r.m:0,first:r.first?1:0,last:r.last?1:0,box:isInt(r.box,0,GAPS.length-1)?r.box:0,due:r.due,day:r.day};
  }
  out.items=items;
  var groups={};
  GROUP_ORDER.forEach(function(g){
    var x=has(out.groups,g)?out.groups[g]:null,ids=GROUPS[g].starter.map(function(i){return i.id;}),ok=!!x&&typeof x==='object'&&Array.isArray(x.queue)&&x.queue.length<200;
    if(ok)ok=x.queue.every(function(q){return q&&typeof q==='object'&&typeof q.id==='string'&&ITEM_GROUP[q.id]===g;});
    if(ok){
      var firsts=x.queue.filter(function(q){return !q.retry;}).map(function(q){return q.id;});
      ok=firsts.length===ids.length&&firsts.every(function(id,i){return id===ids[i];});
    }
    if(!ok){groups[g]=freshGroup(g);return;}
    groups[g]={mode:x.mode==='free'?'free':'starter',queue:x.queue.map(cleanEntry),pos:isInt(x.pos,0,x.queue.length)?x.pos:0,freeN:isInt(x.freeN,0,1e7)?x.freeN:0};
  });
  out.groups=groups;
  var units={};
  UNIT_ORDER.forEach(function(u){
    var x=has(out.units,u)?out.units[u]:null,fu=freshUnit(u),def=UNITS[u];
    if(!x||typeof x!=='object'){units[u]=fu;return;}
    var rv=x.review,rvo;
    if(!rv||typeof rv!=='object'||!Array.isArray(rv.queue)||!isInt(rv.day,-1e7,1e7))rvo=fu.review;
    else{
      var rq=rv.queue.filter(function(q){return q&&typeof q==='object'&&typeof q.id==='string'&&ITEM[q.id]&&ITEM_UNIT[q.id]===u&&items[q.id];}).slice(0,60).map(cleanEntry);
      rvo={day:rv.day,queue:rq,pos:isInt(rv.pos,0,rq.length)?rv.pos:rq.length};
    }
    units[u]={group:(def.groups.indexOf(x.group)>=0||x.group==='R')?x.group:def.groups[0],dq:isInt(x.dq,0,def.discuss.length-1)?x.dq:0,tab:partRoutes(u).indexOf(x.tab)>=0?x.tab:u+'-goals',review:rvo};
  });
  out.units=units;
  var dis={},allQ=[];
  UNIT_ORDER.forEach(function(u){allQ=allQ.concat(UNITS[u].discuss);});
  allQ.forEach(function(q){
    var d=has(out.discuss,q.id)?out.discuss[q.id]:null,n=q.options.length-1;
    if(d&&typeof d==='object'&&isInt(d.first,0,n)&&(d.final==null||isInt(d.final,0,n)))dis[q.id]={first:d.first,final:d.final==null?null:d.final};
  });
  out.discuss=dis;
  var free={},tags={};
  for(k in CONCEPTS){r=has(out.free,k)?out.free[k]:null;if(r&&typeof r==='object'&&isInt(r.n,0,1e7)&&isInt(r.c,0,1e7))free[k]={n:r.n,c:r.c};}
  for(k in out.tags)if(has(out.tags,k)&&has(TAGINFO,k.split('+')[0])&&isInt(out.tags[k],1,1e7))tags[k]=out.tags[k];
  out.free=free;out.tags=tags;
  out.log=out.log.filter(function(row){return row&&typeof row==='object'&&!Array.isArray(row);}).slice(-1500);
  var ex=out.explore;
  out.explore=(typeof ex.start==='string'&&has(STARTS,ex.start)&&Array.isArray(ex.ops)&&ex.ops.length<=24&&ex.ops.every(opValid))?{start:ex.start,ops:ex.ops.map(cleanOp)}:{start:'zero',ops:[]};
  var c=out.code;
  out.code={axis:typeof c.axis==='string'&&has(CG_AXIS,c.axis)?c.axis:'y',shots:isInt(c.shots,1,10000)?c.shots:1000,target:typeof c.target==='string'&&has(CG_TARGETS,c.target)?c.target:'simulator',mode:c.mode==='expect'?'expect':'counts'};
  var e0=out.explore0;
  function vec2(v){return Array.isArray(v)&&v.length===2&&v.every(function(x){return typeof x==='number'&&x>=-4&&x<=4;})?[Math.round(v[0]*100)/100,Math.round(v[1]*100)/100]:null;}
  out.explore0={a:vec2(e0.a)||[2,1],b:vec2(e0.b)||[1,2],show:{sum:!!(e0.show&&e0.show.sum),diff:!!(e0.show&&e0.show.diff),proj:!!(e0.show&&e0.show.proj)}};
  return out;
}
function migrate(o){
  var s=fresh(),out;
  try{
    if(!o||typeof o!=='object'||o.v!==2||!o.groups||typeof o.groups!=='object')return s;
    GROUP_ORDER.forEach(function(k){if(has(o.groups,k))s.groups[k]=o.groups[k];});
    if(UNITS.u1.groups.indexOf(o.group)>=0)s.units.u1.group=o.group;s.lastUnit='u1';
    if(o.tags&&typeof o.tags==='object')s.tags=o.tags;
    (Array.isArray(o.log)?o.log:[]).forEach(function(r){
      if(!r||typeof r!=='object'||typeof r.item!=='string')return;
      var d=dayOf(new Date(r.t));
      if(ITEM[r.item]&&d===d)mark(s.items,r.item,r.tag==='correct',!!r.retry,d);
      s.log.push(r);
    });
    out=repair(s);
  }catch(e){out=fresh();}
  if(store.save(out))store.drop(OLDKEY);
  return out;
}
var S=(function(){
  var s=store.load(KEY);
  if(s&&s.v===3)return repair(s);
  var o=store.load(OLDKEY);
  return o?migrate(o):fresh();
})();
function logRow(row){S.log.push(row);if(S.log.length>1500)S.log.shift();return row;}
function attempts(u){var n=0,k;for(k in S.items)if(S.items[k].n&&(!u||ITEM_UNIT[k]===u))n++;return n;}
function discussed(u){var n=0;UNITS[u||UID].discuss.forEach(function(q){var d=S.discuss[q.id];if(d&&d.final!=null)n++;});return n;}
function markOf(id){var r=S.items[id];if(!r||!r.n)return '';return r.last?(r.m?'rec':'ok'):'miss';}
function pipsFor(ids){
  var n={ok:0,rec:0,miss:0,none:0},h='';
  ids.forEach(function(id){var m=markOf(id);n[m||'none']++;h+='<span class="pip'+(m?' '+m:'')+'"></span>';});
  return '<span class="pips" role="img" aria-label="'+n.ok+' right on the first try, '+n.rec+' right after a miss, '+n.miss+' missed on the last try, '+n.none+' not tried">'+h+'</span>';
}


function circuitHTML(start,labels){
  var h='<span class="ket">'+esc(start)+'</span><span class="wire"></span>';
  labels.forEach(function(l,i){h+='<span class="gate">'+esc(l)+'</span><span class="'+(i===labels.length-1?'tail':'wire')+'"></span>';});
  return h;
}
function opLabel(op){return op.t==='gate'?gateOf(op.name).label:op.label;}
function opsHTML(start,ops,more){
  var h='<span class="ket">'+KETS[start]+'</span><span class="'+(ops.length||more?'wire':'tail')+'"></span>';
  ops.forEach(function(op,i){h+='<span class="gate'+(op.t==='gate'?'':' noise')+'">'+esc(opLabel(op))+'</span><span class="'+(i===ops.length-1&&!more?'tail':'wire')+'"></span>';});
  return h;
}
function twoStep(btn,label,confirmLabel,fn){
  var armed=false,timer=0;
  btn.onclick=function(e){
    if(armed&&e&&e.detail>1)return;
    if(armed){clearTimeout(timer);armed=false;btn.textContent=label;fn();return;}
    armed=true;btn.textContent=confirmLabel;timer=setTimeout(function(){armed=false;btn.textContent=label;},4000);
  };
}
function copyText(text,btn,el){
  var label=btn.getAttribute('data-label')||btn.textContent;btn.setAttribute('data-label',label);
  function say(msg){btn.textContent=msg;setTimeout(function(){btn.textContent=label;},2600);}
  function fallback(){
    try{
      if(el.select){el.focus();el.select();}
      else{var r=document.createRange();r.selectNodeContents(el);var s=window.getSelection();s.removeAllRanges();s.addRange(r);}
      say('Selected. Now press Ctrl+C or ⌘C');
    }catch(e){say('Select the text to copy it');}
  }
  try{
    if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(text).then(function(){say('Copied');},fallback);
    else fallback();
  }catch(e){fallback();}
}

// Practice
var ps=new FigSlot($('p-sphere'),'Bloch sphere. Click to place your prediction. Drag to turn the view.','A plane with a grid. Click to place the tip of your arrow.');
var cur=null,phase='idle',cls=null,resp=null,curLog=null,pDirty=true,pUnit=null;
function G(){return S.groups[US().group];}
function dueIds(u){
  u=u||UID;var d=today(),out=[],id,r;
  for(id in S.items){r=S.items[id];if(ITEM[id]&&ITEM_UNIT[id]===u&&r.n>0&&r.due<=d&&r.day<d)out.push(id);}
  return out;
}
function buildReview(){
  var d=today(),ids=dueIds();
  ids.sort(function(a,b){var x=S.items[a],y=S.items[b];return (x.box?1:0)-(y.box?1:0)||x.due-y.due||hashStr(a+':'+d)-hashStr(b+':'+d);});
  US().review={day:d,queue:ids.slice(0,12).map(function(id){return {id:id};}),pos:0};
}
function reviewLeft(u){
  u=u||UID;var rv=S.units[u].review,n=dueIds(u).length,i;
  if(rv.day===today())for(i=rv.pos;i<rv.queue.length;i++)if(rv.queue[i].retry)n++;
  return n;
}
function nextDue(){
  var d=today(),best=null,n=0,id,r,e;
  for(id in S.items){
    r=S.items[id];if(!ITEM[id]||ITEM_UNIT[id]!==UID||!r.n)continue;
    e=Math.max(r.due,r.day+1);if(e<=d)continue;
    if(best===null||e<best){best=e;n=1;}else if(e===best)n++;
  }
  return best===null?null:{days:best-d,n:n};
}
function currentItem(){
  var q,it,c;
  if(US().group==='R'){
    var rv=US().review,d=today();
    if(rv.day!==d){buildReview();store.save(S);rv=US().review;}
    while(rv.pos<rv.queue.length){q=rv.queue[rv.pos];if(!q.retry&&S.items[q.id]&&S.items[q.id].day>=d)rv.pos++;else break;}
    if(rv.pos>=rv.queue.length)return null;
    q=rv.queue[rv.pos];c=copyOf(ITEM[q.id]);c.level=3;c.retry=!!q.retry;c.review=true;return c;
  }
  var g=G(),d0=today();
  if(g.mode==='starter'){
    while(g.pos<g.queue.length){
      q=g.queue[g.pos];
      if(q.retry?q.day!==d0:!!(S.items[q.id]&&S.items[q.id].n))g.pos++;else break;
    }
    if(g.pos>=g.queue.length)return null;
    q=g.queue[g.pos];it=ITEM[q.id];if(!it)return null;
    c=copyOf(it);c.retry=!!q.retry;return c;
  }
  return GROUPS[US().group].gen(g.freeN,S.seed);
}
function renderGroups(){
  var h='',n=reviewLeft(),cg=US().group;
  U().groups.forEach(function(k){
    var g=S.groups[k],st=g.mode==='free'?'more practice':g.pos>=g.queue.length?'done':g.pos?g.pos+' of '+g.queue.length+' done':'';
    h+='<button type="button" data-g="'+k+'"'+(k===cg?' aria-current="true"':'')+'>'+GROUPS[k].name+(st?'<small>'+st+'</small>':'')+'</button>';
  });
  h+='<button type="button" data-g="R"'+(cg==='R'?' aria-current="true"':'')+'>Review'+(n?'<small>'+n+' due</small>':'')+'</button>';
  $('p-groups').innerHTML=h;
}
$('p-groups').onclick=function(e){
  var b=closest(e.target,'button[data-g]');if(!b)return;
  US().group=b.getAttribute('data-g');store.save(S);renderItem();
};
function predictControls(R){
  if(R.mode==='point'||R.mode==='slice')return '<p class="readout" id="p-read">No point placed yet.</p>';
  if(R.mode==='number'){
    var lo=R.numMin==null?0:R.numMin,hi=R.numMax==null?1:R.numMax;
    return '<p class="field"><label for="p-num">'+esc(R.numLabel)+' =</label><input type="number" id="p-num" min="'+lo+'" max="'+hi+'" step="0.01"'+(lo<0?'':' inputmode="decimal"')+' placeholder="0.50"></p>';
  }
  if(R.mode==='multi')return '<div class="opts row2" id="p-opts" role="group" aria-label="Measurements">'+R.options.map(function(o){return '<label><input type="checkbox" value="'+o.k+'"> '+esc(o.t)+'</label>';}).join('')+'<label><input type="checkbox" value="none"> '+esc(R.noneText)+'</label></div>';
  return '<div class="opts" id="p-opts" role="radiogroup" aria-label="Answers">'+R.options.map(function(o,i){return '<label><input type="radio" name="p-choice" value="'+i+'"> <span>'+esc(o.t)+'</span></label>';}).join('')+'</div>';
}
function renderItem(){
  pDirty=false;pUnit=UID;
  $('p-intro').innerHTML='First time here? '+link('','unit-start','Start here')+' '+esc(U().practiceIntro);
  show($('p-intro'),!S.seenStart[UID]&&!attempts(UID));
  var it=currentItem();
  renderGroups();
  if(!it){renderSummary();return;}
  var R=buildItem(it),rv=US().group==='R',g=rv?US().review:G();cur=R;phase='predict';cls=null;resp=null;curLog=null;
  $('view-practice').querySelector('.stage').classList.toggle('nofig',!!R.nofig);
  ps.load(R.scene());ps.setPlacing(R.mode==='point'||R.mode==='slice');ps.draw();
  var pos=rv?'Review, item '+(g.pos+1)+' of '+g.queue.length:g.mode==='starter'?'Item '+(g.pos+1)+' of '+g.queue.length:'More practice, item '+(g.freeN+1);
  var extra='';
  if(it.retry)extra=' This item is back because you missed it earlier.';
  else if(it.review){var ago=today()-S.items[it.id].day;extra=' You last answered this item '+(ago===1?'yesterday':ago+' days ago')+'.';}
  $('p-head').setAttribute('data-item',it.id);$('p-head').setAttribute('data-level',it.level);
  $('p-head').innerHTML=
    '<p class="meta"><span>'+esc(CONCEPTS[it.concept])+'</span><span>'+pos+'</span></p>'+
    (R.circuit?'<div class="circuit" aria-hidden="true">'+circuitHTML(R.circuit.start,R.circuit.gates)+'</div>':'')+
    '<p class="prompt">'+esc(R.prompt)+'</p>'+
    '<p class="note">'+esc(R.note+extra)+(!rv&&g.mode==='free'?' <button type="button" class="link" id="p-backstarter">Back to the starter set</button>':'')+'</p>';
  $('p-steps').innerHTML=
    '<ol class="steps">'+
      '<li class="step" id="st1"><div><h3>Predict</h3><div class="body" id="p-how">'+esc(R.how)+'</div>'+predictControls(R)+'<button type="button" class="primary" id="p-lock">Lock in prediction</button><p class="err" id="p-lockerr" hidden></p></div></li>'+
      '<li class="step" id="st2" hidden><div><h3>Observe</h3><div class="body" id="p-obs"></div><div class="row"><button type="button" class="ghost" id="p-replay" hidden>Replay</button></div></div></li>'+
      '<li class="step" id="st3" hidden><div><h3>Explain</h3><div class="body" id="p-expq"></div><textarea id="p-exp" rows="2" aria-labelledby="p-expq"></textarea><p class="err" id="p-experr" hidden></p><div class="row" id="p-exprow"><button type="button" class="primary" id="p-compare">Compare with reference</button></div><div id="p-refbox"></div></div></li>'+
    '</ol>';
  $('p-lock').onclick=lockIn;
  $('p-replay').onclick=function(){if((phase==='explain'||phase==='done')&&cur.replay){ps.load(cur.scene());ps.pred=(cur.mode==='point'||cur.mode==='slice')?resp:null;cur.observe(ps,function(){});}};
  $('p-compare').onclick=compare;
  $('p-exp').oninput=function(){show($('p-experr'),false);};
  if($('p-backstarter'))$('p-backstarter').onclick=function(){G().mode='starter';store.save(S);renderItem();};
  var opts=$('p-opts');
  if(opts&&R.mode==='multi')opts.onchange=function(e){
    var boxes=opts.querySelectorAll('input');
    if(e.target.value==='none'&&e.target.checked)each(boxes,function(b){if(b.value!=='none')b.checked=false;});
    else if(e.target.checked)each(boxes,function(b){if(b.value==='none')b.checked=false;});
    show($('p-lockerr'),false);
  };
  var numEl=$('p-num');if(numEl)numEl.oninput=function(){show($('p-lockerr'),false);};
  if(opts&&R.mode==='choice')opts.onchange=function(){show($('p-lockerr'),false);};
  setupNumbers(R);
  show($('p-resetview'),R.mode!=='slice'&&!R.plane);show($('p-flatnote'),R.mode==='slice');
  $('p-legend').innerHTML=R.plane?'<span><i class="k-state"></i>Result</span><span><i class="k-vec"></i>Given vectors</span><span><i class="k-pred"></i>Your prediction</span>'
    :UID==='u0'?'<span><i class="k-state"></i>Result</span><span><i class="k-vec"></i>Given vectors</span><span><i class="k-pred"></i>Your prediction</span><span><i class="k-path"></i>Motion</span>'
    :'<span><i class="k-state"></i>State</span><span><i class="k-start"></i>Start</span><span><i class="k-pred"></i>Your prediction</span><span><i class="k-path"></i>Actual motion</span>';
  renderStrip();
}
ps.onPlace=function(p){
  if(phase!=='predict'||!cur)return;
  ps.pred=p;ps.draw();$('p-read').textContent=(cur.plane?'Your arrow: ':'Your point: ')+cur.respText(p)+'.';show($('p-lockerr'),false);
};
function readResponse(){
  var R=cur,e=null,v=null;
  if(R.mode==='point'||R.mode==='slice'){v=ps.pred;if(!v)e=R.mode==='slice'?'Place a point in the circle first.':R.plane?'Place the tip of the arrow on the grid first.':'Place a point on the sphere first.';}
  else if(R.mode==='number'){
    var raw=$('p-num').value.trim(),lo=R.numMin==null?0:R.numMin,hi=R.numMax==null?1:R.numMax;v=parseFloat(raw);
    if(raw===''||!(v>=lo&&v<=hi)){v=null;e='Type a number between '+String(lo).replace('-','\u2212')+' and '+hi+'.';}
  }
  else if(R.mode==='multi'){var sel=[],none=false;each($('p-opts').querySelectorAll('input:checked'),function(b){if(b.value==='none')none=true;else sel.push(b.value);});if(!sel.length&&!none)e='Select at least one option.';else v=sel;}
  else{var c=$('p-opts').querySelector('input:checked');if(!c)e='Choose an answer.';else v=parseInt(c.value,10);}
  return {v:v,e:e};
}
function lockIn(){
  if(phase!=='predict')return;
  var r=readResponse();
  if(r.e){var el=$('p-lockerr');el.textContent=r.e;show(el,true);return;}
  resp=r.v;phase='observe';
  cls=cur.classify(resp);record(cur,cls);
  ps.setPlacing(false);show($('p-lock'),false);show($('p-how'),false);show($('p-lockerr'),false);
  each($('st1').querySelectorAll('input'),function(i){i.disabled=true;});
  var line='Your prediction: '+cur.respText(resp)+'.';
  if($('p-read'))$('p-read').textContent=line;else{var p=document.createElement('p');p.className='readout';p.textContent=line;$('st1').firstChild.appendChild(p);}
  $('p-obs').textContent=cur.replay?'Watch the state move.':'';show($('st2'),true);
  cur.observe(ps,finishObserve);
}
function finishObserve(){
  if(!cur||phase!=='observe')return;
  var R=cur,ok=cls.tag==='correct';phase='explain';
  $('p-obs').innerHTML='<p>'+esc(R.result)+'</p>'+(R.extra?'<p class="note">'+esc(R.extra())+'</p>':'')+'<div class="fb'+(ok?' ok':'')+'">'+esc(R.feedback(cls))+'</div>';
  show($('p-replay'),!!R.replay);
  $('p-expq').textContent=ok?'In one sentence, what was your reasoning?':'In one sentence, why did your prediction differ from the result?';
  show($('st3'),true);renderStrip();renderGroups();
}
function compare(){
  if(phase!=='explain')return;
  var t=$('p-exp').value.trim();
  if(!t){var e=$('p-experr');e.textContent='Write one sentence first.';show(e,true);return;}
  if(curLog){curLog.explanation=t;store.save(S);}
  phase='done';$('p-exp').readOnly=true;
  $('p-refbox').innerHTML='<div class="ref"><b>Reference</b>'+esc(cur.reference)+'</div><button type="button" class="primary" id="p-next">Next item</button>';
  show($('p-exprow'),false);
  $('p-next').onclick=function(){renderItem();toTop($('p-groups'));};
}
function record(R,c){
  var it=R.item,ok=c.tag==='correct',rv=US().group==='R',Q=rv?US().review:G(),starter=!!ITEM[it.id];
  if(starter)mark(S.items,it.id,ok,!!it.retry,today());
  else{var f=S.free[it.concept]||(S.free[it.concept]={n:0,c:0});f.n++;if(ok)f.c++;}
  if(!ok){
    S.tags[c.tag]=(S.tags[c.tag]||0)+1;
    if(starter&&!it.retry)Q.queue.splice(Math.min(Q.pos+4,Q.queue.length),0,{id:it.id,retry:true,day:today()});
  }
  if(!rv&&Q.mode==='free')Q.freeN++;else Q.pos++;
  curLog=logRow({t:new Date().toISOString(),item:it.id,concept:it.concept,level:it.level,type:R.type,answer:R.respText(resp),tag:c.tag,retry:it.retry?1:0,review:it.review?1:0,explanation:''});
  store.save(S);
}
function renderStrip(){
  var h='';
  U().groups.forEach(function(k){GROUPS[k].concepts.forEach(function(c){
    h+='<div class="c"><b>'+c+'</b>'+esc(CONCEPTS[c])+pipsFor(CONCEPT_ITEMS[c])+'</div>';
  });});
  h+='<div class="striptools"><span><span class="pip ok"></span>Right on the first try</span><span><span class="pip rec"></span>Right after a miss</span><span><span class="pip miss"></span>Missed on the last try</span><span><span class="pip"></span>Not tried yet</span><button type="button" class="link" id="p-restart">Start over</button></div>';
  $('p-strip').innerHTML=h;
  twoStep($('p-restart'),'Start over','Click again to reset your practice progress in this unit',function(){
    var f=freshUnit(UID),id;
    U().groups.forEach(function(k){S.groups[k]=freshGroup(k);GROUPS[k].concepts.forEach(function(x){delete S.free[x];});});
    for(id in S.items)if(ITEM_UNIT[id]===UID)delete S.items[id];
    S.units[UID].group=f.group;S.units[UID].review=f.review;
    store.save(S);renderItem();
  });
}
function renderSummary(){
  cur=null;phase='idle';curLog=null;
  $('view-practice').querySelector('.stage').classList.remove('nofig');
  ps.load(UID==='u0'?{plane:true}:{state:[0,0,1]});ps.setPlacing(false);ps.draw();show($('p-numbers'),false);show($('p-resetview'),UID!=='u0');show($('p-flatnote'),false);
  $('p-head').removeAttribute('data-item');$('p-head').removeAttribute('data-level');
  if(US().group==='R'){reviewSummary();renderStrip();return;}
  var def=GROUPS[US().group],low=def.name.toLowerCase(),n=0,c=0,rec=0,miss=0;
  def.starter.forEach(function(it){var r=S.items[it.id];if(!r||!r.n)return;n++;if(r.first)c++;var m=markOf(it.id);if(m==='rec')rec++;else if(m==='miss')miss++;});
  var top=Object.keys(S.tags).sort(function(a,b){return S.tags[b]-S.tags[a];})[0];
  var order=U().groups,ni=order.indexOf(US().group)+1,next=ni<order.length?order[ni]:null;
  $('p-head').innerHTML=
    '<p class="meta"><span>'+def.name+'</span><span>Starter set complete</span></p>'+
    '<p class="prompt">You finished the starter set on '+low+'. Right on the first try: '+c+' of '+n+'.</p>'+
    (rec||miss?'<p class="note">'+(rec?'Right after a miss: '+rec+'. ':'')+(miss?'Missed on the last try: '+miss+'.':'')+'</p>':'')+
    (top?'<p class="note">Most frequent slip so far: '+esc(tagName(top).toLowerCase())+', '+plural(S.tags[top]|0,'time','times')+'.</p>':'')+
    '<p class="note">These items come back under Review. Missed items return tomorrow, the others in 3 days.</p>';
  $('p-steps').innerHTML=
    '<div class="row" style="margin-top:18px">'+(next?'<button type="button" class="primary" id="p-nextgroup">Go on to '+GROUPS[next].name.toLowerCase()+'</button>':link('primary',UID+'-discuss','Go on to the discussion questions'))+'<button type="button" class="ghost" id="p-more">More practice on '+low+'</button></div>'+
    (US().group==='G'?'<p class="note">More practice on gates draws from '+count(COUNTS.one)+' single-gate and '+count(COUNTS.two)+' two-gate items, without hints.</p>':'<p class="note">More practice items are generated without hints.</p>');
  $('p-more').onclick=function(){G().mode='free';store.save(S);renderItem();};
  if(next)$('p-nextgroup').onclick=function(){US().group=next;store.save(S);renderItem();};
  renderStrip();
}
function reviewSummary(){
  var rv=US().review,more=dueIds().length,nx=nextDue(),done=rv.day===today()&&rv.queue.length>0,h,b,open=null;
  U().groups.forEach(function(k){var g=S.groups[k];if(open===null&&g.mode==='starter'&&g.pos<g.queue.length)open=k;});
  var onward=open?'<button type="button" class="'+(more?'ghost':'primary')+'" id="p-togroup">'+(attempts(UID)?'Continue with ':'Begin with ')+GROUPS[open].name.toLowerCase()+'</button>':link(more?'ghost':'primary',UID+'-discuss','Go to the discussion questions');
  if(!attempts(UID)){
    h='<p class="prompt">Nothing to review yet.</p><p class="note">Items you answer in each topic come back here. Missed items return the next day, the others after 3 days, then after 7, 14 and 30 days. Review items come without hints.</p>';
    b=onward;
  }else if(more){
    h='<p class="prompt">'+(done?'That set is done. ':'')+(more===1?'One more item is':more+' more items are')+' due for review.</p>';
    b='<button type="button" class="primary" id="p-reviewmore">Review '+plural(Math.min(more,12),'item','items')+'</button>'+onward;
  }else{
    h='<p class="prompt">'+(done?'Review is done for today.':'Nothing is due for review today.')+'</p>'+(nx?'<p class="note">Next review: '+plural(nx.n,'item','items')+' '+(nx.days===1?'tomorrow':'in '+nx.days+' days')+'.</p>':'');
    b=onward;
  }
  $('p-head').innerHTML='<p class="meta"><span>Review</span><span></span></p>'+h;
  $('p-steps').innerHTML='<div class="row" style="margin-top:18px">'+b+'</div>';
  if($('p-reviewmore'))$('p-reviewmore').onclick=function(){buildReview();store.save(S);renderItem();};
  if($('p-togroup'))$('p-togroup').onclick=function(){US().group=open;store.save(S);renderItem();};
}
function setupNumbers(R){
  var box=$('p-numbers'),on=R.mode==='point'||R.mode==='slice';show(box,on);if(!on)return;
  var slice=R.mode==='slice',pl=!!R.plane,cx=pl&&ps.active.axes;
  $('p-n1l').firstChild.nodeValue=pl?(cx?'Re ':'x '):slice?'across ':'θ ';$('p-n2l').firstChild.nodeValue=pl?(cx?'Im ':'y '):slice?'up ':'φ ';
  var a=$('p-n1'),b=$('p-n2');a.value='';b.value='';
  a.min=pl?-4:slice?-1:0;a.max=pl?4:slice?1:180;a.step=pl?0.25:slice?0.05:1;a.placeholder=pl?'2':slice?'0.5':'90';
  b.min=pl?-4:slice?-1:0;b.max=pl?4:slice?1:360;b.step=pl?0.25:slice?0.05:1;b.placeholder=pl?'1':slice?'0.5':'45';
  $('p-numbers').querySelector('summary').textContent=pl?'Enter the components':'Place by numbers';
  show($('p-angerr'),false);
}
$('p-resetview').onclick=function(){ps.resetView();};
$('p-placeangles').onclick=function(){
  var e=$('p-angerr'),a=parseFloat($('p-n1').value),b=parseFloat($('p-n2').value);
  if(phase!=='predict'||!cur){e.textContent='This item is already locked in.';show(e,true);return;}
  if(cur.plane){
    if(!(a>=-4&&a<=4)||!(b>=-4&&b<=4)){e.textContent='Enter two components between −4 and 4.';show(e,true);return;}
    show(e,false);ps.onPlace(v2snap([a,b],0.25));return;
  }
  if(cur.mode==='slice'){
    if(!(a>=-1&&a<=1)||!(b>=-1&&b<=1)||Math.hypot(a,b)>1.0001){e.textContent='Enter two numbers between −1 and 1 that lie inside the circle.';show(e,true);return;}
    show(e,false);ps.onPlace(add(scale(ps.slice.u,a),scale(ps.slice.w,b)));return;
  }
  if(!(a>=0&&a<=180)||!(b>=0&&b<=360)){e.textContent='Enter θ from 0 to 180 and φ from 0 to 360, in degrees.';show(e,true);return;}
  show(e,false);ps.onPlace(fromAngles(a,b));
};
function enterPractice(){
  if(pDirty||phase==='idle'||pUnit!==UID)renderItem();
  else{show($('p-intro'),!S.seenStart[UID]&&!attempts(UID));renderGroups();ps.draw();}
}

// Discuss
var dsp=new FigSlot($('d-sphere'),'Figure for the discussion question. Drag to turn it.','Figure for the discussion question.');
var dDirty=true,dUnit=null;
function dOptions(q,name){
  return '<div class="opts" role="radiogroup" aria-label="Answers" id="'+name+'">'+q.options.map(function(o,i){
    return '<label><input type="radio" name="'+name+'" value="'+i+'"> <span class="letter">'+LET[i]+'</span><span>'+esc(o.t)+'</span></label>';
  }).join('')+'</div>';
}
function renderDiscuss(){
  dDirty=false;dUnit=UID;
  var DQ=U().discuss,dq=US().dq,q=DQ[dq],D=S.discuss[q.id]||{first:null,final:null},st=D.final!=null?3:D.first!=null?2:1,h='';
  U().groups.forEach(function(k){
    h+='<span class="qg"><span>'+GROUPS[k].name+'</span>';
    DQ.forEach(function(x,j){
      if(GROUPS[k].concepts.indexOf(x.concept)<0)return;
      var d=S.discuss[x.id],s=d&&d.final!=null?(x.options[d.final].ok?'ok':'no'):'';
      h+='<button type="button" data-q="'+j+'"'+(s?' class="'+s+'"':'')+(j===dq?' aria-current="true"':'')+' aria-label="Question '+(j+1)+': '+esc(x.title)+(s==='ok'?'. Answered, your final answer holds':s==='no'?'. Answered, your final answer does not hold':'')+'">'+(j+1)+'</button>';
    });
    h+='</span>';
  });
  $('d-nav').innerHTML=h;
  var sc=q.scene?q.scene():null;
  $('d-stage').classList.toggle('nofig',!sc);
  if(sc){dsp.load(sc);dsp.draw();$('d-cap').textContent=sc.plane?'The figure for this question.':sc.slice?'A cross-section through the x and z axes.':'Drag the figure to turn it.';show($('d-resetview'),!sc.slice&&!sc.plane);}
  else dsp.stop();
  show($('d-replay'),!!sc&&!!q.reveal&&st===3);
  h='<p class="meta"><span>'+esc(CONCEPTS[q.concept])+'</span><span>Question '+(dq+1)+' of '+DQ.length+'</span></p>';
  (q.circuits||[]).forEach(function(c){h+='<div class="circuit" aria-hidden="true"><span class="cname">'+esc(c.name)+'</span>'+circuitHTML(c.start,c.gates)+'</div>';});
  h+='<p class="prompt">'+esc(q.stem)+'</p>';
  $('d-head').setAttribute('data-q',q.id);$('d-head').innerHTML=h;
  h='<ol class="steps"><li class="step"><div><h3>Answer on your own</h3>'+
    (st===1?dOptions(q,'d-o1')+'<button type="button" class="primary" id="d-lock1">Lock in my answer</button><p class="err" id="d-err1" hidden></p>'
           :'<p class="readout" style="margin:0">Your first answer: '+LET[D.first]+'. '+esc(q.options[D.first].t)+'</p>')+'</div></li>';
  if(st>=2)h+='<li class="step"><div><h3>Talk it over</h3>'+
    (st===2?'<div class="body">Find someone who chose a different answer. Take one minute each to make your case. If you are working alone, pick an option you did not choose and write down the best argument for it.</div><p class="note" style="margin:10px 0 0">Then answer again. You may keep your first answer.</p>'+dOptions(q,'d-o2')+'<button type="button" class="primary" id="d-lock2">Lock in my final answer</button><p class="err" id="d-err2" hidden></p>'
           :'<p class="readout" style="margin:0">Your final answer: '+LET[D.final]+'. '+esc(q.options[D.final].t)+'</p>')+'</div></li>';
  if(st===3){
    var ok=!!q.options[D.final].ok;
    h+='<li class="step"><div><h3>Compare the reasons</h3><div class="fb'+(ok?' ok':'')+'" style="margin:0 0 12px">'+(ok?'Your final answer holds.':'Your final answer does not hold. The reasons below show where it breaks down.')+(D.first!==D.final?' You changed your answer from '+LET[D.first]+' to '+LET[D.final]+'.':'')+'</div>';
    q.options.forEach(function(o,i){
      var tags=[];if(i===D.first)tags.push('your first answer');if(i===D.final)tags.push('your final answer');
      h+='<div class="why'+(o.ok?' ok':'')+'"><div class="ot"><span>'+LET[i]+'. '+esc(o.t)+'</span>'+(tags.length?'<span class="yours">'+tags.join(', ')+'</span>':'')+'</div>'+
        (o.ok?'<p class="r"><span class="lab">Why it holds</span>'+esc(o.why)+'</p>'
             :'<p class="r"><span class="lab">The idea behind it</span>'+esc(o.from)+'</p><p class="r"><span class="lab">Where it breaks down</span>'+esc(o.limit)+'</p>')+'</div>';
    });
    h+='<p class="more"><b>Take it further</b>'+esc(q.more)+'</p>'+
      '<div class="row" style="margin-top:16px"><button type="button" class="primary" id="d-next">Next question</button><button type="button" class="ghost" id="d-redo">Answer this question again</button></div></div></li>';
  }
  h+='</ol>';
  var poll=q.stem+'\n'+q.options.map(function(o,i){return LET[i]+'. '+o.t;}).join('\n');
  h+='<details class="inclass"><summary>Use in class</summary><p class="note">The sequence for a class: students answer alone, talk in pairs, answer again, and then the class goes through the reasons. The text below pastes into a polling tool.</p>'+
    '<textarea class="mono" id="d-poll" rows="6" readonly spellcheck="false" aria-label="Question text for a polling tool">'+esc(poll)+'</textarea><div class="row"><button type="button" class="ghost" id="d-copy">Copy</button></div></details>';
  $('d-steps').innerHTML=h;
  function lock(which){
    var c=$('d-o'+which).querySelector('input:checked'),er=$('d-err'+which);
    if(!c){er.textContent='Choose an answer.';show(er,true);return;}
    var i=parseInt(c.value,10);
    if(which===1)S.discuss[q.id]={first:i,final:null};else S.discuss[q.id].final=i;
    logRow({t:new Date().toISOString(),item:q.id,concept:q.concept,level:'',type:which===1?'discuss-first':'discuss-final',answer:LET[i]+'. '+q.options[i].t,tag:q.options[i].ok?'correct':'other-option',retry:0,review:0,explanation:''});
    store.save(S);renderDiscuss();
    if(which===2&&q.reveal&&q.scene)q.reveal(dsp,function(){});
  }
  if(st===1){$('d-lock1').onclick=function(){lock(1);};$('d-o1').onchange=function(){show($('d-err1'),false);};}
  if(st===2){$('d-lock2').onclick=function(){lock(2);};$('d-o2').onchange=function(){show($('d-err2'),false);};}
  if(st===3){
    $('d-next').onclick=function(){
      var n=DQ.length,j=(dq+1)%n,i,c,d;
      for(i=1;i<=n;i++){c=(dq+i)%n;d=S.discuss[DQ[c].id];if(!d||d.final==null){j=c;break;}}
      US().dq=j;store.save(S);renderDiscuss();toTop($('d-nav'));
    };
    $('d-redo').onclick=function(){delete S.discuss[q.id];store.save(S);renderDiscuss();};
  }
  $('d-copy').onclick=function(){copyText(poll,$('d-copy'),$('d-poll'));};
}
$('d-nav').onclick=function(e){
  var b=closest(e.target,'button[data-q]');if(!b)return;
  US().dq=parseInt(b.getAttribute('data-q'),10);store.save(S);renderDiscuss();
};
$('d-resetview').onclick=function(){dsp.resetView();};
$('d-replay').onclick=function(){var q=U().discuss[US().dq];if(q.reveal)q.reveal(dsp,function(){});};
function enterDiscuss(){if(dDirty||dUnit!==UID)renderDiscuss();else dsp.draw();}

// Explore
var es=new Sphere($('e-sphere'),'Bloch sphere sandbox. Drag to turn the view.');
var E={start:S.explore.start,ops:S.explore.ops.slice(),r:[0,0,1],busy:false,run:0};
function eSave(){S.explore={start:E.start,ops:E.ops.slice()};store.save(S);}
function eRecompute(){E.r=circuitState(E.start,E.ops,false);}
function eTrail(){
  var v=STARTS[E.start].slice(),tr=[];
  E.ops.forEach(function(op){var fn=opPath(op,v),seg=[];for(var j=0;j<=40;j++)seg.push(fn(j/40));tr.push(seg);v=fn(1);});
  return tr;
}
function eRender(){
  es.state=E.r;es.trailSteps=eTrail();es.ghost=E.ops.length?STARTS[E.start].slice():null;es.hint=null;es.draw();
  $('e-circuit').innerHTML=opsHTML(E.start,E.ops,false);
  var r=E.r,l=vlen(r),a=toAngles(r);
  $('e-vals').innerHTML=(l>0.02?'<span>θ = '+Math.round(a.theta)+'°</span><span>φ = '+(Math.round(a.phi)%360)+'°</span>':'<span>centre of the ball</span><span></span>')+'<span>length = '+num(l)+'</span><br>'+
    '<span>⟨X⟩ = '+num(r[0])+'</span><span>⟨Y⟩ = '+num(r[1])+'</span><span>⟨Z⟩ = '+num(r[2])+'</span><br>'+
    '<span>P(0) = '+num((1+r[2])/2)+'</span><span>P(+) = '+num((1+r[0])/2)+'</span><span>P(+i) = '+num((1+r[1])/2)+'</span>';
}
function eApply(op){
  var er=$('e-serr');
  if(E.busy)return;
  if(E.ops.length>=24){er.textContent='The circuit holds 24 steps. Undo or clear steps to go on.';show(er,true);return;}
  show(er,false);show($('e-err'),false);show($('e-nerr'),false);
  var from=E.r,fn=opPath(op,from),base=eTrail();E.busy=true;es.ghost=STARTS[E.start].slice();
  function fin(){E.ops.push(op);eRecompute();E.busy=false;eRender();eSave();$('e-mout').textContent='';if(route==='u1-code')renderCode();}
  if(op.t==='gate'){var g=gateOf(op.name);es.animate([{from:from,axis:g.axis,angle:g.angle,hint:{axis:g.axis}}],fin,base);}
  else{es.hint=null;es.animatePath(fn,1200,fin,base);}
}
function eReset(start){es.stop();E.busy=false;E.start=start;E.ops=[];eRecompute();eRender();eSave();$('e-mout').textContent='';show($('e-serr'),false);}
Object.keys(KETS).forEach(function(k){var b=document.createElement('button');b.type='button';b.className='key';b.textContent=KETS[k];b.onclick=function(){eReset(k);};$('e-starts').appendChild(b);});
Object.keys(NAMED).forEach(function(k){var b=document.createElement('button');b.type='button';b.className='key';b.textContent=NAMED[k].label;b.onclick=function(){eApply({t:'gate',name:k});};$('e-gates').appendChild(b);});
$('e-rotate').onclick=function(){
  var er=$('e-err'),d=Math.round(parseFloat($('e-angle').value)*1000)/1000;
  if(!(d>=-360&&d<=360)||d===0){er.textContent='Enter an angle between −360 and 360 degrees, not zero.';show(er,true);return;}
  eApply({t:'gate',name:'R'+$('e-axis').value+'('+d+')'});
};
$('e-relax').onclick=function(){
  var er=$('e-nerr'),t=Math.round(parseFloat($('e-t').value)*1e4)/1e4,q=Math.round(parseFloat($('e-ratio').value)*1e4)/1e4;
  if(!(t>0&&t<=10)||!(q>=0.1&&q<=2)){er.textContent='Enter t/T1 above 0 and at most 10, and T2/T1 from 0.1 to 2.';show(er,true);return;}
  eApply({t:'relax',tt:t,q:q,a:Math.exp(-t),b:Math.exp(-t/q),label:'T1, T2'});
};
$('e-depol').onclick=function(){
  var er=$('e-nerr'),p=Math.round(parseFloat($('e-p').value)*1e4)/1e4;
  if(!(p>0&&p<=1)){er.textContent='Enter p above 0 and at most 1.';show(er,true);return;}
  eApply({t:'depol',p:p,label:'depol '+p});
};
$('e-measure').onclick=function(){
  var er=$('e-merr'),raw=$('e-shots').value.trim(),n=Number(raw),k=$('e-maxis').value,A=AXM[k];
  if(raw===''||!isInt(n,1,100000)||!A){er.textContent='Enter a whole number of shots from 1 to 100,000.';show(er,true);return;}
  show(er,false);
  var pr=dot(E.r,A.v),c=sampleShots((1+pr)/2,n,hashStr(JSON.stringify(E.ops)+E.start+k+n+':'+(E.run++)));
  $('e-mout').textContent=count(n)+' shots along '+k+': '+count(c)+' gave '+A.plus+', '+count(n-c)+' gave '+A.minus+'. Estimate of ⟨'+A.name+'⟩ = '+num(2*c/n-1)+'. Exact value '+num(pr)+'.';
};
$('e-undo').onclick=function(){if(E.busy||!E.ops.length)return;E.ops.pop();eRecompute();eRender();eSave();$('e-mout').textContent='';show($('e-serr'),false);};
$('e-clear').onclick=function(){eReset(E.start);};
$('e-resetview').onclick=function(){es.resetView();};

// Code
var EXAMPLE={start:'zero',ops:[{t:'gate',name:'H'},{t:'gate',name:'S'}]};
var codeNow='',qasmNow='';
function codeSpec(){
  var own=E.ops.length>0||E.start!=='zero',c=own?E:EXAMPLE;
  return {own:own,start:c.start,ops:c.ops,axis:S.code.axis,shots:S.code.shots,target:S.code.target,mode:S.code.mode};
}
function howTo(target,gen){
  var py='<li>You need Python 3.10 or later.</li>',
      run='<li>Copy the code into a file named <code>unit1_circuit.py</code> and run it:<pre>python unit1_circuit.py</pre></li>',
      nb='<p class="note">In a notebook, put <code>%'+gen.pip+'</code> in one cell and the code in the next.</p>';
  if(gen.simOnly)return '<ol>'+py+'<li>Install Qiskit and its simulator once, in a terminal:<pre>'+gen.pip+'</pre></li>'+run+'</ol>'+nb;
  if(target==='simulator')return '<ol>'+py+'<li>Install Qiskit once, in a terminal:<pre>'+gen.pip+'</pre></li>'+run+'</ol>'+nb;
  if(target==='fake_device')return '<ol>'+py+'<li>Install Qiskit, its simulator and the IBM client once, in a terminal:<pre>'+gen.pip+'</pre></li>'+run+'</ol>'+nb+
    '<p class="note">FakeManilaV2 holds a snapshot of the measured error rates of a five-qubit IBM device. The simulator uses the snapshot to imitate that device. Everything still runs on your computer.</p>';
  return '<ol>'+py+
    '<li>Create a free account at <a href="https://quantum.cloud.ibm.com" target="_blank" rel="noopener">quantum.cloud.ibm.com</a>. The free Open Plan is enough.</li>'+
    '<li>Create an API key there and copy it.</li>'+
    '<li>Install Qiskit and the IBM client once, in a terminal:<pre>'+gen.pip+'</pre></li>'+
    '<li>Save the key on your computer. Run these two lines once, in Python:<pre>from qiskit_ibm_runtime import QiskitRuntimeService\nQiskitRuntimeService.save_account(token="paste your API key here")</pre>The key works like a password. Keep it out of any file you share or hand in. If Python reports that it cannot find an instance, add <code>instance="your CRN"</code> to the call. The CRN is listed with your instance on the IBM site.</li>'+
    run.replace('</pre></li>','</pre>The script picks the least busy device, sends the job and waits for the result. The wait in the queue can be minutes or hours.</li>')+
    '</ol><p class="note">The Open Plan gives 10 minutes of device time in every 28 days. A job this small should use only a few seconds of it. Source: <a href="https://quantum.cloud.ibm.com/docs/en/guides/plans-overview" target="_blank" rel="noopener">IBM Quantum documentation</a>, October 2026.</p>';
}
function expectHTML(sp,gen){
  var A=CG_AXIS[sp.axis],h='',k=sampleShots(gen.p,sp.shots,hashStr(circuitAscii(sp.start,sp.ops)+sp.axis+sp.shots)),m=sp.shots-k,c=[];
  var onDevice=!gen.simOnly&&gen.target!=='simulator',flat=gen.spread<1e-9,sv=gen.spread.toFixed(gen.spread<0.0095?3:2);
  h+='<p>'+(gen.simOnly?'In the noise model':'Without noise')+': P('+A.p+') = '+pyNum(gen.p)+' and \u27e8'+A.name+'\u27e9 = '+pyNum(gen.e)+'.</p>';
  if(onDevice)h+='<p>'+(flat?'Without noise every shot would give the same outcome.':'With '+count(sp.shots)+' shots, shot noise alone scatters the estimate of \u27e8'+A.name+'\u27e9 by about '+sv+' from one run to the next.')+'</p>';
  else h+='<p>'+(flat?'Every shot gives the same outcome, so the estimate does not scatter.':'With '+count(sp.shots)+' shots, the estimate of \u27e8'+A.name+'\u27e9 scatters around that value by about '+sv+' from one run to the next.')+'</p>';
  if(k)c.push("'0': "+k);if(m)c.push("'1': "+m);
  var out='counts: {'+c.join(', ')+'}\nestimate of P('+A.p+'): '+pyFloat(k/sp.shots)+'\nestimate of <'+A.name+'>: '+pyFloat((k-m)/sp.shots)+'\n'+gen.lines[gen.lines.length-1].t.replace(/^print\("/,'').replace(/"\)$/,'');
  if(!onDevice){
    h+='<p>The output has this form.'+(flat?'':' The counts shown here are an example. The script fixes the seed of the simulator, so your own counts are the same every time you run it. Change the seed to see them scatter.')+'</p><pre>'+esc(out)+'</pre>';
  }else{
    h+='<p>The script first prints the name of the device and the id of the job'+(gen.target==='device'?', then waits in the queue':'')+'. Without noise the rest of the output would look like this:</p><pre>'+esc(out)+'</pre>'+
      '<p>On a device, real or imitated, expect a few percent of the shots on the other outcome. That is noise: imperfect gates, errors in the readout, and decoherence while the circuit runs. Unit 4 takes these apart.</p>';
  }
  return h;
}
function evsHTML(sp,gen){
  var r=gen.r,onDevice=!gen.simOnly&&gen.target!=='simulator',len=Math.sqrt(dot(r,r)),h='';
  var out=evsOutput(gen);
  h+='<p>'+(gen.simOnly?'In the noise model':'Without noise')+': ⟨X⟩ = '+pyNum(r[0])+', ⟨Y⟩ = '+pyNum(r[1])+' and ⟨Z⟩ = '+pyNum(r[2])+'. ';
  if(!gen.simOnly)h+='The vector has length 1, as it does for every pure state.</p>';
  else h+=len<0.99995?'The vector has length '+pyNum(len)+', less than 1: the noise steps have left a mixed state.</p>':'The vector has length 1: the state is still pure.</p>';
  if(!onDevice){
    h+='<p>'+(gen.simOnly?'The simulator computes the values of the model exactly':'StatevectorEstimator computes the values exactly from the state')+', so the output is the same every time:</p><pre>'+esc(out)+'</pre>';
  }else{
    h+='<p>The script first prints the name of the device and the id of the job'+(gen.target==='device'?', then waits in the queue':'')+'. Without noise the rest of the output would look like this:</p><pre>'+esc(out)+'</pre>'+
      '<p>On a device, real or imitated, expect values a little different from these. Gate errors and decoherence tend to shorten the Bloch vector. The Estimator corrects most readout errors by default, and each value is estimated from a finite number of shots, so the values also scatter from one run to the next. A value near +1 or −1 can even land slightly beyond it. Unit 4 takes these apart.</p>';
  }
  return h;
}
function renderCode(){
  var sp=codeSpec(),gen=genQiskit(sp),qa=genQasm(sp),A=CG_AXIS[sp.axis],noisy=gen.simOnly,sh=$('c-shots'),ex=sp.mode==='expect';
  codeNow=gen.text;qasmNow=qa.text;
  $('c-circuit').innerHTML=opsHTML(sp.start,sp.ops,true)+'<span class="gate meas">'+(ex?'⟨X⟩ ⟨Y⟩ ⟨Z⟩':'Measure '+A.name)+'</span>';
  $('c-cnote').textContent=sp.own?'This is the circuit from Explore.':'Explore has no steps yet, so this is an example: H, then S, starting from |0⟩.';
  each($('c-mode').querySelectorAll('input'),function(i){i.checked=i.value===sp.mode;});
  show($('c-axisgroup'),!ex);show($('c-shotsgroup'),!ex);
  each($('c-axis').querySelectorAll('input'),function(i){i.checked=i.value===sp.axis;});
  each($('c-target').querySelectorAll('input'),function(i){i.checked=i.value===gen.target;i.disabled=noisy&&i.value!=='simulator';});
  if(document.activeElement!==sh){sh.value=sp.shots;show($('c-serr'),false);}
  $('c-tnote').textContent=noisy?'This circuit has noise steps. They are a model of noise, so the script runs on a simulator only. Remove the noise steps in Explore to run the circuit on a device.':'';
  show($('c-tnote'),noisy);
  $('c-howto').innerHTML=howTo(gen.target,gen);
  $('c-key').innerHTML=noisy?'<span>A script for a simulator with a noise model</span>':'<span><i class="c"></i>The one line to change</span><span><i class="a"></i>The lines that run with this choice</span>';
  $('c-code').innerHTML=gen.lines.map(function(l){return '<span class="ln'+(l.m?' '+l.m:'')+'">'+esc(l.t)+'\n</span>';}).join('');
  $('c-expect').innerHTML=ex?evsHTML(sp,gen):expectHTML(sp,gen);
  $('c-qasm').innerHTML=qa.text.split('\n').slice(0,-1).map(function(l){return '<span class="ln">'+esc(l)+'\n</span>';}).join('');
  $('c-qnote').textContent='OpenQASM is a plain text format for circuits that many quantum programming tools read.'+(ex?' The observables are not part of the circuit, so the text ends without a measurement.':'')+(qa.skipped?' Noise steps are not part of the language, so '+(qa.skipped===1?'the noise step is':'the '+qa.skipped+' noise steps are')+' left out here.':'');
}
$('c-pauli').innerHTML=PAULI_SNIPPET.split('\n').slice(0,-1).map(function(l){return '<span class="ln">'+esc(l)+'\n</span>';}).join('');
$('c-pout').textContent=PAULI_SNIPPET_OUT.replace(/\n$/,'');
$('c-pcopy').onclick=function(){copyText(PAULI_SNIPPET,$('c-pcopy'),$('c-pauli'));};
$('c-mode').onchange=function(e){var v=e.target.value;if(v==='counts'||v==='expect'){S.code.mode=v;store.save(S);renderCode();}};
$('c-axis').onchange=function(e){if(CG_AXIS[e.target.value]){S.code.axis=e.target.value;store.save(S);renderCode();}};
$('c-target').onchange=function(e){if(CG_TARGETS[e.target.value]){S.code.target=e.target.value;store.save(S);renderCode();}};
$('c-shots').oninput=function(){
  var raw=this.value.trim(),n=Number(raw),er=$('c-serr');
  if(raw===''||!isInt(n,1,10000)){er.textContent='Enter a whole number of shots from 1 to 10,000.';show(er,true);return;}
  show(er,false);if(n!==S.code.shots){S.code.shots=n;store.save(S);renderCode();}
};
$('c-shots').onchange=function(){this.value=S.code.shots;show($('c-serr'),false);};
$('c-copy').onclick=function(){copyText(codeNow,$('c-copy'),$('c-code'));};
$('c-tohow').onclick=function(){var t=$('c-howh');try{t.scrollIntoView({behavior:reducedMotion()?'auto':'smooth',block:'start'});}catch(_){t.scrollIntoView();}};
$('c-qcopy').onclick=function(){copyText(qasmNow,$('c-qcopy'),$('c-qasm'));};

// Explore, Unit 0
var e0=new Plane($('e0-plane'),'A plane with two vectors, a and b. Change the components to move them.');
var E0={a:[2,1],b:[1,2],show:{sum:true,diff:false,proj:false},busy:false};
function e0Load(){E0.a=S.explore0.a.slice();E0.b=S.explore0.b.slice();E0.show=copyOf(S.explore0.show);E0.busy=false;e0.stop();e0Fill();e0Render();}
function e0Save(){S.explore0={a:E0.a.slice(),b:E0.b.slice(),show:copyOf(E0.show)};store.save(S);}
function e0Fill(){
  $('e0-ax').value=nt(E0.a[0]).replace('−','-');$('e0-ay').value=nt(E0.a[1]).replace('−','-');$('e0-bx').value=nt(E0.b[0]).replace('−','-');$('e0-by').value=nt(E0.b[1]).replace('−','-');
  $('e0-sum').checked=E0.show.sum;$('e0-diff').checked=E0.show.diff;$('e0-proj').checked=E0.show.proj;
}
function e0Scene(){
  var a=E0.a,b=E0.b,vs=[{v:a,cls:'ma',label:'a'},{v:b,cls:'mb',label:'b'}],lines=[],marks=[],arcs=[];
  if(E0.show.sum){vs.push({tail:a,v:b,cls:'ghost'});vs.push({v:v2add(a,b),cls:'sum',label:'a + b'});}
  if(E0.show.diff){vs.push({tail:a,v:v2scale(b,-1),cls:'ghost'});vs.push({v:v2sub(a,b),cls:'sum',label:'a − b'});}
  if(E0.show.proj&&v2len(b)>1e-9){var pr=v2proj(a,b),u=v2unit(b);lines.push({a:v2scale(u,-4.3),b:v2scale(u,4.3),cls:'thin'},{a:a,b:pr});marks.push({p:pr,cls:'foot',label:'proj',dx:6,dy:14});vs.push({v:pr,cls:'sum'});}
  if(v2len(a)>1e-9&&v2len(b)>1e-9)arcs.push(arcAB(a,b,0.7,'θ'));
  return {plane:true,vectors:vs,lines:lines,marks:marks,arcs:arcs};
}
function cplx(z){var r=v2len(z);return ct(z)+' = '+f2(r)+' e^(i·'+f2(argDeg(z))+'°)';}
function e0Render(){
  e0.load(e0Scene());e0.draw();
  var a=E0.a,b=E0.b,la=v2len(a),lb=v2len(b),d=v2dot(a,b),ok=la>1e-9&&lb>1e-9,prod=[a[0]*b[0]-a[1]*b[1],a[0]*b[1]+a[1]*b[0]];
  $('e0-vals').innerHTML='<span>|a| = '+f2(la)+'</span><span>|b| = '+f2(lb)+'</span><span>a + b = '+vt(v2add(a,b))+'</span><br>'+
    '<span>a · b = '+f2(d)+'</span><span>θ = '+(ok?f2(v2between(a,b))+'°':'–')+'</span><span>a × b = '+f2(v2cross(a,b))+' along z</span><br>'+
    '<span>projection of a onto b: '+(lb>1e-9?vt(v2proj(a,b))+', length '+f2(d/lb):'–')+'</span><br>'+
    '<span>as complex numbers: a = '+cplx(a)+', b = '+cplx(b)+'</span><br><span>a b = '+cplx(prod)+'</span>';
  if(route==='u0-code')renderCode0();
}
function e0Read(id){var v=parseFloat($(id).value);return v>=-4&&v<=4?Math.round(v*100)/100:null;}
function e0Input(){
  var ax=e0Read('e0-ax'),ay=e0Read('e0-ay'),bx=e0Read('e0-bx'),by=e0Read('e0-by'),er=$('e0-err');
  if(ax===null||ay===null||bx===null||by===null){er.textContent='Enter components between −4 and 4.';show(er,true);return;}
  show(er,false);if(E0.busy)return;
  E0.a=[ax,ay];E0.b=[bx,by];e0Render();e0Save();
}
['e0-ax','e0-ay','e0-bx','e0-by'].forEach(function(id){$(id).oninput=e0Input;$(id).onchange=function(){if(e0Read(id)===null)e0Fill();};});
['sum','diff','proj'].forEach(function(k){$('e0-'+k).onchange=function(){if(E0.busy){this.checked=E0.show[k];return;}E0.show[k]=this.checked;e0Render();e0Save();};});
$('e0-rotate').onclick=function(){
  var er=$('e0-rerr'),d=Math.round(parseFloat($('e0-angle').value)*100)/100,a0=E0.a.slice();
  if(!(d>=-360&&d<=360)||d===0){er.textContent='Enter an angle between −360 and 360 degrees, not zero.';show(er,true);return;}
  var a1=v2rot(a0,d);a1=[Math.round(a1[0]*100)/100,Math.round(a1[1]*100)/100];
  if(Math.abs(a1[0])>4||Math.abs(a1[1])>4){er.textContent='The turned arrow would leave the grid. Shorten a first.';show(er,true);return;}
  if(E0.busy||v2len(a0)<1e-9)return;
  show(er,false);E0.busy=true;
  var base=e0Scene();e0.load(base);
  e0.animateFn(function(e){var N=24,seg=[],upto=Math.round(e*N);for(var j=0;j<=upto;j++)seg.push(v2rot(a0,d*j/N));return {state:v2rot(a0,d*e),trail:[seg],vectors:[]};},reducedMotion()?0:400+Math.abs(d)*4,function(){E0.busy=false;E0.a=a1;e0Fill();e0Render();e0Save();});
};
$('e0-swap').onclick=function(){if(E0.busy)return;var t=E0.a;E0.a=E0.b;E0.b=t;e0Fill();e0Render();e0Save();};

// Code, Unit 0
var code0Now='';
function renderCode0(){
  var g=genNumpy(E0.a,E0.b);code0Now=g.text;
  $('c0-code').innerHTML=g.text.split('\n').slice(0,-1).map(function(l){return '<span class="ln">'+esc(l)+'\n</span>';}).join('');
  $('c0-expect').textContent=g.out;
  $('c0-note').textContent='a = '+vt(E0.a)+' and b = '+vt(E0.b)+', the vectors from Explore.';
}
$('c0-copy').onclick=function(){copyText(code0Now,$('c0-copy'),$('c0-code'));};
function enterExplore0(){e0.draw();}

// Goals
function renderGoals(){
  var h='';
  $('g-lead').textContent=U().goalsLead;$('g-prereq').textContent=U().prereq;
  U().goals.forEach(function(g){
    var ids=[],right=0,miss=0,dn=0,dq=[];
    g.concepts.forEach(function(c){ids=ids.concat(CONCEPT_ITEMS[c]||[]);});
    ids.forEach(function(id){var m=markOf(id);if(m==='miss')miss++;else if(m)right++;});
    U().discuss.forEach(function(q,j){if(g.concepts.indexOf(q.concept)<0)return;dq.push(j);var d=S.discuss[q.id];if(d&&d.final!=null)dn++;});
    h+='<li><div><h3>'+esc(g.short)+'</h3><p class="gt">'+esc(g.text)+'</p>'+
      '<p class="gp"><span>Practice: '+right+' of '+ids.length+' right'+(miss?', '+miss+' to revisit':'')+pipsFor(ids)+'</span>'+
      '<span>Discuss: '+dn+' of '+dq.length+' answered</span>'+
      '<button type="button" class="link" data-pg="'+g.group+'">Practice '+GROUPS[g.group].name.toLowerCase()+'</button>'+
      '<button type="button" class="link" data-dq="'+dq[0]+'">Discuss</button></p></div></li>';
  });
  $('g-list').innerHTML=h;
}
$('g-list').onclick=function(e){
  var b=closest(e.target,'button');if(!b)return;
  if(b.hasAttribute('data-pg')){US().group=b.getAttribute('data-pg');pDirty=true;store.save(S);go(UID+'-practice',true);}
  else if(b.hasAttribute('data-dq')){US().dq=parseInt(b.getAttribute('data-dq'),10);dDirty=true;store.save(S);go(UID+'-discuss',true);}
};

// Start here
var startBuilt={};
function buildStart(){
  var toc='',body=document.createElement('div'),figs=[],u=UID;
  body.id='s-body-'+u;$('s-body').appendChild(body);
  U().intro.forEach(function(sec){
    toc+='<button type="button" class="link" data-sec="'+sec.id+'">'+esc(sec.title)+'</button>';
    var el=document.createElement('section'),h;
    el.className='lesson'+(sec.fig?'':' wide');el.id='sec-'+sec.id;el.setAttribute('data-unit',u);
    h='<div>'+(sec.kind?'<p class="kind">'+esc(sec.kind)+'</p>':'')+'<h3>'+esc(sec.title)+'</h3>';
    if(sec.task)h+='<p class="task">'+sec.task+'</p><ol class="worked">'+sec.steps.map(function(s){return '<li>'+s+'</li>';}).join('')+'</ol>';
    if(sec.html)h+=sec.html;
    if(sec.after)h+=sec.after;
    h+='</div>';
    if(sec.fig)h+='<figure class="fig"><div id="s-fig-'+sec.id+'"></div><figcaption>'+esc(sec.fig.cap)+(sec.fig.play?'<div class="row"><button type="button" class="ghost" id="s-play-'+sec.id+'">Play</button></div>':'')+'</figcaption></figure>';
    el.innerHTML=h;body.appendChild(el);
    if(!sec.fig)return;
    var sp=sec.fig.plane?new Plane($('s-fig-'+sec.id),'Figure for the section '+sec.title+'. '+sec.fig.cap):new Sphere($('s-fig-'+sec.id),'Figure for the section '+sec.title+'. '+sec.fig.cap);
    sp.load(sec.fig.scene());sp.draw();figs.push(sp);
    if(sec.fig.play){
      var btn=$('s-play-'+sec.id);
      btn.onclick=function(){btn.disabled=true;sp.load(sec.fig.scene());sec.fig.play(sp,function(){btn.disabled=false;btn.textContent='Play again';});};
    }
  });
  startBuilt[u]={body:body,toc:toc,figs:figs};
}
$('s-toc').onclick=function(e){
  var b=closest(e.target,'button[data-sec]');if(!b)return;
  var t=$('sec-'+b.getAttribute('data-sec'));
  try{t.scrollIntoView({behavior:reducedMotion()?'auto':'smooth',block:'start'});}catch(_){t.scrollIntoView();}
};
function enterStart(){
  if(!startBuilt[UID])buildStart();
  var b=startBuilt[UID];
  UNIT_ORDER.forEach(function(u){if(startBuilt[u])startBuilt[u].body.hidden=u!==UID;});
  $('s-toc').innerHTML=b.toc;$('s-lead').textContent=U().startLead;
  b.figs.forEach(function(sp){sp.draw();});
  if(!S.seenStart[UID]){S.seenStart[UID]=true;store.save(S);}
}

// Home
var hs=null;
function homeScene(){
  hs.load({state:[0,1,0],ghost:[0,0,1],trail:[arcPath(NAMED.H.axis,PI,[0,0,1]),arcPath(AX.z,PI/2,[1,0,0])]});hs.draw();
}
function renderHome(){
  if(!hs){hs=new Sphere($('h-sphere'),'Bloch sphere. The state moves from |0⟩ to |+⟩ under H, then on to |+i⟩ under S.');homeScene();}
  else hs.draw();
  var a=attempts(),d=0,due=0,dueUnit=null,h,st=[],lu=S.lastUnit;
  UNIT_ORDER.forEach(function(u){d+=discussed(u);var n=reviewLeft(u);if(n&&!dueUnit){dueUnit=u;due=n;}});
  if(!a&&!d){
    h=S.seenStart.u0?link('primary','u0-practice','Go to practice')+link('ghost','u0-start','Read the introduction again')
                    :link('primary','u0-start','Start here')+link('ghost','u1-goals','Skip to Unit 1');
    st='Units 0 and 1 are open. Unit 0 is the geometry of arrows and phases. Unit 1 is the qubit on the Bloch sphere. Students who already know vectors and complex numbers can start with Unit 1.';
  }else{
    h=(due?'<button type="button" class="primary" id="h-review">Review '+plural(due,'item','items')+'</button>'+link('ghost',lu+'-practice','Continue practice'):link('primary',lu+'-practice','Continue practice'))+
      link('ghost',lu+'-discuss','Discuss')+link('ghost',lu+'-goals','Your progress');
    UNIT_ORDER.forEach(function(u){
      var n=attempts(u),dn=discussed(u),miss=0,id;
      if(!n&&!dn)return;
      for(id in S.items)if(ITEM_UNIT[id]===u&&markOf(id)==='miss')miss++;
      st.push('Unit '+UNITS[u].n+': '+n+' of '+UNIT_N[u]+' practice items answered'+(miss?', '+miss+' to revisit':'')+'. '+dn+' of '+UNITS[u].discuss.length+' discussion questions answered.');
    });
    st=st.join(' ');
  }
  $('h-cta').innerHTML=h;$('h-status').textContent=st;
  if($('h-review'))$('h-review').onclick=function(){S.units[dueUnit].group='R';pDirty=true;store.save(S);go(dueUnit+'-practice',true);};
}
$('h-play').onclick=function(){
  if(!hs)return;
  hs.load({state:[0,0,1],ghost:[0,0,1]});
  hs.animate([{from:[0,0,1],axis:NAMED.H.axis,angle:PI,hint:{axis:NAMED.H.axis}},{from:[1,0,0],axis:AX.z,angle:PI/2,hint:{axis:AX.z}}],function(){hs.hint=null;hs.state=[0,1,0];hs.draw();});
};
function renderMap(){
  var h='';
  COURSE.units.forEach(function(u){
    var uid=u.open&&u.go?u.go.split('-')[0]:null,pr=uid?partRoutes(uid):[];
    h+='<div class="unit'+(u.open?' open':'')+'"><div class="un">'+esc(u.n)+'</div><div class="ub"><h3>'+(u.go?'<a href="#'+u.go+'" data-go="'+u.go+'">'+esc(u.title)+'</a>':esc(u.title))+'</h3><p>'+esc(u.line)+'</p>';
    if(uid)h+='<div class="parts">'+COURSE.parts.map(function(p,i){return '<a href="#'+pr[i]+'" data-go="'+pr[i]+'">'+esc(p[0])+'</a>';}).join('')+'</div>';
    if(u.plan)h+='<details><summary>Planned contents</summary><ul>'+u.plan.map(function(x){return '<li>'+esc(x)+'</li>';}).join('')+'</ul></details>';
    h+='</div><div class="us">'+(u.open?'Open':u.n==='R'?'Topics in preparation':'In preparation')+'</div></div>';
  });
  $('h-map').innerHTML=h;$('u-map').innerHTML=h;
  $('h-parts').innerHTML=COURSE.parts.map(function(p){return '<dt>'+esc(p[0])+'</dt><dd>'+esc(p[1])+'</dd>';}).join('');
}

// About
function csv(){
  var cols=['t','item','concept','level','type','answer','tag','retry','review','explanation'];
  return [cols.join(',')].concat(S.log.map(function(r){return cols.map(function(c){
    var v=r[c]==null?'':String(r[c]);
    if(c==='explanation'&&/^[=+\-@]/.test(v))v="'"+v;
    return /[",\n]/.test(v)?'"'+v.replace(/"/g,'""')+'"':v;
  }).join(',');})).join('\n');
}
function renderAbout(){
  $('v-clearnote').textContent='';
  $('v-gen').textContent=count(COUNTS.one)+' single-gate and '+count(COUNTS.two)+' two-gate items';
  var seen={},rows=[];
  Object.keys(TAGINFO).forEach(function(t){var i=TAGINFO[t];if(t==='unclassified'||seen[i[0]])return;seen[i[0]]=1;rows.push(i);});
  $('v-tags').innerHTML='<thead><tr><th>Tag</th><th>The student\u2019s answer matches</th><th>Reported in</th></tr></thead><tbody>'+rows.map(function(r){return '<tr><td>'+esc(r[0])+'</td><td>'+esc(r[1])+'</td><td>'+esc(r[2])+'</td></tr>';}).join('')+'</tbody>';
  var drows='';
  UNIT_ORDER.forEach(function(u){UNITS[u].discuss.forEach(function(q,j){drows+='<tr><td>'+UNITS[u].n+'.'+(j+1)+'</td><td>'+esc(q.title)+'</td><td>'+q.concept+' '+esc(CONCEPTS[q.concept])+'</td><td>'+esc(q.src||'')+'</td></tr>';});});
  $('v-discuss').innerHTML='<thead><tr><th>Unit, no.</th><th>Question</th><th>Idea</th><th>Based on</th></tr></thead><tbody>'+drows+'</tbody>';
  $('v-checks').innerHTML=selfChecks0().concat(selfChecks(),selfChecks2(),selfChecks3()).map(function(c){return '<li'+(c.ok?'':' class="bad"')+'>'+esc(c.name)+(c.ok?'':' (failed)')+'</li>';}).join('');
  $('v-log').value=S.log.length?csv():'No responses yet.';
}
$('v-copy').onclick=function(){copyText($('v-log').value,$('v-copy'),$('v-log'));};
twoStep($('v-clear'),'Clear my data','Click again to erase everything',function(){
  store.clear();S=fresh();ps.stop();dsp.stop();pDirty=true;dDirty=true;cur=null;phase='idle';
  es.stop();E.busy=false;E.start='zero';E.ops=[];eRecompute();eRender();$('e-mout').textContent='';show($('e-serr'),false);
  e0Load();
  renderAbout();$('v-clearnote').textContent='Cleared.';
});

// Routes
var route=null;
var ENTER={'home':renderHome,'units':renderUnits,'goals':renderGoals,'start':enterStart,'practice':enterPractice,'discuss':enterDiscuss,
  'explore':function(){es.draw();},'code':renderCode,'explore0':enterExplore0,'code0':renderCode0,'about':renderAbout};
function resolveRoute(r){
  var m=/^(u\d)$/.exec(r);
  if(m&&UNITS[m[1]])return S.units[m[1]].tab;
  if(r.indexOf('unit-')===0){var t=(route&&/^u\d-/.test(route)?UID:S.lastUnit)+'-'+r.slice(5);return ROUTES.indexOf(t)>=0?t:'home';}
  if(r==='practice'||r==='explore')return 'u1-'+r;
  if(r==='evidence')return 'about';
  return ROUTES.indexOf(r)>=0?r:'home';
}
function setUnit(u){
  if(u===UID&&$('unit-tabs').children.length)return;
  UID=u;var d=UNITS[u];
  $('unit-title').innerHTML='<span>Unit '+esc(d.n)+'</span><h1>'+esc(d.title)+'</h1>';
  $('unit-tabs').setAttribute('aria-label','Parts of unit '+d.n);
  $('unit-tabs').innerHTML=PARTS.map(function(p,i){return '<a href="#'+u+'-'+p+'" data-go="'+u+'-'+p+'" data-nav="'+u+'-'+p+'">'+esc(COURSE.parts[i][0])+'</a>';}).join('');
}
function go(r,push){
  r=resolveRoute(r);
  var um=/^(u\d)-/.exec(r),inUnit=!!um,changed=r!==route;
  if(inUnit)setUnit(um[1]);
  route=r;
  VIEWS.forEach(function(v){show($('view-'+v),VIEW[r]===v);});
  show($('unit-head'),inUnit);
  each(document.querySelectorAll('[data-nav]'),function(a){
    var n=a.getAttribute('data-nav');
    if(n===r||(n==='units'&&(inUnit||r==='units')))a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');
  });
  if(inUnit&&(US().tab!==r||S.lastUnit!==UID)){US().tab=r;S.lastUnit=UID;store.save(S);}
  if(ENTER[VIEW[r]])ENTER[VIEW[r]]();
  if(push&&changed){
    try{history.pushState(null,'','#'+r);}catch(e){try{location.hash=r;}catch(e2){}}
    try{window.scrollTo(0,0);}catch(e3){}
  }
}
document.addEventListener('click',function(e){
  var a=closest(e.target,'[data-go]');
  if(!a||e.defaultPrevented||e.button||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey)return;
  e.preventDefault();go(a.getAttribute('data-go'),true);
});
function fromHash(){var r=resolveRoute((location.hash||'').slice(1));if(r!==route)go(r,false);}
window.addEventListener('popstate',fromHash);
window.addEventListener('hashchange',fromHash);

window.addEventListener('storage',function(e){
  if(e.key!==KEY)return;
  var s=null;try{s=JSON.parse(e.newValue);}catch(_){}
  S=s&&s.v===3?repair(s):fresh();
  ps.stop();dsp.stop();es.stop();cur=null;phase='idle';pDirty=true;dDirty=true;
  E.busy=false;E.start=S.explore.start;E.ops=S.explore.ops.slice();eRecompute();eRender();$('e-mout').textContent='';
  e0Load();
  if(ENTER[VIEW[route]])ENTER[VIEW[route]]();
});

function renderUnits(){}
renderMap();eRecompute();eRender();e0Load();
go((location.hash||'').slice(1)||'home',false);
})();
