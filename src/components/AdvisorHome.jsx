import React, { useState } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, Cell, AreaChart, Area,
} from 'recharts'

// ─── Per-client aggregate mock data ────────────────────────────────────────
const CLIENT_DATA = [
  {
    name: 'Meridian Family Trust',
    aum: 47.3, ytd: 11.4, alpha: 3.2,
    callsDue: 1850000, callCount: 3, unfunded: 8200000,
    liquidRatio: 0.82, drift: 1.2, driftFlag: false,
    alignScore: 91,
  },
  {
    name: 'Harrington Capital LLC',
    aum: 38.2, ytd: 9.8, alpha: 1.6,
    callsDue: 2400000, callCount: 1, unfunded: 6800000,
    liquidRatio: 0.71, drift: 6.8, driftFlag: true,
    alignScore: 62,
  },
  {
    name: 'Chen Family Office',
    aum: 42.1, ytd: 13.2, alpha: 5.0,
    callsDue: 1100000, callCount: 2, unfunded: 5500000,
    liquidRatio: 0.91, drift: 0.8, driftFlag: false,
    alignScore: 94,
  },
  {
    name: 'Voss Private Wealth',
    aum: 31.6, ytd: 7.9, alpha: -0.3,
    callsDue: 0, callCount: 0, unfunded: 4200000,
    liquidRatio: 0.88, drift: 2.1, driftFlag: false,
    alignScore: 78,
  },
  {
    name: 'Alderton Partners',
    aum: 19.6, ytd: 10.3, alpha: 2.1,
    callsDue: 900000, callCount: 1, unfunded: 3100000,
    liquidRatio: 0.79, drift: 1.5, driftFlag: false,
    alignScore: 85,
  },
]

const AUM_TREND = [
  { month: 'Oct', aum: 169.4 },
  { month: 'Nov', aum: 172.1 },
  { month: 'Dec', aum: 171.8 },
  { month: 'Jan', aum: 174.6 },
  { month: 'Feb', aum: 176.9 },
  { month: 'Mar', aum: 178.8 },
]

// Drawdown history (peak-to-trough %)
const DRAWDOWN_DATA = [
  { month: 'Apr', dd: -1.2 },
  { month: 'May', dd: -3.8 },
  { month: 'Jun', dd: -6.1 },
  { month: 'Jul', dd: -8.3 },
  { month: 'Aug', dd: -5.7 },
  { month: 'Sep', dd: -4.2 },
  { month: 'Oct', dd: -2.9 },
  { month: 'Nov', dd: -1.8 },
  { month: 'Dec', dd: -1.1 },
  { month: 'Jan', dd: -0.6 },
  { month: 'Feb', dd: -0.3 },
  { month: 'Mar', dd: -0.2 },
]

const CAPITAL_CALLS_CROSS = [
  { client: 'Harrington', fund: 'Apollo Global XII', amount: 2400000, date: 'Feb 4', urgency: 'urgent' },
  { client: 'Meridian', fund: 'Blackstone BREIT', amount: 350000, date: 'Jan 23', urgency: 'urgent' },
  { client: 'Chen', fund: 'Sequoia Capital Growth', amount: 600000, date: 'Feb 14', urgency: 'upcoming' },
  { client: 'Meridian', fund: 'KKR North America XII', amount: 750000, date: 'Feb 8', urgency: 'upcoming' },
  { client: 'Alderton', fund: 'Vista Equity VIII', amount: 900000, date: 'Mar 8', urgency: 'future' },
  { client: 'Chen', fund: 'Carlyle Partners VII', amount: 500000, date: 'Mar 17', urgency: 'future' },
  { client: 'Meridian', fund: 'Vista Equity Partners VIII', amount: 750000, date: 'Mar 17', urgency: 'future' },
]

// Diversification: asset class + sector
const ASSET_CLASSES = [
  { name: 'Public Equity',  pct: 35, color: '#3b82f6' },
  { name: 'Fixed Income',   pct: 24, color: '#4a4a62' },
  { name: 'Private Equity', pct: 17, color: '#a78bfa' },
  { name: 'Real Assets',    pct: 11, color: '#14b8a6' },
  { name: 'Hedge Funds',    pct: 9,  color: '#f59e0b' },
  { name: 'Cash & Other',   pct: 4,  color: '#6b7280' },
]

