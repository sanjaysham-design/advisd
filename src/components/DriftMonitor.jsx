import React, { useState } from 'react'
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  ReferenceLine, CartesianGrid, Legend,
} from 'recharts'

// ─── Asset class definitions ─────────────────────────────────────────────────
const CLASSES = [
  { key: 'equity', label: 'Public Equity',  color: '#3b82f6' },
  { key: 'fi',     label: 'Fixed Income',   color: '#6b7280' },
  { key: 'pe',     label: 'Private Equity', color: '#a78bfa' },
  { key: 're',     label: 'Real Assets',    color: '#14b8a6' },
  { key: 'hf',     label: 'Hedge Funds',    color: '#f59e0b' },
  { key: 'cash',   label: 'Cash & Other',   color: '#94a3b8' },
]

// ─── Per-client profiles ──────────────────────────────────────────────────────
const PROFILES = {
  'Meridian Family Trust': {
    aum: 47.3,
    lastRebalanced: 'Nov 12, 2025',
    nextReview: 'May 12, 2026',
    targets:    { equity: 35, fi: 25, pe: 15, re: 12, hf: 10, cash: 3 },
    actual:     { equity: 36.2, fi: 24.1, pe: 16.3, re: 11.8, hf: 9.4, cash: 2.2 },
    thresholds: { equity: 5, fi: 5, pe: 3, re: 3, hf: 3, cash: 2 },
    // Holdings driving each class
    holdings: {
      equity: ['iShares Core S&P 500 (26.2%)', 'Vanguard Total Stock Mkt (10.0%)'],
      fi:     ['PIMCO Total Return (18.8%)', 'Vanguard Total Bond Mkt (5.3%)'],
      pe:     ['KKR North America XII (8.7%)', 'Vista Equity VIII (3.3%)', 'Blackstone BREIT (4.3%)'],
      re:     ['Blackstone BREIT RE (6.1%)', 'Prologis REIT (5.7%)'],
      hf:     ['Citadel Wellington (10.0%)'],
      cash:   ['Cash (1.2%)', 'T-Bills (1.0%)'],
    },
    driftHistory: [
      { month: 'Oct', equity: 0.6, fi: -0.3, pe: 0.8, re: -0.1, hf: -0.2 },
      { month: 'Nov', equity: 0.9, fi: -0.5, pe: 1.0, re: -0.3, hf: -0.3 },
      { month: 'Dec', equity: 1.0, fi: -0.7, pe: 1.1, re: -0.2, hf: -0.4 },
      { month: 'Jan', equity: 1.1, fi: -0.8, pe: 1.2, re: -0.2, hf: -0.5 },
      { month: 'Feb', equity: 1.2, fi: -0.9, pe: 1.3, re: -0.2, hf: -0.6 },
      { month: 'Mar', equity: 1.2, fi: -0.9, pe: 1.3, re: -0.2, hf: -0.6 },
    ],
  },
  'Harrington Capital LLC': {
    aum: 38.2,
    lastRebalanced: 'Aug 3, 2025',
    nextReview: 'Overdue',
    targets:    { equity: 30, fi: 28, pe: 20, re: 12, hf: 8, cash: 2 },
    actual:     { equity: 28.1, fi: 21.2, pe: 26.8, re: 11.9, hf: 9.6, cash: 2.4 },
    thresholds: { equity: 5, fi: 5, pe: 5, re: 3, hf: 3, cash: 2 },
    holdings: {
      equity: ['iShares Core S&P 500 (15.4%)', 'Vanguard Growth ETF (12.7%)'],
      fi:     ['PIMCO Income Fund (11.2%)', 'Vanguard Bond Mkt (10.0%)'],
      pe:     ['Apollo Global XII (12.3%)', 'Carlyle Partners VII (8.6%)', 'Warburg Pincus XII (5.9%)'],
      re:     ['Brookfield Infrastructure (11.9%)'],
      hf:     ['Two Sigma Spectrum (9.6%)'],
      cash:   ['Cash (2.4%)'],
    },
    driftHistory: [
      { month: 'Oct', equity: -0.4, fi: -1.2, pe: 2.1, re: -0.2, hf: 0.3 },
      { month: 'Nov', equity: -0.8, fi: -2.3, pe: 3.4, re: -0.3, hf: 0.6 },
      { month: 'Dec', equity: -1.1, fi: -3.8, pe: 4.2, re: -0.2, hf: 0.8 },
      { month: 'Jan', equity: -1.4, fi: -5.1, pe: 5.2, re: -0.1, hf: 1.1 },
      { month: 'Feb', equity: -1.7, fi: -6.1, pe: 6.0, re: -0.1, hf: 1.4 },
      { month: 'Mar', equity: -1.9, fi: -6.8, pe: 6.8, re: -0.1, hf: 1.6 },
    ],
  },
  'Chen Family Office': {
    aum: 42.1,
    lastRebalanced: 'Jan 8, 2026',
    nextReview: 'Jul 8, 2026',
    targets:    { equity: 40, fi: 20, pe: 18, re: 10, hf: 10, cash: 2 },
    actual:     { equity: 40.8, fi: 19.7, pe: 18.4, re: 9.9, hf: 9.8, cash: 1.4 },
    thresholds: { equity: 5, fi: 5, pe: 3, re: 3, hf: 3, cash: 2 },
    holdings: {
      equity: ['iShares MSCI World (22.1%)', 'Vanguard S&P 500 (18.7%)'],
      fi:     ['PIMCO Total Return (11.4%)', 'iShares US Treasuries (8.3%)'],
      pe:     ['Sequoia Capital Growth (9.2%)', 'Andreessen Horowitz IV (5.6%)', 'Carlyle VII (3.6%)'],
      re:     ['Prologis REIT (5.3%)', 'Blackstone BREIT (4.6%)'],
      hf:     ['Citadel Wellington (9.8%)'],
      cash:   ['Cash (1.4%)'],
    },
    driftHistory: [
      { month: 'Oct', equity: 0.4, fi: -0.1, pe: 0.2, re: -0.1, hf: -0.1 },
      { month: 'Nov', equity: 0.5, fi: -0.2, pe: 0.3, re: -0.1, hf: -0.2 },
      { month: 'Dec', equity: 0.6, fi: -0.2, pe: 0.3, re: -0.1, hf: -0.2 },
      { month: 'Jan', equity: 0.7, fi: -0.2, pe: 0.4, re: -0.1, hf: -0.2 },
      { month: 'Feb', equity: 0.8, fi: -0.3, pe: 0.4, re: -0.1, hf: -0.2 },
      { month: 'Mar', equity: 0.8, fi: -0.3, pe: 0.4, re: -0.1, hf: -0.2 },
    ],
  },
  'Voss Private Wealth': {
    aum: 31.6,
    lastRebalanced: 'Sep 21, 2025',
    nextReview: 'Mar 21, 2026',
    targets:    { equity: 38, fi: 30, pe: 12, re: 10, hf: 8, cash: 2 },
    actual:     { equity: 40.1, fi: 27.9, pe: 12.3, re: 10.8, hf: 7.3, cash: 1.6 },
    thresholds: { equity: 5, fi: 5, pe: 3, re: 3, hf: 3, cash: 2 },
    holdings: {
      equity: ['Vanguard Total Market (22.4%)', 'iShares S&P 500 (17.7%)'],
      fi:     ['PIMCO Total Return (15.1%)', 'iShares Agg Bond (12.8%)'],
      pe:     ['Vista Equity VIII (7.2%)', 'Brookfield Infrastructure (5.1%)'],
      re:     ['Prologis REIT (5.6%)', 'Blackstone BREIT (5.2%)'],
      hf:     ['Two Sigma Spectrum (7.3%)'],
      cash:   ['Cash (1.6%)'],
    },
    driftHistory: [
      { month: 'Oct', equity: 0.8, fi: -0.6, pe: 0.1, re: 0.3, hf: -0.3 },
      { month: 'Nov', equity: 1.2, fi: -1.1, pe: 0.2, re: 0.5, hf: -0.4 },
      { month: 'Dec', equity: 1.5, fi: -1.5, pe: 0.2, re: 0.6, hf: -0.5 },
      { month: 'Jan', equity: 1.8, fi: -1.8, pe: 0.3, re: 0.7, hf: -0.6 },
      { month: 'Feb', equity: 2.0, fi: -2.0, pe: 0.3, re: 0.8, hf: -0.6 },
      { month: 'Mar', equity: 2.1, fi: -2.1, pe: 0.3, re: 0.8, hf: -0.7 },
    ],
  },
  'Alderton Partners': {
    aum: 19.6,
    lastRebalanced: 'Dec 4, 2025',
    nextReview: 'Jun 4, 2026',
    targets:    { equity: 42, fi: 22, pe: 16, re: 8, hf: 10, cash: 2 },
    actual:     { equity: 43.5, fi: 21.2, pe: 16.8, re: 7.9, hf: 9.1, cash: 1.5 },
    thresholds: { equity: 5, fi: 5, pe: 3, re: 3, hf: 3, cash: 2 },
    holdings: {
      equity: ['iShares Core S&P 500 (24.1%)', 'Vanguard Growth (19.4%)'],
      fi:     ['PIMCO Total Return (12.3%)', 'Vanguard Bond Mkt (8.9%)'],
      pe:     ['Vista Equity Partners VIII (9.4%)', 'Silver Lake Partners VI (7.4%)'],
      re:     ['Prologis REIT (7.9%)'],
      hf:     ['Citadel Wellington (9.1%)'],
      cash:   ['Cash (1.5%)'],
    },
    driftHistory: [
      { month: 'Oct', equity: 0.5, fi: -0.3, pe: 0.4, re: -0.1, hf: -0.2 },
      { month: 'Nov', equity: 0.8, fi: -0.4, pe: 0.5, re: -0.1, hf: -0.4 },
      { month: 'Dec', equity: 1.0, fi: -0.5, pe: 0.6, re: -0.1, hf: -0.6 },
      { month: 'Jan', equity: 1.2, fi: -0.6, pe: 0.7, re: -0.1, hf: -0.7 },
      { month: 'Feb', equity: 1.4, fi: -0.7, pe: 0.8, re: -0.1, hf: -0.8 },
      { month: 'Mar', equity: 1.5, fi: -0.8, pe: 0.8, re: -0.1, hf: -0.9 },
    ],
  },
}

