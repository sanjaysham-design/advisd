import React, { useState, useRef, useEffect } from 'react'

const CLIENT_NAV = [
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
      { label: 'Capital Calls',       view: 'calls',     icon: 'calendar', badge: 3 },
      { label: 'Liquidity Management', view: 'liquidity', icon: 'drop' },
      { label: 'Fund Metrics',         view: 'dash',      icon: 'star' },
      { label: 'Cash Flows',           view: 'dash',      icon: 'flow' },
    ],
  },
  {
    section: 'Analysis',
    items: [
      { label: 'Drift Monitor',   view: 'drift', icon: 'target' },
      { label: 'Risk & Exposure', view: 'dash',  icon: 'shield' },
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
  {
    section: 'Data',
    items: [
      { label: 'Upload Documents', view: 'upload', icon: 'upload' },
    ],
  },
]

const icons = {
  home:     <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M1 7L7 2l6 5"/><path d="M3 6v6h3V9h2v3h3V6"/></svg>,
  upload:   <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M7 9V2M4 5l3-3 3 3"/><path d="M2 11h10"/></svg>,
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
  back:     <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M9 2L4 7l5 5"/></svg>,
  chevron:  <svg viewBox="0 0 10 10" width={9} height={9} fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M2 4l3 3 3-3"/></svg>,
  drop:     <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M7 1C7 1 2 6.5 2 9a5 5 0 0010 0C12 6.5 7 1 7 1z"/></svg>,
  target:   <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="7" cy="7" r="5.5"/><circle cx="7" cy="7" r="2.5"/><circle cx="7" cy="7" r="0.8" fill="currentColor"/></svg>,
}

const clientInitials = name => name.split(' ').map(w => w[0]).join('').slice(0, 2)
const clientColor = idx => `hsl(${idx * 60 + 210}, 70%, 45%)`

export default function Sidebar({ view, setView, clients, clientIdx, isHome, onSelectClient, onGoHome }) {
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

      {isHome ? (
        /* ── HOME VIEW: Advisor Home active + client list ── */
        <nav style={{ padding: '10px 6px', flex: 1, overflowY: 'auto' }}>
          <NavItem
            item={{ label: 'Advisor Home', icon: 'home', view: 'home' }}
            active={true}
            onClick={() => {}}
          />

          <div style={{ fontSize: 9, color: 'var(--tx3)', textTransform: 'uppercase', letterSpacing: '0.7px', padding: '10px 8px 4px' }}>
            Clients
          </div>

          {clients.map((c, i) => (
            <ClientNavItem
              key={c.id || c.name}
              name={c.name}
              initials={clientInitials(c.name)}
              color={clientColor(i)}
              onClick={() => onSelectClient(i)}
            />
          ))}
        </nav>
      ) : (
        /* ── CLIENT VIEW: client switcher dropdown + full nav ── */
        <nav style={{ padding: '10px 6px', flex: 1, overflowY: 'auto' }}>
          <ClientSwitcher
            clients={clients}
            clientIdx={clientIdx}
            onSelectClient={onSelectClient}
            onGoHome={onGoHome}
          />

          {/* Full nav sections */}
          {CLIENT_NAV.map(({ section, items }) => (
            <div key={section} style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 9, color: 'var(--tx3)', textTransform: 'uppercase', letterSpacing: '0.7px', padding: '0 8px', marginBottom: 3 }}>{section}</div>
              {items.map(item => (
                <NavItem
                  key={item.label}
                  item={item}
                  active={
                    (view === item.view && item.view !== 'dash') ||
                    (view === 'dash' && item.view === 'dash' && item.label === 'Dashboard')
                  }
                  onClick={() => setView(item.view)}
                />
              ))}
            </div>
          ))}
        </nav>
      )}

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

