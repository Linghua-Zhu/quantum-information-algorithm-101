// Unit 0: practice items on vectors, projections, cross products, fields and complex numbers
var FIELD_K=4;
function vt(v){return '('+nt(v[0])+', '+nt(v[1])+')';}
function ct(z){
  var a=Math.round(z[0]*100)/100,b=Math.round(z[1]*100)/100,re=a?nt(a):'',im='';
  if(b){var m=Math.abs(b),ms=m===1?'':nt(m);im=(re?(b<0?' − ':' + '):(b<0?'−':''))+ms+'i';}
  if(!re&&!im)return '0';
  return re+im;
}
function sq(x){return (x<0?'('+nt(x)+')':nt(x))+'²';}
function degT(d){return nt(d)+'°';}
function polarT(r,deg){return (Math.abs(r-1)<1e-9?'':nt(r))+'e^(i·'+degT(deg)+')';}
function argDeg(z){var a=v2ang(z);if(a<=-180+1e-9)a+=360;return a;}
function v3of(v){return v.length===3?v:[v[0],v[1],0];}
var TOLP=0.13;
function pushP(ds,correct,tag,v,test){
  if(v&&v2dist(v,correct)<0.1)return;
  for(var i=0;i<ds.length;i++)if(ds[i].v&&v&&v2dist(ds[i].v,v)<0.1)return;
  ds.push({tag:tag,v:v,test:test});
}
function classPlane(p,correct,ds){
  var off=v2dist(p,correct);
  if(off<=TOLP)return {tag:'correct',off:off};
  var best=null,bd=1e9;
  ds.forEach(function(d){if(!d.v)return;var q=v2dist(p,d.v);if(q<=TOLP&&q<bd){bd=q;best=d;}});
  if(best)return {tag:best.tag,off:off};
  for(var i=0;i<ds.length;i++)if(ds[i].test&&ds[i].test(p))return {tag:ds[i].tag,off:off};
  return {tag:'unclassified',off:off};
}
function pushNum(ds,correct,tag,x,lo,hi){
  if(!(x>=lo-1e-9&&x<=hi+1e-9)||Math.abs(x-correct)<0.06)return;
  for(var i=0;i<ds.length;i++)if(Math.abs(ds[i].x-x)<0.06)return;
  ds.push({tag:tag,x:x});
}
function fieldAt(charges,P){
  var E=[0,0];
  charges.forEach(function(c){var d=v2sub(P,c.p),r=v2len(d);if(r<1e-9)return;E=v2add(E,v2scale(d,FIELD_K*c.q/(r*r*r)));});
  return E;
}

// Shared shape of a plane item
function planeItem(item,sp){
  var R={item:item,type:item.type,mode:sp.mode||'point',plane:sp.space!=='3d',answer:sp.answer};
  R.prompt=sp.prompt;R.note=sp.note||'';R.how=sp.how||(R.mode==='point'?'Click or tap the grid where the tip of the arrow belongs.':R.mode==='number'?'Type the number.':'Choose one answer.');
  R.scene=sp.scene;R.result=sp.result;R.reference=sp.reference;R.replay=!!sp.reveal;R.nofig=!!sp.nofig;
  if(R.mode==='number'){R.numLabel=sp.numLabel;R.numMin=sp.numMin;R.numMax=sp.numMax;R.unit=sp.unit||'';}
  if(R.mode==='choice'){R.options=sp.options;R.answer=sp.options.map(function(o){return !!o.ok;}).indexOf(true);}
  R.classify=function(x){
    if(R.mode==='point')return sp.space==='3d'?classPoint(x,sp.answer,sp.ds,true):classPlane(x,sp.answer,sp.ds);
    if(R.mode==='number'){var c={off:Math.abs(x-sp.answer)};if(c.off<=(sp.tol||0.03))c.tag='correct';else{var best=null,bd=1e9;sp.ds.forEach(function(d){var q=Math.abs(x-d.x);if(q<=(sp.tol||0.03)+1e-9&&q<bd){bd=q;best=d;}});c.tag=best?best.tag:'unclassified';}return c;}
    var o=sp.options[x];return {tag:o.ok?'correct':o.tag,off:o.ok?0:1,i:x};
  };
  R.feedback=function(c){if(c.tag==='correct')return 'Correct.';if(R.mode==='choice')return sp.options[c.i].fb;return sp.fb(c);};
  R.respText=function(x){if(R.mode==='point')return sp.space==='3d'?dirName(x):vt(x);if(R.mode==='number')return nt(x)+(sp.unit||'');return sp.options[x].t;};
  R.observe=function(fig,done){if(sp.reveal)sp.reveal(fig,done);else{fig.draw();done();}};
  return R;
}
function arcAB(a,b,r,label){var a0=v2ang(a),d=Math.atan2(v2cross(a,b),v2dot(a,b))/DEG;return {a:a0,b:a0+d,r:r,label:label};}
function vecs(a,b,la,lb){return [{v:a,cls:'ma',label:la||'a'},{v:b,cls:'mb',label:lb||'b'}];}

