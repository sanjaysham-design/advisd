import React, { useState } from 'react'
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell,
} from 'recharts'
import {
  kpis, performanceData, allocation, capitalCalls,
  holdings, attribution, riskMetrics,
} from '../data/mockData'

const clsColors = { pe: '#a78bfa', re: '#14b8a6', hf: '#3b82f6', eq: '#22c55e', fi: '#f59e0b' }

function fmt(n) {
  if (n >= 1_000_000) return '$' + (n / 1_000_000).toFixed(2) + 'M'
  if (n >= 1_000) return '$' + (n / 1_000).toFixed(0) + 'K'
  return '$' + n
}

export default function Dashboard({ onGoToCalls }) {
  const [activePeriod, setActivePeriod] = useState('YTD')
  const periods = ['1M', '3M', 'YTD', '1Y', '3Y']

  return (
    <div className="fade-up" style={{ padding: '20px 24px' }}>
      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 20 }}>
        {kpis.map(k => <KPICard key={k.label} kpi={k} />)}
      </div>

      {/* Charts Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 14, marginBottom: 20 }}>
        {/* Performance Chart */}
        <Card>
          <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: 14 }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 500 }}>Portfolio Performance</div>
              <div style={{ fontSize: 10, color: 'var(--tx3)' }}>vs S&P 500 & 60/40 Blend</div>
            </div>
            <div style={{ marginLeft: 'auto', display: 'flex', gap: 3 }}>
              {periods.map(p => (
                <PeriodPill key={p} label={p} active={activePeriod === p} onClick={() => setActivePeriod(p)} />
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={140}>
            <LineChart data={performanceData} margin={{ top: 4, right: 4, left: -32, bottom: 0 }}>
              <XAxis dataKey="month" tick={{ fontSize: 9, fill: '#4a4a62' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 9, fill: '#4a4a62' }} axisLine={false} tickLine={false} domain={[98, 114]} />
              <Tooltip
                contentStyle={{ background: 'var(--bg3)', border: '1px solid var(--bdr2)', borderRadius: 8, fontSize: 11 }}
                itemStyle={{ color: 'var(--tx)' }}
                labelStyle={{ color: 'var(--tx2)', marginBottom: 4 }}
              />
              <Line type="monotone" dataKey="portfolio" stroke="#3b82f6" strokeWidth={2} dot={false} name="Portfolio" />
              <Line type="monotone" dataKey="sp500" stroke="#22c55e" strokeWidth={1.5} dot={false} strokeDasharray="5 3" name="S&P 500" />
              <Line type="monotone" dataKey="blend" stroke="#4a4a62" strokeWidth={1} dot={false} strokeDasharray="3 3" name="60/40" />
            </LineChart>
          </ResponsiveContainer>
          <div style={{ display: 'flex', gap: 14, marginTop: 8 }}>
            {[['#3b82f6', 'Portfolio +11.4%'], ['#22c55e', 'S&P 500 +8.2%'], ['#4a4a62', '60/40 +5.7%']].map(([c, l]) => (
              <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 10, color: 'var(--tx2)' }}>
                <span style={{ width: 14, height: 2, background: c, display: 'inline-block', borderRadius: 1 }} />
                {l}
              </div>
            ))}
          </div>
        </Card>

        {/* Allocation Donut */}
        <Card>
          <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 2 }}>Allocation</div>
          <div style={{ fontSize: 10, color: 'var(--tx3)', marginBottom: 14 }}>By asset class</div>
          <DonutChart />
        </Card>
      </div>

      {/* Capital Calls */}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 12 }}>
        <div style={{ fontSize: 13, fontWeight: 500 }}>Upcoming Capital Calls</div>
        <span style={{ marginLeft: 8, background: 'rgba(239,68,68,0.14)', color: 'var(--red)', fontSize: 9, fontWeight: 700, padding: '2px 7px', borderRadius: 8 }}>3 Pending</span>
        <span onClick={onGoToCalls} style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--blue2)', cursor: 'pointer' }}>View all →</span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: 20 }}>
        {capitalCalls.map(cc => <CallCard key={cc.id} cc={cc} />)}
      </div>

      {/* Holdings */}
      <HoldingsTable />

      {/* Bottom Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 20 }}>
        <Card>
          <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 2 }}>Performance Attribution</div>
          <div style={{ fontSize: 10, color: 'var(--tx3)', marginBottom: 14 }}>Contribution by manager — YTD</div>
          {attribution.map(a => <AttributionRow key={a.name} item={a} />)}
        </Card>
        <Card>
          <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 2 }}>Risk Metrics</div>
          <div style={{ fontSize: 10, color: 'var(--tx3)', marginBottom: 14 }}>Portfolio-level assessment</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {riskMetrics.map(r => <RiskItem key={r.label} item={r} />)}
          </div>
        </Card>
      </div>
    </div>
  )
}

function KPICard({ kpi }) {
  const [hov, setHov] = useState(false)
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: hov ? 'var(--bg4)' : 'var(--bg3)',
        border: `1px solid ${hov ? 'var(--bdr2)' : 'var(--bdr)'}`,
        borderRadius: 12, padding: '16px', position: 'relative', overflow: 'hidden',
        cursor: 'pointer', transition: 'all 0.2s',
      }}
    >
      <div style={{ fontSize: 9, color: 'var(--tx3)', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 8 }}>{kpi.label}</div>
      <div style={{ fontSize: 24, fontWeight: 600, letterSpacing: '-1px', marginBottom: 3 }}>{kpi.value}</div>
      <div style={{ fontSize: 11, fontWeight: 500, color: kpi.deltaDir === 'pos' ? 'var(--green)' : kpi.deltaDir === 'neg' ? 'var(--red)' : 'var(--tx3)' }}>
        {kpi.deltaDir === 'pos' ? '↑ ' : kpi.deltaDir === 'neg' ? '' : ''}{kpi.delta}
      </div>
      <div style={{ fontSize: 10, color: 'var(--tx3)', marginTop: 2 }}>{kpi.sub}</div>
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, ${kpi.color}, transparent)` }} />
    </div>
  )
}

function Card({ children, style }) {
  return (
    <div style={{
      background: 'var(--bg3)', border: '1px solid var(--bdr)',
      borderRadius: 12, padding: 18, ...style,
    }}>{children}</div>
  )
}

function PeriodPill({ label, active, onClick }) {
  const [hov, setHov] = useState(false)
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: active ? 'rgba(59,130,246,0.18)' : hov ? 'var(--surf2)' : 'var(--surf)',
        border: `1px solid ${active ? 'rgba(59,130,246,0.35)' : 'var(--bdr)'}`,
        borderRadius: 5, padding: '2px 8px', fontSize: 10,
        color: active ? 'var(--blue2)' : 'var(--tx2)',
        cursor: 'pointer', transition: 'all 0.15s',
      }}
    >{label}</div>
  )
}

function DonutChart() {
  const total = allocation.reduce((s, a) => s + a.pct, 0)
  let offset = 0
  const r = 26, cx = 35, cy = 35
  const circ = 2 * Math.PI * r

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
      <svg viewBox="0 0 70 70" width={70} height={70} style={{ flexShrink: 0 }}>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--surf2)" strokeWidth={14} />
        {allocation.map(a => {
          const dash = (a.pct / total) * circ
          const gap = circ - dash
          const seg = (
            <circle
              key={a.name} cx={cx} cy={cy} r={r}
              fill="none" stroke={a.color} strokeWidth={14}
              strokeDasharray={`${dash} ${gap}`}
              strokeDashoffset={-offset}
              transform={`rotate(-90 ${cx} ${cy})`}
            />
          )
          offset += dash
          return seg
        })}
      </svg>
      <div style={{ flex: 1 }}>
        {allocation.map(a => (
          <div key={a.name} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '4px 0', borderBottom: '1px solid var(--bdr)', fontSize: 11 }}>
            <div style={{ width: 7, height: 7, borderRadius: 2, background: a.color, flexShrink: 0 }} />
            <span style={{ flex: 1, color: 'var(--tx2)' }}>{a.name}</span>
            <span style={{ fontWeight: 500 }}>{a.pct}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function CallCard({ cc }) {
  const [hov, setHov] = useState(false)
  const urgColor = cc.urgency === 'urgent' ? 'var(--red)' : cc.urgency === 'upcoming' ? 'var(--amber)' : 'var(--tx3)'
  const urgBorder = cc.urgency === 'urgent' ? 'rgba(239,68,68,0.3)' : cc.urgency === 'upcoming' ? 'rgba(245,158,11,0.3)' : 'var(--bdr)'
  const urgLabel = cc.urgency === 'urgent' ? `⚡ Due in ${cc.daysUntil} days` : cc.urgency === 'upcoming' ? `⏱ Due in ${cc.daysUntil} days` : `○ Due in ${cc.daysUntil} days`
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: 'var(--bg3)', border: `1px solid ${hov ? 'var(--bdr2)' : urgBorder}`,
        borderRadius: 10, padding: 14, cursor: 'pointer',
        transition: 'all 0.2s', transform: hov ? 'translateY(-1px)' : 'none',
      }}
    >
      <div style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.4px', color: urgColor, marginBottom: 8 }}>{urgLabel}</div>
      <div style={{ fontSize: 12, fontWeight: 500, marginBottom: 2 }}>{cc.fund}</div>
      <div style={{ fontSize: 10, color: 'var(--tx3)', marginBottom: 10 }}>{cc.manager}</div>
      <div style={{ fontSize: 20, fontWeight: 600, letterSpacing: '-0.7px', marginBottom: 3 }}>{fmt(cc.amount)}</div>
      <div style={{ fontSize: 10, color: 'var(--tx3)' }}>Due: {cc.dueDate}</div>
      <div style={{ fontSize: 9, background: 'var(--surf)', padding: '2px 7px', borderRadius: 5, color: 'var(--tx2)', display: 'inline-block', marginTop: 7 }}>{cc.callNum}</div>
    </div>
  )
}

function HoldingsTable() {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('All')
  const filtered = holdings.filter(h => {
    if (search && !h.name.toLowerCase().includes(search.toLowerCase())) return false
    if (filter === 'Alts' && !['pe', 're', 'hf'].includes(h.clsKey)) return false
    if (filter === 'Liquid' && ['pe', 're'].includes(h.clsKey)) return false
    return true
  })

  return (
    <div style={{ background: 'var(--bg3)', border: '1px solid var(--bdr)', borderRadius: 12, overflow: 'hidden', marginBottom: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', padding: '12px 16px', borderBottom: '1px solid var(--bdr)', gap: 8 }}>
        <span style={{ fontSize: 13, fontWeight: 500 }}>Holdings</span>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search holdings…"
          style={{
            background: 'var(--surf)', border: '1px solid var(--bdr)', borderRadius: 7,
            padding: '5px 10px', fontSize: 11, color: 'var(--tx)', outline: 'none', width: 160,
          }}
        />
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 3 }}>
          {['All', 'Alts', 'Liquid'].map(f => (
            <PeriodPill key={f} label={f} active={filter === f} onClick={() => setFilter(f)} />
          ))}
        </div>
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            {['Investment', 'Class', 'Value', 'IRR / Return', 'TVPI', 'DPI', 'Unfunded', 'Weight'].map(h => (
              <th key={h} style={{
                padding: '8px 16px', fontSize: 9, color: 'var(--tx3)',
                textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'left',
                borderBottom: '1px solid var(--bdr)', fontWeight: 500, whiteSpace: 'nowrap',
              }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {filtered.map(h => <HoldingRow key={h.id} h={h} />)}
        </tbody>
      </table>
    </div>
  )
}

function HoldingRow({ h }) {
  const [hov, setHov] = useState(false)
  const isPos = h.returnPct.startsWith('+')
  const tagStyle = {
    display: 'inline-block', borderRadius: 4, padding: '1px 6px', fontSize: 9,
    background: clsColors[h.clsKey] + '20',
    color: clsColors[h.clsKey],
  }
  return (
    <tr
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{ background: hov ? 'rgba(255,255,255,0.02)' : 'transparent' }}
    >
      <td style={{ padding: '11px 16px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
        <div style={{ fontWeight: 500, fontSize: 12 }}>{h.name}</div>
        <div style={{ fontSize: 9, color: 'var(--tx3)', marginTop: 1 }}>{h.manager}</div>
      </td>
      <td style={{ padding: '11px 16px', fontSize: 12, borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
        <span style={tagStyle}>{h.cls}</span>
      </td>
      <td style={{ padding: '11px 16px', fontSize: 12, borderBottom: '1px solid rgba(255,255,255,0.04)' }}>{fmt(h.value)}</td>
      <td style={{ padding: '11px 16px', fontSize: 12, borderBottom: '1px solid rgba(255,255,255,0.04)', color: isPos ? 'var(--green)' : 'var(--red)' }}>{h.returnPct}</td>
      <td style={{ padding: '11px 16px', fontSize: 12, borderBottom: '1px solid rgba(255,255,255,0.04)' }}>{h.tvpi}</td>
      <td style={{ padding: '11px 16px', fontSize: 12, borderBottom: '1px solid rgba(255,255,255,0.04)' }}>{h.dpi}</td>
      <td style={{ padding: '11px 16px', fontSize: 12, borderBottom: '1px solid rgba(255,255,255,0.04)', color: h.unfunded ? 'var(--amber)' : 'var(--tx3)' }}>
        {h.unfunded ? fmt(h.unfunded) : '—'}
      </td>
      <td style={{ padding: '11px 16px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ flex: 1, height: 3, background: 'var(--surf2)', borderRadius: 2 }}>
            <div style={{ width: `${Math.min(h.weight * 4, 100)}%`, height: 3, borderRadius: 2, background: clsColors[h.clsKey] || 'var(--blue)' }} />
          </div>
          <span style={{ fontSize: 10, color: 'var(--tx3)', minWidth: 32 }}>{h.weight}%</span>
        </div>
      </td>
    </tr>
  )
}

function AttributionRow({ item }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 0', borderBottom: '1px solid var(--bdr)' }}>
      <div style={{ fontSize: 12, flex: 1 }}>{item.name}</div>
      <div style={{ fontSize: 12, fontWeight: 500, width: 48, textAlign: 'right', color: item.dir === 'pos' ? 'var(--green)' : 'var(--red)' }}>{item.contrib}</div>
      <div style={{ width: 70, height: 3, background: 'var(--surf2)', borderRadius: 2 }}>
        <div style={{ width: `${item.pct}%`, height: 3, borderRadius: 2, background: item.dir === 'pos' ? 'var(--green)' : 'var(--red)' }} />
      </div>
    </div>
  )
}

function RiskItem({ item }) {
  return (
    <div style={{ background: 'var(--surf)', borderRadius: 7, padding: 10 }}>
      <div style={{ fontSize: 9, color: 'var(--tx3)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4 }}>{item.label}</div>
      <div style={{ fontSize: 18, fontWeight: 600, letterSpacing: '-0.5px', color: item.color || 'var(--tx)' }}>{item.value}</div>
      <div style={{ fontSize: 9, color: 'var(--tx3)', marginTop: 1 }}>{item.sub}</div>
    </div>
  )
}
