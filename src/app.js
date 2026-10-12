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
var ITEM=Object.create(null),ITEM_GROUP=Object.create(null),CONCEPT_ITEMS=Object.create(null),N_ITEMS=0;
GROUP_ORDER.forEach(function(k){GROUPS[k].starter.forEach(function(it){
  ITEM[it.id]=it;ITEM_GROUP[it.id]=k;(CONCEPT_ITEMS[it.concept]||(CONCEPT_ITEMS[it.concept]=[])).push(it.id);N_ITEMS++;
});});
var ROUTES=['home','u1-goals','u1-start','u1-practice','u1-discuss','u1-explore','u1-code','research','about'];
var VIEW={'home':'home','u1-goals':'goals','u1-start':'start','u1-practice':'practice','u1-discuss':'discuss','u1-explore':'explore','u1-code':'code','research':'research','about':'about'};
var PART_ROUTE=['u1-goals','u1-start','u1-practice','u1-discuss','u1-explore','u1-code'];
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
function freshPractice(){var g={};GROUP_ORDER.forEach(function(k){g[k]=freshGroup(k);});return {group:'S',groups:g,items:{},free:{},tags:{},review:{day:-1,queue:[],pos:0}};}
function fresh(){
  var p=freshPractice();
  return {v:3,seed:20261006,group:p.group,groups:p.groups,items:p.items,free:p.free,tags:p.tags,review:p.review,log:[],
    discuss:{},dq:0,explore:{start:'zero',ops:[]},code:{axis:'y',shots:1000,target:'simulator'},unitTab:'u1-goals',seenStart:false};
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
  for(k in f)out[k]=(s[k]==null||typeof s[k]!==typeof f[k]||Array.isArray(s[k])!==Array.isArray(f[k]))?f[k]:s[k];
  if(!isFinite(out.seed))out.seed=f.seed;
  out.seed|=0;out.seenStart=!!out.seenStart;
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
  if(GROUP_ORDER.indexOf(out.group)<0&&out.group!=='R')out.group='S';
  var rv=out.review;
  if(!Array.isArray(rv.queue)||!isInt(rv.day,-1e7,1e7))out.review={day:-1,queue:[],pos:0};
  else{
    var rq=rv.queue.filter(function(q){return q&&typeof q==='object'&&typeof q.id==='string'&&ITEM[q.id]&&items[q.id];}).slice(0,60).map(cleanEntry);
    out.review={day:rv.day,queue:rq,pos:isInt(rv.pos,0,rq.length)?rv.pos:rq.length};
  }
  var dis={};
  DISCUSS.forEach(function(q){
    var d=has(out.discuss,q.id)?out.discuss[q.id]:null,n=q.options.length-1;
    if(d&&typeof d==='object'&&isInt(d.first,0,n)&&(d.final==null||isInt(d.final,0,n)))dis[q.id]={first:d.first,final:d.final==null?null:d.final};
  });
  out.discuss=dis;
  out.dq=isInt(out.dq,0,DISCUSS.length-1)?out.dq:0;
  var free={},tags={};
  for(k in CONCEPTS){r=has(out.free,k)?out.free[k]:null;if(r&&typeof r==='object'&&isInt(r.n,0,1e7)&&isInt(r.c,0,1e7))free[k]={n:r.n,c:r.c};}
  for(k in out.tags)if(has(out.tags,k)&&has(TAGINFO,k.split('+')[0])&&isInt(out.tags[k],1,1e7))tags[k]=out.tags[k];
  out.free=free;out.tags=tags;
  out.log=out.log.filter(function(row){return row&&typeof row==='object'&&!Array.isArray(row);}).slice(-1500);
  var ex=out.explore;
  out.explore=(typeof ex.start==='string'&&has(STARTS,ex.start)&&Array.isArray(ex.ops)&&ex.ops.length<=24&&ex.ops.every(opValid))?{start:ex.start,ops:ex.ops.map(cleanOp)}:{start:'zero',ops:[]};
  var c=out.code;
  out.code={axis:typeof c.axis==='string'&&has(CG_AXIS,c.axis)?c.axis:'y',shots:isInt(c.shots,1,10000)?c.shots:1000,target:typeof c.target==='string'&&has(CG_TARGETS,c.target)?c.target:'simulator'};
  if(PART_ROUTE.indexOf(out.unitTab)<0)out.unitTab='u1-goals';
  return out;
}
function migrate(o){
  var s=fresh(),out;
  try{
    if(!o||typeof o!=='object'||o.v!==2||!o.groups||typeof o.groups!=='object')return s;
    GROUP_ORDER.forEach(function(k){if(has(o.groups,k))s.groups[k]=o.groups[k];});
    if(GROUP_ORDER.indexOf(o.group)>=0)s.group=o.group;
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
function attempts(){var n=0,k;for(k in S.items)if(S.items[k].n)n++;return n;}
function discussed(){var n=0;DISCUSS.forEach(function(q){var d=S.discuss[q.id];if(d&&d.final!=null)n++;});return n;}
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
var ps=new Sphere($('p-sphere'),'Bloch sphere. Click to place your prediction. Drag to turn the view.');
var cur=null,phase='idle',cls=null,resp=null,curLog=null,pDirty=true;
function G(){return S.groups[S.group];}
function dueIds(){
  var d=today(),out=[],id,r;
  for(id in S.items){r=S.items[id];if(ITEM[id]&&r.n>0&&r.due<=d&&r.day<d)out.push(id);}
  return out;
}
function buildReview(){
  var d=today(),ids=dueIds();
  ids.sort(function(a,b){var x=S.items[a],y=S.items[b];return (x.box?1:0)-(y.box?1:0)||x.due-y.due||hashStr(a+':'+d)-hashStr(b+':'+d);});
  S.review={day:d,queue:ids.slice(0,12).map(function(id){return {id:id};}),pos:0};
}
function reviewLeft(){
  var rv=S.review,n=dueIds().length,i;
  if(rv.day===today())for(i=rv.pos;i<rv.queue.length;i++)if(rv.queue[i].retry)n++;
  return n;
}
function nextDue(){
  var d=today(),best=null,n=0,id,r,e;
  for(id in S.items){
    r=S.items[id];if(!ITEM[id]||!r.n)continue;
    e=Math.max(r.due,r.day+1);if(e<=d)continue;
    if(best===null||e<best){best=e;n=1;}else if(e===best)n++;
  }
  return best===null?null:{days:best-d,n:n};
}
function currentItem(){
  var q,it,c;
  if(S.group==='R'){
    var rv=S.review,d=today();
    if(rv.day!==d){buildReview();store.save(S);rv=S.review;}
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
  return GROUPS[S.group].gen(g.freeN,S.seed);
}
function renderGroups(){
  var h='',n=reviewLeft();
  GROUP_ORDER.forEach(function(k){
    var g=S.groups[k],st=g.mode==='free'?'more practice':g.pos>=g.queue.length?'done':g.pos?g.pos+' of '+g.queue.length+' done':'';
    h+='<button type="button" data-g="'+k+'"'+(k===S.group?' aria-current="true"':'')+'>'+GROUPS[k].name+(st?'<small>'+st+'</small>':'')+'</button>';
  });
  h+='<button type="button" data-g="R"'+(S.group==='R'?' aria-current="true"':'')+'>Review'+(n?'<small>'+n+' due</small>':'')+'</button>';
  $('p-groups').innerHTML=h;
}
$('p-groups').onclick=function(e){
  var b=closest(e.target,'button[data-g]');if(!b)return;
  S.group=b.getAttribute('data-g');store.save(S);renderItem();
};
function predictControls(R){
  if(R.mode==='point'||R.mode==='slice')return '<p class="readout" id="p-read">No point placed yet.</p>';
  if(R.mode==='number')return '<p class="field"><label for="p-num">'+esc(R.numLabel)+' =</label><input type="number" id="p-num" min="0" max="1" step="0.01" inputmode="decimal" placeholder="0.50"></p>';
  if(R.mode==='multi')return '<div class="opts row2" id="p-opts" role="group" aria-label="Measurements">'+R.options.map(function(o){return '<label><input type="checkbox" value="'+o.k+'"> '+esc(o.t)+'</label>';}).join('')+'<label><input type="checkbox" value="none"> '+esc(R.noneText)+'</label></div>';
  return '<div class="opts" id="p-opts" role="radiogroup" aria-label="Answers">'+R.options.map(function(o,i){return '<label><input type="radio" name="p-choice" value="'+i+'"> <span>'+esc(o.t)+'</span></label>';}).join('')+'</div>';
}
function renderItem(){
  pDirty=false;
  show($('p-intro'),!S.seenStart&&!attempts());
  var it=currentItem();
  renderGroups();
  if(!it){renderSummary();return;}
  var R=buildItem(it),rv=S.group==='R',g=rv?S.review:G();cur=R;phase='predict';cls=null;resp=null;curLog=null;
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
  show($('p-resetview'),R.mode!=='slice');show($('p-flatnote'),R.mode==='slice');
  renderStrip();
}
ps.onPlace=function(p){
  if(phase!=='predict'||!cur)return;
  ps.pred=p;ps.draw();$('p-read').textContent='Your point: '+cur.respText(p)+'.';show($('p-lockerr'),false);
};
function readResponse(){
  var R=cur,e=null,v=null;
  if(R.mode==='point'||R.mode==='slice'){v=ps.pred;if(!v)e=R.mode==='slice'?'Place a point in the circle first.':'Place a point on the sphere first.';}
  else if(R.mode==='number'){var raw=$('p-num').value.trim();v=parseFloat(raw);if(raw===''||!(v>=0&&v<=1)){v=null;e='Type a number between 0 and 1.';}}
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
  var it=R.item,ok=c.tag==='correct',rv=S.group==='R',Q=rv?S.review:G(),starter=!!ITEM[it.id];
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
  GROUP_ORDER.forEach(function(k){GROUPS[k].concepts.forEach(function(c){
    h+='<div class="c"><b>'+c+'</b>'+esc(CONCEPTS[c])+pipsFor(CONCEPT_ITEMS[c])+'</div>';
  });});
  h+='<div class="striptools"><span><span class="pip ok"></span>Right on the first try</span><span><span class="pip rec"></span>Right after a miss</span><span><span class="pip miss"></span>Missed on the last try</span><span><span class="pip"></span>Not tried yet</span><button type="button" class="link" id="p-restart">Start over</button></div>';
  $('p-strip').innerHTML=h;
  twoStep($('p-restart'),'Start over','Click again to reset your practice progress',function(){
    var p=freshPractice();S.group=p.group;S.groups=p.groups;S.items=p.items;S.free=p.free;S.tags=p.tags;S.review=p.review;store.save(S);renderItem();
  });
}
function renderSummary(){
  cur=null;phase='idle';curLog=null;
  ps.load({state:[0,0,1]});ps.setPlacing(false);ps.draw();show($('p-numbers'),false);show($('p-resetview'),true);show($('p-flatnote'),false);
  $('p-head').removeAttribute('data-item');$('p-head').removeAttribute('data-level');
  if(S.group==='R'){reviewSummary();renderStrip();return;}
  var def=GROUPS[S.group],low=def.name.toLowerCase(),n=0,c=0,rec=0,miss=0;
  def.starter.forEach(function(it){var r=S.items[it.id];if(!r||!r.n)return;n++;if(r.first)c++;var m=markOf(it.id);if(m==='rec')rec++;else if(m==='miss')miss++;});
  var top=Object.keys(S.tags).sort(function(a,b){return S.tags[b]-S.tags[a];})[0];
  var ni=GROUP_ORDER.indexOf(S.group)+1,next=ni<GROUP_ORDER.length?GROUP_ORDER[ni]:null;
  $('p-head').innerHTML=
    '<p class="meta"><span>'+def.name+'</span><span>Starter set complete</span></p>'+
    '<p class="prompt">You finished the starter set on '+low+'. Right on the first try: '+c+' of '+n+'.</p>'+
    (rec||miss?'<p class="note">'+(rec?'Right after a miss: '+rec+'. ':'')+(miss?'Missed on the last try: '+miss+'.':'')+'</p>':'')+
    (top?'<p class="note">Most frequent slip so far: '+esc(tagName(top).toLowerCase())+', '+plural(S.tags[top]|0,'time','times')+'.</p>':'')+
    '<p class="note">These items come back under Review. Missed items return tomorrow, the others in 3 days.</p>';
  $('p-steps').innerHTML=
    '<div class="row" style="margin-top:18px">'+(next?'<button type="button" class="primary" id="p-nextgroup">Go on to '+GROUPS[next].name.toLowerCase()+'</button>':link('primary','u1-discuss','Go on to the discussion questions'))+'<button type="button" class="ghost" id="p-more">More practice on '+low+'</button></div>'+
    (S.group==='G'?'<p class="note">More practice on gates draws from '+count(COUNTS.one)+' single-gate and '+count(COUNTS.two)+' two-gate items, without hints.</p>':'<p class="note">More practice items are generated without hints.</p>');
  $('p-more').onclick=function(){G().mode='free';store.save(S);renderItem();};
  if(next)$('p-nextgroup').onclick=function(){S.group=next;store.save(S);renderItem();};
  renderStrip();
}
function reviewSummary(){
  var more=dueIds().length,nx=nextDue(),done=S.review.day===today()&&S.review.queue.length>0,h,b,open=null;
  GROUP_ORDER.forEach(function(k){var g=S.groups[k];if(open===null&&g.mode==='starter'&&g.pos<g.queue.length)open=k;});
  var onward=open?'<button type="button" class="'+(more?'ghost':'primary')+'" id="p-togroup">'+(attempts()?'Continue with ':'Begin with ')+GROUPS[open].name.toLowerCase()+'</button>':link(more?'ghost':'primary','u1-discuss','Go to the discussion questions');
  if(!attempts()){
    h='<p class="prompt">Nothing to review yet.</p><p class="note">Items you answer in the four topics come back here. Missed items return the next day, the others after 3 days, then after 7, 14 and 30 days. Review items come without hints.</p>';
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
  if($('p-togroup'))$('p-togroup').onclick=function(){S.group=open;store.save(S);renderItem();};
}
function setupNumbers(R){
  var box=$('p-numbers'),on=R.mode==='point'||R.mode==='slice';show(box,on);if(!on)return;
  var slice=R.mode==='slice';
  $('p-n1l').firstChild.nodeValue=slice?'across ':'θ ';$('p-n2l').firstChild.nodeValue=slice?'up ':'φ ';
  var a=$('p-n1'),b=$('p-n2');a.value='';b.value='';
  a.min=slice?-1:0;a.max=slice?1:180;a.step=slice?0.05:1;a.placeholder=slice?'0.5':'90';
  b.min=slice?-1:0;b.max=slice?1:360;b.step=slice?0.05:1;b.placeholder=slice?'0.5':'45';
  show($('p-angerr'),false);
}
$('p-resetview').onclick=function(){ps.resetView();};
$('p-placeangles').onclick=function(){
  var e=$('p-angerr'),a=parseFloat($('p-n1').value),b=parseFloat($('p-n2').value);
  if(phase!=='predict'||!cur){e.textContent='This item is already locked in.';show(e,true);return;}
  if(cur.mode==='slice'){
    if(!(a>=-1&&a<=1)||!(b>=-1&&b<=1)||Math.hypot(a,b)>1.0001){e.textContent='Enter two numbers between −1 and 1 that lie inside the circle.';show(e,true);return;}
    show(e,false);ps.onPlace(add(scale(ps.slice.u,a),scale(ps.slice.w,b)));return;
  }
  if(!(a>=0&&a<=180)||!(b>=0&&b<=360)){e.textContent='Enter θ from 0 to 180 and φ from 0 to 360, in degrees.';show(e,true);return;}
  show(e,false);ps.onPlace(fromAngles(a,b));
};
function enterPractice(){
  if(pDirty||phase==='idle')renderItem();
  else{show($('p-intro'),!S.seenStart&&!attempts());renderGroups();ps.draw();}
}

// Discuss
var dsp=new Sphere($('d-sphere'),'Figure for the discussion question.');
var dDirty=true;
function dOptions(q,name){
  return '<div class="opts" role="radiogroup" aria-label="Answers" id="'+name+'">'+q.options.map(function(o,i){
    return '<label><input type="radio" name="'+name+'" value="'+i+'"> <span class="letter">'+LET[i]+'</span><span>'+esc(o.t)+'</span></label>';
  }).join('')+'</div>';
}
function renderDiscuss(){
  dDirty=false;
  var q=DISCUSS[S.dq],D=S.discuss[q.id]||{first:null,final:null},st=D.final!=null?3:D.first!=null?2:1,h='';
  GROUP_ORDER.forEach(function(k){
    h+='<span class="qg"><span>'+GROUPS[k].name+'</span>';
    DISCUSS.forEach(function(x,j){
      if(GROUPS[k].concepts.indexOf(x.concept)<0)return;
      var d=S.discuss[x.id],s=d&&d.final!=null?(x.options[d.final].ok?'ok':'no'):'';
      h+='<button type="button" data-q="'+j+'"'+(s?' class="'+s+'"':'')+(j===S.dq?' aria-current="true"':'')+' aria-label="Question '+(j+1)+': '+esc(x.title)+(s==='ok'?'. Answered, your final answer holds':s==='no'?'. Answered, your final answer does not hold':'')+'">'+(j+1)+'</button>';
    });
    h+='</span>';
  });
  $('d-nav').innerHTML=h;
  var sc=q.scene?q.scene():null;
  $('d-stage').classList.toggle('nofig',!sc);
  if(sc){dsp.load(sc);dsp.draw();$('d-cap').textContent=sc.slice?'A cross-section through the x and z axes.':'Drag the figure to turn it.';show($('d-resetview'),!sc.slice);}
  else dsp.stop();
  show($('d-replay'),!!sc&&!!q.reveal&&st===3);
  h='<p class="meta"><span>'+esc(CONCEPTS[q.concept])+'</span><span>Question '+(S.dq+1)+' of '+DISCUSS.length+'</span></p>';
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
      var n=DISCUSS.length,j=(S.dq+1)%n,i,c,d;
      for(i=1;i<=n;i++){c=(S.dq+i)%n;d=S.discuss[DISCUSS[c].id];if(!d||d.final==null){j=c;break;}}
      S.dq=j;store.save(S);renderDiscuss();toTop($('d-nav'));
    };
    $('d-redo').onclick=function(){delete S.discuss[q.id];store.save(S);renderDiscuss();};
  }
  $('d-copy').onclick=function(){copyText(poll,$('d-copy'),$('d-poll'));};
}
$('d-nav').onclick=function(e){
  var b=closest(e.target,'button[data-q]');if(!b)return;
  S.dq=parseInt(b.getAttribute('data-q'),10);store.save(S);renderDiscuss();
};
$('d-resetview').onclick=function(){dsp.resetView();};
$('d-replay').onclick=function(){var q=DISCUSS[S.dq];if(q.reveal)q.reveal(dsp,function(){});};
function enterDiscuss(){if(dDirty)renderDiscuss();else dsp.draw();}

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
  return {own:own,start:c.start,ops:c.ops,axis:S.code.axis,shots:S.code.shots,target:S.code.target};
}
function pyFloat(x){return Number.isInteger(x)?x.toFixed(1):String(x);}
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
function renderCode(){
  var sp=codeSpec(),gen=genQiskit(sp),qa=genQasm(sp),A=CG_AXIS[sp.axis],noisy=gen.simOnly,sh=$('c-shots');
  codeNow=gen.text;qasmNow=qa.text;
  $('c-circuit').innerHTML=opsHTML(sp.start,sp.ops,true)+'<span class="gate meas">Measure '+A.name+'</span>';
  $('c-cnote').textContent=sp.own?'This is the circuit from Explore.':'Explore has no steps yet, so this is an example: H, then S, starting from |0⟩.';
  each($('c-axis').querySelectorAll('input'),function(i){i.checked=i.value===sp.axis;});
  each($('c-target').querySelectorAll('input'),function(i){i.checked=i.value===gen.target;i.disabled=noisy&&i.value!=='simulator';});
  if(document.activeElement!==sh){sh.value=sp.shots;show($('c-serr'),false);}
  $('c-tnote').textContent=noisy?'This circuit has noise steps. They are a model of noise, so the script runs on a simulator only. Remove the noise steps in Explore to run the circuit on a device.':'';
  show($('c-tnote'),noisy);
  $('c-howto').innerHTML=howTo(gen.target,gen);
  $('c-key').innerHTML=noisy?'<span>A script for a simulator with a noise model</span>':'<span><i class="c"></i>The one line to change</span><span><i class="a"></i>The lines that run with this choice</span>';
  $('c-code').innerHTML=gen.lines.map(function(l){return '<span class="ln'+(l.m?' '+l.m:'')+'">'+esc(l.t)+'\n</span>';}).join('');
  $('c-expect').innerHTML=expectHTML(sp,gen);
  $('c-qasm').innerHTML=qa.text.split('\n').slice(0,-1).map(function(l){return '<span class="ln">'+esc(l)+'\n</span>';}).join('');
  $('c-qnote').textContent='OpenQASM is a plain text format for circuits that many quantum programming tools read.'+(qa.skipped?' Noise steps are not part of the language, so '+(qa.skipped===1?'the noise step is':'the '+qa.skipped+' noise steps are')+' left out here.':'');
}
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

// Goals
function renderGoals(){
  var h='';
  GOALS.forEach(function(g){
    var ids=[],right=0,miss=0,dn=0,dq=[];
    g.concepts.forEach(function(c){ids=ids.concat(CONCEPT_ITEMS[c]||[]);});
    ids.forEach(function(id){var m=markOf(id);if(m==='miss')miss++;else if(m)right++;});
    DISCUSS.forEach(function(q,j){if(g.concepts.indexOf(q.concept)<0)return;dq.push(j);var d=S.discuss[q.id];if(d&&d.final!=null)dn++;});
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
  if(b.hasAttribute('data-pg')){S.group=b.getAttribute('data-pg');pDirty=true;store.save(S);go('u1-practice',true);}
  else if(b.hasAttribute('data-dq')){S.dq=parseInt(b.getAttribute('data-dq'),10);dDirty=true;store.save(S);go('u1-discuss',true);}
};

// Start here
var startFigs=null;
function buildStart(){
  var toc='',body=$('s-body');startFigs=[];
  INTRO.forEach(function(sec){
    toc+='<button type="button" class="link" data-sec="'+sec.id+'">'+esc(sec.title)+'</button>';
    var el=document.createElement('section'),h;
    el.className='lesson'+(sec.fig?'':' wide');el.id='sec-'+sec.id;
    h='<div>'+(sec.kind?'<p class="kind">'+esc(sec.kind)+'</p>':'')+'<h3>'+esc(sec.title)+'</h3>';
    if(sec.task)h+='<p class="task">'+sec.task+'</p><ol class="worked">'+sec.steps.map(function(s){return '<li>'+s+'</li>';}).join('')+'</ol>';
    if(sec.html)h+=sec.html;
    if(sec.after)h+=sec.after;
    h+='</div>';
    if(sec.fig)h+='<figure class="fig"><div id="s-fig-'+sec.id+'"></div><figcaption>'+esc(sec.fig.cap)+(sec.fig.play?'<div class="row"><button type="button" class="ghost" id="s-play-'+sec.id+'">Play</button></div>':'')+'</figcaption></figure>';
    el.innerHTML=h;body.appendChild(el);
    if(!sec.fig)return;
    var sp=new Sphere($('s-fig-'+sec.id),'Figure for the section '+sec.title+'. '+sec.fig.cap);
    sp.load(sec.fig.scene());sp.draw();startFigs.push(sp);
    if(sec.fig.play){
      var btn=$('s-play-'+sec.id);
      btn.onclick=function(){btn.disabled=true;sp.load(sec.fig.scene());sec.fig.play(sp,function(){btn.disabled=false;btn.textContent='Play again';});};
    }
  });
  $('s-toc').innerHTML=toc;
  $('s-toc').onclick=function(e){
    var b=closest(e.target,'button[data-sec]');if(!b)return;
    var t=$('sec-'+b.getAttribute('data-sec'));
    try{t.scrollIntoView({behavior:reducedMotion()?'auto':'smooth',block:'start'});}catch(_){t.scrollIntoView();}
  };
}
function enterStart(){
  if(!startFigs)buildStart();else startFigs.forEach(function(sp){sp.draw();});
  if(!S.seenStart){S.seenStart=true;store.save(S);}
}

// Home
var hs=null;
function homeScene(){
  hs.load({state:[0,1,0],ghost:[0,0,1],trail:[arcPath(NAMED.H.axis,PI,[0,0,1]),arcPath(AX.z,PI/2,[1,0,0])]});hs.draw();
}
function renderHome(){
  if(!hs){hs=new Sphere($('h-sphere'),'Bloch sphere. The state moves from |0⟩ to |+⟩ under H, then on to |+i⟩ under S.');homeScene();}
  else hs.draw();
  var a=attempts(),d=discussed(),due=reviewLeft(),h,st,miss=0,id;
  if(!a&&!d){
    h=S.seenStart?link('primary','u1-practice','Go to practice')+link('ghost','u1-start','Read the introduction again')
                 :link('primary','u1-start','Start here')+link('ghost','u1-goals','See the goals of unit 1');
    st='Unit 1, One qubit, is open. It begins with a short introduction to the Bloch sphere.';
  }else{
    for(id in S.items)if(markOf(id)==='miss')miss++;
    h=(due?'<button type="button" class="primary" id="h-review">Review '+plural(due,'item','items')+'</button>'+link('ghost','u1-practice','Continue practice'):link('primary','u1-practice','Continue practice'))+
      link('ghost','u1-discuss','Discuss')+link('ghost','u1-goals','Your progress');
    st='Unit 1: '+a+' of '+N_ITEMS+' practice items answered'+(miss?', '+miss+' to revisit':'')+'. '+d+' of '+DISCUSS.length+' discussion questions answered.';
  }
  $('h-cta').innerHTML=h;$('h-status').textContent=st;
  if($('h-review'))$('h-review').onclick=function(){S.group='R';pDirty=true;store.save(S);go('u1-practice',true);};
}
$('h-play').onclick=function(){
  if(!hs)return;
  hs.load({state:[0,0,1],ghost:[0,0,1]});
  hs.animate([{from:[0,0,1],axis:NAMED.H.axis,angle:PI,hint:{axis:NAMED.H.axis}},{from:[1,0,0],axis:AX.z,angle:PI/2,hint:{axis:AX.z}}],function(){hs.hint=null;hs.state=[0,1,0];hs.draw();});
};
function renderMap(){
  var h='';
  COURSE.units.forEach(function(u){
    h+='<div class="unit'+(u.open?' open':'')+'"><div class="un">'+esc(u.n)+'</div><div class="ub"><h3>'+(u.go?'<a href="#'+u.go+'" data-go="'+u.go+'">'+esc(u.title)+'</a>':esc(u.title))+'</h3><p>'+esc(u.line)+'</p>';
    if(u.open)h+='<div class="parts">'+COURSE.parts.map(function(p,i){return '<a href="#'+PART_ROUTE[i]+'" data-go="'+PART_ROUTE[i]+'">'+esc(p[0])+'</a>';}).join('')+'</div>';
    if(u.plan)h+='<details><summary>Planned contents</summary><ul>'+u.plan.map(function(x){return '<li>'+esc(x)+'</li>';}).join('')+'</ul></details>';
    h+='</div><div class="us">'+(u.open?'Open':u.n==='R'?'Topics in preparation':'In preparation')+'</div></div>';
  });
  $('h-map').innerHTML=h;
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
  $('v-discuss').innerHTML='<thead><tr><th>No.</th><th>Question</th><th>Idea</th><th>Based on</th></tr></thead><tbody>'+DISCUSS.map(function(q,j){return '<tr><td>'+(j+1)+'</td><td>'+esc(q.title)+'</td><td>'+q.concept+' '+esc(CONCEPTS[q.concept])+'</td><td>'+esc(q.src||'')+'</td></tr>';}).join('')+'</tbody>';
  $('v-checks').innerHTML=selfChecks().concat(selfChecks2()).map(function(c){return '<li'+(c.ok?'':' class="bad"')+'>'+esc(c.name)+(c.ok?'':' (failed)')+'</li>';}).join('');
  $('v-log').value=S.log.length?csv():'No responses yet.';
}
$('v-copy').onclick=function(){copyText($('v-log').value,$('v-copy'),$('v-log'));};
twoStep($('v-clear'),'Clear my data','Click again to erase everything',function(){
  store.clear();S=fresh();ps.stop();dsp.stop();pDirty=true;dDirty=true;cur=null;phase='idle';
  es.stop();E.busy=false;E.start='zero';E.ops=[];eRecompute();eRender();$('e-mout').textContent='';show($('e-serr'),false);
  renderAbout();$('v-clearnote').textContent='Cleared.';
});

// Routes
var route=null;
var ENTER={'home':renderHome,'u1-goals':renderGoals,'u1-start':enterStart,'u1-practice':enterPractice,'u1-discuss':enterDiscuss,
  'u1-explore':function(){es.draw();},'u1-code':renderCode,'about':renderAbout};
function resolveRoute(r){
  if(r==='u1')return S.unitTab;
  if(r==='practice'||r==='explore')return 'u1-'+r;
  if(r==='evidence')return 'about';
  return ROUTES.indexOf(r)>=0?r:'home';
}
function go(r,push){
  r=resolveRoute(r);
  var inUnit=r.indexOf('u1-')===0,changed=r!==route;
  route=r;
  ROUTES.forEach(function(x){show($('view-'+VIEW[x]),x===r);});
  show($('unit-head'),inUnit);
  each(document.querySelectorAll('[data-nav]'),function(a){
    var n=a.getAttribute('data-nav');
    if(n===r||(n==='u1'&&inUnit))a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');
  });
  if(inUnit&&S.unitTab!==r){S.unitTab=r;store.save(S);}
  if(ENTER[r])ENTER[r]();
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
  if(ENTER[route])ENTER[route]();
});

renderMap();eRecompute();eRender();
go((location.hash||'').slice(1)||'home',false);
})();
