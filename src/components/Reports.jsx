import React, { useState } from 'react'
import { reportTemplates } from '../data/mockData'

const TABS = ['Templates', 'Scheduled', 'Archive']

const tagColors = {
  'PDF': null,
  'Scheduled': '#3b82f6',
  'White-label': '#a78bfa',
  'On-demand': '#22c55e',
  'Monthly': '#14b8a6',
  'Quarterly': '#f59e0b',
  'Annual': '#9898a8',
}

export default function Reports() {
  const [tab, setTab] = useState('Templates')

  return (
    <div className="fade-up" style={{ padding: '20px 24px' }}>
      <div style={{ display: 'flex', borderBottom: '1px solid var(--bdr)', marginBottom: 20 }}>
        {TABS.map(t => (
          <div key={t} onClick={() => setTab(t)} style={{
            padding: '8px 14px', fontSize: 12,
            color: tab === t ? 'var(--tx)' : 'var(--tx3)',
            borderBottom: `2px solid ${tab === t ? 'var(--blue)' : 'transparent'}`,
            marginBottom: -1, cursor: 'pointer', transition: 'all 0.15s',
          }}>{t}</div>
        ))}
      </div>

      {tab === 'Templates' && (
        <>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 500 }}>Report Templates</div>
            <button style={{
              marginLeft: 'auto', background: 'var(--blue)', border: 'none',
              borderRadius: 7, color: '#fff', padding: '6px 14px', fontSize: 12,
              fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5,
            }}>
              <svg viewBox="0 0 12 12" width={11} height={11} fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 1v10M1 6h10"/></svg>
              New Template
            </button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }}>
            {reportTemplates.map(t => <TemplateCard key={t.id} template={t} />)}
          </div>
        </>
      )}

      {tab === 'Scheduled' && (
        <div>
          <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 14 }}>Scheduled Distributions</div>
          <div style={{ background: 'var(--bg3)', border: '1px solid var(--bdr)', borderRadius: 12, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  {['Report', 'Client', 'Frequency', 'Next Run', 'Recipients', 'Status'].map(h => (
                    <th key={h} style={{ padding: '8px 16px', fontSize: 9, color: 'var(--tx3)', textAlign: 'left', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 500, borderBottom: '1px solid var(--bdr)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { report: 'Quarterly Performance Report', client: 'All Clients', freq: 'Quarterly', next: 'Apr 1, 2026', recipients: 5, active: true },
                  { report: 'Capital Call Summary', client: 'Meridian Family Trust', freq: 'On trigger', next: 'Jan 22, 2026', recipients: 2, active: true },
                  { report: 'Risk & Exposure Report', client: 'All Clients', freq: 'Monthly', next: 'Feb 1, 2026', recipients: 5, active: true },
                  { report: 'Manager Attribution Report', client: 'Harrington Capital LLC', freq: 'Quarterly', next: 'Apr 1, 2026', recipients: 1, active: false },
                ].map((r, i) => (
                  <ScheduledRow key={i} row={r} />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'Archive' && (
        <div>
          <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 14 }}>Report Archive</div>
          <div style={{ background: 'var(--bg3)', border: '1px solid var(--bdr)', borderRadius: 12, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  {['Report', 'Client', 'Generated', 'Pages', 'Format', 'Action'].map(h => (
                    <th key={h} style={{ padding: '8px 16px', fontSize: 9, color: 'var(--tx3)', textAlign: 'left', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 500, borderBottom: '1px solid var(--bdr)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { name: 'Q3 2025 Performance Report', client: 'Meridian Family Trust', date: 'Oct 3, 2025', pages: 12 },
                  { name: 'Q3 2025 Performance Report', client: 'Harrington Capital LLC', date: 'Oct 3, 2025', pages: 12 },
                  { name: 'Capital Call Summary — Sep 2025', client: 'Meridian Family Trust', date: 'Sep 15, 2025', pages: 4 },
                  { name: 'Q2 2025 Risk & Exposure', client: 'Chen Family Office', date: 'Jul 5, 2025', pages: 6 },
                  { name: 'Q2 2025 Performance Report', client: 'Meridian Family Trust', date: 'Jul 1, 2025', pages: 12 },
                ].map((r, i) => (
                  <ArchiveRow key={i} row={r} />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

function TemplateCard({ template }) {
  const [hov, setHov] = useState(false)
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: 'var(--bg3)',
        border: `1px solid ${template.featured ? 'rgba(59,130,246,0.35)' : hov ? 'var(--bdr2)' : 'var(--bdr)'}`,
        borderRadius: 10, padding: 16,
        cursor: 'pointer', transition: 'all 0.2s',
        transform: hov ? 'translateY(-1px)' : 'none',
      }}
    >
      {template.featured && (
        <div style={{ fontSize: 9, color: 'var(--blue2)', fontWeight: 700, marginBottom: 8 }}>★ FEATURED</div>
      )}
      {!template.featured && (
        <div style={{ fontSize: 9, color: 'var(--tx3)', fontWeight: 700, marginBottom: 8 }}>TEMPLATE</div>
      )}
      <div style={{ fontSize: 12, fontWeight: 500, marginBottom: 3 }}>{template.title}</div>
      <div style={{ fontSize: 10, color: 'var(--tx3)', marginBottom: 12 }}>{template.desc}</div>
      <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: 12 }}>
        {template.tags.map(tag => (
          <span key={tag} style={{
            fontSize: 9, padding: '2px 7px', borderRadius: 4,
            background: tagColors[tag] ? tagColors[tag] + '20' : 'var(--surf)',
            color: tagColors[tag] || 'var(--tx2)',
          }}>{tag}</span>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 6 }}>
        <button style={{ background: 'var(--blue)', border: 'none', borderRadius: 6, color: '#fff', padding: '4px 12px', fontSize: 10, fontWeight: 500, cursor: 'pointer' }}>Preview</button>
        <button style={{ background: 'var(--surf)', border: '1px solid var(--bdr)', borderRadius: 6, color: 'var(--tx2)', padding: '4px 12px', fontSize: 10, fontWeight: 500, cursor: 'pointer' }}>Edit</button>
        <button style={{ background: 'var(--surf)', border: '1px solid var(--bdr)', borderRadius: 6, color: 'var(--tx2)', padding: '4px 12px', fontSize: 10, fontWeight: 500, cursor: 'pointer' }}>Generate PDF</button>
      </div>
    </div>
  )
}

function ScheduledRow({ row }) {
  const [hov, setHov] = useState(false)
  return (
    <tr onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ background: hov ? 'rgba(255,255,255,0.02)' : 'transparent' }}>
      <td style={{ padding: '11px 16px', fontSize: 12, fontWeight: 500, borderBottom: '1px solid rgba(255,255,255,0.04)' }}>{row.report}</td>
      <td style={{ padding: '11px 16px', fontSize: 12, color: 'var(--tx2)', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>{row.client}</td>
      <td style={{ padding: '11px 16px', fontSize: 12, borderBottom: '1px solid rgba(255,255,255,0.04)' }}>{row.freq}</td>
      <td style={{ padding: '11px 16px', fontSize: 12, borderBottom: '1px solid rgba(255,255,255,0.04)' }}>{row.next}</td>
      <td style={{ padding: '11px 16px', fontSize: 12, color: 'var(--tx2)', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>{row.recipients} recipients</td>
      <td style={{ padding: '11px 16px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
        <span style={{
          background: row.active ? 'rgba(34,197,94,0.14)' : 'var(--surf)',
          color: row.active ? 'var(--green)' : 'var(--tx3)',
          padding: '2px 8px', borderRadius: 5, fontSize: 10,
        }}>{row.active ? 'Active' : 'Paused'}</span>
      </td>
    </tr>
  )
}

function ArchiveRow({ row }) {
  const [hov, setHov] = useState(false)
  return (
    <tr onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ background: hov ? 'rgba(255,255,255,0.02)' : 'transparent' }}>
      <td style={{ padding: '11px 16px', fontSize: 12, fontWeight: 500, borderBottom: '1px solid rgba(255,255,255,0.04)' }}>{row.name}</td>
      <td style={{ padding: '11px 16px', fontSize: 12, color: 'var(--tx2)', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>{row.client}</td>
      <td style={{ padding: '11px 16px', fontSize: 12, color: 'var(--tx3)', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>{row.date}</td>
      <td style={{ padding: '11px 16px', fontSize: 12, color: 'var(--tx3)', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>{row.pages} pages</td>
      <td style={{ padding: '11px 16px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
        <span style={{ background: 'rgba(239,68,68,0.12)', color: '#fca5a5', padding: '2px 7px', borderRadius: 4, fontSize: 9 }}>PDF</span>
      </td>
      <td style={{ padding: '11px 16px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
        <button style={{ background: 'var(--surf)', border: '1px solid var(--bdr)', borderRadius: 5, color: 'var(--tx2)', padding: '3px 10px', fontSize: 10, cursor: 'pointer' }}>Download</button>
      </td>
    </tr>
  )
}