// ─── Client switcher dropdown (replaces static badge) ───────────────────────
function ClientSwitcher({ clients, clientIdx, onSelectClient, onGoHome }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const active = clients[clientIdx]

  // Close on outside click
  useEffect(() => {
    if (!open) return
    function handler(e) { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  return (
    <div ref={ref} style={{ position: 'relative', marginBottom: 10 }}>
      {/* Trigger */}
      <div
        onClick={() => setOpen(o => !o)}
        style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '8px 10px',
          background: 'var(--surf)', border: '1px solid var(--bdr2)',
          borderRadius: 9, cursor: 'pointer',
          transition: 'border-color 0.15s',
          borderColor: open ? 'var(--blue)' : undefined,
        }}
      >
        {active && (
          <div style={{
            width: 26, height: 26, borderRadius: 7, flexShrink: 0,
            background: clientColor(clientIdx),
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 9, fontWeight: 700, color: '#fff',
          }}>
            {clientInitials(active.name)}
          </div>
        )}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 11, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {active?.name ?? '—'}
          </div>
          <div style={{ fontSize: 9, color: 'var(--tx3)' }}>Switch client ↕</div>
        </div>
        <span style={{
          color: 'var(--tx3)', flexShrink: 0,
          transform: open ? 'rotate(180deg)' : 'none',
          transition: 'transform 0.15s',
          display: 'flex',
        }}>
          {icons.chevron}
        </span>
      </div>

      {/* Dropdown */}
      {open && (
        <div style={{
          position: 'absolute', top: '100%', left: 0, right: 0, marginTop: 4,
          background: 'var(--bg3)', border: '1px solid var(--bdr2)',
          borderRadius: 10, overflow: 'hidden',
          boxShadow: '0 8px 24px rgba(0,0,0,0.35)',
          zIndex: 50,
        }}>
          {/* Advisor Home option */}
          <DropdownItem
            label="Advisor Home"
            sub="All clients overview"
            icon={<span style={{ width: 13, height: 13, display: 'flex' }}>{icons.home}</span>}
            iconBg="linear-gradient(135deg, var(--blue), var(--purple))"
            onClick={() => { setOpen(false); onGoHome() }}
          />
          <div style={{ height: 1, background: 'var(--bdr)', margin: '0 10px' }} />
          {clients.map((c, i) => (
            <DropdownItem
              key={c.id || c.name}
              label={c.name}
              sub={i === clientIdx ? 'Active' : null}
              active={i === clientIdx}
              iconBg={clientColor(i)}
              iconText={clientInitials(c.name)}
              onClick={() => { setOpen(false); onSelectClient(i) }}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function DropdownItem({ label, sub, active, iconBg, iconText, icon, onClick }) {
  const [hov, setHov] = useState(false)
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '8px 10px', cursor: 'pointer',
        background: active ? 'rgba(59,130,246,0.12)' : hov ? 'var(--surf)' : 'transparent',
        transition: 'background 0.1s',
      }}
    >
      <div style={{
        width: 24, height: 24, borderRadius: 6, flexShrink: 0,
        background: iconBg,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 8, fontWeight: 700, color: '#fff',
      }}>
        {icon || iconText}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 11, fontWeight: active ? 600 : 400, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: active ? 'var(--blue2)' : 'var(--tx)' }}>
          {label}
        </div>
        {sub && <div style={{ fontSize: 9, color: active ? 'var(--blue2)' : 'var(--tx3)' }}>{sub}</div>}
      </div>
      {active && (
        <svg viewBox="0 0 10 10" width={10} height={10} fill="none" stroke="var(--blue2)" strokeWidth="2"><path d="M2 5l2.5 2.5L8 3"/></svg>
      )}
    </div>
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

function ClientNavItem({ name, initials, color, onClick }) {
  const [hov, setHov] = React.useState(false)
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '6px 8px', borderRadius: 7, cursor: 'pointer',
        background: hov ? 'var(--surf)' : 'transparent',
        transition: 'background 0.12s', marginBottom: 2,
      }}
    >
      <div style={{
        width: 22, height: 22, borderRadius: 6, flexShrink: 0,
        background: color,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 8, fontWeight: 700, color: '#fff',
      }}>
        {initials}
      </div>
      <span style={{ fontSize: 12, color: hov ? 'var(--tx)' : 'var(--tx2)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {name}
      </span>
      <span style={{ marginLeft: 'auto', color: 'var(--tx3)', flexShrink: 0 }}>
        <svg viewBox="0 0 10 10" width={9} height={9} fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 2l4 3-4 3"/></svg>
      </span>
    </div>
  )
}
