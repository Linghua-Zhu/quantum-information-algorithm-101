// A plane with a grid, drawn in SVG. Vectors are arrows from a tail point.
function v2add(a,b){return [a[0]+b[0],a[1]+b[1]];}
function v2sub(a,b){return [a[0]-b[0],a[1]-b[1]];}
function v2scale(a,s){return [a[0]*s,a[1]*s];}
function v2dot(a,b){return a[0]*b[0]+a[1]*b[1];}
function v2len(a){return Math.hypot(a[0],a[1]);}
function v2cross(a,b){return a[0]*b[1]-a[1]*b[0];}
function v2dist(a,b){return Math.hypot(a[0]-b[0],a[1]-b[1]);}
function v2ang(a){return Math.atan2(a[1],a[0])/DEG;}
function v2rot(a,deg){var c=Math.cos(deg*DEG),s=Math.sin(deg*DEG);return [a[0]*c-a[1]*s,a[0]*s+a[1]*c];}
function v2unit(a){var l=v2len(a)||1;return [a[0]/l,a[1]/l];}
function v2between(a,b){return Math.acos(clamp(v2dot(a,b)/((v2len(a)*v2len(b))||1),-1,1))/DEG;}
function v2proj(a,b){var l=v2len(b);return l<1e-9?[0,0]:v2scale(b,v2dot(a,b)/(l*l));}
function v2snap(p,step){return [Math.round(p[0]/step)*step,Math.round(p[1]/step)*step];}

