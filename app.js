'use strict';
const CATALOGUE=[{id:'webAudit',name:'Website Audit',desc:'Detailed site audit with ranked recommendations',type:'web',monthly:false,min:300,max:500,defaultPrice:400,costPct:0.12,tag:'svc-web'},{id:'webBuild',name:'Website Fix / Rebuild',desc:'Full design, development and launch',type:'web',monthly:false,min:1000,max:3500,defaultPrice:2000,costPct:0.15,tag:'svc-web'},{id:'mktStart',name:'Marketing — Starter',desc:'3 platforms, 12 posts/mo social media management',type:'mkt',monthly:true,min:500,max:800,defaultPrice:650,costPct:0.18,tag:'svc-mkt'},{id:'mktGrowth',name:'Marketing — Growth',desc:'Starter + SEO content + email campaigns',type:'mkt',monthly:true,min:1000,max:1500,defaultPrice:1200,costPct:0.20,tag:'svc-mkt'},{id:'mktPro',name:'Marketing — Pro',desc:'Growth + Google/Meta ads + monthly reporting',type:'mkt',monthly:true,min:1500,max:2500,defaultPrice:2000,costPct:0.22,tag:'svc-mkt'},{id:'brandId',name:'Brand Identity & Design',desc:'Logo, colors, fonts, full brand kit',type:'web',monthly:false,min:800,max:2500,defaultPrice:1500,costPct:0.12,tag:'svc-web'},{id:'seoAudit',name:'SEO Audit & Strategy',desc:'Keyword research and content roadmap',type:'mkt',monthly:false,min:500,max:1500,defaultPrice:1000,costPct:0.10,tag:'svc-mkt'},{id:'paidAds',name:'Paid Ads Setup',desc:'Google/Meta campaign build and launch',type:'mkt',monthly:false,min:500,max:2000,defaultPrice:1200,costPct:0.12,tag:'svc-mkt'},{id:'emailMkt',name:'Email Marketing Setup',desc:'List setup, welcome sequence, templates',type:'mkt',monthly:false,min:400,max:1200,defaultPrice:800,costPct:0.10,tag:'svc-mkt'},{id:'aiAudit',name:'AI Opportunity Audit',desc:'1-week workflow mapping + ROI report (credited toward build)',type:'ai',monthly:false,min:1500,max:1500,defaultPrice:1500,costPct:0.07,tag:'svc-ai'},{id:'aiBuild',name:'Done-For-You AI Build',desc:'Custom automation build + internal assistant',type:'ai',monthly:false,min:4000,max:9000,defaultPrice:6000,costPct:0.14,tag:'svc-ai'},{id:'aiReceptionist',name:'AI Receptionist',desc:'24/7 call & SMS handling, calendar booking',type:'ai',monthly:false,min:3000,max:6000,defaultPrice:4000,costPct:0.16,tag:'svc-ai'},{id:'leadResponder',name:'Instant Lead Responder',desc:'60-second lead qualification and booking',type:'ai',monthly:false,min:2500,max:5000,defaultPrice:3500,costPct:0.14,tag:'svc-ai'},{id:'reviewBot',name:'Review & Referral Autopilot',desc:'Auto-triggers review requests after job completion',type:'ai',monthly:false,min:1500,max:3500,defaultPrice:2500,costPct:0.12,tag:'svc-ai'},{id:'adminBot',name:'Admin & Paperwork Handler',desc:'CRM population, invoice chasing, document handling',type:'ai',monthly:false,min:2000,max:5000,defaultPrice:3000,costPct:0.14,tag:'svc-ai'},{id:'care',name:'AI Care Plan',desc:'Monthly monitoring, optimization, 1 new automation/quarter',type:'care',monthly:true,min:500,max:2500,defaultPrice:1200,costPct:0.12,tag:'svc-care'}];
const MARGIN_DATA=[{name:'Website Audit',pay:'$300–$500',cost:'$35–$60',margin:88},{name:'Website Rebuild',pay:'$1,000–$3,500',cost:'$150–$525',margin:83},{name:'Marketing Starter',pay:'$500–$800/mo',cost:'$90–$145/mo',margin:82},{name:'Marketing Growth',pay:'$1,000–$1,500/mo',cost:'$200–$300/mo',margin:80},{name:'Marketing Pro',pay:'$1,500–$2,500/mo',cost:'$330–$550/mo',margin:78},{name:'Brand Identity',pay:'$800–$2,500',cost:'$100–$300',margin:88},{name:'SEO Audit',pay:'$500–$1,500',cost:'$50–$150',margin:90},{name:'AI Opportunity Audit',pay:'$1,500',cost:'$105',margin:93},{name:'AI Build',pay:'$4,000–$9,000',cost:'$560–$1,260',margin:86},{name:'AI Receptionist',pay:'$3,000–$6,000',cost:'$480–$960',margin:84},{name:'Lead Responder',pay:'$2,500–$5,000',cost:'$350–$700',margin:86},{name:'Review Autopilot',pay:'$1,500–$3,500',cost:'$180–$420',margin:88},{name:'Admin Handler',pay:'$2,000–$5,000',cost:'$280–$700',margin:86},{name:'AI Care Plan',pay:'$500–$2,500/mo',cost:'$60–$300/mo',margin:88}];
const TYPE_COLORS={web:'#e07aaa',mkt:'#a99ef5',ai:'#00d4aa',care:'#f5a623'};
const BORDER_COLORS={web:'#D4537E',mkt:'#7F77DD',ai:'#00d4aa',care:'#f5a623'};
const OVERHEAD=107;
let clients=[],editingId=null,charts={},nextId=1;
const fmt=n=>'$'+Math.round(n).toLocaleString('en-US');
const fmtPct=n=>Math.round(n*10)/10+'%';
const $=id=>document.getElementById(id);
const set=(id,v)=>{const e=$(id);if(e)e.textContent=v;};
function calcFed(t,married){const b=married?[[23200,.10],[94300,.12],[201050,.22],[383900,.24],[487450,.32],[731200,.35],[Infinity,.37]]:[[11600,.10],[47150,.12],[100525,.22],[191950,.24],[243725,.32],[609350,.35],[Infinity,.37]];let tax=0,prev=0;for(const[lim,rate]of b){if(t<=prev)break;tax+=(Math.min(t,lim)-prev)*rate;prev=lim;if(t<=lim)break;}return Math.max(0,tax);}
function calcTax(profit,married,stateRate){const se=profit*0.153,seDed=se*0.5,taxable=Math.max(0,profit-seDed),fed=calcFed(taxable,married),state=taxable*stateRate,total=se+fed+state;return{se,seDed,fed,state,total,net:profit-total,eff:profit>0?total/profit*100:0};}
function getTax(){return{married:$('txStatus')?.value==='married',rate:parseFloat($('txState')?.value||'0.0549')};}

