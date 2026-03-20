import React from 'react'

// ── Liquidity classification ─────────────────────────────────────────────────
// T+3   Cash, public fixed income, public equity  — sell today, cash in 3 days
// T+30  Monthly-redemption structures             — some liquid alts
// T+90  Quarterly-redemption HFs & private credit — standard institutional HF terms
// null  Private Equity, Real Estate               — 7-10 year lockup, illiquid

function liquidityBucket(type, name) {
  const t = (type || '').toLowerCase()
  const n = (name || '').toLowerCase()

  if (t === 'cash' || n.includes('money market')) return 't3'
  if (t === 'fixed income') return 't3'
  if (t === 'equity')       return 't3'
  if (t === 'hedge fund')   return 't90'
  if (t === 'credit')       return 't90'
  return 'illiquid'
}

const BUCKETS = [
  {
    key:    't3',
    label:  'T+3',
    desc:   'Settlement',
    detail: 'Cash · Fixed Income · Public Equity',
    color:  '#22c55e',
    bg:     'rgba(34,197,94,0.08)',
    ring:   'rgba(34,197,94,0.22)',
  },
  {
    key:    't30',
    label:  'T+30',
    desc:   '30 Days',
    detail: 'Monthly-redemption structures',
    color:  '#14b8a6',
    bg:     'rgba(20,184,166,0.08)',
    ring:   'rgba(20,184,166,0.22)',
  },
  {
    key:    't90',
    label:  'T+90',
    desc:   '90 Days',
    detail: 'Hedge Funds · Private Credit',
    color:  '#f59e0b',
    bg:     'rgba(245,158,11,0.08)',
    ring:   'rgba(245,158,11,0.22)',
  },
  {
    key:    'illiquid',
    label:  '12m+',
    desc:   'Illiquid',
    detail: 'Private Equity · Real Estate',
    color:  '#6b6b8a',
    bg:     'rgba(107,107,138,0.08)',
    ring:   'rgba(107,107,138,0.2)',
  },
]

