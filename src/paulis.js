// Pauli operators and Pauli strings
var PAXIS={X:[1,0,0],Y:[0,1,0],Z:[0,0,1]};
var PKET={X:['|+⟩','|−⟩'],Y:['|+i⟩','|−i⟩'],Z:['|0⟩','|1⟩']};
var PNAME={X:'x',Y:'y',Z:'z'};
var PMUL={II:[0,'I'],IX:[0,'X'],IY:[0,'Y'],IZ:[0,'Z'],XI:[0,'X'],YI:[0,'Y'],ZI:[0,'Z'],XX:[0,'I'],YY:[0,'I'],ZZ:[0,'I'],
  XY:[1,'Z'],YZ:[1,'X'],ZX:[1,'Y'],YX:[3,'Z'],ZY:[3,'X'],XZ:[3,'Y']};
var PHASE=['','i','−','−i'];
function pmul(a,b){var k=0,s=[];for(var i=0;i<a.length;i++){var r=PMUL[a[i]+b[i]];k+=r[0];s.push(r[1]);}return {k:k%4,s:s};}
function nAnti(a,b){var n=0;for(var i=0;i<a.length;i++)if(a[i]!=='I'&&b[i]!=='I'&&a[i]!==b[i])n++;return n;}
function nDiff(a,b){var n=0;for(var i=0;i<a.length;i++)if(a[i]!==b[i])n++;return n;}
function sText(s){return s.join('⊗');}
function opText(k,s){k=((k%4)+4)%4;var t=sText(s);if(!k)return t;return s.length>1?PHASE[k]+'('+t+')':PHASE[k]+t;}
function comp(r,P){return P==='I'?1:r[{X:0,Y:1,Z:2}[P]];}
function countWord(n){return ['no','one','two','three','four'][n]||String(n);}
function seededOrder(opts,id){
  var rnd=mulberry32(hashStr('order:'+id)),a=opts.slice();
  for(var i=a.length-1;i>0;i--){var j=Math.floor(rnd()*(i+1)),t=a[i];a[i]=a[j];a[j]=t;}
  return a;
}
function uniqueOptions(opts){var seen={};return opts.filter(function(o){if(seen[o.t])return false;seen[o.t]=1;return true;});}
function pushNR(ds,correct,tag,x){
  if(!(x>=-1-1e-9&&x<=1+1e-9)||Math.abs(x-correct)<0.045)return;
  for(var i=0;i<ds.length;i++)if(Math.abs(ds[i].x-x)<0.045)return;
  ds.push({tag:tag,x:x});
}

function buildPChoice(item){
  var R={item:item,type:item.type,mode:'choice',options:item.options,nofig:!item.scene,replay:!!item.reveal};
  R.prompt=item.prompt;R.note=item.note||'';R.how='Choose one answer.';
  R.scene=function(){return item.scene?item.scene():{};};
  R.classify=function(i){var o=item.options[i];return {tag:o.ok?'correct':o.tag,off:o.ok?0:1,i:i};};
  R.feedback=function(c){return c.tag==='correct'?'Correct.':item.options[c.i].fb;};
  R.reference=item.reference;R.result=item.result;
  R.answer=item.options.map(function(o){return !!o.ok;}).indexOf(true);
  R.respText=function(i){return item.options[i].t;};
  R.observe=function(sp,done){if(item.reveal)item.reveal(sp,function(){done();});else{sp.draw();done();}};
  return R;
}

