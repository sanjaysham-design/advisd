import React, { useState } from 'react'
import { useMobile } from '../lib/useMobile'
import { getClientByToken } from './tokens'
import { PORTAL_DATA } from './clientData'
import ClientOverview from './ClientOverview'
import ClientCashFlow from './ClientCashFlow'
import ClientPME from './ClientPME'
import ClientTax from './ClientTax'
import NLQBar from '../components/NLQBar'

// ── Design tokens (client portal — distinct from advisor terminal) ────────────
export const C = {
  bg:    '#07070e',
  card:  '#0d0d18',
  card2: '#12121e',
  surf:  '#181826',
  bdr:   'rgba(255,255,255,0.07)',
  bdr2:  'rgba(255,255,255,0.13)',
  tx:    '#ecedf6',
  tx2:   '#8484a0',
  tx3:   '#4a4a65',
  acc:   '#818cf8',   // indigo
  grn:   '#4ade80',
  red:   '#f87171',
  amb:   '#fbbf24',
}

const NAV_ITEMS = [
  { id: 'overview',  label: 'Overview',    icon: <HomeIcon /> },
  { id: 'cashflow',  label: 'Cash Flow',   icon: <FlowIcon /> },
  { id: 'pme',       label: 'Benchmark',   icon: <ChartIcon /> },
  { id: 'tax',       label: 'Tax Estimate', icon: <TaxIcon /> },
]

