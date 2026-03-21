import React, { useState, useMemo } from 'react'
import {
  ComposedChart, Area, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine,
} from 'recharts'
import { C } from './ClientPortal'
import { useMobile } from '../lib/useMobile'

const fmt$M  = v => `$${(v / 1_000_000).toFixed(1)}M`
const fmtPct = v => `${v.toFixed(1)}%`
const fmtBps = v => `${v >= 0 ? '+' : ''}${Math.round(v * 100)} bps`

// ── Benchmarks — long-run annualised returns ──────────────────────────────────
// Using realistic long-run historical averages, not the exceptional recent decade.
const BENCHMARKS = {
  sp500:   { label: 'S&P 500',       annualReturn: 0.105, color: '#f59e0b',  desc: 'Large-cap US equities' },
  msci:    { label: 'MSCI World',    annualReturn: 0.080, color: '#14b8a6',  desc: 'Global developed markets' },
  russell: { label: 'Russell 2000',  annualReturn: 0.075, color: '#a78bfa',  desc: 'US small-cap equities' },
  hfri:    { label: 'HFRI Fund Wtd', annualReturn: 0.055, color: '#22c55e',  desc: 'Hedge fund composite index' },
}

// Reference date
const NOW_YEAR  = 2026
const NOW_MONTH = 3  // March

// Parse "January 2016" → 2016
function parseInceptionYear(str) {
  const parts = str.split(' ')
  return parseInt(parts[parts.length - 1], 10)
}

// Years since inception
function yearsActive(inceptionYear) {
  return NOW_YEAR - inceptionYear + (NOW_MONTH - 1) / 12
}

// ── IRR-based PME comparison ───────────────────────────────────────────────────
// Compares the growth multiple achieved by the portfolio (at its IRR) vs the
// benchmark over the same period. A ratio > 1.0x means the portfolio won.
function computeIRRPME(portfolioIRR, benchmarkReturn, years) {
  const portfolioMultiple = Math.pow(1 + portfolioIRR / 100, years)
  const benchmarkMultiple = Math.pow(1 + benchmarkReturn,    years)
  const pmeRatio          = benchmarkMultiple > 0 ? portfolioMultiple / benchmarkMultiple : 0
  return { portfolioMultiple, benchmarkMultiple, pmeRatio }
}

// ── Normalized growth chart ────────────────────────────────────────────────────
// Both lines start at $10M at inception. Portfolio grows at the portfolio's IRR,
// benchmark at its annualised rate. Gives a clean apples-to-apples comparison.
function buildNormalizedChart(inceptionYear, portfolioIRR, benchmarkReturn) {
  const rows = []
  for (let y = inceptionYear; y <= NOW_YEAR; y++) {
    const t = y - inceptionYear
    rows.push({
      year:      `${y}`,
      portfolio: 10 * Math.pow(1 + portfolioIRR / 100, t),
      benchmark: 10 * Math.pow(1 + benchmarkReturn, t),
    })
  }
  return rows
}

// ── Value creation from cfHistory (accounting only) ───────────────────────────
function computeValueCreation(cfHistory, currentNAV) {
  let totalDeployed     = 0
  let totalDistributions = 0
  cfHistory.forEach(cf => {
    totalDeployed      += cf.contribution
    totalDistributions += cf.distribution
  })
  const totalValue = totalDistributions + currentNAV
  const moic       = totalDeployed > 0 ? totalValue / totalDeployed : 0
  const netGain    = totalValue - totalDeployed
  return { totalDeployed, totalDistributions, totalValue, moic, netGain }
}

