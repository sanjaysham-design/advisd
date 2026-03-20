import React, { useState } from 'react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, PieChart, Pie,
} from 'recharts'
import { C } from './ClientPortal'

const fmt$M  = v => `$${(v / 1_000_000).toFixed(1)}M`
const fmt$K  = v => v >= 0 ? `+$${(v / 1_000).toFixed(0)}K` : `-$${(Math.abs(v) / 1_000).toFixed(0)}K`
const fmtPct = v => `${v > 0 ? '+' : ''}${v.toFixed(1)}%`
const fmt$   = v => v >= 1_000_000
  ? `$${(v / 1_000_000).toFixed(2)}M`
  : `$${(v / 1_000).toFixed(0)}K`

const DEFAULT_SHOW = 10

const PERIODS = [
  { id: '3m',   label: '3M',            months: 3  },
  { id: '6m',   label: '6M',            months: 6  },
  { id: 'ytd',  label: 'YTD',           months: 3  },  // approx
  { id: '1y',   label: '1Y',            months: 12 },
  { id: '2y',   label: '2Y',            months: 24 },
  { id: 'all',  label: 'All',           months: 99 },
]

export default function ClientOverview({ data, clientName }) {
  const [period,    setPeriod]    = useState('1y')
  const [showAll,   setShowAll]   = useState(false)
  const [expanded,  setExpanded]  = useState(null)   // fund name of expanded row

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
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 32 }}>
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

      {/* ── Holdings ──────────────────────────────────────────────────── */}
      {data.holdings && data.holdings.length > 0 && (
        <HoldingsModule
          holdings={data.holdings}
          showAll={showAll}
          setShowAll={setShowAll}
          expanded={expanded}
          setExpanded={setExpanded}
        />
      )}
    </div>
  )
}

