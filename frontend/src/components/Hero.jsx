import { useRef, useEffect, useState, lazy, Suspense } from 'react'

const ThreeScene = lazy(() => import('./ThreeScene'))

const PHASES = [
  {
    label: 'The problem',
    heading: (
      <>
        Most cookie banners are
        <br />
        <em className="display-italic">lying to your users.</em>
      </>
    ),
    sub: 'Click "Reject All" — trackers fire anyway. We expose it.',
  },
  {
    label: 'The evidence',
    heading: (
      <>
        Trackers fire even
        <br />
        <em className="display-italic">after Reject All.</em>
      </>
    ),
    sub: 'facebook.net · bat.bing.com · segment.com · google-analytics.com',
  },
  {
    label: 'The fix',
    heading: (
      <>
        Your GDPR report,
        <br />
        <em className="display-italic">in 30 seconds.</em>
      </>
    ),
    sub: 'Fine exposure · DPA complaint · Policy fix — all generated automatically.',
  },
]

export default function Hero({ onScan }) {
  const containerRef = useRef()
  const scrollRef = useRef(0)
  const [phase, setPhase] = useState(0)
  const [inputUrl, setInputUrl] = useState('')

  useEffect(() => {
    const onScroll = () => {
      const el = containerRef.current
      if (!el) return
      const total = el.offsetHeight - window.innerHeight
      const scrolled = Math.max(0, -el.getBoundingClientRect().top)
      const sp = Math.min(1, scrolled / total)
      scrollRef.current = sp
      setPhase(sp < 0.38 ? 0 : sp < 0.72 ? 1 : 2)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (inputUrl.trim()) onScan(inputUrl.trim())
  }

  return (
    <div ref={containerRef} style={{ height: '280vh', position: 'relative' }}>
      <div className="sticky-hero">
        <div className="hero-canvas">
          <Suspense fallback={null}>
            <ThreeScene scrollRef={scrollRef} />
          </Suspense>
        </div>
        <div className="hero-overlay" />

        <div className="hero-content">
          <div className="phase-switcher">
            {PHASES.map((p, i) => (
              <div key={i} className={`phase-block${phase === i ? ' active' : ''}`}>
                <span className="phase-label-tag">{p.label}</span>
                <h1 className="display-title">{p.heading}</h1>
                <p className="hero-sub">{p.sub}</p>
              </div>
            ))}
          </div>

          <form className="scan-row" onSubmit={handleSubmit}>
            <span className="scan-prefix">https://</span>
            <input
              id="urlInput"
              className="scan-input"
              placeholder="yourwebsite.com"
              value={inputUrl}
              onChange={(e) => setInputUrl(e.target.value)}
            />
            <button className="scan-btn" type="submit">
              <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
              </svg>
              Scan Now
            </button>
          </form>

          <p className="scan-hint">No login · No install · <span>Results in ~30s</span></p>
        </div>

        <div className="phase-dots">
          {PHASES.map((_, i) => (
            <div key={i} className={`phase-dot${phase === i ? ' active' : ''}`} />
          ))}
        </div>

        <div className="scroll-cue">
          <div className="scroll-cue-line" />
          <span>scroll</span>
        </div>
      </div>
    </div>
  )
}
