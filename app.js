'use strict';

/* ── Constants ─────────────────────────────────────────────────── */
const CLIENT_NAMES = [
  'Green Valley Apts','Sunrise Complex','Atlas Properties','Riverfront Residences',
  'Oakwood Communities','Metro Living LLC','Summit Realty','Coastal Property Mgmt',
  'Horizon Apartments','Pinnacle Group','Skyline Residences','Harbor View Apts',
  'Brookfield Complex','Westside Living','Crestwood Properties','Lakeside Residences',
  'Elmwood Apts','Grand Metro LLC','Beacon Hill Mgmt','Clearwater Properties'
];

const SERVICES = [
  { id:'webAudit',  name:'Website Audit',   type:'web',  min:300,  max:500,   monthly:false, costPct:0.12, tag:'tag-web',  label:'Web audit' },
  { id:'webBuild',  name:'Website Rebuild', type:'web',  min:1000, max:3500,  monthly:false, costPct:0.15, tag:'tag-web',  label:'Web rebuild' },
  { id:'mktStart',  name:'Mkt Starter',     type:'mkt',  min:500,  max:800,   monthly:true,  costPct:0.18, tag:'tag-mkt',  label:'Mkt starter' },
  { id:'mktGrowth', name:'Mkt Growth',      type:'mkt',  min:1000, max:1500,  monthly:true,  costPct:0.20, tag:'tag-mkt',  label:'Mkt growth' },
  { id:'mktPro',    name:'Mkt Pro',         type:'mkt',  min:1500, max:2500,  monthly:true,  costPct:0.22, tag:'tag-mkt',  label:'Mkt pro' },
  { id:'aiAudit',   name:'AI Audit',        type:'ai',   min:1500, max:1500,  monthly:false, costPct:0.07, tag:'tag-ai',   label:'AI audit' },
  { id:'aiBuild',   name:'AI Build',        type:'ai',   min:4000, max:9000,  monthly:false, costPct:0.14, tag:'tag-ai',   label:'AI build' },
  { id:'care',      name:'AI Care Plan',    type:'care', min:500,  max:2500,  monthly:true,  costPct:0.12, tag:'tag-care', label:'Care plan' },
];

const MARGIN_DATA = [
  { name:'Website Audit',      pay:'$300–$500',        cost:'$35–$60',        margin:88 },
  { name:'Website Rebuild',    pay:'$1,000–$3,500',    cost:'$150–$525',      margin:83 },
  { name:'Marketing Starter',  pay:'$500–$800/mo',     cost:'$90–$145/mo',    margin:82 },
  { name:'Marketing Growth',   pay:'$1,000–$1,500/mo', cost:'$200–$300/mo',   margin:80 },
  { name:'Marketing Pro',      pay:'$1,500–$2,500/mo', cost:'$330–$550/mo',   margin:78 },
  { name:'AI Opportunity Audit',pay:'$1,500',          cost:'$105',           margin:93 },
  { name:'AI Build',           pay:'$4,000–$9,000',    cost:'$560–$1,260',    margin:86 },
  { name:'AI Care Plan',       pay:'$500–$2,500/mo',   cost:'$60–$300/mo',    margin:88 },
];

const TYPE_COLORS = {
  web:  '#e07aaa',
  mkt:  '#a99ef5',
  ai:   '#00d4aa',
  care: '#f5a623',
};

const BORDER_COLORS = {
  web:  '#D4537E',
  mkt:  '#7F77DD',
  ai:   '#00d4aa',
  care: '#f5a623',
};

const STATE_RATES = { GA:0.0549, TX:0, FL:0, NY:0.0685, CA:0.093 };

/* ── State ─────────────────────────────────────────────────────── */
let clients = [];
let charts = {};

/* ── Utils ─────────────────────────────────────────────────────── */
const rand = (a, b) => Math.round(a + Math.random() * (b - a));
const fmt = n => '$' + Math.round(n).toLocaleString('en-US');
const fmtPct = n => Math.round(n) + '%';

