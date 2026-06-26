const VIOLATIONS = [
  { domain: 'facebook.net',    cat: 'advertising', status: 'UNDECLARED', color: 'var(--red)' },
  { domain: 'bat.bing.com',    cat: 'advertising', status: 'UNDECLARED', color: 'var(--red)' },
  { domain: 'ads-twitter.com', cat: 'advertising', status: 'UNDECLARED', color: 'var(--red)' },
  { domain: 'segment.com',     cat: 'analytics',   status: 'UNDECLARED', color: 'var(--red)' },
  { domain: 'google-analytics.com', cat: 'analytics', status: 'DECLARED', color: 'var(--green)' },
]

export default function ProductPreview() {
  return (
    <div className="product-preview-wrap">
      <div className="product-preview-card">
        <div className="preview-bar">
          <span className="preview-dot r" />
          <span className="preview-dot y" />
          <span className="preview-dot g" />
          <span className="preview-title">ConsentGuard — Scan complete</span>
        </div>
        <div className="preview-body">
          <div className="preview-header-row">
            <div className="preview-verdict">
              <span className="preview-verdict-dot" />
              GDPR violation detected on bbc.com
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <span className="preview-badge red">4 undeclared</span>
              <span className="preview-badge purple">OneTrust</span>
              <span className="preview-badge green">Reject clicked ✓</span>
            </div>
          </div>

          <table className="preview-table">
            <thead>
              <tr>
                <th>Domain</th>
                <th>Category</th>
                <th>Company</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {VIOLATIONS.map((v) => (
                <tr key={v.domain}>
                  <td><span className="preview-domain">{v.domain}</span></td>
                  <td><span className="preview-cat">{v.cat}</span></td>
                  <td style={{ color: 'var(--text2)', fontSize: '0.78rem' }}>
                    {v.domain === 'facebook.net' ? 'Meta' :
                     v.domain === 'bat.bing.com' ? 'Microsoft' :
                     v.domain === 'ads-twitter.com' ? 'X / Twitter' :
                     v.domain === 'segment.com' ? 'Twilio Segment' : 'Google'}
                  </td>
                  <td>
                    <span style={{ fontSize: '0.65rem', fontWeight: 700, color: v.color, fontFamily: 'var(--mono)', letterSpacing: '0.04em' }}>
                      {v.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="preview-footer">
            <div className="preview-stat">
              <div className="preview-stat-val" style={{ color: 'var(--red)' }}>4</div>
              <div className="preview-stat-label">Undeclared trackers</div>
            </div>
            <div className="preview-stat">
              <div className="preview-stat-val" style={{ color: 'var(--yellow)' }}>€200k–€800k</div>
              <div className="preview-stat-label">GDPR fine exposure</div>
            </div>
            <div className="preview-stat">
              <div className="preview-stat-val" style={{ color: 'var(--green)' }}>Ready</div>
              <div className="preview-stat-label">DPA complaint letter</div>
            </div>
            <div>
              <span className="preview-badge purple" style={{ fontSize: '0.72rem', padding: '0.35rem 0.75rem' }}>
                Full report generated ✓
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