function buildPEig(item){
  var ax=PAXIS[item.op],v=scale(ax,item.ev),ket=PKET[item.op][item.ev>0?0:1],ds=[],an=PNAME[item.op];
  var ev=item.ev>0?'+1':'−1',other=item.ev>0?'−1':'+1',end=item.ev>0?'positive':'negative';
  pushD(ds,v,'eigen-sign',scale(ax,-item.ev),true);
  ['X','Y','Z'].forEach(function(o){if(o===item.op)return;pushD(ds,v,'eigen-axis',PAXIS[o],true);pushD(ds,v,'eigen-axis',scale(PAXIS[o],-1),true);});
  var R={item:item,type:'peig',mode:'point'};
  R.prompt='Place the eigenstate of '+item.op+' with eigenvalue '+ev+'.';
  R.note=item.level===1?'Shown on the sphere: the '+an+' axis.':item.level===2?'An eigenstate of a Pauli operator lies on its axis.':'No hints on the sphere.';
  R.how='Click or tap the sphere where the state sits. Drag to turn the sphere.';
  R.scene=function(){return {state:null,hint:item.level===1?{axis:ax}:null};};
  R.classify=function(p){return classPoint(p,v,ds,true);};
  R.feedback=function(c){
    switch(c.tag){
      case 'correct':return 'Correct.';
      case 'eigen-sign':return 'That is the eigenstate with eigenvalue '+other+'. The eigenvalue '+ev+' belongs to the '+end+' end of the '+an+' axis, '+ket+'.';
      case 'eigen-axis':return 'That is an eigenstate of another Pauli operator. The eigenstates of '+item.op+' are the two ends of the '+an+' axis.';
      default:return 'Not there. The eigenstates of '+item.op+' are the two ends of the '+an+' axis, and the eigenvalue '+ev+' belongs to '+ket+'.';
    }
  };
  R.reference='As a gate, '+item.op+' is a half turn about the '+an+' axis. The two states on that axis stay in place, so they are its eigenstates. The positive end has eigenvalue +1 and the negative end −1. Here '+item.op+ket+' = '+(item.ev>0?'':'−')+ket+'.';
  R.result='The eigenstate is '+ket+'.';R.answer=v;
  R.respText=function(p){return labelOf(p);};
  R.observe=function(sp,done){sp.hint={axis:ax};sp.state=v;sp.draw();done();};
  return R;
}

function buildPExp(item){
  var r=vecOf(item.state),P=item.op,c=comp(r,P),A=PNAME[P],ds=[];
  pushNR(ds,c,'prob-for-exp',(1+c)/2);
  ['X','Y','Z'].forEach(function(o){if(o!==P)pushNR(ds,c,'exp-wrong-component',comp(r,o));});
  pushNR(ds,c,'exp-sign',-c);
  var R={item:item,type:'pexp',mode:'number',numLabel:'⟨'+P+'⟩',numMin:-1,numMax:1};
  R.prompt=stateSentence(r)+' What is the expectation value ⟨'+P+'⟩?';
  R.note=item.level===1?'Shown on the sphere: the '+A+' axis and the projection of the state onto it.':item.level===2?'Shown on the sphere: the '+A+' axis.':'No hints on the sphere.';
  R.how='Type a number between −1 and 1.';
  R.scene=function(){var s={state:r};if(item.level<=2)s.hint={axis:PAXIS[P]};if(item.level===1){s.lines=[{a:r,b:scale(PAXIS[P],c)}];s.marks=[{v:scale(PAXIS[P],c),cls:'foot',label:f3(c)}];}return s;};
  R.classify=function(x){return classNumber(x,c,ds);};
  R.feedback=function(cl){
    var tail='⟨'+P+'⟩ is the '+A+' component of the Bloch vector: '+f3(c)+'.';
    switch(cl.tag){
      case 'correct':return 'Correct.';
      case 'prob-for-exp':return 'That is the probability of the outcome +1, (1 + ⟨'+P+'⟩)/2. The expectation value averages the outcomes +1 and −1, so it runs from −1 to 1. '+tail;
      case 'exp-wrong-component':return 'That is the component along another axis. '+tail;
      case 'exp-sign':return 'The sign is reversed. '+tail;
      default:return 'Not that value. '+tail;
    }
  };
  R.reference='The outcomes of '+(P==='X'?'an ':'a ')+P+' measurement are +1 and −1. Their average is ⟨'+P+'⟩ = P(+1) − P(−1), and that equals the projection of the state onto the '+A+' axis: '+f3(c)+'.';
  R.result='⟨'+P+'⟩ = '+f3(c)+'.';R.answer=c;
  R.respText=function(x){return '⟨'+P+'⟩ = '+f2(x);};
  R.observe=function(sp,done){sp.hint={axis:PAXIS[P]};sp.lines=[{a:r,b:scale(PAXIS[P],c)}];sp.marks=[{v:scale(PAXIS[P],c),cls:'foot',label:f3(c)}];sp.draw();done();};
  return R;
}

