
/* Portfolio Dashboard app.js — Beta5 */
var KEY='portfolioDataV4';
var S={}; var charts={};

/* ---------- helpers ---------- */
function el(id){return document.getElementById(id);}
function setTxt(id,t){var e=el(id);if(e)e.textContent=t;}
function todayISO(){return new Date().toISOString().slice(0,10);}
function today(){return new Date();}
function daysBetween(ds,t){if(!ds)return 0;return Math.floor((t-new Date(ds))/86400000);}
function peso(n){n=Number(n);if(!isFinite(n))n=0;return '\u20b1'+n.toLocaleString('en-PH',{maximumFractionDigits:0});}
function usd(n){n=Number(n);if(!isFinite(n))n=0;return '$'+n.toLocaleString('en-US',{maximumFractionDigits:2});}
function pct(n,d){d=(d==null?1:d);return (Number(n)||0).toFixed(d)+'%';}
function save(){localStorage.setItem(KEY,JSON.stringify(S));}
function makeChart(id,cfg){var e=el(id);if(!e||typeof Chart==='undefined')return null;if(charts[id]){try{charts[id].destroy();}catch(x){}}try{charts[id]=new Chart(e,cfg);return charts[id];}catch(x){console.error('chart '+id,x);return null;}}
function toast(msg){var d=document.createElement('div');d.className='toast';d.textContent=msg;document.body.appendChild(d);setTimeout(function(){d.remove();},4000);}

