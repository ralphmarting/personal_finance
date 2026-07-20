
/* Portfolio Dashboard app.js — Beta6 */
var KEY='portfolioDataV4';
var S={};
var charts={};
var LEGEND_PALETTE=['#0e7d8b','#17c3b2','#0b5a92','#7b2ff7','#f107a3','#f6b93b','#17a673','#e08a1e','#6ec1ff','#ff8fc4','#7fe0a1','#c9a6ff'];
var SEMI={SMH:100,SPMO:45,SOXX:100,'SPY-UITF':10,'MANULIFE-ASIA':15};
var CATEGORIES_BY_TYPE={Capital:'💰',Growth:'📈',Income:'💵',Freedom:'🕊️',Resilience:'🛡️',Family:'👨‍👩‍👧‍👦'};
var REBALANCE_MODE='current';

/* ===== helpers ===== */
function el(id){return document.getElementById(id);} 
function setTxt(id,t){var node=el(id);if(node)node.textContent=t;}
function setHTML(id,t){var node=el(id);if(node)node.innerHTML=t;}
function todayISO(){return new Date().toISOString().slice(0,10);} 
function today(){return new Date();}
function daysBetween(ds,t){if(!ds)return 0;return Math.floor((t-new Date(ds))/86400000);} 
function num(v,fallback){var n=Number(v);return isFinite(n)?n:(fallback||0);} 
function peso(n){n=num(n,0);return '₱'+n.toLocaleString('en-PH',{maximumFractionDigits:0});}
function usd(n){n=num(n,0);return '$'+n.toLocaleString('en-US',{maximumFractionDigits:2});}
function pct(n,d){d=(d==null?1:d);return num(n,0).toFixed(d)+'%';}
function clamp(n,min,max){return Math.max(min,Math.min(max,n));}
function save(){localStorage.setItem(KEY,JSON.stringify(S));}
function toast(msg){var d=document.createElement('div');d.className='toast';d.textContent=msg;document.body.appendChild(d);setTimeout(function(){d.remove();},4000);} 
function makeChart(id,cfg){var node=el(id);if(!node||typeof Chart==='undefined')return null;if(charts[id]){try{charts[id].destroy();}catch(_){}} try{charts[id]=new Chart(node,cfg);return charts[id];}catch(err){console.error('chart '+id,err);return null;}}

