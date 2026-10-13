// Accessibility rules on every page, then runs with storage blocked, reduced motion and the keyboard only.
const {chromium}=require('playwright');
const path=require('path'),fs=require('fs');
const FILE='file://'+path.join(__dirname,'..','docs','index.html');
const AXE=fs.readFileSync(require.resolve('axe-core/axe.min.js'),'utf8');
const ROUTES=['home','u1-goals','u1-start','u1-practice','u1-discuss','u1-explore','u1-code','research','about'];
let bad=0;
async function axe(page,label){
  await page.evaluate(AXE);
  const r=await page.evaluate(async()=>{const res=await axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21a','wcag21aa','best-practice']}});
    return res.violations.map(v=>({id:v.id,impact:v.impact,help:v.help,n:v.nodes.length,ex:v.nodes.slice(0,3).map(n=>n.html.slice(0,140)+' :: '+(n.any[0]?n.any[0].message:'').slice(0,160))}));});
  if(r.length){bad+=r.length;console.log(label,JSON.stringify(r,null,1));}
}
(async()=>{
  const browser=await chromium.launch();
  for(const scheme of ['light','dark']){
    const ctx=await browser.newContext({viewport:{width:1280,height:900},colorScheme:scheme});
    const page=await ctx.newPage();
    for(const r of ROUTES){await page.goto(FILE+'#'+r);await page.reload();await page.waitForTimeout(200);await axe(page,scheme+' '+r);}
    // states with more content on screen
    await page.goto(FILE+'#u1-practice');await page.reload();
    await page.locator('#p-numbers summary').click();await page.fill('#p-n1','45');await page.fill('#p-n2','0');await page.click('#p-placeangles');
    await page.click('#p-lock');await page.waitForSelector('#st3:not([hidden])');await page.fill('#p-exp','x');await page.click('#p-compare');
    await axe(page,scheme+' practice answered');
    await page.goto(FILE+'#u1-discuss');
    await page.check('#d-o1 input[value="1"]');await page.click('#d-lock1');await page.check('#d-o2 input[value="2"]');await page.click('#d-lock2');
    await axe(page,scheme+' discuss answered');
    await page.goto(FILE+'#u1-code');
    await page.check('#c-mode-expect');
    await page.evaluate(()=>document.querySelectorAll('#view-code details').forEach(d=>{d.open=true;}));
    await axe(page,scheme+' code, expectation values');
    await page.check('#c-mode-counts');
    // an operator item without a figure (o11), before and after answering
    await page.goto(FILE+'#u1-practice');
    await page.click('#p-groups button[data-g="O"]');
    await page.evaluate(()=>{const s=JSON.parse(localStorage.getItem('qip101-v3'));s.group='O';s.groups.O.pos=10;localStorage.setItem('qip101-v3',JSON.stringify(s));});
    await page.reload();
    if(await page.locator('#p-head').getAttribute('data-item')!=='o11'){bad++;console.log(scheme+': o11 not on screen');}
    await axe(page,scheme+' operator item without a figure');
    await page.check('#p-opts input[value="0"]');await page.click('#p-lock');await page.waitForSelector('#st3:not([hidden])');
    await page.fill('#p-exp','x');await page.click('#p-compare');
    await axe(page,scheme+' operator item answered');
    // a number item with a negative range (o05)
    await page.evaluate(()=>{const s=JSON.parse(localStorage.getItem('qip101-v3'));s.groups.O.pos=4;localStorage.setItem('qip101-v3',JSON.stringify(s));});
    await page.reload();
    await page.fill('#p-num','-0.5');await page.click('#p-lock');await page.waitForSelector('#st3:not([hidden])');
    await axe(page,scheme+' operator number item answered');
    await ctx.close();
  }
  console.log(bad?'axe violations: '+bad:'axe: no violations on any page, light or dark');

  // storage that throws on every call
  let ctx=await browser.newContext({viewport:{width:1280,height:900}});
  await ctx.addInitScript(()=>{const boom=()=>{throw new Error('storage blocked');};Storage.prototype.getItem=boom;Storage.prototype.setItem=boom;Storage.prototype.removeItem=boom;});
  let page=await ctx.newPage();const errs=[];
  page.on('pageerror',e=>errs.push(e.message));page.on('console',m=>{if(m.type()==='error')errs.push(m.text());});
  await page.goto(FILE);
  await page.click('#h-cta a[data-go="u1-start"]');await page.click('#view-start a[data-go="u1-practice"]');
  await page.locator('#p-numbers summary').click();await page.fill('#p-n1','90');await page.fill('#p-n2','0');await page.click('#p-placeangles');
  await page.click('#p-lock');await page.waitForSelector('#st3:not([hidden])');
  const okFb=await page.locator('#p-obs .fb.ok').count();
  await page.fill('#p-exp','x');await page.click('#p-compare');await page.click('#p-next');
  const second=await page.locator('#p-head').getAttribute('data-item');
  await page.click('#unit-tabs a[data-go="u1-code"]');await page.click('.top a[data-go="about"]');await page.click('#v-clear');await page.click('#v-clear');
  console.log('storage blocked: first answer correct =',okFb===1,'| moved on to',second,'| errors:',errs.length?errs:'none');
  if(okFb!==1||second!=='s02'||errs.length)bad++;
  await ctx.close();

  // reduced motion: nothing should wait on an animation
  ctx=await browser.newContext({viewport:{width:1280,height:900},reducedMotion:'reduce'});
  page=await ctx.newPage();
  await page.goto(FILE+'#u1-practice');
  await page.click('#p-groups button[data-g="G"]');
  await page.locator('#p-numbers summary').click();await page.fill('#p-n1','180');await page.fill('#p-n2','0');await page.click('#p-placeangles');
  const t0=Date.now();await page.click('#p-lock');await page.waitForSelector('#st3:not([hidden])');const dt=Date.now()-t0;
  console.log('reduced motion: result shown after',dt,'ms');
  if(dt>400)bad++;
  await ctx.close();

  // keyboard only: reach practice from home and answer the first measurement item
  ctx=await browser.newContext({viewport:{width:1280,height:900}});
  page=await ctx.newPage();
  await page.goto(FILE+'#u1-practice');
  await page.focus('#p-groups button[data-g="M"]');await page.keyboard.press('Enter');
  await page.focus('#p-num');await page.keyboard.type('0.75');
  await page.keyboard.press('Tab');
  const focused=await page.evaluate(()=>document.activeElement.id);
  await page.keyboard.press('Enter');
  await page.waitForSelector('#st3:not([hidden])');
  const kOk=await page.locator('#p-obs .fb.ok').count();
  const ring=await page.evaluate(()=>{const b=document.querySelector('#p-exp');b.focus();const s=getComputedStyle(b);return s.outlineStyle+' '+s.outlineWidth;});
  console.log('keyboard: Tab from the number field lands on',focused,'| Enter locks in, correct =',kOk===1,'| focus ring on the text box:',ring);
  if(focused!=='p-lock'||kOk!==1)bad++;
  await ctx.close();
  await browser.close();
  console.log(bad?'PROBLEMS: '+bad:'all robustness checks passed');
  process.exit(bad?1:0);
})().catch(e=>{console.log('CRASH',e);process.exit(2);});
