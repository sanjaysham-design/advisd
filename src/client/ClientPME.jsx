import React, { useState, useMemo } from 'react'
import {
  ComposedChart, Area, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine,
} from 'recharts'
import { C } from './ClientPortal'

const fmt$M = v => `$${(v / 1_000_000).toFixed(1)}M`

// ── Simplified PME calculation ─────────────────────────────────────────────────
// For each period, simulate "if you had invested those same capital calls into
// the benchmark, what would it be worth today?"
// Uses annualized return assumptions to grow each investment forward.

const BENCHMARKS = {
  sp500:   { label: 'S&P 500',       annualReturn: 0.135, color: '#f59e0b',  desc: 'Large-cap US equities' },
  msci:    { label: 'MSCI World',    annualReturn: 0.099, color: '#14b8a6',  desc: 'Global developed markets' },
  russell: { label: 'Russell 2000',  annualReturn: 0.088, color: '#a78bfa',  desc: 'US small-cap equities' },
  hfri:    { label: 'HFRI Fund Wtd', annualReturn: 0.068, color: '#22c55e',  desc: 'Hedge fund composite index' },
}

// Reference date
const NOW_YEAR   = 2026
const NOW_MONTH  = 3  // March

function parsePeriodDate(str) {
  const [year, month] = str.split('-').map(Number)
  return { year, month }
}

function yearsAgo(str) {
  const { year, month } = parsePeriodDate(str)
  return (NOW_YEAR - year) + (NOW_MONTH - month) / 12
}

function computePME(cfHistory, annualReturn) {
  // For each contribution, compound it forward to today
  // For each distribution, that's "money back" — deduct the same from index portfolio
  let benchmarkValue = 0
  cfHistory.forEach(cf => {
    const t = yearsAgo(cf.date)
    const growthFactor = Math.pow(1 + annualReturn, t)
    benchmarkValue += cf.contribution * growthFactor
    benchmarkValue -= cf.distribution * growthFactor
  })
  return Math.max(0, benchmarkValue)
}

// Build cumulative portfolio vs benchmark chart over time
function buildChartData(cfHistory, annualReturn, currentNAV) {
  // Group cash flows by approximate year
  const byYear = {}
  cfHistory.forEach(cf => {
    const yr = parsePeriodDate(cf.date).year
    if (!byYear[yr]) byYear[yr] = { contrib: 0, distrib: 0 }
    byYear[yr].contrib += cf.contribution
    byYear[yr].distrib += cf.distribution
  })

  const years = Object.keys(byYear).map(Number).sort()
  let portCum    = 0
  let benchCum   = 0
  const rows     = []

  years.forEach(yr => {
    const t        = NOW_YEAR - yr
    portCum        += byYear[yr].contrib
    portCum        -= byYear[yr].distrib * 0.8  // rough: distributions reduce cost basis
    benchCum       += byYear[yr].contrib * Math.pow(1 + annualReturn, t)
    benchCum       -= byYear[yr].distrib * Math.pow(1 + annualReturn, t) * 0.8

    rows.push({
      year:      `${yr}`,
      portfolio: Math.max(0, portCum / 1_000_000),
      benchmark: Math.max(0, benchCum / 1_000_000),
    })
  })

  // Add current year endpoint
  rows.push({
    year:      'Today',
    portfolio: currentNAV / 1_000_000,
    benchmark: Math.max(0, computePME(cfHistory, annualReturn)) / 1_000_000,
  })

  return rows
}