function buildGrid(existing={}){
  const grid=$('servicesGrid');grid.innerHTML='';
  CATALOGUE.forEach(s=>{
    const ex=existing[s.id],sel=!!ex,price=ex?ex.price:s.defaultPrice;
    const row=document.createElement('div');row.className='svc-row'+(sel?' selected':'');row.dataset.svcId=s.id;
    const freq=s.monthly?'<span class="svc-freq svc-r">monthly</span>':'<span class="svc-freq svc-ot">one-time</span>';
    row.innerHTML=`<div class="svc-row-top"><div class="svc-checkbox${sel?' checked':''}" data-check="${s.id}"></div><div class="svc-info"><div class="svc-sname">${s.name} ${freq}</div><div class="svc-sdesc">${s.desc} · <span style="color:var(--txt3)">$${s.min.toLocaleString()}–$${s.max.toLocaleString()}</span></div></div></div><div class="svc-price-wrap${sel?' show':''}" id="pw-${s.id}"><span class="svc-price-label">Set price:</span><input type="number" class="svc-price-input" id="sp-${s.id}" value="${price}" min="${s.min}" max="${s.max*2}" step="50"><span class="svc-price-range">Typical: ${fmt(s.min)}–${fmt(s.max)}</span></div>`;
    row.querySelector('[data-check]').addEventListener('click',()=>{const c=row.querySelector('.svc-checkbox'),w=$('pw-'+s.id),on=!c.classList.contains('checked');c.classList.toggle('checked',on);row.classList.toggle('selected',on);w.classList.toggle('show',on);updateTotal();});
    row.querySelector('.svc-price-input')?.addEventListener('input',updateTotal);
    grid.appendChild(row);
  });updateTotal();
}

