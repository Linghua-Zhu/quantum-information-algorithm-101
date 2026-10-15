// Regression tests. The page is served over http so that two tabs share storage events.
const {chromium}=require('playwright');
const http=require('http'),fs=require('fs'),path=require('path');
const HTML=fs.readFileSync(path.join(__dirname,'..','docs','index.html'));
const KEY='qip101-v3';
let fails=0,passes=0;
function ok(c,msg){if(c)passes++;else{fails++;console.log('  FAIL: '+msg);}}
function eq(a,b,msg){ok(JSON.stringify(a)===JSON.stringify(b),msg+' (got '+JSON.stringify(a)+', expected '+JSON.stringify(b)+')');}
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{
  const server=http.createServer((q,r)=>{r.writeHead(200,{'content-type':'text/html; charset=utf-8'});r.end(HTML);}).listen(0);
  const URL='http://127.0.0.1:'+server.address().port+'/';
  const browser=await chromium.launch();
  const errs=[];
  async function fresh(opts={}){
    const ctx=await browser.newContext(Object.assign({viewport:{width:1280,height:900}},opts));
    const page=await ctx.newPage();
    page.on('pageerror',e=>errs.push(e.message));page.on('console',m=>{if(m.type()==='error'&&!/favicon/.test(m.text()))errs.push(m.text());});
    return {ctx,page};
  }
  const st=page=>page.evaluate(k=>JSON.parse(localStorage.getItem(k)),KEY);
  const place=async(page,a,b)=>{if((await page.locator('#p-numbers').getAttribute('open'))===null)await page.locator('#p-numbers summary').click();await page.fill('#p-n1',String(a));await page.fill('#p-n2',String(b));await page.click('#p-placeangles');};

  console.log('1. an answer locked in during the animation is kept');
  let {ctx,page}=await fresh();
  await page.goto(URL+'#u1-practice');
  await page.click('#p-groups button[data-g="G"]');          // r01: |0>, X -> |1>
  await place(page,90,0);                                     // wrong
  await page.click('#p-lock');
  await page.click('#p-groups button[data-g="G"]');          // leave during the animation
  let S=await st(page);
  ok(S.items.r01&&S.items.r01.n===1&&S.items.r01.m===1&&S.items.r01.first===0,'the miss on r01 is recorded '+JSON.stringify(S.items.r01));
  ok(S.log.length===1&&S.log[0].item==='r01'&&S.log[0].tag!=='correct','one log row for it');
  ok((await page.locator('#p-head').getAttribute('data-item'))==='r02','the next item is shown, not r01 again');
  await place(page,90,180);await page.click('#p-lock');await page.reload();   // r02 right, reload mid-animation
  S=await st(page);
  ok(S.items.r02&&S.items.r02.first===1&&S.log.length===2,'an answer followed by a reload is kept');
  ok((await page.locator('#p-head').getAttribute('data-item'))==='r03','after the reload the next item is shown');
  await place(page,90,90);
  await page.dblclick('#p-lock');
  await page.waitForSelector('#st3:not([hidden])');
  S=await st(page);
  ok(S.log.length===3,'a double click on Lock records once');
  await ctx.close();

  console.log('2. two tabs do not overwrite each other');
  ({ctx,page}=await fresh());
  await page.goto(URL+'#u1-start');
  const B=await ctx.newPage();B.on('pageerror',e=>errs.push('B '+e.message));
  await B.goto(URL+'#u1-practice');
  for(const [a,b] of [[90,0],[45,0],[90,90]]){await place(B,a,b);await B.click('#p-lock');await B.waitForSelector('#st3:not([hidden])');await B.fill('#p-exp','x');await B.click('#p-compare');await B.click('#p-next');}
  await sleep(300);
  await page.click('#unit-tabs a[data-go="u1-practice"]');
  S=await st(page);
  ok(Object.keys(S.items).length===3,'tab A kept the three answers given in tab B ('+Object.keys(S.items).length+')');
  ok((await page.locator('#p-head').getAttribute('data-item'))==='s04','tab A goes on where tab B stopped');
  await page.click('.top a[data-go="about"]');await page.click('#v-clear');await page.click('#v-clear');
  await sleep(300);
  ok((await B.locator('#p-head').getAttribute('data-item'))==='s01','clearing in tab A resets tab B');
  await sleep(500);
  const writes=await B.evaluate(()=>{let n=0;const f=Storage.prototype.setItem;Storage.prototype.setItem=function(){n++;return f.apply(this,arguments);};return new Promise(r=>setTimeout(()=>r(n),800));});
  ok(writes===0,'the two tabs do not keep writing to each other ('+writes+' writes in 0.8 s)');
  await ctx.close();

  console.log('3. a step still animating reaches the Code page');
  ({ctx,page}=await fresh());
  await page.goto(URL+'#u1-explore');
  await page.click('#e-gates button:nth-child(1)');                    // X
  await page.click('#view-explore a[data-go="u1-code"]');
  await sleep(2200);
  ok((await page.locator('#c-code').textContent()).includes('qc.x(0)')&&(await page.locator('#c-cnote').textContent()).includes('from Explore'),'the code shows the step once it is done');
  // inputs
  await page.click('#view-code a[data-go="u1-explore"]');
  await page.fill('#e-shots','1e3');await page.click('#e-measure');
  ok((await page.locator('#e-mout').textContent()).startsWith('1,000 shots'),'1e3 is read as 1000 shots ['+(await page.locator('#e-mout').textContent()).slice(0,40)+']');
  await page.fill('#e-shots','12.5');await page.click('#e-measure');
  ok(await page.locator('#e-merr').isVisible(),'12.5 shots is refused');
  await page.fill('#e-shots','200');await page.click('#e-measure');
  ok((await page.locator('#e-mout').textContent()).includes('200 shots'),'measurement shown');
  await page.click('#e-gates button:nth-child(4)');await sleep(1800);
  ok((await page.locator('#e-mout').textContent())==='','the old measurement line goes when the state changes');
  await page.fill('#e-angle','0.0000001');await page.click('#e-rotate');
  ok(await page.locator('#e-err').isVisible(),'an angle that rounds to zero is refused with a message');
  await page.fill('#e-angle','33.3333333');await page.click('#e-rotate');await sleep(1500);
  ok((await page.locator('#e-circuit').textContent()).includes('Rz(33.333°)'),'a long decimal angle is rounded ['+await page.locator('#e-circuit').textContent()+']');
  await page.fill('#e-t','10');await page.fill('#e-ratio','0.01');await page.click('#e-relax');
  ok(await page.locator('#e-nerr').isVisible(),'T2/T1 = 0.01 is refused');
  await page.fill('#e-ratio','0.1');await page.click('#e-relax');await sleep(1700);
  await page.reload();
  ok((await page.locator('#e-circuit').textContent()).includes('T1, T2'),'a strong relaxation step survives a reload');
  for(let i=0;i<24;i++){
    const n0=await page.locator('#e-circuit .gate').count();
    if(n0>=24)break;
    await page.click('#e-gates button:nth-child(3)');
    await page.waitForFunction(n=>document.querySelectorAll('#e-circuit .gate').length>n,n0,{timeout:5000});
  }
  ok((await page.locator('#e-circuit .gate').count())===24,'24 steps fit');
  await page.click('#e-gates button:nth-child(3)');
  ok(await page.locator('#e-serr').isVisible(),'the 24 step limit is announced next to the step list');
  await page.click('#e-undo');
  ok(!(await page.locator('#e-serr').isVisible()),'and the message goes after an undo');
  await page.click('#view-explore a[data-go="u1-code"]');
  await page.fill('#c-shots','');await page.type('#c-shots','12500');
  ok(await page.locator('#c-serr').isVisible(),'12500 shots shows an error');
  await page.locator('#c-shots').blur();
  const shown=await page.locator('#c-shots').inputValue(),inCode=(await page.locator('#c-code').textContent()).match(/SHOTS = (\d+)/)[1];
  ok(shown===inCode&&!(await page.locator('#c-serr').isVisible()),'after leaving the field it shows the number the script uses ('+shown+' / '+inCode+')');
  await ctx.close();

  console.log('4. a retry left over from an earlier day is not served again');
  ({ctx,page}=await fresh());
  await page.clock.setFixedTime(new Date(2026,9,12,10,0,0));
  await page.goto(URL+'#u1-practice');
  await place(page,45,0);await page.click('#p-lock');await page.waitForSelector('#st3:not([hidden])');   // miss s01, then stop
  await page.clock.setFixedTime(new Date(2026,9,13,10,0,0));
  await page.reload();
  ok((await page.locator('#p-groups button[data-g="R"] small').textContent())==='1 due','next day: one item due');
  const seen=[];
  for(let i=0;i<5;i++){
    seen.push(await page.locator('#p-head').getAttribute('data-item'));
    const I=await page.evaluate(()=>{const id=document.getElementById('p-head').getAttribute('data-item');let it;GROUPS.S.starter.forEach(x=>{if(x.id===id)it=x;});const R=buildItem(it);return R.mode==='point'?toAngles(R.answer):null;});
    await place(page,I.theta,I.phi);await page.click('#p-lock');await page.waitForSelector('#st3:not([hidden])');await page.fill('#p-exp','x');await page.click('#p-compare');await page.click('#p-next');
  }
  ok(!seen.includes('s01'),'the States queue goes on without the stale retry ('+seen.join(' ')+')');
  ok((await page.locator('#p-groups button[data-g="R"] small').textContent())==='1 due','the item is still due under Review');
  await page.click('#p-groups button[data-g="R"]');
  ok((await page.locator('#p-head').getAttribute('data-item'))==='s01'&&(await page.locator('#p-head').getAttribute('data-level'))==='3','and Review serves it without hints');
  // a summary left on screen is redrawn on a later day
  await place(page,90,0);await page.click('#p-lock');await page.waitForSelector('#st3:not([hidden])');await page.fill('#p-exp','x');await page.click('#p-compare');await page.click('#p-next');
  ok((await page.locator('#p-head').textContent()).includes('Review is done for today'),'review done');
  await page.click('#unit-tabs a[data-go="u1-goals"]');
  await page.clock.setFixedTime(new Date(2026,9,16,10,0,0));
  await page.click('#unit-tabs a[data-go="u1-practice"]');
  ok(!!(await page.locator('#p-head').getAttribute('data-item')),'three days later the review tab shows an item, not the old summary');
  await ctx.close();

  console.log('5. saved state that is malformed');
  const D=Math.floor((Date.now()-new Date().getTimezoneOffset()*60000)/86400000);
  const blobs=[
    '{"v":3,"discuss":{"dG1":{"first":1,"final":2.5}}}',
    '{"v":3,"discuss":{"dG1":{"first":null,"final":2},"dS1":{"first":true,"final":""},"dS2":{"first":1.5}}}',
    '{"v":3,"group":"R","review":{"day":'+D+',"queue":[{"id":"s01"}],"pos":0}}',
    '{"v":3,"group":"G","groups":{"G":{"mode":"free","queue":[]}},"free":{"G1":5,"G2":5,"G3":5,"G4":5}}',
    '{"v":3,"log":[null,3,"x",[]]}',
    '{"v":3,"explore":{"start":"constructor","ops":[]}}',
    '{"v":3,"explore":{"start":"zero","ops":[{"t":"gate","name":"constructor"}]}}',
    '{"v":3,"explore":{"start":"zero","ops":[{"t":"gate","name":["H"]}]}}',
    '{"v":3,"code":{"axis":"constructor","shots":"many","target":"toString"}}',
    '{"v":3,"code":{"axis":"x","shots":10,"target":"device","mode":"constructor"}}',
    '{"v":3,"group":"R","review":{"day":'+D+',"queue":[{"id":"constructor"}],"pos":0},"tags":{"constructor":3},"items":{"__proto__":{"n":1,"due":1,"day":1},"constructor":{"n":1,"due":1,"day":1}}}',
    '{"v":3,"group":"S","groups":{"S":{"queue":[]}},"tags":{"half-angle":"<img src=x onerror=window.__pwned=1>"}}',
    '{"v":3,"groups":{"S":{"queue":[{"id":"old1"},{"id":"old2"},{"id":"s01"},{"id":"s02"}],"pos":2}}}',
    '{"v":3,"groups":null,"items":[],"review":5,"discuss":"x","free":null,"tags":[],"log":{},"explore":7,"code":null,"dq":99,"unitTab":"nope","seed":"abc","group":{}}',
    '[1,2,3]','"just a string"','{"v":3','null',
    JSON.stringify({v:3,log:Array.from({length:5000},(_,i)=>({t:'x',item:'s01',n:i}))}),
  ];
  for(const [i,b] of blobs.entries()){
    ({ctx,page}=await fresh());
    await page.goto(URL);
    await page.evaluate(([k,v])=>localStorage.setItem(k,v),[KEY,b]);
    const before=errs.length;
    for(const r of ['home','units','u0-goals','u0-start','u0-practice','u0-discuss','u0-explore','u0-code','u1-goals','u1-start','u1-practice','u1-discuss','u1-explore','u1-code','research','about']){await page.goto(URL+'#'+r);await page.reload();await sleep(40);}
    await page.goto(URL+'#u1-practice');await page.reload();
    // the page must still take an answer
    const hasItem=await page.locator('#p-head').getAttribute('data-item');
    if(!hasItem){const g=page.locator('#p-groups button[data-g="M"]');await g.click();}
    await page.click('#p-groups button[data-g="M"]');
    if(await page.locator('#p-num').count()){await page.fill('#p-num','0.75');await page.click('#p-lock');await page.waitForSelector('#st3:not([hidden])',{timeout:8000});}
    await page.click('#unit-tabs a[data-go="u1-discuss"]');
    const dOk=await page.locator('#d-steps .step').count();
    const pw=await page.evaluate(()=>window.__pwned||document.querySelector('img[src="x"]')?1:0);
    ok(errs.length===before&&dOk>=1&&!pw,'blob '+i+' loads, takes an answer and shows Discuss'+(errs.length>before?' ERR '+errs.slice(before).join(' | ').slice(0,200):'')+(pw?' SCRIPT RAN':''));
    if(i===blobs.length-1)ok((await st(page)).log.length<=1500,'a long saved log is cut to 1500 rows');
    await ctx.close();
  }

  console.log('6. small things');
  ({ctx,page}=await fresh());
  await page.goto(URL+'#u1-practice');
  await page.click('#p-groups button[data-g="G"]');
  await place(page,180,0);await page.click('#p-lock');
  await page.click('.top a[data-go="about"]');await page.click('#v-clear');await page.click('#v-clear');
  await sleep(2500);
  ok(errs.length===0,'clearing data during a practice animation raises no error'+(errs.length?': '+errs.join(' | '):''));
  await page.click('.top a[data-go="units"]');await page.click('#u-map a[data-go="u1-practice"]');
  await page.click('#p-groups button[data-g="M"]');
  await page.fill('#p-num','0.75');await page.click('#p-lock');await page.waitForSelector('#st3:not([hidden])');
  await page.dblclick('#p-restart');
  S=await st(page);
  ok(S&&Object.keys(S.items).length===1,'a double click on Start over does not reset');
  await page.waitForTimeout(4300);
  await page.click('#p-restart');await page.waitForTimeout(700);await page.click('#p-restart');
  S=await st(page);
  ok(Object.keys(S.items).length===0,'two separate clicks do');
  await page.click('#p-groups button[data-g="S"]');
  const box=await page.locator('#p-sphere svg:not([hidden])').boundingBox();
  await page.mouse.click(box.x+box.width/2,box.y+box.height/2,{button:'right'});
  ok((await page.locator('#p-read').textContent())==='No point placed yet.','a right click does not place a prediction');
  await page.mouse.click(box.x+box.width/2,box.y+box.height/2);
  ok((await page.locator('#p-read').textContent()).startsWith('Your point'),'a left click does');
  await page.click('#unit-tabs a[data-go="u1-discuss"]');
  await page.click('#d-lock1');ok(await page.locator('#d-err1').isVisible(),'discuss: answer required');
  await page.check('#d-o1 input[value="0"]');ok(!(await page.locator('#d-err1').isVisible()),'discuss: the message goes once an option is chosen');
  await ctx.close();
  ({ctx,page}=await fresh());
  await ctx.addInitScript(()=>{Storage.prototype.setItem=()=>{throw new Error('quota');};});
  await page.goto(URL+'#u1-practice');
  await page.click('#p-groups button[data-g="M"]');
  ok(await page.locator('#f-nosave').isVisible(),'when the browser refuses to store, the page says so');
  await ctx.close();
  ({ctx,page}=await fresh());
  await page.goto(URL+'#u1-practice');
  ok(!(await page.locator('#f-nosave').isVisible()),'and stays silent when storing works');
  await ctx.close();

  console.log('7. progress saved before the Operators topic is kept');
  ({ctx,page}=await fresh());
  await page.goto(URL);
  await page.evaluate(([k,D])=>{
    const ids=g=>GROUPS[g].starter.map(i=>({id:i.id}));
    const s={v:3,seed:20261006,group:'N',
      groups:{S:{mode:'starter',queue:ids('S'),pos:14,freeN:0},G:{mode:'starter',queue:ids('G'),pos:3,freeN:0},M:{mode:'starter',queue:ids('M'),pos:0,freeN:0},N:{mode:'starter',queue:ids('N'),pos:2,freeN:0}},
      items:{s01:{n:1,m:0,first:1,last:1,box:1,due:D+3,day:D},n01:{n:1,m:1,first:0,last:0,box:0,due:D+1,day:D}},
      free:{},tags:{'wrong-sense':1},review:{day:-1,queue:[],pos:0},log:[],discuss:{dN1:{first:1,final:2}},dq:2,
      explore:{start:'zero',ops:[]},code:{axis:'x',shots:500,target:'fake_device'},unitTab:'u1-practice',seenStart:true};
    localStorage.setItem(k,JSON.stringify(s));
  },[KEY,D]);
  await page.reload();await page.goto(URL+'#u1-practice');
  ok(await page.locator('#p-groups [aria-current]').getAttribute('data-g')==='N','the topic in use is kept');
  eq(await page.locator('#p-head').getAttribute('data-item'),'n03','the place in the topic is kept');
  ok(await page.locator('#p-strip .c .pip.ok').count()===1&&await page.locator('#p-strip .c .pip.miss').count()===1,'earlier answers are kept');
  await page.click('#p-groups button[data-g="O"]');
  eq(await page.locator('#p-head').getAttribute('data-item'),'o01','the new topic starts at its first item');
  await page.click('#unit-tabs a[data-go="u1-code"]');
  ok(await page.locator('#c-mode-counts').isChecked()&&(await page.locator('#c-code').textContent()).includes('SHOTS = 500')&&await page.locator('#c-target-fake_device').isChecked(),'code settings are kept and the script still counts');
  S=await st(page);
  ok(S.discuss.dN1&&S.discuss.dN1.final===2&&S.code.mode==='counts'&&S.groups.O&&S.groups.O.pos===0,'saved state gains the new topic');
  await ctx.close();

  console.log(errs.length?'errors: '+JSON.stringify(errs.slice(0,6),null,1):'no page errors');
  fails+=errs.length;
  console.log(passes+' checks passed, '+fails+' failed');
  await browser.close();server.close();
  process.exit(fails?1:0);
})().catch(e=>{console.log('CRASH',e);process.exit(2);});