/* ---------- seed ---------- */
function P(t,n,b,c,u,pr,dv,tx,il,inv){return{ticker:t,name:n,bucket:b,currency:c,units:u,currentPrice:pr,div:dv,divTaxOverride:tx,isIlliquid:il,invested:inv,lu:{currentPrice:'2026-07-01',div:'2026-04-15'}};}
function seedMilestones(){
 function m(cat,type,th,label,mot,manual){return{id:cat+'_'+type+'_'+th+'_'+label.slice(0,4),cat:cat,type:type,threshold:th,label:label,motivator:mot,manual:!!manual,achieved:false};}
 return[
  m('Capital','capital',100000,'First \u20b1100k invested','Six figures invested! \ud83c\udf31 The snowball starts rolling.'),
  m('Capital','capital',250000,'\u20b1250k invested','Quarter million! \ud83d\ude80'),
  m('Capital','capital',500000,'\u20b1500k invested','Half a million working for you. \ud83d\udcaa'),
  m('Capital','capital',1000000,'First \u20b11M invested','Millionaire in contributions! \ud83c\udf8a'),
  m('Capital','capital',2000000,'\u20b12M invested','Serious momentum. \u26a1'),
  m('Capital','capital',3000000,'\u20b13M invested','Past base camp; summit in view. \ud83c\udfd4\ufe0f'),
  m('Capital','capital',5000000,'\u20b15M invested','The finish line is real now. \ud83c\udfc6'),
  m('Freedom','coast',0,'Coast FIRE reached','\ud83d\udd4a\ufe0f You can stop contributing today and still retire on target. Breathe.'),
  m('Freedom','incomeCover',0.25,'Income covers 25% of expenses','\ud83c\udf17 A quarter of life funded by assets.'),
  m('Freedom','incomeCover',0.5,'Income covers 50%','Halfway to freedom. \u2696\ufe0f'),
  m('Freedom','incomeCover',1,'Income covers 100%','\ud83c\udfdd\ufe0f You could coast on income alone. Work is now a choice. \ud83d\ude09'),
  m('Growth','gain',50000,'First \u20b150k gain','The market is paying you. \ud83d\udcc8'),
  m('Growth','gain',100000,'\u20b1100k unrealized gain','\u20b1100k for staying invested \u2014 no overtime. \ud83d\udcc8'),
  m('Growth','gain',500000,'\u20b1500k gain','On fire. \ud83d\udd25'),
  m('Growth','gain',1000000,'\u20b11M gain','Money you never earned at work. \ud83e\udd2f'),
  m('Growth','double',2,'Doubled your money','Your money cloned itself. \ud83e\uddec'),
  m('Income','income',1000,'First \u20b11k/mo income','Your portfolio bought dinner. \ud83c\udf5c'),
  m('Income','income',5000,'\u20b15k/mo income','Momentum building. \ud83d\udcb5'),
  m('Income','income',10000,'\u20b110k/mo income','A bill your assets now pay. \ud83d\udcec'),
  m('Income','income',20000,'\u20b120k/mo income','Real traction. \ud83d\udee4\ufe0f'),
  m('Income','income',30000,'\u20b130k/mo income (target)','\ud83c\udfaf Dividends match your monthly contribution!'),
  m('Income','income',50000,'\u20b150k/mo income','Serious cash flow. \ud83c\udfe6'),
  m('Resilience','manual',0,'First bear market survived','You did not blink at the bear. \ud83d\udc3b',true),
  m('Resilience','manual',0,'Bought the dip in a drawdown','You went shopping while others panicked. \ud83d\uded2',true),
  m('Resilience','manual',0,'12 months straight contributing','Never missed a month. \ud83d\udd25',true),
  m('Resilience','manual',0,'5-year anniversary','Half a decade of discipline. \ud83c\udf96\ufe0f',true),
  m('Family','manual',0,'Started baby #1 college fund','Their future before their first steps. \ud83d\udc76\ud83d\udc99',true),
  m('Family','manual',0,'MP2 diluted to \u226420%','Ballast right-sized. \u2696\ufe0f',true),
  m('Family','manual',0,'All 3 college funds started','Three futures funded. \ud83d\udc68\u200d\ud83d\udc69\u200d\ud83d\udc67\u200d\ud83d\udc66',true)
 ];
}
function seed(){
 S={
  profile:{currentAge:31,retireAge:56,annualSpending:800000,monthlyContribution:45000,contribStepUp:0.06,targetMonthlyIncome:30000,defaultNetYield:0.07,domesticDivTax:0.10,fxRate:58.5,fxLu:'2026-07-01',withdrawalMultiplier:30,realReturnMode:'auto',realReturnManual:0.06,bucketReturns:{Growth:0.07,Income:0.045,Stability:0.025},includeMP2Income:false},
  positions:[
   P('MBT','Metrobank','Income','PHP',500,78,4.0,null,false,30000),
   P('MREIT','MREIT Inc','Income','PHP',5000,14.1,1.0,null,false,66000),
   P('AREIT','AREIT Inc','Income','PHP',2000,40,2.2,null,false,68000),
   P('RCR','RL Commercial REIT','Income','PHP',6000,6.5,0.45,null,false,37200),
   P('MANULIFE-INCOME','Manulife Multi-Asset Income Feeder','Income','PHP',20000,1.05,0.05,null,false,20000),
   P('SPY-UITF','BPI US Feeder (SPY UITF)','Growth','PHP',1000,135,0,null,false,120000),
   P('SPMO','SPMO S&P500 Momentum','Growth','USD',100,110,0,null,false,526500),
   P('SMH','SMH Semiconductors','Growth','USD',20,300,0,null,false,292500),
   P('VYMI','VYMI Intl High Dividend','Growth','USD',200,70,3.5,0.25,false,760500),
   P('MANULIFE-ASIA','Manulife Asia Best Select','Growth','PHP',10000,1.2,0,null,false,11000),
   P('MP2','MP2 Pag-IBIG','Stability','PHP',205000,1,0.065,0,false,205000),
   P('VUL','VUL Insurance Fund','Insurance','PHP',1,160000,0,null,true,150000)
  ],
  snapshots:[{date:'2026-01-31',invested:400000,marketValue:410000},{date:'2026-03-31',invested:440000,marketValue:465000},{date:'2026-05-31',invested:480000,marketValue:505000},{date:'2026-06-30',invested:500000,marketValue:512000}],
  cadence:{currentPrice:7,annualDividendPerUnit:100,fxRate:7},
  milestones:seedMilestones(),achievedIds:[],ui:{tab:'dashboard',tool:'alloc'}
 };
}
function load(){
 try{var raw=localStorage.getItem(KEY);S=raw?JSON.parse(raw):null;}catch(e){S=null;}
 if(!S||!S.profile||!S.positions){seed();save();return;}
 S.ui=S.ui||{tab:'dashboard',tool:'alloc'};S.achievedIds=S.achievedIds||[];
 S.cadence=S.cadence||{currentPrice:7,annualDividendPerUnit:100,fxRate:7};
 if(!S.milestones)S.milestones=seedMilestones();
 S.positions.forEach(function(p){if(!p.lu)p.lu={currentPrice:todayISO(),div:todayISO()};p.invested=Number(p.invested)||0;});
}

/* ---------- derived ---------- */
var SEMI={SMH:100,SPMO:45,'SPY-UITF':10,'MANULIFE-ASIA':15};
function fx(){return Number(S.profile.fxRate)||1;}
function valuePHP(p){return (Number(p.units)||0)*(Number(p.currentPrice)||0)*(p.currency==='USD'?fx():1);}
function effTax(p){return p.divTaxOverride!=null?Number(p.divTaxOverride):Number(S.profile.domesticDivTax);}
function incomePHP(p){return (Number(p.units)||0)*(Number(p.div)||0)*(1-effTax(p))*(p.currency==='USD'?fx():1);}
function isMP2(p){return p.ticker==='MP2';}
function nonInsurance(){return S.positions.filter(function(p){return p.bucket!=='Insurance';});}
function totals(){
 var ti=0,cv=0,ai=0;
 S.positions.forEach(function(p){ti+=Number(p.invested)||0;cv+=valuePHP(p);if(!isMP2(p)||S.profile.includeMP2Income)ai+=incomePHP(p);});
 var g=cv-ti;return{ti:ti,cv:cv,gain:g,gainPct:ti?g/ti*100:0,ai:ai,am:ai/12};
}
function realReturn(){
 if(S.profile.realReturnMode==='manual')return Number(S.profile.realReturnManual)||0.06;
 var bv={Growth:0,Income:0,Stability:0},tot=0;
 nonInsurance().forEach(function(p){if(bv[p.bucket]!=null){bv[p.bucket]+=valuePHP(p);tot+=valuePHP(p);}});
 if(!tot)return 0.06;var br=S.profile.bucketReturns;
 return (bv.Growth*br.Growth+bv.Income*br.Income+bv.Stability*br.Stability)/tot;
}
function coast(){var r=realReturn();var FIRE=S.profile.annualSpending*S.profile.withdrawalMultiplier;var yrs=S.profile.retireAge-S.profile.currentAge;var raw=FIRE/Math.pow(1+r,yrs);var target=Math.ceil(raw/500000)*500000;var cv=totals().cv;return{r:r,FIRE:FIRE,target:target,progress:target?cv/target*100:0};}
function historicalPct(){if(!S.snapshots.length)return 0;var l=S.snapshots[S.snapshots.length-1];return l.invested?(l.marketValue-l.invested)/l.invested*100:0;}
function semiExposure(){var num=0,den=0;S.positions.forEach(function(p){var v=valuePHP(p);den+=v;num+=v*((SEMI[p.ticker]||0)/100);});return den?num/den*100:0;}
function payers(){return S.positions.filter(function(p){return (Number(p.div)||0)>0;});}

