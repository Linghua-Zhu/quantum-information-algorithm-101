// Helpers
var AXM={
  z:{v:[0,0,1],name:'Z',plus:'0',minus:'1',kp:'|0\u27e9',km:'|1\u27e9'},
  x:{v:[1,0,0],name:'X',plus:'+',minus:'\u2212',kp:'|+\u27e9',km:'|\u2212\u27e9'},
  y:{v:[0,1,0],name:'Y',plus:'+i',minus:'\u2212i',kp:'|+i\u27e9',km:'|\u2212i\u27e9'}
};
function vecOf(s){if(typeof s==='string')return STARTS[s].slice();if(s.length===2)return fromAngles(s[0],s[1]);return s.slice();}
function vlen(v){return Math.hypot(v[0],v[1],v[2]);}
function vdist(a,b){return Math.hypot(a[0]-b[0],a[1]-b[1],a[2]-b[2]);}
function f2(x){var r=Math.round(x*100)/100;if(r===0)r=0;return r.toFixed(2).replace('-','\u2212');}
function nt(x){return String(Math.round(x*1000)/1000).replace('-','\u2212');}
function degText(d){var r=Math.round(d*10)/10;return (r<0?'\u2212':'')+Math.abs(r)+'\u00b0';}
function f3(x){var r=Math.round(x*1000)/1000;if(r===0)r=0;var s=r.toFixed(3);if(s.charAt(s.length-1)==='0')s=s.slice(0,-1);return s.replace('-','\u2212');}
function onePlus(x){return x<0?'1 \u2212 '+f3(-x):'1 + '+f3(x);}
function aAn(name){return name==='X'?'An':'A';}
function coordText(v){return '(x, y, z) = ('+f2(v[0])+', '+f2(v[1])+', '+f2(v[2])+')';}
function labelAny(v){var l=vlen(v);if(l>0.9995)return labelOf(v);if(l<0.02)return 'the centre of the ball';return coordText(v);}
function stateSentence(v,where){var c=isCardinal(v);return c?'The state is '+c+'.':'The state is at '+labelOf(v)+', '+(where||'the dark arrow on the sphere')+'.';}
function slicePlane(v){var h=Math.hypot(v[0],v[1]),u=h<1e-6?[1,0,0]:[v[0]/h,v[1]/h,0];if(u[1]<-1e-9||(Math.abs(u[1])<1e-9&&u[0]<0))u=[-u[0],-u[1],0];return {u:u,w:[0,0,1]};}
function chDepol(p,r){return scale(r,1-p);}
function chRelax(a,b,r){return [r[0]*b,r[1]*b,1-(1-r[2])*a];}
function hashStr(s){var h=2166136261;for(var i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619);}return h>>>0;}
function sampleShots(p,n,seed){var rnd=mulberry32(seed),k=0;for(var i=0;i<n;i++)if(rnd()<p)k++;return k;}
function ketText(theta,phi){
  var h=degText(theta/2),ph=((phi%360)+360)%360;
  if(Math.abs(theta-90)<1e-9)return ph===0?'(|0\u27e9 + |1\u27e9)/\u221a2':'(|0\u27e9 + e^(i\u00b7'+degText(ph)+')|1\u27e9)/\u221a2';
  return 'cos('+h+')|0\u27e9 + '+(ph===0?'':'e^(i\u00b7'+degText(ph)+') ')+'sin('+h+')|1\u27e9';
}
var TOLS=0.13,TOLN=0.025;
function pushD(ds,correct,tag,v,angular){
  function near(a,b){return angular?angDeg(a,b)<10:vdist(a,b)<0.1;}
  if(near(v,correct))return;
  for(var i=0;i<ds.length;i++)if(ds[i].v&&near(ds[i].v,v))return;
  ds.push({tag:tag,v:v});
}
function classPoint(p,correct,ds,angular){
  function hit(a,b){return angular?angDeg(a,b)<=TOL:vdist(a,b)<=TOLS;}
  function gap(a,b){return angular?angDeg(a,b):vdist(a,b);}
  var off=gap(p,correct);
  if(hit(p,correct))return {tag:'correct',off:off};
  var best=null,bd=1e9;
  ds.forEach(function(d){if(!d.v)return;var q=gap(p,d.v);if(hit(p,d.v)&&q<bd){bd=q;best=d;}});
  if(best)return {tag:best.tag,off:off};
  for(var i=0;i<ds.length;i++)if(ds[i].test&&ds[i].test(p))return {tag:ds[i].tag,off:off};
  return {tag:'unclassified',off:off};
}
function pushN(ds,correct,tag,x){
  if(!(x>=-1e-9&&x<=1+1e-9)||Math.abs(x-correct)<0.045)return;
  for(var i=0;i<ds.length;i++)if(Math.abs(ds[i].x-x)<0.045)return;
  ds.push({tag:tag,x:x});
}
function classNumber(x,correct,ds){
  var off=Math.abs(x-correct);
  if(off<=TOLN)return {tag:'correct',off:off};
  var best=null,bd=1e9;
  ds.forEach(function(d){var q=Math.abs(x-d.x);if(q<=TOLN&&q<bd){bd=q;best=d;}});
  return {tag:best?best.tag:'unclassified',off:off};
}
function offText(c,angular){return angular?Math.round(c.off)+'\u00b0':f2(c.off);}

// Gates
function buildRotate(item){
  var Q=resolve(item),single=Q.gs.length===1,L=Q.gs.map(function(g){return g.label;});
  var R={item:item,type:'rotate',mode:'point',replay:true};
  R.circuit={start:isCardinal(Q.r0)||'|\u03c8\u27e9',gates:L};
  R.prompt=(isCardinal(Q.r0)?'The qubit starts in '+labelOf(Q.r0)+'.':'The qubit starts at '+labelOf(Q.r0)+', the dark arrow on the sphere.')+(single?' Apply '+L[0]+'. Where is the state now?':' Apply '+L[0]+L.slice(1).map(function(x){return ', then '+x;}).join('')+'. Where is the state at the end?');
  R.note=!single?'No hints on the sphere. Take one gate at a time.':item.level===1?'Shown on the sphere: the rotation axis, the sense of the turn, and the circle the state moves on.':item.level===2?'Shown on the sphere: the rotation axis.':'No hints on the sphere.';
  R.how='Click or tap the sphere where you think the state ends up. Drag to turn the sphere.';
  R.scene=function(){var h=null;if(single&&item.level<3){var g=Q.gs[0];h={axis:g.axis};if(item.level===1){h.sense=g.angle>0?1:-1;h.circle=Q.r0;}}return {state:Q.r0,hint:h};};
  R.classify=function(p){return classify(Q,p);};
  R.feedback=function(c){return feedbackText(Q,c);};
  R.reference=referenceText(Q);
  R.result=(Q.fixed?'The state stays at ':'The state ends at ')+labelOf(Q.rf)+'.';
  R.answer=Q.rf;
  R.respText=function(p){return labelOf(p);};
  R.observe=function(sp,done){
    sp.ghost=Q.r0;
    sp.animate(Q.gs.map(function(g,i){return {from:Q.path[i],axis:g.axis,angle:g.angle,hint:{axis:g.axis}};}),function(){sp.state=Q.rf;sp.hint=single?{axis:Q.gs[0].axis}:null;sp.draw();done();});
  };
  return R;
}

