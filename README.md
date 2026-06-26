# ConsentGuard

**ConsentGuard** is a GDPR cookie compliance scanner that proves whether a website actually respects your "Reject All" choice — or keeps tracking you anyway.

Most cookie banners are theatre. You click "Reject All" and the website quietly continues firing ad trackers, analytics scripts, and fingerprinting tools in the background. This is a direct violation of GDPR Article 7 (consent must be freely given, specific, informed, and unambiguous) and Article 5(1)(a) (lawfulness of processing). Companies know this and get away with it because nobody checks.

ConsentGuard checks.

---

## What It Does

1. **Opens the target website in an isolated browser sandbox** (Daytona + Playwright). No cookies, no history, clean slate.
2. **Records every network request** the site makes on first load — the "before" snapshot.
3. **Finds and clicks the "Reject All" button** automatically, handling OneTrust, Cookiebot, TrustArc, Didomi, Quantcast, Usercentrics, and custom banners.
4. **Reloads the page and records network requests again** — the "after" snapshot.
5. **Cross-references the "after" requests against Disconnect.me**, an open-source database of 5,000+ known tracking domains (ad networks, analytics, social pixels, fingerprinters).
6. **Fetches the site's cookie policy** and sends everything to Claude (Anthropic's AI) to determine: which trackers are undeclared in the policy? Which ones fire after reject but aren't even mentioned anywhere?
7. **Generates actionable fixes**: the exact paragraph to add to the cookie policy, and step-by-step instructions to reconfigure the consent platform so it actually blocks those scripts.
8. **Estimates the GDPR fine exposure** based on violation count and company size (up to 4% of annual global revenue under GDPR Art. 83).
9. **Drafts a formal complaint letter** to the relevant Data Protection Authority, ready to send.

---

## Why This Matters

GDPR has been in effect since 2018. Cookie consent violations are the #1 category of DPA complaints in Europe. The fines are real:

- Google: €150 million (CNIL, France)
- Meta: €390 million (DPC, Ireland)
- TikTok: €345 million (DPC, Ireland)

But most violations at smaller companies go unchallenged because there's no easy way for users or auditors to prove them. ConsentGuard makes the proof automatic — scan a URL, get a timestamped violation report and a ready-to-file complaint in under 60 seconds.

---

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                   User (browser)                    │
│              frontend/index.html (Vercel)           │
└────────────────────┬────────────────────────────────┘
                     │ POST /scan {url}
┌────────────────────▼────────────────────────────────┐
│              FastAPI Backend (Railway)               │
│                  backend/main.py                    │
└──┬──────────────┬──────────────────┬────────────────┘
   │              │                  │
   ▼              ▼                  ▼
scanner.py    analyzer.py       reporter.py
tracker_db.py  fixer.py
   │
   ▼
┌─────────────────────────────┐
│  Daytona Sandbox            │
│  (isolated Docker env)      │
│  + Playwright (Chromium)    │
│  Visits URL, clicks Reject  │
│  Records network traffic    │
└─────────────────────────────┘
```

### Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Sandbox | [Daytona](https://daytona.io) | Isolated, reproducible browser environment with Playwright pre-installed via snapshot |
| Browser | Playwright (Chromium) | Headless browser automation — clicks banners, intercepts network traffic |
| Tracker DB | [Disconnect.me](https://disconnect.me) | Open-source list of 5,000+ tracking domains with categories and company names |
| AI | Claude claude-sonnet-4-6 (Anthropic) | Policy analysis, violation determination, fix generation, complaint drafting |
| Backend | FastAPI + Python | REST API server |
| Backend Deploy | Railway | Auto-deploy from git push, free tier |
| Frontend | Vanilla HTML/CSS/JS | Single file, zero dependencies, fast |
| Frontend Deploy | Vercel | CDN-distributed, instant deploys |

---

## Scan Flow (Technical Detail)

```
POST /scan {"url": "https://bbc.com"}
    │
    ├─ scanner.py: run_scan(url)
    │      └─ Spins up a Daytona sandbox from pre-built snapshot
    │         (snapshot has Playwright + Chromium already installed — fast)
    │         Playwright opens URL in headless Chromium
    │         Intercepts all network requests → before[]
    │         Tries 15+ CSS selectors to find + click "Reject All"
    │         Detects consent platform (OneTrust / Cookiebot / etc.)
    │         Finds cookie policy URL from page links
    │         Reloads page, intercepts again → after[]
    │         Returns: {before, after, clicked_reject, consent_platform, cookie_policy_url}
    │
    ├─ tracker_db.py: get_tracker_domains()
    │      └─ Downloads Disconnect.me JSON (cached to disk after first call)
    │         Parses into flat {domain → {category, company, data_collected}} map
    │
    ├─ analyzer.py: find_violations(after_requests)
    │      └─ Extracts domain from each URL in after[]
    │         Looks up each domain in tracker DB
    │         Returns list of matched trackers with category + data description
    │
    ├─ analyzer.py: fetch_cookie_policy(cookie_policy_url)
    │      └─ HTTP GET the cookie policy page
    │         Strips HTML tags → plain text (max 8000 chars for Claude)
    │
    ├─ analyzer.py: analyze_violations(violations, policy_text)
    │      └─ Sends to Claude: "these trackers fired after reject, here's the policy text"
    │         Claude returns JSON: which are declared vs undeclared, violation reasons
    │         Returns: {violations[], undeclared[], declared[]}
    │
    ├─ fixer.py: generate_fixes(undeclared, platform, url)
    │      └─ Sends to Claude: undeclared trackers + consent platform name
    │         Claude returns: {policy_fix (HTML), banner_fix (numbered steps)}
    │
    ├─ reporter.py: calculate_exposure(violation_count)
    │      └─ Tiered fine estimate based on GDPR Art. 83 (up to 4% global revenue)
    │         Returns ranges for small/medium/large company + relevant DPA
    │
    ├─ reporter.py: generate_complaint(url, undeclared, exposure)
    │      └─ Claude drafts a formal DPA complaint letter citing Art. 7 + Art. 5(1)(a)
    │
    └─ reporter.py: run_verify_scan(url, block_domains)
           └─ Optional: re-scans with those domains blocked to verify fix works
