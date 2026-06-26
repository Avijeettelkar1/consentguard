export default function Nav({ onLogoClick }) {
  return (
    <nav>
      <div className="nav-logo" onClick={onLogoClick}>
        <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
        ConsentGuard
        <span className="nav-badge">Beta</span>
      </div>
      <div className="nav-links">
        <a href="#howItWorks">How it works</a>
        <a href="https://github.com/Avijeettelkar1/consentguard" target="_blank" rel="noreferrer">GitHub</a>
      </div>
      <button className="nav-cta" onClick={onLogoClick}>Try it free</button>
    </nav>
  )
}