function fmtVal(v) {
  if (!v) return '$0'
  if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`
  if (v >= 1_000)     return `$${(v / 1_000).toFixed(0)}K`
  return `$${v}`
}

// ── Theme tokens ─────────────────────────────────────────────────────────────
// clientTheme=true  → client portal (C.* values, 20px radius, larger type)
// clientTheme=false → advisor terminal (CSS vars, 12px radius)
function makeTheme(client) {
  return client ? {
    bg:     '#0d0d18',
    bdr:    'rgba(255,255,255,0.07)',
    radius: 20,
    pad:    '20px 24px',
    tx:     '#ecedf6',
    tx2:    '#8484a0',
    tx3:    '#4a4a65',
    surf:   '#181826',
    titleSz: 14,
    bodySz:  11,
    subSz:   11,
    cardRadius: 14,
    cardPad:  '12px 14px',
  } : {
    bg:     'var(--bg3)',
    bdr:    'var(--bdr)',
    radius: 12,
    pad:    '16px 18px',
    tx:     'var(--tx)',
    tx2:    'var(--tx2)',
    tx3:    'var(--tx3)',
    surf:   'var(--surf)',
    titleSz: 13,
    bodySz:  10,
    subSz:   10,
    cardRadius: 9,
    cardPad:  '10px 12px',
  }
}

export default function LiquidityWidget({ holdings = [], clientTheme = false }) {
  if (!holdings.length) return null

  const T = makeTheme(clientTheme)

  const total   = holdings.reduce((s, h) => s + (h.value || 0), 0)
  const amounts = { t3: 0, t30: 0, t90: 0, illiquid: 0 }
  holdings.forEach(h => {
    const b = liquidityBucket(h.type, h.name)
    amounts[b] += (h.value || 0)
  })
  const pct = v => total > 0 ? (v / total * 100) : 0

  return (
    <div style={{
      background: T.bg,
      border: `1px solid ${T.bdr}`,
      borderRadius: T.radius,
      padding: T.pad,
      marginBottom: clientTheme ? 0 : 20,
    }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 16 }}>
        <div style={{ fontSize: T.titleSz, fontWeight: 600, color: T.tx }}>
          Days to Liquidity
        </div>
        <div style={{ fontSize: T.bodySz, color: T.tx3 }}>
          How much of the portfolio can be converted to cash at each horizon
        </div>
      </div>

      {/* Stacked bar */}
      <div style={{ display: 'flex', height: 8, borderRadius: 99, overflow: 'hidden', marginBottom: 18, gap: 2 }}>
        {BUCKETS.map(b => {
          const p = pct(amounts[b.key])
          if (p < 0.3) return null
          return (
            <div
              key={b.key}
              style={{
                flex: p,
                background: b.color,
                borderRadius: 99,
                opacity: b.key === 'illiquid' ? 0.4 : 0.85,
              }}
              title={`${b.label}: ${fmtVal(amounts[b.key])} (${p.toFixed(1)}%)`}
            />
          )
        })}
      </div>

      {/* Bucket cards — 2×2 grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        {BUCKETS.map(b => {
          const val = amounts[b.key]
          const p   = pct(val)
          const dim = b.key === 'illiquid'

          return (
            <div key={b.key} style={{
              background: b.bg,
              border: `1px solid ${b.ring}`,
              borderRadius: T.cardRadius,
              padding: T.cardPad,
              display: 'flex', alignItems: 'center', gap: 10,
            }}>
              {/* Icon */}
              <div style={{
                width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                background: `${b.color}18`,
                border: `1px solid ${b.ring}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <LiquidIcon bucket={b.key} color={b.color} />
              </div>

              {/* Labels */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 5 }}>
                  <span style={{ fontSize: T.titleSz - 1, fontWeight: 700, color: dim ? T.tx2 : b.color }}>
                    {b.label}
                  </span>
                  <span style={{ fontSize: T.bodySz - 1, color: T.tx3, whiteSpace: 'nowrap' }}>
                    {b.desc}
                  </span>
                </div>
                <div style={{ fontSize: T.bodySz - 1, color: T.tx3, marginTop: 2, lineHeight: 1.4 }}>
                  {b.detail}
                </div>
              </div>

              {/* Value */}
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{
                  fontSize: clientTheme ? 16 : 14,
                  fontWeight: 700,
                  color: dim ? T.tx2 : b.color,
                  letterSpacing: '-0.5px',
                }}>
                  {fmtVal(val)}
                </div>
                <div style={{ fontSize: T.bodySz - 1, color: T.tx3, marginTop: 1 }}>
                  {p.toFixed(0)}%
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Footnote */}
      <div style={{
        marginTop: 12,
        padding: clientTheme ? '10px 14px' : '8px 12px',
        background: T.surf,
        borderRadius: clientTheme ? 10 : 8,
        fontSize: T.bodySz - 1,
        color: T.tx3,
        display: 'flex', alignItems: 'flex-start', gap: 6, lineHeight: 1.6,
      }}>
        <svg viewBox="0 0 10 10" width={8} height={8} fill="none" stroke="currentColor" strokeWidth="1.5" style={{ flexShrink: 0, marginTop: 1 }}>
          <circle cx="5" cy="5" r="4"/><path d="M5 4.5V6.5M5 3.5v.2"/>
        </svg>
        Based on typical redemption terms. Hedge funds assume quarterly notice period.
        Actual liquidity windows vary by fund agreement.
      </div>
    </div>
  )
}

// ── Tiny icons per bucket ────────────────────────────────────────────────────
function LiquidIcon({ bucket, color }) {
  const s = { stroke: color, strokeWidth: 1.4, fill: 'none' }
  if (bucket === 't3') return (
    <svg viewBox="0 0 10 10" width={14} height={14} {...s}>
      <path d="M5 1v3M3 5H1M9 5H7M5 9V7"/>
      <circle cx="5" cy="5" r="1.8"/>
    </svg>
  )
  if (bucket === 't30') return (
    <svg viewBox="0 0 10 10" width={14} height={14} {...s}>
      <circle cx="5" cy="5" r="4"/>
      <path d="M5 3v2l1.5 1"/>
    </svg>
  )
  if (bucket === 't90') return (
    <svg viewBox="0 0 10 10" width={14} height={14} {...s}>
      <circle cx="5" cy="5" r="4"/>
      <path d="M3 4.5C3 3.1 3.9 2 5 2s2 1.1 2 2.5c0 2-2 3.5-2 3.5S3 6.5 3 4.5z"/>
    </svg>
  )
  return (
    <svg viewBox="0 0 10 10" width={14} height={14} {...s}>
      <rect x="2" y="4" width="6" height="5" rx="1"/>
      <path d="M3.5 4V3a1.5 1.5 0 0 1 3 0v1"/>
    </svg>
  )
}
