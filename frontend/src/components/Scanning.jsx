import { useState, useEffect, useRef } from 'react'

const STEPS = [
  { wait: 400,  icon: '▶', text: 'Launching isolated Chromium sandbox',                        pct: 5,  label: 'Launching sandbox...' },
  { wait: 1200, icon: '✓', text: 'Sandbox ready ✓',                                            pct: 12, label: 'Sandbox ready' },
  { wait: 800,  icon: '▶', text: (domain) => `Navigating to ${domain}`,                        pct: 18, label: 'Opening site...' },
  { wait: 2500, icon: '✓', text: 'Page loaded — intercepting network traffic',                  pct: 26, label: 'Recording baseline...' },
  { wait: 1000, icon: '›', text: 'Captured baseline requests',                                  pct: 32, label: 'Baseline captured' },
  { wait: 1200, icon: '▶', text: 'Detecting consent management platform',                       pct: 40, label: 'Detecting CMP...' },
  { wait: 900,  icon: '✓', text: 'Cookie banner found — clicking Accept All',                   pct: 46, label: 'Clicking Accept All...' },
  { wait: 1500, icon: '✓', text: 'Accept All clicked ✓ — recording accept traffic',             pct: 54, label: 'Recording accept scan...' },
  { wait: 2000, icon: '▶', text: 'Fresh session — clicking Reject All',                         pct: 62, label: 'Clicking Reject All...' },
  { wait: 2000, icon: '✓', text: 'Reject All clicked ✓ — recording post-rejection traffic',    pct: 70, label: 'Re-scanning after reject...' },
  { wait: 1200, icon: '▶', text: 'Cross-referencing 6,324 known tracker domains',               pct: 78, label: 'Checking tracker DB...' },
  { wait: 1500, icon: '✓', text: 'Tracker identification complete',                             pct: 84, label: 'Reading cookie policy...' },
  { wait: 1000, icon: '▶', text: 'Fetching and parsing cookie policy',                         pct: 90, label: 'Analyzing declarations...' },
  { wait: 1200, icon: '✓', text: 'Policy analysed — checking declarations',                    pct: 95, label: 'Generating report...' },
  { wait: 800,  icon: '▶', text: 'Calculating GDPR exposure',                                  pct: 98, label: 'Generating report...' },
  { wait: 600,  icon: '✓', text: 'Report ready ✓',                                             pct: 100, label: 'Done' },
]

export default function Scanning({ url, error }) {
  const [logs, setLogs] = useState([])
  const [progress, setProgress] = useState({ pct: 0, label: 'Initialising...' })
  const [phaseB, setPhaseB] = useState('—')
  const [phaseA, setPhaseA] = useState('—')
  const [phaseV, setPhaseV] = useState('—')
  const startRef = useRef(Date.now())
  const bodyRef = useRef(null)

  const fmt = () => {
    const s = Math.floor((Date.now() - startRef.current) / 1000)
    return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`
  }

  useEffect(() => {
    startRef.current = Date.now()
    const domain = url.replace(/https?:\/\//, '').split('/')[0]
    setLogs([{ icon: '▶', text: 'ConsentGuard scanner initialising', time: '00:00', cursor: true }])
    setProgress({ pct: 0, label: 'Initialising...' })
    setPhaseB('—'); setPhaseA('—'); setPhaseV('—')

    let delay = 0
    const timers = []

    STEPS.forEach(({ wait, icon, text, pct, label }, i) => {
      delay += wait
      timers.push(setTimeout(() => {
        const resolved = typeof text === 'function' ? text(domain) : text
        setLogs(prev => [
          ...prev.map(l => ({ ...l, cursor: false })),
          { icon, text: resolved, time: fmt(), cursor: true }
        ])
        setProgress({ pct, label })

        if (i === 4) setPhaseB(String(Math.floor(Math.random() * 8 + 4)))
        if (i === 9) setPhaseA(String(Math.floor(Math.random() * 12 + 6)))
        if (i === 14) setPhaseV(String(Math.floor(Math.random() * 5 + 1)))
      }, delay))
    })

    return () => timers.forEach(clearTimeout)
  }, [url])

  useEffect(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight
  }, [logs])

  return (
    <section className="scanning-section">
      <div className="scanning-header">
        <h2>Running compliance scan</h2>
        <p>Scanning <span className="scanning-url">{url}</span></p>
      </div>

      <div className="terminal">
        <div className="terminal-bar">
          <span className="term-dot r" /><span className="term-dot y" /><span className="term-dot g" />
          <span className="terminal-title">consentguard — scanner</span>
        </div>
        <div className="terminal-body" ref={bodyRef}>
          {logs.map((log, i) => (
            <div className="log-line" key={i}>
              <span className="log-time">{log.time}</span>
              <span className="log-icon">{log.icon}</span>
              <span className="log-text">
                {log.text}
                {log.cursor && <span className="cursor" />}
              </span>
            </div>
          ))}
          {error && (
            <div className="log-line">
              <span className="log-time">{fmt()}</span>
              <span className="log-icon">✗</span>
              <span className="log-text" style={{ color: 'var(--red)' }}>Error: {error}</span>
            </div>
          )}
        </div>
      </div>

      <div className="progress-wrap">
        <div className="progress-labels">
          <span>{progress.label}</span>
          <span>{progress.pct}%</span>
        </div>
        <div className="progress-track">
          <div className="progress-fill" style={{ width: `${progress.pct}%` }} />
        </div>
      </div>

      <div className="phase-cards">
        {[
          { label: 'Requests Before', val: phaseB },
          { label: 'Requests After Reject', val: phaseA },
          { label: 'Violations Found', val: phaseV, bad: phaseV !== '—' && phaseV !== '0' },
        ].map(({ label, val, bad }) => (
          <div className="phase-card" key={label}>
            <div className="phase-label">{label}</div>
            <div className={`phase-val ${val === '—' ? 'pending' : bad ? 'bad' : 'done'}`}>{val}</div>
          </div>
        ))}
      </div>
    </section>
  )
}