// States
function buildLocate(item){
  var R={item:item,type:'locate',mode:'point'},ds=[],v,g,deg;
  R.how='Click or tap the sphere where the state sits. Drag to turn the sphere.';
  R.respText=function(p){return labelOf(p);};
  if(item.kind==='amp'){
    var th=item.theta,ph=((item.phi%360)+360)%360,txt=item.text||ketText(th,ph);
    v=fromAngles(th,ph);
    pushD(ds,v,'theta-not-doubled',fromAngles(th/2,ph),true);
    pushD(ds,v,'swap-01',fromAngles(180-th,ph),true);
    if(ph!==0){pushD(ds,v,'phase-ignored',fromAngles(th,0),true);pushD(ds,v,'phase-sign',fromAngles(th,-ph),true);}
    R.prompt='Place the state '+txt+' on the sphere.';
    R.note=item.level===1?'Shown on the sphere: the circle at this state\u2019s polar angle and the meridian at its azimuth.':item.level===2?'Shown on the sphere: the circle at this state\u2019s polar angle.':'No hints on the sphere.';
    R.scene=function(){
      var gd=[];
      if(item.level<=2)gd.push({n:[0,0,1],h:Math.cos(th*DEG)});
      if(item.level===1)gd.push({n:[-Math.sin(ph*DEG),Math.cos(ph*DEG),0],h:0});
      return {state:null,guides:gd};
    };
    R.classify=function(p){return classPoint(p,v,ds,true);};
    R.feedback=function(c){
      switch(c.tag){
        case 'correct':return 'Correct.';
        case 'theta-not-doubled':return 'The polar angle on the sphere is twice the angle in the amplitudes. The amplitudes are cos(\u03b8/2) and sin(\u03b8/2), so here \u03b8 = '+degText(th)+', not '+degText(th/2)+'.';
        case 'swap-01':return 'You have |0\u27e9 and |1\u27e9 swapped. |0\u27e9 is at the top of the sphere, and the weight on |0\u27e9 is cos\u00b2(\u03b8/2).';
        case 'phase-ignored':return 'The height is right. The relative phase sets the angle around the z axis: \u03c6 = '+degText(ph)+'.';
        case 'phase-sign':return 'Right height and right size of angle, wrong direction. A relative phase of '+degText(ph)+' is measured counterclockwise from +x, seen from above.';
        default:return 'Not there. Your point is '+offText(c,true)+' away. The state cos(\u03b8/2)|0\u27e9 + e^(i\u03c6) sin(\u03b8/2)|1\u27e9 sits at polar angle \u03b8 and azimuth \u03c6: here \u03b8 = '+degText(th)+', \u03c6 = '+degText(ph)+'.';
      }
    };
    R.reference='The amplitudes have the form cos(\u03b8/2) and sin(\u03b8/2) with \u03b8/2 = '+degText(th/2)+', so the polar angle is \u03b8 = '+degText(th)+'. The relative phase is \u03c6 = '+degText(ph)+', the angle around the z axis measured from +x. The point is '+labelOf(v)+'.';
    R.result='The state sits at '+labelOf(v)+'.';R.answer=v;
    R.replay=true;
    R.observe=function(sp,done){
      var steps=[],a=ph>180?ph-360:ph;
      if(th>0)steps.push({from:[0,0,1],axis:AX.y,angle:th*DEG});
      if(a!==0&&th>0&&th<180)steps.push({from:fromAngles(th,0),axis:AX.z,angle:a*DEG});
      sp.guides=[];
      if(!steps.length){sp.state=v;sp.draw();done();return;}
      sp.animate(steps,function(){sp.state=v;sp.draw();done();});
    };
    return R;
  }
  g=unit(vecOf(item.of));
  if(item.kind==='orth'){
    v=scale(g,-1);
    ds.push({tag:'same',v:g});
    ds.push({tag:'perpendicular',test:function(p){var a=angDeg(p,g);return a>=70&&a<=110;}});
    R.prompt='The sphere shows '+(isCardinal(g)||'the state at '+labelOf(g))+'. Place the state that is orthogonal to it.';
    R.note='No hints on the sphere.';
    R.scene=function(){return {state:g};};
    R.classify=function(p){return classPoint(p,v,ds,true);};
    R.feedback=function(c){
      if(c.tag==='correct')return 'Correct.';
      if(c.tag==='perpendicular')return 'Orthogonal states are not at right angles on the sphere. They sit at opposite points, because an angle on the sphere is twice the angle between the state vectors.';
      if(c.tag==='same')return 'That is the state itself. The orthogonal state is the opposite point on the sphere.';
      return 'Not there. The orthogonal state is the opposite point on the sphere, '+labelOf(v)+'.';
    };
    R.reference='Orthogonal states sit at opposite points of the sphere. A measurement along the axis through the two points gives opposite outcomes for the two states, each with certainty.';
    R.result='The orthogonal state is '+labelOf(v)+'.';R.answer=v;
    R.observe=function(sp,done){sp.ghost=g;sp.state=v;sp.lines=[{a:g,b:v}];sp.draw();done();};
    return R;
  }
  deg=item.deg;
  if(item.kind==='gphase'){
    v=g;
    pushD(ds,v,'global-as-relative',rot(AX.z,deg*DEG,g),true);
    pushD(ds,v,'flip',scale(g,-1),true);
    R.prompt='The sphere shows '+(isCardinal(g)||'the state at '+labelOf(g))+'. Multiply the whole state by '+item.factor+'. Where is the state now?';
    R.note='No hints on the sphere.';
    R.scene=function(){return {state:g};};
    R.classify=function(p){return classPoint(p,v,ds,true);};
    R.feedback=function(c){
      if(c.tag==='correct')return 'Correct.';
      if(c.tag==='global-as-relative')return 'A factor on the whole state multiplies both amplitudes. The relative phase between them does not change, so the point does not move.';
      return 'The point does not move. A factor on the whole state is a global phase: both amplitudes get the same factor, and no measurement can detect it.';
    };
    R.reference='Multiplying the whole state by '+item.factor+' gives both amplitudes the same factor. Their sizes and their relative phase stay the same, so the point stays at '+labelOf(g)+'.';
    R.result='The state stays at '+labelOf(g)+'.';R.answer=v;
    R.observe=function(sp,done){sp.state=g;sp.draw();done();};
    return R;
  }
  v=unit(rot(AX.z,deg*DEG,g));
  pushD(ds,v,'relative-ignored',g,true);
  pushD(ds,v,'phase-sign',rot(AX.z,-deg*DEG,g),true);
  pushD(ds,v,'phase-as-height',rot(AX.y,deg*DEG,g),true);
  pushD(ds,v,'phase-as-height',rot(AX.y,-deg*DEG,g),true);
  R.prompt='The sphere shows |+\u27e9 = (|0\u27e9 + |1\u27e9)/\u221a2. The |1\u27e9 term alone is multiplied by '+item.factor+'. Where is the state now?';
  R.note=item.level<=2?'Shown on the sphere: the z axis.':'No hints on the sphere.';
  R.scene=function(){return {state:g,hint:item.level<=2?{axis:AX.z}:null};};
  R.classify=function(p){return classPoint(p,v,ds,true);};
  R.feedback=function(c){
    if(c.tag==='correct')return 'Correct.';
    if(c.tag==='relative-ignored')return 'The state does move. A factor on one term changes the relative phase, and the relative phase is the angle around the z axis.';
    if(c.tag==='phase-sign')return 'Right size of angle, wrong direction. A phase of +'+degText(Math.abs(deg))+' on the |1\u27e9 term moves the point counterclockwise, seen from above.';
    if(c.tag==='phase-as-height')return 'A relative phase does not change the weights on |0\u27e9 and |1\u27e9, so the point keeps its height. It moves around the z axis.';
    return 'Not there. Your point is '+offText(c,true)+' away. A relative phase of '+degText(deg)+' moves the point by that angle around the z axis.';
  };
  R.reference='A factor on the |1\u27e9 term alone changes the relative phase by '+degText(deg)+'. The point moves '+degText(Math.abs(deg))+' around the z axis, from '+labelOf(g)+' to '+labelOf(v)+'.';
  R.result='The state ends at '+labelOf(v)+'.';R.answer=v;
  R.replay=true;
  R.observe=function(sp,done){sp.ghost=g;sp.animate([{from:g,axis:AX.z,angle:deg*DEG,hint:{axis:AX.z}}],function(){sp.state=v;sp.draw();done();});};
  return R;
}

