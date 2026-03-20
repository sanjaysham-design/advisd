import React, { useState, useMemo } from 'react'

// ── Per-client fund lists ─────────────────────────────────────────────────────
const FUND_LISTS = {
  'Chen Family Office': [
    { fund: 'Blackstone Real Estate XI', manager: 'Blackstone',   cls: 'Real Estate'    },
    { fund: 'KKR Americas Fund XIV',     manager: 'KKR',          cls: 'Private Equity' },
    { fund: 'Bridgewater All-Weather',   manager: 'Bridgewater',  cls: 'Hedge Fund'     },
    { fund: 'PIMCO Diversified Income',  manager: 'PIMCO',        cls: 'Fixed Income'   },
    { fund: 'Harrison St. RE Core',      manager: 'Harrison St.', cls: 'Real Estate'    },
  ],
  'Meridian Capital Partners': [
    { fund: 'Apollo Global Fund XVI',    manager: 'Apollo',   cls: 'Private Equity' },
    { fund: 'Carlyle Partners VIII',     manager: 'Carlyle',  cls: 'Private Equity' },
    { fund: 'Vista Equity Partners VII', manager: 'Vista',    cls: 'Private Equity' },
    { fund: 'Oaktree Capital Fund IV',   manager: 'Oaktree',  cls: 'Credit'         },
    { fund: 'Ares Real Estate IV',       manager: 'Ares',     cls: 'Real Estate'    },
  ],
  'Okonkwo Family Trust': [
    { fund: 'Citadel Wellington',     manager: 'Citadel',    cls: 'Hedge Fund'     },
    { fund: 'Millennium Partners',    manager: 'Millennium', cls: 'Hedge Fund'     },
    { fund: 'Two Sigma Spectrum',     manager: 'Two Sigma',  cls: 'Hedge Fund'     },
    { fund: 'TPG Rise Climate Fund',  manager: 'TPG',        cls: 'Private Equity' },
    { fund: 'Blackstone Credit',      manager: 'Blackstone', cls: 'Credit'         },
  ],
  'Park & Lee Family Office': [
    { fund: 'Morgan Stanley Growth', manager: 'Morgan Stanley', cls: 'Equity'         },
    { fund: 'JP Morgan PE Partners', manager: 'JP Morgan',      cls: 'Private Equity' },
    { fund: 'Nuveen Real Estate',    manager: 'Nuveen',         cls: 'Real Estate'    },
    { fund: 'iShares Diversified',   manager: 'BlackRock',      cls: 'Equity'         },
    { fund: 'PGIM Private Credit',   manager: 'PGIM',           cls: 'Credit'         },
  ],
  'Rosenberg Family Trust': [
    { fund: 'Blackstone RE Partners X',  manager: 'Blackstone',    cls: 'Real Estate'    },
    { fund: 'Starwood Capital V',         manager: 'Starwood',      cls: 'Real Estate'    },
    { fund: 'Ares Capital Fund VII',      manager: 'Ares',          cls: 'Credit'         },
    { fund: 'Hamilton Lane Secondaries',  manager: 'Hamilton Lane', cls: 'Private Equity' },
    { fund: 'Vanguard Total Market',      manager: 'Vanguard',      cls: 'Equity'         },
  ],
}

const FALLBACK = 'Meridian Capital Partners'
const TODAY = new Date('2026-03-19')

