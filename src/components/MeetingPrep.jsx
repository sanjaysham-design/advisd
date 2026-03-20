import React, { useState } from 'react'

// ── Per-client meeting brief data ─────────────────────────────────────────────
const PROFILES = {
  'Chen Family Office': {
    aum:          42_300_000,
    ytd:          '+11.4%',
    twrr:         '9.8%',
    irr:          '13.1%',
    since:        '2016',
    objective:    'Preservation & Growth',
    riskProfile:  'Moderate',
    numFunds:     5,
    topQPct:      40,
    liqCoverage3: 3.2,
    liqCoverage6: 1.8,
    totalCalls:   380_000,
    feeDrag:      '2.1%',
    allocation: [
      { cls: 'Real Estate',    pct: 38, color: '#a78bfa' },
      { cls: 'Private Equity', pct: 33, color: '#3b82f6' },
      { cls: 'Hedge Fund',     pct: 13, color: '#14b8a6' },
      { cls: 'Fixed Income',   pct: 10, color: '#f59e0b' },
      { cls: 'Cash',           pct:  6, color: '#22c55e' },
    ],
    agenda: [
      { urgency: 'high',   cat: 'Capital Call', text: 'Blackstone Real Estate XI — $380K call due in 12 days. Confirm wire instructions and source of funds.' },
      { urgency: 'medium', cat: 'Allocation',   text: 'Real Estate is 4.2% overweight vs target (38% actual vs 34% target). Discuss rebalancing options.' },
      { urgency: 'medium', cat: 'Fee Review',   text: 'Carry accrual of $650K across 4 funds. Review waterfall implications before year-end.' },
      { urgency: 'low',    cat: 'Performance',  text: 'KKR Americas XIV in top quartile (+3.3% vs benchmark). Harrison St. slightly below median — monitor.' },
      { urgency: 'low',    cat: 'Planning',     text: 'Quarterly review of IPS objectives. Client approaching retirement — consider shifting to higher DPI funds.' },
    ],
    calls: [
      { fund: 'Blackstone Real Estate XI', amount: 380_000, due: 12, urgency: 'high' },
      { fund: 'KKR Americas Fund XIV',     amount: 210_000, due: 38, urgency: 'upcoming' },
    ],
    notes: '',
  },

  'Meridian Capital Partners': {
    aum:          38_100_000,
    ytd:          '+13.2%',
    twrr:         '11.8%',
    irr:          '16.2%',
    since:        '2014',
    objective:    'Aggressive Growth',
    riskProfile:  'Aggressive',
    numFunds:     5,
    topQPct:      60,
    liqCoverage3: 1.4,
    liqCoverage6: 0.9,
    totalCalls:   890_000,
    feeDrag:      '2.8%',
    allocation: [
      { cls: 'Private Equity', pct: 72, color: '#3b82f6' },
      { cls: 'Real Estate',    pct: 13, color: '#a78bfa' },
      { cls: 'Credit',         pct:  9, color: '#f59e0b' },
      { cls: 'Cash',           pct:  6, color: '#22c55e' },
    ],
    agenda: [
      { urgency: 'high',   cat: 'Liquidity',   text: '6-month liquidity coverage at 0.9x — below target. $890K in upcoming calls may require liquidation of public positions.' },
      { urgency: 'high',   cat: 'Capital Call', text: 'Apollo Global XVI + Carlyle VIII — $620K combined due within 30 days. Liquidity plan required.' },
      { urgency: 'medium', cat: 'Allocation',   text: 'PE concentration at 72%. IPS cap is 70%. Discuss waiver or rebalancing before next commitment.' },
      { urgency: 'medium', cat: 'Performance',  text: 'Vista Equity (+4.4% vs benchmark) and Apollo (+1.6% vs benchmark). All PE funds above median.' },
      { urgency: 'low',    cat: 'Fee Review',   text: 'Total carry accrued at $1.7M. Discuss tax planning for potential distributions in 2025.' },
    ],
    calls: [
      { fund: 'Apollo Global Fund XVI',    amount: 420_000, due:  9, urgency: 'high' },
      { fund: 'Carlyle Partners VIII',     amount: 200_000, due: 22, urgency: 'upcoming' },
      { fund: 'Vista Equity Partners VII', amount: 270_000, due: 55, urgency: 'future' },
    ],
    notes: '',
  },

  'Okonkwo Family Trust': {
    aum:          28_400_000,
    ytd:          '+10.8%',
    twrr:         '9.4%',
    irr:          '11.5%',
    since:        '2018',
    objective:    'Growth & Income',
    riskProfile:  'Moderate-Aggressive',
    numFunds:     5,
    topQPct:      60,
    liqCoverage3: 4.1,
    liqCoverage6: 2.6,
    totalCalls:   165_000,
    feeDrag:      '3.4%',
    allocation: [
      { cls: 'Hedge Fund',     pct: 54, color: '#14b8a6' },
      { cls: 'Private Equity', pct: 19, color: '#3b82f6' },
      { cls: 'Credit',         pct: 15, color: '#f59e0b' },
      { cls: 'Cash',           pct: 12, color: '#22c55e' },
    ],
    agenda: [
      { urgency: 'medium', cat: 'Allocation',   text: 'Hedge fund allocation at 54% is above 50% IPS cap. Discuss reducing exposure as PE sleeve matures.' },
      { urgency: 'medium', cat: 'Fee Review',   text: 'Effective fee rate at 3.4% — highest in book. Citadel and Millennium fees totaling $654K YTD. Renegotiate?' },
      { urgency: 'medium', cat: 'Performance',  text: 'Citadel (+2.0% vs median) and Millennium (+2.1% vs median) both top quartile. Two Sigma close to median.' },
      { urgency: 'low',    cat: 'Capital Call', text: 'TPG Rise Climate — $165K due in 44 days. Sufficient liquidity; no action required.' },
      { urgency: 'low',    cat: 'Planning',     text: 'Consider diversifying into RE or infrastructure to reduce hedge fund concentration and fee load.' },
    ],
    calls: [
      { fund: 'TPG Rise Climate Fund', amount: 165_000, due: 44, urgency: 'upcoming' },
    ],
    notes: '',
  },

  'Park & Lee Family Office': {
    aum:          35_600_000,
    ytd:          '+9.6%',
    twrr:         '8.2%',
    irr:          '10.8%',
    since:        '2017',
    objective:    'Balanced Growth',
    riskProfile:  'Moderate',
    numFunds:     5,
    topQPct:      40,
    liqCoverage3: 5.8,
    liqCoverage6: 3.4,
    totalCalls:   310_000,
    feeDrag:      '1.6%',
    allocation: [
      { cls: 'Equity',         pct: 43, color: '#22c55e' },
      { cls: 'Private Equity', pct: 23, color: '#3b82f6' },
      { cls: 'Real Estate',    pct: 16, color: '#a78bfa' },
      { cls: 'Credit',         pct: 12, color: '#f59e0b' },
      { cls: 'Cash',           pct:  6, color: '#22c55e' },
    ],
    agenda: [
      { urgency: 'medium', cat: 'Performance',  text: 'Portfolio at 9.6% YTD vs blended benchmark of 10.2%. Underperformance driven by iShares and Morgan Stanley lagging.' },
      { urgency: 'medium', cat: 'Allocation',   text: 'Consider increasing PE allocation from 23% to 30% to improve long-term return profile per IPS.' },
      { urgency: 'low',    cat: 'Capital Call', text: 'JP Morgan PE Partners — $185K due in 31 days. Liquidity comfortable at 5.8x 3-month coverage.' },
      { urgency: 'low',    cat: 'Fee Review',   text: 'Lowest fee drag in book at 1.6%. iShares and Morgan Stanley keeping blended rate low.' },
      { urgency: 'low',    cat: 'Planning',     text: 'Estate planning review — review trust structure and beneficiary designations before year-end.' },
    ],
    calls: [
      { fund: 'JP Morgan PE Partners', amount: 185_000, due: 31, urgency: 'upcoming' },
      { fund: 'Nuveen Real Estate',    amount: 125_000, due: 62, urgency: 'future' },
    ],
    notes: '',
  },

  'Rosenberg Family Trust': {
    aum:          35_000_000,
    ytd:          '+12.1%',
    twrr:         '10.8%',
    irr:          '14.1%',
    since:        '2015',
    objective:    'Preservation & Income',
    riskProfile:  'Moderate',
    numFunds:     5,
    topQPct:      80,
    liqCoverage3: 2.6,
    liqCoverage6: 1.5,
    totalCalls:   442_000,
    feeDrag:      '2.4%',
    allocation: [
      { cls: 'Real Estate',    pct: 51, color: '#a78bfa' },
      { cls: 'Credit',         pct: 16, color: '#f59e0b' },
      { cls: 'Private Equity', pct: 13, color: '#3b82f6' },
      { cls: 'Equity',         pct: 11, color: '#22c55e' },
      { cls: 'Cash',           pct:  9, color: '#22c55e' },
    ],
    agenda: [
      { urgency: 'high',   cat: 'Capital Call', text: 'Blackstone RE Partners X — $280K call due in 8 days. Confirm liquidity source.' },
      { urgency: 'medium', cat: 'Allocation',   text: 'RE concentration at 51% near IPS cap of 55%. Starwood V coming up for distribution — reinvestment strategy?' },
      { urgency: 'medium', cat: 'Performance',  text: '4 of 5 funds top quartile. Vanguard Total Market slightly underperforming as drag on blended return.' },
      { urgency: 'low',    cat: 'Fee Review',   text: 'Carry accrual of $1.0M on RE funds. Waterfall structures differ across Blackstone and Starwood — review.' },
      { urgency: 'low',    cat: 'Planning',     text: 'Successor trustee documentation due for annual review. Coordinate with estate attorney.' },
    ],
    calls: [
      { fund: 'Blackstone RE Partners X',   amount: 280_000, due:  8, urgency: 'high' },
      { fund: 'Hamilton Lane Secondaries',  amount: 162_000, due: 48, urgency: 'upcoming' },
    ],
    notes: '',
  },
}

