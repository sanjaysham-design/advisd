import React, { useState, useEffect } from 'react'
import Sidebar from './components/Sidebar'
import NLQBar from './components/NLQBar'
import Dashboard from './components/Dashboard'
import CapitalCalls from './components/CapitalCalls'
import Reports from './components/Reports'
import Upload from './components/Upload'
import { fetchClients } from './lib/db'
import { clients as mockClients } from './data/mockData'

const PAGE_TITLES = {
  dash:    'Portfolio Overview',
  calls:   'Capital Calls',
  reports: 'Report Builder',
  upload:  'Document Upload',
}

export default function App() {
  const [view, setView]           = useState('dash')
  const [clients, setClients]     = useState(mockClients.map(name => ({ id: null, name })))
  const [clientIdx, setClientIdx] = useState(0)
  const [dbReady, setDbReady]     = useState(false)

  useEffect(() => {
    fetchClients()
      .then(data => {
        if (data && data.length > 0) {
          setClients(data)
          setDbReady(true)
        }
      })
      .catch(() => {})
  }, [])

  const activeClient = clients[clientIdx] || clients[0]

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <Sidebar
        view={view}
        setView={setView}
        clients={clients}
        clientIdx={clientIdx}
        setClientIdx={setClientIdx}
      />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{
          display: 'flex', alignItems: 'center',
          padding: '14px 24px', borderBottom: '1px solid var(--bdr)',
          background: 'var(--bg)', flexShrink: 0,
        }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 600, letterSpacing: '-0.5px' }}>{PAGE_TITLES[view]}</div>
            <div style={{ fontSize: 10, color: 'var(--tx3)', marginTop: 1, display: 'flex', alignItems: 'center', gap: 5 }}>
              <span style={{
                width: 5, height: 5, borderRadius: '50%',
                background: dbReady ? 'var(--green)' : 'var(--amber)',
                display: 'inline-block', animation: 'pulse 2s infinite',
              }} />
              {dbReady ? 'Live · Supabase connected' : 'Demo mode'} · {activeClient?.name}
            </div>
          </div>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
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

        {view !== 'upload' && <NLQBar />}

        <div style={{ flex: 1, overflowY: 'auto' }}>
          {view === 'dash'    && <Dashboard onGoToCalls={() => setView('calls')} activeClient={activeClient} />}
          {view === 'calls'   && <CapitalCalls activeClient={activeClient} />}
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