function prodSpec(item){
  var a=item.a,b=item.b,r=pmul([a],[b]),c=r.s[0],k=r.k,res=opText(k,[c]),dir=scale(PAXIS[c],k===1?1:-1);
  var opts=uniqueOptions([
    {t:res,ok:true},
    {t:opText(k+2,[c]),tag:'op-sign',fb:'That is the product in the other order: '+b+a+' = '+opText(k+2,[c])+'. Swapping two different Pauli operators flips the sign, and '+a+b+' = '+res+'.'},
    {t:c,tag:'missing-i',fb:'The product of two different Pauli operators carries a factor ±i: '+a+b+' = '+res+'.'},
    {t:'I',tag:'product-identity',fb:'Only the square of a Pauli operator is I. Two different ones multiply to ±i times the third: '+a+b+' = '+res+'.'}
  ]);
  return {
    prompt:'What is the product '+a+b+'?',
    note:item.level===1?'The product of two different Pauli operators is ±i times the third one.':item.level===2?'XY = iZ, and the same holds in the cyclic order X, Y, Z.':'',
    options:seededOrder(opts,item.id),
    reference:'XY = iZ, YZ = iX and ZX = iY. Reversing the order flips the sign. So '+a+b+' = '+res+'. On the sphere the result points along the cross product of the two axes: (a·σ)(b·σ) = i(a×b)·σ when a and b are perpendicular.',
    result:a+b+' = '+res+'.',
    scene:function(){return {marks:[{v:PAXIS[a],cls:'ma',vec:true,label:a},{v:PAXIS[b],cls:'ma',vec:true,label:b}]};},
    reveal:function(sp,done){sp.marks=sp.marks.concat([{v:dir,cls:'mb',vec:true,label:a+b+' = '+res}]);sp.draw();done();}
  };
}