/* ===== defaults and compatibility ===== */
function seedMilestones(){
  function m(cat,type,th,label,mot,manual){return{id:cat+'_'+type+'_'+th+'_'+label.slice(0,4),cat:cat,type:type,threshold:th,label:label,motivator:mot,manual:!!manual,achieved:false};}
  return[
    m('Capital','capital',100000,'First ₱100k invested','Six figures invested — momentum is visible.'),
    m('Capital','capital',250000,'₱250k invested','Quarter million invested. Keep building.'),
    m('Capital','capital',500000,'₱500k invested','Half a million deployed toward long-term goals.'),
    m('Capital','capital',1000000,'First ₱1M invested','A major capital milestone reached.'),
    m('Capital','capital',2000000,'₱2M invested','Capital base continues to strengthen.'),
    m('Capital','capital',3000000,'₱3M invested','The portfolio is now carrying real weight.'),
    m('Capital','capital',5000000,'₱5M invested','A significant scale milestone achieved.'),
    m('Freedom','coast',0,'Coast FIRE reached','The current portfolio can grow into the long-term target without new contributions.'),
    m('Freedom','incomeCover',0.25,'Income covers 25% of spending','A portion of everyday spending is now supported by portfolio income.'),
    m('Freedom','incomeCover',0.5,'Income covers 50% of spending','A major milestone — the portfolio now supports a meaningful share of spending.'),
    m('Freedom','incomeCover',1,'Income covers 100% of spending','Portfolio income now covers total spending.'),
    m('Growth','gain',50000,'First ₱50k gain','The portfolio has started to compound in your favor.'),
    m('Growth','gain',100000,'₱100k unrealized gain','Paper gains reached six figures.'),
    m('Growth','gain',500000,'₱500k gain','Long-horizon growth is showing up clearly.'),
    m('Growth','gain',1000000,'₱1M gain','A seven-figure gain milestone reached.'),
    m('Growth','double',2,'Doubled your money','Portfolio value has doubled relative to contributions.'),
    m('Income','income',1000,'First ₱1k/mo income','The portfolio now generates a small monthly cash flow.'),
    m('Income','income',5000,'₱5k/mo income','Income has become a visible stream.'),
    m('Income','income',10000,'₱10k/mo income','A growing portion of expenses can now be covered.'),
    m('Income','income',20000,'₱20k/mo income','Income momentum continues to build.'),
    m('Income','income',30000,'₱30k/mo income','Monthly income reached a strong planning milestone.'),
    m('Income','income',50000,'₱50k/mo income','Monthly cash flow has reached a significant level.'),
    m('Resilience','manual',0,'Stayed invested during volatility','Long-term behavior held through market swings.',true),
    m('Resilience','manual',0,'Added during a drawdown','Used volatility to improve future return potential.',true),
    m('Resilience','manual',0,'12 months of consistent contributions','Consistency remained intact for a full year.',true),
    m('Resilience','manual',0,'Five-year review completed','Long-term process reviewed and refreshed.',true),
    m('Family','manual',0,'Education goal initialized','A family-focused savings goal is now active.',true),
    m('Family','manual',0,'Stability bucket reviewed','Capital preservation plans were refreshed.',true),
    m('Family','manual',0,'Family plan updated','Core household goals were revisited.',true)
  ];
}
function seed(){
  S={
    profile:{
      currentAge:25,
      retireAge:55,
      annualSpending:780000,
      monthlyContribution:31500,
      contribStepUp:0.05,
      incomeCoverageTargetPct:50,
      defaultNetYield:0.07,
      domesticDivTax:0.10,
      fxRate:61.5,
      fxLu:'2026-07-01',
      withdrawalMultiplier:30,
      realReturnMode:'auto',
      realReturnManual:0.06,
      bucketReturns:{Growth:0.07,Income:0.045,Stability:0.025},
      defaultDistribution:{Growth:70,Income:20,Stability:10}
    },
    positions:[
      P('MBT','Metrobank','Income','PHP',500,78,4.0,null,false,30000),
      P('AREIT','AREIT Inc','Income','PHP',2000,40,2.2,null,false,68000),
      P('SPY-UITF','BPI US Feeder (SPY UITF)','Growth','PHP',1000,135,0,null,false,120000),
      P('SOXX','Semiconductors ETF','Growth','USD',20,300,0,null,false,292500),
      P('MP2','MP2 Pag-IBIG','Stability','PHP',200000,1,0.065,0,false,200000),
      P('VUL','Insurance Fund','Insurance','PHP',1,110000,0,null,true,100000)
    ],
    snapshots:[
      {date:'2026-01-31',invested:400000,marketValue:410000},
      {date:'2026-03-31',invested:440000,marketValue:465000},
      {date:'2026-05-31',invested:480000,marketValue:505000},
      {date:'2026-06-30',invested:500000,marketValue:512000}
    ],
    cadence:{currentPrice:7,annualDividendPerUnit:100,fxRate:7},
    milestones:seedMilestones(),
    achievedIds:[],
    ui:{tab:'dashboard',tool:'dividend',excludeIlliquidCharts:true}
  };
}
function P(t,n,b,c,u,pr,dv,tx,il,inv){return{ticker:t,name:n,bucket:b,currency:c,units:u,currentPrice:pr,div:dv,divTaxOverride:tx,isIlliquid:il,invested:inv,lu:{currentPrice:'2026-07-01',div:'2026-04-15'}};}
function ensureDefaults(){
  var p=S.profile||{};
  p.currentAge=num(p.currentAge,25);
  p.retireAge=num(p.retireAge,55);
  p.annualSpending=num(p.annualSpending,780000);
  p.monthlyContribution=num(p.monthlyContribution,31500);
  p.contribStepUp=num(p.contribStepUp,0.05);
  p.incomeCoverageTargetPct=num(p.incomeCoverageTargetPct,p.targetMonthlyIncome?((num(p.targetMonthlyIncome)*12)/(num(p.annualSpending,780000)||1)*100):50);
  p.defaultNetYield=num(p.defaultNetYield,0.07);
  p.domesticDivTax=num(p.domesticDivTax,0.10);
  p.fxRate=num(p.fxRate,61.5);
  p.fxLu=p.fxLu||todayISO();
  p.withdrawalMultiplier=num(p.withdrawalMultiplier,30);
  p.realReturnMode=p.realReturnMode||'auto';
  p.realReturnManual=num(p.realReturnManual,0.06);
  p.bucketReturns=p.bucketReturns||{Growth:0.07,Income:0.045,Stability:0.025};
  p.bucketReturns={Growth:num(p.bucketReturns.Growth,0.07),Income:num(p.bucketReturns.Income,0.045),Stability:num(p.bucketReturns.Stability,0.025)};
  p.defaultDistribution=p.defaultDistribution||{Growth:70,Income:20,Stability:10};
  p.defaultDistribution={Growth:num(p.defaultDistribution.Growth,70),Income:num(p.defaultDistribution.Income,20),Stability:num(p.defaultDistribution.Stability,10)};
  delete p.includeMP2Income;
  S.profile=p;
  S.positions=Array.isArray(S.positions)?S.positions:[];
  S.positions.forEach(function(pos){if(!pos.lu)pos.lu={currentPrice:todayISO(),div:todayISO()};pos.invested=num(pos.invested,0);pos.isIlliquid=!!pos.isIlliquid;});
  S.snapshots=Array.isArray(S.snapshots)?S.snapshots:[];
  S.cadence=S.cadence||{currentPrice:7,annualDividendPerUnit:100,fxRate:7};
  S.achievedIds=Array.isArray(S.achievedIds)?S.achievedIds:[];
  S.milestones=Array.isArray(S.milestones)&&S.milestones.length?S.milestones:seedMilestones();
  S.ui=S.ui||{};
  S.ui.tab=S.ui.tab||'dashboard';
  if(['alloc','target'].indexOf(S.ui.tool)>=0)S.ui.tool='dividend';
  S.ui.tool=S.ui.tool||'dividend';
  S.ui.excludeIlliquidCharts=(S.ui.excludeIlliquidCharts!==false);
}
function load(){
  try{var raw=localStorage.getItem(KEY);S=raw?JSON.parse(raw):null;}catch(_){S=null;}
  if(!S||!S.profile||!S.positions){seed();save();return;}
  ensureDefaults();save();
}

