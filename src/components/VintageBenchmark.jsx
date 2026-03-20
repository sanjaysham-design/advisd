import React, { useState, useMemo } from 'react'
import {
  ComposedChart, Bar, Cell, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine,
} from 'recharts'

// ── Cambridge Associates benchmark data (approximate, by vintage + asset class) ──
const BENCHMARKS = {
  'Private Equity': {
    2015: { q1: 18.2, median: 13.5, q3: 9.8,  tvpiMedian: 1.82 },
    2016: { q1: 19.0, median: 14.1, q3: 10.2, tvpiMedian: 1.88 },
    2017: { q1: 20.5, median: 15.2, q3: 11.1, tvpiMedian: 1.76 },
    2018: { q1: 22.3, median: 16.8, q3: 12.4, tvpiMedian: 1.72 },
    2019: { q1: 24.1, median: 18.5, q3: 13.8, tvpiMedian: 1.65 },
    2020: { q1: 19.8, median: 14.2, q3: 10.1, tvpiMedian: 1.48 },
    2021: { q1: 16.2, median: 11.8, q3:  8.2, tvpiMedian: 1.32 },
    2022: { q1: 13.5, median:  9.4, q3:  6.2, tvpiMedian: 1.18 },
  },
  'Real Estate': {
    2015: { q1: 14.8, median: 10.2, q3: 7.1, tvpiMedian: 1.68 },
    2016: { q1: 15.2, median: 11.0, q3: 7.8, tvpiMedian: 1.74 },
    2017: { q1: 16.1, median: 11.8, q3: 8.4, tvpiMedian: 1.70 },
    2018: { q1: 17.5, median: 12.8, q3: 9.2, tvpiMedian: 1.58 },
    2019: { q1: 18.2, median: 13.5, q3: 9.8, tvpiMedian: 1.54 },
    2020: { q1: 14.2, median: 10.4, q3: 7.2, tvpiMedian: 1.38 },
    2021: { q1: 12.8, median:  9.1, q3: 6.4, tvpiMedian: 1.24 },
    2022: { q1: 11.2, median:  7.8, q3: 5.2, tvpiMedian: 1.12 },
  },
  'Hedge Fund': {
    2015: { q1: 12.5, median: 8.4, q3: 5.2, tvpiMedian: 1.62 },
    2016: { q1: 13.2, median: 9.1, q3: 5.8, tvpiMedian: 1.68 },
    2017: { q1: 14.8, median: 10.4, q3: 6.9, tvpiMedian: 1.72 },
    2018: { q1: 16.2, median: 11.5, q3: 7.8, tvpiMedian: 1.65 },
    2019: { q1: 18.5, median: 13.2, q3: 9.1, tvpiMedian: 1.58 },
    2020: { q1: 15.8, median: 11.2, q3: 7.6, tvpiMedian: 1.44 },
    2021: { q1: 13.4, median:  9.5, q3: 6.2, tvpiMedian: 1.30 },
    2022: { q1: 10.8, median:  7.2, q3: 4.8, tvpiMedian: 1.16 },
  },
  'Credit': {
    2015: { q1: 10.8, median: 7.6, q3: 5.4, tvpiMedian: 1.52 },
    2016: { q1: 11.4, median: 8.2, q3: 5.9, tvpiMedian: 1.56 },
    2017: { q1: 12.2, median: 8.9, q3: 6.4, tvpiMedian: 1.60 },
    2018: { q1: 13.5, median: 9.8, q3: 7.2, tvpiMedian: 1.54 },
    2019: { q1: 14.2, median: 10.5, q3: 7.8, tvpiMedian: 1.48 },
    2020: { q1: 12.8, median:  9.2, q3: 6.8, tvpiMedian: 1.36 },
    2021: { q1: 10.9, median:  7.8, q3: 5.5, tvpiMedian: 1.22 },
    2022: { q1:  9.2, median:  6.4, q3: 4.5, tvpiMedian: 1.12 },
  },
}