export default function ClientPME({ data, clientName }) {
  const [bench, setBench] = useState('sp500')
  const isMobile = useMobile()
  const bm = BENCHMARKS[bench]

  const inceptionYear = parseInceptionYear(data.inception)
  const years         = yearsActive(inceptionYear)

  // IRR-based PME for the active benchmark
  const { portfolioMultiple, benchmarkMultiple, pmeRatio } = useMemo(
    () => computeIRRPME(data.irr, bm.annualReturn, years),
    [bench, data.irr, bm.annualReturn, years]
  )

  const portfolioWins = pmeRatio >= 1.0
  const irrDiff       = data.irr - bm.annualReturn * 100     // in percentage points
  const bpsDiff       = irrDiff * 100                         // in basis points

  // Normalized growth chart data
  const chartData = useMemo(
    () => buildNormalizedChart(inceptionYear, data.irr, bm.annualReturn),
    [bench, inceptionYear, data.irr, bm.annualReturn]
  )

  // Value creation (accounting)
  const vc = useMemo(
    () => computeValueCreation(data.cfHistory, data.aum),
    [data.cfHistory, data.aum]
  )

  return (
    <div>
      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <div style={{ marginBottom: 36 }}>
        <div style={{ fontSize: 13, color: C.tx2, marginBottom: 10, letterSpacing: '0.3px', textTransform: 'uppercase', fontWeight: 500 }}>
          Public Market Equivalent
        </div>
        <div style={{ fontSize: 18, fontWeight: 600, lineHeight: 1.6, maxWidth: 680, color: C.tx, marginBottom: 16 }}>
          Your portfolio has delivered a{' '}
          <span style={{ color: C.acc, fontWeight: 700 }}>{fmtPct(data.irr)} IRR</span>
          {' '}vs the {bm.label}'s{' '}
          <span style={{ color: bm.color, fontWeight: 700 }}>{fmtPct(bm.annualReturn * 100)}</span>
          {' '}annualised return since inception — outperforming by{' '}
          <span style={{ color: portfolioWins ? C.grn : C.red, fontWeight: 700 }}>
            {fmtBps(bpsDiff)}
          </span>.
        </div>

        {/* Summary badge */}
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 12,
            background: portfolioWins ? 'rgba(74,222,128,0.08)' : 'rgba(248,113,113,0.08)',
            border: `1px solid ${portfolioWins ? 'rgba(74,222,128,0.2)' : 'rgba(248,113,113,0.2)'}`,
            borderRadius: 14, padding: '12px 20px',
          }}>
            <div style={{
              fontSize: 30, fontWeight: 800, letterSpacing: '-1px',
              color: portfolioWins ? C.grn : C.red,
            }}>
              {irrDiff >= 0 ? '+' : ''}{fmtPct(irrDiff)}
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: portfolioWins ? C.grn : C.red }}>
                {portfolioWins ? 'above' : 'below'} {bm.label}
              </div>
              <div style={{ fontSize: 11, color: C.tx2, marginTop: 3 }}>
                PME ratio: <strong style={{ color: C.tx }}>{pmeRatio.toFixed(2)}x</strong>
                {' '}· <span style={{ color: portfolioWins ? C.grn : C.red }}>{portfolioWins ? 'outperforming' : 'underperforming'}</span>
              </div>
            </div>
          </div>

          {/* Quick IRR vs Benchmark stats */}
          {[
            { label: 'Portfolio IRR', value: fmtPct(data.irr), color: C.acc },
            { label: `${bm.label} return`, value: fmtPct(bm.annualReturn * 100), color: bm.color },
            { label: 'Years active', value: `${years.toFixed(1)}y`, color: C.tx2 },
          ].map(s => (
            <div key={s.label} style={{
              background: C.card, border: `1px solid ${C.bdr}`,
              borderRadius: 14, padding: '12px 20px',
            }}>
              <div style={{ fontSize: 10, color: C.tx3, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.3px' }}>{s.label}</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: s.color }}>{s.value}</div>
            </div>
          ))}
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

      {/* ── Normalized growth chart ───────────────────────────────────── */}
      <div style={{ background: C.card, border: `1px solid ${C.bdr}`, borderRadius: 20, padding: '24px 24px 18px', marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600 }}>$10M Invested at Inception — Growth vs {bm.label}</div>
            <div style={{ fontSize: 12, color: C.tx2, marginTop: 4 }}>
              Hypothetical $10M invested at inception, each growing at their respective annualised return
            </div>
          </div>
          <div style={{ display: 'flex', gap: 16 }}>
            {[
              [C.acc,    'Your Portfolio'],
              [bm.color, bm.label],
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
                formatter={(v, n) => [`$${v.toFixed(1)}M`, n === 'portfolio' ? 'Your Portfolio' : bm.label]}
              />
              <Area dataKey="portfolio" type="monotone" stroke={C.acc}    strokeWidth={2.5} fill="url(#portGrad)"  dot={false} />
              <Area dataKey="benchmark" type="monotone" stroke={bm.color} strokeWidth={1.5} fill="url(#benchGrad)" dot={false} strokeDasharray="5 3" />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── 4 benchmark comparison cards ─────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', gap: 12, marginBottom: 24 }}>
        {Object.entries(BENCHMARKS).map(([id, b]) => {
          const { pmeRatio: ratio } = computeIRRPME(data.irr, b.annualReturn, years)
          const wins    = data.irr > b.annualReturn * 100
          const diff    = data.irr - b.annualReturn * 100
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
              <div style={{ fontSize: 10, color: C.tx3, marginTop: 4 }}>
                {diff >= 0 ? '+' : ''}{fmtPct(diff)} vs {fmtPct(b.annualReturn * 100)}
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

      {/* ── Value Creation ────────────────────────────────────────────── */}
      <div style={{ background: C.card, border: `1px solid ${C.bdr}`, borderRadius: 20, padding: '24px', marginBottom: 24 }}>
        <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>Value Creation Since Inception</div>
        <div style={{ fontSize: 12, color: C.tx2, marginBottom: 20 }}>
          Total capital deployed vs value returned — distributions received + current portfolio NAV
        </div>

        {/* MOIC banner */}
        <div style={{
          background: 'rgba(74,222,128,0.07)',
          border: '1px solid rgba(74,222,128,0.18)',
          borderRadius: 14, padding: '16px 20px',
          marginBottom: 20, display: 'flex', alignItems: 'center', gap: 16,
        }}>
          <div>
            <div style={{ fontSize: 11, color: C.tx3, textTransform: 'uppercase', letterSpacing: '0.3px', marginBottom: 4 }}>
              Total Value Created
            </div>
            <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-1px', color: C.grn }}>
              {fmt$M(vc.netGain)} net gain
            </div>
            <div style={{ fontSize: 12, color: C.tx2, marginTop: 4 }}>
              {fmt$M(vc.totalValue)} total value on {fmt$M(vc.totalDeployed)} deployed
              {' '}— <strong style={{ color: C.tx }}>{vc.moic.toFixed(2)}x MOIC</strong>
            </div>
          </div>
          <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
            <div style={{ fontSize: 10, color: C.tx3, marginBottom: 4, textTransform: 'uppercase' }}>Multiple on invested capital</div>
            <div style={{ fontSize: 36, fontWeight: 800, letterSpacing: '-1.5px', color: C.grn }}>
              {vc.moic.toFixed(2)}x
            </div>
          </div>
        </div>

        {/* 4 stat cards */}
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', gap: 12 }}>
          {[
            { label: 'Total Capital Deployed',    value: fmt$M(vc.totalDeployed),      sub: 'Contributions since inception', color: C.tx },
            { label: 'Distributions Received',    value: fmt$M(vc.totalDistributions), sub: 'Cash returned to you',          color: C.acc },
            { label: 'Current Portfolio NAV',     value: fmt$M(data.aum),              sub: 'Unrealised value today',         color: C.acc },
            { label: 'Total Value',               value: fmt$M(vc.totalValue),         sub: 'Distributions + NAV',           color: C.grn },
          ].map(s => (
            <div key={s.label} style={{
              background: C.bg, border: `1px solid ${C.bdr}`, borderRadius: 14, padding: '16px',
            }}>
              <div style={{ fontSize: 10, color: C.tx3, textTransform: 'uppercase', letterSpacing: '0.3px', marginBottom: 8 }}>
                {s.label}
              </div>
              <div style={{ fontSize: 20, fontWeight: 700, color: s.color, letterSpacing: '-0.5px' }}>
                {s.value}
              </div>
              <div style={{ fontSize: 10, color: C.tx3, marginTop: 4 }}>{s.sub}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Explainer ─────────────────────────────────────────────────── */}
      <div style={{ background: C.card, border: `1px solid ${C.bdr}`, borderRadius: 16, padding: '20px 24px' }}>
        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 10, color: C.tx2 }}>How is this calculated?</div>
        <div style={{ fontSize: 12, color: C.tx3, lineHeight: 1.8 }}>
          The <strong style={{ color: C.tx2 }}>PME ratio</strong> compares your portfolio's IRR to the benchmark's
          long-run annualised return over the same period. A ratio of 1.0x means you matched the benchmark;
          above 1.0x means you outperformed. The growth chart shows a hypothetical $10M invested at each rate
          from inception — this removes the distorting effect of cash flow timing so you can compare
          apples-to-apples. <strong style={{ color: C.tx2 }}>Value Creation</strong> shows total capital you
          deployed versus the total value returned (distributions received + current NAV), expressed as a
          multiple on invested capital (MOIC). A MOIC above 1.0x means you've created wealth beyond your
          original investment.
        </div>
      </div>
    </div>
  )
}
