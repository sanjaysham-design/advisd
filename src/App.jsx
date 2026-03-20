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
      <Sidebar
        view={view}
        setView={setView}
        clients={clients}
        clientIdx={clientIdx}
        isHome={isHome}
        onSelectClient={selectClient}
        onGoHome={goHome}
      />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Topbar */}
        <div style={{
          display: 'flex', alignItems: 'center',
          padding: '14px 24px', borderBottom: '1px solid var(--bdr)',
          background: 'var(--bg)', flexShrink: 0,
        }}>
          <div>
            {/* Back breadcrumb when in client view */}
            {!isHome && (
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
            <div style={{ fontSize: 18, fontWeight: 600, letterSpacing: '-0.5px' }}>{PAGE_TITLES[view]}</div>
            <div style={{ fontSize: 10, color: 'var(--tx3)', marginTop: 1, display: 'flex', alignItems: 'center', gap: 5 }}>
              <span style={{
                width: 5, height: 5, borderRadius: '50%',
                background: dbReady ? 'var(--green)' : 'var(--amber)',
                display: 'inline-block', animation: 'pulse 2s infinite',
              }} />
              {dbReady ? 'Live · Supabase connected' : 'Demo mode'}
              {!isHome && <> · {activeClient?.name}</>}
              {isHome && <> · 5 clients · $178.8M AUM</>}
            </div>
          </div>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
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
            <Btn ghost>
              <svg viewBox="0 0 12 12" width={11} height={11} fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M2 4h8M2 6h5M2 8h4"/></svg>
              Export PDF
            </Btn>
            <Btn>
              <svg viewBox="0 0 12 12" width={11} height={11} fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M6 1v7M3 5l3 3 3-3"/><path d="M1 10h10"/></svg>
              Share Report
            </Btn>
          </div>
        </div>

        {view !== 'upload' && view !== 'home' && <NLQBar />}

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

function Btn({ children, ghost, onClick }) {
  const [hov, setHov] = useState(false)
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 5,
        padding: '6px 12px', borderRadius: 7,
        fontFamily: 'inherit', fontSize: 11, fontWeight: 500,
        cursor: 'pointer', transition: 'all 0.15s',
        background: ghost ? (hov ? 'var(--surf2)' : 'var(--surf)') : (hov ? '#2563eb' : 'var(--blue)'),
        color: ghost ? (hov ? 'var(--tx)' : 'var(--tx2)') : '#fff',
        border: ghost ? '1px solid var(--bdr)' : 'none',
      }}
    >{children}</button>
  )
}
