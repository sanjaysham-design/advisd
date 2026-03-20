import React, { useState } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, Cell,
} from 'recharts'

// ── Per-client fee profiles ──────────────────────────────────────────────────
const PROFILES = {
  'Chen Family Office': {
    aum: 42_300_000,
    netReturn: 11.4,
    funds: [
      { id: 1, fund: 'Blackstone Real Estate XI', manager: 'Blackstone', cls: 'Real Estate',    commitment: 8_000_000, value: 9_420_000, mgmtFee: 2.00, expRatio: 0.22, carryRate: 20, hurdle: 8, grossReturn: 14.2, feesYTD: 252_000, carryAccrued: 318_000 },
      { id: 2, fund: 'KKR Americas Fund XIV',     manager: 'KKR',        cls: 'Private Equity', commitment: 7_000_000, value: 8_150_000, mgmtFee: 1.75, expRatio: 0.18, carryRate: 20, hurdle: 8, grossReturn: 16.8, feesYTD: 183_000, carryAccrued: 412_000 },
      { id: 3, fund: 'Bridgewater All-Weather',   manager: 'Bridgewater',cls: 'Hedge Fund',     commitment: 5_000_000, value: 5_380_000, mgmtFee: 1.50, expRatio: 0.14, carryRate: 15, hurdle: 5, grossReturn:  8.9, feesYTD:  96_000, carryAccrued: 134_000 },
      { id: 4, fund: 'PIMCO Diversified Income',  manager: 'PIMCO',      cls: 'Fixed Income',   commitment: 4_000_000, value: 4_120_000, mgmtFee: 0.60, expRatio: 0.08, carryRate:  0, hurdle: 0, grossReturn:  5.8, feesYTD:  29_000, carryAccrued:       0 },
      { id: 5, fund: 'Harrison St. RE Core',      manager: 'Harrison St.',cls: 'Real Estate',   commitment: 6_000_000, value: 6_840_000, mgmtFee: 1.25, expRatio: 0.16, carryRate: 15, hurdle: 7, grossReturn: 12.1, feesYTD: 101_000, carryAccrued: 198_000 },
    ],
  },
  'Meridian Capital Partners': {
    aum: 38_100_000,
    netReturn: 13.2,
    funds: [
      { id: 1, fund: 'Apollo Global Fund XVI',    manager: 'Apollo',     cls: 'Private Equity', commitment: 9_000_000, value: 11_200_000, mgmtFee: 2.00, expRatio: 0.20, carryRate: 20, hurdle: 8, grossReturn: 18.4, feesYTD: 310_000, carryAccrued: 580_000 },
      { id: 2, fund: 'Carlyle Partners VIII',     manager: 'Carlyle',    cls: 'Private Equity', commitment: 8_000_000, value:  9_600_000, mgmtFee: 1.85, expRatio: 0.19, carryRate: 20, hurdle: 8, grossReturn: 15.9, feesYTD: 268_000, carryAccrued: 390_000 },
      { id: 3, fund: 'Vista Equity Partners VII', manager: 'Vista',      cls: 'Private Equity', commitment: 6_000_000, value:  7_100_000, mgmtFee: 2.00, expRatio: 0.21, carryRate: 20, hurdle: 8, grossReturn: 21.2, feesYTD: 222_000, carryAccrued: 510_000 },
      { id: 4, fund: 'Oaktree Capital Fund IV',   manager: 'Oaktree',    cls: 'Credit',         commitment: 5_000_000, value:  5_420_000, mgmtFee: 1.50, expRatio: 0.15, carryRate: 15, hurdle: 6, grossReturn:  9.8, feesYTD: 108_000, carryAccrued: 182_000 },
      { id: 5, fund: 'Ares Real Estate IV',       manager: 'Ares',       cls: 'Real Estate',    commitment: 4_000_000, value:  4_780_000, mgmtFee: 1.60, expRatio: 0.17, carryRate: 20, hurdle: 7, grossReturn: 13.5, feesYTD:  95_000, carryAccrued: 241_000 },
    ],
  },
  'Okonkwo Family Trust': {
    aum: 28_400_000,
    netReturn: 10.8,
    funds: [
      { id: 1, fund: 'Citadel Wellington',        manager: 'Citadel',    cls: 'Hedge Fund',     commitment: 5_000_000, value:  5_920_000, mgmtFee: 2.00, expRatio: 0.25, carryRate: 20, hurdle: 0, grossReturn: 15.2, feesYTD: 342_000, carryAccrued: 290_000 },
      { id: 2, fund: 'Millennium Partners',        manager: 'Millennium', cls: 'Hedge Fund',     commitment: 5_000_000, value:  5_680_000, mgmtFee: 2.00, expRatio: 0.22, carryRate: 20, hurdle: 0, grossReturn: 13.6, feesYTD: 312_000, carryAccrued: 250_000 },
      { id: 3, fund: 'Two Sigma Spectrum',         manager: 'Two Sigma',  cls: 'Hedge Fund',     commitment: 4_000_000, value:  4_540_000, mgmtFee: 2.00, expRatio: 0.20, carryRate: 20, hurdle: 0, grossReturn: 11.8, feesYTD: 259_000, carryAccrued: 198_000 },
      { id: 4, fund: 'TPG Rise Climate Fund',      manager: 'TPG',        cls: 'Private Equity', commitment: 5_000_000, value:  5_280_000, mgmtFee: 1.75, expRatio: 0.18, carryRate: 20, hurdle: 8, grossReturn: 10.1, feesYTD:  88_000, carryAccrued:  81_000 },
      { id: 5, fund: 'Blackstone Credit',          manager: 'Blackstone', cls: 'Credit',         commitment: 4_000_000, value:  4_130_000, mgmtFee: 1.25, expRatio: 0.12, carryRate: 10, hurdle: 5, grossReturn:  7.4, feesYTD:  64_000, carryAccrued:  54_000 },
    ],
  },
  'Park & Lee Family Office': {
    aum: 35_600_000,
    netReturn: 9.6,
    funds: [
      { id: 1, fund: 'Morgan Stanley Growth',     manager: 'Morgan Stanley', cls: 'Equity',      commitment: 8_000_000, value:  9_120_000, mgmtFee: 1.20, expRatio: 0.10, carryRate:  0, hurdle: 0, grossReturn: 12.4, feesYTD: 148_000, carryAccrued:       0 },
      { id: 2, fund: 'JP Morgan PE Partners',     manager: 'JP Morgan',      cls: 'Private Equity', commitment: 7_000_000, value: 8_200_000, mgmtFee: 1.80, expRatio: 0.16, carryRate: 20, hurdle: 8, grossReturn: 14.8, feesYTD: 186_000, carryAccrued: 298_000 },
      { id: 3, fund: 'Nuveen Real Estate',        manager: 'Nuveen',         cls: 'Real Estate', commitment: 5_000_000, value:  5_580_000, mgmtFee: 1.50, expRatio: 0.14, carryRate: 15, hurdle: 7, grossReturn: 11.2, feesYTD: 110_000, carryAccrued: 148_000 },
      { id: 4, fund: 'iShares Diversified',       manager: 'BlackRock',      cls: 'Equity',      commitment: 6_000_000, value:  6_420_000, mgmtFee: 0.15, expRatio: 0.04, carryRate:  0, hurdle: 0, grossReturn:  9.1, feesYTD:  12_000, carryAccrued:       0 },
      { id: 5, fund: 'PGIM Private Credit',       manager: 'PGIM',           cls: 'Credit',      commitment: 4_000_000, value:  4_210_000, mgmtFee: 1.40, expRatio: 0.13, carryRate: 12, hurdle: 6, grossReturn:  8.2, feesYTD:  74_000, carryAccrued:  68_000 },
    ],
  },
  'Rosenberg Family Trust': {
    aum: 35_000_000,
    netReturn: 12.1,
    funds: [
      { id: 1, fund: 'Blackstone RE Partners X',  manager: 'Blackstone', cls: 'Real Estate',    commitment: 8_000_000, value:  9_840_000, mgmtFee: 2.00, expRatio: 0.22, carryRate: 20, hurdle: 8, grossReturn: 16.8, feesYTD: 249_000, carryAccrued: 422_000 },
      { id: 2, fund: 'Starwood Capital V',         manager: 'Starwood',   cls: 'Real Estate',    commitment: 7_000_000, value:  8_200_000, mgmtFee: 1.85, expRatio: 0.20, carryRate: 20, hurdle: 8, grossReturn: 14.4, feesYTD: 196_000, carryAccrued: 310_000 },
      { id: 3, fund: 'Ares Capital Fund VII',      manager: 'Ares',       cls: 'Credit',         commitment: 5_000_000, value:  5_430_000, mgmtFee: 1.60, expRatio: 0.16, carryRate: 15, hurdle: 6, grossReturn: 10.8, feesYTD: 108_000, carryAccrued: 154_000 },
      { id: 4, fund: 'Hamilton Lane Secondaries',  manager: 'Hamilton Lane', cls: 'Private Equity', commitment: 4_000_000, value: 4_620_000, mgmtFee: 1.50, expRatio: 0.15, carryRate: 12, hurdle: 8, grossReturn: 13.2, feesYTD:  86_000, carryAccrued: 138_000 },
      { id: 5, fund: 'Vanguard Total Market',      manager: 'Vanguard',   cls: 'Equity',         commitment: 3_000_000, value:  3_210_000, mgmtFee: 0.04, expRatio: 0.01, carryRate:  0, hurdle: 0, grossReturn: 10.2, feesYTD:   2_000, carryAccrued:       0 },
    ],
  },
}