// Measurement: probabilities
function shotLine(A,p,id){var n=200,k=sampleShots(p,n,hashStr(id));return n+' simulated shots: '+k+' gave '+A.plus+', '+(n-k)+' gave '+A.minus+'.';}
function buildProb(item){
  var r=vecOf(item.state),A=AXM[item.axis],pr=dot(r,A.v),p=(1+pr)/2,ang=Math.acos(clamp(pr/(vlen(r)||1),-1,1)),ds=[];
  pushN(ds,p,'complement',1-p);
  if(item.axis!=='z')pushN(ds,p,'z-for-all',(1+r[2])/2);
  pushN(ds,p,'full-angle',Math.pow(Math.cos(ang),2));
  pushN(ds,p,'linear-angle',1-ang/PI);
  pushN(ds,p,'expectation',pr);
  var R={item:item,type:'prob',mode:'number',numLabel:'P('+A.plus+')'};
  R.prompt=stateSentence(r)+' You measure '+A.name+'. What is the probability of the outcome '+A.plus+'?';
  R.note=item.level===1?'Shown on the sphere: the measurement axis and the projection of the state onto it.':item.level===2?'Shown on the sphere: the measurement axis.':'No hints on the sphere.';
  R.how='Type a probability between 0 and 1.';
  R.scene=function(){var s={state:r};if(item.level<=2)s.hint={axis:A.v};if(item.level===1){s.lines=[{a:r,b:scale(A.v,pr)}];s.marks=[{v:scale(A.v,pr),cls:'foot',label:f3(pr)}];}return s;};
  R.classify=function(x){return classNumber(x,p,ds);};
  R.feedback=function(c){
    var tail='P = ('+onePlus(pr)+')/2 = '+f2(p)+'.';
    switch(c.tag){
      case 'correct':return 'Correct.';
      case 'full-angle':return 'You used cos\u00b2 of the full angle. The probability is cos\u00b2 of half the angle between the state and '+A.kp+': cos\u00b2('+degText(ang/DEG/2)+') = '+f2(p)+'.';
      case 'complement':return 'That value is the probability of the other outcome, '+A.minus+'. For '+A.plus+', '+tail;
      case 'z-for-all':return 'That is the probability for a Z measurement. A measurement along '+item.axis+' uses the projection of the state onto the '+item.axis+' axis, which depends on \u03c6. '+tail;
      case 'linear-angle':return 'The probability is not proportional to the angle. It follows the projection of the state onto the measurement axis. '+tail;
      case 'expectation':return 'That number is the projection of the state onto the axis. It is the average outcome \u27e8'+A.name+'\u27e9, not a probability. '+tail;
      default:return 'Not that value. Project the state onto the '+item.axis+' axis. The projection is '+f3(pr)+', and '+tail;
    }
  };
  R.reference='The projection of the state onto the '+item.axis+' axis is '+f3(pr)+'. The probability of '+A.plus+' is (1 + projection)/2 = '+f2(p)+(vlen(r)>0.985?', which equals cos\u00b2 of half the angle between the state and '+A.kp+'.':'.');
  R.result='P('+A.plus+') = '+f2(p)+'.';R.answer=p;
  R.extra=function(){return shotLine(A,p,item.id);};
  R.respText=function(x){return 'P('+A.plus+') = '+f2(x);};
  R.observe=function(sp,done){sp.hint={axis:A.v};sp.lines=[{a:r,b:scale(A.v,pr)}];sp.marks=[{v:scale(A.v,pr),cls:'foot',label:f3(pr)}];sp.draw();done();};
  return R;
}
function buildProb2(item){
  var r0=vecOf(item.state),A1=AXM[item.first.axis],o=item.first.outcome,c=scale(A1.v,o),A=AXM[item.axis],pr=dot(c,A.v),p=(1+pr)/2,ds=[];
  var out=o>0?A1.plus:A1.minus,ket=o>0?A1.kp:A1.km;
  pushN(ds,p,'no-collapse',(1+dot(r0,A.v))/2);
  pushN(ds,p,'complement',1-p);
  var R={item:item,type:'prob2',mode:'number',numLabel:'P('+A.plus+')'};
  R.prompt=stateSentence(r0)+' '+aAn(A1.name)+' '+A1.name+' measurement gives the outcome '+out+'. You then measure '+A.name+'. What is the probability of the outcome '+A.plus+'?';
  R.note='The sphere shows the state before the first measurement.';
  R.how='Type a probability between 0 and 1.';
  R.scene=function(){return {state:r0};};
  R.classify=function(x){return classNumber(x,p,ds);};
  R.feedback=function(cl){
    if(cl.tag==='correct')return 'Correct.';
    if(cl.tag==='no-collapse')return 'You used the state from before the first measurement. After the outcome '+out+', the state is '+ket+', and from there P('+A.plus+') = '+f2(p)+'.';
    if(cl.tag==='complement')return 'That is the probability of the other outcome. After the first measurement the state is '+ket+', and P('+A.plus+') = '+f2(p)+'.';
    return 'Not that value. After the first measurement the state is '+ket+'. Its projection onto the '+item.axis+' axis is '+f2(pr)+', so P('+A.plus+') = '+f2(p)+'.';
  };
  R.reference='The first measurement leaves the state at '+ket+'. For the second measurement, project that state onto the '+item.axis+' axis: the projection is '+f2(pr)+', so P('+A.plus+') = '+f2(p)+'.';
  R.result='After the first measurement the state is '+ket+'. P('+A.plus+') = '+f2(p)+'.';R.answer=p;
  R.extra=function(){return shotLine(A,p,item.id);};
  R.respText=function(x){return 'P('+A.plus+') = '+f2(x);};
  R.observe=function(sp,done){sp.ghost=r0;sp.state=c;sp.hint={axis:A.v};sp.lines=[{a:c,b:scale(A.v,pr)}];sp.draw();done();};
  return R;
}

