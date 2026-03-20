import React, { useState } from 'react'
import {
  ComposedChart, Bar, Line, XAxis, YAxis, Tooltip,
  ResponsiveContainer, ReferenceLine, Area, CartesianGrid, Cell,
} from 'recharts'

// ─── Per-client liquidity profiles ──────────────────────────────────────────
const PROFILES = {
  'Meridian Capital Partners': {
    aum: 47.3,
    liquid: {
      cash:         4200000,
      moneyMarket:  3800000,
      shortBonds:   2900000,
      publicEquity: 10400000,
    },
    // calls: month index 0=Jan 1=Feb etc., relative to today (Mar 2026 = month 0)
    scheduledCalls: [
      { fund: 'Blackstone BREIT (Call #5)',        month: 1,  amount: 350000,  urgency: 'upcoming' },
      { fund: 'KKR North America XII (Call #3)',   month: 2,  amount: 750000,  urgency: 'upcoming' },
      { fund: 'Vista Equity Partners (Call #2)',   month: 3,  amount: 750000,  urgency: 'future'   },
      { fund: 'Apollo Global Real Estate',         month: 5,  amount: 500000,  urgency: 'future'   },
      { fund: 'Blackstone BREIT (Call #6)',        month: 8,  amount: 350000,  urgency: 'future'   },
      { fund: 'KKR North America XII (Call #4)',   month: 10, amount: 1100000, urgency: 'future'   },
    ],
  },
  'Okonkwo Family Trust': {
    aum: 38.2,
    liquid: {
      cash:         1200000,
      moneyMarket:  1900000,
      shortBonds:   2800000,
      publicEquity: 8200000,
    },
    scheduledCalls: [
      { fund: 'Apollo Global XII (Call #1)',       month: 0,  amount: 2400000, urgency: 'urgent'   },
      { fund: 'Carlyle Partners VII',              month: 2,  amount: 1200000, urgency: 'future'   },
      { fund: 'Warburg Pincus XII',                month: 5,  amount: 800000,  urgency: 'future'   },
      { fund: 'Apollo Global XII (Call #2)',       month: 9,  amount: 1600000, urgency: 'future'   },
    ],
  },
  'Chen Family Office': {
    aum: 42.1,
    liquid: {
      cash:         5100000,
      moneyMarket:  4200000,
      shortBonds:   3600000,
      publicEquity: 11800000,
    },
    scheduledCalls: [
      { fund: 'Sequoia Capital Growth (Call #2)',  month: 1,  amount: 600000,  urgency: 'upcoming' },
      { fund: 'Carlyle Partners VII (Call #1)',    month: 2,  amount: 500000,  urgency: 'future'   },
      { fund: 'Andreessen Horowitz Fund IV',       month: 5,  amount: 400000,  urgency: 'future'   },
      { fund: 'Sequoia Capital Growth (Call #3)',  month: 9,  amount: 700000,  urgency: 'future'   },
    ],
  },
  'Park & Lee Family Office': {
    aum: 31.6,
    liquid: {
      cash:         3400000,
      moneyMarket:  3100000,
      shortBonds:   2200000,
      publicEquity: 7800000,
    },
    scheduledCalls: [
      { fund: 'Brookfield Infrastructure IV',     month: 2,  amount: 800000,  urgency: 'future'   },
      { fund: 'Blackstone Real Estate X',         month: 8,  amount: 600000,  urgency: 'future'   },
    ],
  },
  'Rosenberg Family Trust': {
    aum: 19.6,
    liquid: {
      cash:         1400000,
      moneyMarket:  1600000,
      shortBonds:   1800000,
      publicEquity: 5100000,
    },
    scheduledCalls: [
      { fund: 'Vista Equity Partners VIII',       month: 0,  amount: 900000,  urgency: 'upcoming' },
      { fund: 'Silver Lake Partners VI',          month: 6,  amount: 600000,  urgency: 'future'   },
    ],
  },
}

const MONTHS = ['Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb']

function fmt(n) {
  if (!n && n !== 0) return '—'
  if (n >= 1_000_000) return '$' + (n / 1_000_000).toFixed(2) + 'M'
  if (n >= 1_000) return '$' + (n / 1_000).toFixed(0) + 'K'
  return '$' + n
}