// Normalize asset class string to a benchmark key
function benchKey(cls) {
  if (!cls) return null
  if (cls.includes('Private Equity') || cls.includes('PE')) return 'Private Equity'
  if (cls.includes('Real Estate') || cls.includes('Real Asset')) return 'Real Estate'
  if (cls.includes('Hedge')) return 'Hedge Fund'
  if (cls.includes('Credit') || cls.includes('Fixed Income')) return 'Credit'
  return null
}

// ── Per-client fund data ──────────────────────────────────────────────────────
const PROFILES = {
  'Chen Family Office': {
    aum: 42_300_000,
    funds: [
      { id:1, fund:'Blackstone Real Estate XI', manager:'Blackstone',   cls:'Real Estate',    vintage:2019, commitment:8_000_000,  value:9_420_000,  irr:14.2, tvpi:1.78, dpi:0.42 },
      { id:2, fund:'KKR Americas Fund XIV',     manager:'KKR',          cls:'Private Equity', vintage:2018, commitment:7_000_000,  value:8_150_000,  irr:16.8, tvpi:1.84, dpi:0.55 },
      { id:3, fund:'Bridgewater All-Weather',   manager:'Bridgewater',  cls:'Hedge Fund',     vintage:2020, commitment:5_000_000,  value:5_380_000,  irr: 8.9, tvpi:1.38, dpi:0.28 },
      { id:4, fund:'Harrison St. RE Core',      manager:'Harrison St.', cls:'Real Estate',    vintage:2020, commitment:6_000_000,  value:6_840_000,  irr:12.1, tvpi:1.54, dpi:0.35 },
      { id:5, fund:'PIMCO Diversified Income',  manager:'PIMCO',        cls:'Credit',         vintage:2021, commitment:4_000_000,  value:4_120_000,  irr: 5.8, tvpi:1.18, dpi:0.22 },
    ],
  },
  'Meridian Capital Partners': {
    aum: 38_100_000,
    funds: [
      { id:1, fund:'Apollo Global Fund XVI',    manager:'Apollo',    cls:'Private Equity', vintage:2018, commitment:9_000_000,  value:11_200_000, irr:18.4, tvpi:1.92, dpi:0.62 },
      { id:2, fund:'Carlyle Partners VIII',     manager:'Carlyle',   cls:'Private Equity', vintage:2017, commitment:8_000_000,  value: 9_600_000, irr:15.9, tvpi:1.76, dpi:0.58 },
      { id:3, fund:'Vista Equity Partners VII', manager:'Vista',     cls:'Private Equity', vintage:2019, commitment:6_000_000,  value: 7_100_000, irr:21.2, tvpi:1.88, dpi:0.40 },
      { id:4, fund:'Oaktree Capital Fund IV',   manager:'Oaktree',   cls:'Credit',         vintage:2018, commitment:5_000_000,  value: 5_420_000, irr: 9.8, tvpi:1.44, dpi:0.38 },
      { id:5, fund:'Ares Real Estate IV',       manager:'Ares',      cls:'Real Estate',    vintage:2020, commitment:4_000_000,  value: 4_780_000, irr:13.5, tvpi:1.58, dpi:0.30 },
    ],
  },
  'Okonkwo Family Trust': {
    aum: 28_400_000,
    funds: [
      { id:1, fund:'Citadel Wellington',     manager:'Citadel',    cls:'Hedge Fund',     vintage:2019, commitment:5_000_000, value:5_920_000, irr:15.2, tvpi:1.62, dpi:0.44 },
      { id:2, fund:'Millennium Partners',    manager:'Millennium', cls:'Hedge Fund',     vintage:2018, commitment:5_000_000, value:5_680_000, irr:13.6, tvpi:1.55, dpi:0.40 },
      { id:3, fund:'Two Sigma Spectrum',     manager:'Two Sigma',  cls:'Hedge Fund',     vintage:2020, commitment:4_000_000, value:4_540_000, irr:11.8, tvpi:1.40, dpi:0.25 },
      { id:4, fund:'TPG Rise Climate Fund',  manager:'TPG',        cls:'Private Equity', vintage:2021, commitment:5_000_000, value:5_280_000, irr:10.1, tvpi:1.28, dpi:0.10 },
      { id:5, fund:'Blackstone Credit',      manager:'Blackstone', cls:'Credit',         vintage:2020, commitment:4_000_000, value:4_130_000, irr: 7.4, tvpi:1.32, dpi:0.28 },
    ],
  },
  'Park & Lee Family Office': {
    aum: 35_600_000,
    funds: [
      { id:1, fund:'JP Morgan PE Partners', manager:'JP Morgan',  cls:'Private Equity', vintage:2018, commitment:7_000_000, value:8_200_000,  irr:14.8, tvpi:1.70, dpi:0.52 },
      { id:2, fund:'Nuveen Real Estate',    manager:'Nuveen',     cls:'Real Estate',    vintage:2019, commitment:5_000_000, value:5_580_000,  irr:11.2, tvpi:1.50, dpi:0.32 },
      { id:3, fund:'PGIM Private Credit',   manager:'PGIM',       cls:'Credit',         vintage:2020, commitment:4_000_000, value:4_210_000,  irr: 8.2, tvpi:1.34, dpi:0.30 },
      { id:4, fund:'Morgan Stanley Growth', manager:'Morgan Stanley', cls:'Private Equity', vintage:2017, commitment:8_000_000, value:9_120_000, irr:12.4, tvpi:1.62, dpi:0.68 },
      { id:5, fund:'iShares Diversified',   manager:'BlackRock',  cls:'Private Equity', vintage:2021, commitment:6_000_000, value:6_420_000,  irr: 9.1, tvpi:1.22, dpi:0.18 },
    ],
  },
  'Rosenberg Family Trust': {
    aum: 35_000_000,
    funds: [
      { id:1, fund:'Blackstone RE Partners X',  manager:'Blackstone',    cls:'Real Estate',    vintage:2018, commitment:8_000_000, value:9_840_000,  irr:16.8, tvpi:1.82, dpi:0.48 },
      { id:2, fund:'Starwood Capital V',         manager:'Starwood',      cls:'Real Estate',    vintage:2017, commitment:7_000_000, value:8_200_000,  irr:14.4, tvpi:1.74, dpi:0.62 },
      { id:3, fund:'Ares Capital Fund VII',      manager:'Ares',          cls:'Credit',         vintage:2019, commitment:5_000_000, value:5_430_000,  irr:10.8, tvpi:1.46, dpi:0.35 },
      { id:4, fund:'Hamilton Lane Secondaries',  manager:'Hamilton Lane', cls:'Private Equity', vintage:2020, commitment:4_000_000, value:4_620_000,  irr:13.2, tvpi:1.52, dpi:0.28 },
      { id:5, fund:'Vanguard Total Market',      manager:'Vanguard',      cls:'Private Equity', vintage:2022, commitment:3_000_000, value:3_210_000,  irr:10.2, tvpi:1.14, dpi:0.05 },
    ],
  },
}