// Measurement: the state afterwards
function buildCollapse(item){
  var r0=vecOf(item.state),A=AXM[item.axis],o=item.outcome,pole=scale(A.v,o),pr=dot(r0,A.v),foot=scale(A.v,pr),ds=[];
  var out=o>0?A.plus:A.minus,ket=o>0?A.kp:A.km,pOut=(1+o*pr)/2;
  pushD(ds,pole,'projection-point',foot,false);
  pushD(ds,pole,'no-collapse',r0,false);
  pushD(ds,pole,'other-pole',scale(pole,-1),false);
  pushD(ds,pole,'centre',[0,0,0],false);
  var R={item:item,type:'collapse',mode:'slice'};
  R.prompt=stateSentence(r0,'the dark arrow in the cross-section')+' You measure '+A.name+' and get the outcome '+out+'. Where is the state right after the measurement?';
  R.note=item.level<=2?'Shown in the cross-section: the measurement axis.':'No hints in the cross-section.';
  R.how='Click or tap inside the circle where the state is after the measurement. The circle is a cut through the sphere, so points inside it are allowed.';
  R.scene=function(){var pl=item.axis==='z'?slicePlane(r0):{u:A.v,w:[0,0,1]};return {state:r0,slice:pl,hint:item.level<=2?{axis:A.v}:null};};
  R.classify=function(p){return classPoint(p,pole,ds,false);};
  R.feedback=function(c){
    switch(c.tag){
      case 'correct':return 'Correct.';
      case 'projection-point':return 'That point is the projection of the old state onto the axis. It gives the average over many measurements, not the state after one. After the outcome '+out+', the state is '+ket+'.';
      case 'no-collapse':return 'The measurement changes the state. After the outcome '+out+', the state is '+ket+', whatever it was before.';
      case 'other-pole':return 'That is the state for the other outcome. The outcome was '+out+', so the state is '+ket+'.';
      case 'centre':return 'The outcome is known, so the state is not a mixture. It is '+ket+'.';
      default:return 'Not there. After a measurement along an axis, the state is at one end of that axis. The outcome was '+out+', so it is '+ket+'.';
    }
  };
  R.reference='A measurement along the '+item.axis+' axis leaves the state at one end of that axis. The outcome was '+out+', so the state is '+ket+'. The projection of the old state gives the probability of that outcome, ('+onePlus(o*pr)+')/2 = '+f2(pOut)+'.';
  R.result='The state is '+ket+'.';R.answer=pole;
  R.respText=function(p){return labelAny(p);};
  R.observe=function(sp,done){sp.ghost=r0;sp.lines=[{a:r0,b:foot}];sp.marks=[{v:foot,cls:'foot'}];sp.hint={axis:A.v};sp.state=pole;sp.draw();done();};
  return R;
}