function updateTotal(){let t=0;CATALOGUE.forEach(s=>{if(document.querySelector(`[data-check="${s.id}"].checked`)){const p=$('sp-'+s.id);t+=p?parseFloat(p.value)||0:0;}});set('modalTotal',fmt(t));}

function openModal(id=null){
  editingId=id;const ex=id?clients.find(c=>c.id===id):null;
  $('modalTitle').textContent=ex?'Edit client':'Add client';
  $('clientNameInput').value=ex?ex.name:'';
  $('clientTypeInput').value=ex?ex.bizType:'Apartment Complex';
  $('clientOwnerInput').value=ex?ex.owner:'Kevin';
  buildGrid(ex?ex.servicesMap:{});
  $('modalOverlay').classList.add('open');$('clientNameInput').focus();
}
function closeModal(){$('modalOverlay').classList.remove('open');editingId=null;}

function saveClient(){
  const name=$('clientNameInput').value.trim();
  if(!name){$('clientNameInput').style.borderColor='var(--red)';$('clientNameInput').focus();return;}
  $('clientNameInput').style.borderColor='';
  const servicesMap={},list=[];
  CATALOGUE.forEach(s=>{
    if(document.querySelector(`[data-check="${s.id}"].checked`)){
      const price=parseFloat($('sp-'+s.id)?.value||s.defaultPrice);
      const cost=Math.round(price*s.costPct);
      servicesMap[s.id]={...s,price,cost};list.push({...s,price,cost});
    }
  });
  if(!list.length){alert('Please select at least one service.');return;}
  const rev=list.reduce((a,b)=>a+b.price,0),cost=list.reduce((a,b)=>a+b.cost,0);
  const hasR=list.some(s=>s.monthly);
  const pt=list.find(s=>s.type==='care')?.type||list.find(s=>s.type==='ai')?.type||list.find(s=>s.type==='mkt')?.type||'web';
  const data={id:editingId||nextId++,name,bizType:$('clientTypeInput').value,owner:$('clientOwnerInput').value,servicesMap,servicesList:list,rev,cost,profit:rev-cost,hasRecurring:hasR,primaryType:pt};
  if(editingId){const i=clients.findIndex(c=>c.id===editingId);if(i!==-1)clients[i]=data;}
  else clients.push(data);
  closeModal();renderAll();
}

function renderClientList(){
  const list=$('clientList'),empty=$('emptyState');list.innerHTML='';
  if(!clients.length){empty.classList.add('show');return;}empty.classList.remove('show');
  clients.forEach(c=>{
    const el=document.createElement('div');el.className='client-card';el.style.borderLeftColor=BORDER_COLORS[c.primaryType];
    const badge=c.hasRecurring?'<span class="svc-tag svc-r">recurring</span>':'<span class="svc-tag svc-ot">one-time</span>';
    el.innerHTML=`<div class="cc-top"><div class="cc-left"><span class="cc-name">${c.name} ${badge}</span><span class="cc-meta">${c.bizType} · ${c.owner}</span></div><div class="cc-right"><span class="cc-rev">${fmt(c.rev)}</span><div class="cc-actions"><button class="cc-edit" title="Edit">✎</button><button class="cc-del" title="Remove">✕</button></div></div></div><div class="cc-services">${c.servicesList.map(s=>`<span class="svc-tag ${s.tag}">${s.name} ${fmt(s.price)}</span>`).join('')}<span class="svc-tag svc-cost">cost: ${fmt(c.cost)}</span></div>`;
    el.querySelector('.cc-edit').addEventListener('click',()=>openModal(c.id));
    el.querySelector('.cc-del').addEventListener('click',()=>{clients=clients.filter(x=>x.id!==c.id);renderAll();});
    list.appendChild(el);
  });
}

