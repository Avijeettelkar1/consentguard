const API_URL =
  window.location.hostname === 'localhost' || window.location.protocol === 'file:'
    ? 'http://localhost:8000'
    : 'https://consentguard-backend-production.up.railway.app'

export async function fetchScan(url) {
  const res = await fetch(`${API_URL}/scan`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url }),
  })
  if (!res.ok) {
    const detail = await res.text().catch(() => 'Unknown error')
    throw new Error(detail || `Server error ${res.status}`)
  }
  return res.json()
}

export async function fetchHealth() {
  const res = await fetch(`${API_URL}/health`)
  return res.json()
}
