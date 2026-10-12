// End-to-end test of docs/index.html in a headless browser.
const {chromium}=require('playwright');
const path=require('path');
const FILE='file://'+path.join(__dirname,'..','docs','index.html');
const KEY='qip101-v3';
let fails=0,passes=0;
function ok(cond,msg){if(cond)passes++;else{fails++;console.log('  FAIL: '+msg);}}
function eq(a,b,msg){ok(JSON.stringify(a)===JSON.stringify(b),msg+' (got '+JSON.stringify(a)+', expected '+JSON.stringify(b)+')');}
const DAY0=new Date(2026,9,12,10,0,0);           // 12 October 2026, 10:00 local time
function dayDate(n){return new Date(DAY0.getTime()+n*86400000);}

async function state(page){return page.evaluate(k=>JSON.parse(localStorage.getItem(k)),KEY);}
async function info(page){
  return page.evaluate(()=>{
    const head=document.getElementById('p-head'),id=head.getAttribute('data-item');
    if(!id)return null;
    const level=+head.getAttribute('data-level'),S=JSON.parse(localStorage.getItem('qip101-v3'));
    let it=null;
    GROUP_ORDER.forEach(k=>GROUPS[k].starter.forEach(x=>{if(x.id===id)it=x;}));
    if(!it){const g=document.querySelector('#p-groups [aria-current]').getAttribute('data-g');it=GROUPS[g].gen(+id.replace(/^\D+/,''),S?S.seed:20261006);}
    const R=buildItem(Object.assign({},it,{level})),sc=R.scene();
    return {id,level,mode:R.mode,type:R.type,answer:R.answer,slice:sc.slice||null,nopt:R.options?R.options.length:0,
      note:head.querySelector('.note').textContent,pos:head.querySelector('.meta span:last-child').textContent,hint:!!sc.hint||!!(sc.guides&&sc.guides.length)||!!(sc.lines&&sc.lines.length)};
  });
}
// answer the item on screen, right or wrong, and go on to the next one
async function answer(page,right,opts={}){
  const I=await info(page);
  if(!I)throw new Error('no item on screen');
  if(I.mode==='point'||I.mode==='slice'){
    let a,b;
    if(I.mode==='point'){
      const v=right?I.answer:I.answer.map(x=>-x);
      const ang=await page.evaluate(v=>toAngles(v),v);a=ang.theta;b=ang.phi;
    }else{
      const len=Math.hypot(...I.answer),u=I.slice.u,w=I.slice.w;
      const v=right?I.answer:(len<0.3?[0.6*u[0]+0.6*w[0],0.6*u[1]+0.6*w[1],0.6*u[2]+0.6*w[2]]:[0,0,0]);
      a=v[0]*u[0]+v[1]*u[1]+v[2]*u[2];b=v[0]*w[0]+v[1]*w[1]+v[2]*w[2];
    }
    if(!(await page.locator('#p-numbers').getAttribute('open'))&&(await page.locator('#p-numbers').getAttribute('open'))!=='')await page.locator('#p-numbers summary').click();
    await page.fill('#p-n1',String(Math.round(a*1e4)/1e4));await page.fill('#p-n2',String(Math.round(b*1e4)/1e4));
    await page.click('#p-placeangles');
    ok(!(await page.locator('#p-angerr').isVisible()),I.id+': numbers accepted');
  }else if(I.mode==='number'){
    const x=right?I.answer:(I.answer>0.5?I.answer-0.33:I.answer+0.33);
    await page.fill('#p-num',x.toFixed(3));
  }else if(I.mode==='multi'){
    const want=right?I.answer:(I.answer.length?[]:['z']);
    if(!want.length)await page.check('#p-opts input[value="none"]');
    for(const k of want)await page.check('#p-opts input[value="'+k+'"]');
  }else{
    const i=right?I.answer:(I.answer+1)%I.nopt;
    await page.check('#p-opts input[value="'+i+'"]');
  }
  await page.click('#p-lock');
  await page.waitForSelector('#st3:not([hidden])',{timeout:15000});
  const fbOk=await page.locator('#p-obs .fb').evaluate(e=>e.classList.contains('ok'));
  const fb=await page.locator('#p-obs .fb').textContent();
  ok(fbOk===right,I.id+': feedback '+(right?'says correct':'says not correct')+' ['+fb.slice(0,60)+']');
  ok(right?fb==='Correct.':fb.length>25,I.id+': feedback text is specific');
  // the explain step insists on a sentence
  await page.click('#p-compare');
  ok(await page.locator('#p-experr').isVisible(),I.id+': empty explanation is refused');
  await page.fill('#p-exp',opts.text||'Because of the geometry.');
  await page.click('#p-compare');
  ok((await page.locator('#p-refbox .ref').textContent()).length>30,I.id+': reference shown');
  await page.click('#p-next');
  return I;
}
async function overflow(page,label){
  const o=await page.evaluate(()=>({sw:document.documentElement.scrollWidth,cw:document.documentElement.clientWidth}));
  ok(o.sw<=o.cw+1,label+': no horizontal overflow ('+o.sw+' vs '+o.cw+')');
}