const FALLBACK = 'Meridian Capital Partners'

// ── Helpers ───────────────────────────────────────────────────────────────────
const fmt$ = v => v >= 1_000_000 ? `$${(v/1_000_000).toFixed(1)}M` : `$${(v/1_000).toFixed(0)}K`

function getQuartile(irr, bKey, vintage) {
  const bm = BENCHMARKS[bKey]?.[vintage]
  if (!bm) return null
  if (irr >= bm.q1)     return 1
  if (irr >= bm.median) return 2
  if (irr >= bm.q3)     return 3
  return 4
}

function getVsMedian(irr, bKey, vintage) {
  const bm = BENCHMARKS[bKey]?.[vintage]
  if (!bm) return null
  return +(irr - bm.median).toFixed(1)
}

const Q_COLORS  = { 1: '#22c55e', 2: '#3b82f6', 3: '#f59e0b', 4: '#ef4444' }
const Q_LABELS  = { 1: 'Top Quartile', 2: '2nd Quartile', 3: '3rd Quartile', 4: 'Bottom Quartile' }
const Q_SHORT   = { 1: 'Q1', 2: 'Q2', 3: 'Q3', 4: 'Q4' }
const CLS_COLORS = { 'Private Equity':'#3b82f6', 'Real Estate':'#a78bfa', 'Hedge Fund':'#14b8a6', 'Credit':'#f59e0b' }