const SECTORS = [
  { name: 'Technology',   pct: 18, color: '#3b82f6' },
  { name: 'Healthcare',   pct: 12, color: '#22c55e' },
  { name: 'Financials',   pct: 11, color: '#a78bfa' },
  { name: 'Consumer',     pct: 9,  color: '#f59e0b' },
  { name: 'Energy',       pct: 7,  color: '#ef4444' },
  { name: 'Industrials',  pct: 6,  color: '#14b8a6' },
  { name: 'Other',        pct: 37, color: '#4a4a62' },
]

// Top cross-account holdings
const TOP_HOLDINGS = [
  { name: 'iShares Core S&P 500',    manager: 'BlackRock',         cls: 'Equity',         clsColor: '#3b82f6', clients: 5, value: 28400000, pctAUM: 15.9 },
  { name: 'Vanguard Total Bond Mkt', manager: 'Vanguard',          cls: 'Fixed Income',   clsColor: '#4a4a62', clients: 4, value: 18200000, pctAUM: 10.2 },
  { name: 'PIMCO Total Return',      manager: 'PIMCO',             cls: 'Fixed Income',   clsColor: '#4a4a62', clients: 3, value: 14600000, pctAUM: 8.2  },
  { name: 'Citadel Wellington',      manager: 'Citadel',           cls: 'Hedge Fund',     clsColor: '#f59e0b', clients: 3, value: 11800000, pctAUM: 6.6  },
  { name: 'KKR North America XII',   manager: 'KKR PE',            cls: 'Private Equity', clsColor: '#a78bfa', clients: 2, value: 8900000,  pctAUM: 5.0  },
  { name: 'Blackstone BREIT',        manager: 'Blackstone',        cls: 'Real Assets',    clsColor: '#14b8a6', clients: 3, value: 7400000,  pctAUM: 4.1  },
  { name: 'Microsoft Corp',          manager: 'Public Market',     cls: 'Equity',         clsColor: '#3b82f6', clients: 4, value: 6800000,  pctAUM: 3.8  },
  { name: 'Amazon.com',              manager: 'Public Market',     cls: 'Equity',         clsColor: '#3b82f6', clients: 3, value: 5200000,  pctAUM: 2.9  },
]

const TOTAL_AUM = 178.8
const AVG_YTD = ((CLIENT_DATA.reduce((s, c) => s + c.ytd * c.aum, 0)) / TOTAL_AUM).toFixed(1)
const TOTAL_CALLS = CLIENT_DATA.reduce((s, c) => s + c.callsDue, 0)
const TOTAL_UNFUNDED = CLIENT_DATA.reduce((s, c) => s + c.unfunded, 0)
const AVG_ALIGN = Math.round(CLIENT_DATA.reduce((s, c) => s + c.alignScore * c.aum, 0) / TOTAL_AUM)

function fmtM(n) {
  if (n >= 1_000_000) return '$' + (n / 1_000_000).toFixed(1) + 'M'
  if (n >= 1_000) return '$' + (n / 1_000).toFixed(0) + 'K'
  return '$' + n
}

const urgencyColor = { urgent: '#ef4444', upcoming: '#f59e0b', future: '#3b82f6' }
const urgencyLabel = { urgent: 'Urgent', upcoming: 'Upcoming', future: 'Scheduled' }

