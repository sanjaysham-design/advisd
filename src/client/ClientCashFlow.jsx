import React, { useState } from 'react'
import {
  ComposedChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine, Cell,
} from 'recharts'
import { C } from './ClientPortal'

const fmt$M = v => `$${(Math.abs(v) / 1_000_000).toFixed(2)}M`
const fmt$K = v => `$${(Math.abs(v) / 1_000).toFixed(0)}K`
const fmtAmt = v => Math.abs(v) >= 1_000_000 ? fmt$M(v) : fmt$K(v)

function daysUntil(dateStr) {
  const due = new Date(dateStr)
  const now = new Date('2026-03-19')
  return Math.ceil((due - now) / (1000 * 60 * 60 * 24))
}

export default function ClientCashFlow({ data, clientName }) {
  const totalUpcoming = data.upcomingCalls.reduce((s, c) => s + c.amount, 0)
  const totalDistribs = data.recentDistributions.reduce((s, d) => s + d.amount, 0)
  const nextCall      = data.upcomingCalls[0]

  // Chart data — combine calls (negative) and distributions (positive)
  const chartData = data.cashCalendar.map(row => ({
    m:       row.m,
    calls:   row.calls / 1_000_000,
    distrib: row.distrib / 1_000_000,
    net:    (row.calls + row.distrib) / 1_000_000,
  }))

  const isFuture = (m) => {
    const futureMonths = ['Apr 26', 'May 26', 'Jun 26']
    return futureMonths.includes(m)
  }

  return (
    <div>
      {/* ── Hero summary ─────────────────────────────────────────────── */}
      <div style={{ marginBottom: 36 }}>
        <div style={{ fontSize: 13, color: C.tx2, marginBottom: 10, letterSpacing: '0.3px', textTransform: 'uppercase', fontWeight: 500 }}>
          Cash Flow Summary
        </div>

        {data.upcomingCalls.length > 0 ? (
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 20, flexWrap: 'wrap', marginBottom: 16 }}>
            <div>
              <div style={{ fontSize: 42, fontWeight: 800, letterSpacing: '-1.5px', color: C.tx, lineHeight: 1 }}>
                {fmtAmt(totalUpcoming)}
              </div>
              <div style={{ fontSize: 14, color: C.tx2, marginTop: 8 }}>
                due across <strong style={{ color: C.tx }}>{data.upcomingCalls.length} capital call{data.upcomingCalls.length > 1 ? 's' : ''}</strong> in the next 90 days
              </div>
            </div>
            {nextCall && (
              <div style={{
                background: 'rgba(251,191,36,0.1)',
                border: `1px solid rgba(251,191,36,0.25)`,
                borderRadius: 14, padding: '12px 18px',
                marginBottom: 4,
              }}>
                <div style={{ fontSize: 11, color: C.amb, fontWeight: 600, marginBottom: 4 }}>
                  Next call
                </div>
                <div style={{ fontSize: 16, fontWeight: 700, color: C.tx }}>{fmtAmt(nextCall.amount)}</div>
                <div style={{ fontSize: 11, color: C.tx2, marginTop: 3 }}>{nextCall.fund}</div>
                <div style={{ fontSize: 11, color: C.amb, marginTop: 3 }}>
                  {daysUntil(nextCall.due)} days · {new Date(nextCall.due).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div style={{ fontSize: 28, fontWeight: 700, color: C.grn, marginBottom: 12 }}>
            No capital calls due in the next 90 days
          </div>
        )}
      </div>

      {/* ── Cash flow calendar chart ──────────────────────────────────── */}
      <div style={{ background: C.card, border: `1px solid ${C.bdr}`, borderRadius: 20, padding: '24px 24px 18px', marginBottom: 24 }}>
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 14, fontWeight: 600 }}>Cash Flow Calendar</div>
          <div style={{ fontSize: 12, color: C.tx2, marginTop: 4 }}>
            Capital calls (outflows) and distributions (inflows) by month · Shaded = upcoming
          </div>
        </div>
        <div style={{ height: 200 }}>
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} margin={{ top: 4, right: 4, left: 8, bottom: 4 }} barGap={2} barCategoryGap={12}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
              <XAxis dataKey="m" tick={{ fill: C.tx3, fontSize: 10 }} tickLine={false} axisLine={false} />
              <YAxis
                tickFormatter={v => v === 0 ? '$0' : `${v > 0 ? '+' : ''}$${Math.abs(v).toFixed(1)}M`}
                tick={{ fill: C.tx3, fontSize: 9 }} tickLine={false} axisLine={false}
              />
              <ReferenceLine y={0} stroke="rgba(255,255,255,0.1)" />
              <Tooltip
                contentStyle={{ background: C.card2, border: `1px solid ${C.bdr2}`, borderRadius: 10, fontSize: 12, color: C.tx }}
                labelStyle={{ color: C.tx2 }}
                formatter={(v, n) => [
                  `$${Math.abs(v).toFixed(2)}M`,
                  n === 'calls' ? 'Capital Call (outflow)' : 'Distribution (inflow)',
                ]}
              />
              <Bar dataKey="calls" radius={[0, 0, 4, 4]} barSize={18}>
                {chartData.map((d, i) => (
                  <Cell
                    key={i}
                    fill={d.calls !== 0 ? (isFuture(d.m) ? 'rgba(248,113,113,0.35)' : 'rgba(248,113,113,0.65)') : 'transparent'}
                  />
                ))}
              </Bar>
              <Bar dataKey="distrib" radius={[4, 4, 0, 0]} barSize={18}>
                {chartData.map((d, i) => (
                  <Cell
                    key={i}
                    fill={d.distrib !== 0 ? (isFuture(d.m) ? 'rgba(74,222,128,0.25)' : 'rgba(74,222,128,0.6)') : 'transparent'}
                  />
                ))}
              </Bar>
            </ComposedChart>
          </ResponsiveContainer>
        </div>
        <div style={{ display: 'flex', gap: 20, justifyContent: 'center', marginTop: 8 }}>
          {[
            ['rgba(248,113,113,0.7)', 'Capital call (outflow)'],
            ['rgba(74,222,128,0.65)', 'Distribution (inflow)'],
            ['rgba(255,255,255,0.15)', 'Projected'],
          ].map(([c, l]) => (
            <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: C.tx2 }}>
              <span style={{ width: 10, height: 10, borderRadius: 2, background: c, display: 'inline-block' }} />
              {l}
            </div>
          ))}
        </div>
      </div>

      {/* ── Side-by-side: upcoming calls + recent distributions ──────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>

        {/* Upcoming capital calls */}
        <div style={{ background: C.card, border: `1px solid ${C.bdr}`, borderRadius: 20, padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600 }}>Upcoming Capital Calls</div>
              <div style={{ fontSize: 12, color: C.tx2, marginTop: 3 }}>What you'll need to send to your funds</div>
            </div>
            <div style={{
              fontSize: 11, fontWeight: 700,
              color: C.amb, background: 'rgba(251,191,36,0.12)',
              padding: '4px 10px', borderRadius: 8,
            }}>
              {fmtAmt(totalUpcoming)} total
            </div>
          </div>
          {data.upcomingCalls.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '24px 0', color: C.tx3, fontSize: 13 }}>
              No upcoming calls in the next 90 days
            </div>
          ) : (
            data.upcomingCalls.map((call, i) => {
              const days = daysUntil(call.due)
              const urgency = days <= 14 ? C.red : days <= 30 ? C.amb : C.grn
              return (
                <div key={i} style={{
                  padding: '14px 0',
                  borderTop: i === 0 ? `1px solid ${C.bdr}` : undefined,
                  borderBottom: `1px solid ${C.bdr}`,
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 500 }}>{call.fund}</div>
                      <div style={{ fontSize: 11, color: C.tx3, marginTop: 3 }}>{call.type}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 15, fontWeight: 700 }}>{fmtAmt(call.amount)}</div>
                      <div style={{ fontSize: 10, color: urgency, marginTop: 3, fontWeight: 600 }}>
                        {days <= 0 ? 'Overdue' : `${days} days`}
                      </div>
                    </div>
                  </div>
                  <div style={{ marginTop: 8 }}>
                    <UrgencyBar days={days} />
                    <div style={{ fontSize: 10, color: C.tx3, marginTop: 4 }}>
                      Due {new Date(call.due).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* Recent distributions */}
        <div style={{ background: C.card, border: `1px solid ${C.bdr}`, borderRadius: 20, padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600 }}>Recent Distributions</div>
              <div style={{ fontSize: 12, color: C.tx2, marginTop: 3 }}>Funds paid out to you in the last 6 months</div>
            </div>
            <div style={{
              fontSize: 11, fontWeight: 700,
              color: C.grn, background: 'rgba(74,222,128,0.12)',
              padding: '4px 10px', borderRadius: 8,
            }}>
              {fmtAmt(totalDistribs)} received
            </div>
          </div>
          {data.recentDistributions.map((d, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '12px 0',
              borderTop: i === 0 ? `1px solid ${C.bdr}` : undefined,
              borderBottom: `1px solid ${C.bdr}`,
            }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 500 }}>{d.fund}</div>
                <div style={{ fontSize: 11, color: C.tx3, marginTop: 2 }}>
                  {new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: C.grn }}>+{fmtAmt(d.amount)}</div>
                <div style={{ fontSize: 10, color: C.tx3, marginTop: 2 }}>{d.type}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Urgency countdown bar ──────────────────────────────────────────────────────
function UrgencyBar({ days }) {
  const total = 90
  const pct   = Math.max(0, Math.min(100, (1 - days / total) * 100))
  const color = days <= 14 ? C.red : days <= 30 ? C.amb : '#818cf8'
  return (
    <div style={{ height: 3, borderRadius: 2, background: 'rgba(255,255,255,0.07)', overflow: 'hidden' }}>
      <div style={{ width: `${pct}%`, height: '100%', borderRadius: 2, background: color, transition: 'width 0.3s' }} />
    </div>
  )
}