function commExplain(a,b){
  var parts=[],n=nAnti(a,b);
  if(a.length===1){
    var ab=pmul(a,b),ba=pmul(b,a);
    return a[0]+b[0]+' = '+opText(ab.k,ab.s)+' and '+b[0]+a[0]+' = '+opText(ba.k,ba.s)+', so '+a[0]+b[0]+' = −'+b[0]+a[0]+'. Two different Pauli operators anticommute.';
  }
  for(var i=0;i<a.length;i++){
    var s='Position '+(i+1)+': '+a[i]+' and '+b[i];
    if(a[i]==='I'||b[i]==='I')s+=' commute, since I commutes with everything.';
    else if(a[i]===b[i])s+=' commute.';
    else s+=' anticommute.';
    parts.push(s);
  }
  return parts.join(' ')+' '+(n===1?'One position anticommutes':(n===0?'No position anticommutes':countWord(n).charAt(0).toUpperCase()+countWord(n).slice(1)+' positions anticommute'))+', so the strings '+(n%2?'anticommute':'commute')+(n>1?': (−1)'+(n===2?'²':n===3?'³':'^'+n)+' = '+(n%2?'−1':'+1')+'.':'.');
}
function commSpec(item){
  var a=item.a.split(''),b=item.b.split(''),n=nAnti(a,b),commute=n%2===0,single=a.length===1;
  var A=single?a[0]:sText(a),B=single?b[0]:sText(b),why=commExplain(a,b);
  var wrongCommute=single?{tag:'commute-all',fb:'They do not commute. '+why}
    :(nDiff(a,b)%2===0?{tag:'count-identity',fb:'Positions with I do not count, because I commutes with every Pauli operator. '+why}:{tag:'parity-miscount',fb:'Count the positions again. '+why});
  var wrongAnti=n>=2?{tag:'any-anticommute',fb:'Each position where the letters anticommute gives a factor −1 when the order is swapped, and the factors multiply. '+why}:{tag:'parity-miscount',fb:'Count the positions again. '+why};
  var opts=[
    commute?{t:'They commute',ok:true}:{t:'They commute',tag:wrongCommute.tag,fb:wrongCommute.fb},
    commute?{t:'They anticommute',tag:wrongAnti.tag,fb:wrongAnti.fb}:{t:'They anticommute',ok:true},
    {t:'Neither: swapping them changes the product in some other way',tag:'neither',fb:'Two Pauli strings always commute or anticommute. Swapping them multiplies the product by −1 once for every position where the letters anticommute. '+why}
  ];
  return {
    prompt:'Do '+A+' and '+B+' commute or anticommute?',
    note:item.level===1?'Count the positions that hold two different Pauli letters. Each one gives a factor −1 when you swap the strings.':item.level===2?(single?'Work out '+a[0]+b[0]+' and '+b[0]+a[0]+' and compare them.':'I commutes with every Pauli operator.'):'',
    options:opts,
    reference:why,
    result:'They '+(commute?'commute.':'anticommute.'),
    scene:single?function(){return {marks:[{v:PAXIS[a[0]],cls:'ma',vec:true,label:a[0]},{v:PAXIS[b[0]],cls:'ma',vec:true,label:b[0]}]};}:null
  };
}

function strProdSpec(item){
  var a=item.a.split(''),b=item.b.split(''),r=pmul(a,b),res=opText(r.k,r.s),A=sText(a),B=sText(b);
  var keep=[],same=false;
  for(var i=0;i<a.length;i++){if(a[i]===b[i]&&a[i]!=='I'){keep.push(a[i]);same=true;}else keep.push(r.s[i]);}
  var opts=[
    {t:res,ok:true},
    {t:opText(r.k+2,r.s),tag:'string-sign',fb:'The sign is reversed. Multiply letter by letter and collect the phases: ('+A+')('+B+') = '+res+'.'},
    r.k?{t:opText(0,r.s),tag:'phase-dropped',fb:'The phase in front is missing. Each pair of different letters contributes ±i. ('+A+')('+B+') = '+res+'.'}
       :{t:opText(1,r.s),tag:'phase-added',fb:'There is no phase in front here. The factors ±i from the positions cancel. ('+A+')('+B+') = '+res+'.'}
  ];
  if(same)opts.push({t:opText(r.k,keep),tag:'square-not-identity',fb:'A Pauli operator times itself is I, not the operator again. ('+A+')('+B+') = '+res+'.'});
  var steps=a.map(function(x,i){var p=pmul([x],[b[i]]);return x+b[i]+' = '+opText(p.k,p.s);}).join(', ');
  return {
    prompt:'What is the product ('+A+')('+B+')?',
    note:item.level<=2?'Multiply position by position, and collect the phases in front.':'',
    options:seededOrder(uniqueOptions(opts),item.id),
    reference:'Position by position: '+steps+'. The phases multiply, so ('+A+')('+B+') = '+res+'.',
    result:'('+A+')('+B+') = '+res+'.',
    scene:null
  };
}