/* ---------- staleness ---------- */
function stale(){
 var out=[];var t=today();
 S.positions.forEach(function(p){
  var lu=p.lu||{};
  if(lu.currentPrice){var dp=daysBetween(lu.currentPrice,t);if(dp>S.cadence.currentPrice)out.push({txt:'\ud83d\udd34 '+p.ticker+' price \u2014 '+dp+' days ago (weekly) \u00b7 overdue',red:true});else if(dp>=S.cadence.currentPrice*0.8)out.push({txt:'\ud83d\udfe1 '+p.ticker+' price \u2014 '+dp+' days (weekly) \u00b7 due soon',red:false});}
  if((Number(p.div)||0)>0&&lu.div){var dd=daysBetween(lu.div,t);if(dd>S.cadence.annualDividendPerUnit)out.push({txt:'\ud83d\udd34 '+p.ticker+' dividend \u2014 '+dd+' days ago (quarterly) \u00b7 overdue',red:true});}
 });
 if(S.profile.fxLu){var df=daysBetween(S.profile.fxLu,t);if(df>S.cadence.fxRate)out.push({txt:'\ud83d\udd34 FX rate \u2014 '+df+' days ago (weekly) \u00b7 overdue',red:true});}
 out.sort(function(a,b){return b.red-a.red;});return out;
}

/* ---------- nav ---------- */
function showTab(name){document.querySelectorAll('.tab').forEach(function(t){t.classList.remove('active');});var e=el('tab-'+name);if(e)e.classList.add('active');document.querySelectorAll('.navbtn').forEach(function(b){b.classList.toggle('sel',b.dataset.tab===name);});S.ui.tab=name;save();renderAll();}
function showTool(name){document.querySelectorAll('.tool').forEach(function(t){t.classList.remove('active');});var e=el('tool-'+name);if(e)e.classList.add('active');document.querySelectorAll('.toolbtn').forEach(function(b){b.classList.toggle('sel',b.dataset.tool===name);});S.ui.tool=name;save();renderTools();}

/* ---------- render pipeline ---------- */
function renderAll(){[renderBell,renderDashboard,renderMilestones,renderTools,renderData,renderHelp].forEach(function(fn){try{fn();}catch(e){console.error(fn.name,e);}});}
function renderHelp(){}
function renderBell(){
 var items=stale();var red=items.filter(function(i){return i.red;}).length;
 var b=el('bellBadge');if(b){b.textContent=red;b.style.display=red?'flex':'none';}
 var list=el('bellList');if(list)list.innerHTML=items.length?items.map(function(i){return '<li style="color:'+(i.red?'var(--bad)':'var(--warn)')+'">'+i.txt+'</li>';}).join(''):'<li>\ud83d\udfe2 Everything current</li>';
}