// ── Holdings module ────────────────────────────────────────────────────────────
function HoldingsModule({ holdings, showAll, setShowAll, expanded, setExpanded }) {
  const sorted  = [...holdings].sort((a, b) => b.value - a.value)
  const visible = showAll ? sorted : sorted.slice(0, DEFAULT_SHOW)
  const hidden  = sorted.length - DEFAULT_SHOW

  return (
    <div style={{ background: C.card, border: `1px solid ${C.bdr}`, borderRadius: 20, overflow: 'hidden' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '22px 24px 18px' }}>
        <div>
          <div style={{ fontSize: 16, fontWeight: 600 }}>Your Holdings</div>
          <div style={{ fontSize: 12, color: C.tx2, marginTop: 3 }}>
            {holdings.length} positions · Sorted by value
          </div>
        </div>
        <div style={{
          fontSize: 11, color: C.tx3,
          background: C.surf, borderRadius: 8, padding: '5px 10px',
        }}>
          As of March 2026
        </div>
      </div>

      {/* Column headers */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '2fr 120px 110px 90px 90px 80px',
        padding: '8px 24px',
        borderTop: `1px solid ${C.bdr}`,
        borderBottom: `1px solid ${C.bdr}`,
        background: C.surf,
      }}>
        {['Fund / Investment', 'Type', 'Value', '% of Portfolio', 'Return', 'Vintage'].map(h => (
          <div key={h} style={{ fontSize: 10, color: C.tx3, textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 500 }}>
            {h}
          </div>
        ))}
      </div>

      {/* Rows */}
      {visible.map((h, i) => {
        const isOpen = expanded === h.name
        return (
          <div key={h.name}>
            <div
              onClick={() => setExpanded(isOpen ? null : h.name)}
              style={{
                display: 'grid',
                gridTemplateColumns: '2fr 120px 110px 90px 90px 80px',
                padding: '14px 24px',
                borderBottom: `1px solid ${C.bdr}`,
                cursor: 'pointer',
                transition: 'background 0.12s',
                background: isOpen ? C.surf : i % 2 === 1 ? 'rgba(255,255,255,0.015)' : 'transparent',
              }}
              onMouseEnter={e => { if (!isOpen) e.currentTarget.style.background = 'rgba(255,255,255,0.03)' }}
              onMouseLeave={e => { e.currentTarget.style.background = isOpen ? C.surf : i % 2 === 1 ? 'rgba(255,255,255,0.015)' : 'transparent' }}
            >
              {/* Name + status */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                  background: `${h.color}22`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <span style={{ fontSize: 13 }}>
                    {h.type === 'Real Estate' ? '🏢' :
                     h.type === 'Private Equity' ? '🏦' :
                     h.type === 'Hedge Fund' ? '📊' :
                     h.type === 'Credit' ? '📋' :
                     h.type === 'Equity' ? '📈' : '💵'}
                  </span>
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: C.tx }}>{h.name}</div>
                  {h.status === 'mature' && (
                    <div style={{ fontSize: 10, color: C.amb, marginTop: 2 }}>Fully deployed · Harvesting</div>
                  )}
                </div>
                <svg
                  viewBox="0 0 10 10" width={12} height={12}
                  fill="none" stroke={C.tx3} strokeWidth="1.5"
                  style={{ marginLeft: 4, transition: 'transform 0.15s', transform: isOpen ? 'rotate(180deg)' : 'none', flexShrink: 0 }}
                >
                  <polyline points="2,3 5,7 8,3"/>
                </svg>
              </div>

              {/* Type badge */}
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <span style={{
                  fontSize: 10, fontWeight: 500, padding: '3px 8px', borderRadius: 6,
                  background: `${h.color}1a`, color: h.color,
                }}>
                  {h.type}
                </span>
              </div>

              {/* Value */}
              <div style={{ display: 'flex', alignItems: 'center', fontSize: 13, fontWeight: 600 }}>
                {fmt$(h.value)}
              </div>

              {/* % of portfolio bar */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ flex: 1, height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.06)', overflow: 'hidden', maxWidth: 48 }}>
                  <div style={{ height: '100%', width: `${Math.min(100, h.pct * 3)}%`, background: h.color, borderRadius: 2, opacity: 0.7 }} />
                </div>
                <span style={{ fontSize: 11, color: C.tx2, minWidth: 28 }}>{h.pct}%</span>
              </div>

              {/* Return */}
              <div style={{ display: 'flex', alignItems: 'center', flexDirection: 'column', alignItems: 'flex-start', gap: 2 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: C.grn }}>{h.ret}%</span>
                <span style={{ fontSize: 9, color: C.tx3 }}>{h.retLabel}</span>
              </div>

              {/* Vintage + TVPI */}
              <div style={{ display: 'flex', alignItems: 'center', flexDirection: 'column', alignItems: 'flex-start', gap: 2 }}>
                <span style={{ fontSize: 12, color: C.tx2 }}>{h.vintage ?? '—'}</span>
                {h.tvpi && <span style={{ fontSize: 9, color: C.tx3 }}>{h.tvpi}x TVPI</span>}
              </div>
            </div>

            {/* Expanded detail panel */}
            {isOpen && (
              <div style={{
                padding: '16px 24px 20px 24px',
                borderBottom: `1px solid ${C.bdr}`,
                background: C.surf,
                display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16,
              }}>
                <DetailStat label="Current Value"    value={fmt$(h.value)} />
                <DetailStat label="Portfolio Weight"  value={`${h.pct}%`} />
                <DetailStat label={h.retLabel}        value={`${h.ret}%`} />
                {h.tvpi
                  ? <DetailStat label="TVPI Multiple"  value={`${h.tvpi}x`} sub="Total Value to Paid-In" />
                  : <DetailStat label="Asset Type"     value={h.type} />
                }
                {h.vintage && <DetailStat label="Vintage Year"  value={h.vintage} />}
                <DetailStat label="Status" value={h.status === 'mature' ? 'Harvesting' : 'Active / Deploying'} />
              </div>
            )}
          </div>
        )
      })}

      {/* Show more / less */}
      {holdings.length > DEFAULT_SHOW && (
        <div style={{ padding: '16px 24px', textAlign: 'center' }}>
          <button
            onClick={() => setShowAll(v => !v)}
            style={{
              background: C.surf, border: `1px solid ${C.bdr2}`,
              color: C.acc, borderRadius: 10, padding: '9px 24px',
              fontFamily: 'inherit', fontSize: 12, fontWeight: 500,
              cursor: 'pointer', transition: 'all 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(129,140,248,0.10)'}
            onMouseLeave={e => e.currentTarget.style.background = C.surf}
          >
            {showAll
              ? `Show less`
              : `Show ${hidden} more position${hidden !== 1 ? 's' : ''}`}
          </button>
        </div>
      )}
    </div>
  )
}

function DetailStat({ label, value, sub }) {
  return (
    <div>
      <div style={{ fontSize: 10, color: C.tx3, textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: 5 }}>{label}</div>
      <div style={{ fontSize: 14, fontWeight: 600, color: C.tx }}>{value}</div>
      {sub && <div style={{ fontSize: 10, color: C.tx3, marginTop: 2 }}>{sub}</div>}
    </div>
  )
}