function buildPStrExp(item){
  var r1=vecOf(item.q1),r2=vecOf(item.q2),L=item.ops.split(''),c1=comp(r1,L[0]),c2=comp(r2,L[1]),c=c1*c2,ds=[],S=sText(L);
  pushNR(ds,c,'string-order',comp(r1,L[1])*comp(r2,L[0]));
  pushNR(ds,c,'string-average',(c1+c2)/2);
  pushNR(ds,c,'one-factor',c1);pushNR(ds,c,'one-factor',c2);
  var R={item:item,type:'pstrexp',mode:'number',numLabel:'⟨'+S+'⟩',numMin:-1,numMax:1};
  R.prompt='Two qubits are in a product state. Qubit 1 is '+(isCardinal(r1)||'at '+labelOf(r1))+' and qubit 2 is '+(isCardinal(r2)||'at '+labelOf(r2))+'. What is ⟨'+S+'⟩?';
  R.note=item.level===1?'On a product state, ⟨'+S+'⟩ = ⟨'+L[0]+'⟩ of qubit 1 times ⟨'+L[1]+'⟩ of qubit 2.':item.level===2?'The sphere shows both qubits.':'The sphere shows both qubits.';
  R.how='Type a number between −1 and 1.';
  R.scene=function(){return {marks:[{v:r1,cls:'ma',vec:true,label:'1'},{v:r2,cls:'mb',vec:true,label:'2'}]};};
  R.classify=function(x){return classNumber(x,c,ds);};
  R.feedback=function(cl){
    var tail='Qubit 1 gives ⟨'+L[0]+'⟩ = '+f3(c1)+' and qubit 2 gives ⟨'+L[1]+'⟩ = '+f3(c2)+', so ⟨'+S+'⟩ = '+f3(c)+'.';
    switch(cl.tag){
      case 'correct':return 'Correct.';
      case 'string-order':return 'The letters went to the wrong qubits. The first letter acts on qubit 1. '+tail;
      case 'string-average':return 'On a product state the expectation value is the product of the two, not their average. '+tail;
      case 'one-factor':return 'Both qubits contribute. '+tail;
      default:return 'Not that value. '+tail;
    }
  };
  R.reference='On a product state, each qubit has its own Bloch vector, and the expectation value of a string is the product of the expectation values for each qubit. '+'⟨'+S+'⟩ = '+f3(c1)+' × '+f3(c2)+' = '+f3(c)+'.';
  R.result='⟨'+S+'⟩ = '+f3(c)+'.';R.answer=c;
  R.respText=function(x){return '⟨'+S+'⟩ = '+f2(x);};
  R.observe=function(sp,done){
    sp.lines=[{a:r1,b:scale(PAXIS[L[0]],c1)},{a:r2,b:scale(PAXIS[L[1]],c2)}];
    sp.marks=sp.marks.concat([{v:scale(PAXIS[L[0]],c1),cls:'foot',label:f3(c1)},{v:scale(PAXIS[L[1]],c2),cls:'foot',label:f3(c2)}]);
    sp.draw();done();
  };
  return R;
}

EXTRA_BUILDERS.pchoice=buildPChoice;
EXTRA_BUILDERS.peig=buildPEig;
EXTRA_BUILDERS.pexp=buildPExp;
EXTRA_BUILDERS.pstrexp=buildPStrExp;
EXTRA_BUILDERS.pprod=function(item){var s=prodSpec(item);s.id=item.id;return buildPChoice(Object.assign({},item,s));};
EXTRA_BUILDERS.pcomm=function(item){return buildPChoice(Object.assign({},item,commSpec(item)));};
EXTRA_BUILDERS.pstrprod=function(item){return buildPChoice(Object.assign({},item,strProdSpec(item)));};

