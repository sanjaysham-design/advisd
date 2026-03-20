import React, { useState } from 'react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, PieChart, Pie,
} from 'recharts'
import { C } from './ClientPortal'

const fmt$M  = v => `$${(v / 1_000_000).toFixed(1)}M`
const fmt$K  = v => v >= 0 ? `+$${(v / 1_000).toFixed(0)}K` : `-$${(Math.abs(v) / 1_000).toFixed(0)}K`
const fmtPct = v => `${v > 0 ? '+' : ''}${v.toFixed(1)}%`

const PERIODS = [
  { id: '3m',   label: '3M',            months: 3  },
  { id: '6m',   label: '6M',            months: 6  },
  { id: 'ytd',  label: 'YTD',           months: 3  },  // approx
  { id: '1y',   label: '1Y',            months: 12 },
  { id: '2y',   label: '2Y',            months: 24 },
  { id: 'all',  label: 'All',           months: 99 },
]

export default function ClientOverview({ data, clientName }) {
  const [period, setPeriod] = useState('1y')

  const months = PERIODS.find(p => p.id === period)?.months ?? 12
  const sliced = data.navHistory.slice(-months)

  const startNav = sliced[0]?.nav ?? 0
  const endNav   = sliced[sliced.length - 1]?.nav ?? 0
  const gain     = endNav - startNav
  const gainPct  = startNav > 0 ? ((gain / startNav) * 100) : 0

  // Donut inner label
  const totalAlloc = data.allocation.reduce((s, a) => s + a.pct, 0)

  return (
    <div>
      {/* ── Hero: net worth ───────────────────────────────────────────── */}
      <div style={{ marginBottom: 40 }}>
        <div style={{ fontSize: 13, color: C.tx2, marginBottom: 10, letterSpacing: '0.3px', textTransform: 'uppercase', fontWeight: 500 }}>
          Portfolio Value
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 18, flexWrap: 'wrap' }}>
          <div style={{ fontSize: 52, fontWeight: 800, letterSpacing: '-2px', color: C.tx, lineHeight: 1 }}>
            {fmt$M(data.aum)}
          </div>
          <div style={{ marginBottom: 6 }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              background: data.ytdGain >= 0 ? 'rgba(74,222,128,0.12)' : 'rgba(248,113,113,0.12)',
              color: data.ytdGain >= 0 ? C.grn : C.red,
              padding: '6px 12px', borderRadius: 10,
              fontSize: 16, fontWeight: 700,
            }}>
              {data.ytdGain >= 0 ? '↑' : '↓'}
              {fmt$M(Math.abs(data.ytdGain))} ({fmtPct(data.ytdPct)})
            </div>
            <div style={{ fontSize: 11, color: C.tx3, marginTop: 5 }}>Year to date · Since Jan 1</div>
          </div>
        </div>
        <div style={{ fontSize: 13, color: C.tx2, marginTop: 14 }}>
          Managed since {data.inception} · {data.advisor}, Senior Advisor
        </div>
      </div>

      {/* ── Row: Performance chart + Allocation donut ─────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 20, marginBottom: 24 }}>

        {/* Chart */}
        <div style={{ background: C.card, border: `1px solid ${C.bdr}`, borderRadius: 20, padding: '24px 24px 18px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600 }}>Portfolio Growth</div>
              <div style={{ fontSize: 12, color: C.tx2, marginTop: 4 }}>
                {sliced[0]?.m} → {sliced[sliced.length - 1]?.m}
                <span style={{
                  marginLeft: 8,
                  color: gain >= 0 ? C.grn : C.red,
                  fontWeight: 600,
                }}>
                  {gain >= 0 ? '+' : ''}{fmt$M(gain)} ({fmtPct(gainPct)})
                </span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 4 }}>
              {PERIODS.map(p => (
                <button
                  key={p.id}
                  onClick={() => setPeriod(p.id)}
                  style={{
                    padding: '4px 8px', borderRadius: 6, border: 'none',
                    fontFamily: 'inherit', fontSize: 11, fontWeight: period === p.id ? 600 : 400,
                    cursor: 'pointer', transition: 'all 0.15s',
                    background: period === p.id ? 'rgba(129,140,248,0.18)' : C.surf,
                    color:      period === p.id ? C.acc : C.tx2,
                    outline:    period === p.id ? `1px solid rgba(129,140,248,0.3)` : '1px solid transparent',
                  }}
                >{p.label}</button>
              ))}
            </div>
          </div>
          <div style={{ height: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={sliced} margin={{ top: 4, right: 4, left: 8, bottom: 4 }}>
                <defs>
                  <linearGradient id="navGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%"   stopColor="#818cf8" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="#818cf8" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                <XAxis
                  dataKey="m"
                  tick={{ fill: C.tx3, fontSize: 10 }}
                  tickLine={false} axisLine={false}
                  interval={Math.max(0, Math.floor(sliced.length / 6) - 1)}
                />
                <YAxis
                  tickFormatter={v => `$${(v / 1_000_000).toFixed(0)}M`}
                  tick={{ fill: C.tx3, fontSize: 10 }}
                  tickLine={false} axisLine={false}
                  domain={['auto','auto']}
                />
                <Tooltip
                  contentStyle={{ background: C.card2, border: `1px solid ${C.bdr2}`, borderRadius: 10, fontSize: 12 }}
                  formatter={v => [fmt$M(v), 'Portfolio Value']}
                />
                <Area
                  dataKey="nav"
                  type="monotone"
                  stroke={C.acc}
                  strokeWidth={2.5}
                  fill="url(#navGrad)"
                  dot={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Allocation donut */}
        <div style={{ background: C.card, border: `1px solid ${C.bdr}`, borderRadius: 20, padding: 24, display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>Allocation</div>
          <div style={{ fontSize: 12, color: C.tx2, marginBottom: 16 }}>How your money is invested</div>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', height: 160 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.allocation}
                  dataKey="pct"
                  nameKey="name"
                  cx="50%" cy="50%"
                  innerRadius={48}
                  outerRadius={72}
                  paddingAngle={2}
                  startAngle={90}
                  endAngle={-270}
                >
                  {data.allocation.map((a, i) => (
                    <Cell key={i} fill={a.color} opacity={0.85} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ background: C.card2, border: `1px solid ${C.bdr2}`, borderRadius: 10, fontSize: 12 }}
                  formatter={(v, n) => [`${v}%`, n]}
                />
              </PieChart>
            </ResponsiveContainer>
            {/* Center label */}
            <div style={{
              position: 'absolute',
              top: '50%', left: '50%',
              transform: 'translate(-50%, -50%)',
              textAlign: 'center', pointerEvents: 'none',
            }}>
              <div style={{ fontSize: 18, fontWeight: 700 }}>{fmt$M(data.aum)}</div>
              <div style={{ fontSize: 10, color: C.tx3 }}>Total</div>
            </div>
          </div>
          <div style={{ marginTop: 12 }}>
            {data.allocation.map(a => (
              <div key={a.name} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 0' }}>
                <span style={{ width: 8, height: 8, borderRadius: 2, background: a.color, flexShrink: 0, display: 'inline-block' }} />
                <span style={{ flex: 1, fontSize: 12, color: C.tx2 }}>{a.name}</span>
                <span style={{ fontSize: 12, fontWeight: 600 }}>{a.pct}%</span>
                <span style={{ fontSize: 11, color: C.tx3, minWidth: 52, textAlign: 'right' }}>
                  {fmt$M(data.aum * a.pct / 100)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Stats row ─────────────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
        {[
          { label: 'Net IRR',         value: `${data.irr}%`,         sub: 'Since inception' },
          { label: 'TWRR (3-Year)',   value: `${data.twrr}%`,        sub: 'Time-weighted' },
          { label: 'YTD Gain',        value: fmt$M(data.ytdGain),    sub: fmtPct(data.ytdPct) + ' return' },
          { label: 'Inception',       value: data.inception,          sub: 'Portfolio opened' },
        ].map(({ label, value, sub }) => (
          <div key={label} style={{ background: C.card, border: `1px solid ${C.bdr}`, borderRadius: 16, padding: '18px 20px' }}>
            <div style={{ fontSize: 11, color: C.tx3, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.4px' }}>{label}</div>
            <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.5px', color: C.tx }}>{value}</div>
            <div style={{ fontSize: 11, color: C.tx2, marginTop: 6 }}>{sub}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