function renderSnapshot(){
  const gross=clients.reduce((a,b)=>a+b.rev,0);
  const costs=clients.reduce((a,b)=>a+b.cost,0)+OVERHEAD;
  const profit=gross-costs;
  const{married,rate}=getTax();
  const tax=calcTax(profit*12,married,rate);
  const mNet=tax.net/12,pf=mNet/2,margin=gross>0?profit/gross*100:0;
  set('sGross',fmt(gross));set('sCosts','−'+fmt(costs));set('sProfit',fmt(profit));
  set('sTax','−'+fmt(tax.total/12));set('sNet',fmt(mNet));
  set('fKevin',fmt(pf));set('fNicholas',fmt(pf));
  set('hGross',fmt(gross));set('hTake',fmt(pf));set('hAnnual',fmt(tax.net/2));set('hMargin',fmtPct(margin));
  const cs=$('clientSummary');
  if(cs)cs.innerHTML=clients.length?clients.map(c=>`<div class="cs-row"><span class="cs-name">${c.name}</span><span class="cs-amt">${fmt(c.rev)}</span></div>`).join(''):'<div style="font-size:12px;color:var(--txt3);padding:8px 0;">No clients added yet.</div>';
  renderTypeChart(gross);
}

function renderTypeChart(gross){
  const totals={web:0,mkt:0,ai:0,care:0};
  clients.forEach(c=>c.servicesList.forEach(s=>{totals[s.type]=(totals[s.type]||0)+s.price;}));
  const labels=['Web services','Marketing','AI builds','Care plans'],data=[totals.web,totals.mkt,totals.ai,totals.care],colors=[TYPE_COLORS.web,TYPE_COLORS.mkt,TYPE_COLORS.ai,TYPE_COLORS.care];
  const ctx=$('typeChart');if(!ctx)return;if(charts.type)charts.type.destroy();
  charts.type=new Chart(ctx,{type:'doughnut',data:{labels,datasets:[{data,backgroundColor:colors,borderWidth:0,hoverOffset:4}]},options:{responsive:true,maintainAspectRatio:false,cutout:'68%',plugins:{legend:{display:false},tooltip:{callbacks:{label:c=>` ${c.label}: ${fmt(c.raw)} (${gross>0?Math.round(c.raw/gross*100):0}%)`}}}}});
  const leg=$('typeLegend');if(leg)leg.innerHTML=labels.map((l,i)=>data[i]>0?`<div class="legend-item"><div class="legend-dot" style="background:${colors[i]}"></div>${l}: ${fmt(data[i])}</div>`:'').join('');
}