const FALLBACK = 'Meridian Capital Partners'

// ── Helpers ───────────────────────────────────────────────────────────────────
const fmt$ = v => v >= 1_000_000 ? `$${(v/1_000_000).toFixed(1)}M` : `$${(v/1_000).toFixed(0)}K`
const today = new Date()
const fmtDate = d => d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })

const URGENCY = {
  high:     { color: 'var(--red)',    bg: 'rgba(239,68,68,0.1)',    label: 'Action Required' },
  medium:   { color: 'var(--amber)',  bg: 'rgba(245,158,11,0.1)',   label: 'Discuss' },
  low:      { color: 'var(--blue2)', bg: 'rgba(59,130,246,0.08)',  label: 'FYI' },
}

const CALL_URGENCY = {
  high:     { color: 'var(--red)',    label: 'Urgent' },
  upcoming: { color: 'var(--amber)',  label: 'Upcoming' },
  future:   { color: 'var(--tx3)',    label: 'Future' },
}

const MEETING_TYPES = [
  'Quarterly Portfolio Review',
  'Annual Strategic Review',
  'Capital Call Discussion',
  'Onboarding / Initial Meeting',
  'Performance Review',
  'Tax & Estate Planning',
  'Ad-hoc Check-in',
]

// ── Main component ─────────────────────────────────────────────────────────────
export default function MeetingPrep({ activeClient }) {
  const name    = activeClient?.name ?? FALLBACK
  const profile = PROFILES[name] ?? PROFILES[FALLBACK]

  const [meetingType, setMeetingType] = useState(MEETING_TYPES[0])
  const [meetingDate, setMeetingDate] = useState(today.toISOString().slice(0, 10))
  const [notes, setNotes]             = useState(profile.notes)

  function handlePrint() {
    window.print()
  }

  const liqColor = profile.liqCoverage6 >= 1.5 ? 'var(--green)'
    : profile.liqCoverage6 >= 1.0 ? 'var(--amber)'
    : 'var(--red)'

  return (
    <>
      {/* Print styles injected via a style tag */}
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #meeting-brief, #meeting-brief * { visibility: visible; }
          #meeting-brief { position: absolute; left: 0; top: 0; width: 100%; }
          .no-print { display: none !important; }
          .print-break { page-break-before: always; }
        }
      `}</style>

      <div style={{ padding: '20px 28px', animation: 'fadeUp 0.3s ease' }}>

        {/* ── Toolbar ── */}
        <div className="no-print" style={{
          display: 'flex', alignItems: 'center', gap: 10,
          marginBottom: 20, flexWrap: 'wrap',
        }}>
          <span style={{ fontSize: 10, color: 'var(--tx3)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Meeting Date</span>
          <input
            type="date"
            value={meetingDate}
            onChange={e => setMeetingDate(e.target.value)}
            style={{
              background: 'var(--bg2)', border: '1px solid var(--bdr2)',
              borderRadius: 7, padding: '5px 10px', fontSize: 11, color: 'var(--tx)',
              cursor: 'pointer',
            }}
          />
          <span style={{ fontSize: 10, color: 'var(--tx3)', textTransform: 'uppercase', letterSpacing: '0.5px', marginLeft: 8 }}>Type</span>
          <select
            value={meetingType}
            onChange={e => setMeetingType(e.target.value)}
            style={{
              background: 'var(--bg2)', border: '1px solid var(--bdr2)',
              borderRadius: 7, padding: '5px 10px', fontSize: 11, color: 'var(--tx)',
              cursor: 'pointer',
            }}
          >
            {MEETING_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
            <ActionBtn ghost label="📋 Copy Summary" onClick={() => {
              const summary = [
                `Meeting Brief — ${name}`,
                `Date: ${fmtDate(new Date(meetingDate))} · ${meetingType}`,
                `AUM: ${fmt$(profile.aum)} · YTD: ${profile.ytd} · TWRR: ${profile.twrr}`,
                '',
                'Agenda:',
                ...profile.agenda.map((a, i) => `${i+1}. [${a.cat}] ${a.text}`),
              ].join('\n')
              navigator.clipboard?.writeText(summary).catch(() => {})
            }} />
            <ActionBtn label="🖨 Print / Export PDF" onClick={handlePrint} />
          </div>
        </div>

        {/* ── Brief document ── */}
        <div id="meeting-brief" style={{
          background: 'var(--bg2)', border: '1px solid var(--bdr)',
          borderRadius: 16, overflow: 'hidden', maxWidth: 900, margin: '0 auto',
        }}>

          {/* Header band */}
          <div style={{
            background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
            padding: '28px 32px',
            borderBottom: '1px solid var(--bdr)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 6 }}>
                  Client Meeting Brief
                </div>
                <div style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.5px', marginBottom: 4 }}>
                  {name}
                </div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                  <span>{meetingType}</span>
                  <span style={{ color: 'rgba(255,255,255,0.25)' }}>·</span>
                  <span>{fmtDate(new Date(meetingDate))}</span>
                  <span style={{ color: 'rgba(255,255,255,0.25)' }}>·</span>
                  <span>Advisor: James Whitmore</span>
                </div>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', marginBottom: 4 }}>Client Since {profile.since}</div>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', marginBottom: 4 }}>{profile.objective}</div>
                <span style={{
                  padding: '3px 10px', borderRadius: 6, fontSize: 10, fontWeight: 600,
                  background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)',
                  border: '1px solid rgba(255,255,255,0.15)',
                }}>{profile.riskProfile} Risk</span>
              </div>
            </div>

            {/* Snapshot metrics */}
            <div style={{ display: 'flex', gap: 0, marginTop: 24, borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 20 }}>
              {[
                { label: 'AUM',        value: fmt$(profile.aum) },
                { label: 'YTD Return', value: profile.ytd,  color: 'var(--green)' },
                { label: 'TWRR',       value: profile.twrr },
                { label: 'Net IRR',    value: profile.irr },
                { label: 'Funds',      value: profile.numFunds },
                { label: 'Top Quartile', value: `${profile.topQPct}%`, color: '#22c55e' },
                { label: '6-Mo Liquidity', value: `${profile.liqCoverage6}x`, color: liqColor },
                { label: 'Upcoming Calls', value: fmt$(profile.totalCalls), color: profile.totalCalls > 500_000 ? 'var(--amber)' : 'var(--tx)' },
              ].map((m, i) => (
                <div key={m.label} style={{
                  flex: 1, padding: '0 16px',
                  borderLeft: i === 0 ? 'none' : '1px solid rgba(255,255,255,0.08)',
                }}>
                  <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4 }}>{m.label}</div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: m.color ?? 'rgba(255,255,255,0.9)', letterSpacing: '-0.3px' }}>{m.value}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ padding: '28px 32px', display: 'flex', flexDirection: 'column', gap: 28 }}>

            {/* ── Agenda ── */}
            <section>
              <SectionTitle number="1" title="Meeting Agenda" sub="Auto-generated from portfolio state" />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {profile.agenda.map((item, i) => {
                  const u = URGENCY[item.urgency]
                  return (
                    <div key={i} style={{
                      display: 'flex', gap: 14, padding: '12px 16px',
                      background: u.bg, borderRadius: 10,
                      border: `1px solid ${u.color}20`,
                    }}>
                      <div style={{
                        width: 22, height: 22, borderRadius: 6, flexShrink: 0,
                        background: u.color + '22', border: `1px solid ${u.color}40`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 10, fontWeight: 700, color: u.color,
                      }}>{i + 1}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                          <span style={{
                            padding: '1px 7px', borderRadius: 4, fontSize: 9, fontWeight: 700,
                            background: u.color + '22', color: u.color,
                          }}>{item.cat}</span>
                          <span style={{ fontSize: 9, color: 'var(--tx3)' }}>{u.label}</span>
                        </div>
                        <div style={{ fontSize: 12, color: 'var(--tx)', lineHeight: 1.5 }}>{item.text}</div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </section>

            {/* ── Two columns: Capital Calls + Allocation ── */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>

              {/* Capital Calls */}
              <section>
                <SectionTitle number="2" title="Capital Calls" sub="Requiring attention this quarter" />
                {profile.calls.length === 0 ? (
                  <EmptyState text="No capital calls due this quarter" />
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {profile.calls.map((c, i) => {
                      const u = CALL_URGENCY[c.urgency]
                      return (
                        <div key={i} style={{
                          padding: '12px 14px',
                          background: 'var(--bg3)', borderRadius: 10,
                          border: '1px solid var(--bdr)',
                        }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                            <div style={{ fontSize: 11, fontWeight: 600, lineHeight: 1.3, maxWidth: '65%' }}>{c.fund}</div>
                            <span style={{
                              padding: '2px 8px', borderRadius: 5, fontSize: 9, fontWeight: 700,
                              background: u.color + '20', color: u.color,
                            }}>{u.label}</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: 18, fontWeight: 700, letterSpacing: '-0.5px', color: u.color }}>{fmt$(c.amount)}</span>
                            <span style={{ fontSize: 10, color: 'var(--tx3)' }}>Due in {c.due} days</span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </section>

              {/* Allocation */}
              <section>
                <SectionTitle number="3" title="Allocation" sub="Current portfolio composition" />
                <div style={{
                  background: 'var(--bg3)', borderRadius: 10,
                  border: '1px solid var(--bdr)', padding: '14px 16px',
                }}>
                  {/* Stacked bar */}
                  <div style={{ display: 'flex', height: 10, borderRadius: 5, overflow: 'hidden', marginBottom: 16 }}>
                    {profile.allocation.map(a => (
                      <div
                        key={a.cls}
                        style={{ width: `${a.pct}%`, background: a.color, transition: 'width 0.4s' }}
                        title={`${a.cls}: ${a.pct}%`}
                      />
                    ))}
                  </div>
                  {profile.allocation.map(a => (
                    <div key={a.cls} style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '6px 0', borderBottom: '1px solid var(--bdr)',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ width: 8, height: 8, borderRadius: 2, background: a.color, display: 'inline-block', flexShrink: 0 }} />
                        <span style={{ fontSize: 11, color: 'var(--tx2)' }}>{a.cls}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ width: 60, height: 4, borderRadius: 2, background: 'var(--bg4)', overflow: 'hidden' }}>
                          <div style={{ width: `${a.pct}%`, height: '100%', background: a.color, borderRadius: 2 }} />
                        </div>
                        <span style={{ fontSize: 11, fontWeight: 600, minWidth: 28, textAlign: 'right' }}>{a.pct}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            {/* ── Two columns: Key Metrics + Notes ── */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>

              {/* Key metrics */}
              <section>
                <SectionTitle number="4" title="Key Metrics at a Glance" sub="Portfolio health summary" />
                <div style={{
                  background: 'var(--bg3)', borderRadius: 10,
                  border: '1px solid var(--bdr)', overflow: 'hidden',
                }}>
                  {[
                    { label: 'AUM',                value: fmt$(profile.aum) },
                    { label: 'YTD Return',          value: profile.ytd,  good: true },
                    { label: 'TWRR (3-yr)',         value: profile.twrr },
                    { label: 'Net IRR (inception)', value: profile.irr,  good: true },
                    { label: '3-Mo Liquidity',      value: `${profile.liqCoverage3}x`, good: profile.liqCoverage3 >= 1.5 },
                    { label: '6-Mo Liquidity',      value: `${profile.liqCoverage6}x`, good: profile.liqCoverage6 >= 1.0, bad: profile.liqCoverage6 < 1.0 },
                    { label: 'Fee Drag',            value: profile.feeDrag },
                    { label: 'Top Quartile Funds',  value: `${profile.topQPct}%`, good: profile.topQPct >= 50 },
                  ].map((m, i) => (
                    <div key={m.label} style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      padding: '9px 14px',
                      borderBottom: i < 7 ? '1px solid var(--bdr)' : 'none',
                      background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.015)',
                    }}>
                      <span style={{ fontSize: 11, color: 'var(--tx2)' }}>{m.label}</span>
                      <span style={{
                        fontSize: 12, fontWeight: 600,
                        color: m.bad ? 'var(--red)' : m.good ? 'var(--green)' : 'var(--tx)',
                      }}>{m.value}</span>
                    </div>
                  ))}
                </div>
              </section>

              {/* Advisor notes */}
              <section>
                <SectionTitle number="5" title="Advisor Notes" sub="Confidential — not shared with client" />
                <textarea
                  className="no-print"
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder={`Add pre-meeting notes for ${name.split(' ')[0]}…\n\nE.g., client mentioned interest in infrastructure at last call. Spouse attending. Review estate docs before meeting.`}
                  style={{
                    width: '100%', minHeight: 200, resize: 'vertical',
                    background: 'var(--bg3)', border: '1px solid var(--bdr2)',
                    borderRadius: 10, padding: '14px 16px',
                    fontSize: 12, color: 'var(--tx)', lineHeight: 1.6,
                    outline: 'none', fontFamily: 'inherit',
                  }}
                  onFocus={e => e.target.style.borderColor = 'var(--blue)'}
                  onBlur={e => e.target.style.borderColor = 'var(--bdr2)'}
                />
                {/* Print version of notes */}
                {notes && (
                  <div style={{
                    display: 'none',
                    background: 'var(--bg3)', border: '1px solid var(--bdr)',
                    borderRadius: 10, padding: '14px 16px',
                    fontSize: 12, lineHeight: 1.6, color: 'var(--tx)',
                  }} className="print-notes">{notes}</div>
                )}
              </section>
            </div>

            {/* Footer */}
            <div style={{
              borderTop: '1px solid var(--bdr)', paddingTop: 16,
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              <div style={{ fontSize: 10, color: 'var(--tx3)' }}>
                Generated by Advisd · {fmtDate(today)} · Confidential — For Advisor Use Only
              </div>
              <div style={{ fontSize: 10, color: 'var(--tx3)' }}>
                James Whitmore, Senior Advisor
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function SectionTitle({ number, title, sub }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
      <div style={{
        width: 22, height: 22, borderRadius: 6, flexShrink: 0,
        background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.3)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 10, fontWeight: 700, color: 'var(--blue2)',
      }}>{number}</div>
      <div>
        <div style={{ fontSize: 12, fontWeight: 600 }}>{title}</div>
        {sub && <div style={{ fontSize: 10, color: 'var(--tx3)', marginTop: 1 }}>{sub}</div>}
      </div>
    </div>
  )
}

function EmptyState({ text }) {
  return (
    <div style={{
      background: 'var(--bg3)', border: '1px solid var(--bdr)',
      borderRadius: 10, padding: '20px', textAlign: 'center',
      fontSize: 11, color: 'var(--tx3)',
    }}>{text}</div>
  )
}

function ActionBtn({ label, onClick, ghost }) {
  const [hov, setHov] = useState(false)
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        padding: '6px 14px', borderRadius: 7, fontSize: 11, fontWeight: 500,
        cursor: 'pointer', border: 'none', transition: 'all 0.15s',
        background: ghost
          ? hov ? 'var(--surf2)' : 'var(--surf)'
          : hov ? '#2563eb' : 'var(--blue)',
        color: ghost ? (hov ? 'var(--tx)' : 'var(--tx2)') : '#fff',
        outline: ghost ? '1px solid var(--bdr)' : 'none',
      }}
    >{label}</button>
  )
}