export default function AdvisorHome({ onSelectClient }) {
  const ytdBarData = CLIENT_DATA.map(c => ({ name: c.name.split(' ')[0], ytd: c.ytd }))

  return (
    <div className="fade-up" style={{ padding: '20px 24px' }}>

      {/* Alert banner */}
      <div style={{
        background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)',
        borderRadius: 10, padding: '10px 14px', marginBottom: 18,
        display: 'flex', alignItems: 'center', gap: 10,
      }}>
        <span style={{ fontSize: 14 }}>⚠️</span>
        <div style={{ flex: 1 }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: '#ef4444' }}>Drift Alert — Harrington Capital LLC</span>
          <span style={{ fontSize: 12, color: 'var(--tx2)', marginLeft: 8 }}>
            Allocation drift of <strong>6.8%</strong> detected vs target. PE overweight by 4.1%, Fixed Income underweight by 3.9%. Review recommended.
          </span>
        </div>
        <div style={{ fontSize: 10, color: 'var(--tx3)', whiteSpace: 'nowrap' }}>Just now</div>
      </div>

      {/* ── Row 1: Core AUM KPIs ─────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 10 }}>
        <KPICard label="Total AUM" value="$178.8M" delta="+$9.4M" deltaDir="pos" sub="Since Oct 2025" color="#3b82f6" />
        <KPICard label="Avg YTD Return" value={`+${AVG_YTD}%`} delta="+2.8% vs S&P" deltaDir="pos" sub="Weighted by AUM" color="#22c55e" />
        <KPICard label="Capital Calls Due" value={fmtM(TOTAL_CALLS)} delta="7 calls pending" deltaDir="neg" sub="Next 90 days · 5 clients" color="#f59e0b" />
        <KPICard label="Unfunded Commits" value={fmtM(TOTAL_UNFUNDED)} delta="Across 5 clients" deltaDir="neu" sub="PE + Real Assets" color="#a78bfa" />
      </div>

      {/* ── Row 2: Performance & Business KPIs ───────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 20 }}>
        <KPICard label="3Y CAGR" value="+9.8%" delta="+1.4% vs benchmark" deltaDir="pos" sub="Smoothed annual growth" color="#06b6d4" tooltip="Compound Annual Growth Rate — smoothed growth rate across all strategies, annualised over 3 years." />
        <KPICard label="TWRR (YTD)" value="+10.6%" delta="Strips cash flow timing" deltaDir="pos" sub="Time-weighted return" color="#8b5cf6" tooltip="Time-Weighted Rate of Return — isolates investment performance by eliminating the effect of client deposits and withdrawals." />
        <KPICard label="Revenue Growth" value="+14.2%" delta="+$218K YoY" deltaDir="pos" sub="AUM-based fee revenue" color="#22c55e" tooltip="Percentage increase in advisory fee revenue over the past 12 months, driven by AUM growth and new client onboarding." />
        <AlignScoreCard score={AVG_ALIGN} clients={CLIENT_DATA} />
      </div>

      {/* ── Charts Row ────────────────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
        <Card title="Total AUM" sub="Last 6 months · All clients">
          <ResponsiveContainer width="100%" height={130}>
            <LineChart data={AUM_TREND} margin={{ top: 4, right: 4, left: -28, bottom: 0 }}>
              <XAxis dataKey="month" tick={{ fontSize: 9, fill: '#4a4a62' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 9, fill: '#4a4a62' }} axisLine={false} tickLine={false} domain={[165, 182]} />
              <Tooltip contentStyle={{ background: 'var(--bg3)', border: '1px solid var(--bdr2)', borderRadius: 8, fontSize: 11 }} formatter={v => [`$${v}M`, 'AUM']} labelStyle={{ color: 'var(--tx2)', marginBottom: 4 }} />
              <Line type="monotone" dataKey="aum" stroke="#3b82f6" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        <Card title="YTD Return by Client" sub="vs S&P 500 (+8.2%)">
          <ResponsiveContainer width="100%" height={130}>
            <BarChart data={ytdBarData} margin={{ top: 4, right: 4, left: -28, bottom: 0 }}>
              <XAxis dataKey="name" tick={{ fontSize: 9, fill: '#4a4a62' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 9, fill: '#4a4a62' }} axisLine={false} tickLine={false} domain={[0, 16]} />
              <Tooltip contentStyle={{ background: 'var(--bg3)', border: '1px solid var(--bdr2)', borderRadius: 8, fontSize: 11 }} formatter={v => [`+${v}%`, 'YTD Return']} labelStyle={{ color: 'var(--tx2)', marginBottom: 4 }} />
              <Bar dataKey="ytd" radius={[4, 4, 0, 0]}>
                {ytdBarData.map((entry, i) => (
                  <Cell key={i} fill={entry.ytd >= 8.2 ? '#3b82f6' : '#4a4a62'} fillOpacity={0.85} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div style={{ fontSize: 9, color: 'var(--tx3)', marginTop: 4 }}>
            <span style={{ display: 'inline-block', width: 16, height: 1, background: '#3b82f6', verticalAlign: 'middle', marginRight: 4 }} />
            Blue = outperforming S&P 500
          </div>
        </Card>
      </div>

      {/* ── Risk Dashboard ────────────────────────────────────────────────── */}
      <Card title="Risk Dashboard" sub="Aggregate risk metrics across all client portfolios" style={{ marginBottom: 14 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 10, marginBottom: 16 }}>
          <RiskStat
            label="Sharpe Ratio"
            value="1.42"
            sub="Excess return / total risk"
            rating="Strong"
            ratingColor="#22c55e"
            tooltip="Measures return per unit of total risk (volatility). Above 1.0 is considered strong; above 2.0 is excellent."
          />
          <RiskStat
            label="Sortino Ratio"
            value="1.87"
            sub="Excess return / downside risk"
            rating="Excellent"
            ratingColor="#22c55e"
            tooltip="Like Sharpe but only penalises downside volatility. More relevant for portfolios with asymmetric return profiles."
          />
          <RiskStat
            label="Max Drawdown"
            value="−8.3%"
            sub="Peak-to-trough · Last 12mo"
            rating="Moderate"
            ratingColor="#f59e0b"
            tooltip="The largest percentage drop from a portfolio peak to a subsequent trough. Reflects worst-case loss in the period."
          />
          <RiskStat
            label="Aggregate Beta"
            value="0.71"
            sub="vs S&P 500"
            rating="Low corr."
            ratingColor="#3b82f6"
            tooltip="Measures sensitivity of the entire managed book to S&P 500 movements. Beta < 1 means less market exposure than the index."
          />
          <RiskStat
            label="VaR (95%, 1-day)"
            value="$892K"
            sub="Potential daily loss"
            rating="Within limit"
            ratingColor="#22c55e"
            tooltip="Value at Risk — the maximum expected loss over one trading day with 95% confidence. Based on historical simulation."
          />
        </div>

        {/* Max Drawdown sparkline */}
        <div>
          <div style={{ fontSize: 10, color: 'var(--tx3)', marginBottom: 6 }}>Maximum Drawdown — trailing 12 months</div>
          <ResponsiveContainer width="100%" height={60}>
            <AreaChart data={DRAWDOWN_DATA} margin={{ top: 2, right: 4, left: -28, bottom: 0 }}>
              <defs>
                <linearGradient id="ddGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <XAxis dataKey="month" tick={{ fontSize: 8, fill: '#4a4a62' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 8, fill: '#4a4a62' }} axisLine={false} tickLine={false} domain={[-10, 0]} />
              <Tooltip
                contentStyle={{ background: 'var(--bg3)', border: '1px solid var(--bdr2)', borderRadius: 8, fontSize: 11 }}
                formatter={v => [`${v}%`, 'Drawdown']}
                labelStyle={{ color: 'var(--tx2)', marginBottom: 4 }}
              />
              <Area type="monotone" dataKey="dd" stroke="#ef4444" strokeWidth={1.5} fill="url(#ddGrad)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* ── Diversification + Top Holdings ───────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: 14, marginBottom: 14 }}>

        {/* Diversification */}
        <Card title="Diversification" sub="Aggregate allocation across all client accounts">
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 10, color: 'var(--tx3)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 }}>By Asset Class</div>
            {ASSET_CLASSES.map(ac => (
              <div key={ac.name} style={{ marginBottom: 7 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                  <span style={{ fontSize: 11, display: 'flex', alignItems: 'center', gap: 5 }}>
                    <span style={{ width: 7, height: 7, borderRadius: 2, background: ac.color, display: 'inline-block', flexShrink: 0 }} />
                    {ac.name}
                  </span>
                  <span style={{ fontSize: 11, fontWeight: 600 }}>{ac.pct}%</span>
                </div>
                <div style={{ height: 5, borderRadius: 3, background: 'var(--bdr)', overflow: 'hidden' }}>
                  <div style={{ height: '100%', borderRadius: 3, width: `${ac.pct}%`, background: ac.color }} />
                </div>
              </div>
            ))}
          </div>

          <div>
            <div style={{ fontSize: 10, color: 'var(--tx3)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 }}>By Sector (Equity Sleeve)</div>
            {SECTORS.map(s => (
              <div key={s.name} style={{ marginBottom: 5, display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 10, width: 72, flexShrink: 0, color: 'var(--tx2)' }}>{s.name}</span>
                <div style={{ flex: 1, height: 4, borderRadius: 3, background: 'var(--bdr)', overflow: 'hidden' }}>
                  <div style={{ height: '100%', borderRadius: 3, width: `${s.pct}%`, background: s.color, opacity: 0.7 }} />
                </div>
                <span style={{ fontSize: 10, color: 'var(--tx3)', width: 24, textAlign: 'right', flexShrink: 0 }}>{s.pct}%</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Top Cross-Account Holdings */}
        <Card title="Top Holdings" sub="Largest positions across all client accounts">
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--bdr)' }}>
                {['Position', 'Class', 'Clients', 'Total Value', '% AUM'].map(h => (
                  <th key={h} style={{ textAlign: h === 'Position' ? 'left' : 'right', padding: '5px 8px', fontSize: 9, color: 'var(--tx3)', fontWeight: 500, whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {TOP_HOLDINGS.map((h, i) => (
                <HoldingRow key={h.name} holding={h} rank={i + 1} />
              ))}
            </tbody>
          </table>
        </Card>
      </div>

      {/* ── Client Summary Table ──────────────────────────────────────────── */}
      <Card title="Client Overview" sub="Click any row to drill into client dashboard" style={{ marginBottom: 14 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--bdr)' }}>
              {['Client', 'AUM', 'YTD Return', 'Alpha', 'Calls Due', 'Unfunded', 'Liquidity', 'Drift', 'Align Score'].map(h => (
                <th key={h} style={{ textAlign: h === 'Client' ? 'left' : 'right', padding: '6px 10px', fontSize: 10, color: 'var(--tx3)', fontWeight: 500, whiteSpace: 'nowrap' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {CLIENT_DATA.map((c, i) => (
              <ClientRow key={c.name} client={c} idx={i} onClick={() => onSelectClient(i)} />
            ))}
          </tbody>
        </table>
      </Card>

      {/* ── Capital Calls + Liquidity ─────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        <Card title="Capital Calls" sub="All clients · Sorted by urgency">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {CAPITAL_CALLS_CROSS.map((call, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '7px 10px', borderRadius: 7,
                background: 'var(--surf)', border: '1px solid var(--bdr)',
              }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', flexShrink: 0, background: urgencyColor[call.urgency] }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 11, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{call.fund}</div>
                  <div style={{ fontSize: 9, color: 'var(--tx3)' }}>{call.client}</div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontSize: 11, fontWeight: 600 }}>{fmtM(call.amount)}</div>
                  <div style={{ fontSize: 9, color: urgencyColor[call.urgency] }}>{call.date} · {urgencyLabel[call.urgency]}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Liquidity Coverage" sub="Liquid assets vs unfunded ratio per client">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 4 }}>
            {CLIENT_DATA.map(c => (
              <div key={c.name}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                  <span style={{ fontSize: 11 }}>{c.name.split(' ')[0]}</span>
                  <span style={{ fontSize: 10, color: c.liquidRatio >= 0.8 ? 'var(--green)' : c.liquidRatio >= 0.7 ? 'var(--amber)' : 'var(--red)', fontWeight: 600 }}>
                    {(c.liquidRatio * 100).toFixed(0)}%
                  </span>
                </div>
                <div style={{ height: 5, borderRadius: 3, background: 'var(--bdr)', overflow: 'hidden' }}>
                  <div style={{
                    height: '100%', borderRadius: 3,
                    width: `${c.liquidRatio * 100}%`,
                    background: c.liquidRatio >= 0.8 ? 'var(--green)' : c.liquidRatio >= 0.7 ? 'var(--amber)' : 'var(--red)',
                  }} />
                </div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 12, fontSize: 9, color: 'var(--tx3)' }}>
            Ratio = liquid assets / (unfunded commitments + 12-month call estimate). &gt;80% = healthy.
          </div>
        </Card>
      </div>
    </div>
  )
}

// ─── Sub-components ─────────────────────────────────────────────────────────

function AlignScoreCard({ score, clients }) {
  const color = score >= 85 ? '#22c55e' : score >= 70 ? '#f59e0b' : '#ef4444'
  return (
    <div style={{
      background: 'var(--surf)', border: '1px solid var(--bdr)',
      borderRadius: 12, padding: '14px 16px',
      borderTop: `2px solid ${color}`,
    }}>
      <div style={{ fontSize: 10, color: 'var(--tx3)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 6 }}>
        Strategic Alignment
        <Tooltip2 text="Quantifies how well current client allocations match their defined investment policy statement (IPS) and business objectives. Scored 0–100." />
      </div>
      <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-1px', marginBottom: 6, color }}>{score}<span style={{ fontSize: 12, color: 'var(--tx3)', fontWeight: 400 }}>/100</span></div>
      <div style={{ display: 'flex', gap: 3, marginBottom: 4 }}>
        {clients.map((c, i) => (
          <div key={i} title={`${c.name}: ${c.alignScore}`} style={{ flex: 1, height: 4, borderRadius: 2, background: c.alignScore >= 85 ? '#22c55e' : c.alignScore >= 70 ? '#f59e0b' : '#ef4444', opacity: 0.8 }} />
        ))}
      </div>
      <div style={{ fontSize: 9, color: 'var(--tx3)' }}>Avg across 5 clients · Weighted by AUM</div>
    </div>
  )
}

function RiskStat({ label, value, sub, rating, ratingColor, tooltip }) {
  return (
    <div style={{
      background: 'var(--bg)', border: '1px solid var(--bdr)',
      borderRadius: 10, padding: '11px 13px',
    }}>
      <div style={{ fontSize: 10, color: 'var(--tx3)', marginBottom: 5, display: 'flex', alignItems: 'center', gap: 3 }}>
        {label}
        {tooltip && <Tooltip2 text={tooltip} />}
      </div>
      <div style={{ fontSize: 19, fontWeight: 700, letterSpacing: '-0.5px', marginBottom: 3 }}>{value}</div>
      <div style={{ fontSize: 9, color: ratingColor, fontWeight: 600, marginBottom: 2 }}>{rating}</div>
      <div style={{ fontSize: 9, color: 'var(--tx3)' }}>{sub}</div>
    </div>
  )
}

function HoldingRow({ holding: h, rank }) {
  const [hov, setHov] = React.useState(false)
  return (
    <tr
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{ borderBottom: '1px solid var(--bdr)', background: hov ? 'var(--surf)' : 'transparent', transition: 'background 0.1s' }}
    >
      <td style={{ padding: '7px 8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 9, color: 'var(--tx3)', width: 12, flexShrink: 0, textAlign: 'right' }}>{rank}</span>
          <div>
            <div style={{ fontSize: 11, fontWeight: 500 }}>{h.name}</div>
            <div style={{ fontSize: 9, color: 'var(--tx3)' }}>{h.manager}</div>
          </div>
        </div>
      </td>
      <td style={{ padding: '7px 8px', textAlign: 'right' }}>
        <span style={{ fontSize: 9, padding: '2px 6px', borderRadius: 5, background: `${h.clsColor}22`, color: h.clsColor, fontWeight: 600, whiteSpace: 'nowrap' }}>
          {h.cls}
        </span>
      </td>
      <td style={{ padding: '7px 8px', textAlign: 'right', fontSize: 11, color: 'var(--tx2)' }}>
        {h.clients} <span style={{ fontSize: 9, color: 'var(--tx3)' }}>clients</span>
      </td>
      <td style={{ padding: '7px 8px', textAlign: 'right', fontSize: 11, fontWeight: 600 }}>{fmtM(h.value)}</td>
      <td style={{ padding: '7px 8px', textAlign: 'right', fontSize: 11, color: 'var(--tx2)' }}>{h.pctAUM}%</td>
    </tr>
  )
}

function ClientRow({ client: c, idx, onClick }) {
  const [hov, setHov] = React.useState(false)
  return (
    <tr
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{ borderBottom: '1px solid var(--bdr)', cursor: 'pointer', background: hov ? 'var(--surf)' : 'transparent', transition: 'background 0.12s' }}
    >
      <td style={{ padding: '9px 10px', fontWeight: 500 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <div style={{
            width: 24, height: 24, borderRadius: 6,
            background: `hsl(${idx * 60 + 210}, 70%, 45%)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 9, fontWeight: 700, color: '#fff', flexShrink: 0,
          }}>
            {c.name.split(' ').map(w => w[0]).join('').slice(0, 2)}
          </div>
          <div>
            <div style={{ fontSize: 12 }}>{c.name}</div>
            {c.driftFlag && <div style={{ fontSize: 9, color: '#ef4444', fontWeight: 600 }}>⚠ Drift flagged</div>}
          </div>
        </div>
      </td>
      <td style={{ padding: '9px 10px', textAlign: 'right', fontSize: 12, fontWeight: 600 }}>${c.aum}M</td>
      <td style={{ padding: '9px 10px', textAlign: 'right', fontSize: 12, color: '#22c55e', fontWeight: 600 }}>+{c.ytd}%</td>
      <td style={{ padding: '9px 10px', textAlign: 'right', fontSize: 12, color: c.alpha >= 0 ? '#22c55e' : '#ef4444' }}>
        {c.alpha >= 0 ? '+' : ''}{c.alpha}%
      </td>
      <td style={{ padding: '9px 10px', textAlign: 'right', fontSize: 12 }}>
        {c.callCount > 0
          ? <span style={{ color: '#f59e0b' }}>{fmtM(c.callsDue)} <span style={{ fontSize: 9, color: 'var(--tx3)' }}>({c.callCount})</span></span>
          : <span style={{ color: 'var(--tx3)' }}>—</span>}
      </td>
      <td style={{ padding: '9px 10px', textAlign: 'right', fontSize: 12, color: 'var(--tx2)' }}>{fmtM(c.unfunded)}</td>
      <td style={{ padding: '9px 10px', textAlign: 'right', fontSize: 12 }}>
        <span style={{ color: c.liquidRatio >= 0.8 ? '#22c55e' : c.liquidRatio >= 0.7 ? '#f59e0b' : '#ef4444', fontWeight: 600 }}>
          {(c.liquidRatio * 100).toFixed(0)}%
        </span>
      </td>
      <td style={{ padding: '9px 10px', textAlign: 'right', fontSize: 12 }}>
        <span style={{ color: c.drift >= 5 ? '#ef4444' : c.drift >= 3 ? '#f59e0b' : 'var(--tx3)' }}>{c.drift}%</span>
      </td>
      <td style={{ padding: '9px 10px', textAlign: 'right', fontSize: 12 }}>
        <AlignBadge score={c.alignScore} />
      </td>
    </tr>
  )
}

function AlignBadge({ score }) {
  const color = score >= 85 ? '#22c55e' : score >= 70 ? '#f59e0b' : '#ef4444'
  return (
    <span style={{ color, fontWeight: 600 }}>{score}<span style={{ fontSize: 9, color: 'var(--tx3)', fontWeight: 400 }}>/100</span></span>
  )
}

// Inline tooltip on hover
function Tooltip2({ text }) {
  const [show, setShow] = React.useState(false)
  return (
    <span
      style={{ position: 'relative', display: 'inline-flex', cursor: 'help' }}
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      <svg viewBox="0 0 12 12" width={11} height={11} fill="none" stroke="currentColor" strokeWidth="1.3" style={{ color: 'var(--tx3)', flexShrink: 0 }}>
        <circle cx="6" cy="6" r="5" />
        <path d="M6 5.5v3M6 4h.01" strokeLinecap="round" />
      </svg>
      {show && (
        <div style={{
          position: 'absolute', bottom: '120%', left: '50%', transform: 'translateX(-50%)',
          background: 'var(--bg3)', border: '1px solid var(--bdr2)',
          borderRadius: 8, padding: '7px 10px', fontSize: 10, color: 'var(--tx2)',
          width: 200, zIndex: 100, lineHeight: 1.5, pointerEvents: 'none',
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
        }}>
          {text}
        </div>
      )}
    </span>
  )
}

function KPICard({ label, value, delta, deltaDir, sub, color, tooltip }) {
  return (
    <div style={{
      background: 'var(--surf)', border: '1px solid var(--bdr)',
      borderRadius: 12, padding: '14px 16px',
      borderTop: `2px solid ${color}`,
    }}>
      <div style={{ fontSize: 10, color: 'var(--tx3)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
        {label}
        {tooltip && <Tooltip2 text={tooltip} />}
      </div>
      <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-1px', marginBottom: 4 }}>{value}</div>
      <div style={{ fontSize: 11, color: deltaDir === 'pos' ? 'var(--green)' : deltaDir === 'neg' ? 'var(--red)' : 'var(--tx3)', fontWeight: 500 }}>{delta}</div>
      <div style={{ fontSize: 10, color: 'var(--tx3)', marginTop: 2 }}>{sub}</div>
    </div>
  )
}

function Card({ title, sub, children, style }) {
  return (
    <div style={{ background: 'var(--surf)', border: '1px solid var(--bdr)', borderRadius: 12, padding: '14px 16px', ...style }}>
      {title && (
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 13, fontWeight: 500 }}>{title}</div>
          {sub && <div style={{ fontSize: 10, color: 'var(--tx3)' }}>{sub}</div>}
        </div>
      )}
      {children}
    </div>
  )
}