function animateValue(el, target) {
  if (!el) return;
  el.textContent = fmt(target);
}

function calcFederalTax(taxable, married) {
  const brackets = married
    ? [[23200,0.10],[94300,0.12],[201050,0.22],[383900,0.24],[487450,0.32],[731200,0.35],[Infinity,0.37]]
    : [[11600,0.10],[47150,0.12],[100525,0.22],[191950,0.24],[243725,0.32],[609350,0.35],[Infinity,0.37]];
  let tax = 0, prev = 0;
  for (const [limit, rate] of brackets) {
    if (taxable <= prev) break;
    tax += Math.min(taxable, limit) * rate - prev * rate;
    prev = limit;
    if (taxable <= limit) break;
  }
  return Math.max(0, tax);
}

function calcAllTaxes(grossProfit, married, stateRate) {
  const se = grossProfit * 0.153;
  const seDeduction = se * 0.5;
  const taxable = Math.max(0, grossProfit - seDeduction);
  const fed = calcFederalTax(taxable, married);
  const state = taxable * stateRate;
  const total = se + fed + state;
  return { se, seDeduction, fed, state, total, net: grossProfit - total };
}

/* ── Client Generation ─────────────────────────────────────────── */
function genServiceMix(complexity) {
  if (complexity < 0.10) return [SERVICES[0]];
  if (complexity < 0.22) return [SERVICES[0], SERVICES[2]];
  if (complexity < 0.35) return [SERVICES[1], SERVICES[2]];
  if (complexity < 0.48) return [SERVICES[1], SERVICES[3]];
  if (complexity < 0.60) return [SERVICES[1], SERVICES[3], SERVICES[4+Math.floor(Math.random()*2)]]; // wrong index fix below
  if (complexity < 0.72) return [SERVICES[1], SERVICES[4], SERVICES[5], SERVICES[6]];
  if (complexity < 0.85) return [SERVICES[1], SERVICES[4], SERVICES[6], SERVICES[7]];
  return [SERVICES[1], SERVICES[4], SERVICES[5], SERVICES[6], SERVICES[7]];
}

function generateClients(count) {
  return Array.from({ length: count }, (_, i) => {
    const mix = genServiceMix(Math.random());
    const items = mix.map(s => {
      const amount = rand(s.min, s.max);
      return { ...s, amount, cost: Math.round(amount * s.costPct) };
    });
    const rev = items.reduce((a, b) => a + b.amount, 0);
    const cost = items.reduce((a, b) => a + b.cost, 0);
    const hasRecurring = items.some(i => i.monthly);
    const primaryType = items.find(x => x.type === 'care')?.type
      || items.find(x => x.type === 'ai')?.type
      || items.find(x => x.type === 'mkt')?.type
      || 'web';
    return {
      id: i,
      name: CLIENT_NAMES[i % CLIENT_NAMES.length],
      items, rev, cost,
      profit: rev - cost,
      hasRecurring, primaryType,
    };
  });
}

/* ── Render Clients Tab ─────────────────────────────────────────── */
function renderClients() {
  const list = document.getElementById('clientList');
  if (!list) return;

  list.innerHTML = '';
  clients.forEach((c, i) => {
    const el = document.createElement('div');
    el.className = 'client-card';
    el.style.borderLeftColor = BORDER_COLORS[c.primaryType];
    const badgeClass = c.hasRecurring ? 'tag-recurring' : 'tag-onetime';
    const badgeLabel = c.hasRecurring ? 'recurring' : 'one-time';
    el.innerHTML = `
      <div class="client-top">
        <span class="client-name">
          ${i + 1}. ${c.name}
          <span class="tag ${badgeClass}" style="margin-left:6px;">${badgeLabel}</span>
        </span>
        <span class="client-revenue">${fmt(c.rev)}</span>
      </div>
      <div class="client-tags">
        ${c.items.map(s => `<span class="tag ${s.tag}">${s.label} ${fmt(s.amount)}</span>`).join('')}
        <span class="tag tag-cost">cost: ${fmt(c.cost)}</span>
      </div>`;
    list.appendChild(el);
  });

  updateMonthlySnapshot();
  updateHeroMetrics();
  renderRevenueTypeChart();
}