const ALL_CLASSES = ['All', 'Private Equity', 'Real Estate', 'Hedge Fund', 'Credit']

// ── Main component ─────────────────────────────────────────────────────────────
export default function VintageBenchmark({ activeClient }) {
  const name    = activeClient?.name ?? FALLBACK
  const profile = PROFILES[name] ?? PROFILES[FALLBACK]
  const { funds } = profile

  const [clsFilter, setClsFilter] = useState('All')
  const [metric, setMetric]       = useState('irr')  // 'irr' | 'tvpi'

  // Attach benchmark data to each fund
  const enriched = useMemo(() => funds.map(f => {
    const bKey     = benchKey(f.cls)
    const bm       = bKey ? (BENCHMARKS[bKey]?.[f.vintage] ?? null) : null
    const quartile = bm ? getQuartile(f.irr, bKey, f.vintage) : null
    const vsMedian = bm ? getVsMedian(f.irr, bKey, f.vintage) : null
    return { ...f, bKey, bm, quartile, vsMedian }
  }), [funds])

  const filtered = clsFilter === 'All'
    ? enriched
    : enriched.filter(f => f.cls === clsFilter)

  // KPIs
  const eligible       = enriched.filter(f => f.bm)
  const aboveMedian    = eligible.filter(f => f.vsMedian > 0).length
  const topQ           = eligible.filter(f => f.quartile === 1).length
  const weightedIRR    = funds.reduce((s, f) => s + f.irr * f.value, 0) / funds.reduce((s, f) => s + f.value, 0)
  const vintageRange   = [Math.min(...funds.map(f => f.vintage)), Math.max(...funds.map(f => f.vintage))]

  // Chart data — sorted by vintage year then IRR
  const chartData = [...filtered]
    .sort((a, b) => a.vintage - b.vintage || b.irr - a.irr)
    .map(f => ({
      name:            f.fund.length > 20 ? f.fund.slice(0, 20) + '…' : f.fund,
      irr:             f.irr,
      tvpi:            f.tvpi,
      benchmarkMedian: f.bm ? (metric === 'irr' ? f.bm.median : f.bm.tvpiMedian) : null,
      benchmarkQ1:     f.bm ? (metric === 'irr' ? f.bm.q1     : null)            : null,
      benchmarkQ3:     f.bm ? (metric === 'irr' ? f.bm.q3     : null)            : null,
      quartile:        f.quartile,
      vintage:         f.vintage,
      cls:             f.cls,
    }))

  // Quartile distribution
  const qDist = [1,2,3,4].map(q => ({
    q, label: Q_SHORT[q],
    count: eligible.filter(f => f.quartile === q).length,
  }))

  // Vintage year summary (for the bottom chart)
  const vintageGroups = Object.values(
    enriched.reduce((acc, f) => {
      if (!f.bm) return acc
      if (!acc[f.vintage]) acc[f.vintage] = { vintage: f.vintage, funds: [] }
      acc[f.vintage].funds.push(f)
      return acc
    }, {})
  ).sort((a, b) => a.vintage - b.vintage)
    .map(g => ({
      vintage:  g.vintage,
      avgIRR:   +(g.funds.reduce((s,f) => s + f.irr, 0) / g.funds.length).toFixed(1),
      // Use first fund's benchmark (all in same vintage)
      medianIRR: g.funds[0]?.bm?.median ?? null,
      q1IRR:     g.funds[0]?.bm?.q1     ?? null,
      q3IRR:     g.funds[0]?.bm?.q3     ?? null,
    }))

  return (
    <div style={{ padding: '24px 28px', animation: 'fadeUp 0.3s ease' }}>

      {/* KPI row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 24 }}>
        <KpiCard label="Portfolio Wtd IRR"   value={`${weightedIRR.toFixed(1)}%`}   sub="Value-weighted avg across all funds"       color="var(--green)" />
        <KpiCard label="Above Benchmark"     value={`${aboveMedian}/${eligible.length}`} sub="Funds above Cambridge Associates median" color="var(--blue)"  />
        <KpiCard label="Top Quartile Funds"  value={String(topQ)}                    sub={`${((topQ/eligible.length)*100).toFixed(0)}% of portfolio by count`} color="var(--purple)" />
        <KpiCard label="Vintage Span"        value={`${vintageRange[0]}–${vintageRange[1]}`} sub={`${vintageRange[1]-vintageRange[0]+1} vintage years covered`} color="var(--amber)" />
      </div>

      {/* Filter row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
        <span style={{ fontSize: 10, color: 'var(--tx3)', marginRight: 4 }}>ASSET CLASS</span>
        {ALL_CLASSES.map(cls => (
          <FilterBtn key={cls} label={cls} active={clsFilter === cls} onClick={() => setClsFilter(cls)} color={CLS_COLORS[cls]} />
        ))}
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
          <MetricBtn label="IRR %" active={metric === 'irr'}  onClick={() => setMetric('irr')}  />
          <MetricBtn label="TVPI"  active={metric === 'tvpi'} onClick={() => setMetric('tvpi')} />
        </div>
      </div>

      {/* Two-column: benchmark table + quartile distribution */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 260px', gap: 18, marginBottom: 24, alignItems: 'start' }}>

        {/* ── Benchmark comparison table ── */}
        <div style={{ background: 'var(--bg2)', border: '1px solid var(--bdr)', borderRadius: 14, overflow: 'hidden' }}>
          <div style={{ padding: '14px 18px 12px', borderBottom: '1px solid var(--bdr)' }}>
            <div style={{ fontSize: 12, fontWeight: 600 }}>Fund vs Cambridge Associates Benchmark</div>
            <div style={{ fontSize: 10, color: 'var(--tx3)', marginTop: 2 }}>IRR · TVPI · DPI compared to vintage-matched peers</div>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--bdr)' }}>
                {['Fund', 'Vintage', 'Class', 'IRR', 'vs Median', 'Q', 'TVPI', 'DPI', 'Commitment'].map((h, i) => (
                  <th key={h} style={{
                    padding: '8px 12px', textAlign: i <= 2 ? 'left' : 'right',
                    fontSize: 10, color: 'var(--tx3)', fontWeight: 600,
                    textTransform: 'uppercase', letterSpacing: '0.5px', whiteSpace: 'nowrap',
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered
                .sort((a, b) => a.vintage - b.vintage || b.irr - a.irr)
                .map((f, i) => (
                  <BenchmarkRow key={f.id} fund={f} even={i % 2 === 0} />
                ))}
            </tbody>
          </table>
        </div>

        {/* ── Quartile distribution ── */}
        <div style={{ background: 'var(--bg2)', border: '1px solid var(--bdr)', borderRadius: 14, overflow: 'hidden' }}>
          <div style={{ padding: '14px 18px 12px', borderBottom: '1px solid var(--bdr)' }}>
            <div style={{ fontSize: 12, fontWeight: 600 }}>Quartile Distribution</div>
            <div style={{ fontSize: 10, color: 'var(--tx3)', marginTop: 2 }}>vs Cambridge Associates</div>
          </div>
          <div style={{ padding: '16px 18px' }}>
            {/* Visual distribution bar */}
            <div style={{ display: 'flex', height: 12, borderRadius: 6, overflow: 'hidden', marginBottom: 16 }}>
              {qDist.map(d => d.count > 0 && (
                <div
                  key={d.q}
                  style={{ width: `${(d.count / eligible.length) * 100}%`, background: Q_COLORS[d.q], transition: 'width 0.4s' }}
                />
              ))}
            </div>
            {/* Legend items */}
            {qDist.map(d => (
              <div key={d.q} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '8px 0', borderBottom: '1px solid var(--bdr)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{
                    width: 8, height: 8, borderRadius: 2, flexShrink: 0,
                    background: Q_COLORS[d.q], display: 'inline-block',
                  }} />
                  <span style={{ fontSize: 11, color: 'var(--tx2)' }}>{Q_LABELS[d.q]}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: Q_COLORS[d.q] }}>{d.count}</span>
                  <span style={{ fontSize: 10, color: 'var(--tx3)', minWidth: 30, textAlign: 'right' }}>
                    {eligible.length > 0 ? `${((d.count/eligible.length)*100).toFixed(0)}%` : '—'}
                  </span>
                </div>
              </div>
            ))}
            <div style={{ padding: '10px 0 0', fontSize: 10, color: 'var(--tx3)' }}>
              {eligible.length} funds with vintage benchmark data
            </div>
          </div>

          {/* Top performers */}
          <div style={{ padding: '0 18px 16px' }}>
            <div style={{ fontSize: 10, color: 'var(--tx3)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 }}>
              Best vs Benchmark
            </div>
            {[...enriched]
              .filter(f => f.vsMedian !== null)
              .sort((a, b) => b.vsMedian - a.vsMedian)
              .slice(0, 3)
              .map(f => (
                <div key={f.id} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '6px 0',
                }}>
                  <div style={{ fontSize: 10, color: 'var(--tx2)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 140 }}>
                    {f.fund}
                  </div>
                  <span style={{
                    fontSize: 10, fontWeight: 700,
                    color: f.vsMedian > 0 ? 'var(--green)' : 'var(--red)',
                  }}>
                    {f.vsMedian > 0 ? '+' : ''}{f.vsMedian}%
                  </span>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* IRR vs benchmark chart */}
      <div style={{ background: 'var(--bg2)', border: '1px solid var(--bdr)', borderRadius: 14, padding: '18px 20px', marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 600 }}>
              {metric === 'irr' ? 'IRR by Fund vs Benchmark Median' : 'TVPI by Fund vs Benchmark Median'}
            </div>
            <div style={{ fontSize: 10, color: 'var(--tx3)', marginTop: 2 }}>
              Colored by quartile · White bar = Cambridge Associates median for vintage year
            </div>
          </div>
          {/* Vintage year legend */}
          <div style={{ display: 'flex', gap: 12 }}>
            {[1,2,3,4].map(q => (
              <div key={q} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, color: 'var(--tx3)' }}>
                <span style={{ width: 8, height: 8, borderRadius: 2, background: Q_COLORS[q], display: 'inline-block' }} />
                {Q_SHORT[q]}
              </div>
            ))}
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, color: 'var(--tx3)' }}>
              <span style={{ width: 14, height: 2, background: 'rgba(255,255,255,0.6)', display: 'inline-block' }} />
              Median
            </div>
          </div>
        </div>
        <div style={{ height: 260 }}>
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} margin={{ top: 8, right: 16, left: 10, bottom: 48 }} barGap={2}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis
                dataKey="name"
                tick={{ fill: 'var(--tx3)', fontSize: 9 }}
                angle={-38} textAnchor="end"
                tickLine={false} axisLine={false}
                interval={0}
              />
              <YAxis
                tickFormatter={v => metric === 'irr' ? `${v}%` : `${v}x`}
                tick={{ fill: 'var(--tx3)', fontSize: 9 }}
                tickLine={false} axisLine={false}
                domain={metric === 'irr' ? [0, 'auto'] : [1, 'auto']}
              />
              <Tooltip
                contentStyle={{ background: 'var(--bg3)', border: '1px solid var(--bdr2)', borderRadius: 8, fontSize: 11 }}
                formatter={(v, n) => {
                  if (n === 'benchmarkMedian') return [metric === 'irr' ? `${v}%` : `${v}x`, 'CA Median']
                  return [metric === 'irr' ? `${v}%` : `${v}x`, n === 'irr' ? 'Fund IRR' : 'Fund TVPI']
                }}
                labelFormatter={label => label}
                cursor={{ fill: 'rgba(255,255,255,0.04)' }}
              />
              <Bar dataKey={metric} barSize={22} radius={[3,3,0,0]}>
                {chartData.map((d, i) => (
                  <Cell key={i} fill={Q_COLORS[d.quartile] ?? 'var(--tx3)'} />
                ))}
              </Bar>
              {/* Benchmark median as a thin white bar */}
              <Bar dataKey="benchmarkMedian" barSize={2} fill="rgba(255,255,255,0.55)" radius={[1,1,0,0]} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Vintage year summary chart */}
      <div style={{ background: 'var(--bg2)', border: '1px solid var(--bdr)', borderRadius: 14, padding: '18px 20px' }}>
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 12, fontWeight: 600 }}>Avg Portfolio IRR by Vintage Year vs Benchmark</div>
          <div style={{ fontSize: 10, color: 'var(--tx3)', marginTop: 2 }}>
            Portfolio average (blue) vs Cambridge Associates Q1 / Median / Q3 bands
          </div>
        </div>
        <div style={{ height: 220 }}>
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={vintageGroups} margin={{ top: 8, right: 16, left: 10, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis
                dataKey="vintage"
                tick={{ fill: 'var(--tx3)', fontSize: 10 }}
                tickLine={false} axisLine={false}
              />
              <YAxis
                tickFormatter={v => `${v}%`}
                tick={{ fill: 'var(--tx3)', fontSize: 9 }}
                tickLine={false} axisLine={false}
              />
              <Tooltip
                contentStyle={{ background: 'var(--bg3)', border: '1px solid var(--bdr2)', borderRadius: 8, fontSize: 11 }}
                formatter={(v, n) => [`${v}%`, n === 'avgIRR' ? 'Portfolio Avg IRR' : n === 'medianIRR' ? 'CA Median' : n === 'q1IRR' ? 'CA Top Quartile' : 'CA Bottom Quartile']}
                cursor={{ fill: 'rgba(255,255,255,0.04)' }}
              />
              {/* Benchmark bands as thin reference bars */}
              <Bar dataKey="q1IRR"     barSize={30} fill="rgba(34,197,94,0.12)"  radius={[3,3,0,0]} />
              <Bar dataKey="medianIRR" barSize={30} fill="rgba(59,130,246,0.12)" radius={[3,3,0,0]} />
              <Bar dataKey="q3IRR"     barSize={30} fill="rgba(245,158,11,0.12)" radius={[3,3,0,0]} />
              {/* Portfolio avg as bright blue bars */}
              <Bar dataKey="avgIRR"    barSize={14} fill="var(--blue)" radius={[3,3,0,0]} />
              {/* Median as line */}
              <Line dataKey="medianIRR" type="monotone" stroke="rgba(59,130,246,0.6)" strokeWidth={1.5} strokeDasharray="4 3" dot={false} />
              <Line dataKey="q1IRR"     type="monotone" stroke="rgba(34,197,94,0.5)"  strokeWidth={1} strokeDasharray="3 4" dot={false} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginTop: 8, flexWrap: 'wrap' }}>
          {[
            ['var(--blue)',                  'Portfolio Avg IRR'],
            ['rgba(34,197,94,0.5)',          'CA Top Quartile (Q1)'],
            ['rgba(59,130,246,0.6)',         'CA Median'],
            ['rgba(245,158,11,0.2)',         'CA Bottom Quartile (Q3)'],
          ].map(([c, l]) => (
            <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 10, color: 'var(--tx3)' }}>
              <span style={{ width: 10, height: 10, borderRadius: 2, background: c, display: 'inline-block' }} />
              {l}
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function KpiCard({ label, value, sub, color }) {
  return (
    <div style={{
      background: 'var(--bg2)', border: '1px solid var(--bdr)',
      borderRadius: 14, padding: '16px 18px',
      display: 'flex', flexDirection: 'column', gap: 8,
    }}>
      <span style={{ fontSize: 10, color: 'var(--tx3)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</span>
      <div style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-0.5px', color }}>{value}</div>
      <div style={{ fontSize: 10, color: 'var(--tx3)' }}>{sub}</div>
    </div>
  )
}

function FilterBtn({ label, active, onClick, color }) {
  const [hov, setHov] = useState(false)
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        padding: '5px 11px', borderRadius: 7, fontSize: 10, fontWeight: 500,
        cursor: 'pointer', transition: 'all 0.15s', border: 'none',
        background: active
          ? (color ? color + '28' : 'rgba(59,130,246,0.2)')
          : hov ? 'var(--surf)' : 'var(--bg3)',
        color: active ? (color ?? 'var(--blue2)') : hov ? 'var(--tx)' : 'var(--tx2)',
        outline: active ? `1px solid ${color ?? 'var(--blue)'}40` : '1px solid transparent',
      }}
    >{label}</button>
  )
}