/* ===== portfolio and income logic ===== */
function fx(){return num(S.profile.fxRate,1);} 
function isMP2(p){return p&&p.ticker==='MP2';}
function isInsurance(p){return p&&p.bucket==='Insurance';}
function nonInsurancePositions(){return S.positions.filter(function(p){return !isInsurance(p);});}
function allocationPositions(){
  return S.positions.filter(function(p){
    const isHiddenIlliquid = S.ui.excludeIlliquidCharts && p.isIlliquid;
    return !isHiddenIlliquid;
  });

}
function valuePHP(p){return num(p.units)*num(p.currentPrice)*(p.currency==='USD'?fx():1);} 
function effTax(p){return p.divTaxOverride!=null&&p.divTaxOverride!==''?num(p.divTaxOverride):num(S.profile.domesticDivTax,0.10);} 
function incomePHP(p){return num(p.units)*num(p.div)*(1-effTax(p))*(p.currency==='USD'?fx():1);} 
function spendablePayers(){return S.positions.filter(function(p){return num(p.div)>0 && !isMP2(p);});}
function totals(){
  var ti=0,cv=0,ai=0;
  S.positions.forEach(function(p){ti+=num(p.invested);cv+=valuePHP(p);if(!isMP2(p))ai+=incomePHP(p);});
  var gain=cv-ti;
  return {
    ti:ti,
    cv:cv,
    gain:gain,
    gainPct:ti?gain/ti*100:0,
    ai:ai,
    am:ai/12,
    yoc:ti?ai/ti*100:0,
    yieldNow:cv?ai/cv*100:0
  };
}
function currentIncomeTargetAnnual(){return num(S.profile.annualSpending)*num(S.profile.incomeCoverageTargetPct,50)/100;}
function currentIncomeTargetMonthly(){return currentIncomeTargetAnnual()/12;}
function incomeCoverageTargetPct(){var target=currentIncomeTargetAnnual();return target?totals().ai/target*100:0;}
function incomeCoverageSpendingPct(){var spend=num(S.profile.annualSpending);return spend?totals().ai/spend*100:0;}
function annualIncomeGap(targetAnnual){var gap=num(targetAnnual)-totals().ai;return gap>0?gap:0;}
function realReturn(){
  if(S.profile.realReturnMode==='manual')return num(S.profile.realReturnManual,0.06);
  var totalsByBucket={Growth:0,Income:0,Stability:0},den=0;
  nonInsurancePositions().forEach(function(p){if(totalsByBucket[p.bucket]!=null){totalsByBucket[p.bucket]+=valuePHP(p);den+=valuePHP(p);}});
  if(!den)return 0.06;
  var br=S.profile.bucketReturns;
  return (totalsByBucket.Growth*br.Growth+totalsByBucket.Income*br.Income+totalsByBucket.Stability*br.Stability)/den;
}
function coast(){
  var r=realReturn();
  var FIRE=num(S.profile.annualSpending)*num(S.profile.withdrawalMultiplier,30);
  var yrs=num(S.profile.retireAge)-num(S.profile.currentAge);
  var raw=yrs>0?FIRE/Math.pow(1+r,yrs):FIRE;
  var target=Math.ceil(raw/500000)*500000;
  var cv=totals().cv;
  return {r:r,FIRE:FIRE,target:target,progress:target?cv/target*100:0};
}
function historicalPct(){if(!S.snapshots.length)return 0;var snap=S.snapshots[S.snapshots.length-1];return num(snap.invested)?(num(snap.marketValue)-num(snap.invested))/num(snap.invested)*100:0;}
function semiExposure(filteredPositions){
  var arr=filteredPositions||S.positions;
  var numr=0,den=0;
  arr.forEach(function(p){var v=valuePHP(p);den+=v;numr+=v*((SEMI[p.ticker]||0)/100);});
  return den?numr/den*100:0;
}

/* ===== staleness ===== */
function stale(){
  var out=[];var t=today();
  S.positions.forEach(function(pos){
    var lu=pos.lu||{};
    if(lu.currentPrice){var dp=daysBetween(lu.currentPrice,t);if(dp>S.cadence.currentPrice)out.push({txt:'🔴 '+pos.ticker+' price — '+dp+' days ago · overdue',red:true});else if(dp>=S.cadence.currentPrice*0.8)out.push({txt:'🟡 '+pos.ticker+' price — '+dp+' days · due soon',red:false});}
    if(num(pos.div)>0&&lu.div){var dd=daysBetween(lu.div,t);if(dd>S.cadence.annualDividendPerUnit)out.push({txt:'🔴 '+pos.ticker+' dividend — '+dd+' days ago · overdue',red:true});}
  });
  if(S.profile.fxLu){var df=daysBetween(S.profile.fxLu,t);if(df>S.cadence.fxRate)out.push({txt:'🔴 FX rate — '+df+' days ago · overdue',red:true});}
  out.sort(function(a,b){return Number(b.red)-Number(a.red);});
  return out;
}

/* ===== navigation ===== */
function showTab(name){document.querySelectorAll('.tab').forEach(function(t){t.classList.remove('active');});var sect=el('tab-'+name);if(sect)sect.classList.add('active');document.querySelectorAll('.navbtn').forEach(function(btn){btn.classList.toggle('sel',btn.dataset.tab===name);});S.ui.tab=name;save();renderAll();}
function showTool(name){document.querySelectorAll('.tool').forEach(function(t){t.classList.remove('active');});var sect=el('tool-'+name);if(sect)sect.classList.add('active');document.querySelectorAll('.toolbtn').forEach(function(btn){btn.classList.toggle('sel',btn.dataset.tool===name);});S.ui.tool=name;save();renderTools();}

