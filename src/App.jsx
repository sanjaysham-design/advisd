import React, { useState, useEffect } from 'react'
import Sidebar from './components/Sidebar'
import NLQBar from './components/NLQBar'
import Dashboard from './components/Dashboard'
import CapitalCalls from './components/CapitalCalls'
import Reports from './components/Reports'
import Upload from './components/Upload'
import AdvisorHome from './components/AdvisorHome'
import Liquidity from './components/Liquidity'
import DriftMonitor from './components/DriftMonitor'
import FeeTracking from './components/FeeTracking'
import VintageBenchmark from './components/VintageBenchmark'
import MeetingPrep from './components/MeetingPrep'
import DocCalendar from './components/DocCalendar'
import Performance from './components/Performance'
import { fetchClients } from './lib/db'
import { clients as mockClients } from './data/mockData'
import { getTokenByClient } from './client/tokens'
import { useMobile } from './lib/useMobile'

const PAGE_TITLES = {
  home:      'Advisor Overview',
  dash:      'Portfolio Overview',
  perf:      'Performance',
  calls:     'Capital Calls',
  liquidity: 'Liquidity Management',
  drift:     'Drift & Allocation Monitor',
  fees:      'Fee Tracking',
  vintage:   'Vintage Year Benchmarking',
  meeting:   'Meeting Prep',
  doccal:    'Document & Reporting Calendar',
  reports:   'Report Builder',
  upload:    'Document Upload',
}