function driftStatus(drift, threshold) {
  const abs = Math.abs(drift)
  if (abs <= threshold * 0.4)  return { label: 'On target', color: '#22c55e', bg: 'rgba(34,197,94,0.12)'  }
  if (abs <= threshold * 0.8)  return { label: 'Within band', color: '#22c55e', bg: 'rgba(34,197,94,0.08)' }
  if (abs < threshold)         return { label: 'Approaching', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' }
  return                              { label: 'Breach',      color: '#ef4444', bg: 'rgba(239,68,68,0.12)'  }
}

function fmtPct(n) { return (n >= 0 ? '+' : '') + n.toFixed(1) + '%' }
function fmtM(n)   { return '$' + (n * 1_000_000 / 1_000_000).toFixed(1) + 'M' }

export default function DriftMonitor({ activeClient }) {
  const clientName = activeClient?.name || 'Meridian Family Trust'
  const profile = PROFILES[clientName] || PROFILES['Meridian Family Trust']
  const { aum, lastRebalanced, nextReview, targets, actual, thresholds, holdings, driftHistory } = profile

  // Local editable thresholds
  const [editThresholds, setEditThresholds] = useState(thresholds)
  const [editingKey, setEditingKey]         = useState(null)
  const [showHoldings, setShowHoldings]     = useState(null)

  const breaches = CLASSES.filter(c => Math.abs(actual[c.key] - targets[c.key]) >= editThresholds[c.key])
  const warnings = CLASSES.filter(c => {
    const d = Math.abs(actual[c.key] - targets[c.key])
    return d >= editThresholds[c.key] * 0.8 && d < editThresholds[c.key]
  })
  const maxDrift = Math.max(...CLASSES.map(c => Math.abs(actual[c.key] - targets[c.key])))

  // Rebalancing actions — what to trade to get back to target
  const rebalActions = CLASSES
    .map(c => ({
      ...c,
      drift:     actual[c.key] - targets[c.key],
      dollarDrift: (actual[c.key] - targets[c.key]) / 100 * aum,
      actualPct: actual[c.key],
      targetPct: targets[c.key],
    }))
    .filter(c => Math.abs(c.drift) >= 0.5)
    .sort((a, b) => Math.abs(b.drift) - Math.abs(a.drift))

  return (
    <div className="fade-up" style={{ padding: '20px 24px' }}>

      {/* Breach alert */}
      {breaches.length > 0 && (
        <div style={{
          background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)',
          borderRadius: 10, padding: '10px 14px', marginBottom: 18,
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <span style={{ fontSize: 14 }}>⚠️</span>
          <div style={{ flex: 1 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: '#ef4444' }}>
              Threshold Breach — {breaches.map(c => c.label).join(', ')}
            </span>
            <span style={{ fontSize: 12, color: 'var(--tx2)', marginLeft: 8 }}>
              {breaches.map(c => {
                const d = actual[c.key] - targets[c.key]
                return `${c.label} ${fmtPct(d)} vs ±${editThresholds[c.key]}% threshold`
              }).join(' · ')}. Rebalancing recommended.
            </span>
          </div>
        </div>
      )}

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 20 }}>
        <KPICard
          label="Max Drift"
          value={fmtPct(maxDrift)}
          color={maxDrift >= 5 ? '#ef4444' : maxDrift >= 2 ? '#f59e0b' : '#22c55e'}
          sub="Largest single class drift"
          status={maxDrift >= 5 ? 'Breach' : maxDrift >= 2 ? 'Warning' : 'On target'}
        />
        <KPICard
          label="Breaches"
          value={breaches.length}
          color={breaches.length > 0 ? '#ef4444' : '#22c55e'}
          sub={breaches.length > 0 ? breaches.map(c => c.label).join(', ') : 'All within threshold'}
          status={breaches.length > 0 ? 'Action needed' : 'Clear'}
        />
        <KPICard
          label="Last Rebalanced"
          value={lastRebalanced}
          color="var(--tx)"
          sub="Previous rebalancing event"
          status={nextReview === 'Overdue' ? 'Overdue' : `Next: ${nextReview}`}
          statusColor={nextReview === 'Overdue' ? '#ef4444' : 'var(--tx3)'}
        />
        <KPICard
          label="Classes Monitored"
          value={CLASSES.length}
          color="var(--tx)"
          sub={`${CLASSES.length - breaches.length - warnings.length} on target · ${warnings.length} approaching`}
          status="Active monitoring"
        />
      </div>

      {/* Target vs Actual allocation table */}
      <Card title="Target vs Actual Allocation" sub="Drift = actual − target. Click any row to see underlying holdings." style={{ marginBottom: 14 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {CLASSES.map(cls => {
            const tgt = targets[cls.key]
            const act = actual[cls.key]
            const drift = act - tgt
            const threshold = editThresholds[cls.key]
            const s = driftStatus(drift, threshold)
            const isExpanded = showHoldings === cls.key
            const maxPct = 50

            return (
              <div key={cls.key}>
                <div
                  onClick={() => setShowHoldings(isExpanded ? null : cls.key)}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '130px 1fr 70px 70px 90px 90px 100px',
                    alignItems: 'center', gap: 10,
                    padding: '10px 12px', borderRadius: 8,
                    background: isExpanded ? 'var(--surf2)' : 'var(--surf)',
                    border: `1px solid ${isExpanded ? 'var(--bdr2)' : 'var(--bdr)'}`,
                    cursor: 'pointer', transition: 'background 0.12s',
                  }}
                >
                  {/* Class name */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                    <span style={{ width: 8, height: 8, borderRadius: 2, background: cls.color, display: 'inline-block', flexShrink: 0 }} />
                    <span style={{ fontSize: 12, fontWeight: 500 }}>{cls.label}</span>
                  </div>

                  {/* Visual bars — target + actual */}
                  <div style={{ position: 'relative', height: 18 }}>
                    {/* Target bar (ghost) */}
                    <div style={{
                      position: 'absolute', top: 0, left: 0,
                      height: 8, borderRadius: 4,
                      width: `${(tgt / maxPct) * 100}%`,
                      background: 'var(--bdr2)',
                    }} />
                    {/* Actual bar */}
                    <div style={{
                      position: 'absolute', top: 10, left: 0,
                      height: 8, borderRadius: 4,
                      width: `${(act / maxPct) * 100}%`,
                      background: cls.color, opacity: 0.85,
                    }} />
                  </div>

                  {/* Target % */}
                  <div style={{ fontSize: 12, color: 'var(--tx3)', textAlign: 'right' }}>
                    {tgt.toFixed(1)}%
                  </div>

                  {/* Actual % */}
                  <div style={{ fontSize: 12, fontWeight: 600, textAlign: 'right' }}>
                    {act.toFixed(1)}%
                  </div>

                  {/* Drift */}
                  <div style={{ fontSize: 13, fontWeight: 700, textAlign: 'right', color: drift > 0 ? '#ef4444' : drift < 0 ? '#3b82f6' : 'var(--tx3)' }}>
                    {fmtPct(drift)}
                  </div>

                  {/* Threshold (editable) */}
                  <div
                    style={{ textAlign: 'right' }}
                    onClick={e => { e.stopPropagation(); setEditingKey(editingKey === cls.key ? null : cls.key) }}
                  >
                    {editingKey === cls.key ? (
                      <input
                        autoFocus
                        type="number"
                        value={editThresholds[cls.key]}
                        min={0.5} max={20} step={0.5}
                        onChange={e => setEditThresholds(prev => ({ ...prev, [cls.key]: parseFloat(e.target.value) || threshold }))}
                        onBlur={() => setEditingKey(null)}
                        style={{
                          width: 50, background: 'var(--bg)', border: '1px solid var(--blue)',
                          borderRadius: 5, color: 'var(--tx)', fontSize: 11, padding: '2px 5px',
                          textAlign: 'right',
                        }}
                      />
                    ) : (
                      <span style={{ fontSize: 11, color: 'var(--tx3)' }}>
                        ±{editThresholds[cls.key]}%
                        <svg viewBox="0 0 10 10" width={8} height={8} fill="none" stroke="currentColor" strokeWidth="1.5" style={{ marginLeft: 4, opacity: 0.5, verticalAlign: 'middle' }}>
                          <path d="M1 7.5L6.5 2 8 3.5 2.5 9H1V7.5z"/>
                        </svg>
                      </span>
                    )}
                  </div>

                  {/* Status badge */}
                  <div style={{ textAlign: 'right' }}>
                    <span style={{
                      fontSize: 9, fontWeight: 700, padding: '2px 7px', borderRadius: 5,
                      background: s.bg, color: s.color, textTransform: 'uppercase', letterSpacing: '0.3px',
                    }}>{s.label}</span>
                  </div>
                </div>

                {/* Expanded holdings list */}
                {isExpanded && (
                  <div style={{
                    padding: '8px 12px 10px 24px',
                    background: 'var(--bg)', borderRadius: '0 0 8px 8px',
                    border: '1px solid var(--bdr2)', borderTop: 'none',
                    marginBottom: 2,
                  }}>
                    <div style={{ fontSize: 9, color: 'var(--tx3)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 6 }}>
                      Holdings in {cls.label}
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {(holdings[cls.key] || []).map((h, i) => (
                        <span key={i} style={{
                          fontSize: 10, padding: '3px 8px', borderRadius: 5,
                          background: `${cls.color}18`, color: cls.color,
                          border: `1px solid ${cls.color}33`,
                        }}>{h}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Bar legend */}
        <div style={{ display: 'flex', gap: 16, marginTop: 12, fontSize: 9, color: 'var(--tx3)' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={{ display: 'inline-block', width: 18, height: 5, borderRadius: 3, background: 'var(--bdr2)' }} /> Target
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={{ display: 'inline-block', width: 18, height: 5, borderRadius: 3, background: '#3b82f6', opacity: 0.85 }} /> Actual
          </span>
          <span style={{ marginLeft: 'auto' }}>Click threshold (±%) to edit · Click row to see holdings</span>
        </div>
      </Card>

      {/* Rebalancing recommendations */}
      {rebalActions.length > 0 && (
        <Card title="Rebalancing Recommendations" sub="Actions required to restore target allocation" style={{ marginBottom: 14 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {/* Sell (overweight) */}
            <div>
              <div style={{ fontSize: 10, color: '#ef4444', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600, marginBottom: 8 }}>
                ↓ Trim / Sell (Overweight)
              </div>
              {rebalActions.filter(c => c.drift > 0).map(c => (
                <RebalRow key={c.key} cls={c} aum={aum} dir="sell" />
              ))}
              {rebalActions.filter(c => c.drift > 0).length === 0 && (
                <div style={{ fontSize: 11, color: 'var(--tx3)', fontStyle: 'italic' }}>No positions to trim</div>
              )}
            </div>
            {/* Buy (underweight) */}
            <div>
              <div style={{ fontSize: 10, color: '#22c55e', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600, marginBottom: 8 }}>
                ↑ Add / Buy (Underweight)
              </div>
              {rebalActions.filter(c => c.drift < 0).map(c => (
                <RebalRow key={c.key} cls={c} aum={aum} dir="buy" />
              ))}
              {rebalActions.filter(c => c.drift < 0).length === 0 && (
                <div style={{ fontSize: 11, color: 'var(--tx3)', fontStyle: 'italic' }}>No positions to add</div>
              )}
            </div>
          </div>
          <div style={{ marginTop: 12, padding: '8px 12px', background: 'var(--bg)', borderRadius: 7, border: '1px solid var(--bdr)', fontSize: 10, color: 'var(--tx3)' }}>
            Dollar estimates based on ${aum}M AUM. Actual trade sizes should account for tax lots, liquidity, and fund redemption windows.
          </div>
        </Card>
      )}

      {/* Historical drift chart */}
      <Card
        title="Drift History"
        sub="6-month trailing drift per asset class · Dashed lines = ±5% threshold"
      >
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={driftHistory} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
            <CartesianGrid vertical={false} stroke="var(--bdr)" strokeOpacity={0.5} />
            <XAxis dataKey="month" tick={{ fontSize: 9, fill: '#4a4a62' }} axisLine={false} tickLine={false} />
            <YAxis
              tick={{ fontSize: 9, fill: '#4a4a62' }} axisLine={false} tickLine={false}
              tickFormatter={v => `${v > 0 ? '+' : ''}${v}%`}
            />
            <Tooltip
              contentStyle={{ background: 'var(--bg3)', border: '1px solid var(--bdr2)', borderRadius: 8, fontSize: 11 }}
              labelStyle={{ color: 'var(--tx2)', marginBottom: 4 }}
              formatter={(val, name) => [`${val > 0 ? '+' : ''}${val.toFixed(1)}%`, CLASSES.find(c => c.key === name)?.label || name]}
            />
            <ReferenceLine y={5}  stroke="#ef4444" strokeDasharray="4 3" strokeOpacity={0.4} />
            <ReferenceLine y={-5} stroke="#ef4444" strokeDasharray="4 3" strokeOpacity={0.4} />
            <ReferenceLine y={0}  stroke="var(--bdr2)" strokeWidth={1} />
            {CLASSES.filter(c => c.key !== 'cash').map(cls => (
              <Line
                key={cls.key}
                type="monotone"
                dataKey={cls.key}
                stroke={cls.color}
                strokeWidth={1.8}
                dot={false}
                activeDot={{ r: 4 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
        {/* Legend */}
        <div style={{ display: 'flex', gap: 12, marginTop: 10, flexWrap: 'wrap' }}>
          {CLASSES.filter(c => c.key !== 'cash').map(cls => (
            <div key={cls.key} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 9, color: 'var(--tx3)' }}>
              <span style={{ display: 'inline-block', width: 16, height: 2.5, borderRadius: 2, background: cls.color }} />
              {cls.label}
            </div>
          ))}
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 5, fontSize: 9, color: 'var(--tx3)' }}>
            <span style={{ display: 'inline-block', width: 16, height: 0, borderBottom: '2px dashed #ef444466' }} />
            ±5% breach threshold
          </div>
        </div>
      </Card>
    </div>
  )
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function RebalRow({ cls, aum, dir }) {
  const dollarAmt = Math.abs(cls.drift / 100 * aum)
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 8,
      padding: '8px 10px', borderRadius: 7, marginBottom: 6,
      background: dir === 'sell' ? 'rgba(239,68,68,0.06)' : 'rgba(34,197,94,0.06)',
      border: `1px solid ${dir === 'sell' ? 'rgba(239,68,68,0.2)' : 'rgba(34,197,94,0.2)'}`,
    }}>
      <span style={{ width: 8, height: 8, borderRadius: 2, background: cls.color, flexShrink: 0 }} />
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 12, fontWeight: 500 }}>{cls.label}</div>
        <div style={{ fontSize: 9, color: 'var(--tx3)' }}>
          {dir === 'sell' ? 'Reduce' : 'Increase'} from {cls.actualPct.toFixed(1)}% → {cls.targetPct.toFixed(1)}%
        </div>
      </div>
      <div style={{ textAlign: 'right' }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: dir === 'sell' ? '#ef4444' : '#22c55e' }}>
          {dir === 'sell' ? '−' : '+'}{fmtM(dollarAmt)}
        </div>
        <div style={{ fontSize: 9, color: 'var(--tx3)' }}>{Math.abs(cls.drift).toFixed(1)}% drift</div>
      </div>
    </div>
  )
}

function KPICard({ label, value, color, sub, status, statusColor }) {
  return (
    <div style={{
      background: 'var(--surf)', border: '1px solid var(--bdr)',
      borderRadius: 12, padding: '14px 16px',
    }}>
      <div style={{ fontSize: 10, color: 'var(--tx3)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-0.5px', color, marginBottom: 4 }}>{value}</div>
      <div style={{ fontSize: 10, color: statusColor || (status === 'Breach' || status === 'Action needed' || status === 'Overdue' ? '#ef4444' : status === 'Warning' ? '#f59e0b' : '#22c55e'), fontWeight: 600, marginBottom: 2 }}>{status}</div>
      <div style={{ fontSize: 10, color: 'var(--tx3)' }}>{sub}</div>
    </div>
  )
}

function Card({ title, sub, children, style }) {
  return (
    <div style={{ background: 'var(--surf)', border: '1px solid var(--bdr)', borderRadius: 12, padding: '14px 16px', ...style }}>
      <div style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 13, fontWeight: 500 }}>{title}</div>
        {sub && <div style={{ fontSize: 10, color: 'var(--tx3)', marginTop: 1 }}>{sub}</div>}
      </div>
      {children}
    </div>
  )
}