/* ===== rendering pipeline ===== */
function renderAll(){[renderBell,renderDashboard,renderMilestones,renderTools,renderData].forEach(function(fn){try{fn();}catch(err){console.error(fn.name,err);}});} 
function renderBell(){
  var items=stale(),red=items.filter(function(i){return i.red;}).length;
  var badge=el('bellBadge');if(badge){badge.textContent=red;badge.style.display=red?'flex':'none';}
  var list=el('bellList');if(list)list.innerHTML=items.length?items.map(function(i){return '<li style="color:'+(i.red?'var(--bad)':'var(--warn)')+'">'+i.txt+'</li>';}).join(''):'<li>🟢 Everything current</li>';
}
function renderDashboard(){
  var T=totals(),C=coast();
  var incomeTargetAnnual=currentIncomeTargetAnnual();
  var incomeTargetPct=incomeTargetAnnual?T.ai/incomeTargetAnnual*100:0;
  setTxt('coastPct',pct(C.progress));
  setTxt('coastSub',peso(T.cv)+' / '+peso(C.target));
  setTxt('totalInvested',peso(T.ti));
  setTxt('incomeCoverage',pct(incomeTargetPct));
  setTxt('incomeCoverageSub',peso(T.ai)+' / '+peso(incomeTargetAnnual)+' target');
  setTxt('currentValue',peso(T.cv));
  var gp=el('gainPct');if(gp){gp.textContent=(T.gain>=0?'+':'')+pct(T.gainPct);gp.className='val '+(T.gain>=0?'up':'down');}
  setTxt('netMonthly',peso(T.am));
  setTxt('resMonthly',peso(T.am));
  var coastBar=el('coastHeroBar');if(coastBar)coastBar.style.width=clamp(C.progress,0,100)+'%';
  var incomeBar=el('incomeHeroBar');if(incomeBar)incomeBar.style.width=clamp(incomeTargetPct,0,100)+'%';
  var illiquidToggle=el('illiquidToggle');
  if(illiquidToggle){illiquidToggle.checked=!!S.ui.excludeIlliquidCharts;illiquidToggle.onchange=function(){S.ui.excludeIlliquidCharts=illiquidToggle.checked;save();renderDashboard();};}
  nextUp(T,C);
  var positionsForCharts=allocationPositions();
  var sb=el('semiBadge');if(sb){var se=semiExposure(positionsForCharts);sb.textContent='Semiconductor exposure: '+se.toFixed(1)+'% (cap 30%)';sb.className='badge '+(se<=30?'ok':'warn');}
  drawBucket();drawHolding();drawIncome();drawValue();
}
function nextUp(T,C){
  var cands=[];
  S.milestones.forEach(function(m){
    var cur=null,th=m.threshold,textUnit='';
    if(m.type==='capital'){cur=T.ti;textUnit='capital';}
    else if(m.type==='gain'){cur=T.gain;textUnit='capital';}
    else if(m.type==='income'){cur=T.am;textUnit='income';}
    else if(m.type==='incomeCover'){cur=T.ai;th=num(S.profile.annualSpending)*num(m.threshold);textUnit='annualIncome';}
    else if(m.type==='coast'){cur=T.cv;th=C.target;textUnit='capital';}
    else{return;}
    if(cur<th)cands.push({m:m,ratio:th?cur/th:0,cur:cur,th:th,unit:textUnit});
  });
  cands.sort(function(a,b){return b.ratio-a.ratio;});
  var block=el('nextUp'),bar=el('nextUpBar');
  if(!cands.length){if(block)block.textContent='All numeric milestones achieved! 🎉';if(bar)bar.style.width='100%';return;}
  var c=cands[0],remaining=c.th-c.cur,needTxt=peso(remaining);
  if(block)block.textContent='Next Up: '+c.m.label+' — '+needTxt+' more to go.';
  if(bar)bar.style.width=clamp(c.ratio*100,0,100)+'%';
}
function shareList(arr,labelFn){var tot=arr.reduce(function(sum,x){return sum+x.v;},0);return arr.map(function(x){return{label:labelFn(x),v:x.v,pct:tot?x.v/tot*100:0};});}
function legend(id,items){var node=el(id);if(!node)return;node.innerHTML=items.map(function(it,i){return '<li><span><span class="dot" style="background:'+LEGEND_PALETTE[i%LEGEND_PALETTE.length]+'"></span>'+it.label+'</span><span>'+it.pct.toFixed(1)+'%</span></li>';}).join('');}
function drawBucket(){
  var grouped={};allocationPositions().forEach(function(p){grouped[p.bucket]=(grouped[p.bucket]||0)+valuePHP(p);});
  var items=shareList(Object.keys(grouped).map(function(k){return{label:k,v:grouped[k]};}),function(x){return x.label;});
  makeChart('chartBucket',{type:'doughnut',data:{labels:items.map(function(i){return i.label;}),datasets:[{data:items.map(function(i){return i.v;}),backgroundColor:LEGEND_PALETTE}]},options:{plugins:{legend:{display:false},tooltip:{callbacks:{label:function(c){var t=c.dataset.data.reduce(function(s,v){return s+v;},0);return c.label+': '+peso(c.parsed)+' ('+(t?c.parsed/t*100:0).toFixed(1)+'%)';}}}}}});
  legend('legendBucket',items);
}
function drawHolding(){
  var items=shareList(allocationPositions().map(function(p){return{label:p.ticker,v:valuePHP(p)};}),function(x){return x.label;});
  makeChart('chartHolding',{type:'doughnut',data:{labels:items.map(function(i){return i.label;}),datasets:[{data:items.map(function(i){return i.v;}),backgroundColor:LEGEND_PALETTE.concat(LEGEND_PALETTE)}]},options:{plugins:{legend:{display:false},tooltip:{callbacks:{label:function(c){var t=c.dataset.data.reduce(function(s,v){return s+v;},0);return c.label+': '+peso(c.parsed)+' ('+(t?c.parsed/t*100:0).toFixed(1)+'%)';}}}}}});
  legend('legendHolding',items);
}
function drawIncome(){
  var list=spendablePayers();
  var datasets=list.map(function(p,i){return{label:p.ticker,data:[incomePHP(p)/12],backgroundColor:LEGEND_PALETTE[i%LEGEND_PALETTE.length]};});
  makeChart('chartIncome',{type:'bar',data:{labels:['Monthly Income'],datasets:datasets},options:{indexAxis:'y',scales:{x:{stacked:true},y:{stacked:true}},plugins:{tooltip:{callbacks:{label:function(c){return c.dataset.label+': '+peso(c.parsed.x);}}}}}});
}
function drawValue(){
  var empty=el('valueEmpty');
  if(!S.snapshots.length){if(empty)empty.style.display='block';if(charts.chartValue){try{charts.chartValue.destroy();}catch(_){}}return;}
  if(empty)empty.style.display='none';
  makeChart('chartValue',{type:'line',data:{labels:S.snapshots.map(function(s){return s.date;}),datasets:[{label:'Invested',data:S.snapshots.map(function(s){return s.invested;}),borderColor:'#0b5a92',tension:.3},{label:'Market Value',data:S.snapshots.map(function(s){return s.marketValue;}),borderColor:'#17c3b2',tension:.3}]},options:{plugins:{tooltip:{callbacks:{label:function(c){return c.dataset.label+': '+peso(c.parsed.y);}}}}}});
}

