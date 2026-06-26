import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  BadgeCheck,
  Check,
  ChevronDown,
  Cookie,
  ExternalLink,
  FileText,
  Globe2,
  Languages,
  Loader2,
  Lock,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  X,
  XCircle,
} from "lucide-react";
import ConsentScene from "./ConsentScene.jsx";
import "./styles.css";

const DEFAULT_API_URL = "https://consentguard-production.up.railway.app";
const examples = ["check24.de", "bbc.com", "daytona.io"];
const scanSteps = [
  "Creating isolated Daytona sandbox",
  "Launching clean browser",
  "Testing Accept all path",
  "Testing Reject all path",
  "Comparing trackers and cookies",
  "Preparing plain-English report",
];

function App() {
  const [url, setUrl] = useState("");
  const [language, setLanguage] = useState("en");
  const [cookieDialog, setCookieDialog] = useState(() => !localStorage.getItem("cg-cookie-choice"));
  const [loading, setLoading] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const apiUrl = useMemo(() => {
    const override = new URLSearchParams(window.location.search).get("api");
    return (override || DEFAULT_API_URL).replace(/\/$/, "");
  }, []);
  const sceneTone = result ? reportToneFromData(result) : error ? "bad" : loading ? "ready" : "ready";

  useEffect(() => {
    if (!loading) return undefined;
    const timer = window.setInterval(() => {
      setStepIndex((current) => Math.min(current + 1, scanSteps.length - 1));
    }, 1600);
    return () => window.clearInterval(timer);
  }, [loading]);

  async function runScan(event) {
    event?.preventDefault();
    if (!url.trim()) {
      setError("Enter a website URL first.");
      return;
    }

    setLoading(true);
    setStepIndex(0);
    setResult(null);
    setError("");

    try {
      const response = await fetch(`${apiUrl}/scan`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim() }),
      });
      if (!response.ok) throw new Error(await response.text());
      const data = await response.json();
      setResult(data);
      setStepIndex(scanSteps.length - 1);
    } catch (err) {
      setError(friendlyError(err.message));
    } finally {
      setLoading(false);
    }
  }

  function chooseCookie(choice) {
    localStorage.setItem("cg-cookie-choice", choice);
    setCookieDialog(false);
  }

  return (
    <div className="trackable-shell">
      <header className="site-header">
        <button className="brand-button" type="button">
          <span className="brand-spark"><Sparkles size={18} /></span>
          ConsentGuard
        </button>
        <LanguageToggle language={language} setLanguage={setLanguage} />
      </header>

      <main className="landing-main">
        <section className="hero">
          <div className="sandbox-pill">
            <ShieldCheck size={18} />
            <span>Powered by isolated Daytona sandboxes</span>
          </div>

          <h1>
            See what every website
            <span> tracks after consent.</span>
          </h1>
          <p>Scan any website to reveal trackers, cookies, and network activity after Accept and Reject choices.</p>

          <form className="scanner-bar" onSubmit={runScan}>
            <Globe2 size={21} />
            <input
              value={url}
              onChange={(event) => setUrl(event.target.value)}
              placeholder="Enter a website URL — try check24.de"
              autoComplete="url"
            />
            <button disabled={loading || !url.trim()} type="submit">
              {loading ? "Scanning" : "Scan"}
              {loading ? <Loader2 className="spin" size={18} /> : <ArrowRight size={18} />}
            </button>
          </form>

          <div className="try-row">
            <span>Try:</span>
            {examples.map((example) => (
              <button key={example} type="button" onClick={() => setUrl(example)}>{example}</button>
            ))}
          </div>

          {error ? <div className="error-banner"><AlertTriangle size={18} /> {error}</div> : null}
        </section>

        <section className="sandbox-stage">
          <ConsentScene tone={sceneTone} loading={loading} />
          <SandboxConnection loading={loading} stepIndex={stepIndex} result={result} />
        </section>

        {result ? <Report data={result} /> : null}
      </main>

      <Footer language={language} setLanguage={setLanguage} />
      {cookieDialog ? <CookieDialog onChoice={chooseCookie} /> : null}
    </div>
  );
}