function renderRecurring(){
  const care=+($('rCare')?.value||0),cAmt=+($('rCareAmt')?.value||0),mkt=+($('rMkt')?.value||0),mAmt=+($('rMktAmt')?.value||0),web=+($('rWeb')?.value||0),wAmt=+($('rWebAmt')?.value||0);
  set('rCareVal',care);set('rCareAmtVal',fmt(cAmt));set('rMktVal',mkt);set('rMktAmtVal',fmt(mAmt));set('rWebVal',web);set('rWebAmtVal',fmt(wAmt));
  const cRev=care*cAmt,cCost=Math.round(cRev*0.12),mRev=mkt*mAmt,mCost=Math.round(mRev*0.20),wRev=web*wAmt,wCost=Math.round(wRev*0.10);
  const mrr=cRev+mRev+wRev,arr=mrr*12,netMo=(cRev-cCost)+(mRev-mCost)+(wRev-wCost);
  const{married,rate}=getTax(),tax=calcTax(netMo*12,married,rate),eachMo=tax.net/24,eachYr=tax.net/2;
  set('rMRR',fmt(mrr));set('rARR',fmt(arr));set('rVal',fmt(arr*3));
  set('rCareRev',fmt(cRev));set('rCareCost','−'+fmt(cCost));set('rMktRev',fmt(mRev));set('rMktCost','−'+fmt(mCost));set('rWebRev',fmt(wRev));set('rNetMo',fmt(netMo));set('rEachMo',fmt(eachMo));set('rEachYr',fmt(eachYr));
  set('hMRR',fmt(mrr));
  const ins=$('rInsight');if(ins){if(!mrr)ins.textContent='Add recurring clients using the sliders above.';else if(mrr<5000)ins.textContent=`${fmt(mrr)}/mo MRR gives you a ${fmt(eachMo)} monthly floor per founder.`;else if(mrr<10000)ins.textContent=`Strong at ${fmt(mrr)}/mo — ${Math.round(mrr/10000*100)}% to $10k MRR. At $10k consider your first hire.`;else ins.textContent=`${fmt(mrr)}/mo MRR = ${fmt(eachYr)}/yr each founder from recurring alone. Consider hiring at 5+ care plan clients.`;}
  const ctx=$('recurChart');if(!ctx)return;if(charts.recur)charts.recur.destroy();
  const mo=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  charts.recur=new Chart(ctx,{type:'line',data:{labels:mo,datasets:[{label:'Care plans',data:mo.map((_,i)=>Math.round(care*cAmt*(i+1))),borderColor:TYPE_COLORS.care,backgroundColor:'rgba(245,166,35,.07)',fill:true,tension:.3,pointRadius:3,borderWidth:2},{label:'Marketing',data:mo.map((_,i)=>Math.round(mkt*mAmt*(i+1))),borderColor:TYPE_COLORS.mkt,backgroundColor:'rgba(169,158,245,.07)',fill:true,tension:.3,pointRadius:3,borderWidth:2,borderDash:[5,3]},{label:'Web retainer',data:mo.map((_,i)=>Math.round(web*wAmt*(i+1))),borderColor:TYPE_COLORS.web,backgroundColor:'rgba(224,122,170,.07)',fill:true,tension:.3,pointRadius:3,borderWidth:2,borderDash:[2,2]}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false},tooltip:{callbacks:{label:c=>` ${c.dataset.label}: ${fmt(c.raw)}`}}},scales:{x:{grid:{color:'rgba(255,255,255,.04)'},ticks:{font:{size:10},color:'#5a6478'}},y:{grid:{color:'rgba(255,255,255,.04)'},ticks:{font:{size:10},color:'#5a6478',callback:n=>'$'+(n>=1000?(n/1000).toFixed(0)+'k':n)}}}}});
}

function renderTaxes(){
  const gross=parseFloat($('txGrossIn')?.value||0),exp=parseFloat($('txExpIn')?.value||0);
  const{married,rate}=getTax(),net=Math.max(0,gross-exp),se=net*0.153,seDed=se*0.5,tax=Math.max(0,net-seDed),fed=calcFed(tax,married),state=tax*rate,total=se+fed+state,afterTax=net-total,eff=net>0?total/net*100:0;
  set('txGross',fmt(gross));set('txDeduct','−'+fmt(exp));set('txNetProfit',fmt(net));set('txSE','−'+fmt(se));set('txSEDed','+'+fmt(seDed));set('txFed','−'+fmt(fed));set('txStateAmt','−'+fmt(state));set('txTotal','−'+fmt(total));set('txRate',fmtPct(eff));set('txNet',fmt(afterTax));set('txKevin',fmt(afterTax/2));set('txNicholas',fmt(afterTax/2));
  ['q1','q2','q3','q4'].forEach(id=>set(id,fmt(total/4)));
}

