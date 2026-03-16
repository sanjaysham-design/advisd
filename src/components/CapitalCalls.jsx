import React, { useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { capitalCalls, cashFlowForecast } from '../data/mockData'

function fmt(n) {
  if (n >= 1_000_000) return '$' + (n / 1_000_000).toFixed(2) + 'M'
  if (n >= 1_000) return '$' + (n / 1_000).toFixed(0) + 'K'
  return '$' + n
}

const TABS = ['All Calls', 'Past Calls', 'Commitments', 'Distributions']

export default function CapitalCalls() {
  const [tab, setTab] = useState('All Calls')

  return (
    <div className="fade-up" style={{ padding: '20px 24px' }}>
      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--bdr)', marginBottom: 16 }}>
        {TABS.map(t => (
          <div
            key={t}
            onClick={() => setTab(t)}
            style={{
              padding: '8px 14px', fontSize: 12,
              color: tab === t ? 'var(--tx)' : 'var(--tx3)',
              borderBottom: `2px solid ${tab === t ? 'var(--blue)' : 'transparent'}`,
              marginBottom: -1, cursor: 'pointer', transition: 'all 0.15s',
            }}
          >{t}</div>
        ))}
      </div>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: 20 }}>
        {[
          { label: 'Due — 90 Days', value: '$1.85M', sub: '3 outstanding calls', color: 'var(--amber)' },
          { label: 'Total Unfunded', value: '$8.2M', sub: 'Across 6 funds', color: null },
          { label: 'Called YTD', value: '$3.4M', sub: '41% of annual plan', color: 'var(--green)' },
        ].map(k => (
          <div key={k.label} style={{ background: 'var(--bg3)', border: '1px solid var(--bdr)', borderRadius: 12, padding: 16 }}>
            <div style={{ fontSize: 9, color: 'var(--tx3)', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 8 }}>{k.label}</div>
            <div style={{ fontSize: 24, fontWeight: 600, letterSpacing: '-1px', color: k.color || 'var(--tx)' }}>{k.value}</div>
            <div style={{ fontSize: 10, color: 'var(--tx3)', marginTop: 2 }}>{k.sub}</div>
          </div>
        ))}
      </div>

      {/* Calls table */}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 12 }}>
        <div style={{ fontSize: 13, fontWeight: 500 }}>Pending Capital Calls</div>
        <span style={{ marginLeft: 8, background: 'rgba(239,68,68,0.14)', color: 'var(--red)', fontSize: 9, fontWeight: 700, padding: '2px 7px', borderRadius: 8 }}>3 Pending</span>
      </div>

      <div style={{ background: 'var(--bg3)', border: '1px solid var(--bdr)', borderRadius: 12, overflow: 'hidden', marginBottom: 20 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              {['Fund', 'Manager', 'Call #', 'Amount', 'Due Date', 'Days', 'Status', 'Unfunded Remaining'].map(h => (
                <th key={h} style={{
                  padding: '8px 16px', fontSize: 9, color: 'var(--tx3)', textAlign: 'left',
                  textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 500,
                  borderBottom: '1px solid var(--bdr)', whiteSpace: 'nowrap',
                }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {capitalCalls.map(cc => <CallRow key={cc.id} cc={cc} />)}
          </tbody>
        </table>
      </div>

      {/* Cash Flow Forecast */}
      <div style={{ background: 'var(--bg3)', border: '1px solid var(--bdr)', borderRadius: 12, padding: 18, marginBottom: 20 }}>
        <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 2 }}>12-Month Cash Flow Forecast</div>
        <div style={{ fontSize: 10, color: 'var(--tx3)', marginBottom: 14 }}>Projected capital calls by month (in $000s)</div>
        <ResponsiveContainer width="100%" height={130}>
          <BarChart data={cashFlowForecast} margin={{ top: 0, right: 0, left: -28, bottom: 0 }}>
            <XAxis dataKey="month" tick={{ fontSize: 9, fill: '#4a4a62' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 9, fill: '#4a4a62' }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{ background: 'var(--bg3)', border: '1px solid var(--bdr2)', borderRadius: 8, fontSize: 11 }}
              formatter={v => [`$${v}K`, 'Capital Call']}
              labelStyle={{ color: 'var(--tx2)' }}
            />
            <Bar dataKey="amount" radius={[3, 3, 0, 0]}>
              {cashFlowForecast.map((entry, i) => (
                <Cell key={i} fill={entry.amount > 400 ? '#f59e0b' : entry.amount > 600 ? '#ef4444' : '#3b82f6'} opacity={0.8} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Unfunded commitments table */}
      <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 12 }}>All Fund Commitments</div>
      <div style={{ background: 'var(--bg3)', border: '1px solid var(--bdr)', borderRadius: 12, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              {['Fund', 'Total Commitment', 'Called to Date', 'Unfunded', '% Called', 'Est. Close'].map(h => (
                <th key={h} style={{
                  padding: '8px 16px', fontSize: 9, color: 'var(--tx3)', textAlign: 'left',
                  textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 500,
                  borderBottom: '1px solid var(--bdr)',
                }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[
              { fund: 'Blackstone BREIT', commit: 4490000, called: 1300000, close: '2028' },
              { fund: 'KKR North America XII', commit: 6000000, called: 4500000, close: '2030' },
              { fund: 'Vista Equity Partners VIII', commit: 3500000, called: 1560000, close: '2031' },
              { fund: 'Carlyle Global Credit III', commit: 2000000, called: 1200000, close: '2029' },
              { fund: 'Brookfield Real Assets V', commit: 2400000, called: 936000, close: '2030' },
              { fund: 'Apollo Global Fund X', commit: 2000000, called: 800000, close: '2031' },
            ].map(r => {
              const unfunded = r.commit - r.called
              const pctCalled = Math.round((r.called / r.commit) * 100)
              const [hov, setHov] = useState(false)
              return (
                <tr key={r.fund} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
                  style={{ background: hov ? 'rgba(255,255,255,0.02)' : 'transparent' }}>
                  <td style={{ padding: '11px 16px', fontSize: 12, fontWeight: 500, borderBottom: '1px solid rgba(255,255,255,0.04)' }}>{r.fund}</td>
                  <td style={{ padding: '11px 16px', fontSize: 12, borderBottom: '1px solid rgba(255,255,255,0.04)' }}>{fmt(r.commit)}</td>
                  <td style={{ padding: '11px 16px', fontSize: 12, borderBottom: '1px solid rgba(255,255,255,0.04)' }}>{fmt(r.called)}</td>
                  <td style={{ padding: '11px 16px', fontSize: 12, color: 'var(--amber)', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>{fmt(unfunded)}</td>
                  <td style={{ padding: '11px 16px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <div style={{ flex: 1, height: 3, background: 'var(--surf2)', borderRadius: 2 }}>
                        <div style={{ width: `${pctCalled}%`, height: 3, borderRadius: 2, background: pctCalled > 70 ? 'var(--green)' : 'var(--blue)' }} />
                      </div>
                      <span style={{ fontSize: 10, color: 'var(--tx3)', minWidth: 28 }}>{pctCalled}%</span>
                    </div>
                  </td>
                  <td style={{ padding: '11px 16px', fontSize: 12, color: 'var(--tx3)', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>{r.close}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function CallRow({ cc }) {
  const [hov, setHov] = useState(false)
  const urgColor = cc.urgency === 'urgent' ? 'var(--red)' : cc.urgency === 'upcoming' ? 'var(--amber)' : 'var(--tx3)'
  const urgBg = cc.urgency === 'urgent' ? 'rgba(239,68,68,0.14)' : cc.urgency === 'upcoming' ? 'rgba(245,158,11,0.14)' : 'var(--surf)'
  const statusLabel = cc.urgency === 'urgent' ? 'Urgent' : cc.urgency === 'upcoming' ? 'Upcoming' : 'Scheduled'
  const daysLabel = cc.urgency === 'urgent' ? `${cc.daysUntil} days ⚡` : `${cc.daysUntil} days`

  return (
    <tr onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ background: hov ? 'rgba(255,255,255,0.02)' : 'transparent' }}>
      <td style={{ padding: '11px 16px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
        <div style={{ fontWeight: 500, fontSize: 12 }}>{cc.fund}</div>
        <div style={{ fontSize: 9, color: 'var(--tx3)', marginTop: 1 }}>{cc.series}</div>
      </td>
      <td style={{ padding: '11px 16px', fontSize: 12, color: 'var(--tx2)', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>{cc.manager}</td>
      <td style={{ padding: '11px 16px', fontSize: 12, borderBottom: '1px solid rgba(255,255,255,0.04)' }}>{cc.callNum}</td>
      <td style={{ padding: '11px 16px', fontSize: 12, fontWeight: 500, color: urgColor, borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
        ${cc.amount.toLocaleString()}
      </td>
      <td style={{ padding: '11px 16px', fontSize: 12, borderBottom: '1px solid rgba(255,255,255,0.04)' }}>{cc.dueDate}</td>
      <td style={{ padding: '11px 16px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
        <span style={{ background: urgBg, color: urgColor, padding: '2px 8px', borderRadius: 5, fontSize: 10, fontWeight: 700 }}>{daysLabel}</span>
      </td>
      <td style={{ padding: '11px 16px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
        <span style={{ background: urgBg, color: urgColor, padding: '2px 8px', borderRadius: 5, fontSize: 10 }}>{statusLabel}</span>
      </td>
      <td style={{ padding: '11px 16px', fontSize: 12, color: 'var(--amber)', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
        ${cc.unfundedRemaining.toLocaleString()}
      </td>
    </tr>
  )
}