/* ===== milestones ===== */
function renderMilestones(){
  var box=el('questGrid');if(!box)return;
  var T=totals(),C=coast();
  box.innerHTML=S.milestones.map(function(m){
    var achieved=false,cur=0,th=m.threshold;
    if(m.type==='capital'){cur=T.ti;achieved=cur>=th;}
    else if(m.type==='gain'){cur=T.gain;achieved=cur>=th;}
    else if(m.type==='double'){cur=T.cv;achieved=T.ti>0&&T.cv>=2*T.ti;th=2*T.ti;}
    else if(m.type==='income'){cur=T.am;achieved=cur>=th;}
    else if(m.type==='incomeCover'){cur=T.ai;th=num(S.profile.annualSpending)*num(m.threshold);achieved=cur>=th;}
    else if(m.type==='coast'){cur=T.cv;th=C.target;achieved=T.cv>=C.target;}
    else if(m.type==='manual'){achieved=!!m.achieved;}
    if(m.type!=='manual'&&achieved&&S.achievedIds.indexOf(m.id)<0){S.achievedIds.push(m.id);save();setTimeout(function(){toast(m.motivator);},50);} 
    var emoji=(m.motivator.match(/[\p{Emoji_Presentation}\u{1F000}-\u{1FAFF}\u2600-\u27BF]/u)||[CATEGORIES_BY_TYPE[m.cat]||'⭐'])[0];
    var barHtml='';
    if(m.type!=='manual'&&th>0){var prog=Math.min(cur/th,1)*100;barHtml='<div class="bar mini"><span style="width:'+prog+'%"></span></div>';}
    var chk=m.type==='manual'?'<label style="display:flex;gap:6px;align-items:center;font-size:.8rem;margin-top:6px"><input type="checkbox" '+(achieved?'checked':'')+' onclick="toggleManual(\''+m.id+'\')"> mark done</label>':'';
    return '<div class="qcard cat-'+m.cat+(achieved?' done':' locked')+'"><span class="lock">'+(achieved?'':'🔒')+'</span><span class="emoji">'+emoji+'</span><div class="qlabel">'+m.label+'</div>'+barHtml+(achieved?'<div class="motiv">'+m.motivator+'</div>':'')+chk+(m.custom?'<button class="btn ghost" style="margin-top:6px;padding:2px 8px" onclick="delMilestone(\''+m.id+'\')">remove</button>':'')+'</div>';
  }).join('');
}
function toggleManual(id){var item=S.milestones.find(function(x){return x.id===id;});if(item){item.achieved=!item.achieved;if(item.achieved)toast(item.motivator);save();renderMilestones();}}
function addMilestone(){
  var type=(el('mType')||{}).value;
  var th=num((el('mThreshold')||{}).value,0);
  var cat=(el('mCat')||{}).value||'Custom';
  var label=(el('mLabel')||{}).value||'My quest';
  var mot=(el('mMotivator')||{}).value||'🎉';
  S.milestones.push({id:'c'+Date.now(),cat:cat,type:type,threshold:th,label:label,motivator:mot,manual:type==='manual',achieved:false,custom:true});
  save();renderMilestones();
}
function delMilestone(id){S.milestones=S.milestones.filter(function(m){return m.id!==id;});save();renderMilestones();}