// V: adding vectors
function specAdd(item){
  var a=item.a,b=item.b,c1=item.c1==null?1:item.c1,c2=item.c2==null?1:item.c2,ans=v2add(v2scale(a,c1),v2scale(b,c2)),ds=[];
  var ca=v2scale(a,c1),cb=v2scale(b,c2),cterm=function(c,n){return c===1?n:c===-1?'−'+n:nt(c)+n;};
  var expr=cterm(c1,'a')+(c2<0?' − ':' + ')+cterm(Math.abs(c2),'b');
  if(c1===1&&c2===1){pushP(ds,ans,'sub-for-add',v2sub(a,b));pushP(ds,ans,'sub-for-add',v2sub(b,a));pushP(ds,ans,'average-for-sum',v2scale(ans,0.5));}
  else if(c1===1&&c2===-1){pushP(ds,ans,'add-for-sub',v2add(a,b));pushP(ds,ans,'rev-sub',v2sub(b,a));}
  else{pushP(ds,ans,'scaled-wrong',v2add(a,v2scale(b,c2>0?1:-1)));pushP(ds,ans,'scaled-wrong',v2add(v2scale(a,c1),b));pushP(ds,ans,'add-for-sub',v2add(ca,v2scale(cb,-1)));}
  pushP(ds,ans,'only-one-vector',ca);pushP(ds,ans,'only-one-vector',cb);pushP(ds,ans,'only-one-vector',a);pushP(ds,ans,'only-one-vector',b);
  pushP(ds,ans,'component-sign',[ans[0],-ans[1]]);pushP(ds,ans,'component-sign',[-ans[0],ans[1]]);
  var how=ans[0]===0&&ans[1]===0?' If the result is the zero vector, click the origin.':'';
  return {mode:'point',answer:ans,ds:ds,
    prompt:'a = '+vt(a)+' and b = '+vt(b)+'. Place '+expr+'.',
    note:item.level===1?'Shown: b moved so that its tail sits on the tip of a. Vectors add tip to tail.':item.level===2?'Add component by component, or slide one arrow to the tip of the other.':'',
    how:'Click or tap the grid where the tip of '+expr+' belongs.'+how,
    scene:function(){var sc={plane:true,vectors:vecs(a,b)};if(item.level===1&&c1===1&&c2===1)sc.ghost={tail:a,v:b};return sc;},
    fb:function(c){
      switch(c.tag){
        case 'sub-for-add':return 'That is a difference of the two vectors, not the sum. For a + b, slide b so its tail sits on the tip of a. The sum runs from the origin to the tip of b.';
        case 'add-for-sub':return 'That is the sum. Subtracting b means adding −b, the arrow b turned around. Slide −b to the tip of a.';
        case 'rev-sub':return 'That is b − a, the vector pointing the other way. a − b runs from the tip of b to the tip of a.';
        case 'average-for-sum':return 'That is the midpoint between the two tips, half the sum. The sum itself reaches twice as far.';
        case 'only-one-vector':return 'That is one of the vectors on its own. Both have to be added, component by component.';
        case 'component-sign':return 'One component has the wrong sign. Add the x components together and the y components together, keeping each sign.';
        case 'scaled-wrong':return 'A coefficient was left out. Multiply each vector by its number first, then add the results.';
        default:return 'Not there. Add the components: x = '+nt(ca[0])+' + '+nt(cb[0])+' and y = '+nt(ca[1])+' + '+nt(cb[1])+'. The result is '+vt(ans)+'.';
      }
    },
    result:expr+' = '+vt(ans)+'.',
    reference:'Component by component: ('+nt(ca[0])+' + '+nt(cb[0])+', '+nt(ca[1])+' + '+nt(cb[1])+') = '+vt(ans)+'. On the figure, '+(c2<0?'turn b around to get −b, then ':'')+'slide the second arrow so its tail sits on the tip of the first. The result runs from the origin to the tip of the second arrow.',
    reveal:function(fig,done){
      var pr=fig.pred;fig.load({plane:true,vectors:vecs(a,b)});fig.pred=pr;fig.draw();
      var first={tail:[0,0],v:ca,cls:'ma',label:cterm(c1,'a')},second={v:cb,from:[0,0],to:ca,cls:'mb',label:cterm(c2,'b')};
      fig.animateSlide([second],function(){fig.vectors=vecs(a,b).concat([first,{tail:ca,v:cb,cls:'mb'}]);fig.state=ans;fig.stateLabel=expr;fig.draw();done();});
    }};
}
// V: components and length
function specComp(item){
  var L=item.len,th=item.deg,v=[L*Math.cos(th*DEG),L*Math.sin(th*DEG)],want=item.which,ans=want==='x'?v[0]:v[1],ds=[],lo=-4.5,hi=4.5;
  pushNum(ds,ans,'sin-cos-swapped',want==='x'?v[1]:v[0],lo,hi);pushNum(ds,ans,'component-sign',-ans,lo,hi);pushNum(ds,ans,'length-for-component',L,lo,hi);pushNum(ds,ans,'length-for-component',-L,lo,hi);
  return {mode:'number',answer:ans,ds:ds,numLabel:want+' component',numMin:lo,numMax:hi,tol:0.03,
    prompt:'A vector has length '+nt(L)+' and makes an angle of '+degT(th)+' with the +x axis, measured counterclockwise. What is its '+want+' component?',
    note:item.level===1?'Shown: the vector, its angle, and the dashed drops to the two axes.':item.level===2?'x = length · cos(angle), y = length · sin(angle).':'',
    scene:function(){var sc={plane:true,vectors:[{v:v,cls:'ma'}],arcs:[{a:0,b:th,r:0.9,label:'θ'}]};if(item.level===1)sc.lines=[{a:v,b:[v[0],0]},{a:v,b:[0,v[1]]}];return sc;},
    fb:function(c){
      switch(c.tag){
        case 'sin-cos-swapped':return 'That is the other component. With the angle measured from the +x axis, x = L cos θ and y = L sin θ.';
        case 'component-sign':return 'The size is right but the sign is wrong. The '+want+' component is '+(ans<0?'negative':'positive')+' because the arrow points '+(want==='x'?(ans<0?'left':'right'):(ans<0?'down':'up'))+'.';
        case 'length-for-component':return 'That is the length of the whole vector. A component is the length times the cosine or the sine of the angle.';
        default:return 'Not quite. '+want+' = '+nt(L)+' · '+(want==='x'?'cos':'sin')+'('+degT(th)+') = '+f2(ans)+'.';
      }
    },
    result:want+' = '+nt(L)+' · '+(want==='x'?'cos':'sin')+'('+degT(th)+') = '+f2(ans)+'.',
    reference:'Drop a perpendicular from the tip to each axis. The x component is the shadow on the x axis, L cos θ, and the y component is the shadow on the y axis, L sin θ. Here that gives ('+f2(v[0])+', '+f2(v[1])+').',
    reveal:function(fig,done){fig.lines=[{a:v,b:[v[0],0]},{a:v,b:[0,v[1]]}];fig.marks=[{p:[v[0],0],cls:'foot',label:f2(v[0]),dy:14,dx:-6},{p:[0,v[1]],cls:'foot',label:f2(v[1]),dx:-30,dy:-4}];fig.draw();done();}};
}
function specLen(item){
  var v=item.v,ans=v2len(v),ds=[],hi=30;
  pushNum(ds,ans,'added-components',Math.abs(v[0])+Math.abs(v[1]),0,hi);pushNum(ds,ans,'no-sqrt',v[0]*v[0]+v[1]*v[1],0,hi);pushNum(ds,ans,'one-component',Math.max(Math.abs(v[0]),Math.abs(v[1])),0,hi);
  return {mode:'number',answer:ans,ds:ds,numLabel:'length',numMin:0,numMax:hi,tol:0.03,
    prompt:'What is the length of the vector '+vt(v)+'?',
    note:item.level===1?'The vector and its two components form a right triangle.':'',
    scene:function(){var sc={plane:true,vectors:[{v:v,cls:'ma'}]};if(item.level===1)sc.lines=[{a:v,b:[v[0],0]},{a:[0,0],b:[v[0],0]}];return sc;},
    fb:function(c){
      switch(c.tag){
        case 'added-components':return 'That adds the two components. They are the legs of a right triangle, so the length is the hypotenuse: the square root of the sum of their squares.';
        case 'no-sqrt':return 'That is the sum of the squares. The length is its square root.';
        case 'one-component':return 'That is the larger component alone. Both components contribute: length = √(x² + y²).';
        default:return 'Not quite. Length = √('+sq(v[0])+' + '+sq(v[1])+') = '+f2(ans)+'.';
      }
    },
    result:'Length = √('+nt(v[0]*v[0])+' + '+nt(v[1]*v[1])+') = '+f2(ans)+'.',
    reference:'The components are the two legs of a right triangle and the vector is the hypotenuse. Pythagoras: length = √(x² + y²) = √('+nt(v[0]*v[0])+' + '+nt(v[1]*v[1])+') = '+f2(ans)+'.',
    reveal:function(fig,done){fig.lines=[{a:v,b:[v[0],0]},{a:[0,0],b:[v[0],0]}];fig.draw();done();}};
}
// P: dot product, angle and projection
function specDot(item){
  var a=item.a,b=item.b,ans=v2dot(a,b),ds=[],hi=30,lo=-30,la=v2len(a),lb=v2len(b);
  pushNum(ds,ans,'dot-product-of-lengths',la*lb,lo,hi);pushNum(ds,ans,'dot-sign',-ans,lo,hi);pushNum(ds,ans,'cross-for-dot',Math.abs(v2cross(a,b)),lo,hi);pushNum(ds,ans,'added-components',a[0]+b[0]+a[1]+b[1],lo,hi);
  return {mode:'number',answer:ans,ds:ds,numLabel:'a · b',numMin:lo,numMax:hi,tol:0.03,
    prompt:'a = '+vt(a)+' and b = '+vt(b)+'. What is a · b?',
    note:item.level===1?'a · b = aₓbₓ + aᵧbᵧ. It is also |a| |b| cos θ.':'',
    scene:function(){return {plane:true,vectors:vecs(a,b),arcs:item.level<3?[arcAB(a,b,0.8,'θ')]:[]};},
    fb:function(c){
      switch(c.tag){
        case 'dot-product-of-lengths':return 'That is |a| |b|, the product of the lengths. The dot product also carries cos θ, which is 1 only for parallel vectors.';
        case 'dot-sign':return 'The size is right but the sign is wrong. The dot product is negative when the angle between the vectors is more than 90°, and positive when it is less.';
        case 'cross-for-dot':return 'That is |a| |b| sin θ, the size of the cross product. The dot product uses the cosine: aₓbₓ + aᵧbᵧ.';
        case 'added-components':return 'That adds all four components. The dot product multiplies matching components and adds the two products.';
        default:return 'Not quite. a · b = '+nt(a[0])+'·'+nt(b[0])+' + '+nt(a[1])+'·'+nt(b[1])+' = '+nt(ans)+'.';
      }
    },
    result:'a · b = '+nt(a[0])+'·'+nt(b[0])+' + '+nt(a[1])+'·'+nt(b[1])+' = '+nt(ans)+'.',
    reference:'Multiply matching components and add: '+nt(a[0]*b[0])+' + '+nt(a[1]*b[1])+' = '+nt(ans)+'. As a check, |a| |b| cos θ = '+f2(la)+' · '+f2(lb)+' · cos('+Math.round(v2between(a,b))+'°) gives the same number. The sign says whether the vectors lean the same way.',
    reveal:function(fig,done){fig.arcs=[arcAB(a,b,0.8,Math.round(v2between(a,b))+'°')];fig.draw();done();}};
}
function specAng(item){
  var a=item.a,b=item.b,ans=v2between(a,b),ds=[];
  pushNum(ds,ans,'supplement',180-ans,0,180);pushNum(ds,ans,'one-vector-angle',Math.abs(v2ang(a)),0,180);pushNum(ds,ans,'one-vector-angle',Math.abs(v2ang(b)),0,180);pushNum(ds,ans,'assumed-perpendicular',90,0,180);
  return {mode:'number',answer:ans,ds:ds,numLabel:'angle',numMin:0,numMax:180,unit:'°',tol:1,
    prompt:'a = '+vt(a)+' and b = '+vt(b)+'. What is the angle between them, in degrees?',
    note:item.level===1?'cos θ = a · b / (|a| |b|). The angle between two vectors is between 0° and 180°.':'',
    scene:function(){return {plane:true,vectors:vecs(a,b)};},
    fb:function(c){
      switch(c.tag){
        case 'supplement':return 'That is 180° minus the angle. Check the sign of the dot product: it is '+(v2dot(a,b)>0?'positive, so the angle is less than 90°':v2dot(a,b)<0?'negative, so the angle is more than 90°':'zero, so the angle is 90°')+'.';
        case 'one-vector-angle':return 'That is the angle one vector makes with the x axis. The question asks for the angle between the two vectors.';
        case 'assumed-perpendicular':return 'They are not perpendicular. Two vectors are perpendicular only when their dot product is 0, and here a · b = '+nt(v2dot(a,b))+'.';
        default:return 'Not quite. cos θ = '+nt(v2dot(a,b))+' / ('+f2(v2len(a))+' · '+f2(v2len(b))+') = '+f2(v2dot(a,b)/(v2len(a)*v2len(b)))+', so θ = '+f2(ans)+'°.';
      }
    },
    result:'θ = '+f2(ans)+'°.',
    reference:'cos θ = a · b / (|a| |b|) = '+nt(v2dot(a,b))+' / ('+f2(v2len(a))+' · '+f2(v2len(b))+') = '+f2(v2dot(a,b)/(v2len(a)*v2len(b)))+'. So θ = '+f2(ans)+'°. The sign of the dot product tells you at once whether the angle is below or above 90°.',
    reveal:function(fig,done){fig.arcs=[arcAB(a,b,0.8,f2(ans)+'°')];fig.draw();done();}};
}
function specProj(item){
  var a=item.a,b=item.b,ans=v2proj(a,b),ds=[],ub=v2unit(b);
  pushP(ds,ans,'proj-swapped',v2proj(b,a));pushP(ds,ans,'unit-vector',ub);pushP(ds,ans,'no-projection',a);pushP(ds,ans,'perp-component',v2sub(a,ans));pushP(ds,ans,'unnormalized',v2scale(b,v2dot(a,b)));pushP(ds,ans,'proj-sign',v2scale(ans,-1));
  pushP(ds,ans,'off-the-line',null,function(p){return Math.abs(v2cross(p,ub))>0.2;});
  var lineB=[{a:v2scale(ub,-4.5),b:v2scale(ub,4.5),cls:'thin'}];
  return {mode:'point',answer:ans,ds:ds,
    prompt:'a = '+vt(a)+' and b = '+vt(b)+'. Place the projection of a onto the direction of b.',
    note:item.level===1?'Shown: the line through b. The projection is the foot of the perpendicular from the tip of a to that line.':item.level===2?'The projection lies on the line of b and has length a · b / |b|.':'',
    how:'Click or tap the grid where the tip of the projection belongs.',
    scene:function(){var sc={plane:true,vectors:vecs(a,b)};if(item.level===1)sc.lines=lineB;return sc;},
    fb:function(c){
      switch(c.tag){
        case 'proj-swapped':return 'That is the projection of b onto a. The question projects a onto the direction of b, so the answer lies on the line of b.';
        case 'unit-vector':return 'That is the unit vector along b. The projection lies along the line of b, but its length is |a · b| / |b|, the shadow of a on that line'+(v2dot(a,b)<0?', and here it points against b because a · b is negative':'')+'.';
        case 'no-projection':return 'That is a itself. The projection is the shadow of a on the line of b: drop a perpendicular from the tip of a to that line.';
        case 'perp-component':return 'That is the part of a perpendicular to b, what is left after the projection is removed. The projection is the part along b.';
        case 'unnormalized':return 'That is (a · b) b, which is too long. Divide by |b|², or use the unit vector of b: the length of the projection is a · b / |b|.';
        case 'proj-sign':return 'The projection points the wrong way. Its sign follows a · b, which is '+(v2dot(a,b)>0?'positive':'negative')+' here.';
        case 'off-the-line':return 'The projection onto the direction of b must lie on the line through b.';
        default:return 'Not there. The projection is (a · b / |b|²) b = '+vt(ans)+'.';
      }
    },
    result:'The projection of a onto b is '+vt(ans)+'.',
    reference:'Drop a perpendicular from the tip of a to the line through b. The foot is the projection. In numbers it is (a · b / |b|²) b = ('+nt(v2dot(a,b))+' / '+nt(v2dot(b,b))+') '+vt(b)+' = '+vt(ans)+'. The component of a along b is a · b / |b| = '+f2(v2dot(a,b)/v2len(b))+': the length of the projection, with a minus sign when it points against b.',
    reveal:function(fig,done){fig.lines=lineB.concat([{a:a,b:ans}]);fig.marks=[{p:ans,cls:'foot'}];fig.state=ans;fig.draw();done();}};
}
// X: cross product
function specCross(item){
  var a=v3of(item.a),b=v3of(item.b),c=cross(a,b),ans=unit(c),ds=[];
  pushD(ds,ans,'left-hand',scale(ans,-1),true);pushD(ds,ans,'in-plane',unit(a),true);pushD(ds,ans,'in-plane',unit(b),true);
  if(vlen(add(a,b))>1e-6)pushD(ds,ans,'sum-for-cross',unit(add(a,b)),true);if(vlen(add(a,scale(b,-1)))>1e-6)pushD(ds,ans,'sum-for-cross',unit(add(a,scale(b,-1))),true);
  function name(v){return isCardinal3(v)||'('+f2(v[0])+', '+f2(v[1])+', '+f2(v[2])+')';}
  return {mode:'point',space:'3d',answer:ans,ds:ds,
    prompt:'a points along '+name(a)+' and b points along '+name(b)+'. Place the direction of a × b.',
    note:item.level===1?'Shown: the two vectors and the plane they lie in. a × b is perpendicular to that plane. Right hand: fingers along a, curl toward b, thumb gives a × b.':item.level===2?'a × b is perpendicular to both a and b. The right hand picks which of the two perpendicular directions.':'',
    how:'Click or tap the sphere in the direction of a × b. Drag to turn the view.',
    scene:function(){var sc={axes:'xyz',marks:[{v:unit(a),cls:'ma',vec:true,label:'a'},{v:unit(b),cls:'mb',vec:true,label:'b'}]};if(item.level===1)sc.guides=[{n:ans,h:0}];return sc;},
    fb:function(c){
      switch(c.tag){
        case 'left-hand':return 'That is b × a, the opposite direction. Fingers of the right hand along a, curl them toward b, and the thumb points along a × b.';
        case 'in-plane':return 'That is one of the two vectors. a × b is perpendicular to both of them, so it sticks out of their plane.';
        case 'sum-for-cross':return 'That lies in the plane of a and b, like their sum or difference. The cross product is perpendicular to that plane.';
        default:return 'Not there. a × b is perpendicular to both vectors and the right-hand rule picks the side: '+name(ans)+'.';
      }
    },
    result:'a × b points along '+name(ans)+'.',
    reference:'a × b is perpendicular to the plane of a and b. Of the two perpendicular directions, the right hand picks one: fingers along a, curl toward b, thumb along a × b. Here that gives '+name(ans)+'. The order matters: b × a points the other way.',
    reveal:function(fig,done){fig.marks=[{v:unit(a),cls:'ma',vec:true,label:'a'},{v:unit(b),cls:'mb',vec:true,label:'b'}];fig.guides=[{n:ans,h:0}];fig.state=ans;fig.draw();done();}};
}
function dirName(v){var c=isCardinal3(v);if(c)return c;var a=toAngles(v);return 'θ = '+Math.round(a.theta)+'°, φ = '+(Math.round(a.phi)%360)+'°';}
function isCardinal3(v){var u=unit(v),N=[['+x',[1,0,0]],['−x',[-1,0,0]],['+y',[0,1,0]],['−y',[0,-1,0]],['+z',[0,0,1]],['−z',[0,0,-1]]];for(var i=0;i<N.length;i++)if(angDeg(N[i][1],u)<1)return N[i][0];return null;}
function specCrossMag(item){
  var a=item.a,b=item.b,ans=Math.abs(v2cross(a,b)),ds=[],hi=30,la=v2len(a),lb=v2len(b);
  pushNum(ds,ans,'cos-for-sin',Math.abs(v2dot(a,b)),0,hi);pushNum(ds,ans,'ignored-angle',la*lb,0,hi);pushNum(ds,ans,'cross-sign',Math.abs(a[0]*b[1]+a[1]*b[0]),0,hi);
  return {mode:'number',answer:ans,ds:ds,numLabel:'|a × b|',numMin:0,numMax:hi,tol:0.03,
    prompt:'a = '+vt(a)+' and b = '+vt(b)+' lie in the xy plane. What is the size of a × b?',
    note:item.level===1?'|a × b| = |a| |b| sin θ, the area of the parallelogram spanned by a and b. In components it is |aₓbᵧ − aᵧbₓ|.':'',
    scene:function(){var sc={plane:true,vectors:vecs(a,b)};if(item.level===1)sc.lines=[{a:a,b:v2add(a,b),cls:'thin'},{a:b,b:v2add(a,b),cls:'thin'}];return sc;},
    fb:function(c){
      switch(c.tag){
        case 'cos-for-sin':return 'That is the dot product, |a| |b| cos θ. The cross product uses the sine: |aₓbᵧ − aᵧbₓ|.';
        case 'ignored-angle':return 'That is |a| |b|, which is the size only when the vectors are perpendicular. Multiply by sin θ, or use aₓbᵧ − aᵧbₓ.';
        case 'cross-sign':return 'The cross terms are right, but they are subtracted, not added: |aₓbᵧ − aᵧbₓ|.';
        default:return 'Not quite. |a × b| = |'+nt(a[0])+'·'+nt(b[1])+' − '+nt(a[1])+'·'+nt(b[0])+'| = '+nt(ans)+'.';
      }
    },
    result:'|a × b| = |'+nt(a[0])+'·'+nt(b[1])+' − '+nt(a[1])+'·'+nt(b[0])+'| = '+nt(ans)+'.',
    reference:ans<1e-9?'a and b are parallel, so the parallelogram they span has no area and a × b is the zero vector: |aₓbᵧ − aᵧbₓ| = 0.':'For two vectors in the xy plane, a × b points along ±z and its size is |aₓbᵧ − aᵧbₓ| = '+nt(ans)+'. That number is the area of the parallelogram with sides a and b, which is |a| |b| sin θ.',
    reveal:function(fig,done){fig.lines=[{a:a,b:v2add(a,b),cls:'thin'},{a:b,b:v2add(a,b),cls:'thin'}];fig.draw();done();}};
}
function specSense(item){
  var n=item.axis,v=item.from,ans=unit(cross(n,v)),opts=[];
  function nm(u){return isCardinal3(u);}
  opts.push({t:'Toward '+nm(ans),ok:true});
  opts.push({t:'Toward '+nm(scale(ans,-1)),tag:'left-hand',fb:'That is the sense of a negative turn. With the right thumb along '+nm(n)+', the fingers curl from '+nm(v)+' toward '+nm(ans)+'. It is the direction of n × v.'});
  opts.push({t:'Toward '+nm(n)+', the axis itself',tag:'toward-axis',fb:'A turn never moves a point toward its axis. The point circles around the axis, staying at the same distance from it. It starts off along n × v, here '+nm(ans)+'.'});
  opts.push({t:'It does not move',tag:'stays',fb:'Only points on the axis stay put. '+nm(v)+' is perpendicular to the axis, so it moves along the circle around the axis, starting toward '+nm(ans)+'.'});
  var order=seededOrder(opts,item.id);
  return {mode:'choice',space:'3d',options:order,
    prompt:'A positive turn about the '+nm(n)+' axis: right thumb along '+nm(n)+', fingers show the sense. A point at '+nm(v)+' starts moving in which direction?',
    note:item.level===1?'The first motion of a point at v under a turn about n is along n × v.':'',
    scene:function(){return {axes:'xyz',state:v,hint:{axis:n,sense:item.level<3?1:0}};},
    result:'The point at '+nm(v)+' starts off toward '+nm(ans)+', along n × v.',
    reference:'A turn about n moves a point at v along the circle around n. The first motion is along n × v, here '+nm(n)+' × '+nm(v)+' = '+nm(ans)+'. This is the rule that Unit 1 uses for every gate: thumb along the axis, fingers give the sense.',
    reveal:function(fig,done){fig.load({axes:'xyz',state:v,ghost:v,hint:{axis:n,sense:1}});fig.animate([{from:v,axis:n,angle:90*DEG}],function(){fig.state=ans;fig.draw();done();});}};
}
// F: fields of point charges
function chargeMarks(ch){return ch.map(function(c,i){return {p:c.p,cls:c.q>0?'plus':'minus',label:(Math.abs(c.q)===1?'':Math.abs(c.q))+'q',dx:9,dy:-8};});}
function specField(item){
  var ch=item.charges,P=item.at,E=fieldAt(ch,P),ds=[],parts=ch.map(function(c){return fieldAt([c],P);});
  ch.forEach(function(c,i){var flipped=ch.map(function(d,j){return j===i?{p:d.p,q:-d.q}:d;});pushP(ds,E,'sign-of-charge',fieldAt(flipped,P));});
  pushP(ds,E,'sign-of-charge',v2scale(E,-1));
  parts.forEach(function(p){pushP(ds,E,'only-one-charge',p);});
  if(ch.length>1){pushP(ds,E,'average-for-sum',v2scale(E,1/ch.length));var mags=0;parts.forEach(function(p){mags+=v2len(p);});pushP(ds,E,'added-magnitudes',v2scale(v2unit(parts[0]),mags));pushP(ds,E,'added-magnitudes',v2scale(v2unit(parts[1]),mags));}
  var E1=[0,0];ch.forEach(function(c){var d=v2sub(P,c.p),r=v2len(d);E1=v2add(E1,v2scale(d,FIELD_K*c.q/(r*r)));});pushP(ds,E,'inverse-not-square',E1);
  var E0=[0,0];ch.forEach(function(c){var d=v2sub(P,c.p),r=v2len(d);E0=v2add(E0,v2scale(d,FIELD_K*c.q/(r*r*r*r)));});pushP(ds,E,'inverse-not-square',E0);
  var text=ch.map(function(c){return 'a charge of '+(c.q>0?'+':'−')+(Math.abs(c.q)===1?'':Math.abs(c.q))+'q at '+vt(c.p);}).join(' and ');
  return {mode:'point',answer:E,ds:ds,
    prompt:'There is '+text+'. Place the electric field at the point P = '+vt(P)+'. In these units a charge q at distance r makes a field of size 4/r².',
    note:ch.length>1?(item.level===1?'Shown: the field of each charge on its own, drawn from P. The field at P is their vector sum.':item.level===2?'Find the field of each charge at P, then add the two arrows tip to tail.':''):(item.level===1?'The field points along the line from the charge: away from a positive charge, toward a negative one. Its size is 4|q|/r\u00b2.':item.level===2?'Size 4|q|/r\u00b2, along the line from the charge.':''),
    how:'Click or tap the grid where the tip of the field arrow belongs, drawn from P.'+(v2len(E)<1e-9?' If the field is zero, click P itself.':''),
    scene:function(){var sc={plane:true,anchor:P,marks:chargeMarks(ch).concat([{p:P,cls:'pt',label:'P',dx:7,dy:12}])};if(item.level===1&&ch.length>1)sc.vectors=parts.map(function(p,i){return {tail:P,v:p,cls:'mb',label:'E'+(i+1)};});return sc;},
    fb:function(c){
      switch(c.tag){
        case 'sign-of-charge':return 'A sign is wrong. The field of a positive charge points away from it, and the field of a negative charge points toward it.';
        case 'only-one-charge':return 'That is the field of one charge alone. Every charge contributes, and the fields add as vectors.';
        case 'average-for-sum':return 'That is the average of the two fields. Fields superpose: the total is the sum of the arrows, not their average.';
        case 'added-magnitudes':return 'That adds the sizes of the two fields along one direction. Each field keeps its own direction, so add them as arrows, tip to tail.';
        case 'inverse-not-square':return 'The size of each field falls off as 1/r², not as 1/r or 1/r³: a charge q at distance 2 makes a field of size 4/4 = 1.';
        default:return 'Not there. Each charge makes a field of size 4|q|/r² along the line from the charge, away from a positive charge and toward a negative one. The sum is '+vt(E)+'.';
      }
    },
    result:'E at P = '+vt(E)+'.',
    reference:ch.map(function(c,i){var d=v2sub(P,c.p),r=v2len(d);return 'Charge '+(i+1)+': distance '+f2(r)+', size 4·'+Math.abs(c.q)+'/'+f2(r*r)+' = '+f2(FIELD_K*Math.abs(c.q)/(r*r))+', pointing '+(c.q>0?'away from':'toward')+' the charge: '+vt(parts[i])+'.';}).join(' ')+' Adding the arrows gives '+vt(E)+'.',
    reveal:function(fig,done){
      var pr=fig.pred;fig.load({plane:true,anchor:P,marks:chargeMarks(ch).concat([{p:P,cls:'pt',label:'P',dx:7,dy:12}]),vectors:[{tail:P,v:parts[0],cls:'mb',label:'E1'}]});fig.pred=pr;fig.draw();
      if(parts.length<2){fig.state=E;fig.draw();done();return;}
      fig.animateSlide([{v:parts[1],from:P,to:v2add(P,parts[0]),cls:'mb',label:'E2'}],function(){fig.vectors=[{tail:P,v:parts[0],cls:'mb',label:'E1'},{tail:v2add(P,parts[0]),v:parts[1],cls:'mb'}];fig.state=E;fig.stateLabel='E';fig.draw();done();});
    }};
}
function specFieldRatio(item){
  var r1=item.r1,r2=item.r2,ans=(r1*r1)/(r2*r2),ds=[];
  pushNum(ds,ans,'inverse-not-square',r1/r2,0,20);pushNum(ds,ans,'wrong-way',(r2*r2)/(r1*r1),0,20);pushNum(ds,ans,'wrong-way',r2/r1,0,20);pushNum(ds,ans,'ignored-distance',1,0,20);
  return {mode:'number',answer:ans,ds:ds,numLabel:'ratio',numMin:0,numMax:20,tol:0.01,nofig:true,
    prompt:'At distance '+nt(r1)+' from a point charge the field has some size E. At distance '+nt(r2)+' from the same charge, the field is how many times E?',
    note:item.level===1?'The field of a point charge falls off as 1/r².':'',
    scene:function(){return {plane:true};},
    fb:function(c){
      switch(c.tag){
        case 'inverse-not-square':return 'That is a 1/r falloff. The field of a point charge falls off as 1/r²: doubling the distance divides the field by four.';
        case 'wrong-way':return 'That is the ratio the wrong way round. Farther away the field is weaker, so from distance '+nt(r1)+' to '+nt(r2)+' the field is '+(ans<1?'divided':'multiplied')+' by '+nt(ans<1?1/ans:ans)+'.';
        case 'ignored-distance':return 'The field of a point charge depends on the distance. It falls off as 1/r².';
        default:return 'Not quite. E ∝ 1/r², so the ratio is ('+nt(r1)+'/'+nt(r2)+')² = '+nt(ans)+'.';
      }
    },
    result:'The field is '+nt(ans)+' times E.',
    reference:'E ∝ 1/r², so E(r₂)/E(r₁) = (r₁/r₂)² = ('+nt(r1)+'/'+nt(r2)+')² = '+nt(ans)+'.'};
}
// C: complex numbers
var CAXES={x:'Re',y:'Im'};
function specCPlace(item){
  var z=item.z,ans,ds=[],prompt,note,reference,result,zt,scene,reveal;
  var kind=item.kind;
  if(kind==='rect'){
    ans=z;zt=ct(z);prompt='Place '+zt+' on the complex plane.';
    pushP(ds,ans,'conjugate',[z[0],-z[1]]);pushP(ds,ans,'parts-swapped',[z[1],z[0]]);pushP(ds,ans,'negated',[-z[0],-z[1]]);
    note=item.level===1?'The real part goes along the horizontal axis and the imaginary part along the vertical axis.':'';
    result=zt+' is the point '+vt(z)+'.';
    reference='A complex number a + bi is the point (a, b): a along the real axis, b along the imaginary axis. Here '+zt+' sits at '+vt(z)+'.';
  }else if(kind==='polar'){
    var r=item.r,th=item.deg;ans=[r*Math.cos(th*DEG),r*Math.sin(th*DEG)];zt=polarT(r,th);
    prompt='Place '+zt+' on the complex plane.';
    pushP(ds,ans,'angle-sign',[r*Math.cos(th*DEG),-r*Math.sin(th*DEG)]);pushP(ds,ans,'magnitude-as-real',[r,0]);pushP(ds,ans,'magnitude-dropped',[Math.cos(th*DEG),Math.sin(th*DEG)]);
    note=item.level===1?'r e^(iθ) is the arrow of length r at angle θ from the positive real axis, counterclockwise.':'';
    result=zt+' = '+ct(ans)+'.';
    reference='r e^(iθ) has length r and makes the angle θ with the positive real axis, measured counterclockwise. Its parts are r cos θ and r sin θ: '+zt+' = '+ct(ans)+'.';
    scene=function(){return {plane:true,axes:CAXES,circle:true,arcs:item.level<3?[{a:0,b:th,r:0.7,label:'θ'}]:[]};};
  }else if(kind==='mul'){
    var w=item.w,prod=[z[0]*w[0]-z[1]*w[1],z[0]*w[1]+z[1]*w[0]];ans=prod;zt='('+ct(z)+')('+ct(w)+')';
    prompt='z = '+ct(z)+' and w = '+ct(w)+'. Place the product z w.';
    pushP(ds,ans,'added-not-multiplied',v2add(z,w));pushP(ds,ans,'componentwise-product',[z[0]*w[0],z[1]*w[1]]);
    var rz=v2len(z),rw=v2len(w),dz=v2ang(z),dw=v2ang(w);
    pushP(ds,ans,'phase-subtracted',[rz*rw*Math.cos((dz-dw)*DEG),rz*rw*Math.sin((dz-dw)*DEG)]);pushP(ds,ans,'phase-subtracted',[rz*rw*Math.cos((dw-dz)*DEG),rz*rw*Math.sin((dw-dz)*DEG)]);
    pushP(ds,ans,'magnitudes-added',[(rz+rw)*Math.cos((dz+dw)*DEG),(rz+rw)*Math.sin((dz+dw)*DEG)]);pushP(ds,ans,'conjugate',[prod[0],-prod[1]]);
    note=item.level===1?'Multiplying complex numbers multiplies the lengths and adds the angles. In parts: (a + bi)(c + di) = (ac − bd) + (ad + bc)i.':item.level===2?'Lengths multiply, angles add.':'';
    result='z w = '+ct(prod)+'.';
    reference='Lengths multiply: '+f2(rz)+' · '+f2(rw)+' = '+f2(rz*rw)+'. Angles add: '+f2(dz)+'° + '+f2(dw)+'° = '+f2(dz+dw)+'°. In parts, (ac − bd) + (ad + bc)i = '+ct(prod)+'. Multiplying by w turns z by the angle of w and stretches it by the length of w.';
    scene=function(){return {plane:true,axes:CAXES,circle:true,vectors:[{v:z,cls:'ma',label:'z'},{v:w,cls:'mb',label:'w'}]};};
    reveal=function(fig,done){
      var pr=fig.pred;fig.load({plane:true,axes:CAXES,circle:true,vectors:[{v:z,cls:'ma',label:'z'},{v:w,cls:'mb',label:'w'}]});fig.pred=pr;
      fig.animateFn(function(e){var s=1+(rw-1)*e,d=dw*e;return {state:v2scale(v2rot(z,d),s)};},reducedMotion()?0:900,function(){fig.state=prod;fig.stateLabel='zw';fig.draw();done();});
    };
  }else{ // conj
    ans=[z[0],-z[1]];zt=ct(z);prompt='z = '+zt+'. Place its complex conjugate z*.';
    pushP(ds,ans,'no-change',z);pushP(ds,ans,'negated',[-z[0],-z[1]]);pushP(ds,ans,'conjugate-real',[-z[0],z[1]]);pushP(ds,ans,'parts-swapped',[z[1],z[0]]);
    note=item.level===1?'The conjugate flips the sign of the imaginary part: a + bi becomes a − bi.':'';
    result='z* = '+ct(ans)+'.';
    reference='The conjugate keeps the real part and flips the sign of the imaginary part, so the arrow is reflected in the real axis: z* = '+ct(ans)+'. Its angle is −θ, and z z* = |z|² = '+nt(z[0]*z[0]+z[1]*z[1])+'.';
    scene=function(){return {plane:true,axes:CAXES,vectors:[{v:z,cls:'ma',label:'z'}]};};
  }
  return {mode:'point',answer:ans,ds:ds,prompt:prompt,note:note,
    how:'Click or tap the grid at the point for this number.',
    scene:scene||function(){return {plane:true,axes:CAXES,circle:kind==='polar'};},
    fb:function(c){
      switch(c.tag){
        case 'conjugate':return 'That is the complex conjugate: the imaginary part has the wrong sign.';
        case 'parts-swapped':return 'The real and imaginary parts are swapped. The real part goes along the horizontal axis.';
        case 'negated':return 'That is the negative of the number, the arrow turned by 180°.';
        case 'angle-sign':return 'The angle is measured the wrong way. Positive angles go counterclockwise from the positive real axis.';
        case 'magnitude-dropped':return 'The angle is right but the length r was dropped. r e^(i\u03b8) has length r, not 1.';
        case 'magnitude-as-real':return 'The length r is right but the number was placed as if its angle were zero. Turn the arrow by θ counterclockwise.';
        case 'phase-as-magnitude':return 'The angle was used as a length. In r e^(iθ), r is the length and θ the angle.';
        case 'added-not-multiplied':return 'That is z + w. A product multiplies the lengths and adds the angles.';
        case 'componentwise-product':return 'That multiplies real with real and imaginary with imaginary. The cross terms matter: (a + bi)(c + di) = (ac − bd) + (ad + bc)i.';
        case 'phase-subtracted':return 'The angles were subtracted. For a product the angles add. Subtracting the angle is what division does.';
        case 'magnitudes-added':return 'The angle is right but the lengths were added. For a product the lengths multiply.';
        case 'no-change':return 'That is z itself. The conjugate flips the sign of the imaginary part.';
        case 'conjugate-real':return 'That flips the real part. The conjugate flips the imaginary part: a + bi becomes a − bi.';
        default:return 'Not there. '+result+' '+(kind==='mul'?'Lengths multiply and angles add.':kind==='conj'?'The conjugate flips the sign of the imaginary part.':kind==='polar'?'r is the length and \u03b8 is the angle from the positive real axis.':'The real part goes along the horizontal axis and the imaginary part along the vertical axis.');
      }
    },
    result:result,reference:reference,reveal:reveal||function(fig,done){fig.state=ans;fig.stateLabel=kind==='conj'?'z*':'';fig.draw();done();}};
}
function specCMag(item){
  var z=item.z,ans=v2len(z),ds=[];
  pushNum(ds,ans,'added-parts',Math.abs(z[0])+Math.abs(z[1]),0,30);pushNum(ds,ans,'no-sqrt',z[0]*z[0]+z[1]*z[1],0,30);pushNum(ds,ans,'real-part-only',Math.abs(z[0]),0,30);pushNum(ds,ans,'real-part-only',Math.abs(z[1]),0,30);
  return {mode:'number',answer:ans,ds:ds,numLabel:'|z|',numMin:0,numMax:30,tol:0.03,
    prompt:'What is |z| for z = '+ct(z)+'?',
    note:item.level===1?'|a + bi| = √(a² + b²), the length of the arrow.':'',
    scene:function(){return {plane:true,axes:CAXES,vectors:[{v:z,cls:'ma',label:'z'}]};},
    fb:function(c){
      switch(c.tag){
        case 'added-parts':return 'That adds the two parts. The modulus is the length of the arrow: √(a² + b²).';
        case 'no-sqrt':return 'That is a² + b², which is |z|². Take the square root.';
        case 'real-part-only':return 'That is one part alone. Both parts contribute to the length: √(a² + b²).';
        default:return 'Not quite. |z| = √('+sq(z[0])+' + '+sq(z[1])+') = '+f2(ans)+'.';
      }
    },
    result:'|z| = √('+nt(z[0]*z[0])+' + '+nt(z[1]*z[1])+') = '+f2(ans)+'.',
    reference:'The modulus is the length of the arrow from 0 to z, by Pythagoras: √(a² + b²) = '+f2(ans)+'. It is also √(z z*).',
    reveal:function(fig,done){fig.lines=[{a:z,b:[z[0],0]},{a:[0,0],b:[z[0],0]}];fig.draw();done();}};
}
function specCArg(item){
  var z=item.z,ans=argDeg(z),ds=[],naive=Math.atan2(z[1],Math.abs(z[0]))/DEG;
  pushNum(ds,ans,'quadrant',Math.atan(z[1]/(z[0]||1e-9))/DEG,-180,180);pushNum(ds,ans,'quadrant',naive,-180,180);pushNum(ds,ans,'angle-sign',-ans,-180,180);pushNum(ds,ans,'magnitude-for-phase',v2len(z),-180,180);
  return {mode:'number',answer:ans,ds:ds,numLabel:'arg z',numMin:-180,numMax:180,unit:'°',tol:1,
    prompt:'What is the angle of z = '+ct(z)+', in degrees, measured counterclockwise from the positive real axis? Give it between −180° and 180°.',
    note:item.level===1?'Look at which quadrant the arrow is in before using the arctangent.':'',
    scene:function(){return {plane:true,axes:CAXES,vectors:[{v:z,cls:'ma',label:'z'}]};},
    fb:function(c){
      switch(c.tag){
        case 'quadrant':return 'That is the arctangent without the quadrant. The arrow '+ct(z)+' has real part '+(z[0]<0?'negative':'positive')+' and imaginary part '+(z[1]<0?'negative':'positive')+', so it lies in the '+(z[0]>=0?(z[1]>=0?'first':'fourth'):(z[1]>=0?'second':'third'))+' quadrant.';
        case 'angle-sign':return 'The sign is wrong. Angles are counterclockwise from the positive real axis, so an arrow '+(z[1]>0?'above':'below')+' the axis has a '+(z[1]>0?'positive':'negative')+' angle.';
        case 'magnitude-for-phase':return 'That is the length of the arrow. The question asks for its angle.';
        default:return 'Not quite. The arrow to '+ct(z)+' makes '+f2(ans)+'° with the positive real axis.';
      }
    },
    result:'arg z = '+f2(ans)+'°.',
    reference:'Draw the arrow to '+vt(z)+'. It lies in the '+(z[0]>=0?(z[1]>=0?'first':'fourth'):(z[1]>=0?'second':'third'))+' quadrant. The angle from the positive real axis, counterclockwise, is '+f2(ans)+'°. The arctangent of b/a alone gives '+f2(Math.atan(z[1]/(z[0]||1e-9))/DEG)+'°, which is only right in the first and fourth quadrants.',
    reveal:function(fig,done){fig.arcs=[{a:0,b:ans,r:0.7,label:f2(ans)+'°'}];fig.draw();done();}};
}
function specCChoice(item){
  return {mode:'choice',options:item.options,prompt:item.prompt,note:item.note||'',nofig:!item.scene,
    scene:item.scene||function(){return {plane:true,axes:CAXES};},result:item.result,reference:item.reference,reveal:item.reveal};
}