function LanguageToggle({ language, setLanguage }) {
  return (
    <div className="language-toggle" role="group" aria-label="Language">
      <Languages size={16} />
      {["en", "de"].map((item) => (
        <button
          key={item}
          type="button"
          aria-pressed={language === item}
          onClick={() => setLanguage(item)}
        >
          {item}
        </button>
      ))}
    </div>
  );
}

function SandboxConnection({ loading, stepIndex, result }) {
  const scanner = result?.scan?.scanner || "Daytona sandbox";
  return (
    <div className="connection-card">
      <div className="connection-head">
        <div>
          <span>Sandbox connection</span>
          <strong>{loading ? "Connecting Daytona" : result ? "Scan finished" : "Ready"}</strong>
        </div>
        <div className={`connection-dot ${loading ? "pulse" : result ? "ok" : ""}`} />
      </div>
      <div className="step-list">
        {scanSteps.map((step, index) => {
          const complete = result || index < stepIndex || (!loading && index === 0);
          const current = loading && index === stepIndex;
          return (
            <div className={`step-item ${complete ? "complete" : ""} ${current ? "current" : ""}`} key={step}>
              <span>{complete ? <Check size={15} /> : current ? <Loader2 className="spin" size={15} /> : index + 1}</span>
              <p>{step}</p>
            </div>
          );
        })}
      </div>
      <div className="runtime-line">
        <Lock size={15} />
        <span>{result ? `Scanner used: ${scanner}` : "Each scan runs in an isolated, short-lived browser sandbox."}</span>
      </div>
    </div>
  );
}

function Report({ data }) {
  const scan = data.scan || {};
  const plain = data.plain_summary || {};
  const counts = plain.plain_counts || {};
  const comparison = data.comparison || {};
  const tagAudit = data.tag_audit || {};
  const cookieInfo = data.cookie_transparency || {};
  const riskyCookies = cookieInfo.risky_after_reject || [];
  const confirmed = scan.violation_count ?? (data.undeclared || []).length;
  const review = scan.needs_review_count ?? (data.needs_review || []).length;
  const afterReject = counts.tracking_events_after_reject ?? tagAudit.reject_payload_count ?? 0;
  const blocked = counts.tracking_events_blocked_by_reject ?? 0;
  const tone = reportTone(scan, confirmed, review, afterReject, plain.status);

  return (
    <section className="results-panel">
      <div className={`verdict-strip ${tone}`}>
        <div>
          <span>{verdictLabel(tone)}</span>
          <h2>{plain.status || "Scan result"}</h2>
          <p>{plain.result}</p>
          <strong>{plain.user_takeaway}</strong>
        </div>
        <div className="result-score">
          <strong>{privacyScore(scan, confirmed, review, afterReject, tone)}</strong>
          <span>privacy signal</span>
        </div>
      </div>

      <div className="metric-grid">
        <Metric icon={scan.clicked_accept ? Check : XCircle} label="Accept clicked" value={scan.clicked_accept ? "Yes" : "No"} tone={scan.clicked_accept ? "good" : "warn"} />
        <Metric icon={scan.clicked_reject ? Check : XCircle} label="Reject clicked" value={scan.clicked_reject ? "Yes" : "No"} tone={scan.clicked_reject ? "good" : "warn"} />
        <Metric icon={Activity} label="Blocked after reject" value={blocked} tone={blocked ? "good" : "neutral"} />
        <Metric icon={AlertTriangle} label="Tracking after reject" value={afterReject} tone={afterReject ? "bad" : "good"} />
      </div>

      <div className="report-grid">
        <Panel title="What changed?" subtitle="Top services observed only in one consent path.">
          <DomainBlock title="Only after accepting" domains={comparison.accept_only_domains || []} />
          <DomainBlock title="Only after rejecting" domains={comparison.reject_only_domains || []} />
        </Panel>
        <Panel title="Tracking evidence" subtitle="Real event payloads are separated from tag-manager loaders.">
          <EvidenceTable tagAudit={tagAudit} />
        </Panel>
        <Panel title="Cookies after reject" subtitle="Cookie values are never displayed.">
          <CookieTable cookies={riskyCookies} />
        </Panel>
        <Panel title="Recommended action" subtitle={actionSummary(confirmed, review)}>
          <details>
            <summary>View full fix notes <ChevronDown size={16} /></summary>
            <pre>{fixText(data.fixes)}</pre>
          </details>
        </Panel>
      </div>
    </section>
  );
}

