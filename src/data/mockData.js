export const clients = [
  'Meridian Capital Partners',
  'Okonkwo Family Trust',
  'Chen Family Office',
  'Park & Lee Family Office',
  'Rosenberg Family Trust',
]

export const kpis = [
  { label: 'Total AUM',         value: '$47.3M', delta: '+$2.1M',  deltaDir: 'pos', sub: 'Since last quarter',   color: '#3b82f6' },
  { label: 'YTD Return',        value: '+11.4%', delta: '+3.2% vs S&P', deltaDir: 'pos', sub: 'S&P 500 +8.2%', color: '#22c55e' },
  { label: 'Capital Calls Due', value: '$1.85M', delta: '3 calls pending', deltaDir: 'neg', sub: 'Next 90 days', color: '#f59e0b' },
  { label: 'Unfunded Commit.',  value: '$8.2M',  delta: 'Across 6 funds',  deltaDir: 'neu', sub: 'PE + Real Assets', color: '#a78bfa' },
]

export const performanceData = [
  { month: 'Jan', portfolio: 100.0, sp500: 100.0, blend: 100.0 },
  { month: 'Feb', portfolio: 101.2, sp500: 100.8, blend: 100.5 },
  { month: 'Mar', portfolio: 102.8, sp500: 101.9, blend: 101.2 },
  { month: 'Apr', portfolio: 104.1, sp500: 103.1, blend: 101.8 },
  { month: 'May', portfolio: 103.5, sp500: 102.4, blend: 101.3 },
  { month: 'Jun', portfolio: 105.3, sp500: 103.8, blend: 102.0 },
  { month: 'Jul', portfolio: 107.1, sp500: 105.2, blend: 102.9 },
  { month: 'Aug', portfolio: 108.6, sp500: 106.1, blend: 103.5 },
  { month: 'Sep', portfolio: 109.2, sp500: 106.8, blend: 103.9 },
  { month: 'Oct', portfolio: 110.4, sp500: 107.3, blend: 104.5 },
  { month: 'Nov', portfolio: 111.0, sp500: 107.9, blend: 105.1 },
  { month: 'Dec', portfolio: 111.4, sp500: 108.2, blend: 105.7 },
]

export const allocation = [
  { name: 'Public Equity',  pct: 36, color: '#3b82f6' },
  { name: 'Private Equity', pct: 16, color: '#a78bfa' },
  { name: 'Real Assets',    pct: 12, color: '#14b8a6' },
  { name: 'Hedge Funds',    pct: 10, color: '#f59e0b' },
  { name: 'Fixed Income',   pct: 26, color: '#4a4a62' },
]

export const capitalCalls = [
  {
    id: 1,
    fund: 'Blackstone BREIT',
    manager: 'Blackstone Real Estate',
    series: 'Series D Units',
    callNum: 'Call #4',
    amount: 350000,
    dueDate: 'Apr 8, 2026',
    daysUntil: 19,
    urgency: 'upcoming',
    unfundedRemaining: 1300000,
  },
  {
    id: 2,
    fund: 'KKR North America XII',
    manager: 'KKR Private Equity',
    series: 'Limited Partnership',
    callNum: 'Call #2',
    amount: 750000,
    dueDate: 'May 15, 2026',
    daysUntil: 56,
    urgency: 'future',
    unfundedRemaining: 1500000,
  },
  {
    id: 3,
    fund: 'Vista Equity Partners VIII',
    manager: 'Vista Equity Partners',
    series: 'Co-investment Vehicle',
    callNum: 'Call #1',
    amount: 750000,
    dueDate: 'Jun 10, 2026',
    daysUntil: 82,
    urgency: 'future',
    unfundedRemaining: 1940000,
  },
]

export const cashFlowForecast = [
  { month: 'Jan', amount: 350 },
  { month: 'Feb', amount: 750 },
  { month: 'Mar', amount: 220 },
  { month: 'Apr', amount: 480 },
  { month: 'May', amount: 160 },
  { month: 'Jun', amount: 290 },
  { month: 'Jul', amount: 410 },
  { month: 'Aug', amount: 190 },
  { month: 'Sep', amount: 560 },
  { month: 'Oct', amount: 180 },
  { month: 'Nov', amount: 320 },
  { month: 'Dec', amount: 490 },
]

