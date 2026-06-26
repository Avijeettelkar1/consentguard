import { useState } from 'react'

export default function Results({ data, onReset }) {
  const [activeTab, setActiveTab] = useState('policy')
  const [copied, setCopied] = useState(false)

  const scan = data.scan || {}
  const undeclared = data.undeclared || []
  const declared = data.declared || []
  const violations = data.violations || []
  const fixes = data.fixes || {}
  const exposure = data.exposure || {}
  const verify = data.verify || {}
  const plain = data.plain_summary || null
  const comparison = data.comparison || null

  const hasViolations = undeclared.length > 0

  const copyComplaint = () => {
    navigator.clipboard.writeText(data.complaint || '').then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <section className="results-section">
      <div className="results-inner">

        {/* Plain English summary (new backend only) */}
        {plain && (
          <div className="summary-card">
            <h3>{plain.status}</h3>
            <p>{plain.result}</p>
            {plain.comparison && <p style={{ marginTop: '0.4rem' }}>{plain.comparison}</p>}
            {plain.user_takeaway && <p className="takeaway" style={{ marginTop: '0.75rem' }}>{plain.user_takeaway}</p>}
          </div>
        )}

        {/* Verdict banner */}
        <div className={`verdict-banner ${hasViolations ? 'fail' : 'pass'}`}>
          <div className="verdict-left">
            <h2>{hasViolations ? 'Cookie Consent Violated' : 'Cookie Consent Compliant'}</h2>
            <p>
              {hasViolations
                ? `${undeclared.length} undeclared tracker${undeclared.length > 1 ? 's' : ''} fired after "Reject All" on ${data.url}`
                : `No undeclared trackers detected after "Reject All" on ${data.url}`}
            </p>
          </div>
          <div className="verdict-score">
            <div className={`score-num ${hasViolations ? 'red' : 'green'}`}>{undeclared.length}</div>
            <div className="score-label">undeclared trackers</div>
          </div>
        </div>

        {/* Metrics */}
        <div className="metrics">
          <div className="metric">
            <div className="m-label">Consent Platform</div>
            <div className="m-val">
              <span className="m-platform">{scan.consent_platform || 'Unknown'}</span>
            </div>
          </div>
          <div className="metric">
            <div className="m-label">Reject All Clicked</div>
            <div className={`m-val ${scan.clicked_reject ? 'green' : 'red'}`}>
              {scan.clicked_reject ? 'Yes ✓' : 'Not found ✗'}
            </div>
          </div>
          <div className="metric">
            <div className="m-label">Trackers After Reject</div>
            <div className="m-val red">{scan.after_count ?? '—'}</div>
          </div>
          <div className="metric">
            <div className="m-label">Declared in Policy</div>
            <div className="m-val green">{declared.length}</div>
          </div>
        </div>

        {/* Violations table */}
        <div className="block">
          <div className="block-header">
            <h3>
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
              Tracker Violations
            </h3>
            <span className={`chip ${violations.length ? 'red' : 'green'}`}>{violations.length} found</span>
          </div>
          <div style={{ padding: '0 1.5rem' }}>
            <table>
              <thead>
                <tr>
                  <th>Domain</th>
                  <th>Company</th>
                  <th>Category</th>
                  <th style={{ maxWidth: 180 }}>Data Collected</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {violations.length === 0 && (
                  <tr><td colSpan={5} style={{ color: 'var(--text3)', padding: '1rem 0' }}>No tracker violations detected.</td></tr>
                )}
                {violations.map((v, i) => (
                  <tr key={i}>
                    <td><span className="td-domain">{v.domain}</span></td>
                    <td style={{ color: 'var(--text2)', fontSize: '0.8rem' }}>{v.company || '—'}</td>
                    <td><span className="td-cat">{v.category}</span></td>
                    <td className="td-desc">{v.data_collected}</td>
                    <td>
                      {v.needs_review
                        ? <span className="chip yellow">Review</span>
                        : v.declared
                          ? <span className="chip green">Declared</span>
                          : <span className="chip red">Undeclared</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Accept vs Reject comparison (new backend only) */}
        {comparison && (
          <div className="block">
            <div className="block-header">
              <h3>
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" />
                </svg>
                Accept vs Reject Comparison
              </h3>
              <span className="chip purple">{comparison.accept_only_request_count ?? 0} extra on accept</span>
            </div>
            <div className="block-body" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.5rem' }}>
                  Only fires when accepted
                </div>
                {(comparison.accept_only_domains || []).slice(0, 6).map((d) => (
                  <div key={d.domain} style={{ fontSize: '0.8rem', fontFamily: 'var(--mono)', color: 'var(--red)', padding: '0.2rem 0' }}>
                    {d.domain} <span style={{ color: 'var(--text3)' }}>×{d.count}</span>
                  </div>
                ))}
                {!comparison.accept_only_domains?.length && <div style={{ fontSize: '0.8rem', color: 'var(--text3)' }}>None detected</div>}
              </div>
              <div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.5rem' }}>
                  Common to both
                </div>
                {(comparison.common_domains || []).slice(0, 6).map((d) => (
                  <div key={d.domain} style={{ fontSize: '0.8rem', fontFamily: 'var(--mono)', color: 'var(--text2)', padding: '0.2rem 0' }}>
                    {d.domain} <span style={{ color: 'var(--text3)' }}>×{d.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Fixes */}
        <div className="block">
          <div className="block-header">
            <h3>
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
              </svg>
              Recommended Fixes
            </h3>
            <span className="chip purple">2 actions</span>
          </div>
          <div className="tabs">
            <button className={`tab-btn ${activeTab === 'policy' ? 'active' : ''}`} onClick={() => setActiveTab('policy')}>Policy Update</button>
            <button className={`tab-btn ${activeTab === 'banner' ? 'active' : ''}`} onClick={() => setActiveTab('banner')}>Banner Config</button>
          </div>
          <div className={`tab-panel ${activeTab === 'policy' ? 'active' : ''}`}>
            <p style={{ fontSize: '0.8rem', color: 'var(--text2)', marginBottom: '0.75rem' }}>
              Add this paragraph to your cookie policy to disclose the undeclared trackers:
            </p>
            <div className="code-block" dangerouslySetInnerHTML={{ __html: fixes.policy_fix || '—' }} />
          </div>
          <div className={`tab-panel ${activeTab === 'banner' ? 'active' : ''}`}>
            <p style={{ fontSize: '0.8rem', color: 'var(--text2)', marginBottom: '0.75rem' }}>
              Step-by-step instructions to fix your consent platform configuration:
            </p>
            <div className="code-block">{fixes.banner_fix || '—'}</div>
          </div>
        </div>

        {/* GDPR Fine Exposure */}
        <div className="block">
          <div className="block-header">
            <h3>
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
              GDPR Fine Exposure
            </h3>
            <span className="chip red">{exposure.max_fine_percent || '—'}</span>
          </div>
          <div className="block-body">
            <div className="fine-max">
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
              </svg>
              <p>
                Under <strong style={{ color: 'var(--red)' }}>GDPR Art. 83</strong>, maximum fine is{' '}
                <strong style={{ color: 'var(--red)' }}>{exposure.max_fine_percent || '—'}</strong>.
                Estimated exposure by company size:
              </p>
            </div>
            <div className="fine-grid">
              {[
                { label: 'Small business',    val: exposure.estimated_range_small },
                { label: 'Medium business',   val: exposure.estimated_range_medium },
                { label: 'Large business',    val: exposure.estimated_range_large },
                { label: 'Relevant authority', val: exposure.relevant_authority, plain: true },
              ].map(({ label, val, plain }) => (
                <div className="fine-item" key={label}>
                  <div className="fi-label">{label}</div>
                  <div className={`fi-val${plain ? '' : ' danger'}`}>{val || '—'}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Verification */}
        <div className="block">
          <div className="block-header">
            <h3>
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              Verification Scan
            </h3>
          </div>
          <div className="block-body">
            <div className={`verify-strip ${verify.clean ? 'clean' : 'dirty'}`}>
              {verify.clean
                ? '✓ Verification scan shows 0 remaining violations — fix confirmed'
                : verify.skipped
                  ? `ℹ ${verify.reason}`
                  : `✗ ${verify.violation_count} tracker(s) still detected in verification scan`}
            </div>
          </div>
        </div>

        {/* DPA Complaint */}
        <div className="block">
          <div className="block-header">
            <h3>
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" />
              </svg>
              DPA Complaint Letter
            </h3>
            <button className="copy-btn" onClick={copyComplaint}>
              {copied ? 'Copied ✓' : 'Copy letter'}
            </button>
          </div>
          <div className="block-body" style={{ paddingTop: 0 }}>
            <p style={{ fontSize: '0.8rem', color: 'var(--text2)', marginBottom: '0.75rem' }}>
              Ready-to-send formal complaint to your national Data Protection Authority:
            </p>
            <div className="complaint-box">{data.complaint || '—'}</div>
          </div>
        </div>

        <div style={{ textAlign: 'center', padding: '2rem 0' }}>
          <button className="reset-btn" onClick={onReset}>← Scan another site</button>
        </div>

      </div>
    </section>
  )
}