var SPEC0={add:specAdd,comp:specComp,len:specLen,dot:specDot,ang:specAng,proj:specProj,cross:specCross,crossmag:specCrossMag,sense:specSense,field:specField,fratio:specFieldRatio,cplace:specCPlace,cmag:specCMag,carg:specCArg,cchoice:specCChoice};
Object.keys(SPEC0).forEach(function(k){EXTRA_BUILDERS[k]=function(item){return planeItem(item,SPEC0[k](item));};});

var STARTER_V=[
  {id:'v01',concept:'V1',level:1,type:'len',v:[3,4]},
  {id:'v02',concept:'V1',level:1,type:'comp',len:4,deg:30,which:'x'},
  {id:'v03',concept:'V1',level:2,type:'comp',len:2,deg:120,which:'x'},
  {id:'v04',concept:'V1',level:3,type:'comp',len:3,deg:-50,which:'y'},
  {id:'v05',concept:'V1',level:3,type:'len',v:[-2,3]},
  {id:'v06',concept:'V2',level:1,type:'add',a:[2,1],b:[1,2]},
  {id:'v07',concept:'V2',level:2,type:'add',a:[3,1],b:[-1,2]},
  {id:'v08',concept:'V2',level:2,type:'add',a:[2,3],b:[1,-1],c2:-1},
  {id:'v09',concept:'V2',level:3,type:'add',a:[1,1],b:[2,-1],c1:2,c2:-1},
  {id:'v10',concept:'V2',level:3,type:'add',a:[-1,2],b:[1,-2]}
];
var STARTER_P=[
  {id:'p01',concept:'P1',level:1,type:'dot',a:[2,1],b:[1,3]},
  {id:'p02',concept:'P1',level:2,type:'dot',a:[3,0],b:[-2,2]},
  {id:'p03',concept:'P1',level:2,type:'ang',a:[2,0],b:[-1,1]},
  {id:'p04',concept:'P1',level:3,type:'ang',a:[3,1],b:[1,3]},
  {id:'p05',concept:'P1',level:3,type:'dot',a:[1,2],b:[2,-1]},
  {id:'p06',concept:'P2',level:1,type:'proj',a:[3,1],b:[1,1]},
  {id:'p07',concept:'P2',level:2,type:'proj',a:[1,3],b:[2,0]},
  {id:'p08',concept:'P2',level:2,type:'proj',a:[-1,3],b:[1,1]},
  {id:'p09',concept:'P2',level:3,type:'proj',a:[3,1],b:[2,-1]}
];
var STARTER_X=[
  {id:'x01',concept:'X1',level:1,type:'cross',a:[1,0,0],b:[0,1,0]},
  {id:'x02',concept:'X1',level:2,type:'cross',a:[0,1,0],b:[1,0,0]},
  {id:'x03',concept:'X1',level:2,type:'cross',a:[0,0,1],b:[1,0,0]},
  {id:'x04',concept:'X1',level:3,type:'cross',a:[1,1,0],b:[0,0,1]},
  {id:'x05',concept:'X1',level:2,type:'crossmag',a:[2,0],b:[1,3]},
  {id:'x06',concept:'X1',level:3,type:'crossmag',a:[2,2],b:[3,3]},
  {id:'x07',concept:'X2',level:1,type:'sense',axis:[0,0,1],from:[1,0,0]},
  {id:'x08',concept:'X2',level:2,type:'sense',axis:[1,0,0],from:[0,1,0]},
  {id:'x09',concept:'X2',level:3,type:'sense',axis:[0,1,0],from:[1,0,0]}
];
var STARTER_F=[
  {id:'f01',concept:'F1',level:1,type:'field',charges:[{p:[0,0],q:1}],at:[2,0]},
  {id:'f02',concept:'F1',level:2,type:'field',charges:[{p:[0,0],q:-1}],at:[0,-1]},
  {id:'f03',concept:'F1',level:2,type:'fratio',r1:1,r2:2},
  {id:'f04',concept:'F1',level:3,type:'fratio',r1:3,r2:1},
  {id:'f05',concept:'F2',level:1,type:'field',charges:[{p:[-2,0],q:1},{p:[2,0],q:-1}],at:[0,0]},
  {id:'f06',concept:'F2',level:2,type:'field',charges:[{p:[-2,0],q:1},{p:[2,0],q:1}],at:[0,0]},
  {id:'f07',concept:'F2',level:2,type:'field',charges:[{p:[-2,0],q:1},{p:[0,2],q:2}],at:[0,0]},
  {id:'f08',concept:'F2',level:3,type:'field',charges:[{p:[2,0],q:1},{p:[0,2],q:1}],at:[2,2]},
  {id:'f09',concept:'F2',level:3,type:'field',charges:[{p:[-1,0],q:-1},{p:[0,2],q:1}],at:[0,0]}
];
var STARTER_C=[
  {id:'c01',concept:'C1',level:1,type:'cplace',kind:'rect',z:[2,-1]},
  {id:'c02',concept:'C1',level:1,type:'cmag',z:[3,4]},
  {id:'c03',concept:'C1',level:2,type:'cplace',kind:'polar',r:2,deg:90},
  {id:'c04',concept:'C1',level:2,type:'carg',z:[-1,1]},
  {id:'c05',concept:'C1',level:2,type:'cplace',kind:'polar',r:Math.SQRT2,deg:-45},
  {id:'c06',concept:'C1',level:3,type:'carg',z:[-2,-2]},
  {id:'c07',concept:'C1',level:3,type:'cplace',kind:'conj',z:[1,2]},
  {id:'c08',concept:'C2',level:1,type:'cplace',kind:'mul',z:[2,1],w:[0,1]},
  {id:'c09',concept:'C2',level:2,type:'cplace',kind:'mul',z:[1,1],w:[1,1]},
  {id:'c10',concept:'C2',level:2,type:'cchoice',prompt:'z is any complex number and φ is an angle. What does multiplying z by e^(iφ) do to its arrow?',
    options:[{t:'Turns it by φ counterclockwise, keeping its length',ok:true},{t:'Makes it φ times longer, keeping its direction',tag:'phase-as-magnitude',fb:'e^(iφ) has length 1, so it cannot change the length of z. It changes the angle: the product has angle arg z + φ.'},{t:'Turns it by φ clockwise',tag:'rotated-clockwise',fb:'Angles add, and φ is counted counterclockwise from the positive real axis. Multiplying by e^(iφ) turns the arrow counterclockwise by φ.'},{t:'Adds φ to its real part',tag:'added-not-multiplied',fb:'That would be adding a number. Multiplying by e^(iφ) multiplies the lengths, 1 times |z|, and adds the angles.'}],
    result:'Multiplying by e^(iφ) turns the arrow by φ counterclockwise.',reference:'e^(iφ) has length 1 and angle φ. In a product the lengths multiply and the angles add, so z e^(iφ) has the same length as z and an angle larger by φ. This is the picture behind every phase in Unit 1.'},
  {id:'c11',concept:'C2',level:3,type:'cplace',kind:'mul',z:[2,1],w:[1,1]},
  {id:'c12',concept:'C2',level:3,type:'cchoice',prompt:'z₁ = 2e^(i·30°) and z₂ = 3e^(i·60°). What are the length and the angle of z₁ z₂?',
    options:[{t:'Length 6, angle 90°',ok:true},{t:'Length 5, angle 90°',tag:'magnitudes-added',fb:'The angles add but the lengths multiply: 2 · 3 = 6.'},{t:'Length 6, angle 30°',tag:'phase-subtracted',fb:'The angles add: 30° + 60° = 90°. Subtracting angles is what division does.'},{t:'Length 6, angle 1800°',tag:'phase-as-magnitude',fb:'The angles add, they do not multiply: 30° + 60° = 90°.'}],
    result:'z₁ z₂ = 6e^(i·90°) = 6i.',reference:'In polar form the product is easy: lengths multiply, 2 · 3 = 6, and angles add, 30° + 60° = 90°. So z₁ z₂ = 6e^(i·90°) = 6i.'}
];
function genV(n,seed){
  var rnd=mulberry32((seed|0)+n*7919+101),k=rnd();
  function gi(lo,hi){return lo+Math.floor(rnd()*(hi-lo+1));}
  if(k<0.4){var a=[gi(-2,3),gi(-2,3)],b=[gi(-2,3),gi(-2,3)],c=pick(rnd,[[1,1],[1,1],[1,-1],[2,1],[1,2],[2,-1]]);
    var s=v2add(v2scale(a,c[0]),v2scale(b,c[1]));if(Math.abs(s[0])>4||Math.abs(s[1])>4||(a[0]===0&&a[1]===0)||(b[0]===0&&b[1]===0))return genV(n+1000,seed);
    return {id:'gv'+n,concept:'V2',level:3,type:'add',a:a,b:b,c1:c[0],c2:c[1],generated:true};}
  if(k<0.7)return {id:'gv'+n,concept:'V1',level:3,type:'comp',len:pick(rnd,[2,3,4]),deg:pick(rnd,[30,45,60,120,135,150,-30,-60,-135]),which:pick(rnd,['x','y']),generated:true};
  var v=[gi(-4,4),gi(-4,4)];if(!v[0]&&!v[1])v=[3,-4];
  return {id:'gv'+n,concept:'V1',level:3,type:'len',v:v,generated:true};
}
function genP(n,seed){
  var rnd=mulberry32((seed|0)+n*6007+211),k=rnd();
  function gi(lo,hi){return lo+Math.floor(rnd()*(hi-lo+1));}
  var a=[gi(-3,3),gi(-3,3)],b=[gi(-3,3),gi(-3,3)];
  if((!a[0]&&!a[1])||(!b[0]&&!b[1]))return genP(n+1000,seed);
  if(k<0.35)return {id:'gp'+n,concept:'P1',level:3,type:'dot',a:a,b:b,generated:true};
  if(k<0.6)return {id:'gp'+n,concept:'P1',level:3,type:'ang',a:a,b:b,generated:true};
  var bb=pick(rnd,[[1,1],[1,-1],[2,0],[0,2],[1,0],[0,1],[-1,1],[2,-1],[1,2],[2,1]]),pr=v2proj(a,bb);
  if(Math.abs(pr[0]*4-Math.round(pr[0]*4))>1e-9||Math.abs(pr[1]*4-Math.round(pr[1]*4))>1e-9||Math.abs(pr[0])>4||Math.abs(pr[1])>4)return genP(n+1000,seed);
  return {id:'gp'+n,concept:'P2',level:3,type:'proj',a:a,b:bb,generated:true};
}
function genX(n,seed){
  var rnd=mulberry32((seed|0)+n*4001+307),k=rnd(),AXS=[[1,0,0],[-1,0,0],[0,1,0],[0,-1,0],[0,0,1],[0,0,-1]];
  if(k<0.45){var a=pick(rnd,AXS.concat([[1,1,0],[1,0,1],[0,1,1],[1,-1,0]])),b=pick(rnd,AXS);if(vlen(cross(a,b))<1e-6)return genX(n+1000,seed);return {id:'gx'+n,concept:'X1',level:3,type:'cross',a:a,b:b,generated:true};}
  if(k<0.7){function gi(lo,hi){return lo+Math.floor(rnd()*(hi-lo+1));}var p=[gi(-3,3),gi(-3,3)],q=[gi(-3,3),gi(-3,3)];if((!p[0]&&!p[1])||(!q[0]&&!q[1]))return genX(n+1000,seed);return {id:'gx'+n,concept:'X1',level:3,type:'crossmag',a:p,b:q,generated:true};}
  var ax=pick(rnd,AXS),fr=pick(rnd,AXS);if(Math.abs(dot(ax,fr))>0.5)return genX(n+1000,seed);
  return {id:'gx'+n,concept:'X2',level:3,type:'sense',axis:ax,from:fr,generated:true};
}
function genF(n,seed){
  var rnd=mulberry32((seed|0)+n*9973+401),k=rnd();
  if(k<0.25)return {id:'gf'+n,concept:'F1',level:3,type:'fratio',r1:pick(rnd,[1,2,3]),r2:pick(rnd,[1,2,3,4]),generated:true};
  var sets=[
    [[{p:[-2,0],q:1},{p:[2,0],q:-1}],[0,0]],[[{p:[-2,0],q:1},{p:[2,0],q:1}],[0,0]],[[{p:[-2,0],q:-1},{p:[2,0],q:-1}],[0,0]],
    [[{p:[-2,0],q:1},{p:[0,2],q:2}],[0,0]],[[{p:[-2,0],q:-1},{p:[0,2],q:1}],[0,0]],[[{p:[0,-2],q:1},{p:[2,0],q:-2}],[0,0]],
    [[{p:[2,0],q:1},{p:[0,2],q:1}],[2,2]],[[{p:[2,0],q:-1},{p:[0,2],q:1}],[2,2]],[[{p:[-1,0],q:-1},{p:[0,2],q:1}],[0,0]],
    [[{p:[0,2],q:1},{p:[0,-2],q:1}],[0,0]],[[{p:[0,2],q:1},{p:[0,-2],q:-1}],[0,0]],[[{p:[-2,0],q:1},{p:[0,-2],q:1}],[0,0]],
    [[{p:[0,0],q:1}],[-2,0]],[[{p:[0,0],q:-1}],[0,2]],[[{p:[0,0],q:2}],[2,0]],[[{p:[1,0],q:-1}],[-1,0]]
  ],s=pick(rnd,sets);
  return {id:'gf'+n,concept:s[0].length>1?'F2':'F1',level:3,type:'field',charges:s[0],at:s[1],generated:true};
}
function genC(n,seed){
  var rnd=mulberry32((seed|0)+n*3571+503),k=rnd();
  function gi(lo,hi){return lo+Math.floor(rnd()*(hi-lo+1));}
  var z=[gi(-3,3),gi(-3,3)];if(!z[0]&&!z[1])z=[1,2];
  if(k<0.2)return {id:'gc'+n,concept:'C1',level:3,type:'cplace',kind:'rect',z:z,generated:true};
  if(k<0.35)return {id:'gc'+n,concept:'C1',level:3,type:'cmag',z:z,generated:true};
  if(k<0.5){if(!z[0]||!z[1])z=[-2,1];return {id:'gc'+n,concept:'C1',level:3,type:'carg',z:z,generated:true};}
  if(k<0.62){var pr=pick(rnd,[[2,90],[2,180],[1,90],[Math.SQRT2,45],[Math.SQRT2,135],[2,-90],[Math.SQRT2,-135],[2*Math.SQRT2,45],[3,180],[2*Math.SQRT2,-45]]);return {id:'gc'+n,concept:'C1',level:3,type:'cplace',kind:'polar',r:pr[0],deg:pr[1],generated:true};}
  if(k<0.72)return {id:'gc'+n,concept:'C1',level:3,type:'cplace',kind:'conj',z:z,generated:true};
  var zz=[gi(-2,2),gi(-2,2)],w=pick(rnd,[[0,1],[0,-1],[1,1],[1,-1],[-1,0],[0,1],[2,0]]),p=[zz[0]*w[0]-zz[1]*w[1],zz[0]*w[1]+zz[1]*w[0]];
  if((!zz[0]&&!zz[1])||Math.abs(p[0])>4||Math.abs(p[1])>4)return genC(n+1000,seed);
  return {id:'gc'+n,concept:'C2',level:3,type:'cplace',kind:'mul',z:zz,w:w,generated:true};
}
GROUPS.V={name:'Vectors',concepts:['V1','V2'],starter:STARTER_V,gen:genV};
GROUPS.P={name:'Projection',concepts:['P1','P2'],starter:STARTER_P,gen:genP};
GROUPS.X={name:'Cross product',concepts:['X1','X2'],starter:STARTER_X,gen:genX};
GROUPS.F={name:'Fields',concepts:['F1','F2'],starter:STARTER_F,gen:genF};
GROUPS.C={name:'Complex numbers',concepts:['C1','C2'],starter:STARTER_C,gen:genC};
GROUP_ORDER=['V','P','X','F','C'].concat(GROUP_ORDER);