export const holdings = [
  { id: 1, name: 'Blackstone BREIT',         manager: 'Blackstone Real Estate', cls: 'Real Estate',    clsKey: 're', value: 2840000,  returnPct: '+9.2% IRR',  tvpi: '1.42x', dpi: '0.18x', unfunded: 1300000, weight: 6.0  },
  { id: 2, name: 'KKR North America XII',     manager: 'KKR Private Equity',     cls: 'Private Equity', clsKey: 'pe', value: 4120000,  returnPct: '+14.7% IRR', tvpi: '1.85x', dpi: '0.40x', unfunded: 1500000, weight: 8.7  },
  { id: 3, name: 'Vista Equity Partners VIII', manager: 'Vista Equity Partners',  cls: 'Private Equity', clsKey: 'pe', value: 1560000,  returnPct: '+18.3% IRR', tvpi: '1.22x', dpi: '0.00x', unfunded: 1940000, weight: 3.3  },
  { id: 4, name: 'Citadel Wellington Fund',   manager: 'Citadel Asset Mgmt',     cls: 'Hedge Fund',     clsKey: 'hf', value: 4730000,  returnPct: '+11.1%',     tvpi: '—',     dpi: '—',     unfunded: null,    weight: 10.0 },
  { id: 5, name: 'iShares Core S&P 500',      manager: 'BlackRock',              cls: 'Equity',         clsKey: 'eq', value: 12400000, returnPct: '+8.4%',      tvpi: '—',     dpi: '—',     unfunded: null,    weight: 26.2 },
  { id: 6, name: 'PIMCO Total Return',        manager: 'PIMCO',                  cls: 'Fixed Income',   clsKey: 'fi', value: 8900000,  returnPct: '+3.1%',      tvpi: '—',     dpi: '—',     unfunded: null,    weight: 18.8 },
]

export const attribution = [
  { name: 'KKR North America XII',      contrib: '+2.8%', pct: 94, dir: 'pos' },
  { name: 'Citadel Wellington',         contrib: '+2.1%', pct: 70, dir: 'pos' },
  { name: 'iShares Core S&P 500',       contrib: '+1.9%', pct: 63, dir: 'pos' },
  { name: 'Vista Equity Partners VIII', contrib: '+1.4%', pct: 47, dir: 'pos' },
  { name: 'Blackstone BREIT',           contrib: '+0.9%', pct: 30, dir: 'pos' },
  { name: 'PIMCO Total Return',         contrib: '−0.3%', pct: 10, dir: 'neg' },
]

export const riskMetrics = [
  { label: 'Sharpe Ratio',  value: '1.42',  color: '#22c55e', sub: 'Strong risk-adj return' },
  { label: 'Max Drawdown',  value: '−8.3%', color: '#f59e0b', sub: 'Last 12 months' },
  { label: 'Volatility',    value: '9.7%',  color: null,      sub: 'Annualized std dev' },
  { label: 'Beta vs S&P',   value: '0.73',  color: null,      sub: 'Low market correlation' },
  { label: 'VaR (95%)',     value: '$891K', color: '#ef4444', sub: '1-day estimate' },
  { label: 'Alt Illiquidity', value: '38%', color: '#a78bfa', sub: 'Locked capital' },
]

export const reportTemplates = [
  { id: 1, title: 'Quarterly Performance Report', desc: 'Branded · 12 pages · All asset classes', tags: ['PDF', 'Scheduled', 'White-label'], featured: true },
  { id: 2, title: 'Capital Call Summary',          desc: 'Alts-focused · 4 pages · IRR + TVPI + DPI', tags: ['PDF', 'On-demand'], featured: false },
  { id: 3, title: 'Risk & Exposure Report',        desc: 'Risk-focused · 6 pages · Benchmarks + VaR', tags: ['PDF', 'Monthly'], featured: false },
  { id: 4, title: 'Manager Attribution Report',    desc: 'Performance · 8 pages · By manager + sector', tags: ['PDF', 'Quarterly'], featured: false },
  { id: 5, title: 'ESG & Sustainability Report',   desc: 'ESG scores · Morningstar integration · 6 pages', tags: ['PDF', 'Annual'], featured: false },
  { id: 6, title: 'Family Office Summary',         desc: 'Executive summary · 2 pages · High-level KPIs', tags: ['PDF', 'Monthly', 'White-label'], featured: false },
]