function MetricBtn({ label, active, onClick }) {
  const [hov, setHov] = useState(false)
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        padding: '5px 11px', borderRadius: 7, fontSize: 10, fontWeight: 500,
        cursor: 'pointer', transition: 'all 0.15s', border: 'none',
        background: active ? 'rgba(59,130,246,0.2)' : hov ? 'var(--surf)' : 'var(--bg3)',
        color: active ? 'var(--blue2)' : hov ? 'var(--tx)' : 'var(--tx2)',
        outline: active ? '1px solid rgba(59,130,246,0.4)' : '1px solid transparent',
      }}
    >{label}</button>
  )
}

function BenchmarkRow({ fund: f, even }) {
  const delta = f.vsMedian
  const qColor = Q_COLORS[f.quartile] ?? 'var(--tx3)'
  return (
    <tr style={{ borderBottom: '1px solid var(--bdr)', background: even ? 'transparent' : 'rgba(255,255,255,0.015)' }}>
      <td style={{ padding: '9px 12px' }}>
        <div style={{ fontSize: 11, fontWeight: 500 }}>{f.fund}</div>
        <div style={{ fontSize: 9, color: 'var(--tx3)' }}>{f.manager}</div>
      </td>
      <td style={{ padding: '9px 12px', fontSize: 11, color: 'var(--tx2)' }}>
        {f.vintage}
      </td>
      <td style={{ padding: '9px 12px' }}>
        <span style={{
          padding: '2px 7px', borderRadius: 5, fontSize: 9, fontWeight: 600,
          background: (CLS_COLORS[f.cls] ?? '#888') + '22',
          color: CLS_COLORS[f.cls] ?? '#888',
        }}>{f.cls}</span>
      </td>
      <td style={{ padding: '9px 12px', textAlign: 'right', fontSize: 11, fontWeight: 600, color: 'var(--green)' }}>
        {f.irr}%
      </td>
      <td style={{ padding: '9px 12px', textAlign: 'right' }}>
        {delta !== null ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 3 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: delta >= 0 ? 'var(--green)' : 'var(--red)' }}>
              {delta >= 0 ? '+' : ''}{delta}%
            </span>
            {/* Mini progress bar showing position within Q3–Q1 range */}
            {f.bm && (() => {
              const range = f.bm.q1 - f.bm.q3
              const pos   = Math.max(0, Math.min(100, ((f.irr - f.bm.q3) / range) * 100))
              return (
                <div style={{ width: 52, height: 3, borderRadius: 2, background: 'var(--bg4)', overflow: 'hidden', position: 'relative' }}>
                  <div style={{ position: 'absolute', left: '50%', width: 1, height: '100%', background: 'rgba(255,255,255,0.25)' }} />
                  <div style={{ position: 'absolute', left: 0, width: `${pos}%`, height: '100%', background: qColor, borderRadius: 2 }} />
                </div>
              )
            })()}
          </div>
        ) : <span style={{ color: 'var(--tx3)', fontSize: 10 }}>—</span>}
      </td>
      <td style={{ padding: '9px 12px', textAlign: 'right' }}>
        {f.quartile ? (
          <span style={{
            padding: '2px 8px', borderRadius: 5, fontSize: 9, fontWeight: 700,
            background: qColor + '22', color: qColor,
          }}>{Q_SHORT[f.quartile]}</span>
        ) : <span style={{ color: 'var(--tx3)', fontSize: 10 }}>—</span>}
      </td>
      <td style={{ padding: '9px 12px', textAlign: 'right', fontSize: 11, color: 'var(--tx2)' }}>{f.tvpi}x</td>
      <td style={{ padding: '9px 12px', textAlign: 'right', fontSize: 11, color: 'var(--tx2)' }}>{f.dpi}x</td>
      <td style={{ padding: '9px 12px', textAlign: 'right', fontSize: 11, color: 'var(--tx3)' }}>{fmt$(f.commitment)}</td>
    </tr>
  )
}