function renderAnnual(){
  const ot=+($('aOT')?.value||0),otA=+($('aOTAmt')?.value||0),nr=parseFloat($('aNewR')?.value||0),rA=+($('aRamt')?.value||0),churn=+($('aChurn')?.value||0)/100,costP=+($('aCostPct')?.value||14)/100;
  set('aOTVal',ot);set('aOTAmtVal',fmt(otA));set('aNewRVal',nr);set('aRamtVal',fmt(rA));set('aChurnVal',Math.round(churn*100)+'%');set('aCostPctVal',Math.round(costP*100)+'%');
  let rc=0,tOT=0,tR=0;const md=[];
  for(let i=0;i<12;i++){rc=Math.max(0,rc-Math.round(rc*churn)+nr);const o=ot*otA,r=rc*rA,g=o+r,c=g*costP+OVERHEAD;md.push({gross:g,costs:c,profit:g-c,ot:o,rec:r,rc});tOT+=o;tR+=r;}
  const aG=tOT+tR,aC=md.reduce((a,b)=>a+b.costs,0),aP=aG-aC;
  const{married,rate}=getTax(),tax=calcTax(aP,married,rate);
  set('annGross',fmt(aG));set('annMRR',fmt(md[11].rc*rA));set('annEach',fmt(tax.net/2));set('annClients',Math.round(md[11].rc));
  set('annOT',fmt(tOT));set('annR',fmt(tR));set('annTotal',fmt(aG));set('annCosts','−'+fmt(aC));set('annTax','−'+fmt(tax.total));set('annNet',fmt(tax.net));
  const ctx=$('annChart');if(!ctx)return;if(charts.ann)charts.ann.destroy();
  const mo=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  charts.ann=new Chart(ctx,{type:'bar',data:{labels:mo,datasets:[{label:'One-time',data:md.map(d=>Math.round(d.ot)),backgroundColor:'rgba(74,144,226,.7)',stack:'s',borderRadius:3},{label:'Recurring',data:md.map(d=>Math.round(d.rec)),backgroundColor:'rgba(0,212,170,.7)',stack:'s',borderRadius:3},{label:'Net profit',data:md.map(d=>Math.round(d.profit)),type:'line',borderColor:TYPE_COLORS.ai,backgroundColor:'transparent',tension:.3,fill:false,pointRadius:3,borderWidth:2}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false},tooltip:{callbacks:{label:c=>` ${c.dataset.label}: ${fmt(c.raw)}`}}},scales:{x:{stacked:true,grid:{display:false},ticks:{font:{size:10},color:'#5a6478'}},y:{stacked:true,grid:{color:'rgba(255,255,255,.04)'},ticks:{font:{size:10},color:'#5a6478',callback:n=>'$'+(n>=1000?(n/1000).toFixed(0)+'k':n)}}}}});
}

function renderMargins(){const b=$('marginBody');if(!b)return;b.innerHTML=MARGIN_DATA.map(r=>`<tr><td class="svc-nm">${r.name}</td><td>${r.pay}</td><td style="color:var(--red)">${r.cost}</td><td><span class="mbadge">${r.margin}%</span></td></tr>`).join('');}

const SCENARIOS=[{key:'conservative',cls:'conservative',label:'Conservative',title:'Slow & steady',desc:'1–2 projects/mo · small builds · minimal retainers',otPerMo:1,otAmt:1500,newR:0.5,rAmt:800,churn:.08,cost:.16},{key:'realistic',cls:'realistic',label:'Realistic',title:'On track',desc:'2–3 projects/mo · mix of builds and retainers',otPerMo:2,otAmt:3500,newR:1,rAmt:1200,churn:.05,cost:.14},{key:'optimistic',cls:'optimistic',label:'Optimistic',title:'Crushing it',desc:'4+ projects/mo · large builds · strong recurring',otPerMo:4,otAmt:6000,newR:2,rAmt:1800,churn:.03,cost:.12}];
function calcScen(sc){let rc=0;const mo=[];let tOT=0,tR=0;for(let i=0;i<12;i++){rc=Math.max(0,rc-Math.round(rc*sc.churn)+sc.newR);const o=sc.otPerMo*sc.otAmt,r=rc*sc.rAmt,g=o+r;mo.push({gross:g,profit:g*(1-sc.cost)-OVERHEAD,rc});tOT+=o;tR+=r;}const aG=tOT+tR,aP=mo.reduce((a,b)=>a+b.profit,0),tax=calcTax(aP,false,0.0549);return{mo,annGross:aG,annNet:tax.net,each:tax.net/2,mrr:mo[11].rc*sc.rAmt};}
function renderScenarios(){
  const cont=$('scenarioCards');if(!cont)return;cont.innerHTML='';
  const res={};const scColors={conservative:'#4a90e2',realistic:'#00d4aa',optimistic:'#f5a623'};
  SCENARIOS.forEach(sc=>{res[sc.key]=calcScen(sc);const r=res[sc.key];const card=document.createElement('div');card.className=`sc-card ${sc.cls}`;card.innerHTML=`<div class="sc-badge">${sc.label}</div><div class="sc-title">${sc.title}</div><div class="sc-desc">${sc.desc}</div><div class="sc-stat"><span class="sc-stat-label">Annual gross</span><span class="sc-stat-val">${fmt(r.annGross)}</span></div><div class="sc-stat"><span class="sc-stat-label">Year-end MRR</span><span class="sc-stat-val">${fmt(r.mrr)}</span></div><div class="sc-stat"><span class="sc-stat-label">Annual net each</span><span class="sc-stat-val">${fmt(r.each)}</span></div><div class="sc-stat"><span class="sc-stat-label">Monthly take-home</span><span class="sc-stat-val">${fmt(r.each/12)}</span></div>`;cont.appendChild(card);});
  const ctx=$('scenChart');if(!ctx)return;if(charts.scen)charts.scen.destroy();
  const mo=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  charts.scen=new Chart(ctx,{type:'line',data:{labels:mo,datasets:SCENARIOS.map(sc=>({label:sc.label,data:res[sc.key].mo.map(m=>Math.round(m.gross)),borderColor:scColors[sc.key],backgroundColor:scColors[sc.key]+'10',tension:.3,fill:true,pointRadius:3,borderWidth:2,borderDash:sc.key==='conservative'?[6,3]:sc.key==='optimistic'?[2,2]:[]}) )},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false},tooltip:{callbacks:{label:c=>` ${c.dataset.label}: ${fmt(c.raw)}`}}},scales:{x:{grid:{color:'rgba(255,255,255,.04)'},ticks:{font:{size:10},color:'#5a6478'}},y:{grid:{color:'rgba(255,255,255,.04)'},ticks:{font:{size:10},color:'#5a6478',callback:n=>'$'+(n>=1000?(n/1000).toFixed(0)+'k':n)}}}}});
  const leg=$('scenLegend');if(leg)leg.innerHTML=SCENARIOS.map(sc=>`<div class="legend-item"><div class="legend-dot" style="background:${scColors[sc.key]}"></div>${sc.label}: ${fmt(res[sc.key].annGross)}/yr · ${fmt(res[sc.key].each)}/founder</div>`).join('');
}