export default function ClientPME({ data, clientName }) {
  const [bench, setBench] = useState('sp500')
  const bm = BENCHMARKS[bench]

  const benchmarkValue = useMemo(
    () => computePME(data.cfHistory, bm.annualReturn),
    [bench, data.cfHistory, bm.annualReturn]
  )

  const portfolioWins = data.aum > benchmarkValue
  const diff = data.aum - benchmarkValue
  const pmeRatio = benchmarkValue > 0 ? data.aum / benchmarkValue : 0

  const chartData = useMemo(
    () => buildChartData(data.cfHistory, bm.annualReturn, data.aum),
    [bench, data.cfHistory, bm.annualReturn, data.aum]
  )

  return (
    <div>
      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <div style={{ marginBottom: 36 }}>
        <div style={{ fontSize: 13, color: C.tx2, marginBottom: 10, letterSpacing: '0.3px', textTransform: 'uppercase', fontWeight: 500 }}>
          Public Market Equivalent
        </div>
        <div style={{ fontSize: 18, fontWeight: 600, lineHeight: 1.5, maxWidth: 620, color: C.tx, marginBottom: 16 }}>
          If you had invested your capital calls into the {bm.label} on the same dates,
          your portfolio would be worth{' '}
          <span style={{ color: portfolioWins ? C.red : C.grn }}>{fmt$M(benchmarkValue)}</span>.
          {' '}Your actual portfolio is{' '}
          <span style={{ color: C.acc, fontWeight: 700 }}>{fmt$M(data.aum)}</span>.
        </div>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 10,
          background: portfolioWins ? 'rgba(74,222,128,0.08)' : 'rgba(248,113,113,0.08)',
          border: `1px solid ${portfolioWins ? 'rgba(74,222,128,0.2)' : 'rgba(248,113,113,0.2)'}`,
          borderRadius: 14, padding: '12px 20px',
        }}>
          <div style={{
            fontSize: 28, fontWeight: 800, letterSpacing: '-1px',
            color: portfolioWins ? C.grn : C.red,
          }}>
            {portfolioWins ? '+' : '-'}{fmt$M(Math.abs(diff))}
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 500, color: portfolioWins ? C.grn : C.red }}>
              {portfolioWins ? 'ahead of' : 'behind'} the {bm.label}
            </div>
            <div style={{ fontSize: 11, color: C.tx2, marginTop: 2 }}>
              PME ratio: <strong style={{ color: C.tx }}>{pmeRatio.toFixed(2)}x</strong>
              {' '}({pmeRatio >= 1 ? 'outperforming' : 'underperforming'})
            </div>
          </div>
        </div>
      </div>

      {/* ── Benchmark selector ────────────────────────────────────────── */}
      <div style={{ marginBottom: 20, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {Object.entries(BENCHMARKS).map(([id, b]) => (
          <button
            key={id}
            onClick={() => setBench(id)}
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'flex-start',
              padding: '10px 16px', borderRadius: 12, border: 'none',
              fontFamily: 'inherit', cursor: 'pointer', transition: 'all 0.15s',
              background: bench === id ? 'rgba(129,140,248,0.12)' : C.card,
              outline: bench === id ? `1px solid rgba(129,140,248,0.3)` : `1px solid ${C.bdr}`,
            }}
          >
            <span style={{ fontSize: 12, fontWeight: bench === id ? 700 : 500, color: bench === id ? C.acc : C.tx }}>
              {b.label}
            </span>
            <span style={{ fontSize: 10, color: C.tx3, marginTop: 2 }}>{b.desc}</span>
          </button>
        ))}
      </div>

      {/* ── PME growth chart ─────────────────────────────────────────── */}
      <div style={{ background: C.card, border: `1px solid ${C.bdr}`, borderRadius: 20, padding: '24px 24px 18px', marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600 }}>Portfolio Growth vs {bm.label}</div>
            <div style={{ fontSize: 12, color: C.tx2, marginTop: 4 }}>
              Same capital deployed on same dates — what each approach would be worth
            </div>
          </div>
          <div style={{ display: 'flex', gap: 16 }}>
            {[
              [C.acc,      'Your Portfolio'],
              [bm.color,   bm.label],
            ].map(([c, l]) => (
              <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: C.tx2 }}>
                <span style={{ width: 10, height: 10, borderRadius: 2, background: c, display: 'inline-block' }} />
                {l}
              </div>
            ))}
          </div>
        </div>
        <div style={{ height: 260 }}>
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} margin={{ top: 4, right: 4, left: 12, bottom: 4 }}>
              <defs>
                <linearGradient id="portGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"   stopColor={C.acc}  stopOpacity={0.2} />
                  <stop offset="100%" stopColor={C.acc}  stopOpacity={0.02} />
                </linearGradient>
                <linearGradient id="benchGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"   stopColor={bm.color} stopOpacity={0.12} />
                  <stop offset="100%" stopColor={bm.color} stopOpacity={0.01} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
              <XAxis dataKey="year" tick={{ fill: C.tx3, fontSize: 10 }} tickLine={false} axisLine={false} />
              <YAxis
                tickFormatter={v => `$${v.toFixed(0)}M`}
                tick={{ fill: C.tx3, fontSize: 10 }} tickLine={false} axisLine={false}
              />
              <Tooltip
                contentStyle={{ background: C.card2, border: `1px solid ${C.bdr2}`, borderRadius: 10, fontSize: 12, color: C.tx }}
                itemStyle={{ color: C.tx }}
                labelStyle={{ color: C.tx2 }}
                formatter={(v, n) => [fmt$M(v * 1_000_000), n === 'portfolio' ? 'Your Portfolio' : bm.label]}
              />
              <Area dataKey="portfolio" type="monotone" stroke={C.acc}    strokeWidth={2.5} fill="url(#portGrad)"  dot={false} />
              <Area dataKey="benchmark" type="monotone" stroke={bm.color} strokeWidth={1.5} fill="url(#benchGrad)" dot={false} strokeDasharray="5 3" />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── 4 benchmark comparison cards ─────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 24 }}>
        {Object.entries(BENCHMARKS).map(([id, b]) => {
          const bv     = computePME(data.cfHistory, b.annualReturn)
          const wins   = data.aum > bv
          const ratio  = bv > 0 ? data.aum / bv : 0
          return (
            <div
              key={id}
              onClick={() => setBench(id)}
              style={{
                background: bench === id ? 'rgba(129,140,248,0.08)' : C.card,
                border: `1px solid ${bench === id ? 'rgba(129,140,248,0.3)' : C.bdr}`,
                borderRadius: 16, padding: '18px 18px', cursor: 'pointer', transition: 'all 0.15s',
              }}
            >
              <div style={{ fontSize: 11, color: C.tx3, marginBottom: 8 }}>{b.label}</div>
              <div style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-0.5px', color: C.tx }}>
                {ratio.toFixed(2)}x
              </div>
              <div style={{ fontSize: 11, color: wins ? C.grn : C.red, marginTop: 4, fontWeight: 600 }}>
                {wins ? 'Outperforming' : 'Underperforming'}
              </div>
              <div style={{ fontSize: 10, color: C.tx3, marginTop: 6 }}>
                Benchmark: {fmt$M(bv)}
              </div>
              <div style={{ marginTop: 10, height: 3, borderRadius: 2, background: 'rgba(255,255,255,0.06)' }}>
                <div style={{
                  height: '100%', borderRadius: 2,
                  width: `${Math.min(100, ratio * 50)}%`,
                  background: wins ? C.grn : C.red,
                }} />
              </div>
            </div>
          )
        })}
      </div>

      {/* ── Explainer ─────────────────────────────────────────────────── */}
      <div style={{ background: C.card, border: `1px solid ${C.bdr}`, borderRadius: 16, padding: '20px 24px' }}>
        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 10, color: C.tx2 }}>How is this calculated?</div>
        <div style={{ fontSize: 12, color: C.tx3, lineHeight: 1.8 }}>
          The <strong style={{ color: C.tx2 }}>Public Market Equivalent (PME)</strong> answers a simple question:
          if you'd invested the same dollars into a public index on the same dates your capital was called,
          what would that be worth today? We use the Long-Nickels PME method — each capital call is
          "invested" in the benchmark on the call date, and each distribution is "sold" from the benchmark.
          The remaining benchmark value is compared to your portfolio's current NAV.
          A PME {'>'}1.0x means your portfolio has outperformed the benchmark over the same period and cash flows.
        </div>
      </div>
    </div>
  )
}