function selfChecks0(){
  var out=[];function chk(name,ok){out.push({name:name,ok:!!ok});}
  var a=[3,1],b=[1,2];
  chk('Cross product in the plane matches the 3D cross product',Math.abs(v2cross(a,b)-cross([3,1,0],[1,2,0])[2])<1e-12);
  chk('Projection leaves a perpendicular remainder',Math.abs(v2dot(v2sub(a,v2proj(a,b)),b))<1e-12);
  chk('Dot product equals |a| |b| cos θ',Math.abs(v2dot(a,b)-v2len(a)*v2len(b)*Math.cos(v2between(a,b)*DEG))<1e-9);
  chk('A turn by 90° takes (x, y) to (−y, x)',v2dist(v2rot([2,1],90),[-1,2])<1e-12);
  var z=[1,1],w=[1,1],p=[z[0]*w[0]-z[1]*w[1],z[0]*w[1]+z[1]*w[0]];
  chk('(1 + i)² = 2i, lengths multiply and angles add',v2dist(p,[0,2])<1e-12&&Math.abs(v2len(p)-v2len(z)*v2len(w))<1e-12&&Math.abs(argDeg(p)-argDeg(z)-argDeg(w))<1e-9);
  var E=fieldAt([{p:[-2,0],q:1},{p:[2,0],q:-1}],[0,0]);
  chk('Fields of a dipole add at the midpoint',v2dist(E,[2,0])<1e-12);
  chk('Field of one charge falls off as 1/r²',Math.abs(v2len(fieldAt([{p:[0,0],q:1}],[1,0]))/v2len(fieldAt([{p:[0,0],q:1}],[2,0]))-4)<1e-12);
  chk('n × v gives the first motion of a positive turn',vdist(unit(cross([0,0,1],[1,0,0])),unit(rot([0,0,1],1e-3,[1,0,0]).map(function(x,i){return x-[1,0,0][i];})))<1e-3);
  return out;
}
