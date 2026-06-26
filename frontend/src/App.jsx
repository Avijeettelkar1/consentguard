import { useState } from 'react'
import Nav from './components/Nav'
import Hero from './components/Hero'
import Features from './components/Features'
import Scanning from './components/Scanning'
import Results from './components/Results'
import { fetchScan } from './api'

export default function App() {
  const [view, setView] = useState('home')
  const [scanUrl, setScanUrl] = useState('')
  const [results, setResults] = useState(null)
  const [scanError, setScanError] = useState(null)

  const startScan = async (url) => {
    let normalized = url.trim()
    if (!normalized.startsWith('http')) normalized = 'https://' + normalized
    setScanUrl(normalized)
    setScanError(null)
    setResults(null)
    setView('scanning')
    window.scrollTo({ top: 0, behavior: 'smooth' })
    try {
      const data = await fetchScan(normalized)
      setResults(data)
      setView('results')
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (e) {
      setScanError(e.message)
    }
  }

  const goHome = () => {
    setView('home')
    setResults(null)
    setScanError(null)
    setScanUrl('')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <>
      <Nav onLogoClick={goHome} />

      {view === 'home' && (
        <>
          <Hero onScan={startScan} />
          <Features />
          <div className="cta-section">
            <span className="section-tag">Get started</span>
            <h2>Scan your site for free</h2>
            <p>No account. No install. Results in 30 seconds.</p>
            <button
              className="scan-btn"
              style={{ margin: '0 auto', fontSize: '1rem', padding: '0.85rem 2.5rem', borderRadius: 12 }}
              onClick={() => { window.scrollTo({ top: 0, behavior: 'smooth' }); setTimeout(() => document.getElementById('urlInput')?.focus(), 600) }}
            >
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
              </svg>
              Scan a website now
            </button>
          </div>
        </>
      )}

      {view === 'scanning' && <Scanning url={scanUrl} error={scanError} />}
      {view === 'results' && results && <Results data={results} onReset={goHome} />}

      <footer>
        <p>
          ConsentGuard — built for privacy ·{' '}
          <a href="https://github.com/Avijeettelkar1/consentguard" target="_blank" rel="noreferrer">GitHub</a>
        </p>
      </footer>
    </>
  )
}