export const nlqAnswers = {
  'Capital calls next 60 days': {
    title: 'Capital Calls — Next 60 Days',
    body: 'You have <strong>2 capital calls</strong> due within the next 60 days totaling <strong style="color:#f59e0b">$1,100,000</strong>. Current liquid assets of $21.3M are sufficient.',
    rows: {
      headers: ['Fund', 'Manager', 'Amount Due', 'Due Date', 'Days'],
      data: [
        ['Blackstone BREIT (Call #4)', 'Blackstone', '$350,000', 'Jan 23, 2026', '8 ⚡'],
        ['KKR North America XII (Call #2)', 'KKR', '$750,000', 'Feb 8, 2026', '24'],
      ],
    },
    footer: 'Ensure $1.1M is in liquid/cash position before Jan 20th to allow wire processing time.',
  },
  'PE fund IRR': {
    title: 'Private Equity — IRR Summary',
    body: 'Weighted average IRR across all PE positions: <strong style="color:#22c55e">+15.3%</strong>, outperforming the Cambridge PE benchmark of 11.2% by 4.1%.',
    rows: {
      headers: ['Fund', 'Vintage', 'IRR', 'TVPI', 'DPI', 'Status'],
      data: [
        ['Vista Equity Partners VIII', '2023', '+18.3%', '1.22x', '0.00x', 'Early stage'],
        ['KKR North America XII', '2022', '+14.7%', '1.85x', '0.40x', 'Returning capital'],
      ],
    },
    footer: 'Vista leads on IRR; KKR has begun returning capital ahead of vintage peers.',
  },
  'YTD vs benchmarks': {
    title: 'YTD Performance vs Benchmarks',
    body: 'Portfolio is outperforming all benchmarks YTD with a total return of <strong style="color:#22c55e">+11.4%</strong>.',
    rows: {
      headers: ['Benchmark', 'YTD Return', 'Alpha'],
      data: [
        ['Meridian Portfolio', '+11.4%', '—'],
        ['S&P 500', '+8.2%', '+3.2%'],
        ['60/40 Blend', '+5.7%', '+5.7%'],
        ['HFRI Fund Composite', '+7.1%', '+4.3%'],
      ],
    },
    footer: 'Top alpha contributors: KKR PE (+2.8%), Citadel Wellington (+2.1%). Only PIMCO dragged (−0.3%).',
  },
  'Unfunded commitments': {
    title: 'Unfunded Commitments — All Funds',
    body: 'Total unfunded LP commitments: <strong style="color:#a78bfa">$8,204,000</strong> across 6 funds, callable over an estimated 3–5 year horizon.',
    rows: {
      headers: ['Fund', 'Commitment', 'Called', 'Unfunded', 'Est. Year'],
      data: [
        ['Blackstone BREIT', '$4,490,000', '$1,300,000', '$1,300,000', '2026'],
        ['KKR North America XII', '$6,000,000', '$4,500,000', '$1,500,000', '2026–27'],
        ['Vista Equity VIII', '$3,500,000', '$1,560,000', '$1,940,000', '2027–28'],
        ['Other (3 funds)', '$6,400,000', '$2,936,000', '$3,464,000', '2026–29'],
      ],
    },
    footer: 'Annual call estimate: $2.1M–$2.8M/year. Maintain adequate liquidity buffer accordingly.',
  },
  'Risk by asset class': {
    title: 'Risk Exposure by Asset Class',
    body: 'Portfolio Sharpe Ratio of 1.42. Largest concentration risk in Public Equity at 36%.',
    rows: {
      headers: ['Asset Class', 'Allocation', 'Volatility', 'Beta', 'VaR Contrib.'],
      data: [
        ['Public Equity', '36%', '14.2%', '1.00', '$521K'],
        ['Private Equity', '16%', '22.1%', '0.45', '$189K'],
        ['Hedge Funds', '10%', '7.8%', '0.28', '$64K'],
        ['Real Assets', '12%', '11.3%', '0.38', '$78K'],
        ['Fixed Income', '26%', '4.1%', '0.12', '$39K'],
      ],
    },
    footer: 'Portfolio beta of 0.73 vs S&P 500 reflects meaningful downside protection from alts and fixed income.',
  },
  'Top performing manager': {
    title: 'Manager Attribution — Q4 2025',
    body: '<strong style="color:#22c55e">Vista Equity Partners VIII</strong> leads on IRR at +18.3%. KKR drives the most portfolio attribution at +2.8%.',
    rows: {
      headers: ['Manager', 'Q4 Return', 'Attribution', 'YTD IRR'],
      data: [
        ['KKR North America XII', '+6.1%', '+2.8%', '+14.7%'],
        ['Citadel Wellington Fund', '+4.3%', '+2.1%', '+11.1%'],
        ['Vista Equity VIII', '+7.2%', '+1.4%', '+18.3%'],
        ['Blackstone BREIT', '+2.9%', '+0.9%', '+9.2%'],
        ['PIMCO Total Return', '+0.8%', '−0.3%', '+3.1%'],
      ],
    },
    footer: 'Vista leads on IRR but has small weight (3.3%); KKR drives the most absolute dollar attribution at $1.15M.',
  },
}
