import React from 'react'
import { clients } from '../data/mockData'

const NAV = [
  {
    section: 'Overview',
    items: [
      { label: 'Dashboard',   view: 'dash',    icon: 'grid' },
      { label: 'Performance', view: 'dash',    icon: 'trend' },
      { label: 'Timeline',    view: 'dash',    icon: 'clock' },
    ],
  },
  {
    section: 'Alternatives',
    items: [
      { label: 'Capital Calls', view: 'calls',   icon: 'calendar', badge: 3 },
      { label: 'Fund Metrics',  view: 'dash',    icon: 'star' },
      { label: 'Cash Flows',    view: 'dash',    icon: 'flow' },
    ],
  },
  {
    section: 'Analysis',
    items: [
      { label: 'Risk & Exposure', view: 'dash', icon: 'shield' },
      { label: 'Benchmarks',      view: 'dash', icon: 'bar' },
      { label: 'Scenarios',       view: 'dash', icon: 'branch' },
    ],
  },
  {
    section: 'Reports',
    items: [
      { label: 'Report Builder', view: 'reports', icon: 'doc' },
      { label: 'Scheduler',      view: 'dash',    icon: 'schedule' },
    ],
  },
]

const icons = {
  grid:     <svg viewBox="0 0 14 14" fill="currentColor"><rect x="1" y="1" width="5" height="5" rx="1.2"/><rect x="8" y="1" width="5" height="5" rx="1.2"/><rect x="1" y="8" width="5" height="5" rx="1.2"/><rect x="8" y="8" width="5" height="5" rx="1.2"/></svg>,
  trend:    <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5"><polyline points="1,11 4,6 7,8 10,4 13,2"/></svg>,
  clock:    <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="7" cy="7" r="5.5"/><path d="M7 4v3l2 1"/></svg>,
  calendar: <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="1" y="3" width="12" height="10" rx="1.2"/><path d="M4 3V1M10 3V1M1 6h12"/></svg>,
  star:     <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M7 1L9 5H13L10 8L11.5 13L7 10L2.5 13L4 8L1 5H5Z"/></svg>,
  flow:     <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M2 11L5 7 8 9 12 3"/><circle cx="12" cy="10" r="2"/></svg>,
  shield:   <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M7 1L12 3.5v4C12 10.5 9.5 13 7 13 4.5 13 2 10.5 2 7.5v-4L7 1z"/></svg>,
  bar:      <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M1 7h2.5l2-4 3 8 2-6 2 3h1.5"/></svg>,
  branch:   <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="3" cy="3" r="1.5"/><circle cx="3" cy="11" r="1.5"/><circle cx="11" cy="7" r="1.5"/><path d="M3 4.5V9.5M4.5 3H7.5C9 3 9.5 4 9.5 5V9C9.5 10 9 11 7.5 11H4.5"/></svg>,
  doc:      <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 1h6l4 3v9H3V1z"/><path d="M9 1v3h4"/><path d="M5 7h5M5 10h3"/></svg>,
  schedule: <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="7" cy="7" r="5.5"/><path d="M7 4v3l2 1.5"/></svg>,
}

export default function Sidebar({ view, setView, client, setClient }) {
  return (
    <aside style={{
      width: 220, minWidth: 220,
      background: 'var(--bg2)',
      borderRight: '1px solid var(--bdr)',
      display: 'flex', flexDirection: 'column',
      height: '100vh', overflow: 'hidden',
    }}>
      {/* Logo */}
      <div style={{ padding: '18px 16px 14px', borderBottom: '1px solid var(--bdr)', display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{
          width: 30, height: 30, borderRadius: 8,
          background: 'linear-gradient(135deg, var(--blue), var(--purple))',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <svg viewBox="0 0 14 14" width={16} height={16} fill="none">
            <circle cx="7" cy="7" r="4" stroke="white" strokeWidth="1.5"/>
            <path d="M7 3v4l2.5 1.5" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </div>
        <div>
          <div style={{ fontSize: 14, fontWeight: 600, letterSpacing: '-0.3px' }}>Advisd</div>
          <div style={{ fontSize: 9, color: 'var(--tx3)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Portfolio Intel</div>
        </div>
      </div>

      {/* Client Selector */}
      <div style={{ padding: '10px 12px', borderBottom: '1px solid var(--bdr)' }}>
        <div style={{ fontSize: 9, color: 'var(--tx3)', textTransform: 'uppercase', letterSpacing: '0.7px', marginBottom: 5 }}>Active Client</div>
        <select
          value={client}
          onChange={e => setClient(e.target.value)}
          style={{
            background: 'var(--surf)', border: '1px solid var(--bdr2)',
            borderRadius: 7, color: 'var(--tx)', fontSize: 12,
            padding: '7px 9px', width: '100%', cursor: 'pointer',
          }}
        >
          {clients.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* Nav */}
      <nav style={{ padding: '10px 6px', flex: 1, overflowY: 'auto' }}>
        {NAV.map(({ section, items }) => (
          <div key={section} style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 9, color: 'var(--tx3)', textTransform: 'uppercase', letterSpacing: '0.7px', padding: '0 8px', marginBottom: 3 }}>{section}</div>
            {items.map(item => (
              <NavItem
                key={item.label}
                item={item}
                active={view === item.view && item.view !== 'dash' || (view === 'dash' && item.view === 'dash' && item.label === 'Dashboard')}
                onClick={() => setView(item.view)}
              />
            ))}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div style={{ padding: '10px 12px', borderTop: '1px solid var(--bdr)', display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{
          width: 28, height: 28, borderRadius: '50%',
          background: 'linear-gradient(135deg, var(--blue), var(--purple))',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 10, fontWeight: 700, flexShrink: 0,
        }}>JW</div>
        <div>
          <div style={{ fontSize: 11, fontWeight: 500 }}>James Whitmore</div>
          <div style={{ fontSize: 9, color: 'var(--tx3)' }}>Senior Advisor</div>
        </div>
      </div>
    </aside>
  )
}

function NavItem({ item, active, onClick }) {
  const [hov, setHov] = React.useState(false)
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '7px 8px', borderRadius: 7, cursor: 'pointer',
        fontSize: 12,
        color: active ? 'var(--blue2)' : hov ? 'var(--tx)' : 'var(--tx2)',
        background: active ? 'rgba(59,130,246,0.15)' : hov ? 'var(--surf)' : 'transparent',
        transition: 'all 0.15s', marginBottom: 1,
        position: 'relative',
      }}
    >
      <span style={{ width: 13, height: 13, flexShrink: 0, opacity: active ? 1 : 0.7 }}>
        {icons[item.icon]}
      </span>
      {item.label}
      {item.badge && (
        <span style={{
          marginLeft: 'auto', background: 'var(--red)', color: '#fff',
          fontSize: 9, fontWeight: 700, padding: '1px 5px', borderRadius: 8,
        }}>{item.badge}</span>
      )}
    </div>
  )
}