function updateMonthlySnapshot() {
  const INTERNAL_OVERHEAD = 107;
  const gross = clients.reduce((a, b) => a + b.rev, 0);
  const deliveryCosts = clients.reduce((a, b) => a + b.cost, 0) + INTERNAL_OVERHEAD;
  const profit = gross - deliveryCosts;
  const married = document.getElementById('taxStatus')?.value === 'married';
  const stateRate = STATE_RATES[document.getElementById('taxState')?.value || 'GA'];
  const annualProfit = profit * 12;
  const taxes = calcAllTaxes(annualProfit, married, stateRate);
  const monthlyNet = taxes.net / 12;
  const perFounder = monthlyNet / 2;

  setText('sGross', fmt(gross));
  setText('sCosts', '−' + fmt(deliveryCosts));
  setText('sProfit', fmt(profit));
  setText('sTax', '−' + fmt(taxes.total / 12));
  setText('sNet', fmt(monthlyNet));
  setText('fKevin', fmt(perFounder));
  setText('fNicholas', fmt(perFounder));
}

/* ── Hero Metrics ──────────────────────────────────────────────── */
function updateHeroMetrics() {
  const INTERNAL_OVERHEAD = 107;
  const gross = clients.reduce((a, b) => a + b.rev, 0);
  const deliveryCosts = clients.reduce((a, b) => a + b.cost, 0) + INTERNAL_OVERHEAD;
  const profit = gross - deliveryCosts;
  const married = document.getElementById('taxStatus')?.value === 'married';
  const stateRate = STATE_RATES[document.getElementById('taxState')?.value || 'GA'];
  const taxes = calcAllTaxes(profit * 12, married, stateRate);
  const monthlyNet = taxes.net / 12;
  const perFounder = monthlyNet / 2;

  const rCare = +v('rCare') || 0;
  const rCareAmt = +v('rCareAmt') || 0;
  const rMkt = +v('rMkt') || 0;
  const rMktAmt = +v('rMktAmt') || 0;
  const rWeb = +v('rWeb') || 0;
  const rWebAmt = +v('rWebAmt') || 0;
  const mrr = rCare * rCareAmt + rMkt * rMktAmt + rWeb * rWebAmt;

  const annualEach = taxes.net / 2;

  animateValue(document.getElementById('hGross'), gross);
  animateValue(document.getElementById('hTake'), perFounder);
  animateValue(document.getElementById('hAnnual'), annualEach);
  animateValue(document.getElementById('hMRR'), mrr);
}

/* ── Revenue Type Chart ────────────────────────────────────────── */
function renderRevenueTypeChart() {
  const totals = { web:0, mkt:0, ai:0, care:0 };
  clients.forEach(c => c.items.forEach(i => { totals[i.type] += i.amount; }));
  const labels = ['Web services','Marketing','AI builds','Care plans'];
  const data = [totals.web, totals.mkt, totals.ai, totals.care];
  const colors = [TYPE_COLORS.web, TYPE_COLORS.mkt, TYPE_COLORS.ai, TYPE_COLORS.care];
  const total = data.reduce((a,b) => a+b, 0);

  const ctx = document.getElementById('revenueTypeChart');
  if (!ctx) return;
  if (charts.revType) charts.revType.destroy();

  charts.revType = new Chart(ctx, {
    type: 'doughnut',
    data: { labels, datasets: [{ data, backgroundColor: colors, borderWidth: 0, hoverOffset: 4 }] },
    options: {
      responsive: true, cutout: '68%',
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: { label: c => ` ${c.label}: ${fmt(c.raw)} (${total > 0 ? Math.round(c.raw/total*100) : 0}%)` } }
      }
    }
  });

  const legend = document.getElementById('revLegend');
  if (legend) {
    legend.innerHTML = labels.map((l, i) => data[i] > 0
      ? `<div class="legend-item"><div class="legend-dot" style="background:${colors[i]}"></div>${l}: ${fmt(data[i])}</div>`
      : ''
    ).join('');
  }
}