// ── Document generation ───────────────────────────────────────────────────────
// Status: 'received' | 'late' | 'overdue' | 'pending' | 'expected'
function genDocs(funds) {
  const docs = []
  let id = 1

  funds.forEach((f, fi) => {
    const seed = fi  // deterministic variation by fund index

    // ── Quarterly Statements ────────────────────────────────────────────────
    const quarters = [
      { period: 'Q1 2025', due: d('2025-04-30'), recOffset: -8  },   // received Apr 22
      { period: 'Q2 2025', due: d('2025-07-31'), recOffset: -3  },   // received Jul 28
      { period: 'Q3 2025', due: d('2025-10-31'), recOffset: seed % 2 === 0 ? 5 : -4 }, // some slightly late
      { period: 'Q4 2025', due: d('2026-01-31'), recOffset: null },  // handled separately
    ]

    quarters.forEach((q, qi) => {
      if (qi < 3) {
        const rec = offsetDate(q.due, q.recOffset)
        docs.push(doc(id++, f, 'Quarterly Statement', q.period, q.due,
          rec, rec > q.due ? 'late' : 'received'))
      } else {
        // Q4 2025 — split by fund: 3/5 received, 1/5 late, 1/5 overdue
        const roll = seed % 5
        if (roll < 3) {
          const rec = d('2026-01-28')
          docs.push(doc(id++, f, 'Quarterly Statement', q.period, q.due, rec, 'received'))
        } else if (roll === 3) {
          const rec = d('2026-02-18')
          docs.push(doc(id++, f, 'Quarterly Statement', q.period, q.due, rec, 'late'))
        } else {
          docs.push(doc(id++, f, 'Quarterly Statement', q.period, q.due, null, 'overdue'))
        }
      }
    })

    // ── K-1 Tax Form (FY 2024) ───────────────────────────────────────────────
    const k1Due = d('2026-04-15')
    const k1Roll = seed % 5
    if (k1Roll < 2) {
      docs.push(doc(id++, f, 'K-1 Tax Form', 'FY 2024', k1Due, d('2026-03-08'), 'received'))
    } else {
      docs.push(doc(id++, f, 'K-1 Tax Form', 'FY 2024', k1Due, null, 'pending'))
    }

    // ── Schedule K-3 (FY 2024) — only PE & HF ───────────────────────────────
    if (f.cls === 'Private Equity' || f.cls === 'Hedge Fund') {
      const k3Due = d('2026-04-30')
      docs.push(doc(id++, f, 'Schedule K-3', 'FY 2024', k3Due, null, 'expected'))
    }

    // ── Annual Audited Financials (FY 2024) ──────────────────────────────────
    const auditDue = d('2026-04-30')
    const auditRoll = seed % 4
    if (auditRoll === 0) {
      docs.push(doc(id++, f, 'Annual Audited Financials', 'FY 2024', auditDue, d('2026-03-12'), 'received'))
    } else {
      docs.push(doc(id++, f, 'Annual Audited Financials', 'FY 2024', auditDue, null,
        auditRoll === 3 ? 'pending' : 'expected'))
    }

    // ── Capital Account Statement (Q4 2025) ──────────────────────────────────
    if (f.cls !== 'Equity' && f.cls !== 'Fixed Income') {
      const casDue = d('2026-02-15')
      const casRoll = seed % 3
      if (casRoll < 2) {
        docs.push(doc(id++, f, 'Capital Account Statement', 'Q4 2025', casDue, d('2026-02-10'), 'received'))
      } else {
        docs.push(doc(id++, f, 'Capital Account Statement', 'Q4 2025', casDue, null, 'overdue'))
      }
    }

    // ── Q1 2026 Statement ─────────────────────────────────────────────────────
    docs.push(doc(id++, f, 'Quarterly Statement', 'Q1 2026', d('2026-04-30'), null, 'expected'))
  })

  return docs
}

function doc(id, f, type, period, dueDate, receivedDate, status) {
  return { id, fund: f.fund, manager: f.manager, cls: f.cls, type, period, dueDate, receivedDate, status }
}
function d(str) { return new Date(str) }
function offsetDate(base, days) {
  const r = new Date(base); r.setDate(r.getDate() + days); return r
}

// ── Constants ─────────────────────────────────────────────────────────────────
const DOC_TYPES = ['Quarterly Statement', 'K-1 Tax Form', 'Schedule K-3', 'Annual Audited Financials', 'Capital Account Statement']

const STATUS_META = {
  received: { color: 'var(--green)',  bg: 'rgba(34,197,94,0.12)',  label: 'Received',  dot: '#22c55e' },
  late:     { color: '#fb923c',       bg: 'rgba(251,146,60,0.12)', label: 'Received Late', dot: '#fb923c' },
  overdue:  { color: 'var(--red)',    bg: 'rgba(239,68,68,0.12)',  label: 'Overdue',   dot: '#ef4444' },
  pending:  { color: 'var(--amber)',  bg: 'rgba(245,158,11,0.12)', label: 'Pending',   dot: '#f59e0b' },
  expected: { color: 'var(--tx3)',    bg: 'rgba(255,255,255,0.04)', label: 'Expected', dot: 'var(--tx3)' },
}

const MONTHS = ['Apr 25','May 25','Jun 25','Jul 25','Aug 25','Sep 25','Oct 25','Nov 25','Dec 25','Jan 26','Feb 26','Mar 26']
const MONTH_RANGES = MONTHS.map((_, i) => {
  const yr = i < 9 ? 2025 : 2026
  const mo = i < 9 ? i + 4 : i - 9 + 1
  return { start: new Date(yr, mo - 1, 1), end: new Date(yr, mo, 0), label: MONTHS[i] }
})