// Noise
function channelOf(ch){
  if(ch.kind==='depol')return {end:function(r,s){return chDepol(ch.p*s,r);},text:'A depolarizing channel with p = '+ch.p+' acts on it.',rule:'Depolarizing noise shrinks the Bloch vector toward the centre by the factor 1 \u2212 p = '+f2(1-ch.p)+', the same in every direction.',name:'depolarizing noise',even:1-ch.p,uniform:true};
  if(ch.kind==='dephase')return {end:function(r,s){return chRelax(1,Math.pow(ch.b,s),r);},text:'Pure dephasing acts until exp(\u2212t/T2) = '+ch.b+'. There is no relaxation.',rule:'Pure dephasing shrinks the x and y components by exp(\u2212t/T2) = '+ch.b+' and leaves z unchanged.',name:'pure dephasing',even:ch.b,uniform:false};
  return {end:function(r,s){return chRelax(Math.pow(ch.a,s),Math.pow(ch.b,s),r);},text:'The qubit relaxes for a time t with exp(\u2212t/T1) = '+ch.a+(Math.abs(ch.b*ch.b-ch.a)<1e-9?' and T2 = 2T1.':' and exp(\u2212t/T2) = '+ch.b+'.'),rule:'Relaxation pulls z toward +1, the state |0\u27e9: z = 1 \u2212 (1 \u2212 z\u2080)exp(\u2212t/T1). The x and y components shrink by exp(\u2212t/T2) = '+f2(ch.b)+'.',name:'relaxation',even:ch.b,uniform:false,relax:true};
}
function buildDecohere(item){
  var r0=vecOf(item.state),C=channelOf(item.ch),end=C.end(r0,1),fixed=vdist(end,r0)<0.02,ds=[];
  if(!fixed)pushD(ds,end,'no-change',r0,false);
  pushD(ds,end,'to-centre',[0,0,0],false);
  if(!C.uniform)pushD(ds,end,'uniform-shrink',scale(r0,C.even),false);
  if(C.relax)pushD(ds,end,'uniform-shrink',scale(r0,item.ch.a),false);
  if(fixed)pushD(ds,end,'uniform-shrink',scale(r0,0.5),false);
  if(C.relax)pushD(ds,end,'wrong-pole',[end[0],end[1],-end[2]],false);
  if(C.relax)pushD(ds,end,'fully-relaxed',[0,0,1],false);
  if(vlen(end)<0.9)ds.push({tag:'on-surface',test:function(p){return vlen(p)>0.93;}});
  var R={item:item,type:'decohere',mode:'slice',replay:true};
  R.prompt=stateSentence(r0,'the dark arrow in the cross-section')+' '+C.text+' Where is the state afterwards?';
  R.note=item.level===1?C.rule:item.level===2?'The cross-section contains the z axis and the starting state.':'No hints in the cross-section.';
  R.how='Click or tap inside the circle where the state ends up. The circle is a cut through the sphere, so points inside it are allowed.';
  R.scene=function(){return {state:r0,slice:slicePlane(r0)};};
  R.classify=function(p){var c=classPoint(p,end,ds,false);if(fixed&&c.tag==='unclassified')c.tag='moved-fixed';return c;};
  R.feedback=function(c){
    switch(c.tag){
      case 'correct':return 'Correct.';
      case 'no-change':return 'This noise does move the state. '+C.rule;
      case 'to-centre':return 'Not all the way to the centre. '+C.rule;
      case 'uniform-shrink':return fixed?'This state does not move under '+C.name+'. '+C.rule:'This noise does not shrink the vector evenly. '+C.rule;
      case 'wrong-pole':return 'The pull is toward |0\u27e9 at the top, not toward |1\u27e9. '+C.rule;
      case 'fully-relaxed':return 'Not all the way to |0\u27e9 yet. '+C.rule;
      case 'on-surface':return 'Noise does not turn the state along the surface. It makes the state mixed, which moves the point inside the ball. '+C.rule;
      case 'moved-fixed':return 'This state does not move under '+C.name+'. '+C.rule;
      default:return 'Not there. '+C.rule+' The state ends at '+labelAny(end)+'.';
    }
  };
  R.reference=C.rule+' Starting from '+labelAny(r0)+', the state '+(fixed?'stays where it is.':'ends at '+labelAny(end)+'.');
  R.result=fixed?'The state stays at '+labelAny(r0)+'.':'The state ends at '+labelAny(end)+'.';R.answer=end;
  R.respText=function(p){return labelAny(p);};
  R.observe=function(sp,done){sp.ghost=r0;sp.animatePath(function(s){return C.end(r0,s);},1300,function(){sp.state=end;sp.draw();done();});};
  return R;
}
function buildMixture(item){
  var p0=item.p0,z=2*p0-1,c=[0,0,z],th=Math.acos(z)/DEG,ds=[];
  if(p0!==0.5){pushD(ds,c,'pole',[0,0,1],false);pushD(ds,c,'pole',[0,0,-1],false);}
  else{ds.push({tag:'pole',v:[0,0,1]});ds.push({tag:'pole',v:[0,0,-1]});}
  ds.push({tag:'superposition',test:function(p){return vlen(p)>0.93;}});
  ds.push({tag:'off-axis',test:function(p){return Math.hypot(p[0],p[1])>0.13;}});
  var R={item:item,type:'mixture',mode:'slice'};
  R.prompt=(p0===0.5?'A source prepares |0\u27e9 half of the time and |1\u27e9 the other half, at random.':'A source prepares |0\u27e9 with probability '+nt(p0)+' and |1\u27e9 with probability '+nt(1-p0)+', at random.')+' Place the state that describes what it sends.';
  R.note=item.level===1?'The Bloch vector of a mixture is the weighted average of the Bloch vectors of its parts.':'No hints in the cross-section.';
  R.how='Click or tap inside the circle. The circle is a cut through the sphere, so points inside it are allowed.';
  R.scene=function(){return {state:null,slice:{u:[1,0,0],w:[0,0,1]}};};
  R.classify=function(p){return classPoint(p,c,ds,false);};
  R.feedback=function(cl){
    var avg='A mixture is the weighted average of the Bloch vectors of its parts: z = '+nt(p0)+' \u2212 '+nt(1-p0)+' = '+nt(z)+', with no x or y component.';
    if(cl.tag==='correct')return 'Correct.';
    if(cl.tag==='superposition')return 'That point is on the surface, so it is a pure state, a superposition. A random mixture of |0\u27e9 and |1\u27e9 has no definite relative phase and sits inside the ball. '+avg;
    if(cl.tag==='pole')return 'That is one of the two states in the mixture, not the mixture. '+avg;
    if(cl.tag==='off-axis')return 'A mixture of |0\u27e9 and |1\u27e9 has no x or y component, because there is no definite relative phase between them. '+avg;
    return 'Not there. '+avg;
  };
  R.reference='The Bloch vector of a mixture is the weighted average of the Bloch vectors of its parts: '+nt(p0)+' \u00d7 (+1) + '+nt(1-p0)+' \u00d7 (\u22121) = '+nt(z)+' along z, with no x or y component. An X measurement on it gives 50/50, unlike the superposition at \u03b8 = '+degText(th)+', \u03c6 = 0\u00b0, which has the same Z statistics.';
  R.result='The state is at '+labelAny(c)+'.';R.answer=c;
  R.respText=function(p){return labelAny(p);};
  R.observe=function(sp,done){sp.marks=[{v:[0,0,1],cls:'part'},{v:[0,0,-1],cls:'part'}];sp.hint={axis:AX.z};sp.state=c;sp.draw();done();};
  return R;
}