/* ── Recurring Tab ──────────────────────────────────────────────── */
function updateRecurring() {
  const care = +v('rCare');
  const careAmt = +v('rCareAmt');
  const mkt = +v('rMkt');
  const mktAmt = +v('rMktAmt');
  const web = +v('rWeb');
  const webAmt = +v('rWebAmt');

  setText('rCareVal', care);
  setText('rCareAmtVal', fmt(careAmt));
  setText('rMktVal', mkt);
  setText('rMktAmtVal', fmt(mktAmt));
  setText('rWebVal', web);
  setText('rWebAmtVal', fmt(webAmt));

  const careRev = care * careAmt;
  const careCost = Math.round(careRev * 0.12);
  const mktRev = mkt * mktAmt;
  const mktCost = Math.round(mktRev * 0.20);
  const webRev = web * webAmt;
  const webCost = Math.round(webRev * 0.10);
  const mrr = careRev + mktRev + webRev;
  const arr = mrr * 12;
  const monthlyProfit = (careRev - careCost) + (mktRev - mktCost) + (webRev - webCost);
  const annualProfit = monthlyProfit * 12;
  const married = document.getElementById('taxStatus')?.value === 'married';
  const stateRate = STATE_RATES[document.getElementById('taxState')?.value || 'GA'];
  const taxes = calcAllTaxes(annualProfit, married, stateRate);
  const annualNet = taxes.net;
  const monthlyNet = annualNet / 12;
  const eachMo = monthlyNet / 2;
  const eachYr = annualNet / 2;
  const perClientYr = (care + mkt + web > 0) ? eachYr / (care + mkt + web) : 0;
  const monthsTo10k = mrr >= 10000 ? 0 : mrr > 0 ? Math.ceil((10000 - mrr) / Math.max(careAmt, mktAmt, webAmt, 1)) : null;

  setText('rMRR', fmt(mrr));
  setText('rARR', fmt(arr));
  setText('rVal', fmt(arr * 3));
  setText('rCareRev', fmt(careRev));
  setText('rCareCost', '−' + fmt(careCost));
  setText('rMktRev', fmt(mktRev));
  setText('rMktCost', '−' + fmt(mktCost));
  setText('rWebRev', fmt(webRev));
  setText('rNetMo', fmt(monthlyProfit));
  setText('rAfterTax', fmt(monthlyNet));
  setText('rEachMo', fmt(eachMo));
  setText('rEachYr', fmt(eachYr));
  setText('rMonthsTo10k', mrr >= 10000 ? '✓ Already there' : monthsTo10k ? monthsTo10k + ' new clients' : '—');
  setText('rPerClient', fmt(perClientYr));

  const insight = document.getElementById('rInsight');
  if (insight) {
    const totalClients = care + mkt + web;
    const careHours = care * 6;
    if (mrr === 0) {
      insight.textContent = 'Add your first recurring client using the sliders above to see your baseline income.';
    } else if (mrr < 5000) {
      insight.textContent = `${fmt(mrr)}/mo MRR gives you a $${Math.round(eachMo).toLocaleString()} monthly floor. Add ${Math.ceil((5000 - mrr) / Math.max(careAmt, mktAmt, 1))} more clients to hit $5k MRR.`;
    } else if (mrr < 10000) {
      insight.textContent = `Strong start at ${fmt(mrr)}/mo MRR. You're ${Math.round((mrr/10000)*100)}% of the way to $10k/mo. At $10k+ MRR, consider your first hire.`;
    } else {
      insight.textContent = `${fmt(mrr)}/mo MRR — that's ${fmt(eachYr)}/yr each founder from recurring revenue alone. Nicholas is handling ~${careHours} hrs/mo of maintenance. Consider hiring a junior AI developer at 5+ care plan clients.`;
    }
  }

  renderRecurringChart(care, careAmt, mkt, mktAmt, web, webAmt);
  updateHeroMetrics();
}