function renderDashboard(){
 var T=totals();var C=coast();
 setTxt('coastPct',pct(C.progress));setTxt('coastSub',peso(T.cv)+' / '+peso(C.target));
 setTxt('totalInvested',peso(T.ti));setTxt('netAnnual',peso(T.ai));
 setTxt('currentValue',peso(T.cv));
 var gp=el('gainPct');if(gp){gp.textContent=(T.gain>=0?'+':'')+pct(T.gainPct);gp.className='val '+(T.gain>=0?'up':'down');}
 setTxt('netMonthly',peso(T.am));
 var cb=el('coastBar');if(cb)cb.style.width=Math.min(C.progress,100)+'%';
 setTxt('coastReturns','Expected real return: '+pct(C.r*100)+' \u2022 Historical to date: '+pct(historicalPct()));
 var mp=el('mp2Toggle');if(mp){mp.checked=!!S.profile.includeMP2Income;mp.onchange=function(){S.profile.includeMP2Income=mp.checked;save();renderAll();};}
 nextUp(T,C);
 var sb=el('semiBadge');if(sb){var se=semiExposure();sb.textContent='Portfolio semiconductor exposure: '+se.toFixed(1)+'% (cap 30%)';sb.className='badge '+(se<=30?'ok':'warn');}
 setTxt('resMonthly',peso(T.am));
 drawBucket();drawHolding();drawIncome();drawValue();
}
function nextUp(T,C){
 var cands=[];
 S.milestones.forEach(function(m){
  var cur=null,th=m.threshold;
  if(m.type==='capital')cur=T.ti;else if(m.type==='gain')cur=T.gain;else if(m.type==='income')cur=T.am;else return;
  if(cur<th)cands.push({m:m,ratio:cur/th,cur:cur,th:th});
 });
 cands.sort(function(a,b){return b.ratio-a.ratio;});
 var e=el('nextUp');var bar=el('nextUpBar');
 if(!cands.length){if(e)e.textContent='All numeric milestones achieved! \ud83c\udf89';if(bar)bar.style.width='100%';return;}
 var c=cands[0];if(e)e.textContent='Next Up: '+c.m.label+' \u2014 just '+peso(c.th-c.cur)+' more! \ud83c\udfc1';
 if(bar)bar.style.width=Math.min(c.ratio*100,100)+'%';
}
function shareList(arr,labelFn){var tot=arr.reduce(function(s,x){return s+x.v;},0);return arr.map(function(x){return{label:labelFn(x),v:x.v,pct:tot?x.v/tot*100:0};});}
var PAL=['#0e7d8b','#17c3b2','#0b5a92','#7b2ff7','#f107a3','#f6b93b','#17a673','#e08a1e','#6ec1ff','#ff8fc4','#7fe0a1','#c9a6ff'];
function legend(id,items){var e=el(id);if(!e)return;e.innerHTML=items.map(function(it,i){return '<li><span><span class="dot" style="background:'+PAL[i%PAL.length]+'"></span>'+it.label+'</span><span>'+it.pct.toFixed(1)+'%</span></li>';}).join('');}
function drawBucket(){
 var bv={};S.positions.forEach(function(p){bv[p.bucket]=(bv[p.bucket]||0)+valuePHP(p);});
 var arr=Object.keys(bv).map(function(k){return{label:k,v:bv[k]};});var items=shareList(arr,function(x){return x.label;});
 makeChart('chartBucket',{type:'doughnut',data:{labels:items.map(function(i){return i.label;}),datasets:[{data:items.map(function(i){return i.v;}),backgroundColor:PAL}]},options:{plugins:{legend:{display:false},tooltip:{callbacks:{label:function(c){var t=c.dataset.data.reduce(function(s,v){return s+v;},0);return c.label+': '+peso(c.parsed)+' ('+(t?c.parsed/t*100:0).toFixed(1)+'%)';}}}}}});
 legend('legendBucket',items);
}
function drawHolding(){
 var arr=S.positions.map(function(p){return{label:p.ticker,v:valuePHP(p)};});var items=shareList(arr,function(x){return x.label;});
 makeChart('chartHolding',{type:'doughnut',data:{labels:items.map(function(i){return i.label;}),datasets:[{data:items.map(function(i){return i.v;}),backgroundColor:PAL.concat(PAL)}]},options:{plugins:{legend:{display:false},tooltip:{callbacks:{label:function(c){var t=c.dataset.data.reduce(function(s,v){return s+v;},0);return c.label+': '+peso(c.parsed)+' ('+(t?c.parsed/t*100:0).toFixed(1)+'%)';}}}}}});
 legend('legendHolding',items);
}
function drawIncome(){
 var pl=payers().filter(function(p){return !isMP2(p)||S.profile.includeMP2Income;});
 var ds=pl.map(function(p,i){return{label:p.ticker,data:[incomePHP(p)/12],backgroundColor:PAL[i%PAL.length]};});
 makeChart('chartIncome',{type:'bar',data:{labels:['Monthly Income'],datasets:ds},options:{indexAxis:'y',scales:{x:{stacked:true},y:{stacked:true}},plugins:{tooltip:{callbacks:{label:function(c){return c.dataset.label+': '+peso(c.parsed.x);}}}}}});
}
function drawValue(){
 var e=el('valueEmpty');
 if(!S.snapshots.length){if(e)e.style.display='block';if(charts.chartValue){try{charts.chartValue.destroy();}catch(x){}}return;}
 if(e)e.style.display='none';
 makeChart('chartValue',{type:'line',data:{labels:S.snapshots.map(function(s){return s.date;}),datasets:[{label:'Invested',data:S.snapshots.map(function(s){return s.invested;}),borderColor:'#0b5a92',tension:.3},{label:'Market Value',data:S.snapshots.map(function(s){return s.marketValue;}),borderColor:'#17c3b2',tension:.3}]},options:{plugins:{tooltip:{callbacks:{label:function(c){return c.dataset.label+': '+peso(c.parsed.y);}}}}}});
}