(async()=>{
  const browser=await chromium.launch();
  const ctx=await browser.newContext({viewport:{width:1280,height:900}});
  const page=await ctx.newPage();
  const errs=[];
  page.on('console',m=>{if(m.type()==='error')errs.push(m.text());});
  page.on('pageerror',e=>errs.push('PAGEERROR '+e.message));
  await page.clock.setFixedTime(dayDate(0));

  console.log('A. first visit');
  await page.goto(FILE);
  eq(await page.title(),'Quantum Information and Programming 101','title');
  ok(await page.locator('#view-home').isVisible(),'home is the first page');
  eq(await page.locator('#h-cta a').first().textContent(),'Start here','first call to action is Start here');
  eq(await page.locator('#h-map .unit').count(),6,'course map has six rows');
  eq(await page.locator('#h-map .unit.open').count(),1,'one unit is open');
  await page.click('#h-play');await page.waitForTimeout(2500);
  ok(await page.evaluate(()=>!!document.querySelector('#h-sphere svg .s-trail')),'home figure draws a path');
  await page.locator('#h-map details summary').first().click();
  ok(await page.locator('#h-map details ul').first().isVisible(),'planned contents open');

  console.log('B. start here');
  await page.click('#h-cta a[data-go="u1-start"]');
  ok(await page.locator('#view-start').isVisible(),'start page shown');
  ok(await page.locator('#unit-head').isVisible(),'unit head shown');
  eq(await page.locator('#s-body .lesson').count(),11,'eleven sections');
  eq(await page.locator('#s-body svg.sphere').count(),7,'seven figures');
  eq(await page.locator('#s-toc button').count(),11,'contents list has eleven entries');
  for(const id of ['ex-state','ex-gate','ex-noise']){
    await page.click('#s-play-'+id);
    await page.waitForFunction(i=>document.getElementById('s-play-'+i).textContent==='Play again',id,{timeout:8000});
    passes++;
  }
  const exState=await page.evaluate(()=>{const p=document.querySelector('#s-fig-ex-state .s-trail');return !!p;});
  ok(exState,'worked example leaves its path on the figure');
  await page.click('#s-toc button[data-sec="how"]');
  ok((await state(page)).seenStart===true,'visit to Start here is remembered');

  console.log('C. goals');
  await page.click('#unit-tabs a[data-go="u1-goals"]');
  eq(await page.locator('#g-list > li').count(),6,'six goals');
  eq(await page.locator('#g-list .pip').count(),50,'fifty item marks on the goals page');
  await page.locator('#g-list button[data-pg="G"]').first().click();
  ok(await page.locator('#view-practice').isVisible(),'goal link opens practice');
  eq(await page.locator('#p-groups [aria-current]').getAttribute('data-g'),'G','goal link selects the topic');
  await page.click('#p-groups button[data-g="S"]');

  console.log('D. practice, all starter items');
  const plan={S:{miss:[1,5,9],twice:[5]},G:{miss:[0,7],twice:[]},M:{miss:[2,3,10],twice:[10]},N:{miss:[4,8,10],twice:[]}};
  const sizes={S:14,G:14,M:11,N:11},expect={};
  for(const g of ['S','G','M','N']){
    await page.click('#p-groups button[data-g="'+g+'"]');
    const seen=[],missed=new Set(),again=new Set();
    let guard=0;
    while(guard++<40){
      const I=await info(page);
      if(!I)break;
      const idx=seen.indexOf(I.id);
      let right;
      if(idx<0){seen.push(I.id);right=!plan[g].miss.includes(seen.length-1);if(!right)missed.add(I.id);
        ok(!/back because/.test(I.note),I.id+': first showing has no retry note');
        expect[I.id]={first:right?1:0,last:right?1:0,m:right?0:1};}
      else{
        ok(/back because you missed it earlier/.test(I.note),I.id+': retry note shown');
        const order=[...missed].indexOf(I.id),tw=plan[g].twice.includes(plan[g].miss[order]);
        right=!tw;expect[I.id].last=right?1:0;if(!right)expect[I.id].m++;again.add(I.id);
      }
      await answer(page,right);
    }
    eq(seen.length,sizes[g],g+': all starter items shown');
    eq(again.size,plan[g].miss.length,g+': every missed item came back once');
    const head=await page.locator('#p-head').textContent();
    const firstRight=sizes[g]-plan[g].miss.length;
    ok(head.includes('Right on the first try: '+firstRight+' of '+sizes[g]),g+': summary counts first-try results ['+head.slice(0,140)+']');
  }
  let S=await state(page);
  const d0=await page.evaluate(()=>{const d=new Date();return Math.floor((d.getTime()-d.getTimezoneOffset()*60000)/86400000);});
  let bad=0;
  for(const id of Object.keys(expect)){
    const r=S.items[id],e=expect[id];
    if(!r||r.first!==e.first||r.last!==e.last||r.m!==e.m||r.n!==1||r.day!==d0||r.box!==(e.first?1:0)||r.due!==d0+(e.first?3:1)){bad++;console.log('   record',id,JSON.stringify(r),JSON.stringify(e));}
  }
  eq(bad,0,'item records match what was answered');
  eq(Object.keys(S.items).length,50,'fifty item records');
  const marks=await page.evaluate(()=>({ok:document.querySelectorAll('#p-strip .c .pip.ok').length,rec:document.querySelectorAll('#p-strip .c .pip.rec').length,miss:document.querySelectorAll('#p-strip .c .pip.miss').length,all:document.querySelectorAll('#p-strip .c .pip').length}));
  eq(marks,{ok:39,rec:9,miss:2,all:50},'progress marks: right first, right after a miss, missed');
  eq(S.log.length,50+11,'one log row per answer');
  ok(S.log.every(r=>r.explanation==='Because of the geometry.'),'explanations are saved with their rows');
  eq(await page.locator('#p-groups button[data-g="R"] small').count(),0,'nothing due for review on the same day');
  await page.click('#p-groups button[data-g="R"]');
  ok((await page.locator('#p-head').textContent()).includes('Nothing is due for review today'),'review tab says nothing is due today');
  ok((await page.locator('#p-head').textContent()).includes('Next review: 11 items tomorrow'),'review tab announces tomorrow');
  await overflow(page,'practice summary');

  console.log('E. more practice (generated items)');
  await page.click('#p-groups button[data-g="G"]');
  await page.click('#p-more');
  for(let i=0;i<6;i++){const I=await answer(page,i%2===0);ok(/^g\d+$/.test(I.id),'generated gate item '+I.id);}
  await page.click('#p-groups button[data-g="M"]');await page.click('#p-more');
  for(let i=0;i<4;i++)await answer(page,true);
  await page.click('#p-groups button[data-g="N"]');await page.click('#p-more');
  for(let i=0;i<4;i++)await answer(page,i!==1);
  await page.click('#p-groups button[data-g="S"]');await page.click('#p-more');
  for(let i=0;i<4;i++)await answer(page,true);
  S=await state(page);
  eq(Object.keys(S.items).length,50,'generated items leave the item records alone');
  ok(S.free.G1||S.free.G2||S.free.G3||S.free.G4,'free practice is counted by idea');
  await page.click('#p-backstarter');
  ok((await page.locator('#p-head').textContent()).includes('Starter set complete'),'back to the starter set summary');

  console.log('F. review on the next day');
  await page.clock.setFixedTime(dayDate(1));
  await page.click('#unit-tabs a[data-go="u1-goals"]');
  await page.click('.top a[data-go="home"]');
  eq(await page.locator('#h-review').textContent(),'Review 11 items','home offers the review');
  await page.click('#h-review');
  eq(await page.locator('#p-groups [aria-current]').getAttribute('data-g'),'R','review opens from home');
  eq(await page.locator('#p-groups button[data-g="R"] small').textContent(),'11 due','review tab counts the due items');
  const missedIds=Object.keys(expect).filter(id=>!expect[id].first);
  const revSeen=[];
  for(let i=0;i<11;i++){
    const I=await info(page);
    ok(missedIds.includes(I.id),'day 1 review holds only missed items ('+I.id+')');
    eq(I.level,3,I.id+': review comes at level 3');
    ok(!I.hint,I.id+': review shows no hint in the figure');
    ok(/You last answered this item yesterday/.test(I.note),I.id+': review note says when it was last answered');
    ok(I.pos==='Review, item '+(i+1)+' of 11',I.id+': position label ['+I.pos+']');
    revSeen.push(I.id);
    await answer(page,true);
  }
  eq(new Set(revSeen).size,11,'eleven different items reviewed');
  ok((await page.locator('#p-head').textContent()).includes('Review is done for today'),'review done message');
  S=await state(page);
  ok(missedIds.every(id=>S.items[id].box===1&&S.items[id].due===d0+1+3&&S.items[id].last===1&&S.items[id].n===2),'missed items move up one step and are due in 3 days');
  eq(await page.locator('#p-strip .c .pip.miss').count(),0,'no missed marks left');
  eq(await page.locator('#p-strip .c .pip.rec').count(),11,'eleven items now right after a miss');

  console.log('G. review on day 3, with a miss in review');
  await page.clock.setFixedTime(dayDate(3));
  await page.reload();
  await page.goto(FILE+'#u1-practice');
  eq(await page.locator('#p-groups button[data-g="R"] small').textContent(),'39 due','39 items due on day 3');
  await page.click('#p-groups button[data-g="R"]');
  let n=0,missedInReview=null,retryNote=false;
  const seen3=new Set();
  while(n++<60){
    const I=await info(page);
    if(!I){
      const more=page.locator('#p-reviewmore');
      if(await more.count()){await more.click();continue;}
      break;
    }
    if(I.id===missedInReview&&/back because/.test(I.note)){retryNote=true;await answer(page,true);continue;}
    seen3.add(I.id);
    if(seen3.size===2&&!missedInReview){missedInReview=I.id;await answer(page,false);}
    else await answer(page,true);
  }
  eq(seen3.size,39,'all 39 due items were reviewed, in sets of at most 12');
  ok(retryNote,'an item missed in review came back in the same session');
  S=await state(page);
  const r3=S.items[missedInReview];
  ok(r3.box===0&&r3.due===d0+3+1&&r3.m===1&&r3.last===1&&r3.first===1,'a miss in review resets the schedule to the next day '+JSON.stringify(r3));
  const others=Object.keys(expect).filter(id=>expect[id].first&&id!==missedInReview);
  ok(others.every(id=>S.items[id].box===2&&S.items[id].due===d0+3+7),'items right in review move to the 7 day step');
  eq(await page.locator('#p-strip .c .pip.rec').count(),12,'the item missed in review now shows as right after a miss');

  console.log('H. later reviews follow 7, 14 and 30 days');
  // day 4: the 11 once-missed items and the one missed in review
  await page.clock.setFixedTime(dayDate(4));await page.reload();await page.goto(FILE+'#u1-practice');
  eq(await page.locator('#p-groups button[data-g="R"] small').textContent(),'12 due','12 due on day 4');
  await page.click('#p-groups button[data-g="R"]');
  for(let i=0;i<12;i++)await answer(page,true);
  S=await state(page);
  ok(missedIds.every(id=>S.items[id].box===2&&S.items[id].due===d0+4+7),'second right review: 7 days');
  eq(S.items[missedInReview].due,d0+4+3,'item missed in review: back on the 3 day step');
  await page.clock.setFixedTime(dayDate(10));await page.reload();await page.goto(FILE+'#u1-practice');
  await page.click('#p-groups button[data-g="R"]');
  let c10=0;while(c10<80){const I=await info(page);if(!I){const more=page.locator('#p-reviewmore');if(await more.count()){await more.click();continue;}break;}await answer(page,true);c10++;}
  eq(c10,39,'day 10: the 38 items on the 7 day step and the one on the 3 day step');
  S=await state(page);
  ok(others.every(id=>S.items[id].box===3&&S.items[id].due===d0+10+14),'third right review: 14 days');
  await page.clock.setFixedTime(dayDate(24));await page.reload();await page.goto(FILE+'#u1-practice');
  await page.click('#p-groups button[data-g="R"]');
  let c24=0;while(c24<80){const I=await info(page);if(!I){const more=page.locator('#p-reviewmore');if(await more.count()){await more.click();continue;}break;}await answer(page,true);c24++;}
  S=await state(page);
  ok(others.every(id=>S.items[id].box===4&&S.items[id].due===d0+24+30),'fourth right review: 30 days');
  await page.clock.setFixedTime(dayDate(54));await page.reload();await page.goto(FILE+'#u1-practice');
  await page.click('#p-groups button[data-g="R"]');
  let c54=0;while(c54<80){const I=await info(page);if(!I){const more=page.locator('#p-reviewmore');if(await more.count()){await more.click();continue;}break;}await answer(page,true);c54++;}
  S=await state(page);
  ok(others.every(id=>S.items[id].box===4&&S.items[id].due===d0+54+30),'after that the interval stays at 30 days');

  console.log('I. discuss');
  await page.click('#unit-tabs a[data-go="u1-discuss"]');
  eq(await page.locator('#d-nav button').count(),12,'twelve questions');
  const KEYS=await page.evaluate(()=>DISCUSS.map(q=>q.options.findIndex(o=>o.ok)));
  eq(KEYS.map(i=>'ABCD'[i]).join(''),'CBDACDDBAACB','answer key is spread over the four letters');
  for(let j=0;j<12;j++){
    await page.click('#d-nav button[data-q="'+j+'"]');
    const meta=await page.evaluate(j=>{const q=DISCUSS[j];return {id:q.id,fig:!!q.scene,reveal:!!q.reveal,circ:(q.circuits||[]).length};},j);
    eq(await page.locator('#d-stage').evaluate(e=>e.classList.contains('nofig')),!meta.fig,meta.id+': figure shown only when the question has one');
    eq(await page.locator('#d-head .circuit').count(),meta.circ,meta.id+': circuits drawn');
    await page.click('#d-lock1');
    ok(await page.locator('#d-err1').isVisible(),meta.id+': an answer is required');
    const wrong=(KEYS[j]+1+j%3)%4===KEYS[j]?(KEYS[j]+1)%4:(KEYS[j]+1+j%3)%4;
    const first=j%4===0?KEYS[j]:wrong,final=j%5===4?wrong:KEYS[j];
    await page.check('#d-o1 input[value="'+first+'"]');await page.click('#d-lock1');
    ok((await page.locator('#d-steps').textContent()).includes('Your first answer: '+'ABCD'[first]+'.'),meta.id+': first answer shown');
    eq(await page.locator('#d-steps .why').count(),0,meta.id+': reasons stay hidden before the final answer');
    await page.check('#d-o2 input[value="'+final+'"]');await page.click('#d-lock2');
    eq(await page.locator('#d-steps .why').count(),4,meta.id+': a reason for each of the four options');
    eq(await page.locator('#d-steps .why.ok').count(),1,meta.id+': one option holds');
    const txt=await page.locator('#d-steps').textContent();
    ok(final===KEYS[j]?txt.includes('Your final answer holds.'):txt.includes('Your final answer does not hold.'),meta.id+': verdict on the final answer');
    eq(txt.includes('You changed your answer from '+'ABCD'[first]+' to '+'ABCD'[final]+'.'),first!==final,meta.id+': change of answer is stated');
    ok(txt.includes('Take it further'),meta.id+': follow-up question shown');
    eq(await page.locator('#d-steps .why .lab').count(),7,meta.id+': three options get two paragraphs, one gets one');
    eq(await page.locator('#d-nav button[data-q="'+j+'"]').getAttribute('class'),final===KEYS[j]?'ok':'no',meta.id+': number in the bar is marked');
    eq(await page.locator('#d-replay').isVisible(),meta.reveal,meta.id+': replay offered only where there is a motion');
    if(meta.reveal){await page.waitForTimeout(2600);await page.click('#d-replay');await page.waitForTimeout(400);}
  }
  S=await state(page);
  eq(Object.keys(S.discuss).length,12,'twelve discussion answers saved');
  eq(S.log.filter(r=>r.type==='discuss-first').length,12,'first answers are logged');
  eq(S.log.filter(r=>r.type==='discuss-final').length,12,'final answers are logged');
  await page.click('#d-nav button[data-q="3"]');
  await page.click('#d-redo');
  ok(await page.locator('#d-lock1').isVisible(),'a question can be answered again');
  await page.locator('#d-steps details.inclass summary').click();
  const poll=await page.locator('#d-poll').inputValue();
  ok(poll.split('\n').length===5&&/^A\. /.test(poll.split('\n')[1]),'poll text has the stem and four lettered options');
  await page.click('#d-copy');await page.waitForTimeout(200);
  ok(/Copied|Selected/.test(await page.locator('#d-copy').textContent()),'copy button responds ['+await page.locator('#d-copy').textContent()+']');
  await page.click('.top a[data-go="u1"]');
  ok(await page.locator('#view-discuss').isVisible(),'the unit link returns to the part last used');
  await page.click('#unit-tabs a[data-go="u1-goals"]');
  const gp=await page.locator('#g-list').textContent();
  ok(gp.includes('Discuss: 1 of 1 answered')&&gp.includes('Discuss: 3 of 3 answered'),'goals page counts discussion answers');
  ok(gp.includes('Practice: 7 of 7 right'),'goals page counts practice');

  console.log('J. explore and code');
  await page.click('#unit-tabs a[data-go="u1-code"]');
  ok((await page.locator('#c-cnote').textContent()).includes('example'),'code page uses the example while Explore is empty');
  let code=await page.locator('#c-code').textContent();
  ok(code.includes('qc.h(0)\nqc.s(0)')&&code.includes('RUN_ON = "simulator"')&&code.includes('SHOTS = 1000'),'example script');
  eq(await page.locator('#c-code .ln.chg').count(),1,'one line marked as the line to change');
  eq(await page.locator('#c-code .ln.act').count(),3,'simulator branch marked');
  await page.check('#c-target-fake_device');
  code=await page.locator('#c-code').textContent();
  ok(code.includes('RUN_ON = "fake_device"'),'target changes the one line');
  ok((await page.locator('#c-code .ln.act').allTextContents()).join('').includes('FakeManilaV2()'),'fake device branch marked');
  ok((await page.locator('#c-howto').textContent()).includes('pip install qiskit qiskit-aer qiskit-ibm-runtime'),'install line for the imitated device');
  await page.check('#c-target-device');
  code=await page.locator('#c-code').textContent();
  ok(code.includes('RUN_ON = "device"'),'device target');
  const act=(await page.locator('#c-code .ln.act').allTextContents()).join('');
  ok(act.includes('QiskitRuntimeService()')&&!act.includes('FakeManilaV2()'),'device branch marked, fake branch not');
  const how=await page.locator('#c-howto').textContent();
  ok(how.includes('save_account(token=')&&how.includes('10 minutes')&&how.includes('API key'),'device instructions');
  await page.check('#c-axis-x');
  ok((await page.locator('#c-code').textContent()).includes('measured along x')&&(await page.locator('#c-circuit').textContent()).includes('Measure X'),'axis change reaches code and drawing');
  await page.fill('#c-shots','0');ok(await page.locator('#c-serr').isVisible(),'shots must be at least 1');
  await page.fill('#c-shots','2500');ok(!(await page.locator('#c-serr').isVisible())&&(await page.locator('#c-code').textContent()).includes('SHOTS = 2500'),'shots reach the code');
  await page.click('#c-copy');await page.waitForTimeout(200);
  ok(/Copied|Selected/.test(await page.locator('#c-copy').textContent()),'copy code responds');
  await page.locator('#c-expectbox summary').click();
  ok((await page.locator('#c-expect').textContent()).includes('Without noise: P(+) = 0.5'),'expected values listed');
  // build a circuit in Explore
  await page.click('#view-code a[data-go="u1-explore"]');
  await page.click('#e-starts button:nth-child(3)');             // |+>
  const press=async sel=>{await page.click(sel);await page.waitForFunction(()=>true);await page.waitForTimeout(1500);};
  await press('#e-gates button:nth-child(5)');                   // S
  await page.selectOption('#e-axis','x');await page.fill('#e-angle','-90');await press('#e-rotate');
  ok((await page.locator('#e-circuit').textContent()).includes('Rx(−90°)'),'rotation in the step list');
  let vals=await page.locator('#e-vals').textContent();
  ok(vals.includes('⟨Z⟩ = −1.00'),'|+>, S, Rx(-90) ends at |1> ['+vals+']');
  await page.click('#e-measure');
  ok((await page.locator('#e-mout').textContent()).includes('200 shots along z: 0 gave 0, 200 gave 1'),'measurement of |1> along z');
  await page.reload();await page.goto(FILE+'#u1-explore');
  ok((await page.locator('#e-circuit').textContent()).includes('Rx(−90°)'),'the circuit survives a reload');
  await page.click('#view-explore a[data-go="u1-code"]');
  code=await page.locator('#c-code').textContent();
  ok(code.includes('# prepare |+>\nqc.h(0)\n# the gates\nqc.s(0)\nqc.rx(-90 * pi / 180, 0)')&&code.includes('from math import pi'),'explore circuit as code');
  ok((await page.locator('#c-cnote').textContent()).includes('circuit from Explore'),'note names Explore as the source');
  await page.click('#view-code a[data-go="u1-explore"]');
  await press('#e-relax');await press('#e-depol');
  await page.click('#view-explore a[data-go="u1-code"]');
  code=await page.locator('#c-code').textContent();
  ok(code.includes('thermal_relaxation_error(1.0, 1, 0.5)')&&code.includes('depolarizing_error(0.2, 1)')&&code.includes('AerSimulator'),'noise steps as Aer instructions');
  ok(await page.locator('#c-target-device').isDisabled()&&await page.locator('#c-target-simulator').isChecked(),'device targets are closed for a noisy circuit');
  ok(await page.locator('#c-tnote').isVisible(),'the reason is given');
  eq(await page.locator('#c-code .ln.chg').count(),0,'no line to change in the noisy script');
  await page.locator('details:has(#c-qasm) summary').click();
  ok((await page.locator('#c-qasm').textContent()).startsWith('OPENQASM 3.0;')&&(await page.locator('#c-qnote').textContent()).includes('2 noise steps are left out'),'OpenQASM text with a note on noise');
  await page.click('#view-code a[data-go="u1-explore"]');
  await page.click('#e-undo');await page.click('#e-undo');
  ok(!(await page.locator('#e-circuit').textContent()).includes('depol'),'undo removes steps');
  await page.click('#e-clear');
  ok((await page.locator('#e-vals').textContent()).includes('⟨X⟩ = 1.00'),'clear keeps the start state');
  await page.fill('#e-angle','0');await page.click('#e-rotate');ok(await page.locator('#e-err').isVisible(),'angle zero refused');
  await page.fill('#e-t','0');await page.click('#e-relax');ok(await page.locator('#e-nerr').isVisible(),'t = 0 refused');
  await overflow(page,'explore');

  console.log('K. about page, data, routes');
  await page.click('.top a[data-go="about"]');
  eq(await page.locator('#v-checks li').count(),21,'21 self-checks listed');
  eq(await page.locator('#v-checks li.bad').count(),0,'all self-checks pass');
  eq(await page.locator('#v-discuss tbody tr').count(),12,'discussion table');
  ok(await page.locator('#v-tags tbody tr').count()>=40,'tag table');
  const csv=await page.locator('#v-log').inputValue();
  S=await state(page);
  eq(csv.split('\n')[0],'t,item,concept,level,type,answer,tag,retry,review,explanation','csv header');
  ok(csv.includes('discuss-final')&&csv.includes(',rotate,'),'csv holds practice and discussion rows');
  await page.goBack();
  ok(await page.locator('#view-explore').isVisible(),'back button returns to the previous page');
  await page.goForward();
  ok(await page.locator('#view-about').isVisible(),'forward works');
  ok((await page.locator('#v-gen').textContent()).includes('252 single-gate'),'item counts on the About page');
  await page.goto(FILE+'#evidence');await page.reload();ok(await page.locator('#view-about').isVisible(),'the old Evidence link lands on About');
  await page.goto(FILE+'#u1-code');ok(await page.locator('#view-code').isVisible(),'deep link to a part');
  await page.goto(FILE+'#practice');await page.reload();ok(await page.locator('#view-practice').isVisible(),'old link from version 0.2 still lands on practice');
  await page.goto(FILE+'#nonsense');await page.reload();ok(await page.locator('#view-home').isVisible(),'unknown link lands on home');
  ok((await page.locator('#h-status').textContent()).includes('50 of 50 practice items answered'),'home shows progress ['+await page.locator('#h-status').textContent()+']');
  await page.click('.top a[data-go="u1"]');await page.click('#unit-tabs a[data-go="u1-practice"]');
  await page.click('#p-restart');
  ok((await page.locator('#p-restart').textContent()).includes('Click again'),'start over asks twice');
  await page.click('#p-restart');
  S=await state(page);
  ok(Object.keys(S.items).length===0&&S.groups.S.pos===0&&S.log.length>100&&Object.keys(S.discuss).length===11,'start over resets practice and keeps the response log and discussion');
  await page.click('.top a[data-go="about"]');
  await page.click('#v-clear');await page.click('#v-clear');
  ok((await page.locator('#v-log').inputValue())==='No responses yet.','clear my data empties the log');
  eq(await state(page),null,'clear my data removes the saved state');
  await page.click('.top a[data-go="home"]');
  eq(await page.locator('#h-cta a').first().textContent(),'Start here','home is back to the first-visit state');

  console.log('L. progress from version 0.2 is carried over');
  await page.evaluate(()=>{
    const q=ids=>ids.map(id=>({id}));
    const ids=k=>GROUPS[k].starter.map(i=>i.id);
    const old={v:2,group:'G',seed:20261006,results:{},tags:{'wrong-sense':2},log:[
      {t:new Date(Date.now()-2*86400000).toISOString(),item:'s01',concept:'S1',level:1,type:'locate',answer:'x',tag:'correct',retry:0,explanation:'e'},
      {t:new Date(Date.now()-2*86400000).toISOString(),item:'s02',concept:'S1',level:1,type:'locate',answer:'x',tag:'swap-01',retry:0,explanation:'e'},
      {t:new Date(Date.now()-2*86400000).toISOString(),item:'g7',concept:'G1',level:3,type:'rotate',answer:'x',tag:'correct',retry:0,explanation:'e'}],
      groups:{S:{mode:'starter',queue:q(ids('S')).concat([{id:'s02',retry:true}]),pos:2,freeN:0},G:{mode:'starter',queue:q(ids('G')),pos:0,freeN:0},M:{mode:'starter',queue:q(ids('M')),pos:0,freeN:0},N:{mode:'starter',queue:q(ids('N')),pos:0,freeN:0}}};
    localStorage.removeItem('qip101-v3');
    localStorage.setItem('bloch-v2',JSON.stringify(old));
  });
  await page.reload();await page.goto(FILE+'#u1-practice');
  eq(await page.locator('#p-groups [aria-current]').getAttribute('data-g'),'G','old topic kept');
  eq(await page.locator('#p-strip .c .pip.ok').count(),1,'old right answer carried over');
  eq(await page.locator('#p-strip .c .pip.miss').count(),1,'old miss carried over');
  eq(await page.locator('#p-groups button[data-g="R"] small').textContent(),'1 due','old miss is due for review');
  await page.click('#p-groups button[data-g="S"]');
  eq((await info(page)).id,'s03','old position in the queue kept');
  await answer(page,true);
  S=await state(page);
  ok(S.v===3&&S.log.length===4&&S.items.s03.n===1,'state is saved in the new format');

  console.log('M. phone width');
  const ph=await browser.newContext({viewport:{width:390,height:800},hasTouch:true,isMobile:true,deviceScaleFactor:2});
  const p2=await ph.newPage();
  p2.on('console',m=>{if(m.type()==='error')errs.push('phone: '+m.text());});
  p2.on('pageerror',e=>errs.push('phone PAGEERROR '+e.message));
  for(const r of ['home','u1-goals','u1-start','u1-practice','u1-discuss','u1-explore','u1-code','research','about']){
    await p2.goto(FILE+'#'+r);await p2.reload();await p2.waitForTimeout(150);await overflow(p2,'phone '+r);
  }
  await p2.goto(FILE+'#u1-practice');await p2.reload();
  // tap the label |+> on the sphere to answer the first item (place (|0>+|1>)/sqrt2)
  const box=await p2.locator('#p-sphere svg').boundingBox();
  const pt=await p2.evaluate(()=>{const svg=document.querySelector('#p-sphere svg');const t=[...svg.querySelectorAll('text.s-label')].find(e=>e.textContent.startsWith('|+⟩'));const r=t.getBoundingClientRect();return {x:r.left+6,y:r.top+r.height/2};});
  await p2.touchscreen.tap(pt.x,pt.y);
  ok((await p2.locator('#p-read').textContent()).includes('|+⟩'),'a tap on a label places that state ['+await p2.locator('#p-read').textContent()+']');
  await p2.tap('#p-lock');
  await p2.waitForSelector('#st3:not([hidden])',{timeout:15000});
  ok(await p2.locator('#p-obs .fb.ok').count()===1,'phone: answer by tap is correct');
  await overflow(p2,'phone practice after answering');
  await p2.goto(FILE+'#u1-code');await p2.reload();await overflow(p2,'phone code');
  ok(await p2.evaluate(()=>{const p=document.getElementById('c-code');return p.scrollWidth>p.clientWidth;}),'phone: wide code scrolls inside its own box');
  await ph.close();

  console.log(errs.length?'console errors: '+JSON.stringify(errs,null,1):'no console errors');
  fails+=errs.length;
  console.log(passes+' checks passed, '+fails+' failed');
  await browser.close();
  process.exit(fails?1:0);
})().catch(e=>{console.log('TEST CRASHED',e);process.exit(2);});