function Metric({ icon: Icon, label, value, tone }) {
  return (
    <div className={`metric-card ${tone}`}>
      <Icon size={20} />
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function Panel({ title, subtitle, children }) {
  return (
    <section className="panel">
      <h3>{title}</h3>
      <p>{subtitle}</p>
      {children}
    </section>
  );
}

function DomainBlock({ title, domains }) {
  return (
    <div className="domain-block">
      <h4>{title}</h4>
      <div className="chip-row">
        {domains.length ? domains.slice(0, 10).map((item) => (
          <span className="chip" key={`${title}-${item.domain}`}>{item.domain}<strong>{item.count}</strong></span>
        )) : <div className="empty-soft">None observed.</div>}
      </div>
    </div>
  );
}

function EvidenceTable({ tagAudit }) {
  const rows = [
    ...(tagAudit.still_firing_after_reject || []).map((item) => ({ ...item, bucket: "after reject" })),
    ...(tagAudit.loader_evidence_after_reject || []).map((item) => ({ ...item, bucket: "loader after reject" })),
    ...(tagAudit.blocked_by_reject || []).slice(0, 10).map((item) => ({ ...item, bucket: "blocked by reject" })),
  ];
  if (!rows.length) return <div className="empty-soft">No tracking evidence was detected.</div>;
  return (
    <div className="table-wrap">
      <table>
        <thead><tr><th>Finding</th><th>Service</th><th>Meaning</th><th>Status</th></tr></thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={`${row.domain}-${row.bucket}-${index}`}>
              <td>{humanBucket(row.bucket)}</td>
              <td><code>{row.domain || ""}</code></td>
              <td>{humanTagDetail(row)}</td>
              <td><span className={`pill ${toneForBucket(row.bucket)}`}>{humanTagStatus(row.bucket)}</span></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function CookieTable({ cookies }) {
  if (!cookies.length) return <div className="empty-soft">No concerning cookies were detected after rejection.</div>;
  return (
    <div className="table-wrap">
      <table>
        <thead><tr><th>Cookie</th><th>Website</th><th>Concern</th><th>Why it matters</th></tr></thead>
        <tbody>
          {cookies.map((cookie) => (
            <tr key={`${cookie.domain}-${cookie.name}`}>
              <td><code>{cookie.name}</code></td>
              <td><code>{cookie.domain}</code></td>
              <td><span className={`pill ${cookie.severity === "high" ? "bad" : "warn"}`}>{humanSeverity(cookie.severity)}</span></td>
              <td>{cookie.reason}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Footer({ language, setLanguage }) {
  return (
    <footer className="site-footer">
      <span>© 2026 ConsentGuard · Privacy intelligence</span>
      <nav>
        <a href="#imprint">Imprint</a>
        <a href="#privacy">Privacy</a>
        <a href="#terms">Terms</a>
        <a href="#cookies">Cookies</a>
      </nav>
      <div className="footer-right">
        <LanguageToggle language={language} setLanguage={setLanguage} />
        <span><ShieldCheck size={15} /> Ephemeral Daytona sandboxes</span>
      </div>
    </footer>
  );
}

function CookieDialog({ onChoice }) {
  return (
    <div className="cookie-overlay" role="dialog" aria-modal="true" aria-label="Cookie settings">
      <div className="cookie-modal">
        <div className="cookie-head">
          <div className="cookie-icon"><Cookie size={22} /></div>
          <div>
            <h3>Cookie settings</h3>
            <p>Privacy Preferences</p>
          </div>
          <button type="button" aria-label="Dismiss" onClick={() => onChoice("dismiss")}>
            <X size={18} />
          </button>
        </div>
        <p>
          We use cookies to optimize this product experience, analyze traffic, and improve scans. Choose your preferences below.
          <a href="#cookies"> Cookies <ExternalLink size={14} /></a>
        </p>
        <div className="cookie-actions">
          <button type="button" onClick={() => onChoice("accept")}>Accept all</button>
          <button type="button" onClick={() => onChoice("reject")}>Reject all</button>
          <button type="button" onClick={() => onChoice("customize")}><SlidersHorizontal size={16} /> Customize settings</button>
        </div>
      </div>
    </div>
  );
}

function reportToneFromData(data) {
  const scan = data.scan || {};
  const plain = data.plain_summary || {};
  const counts = plain.plain_counts || {};
  const tagAudit = data.tag_audit || {};
  const confirmed = scan.violation_count ?? (data.undeclared || []).length;
  const review = scan.needs_review_count ?? (data.needs_review || []).length;
  const afterReject = counts.tracking_events_after_reject ?? tagAudit.reject_payload_count ?? 0;
  return reportTone(scan, confirmed, review, afterReject, plain.status);
}

function reportTone(scan, confirmed, review, afterReject, status) {
  const lower = String(status || "").toLowerCase();
  if (!scan.clicked_accept || !scan.clicked_reject) return "warn";
  if (confirmed || afterReject || lower.includes("problem")) return "bad";
  if (review || lower.includes("review")) return "warn";
  return "good";
}

function privacyScore(scan, confirmed, review, afterReject, tone) {
  if (!scan.clicked_accept || !scan.clicked_reject) return "--";
  let score = 94 - Math.min(confirmed * 18, 56) - Math.min(afterReject * 12, 42) - Math.min(review * 7, 24);
  if (tone === "warn") score = Math.min(score, 76);
  if (tone === "bad") score = Math.min(score, 42);
  return Math.max(score, 10);
}

function verdictLabel(tone) {
  return tone === "bad" ? "Action needed" : tone === "warn" ? "Review recommended" : "Looks good";
}

function actionSummary(confirmed, review) {
  if (confirmed) return "Move the listed services behind explicit opt-in consent, then scan again.";
  if (review) return "Review supporting services and confirm they are not sending tracking events after rejection.";
  return "No urgent fix was suggested by this scan.";
}

function fixText(fixes = {}) {
  return [stripHtml(fixes.policy_fix || "No policy fix needed."), fixes.banner_fix || "No banner fix needed."].join("\n\n");
}

function humanBucket(bucket) {
  return {
    "after reject": "Still active after reject",
    "loader after reject": "Loaded after reject",
    "blocked by reject": "Blocked by reject",
  }[bucket] || "Observed";
}

function humanTagStatus(bucket) {
  return {
    "after reject": "Potential problem",
    "loader after reject": "Review",
    "blocked by reject": "Good",
  }[bucket] || "Observed";
}

function toneForBucket(bucket) {
  return bucket === "after reject" ? "bad" : bucket === "blocked by reject" ? "good" : "warn";
}

function humanTagDetail(item) {
  if (item.event_name) return `${item.event_name}${item.target_id ? ` / ${item.target_id}` : ""}`;
  if (item.container_id) return `Tag manager ${item.container_id}`;
  if (item.target_id) return item.target_id;
  return "Observed by the browser scan.";
}

function humanSeverity(severity) {
  return { high: "High concern", medium: "Medium concern", low: "Low concern" }[severity] || "Review";
}

function domainName(value) {
  try {
    const normalized = value.startsWith("http") ? value : `https://${value}`;
    return new URL(normalized).hostname.replace(/^www\./, "");
  } catch {
    return value;
  }
}

function stripHtml(value) {
  const div = document.createElement("div");
  div.innerHTML = value;
  return div.textContent || div.innerText || "";
}

function friendlyError(message) {
  if (/failed to fetch|network/i.test(message)) return "The frontend could not reach the backend.";
  if (/timeout/i.test(message)) return "The browser scan took too long.";
  return message;
}

createRoot(document.getElementById("root")).render(<App />);