/* ===== tools ===== */
function renderTools(){
  var active=S.ui.tool||'dividend';
  var map={dividend:renderDividend,rebalance:renderRebalance,projector:renderProjector};
  if(map[active]){try{map[active]();}catch(err){console.error(err);}}
}
function setTargetFromExpense(id){
  var monthly=Math.round(currentIncomeTargetMonthly());
  var node=el(id);
  if(node){node.value=monthly;if(id==='divTarget'){renderDividend();}}
  toast('Planner target set to '+peso(monthly)+'/mo from the current coverage target.');
}
function renderDividend(){
  var targetNode=el('divTarget');if(targetNode&&!targetNode.value)targetNode.value=Math.round(currentIncomeTargetMonthly());
  var desiredYield=(num((el('divDesiredYield')||{}).value,7))/100;
  var targetMonthly=num((el('divTarget')||{}).value,currentIncomeTargetMonthly());
  var targetAnnual=targetMonthly*12;
  var T=totals();
  setTxt('divCurrent',peso(T.ai));
  setTxt('divCoverage',pct(incomeCoverageSpendingPct()));
  setTxt('divGap',peso(annualIncomeGap(targetAnnual)));
  setTxt('divYoc',pct(T.yoc,2));
  setTxt('divResult','');
  var rows=spendablePayers().map(function(p){
    var currentValue=valuePHP(p);
    var netYield=currentValue?incomePHP(p)/currentValue:0;
    var currentPrice=num(p.currentPrice);
    var currentMonthly=incomePHP(p)/12;
    var currentAnnualIncome=incomePHP(p);
    var additionalAnnualNeeded=Math.max(targetAnnual-currentAnnualIncome,0);
    var targetPrice=(num(p.div)*(1-effTax(p)))/(desiredYield||0.0001);
    var fmt=p.currency==='USD'?usd:peso;
    var additionalCapital=netYield>0?additionalAnnualNeeded/netYield:0;
    return '<tr><td>'+p.ticker+'</td><td>'+fmt(currentPrice)+'</td><td>'+peso(currentMonthly)+'</td><td>'+pct(netYield*100,2)+'</td><td>'+fmt(targetPrice)+'</td><td>'+(netYield>0?peso(additionalCapital):'—')+'</td></tr>';
  });
  setHTML('divTable',rows.join(''));
}
function capitalToAdd(){
  renderDividend();
}
function bucketTargetsForMode(){
  if(REBALANCE_MODE==='default')return {
    Growth:num(S.profile.defaultDistribution.Growth,70),
    Income:num(S.profile.defaultDistribution.Income,20),
    Stability:num(S.profile.defaultDistribution.Stability,10)
  };
  var buckets={Growth:0,Income:0,Stability:0},total=0;
  nonInsurancePositions().forEach(function(p){if(buckets[p.bucket]!=null){buckets[p.bucket]+=valuePHP(p);total+=valuePHP(p);}});
  return {
    Growth:total?buckets.Growth/total*100:0,
    Income:total?buckets.Income/total*100:0,
    Stability:total?buckets.Stability/total*100:0
  };
}
function withinBucketWeights(bucket){
  var holdings=nonInsurancePositions().filter(function(p){return p.bucket===bucket;});
  var bucketValue=holdings.reduce(function(sum,p){return sum+valuePHP(p);},0);
  return holdings.map(function(p){return{ticker:p.ticker,pct:bucketValue?valuePHP(p)/bucketValue*100:(holdings.length?100/holdings.length:0)};});
}
function renderRebalance(){
  var tb=el('rbTable');if(!tb)return;
  var buckets=['Growth','Income','Stability'];
  var bucketTargets=bucketTargetsForMode();
  var html='';
  buckets.forEach(function(bucket){
    html+='<tr class="rbhead"><td colspan="2"><b>'+bucket+'</b></td><td><input class="inp-sm" id="rb_'+bucket+'" type="number" value="'+bucketTargets[bucket].toFixed(0)+'" oninput="computeRebalance()"> %</td><td colspan="2"></td></tr>';
    withinBucketWeights(bucket).forEach(function(item){var pos=S.positions.find(function(p){return p.ticker===item.ticker;});html+='<tr><td>'+item.ticker+'</td><td>'+peso(valuePHP(pos))+'</td><td><input class="inp-sm" id="rw_'+item.ticker+'" type="number" value="'+item.pct.toFixed(0)+'" oninput="computeRebalance()"></td><td id="rbt_'+item.ticker+'"></td><td id="rba_'+item.ticker+'"></td></tr>';});
  });
  tb.innerHTML=html;
  computeRebalance();
}
function computeRebalance(){
  var add=num((el('rbAdd')||{}).value,0);
  var total=nonInsurancePositions().reduce(function(sum,p){return sum+valuePHP(p);},0)+add;
  nonInsurancePositions().forEach(function(p){
    if(['Growth','Income','Stability'].indexOf(p.bucket)<0)return;
    var bp=num((el('rb_'+p.bucket)||{}).value,0);
    var wp=num((el('rw_'+p.ticker)||{}).value,0);
    var ideal=total*(bp/100)*(wp/100);
    var delta=ideal-valuePHP(p);
    var tc=el('rbt_'+p.ticker);if(tc)tc.textContent=peso(ideal);
    var ac=el('rba_'+p.ticker);if(ac){ac.textContent=delta>0?('Buy '+peso(delta)):peso(delta);ac.className=delta>0?'buy':'';}
  });
}
function loadCurrentDistribution(){REBALANCE_MODE='current';renderRebalance();toast('Loaded current bucket weights.');}
function loadDefaultDistribution(){REBALANCE_MODE='default';renderRebalance();toast('Loaded default distribution profile.');}
function renderProjector(){
  var p=S.profile;
  function sv(id,val){var node=el(id);if(node&&!node.value)node.value=val;}
  sv('pjAge',p.currentAge);sv('pjRetire',p.retireAge);sv('pjMonthly',p.monthlyContribution);sv('pjStep',(p.contribStepUp*100).toFixed(1));sv('pjReturn',(realReturn()*100).toFixed(2));sv('pjSpend',p.annualSpending);sv('pjPort',Math.round(totals().cv));
}
function computeProjector(){
  var age=num((el('pjAge')||{}).value,25),ret=num((el('pjRetire')||{}).value,55),monthly=num((el('pjMonthly')||{}).value,0),step=num((el('pjStep')||{}).value,0)/100,r=num((el('pjReturn')||{}).value,6)/100,spend=num((el('pjSpend')||{}).value,0),mult=num((el('pjMult')||{}).value,30),v=num((el('pjPort')||{}).value,0);
  var FIRE=spend*mult,target=Math.ceil((ret>age?FIRE/Math.pow(1+r,ret-age):FIRE)/500000)*500000,coastAge=null,c=monthly*12;
  for(var a=age;a<ret;a++){var grown=v*Math.pow(1+r,ret-a);if(grown>=FIRE&&coastAge===null)coastAge=a;v=v*(1+r)+c;c*=(1+step);}if(v>=FIRE&&coastAge===null)coastAge=ret;
  setHTML('pjResult','FIRE number: <b>'+peso(FIRE)+'</b><br>Coast target today (rounded): <b>'+peso(target)+'</b><br>Coast FIRE reached at age: <b>'+(coastAge==null?('>'+ret):coastAge)+'</b><br>Projected value at age '+ret+': <b>'+peso(v)+'</b>');
}