// Telling two preparations apart
function buildDistinguish(item){
  var a=vecOf(item.A),b=vecOf(item.B),keys=['z','x','y'],correct=keys.filter(function(k){return Math.abs(dot(a,AXM[k].v)-dot(b,AXM[k].v))>0.02;});
  function names(list){var n=list.map(function(k){return AXM[k].name;});return n.length>1?n.slice(0,-1).join(', ')+' and '+n[n.length-1]:n[0]||'';}
  function table(){return 'Probability of the first outcome: '+keys.map(function(k){return AXM[k].name+' gives '+f2((1+dot(a,AXM[k].v))/2)+' for A and '+f2((1+dot(b,AXM[k].v))/2)+' for B';}).join('; ')+'.';}
  var R={item:item,type:'distinguish',mode:'multi',options:[{k:'z',t:'Z'},{k:'x',t:'X'},{k:'y',t:'Y'}],noneText:'None of them'};
  R.prompt='Preparation A gives '+item.textA+'. Preparation B gives '+item.textB+'. With many copies of each, which measurements can tell A from B? Select every one that works.';
  R.note='The sphere shows both states.';
  R.how='Select every measurement that works, or the last option if none does.';
  R.scene=function(){var same=vdist(a,b)<0.02;return {state:null,marks:same?[{v:a,cls:'ma',vec:true,label:'A, B'}]:[{v:a,cls:'ma',vec:true,label:'A'},{v:b,cls:'mb',vec:true,label:'B'}]};};
  R.classify=function(sel){
    var extra=sel.filter(function(k){return correct.indexOf(k)<0;}),missed=correct.filter(function(k){return sel.indexOf(k)<0;});
    if(!extra.length&&!missed.length)return {tag:'correct',off:0};
    if(!correct.length)return {tag:'same-state-separated',off:extra.length,extra:extra};
    if(!sel.length)return {tag:'separable-called-same',off:missed.length,missed:missed};
    return {tag:extra.length?'extra-axis':'missed-axis',off:extra.length+missed.length,extra:extra,missed:missed};
  };
  R.feedback=function(c){
    var lead;
    if(c.tag==='correct')return 'Correct.';
    if(c.tag==='same-state-separated')lead='No measurement tells them apart. A and B differ only by a global phase and sit at the same point on the sphere.';
    else if(c.tag==='separable-called-same')lead=item.kind==='mixture'?'They can be told apart. Both give the same Z statistics, but only one of them has a definite relative phase between |0\u27e9 and |1\u27e9.':'They can be told apart. A and B differ in relative phase, and the relative phase shows up in measurements along other axes.';
    else if(c.tag==='extra-axis')lead=(c.extra.length>1?names(c.extra)+' measurements give':aAn(AXM[c.extra[0]].name)+' '+names(c.extra)+' measurement gives')+' the same statistics for both.'+(c.missed.length?' '+names(c.missed)+(c.missed.length>1?' do work.':' does work.'):'');
    else lead='That works, and so '+(c.missed.length>1?'do ':'does ')+names(c.missed)+'.';
    return lead+' '+table();
  };
  R.reference='A measurement along an axis tells two states apart when their projections onto that axis differ. '+table()+(correct.length?' So '+names(correct)+' can tell them apart.':' So none of them can.');
  R.result=correct.length?names(correct)+' can tell A from B.':'No measurement can tell A from B.';R.answer=correct;
  R.extra=function(){
    var n=200;return n+' simulated shots each, counts of the first outcome: '+keys.map(function(k,i){return AXM[k].name+' '+sampleShots((1+dot(a,AXM[k].v))/2,n,hashStr(item.id+'a'+i))+' for A, '+sampleShots((1+dot(b,AXM[k].v))/2,n,hashStr(item.id+'b'+i))+' for B';}).join('; ')+'.';
  };
  R.respText=function(sel){return sel.length?names(sel):'none of them';};
  R.observe=function(sp,done){sp.draw();done();};
  return R;
}

// Shots
function buildChoice(item){
  var R={item:item,type:'choice',mode:'choice',options:item.options};
  R.prompt=item.prompt;R.note=item.note||'The sphere shows the state.';
  R.how='Choose one answer.';
  R.scene=function(){var r=vecOf(item.state);return {state:r,slice:vlen(r)<0.98?slicePlane(r):null};};
  R.classify=function(i){var o=item.options[i];return {tag:o.ok?'correct':o.tag,off:o.ok?0:1,i:i};};
  R.feedback=function(c){return c.tag==='correct'?'Correct.':item.options[c.i].fb;};
  R.reference=item.reference;
  R.result=item.result;R.answer=item.options.map(function(o){return !!o.ok;}).indexOf(true);
  R.extra=function(){
    var r=vecOf(item.state),s=item.sim,A=AXM[s.axis],p=(1+dot(r,A.v))/2;
    return s.shots.map(function(n,j){
      var est=[];for(var i=0;i<s.runs;i++)est.push(f2(2*sampleShots(p,n,hashStr(item.id+':'+j+':'+i))/n-1));
      return s.runs+' simulated runs of '+n.toLocaleString('en-US')+' shots, estimates of \u27e8'+A.name+'\u27e9: '+est.join(', ')+'.';
    }).join(' ');
  };
  R.respText=function(i){return item.options[i].t;};
  R.observe=function(sp,done){sp.draw();done();};
  return R;
}
function buildItem(item){
  switch(item.type){
    case 'locate':return buildLocate(item);
    case 'prob':return buildProb(item);
    case 'prob2':return buildProb2(item);
    case 'collapse':return buildCollapse(item);
    case 'decohere':return buildDecohere(item);
    case 'mixture':return buildMixture(item);
    case 'distinguish':return buildDistinguish(item);
    case 'choice':return buildChoice(item);
    default:return buildRotate(item);
  }
}