function renderRecurringChart(care, careAmt, mkt, mktAmt, web, webAmt) {
  const ctx = document.getElementById('recurringChart');
  if (!ctx) return;
  if (charts.recurring) charts.recurring.destroy();

  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const careData = months.map((_, i) => Math.round(care * careAmt * (i + 1)));
  const mktData  = months.map((_, i) => Math.round(mkt  * mktAmt  * (i + 1)));
  const webData  = months.map((_, i) => Math.round(web  * webAmt  * (i + 1)));

  charts.recurring = new Chart(ctx, {
    type: 'line',
    data: {
      labels: months,
      datasets: [
        { label: 'Care plans', data: careData, borderColor: TYPE_COLORS.care, backgroundColor: 'rgba(245,166,35,0.07)', fill: true, tension: 0.3, pointRadius: 3, borderWidth: 2, borderDash: [] },
        { label: 'Marketing',  data: mktData,  borderColor: TYPE_COLORS.mkt,  backgroundColor: 'rgba(169,158,245,0.07)', fill: true, tension: 0.3, pointRadius: 3, borderWidth: 2, borderDash: [5,3] },
        { label: 'Web retainer',data: webData, borderColor: TYPE_COLORS.web,  backgroundColor: 'rgba(224,122,170,0.07)', fill: true, tension: 0.3, pointRadius: 3, borderWidth: 2, borderDash: [2,2] },
      ]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false }, tooltip: { callbacks: { label: c => ` ${c.dataset.label}: ${fmt(c.raw)}` } } },
      scales: {
        x: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { font: { size: 10 }, color: '#5a6478' } },
        y: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { font: { size: 10 }, color: '#5a6478', callback: n => '$' + (n >= 1000 ? (n/1000).toFixed(0) + 'k' : n) } }
      }
    }
  });

  const legend = document.getElementById('recurringChart')?.nextElementSibling;
}

/* ── Taxes Tab ──────────────────────────────────────────────────── */
function updateTaxes() {
  const gross = +v('taxIncome') || 0;
  const expenses = +v('taxExpenses') || 0;
  const married = v('taxStatus') === 'married';
  const stateKey = v('taxState') || 'GA';
  const stateRate = STATE_RATES[stateKey];
  const netProfit = Math.max(0, gross - expenses);
  const se = netProfit * 0.153;
  const seDeduction = se * 0.5;
  const taxable = Math.max(0, netProfit - seDeduction);
  const fed = calcFederalTax(taxable, married);
  const state = taxable * stateRate;
  const total = se + fed + state;
  const net = netProfit - total;
  const effectiveRate = netProfit > 0 ? (total / netProfit * 100) : 0;
  const perFounder = net / 2;
  const quarterly = total / 4;

  setText('txGross', fmt(gross));
  setText('txDeduct', '−' + fmt(expenses));
  setText('txNet', fmt(netProfit));
  setText('txSE', '−' + fmt(se));
  setText('txSEDed', '+' + fmt(seDeduction));
  setText('txFed', '−' + fmt(fed));
  setText('txState', '−' + fmt(state));
  setText('txTotal', '−' + fmt(total));
  setText('txRate', fmtPct(effectiveRate));
  setText('txTakeHome', fmt(net));
  setText('txKevin', fmt(perFounder));
  setText('txNicholas', fmt(perFounder));
  ['q1','q2','q3','q4'].forEach(id => setText(id, fmt(quarterly)));
}

