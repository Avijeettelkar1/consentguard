import { useInView } from '../hooks/useInView'

function ScanCard() {
  return (
    <div className="tl-card">
      <div className="card-bar">
        <span className="card-dot r" /><span className="card-dot y" /><span className="card-dot g" />
        <span className="card-title-text">consentguard — scanner</span>
      </div>
      <div className="card-body">
        <div className="tl-log">
          <div><span className="dim">00:00</span> ▶ <span className="hl">Launching Chromium sandbox</span></div>
          <div><span className="dim">00:01</span> <span className="ok">✓</span> Sandbox ready — no cookies, no cache</div>
          <div><span className="dim">00:02</span> ▶ Navigating to <span className="teal">bbc.com</span></div>
          <div><span className="dim">00:04</span> <span className="ok">✓</span> Cookie banner detected — <span className="hl">OneTrust</span></div>
          <div><span className="dim">00:05</span> ▶ Clicking <span className="err">Accept All</span> — recording traffic</div>
          <div><span className="dim">00:08</span> <span className="ok">✓</span> Fresh session — clicking <span className="err">Reject All</span></div>
          <div><span className="dim">00:11</span> <span className="err">✗</span> <span className="err">facebook.net</span> still firing</div>
          <div><span className="dim">00:11</span> <span className="err">✗</span> <span className="err">bat.bing.com</span> still firing</div>
          <div><span className="dim">00:11</span> <span className="err">✗</span> <span className="err">segment.com</span> still firing</div>
          <div><span className="dim">00:12</span> <span className="ok">✓</span> Scan complete <span className="tl-cursor" /></div>
        </div>
      </div>
    </div>
  )
}

function ViolationsCard() {
  const rows = [
    { domain: 'facebook.net',    cat: 'advertising', bad: true },
    { domain: 'bat.bing.com',    cat: 'advertising', bad: true },
    { domain: 'ads-twitter.com', cat: 'advertising', bad: true },
    { domain: 'segment.com',     cat: 'analytics',   bad: true },
    { domain: 'google-analytics', cat: 'analytics',  bad: false },
  ]
  return (
    <div className="tl-card">
      <div className="card-bar">
        <span className="card-dot r" /><span className="card-dot y" /><span className="card-dot g" />
        <span className="card-title-text">tracker violations</span>
      </div>
      <div className="card-body">
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th className="mini-th">Domain</th>
              <th className="mini-th">Category</th>
              <th className="mini-th">Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.domain} className="mini-tr">
                <td className="mini-td"><span className="mono-sm">{r.domain}</span></td>
                <td className="mini-td"><span className="cat-tag">{r.cat}</span></td>
                <td className="mini-td">
                  <span style={{ fontSize: '0.62rem', fontWeight: 700, color: r.bad ? 'var(--red)' : 'var(--green)', fontFamily: 'var(--mono)', letterSpacing: '0.04em' }}>
                    {r.bad ? 'UNDECLARED' : 'DECLARED'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{ marginTop: '1rem', padding: '0.6rem 0.85rem', borderRadius: 8, background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.18)', fontSize: '0.72rem', color: 'var(--red)', fontWeight: 600 }}>
          ⚠ 4 trackers violate GDPR Art. 7 — not declared in cookie policy
        </div>
      </div>
    </div>
  )
}

function ReportCard() {
  return (
    <div className="tl-card">
      <div className="card-bar">
        <span className="card-dot r" /><span className="card-dot y" /><span className="card-dot g" />
        <span className="card-title-text">gdpr exposure + complaint</span>
      </div>
      <div className="card-body">
        <div style={{ marginBottom: '1rem' }}>
          <div style={{ fontSize: '0.62rem', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.6rem', fontWeight: 700 }}>Fine Exposure</div>
          <div className="fine-rows">
            {[
              { label: 'Small company',  val: '€50k – €200k' },
              { label: 'Medium company', val: '€200k – €800k' },
              { label: 'Large company',  val: '€800k – €4M' },
            ].map(({ label, val }) => (
              <div className="fine-row" key={label}>
                <span className="fine-row-label">{label}</span>
                <span className="fine-row-val">{val}</span>
              </div>
            ))}
          </div>
        </div>
        <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
          <div style={{ fontSize: '0.62rem', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.5rem', fontWeight: 700 }}>DPA Complaint</div>
          <div style={{ fontFamily: 'var(--mono)', fontSize: '0.7rem', color: 'var(--text2)', lineHeight: 1.7 }}>
            <div>Dear Data Protection Authority,</div>
            <div style={{ color: 'var(--text3)' }}>I submit this complaint regarding...</div>
            <div style={{ color: 'var(--text3)' }}>After selecting Reject All, trackers</div>
            <div style={{ color: 'var(--text3)' }}>continued to fire: facebook.net...</div>
            <div style={{ marginTop: '0.35rem' }}>
              <span style={{ background: 'var(--green-dim)', color: 'var(--green)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: 4, padding: '0.15rem 0.45rem', fontSize: '0.62rem', fontWeight: 700 }}>
                Ready to send ✓
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const SECTIONS = [
  {
    tag: 'Scan & Detect',
    title: 'We click Reject All. Then watch what fires anyway.',
    body: 'A fresh Chromium instance — no cookies, no history, no extensions. We click Accept All, then Reject All in separate sessions, and compare every network request between the two.',
    card: <ScanCard />,
    icon: (
      <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
      </svg>
    ),
  },
  {
    tag: 'Analyze',
    title: '6,324 tracker domains. Cross-referenced instantly.',
    body: 'Every request fired after rejection is matched against the Disconnect.me tracker database — categorised by company, type, and what data it collects. Undeclared ones are flagged as GDPR Art. 7 violations.',
    card: <ViolationsCard />,
    icon: (
      <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
        <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
    ),
  },
  {
    tag: 'Report & Act',
    title: 'A ready-to-send complaint. And a fix.',
    body: 'We calculate GDPR fine exposure by company size, generate the exact policy text and banner config fix needed, and draft a formal DPA complaint letter — ready to file with your national Data Protection Authority.',
    card: <ReportCard />,
    icon: (
      <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" />
      </svg>
    ),
  },
]

function TimelineItem({ section, index }) {
  const [ref, inView] = useInView(0.15)
  const isReverse = index % 2 === 1

  return (
    <div ref={ref} className={`timeline-item${isReverse ? ' reverse' : ''}`}>
      <div className={`tl-content${inView ? ' visible' : ''}`}>
        <span className="section-label">{section.tag}</span>
        <h3 className="tl-title">{section.title}</h3>
        <p className="tl-body">{section.body}</p>
      </div>

      <div className="tl-node">
        <div className={`tl-node-ring${inView ? ' active' : ''}`}>
          {section.icon}
        </div>
      </div>

      <div className={`tl-card${inView ? ' visible' : ''}`}>
        {section.card}
      </div>
    </div>
  )
}

export default function HowItWorks() {
  return (
    <section id="howItWorks">
      <div className="timeline-wrapper">
        <div className="timeline-header">
          <span className="section-label">The process</span>
          <h2>What happens when you hit Scan</h2>
          <p>A full automated audit inside an isolated browser sandbox — no plugins, no extensions, no cached state.</p>
        </div>

        <div className="timeline-body">
          <div className="tl-spine" />
          {SECTIONS.map((section, i) => (
            <TimelineItem key={section.tag} section={section} index={i} />
          ))}
        </div>
      </div>
    </section>
  )
}