// Starter sets
var STARTER_S=[
  {id:'s01',concept:'S1',level:1,type:'locate',kind:'amp',theta:90,phi:0,text:'(|0\u27e9 + |1\u27e9)/\u221a2'},
  {id:'s02',concept:'S1',level:1,type:'locate',kind:'amp',theta:45,phi:0},
  {id:'s03',concept:'S1',level:2,type:'locate',kind:'amp',theta:90,phi:90,text:'(|0\u27e9 + i|1\u27e9)/\u221a2'},
  {id:'s04',concept:'S1',level:2,type:'locate',kind:'amp',theta:135,phi:0},
  {id:'s05',concept:'S1',level:3,type:'locate',kind:'amp',theta:45,phi:180,text:'cos(22.5\u00b0)|0\u27e9 \u2212 sin(22.5\u00b0)|1\u27e9'},
  {id:'s06',concept:'S1',level:3,type:'locate',kind:'orth',of:'plus'},
  {id:'s07',concept:'S1',level:3,type:'locate',kind:'orth',of:[45,0]},
  {id:'s08',concept:'S2',level:2,type:'locate',kind:'rphase',of:'plus',factor:'i',deg:90},
  {id:'s09',concept:'S2',level:2,type:'locate',kind:'gphase',of:'plusi',factor:'i',deg:90},
  {id:'s10',concept:'S2',level:3,type:'locate',kind:'rphase',of:'plus',factor:'\u22121',deg:180},
  {id:'s11',concept:'S2',level:3,type:'locate',kind:'gphase',of:[90,45],factor:'\u22121',deg:180},
  {id:'s12',concept:'S2',level:3,type:'distinguish',kind:'phase',A:'plus',B:'minus',textA:'|+\u27e9 = (|0\u27e9 + |1\u27e9)/\u221a2',textB:'|\u2212\u27e9 = (|0\u27e9 \u2212 |1\u27e9)/\u221a2'},
  {id:'s13',concept:'S2',level:3,type:'distinguish',kind:'gphase',A:'plus',B:'plus',textA:'(|0\u27e9 + |1\u27e9)/\u221a2',textB:'i(|0\u27e9 + |1\u27e9)/\u221a2'},
  {id:'s14',concept:'S2',level:3,type:'distinguish',kind:'phase',A:'plus',B:'plusi',textA:'(|0\u27e9 + |1\u27e9)/\u221a2',textB:'(|0\u27e9 + i|1\u27e9)/\u221a2'}
];
var STARTER_M=[
  {id:'m01',concept:'M1',level:1,type:'prob',state:[60,0],axis:'z'},
  {id:'m02',concept:'M1',level:2,type:'prob',state:[45,90],axis:'z'},
  {id:'m03',concept:'M1',level:3,type:'prob',state:[135,0],axis:'z'},
  {id:'m04',concept:'M2',level:1,type:'prob',state:[90,60],axis:'x'},
  {id:'m05',concept:'M2',level:2,type:'prob',state:[90,60],axis:'y'},
  {id:'m06',concept:'M2',level:3,type:'prob',state:[60,0],axis:'x'},
  {id:'m07',concept:'M2',level:3,type:'distinguish',kind:'phase',A:[60,0],B:[60,180],textA:'the state at \u03b8 = 60\u00b0, \u03c6 = 0\u00b0',textB:'the state at \u03b8 = 60\u00b0, \u03c6 = 180\u00b0'},
  {id:'m08',concept:'M3',level:2,type:'collapse',state:[60,0],axis:'z',outcome:1},
  {id:'m09',concept:'M3',level:3,type:'collapse',state:[60,0],axis:'x',outcome:-1},
  {id:'m10',concept:'M3',level:3,type:'prob2',state:[60,0],first:{axis:'z',outcome:1},axis:'z'},
  {id:'m11',concept:'M3',level:3,type:'prob2',state:[60,0],first:{axis:'z',outcome:1},axis:'x'}
];
var STARTER_N=[
  {id:'n01',concept:'N1',level:1,type:'mixture',p0:0.5},
  {id:'n02',concept:'N1',level:2,type:'distinguish',kind:'mixture',A:'plus',B:[0,0,0],textA:'|+\u27e9 = (|0\u27e9 + |1\u27e9)/\u221a2',textB:'|0\u27e9 or |1\u27e9 at random, half and half'},
  {id:'n03',concept:'N1',level:3,type:'mixture',p0:0.75},
  {id:'n04',concept:'N2',level:1,type:'decohere',state:'plus',ch:{kind:'depol',p:0.5}},
  {id:'n05',concept:'N2',level:1,type:'decohere',state:[45,0],ch:{kind:'dephase',b:0.5}},
  {id:'n06',concept:'N2',level:2,type:'decohere',state:'zero',ch:{kind:'dephase',b:0.5}},
  {id:'n07',concept:'N2',level:2,type:'decohere',state:'one',ch:{kind:'relax',a:0.5,b:Math.SQRT1_2}},
  {id:'n08',concept:'N2',level:3,type:'decohere',state:'plus',ch:{kind:'relax',a:0.25,b:0.5}},
  {id:'n09',concept:'N3',level:2,type:'choice',state:'plus',sim:{axis:'z',shots:[100],runs:6},
    prompt:'A noiseless qubit is prepared in |+\u27e9 again and again. You measure Z on 100 copies and estimate \u27e8Z\u27e9 from the counts. What do you expect?',
    options:[{t:'Exactly 0 every time',tag:'no-shot-noise',fb:'The true value is 0, but 100 shots give an estimate that scatters around it. Each shot is +1 or \u22121 at random, so the spread of the estimate is about 1/\u221a100 = 0.1.'},{t:'Close to 0, with a typical scatter of about 0.1',ok:true},{t:'Close to 0, with a typical scatter of about 0.5',tag:'spread-too-large',fb:'The scatter is smaller. With N shots the spread of the estimate is about 1/\u221aN, here 0.1.'},{t:'Close to +1',tag:'x-for-z',fb:'+1 is what an X measurement gives for |+\u27e9. Along z the state has no projection, so the true value is 0, and 100 shots scatter around it by about 0.1.'}],
    reference:'|+\u27e9 has no projection on the z axis, so \u27e8Z\u27e9 = 0 and each shot gives +1 or \u22121 with equal chance. The estimate from N shots scatters around 0 with a spread of about 1/\u221aN, here 0.1.',result:'The estimate scatters around 0 with a spread of about 0.1.'},
  {id:'n10',concept:'N3',level:3,type:'choice',state:'plus',sim:{axis:'x',shots:[100],runs:6},
    prompt:'The same noiseless qubit in |+\u27e9. Now you measure X on 100 copies and estimate \u27e8X\u27e9. What do you expect?',
    options:[{t:'Exactly +1 every time',ok:true},{t:'Close to +1, with a typical scatter of about 0.1',tag:'shot-noise-everywhere',fb:'There is no scatter here. |+\u27e9 lies on the x axis, so every shot gives + and the estimate is exactly +1. Shot noise vanishes when the state is at an end of the measurement axis.'},{t:'Close to 0, with a typical scatter of about 0.1',tag:'z-for-x',fb:'That describes a Z measurement. |+\u27e9 lies on the x axis, so an X measurement gives + every time and the estimate is exactly +1.'}],
    reference:'|+\u27e9 is at the end of the x axis, so every X measurement gives +. The spread of the estimate is \u221a((1 \u2212 \u27e8X\u27e9\u00b2)/N), which is zero here.',result:'Every shot gives +, so the estimate is exactly +1.'},
  {id:'n11',concept:'N3',level:3,type:'choice',state:[0.8,0,0],sim:{axis:'x',shots:[100,10000],runs:5},
    note:'The cross-section shows the true state, which the experimenter does not know.',
    prompt:'You prepare what should be |+\u27e9 on a real device and estimate \u27e8X\u27e9. With 100 shots the estimates scatter around 0.8. With 10,000 shots they settle at 0.80. What does this tell you?',
    options:[{t:'The state is |+\u27e9 and the missing 0.2 is shot noise',tag:'shrink-as-shot-noise',fb:'Shot noise shrinks as 1/\u221aN. With 10,000 shots it is about 0.006, far too small to explain a gap of 0.2. A gap that survives more shots is systematic.'},{t:'The gap is systematic: decoherence, or an error in preparing or reading out the qubit',ok:true},{t:'Nothing yet, more shots are needed',tag:'more-shots',fb:'More shots will not close the gap. The spread at 10,000 shots is already about 0.006. The estimate has converged to 0.80, so the gap is systematic.'}],
    reference:'Shot noise scatters the estimate by about \u221a((1 \u2212 \u27e8X\u27e9\u00b2)/N) and shrinks as N grows. A shortfall that stays the same with 100 times more shots is not statistical. Decoherence or a preparation error shortens the x component of the state itself. A readout error leaves the state alone and misreports some outcomes. Either way the value stays below 1 however many shots are taken.',result:'The gap is systematic. In this example the state itself has an x component of 0.8.'}
];