function Plane(host,label,opts){
  opts=opts||{};
  this.range=opts.range||4;this.R=120;
  this.svg=document.createElementNS(SVGNS,'svg');
  this.svg.setAttribute('viewBox','-150 -150 300 300');this.svg.setAttribute('class','sphere plane');
  this.svg.setAttribute('role','img');this.svg.setAttribute('aria-label',label);
  this.layer=document.createElementNS(SVGNS,'g');this.svg.appendChild(this.layer);host.appendChild(this.svg);
  this.placing=false;this.onPlace=null;this._raf=0;this._gen=0;this.dyn=null;
  this.clearScene();this._bind();this.draw();
}
Plane.prototype.clearScene=function(){
  this.stop();this.state=null;this.ghost=null;this.pred=null;this.vectors=[];this.marks=[];this.lines=[];this.arcs=[];this.trailSteps=[];
  this.anchor=[0,0];this.axes=null;this.circle=false;this.hint=null;this.dyn=null;this.slice=null;this.stateLabel=null;
};
Plane.prototype.load=function(sc){
  sc=sc||{};this.clearScene();
  this.range=sc.range||4;
  this.state=sc.state||null;this.ghost=sc.ghost||null;this.vectors=sc.vectors||[];this.marks=sc.marks||[];this.lines=sc.lines||[];this.arcs=sc.arcs||[];
  this.trailSteps=sc.trail||[];this.anchor=sc.anchor||[0,0];this.axes=sc.axes||null;this.circle=!!sc.circle;this.hint=sc.hint||null;this.stateLabel=sc.stateLabel||null;
};
Plane.prototype.px=function(p){var k=this.R/this.range;return {x:p[0]*k,y:-p[1]*k};};
Plane.prototype.arrow=function(tail,v,cls,label,width){
  var a=this.px(tail),b=this.px(v2add(tail,v)),l=Math.hypot(b.x-a.x,b.y-a.y),h='';
  if(l<0.5){h='<circle class="pl-dot-'+cls+'" cx="'+f1(a.x)+'" cy="'+f1(a.y)+'" r="3.5"/>';}
  else{
    var s=Math.min(9,l*0.5),ux=(b.x-a.x)/l,uy=(b.y-a.y)/l,ex=b.x-ux*s*0.6,ey=b.y-uy*s*0.6;
    h='<line class="pl-v-'+cls+'" x1="'+f1(a.x)+'" y1="'+f1(a.y)+'" x2="'+f1(ex)+'" y2="'+f1(ey)+'"/>';
    var w=s*0.45,bx=b.x-ux*s,by=b.y-uy*s;
    h+='<polygon class="pl-h-'+cls+'" points="'+f1(b.x)+','+f1(b.y)+' '+f1(bx-uy*w)+','+f1(by+ux*w)+' '+f1(bx+uy*w)+','+f1(by-ux*w)+'"/>';
  }
  if(label){
    var ux2=l<0.5?0:(b.x-a.x)/l,uy2=l<0.5?-1:(b.y-a.y)/l,lx=b.x+ux2*11,ly=b.y+uy2*11;
    h+='<text class="pl-label pl-label-'+cls+'" x="'+f1(lx)+'" y="'+f1(ly+3.5)+'" text-anchor="middle">'+label+'</text>';
  }
  return h;
};
Plane.prototype.draw=function(){
  var P=[],R=this.R,n=this.range,k=R/n,self=this,i,d=this.dyn||{};
  function ln(cls,a,b){return '<line class="'+cls+'" x1="'+f1(a.x)+'" y1="'+f1(a.y)+'" x2="'+f1(b.x)+'" y2="'+f1(b.y)+'"/>';}
  var g='',dots='';
  for(i=-n;i<=n;i++){
    if(i===0)continue;
    g+='M'+f1(i*k)+' '+f1(-R)+'L'+f1(i*k)+' '+f1(R)+'M'+f1(-R)+' '+f1(i*k)+'L'+f1(R)+' '+f1(i*k);
  }
  for(i=-2*n+1;i<2*n;i+=2)for(var j=-2*n+1;j<2*n;j+=2)dots+='<circle cx="'+f1(i*k/2)+'" cy="'+f1(j*k/2)+'" r="0.8"/>';
  P.push('<path class="pl-grid" d="'+g+'"/><g class="pl-half">'+dots+'</g>');
  var ax=this.axes||{x:'x',y:'y'},ox=this.px([-n-0.25,0]),oxe=this.px([n+0.25,0]),oy=this.px([0,-n-0.25]),oye=this.px([0,n+0.25]);
  P.push(ln('pl-axis',ox,oxe)+ln('pl-axis',oy,oye));
  P.push('<text class="pl-axname" x="'+f1(oxe.x-2)+'" y="'+f1(oxe.y-6)+'" text-anchor="end">'+ax.x+'</text><text class="pl-axname" x="'+f1(oye.x+6)+'" y="'+f1(oye.y+9)+'">'+ax.y+'</text>');
  for(i=-n;i<=n;i++){if(!i)continue;var tx=this.px([i,0]),ty=this.px([0,i]);P.push('<text class="pl-tick" x="'+f1(tx.x)+'" y="'+f1(tx.y+10)+'" text-anchor="middle">'+i+'</text><text class="pl-tick" x="'+f1(ty.x-5)+'" y="'+f1(ty.y+3)+'" text-anchor="end">'+i+'</text>');}
  if(this.circle)P.push('<circle class="pl-circle" r="'+f1(k)+'"/>');
  (this.lines||[]).concat(d.lines||[]).forEach(function(l){P.push(ln(l.cls?'pl-line-'+l.cls:'s-proj',self.px(l.a),self.px(l.b)));});
  (this.arcs||[]).concat(d.arcs||[]).forEach(function(c){
    var cc=c.c||[0,0],a0=c.a*DEG,a1=c.b*DEG,K=24,dd='',t,p;
    for(var q=0;q<=K;q++){t=a0+(a1-a0)*q/K;p=self.px(v2add(cc,[c.r*Math.cos(t),c.r*Math.sin(t)]));dd+=(q?'L':'M')+f1(p.x)+' '+f1(p.y);}
    P.push('<path class="s-arc" d="'+dd+'"/>');
    if(c.label){t=(a0+a1)/2;p=self.px(v2add(cc,[(c.r+0.38)*Math.cos(t),(c.r+0.38)*Math.sin(t)]));P.push('<text class="s-arclabel" x="'+f1(p.x)+'" y="'+f1(p.y+3.5)+'" text-anchor="middle">'+c.label+'</text>');}
  });
  (d.trail||this.trailSteps||[]).forEach(function(st){
    if(!st||st.length<2)return;var dd='';
    st.forEach(function(p,q){var w=self.px(p);dd+=(q?'L':'M')+f1(w.x)+' '+f1(w.y);});
    P.push('<path class="s-trail" d="'+dd+'"/>');
  });
  var ghost=d.ghost!==undefined?d.ghost:this.ghost;
  if(ghost)P.push(this.arrow(ghost.tail||this.anchor,ghost.v||ghost,'ghost',ghost.label));
  (this.vectors||[]).concat(d.vectors||[]).forEach(function(v){P.push(self.arrow(v.tail||[0,0],v.v,v.cls||'ma',v.label));});
  (this.marks||[]).concat(d.marks||[]).forEach(function(m){
    var q=self.px(m.p);
    if(m.cls==='plus'||m.cls==='minus')P.push('<circle class="pl-q-'+m.cls+'" cx="'+f1(q.x)+'" cy="'+f1(q.y)+'" r="7"/><text class="pl-qsign" x="'+f1(q.x)+'" y="'+f1(q.y+3.6)+'" text-anchor="middle">'+(m.cls==='plus'?'+':'−')+'</text>');
    else P.push('<circle class="s-mk-'+(m.cls||'foot')+'" cx="'+f1(q.x)+'" cy="'+f1(q.y)+'" r="'+(m.cls==='foot'?2.6:3.6)+'"/>');
    if(m.label)P.push('<text class="s-marklabel" x="'+f1(q.x+(m.dx==null?9:m.dx))+'" y="'+f1(q.y+(m.dy==null?-6:m.dy))+'">'+m.label+'</text>');
  });
  var state=d.state!==undefined?d.state:this.state;
  if(state)P.push(this.arrow(this.anchor,state,'state',d.stateLabel||this.stateLabel));
  if(this.pred){var pr=this.px(v2add(this.anchor,this.pred));P.push(this.arrow(this.anchor,this.pred,'pred')+'<circle class="s-pred" cx="'+f1(pr.x)+'" cy="'+f1(pr.y)+'" r="6.5"/>');}
  if(this.anchor[0]||this.anchor[1]){var an=this.px(this.anchor);P.push('<circle class="pl-anchor" cx="'+f1(an.x)+'" cy="'+f1(an.y)+'" r="3"/>');}
  this.layer.innerHTML=P.join('');
};
Plane.prototype.pick=function(cx,cy){
  var rc=this.svg.getBoundingClientRect(),s=300/rc.width,x=(cx-rc.left)*s-150,y=(cy-rc.top)*s-150,k=this.R/this.range;
  var p=[x/k,-y/k],n=this.range+0.3;
  if(Math.abs(p[0])>n||Math.abs(p[1])>n)return null;
  p=v2snap([clamp(p[0],-this.range,this.range),clamp(p[1],-this.range,this.range)],0.25);
  return v2sub(p,this.anchor);
};
Plane.prototype._bind=function(){
  var self=this,svg=this.svg,down=null;
  svg.addEventListener('pointerdown',function(e){if(e.pointerType==='mouse'&&e.button!==0)return;down={x:e.clientX,y:e.clientY,moved:false,id:e.pointerId};try{svg.setPointerCapture(e.pointerId);}catch(_){}});
  svg.addEventListener('pointermove',function(e){if(!down)return;if(Math.hypot(e.clientX-down.x,e.clientY-down.y)>=8)down.moved=true;});
  svg.addEventListener('pointerup',function(e){
    if(!down)return;var d=down;down=null;try{svg.releasePointerCapture(d.id);}catch(_){}
    if(!d.moved&&self.placing&&self.onPlace){var p=self.pick(e.clientX,e.clientY);if(p)self.onPlace(p);}
  });
  svg.addEventListener('pointercancel',function(){down=null;});
};
Plane.prototype.setPlacing=function(on){this.placing=on;this.svg.classList.toggle('placing',on);};
Plane.prototype.resetView=function(){this.draw();};
Plane.prototype.stop=function(){this._gen++;if(this._raf)cancelAnimationFrame(this._raf);this._raf=0;this.dyn=null;};
// fn(t) returns a partial scene for progress t in [0,1]
Plane.prototype.animateFn=function(fn,dur,done){this.stop();this._animate(fn,dur,done);};
Plane.prototype._animate=function(fn,dur,done){
  var self=this,gen=this._gen,reduce=reducedMotion(),t0=null;
  function frame(now){
    if(gen!==self._gen)return;
    if(t0===null)t0=now;
    var t=reduce?1:clamp((now-t0)/dur,0,1),e=t<0.5?2*t*t:1-Math.pow(-2*t+2,2)/2;
    self.dyn=fn(e);self.draw();
    if(t<1)self._raf=requestAnimationFrame(frame);else{self._raf=0;self.dyn=null;if(done)done();}
  }
  this._raf=requestAnimationFrame(frame);
};
Plane.prototype.animatePath=function(fn,dur,done){
  var N=40;
  this.animateFn(function(e){var seg=[],upto=Math.round(e*N);for(var j=0;j<=upto;j++)seg.push(fn(j/N));return {state:fn(e),trail:[seg]};},dur,done);
};
// steps: [{v, from, to}] slide the vectors one after another
Plane.prototype.animateSlide=function(steps,done){
  var self=this,i=0,reduce=reducedMotion();this.stop();var gen=this._gen;
  function next(){
    if(gen!==self._gen)return;
    if(i>=steps.length){if(done)done();return;}
    var st=steps[i];
    self._animate(function(e){
      var vs=[];for(var q=0;q<i;q++)vs.push({tail:steps[q].to,v:steps[q].v,cls:steps[q].cls||'mb',label:steps[q].label});
      vs.push({tail:v2add(st.from,v2scale(v2sub(st.to,st.from),e)),v:st.v,cls:st.cls||'mb',label:st.label});
      return {vectors:vs};
    },reduce?0:700,function(){i++;if(reduce||i>=steps.length)next();else setTimeout(next,200);});
  }
  next();
};

