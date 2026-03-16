import { useState, useEffect } from 'react'
import { fetchCapitalCalls, fetchHoldings } from './db'
import { capitalCalls as mockCalls, holdings as mockHoldings, cashFlowForecast } from '../data/mockData'

// Chen Family Office is the only client with real data right now
const LIVE_CLIENT_ID = '1398265e-1397-4fe6-9af8-d9721ce9a2fb'

export function useClientData(clientId) {
  const isLive = clientId === LIVE_CLIENT_ID

  const [capitalCalls, setCapitalCalls] = useState([])
  const [holdings, setHoldings]         = useState([])
  const [loading, setLoading]           = useState(false)
  const [error, setError]               = useState(null)

  useEffect(() => {
    if (!isLive) {
      // Use mock data for all non-Chen clients
      setCapitalCalls(mockCalls)
      setHoldings(mockHoldings)
      setLoading(false)
      return
    }

    // Fetch real data for Chen
    setLoading(true)
    setError(null)

    Promise.all([
      fetchCapitalCalls(clientId),
      fetchHoldings(clientId),
    ])
      .then(([calls, holds]) => {
        setCapitalCalls(calls?.length ? normalizeCapitalCalls(calls) : mockCalls)
        setHoldings(holds?.length ? normalizeHoldings(holds) : mockHoldings)
      })
      .catch(e => {
        console.error('Failed to fetch client data:', e)
        setError(e.message)
        // Fall back to mock data on error
        setCapitalCalls(mockCalls)
        setHoldings(mockHoldings)
      })
      .finally(() => setLoading(false))
  }, [clientId])

  return { capitalCalls, holdings, cashFlowForecast, loading, error, isLive }
}

// ── Normalizers — shape DB rows to match what the UI expects ──────────────

function normalizeCapitalCalls(rows) {
  return rows.map(r => {
    const due = r.due_date ? new Date(r.due_date) : null
    const today = new Date()
    const daysUntil = due ? Math.ceil((due - today) / (1000 * 60 * 60 * 24)) : null
    const urgency = daysUntil === null ? 'future'
      : daysUntil <= 14  ? 'urgent'
      : daysUntil <= 45  ? 'upcoming'
      : 'future'

    return {
      id:                 r.id,
      fund:               r.fund_name || 'Unknown Fund',
      manager:            r.manager || '—',
      series:             r.call_number || '—',
      callNum:            r.call_number || '—',
      amount:             r.amount || 0,
      dueDate:            due ? due.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—',
      daysUntil:          daysUntil ?? 999,
      urgency,
      unfundedRemaining:  r.unfunded_remaining || 0,
      source:             'live',
    }
  })
}

function normalizeHoldings(rows) {
  return rows.map(r => ({
    id:         r.id,
    name:       r.fund_name || 'Unknown',
    manager:    r.manager || '—',
    cls:        r.asset_class || 'Alternative',
    clsKey:     assetClassKey(r.asset_class),
    value:      r.market_value || 0,
    returnPct:  r.irr ? `+${r.irr}% IRR` : '—',
    tvpi:       r.tvpi ? `${r.tvpi}x` : '—',
    dpi:        r.dpi ? `${r.dpi}x` : '—',
    unfunded:   r.unfunded || null,
    weight:     0, // calculated below
    source:     'live',
  })).map((h, _, arr) => {
    const total = arr.reduce((s, x) => s + x.value, 0)
    return { ...h, weight: total > 0 ? +((h.value / total) * 100).toFixed(1) : 0 }
  })
}

function assetClassKey(cls) {
  if (!cls) return 'eq'
  const c = cls.toLowerCase()
  if (c.includes('private equity') || c.includes('pe')) return 'pe'
  if (c.includes('real estate') || c.includes('real asset')) return 're'
  if (c.includes('hedge')) return 'hf'
  if (c.includes('fixed') || c.includes('credit') || c.includes('bond')) return 'fi'
  return 'eq'
}