/* ── Annual Tab ─────────────────────────────────────────────────── */
function updateAnnual() {
  const otPerMo = +v('aOneTime');
  const otAmt = +v('aOneTimeVal2');
  const newRecurring = +v('aNewRecurring');
  const recurringAmt = +v('aRecurringAmt');
  const churnPct = (+v('aChurn')) / 100;
  const costPct = (+v('aCostPct')) / 100;

  setText('aOneTimeVal', otPerMo);
  setText('aOneTimeVal2Label', fmt(otAmt));
  setText('aNewRecurringVal', newRecurring);
  setText('aRecurringAmtVal', fmt(recurringAmt));
  setText('aChurnVal', Math.round(+v('aChurn')) + '%');
  setText('aCostPctVal', Math.round(+v('aCostPct')) + '%');

  let recurringClients = 0;
  const monthlyData = [];
  let totalOneTime = 0, totalRecurring = 0;

  for (let mo = 0; mo < 12; mo++) {
    const churn = Math.round(recurringClients * churnPct);
    recurringClients = Math.max(0, recurringClients - churn + newRecurring);
    const otRev = otPerMo * otAmt;
    const recRev = recurringClients * recurringAmt;
    const gross = otRev + recRev;
    const costs = gross * costPct + 107;
    const profit = gross - costs;
    monthlyData.push({ gross, costs, profit, otRev, recRev, recurringClients });
    totalOneTime += otRev;
    totalRecurring += recRev;
  }

  const annGross = totalOneTime + totalRecurring;
  const annCosts = monthlyData.reduce((a,b) => a + b.costs, 0);
  const annProfit = annGross - annCosts;
  const married = document.getElementById('taxStatus')?.value === 'married';
  const stateRate = STATE_RATES[document.getElementById('taxState')?.value || 'GA'];
  const taxes = calcAllTaxes(annProfit, married, stateRate);
  const annNet = taxes.net;
  const eachFounder = annNet / 2;
  const finalMRR = monthlyData[11].recurringClients * recurringAmt;

  setText('annRevenue', fmt(annGross));
  setText('annMRR', fmt(finalMRR));
  setText('annEach', fmt(eachFounder));
  setText('annClients', monthlyData[11].recurringClients);
  setText('annOTTotal', fmt(totalOneTime));
  setText('annRTotal', fmt(totalRecurring));
  setText('annGross', fmt(annGross));
  setText('annCosts', '−' + fmt(annCosts));
  setText('annTax', '−' + fmt(taxes.total));
  setText('annNet', fmt(annNet));

  renderAnnualChart(monthlyData);
}

function renderAnnualChart(data) {
  const ctx = document.getElementById('annualChart');
  if (!ctx) return;
  if (charts.annual) charts.annual.destroy();
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  charts.annual = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: months,
      datasets: [
        { label: 'One-time',  data: data.map(d => Math.round(d.otRev)),  backgroundColor: 'rgba(74,144,226,0.7)',  stack: 'rev', borderRadius: 3 },
        { label: 'Recurring', data: data.map(d => Math.round(d.recRev)), backgroundColor: 'rgba(0,212,170,0.7)',   stack: 'rev', borderRadius: 3 },
        { label: 'Net profit',data: data.map(d => Math.round(d.profit)), backgroundColor: 'rgba(0,212,170,0.2)', type: 'line', borderColor: TYPE_COLORS.ai, tension: 0.3, fill: false, pointRadius: 3, borderWidth: 2, stack: undefined },
      ]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false }, tooltip: { callbacks: { label: c => ` ${c.dataset.label}: ${fmt(c.raw)}` } } },
      scales: {
        x: { stacked: true, grid: { display: false }, ticks: { font: { size: 10 }, color: '#5a6478' } },
        y: { stacked: true, grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { font: { size: 10 }, color: '#5a6478', callback: n => '$' + (n >= 1000 ? (n/1000).toFixed(0) + 'k' : n) } }
      }
    }
  });
}