function daysBetween(a, b) { return Math.round((b - a) / 86400000) }
function fmtDate(d) { return d ? d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' }) : '—' }

// ── Main component ─────────────────────────────────────────────────────────────
export default function DocCalendar({ activeClient }) {
  const name  = activeClient?.name ?? FALLBACK
  const funds = FUND_LISTS[name] ?? FUND_LISTS[FALLBACK]

  const allDocs = useMemo(() => genDocs(funds), [funds])

  const [statusFilter, setStatusFilter] = useState('all')
  const [typeFilter,   setTypeFilter]   = useState('all')
  const [search,       setSearch]       = useState('')
  const [sortCol,      setSortCol]      = useState('dueDate')
  const [sortDir,      setSortDir]      = useState('asc')

  const filtered = useMemo(() => allDocs.filter(d => {
    if (statusFilter !== 'all' && d.status !== statusFilter) return false
    if (typeFilter   !== 'all' && d.type   !== typeFilter)   return false
    if (search && !d.fund.toLowerCase().includes(search.toLowerCase()) &&
        !d.type.toLowerCase().includes(search.toLowerCase())) return false
    return true
  }).sort((a, b) => {
    const av = sortCol === 'dueDate' ? a.dueDate : sortCol === 'fund' ? a.fund : a.status
    const bv = sortCol === 'dueDate' ? b.dueDate : sortCol === 'fund' ? b.fund : b.status
    if (av < bv) return sortDir === 'asc' ? -1 : 1
    if (av > bv) return sortDir === 'asc' ?  1 : -1
    return 0
  }), [allDocs, statusFilter, typeFilter, search, sortCol, sortDir])

  // KPIs
  const total    = allDocs.length
  const received = allDocs.filter(d => d.status === 'received' || d.status === 'late').length
  const overdue  = allDocs.filter(d => d.status === 'overdue').length
  const pending  = allDocs.filter(d => d.status === 'pending').length
  const upcoming = allDocs.filter(d => d.status === 'expected' && daysBetween(TODAY, d.dueDate) <= 45).length

  // Heatmap: docType × month → aggregate status
  const heatmap = useMemo(() => {
    return DOC_TYPES.map(type => ({
      type,
      months: MONTH_RANGES.map(mr => {
        const inRange = allDocs.filter(d =>
          d.type === type &&
          d.dueDate >= mr.start && d.dueDate <= mr.end
        )
        if (inRange.length === 0) return null
        if (inRange.some(d => d.status === 'overdue')) return 'overdue'
        if (inRange.some(d => d.status === 'pending')) return 'pending'
        if (inRange.some(d => d.status === 'late'))    return 'late'
        if (inRange.every(d => d.status === 'received' || d.status === 'late')) return 'received'
        return 'expected'
      }),
    }))
  }, [allDocs])

  function toggleSort(col) {
    if (sortCol === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortCol(col); setSortDir('asc') }
  }

  // Gap summary by fund
  const gapByFund = funds.map(f => {
    const fundDocs = allDocs.filter(d => d.fund === f.fund)
    const missing  = fundDocs.filter(d => d.status === 'overdue' || d.status === 'pending')
    return { fund: f.fund, manager: f.manager, total: fundDocs.length, missing: missing.length, overdue: missing.filter(d => d.status === 'overdue').length }
  }).filter(f => f.missing > 0).sort((a, b) => b.overdue - a.overdue || b.missing - a.missing)

  return (
    <div style={{ padding: '24px 28px', animation: 'fadeUp 0.3s ease' }}>

      {/* KPI row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12, marginBottom: 22 }}>
        <KpiCard label="Total Documents"  value={total}    sub="Trailing 12 months"          color="var(--tx2)"   />
        <KpiCard label="Received"         value={received} sub={`${((received/total)*100).toFixed(0)}% of expected`} color="var(--green)" />
        <KpiCard label="Overdue"          value={overdue}  sub="Past due date, not received"  color="var(--red)"   alert={overdue > 0} />
        <KpiCard label="Pending"          value={pending}  sub="Within window, awaiting"      color="var(--amber)" />
        <KpiCard label="Due in 45 Days"   value={upcoming} sub="Upcoming expected docs"        color="var(--blue2)" />
      </div>

      {/* Heatmap */}
      <div style={{ background: 'var(--bg2)', border: '1px solid var(--bdr)', borderRadius: 14, padding: '18px 20px', marginBottom: 22 }}>
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 12, fontWeight: 600 }}>Annual Reporting Calendar</div>
          <div style={{ fontSize: 10, color: 'var(--tx3)', marginTop: 2 }}>Document coverage heatmap · Apr 2025 – Mar 2026</div>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ borderCollapse: 'collapse', minWidth: 700, width: '100%' }}>
            <thead>
              <tr>
                <th style={{ fontSize: 9, color: 'var(--tx3)', fontWeight: 600, padding: '0 12px 8px 0', textAlign: 'left', width: 200 }}>DOCUMENT TYPE</th>
                {MONTHS.map(m => (
                  <th key={m} style={{ fontSize: 9, color: 'var(--tx3)', fontWeight: 600, padding: '0 2px 8px', textAlign: 'center', minWidth: 52 }}>
                    {m}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {heatmap.map(row => (
                <tr key={row.type}>
                  <td style={{ fontSize: 10, color: 'var(--tx2)', padding: '4px 12px 4px 0', whiteSpace: 'nowrap' }}>{row.type}</td>
                  {row.months.map((status, i) => (
                    <td key={i} style={{ padding: '3px 2px', textAlign: 'center' }}>
                      {status ? (
                        <div style={{
                          height: 26, borderRadius: 5,
                          background: STATUS_META[status]?.bg ?? 'transparent',
                          border: `1px solid ${STATUS_META[status]?.dot ?? 'transparent'}30`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                          <span style={{ width: 6, height: 6, borderRadius: '50%', background: STATUS_META[status]?.dot, display: 'inline-block' }} />
                        </div>
                      ) : (
                        <div style={{ height: 26, borderRadius: 5, background: 'rgba(255,255,255,0.02)', border: '1px solid transparent' }} />
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Legend */}
        <div style={{ display: 'flex', gap: 16, marginTop: 12, flexWrap: 'wrap' }}>
          {Object.entries(STATUS_META).map(([k, v]) => (
            <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 10, color: 'var(--tx3)' }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: v.dot, display: 'inline-block' }} />
              {v.label}
            </div>
          ))}
        </div>
      </div>

      {/* Document list + gap report */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 18, alignItems: 'start' }}>

        {/* ── Document list ── */}
        <div style={{ background: 'var(--bg2)', border: '1px solid var(--bdr)', borderRadius: 14, overflow: 'hidden' }}>
          {/* Filter bar */}
          <div style={{
            padding: '12px 16px', borderBottom: '1px solid var(--bdr)',
            display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap',
          }}>
            {/* Status filters */}
            {[['all','All'], ['overdue','Overdue'], ['pending','Pending'], ['received','Received'], ['expected','Expected']].map(([v, l]) => (
              <FilterBtn
                key={v} label={l} active={statusFilter === v}
                color={v !== 'all' ? STATUS_META[v]?.color : undefined}
                onClick={() => setStatusFilter(v)}
                badge={v === 'overdue' ? overdue : v === 'pending' ? pending : undefined}
              />
            ))}
            <div style={{ marginLeft: 'auto' }}>
              <select
                value={typeFilter}
                onChange={e => setTypeFilter(e.target.value)}
                style={{
                  background: 'var(--bg3)', border: '1px solid var(--bdr2)',
                  borderRadius: 7, padding: '4px 8px', fontSize: 10, color: 'var(--tx2)',
                  cursor: 'pointer',
                }}
              >
                <option value="all">All Types</option>
                {DOC_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search fund…"
              style={{
                background: 'var(--bg3)', border: '1px solid var(--bdr2)',
                borderRadius: 7, padding: '4px 10px', fontSize: 10, color: 'var(--tx)',
                width: 130, outline: 'none',
              }}
              onFocus={e => e.target.style.borderColor = 'var(--blue)'}
              onBlur={e => e.target.style.borderColor = 'var(--bdr2)'}
            />
          </div>

          {/* Table */}
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--bdr)' }}>
                  {[
                    { col: 'fund',      label: 'Fund',           align: 'left' },
                    { col: 'type',      label: 'Document',       align: 'left' },
                    { col: 'period',    label: 'Period',         align: 'center' },
                    { col: 'dueDate',   label: 'Due Date',       align: 'center' },
                    { col: 'received',  label: 'Received',       align: 'center' },
                    { col: 'days',      label: 'Days',           align: 'right' },
                    { col: 'status',    label: 'Status',         align: 'right' },
                  ].map(({ col, label, align }) => (
                    <th
                      key={col}
                      onClick={() => toggleSort(col)}
                      style={{
                        padding: '8px 12px', textAlign: align,
                        fontSize: 9, color: sortCol === col ? 'var(--blue2)' : 'var(--tx3)',
                        fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px',
                        cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap',
                      }}
                    >{label}{sortCol === col ? (sortDir === 'asc' ? ' ↑' : ' ↓') : ''}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={7} style={{ padding: '28px', textAlign: 'center', color: 'var(--tx3)', fontSize: 11 }}>No documents match the current filters</td></tr>
                ) : filtered.map((d, i) => (
                  <DocRow key={d.id} doc={d} even={i % 2 === 0} />
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ padding: '8px 16px', borderTop: '1px solid var(--bdr)', fontSize: 10, color: 'var(--tx3)' }}>
            {filtered.length} of {allDocs.length} documents
          </div>
        </div>

        {/* ── Gap report + upcoming ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* Gap summary by fund */}
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--bdr)', borderRadius: 14, overflow: 'hidden' }}>
            <div style={{ padding: '14px 16px 10px', borderBottom: '1px solid var(--bdr)' }}>
              <div style={{ fontSize: 12, fontWeight: 600 }}>Gap Report</div>
              <div style={{ fontSize: 10, color: 'var(--tx3)', marginTop: 2 }}>Funds with missing documents</div>
            </div>
            {gapByFund.length === 0 ? (
              <div style={{ padding: '20px 16px', textAlign: 'center', fontSize: 11, color: 'var(--green)' }}>
                All documents received
              </div>
            ) : (
              <div>
                {gapByFund.map(f => (
                  <div key={f.fund} style={{ padding: '10px 16px', borderBottom: '1px solid var(--bdr)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                      <div>
                        <div style={{ fontSize: 11, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 170 }}>
                          {f.fund}
                        </div>
                        <div style={{ fontSize: 9, color: 'var(--tx3)' }}>{f.manager}</div>
                      </div>
                      <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                        {f.overdue > 0 && (
                          <span style={{ padding: '1px 6px', borderRadius: 4, fontSize: 9, fontWeight: 700, background: 'rgba(239,68,68,0.15)', color: 'var(--red)' }}>
                            {f.overdue} overdue
                          </span>
                        )}
                        {(f.missing - f.overdue) > 0 && (
                          <span style={{ padding: '1px 6px', borderRadius: 4, fontSize: 9, fontWeight: 600, background: 'rgba(245,158,11,0.12)', color: 'var(--amber)' }}>
                            {f.missing - f.overdue} pending
                          </span>
                        )}
                      </div>
                    </div>
                    <div style={{ height: 3, borderRadius: 2, background: 'var(--bg4)', overflow: 'hidden' }}>
                      <div style={{
                        height: '100%', borderRadius: 2,
                        width: `${((f.total - f.missing) / f.total) * 100}%`,
                        background: f.overdue > 0 ? 'var(--red)' : 'var(--amber)',
                      }} />
                    </div>
                    <div style={{ fontSize: 9, color: 'var(--tx3)', marginTop: 3 }}>
                      {f.total - f.missing}/{f.total} docs received
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Upcoming deadlines */}
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--bdr)', borderRadius: 14, overflow: 'hidden' }}>
            <div style={{ padding: '14px 16px 10px', borderBottom: '1px solid var(--bdr)' }}>
              <div style={{ fontSize: 12, fontWeight: 600 }}>Upcoming Deadlines</div>
              <div style={{ fontSize: 10, color: 'var(--tx3)', marginTop: 2 }}>Next 60 days</div>
            </div>
            <div>
              {allDocs
                .filter(d => (d.status === 'pending' || d.status === 'expected') && daysBetween(TODAY, d.dueDate) >= 0 && daysBetween(TODAY, d.dueDate) <= 60)
                .sort((a, b) => a.dueDate - b.dueDate)
                .slice(0, 8)
                .map(d => {
                  const days = daysBetween(TODAY, d.dueDate)
                  const u = STATUS_META[d.status]
                  return (
                    <div key={d.id} style={{ padding: '8px 16px', borderBottom: '1px solid var(--bdr)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 10, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {d.fund.length > 22 ? d.fund.slice(0, 22) + '…' : d.fund}
                        </div>
                        <div style={{ fontSize: 9, color: 'var(--tx3)', marginTop: 1 }}>{d.type}</div>
                      </div>
                      <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: 8 }}>
                        <div style={{ fontSize: 10, fontWeight: 600, color: days <= 14 ? 'var(--amber)' : 'var(--tx2)' }}>
                          {days === 0 ? 'Today' : `${days}d`}
                        </div>
                        <div style={{ fontSize: 9, color: 'var(--tx3)' }}>{fmtDate(d.dueDate)}</div>
                      </div>
                    </div>
                  )
                })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function KpiCard({ label, value, sub, color, alert }) {
  return (
    <div style={{
      background: 'var(--bg2)', border: `1px solid ${alert ? 'rgba(239,68,68,0.3)' : 'var(--bdr)'}`,
      borderRadius: 14, padding: '14px 16px',
      display: 'flex', flexDirection: 'column', gap: 6,
    }}>
      <span style={{ fontSize: 9, color: 'var(--tx3)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</span>
      <div style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-0.5px', color }}>{value}</div>
      <div style={{ fontSize: 10, color: 'var(--tx3)' }}>{sub}</div>
    </div>
  )
}

function FilterBtn({ label, active, onClick, color, badge }) {
  const [hov, setHov] = useState(false)
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        padding: '4px 10px', borderRadius: 6, fontSize: 10, fontWeight: 500,
        cursor: 'pointer', border: 'none', transition: 'all 0.15s', display: 'flex', alignItems: 'center', gap: 5,
        background: active ? (color ? color + '22' : 'rgba(59,130,246,0.18)') : hov ? 'var(--surf)' : 'var(--bg3)',
        color: active ? (color ?? 'var(--blue2)') : hov ? 'var(--tx)' : 'var(--tx2)',
        outline: active ? `1px solid ${color ?? 'var(--blue)'}40` : '1px solid transparent',
      }}
    >
      {label}
      {badge > 0 && (
        <span style={{ background: 'var(--red)', color: '#fff', fontSize: 8, fontWeight: 700, padding: '1px 4px', borderRadius: 4 }}>
          {badge}
        </span>
      )}
    </button>
  )
}

function DocRow({ doc: d, even }) {
  const sm   = STATUS_META[d.status]
  const days = d.receivedDate
    ? daysBetween(d.dueDate, d.receivedDate)
    : d.status === 'overdue' ? daysBetween(d.dueDate, TODAY)
    : null
  const daysLabel = days === null ? '—'
    : days === 0 ? 'On time'
    : days > 0 ? `+${days}d`
    : `${Math.abs(days)}d early`
  const daysColor = days === null ? 'var(--tx3)' : days > 0 ? 'var(--red)' : 'var(--green)'

  return (
    <tr style={{ borderBottom: '1px solid var(--bdr)', background: even ? 'transparent' : 'rgba(255,255,255,0.015)' }}>
      <td style={{ padding: '8px 12px' }}>
        <div style={{ fontSize: 11, fontWeight: 500 }}>{d.fund}</div>
        <div style={{ fontSize: 9, color: 'var(--tx3)' }}>{d.manager}</div>
      </td>
      <td style={{ padding: '8px 12px' }}>
        <div style={{ fontSize: 10, color: 'var(--tx2)' }}>{d.type}</div>
      </td>
      <td style={{ padding: '8px 12px', textAlign: 'center', fontSize: 10, color: 'var(--tx3)' }}>{d.period}</td>
      <td style={{ padding: '8px 12px', textAlign: 'center', fontSize: 10, color: 'var(--tx2)' }}>{fmtDate(d.dueDate)}</td>
      <td style={{ padding: '8px 12px', textAlign: 'center', fontSize: 10, color: d.receivedDate ? 'var(--green)' : 'var(--tx3)' }}>
        {fmtDate(d.receivedDate)}
      </td>
      <td style={{ padding: '8px 12px', textAlign: 'right', fontSize: 10, color: daysColor }}>
        {d.status === 'overdue' ? `+${daysBetween(d.dueDate, TODAY)}d` : daysLabel}
      </td>
      <td style={{ padding: '8px 12px', textAlign: 'right' }}>
        <span style={{
          padding: '2px 8px', borderRadius: 5, fontSize: 9, fontWeight: 700,
          background: sm?.bg, color: sm?.color, whiteSpace: 'nowrap',
        }}>{sm?.label}</span>
      </td>
    </tr>
  )
}