/* ---------- milestones ---------- */
var CATEMOJI={Capital:'\ud83d\udcb0',Growth:'\ud83d\udcc8',Income:'\ud83d\udcb5',Freedom:'\ud83d\udd4a\ufe0f',Resilience:'\ud83d\udee1\ufe0f',Family:'\ud83d\udc68\u200d\ud83d\udc69\u200d\ud83d\udc67\u200d\ud83d\udc66'};
function renderMilestones(){
 var box=el('questGrid');if(!box)return;var T=totals();var C=coast();
 box.innerHTML=S.milestones.map(function(m){
  var achieved=false,cur=0,th=m.threshold;
  if(m.type==='capital'){cur=T.ti;achieved=cur>=th;}
  else if(m.type==='gain'){cur=T.gain;achieved=cur>=th;}
  else if(m.type==='double'){cur=T.cv;achieved=T.ti>0&&T.cv>=2*T.ti;th=2*T.ti;}
  else if(m.type==='income'){cur=T.am;achieved=cur>=th;}
  else if(m.type==='incomeCover'){cur=T.ai;var need=S.profile.annualSpending*th;achieved=cur>=need;th=need;}
  else if(m.type==='coast'){cur=T.cv;achieved=T.cv>=C.target;th=C.target;}
  else if(m.type==='manual'){achieved=!!m.achieved;}
  if(m.type!=='manual'&&achieved&&S.achievedIds.indexOf(m.id)<0){S.achievedIds.push(m.id);save();setTimeout(function(){toast(m.motivator);},50);}
  var emoji=(m.motivator.match(/[\p{Emoji_Presentation}\u{1F000}-\u{1FAFF}\u2600-\u27BF]/u)||[CATEMOJI[m.cat]||'\u2b50'])[0];
  var barHtml='';
  if(m.type!=='manual'&&th>0){var prog=Math.min(cur/th,1)*100;barHtml='<div class="bar mini"><span style="width:'+prog+'%"></span></div>';}
  var chk=m.type==='manual'?'<label style="display:flex;gap:6px;align-items:center;font-size:.8rem;margin-top:6px"><input type="checkbox" '+(achieved?'checked':'')+' onclick="toggleManual(\''+m.id+'\')"> mark done</label>':'';
  return '<div class="qcard cat-'+m.cat+(achieved?' done':' locked')+'"><span class="lock">'+(achieved?'':'\ud83d\udd12')+'</span><span class="emoji">'+emoji+'</span><div class="qlabel">'+m.label+'</div>'+barHtml+(achieved?'<div class="motiv">'+m.motivator+'</div>':'')+chk+(m.custom?'<button class="btn ghost" style="margin-top:6px;padding:2px 8px" onclick="delMilestone(\''+m.id+'\')">remove</button>':'')+'</div>';
 }).join('');
}
function toggleManual(id){var m=S.milestones.find(function(x){return x.id===id;});if(m){m.achieved=!m.achieved;if(m.achieved)toast(m.motivator);save();renderMilestones();}}
function addMilestone(){
 var type=(el('mType')||{}).value;var th=Number((el('mThreshold')||{}).value)||0;var cat=(el('mCat')||{}).value||'Custom';var label=(el('mLabel')||{}).value||'My quest';var mot=(el('mMotivator')||{}).value||'\ud83c\udf89';
 S.milestones.push({id:'c'+Date.now(),cat:cat,type:type,threshold:th,label:label,motivator:mot,manual:type==='manual',achieved:false,custom:true});save();renderMilestones();
}
function delMilestone(id){S.milestones=S.milestones.filter(function(m){return m.id!==id;});save();renderMilestones();}

/* ---------- tools ---------- */
function renderTools(){var t=S.ui.tool||'alloc';var map={alloc:renderAlloc,dividend:renderDividend,target:renderTarget,rebalance:renderRebalance,projector:renderProjector};var f=map[t];if(f){try{f();}catch(e){console.error(e);}}}

function renderAlloc(){
  var hs=nonInsurance();
  var amt=el('allocAmt'); if(amt&&!amt.value)amt.value=S.profile.monthlyContribution;
  var tb=el('allocTable');
  if(tb && tb.children.length!==hs.length){
    tb.innerHTML=hs.map(function(p){return '<tr><td>'+p.ticker+'</td><td><input class="inp-sm" id="a_'+p.ticker+'" type="number" value="0" oninput="computeAlloc()"></td><td id="amt_'+p.ticker+'"></td></tr>';}).join('');
  }
  computeAlloc();
}
function fillAlloc(){
  var hs=nonInsurance();var tot=hs.reduce(function(s,p){return s+valuePHP(p);},0);
  hs.forEach(function(p){var i=el('a_'+p.ticker);if(i)i.value=(tot?valuePHP(p)/tot*100:0).toFixed(1);});
  computeAlloc();
}
function computeAlloc(){
  var amt=Number((el('allocAmt')||{}).value)||0;var hs=nonInsurance();var totPct=0,semiNum=0;
  hs.forEach(function(p){var v=Number((el('a_'+p.ticker)||{}).value)||0;totPct+=v;semiNum+=v*((SEMI[p.ticker]||0)/100);var c=el('amt_'+p.ticker);if(c)c.textContent=peso(amt*v/100);});
  var at=el('allocTotal');if(at){var ok=Math.abs(totPct-100)<0.5;at.innerHTML='<span class="badge '+(ok?'ok':'warn')+'">'+(ok?'\u2713 100%':'\u03a3 '+totPct.toFixed(1)+'% \u2014 adjust to 100%')+'</span>';}
  var as=el('allocSemi');if(as){var se=totPct?semiNum/totPct*100:0;as.textContent='Semiconductor: '+se.toFixed(1)+'% (cap 30%)';as.className='badge '+(se<=30?'ok':'warn');}
}

