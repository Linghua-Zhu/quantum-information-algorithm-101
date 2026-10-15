// Loads every page, reports console errors and horizontal overflow, saves screenshots.
const {chromium}=require('playwright');
const path=require('path');
const FILE='file://'+path.join(__dirname,'..','docs','index.html');
const OUT=path.join(__dirname,'shots');
const ROUTES=['home','units','u0-goals','u0-start','u0-practice','u0-discuss','u0-explore','u0-code','u1-goals','u1-start','u1-practice','u1-discuss','u1-explore','u1-code','research','about'];
(async()=>{
  const browser=await chromium.launch();
  let bad=0;
  for(const cfg of [{name:'desk',w:1280,h:900,scheme:'light'},{name:'phone',w:400,h:800,scheme:'light'},{name:'deskdark',w:1280,h:900,scheme:'dark'}]){
    const ctx=await browser.newContext({viewport:{width:cfg.w,height:cfg.h},colorScheme:cfg.scheme,deviceScaleFactor:1});
    const page=await ctx.newPage();
    const errs=[];
    page.on('console',m=>{if(m.type()==='error')errs.push(m.text());});
    page.on('pageerror',e=>errs.push('PAGEERROR '+e.message));
    for(const r of ROUTES){
      await page.goto(FILE+'#'+r);
      await page.waitForTimeout(250);
      const o=await page.evaluate(()=>({sw:document.documentElement.scrollWidth,cw:document.documentElement.clientWidth,route:location.hash}));
      if(o.sw>o.cw+1){bad++;console.log(cfg.name,r,'HORIZONTAL OVERFLOW',o.sw,'>',o.cw);}
      await page.screenshot({path:path.join(OUT,cfg.name+'-'+r+'.png'),fullPage:true});
    }
    if(errs.length){bad+=errs.length;console.log(cfg.name,'errors:',errs);}
    await ctx.close();
  }
  await browser.close();
  console.log(bad?'PROBLEMS: '+bad:'smoke ok');
  process.exit(bad?1:0);
})();