function fmtM(n) {
  if (n >= 1_000_000) return '$' + (n / 1_000_000).toFixed(1) + 'M'
  if (n >= 1_000) return '$' + (n / 1_000).toFixed(0) + 'K'
  return '$' + n
}

const LIQUID_COLORS = {
  cash:         { color: '#3b82f6', label: 'Cash & Equivalents' },
  moneyMarket:  { color: '#22c55e', label: 'Money Market Funds' },
  shortBonds:   { color: '#14b8a6', label: 'Short-Term Bonds' },
  publicEquity: { color: '#a78bfa', label: 'Public Equity (near-liquid)' },
}

const urgencyColor = {
  urgent:   '#ef4444',
  upcoming: '#f59e0b',
  future:   '#3b82f6',
}

function coverageStatus(ratio) {
  if (ratio >= 3)   return { label: 'Healthy',  color: '#22c55e', bg: 'rgba(34,197,94,0.1)',   border: 'rgba(34,197,94,0.25)'   }
  if (ratio >= 1.5) return { label: 'Adequate', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)',  border: 'rgba(245,158,11,0.25)'  }
  if (ratio >= 1)   return { label: 'Tight',    color: '#f97316', bg: 'rgba(249,115,22,0.1)',  border: 'rgba(249,115,22,0.25)'  }
  return              { label: 'At Risk',  color: '#ef4444', bg: 'rgba(239,68,68,0.1)',   border: 'rgba(239,68,68,0.25)'   }
}

