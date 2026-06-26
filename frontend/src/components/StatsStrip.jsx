const SITES = ['bbc.com','cnn.com','nytimes.com','theguardian.com','forbes.com','reddit.com',
  'tripadvisor.com','businessinsider.com','dailymail.co.uk','vice.com','buzzfeed.com','huffpost.com']

const STATS = [
  { value: '6,324', label: 'Tracker domains in database', color: 'var(--accent)' },
  { value: '~73%',  label: 'Sites still fire trackers after Reject All', color: 'var(--red)' },
  { value: 'Art. 7', label: 'GDPR article we prove violated', color: 'var(--text)' },
  { value: '€20M',  label: 'Maximum fine under GDPR Art. 83', color: 'var(--yellow)' },
]

export default function StatsStrip() {
  const doubled = [...SITES, ...SITES]

  return (
    <>
      <div className="marquee-section">
        <div className="marquee-label">GDPR violations detected on</div>
        <div className="marquee-outer">
          <div className="marquee-track">
            {doubled.map((site, i) => (
              <span className="marquee-item" key={i}>
                <span className="marquee-dot" />
                {site}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="stats-section">
        <div className="stats-grid">
          {STATS.map(({ value, label, color }) => (
            <div className="stat-item" key={label}>
              <div className="stat-value" style={{ color }}>{value}</div>
              <div className="stat-label">{label}</div>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