```

---

## Repository Structure

```
consentguard/
├── CLAUDE.md                ← Team context, API contract, test commands, demo script
├── README.md                ← This file
├── snapshot_setup.py        ← Run once to build the Daytona snapshot (Person 1)
├── railway.toml             ← Railway backend deploy config
├── vercel.json              ← Vercel frontend deploy config
├── backend/
│   ├── main.py              ← FastAPI app, /scan endpoint, mock mode
│   ├── scanner.py           ← Daytona + Playwright scan logic
│   ├── tracker_db.py        ← Disconnect.me tracker database
│   ├── analyzer.py          ← Tracker matching + Claude policy analysis
│   ├── fixer.py             ← Claude fix generation (policy + banner)
│   ├── reporter.py          ← GDPR exposure calculator + complaint letter
│   ├── requirements.txt     ← Python dependencies
│   └── .env.example         ← Environment variable template
└── frontend/
    └── index.html           ← Complete UI (dark mode, zero dependencies)
```

---

## Running Locally

### Prerequisites

- Python 3.12+
- A [Daytona](https://app.daytona.io) account + API key
- An [Anthropic](https://console.anthropic.com) API key

### Setup

```bash
git clone https://github.com/Avijeettelkar1/consentguard.git
cd consentguard

# Install dependencies
pip install -r backend/requirements.txt

# Configure environment
cp backend/.env.example backend/.env
# Edit backend/.env and fill in your API keys
```

### Step 1 — Build the Daytona snapshot (once)

```bash
python snapshot_setup.py
# Takes 2-3 minutes. Copy the printed DAYTONA_SNAPSHOT value into backend/.env
```

### Step 2 — Run the backend

```bash
cd backend
uvicorn main:app --reload --port 8000
```

### Step 3 — Open the frontend

Open `frontend/index.html` in your browser. The `API_URL` at the top of the file points to `http://localhost:8000` by default.

### Mock mode (no Daytona needed)

```bash
cd backend
MOCK=true uvicorn main:app --reload --port 8000
```

This returns a pre-canned response so you can develop the frontend without spending Daytona credits.

---

## Deployment

### Backend → Railway

```bash
cd backend
railway login
railway init
railway up
```

Set environment variables in the Railway dashboard:
- `DAYTONA_API_KEY`
- `ANTHROPIC_API_KEY`
- `DAYTONA_SNAPSHOT`

Copy the Railway URL and update `API_URL` in `frontend/index.html`.

### Frontend → Vercel

```bash
vercel login
vercel --prod
```

---

## API Reference

### `POST /scan`

**Request:**
```json
{ "url": "https://bbc.com" }
```

**Response:**
```json
{
  "url": "https://bbc.com",
  "scan": {
    "clicked_reject": true,
    "consent_platform": "OneTrust",
    "before_count": 6,
    "after_count": 14,
    "violation_count": 9
  },
  "violations": [
    {
      "domain": "facebook.net",
      "declared": false,
      "category": "advertising",
      "data_collected": "Tracks users across websites for ad targeting",
      "violation_reason": "Fires after reject, not listed in cookie policy"
    }
  ],
  "undeclared": [ ... ],
  "declared": [ ... ],
  "fixes": {
    "policy_fix": "<p>We use the following third-party services...</p>",
    "banner_fix": "1. Go to OneTrust dashboard...\n2. ..."
  },
  "verify": {
    "remaining_requests": [],
    "violation_count": 0,
    "clean": true
  },
  "exposure": {
    "violation_count": 3,
    "max_fine_percent": "4% of annual global revenue",
    "estimated_range_small": "€50,000–€200,000",
    "estimated_range_medium": "€200,000–€800,000",
    "estimated_range_large": "€800,000–€4,000,000",
    "relevant_authority": "German Federal Commissioner for Data Protection (BfDI)"
  },
  "complaint": "Dear Federal Commissioner,\n\nI hereby submit a formal complaint..."
}
```

### `GET /health`

Returns `{"status": "ok", "mode": "live"}` — use this to confirm the backend is up before a demo.

---

## Team

Built at [Hackathon Name] in 5 hours.

- **Person 1 — Sandbox Engineer:** Daytona snapshot, Playwright scanner, tracker database
- **Person 2 — Claude Engineer:** AI-powered violation analysis, fix generation, GDPR reporting
- **Person 3 — Frontend + Integration:** FastAPI app, UI, deployment

See `CLAUDE.md` for the full team coordination guide, branching strategy, and hour-by-hour plan.