export default function ClientPortal({ token }) {
  const clientName = getClientByToken(token)
  const data = clientName ? PORTAL_DATA[clientName] : null
  const [view, setView] = useState('overview')
  const isMobile = useMobile()

  // ── Auth gate ──────────────────────────────────────────────────────────────
  if (!clientName || !data) {
    return (
      <div style={{
        minHeight: '100vh', background: C.bg,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        color: C.tx,
      }}>
        <div style={{
          background: C.card, border: `1px solid ${C.bdr2}`,
          borderRadius: 20, padding: '48px 56px', textAlign: 'center', maxWidth: 400,
        }}>
          <div style={{
            width: 56, height: 56, borderRadius: 14,
            background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 24px',
          }}>
            <svg viewBox="0 0 20 20" width={24} height={24} fill="none" stroke="white" strokeWidth="1.5">
              <circle cx="10" cy="10" r="7"/>
              <path d="M10 7v3l2 1.5"/>
            </svg>
          </div>
          <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.5px', marginBottom: 10 }}>
            Access Denied
          </div>
          <div style={{ fontSize: 14, color: C.tx2, lineHeight: 1.6 }}>
            This link is invalid or has expired. Please contact your advisor for a new access link.
          </div>
        </div>
      </div>
    )
  }

  const activeNav = NAV_ITEMS.find(n => n.id === view)

  return (
    <div style={{
      minHeight: '100vh', background: C.bg,
      fontFamily: 'system-ui, -apple-system, sans-serif',
      color: C.tx,
    }}>
      {/* ── Top nav bar ── */}
      <header style={{
        background: C.card, borderBottom: `1px solid ${C.bdr}`,
        position: 'sticky', top: 0, zIndex: 50,
      }}>
        <div style={{ maxWidth: 1080, margin: '0 auto', padding: isMobile ? '0 14px' : '0 28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, height: 60 }}>

            {/* Logo */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginRight: 8 }}>
              <div style={{
                width: 32, height: 32, borderRadius: 8,
                background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                <svg viewBox="0 0 14 14" width={16} height={16} fill="none">
                  <circle cx="7" cy="7" r="4" stroke="white" strokeWidth="1.5"/>
                  <path d="M7 4v3l2 1.5" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </div>
              <span style={{ fontSize: 15, fontWeight: 600, letterSpacing: '-0.3px' }}>Advisd</span>
            </div>

            <div style={{ width: 1, height: 20, background: C.bdr }} />

            {/* Client name */}
            <div style={{ fontSize: 13, color: C.tx2 }}>
              <span style={{ fontWeight: 500, color: C.tx }}>{clientName}</span>
              {!isMobile && <span style={{ marginLeft: 8, fontSize: 11 }}>· Client Portal</span>}
            </div>

            {/* Spacer */}
            <div style={{ flex: 1 }} />

            {/* Nav links — desktop only (mobile nav rendered below) */}
            {!isMobile && NAV_ITEMS.map(n => (
              <NavLink key={n.id} item={n} active={view === n.id} onClick={() => setView(n.id)} />
            ))}
          </div>

          {/* Mobile nav strip */}
          {isMobile && (
            <div style={{
              display: 'flex', gap: 6, paddingBottom: 10,
              overflowX: 'auto', WebkitOverflowScrolling: 'touch',
            }}>
              {NAV_ITEMS.map(n => (
                <NavLink key={n.id} item={n} active={view === n.id} onClick={() => setView(n.id)} />
              ))}
            </div>
          )}
        </div>
      </header>

      {/* ── NLQ search bar ── */}
      <div style={{ background: C.card, borderBottom: `1px solid ${C.bdr}` }}>
        <div style={{ maxWidth: 1080, margin: '0 auto' }}>
          <NLQBar activeClient={{ name: clientName, id: null }} />
        </div>
      </div>

      {/* ── Page content ── */}
      <main style={{ maxWidth: 1080, margin: '0 auto', padding: isMobile ? '20px 14px 80px' : '36px 28px 80px' }}>
        {view === 'overview' && <ClientOverview data={data} clientName={clientName} />}
        {view === 'cashflow' && <ClientCashFlow data={data} clientName={clientName} />}
        {view === 'pme'      && <ClientPME      data={data} clientName={clientName} />}
        {view === 'tax'      && <ClientTax      data={data} clientName={clientName} />}
      </main>

      {/* ── Read-only watermark ── */}
      <div style={{
        position: 'fixed', bottom: 16, right: 20,
        fontSize: 10, color: C.tx3,
        display: 'flex', alignItems: 'center', gap: 5,
      }}>
        <svg viewBox="0 0 10 10" width={8} height={8} fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M5 1.5V5.5"/><circle cx="5" cy="7.5" r="0.8" fill="currentColor"/>
          <circle cx="5" cy="5" r="4" />
        </svg>
        Read-only view · {data.advisor}
      </div>
    </div>
  )
}

// ── Nav link component ─────────────────────────────────────────────────────────
function NavLink({ item, active, onClick }) {
  const [hov, setHov] = useState(false)
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: 6,
        padding: '6px 12px', borderRadius: 8, border: 'none',
        fontFamily: 'inherit', fontSize: 12, fontWeight: active ? 600 : 400,
        cursor: 'pointer', transition: 'all 0.15s',
        color:      active ? C.acc      : hov ? C.tx  : C.tx2,
        background: active ? 'rgba(129,140,248,0.12)' : hov ? C.surf : 'transparent',
        outline:    active ? `1px solid rgba(129,140,248,0.25)` : '1px solid transparent',
      }}
    >
      <span style={{ width: 13, height: 13 }}>{item.icon}</span>
      {item.label}
    </button>
  )
}

// ── Icons ──────────────────────────────────────────────────────────────────────
function HomeIcon() {
  return <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" width="100%" height="100%"><path d="M1 7L7 2l6 5"/><path d="M3 6v6h3V9h2v3h3V6"/></svg>
}
function FlowIcon() {
  return <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" width="100%" height="100%"><rect x="1" y="3" width="12" height="10" rx="1.2"/><path d="M4 3V1M10 3V1M1 6h12"/><circle cx="4.5" cy="9.5" r="0.8" fill="currentColor"/><circle cx="7" cy="9.5" r="0.8" fill="currentColor"/></svg>
}
function ChartIcon() {
  return <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" width="100%" height="100%"><polyline points="1,11 4,6 7,8 10,4 13,2"/></svg>
}
function TaxIcon() {
  return <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" width="100%" height="100%"><path d="M3 1h8l2 3v9H3V1z"/><path d="M5 7h5M5 9.5h3"/></svg>
}
