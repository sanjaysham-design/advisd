import React, { useState, useRef, useCallback, useEffect } from 'react'
import { uploadDocument, fetchDocuments, deleteDocument, getDocumentUrl, updateDocumentType } from '../lib/db'

const DOC_TYPES = [
  { value: 'capital_call',  label: 'Capital Call Notice' },
  { value: 'statement',     label: 'Account Statement' },
  { value: 'performance',   label: 'Performance Report' },
  { value: 'k1',            label: 'K-1 / Tax Document' },
  { value: 'alt_statement', label: 'Alt Investment Statement' },
  { value: 'other',         label: 'Other' },
]

const TYPE_COLORS = {
  capital_call:  { bg: 'rgba(239,68,68,0.12)',   color: '#fca5a5' },
  statement:     { bg: 'rgba(59,130,246,0.12)',   color: '#93c5fd' },
  performance:   { bg: 'rgba(34,197,94,0.12)',    color: '#86efac' },
  k1:            { bg: 'rgba(245,158,11,0.12)',   color: '#fcd34d' },
  alt_statement: { bg: 'rgba(167,139,250,0.12)',  color: '#c4b5fd' },
  other:         { bg: 'rgba(148,163,184,0.12)',  color: '#94a3b8' },
}

function fmt(bytes) {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

function timeAgo(ts) {
  const diff = Date.now() - new Date(ts).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

export default function Upload({ clientId, clientName }) {
  const [docs, setDocs] = useState([])
  const [loading, setLoading] = useState(true)
  const [dragging, setDragging] = useState(false)
  const [uploads, setUploads] = useState([]) // in-progress
  const [docType, setDocType] = useState('other')
  const [filter, setFilter] = useState('all')
  const fileRef = useRef()

  useEffect(() => {
    loadDocs()
  }, [clientId])

  async function loadDocs() {
    setLoading(true)
    try {
      const data = await fetchDocuments(clientId)
      setDocs(data || [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  async function handleFiles(files) {
    const fileArr = Array.from(files).filter(f =>
      ['application/pdf', 'text/csv', 'application/vnd.ms-excel',
       'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
       'image/png', 'image/jpeg'].includes(f.type)
    )
    if (!fileArr.length) return

    // Add to in-progress list
    const pending = fileArr.map(f => ({ name: f.name, size: f.size, status: 'uploading', progress: 0 }))
    setUploads(prev => [...prev, ...pending])

    for (let i = 0; i < fileArr.length; i++) {
      const file = fileArr[i]
      try {
        // Step 1: Upload to Supabase Storage
        setUploads(prev => prev.map(u =>
          u.name === file.name ? { ...u, status: 'uploading', progress: 30, label: 'Uploading…' } : u
        ))
        const doc = await uploadDocument(file, clientId, docType)

        // Step 2: Trigger AI ingestion
        setUploads(prev => prev.map(u =>
          u.name === file.name ? { ...u, status: 'processing', progress: 65, label: 'Analyzing with AI…' } : u
        ))

        const resp = await fetch('/api/ingest', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ documentId: doc.id, clientId }),
        })

        if (!resp.ok) {
          const err = await resp.json()
          throw new Error(err.error || 'Ingest failed')
        }

        const result = await resp.json()
        setUploads(prev => prev.map(u =>
          u.name === file.name ? { ...u, status: 'done', progress: 100, label: 'Done', extracted: result.extracted } : u
        ))
      } catch (e) {
        console.error('Upload/ingest error:', e)
        setUploads(prev => prev.map(u =>
          u.name === file.name ? { ...u, status: 'error', label: e.message } : u
        ))
      }
    }

    // Reload docs, clear done uploads after delay
    await loadDocs()
    setTimeout(() => setUploads(prev => prev.filter(u => u.status !== 'done')), 2000)
  }

  const onDrop = useCallback(e => {
    e.preventDefault()
    setDragging(false)
    handleFiles(e.dataTransfer.files)
  }, [clientId, docType])

  const onDragOver = e => { e.preventDefault(); setDragging(true) }
  const onDragLeave = () => setDragging(false)

  async function handleDelete(doc) {
    if (!confirm(`Delete "${doc.file_name}"? This cannot be undone.`)) return
    try {
      await deleteDocument(doc.id, doc.file_path)
      setDocs(prev => prev.filter(d => d.id !== doc.id))
    } catch (e) {
      alert('Failed to delete: ' + e.message)
    }
  }

  async function handleTypeChange(doc, newType) {
    try {
      await updateDocumentType(doc.id, newType)
      setDocs(prev => prev.map(d => d.id === doc.id ? { ...d, doc_type: newType } : d))
    } catch (e) {
      alert('Failed to update type: ' + e.message)
    }
  }

  async function handleReprocess(doc) {
    if (!clientId) return
    setDocs(prev => prev.map(d => d.id === doc.id ? { ...d, _reprocessing: true } : d))
    try {
      const resp = await fetch('/api/ingest', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ documentId: doc.id, clientId, reprocess: true }),
      })
      if (!resp.ok) {
        const err = await resp.json()
        throw new Error(err.error || 'Re-process failed')
      }
      await loadDocs()
    } catch (e) {
      alert('Re-process failed: ' + e.message)
      setDocs(prev => prev.map(d => d.id === doc.id ? { ...d, _reprocessing: false } : d))
    }
  }

  async function handleView(doc) {
    try {
      const url = await getDocumentUrl(doc.file_path)
      if (url) window.open(url, '_blank')
    } catch (e) {
      alert('Could not generate download link.')
    }
  }

  const filtered = filter === 'all' ? docs : docs.filter(d => d.doc_type === filter)

  return (
    <div className="fade-up" style={{ padding: '20px 24px' }}>

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10, marginBottom: 20 }}>
        {[
          { label: 'Total Documents', value: docs.length, color: null },
          { label: 'Capital Calls',   value: docs.filter(d => d.doc_type === 'capital_call').length,  color: '#fca5a5' },
          { label: 'Statements',      value: docs.filter(d => d.doc_type === 'statement').length,     color: '#93c5fd' },
          { label: 'Processed',       value: docs.filter(d => d.processed).length, color: '#86efac' },
        ].map(s => (
          <div key={s.label} style={{ background: 'var(--bg3)', border: '1px solid var(--bdr)', borderRadius: 12, padding: 16 }}>
            <div style={{ fontSize: 9, color: 'var(--tx3)', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 8 }}>{s.label}</div>
            <div style={{ fontSize: 26, fontWeight: 600, letterSpacing: '-1px', color: s.color || 'var(--tx)' }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Upload area */}
      <div style={{ background: 'var(--bg3)', border: '1px solid var(--bdr)', borderRadius: 14, padding: 20, marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 14, gap: 12 }}>
          <div style={{ fontSize: 13, fontWeight: 500 }}>Upload Documents</div>
          <div style={{ fontSize: 10, color: 'var(--tx3)' }}>for {clientName}</div>
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
            <label style={{ fontSize: 11, color: 'var(--tx2)' }}>Document type:</label>
            <select
              value={docType}
              onChange={e => setDocType(e.target.value)}
              style={{
                background: 'var(--surf)', border: '1px solid var(--bdr2)',
                borderRadius: 7, color: 'var(--tx)', fontSize: 12,
                padding: '5px 10px', cursor: 'pointer',
              }}
            >
              {DOC_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
        </div>

        {/* Drop zone */}
        <div
          onDrop={onDrop}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onClick={() => fileRef.current.click()}
          style={{
            border: `2px dashed ${dragging ? 'var(--blue)' : 'var(--bdr2)'}`,
            borderRadius: 10,
            padding: '32px 24px',
            textAlign: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s',
            background: dragging ? 'rgba(59,130,246,0.06)' : 'transparent',
          }}
        >
          <div style={{ marginBottom: 10 }}>
            <svg viewBox="0 0 40 40" width={40} height={40} fill="none" style={{ opacity: 0.3, margin: '0 auto', display: 'block' }}>
              <path d="M20 8v16M12 16l8-8 8 8" stroke="var(--tx)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M8 30h24" stroke="var(--tx)" strokeWidth="2.5" strokeLinecap="round"/>
            </svg>
          </div>
          <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 4 }}>
            {dragging ? 'Drop to upload' : 'Drag & drop files here'}
          </div>
          <div style={{ fontSize: 11, color: 'var(--tx3)' }}>or click to browse · PDF, CSV, XLS, PNG, JPG</div>
          <input
            ref={fileRef}
            type="file"
            multiple
            accept=".pdf,.csv,.xls,.xlsx,.png,.jpg,.jpeg"
            style={{ display: 'none' }}
            onChange={e => handleFiles(e.target.files)}
          />
        </div>

        {/* In-progress uploads */}
        {uploads.length > 0 && (
          <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
            {uploads.map((u, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                background: 'var(--surf)', borderRadius: 8, padding: '8px 12px',
              }}>
                <FileIcon name={u.name} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 500, marginBottom: 3 }}>{u.name}</div>
                  <div style={{ height: 3, background: 'var(--surf2)', borderRadius: 2 }}>
                    <div style={{
                      height: 3, borderRadius: 2,
                      width: u.status === 'done' ? '100%' : u.status === 'error' ? '100%' : '60%',
                      background: u.status === 'error' ? 'var(--red)' : u.status === 'done' ? 'var(--green)' : u.status === 'processing' ? 'var(--purple)' : 'var(--blue)',
                      transition: 'width 0.4s ease',
                    }} />
                  </div>
                </div>
                <div style={{ fontSize: 10, color: u.status === 'error' ? 'var(--red)' : u.status === 'done' ? 'var(--green)' : u.status === 'processing' ? 'var(--purple)' : 'var(--tx3)', minWidth: 90 }}>
                  {u.status === 'done' ? '✓ Done' : u.status === 'error' ? '✗ ' + (u.label || 'Failed') : u.label || 'Uploading…'}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Document library */}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 12, gap: 8 }}>
        <div style={{ fontSize: 13, fontWeight: 500 }}>Document Library</div>
        <span style={{ fontSize: 10, color: 'var(--tx3)' }}>{filtered.length} files</span>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 4 }}>
          {[['all', 'All'], ['capital_call', 'Capital Calls'], ['statement', 'Statements'], ['performance', 'Performance'], ['k1', 'K-1s']].map(([val, lbl]) => (
            <FilterPill key={val} label={lbl} active={filter === val} onClick={() => setFilter(val)} />
          ))}
        </div>
      </div>

      <div style={{ background: 'var(--bg3)', border: '1px solid var(--bdr)', borderRadius: 12, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--tx3)', fontSize: 12 }}>Loading documents…</div>
        ) : filtered.length === 0 ? (
          <EmptyState filter={filter} />
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {['File', 'Type', 'Client', 'Uploaded', 'Status', 'Actions'].map(h => (
                  <th key={h} style={{
                    padding: '8px 16px', fontSize: 9, color: 'var(--tx3)', textAlign: 'left',
                    textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 500,
                    borderBottom: '1px solid var(--bdr)',
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(doc => (
                <DocRow key={doc.id} doc={doc} onDelete={handleDelete} onView={handleView} onTypeChange={handleTypeChange} onReprocess={handleReprocess} />
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Future API integrations notice */}
      <div style={{
        marginTop: 16, background: 'var(--bg3)', border: '1px solid rgba(59,130,246,0.2)',
        borderRadius: 12, padding: '14px 18px',
        display: 'flex', alignItems: 'center', gap: 12,
      }}>
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--blue)', flexShrink: 0, opacity: 0.6 }} />
        <div>
          <div style={{ fontSize: 12, fontWeight: 500, marginBottom: 2 }}>Manual upload active</div>
          <div style={{ fontSize: 11, color: 'var(--tx3)' }}>
            This upload interface will be replaced by direct API connections to Addepar, Tamarac, Schwab, and UBS — data will sync automatically when those integrations are enabled.
          </div>
        </div>
      </div>
    </div>
  )
}

function DocRow({ doc, onDelete, onView, onTypeChange, onReprocess }) {
  const [hov, setHov] = useState(false)
  const [editing, setEditing] = useState(false)
  const typeStyle = TYPE_COLORS[doc.doc_type] || TYPE_COLORS.other

  function handleSelectChange(e) {
    onTypeChange(doc, e.target.value)
    setEditing(false)
  }

  return (
    <tr
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{ background: hov ? 'rgba(255,255,255,0.02)' : 'transparent' }}
    >
      <td style={{ padding: '11px 16px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <FileIcon name={doc.file_name} />
          <span style={{ fontSize: 12, fontWeight: 500 }}>{doc.file_name}</span>
        </div>
      </td>
      <td style={{ padding: '11px 16px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
        {editing ? (
          <select
            autoFocus
            value={doc.doc_type}
            onChange={handleSelectChange}
            onBlur={() => setEditing(false)}
            style={{
              background: 'var(--surf)', border: '1px solid var(--bdr2)',
              borderRadius: 5, color: 'var(--tx)', fontSize: 11,
              padding: '3px 8px', cursor: 'pointer',
            }}
          >
            {DOC_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        ) : (
          <span
            title="Click to change type"
            onClick={() => setEditing(true)}
            style={{ ...typeStyle, fontSize: 9, padding: '2px 8px', borderRadius: 5, fontWeight: 500, cursor: 'pointer' }}
          >
            {DOC_TYPES.find(t => t.value === doc.doc_type)?.label || 'Other'} ✎
          </span>
        )}
      </td>
      <td style={{ padding: '11px 16px', fontSize: 12, color: 'var(--tx2)', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
        {doc.client_name || '—'}
      </td>
      <td style={{ padding: '11px 16px', fontSize: 11, color: 'var(--tx3)', borderBottom: '1px solid rgba(255,255,255,0.04)', whiteSpace: 'nowrap' }}>
        {timeAgo(doc.uploaded_at)}
      </td>
      <td style={{ padding: '11px 16px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
        <span style={{
          fontSize: 9, padding: '2px 8px', borderRadius: 5,
          background: doc.processed ? 'rgba(34,197,94,0.12)' : 'rgba(245,158,11,0.12)',
          color: doc.processed ? '#86efac' : '#fcd34d',
        }}>
          {doc.processed ? '✓ Processed' : '⏳ Pending'}
        </span>
      </td>
      <td style={{ padding: '11px 16px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
        <div style={{ display: 'flex', gap: 6 }}>
          <ActionBtn onClick={() => onView(doc)}>View</ActionBtn>
          <ActionBtn onClick={() => onReprocess(doc)} loading={doc._reprocessing}>
            {doc._reprocessing ? '⟳ Re-processing…' : 'Re-process'}
          </ActionBtn>
          <ActionBtn onClick={() => onDelete(doc)} danger>Delete</ActionBtn>
        </div>
      </td>
    </tr>
  )
}

function FileIcon({ name }) {
  const ext = name?.split('.').pop()?.toLowerCase()
  const color = ext === 'pdf' ? '#fca5a5' : ext === 'csv' || ext === 'xls' || ext === 'xlsx' ? '#86efac' : '#93c5fd'
  return (
    <div style={{
      width: 26, height: 26, borderRadius: 5, flexShrink: 0,
      background: color + '20', display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 8, fontWeight: 700, color, textTransform: 'uppercase',
    }}>{ext || 'file'}</div>
  )
}

function FilterPill({ label, active, onClick }) {
  const [hov, setHov] = useState(false)
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: active ? 'rgba(59,130,246,0.18)' : hov ? 'var(--surf2)' : 'var(--surf)',
        border: `1px solid ${active ? 'rgba(59,130,246,0.35)' : 'var(--bdr)'}`,
        borderRadius: 5, padding: '3px 10px', fontSize: 10,
        color: active ? 'var(--blue2)' : 'var(--tx2)',
        cursor: 'pointer', transition: 'all 0.15s',
      }}
    >{label}</div>
  )
}

function ActionBtn({ children, onClick, danger, loading }) {
  const [hov, setHov] = useState(false)
  return (
    <button
      onClick={loading ? undefined : onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: hov && danger ? 'rgba(239,68,68,0.15)' : loading ? 'rgba(59,130,246,0.1)' : 'var(--surf)',
        border: `1px solid ${hov && danger ? 'rgba(239,68,68,0.3)' : loading ? 'rgba(59,130,246,0.25)' : 'var(--bdr)'}`,
        borderRadius: 5,
        color: danger && hov ? 'var(--red)' : loading ? 'var(--blue2)' : 'var(--tx2)',
        padding: '3px 10px', fontSize: 10,
        cursor: loading ? 'default' : 'pointer',
        transition: 'all 0.15s',
      }}
    >{children}</button>
  )
}

function EmptyState({ filter }) {
  return (
    <div style={{ padding: '48px 24px', textAlign: 'center' }}>
      <svg viewBox="0 0 48 48" width={48} height={48} fill="none" style={{ opacity: 0.2, margin: '0 auto 12px', display: 'block' }}>
        <path d="M12 4h18l12 12v28H12V4z" stroke="var(--tx)" strokeWidth="2.5" strokeLinejoin="round"/>
        <path d="M30 4v12h12" stroke="var(--tx)" strokeWidth="2.5" strokeLinejoin="round"/>
        <path d="M18 26h14M18 32h10" stroke="var(--tx)" strokeWidth="2.5" strokeLinecap="round"/>
      </svg>
      <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 4 }}>No documents yet</div>
      <div style={{ fontSize: 11, color: 'var(--tx3)' }}>
        {filter === 'all' ? 'Upload your first document above' : `No ${filter.replace('_', ' ')} documents uploaded`}
      </div>
    </div>
  )
}