function renderDividend(){
 var t=el('divTarget');if(t&&!t.value)t.value=S.profile.targetMonthlyIncome;
 var T=totals();setTxt('divCurrent',peso(T.am));
 var target=Number((el('divTarget')||{}).value)||S.profile.targetMonthlyIncome;
 setTxt('divGap',peso(target*12-T.ai));
 var sel=el('divPick');if(sel){sel.innerHTML=payers().map(function(p){return '<option>'+p.ticker+'</option>';}).join('');}
 var tb=el('divTable');if(tb)tb.innerHTML=payers().map(function(p){var v=valuePHP(p);var ny=v?incomePHP(p)/v*100:0;var fmt=p.currency==='USD'?usd:peso;return '<tr><td>'+p.ticker+'</td><td>'+fmt(p.currentPrice)+'</td><td>'+ny.toFixed(2)+'%</td></tr>';}).join('');
}
function capitalToAdd(){
  var target=Number((el('divTarget')||{}).value)||S.profile.targetMonthlyIncome;
  var tk=el('divPick').value;var p=S.positions.find(function(x){return x.ticker===tk;});
  if(!p){setTxt('divResult','Pick a holding.');return;}
  var v=valuePHP(p);var ny=v?incomePHP(p)/v:0;var holdMonthly=incomePHP(p)/12;var gap=target-holdMonthly;
  if(gap<=0){setTxt('divResult','\ud83c\udf89 '+tk+' alone already provides '+peso(holdMonthly)+'/mo \u2014 at or above your '+peso(target)+' target.');return;}
  if(ny<=0){setTxt('divResult','That holding pays no dividend.');return;}
  setTxt('divResult','Add '+peso(gap*12/ny)+' into '+tk+' to lift ITS income from '+peso(holdMonthly)+' to your '+peso(target)+'/mo target (net yield '+(ny*100).toFixed(2)+'%).');
}

function renderTarget(){
  var y=(Number((el('tgtYield')||{}).value)||7)/100;var tb=el('tgtTable');if(!tb)return;
  var rows=payers().map(function(p){
    var tp=(Number(p.div)||0)*(1-effTax(p))/y;var cur=Number(p.currentPrice)||0;var diff=cur?(tp-cur)/cur*100:0;
    var fmt=p.currency==='USD'?usd:peso;var buy=cur<=tp;var mag=Math.abs(diff).toFixed(1);
    var rec=buy?('BUY \u2014 target '+fmt(tp)+'/sh, '+mag+'% above current'):('WAIT \u2014 target '+fmt(tp)+'/sh, '+mag+'% below current');
    var v=valuePHP(p);var ny=v?incomePHP(p)/v*100:0;
    return '<tr><td>'+p.ticker+'</td><td>'+fmt(cur)+'</td><td>'+ny.toFixed(2)+'%</td><td class="'+(buy?'buy':'wait')+'">'+fmt(tp)+'</td><td class="'+(buy?'buy':'wait')+'">'+rec+'</td></tr>';
  });
  tb.innerHTML=rows.join('');
}

function renderRebalance(){
  var tb=el('rbTable');if(!tb)return;var buckets=['Growth','Income','Stability'];var bv={},tot=0;
  nonInsurance().forEach(function(p){bv[p.bucket]=(bv[p.bucket]||0)+valuePHP(p);tot+=valuePHP(p);});
  var hs=nonInsurance();var needed=hs.length+buckets.length;
  if(tb.querySelectorAll('input').length!==needed){
    var html='';
    buckets.forEach(function(b){
      var bt=bv[b]||0;var defB=tot?bt/tot*100:0;
      html+='<tr class="rbhead"><td colspan="2"><b>'+b+'</b></td><td><input class="inp-sm" id="rb_'+b+'" type="number" value="'+defB.toFixed(0)+'" oninput="computeRebalance()"> %</td><td colspan="2"></td></tr>';
      hs.filter(function(p){return p.bucket===b;}).forEach(function(p){var defW=bt?valuePHP(p)/bt*100:0;html+='<tr><td>'+p.ticker+'</td><td>'+peso(valuePHP(p))+'</td><td><input class="inp-sm" id="rw_'+p.ticker+'" type="number" value="'+defW.toFixed(0)+'" oninput="computeRebalance()"></td><td id="rbt_'+p.ticker+'"></td><td id="rba_'+p.ticker+'"></td></tr>';});
    });
    tb.innerHTML=html;
  }
  computeRebalance();
}
function computeRebalance(){
  var add=Number((el('rbAdd')||{}).value)||0;var totNI=nonInsurance().reduce(function(s,p){return s+valuePHP(p);},0);
  nonInsurance().forEach(function(p){
    var bp=Number((el('rb_'+p.bucket)||{}).value)||0;var wp=Number((el('rw_'+p.ticker)||{}).value)||0;
    var ideal=(totNI+add)*(bp/100)*(wp/100);var delta=ideal-valuePHP(p);
    var tc=el('rbt_'+p.ticker);if(tc)tc.textContent=peso(ideal);
    var ac=el('rba_'+p.ticker);if(ac){ac.textContent=delta>0?('Buy '+peso(delta)):peso(delta);ac.className=delta>0?'buy':'';}
  });
}