// One slot that holds a sphere and a plane and shows one of them
function FigSlot(host,label,label2){
  var self=this;
  this.sphere=new Sphere(host,label);this.plane=new Plane(host,label2||label);
  this.plane.svg.setAttribute('hidden','');this.active=this.sphere;this.onPlace=null;
  this.sphere.onPlace=function(p){if(self.onPlace)self.onPlace(p);};
  this.plane.onPlace=function(p){if(self.onPlace)self.onPlace(p);};
}
FigSlot.prototype.use=function(plane){
  var next=plane?this.plane:this.sphere;
  if(next===this.active)return;
  this.active.stop();this.active.svg.setAttribute('hidden','');next.svg.removeAttribute('hidden');this.active=next;
};
FigSlot.prototype.load=function(sc){sc=sc||{};this.use(!!sc.plane);this.active.load(sc);};
['draw','setPlacing','resetView','animate','animatePath','animateFn','animateSlide'].forEach(function(m){
  FigSlot.prototype[m]=function(){var a=this.active;return a[m].apply(a,arguments);};
});
FigSlot.prototype.stop=function(){this.sphere.stop();this.plane.stop();};
['state','ghost','pred','hint','slice','trailSteps','marks','lines','arcs','vectors','anchor','stateLabel','guides','labelSet'].forEach(function(p){
  Object.defineProperty(FigSlot.prototype,p,{get:function(){return this.active[p];},set:function(v){this.active[p]=v;}});
});