function renderAll(){renderClientList();renderSnapshot();}

document.addEventListener('DOMContentLoaded',()=>{
  const saved=localStorage.getItem('obaroTheme')||'dark';
  const btn=$('themeBtn');
  if(saved==='light'){document.documentElement.setAttribute('data-theme','light');if(btn)btn.textContent='☀';}
  btn?.addEventListener('click',()=>{const light=document.documentElement.getAttribute('data-theme')==='light';if(light){document.documentElement.removeAttribute('data-theme');btn.textContent='☽';localStorage.setItem('obaroTheme','dark');}else{document.documentElement.setAttribute('data-theme','light');btn.textContent='☀';localStorage.setItem('obaroTheme','light');}});

  document.querySelectorAll('.tab').forEach(b=>{b.addEventListener('click',()=>{document.querySelectorAll('.tab').forEach(x=>x.classList.remove('active'));document.querySelectorAll('.tab-panel').forEach(x=>x.classList.remove('active'));b.classList.add('active');$('tab-'+b.dataset.tab)?.classList.add('active');const t=b.dataset.tab;if(t==='recurring')renderRecurring();if(t==='taxes')renderTaxes();if(t==='annual')renderAnnual();if(t==='costs')renderMargins();if(t==='scenarios')renderScenarios();});});

  $('addClientBtn')?.addEventListener('click',()=>openModal());
  $('modalClose')?.addEventListener('click',closeModal);
  $('modalCancel')?.addEventListener('click',closeModal);
  $('modalSave')?.addEventListener('click',saveClient);
  $('modalOverlay')?.addEventListener('click',e=>{if(e.target===$('modalOverlay'))closeModal();});
  document.addEventListener('keydown',e=>{if(e.key==='Escape')closeModal();});

  ['rCare','rCareAmt','rMkt','rMktAmt','rWeb','rWebAmt'].forEach(id=>$(id)?.addEventListener('input',renderRecurring));
  ['txGrossIn','txExpIn','txStatus','txState'].forEach(id=>$(id)?.addEventListener('input',renderTaxes));
  ['aOT','aOTAmt','aNewR','aRamt','aChurn','aCostPct'].forEach(id=>$(id)?.addEventListener('input',renderAnnual));

  renderAll();renderTaxes();renderAnnual();renderRecurring();renderMargins();
  Chart.defaults.color='#5a6478';Chart.defaults.font.family="'DM Mono',monospace";
});