/* ===== settings and holdings ===== */
function renderData(){renderProfileForm();renderPosCards();renderSnapTable();}
function renderProfileForm(){
  var p=S.profile;function sv(id,val){var node=el(id);if(node)node.value=val;}
  sv('pfAge',p.currentAge);sv('pfRetire',p.retireAge);sv('pfSpend',p.annualSpending);sv('pfMonthly',p.monthlyContribution);sv('pfStep',(p.contribStepUp*100).toFixed(1));sv('pfIncomePct',num(p.incomeCoverageTargetPct,50).toFixed(0));sv('pfNetYield',(p.defaultNetYield*100).toFixed(1));sv('pfDivTax',(p.domesticDivTax*100).toFixed(1));sv('pfFx',p.fxRate);sv('pfMult',p.withdrawalMultiplier);sv('pfReturnManual',(p.realReturnManual*100).toFixed(2));sv('pfRetGrowth',(p.bucketReturns.Growth*100).toFixed(1));sv('pfRetIncome',(p.bucketReturns.Income*100).toFixed(1));sv('pfRetStability',(p.bucketReturns.Stability*100).toFixed(1));sv('pfDefGrowth',p.defaultDistribution.Growth);sv('pfDefIncome',p.defaultDistribution.Income);sv('pfDefStability',p.defaultDistribution.Stability);
  var mode=el('pfReturnMode');if(mode){mode.value=p.realReturnMode;mode.onchange=syncReturnMode;}syncReturnMode();
}
function syncReturnMode(){
  var mode=(el('pfReturnMode')||{}).value;var auto=(mode==='auto');
  ['pfReturnManual'].forEach(function(id){var n=el(id);if(n)n.disabled=auto;});
  ['pfRetGrowth','pfRetIncome','pfRetStability'].forEach(function(id){var n=el(id);if(n)n.disabled=!auto;});
}
function saveProfile(){
  var p=S.profile;function n(id,fallback){return num((el(id)||{}).value,fallback);} 
  p.currentAge=n('pfAge',p.currentAge);p.retireAge=n('pfRetire',p.retireAge);p.annualSpending=n('pfSpend',p.annualSpending);p.monthlyContribution=n('pfMonthly',p.monthlyContribution);p.contribStepUp=n('pfStep',p.contribStepUp*100)/100;p.incomeCoverageTargetPct=n('pfIncomePct',p.incomeCoverageTargetPct);p.defaultNetYield=n('pfNetYield',p.defaultNetYield*100)/100;p.domesticDivTax=n('pfDivTax',p.domesticDivTax*100)/100;var fxNew=n('pfFx',p.fxRate);if(fxNew!==p.fxRate)p.fxLu=todayISO();p.fxRate=fxNew;p.withdrawalMultiplier=n('pfMult',p.withdrawalMultiplier);p.realReturnMode=(el('pfReturnMode')||{}).value||'auto';p.realReturnManual=n('pfReturnManual',p.realReturnManual*100)/100;p.bucketReturns={Growth:n('pfRetGrowth',p.bucketReturns.Growth*100)/100,Income:n('pfRetIncome',p.bucketReturns.Income*100)/100,Stability:n('pfRetStability',p.bucketReturns.Stability*100)/100};p.defaultDistribution={Growth:n('pfDefGrowth',p.defaultDistribution.Growth),Income:n('pfDefIncome',p.defaultDistribution.Income),Stability:n('pfDefStability',p.defaultDistribution.Stability)};delete p.targetMonthlyIncome;delete p.includeMP2Income;save();renderAll();toast('Profile saved ✓');
}
function renderPosCards(){
  var box=el('posCards');if(!box)return;var buckets=['Growth','Income','Stability','Insurance'],curs=['PHP','USD'];
  box.innerHTML=S.positions.map(function(p,i){
    function sel(field,opts,val){return '<select onchange="updatePos('+i+',\''+field+'\',this.value)">'+opts.map(function(o){return '<option'+(o===val?' selected':'')+'>'+o+'</option>';}).join('')+'</select>';}
    function inp(field,val,type){return '<input '+(type?'type="'+type+'" ':'')+'value="'+val+'" onchange="updatePos('+i+',\''+field+'\',this.value)">';}
    return '<div class="poscard b-'+p.bucket+'"><h4><span>'+p.ticker+'</span><button class="btn danger" style="padding:2px 10px" onclick="delPos('+i+')">&times;</button></h4>'+
      '<div class="pf"><label>Name</label>'+inp('name',p.name)+'</div>'+
      '<div class="pf"><label>Bucket</label>'+sel('bucket',buckets,p.bucket)+'</div>'+
      '<div class="pf"><label>Currency</label>'+sel('currency',curs,p.currency)+'</div>'+
      '<div class="pf"><label>Units</label>'+inp('units',p.units,'number')+'</div>'+
      '<div class="pf"><label>Current price</label>'+inp('currentPrice',p.currentPrice,'number')+'</div>'+
      '<div class="pf"><label>Annual dividend / unit</label>'+inp('div',p.div,'number')+'</div>'+
      '<div class="pf"><label>Dividend tax override (blank = default)</label>'+inp('divTaxOverride',(p.divTaxOverride==null?'':p.divTaxOverride),'number')+'</div>'+
      '<div class="pf"><label>Invested (₱ cost basis)</label>'+inp('invested',p.invested,'number')+'</div>'+
      '<div class="pf"><label style="display:flex;gap:8px;align-items:center"><input type="checkbox" '+(p.isIlliquid?'checked':'')+' onchange="updatePos('+i+',\'isIlliquid\',this.checked)"> Illiquid</label></div>'+
      '</div>';
  }).join('');
}
function updatePos(i,field,val){
  var p=S.positions[i];if(!p)return;
  if(field==='isIlliquid'){p.isIlliquid=val;}
  else if(field==='name'||field==='bucket'||field==='currency'){p[field]=val;}
  else if(field==='divTaxOverride'){p.divTaxOverride=(val===''?null:Number(val));}
  else{p[field]=Number(val);} 
  if(field==='currentPrice'){p.lu.currentPrice=todayISO();}
  if(field==='div'){p.lu.div=todayISO();}
  save();renderAll();
}
function delPos(i){if(confirm('Delete '+S.positions[i].ticker+'?')){S.positions.splice(i,1);save();renderAll();}}
function addPos(){
  function g(id){return (el(id)||{}).value;}
  var tk=g('apTicker');if(!tk){toast('Ticker required');return;}
  S.positions.push({ticker:tk,name:g('apName')||tk,bucket:g('apBucket'),currency:g('apCur'),units:num(g('apUnits'),0),currentPrice:num(g('apPrice'),0),div:num(g('apDiv'),0),divTaxOverride:(g('apTax')===''?null:Number(g('apTax'))),invested:num(g('apInvested'),0),isIlliquid:!!(el('apIlliq')||{}).checked,lu:{currentPrice:todayISO(),div:todayISO()}});
  save();renderAll();toast('Added '+tk+' ✓');
}
function renderSnapTable(){
  var tb=el('snapTable');if(!tb)return;
  tb.innerHTML=S.snapshots.map(function(s,i){return '<tr><td>'+s.date+'</td><td>'+peso(s.invested)+'</td><td>'+peso(s.marketValue)+'</td><td><button class="btn ghost" style="padding:2px 8px" onclick="delSnap('+i+')">&times;</button></td></tr>';}).join('');
}
function saveSnapshot(){var T=totals();S.snapshots.push({date:todayISO(),invested:Math.round(T.ti),marketValue:Math.round(T.cv)});save();renderAll();toast('Snapshot saved ✓');}
function clearSnapshots(){if(confirm('Remove ALL snapshots?')){S.snapshots=[];save();renderAll();}}
function delLastSnapshot(){S.snapshots.pop();save();renderAll();}
function delSnap(i){S.snapshots.splice(i,1);save();renderAll();}
function exportJSON(){
  try{var txt=JSON.stringify(S,null,2);var blob=new Blob([txt],{type:'application/json'});var url=URL.createObjectURL(blob);var a=document.createElement('a');a.href=url;a.download='portfolio_'+todayISO()+'.json';document.body.appendChild(a);a.click();a.remove();URL.revokeObjectURL(url);}catch(err){console.error(err);alert('Export failed: '+err.message);} 
}
function importJSON(file){
  var reader=new FileReader();
  reader.onload=function(){
    try{var data=JSON.parse(reader.result);if(!data||!data.profile||!Array.isArray(data.positions))throw new Error('missing profile/positions');S=data;ensureDefaults();save();renderAll();alert('Import successful ✓');}
    catch(err){console.error(err);alert('Invalid JSON file: '+err.message);}
  };
  reader.readAsText(file);
}