var STARTER_O=[
  {id:'o01',concept:'O1',level:1,type:'peig',op:'X',ev:-1},
  {id:'o02',concept:'O1',level:2,type:'peig',op:'Y',ev:1},
  {id:'o03',concept:'O1',level:2,type:'pchoice',
    prompt:'The qubit is in |0⟩. Apply Y. What is the state now, as a ket?',
    note:'Y = [[0, −i], [i, 0]]. The first column is Y|0⟩.',
    options:[
      {t:'i|1⟩',ok:true},
      {t:'|1⟩',tag:'phase-dropped',fb:'On the sphere that is the right point, since Y turns the top to the bottom. As a ket there is also a factor i: Y|0⟩ = i|1⟩. It is a global phase, so the sphere does not show it.'},
      {t:'−i|1⟩',tag:'y-sign',fb:'The first column of Y is (0, i), so Y|0⟩ = i|1⟩. The factor −i appears in Y|1⟩ = −i|0⟩.'},
      {t:'|0⟩',tag:'eigen-assume',fb:'|0⟩ is an eigenstate of Z, not of Y. Y is a half turn about the y axis, and it takes |0⟩ to i|1⟩.'}
    ],
    reference:'The first column of Y = [[0, −i], [i, 0]] is Y|0⟩ = i|1⟩. On the sphere, Y is a half turn about the y axis and takes the top to the bottom. The factor i is a global phase, which the sphere does not show.',
    result:'Y|0⟩ = i|1⟩.',
    scene:function(){return {state:[0,0,1]};},
    reveal:function(sp,done){sp.ghost=[0,0,1];sp.animate([{from:[0,0,1],axis:AX.y,angle:PI,hint:{axis:AX.y}}],function(){sp.state=[0,0,-1];sp.draw();done();});}},
  {id:'o04',concept:'O1',level:2,type:'pexp',state:[60,90],op:'Y'},
  {id:'o05',concept:'O1',level:3,type:'pexp',state:[120,180],op:'X'},
  {id:'o06',concept:'O2',level:1,type:'pprod',a:'X',b:'Y'},
  {id:'o07',concept:'O2',level:2,type:'pprod',a:'Z',b:'Y'},
  {id:'o08',concept:'O2',level:2,type:'pcomm',a:'X',b:'Z'},
  {id:'o09',concept:'O2',level:3,type:'pchoice',
    prompt:'What is the commutator [X, Y] = XY − YX?',
    note:'',
    options:[
      {t:'0',tag:'commute-all',fb:'X and Y do not commute. XY = iZ and YX = −iZ, so XY − YX = 2iZ.'},
      {t:'iZ',tag:'half-commutator',fb:'iZ is XY alone. The commutator subtracts YX = −iZ, which doubles it: [X, Y] = 2iZ.'},
      {t:'2iZ',ok:true},
      {t:'−2iZ',tag:'op-sign',fb:'That is [Y, X], the commutator in the other order. [X, Y] = XY − YX = iZ − (−iZ) = 2iZ.'}
    ],
    reference:'XY = iZ and YX = −iZ, so [X, Y] = 2iZ. In the same way [Y, Z] = 2iX and [Z, X] = 2iY.',
    result:'[X, Y] = 2iZ.',
    scene:function(){return {marks:[{v:[1,0,0],cls:'ma',vec:true,label:'X'},{v:[0,1,0],cls:'ma',vec:true,label:'Y'}]};},
    reveal:function(sp,done){sp.marks=sp.marks.concat([{v:[0,0,1],cls:'mb',vec:true,label:'[X, Y] = 2iZ'}]);sp.draw();done();}},
  {id:'o10',concept:'O2',level:3,type:'pchoice',
    prompt:'A turn by α about the x axis is Rx(α) = cos(α/2) I − i sin(α/2) X. Which matrix is Rx(180°)?',
    note:'',
    options:[
      {t:'X',tag:'global-phase-matrix',fb:'As gates, X and −iX do the same thing to every state, because they differ only by the global factor −i. As matrices they differ. At α = 180° the formula gives cos 90° I − i sin 90° X = −iX.'},
      {t:'iX',tag:'rot-sign',fb:'The sign comes from the minus in Rx(α) = cos(α/2) I − i sin(α/2) X. At α = 180° this gives −iX.'},
      {t:'−X',tag:'missing-i',fb:'The factor i is missing. At α = 180° the formula gives cos 90° I − i sin 90° X = −iX.'},
      {t:'−iX',ok:true}
    ],
    reference:'At α = 180°, cos 90° = 0 and sin 90° = 1, so Rx(180°) = −iX. It differs from X only by the global factor −i, so the X gate and a half turn about x act the same on every state.',
    result:'Rx(180°) = −iX.',
    scene:function(){return {state:[0,0,1],hint:{axis:[1,0,0]}};},
    reveal:function(sp,done){sp.ghost=[0,0,1];sp.animate([{from:[0,0,1],axis:AX.x,angle:PI,hint:{axis:AX.x}}],function(){sp.state=[0,0,-1];sp.draw();done();});}},
  {id:'o11',concept:'O3',level:1,type:'pcomm',a:'XX',b:'ZZ'},
  {id:'o12',concept:'O3',level:2,type:'pcomm',a:'XI',b:'ZX'},
  {id:'o13',concept:'O3',level:2,type:'pstrprod',a:'XZ',b:'YZ'},
  {id:'o14',concept:'O3',level:3,type:'pstrexp',q1:[60,0],q2:'zero',ops:'XZ'},
  {id:'o15',concept:'O3',level:3,type:'pcomm',a:'XYZ',b:'YZX'}
];

