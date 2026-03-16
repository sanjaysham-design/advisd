import React, { useState } from 'react'
import { nlqAnswers } from '../data/mockData'

const CHIPS = [
  'Capital calls next 60 days',
  'PE fund IRR',
  'YTD vs benchmarks',
  'Unfunded commitments',
  'Risk by asset class',
  'Top performing manager',
]

export default function NLQBar() {
  const [query, setQuery] = useState('')
  const [answer, setAnswer] = useState(null)

  function run(q) {
    const key = q || query
    const match = Object.keys(nlqAnswers).find(k =>
      key.toLowerCase().includes(k.toLowerCase().substring(0, 10))
    ) || Object.keys(nlqAnswers)[0]
    setAnswer(nlqAnswers[match])
    setQuery(key)
  }

  return (
    <div style={{ borderBottom: '1px solid var(--bdr)', background: 'var(--bg2)', flexShrink: 0 }}>
      <div style={{ padding: '12px 24px' }}>
        <div style={{ position: 'relative' }}>
          <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--tx3)', display: 'flex' }}>
            <svg viewBox="0 0 14 14" width={14} height={14} fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="6" cy="6" r="4"/><path d="M9.5 9.5L13 13"/>
            </svg>
          </span>
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && run()}
            placeholder='Ask anything — e.g. "What capital calls are due in the next 60 days?"'
            style={{
              width: '100%', background: 'var(--surf)',
              border: '1px solid var(--bdr2)', borderRadius: 10,
              color: 'var(--tx)', fontSize: 13,
              padding: '10px 90px 10px 38px', outline: 'none',
            }}
          />
          <button
            onClick={() => run()}
            style={{
              position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)',
              background: 'var(--blue)', border: 'none', borderRadius: 6,
              color: '#fff', cursor: 'pointer', padding: '4px 12px',
              fontSize: 11, fontWeight: 500,
            }}
          >Ask →</button>
        </div>

        <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
          {CHIPS.map(chip => (
            <Chip key={chip} label={chip} onClick={() => run(chip)} />
          ))}
        </div>
      </div>

      {answer && <AnswerBox answer={answer} onClose={() => setAnswer(null)} />}
    </div>
  )
}

function Chip({ label, onClick }) {
  const [hov, setHov] = useState(false)
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: hov ? 'var(--surf2)' : 'var(--surf)',
        border: `1px solid ${hov ? 'var(--bdr2)' : 'var(--bdr)'}`,
        borderRadius: 20, padding: '3px 11px',
        fontSize: 10, color: hov ? 'var(--tx)' : 'var(--tx2)',
        cursor: 'pointer', transition: 'all 0.15s', whiteSpace: 'nowrap',
      }}
    >{label}</div>
  )
}

function AnswerBox({ answer, onClose }) {
  return (
    <div style={{
      margin: '0 24px 12px',
      background: 'var(--bg3)',
      border: '1px solid rgba(59,130,246,0.25)',
      borderRadius: 10,
      animation: 'fadeUp 0.25s ease',
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 7,
        padding: '10px 14px', borderBottom: '1px solid var(--bdr)',
      }}>
        <svg viewBox="0 0 14 14" width={13} height={13} fill="none" stroke="var(--blue2)" strokeWidth="1.5">
          <path d="M7 1C3.69 1 1 3.69 1 7s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6z"/>
          <path d="M5 7l1.5 1.5L9 5"/>
        </svg>
        <span style={{ fontSize: 11, color: 'var(--blue2)', fontWeight: 600 }}>Advisd Intelligence — {answer.title}</span>
        <button
          onClick={onClose}
          style={{ marginLeft: 'auto', background: 'none', border: 'none', color: 'var(--tx3)', cursor: 'pointer', fontSize: 16, lineHeight: 1 }}
        >×</button>
      </div>
      <div style={{ padding: '12px 14px' }}>
        <p style={{ fontSize: 12, lineHeight: 1.7 }} dangerouslySetInnerHTML={{ __html: answer.body }} />
        {answer.rows && (
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 10, fontSize: 11 }}>
            <thead>
              <tr>
                {answer.rows.headers.map(h => (
                  <th key={h} style={{ color: 'var(--tx3)', fontWeight: 500, textAlign: 'left', padding: '5px 8px', borderBottom: '1px solid var(--bdr)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {answer.rows.data.map((row, i) => (
                <tr key={i}>
                  {row.map((cell, j) => (
                    <td key={j} style={{ padding: '7px 8px', borderBottom: '1px solid rgba(255,255,255,0.04)', color: 'var(--tx)' }}>{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {answer.footer && (
          <p style={{ fontSize: 11, color: 'var(--tx2)', marginTop: 10, paddingTop: 10, borderTop: '1px solid var(--bdr)' }}>
            {answer.footer}
          </p>
        )}
      </div>
    </div>
  )
}