export default function App() {
  const [view, setView]           = useState('home')
  const [clients, setClients]     = useState(mockClients.map(name => ({ id: null, name })))
  const [clientIdx, setClientIdx] = useState(0)
  const [dbReady, setDbReady]     = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const isMobile = useMobile()

  useEffect(() => {
    fetchClients()
      .then(liveData => {
        if (liveData && liveData.length > 0) {
          // Merge: keep all 5 canonical clients; enrich with real Supabase ID when a name matches.
          // This prevents Supabase from collapsing the list to only the clients stored in the DB.
          setClients(prev =>
            prev.map(mc => {
              const live = liveData.find(c => c.name === mc.name)
              return live ? { ...mc, ...live } : mc
            })
          )
          setDbReady(true)
        }
      })
      .catch(() => {})
  }, [])

  const isHome = view === 'home'
  const activeClient = clients[clientIdx] || clients[0]

  function selectClient(idx) {
    setClientIdx(idx)
    setView('dash')
  }

  function goHome() {
    setView('home')
  }

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      {/* Mobile overlay behind sidebar */}
      {isMobile && sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{
            position: 'fixed', inset: 0, zIndex: 999,
            background: 'rgba(0,0,0,0.6)',
          }}
        />
      )}

      <Sidebar
        view={view}
        setView={setView}
        clients={clients}
        clientIdx={clientIdx}
        isHome={isHome}
        onSelectClient={selectClient}
        onGoHome={goHome}
        isMobile={isMobile}
        isOpen={!isMobile || sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Topbar */}
        <div style={{
          display: 'flex', alignItems: 'center',
          padding: isMobile ? '12px 14px' : '14px 24px',
          borderBottom: '1px solid var(--bdr)',
          background: 'var(--bg)', flexShrink: 0, gap: 10,
        }}>
          {isMobile && (
            <button
              onClick={() => setSidebarOpen(true)}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'var(--tx)', padding: '4px 6px', borderRadius: 6,
                display: 'flex', alignItems: 'center', flexShrink: 0,
              }}
            >
              <svg viewBox="0 0 18 14" width={18} height={14} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                <path d="M1 1h16M1 7h16M1 13h16"/>
              </svg>
            </button>
          )}
          <div style={{ flex: 1, minWidth: 0 }}>
            {/* Back breadcrumb when in client view */}
            {!isHome && !isMobile && (
              <div
                onClick={goHome}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 4,
                  fontSize: 10, color: 'var(--tx3)', cursor: 'pointer',
                  marginBottom: 3,
                }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--blue2)'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--tx3)'}
              >
                <svg viewBox="0 0 10 10" width={9} height={9} fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M7 2L3 5l4 3"/></svg>
                All Clients
              </div>
            )}
            <div style={{ fontSize: isMobile ? 15 : 18, fontWeight: 600, letterSpacing: '-0.5px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{PAGE_TITLES[view]}</div>
            <div style={{ fontSize: 10, color: 'var(--tx3)', marginTop: 1, display: 'flex', alignItems: 'center', gap: 5 }}>
              <span style={{
                width: 5, height: 5, borderRadius: '50%',
                background: dbReady ? 'var(--green)' : 'var(--amber)',
                display: 'inline-block', animation: 'pulse 2s infinite',
                flexShrink: 0,
              }} />
              {dbReady ? 'Live · Supabase connected' : 'Demo mode'}
              {!isHome && <> · {activeClient?.name}</>}
              {isHome && <> · 5 clients · $178.8M AUM</>}
            </div>
          </div>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 8, flexShrink: 0 }}>
            {!isHome && (() => {
              const token = getTokenByClient(activeClient?.name)
              if (!token) return null
              return (
                <Btn ghost onClick={() => window.open(`${window.location.origin}${window.location.pathname}?token=${token}`, '_blank')}>
                  <svg viewBox="0 0 14 14" width={11} height={11} fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="1" y="3" width="9" height="7" rx="1.2"/><path d="M10 5l3-2v8l-3-2"/></svg>
                  Client View
                </Btn>
              )
            })()}
            <Btn ghost iconOnly={isMobile}>
              <svg viewBox="0 0 12 12" width={11} height={11} fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M2 4h8M2 6h5M2 8h4"/></svg>
              {!isMobile && 'Export PDF'}
            </Btn>
            <Btn iconOnly={isMobile}>
              <svg viewBox="0 0 12 12" width={11} height={11} fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M6 1v7M3 5l3 3 3-3"/><path d="M1 10h10"/></svg>
              {!isMobile && 'Share Report'}
            </Btn>
          </div>
        </div>

        {view !== 'upload' && view !== 'home' && <NLQBar activeClient={activeClient} />}

        <div style={{ flex: 1, overflowY: 'auto' }}>
          {view === 'home'    && <AdvisorHome onSelectClient={selectClient} clients={clients} />}
          {view === 'dash'    && <Dashboard onGoToCalls={() => setView('calls')} activeClient={activeClient} />}
          {view === 'perf'      && <Performance activeClient={activeClient} />}
          {view === 'calls'     && <CapitalCalls activeClient={activeClient} />}
          {view === 'liquidity' && <Liquidity activeClient={activeClient} />}
          {view === 'drift'     && <DriftMonitor activeClient={activeClient} />}
          {view === 'fees'      && <FeeTracking activeClient={activeClient} />}
          {view === 'vintage'   && <VintageBenchmark activeClient={activeClient} />}
          {view === 'meeting'   && <MeetingPrep activeClient={activeClient} />}
          {view === 'doccal'    && <DocCalendar activeClient={activeClient} />}
          {view === 'reports' && <Reports />}
          {view === 'upload'  && <Upload clientId={activeClient?.id} clientName={activeClient?.name} />}
        </div>
      </div>
    </div>
  )
}

function Btn({ children, ghost, iconOnly, onClick }) {
  const [hov, setHov] = useState(false)
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: iconOnly ? 0 : 5,
        padding: iconOnly ? '6px 8px' : '6px 12px', borderRadius: 7,
        fontFamily: 'inherit', fontSize: 11, fontWeight: 500,
        cursor: 'pointer', transition: 'all 0.15s',
        background: ghost ? (hov ? 'var(--surf2)' : 'var(--surf)') : (hov ? '#2563eb' : 'var(--blue)'),
        color: ghost ? (hov ? 'var(--tx)' : 'var(--tx2)') : '#fff',
        border: ghost ? '1px solid var(--bdr)' : 'none',
      }}
    >{children}</button>
  )
}
