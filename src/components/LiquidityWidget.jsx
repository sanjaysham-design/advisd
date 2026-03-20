import React from 'react'

// ── Liquidity classification ─────────────────────────────────────────────────
// Returns the settlement-day bucket for a holding based on asset type.
// T+3   Cash, public fixed income, public equity  — sell today, cash in 3 days
// T+30  Monthly-redemption structures             — typical liquid alt / some HFs
// T+90  Quarterly-redemption HFs & private credit — standard institutional HF terms
// null  Private Equity, Real Estate               — 7-10 year lockup, illiquid

function liquidityBucket(type, name) {
  const t = (type || '').toLowerCase()
  const n = (name || '').toLowerCase()

  if (t === 'cash' || n.includes('money market')) return 't3'
  if (t === 'fixed income') return 't3'
  if (t === 'equity')       return 't3'
  if (t === 'hedge fund')   return 't90'   // quarterly redemption + notice period
  if (t === 'credit')       return 't90'   // private credit, semi-liquid at best
  // Private Equity, Real Estate → illiquid
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
    ring:   'rgba(34,197,94,0.25)',
  },
  {
    key:    't30',
    label:  'T+30',
    desc:   '30 Days',
    detail: 'Monthly-redemption structures',
    color:  '#14b8a6',
    bg:     'rgba(20,184,166,0.08)',
    ring:   'rgba(20,184,166,0.25)',
  },
  {
    key:    't90',
    label:  'T+90',
    desc:   '90 Days',
    detail: 'Hedge Funds · Private Credit (quarterly redemption)',
    color:  '#f59e0b',
    bg:     'rgba(245,158,11,0.08)',
    ring:   'rgba(245,158,11,0.25)',
  },
  {
    key:    'illiquid',
    label:  '12m+',
    desc:   'Illiquid',
    detail: 'Private Equity · Real Estate',
    color:  '#4a4a72',
    bg:     'rgba(74,74,114,0.12)',
    ring:   'rgba(74,74,114,0.3)',
  },
]

function fmtVal(v) {
  if (!v) return '$0'
  if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`
  if (v >= 1_000)     return `$${(v / 1_000).toFixed(0)}K`
  return `$${v}`
}

export default function LiquidityWidget({ holdings = [] }) {
  if (!holdings.length) return null

  // Compute buckets
  const total   = holdings.reduce((s, h) => s + (h.value || 0), 0)
  const amounts = { t3: 0, t30: 0, t90: 0, illiquid: 0 }
  holdings.forEach(h => {
    const b = liquidityBucket(h.type, h.name)
    amounts[b] += (h.value || 0)
  })
  const pct = v => total > 0 ? (v / total * 100) : 0

  const cumulative = BUCKETS.reduce((acc, b) => {
    acc.running += pct(amounts[b.key])
    return { ...acc, [b.key]: acc.running }
  }, { running: 0 })

  return (
    <div style={{ background: 'var(--bg3)', border: '1px solid var(--bdr)', borderRadius: 12, padding: '16px 18px', marginBottom: 20 }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 14 }}>
        <div style={{ fontSize: 13, fontWeight: 500 }}>Days to Liquidity</div>
        <div style={{ fontSize: 10, color: 'var(--tx3)' }}>
          How much of the portfolio can be converted to cash at each horizon
        </div>
      </div>

      {/* Stacked bar */}
      <div style={{ display: 'flex', height: 8, borderRadius: 99, overflow: 'hidden', marginBottom: 16, gap: 2 }}>
        {BUCKETS.map(b => {
          const p = pct(amounts[b.key])
          if (p < 0.3) return null
          return (
            <div
              key={b.key}
              style={{ flex: p, background: b.color, borderRadius: 99, opacity: b.key === 'illiquid' ? 0.45 : 0.85 }}
              title={`${b.label}: ${fmtVal(amounts[b.key])} (${p.toFixed(1)}%)`}
            />
          )
        })}
      </div>

      {/* Cards — 2-column grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        {BUCKETS.map(b => {
          const val = amounts[b.key]
          const p   = pct(val)
          const dim = b.key === 'illiquid'

          return (
            <div key={b.key} style={{
              background: b.bg,
              border: `1px solid ${b.ring}`,
              borderRadius: 9,
              padding: '10px 12px',
              display: 'flex', alignItems: 'center', gap: 10,
            }}>
              {/* Coloured dot */}
              <div style={{
                width: 30, height: 30, borderRadius: 8, flexShrink: 0,
                background: b.key === 'illiquid' ? 'rgba(74,74,114,0.2)' : `${b.color}1a`,
                border: `1px solid ${b.ring}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <LiquidIcon bucket={b.key} color={b.color} />
              </div>

              {/* Text */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 5 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: dim ? 'var(--tx2)' : b.color }}>
                    {b.label}
                  </span>
                  <span style={{ fontSize: 9, color: 'var(--tx3)', whiteSpace: 'nowrap' }}>
                    {b.desc}
                  </span>
                </div>
                <div style={{ fontSize: 9, color: 'var(--tx3)', marginTop: 1, lineHeight: 1.4 }}>
                  {b.detail}
                </div>
              </div>

              {/* Value */}
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{
                  fontSize: 14, fontWeight: 700,
                  color: dim ? 'var(--tx2)' : b.color,
                  letterSpacing: '-0.5px',
                }}>
                  {fmtVal(val)}
                </div>
                <div style={{ fontSize: 9, color: 'var(--tx3)', marginTop: 1 }}>
                  {p.toFixed(0)}% of portfolio
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Footnote */}
      <div style={{
        marginTop: 10, fontSize: 9, color: 'var(--tx3)',
        display: 'flex', alignItems: 'center', gap: 5, lineHeight: 1.5,
      }}>
        <svg viewBox="0 0 10 10" width={8} height={8} fill="none" stroke="currentColor" strokeWidth="1.5" style={{ flexShrink: 0 }}>
          <circle cx="5" cy="5" r="4"/><path d="M5 4.5V6.5M5 3.5v.2"/>
        </svg>
        Based on typical redemption terms. Hedge funds assume quarterly notice period.
        Actual windows vary by fund agreement.
      </div>
    </div>
  )
}

// ── Tiny icons per bucket ────────────────────────────────────────────────────
function LiquidIcon({ bucket, color }) {
  const s = { stroke: color, strokeWidth: 1.4, fill: 'none' }
  if (bucket === 't3') return (
    <svg viewBox="0 0 10 10" width={13} height={13} {...s}>
      <path d="M5 1v3M3 5H1M9 5H7M5 9V7"/>
      <circle cx="5" cy="5" r="1.8"/>
    </svg>
  )
  if (bucket === 't30') return (
    <svg viewBox="0 0 10 10" width={13} height={13} {...s}>
      <circle cx="5" cy="5" r="4"/>
      <path d="M5 3v2l1.5 1"/>
    </svg>
  )
  if (bucket === 't90') return (
    <svg viewBox="0 0 10 10" width={13} height={13} {...s}>
      <circle cx="5" cy="5" r="4"/>
      <path d="M3 4.5C3 3.1 3.9 2 5 2s2 1.1 2 2.5c0 2-2 3.5-2 3.5S3 6.5 3 4.5z"/>
    </svg>
  )
  // illiquid
  return (
    <svg viewBox="0 0 10 10" width={13} height={13} {...s}>
      <rect x="2" y="4" width="6" height="5" rx="1"/>
      <path d="M3.5 4V3a1.5 1.5 0 0 1 3 0v1"/>
    </svg>
  )
}