const FALLBACK = 'Meridian Capital Partners'

// ── Helpers ──────────────────────────────────────────────────────────────────
const fmt$ = v => {
  if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`
  if (v >= 1_000)     return `$${(v / 1_000).toFixed(0)}K`
  return `$${v}`
}
const fmtBig = v => {
  if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(2)}M`
  return `$${(v / 1_000).toFixed(0)}K`
}

const CLS_COLORS = {
  'Private Equity': '#3b82f6',
  'Real Estate':    '#a78bfa',
  'Hedge Fund':     '#14b8a6',
  'Credit':         '#f59e0b',
  'Fixed Income':   '#f59e0b',
  'Equity':         '#22c55e',
}

const FEE_COLORS = {
  mgmt:  '#3b82f6',
  carry: '#a78bfa',
  exp:   '#f59e0b',
}

// ── Main component ───────────────────────────────────────────────────────────
export default function FeeTracking({ activeClient }) {
  const name = activeClient?.name ?? FALLBACK
  const profile = PROFILES[name] ?? PROFILES[FALLBACK]
  const { funds, aum, netReturn } = profile

  const [expandedManager, setExpandedManager] = useState(null)
  const [sortCol, setSortCol]   = useState('feesYTD')
  const [sortDir, setSortDir]   = useState('desc')

  // Aggregate totals
  const totalFeesYTD    = funds.reduce((s, f) => s + f.feesYTD, 0)
  const totalCarry      = funds.reduce((s, f) => s + f.carryAccrued, 0)
  const effectiveRate   = ((totalFeesYTD / aum) * 100).toFixed(2)
  const avgGross        = funds.reduce((s, f) => s + f.grossReturn * f.value, 0) / funds.reduce((s, f) => s + f.value, 0)
  const feeDrag         = +(avgGross - netReturn).toFixed(1)

  // Sorted funds for table
  const sorted = [...funds].sort((a, b) => {
    const av = a[sortCol] ?? 0, bv = b[sortCol] ?? 0
    return sortDir === 'asc' ? av - bv : bv - av
  })

  // Manager rollup
  const managers = Object.values(
    funds.reduce((acc, f) => {
      if (!acc[f.manager]) acc[f.manager] = { manager: f.manager, feesYTD: 0, carryAccrued: 0, value: 0, funds: [] }
      acc[f.manager].feesYTD      += f.feesYTD
      acc[f.manager].carryAccrued += f.carryAccrued
      acc[f.manager].value        += f.value
      acc[f.manager].funds.push(f)
      return acc
    }, {})
  ).sort((a, b) => b.feesYTD - a.feesYTD)

  // Chart data — fee breakdown by fund (stacked)
  const feeChartData = funds.map(f => ({
    name:  f.fund.length > 22 ? f.fund.slice(0, 22) + '…' : f.fund,
    mgmt:  Math.round(f.value * f.mgmtFee / 100),
    exp:   Math.round(f.value * f.expRatio / 100),
    carry: f.carryAccrued,
  }))

  // Chart data — gross vs net return per fund
  const returnChartData = funds.map(f => ({
    name:     f.fund.length > 20 ? f.fund.slice(0, 20) + '…' : f.fund,
    gross:    +f.grossReturn.toFixed(1),
    net:      +(f.grossReturn - (f.mgmtFee + f.expRatio + (f.carryAccrued / f.value * 100))).toFixed(1),
    feeDrag:  +((f.mgmtFee + f.expRatio + (f.carryAccrued / f.value * 100))).toFixed(1),
  }))

  function toggleSort(col) {
    if (sortCol === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortCol(col); setSortDir('desc') }
  }

  return (
    <div style={{ padding: '24px 28px', animation: 'fadeUp 0.3s ease' }}>

      {/* KPI row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 24 }}>
        <KpiCard
          label="Total Fees YTD"
          value={fmtBig(totalFeesYTD)}
          sub={`${effectiveRate}% effective rate`}
          icon="$"
          color="var(--blue)"
        />
        <KpiCard
          label="Carry Accrued"
          value={fmtBig(totalCarry)}
          sub={`Across ${funds.filter(f => f.carryRate > 0).length} carry funds`}
          icon="◇"
          color="var(--purple)"
        />
        <KpiCard
          label="Avg Gross Return"
          value={`${avgGross.toFixed(1)}%`}
          sub={`Net return ${netReturn}%`}
          icon="↑"
          color="var(--green)"
        />
        <KpiCard
          label="Fee Drag"
          value={`${feeDrag}%`}
          sub={`Gross minus net return`}
          icon="↓"
          color="var(--amber)"
        />
      </div>

      {/* Two-column: fund table + manager rollup */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 18, marginBottom: 24, alignItems: 'start' }}>

        {/* ── Fund fee table ── */}
        <div style={{ background: 'var(--bg2)', border: '1px solid var(--bdr)', borderRadius: 14, overflow: 'hidden' }}>
          <SectionHeader title="Fee Schedule by Fund" />
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--bdr)' }}>
                  {[
                    { col: 'fund',         label: 'Fund' },
                    { col: 'cls',          label: 'Class' },
                    { col: 'value',        label: 'Value' },
                    { col: 'mgmtFee',      label: 'Mgmt %' },
                    { col: 'carryRate',    label: 'Carry %' },
                    { col: 'feesYTD',      label: 'Fees YTD' },
                    { col: 'carryAccrued', label: 'Carry Accrued' },
                    { col: 'grossReturn',  label: 'Gross Ret' },
                  ].map(({ col, label }) => (
                    <th
                      key={col}
                      onClick={() => toggleSort(col)}
                      style={{
                        padding: '9px 12px', textAlign: col === 'fund' ? 'left' : 'right',
                        color: sortCol === col ? 'var(--blue2)' : 'var(--tx3)',
                        fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px',
                        cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap',
                      }}
                    >
                      {label}{sortCol === col ? (sortDir === 'asc' ? ' ↑' : ' ↓') : ''}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sorted.map((f, i) => (
                  <FundRow key={f.id} fund={f} even={i % 2 === 0} />
                ))}
              </tbody>
              <tfoot>
                <tr style={{ borderTop: '1px solid var(--bdr)', background: 'var(--bg3)' }}>
                  <td colSpan={3} style={{ padding: '9px 12px', fontSize: 10, fontWeight: 600, color: 'var(--tx2)' }}>Total / Weighted Avg</td>
                  <td style={{ padding: '9px 12px', textAlign: 'right', fontSize: 11, color: 'var(--tx)', fontWeight: 600 }}>
                    {(funds.reduce((s, f) => s + f.mgmtFee * f.value, 0) / funds.reduce((s, f) => s + f.value, 0)).toFixed(2)}%
                  </td>
                  <td style={{ padding: '9px 12px', textAlign: 'right', fontSize: 11, color: 'var(--tx)', fontWeight: 600 }}>
                    {(funds.reduce((s, f) => s + f.carryRate * f.value, 0) / funds.reduce((s, f) => s + f.value, 0)).toFixed(1)}%
                  </td>
                  <td style={{ padding: '9px 12px', textAlign: 'right', fontSize: 11, fontWeight: 700, color: 'var(--blue2)' }}>
                    {fmtBig(totalFeesYTD)}
                  </td>
                  <td style={{ padding: '9px 12px', textAlign: 'right', fontSize: 11, fontWeight: 700, color: 'var(--purple)' }}>
                    {fmtBig(totalCarry)}
                  </td>
                  <td style={{ padding: '9px 12px', textAlign: 'right', fontSize: 11, fontWeight: 600, color: 'var(--green)' }}>
                    {avgGross.toFixed(1)}%
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* ── Manager rollup ── */}
        <div style={{ background: 'var(--bg2)', border: '1px solid var(--bdr)', borderRadius: 14, overflow: 'hidden' }}>
          <SectionHeader title="By Manager" />
          <div style={{ padding: '6px 0 10px' }}>
            {managers.map(m => (
              <ManagerRow
                key={m.manager}
                m={m}
                expanded={expandedManager === m.manager}
                onToggle={() => setExpandedManager(expandedManager === m.manager ? null : m.manager)}
                totalFees={totalFeesYTD}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Two charts row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18, marginBottom: 24 }}>

        {/* Fee composition stacked bar */}
        <div style={{ background: 'var(--bg2)', border: '1px solid var(--bdr)', borderRadius: 14, padding: '18px 20px' }}>
          <SectionHeader title="Fee Composition by Fund" subtitle="Management fees · Expenses · Carry accrued" />
          <div style={{ marginTop: 16, height: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={feeChartData} barSize={22} margin={{ top: 0, right: 0, left: 10, bottom: 40 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis
                  dataKey="name"
                  tick={{ fill: 'var(--tx3)', fontSize: 9 }}
                  angle={-35} textAnchor="end"
                  tickLine={false} axisLine={false}
                  interval={0}
                />
                <YAxis
                  tickFormatter={v => `$${(v/1000).toFixed(0)}K`}
                  tick={{ fill: 'var(--tx3)', fontSize: 9 }}
                  tickLine={false} axisLine={false}
                />
                <Tooltip
                  contentStyle={{ background: 'var(--bg3)', border: '1px solid var(--bdr2)', borderRadius: 8, fontSize: 11 }}
                  formatter={(v, name) => [`$${(v/1000).toFixed(0)}K`, name === 'mgmt' ? 'Mgmt Fee' : name === 'exp' ? 'Expenses' : 'Carry']}
                  cursor={{ fill: 'rgba(255,255,255,0.04)' }}
                />
                <Bar dataKey="mgmt"  stackId="a" fill={FEE_COLORS.mgmt}  radius={[0,0,0,0]} />
                <Bar dataKey="exp"   stackId="a" fill={FEE_COLORS.exp}   radius={[0,0,0,0]} />
                <Bar dataKey="carry" stackId="a" fill={FEE_COLORS.carry} radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginTop: 4 }}>
            {[['mgmt','Mgmt Fee'],['exp','Expenses'],['carry','Carry']].map(([k,l]) => (
              <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 10, color: 'var(--tx3)' }}>
                <span style={{ width: 8, height: 8, borderRadius: 2, background: FEE_COLORS[k], display: 'inline-block' }} />
                {l}
              </div>
            ))}
          </div>
        </div>

        {/* Gross vs net return */}
        <div style={{ background: 'var(--bg2)', border: '1px solid var(--bdr)', borderRadius: 14, padding: '18px 20px' }}>
          <SectionHeader title="Gross vs Net Return" subtitle="Impact of fees on fund-level performance" />
          <div style={{ marginTop: 16, height: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={returnChartData} barSize={14} barGap={2} margin={{ top: 0, right: 0, left: 10, bottom: 40 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis
                  dataKey="name"
                  tick={{ fill: 'var(--tx3)', fontSize: 9 }}
                  angle={-35} textAnchor="end"
                  tickLine={false} axisLine={false}
                  interval={0}
                />
                <YAxis
                  tickFormatter={v => `${v}%`}
                  tick={{ fill: 'var(--tx3)', fontSize: 9 }}
                  tickLine={false} axisLine={false}
                />
                <Tooltip
                  contentStyle={{ background: 'var(--bg3)', border: '1px solid var(--bdr2)', borderRadius: 8, fontSize: 11 }}
                  formatter={(v, name) => [`${v}%`, name === 'gross' ? 'Gross Return' : 'Net Return']}
                  cursor={{ fill: 'rgba(255,255,255,0.04)' }}
                />
                <Bar dataKey="gross" fill="rgba(34,197,94,0.35)" radius={[3,3,0,0]} />
                <Bar dataKey="net"   fill="var(--green)"         radius={[3,3,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginTop: 4 }}>
            {[['rgba(34,197,94,0.4)','Gross'],['var(--green)','Net']].map(([c,l]) => (
              <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 10, color: 'var(--tx3)' }}>
                <span style={{ width: 8, height: 8, borderRadius: 2, background: c, display: 'inline-block' }} />
                {l}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Carry hurdle tracker */}
      <div style={{ background: 'var(--bg2)', border: '1px solid var(--bdr)', borderRadius: 14, padding: '18px 20px' }}>
        <SectionHeader title="Carry Hurdle Tracker" subtitle="Progress toward carried interest threshold by fund" />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 12, marginTop: 16 }}>
          {funds.filter(f => f.carryRate > 0).map(f => (
            <CarryCard key={f.id} fund={f} />
          ))}
        </div>
      </div>

    </div>
  )
}

// ── Sub-components ───────────────────────────────────────────────────────────

function KpiCard({ label, value, sub, icon, color }) {
  return (
    <div style={{
      background: 'var(--bg2)', border: '1px solid var(--bdr)',
      borderRadius: 14, padding: '16px 18px',
      display: 'flex', flexDirection: 'column', gap: 8,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 10, color: 'var(--tx3)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</span>
        <span style={{
          width: 26, height: 26, borderRadius: 7,
          background: color + '22',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 13, color,
        }}>{icon}</span>
      </div>
      <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.5px' }}>{value}</div>
      <div style={{ fontSize: 10, color: 'var(--tx3)' }}>{sub}</div>
    </div>
  )
}

function SectionHeader({ title, subtitle }) {
  return (
    <div style={{ padding: '14px 18px 12px', borderBottom: '1px solid var(--bdr)' }}>
      <div style={{ fontSize: 12, fontWeight: 600 }}>{title}</div>
      {subtitle && <div style={{ fontSize: 10, color: 'var(--tx3)', marginTop: 2 }}>{subtitle}</div>}
    </div>
  )
}

function FundRow({ fund: f, even }) {
  const netApprox = +(f.grossReturn - f.mgmtFee - f.expRatio - (f.carryAccrued / f.value * 100)).toFixed(1)
  return (
    <tr style={{ borderBottom: '1px solid var(--bdr)', background: even ? 'transparent' : 'rgba(255,255,255,0.015)' }}>
      <td style={{ padding: '9px 12px' }}>
        <div style={{ fontSize: 11, fontWeight: 500 }}>{f.fund}</div>
        <div style={{ fontSize: 9, color: 'var(--tx3)' }}>{f.manager}</div>
      </td>
      <td style={{ padding: '9px 12px', textAlign: 'right' }}>
        <span style={{
          padding: '2px 7px', borderRadius: 5, fontSize: 9, fontWeight: 600,
          background: (CLS_COLORS[f.cls] ?? '#888') + '22',
          color: CLS_COLORS[f.cls] ?? '#888',
        }}>{f.cls}</span>
      </td>
      <td style={{ padding: '9px 12px', textAlign: 'right', fontSize: 11, color: 'var(--tx2)' }}>{fmt$(f.value)}</td>
      <td style={{ padding: '9px 12px', textAlign: 'right', fontSize: 11, color: 'var(--blue2)' }}>{f.mgmtFee.toFixed(2)}%</td>
      <td style={{ padding: '9px 12px', textAlign: 'right', fontSize: 11, color: f.carryRate > 0 ? 'var(--purple)' : 'var(--tx3)' }}>
        {f.carryRate > 0 ? `${f.carryRate}%` : '—'}
      </td>
      <td style={{ padding: '9px 12px', textAlign: 'right', fontSize: 11, fontWeight: 600, color: 'var(--tx)' }}>
        {fmtBig(f.feesYTD)}
      </td>
      <td style={{ padding: '9px 12px', textAlign: 'right', fontSize: 11, color: f.carryAccrued > 0 ? 'var(--purple)' : 'var(--tx3)' }}>
        {f.carryAccrued > 0 ? fmtBig(f.carryAccrued) : '—'}
      </td>
      <td style={{ padding: '9px 12px', textAlign: 'right' }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--green)' }}>{f.grossReturn}%</div>
        <div style={{ fontSize: 9, color: 'var(--tx3)' }}>Net ~{netApprox}%</div>
      </td>
    </tr>
  )
}

function ManagerRow({ m, expanded, onToggle, totalFees }) {
  const [hov, setHov] = useState(false)
  const share = ((m.feesYTD / totalFees) * 100).toFixed(0)
  return (
    <div>
      <div
        onClick={onToggle}
        onMouseEnter={() => setHov(true)}
        onMouseLeave={() => setHov(false)}
        style={{
          display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px',
          cursor: 'pointer', background: hov || expanded ? 'var(--surf)' : 'transparent',
          transition: 'background 0.1s',
        }}
      >
        <div style={{
          width: 28, height: 28, borderRadius: 8, flexShrink: 0,
          background: 'var(--bg4)', border: '1px solid var(--bdr2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 9, fontWeight: 700, color: 'var(--tx2)',
        }}>
          {m.manager.slice(0,2).toUpperCase()}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 11, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {m.manager}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 3 }}>
            <div style={{ flex: 1, height: 3, borderRadius: 2, background: 'var(--bg4)', overflow: 'hidden' }}>
              <div style={{ width: `${share}%`, height: '100%', background: 'var(--blue)', borderRadius: 2 }} />
            </div>
            <span style={{ fontSize: 9, color: 'var(--tx3)', flexShrink: 0 }}>{share}%</span>
          </div>
        </div>
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <div style={{ fontSize: 11, fontWeight: 600 }}>{fmtBig(m.feesYTD)}</div>
          {m.carryAccrued > 0 && <div style={{ fontSize: 9, color: 'var(--purple)' }}>+{fmtBig(m.carryAccrued)} carry</div>}
        </div>
        <span style={{ color: 'var(--tx3)', fontSize: 10, flexShrink: 0, transform: expanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }}>▾</span>
      </div>

      {/* Expanded fund breakdown */}
      {expanded && (
        <div style={{ background: 'var(--bg3)', borderTop: '1px solid var(--bdr)', paddingBottom: 6 }}>
          {m.funds.map(f => (
            <div key={f.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '7px 14px 7px 52px' }}>
              <div>
                <div style={{ fontSize: 10, color: 'var(--tx2)' }}>{f.fund}</div>
                <div style={{ fontSize: 9, color: 'var(--tx3)', marginTop: 1 }}>{f.mgmtFee}% mgmt{f.carryRate > 0 ? ` · ${f.carryRate}% carry` : ''}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--tx)' }}>{fmtBig(f.feesYTD)}</div>
                {f.carryAccrued > 0 && <div style={{ fontSize: 9, color: 'var(--purple)' }}>{fmtBig(f.carryAccrued)} carry</div>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function CarryCard({ fund: f }) {
  // Approx: how much return above hurdle has been achieved
  const returnAboveHurdle = Math.max(0, f.grossReturn - f.hurdle)
  // Progress toward full carry realization (assume 10% above hurdle = 100% carry earned)
  const progress = Math.min(100, (returnAboveHurdle / 10) * 100)
  const isEarning = returnAboveHurdle > 0
  const color = isEarning ? 'var(--purple)' : 'var(--amber)'

  return (
    <div style={{
      background: 'var(--bg3)', border: '1px solid var(--bdr)',
      borderRadius: 11, padding: '14px 16px',
    }}>
      <div style={{ fontSize: 11, fontWeight: 600, marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {f.fund}
      </div>
      <div style={{ fontSize: 9, color: 'var(--tx3)', marginBottom: 10 }}>{f.manager}</div>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
        <span style={{ fontSize: 9, color: 'var(--tx3)' }}>Hurdle rate</span>
        <span style={{ fontSize: 10, fontWeight: 600 }}>{f.hurdle}%</span>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
        <span style={{ fontSize: 9, color: 'var(--tx3)' }}>Gross return</span>
        <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--green)' }}>{f.grossReturn}%</span>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
        <span style={{ fontSize: 9, color: 'var(--tx3)' }}>Carry accrued</span>
        <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--purple)' }}>{fmtBig(f.carryAccrued)}</span>
      </div>

      {/* Progress bar */}
      <div style={{ height: 5, borderRadius: 3, background: 'var(--bg4)', overflow: 'hidden', marginBottom: 4 }}>
        <div style={{
          width: `${progress}%`, height: '100%', borderRadius: 3,
          background: isEarning
            ? `linear-gradient(90deg, var(--purple), var(--blue))`
            : 'var(--amber)',
          transition: 'width 0.4s ease',
        }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9 }}>
        <span style={{ color: isEarning ? color : 'var(--amber)' }}>
          {isEarning ? `+${returnAboveHurdle.toFixed(1)}% above hurdle` : `${Math.abs(returnAboveHurdle).toFixed(1)}% below hurdle`}
        </span>
        <span style={{ color: 'var(--tx3)' }}>{f.carryRate}% rate</span>
      </div>
    </div>
  )
}