function renderProjector(){
 var p=S.profile;function sv(id,v){var e=el(id);if(e&&!e.value)e.value=v;}
 sv('pjAge',p.currentAge);sv('pjRetire',p.retireAge);sv('pjMonthly',p.monthlyContribution);sv('pjStep',(p.contribStepUp*100).toFixed(1));sv('pjReturn',(realReturn()*100).toFixed(2));sv('pjSpend',p.annualSpending);sv('pjPort',Math.round(totals().cv));
}
function computeProjector(){
 var age=Number((el('pjAge')||{}).value)||31;var ret=Number((el('pjRetire')||{}).value)||56;var monthly=Number((el('pjMonthly')||{}).value)||0;var step=(Number((el('pjStep')||{}).value)||0)/100;var r=(Number((el('pjReturn')||{}).value)||6)/100;var spend=Number((el('pjSpend')||{}).value)||0;var mult=Number((el('pjMult')||{}).value)||30;var v=Number((el('pjPort')||{}).value)||0;
 var FIRE=spend*mult;var target=Math.ceil(FIRE/Math.pow(1+r,ret-age)/500000)*500000;var coastAge=null;var c=monthly*12;
 for(var a=age;a<ret;a++){var grown=v*Math.pow(1+r,ret-a);if(grown>=FIRE&&coastAge===null)coastAge=a;v=v*(1+r)+c;c*=(1+step);}
 if(v>=FIRE&&coastAge===null)coastAge=ret;
 setTxt('pjResult','');var e=el('pjResult');if(e)e.innerHTML='FIRE number: <b>'+peso(FIRE)+'</b><br>Coast target today (\u2191500k): <b>'+peso(target)+'</b><br>Coast FIRE reached at age: <b>'+(coastAge||'>'+ret)+'</b><br>Projected value at age '+ret+': <b>'+peso(v)+'</b>';
}

