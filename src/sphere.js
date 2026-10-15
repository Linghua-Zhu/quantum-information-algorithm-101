// Bloch sphere drawn in SVG
var SVGNS='http://www.w3.org/2000/svg';
function f1(n){return n.toFixed(1);}
function Sphere(host,label,opts){
  opts=opts||{};
  this.R=100;this.homeAz=(opts.az==null?22:opts.az)*DEG;this.homeEl=(opts.el==null?17:opts.el)*DEG;this.az=this.homeAz;this.elv=this.homeEl;
  this.svg=document.createElementNS(SVGNS,'svg');
  this.svg.setAttribute('viewBox','-150 -150 300 300');this.svg.setAttribute('class','sphere');
  this.svg.setAttribute('role','img');this.svg.setAttribute('aria-label',label);
  this.layer=document.createElementNS(SVGNS,'g');this.svg.appendChild(this.layer);host.appendChild(this.svg);
  this.state=null;this.ghost=null;this.pred=null;this.trailSteps=[];this.hint=null;this.guides=[];this.marks=[];this.lines=[];this.arcs=[];this.slice=null;
  this.placing=false;this.onPlace=null;this._raf=0;this._gen=0;
  this._bind();this.draw();
}
Sphere.prototype.basis=function(){
  var ca=Math.cos(this.az),sa=Math.sin(this.az),ce=Math.cos(this.elv),se=Math.sin(this.elv);
  return {r:[-sa,ca,0],u:[-se*ca,-se*sa,ce],d:[ce*ca,ce*sa,se]};
};
Sphere.prototype.proj=function(p,B){return {x:dot(p,B.r)*this.R,y:-dot(p,B.u)*this.R,d:dot(p,B.d)};};
Sphere.prototype.circle=function(n,h,B){
  n=unit(n);var rho=Math.sqrt(Math.max(0,1-h*h)),u=unit(cross(n,Math.abs(n[2])<0.9?[0,0,1]:[1,0,0])),v=cross(n,u),c=scale(n,h),K=96,pts=[];
  for(var i=0;i<=K;i++){var t=2*PI*i/K;pts.push(this.proj(add(c,add(scale(u,rho*Math.cos(t)),scale(v,rho*Math.sin(t)))),B));}
  return pts;
};
Sphere.prototype.runs=function(pts){
  var f='',b='',side=null;
  for(var i=1;i<pts.length;i++){
    var a=pts[i-1],c=pts[i],s=(a.d+c.d)>=-1e-9?'f':'b',L='L'+f1(c.x)+' '+f1(c.y);
    if(s!==side){var M='M'+f1(a.x)+' '+f1(a.y);if(s==='f')f+=M+L;else b+=M+L;side=s;}
    else if(s==='f')f+=L;else b+=L;
  }
  return {f:f,b:b};
};
Sphere.prototype.head=function(a,b,s,cls){
  var dx=b.x-a.x,dy=b.y-a.y,l=Math.hypot(dx,dy);if(l<0.5)return '';
  var ux=dx/l,uy=dy/l,bx=b.x-ux*s,by=b.y-uy*s,w=s*0.45;
  return '<polygon class="'+cls+'" points="'+f1(b.x)+','+f1(b.y)+' '+f1(bx-uy*w)+','+f1(by+ux*w)+' '+f1(bx+uy*w)+','+f1(by-ux*w)+'"/>';
};
var LABELS=[['|0⟩','z',[0,0,1]],['|1⟩','',[0,0,-1]],['|+⟩','x',[1,0,0]],['|−⟩','',[-1,0,0]],['|+i⟩','y',[0,1,0]],['|−i⟩','',[0,-1,0]]];
var LABELS_XYZ=[['+z','',[0,0,1]],['−z','',[0,0,-1]],['+x','',[1,0,0]],['−x','',[-1,0,0]],['+y','',[0,1,0]],['−y','',[0,-1,0]]];
Sphere.prototype.visibleLabels=function(B){
  var self=this,L0=this.labelSet||LABELS;if(!this.slice)return L0;
  return L0.filter(function(L){var q=self.proj(L[2],B);return Math.hypot(q.x,q.y)>60;});
};
Sphere.prototype.draw=function(){
  var B=this.basis(),R=this.R,P=[],self=this,i,j,sl=this.slice;
  function ln(cls,a,b){return '<line class="'+cls+'" x1="'+f1(a.x)+'" y1="'+f1(a.y)+'" x2="'+f1(b.x)+'" y2="'+f1(b.y)+'"/>';}
  if(!sl){
    var guides=[[0,0,1],[1,0,0],[0,1,0]].map(function(n){return self.runs(self.circle(n,0,B));});
    P.push('<path class="s-back" d="'+guides.map(function(g){return g.b;}).join('')+'"/>');
    P.push('<circle class="s-outline" r="'+R+'"/>');
    [[1,0,0],[0,1,0],[0,0,1]].forEach(function(a){P.push(ln('s-axis',self.proj(scale(a,-1),B),self.proj(a,B)));});
    P.push('<path class="s-front" d="'+guides.map(function(g){return g.f;}).join('')+'"/>');
  }else{
    P.push('<circle class="s-outline" r="'+R+'"/>');
    P.push(ln('s-axis',this.proj(scale(sl.u,-1),B),this.proj(sl.u,B))+ln('s-axis',this.proj(scale(sl.w,-1),B),this.proj(sl.w,B)));
    for(i=-4;i<=4;i++)for(j=-4;j<=4;j++){if(i*i+j*j>16)continue;var q0=this.proj(add(scale(sl.u,i/4),scale(sl.w,j/4)),B);P.push('<circle class="s-lat" cx="'+f1(q0.x)+'" cy="'+f1(q0.y)+'" r="1"/>');}
  }
  (this.guides||[]).forEach(function(g){var rr=self.runs(self.circle(g.n,g.h,B));P.push('<path class="s-motion" d="'+rr.f+rr.b+'"/>');});
  var h=this.hint;
  if(h){
    var n=unit(h.axis);
    if(h.circle){var rr=this.runs(this.circle(n,dot(n,h.circle),B));P.push('<path class="s-motion" d="'+rr.f+rr.b+'"/>');}
    var a=this.proj(scale(n,-1),B),b=this.proj(scale(n,1.1),B);
    P.push(ln('s-hint',a,b)+this.head(a,b,7,'s-hintfill'));
    if(h.sense){
      var sg=h.sense>0?1:-1,u=unit(cross(n,Math.abs(n[2])<0.9?[0,0,1]:[1,0,0])),v=cross(n,u),c=scale(n,0.62),K=40,pts=[],d='';
      for(i=0;i<=K;i++){var t=sg*1.55*PI*i/K;pts.push(this.proj(add(c,add(scale(u,0.22*Math.cos(t)),scale(v,0.22*Math.sin(t)))),B));}
      for(i=0;i<=K;i++)d+=(i?'L':'M')+f1(pts[i].x)+' '+f1(pts[i].y);
      P.push('<path class="s-hint" d="'+d+'"/>'+this.head(pts[K-4],pts[K],6,'s-hintfill'));
    }
  }
  (this.lines||[]).forEach(function(l){P.push(ln('s-proj',self.proj(l.a,B),self.proj(l.b,B)));});
  (this.arcs||[]).forEach(function(c){
    var ua=unit(c.a),ub=unit(c.b),g=Math.acos(clamp(dot(ua,ub),-1,1)),sg=Math.sin(g),K=24,dd='',k,t,p;
    if(sg<1e-6)return;
    for(k=0;k<=K;k++){t=k/K;p=self.proj(scale(add(scale(ua,Math.sin((1-t)*g)/sg),scale(ub,Math.sin(t*g)/sg)),c.r),B);dd+=(k?'L':'M')+f1(p.x)+' '+f1(p.y);}
    P.push('<path class="s-arc" d="'+dd+'"/>');
    if(c.label){p=self.proj(scale(unit(add(ua,ub)),c.r+0.13),B);P.push('<text class="s-arclabel" x="'+f1(p.x)+'" y="'+f1(p.y+3.5)+'" text-anchor="middle">'+c.label+'</text>');}
  });
  (this.trailSteps||[]).forEach(function(st){
    if(!st||st.length<2)return;var rr=self.runs(st.map(function(p){return self.proj(p,B);}));
    P.push('<path class="s-trail far" d="'+rr.b+'"/><path class="s-trail" d="'+rr.f+'"/>');
  });
  if(this.ghost){var g=this.proj(this.ghost,B);P.push('<line class="s-ghost" x1="0" y1="0" x2="'+f1(g.x)+'" y2="'+f1(g.y)+'"/><circle class="s-ghost" cx="'+f1(g.x)+'" cy="'+f1(g.y)+'" r="3.4"/>');}
  (this.marks||[]).forEach(function(m){
    var q=self.proj(m.v,B);
    if(m.vec)P.push('<line class="s-mkv-'+m.cls+'" x1="0" y1="0" x2="'+f1(q.x)+'" y2="'+f1(q.y)+'"/>');
    P.push('<circle class="s-mk-'+m.cls+'" cx="'+f1(q.x)+'" cy="'+f1(q.y)+'" r="'+(m.cls==='foot'?2.6:4)+'"/>');
    if(m.label){var ql=Math.hypot(q.x,q.y),ox=ql>3?q.x/ql*13:-9,oy=ql>3?q.y/ql*13:-9;if(m.cls==='foot'){ox=11;oy=-7;}P.push('<text class="s-marklabel" x="'+f1(q.x+ox)+'" y="'+f1(q.y+oy+3)+'" text-anchor="'+(m.cls==='foot'?'start':'middle')+'">'+m.label+'</text>');}
  });
  if(this.state){var s=this.proj(this.state,B),far=s.d<-0.05?' far':'';P.push('<line class="s-state'+far+'" x1="0" y1="0" x2="'+f1(s.x)+'" y2="'+f1(s.y)+'"/><circle class="s-statedot'+far+'" cx="'+f1(s.x)+'" cy="'+f1(s.y)+'" r="4.2"/>');}
  if(this.pred){var q=this.proj(this.pred,B);P.push('<circle class="s-pred'+(q.d<-0.05?' far':'')+'" cx="'+f1(q.x)+'" cy="'+f1(q.y)+'" r="6.5"/>');}
  this.visibleLabels(B).forEach(function(L){
    var p=self.proj(scale(L[2],1.2),B),anchor='middle',dy=3.2;
    if(p.x>14)anchor='start';else if(p.x<-14)anchor='end';else dy=p.y<0?-2:9;
    P.push('<text class="s-label'+(p.d<-0.3?' far':'')+'" x="'+f1(p.x)+'" y="'+f1(p.y+dy)+'" text-anchor="'+anchor+'">'+L[0]+(L[1]?'<tspan class="s-axname" dx="4">'+L[1]+'</tspan>':'')+'</text>');
  });
  this.layer.innerHTML=P.join('');
};
function snapSlice(a,b){
  var rho=Math.hypot(a,b);
  if(rho>0.93){var ang=Math.atan2(b,a)/DEG,sa=Math.round(ang/15)*15;if(Math.abs(ang-sa)<=5)ang=sa;return [Math.cos(ang*DEG),Math.sin(ang*DEG)];}
  var qa=Math.round(a*4)/4,qb=Math.round(b*4)/4;
  return Math.hypot(a-qa,b-qb)<=0.07?[qa,qb]:[a,b];
}
Sphere.prototype.pick=function(cx,cy){
  var rc=this.svg.getBoundingClientRect(),k=300/rc.width,x=(cx-rc.left)*k-150,y=(cy-rc.top)*k-150,B=this.basis(),best=null,bd=1e9,self=this;
  this.visibleLabels(B).forEach(function(L){
    var q=self.proj(L[2],B),l=self.proj(scale(L[2],1.2),B),d=Math.hypot(x-q.x,y-q.y);
    var lx=l.x+(l.x>14?13:l.x<-14?-13:0),ly=l.y+(Math.abs(l.x)>14?0:(l.y<0?-5:6));
    if(Math.abs(x-lx)<=19&&Math.abs(y-ly)<=9)d=Math.min(d,Math.hypot(x-lx,y-ly)/3);
    if(d<=11&&d<bd){bd=d;best=L[2];}
  });
  if(best)return best.slice();
  var r=Math.hypot(x,y)/this.R;
  if(r>1.12)return null;
  if(this.slice){
    var a=x/this.R,b=-y/this.R;if(r>1){a/=r;b/=r;}
    var s=snapSlice(a,b);return add(scale(this.slice.u,s[0]),scale(this.slice.w,s[1]));
  }
  if(r>0.995){x*=0.995/r;y*=0.995/r;r=0.995;}
  var z=Math.sqrt(1-r*r);
  return snapPoint(unit(add(add(scale(B.r,x/this.R),scale(B.u,-y/this.R)),scale(B.d,z))));
};
Sphere.prototype._bind=function(){
  var self=this,svg=this.svg,down=null;
  svg.addEventListener('pointerdown',function(e){if(e.pointerType==='mouse'&&e.button!==0)return;down={x:e.clientX,y:e.clientY,az:self.az,el:self.elv,moved:false,id:e.pointerId};try{svg.setPointerCapture(e.pointerId);}catch(_){}});
  svg.addEventListener('pointermove',function(e){
    if(!down)return;var dx=e.clientX-down.x,dy=e.clientY-down.y;
    if(!down.moved&&Math.hypot(dx,dy)<5)return;
    down.moved=true;if(self.slice)return;
    self.az=down.az-dx*0.01;self.elv=clamp(down.el+dy*0.01,-80*DEG,80*DEG);self.draw();
  });
  svg.addEventListener('pointerup',function(e){
    if(!down)return;var d=down;down=null;try{svg.releasePointerCapture(d.id);}catch(_){}
    if(!d.moved&&self.placing&&self.onPlace){var p=self.pick(e.clientX,e.clientY);if(p)self.onPlace(p);}
  });
  svg.addEventListener('pointercancel',function(){down=null;});
};
Sphere.prototype.setPlacing=function(on){this.placing=on;this.svg.classList.toggle('placing',on);};
Sphere.prototype.setSlice=function(pl){
  var was=!!this.slice;this.slice=pl||null;
  if(pl){this.az=Math.atan2(pl.u[1],pl.u[0])-PI/2;this.elv=0;}
  else if(was){this.az=this.homeAz;this.elv=this.homeEl;}
  this.svg.classList.toggle('flat',!!pl);
};
Sphere.prototype.resetView=function(){if(this.slice)return;this.az=this.homeAz;this.elv=this.homeEl;this.draw();};
Sphere.prototype.stop=function(){this._gen++;if(this._raf)cancelAnimationFrame(this._raf);this._raf=0;};
Sphere.prototype.clearScene=function(){this.stop();this.state=null;this.ghost=null;this.pred=null;this.trailSteps=[];this.hint=null;this.guides=[];this.marks=[];this.lines=[];this.arcs=[];};
Sphere.prototype.load=function(sc){
  sc=sc||{};
  this.clearScene();this.setSlice(sc.slice||null);this.labelSet=sc.axes==='xyz'?LABELS_XYZ:null;
  this.state=sc.state||null;this.ghost=sc.ghost||null;this.hint=sc.hint||null;this.guides=sc.guides||[];this.marks=sc.marks||[];this.lines=sc.lines||[];this.arcs=sc.arcs||[];this.trailSteps=sc.trail||[];
};
function reducedMotion(){return !!(window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches);}
Sphere.prototype.animate=function(steps,done,base){
  var self=this;this.stop();var gen=this._gen,reduce=reducedMotion();
  var baseN=(base||[]).length,i=0;this.trailSteps=(base||[]).slice();
  function runStep(){
    if(gen!==self._gen)return;
    if(i>=steps.length){self._raf=0;if(done)done();return;}
    var st=steps[i],deg=Math.abs(st.angle)/DEG,dur=reduce?0:350+deg*5,N=Math.max(8,Math.ceil(deg/3)),t0=null;
    if(st.hint!==undefined)self.hint=st.hint;
    function frame(now){
      if(gen!==self._gen)return;
      if(t0===null)t0=now;
      var t=dur?clamp((now-t0)/dur,0,1):1,e=t<0.5?2*t*t:1-Math.pow(-2*t+2,2)/2,upto=Math.round(e*N),seg=[];
      for(var j=0;j<=upto;j++)seg.push(rot(st.axis,st.angle*j/N,st.from));
      self.trailSteps[baseN+i]=seg;self.state=rot(st.axis,st.angle*e,st.from);self.draw();
      if(t<1)self._raf=requestAnimationFrame(frame);
      else{i++;if(reduce||i>=steps.length)runStep();else setTimeout(runStep,260);}
    }
    self._raf=requestAnimationFrame(frame);
  }
  runStep();
};
Sphere.prototype.animatePath=function(fn,dur,done,base){
  var self=this;this.stop();var gen=this._gen,reduce=reducedMotion(),N=40,t0=null,bn=(base||[]).length;this.trailSteps=(base||[]).slice();
  function frame(now){
    if(gen!==self._gen)return;
    if(t0===null)t0=now;
    var t=reduce?1:clamp((now-t0)/dur,0,1),e=t<0.5?2*t*t:1-Math.pow(-2*t+2,2)/2,upto=Math.round(e*N),seg=[];
    for(var j=0;j<=upto;j++)seg.push(fn(j/N));
    self.trailSteps[bn]=seg;self.state=fn(e);self.draw();
    if(t<1)self._raf=requestAnimationFrame(frame);else{self._raf=0;if(done)done();}
  }
  this._raf=requestAnimationFrame(frame);
};
function arcPath(axis,angle,from){var N=Math.max(8,Math.ceil(Math.abs(angle)/DEG/3)),seg=[];for(var j=0;j<=N;j++)seg.push(rot(axis,angle*j/N,from));return seg;}
