import React from 'react'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import { C } from './ClientPortal'

const fmt$ = v => `$${v.toLocaleString()}`
const fmtK = v => `$${(v / 1_000).toFixed(0)}K`

export default function ClientTax({ data, clientName }) {
  const tax = data.tax
  const totalIncome = tax.income.reduce((s, i) => s + i.amount, 0)
  const k1Received  = tax.k1s.filter(k => k.status === 'received').length
  const k1Pending   = tax.k1s.filter(k => k.status === 'pending').length

  return (
    <div>
      {/* ── Disclaimer ─────────────────────────────────────────────── */}
      <div style={{
        background: 'rgba(251,191,36,0.06)',
        border: `1px solid rgba(251,191,36,0.2)`,
        borderRadius: 14, padding: '14px 18px', marginBottom: 32,
        display: 'flex', alignItems: 'flex-start', gap: 12,
      }}>
        <svg viewBox="0 0 14 14" width={16} height={16} fill="none" stroke={C.amb} strokeWidth="1.5" style={{ flexShrink: 0, marginTop: 1 }}>
          <path d="M7 1L13 12H1L7 1z"/><path d="M7 5.5v3"/><circle cx="7" cy="10" r="0.6" fill={C.amb}/>
        </svg>
        <div style={{ fontSize: 12, color: C.tx2, lineHeight: 1.6 }}>
          <strong style={{ color: C.amb }}>Not financial or tax advice.</strong>
          {' '}These are rough estimates based on fund reports and K-1 data. Your actual tax liability
          depends on your personal situation, deductions, and state taxes. Please review with your CPA.
        </div>
      </div>

      {/* ── Hero ──────────────────────────────────────────────────────── */}
      <div style={{ marginBottom: 36 }}>
        <div style={{ fontSize: 13, color: C.tx2, marginBottom: 10, letterSpacing: '0.3px', textTransform: 'uppercase', fontWeight: 500 }}>
          {tax.year} Tax Estimate
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 20, flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontSize: 48, fontWeight: 800, letterSpacing: '-2px', color: C.tx, lineHeight: 1 }}>
              {fmt$(tax.totalEstimated)}
            </div>
            <div style={{ fontSize: 14, color: C.tx2, marginTop: 10 }}>
              Estimated federal tax · Effective rate{' '}
              <strong style={{ color: C.tx }}>{tax.effectiveRate}%</strong>
            </div>
          </div>
          <div style={{
            background: C.card, border: `1px solid ${C.bdr}`, borderRadius: 14, padding: '14px 18px', marginBottom: 4,
          }}>
            <div style={{ fontSize: 11, color: C.tx3, marginBottom: 6 }}>K-1 Status</div>
            <div style={{ display: 'flex', gap: 16 }}>
              <div>
                <div style={{ fontSize: 22, fontWeight: 700, color: C.grn }}>{k1Received}</div>
                <div style={{ fontSize: 10, color: C.tx3 }}>Received</div>
              </div>
              <div>
                <div style={{ fontSize: 22, fontWeight: 700, color: k1Pending > 0 ? C.amb : C.grn }}>{k1Pending}</div>
                <div style={{ fontSize: 10, color: C.tx3 }}>Pending</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Income breakdown + donut ───────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 20, marginBottom: 24 }}>

        {/* Income categories */}
        <div style={{ background: C.card, border: `1px solid ${C.bdr}`, borderRadius: 20, padding: 24 }}>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>Estimated Income by Category</div>
          <div style={{ fontSize: 12, color: C.tx2, marginBottom: 20 }}>
            Total: <strong style={{ color: C.tx }}>{fmt$(totalIncome)}</strong> · Based on K-1s and fund reports
          </div>
          {tax.income.map(inc => (
            <div key={inc.label} style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ width: 8, height: 8, borderRadius: 2, background: inc.color, display: 'inline-block', flexShrink: 0 }} />
                  <span style={{ fontSize: 13 }}>{inc.label}</span>
                </div>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  <span style={{ fontSize: 11, color: C.tx3 }}>
                    {((inc.amount / totalIncome) * 100).toFixed(0)}%
                  </span>
                  <span style={{ fontSize: 14, fontWeight: 700, minWidth: 64, textAlign: 'right' }}>
                    {fmt$(inc.amount)}
                  </span>
                </div>
              </div>
              <div style={{ height: 5, borderRadius: 3, background: 'rgba(255,255,255,0.06)' }}>
                <div style={{
                  height: '100%', borderRadius: 3,
                  width: `${(inc.amount / totalIncome) * 100}%`,
                  background: inc.color, opacity: 0.8,
                }} />
              </div>
            </div>
          ))}

          {/* Tax rate assumptions */}
          <div style={{ marginTop: 20, padding: '14px 16px', background: C.card2, borderRadius: 12 }}>
            <div style={{ fontSize: 11, color: C.tx3, marginBottom: 8 }}>Rate Assumptions Used</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 16px' }}>
              {[
                ['Ordinary Income', '37%'],
                ['Long-Term Cap Gains', '20%'],
                ['Qualified Dividends', '20%'],
                ['Short-Term Cap Gains', '37%'],
                ['UBTI', '37%'],
                ['Net Investment Income', '3.8%'],
              ].map(([l, r]) => (
                <div key={l} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: C.tx3, padding: '2px 0' }}>
                  <span>{l}</span>
                  <span style={{ fontWeight: 600, color: C.tx2 }}>{r}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Donut */}
        <div style={{ background: C.card, border: `1px solid ${C.bdr}`, borderRadius: 20, padding: 24 }}>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>Income Mix</div>
          <div style={{ fontSize: 12, color: C.tx2, marginBottom: 16 }}>What type of income</div>
          <div style={{ height: 180, position: 'relative' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={tax.income}
                  dataKey="amount"
                  nameKey="label"
                  cx="50%" cy="50%"
                  innerRadius={50}
                  outerRadius={76}
                  paddingAngle={2}
                  startAngle={90}
                  endAngle={-270}
                >
                  {tax.income.map((inc, i) => (
                    <Cell key={i} fill={inc.color} opacity={0.85} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ background: C.card2, border: `1px solid ${C.bdr2}`, borderRadius: 10, fontSize: 12 }}
                  formatter={v => [fmt$(v), '']}
                />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center', pointerEvents: 'none' }}>
              <div style={{ fontSize: 16, fontWeight: 700 }}>{fmt$(tax.totalEstimated)}</div>
              <div style={{ fontSize: 9, color: C.tx3 }}>est. tax</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── K-1 tracker ───────────────────────────────────────────────── */}
      <div style={{ background: C.card, border: `1px solid ${C.bdr}`, borderRadius: 20, padding: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600 }}>K-1 Tracker — {tax.year}</div>
            <div style={{ fontSize: 12, color: C.tx2, marginTop: 3 }}>
              Schedule K-1s must be received before filing your taxes
            </div>
          </div>
          <div style={{
            fontSize: 11, fontWeight: 700,
            color: k1Pending === 0 ? C.grn : C.amb,
            background: k1Pending === 0 ? 'rgba(74,222,128,0.1)' : 'rgba(251,191,36,0.1)',
            padding: '5px 12px', borderRadius: 8,
          }}>
            {k1Received}/{tax.k1s.length} received
          </div>
        </div>

        {/* Progress bar */}
        <div style={{ height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.06)', marginBottom: 20, overflow: 'hidden' }}>
          <div style={{
            height: '100%', borderRadius: 3,
            width: `${(k1Received / tax.k1s.length) * 100}%`,
            background: k1Pending === 0 ? C.grn : `linear-gradient(90deg, ${C.grn}, ${C.amb})`,
            transition: 'width 0.4s ease',
          }} />
        </div>

        <div style={{ display: 'grid', gap: 8 }}>
          {tax.k1s.map((k, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '12px 16px', borderRadius: 12,
              background: C.card2, border: `1px solid ${C.bdr}`,
            }}>
              <div style={{
                width: 28, height: 28, borderRadius: 8, flexShrink: 0,
                background: k.status === 'received' ? 'rgba(74,222,128,0.15)' : 'rgba(251,191,36,0.12)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {k.status === 'received' ? (
                  <svg viewBox="0 0 10 10" width={12} height={12} fill="none" stroke={C.grn} strokeWidth="2">
                    <path d="M2 5l2.5 2.5L8 3"/>
                  </svg>
                ) : (
                  <svg viewBox="0 0 10 10" width={12} height={12} fill="none" stroke={C.amb} strokeWidth="2">
                    <path d="M5 2.5V5.5"/><circle cx="5" cy="7.2" r="0.7" fill={C.amb}/>
                  </svg>
                )}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {k.fund}
                </div>
                <div style={{ fontSize: 11, color: C.tx3, marginTop: 2 }}>Schedule K-1</div>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <span style={{
                  fontSize: 11, fontWeight: 600,
                  color: k.status === 'received' ? C.grn : C.amb,
                  background: k.status === 'received' ? 'rgba(74,222,128,0.1)' : 'rgba(251,191,36,0.1)',
                  padding: '3px 9px', borderRadius: 6,
                }}>
                  {k.status === 'received' ? 'Received' : 'Pending'}
                </span>
                {k.date && (
                  <div style={{ fontSize: 10, color: C.tx3, marginTop: 4 }}>{k.date}</div>
                )}
              </div>
            </div>
          ))}
        </div>

        {k1Pending > 0 && (
          <div style={{ marginTop: 16, padding: '12px 16px', background: 'rgba(251,191,36,0.05)', border: `1px solid rgba(251,191,36,0.15)`, borderRadius: 10 }}>
            <div style={{ fontSize: 12, color: C.tx2, lineHeight: 1.6 }}>
              <strong style={{ color: C.amb }}>{k1Pending} K-1{k1Pending > 1 ? 's' : ''} still pending.</strong>
              {' '}You may need to file an extension (Form 4868) if these aren't received before
              April 15. Contact your advisor to follow up with the fund managers.
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