/* ── Cost Margins Table ─────────────────────────────────────────── */
function renderMarginTable() {
  const tbody = document.getElementById('marginTableBody');
  if (!tbody) return;
  tbody.innerHTML = '';
  MARGIN_DATA.forEach((row, i) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td class="svc-name">${row.name}</td>
      <td>${row.pay}</td>
      <td style="color:var(--red);">${row.cost}</td>
      <td><span class="margin-badge">${row.margin}%</span></td>`;
    tbody.appendChild(tr);
  });
}

/* ── Scenarios Tab ──────────────────────────────────────────────── */
const SCENARIOS = {
  conservative: {
    label: 'Conservative',
    otPerMo: 1, otAmt: 1500, newRecurring: 0.5, recurringAmt: 800, churnPct: 0.08, costPct: 0.16,
    color: '#4a90e2',
  },
  realistic: {
    label: 'Realistic',
    otPerMo: 2, otAmt: 3500, newRecurring: 1, recurringAmt: 1200, churnPct: 0.05, costPct: 0.14,
    color: '#00d4aa',
  },
  optimistic: {
    label: 'Optimistic',
    otPerMo: 4, otAmt: 6000, newRecurring: 2, recurringAmt: 1800, churnPct: 0.03, costPct: 0.12,
    color: '#f5a623',
  },
};

function calcScenario(sc) {
  let rc = 0;
  const months = [];
  let totalOT = 0, totalR = 0;
  for (let mo = 0; mo < 12; mo++) {
    rc = Math.max(0, rc - Math.round(rc * sc.churnPct) + sc.newRecurring);
    const otRev = sc.otPerMo * sc.otAmt;
    const rRev  = rc * sc.recurringAmt;
    const gross = otRev + rRev;
    const profit = gross * (1 - sc.costPct) - 107;
    months.push({ gross, profit, rc });
    totalOT += otRev; totalR += rRev;
  }
  const annGross = totalOT + totalR;
  const annProfit = months.reduce((a,b) => a + b.profit, 0);
  const taxes = calcAllTaxes(annProfit, false, 0.0549);
  return { months, annGross, annNet: taxes.net, eachFounder: taxes.net / 2, finalMRR: months[11].rc * sc.recurringAmt };
}

function renderScenarios() {
  const keys = ['conservative','realistic','optimistic'];
  const results = {};

  keys.forEach(key => {
    results[key] = calcScenario(SCENARIOS[key]);
    const el = document.getElementById('sc' + key.charAt(0).toUpperCase() + key.slice(1));
    if (!el) return;
    const r = results[key];
    el.innerHTML = `
      <div class="scenario-stat"><span class="scenario-stat-label">Annual gross</span><span class="scenario-stat-val">${fmt(r.annGross)}</span></div>
      <div class="scenario-stat"><span class="scenario-stat-label">Year-end MRR</span><span class="scenario-stat-val">${fmt(r.finalMRR)}</span></div>
      <div class="scenario-stat"><span class="scenario-stat-label">Annual net each</span><span class="scenario-stat-val">${fmt(r.eachFounder)}</span></div>
      <div class="scenario-stat"><span class="scenario-stat-label">Monthly take-home</span><span class="scenario-stat-val">${fmt(r.eachFounder / 12)}</span></div>`;
  });

  renderScenarioChart(results);
}

function renderScenarioChart(results) {
  const ctx = document.getElementById('scenarioChart');
  if (!ctx) return;
  if (charts.scenario) charts.scenario.destroy();
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  charts.scenario = new Chart(ctx, {
    type: 'line',
    data: {
      labels: months,
      datasets: [
        { label: 'Conservative', data: results.conservative.months.map(m => Math.round(m.gross)), borderColor: SCENARIOS.conservative.color, backgroundColor: 'rgba(74,144,226,0.06)', tension: 0.3, fill: true, borderDash: [6,3], pointRadius: 3, borderWidth: 2 },
        { label: 'Realistic',    data: results.realistic.months.map(m => Math.round(m.gross)),    borderColor: SCENARIOS.realistic.color,    backgroundColor: 'rgba(0,212,170,0.06)',   tension: 0.3, fill: true, borderDash: [],    pointRadius: 3, borderWidth: 2 },
        { label: 'Optimistic',   data: results.optimistic.months.map(m => Math.round(m.gross)),   borderColor: SCENARIOS.optimistic.color,   backgroundColor: 'rgba(245,166,35,0.06)',  tension: 0.3, fill: true, borderDash: [2,2], pointRadius: 3, borderWidth: 2 },
      ]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false }, tooltip: { callbacks: { label: c => ` ${c.dataset.label}: ${fmt(c.raw)}` } } },
      scales: {
        x: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { font: { size: 10 }, color: '#5a6478' } },
        y: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { font: { size: 10 }, color: '#5a6478', callback: n => '$' + (n >= 1000 ? (n/1000).toFixed(0) + 'k' : n) } }
      }
    }
  });

  const legend = document.getElementById('scenLegend');
  if (legend) {
    legend.innerHTML = Object.entries(SCENARIOS).map(([key, sc]) =>
      `<div class="legend-item">
        <div class="legend-dot" style="background:${sc.color}"></div>
        ${sc.label}: ${fmt(results[key].annGross)}/yr · ${fmt(results[key].eachFounder)}/founder
      </div>`
    ).join('');
  }
}

/* ── Helpers ────────────────────────────────────────────────────── */
function v(id) {
  const el = document.getElementById(id);
  return el ? el.value : '';
}

function setText(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val;
}

/* ── Tab Switching ─────────────────────────────────────────────── */
function setupTabs() {
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.dataset.tab;
      document.querySelectorAll('.tab-btn').forEach(b => { b.classList.remove('active'); b.setAttribute('aria-selected','false'); });
      document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      btn.setAttribute('aria-selected','true');
      document.getElementById('tab-' + target)?.classList.add('active');
      if (target === 'costs') renderMarginTable();
      if (target === 'scenario') renderScenarios();
      if (target === 'annual') updateAnnual();
      if (target === 'recurring') updateRecurring();
      if (target === 'taxes') updateTaxes();
    });
  });
}

/* ── Theme Toggle ───────────────────────────────────────────────── */
function setupTheme() {
  const btn = document.getElementById('themeToggle');
  const saved = localStorage.getItem('obaroTheme') || 'dark';
  if (saved === 'light') document.documentElement.setAttribute('data-theme','light');

  btn?.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'light' ? 'dark' : 'light';
    if (next === 'dark') document.documentElement.removeAttribute('data-theme');
    else document.documentElement.setAttribute('data-theme', 'light');
    localStorage.setItem('obaroTheme', next);
  });
}

/* ── Event Listeners ────────────────────────────────────────────── */
function setupListeners() {
  const clientSlider = document.getElementById('clientCount');
  clientSlider?.addEventListener('input', () => {
    const n = +clientSlider.value;
    setText('clientCountVal', n);
    clients = generateClients(n);
    renderClients();
  });

  document.getElementById('rerollBtn')?.addEventListener('click', () => {
    const n = +v('clientCount');
    clients = generateClients(n);
    renderClients();
  });

  // Recurring sliders
  ['rCare','rCareAmt','rMkt','rMktAmt','rWeb','rWebAmt'].forEach(id => {
    document.getElementById(id)?.addEventListener('input', updateRecurring);
  });

  // Tax inputs
  ['taxIncome','taxExpenses','taxStatus','taxState'].forEach(id => {
    document.getElementById(id)?.addEventListener('input', () => { updateTaxes(); updateHeroMetrics(); updateMonthlySnapshot(); });
  });

  // Annual sliders
  ['aOneTime','aOneTimeVal2','aNewRecurring','aRecurringAmt','aChurn','aCostPct'].forEach(id => {
    document.getElementById(id)?.addEventListener('input', updateAnnual);
  });
}

/* ── Init ───────────────────────────────────────────────────────── */
function init() {
  setupTheme();
  setupTabs();
  setupListeners();
  clients = generateClients(5);
  renderClients();
  updateRecurring();
  updateTaxes();
  updateAnnual();
  renderMarginTable();
  renderScenarios();
  Chart.defaults.color = '#5a6478';
  Chart.defaults.font.family = "'DM Mono', monospace";
}

document.addEventListener('DOMContentLoaded', init);