/* ---------- data & settings ---------- */
function renderData(){ renderProfileForm(); renderPosCards(); renderSnapTable(); }
function setTargetFromExpense(id){
  var v=Math.round((Number(S.profile.annualSpending)||0)/12);var e=el(id);if(e){e.value=v;if(id==='divTarget'){try{renderDividend();}catch(_){}}}
  toast('Target set to annual expense \u00f7 12 = '+peso(v)+'/mo');
}
function renderProfileForm(){
  var p=S.profile;function sv(id,v){var e=el(id);if(e)e.value=v;}
  sv('pfAge',p.currentAge);sv('pfRetire',p.retireAge);sv('pfSpend',p.annualSpending);sv('pfMonthly',p.monthlyContribution);
  sv('pfStep',(p.contribStepUp*100).toFixed(1));sv('pfTargetIncome',p.targetMonthlyIncome);sv('pfNetYield',(p.defaultNetYield*100).toFixed(1));
  sv('pfDivTax',(p.domesticDivTax*100).toFixed(1));sv('pfFx',p.fxRate);sv('pfMult',p.withdrawalMultiplier);
  var rm=el('pfReturnMode');if(rm)rm.value=p.realReturnMode;sv('pfReturnManual',(p.realReturnManual*100).toFixed(2));
  sv('pfRetGrowth',(p.bucketReturns.Growth*100).toFixed(1));sv('pfRetIncome',(p.bucketReturns.Income*100).toFixed(1));sv('pfRetStability',(p.bucketReturns.Stability*100).toFixed(1));
  var mp=el('pfMP2');if(mp)mp.checked=!!p.includeMP2Income;
  var rm2=el('pfReturnMode');if(rm2)rm2.onchange=syncReturnMode;syncReturnMode();
}
function syncReturnMode(){
  var mode=(el('pfReturnMode')||{}).value;var auto=(mode==='auto');
  var man=el('pfReturnManual');if(man)man.disabled=auto;
  ['pfRetGrowth','pfRetIncome','pfRetStability'].forEach(function(id){var e=el(id);if(e)e.disabled=!auto;});
}
function saveProfile(){
 var p=S.profile;function n(id){return Number((el(id)||{}).value);}
 p.currentAge=n('pfAge');p.retireAge=n('pfRetire');p.annualSpending=n('pfSpend');p.monthlyContribution=n('pfMonthly');
 p.contribStepUp=n('pfStep')/100;p.targetMonthlyIncome=n('pfTargetIncome');p.defaultNetYield=n('pfNetYield')/100;
 p.domesticDivTax=n('pfDivTax')/100;var nf=n('pfFx');if(nf!==p.fxRate)p.fxLu=todayISO();p.fxRate=nf;p.withdrawalMultiplier=n('pfMult');
 p.realReturnMode=(el('pfReturnMode')||{}).value;p.realReturnManual=n('pfReturnManual')/100;
 p.bucketReturns={Growth:n('pfRetGrowth')/100,Income:n('pfRetIncome')/100,Stability:n('pfRetStability')/100};
 p.includeMP2Income=!!(el('pfMP2')||{}).checked;save();renderAll();toast('Profile saved \u2713');
}
function renderPosCards(){
  var box=el('posCards');if(!box)return;var buckets=['Growth','Income','Stability','Insurance'];var curs=['PHP','USD'];
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
      '<div class="pf"><label>Invested (\u20b1 cost basis)</label>'+inp('invested',p.invested,'number')+'</div>'+
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
 var g=function(id){return (el(id)||{}).value;};
 var tk=g('apTicker');if(!tk){toast('Ticker required');return;}
 S.positions.push({ticker:tk,name:g('apName')||tk,bucket:g('apBucket'),currency:g('apCur'),units:Number(g('apUnits'))||0,currentPrice:Number(g('apPrice'))||0,div:Number(g('apDiv'))||0,divTaxOverride:(g('apTax')===''?null:Number(g('apTax'))),invested:Number(g('apInvested'))||0,isIlliquid:!!(el('apIlliq')||{}).checked,lu:{currentPrice:todayISO(),div:todayISO()}});
 save();renderAll();toast('Added '+tk+' \u2713');
}
function renderSnapTable(){
 var tb=el('snapTable');if(!tb)return;
 tb.innerHTML=S.snapshots.map(function(s,i){return '<tr><td>'+s.date+'</td><td>'+peso(s.invested)+'</td><td>'+peso(s.marketValue)+'</td><td><button class="btn ghost" style="padding:2px 8px" onclick="delSnap('+i+')">&times;</button></td></tr>';}).join('');
}
function saveSnapshot(){var T=totals();S.snapshots.push({date:todayISO(),invested:Math.round(T.ti),marketValue:Math.round(T.cv)});save();renderAll();toast('Snapshot saved \u2713');}
function clearSnapshots(){if(confirm('Remove ALL snapshots (including seed data)?')){S.snapshots=[];save();renderAll();}}
function delLastSnapshot(){S.snapshots.pop();save();renderAll();}
function delSnap(i){S.snapshots.splice(i,1);save();renderAll();}

function exportJSON(){
 try{var txt=JSON.stringify(S,null,2);var blob=new Blob([txt],{type:'application/json'});var url=URL.createObjectURL(blob);var a=document.createElement('a');a.href=url;a.download='portfolio_'+todayISO()+'.json';document.body.appendChild(a);a.click();a.remove();URL.revokeObjectURL(url);}catch(e){console.error(e);alert('Export failed: '+e.message);}
}
function importJSON(file){
 var r=new FileReader();
 r.onload=function(){try{var d=JSON.parse(r.result);if(!d||!d.profile||!Array.isArray(d.positions))throw new Error('missing profile/positions');S=d;S.positions.forEach(function(p){if(!p.lu)p.lu={currentPrice:todayISO(),div:todayISO()};});save();renderAll();alert('Import successful \u2713');}catch(e){console.error(e);alert('Invalid JSON file: '+e.message);}};
 r.readAsText(file);
}

/* ---------- init ---------- */
window.addEventListener('DOMContentLoaded',function(){
 load();
 document.querySelectorAll('.navbtn').forEach(function(b){b.addEventListener('click',function(){showTab(b.dataset.tab);});});
 document.querySelectorAll('.toolbtn').forEach(function(b){b.addEventListener('click',function(){showTool(b.dataset.tool);});});
 var bb=el('bellBtn');if(bb)bb.addEventListener('click',function(){var p=el('bellPanel');if(p)p.classList.toggle('open');});
 showTab(S.ui.tab||'dashboard');
 if(S.ui.tool)showTool(S.ui.tool);
});

/* ---------- window exposure ---------- */
window.showTab=showTab;window.showTool=showTool;window.exportJSON=exportJSON;window.importJSON=importJSON;
window.saveProfile=saveProfile;window.addPos=addPos;window.updatePos=updatePos;window.delPos=delPos;
window.saveSnapshot=saveSnapshot;window.clearSnapshots=clearSnapshots;window.delLastSnapshot=delLastSnapshot;window.delSnap=delSnap;
window.computeAlloc=computeAlloc;window.fillAlloc=fillAlloc;window.addMilestone=addMilestone;window.delMilestone=delMilestone;window.toggleManual=toggleManual;
window.computeRebalance=computeRebalance;window.computeProjector=computeProjector;window.capitalToAdd=capitalToAdd;
window.setTargetFromExpense=setTargetFromExpense;window.syncReturnMode=syncReturnMode;