export default function Liquidity({ activeClient }) {
  const [period, setPeriod] = useState('12mo')
  const clientName = activeClient?.name || 'Meridian Capital Partners'
  const profile = PROFILES[clientName] || PROFILES['Meridian Capital Partners']

  const { aum, liquid, scheduledCalls } = profile
  const totalLiquid = Object.values(liquid).reduce((s, v) => s + v, 0)
  const minBuffer = aum * 1_000_000 * 0.08  // 8% of AUM as minimum buffer

  // Compute calls per period
  const periodMonths = period === '3mo' ? 3 : period === '6mo' ? 6 : 12
  const callsInPeriod = scheduledCalls.filter(c => c.month < periodMonths)
  const totalCallsPeriod = callsInPeriod.reduce((s, c) => s + c.amount, 0)
  const coverageRatio = totalCallsPeriod > 0 ? totalLiquid / totalCallsPeriod : 99
  const status = coverageStatus(coverageRatio)

  // Build waterfall chart data — running balance month by month
  const waterfallData = MONTHS.map((month, i) => {
    const callsThisMonth = scheduledCalls
      .filter(c => c.month === i)
      .reduce((s, c) => s + c.amount, 0)
    return { month, calls: callsThisMonth }
  })

  // Running balance line
  let running = totalLiquid
  const waterfallWithBalance = waterfallData.map(d => {
    running -= d.calls
    return { ...d, balance: running, buffer: minBuffer }
  })
  // Add starting point
  const chartData = [
    { month: 'Now', calls: 0, balance: totalLiquid, buffer: minBuffer },
    ...waterfallWithBalance,
  ]

  // 3mo / 6mo coverage figures
  const calls3mo  = scheduledCalls.filter(c => c.month < 3).reduce((s, c) => s + c.amount, 0)
  const calls6mo  = scheduledCalls.filter(c => c.month < 6).reduce((s, c) => s + c.amount, 0)
  const calls12mo = scheduledCalls.filter(c => c.month < 12).reduce((s, c) => s + c.amount, 0)
  const cov3  = calls3mo  > 0 ? totalLiquid / calls3mo  : 99
  const cov6  = calls6mo  > 0 ? totalLiquid / calls6mo  : 99
  const cov12 = calls12mo > 0 ? totalLiquid / calls12mo : 99

  // Check if balance ever drops below buffer
  const stressMonths = waterfallWithBalance.filter(d => d.balance < minBuffer)

  return (
    <div className="fade-up" style={{ padding: '20px 24px' }}>

      {/* Stress warning */}
      {stressMonths.length > 0 && (
        <div style={{
          background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)',
          borderRadius: 10, padding: '10px 14px', marginBottom: 18,
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <span style={{ fontSize: 14 }}>⚠️</span>
          <div>
            <span style={{ fontSize: 12, fontWeight: 600, color: '#ef4444' }}>Liquidity Stress Detected</span>
            <span style={{ fontSize: 12, color: 'var(--tx2)', marginLeft: 8 }}>
              Running liquid balance drops below the 8% AUM minimum buffer in{' '}
              <strong>{stressMonths.map(d => d.month).join(', ')}</strong>.
              Consider pre-positioning cash or arranging a credit facility.
            </span>
          </div>
        </div>
      )}

      {/* Coverage KPIs — 3 / 6 / 12 month */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 20 }}>
        {[
          { label: '3-Month Coverage', calls: calls3mo,  cov: cov3,  months: 3  },
          { label: '6-Month Coverage', calls: calls6mo,  cov: cov6,  months: 6  },
          { label: '12-Month Coverage', calls: calls12mo, cov: cov12, months: 12 },
        ].map(({ label, calls, cov }) => {
          const s = coverageStatus(cov)
          const ratio = cov >= 99 ? '∞' : cov.toFixed(1) + 'x'
          return (
            <div key={label} style={{
              background: s.bg, border: `1px solid ${s.border}`,
              borderRadius: 12, padding: '14px 16px',
            }}>
              <div style={{ fontSize: 10, color: 'var(--tx3)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 6 }}>{label}</div>
              <div style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-1px', color: s.color, marginBottom: 4 }}>{ratio}</div>
              <div style={{ fontSize: 11, fontWeight: 600, color: s.color, marginBottom: 4 }}>
                <span style={{ display: 'inline-block', width: 7, height: 7, borderRadius: 2, background: s.color, marginRight: 5, verticalAlign: 'middle' }} />
                {s.label}
              </div>
              <div style={{ fontSize: 10, color: 'var(--tx3)' }}>
                {calls > 0 ? `${fmtM(calls)} in calls · ${fmtM(totalLiquid)} liquid` : 'No calls scheduled'}
              </div>
            </div>
          )
        })}
      </div>

      {/* Total liquid assets breakdown */}
      <Card title="Liquid Assets" sub={`${fmtM(totalLiquid)} total available · Illiquid alts excluded`} style={{ marginBottom: 14 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          <div>
            {Object.entries(liquid).map(([key, val]) => {
              const { color, label } = LIQUID_COLORS[key]
              const pct = ((val / totalLiquid) * 100).toFixed(0)
              return (
                <div key={key} style={{ marginBottom: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                    <span style={{ fontSize: 11, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ width: 8, height: 8, borderRadius: 2, background: color, display: 'inline-block', flexShrink: 0 }} />
                      {label}
                    </span>
                    <span style={{ fontSize: 11, fontWeight: 600 }}>{fmtM(val)}</span>
                  </div>
                  <div style={{ height: 5, borderRadius: 3, background: 'var(--bdr)', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${pct}%`, borderRadius: 3, background: color }} />
                  </div>
                  <div style={{ fontSize: 9, color: 'var(--tx3)', marginTop: 2 }}>{pct}% of total liquid</div>
                </div>
              )
            })}
          </div>

          <div>
            <div style={{ fontSize: 11, fontWeight: 600, marginBottom: 10 }}>Minimum Safety Buffer</div>
            <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-1px', marginBottom: 4 }}>{fmtM(minBuffer)}</div>
            <div style={{ fontSize: 10, color: 'var(--tx3)', marginBottom: 12 }}>8% of AUM · ${aum}M</div>
            <div style={{ height: 5, borderRadius: 3, background: 'var(--bdr)', overflow: 'hidden', marginBottom: 4 }}>
              <div style={{
                height: '100%', borderRadius: 3,
                width: `${Math.min((minBuffer / totalLiquid) * 100, 100)}%`,
                background: '#ef4444', opacity: 0.7,
              }} />
            </div>
            <div style={{ fontSize: 9, color: 'var(--tx3)', marginBottom: 16 }}>
              Buffer = {((minBuffer / totalLiquid) * 100).toFixed(0)}% of liquid assets
            </div>

            <div style={{ background: 'var(--bg)', border: '1px solid var(--bdr)', borderRadius: 8, padding: '10px 12px', fontSize: 10, color: 'var(--tx3)', lineHeight: 1.6 }}>
              <strong style={{ color: 'var(--tx2)' }}>Note:</strong> Public equity is treated as near-liquid (T+2 settlement).
              PE, real estate, and hedge fund positions are illiquid and are <em>not</em> counted here.
              Actual liquidation of public equity may incur market impact costs.
            </div>
          </div>
        </div>
      </Card>

      {/* 12-month waterfall chart */}
      <Card
        title="12-Month Liquidity Waterfall"
        sub="Running liquid balance as capital calls are funded. Dashed line = 8% AUM minimum buffer."
        style={{ marginBottom: 14 }}
        right={
          <div style={{ display: 'flex', gap: 3 }}>
            {['3mo', '6mo', '12mo'].map(p => (
              <PeriodPill key={p} label={p} active={period === p} onClick={() => setPeriod(p)} />
            ))}
          </div>
        }
      >
        <div style={{ display: 'flex', gap: 16, marginBottom: 10, flexWrap: 'wrap' }}>
          <LegendItem color="#3b82f6" label="Liquid Balance" type="line" />
          <LegendItem color="#ef4444" label="Capital Calls" type="bar" />
          <LegendItem color="#ef444466" label="Min. Buffer (8% AUM)" type="dashed" />
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <ComposedChart data={chartData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
            <CartesianGrid vertical={false} stroke="var(--bdr)" strokeOpacity={0.5} />
            <XAxis dataKey="month" tick={{ fontSize: 9, fill: '#4a4a62' }} axisLine={false} tickLine={false} />
            <YAxis
              tick={{ fontSize: 9, fill: '#4a4a62' }} axisLine={false} tickLine={false}
              tickFormatter={v => v >= 1_000_000 ? `$${(v / 1_000_000).toFixed(0)}M` : `$${(v / 1000).toFixed(0)}K`}
            />
            <Tooltip
              contentStyle={{ background: 'var(--bg3)', border: '1px solid var(--bdr2)', borderRadius: 8, fontSize: 11 }}
              labelStyle={{ color: 'var(--tx2)', marginBottom: 4 }}
              formatter={(val, name) => [fmtM(val), name === 'balance' ? 'Liquid Balance' : name === 'calls' ? 'Capital Calls' : 'Min. Buffer']}
            />
            <Bar dataKey="calls" name="calls" radius={[3, 3, 0, 0]} maxBarSize={28}>
              {chartData.map((entry, i) => (
                <Cell
                  key={i}
                  fill={entry.calls > 0 ? '#ef4444' : 'transparent'}
                  fillOpacity={0.75}
                />
              ))}
            </Bar>
            <ReferenceLine y={minBuffer} stroke="#ef4444" strokeDasharray="5 3" strokeOpacity={0.5} />
            <Line
              type="monotone" dataKey="balance" name="balance"
              stroke="#3b82f6" strokeWidth={2.5} dot={{ r: 3, fill: '#3b82f6', strokeWidth: 0 }}
              activeDot={{ r: 5 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </Card>

      {/* Scheduled calls timeline */}
      <Card title="Scheduled Capital Calls" sub="All calls in the next 12 months with liquidity impact">
        {scheduledCalls.length === 0 ? (
          <div style={{ padding: '24px 0', textAlign: 'center', color: 'var(--tx3)', fontSize: 12 }}>
            No capital calls scheduled — liquidity position is unconstrained.
          </div>
        ) : (
          <div>
            {/* Running tally header */}
            <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
              <div style={{ flex: 1, background: 'var(--bg)', border: '1px solid var(--bdr)', borderRadius: 8, padding: '10px 12px' }}>
                <div style={{ fontSize: 9, color: 'var(--tx3)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4 }}>Total Scheduled (12mo)</div>
                <div style={{ fontSize: 18, fontWeight: 700, letterSpacing: '-0.5px' }}>{fmtM(calls12mo)}</div>
              </div>
              <div style={{ flex: 1, background: 'var(--bg)', border: '1px solid var(--bdr)', borderRadius: 8, padding: '10px 12px' }}>
                <div style={{ fontSize: 9, color: 'var(--tx3)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4 }}>Liquid After All Calls</div>
                <div style={{ fontSize: 18, fontWeight: 700, letterSpacing: '-0.5px', color: (totalLiquid - calls12mo) > minBuffer ? '#22c55e' : '#ef4444' }}>
                  {fmtM(totalLiquid - calls12mo)}
                </div>
              </div>
              <div style={{ flex: 1, background: 'var(--bg)', border: '1px solid var(--bdr)', borderRadius: 8, padding: '10px 12px' }}>
                <div style={{ fontSize: 9, color: 'var(--tx3)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4 }}>Calls as % of Liquid</div>
                <div style={{ fontSize: 18, fontWeight: 700, letterSpacing: '-0.5px', color: (calls12mo / totalLiquid) > 0.5 ? '#f59e0b' : 'var(--tx)' }}>
                  {((calls12mo / totalLiquid) * 100).toFixed(1)}%
                </div>
              </div>
            </div>

            {/* Call rows */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {[...scheduledCalls].sort((a, b) => a.month - b.month).map((call, i) => {
                const fundedFromCash = (liquid.cash + liquid.moneyMarket) >= call.amount
                const runningBefore = totalLiquid - scheduledCalls
                  .filter(c => c.month < call.month)
                  .reduce((s, c) => s + c.amount, 0)
                const runningAfter = runningBefore - call.amount
                const tightAfter = runningAfter < minBuffer

                return (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '10px 12px', borderRadius: 8,
                    background: 'var(--surf)', border: `1px solid ${tightAfter ? 'rgba(239,68,68,0.3)' : 'var(--bdr)'}`,
                  }}>
                    {/* Urgency dot */}
                    <div style={{ width: 8, height: 8, borderRadius: '50%', flexShrink: 0, background: urgencyColor[call.urgency] }} />

                    {/* Month badge */}
                    <div style={{
                      width: 32, height: 32, borderRadius: 7, flexShrink: 0,
                      background: 'var(--bg)', border: '1px solid var(--bdr)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 9, fontWeight: 700, color: 'var(--tx2)', lineHeight: 1.2,
                      textAlign: 'center',
                    }}>
                      {MONTHS[call.month]}
                    </div>

                    {/* Fund name */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {call.fund}
                      </div>
                      <div style={{ fontSize: 9, color: 'var(--tx3)', marginTop: 1, display: 'flex', gap: 8 }}>
                        <span style={{ color: urgencyColor[call.urgency] }}>
                          {call.urgency.charAt(0).toUpperCase() + call.urgency.slice(1)}
                        </span>
                        <span>Balance after: {fmtM(runningAfter)}</span>
                        {tightAfter && <span style={{ color: '#ef4444', fontWeight: 600 }}>⚠ Below buffer</span>}
                      </div>
                    </div>

                    {/* Amount */}
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: urgencyColor[call.urgency] }}>
                        {fmtM(call.amount)}
                      </div>
                      <div style={{
                        fontSize: 9, marginTop: 2,
                        color: fundedFromCash ? '#22c55e' : '#f59e0b',
                      }}>
                        {fundedFromCash ? '✓ Cash available' : '↕ May need equity sale'}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}

function PeriodPill({ label, active, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        padding: '4px 10px', borderRadius: 6, cursor: 'pointer',
        fontSize: 10, fontWeight: 500,
        background: active ? 'var(--blue)' : 'var(--surf)',
        color: active ? '#fff' : 'var(--tx3)',
        border: active ? 'none' : '1px solid var(--bdr)',
        transition: 'all 0.15s',
      }}
    >{label}</div>
  )
}

function LegendItem({ color, label, type }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 10, color: 'var(--tx3)' }}>
      {type === 'line' && (
        <span style={{ display: 'inline-block', width: 18, height: 2.5, borderRadius: 2, background: color }} />
      )}
      {type === 'bar' && (
        <span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: 2, background: color, opacity: 0.75 }} />
      )}
      {type === 'dashed' && (
        <span style={{ display: 'inline-block', width: 18, height: 0, borderBottom: `2px dashed ${color}` }} />
      )}
      {label}
    </div>
  )
}

function Card({ title, sub, children, style, right }) {
  return (
    <div style={{ background: 'var(--surf)', border: '1px solid var(--bdr)', borderRadius: 12, padding: '14px 16px', ...style }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: 12 }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 500 }}>{title}</div>
          {sub && <div style={{ fontSize: 10, color: 'var(--tx3)', marginTop: 1 }}>{sub}</div>}
        </div>
        {right && <div style={{ marginLeft: 'auto' }}>{right}</div>}
      </div>
      {children}
    </div>
  )
}