/* ===== init ===== */
window.addEventListener('DOMContentLoaded',function(){
  load();
  document.querySelectorAll('.navbtn').forEach(function(btn){btn.addEventListener('click',function(){showTab(btn.dataset.tab);});});
  document.querySelectorAll('.toolbtn').forEach(function(btn){btn.addEventListener('click',function(){showTool(btn.dataset.tool);});});
  var bell=el('bellBtn');if(bell)bell.addEventListener('click',function(){var panel=el('bellPanel');if(panel)panel.classList.toggle('open');});
  showTab(S.ui.tab||'dashboard');
  showTool(S.ui.tool||'dividend');
});

/* ===== expose to window ===== */
window.showTab=showTab;window.showTool=showTool;
window.exportJSON=exportJSON;window.importJSON=importJSON;
window.saveProfile=saveProfile;window.addPos=addPos;window.updatePos=updatePos;window.delPos=delPos;
window.saveSnapshot=saveSnapshot;window.clearSnapshots=clearSnapshots;window.delLastSnapshot=delLastSnapshot;window.delSnap=delSnap;
window.addMilestone=addMilestone;window.delMilestone=delMilestone;window.toggleManual=toggleManual;
window.computeProjector=computeProjector;window.capitalToAdd=capitalToAdd;window.setTargetFromExpense=setTargetFromExpense;window.syncReturnMode=syncReturnMode;
window.computeRebalance=computeRebalance;window.loadCurrentDistribution=loadCurrentDistribution;window.loadDefaultDistribution=loadDefaultDistribution;window.renderDividend=renderDividend;