// Generated items
function pick(rnd,a){return a[Math.floor(rnd()*a.length)];}
function genS(n,seed){
  var rnd=mulberry32((seed|0)+n*104729+11),th=pick(rnd,[45,90,135]),ph=pick(rnd,[0,45,90,135,180,225,270,315]);
  if(rnd()<0.3)return {id:'gs'+n,concept:'S1',level:3,type:'locate',kind:'orth',of:[th,ph],generated:true};
  if(rnd()<0.25)return {id:'gs'+n,concept:'S2',level:3,type:'locate',kind:'gphase',of:[th,ph],factor:pick(rnd,['i','\u22121','\u2212i']),deg:90,generated:true};
  return {id:'gs'+n,concept:'S1',level:3,type:'locate',kind:'amp',theta:th,phi:ph,generated:true};
}
function genG(n,seed){var it=genItem(n,seed);it.type='rotate';return it;}
function genM(n,seed){
  var rnd=mulberry32((seed|0)+n*130003+23),th=pick(rnd,[30,45,60,90,120,135,150]),ph=pick(rnd,[0,45,60,90,120,180,270]),ax=pick(rnd,['z','x','y','x','z']);
  if(rnd()<0.25){var a2=pick(rnd,['z','x']),o=pick(rnd,[1,-1]);if((1+o*dot(fromAngles(th,ph),AXM[a2].v))/2<0.05)o=-o;return {id:'gm'+n,concept:'M3',level:3,type:'prob2',state:[th,ph],first:{axis:a2,outcome:o},axis:pick(rnd,['z','x','y']),generated:true};}
  return {id:'gm'+n,concept:ax==='z'?'M1':'M2',level:3,type:'prob',state:[th,ph],axis:ax,generated:true};
}
function genN(n,seed){
  var rnd=mulberry32((seed|0)+n*15485863+37),st=pick(rnd,['zero','one','plus','minus',[45,0],[135,0],[90,90],[45,180]]),k=pick(rnd,['depol','dephase','relax','relax']);
  if(rnd()<0.2)return {id:'gn'+n,concept:'N1',level:3,type:'mixture',p0:pick(rnd,[0.25,0.5,0.75,0.875]),generated:true};
  var ch=k==='depol'?{kind:'depol',p:pick(rnd,[0.25,0.5,0.75])}:k==='dephase'?{kind:'dephase',b:pick(rnd,[0.25,0.5,0.75])}:pick(rnd,[{kind:'relax',a:0.25,b:0.5},{kind:'relax',a:0.5,b:Math.SQRT1_2},{kind:'relax',a:0.5,b:0.5}]);
  return {id:'gn'+n,concept:'N2',level:3,type:'decohere',state:st,ch:ch,generated:true};
}
var GROUPS={
  S:{name:'States',concepts:['S1','S2'],starter:STARTER_S,gen:genS},
  G:{name:'Gates',concepts:['G1','G2','G3','G4'],starter:STARTER_G,gen:genG},
  M:{name:'Measurement',concepts:['M1','M2','M3'],starter:STARTER_M,gen:genM},
  N:{name:'Noise',concepts:['N1','N2','N3'],starter:STARTER_N,gen:genN}
};
var GROUP_ORDER=['S','G','M','N'];
STARTER_G.forEach(function(it){it.type='rotate';});

// Self-checks of the noise channels
function mm(A,B){var C=[[[0,0],[0,0]],[[0,0],[0,0]]];for(var i=0;i<2;i++)for(var j=0;j<2;j++)for(var k=0;k<2;k++)C[i][j]=cadd(C[i][j],cmul(A[i][k],B[k][j]));return C;}
function dag(A){return [[[A[0][0][0],-A[0][0][1]],[A[1][0][0],-A[1][0][1]]],[[A[0][1][0],-A[0][1][1]],[A[1][1][0],-A[1][1][1]]]];}
function rhoOf(r){return [[[(1+r[2])/2,0],[r[0]/2,-r[1]/2]],[[r[0]/2,r[1]/2],[(1-r[2])/2,0]]];}
function vecOfRho(R){return [2*R[1][0][0],2*R[1][0][1],R[0][0][0]-R[1][1][0]];}
function krausApply(Ks,r){var out=[[[0,0],[0,0]],[[0,0],[0,0]]],rho=rhoOf(r);Ks.forEach(function(K){var t=mm(mm(K,rho),dag(K));for(var i=0;i<2;i++)for(var j=0;j<2;j++)out[i][j]=cadd(out[i][j],t[i][j]);});return vecOfRho(out);}
function selfChecks2(){
  var out=[],test=[[0,0,1],[0,0,-1],[1,0,0],fromAngles(60,40),[0.3,-0.2,0.5]];
  function near(a,b){return vdist(a,b)<1e-9;}
  function I(s){return [[[s,0],[0,0]],[[0,0],[s,0]]];}
  var X=NAMED.X.std,Y=NAMED.Y.std,Z=NAMED.Z.std;
  function sc(M,s){return M.map(function(row){return row.map(function(c){return [c[0]*s,c[1]*s];});});}
  var p=0.4,q=Math.sqrt(p/4);
  out.push({name:'Depolarizing channel matches its Kraus form',ok:test.every(function(r){return near(krausApply([I(Math.sqrt(1-3*p/4)),sc(X,q),sc(Y,q),sc(Z,q)],r),chDepol(p,r));})});
  var a=0.36,g=1-a,AD=[[[[1,0],[0,0]],[[0,0],[Math.sqrt(a),0]]],[[[0,0],[Math.sqrt(g),0]],[[0,0],[0,0]]]];
  out.push({name:'Relaxation matches amplitude damping with T2 = 2T1',ok:test.every(function(r){return near(krausApply(AD,r),chRelax(a,Math.sqrt(a),r));})});
  var b=0.55,PD=[I(Math.sqrt((1+b)/2)),sc(Z,Math.sqrt((1-b)/2))];
  out.push({name:'Pure dephasing matches its Kraus form',ok:test.every(function(r){return near(krausApply(PD,r),chRelax(1,b,r));})});
  out.push({name:'Measurement probabilities add to 1 on every axis',ok:test.every(function(r){return ['x','y','z'].every(function(k){var pr=dot(r,AXM[k].v);return Math.abs((1+pr)/2+(1-pr)/2-1)<1e-12;});})});
  out.push({name:'Born rule from amplitudes matches the projection formula',ok:[fromAngles(60,40),fromAngles(130,250),[1,0,0]].every(function(r){var k=ketOf(r);return Math.abs(k[0][0]*k[0][0]+k[0][1]*k[0][1]-(1+r[2])/2)<1e-12;})});
  var all=[].concat(STARTER_S,STARTER_G,STARTER_M,STARTER_N),ok=true;
  all.forEach(function(it){try{var R=buildItem(it);if(!R.prompt||!R.reference||!R.result)ok=false;}catch(e){ok=false;}});
  out.push({name:'All '+all.length+' starter items build with a prompt, a result and a reference',ok:ok});
  return out;
}