function genO(n,seed){
  var rnd=mulberry32((seed|0)+n*49999+53),k=Math.floor(rnd()*6),L=['X','Y','Z'],F=['I','X','Y','Z'],id='go'+n,a,b,len,i;
  function word(m){var w='';for(var j=0;j<m;j++)w+=pick(rnd,F);return w;}
  if(k===0)return {id:id,concept:'O1',level:3,type:'peig',op:pick(rnd,L),ev:pick(rnd,[1,-1]),generated:true};
  if(k===1)return {id:id,concept:'O1',level:3,type:'pexp',state:[pick(rnd,[30,45,60,90,120,135,150]),pick(rnd,[0,45,60,90,120,180,270])],op:pick(rnd,L),generated:true};
  if(k===2){a=pick(rnd,L);do{b=pick(rnd,L);}while(b===a);return {id:id,concept:'O2',level:3,type:'pprod',a:a,b:b,generated:true};}
  if(k===3){
    len=pick(rnd,[2,2,3]);
    for(i=0;i<50;i++){a=word(len);b=word(len);if(a!==b&&/[XYZ]/.test(a)&&/[XYZ]/.test(b))break;}
    return {id:id,concept:'O3',level:3,type:'pcomm',a:a,b:b,generated:true};
  }
  if(k===4){
    for(i=0;i<50;i++){a=word(2);b=word(2);if(a!==b&&/[XYZ]/.test(a)&&/[XYZ]/.test(b))break;}
    return {id:id,concept:'O3',level:3,type:'pstrprod',a:a,b:b,generated:true};
  }
  var grid=[[45,0],[60,0],[90,0],[90,90],[120,0],[135,180],[60,90],[90,180],[45,90],[120,270],'zero','plus','plusi','one'],q1,q2,ops;
  for(i=0;i<80;i++){
    q1=pick(rnd,grid);q2=pick(rnd,grid);ops=pick(rnd,L)+pick(rnd,L);
    if(Math.abs(comp(vecOf(q1),ops[0]))>0.2&&Math.abs(comp(vecOf(q2),ops[1]))>0.2)break;
  }
  return {id:id,concept:'O3',level:3,type:'pstrexp',q1:q1,q2:q2,ops:ops,generated:true};
}

GROUPS.O={name:'Operators',concepts:['O1','O2','O3'],starter:STARTER_O,gen:genO};
GROUP_ORDER.splice(GROUP_ORDER.indexOf('N'),0,'O');

// Self-checks of the Pauli algebra
function cmat(M,s){return M.map(function(row){return row.map(function(c){return cmul(c,s);});});}
function matmul(A,B){
  return A.map(function(row,i){return B[0].map(function(_,j){var s=[0,0];for(var k=0;k<B.length;k++)s=cadd(s,cmul(A[i][k],B[k][j]));return s;});});
}
function kron(A,B){
  var out=[];
  for(var i=0;i<A.length;i++)for(var p=0;p<B.length;p++){
    var row=[];for(var j=0;j<A.length;j++)for(var q=0;q<B.length;q++)row.push(cmul(A[i][j],B[p][q]));out.push(row);
  }
  return out;
}
function matNear(A,B){for(var i=0;i<A.length;i++)for(var j=0;j<A.length;j++)if(Math.abs(A[i][j][0]-B[i][j][0])>1e-9||Math.abs(A[i][j][1]-B[i][j][1])>1e-9)return false;return true;}
var PMAT={I:[[[1,0],[0,0]],[[0,0],[1,0]]],X:NAMED.X.std,Y:NAMED.Y.std,Z:NAMED.Z.std};
var IPOW=[[1,0],[0,1],[-1,0],[0,-1]];
function strMat(s){var M=PMAT[s[0]];for(var i=1;i<s.length;i++)M=kron(M,PMAT[s[i]]);return M;}
function selfChecks3(){
  var out=[],F=['I','X','Y','Z'],ok=true;
  F.forEach(function(a){F.forEach(function(b){var r=pmul([a],[b]);if(!matNear(matmul(PMAT[a],PMAT[b]),cmat(PMAT[r.s[0]],IPOW[r.k])))ok=false;});});
  out.push({name:'The products of the Pauli matrices follow XY = iZ, YZ = iX, ZX = iY',ok:ok});
  ok=true;
  var words=[];F.forEach(function(a){F.forEach(function(b){words.push([a,b]);});});
  words.forEach(function(a){words.forEach(function(b){
    var AB=matmul(strMat(a),strMat(b)),BA=matmul(strMat(b),strMat(a)),sign=nAnti(a,b)%2?[-1,0]:[1,0];
    if(!matNear(AB,cmat(BA,sign)))ok=false;
    var r=pmul(a,b);if(!matNear(AB,cmat(strMat(r.s),IPOW[r.k])))ok=false;
  });});
  out.push({name:'Two-qubit Pauli strings commute exactly when an even number of positions anticommute',ok:ok});
  ok=true;
  [fromAngles(60,40),fromAngles(130,250),[1,0,0],[0,-1,0]].forEach(function(r){
    var k=ketOf(r);
    ['X','Y','Z'].forEach(function(P){
      var v=matmul(PMAT[P],[[k[0]],[k[1]]]),e=cadd(cmul([k[0][0],-k[0][1]],v[0][0]),cmul([k[1][0],-k[1][1]],v[1][0]));
      if(Math.abs(e[0]-comp(r,P))>1e-9||Math.abs(e[1])>1e-9)ok=false;
    });
  });
  out.push({name:'⟨X⟩, ⟨Y⟩ and ⟨Z⟩ equal the components of the Bloch vector',ok:ok});
  out.push({name:'Rx(180°) equals −iX',ok:matNear(unitaryOf([1,0,0],PI),cmat(PMAT.X,[0,-1]))});
  ok=true;
  var rnd=mulberry32(7);
  for(var t=0;t<20;t++){
    var a=unit([rnd()-0.5,rnd()-0.5,rnd()-0.5]),b=unit([rnd()-0.5,rnd()-0.5,rnd()-0.5]),c=cross(a,b);
    function sig(n){var M=[[[0,0],[0,0]],[[0,0],[0,0]]];['X','Y','Z'].forEach(function(P,i){var Q=cmat(PMAT[P],[n[i],0]);for(var x=0;x<2;x++)for(var y=0;y<2;y++)M[x][y]=cadd(M[x][y],Q[x][y]);});return M;}
    var lhs=matmul(sig(a),sig(b)),rhs=cmat(PMAT.I,[dot(a,b),0]),ic=cmat(sig(c),[0,1]);
    for(var x=0;x<2;x++)for(var y=0;y<2;y++)rhs[x][y]=cadd(rhs[x][y],ic[x][y]);
    if(!matNear(lhs,rhs))ok=false;
  }
  out.push({name:'(a·σ)(b·σ) = (a·b) I + i (a×b)·σ',ok:ok});
  return out;
}
