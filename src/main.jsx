import React, { useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  BadgeCheck,
  BarChart3,
  Check,
  ChevronDown,
  Cookie,
  ExternalLink,
  FileText,
  Gauge,
  Globe2,
  Loader2,
  Lock,
  RefreshCw,
  Search,
  ShieldCheck,
  ShieldQuestion,
  Sparkles,
  TriangleAlert,
  X,
} from "lucide-react";
import "./styles.css";

const DEFAULT_API_URL = "https://consentguard-production.up.railway.app";

const initialExamples = [
  "https://www.check24.de/",
  "https://www.bbc.com/",
  "https://www.daytona.io/",
];

function App() {
  const [url, setUrl] = useState(initialExamples[0]);
  const [status, setStatus] = useState("Ready to run a live consent scan.");
  const [health, setHealth] = useState("idle");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const apiUrl = useMemo(() => {
    const override = new URLSearchParams(window.location.search).get("api");
    return (override || DEFAULT_API_URL).replace(/\/$/, "");
  }, []);

  async function checkApi() {
    setHealth("checking");
    setStatus("Checking scanner backend...");
    setError("");
    try {
      const response = await fetch(`${apiUrl}/health`);
      if (!response.ok) throw new Error("Backend did not respond correctly.");
      const data = await response.json();
      setHealth(data.daytona_configured ? "ok" : "warn");
      setStatus(data.daytona_configured ? "Scanner backend is online." : "Backend is online, but the browser sandbox is not configured.");
    } catch (err) {
      setHealth("bad");
      setStatus("Backend check failed.");
      setError(friendlyError(err.message));
    }
  }

  async function runScan(event) {
    event?.preventDefault();
    if (!url.trim()) {
      setError("Enter a website URL first.");
      return;
    }

    setLoading(true);
    setResult(null);
    setError("");
    setStatus("Opening clean browsers and testing both consent choices...");

    try {
      const response = await fetch(`${apiUrl}/scan`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim() }),
      });
      if (!response.ok) throw new Error(await response.text());
      const data = await response.json();
      setResult(data);
      setStatus("Scan complete.");
    } catch (err) {
      setStatus("Scan failed.");
      setError(friendlyError(err.message));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="app-shell">
      <TopBar health={health} onHealth={checkApi} />
      <main>
        <section className="workspace">
          <div className="scan-card">
            <div className="scan-copy">
              <div className="eyebrow"><Sparkles size={16} /> Live privacy scanner</div>
              <h1>Find what still tracks visitors after they reject cookies.</h1>
              <p>
                ConsentGuard tests the accept and reject paths in real browsers, compares the traffic, and explains the result without burying people in compliance jargon.
              </p>
            </div>

            <form className="scan-form" onSubmit={runScan}>
              <div className="input-wrap">
                <Globe2 size={20} />
                <input value={url} onChange={(event) => setUrl(event.target.value)} placeholder="https://example.com" />
              </div>
              <button className="primary-button" disabled={loading}>
                {loading ? <Loader2 className="spin" size={18} /> : <Search size={18} />}
                {loading ? "Scanning" : "Scan site"}
              </button>
            </form>

            <div className="example-row">
              {initialExamples.map((item) => (
                <button key={item} type="button" onClick={() => setUrl(item)}>{domainName(item)}</button>
              ))}
            </div>

            <div className="status-line">
              <span className={`status-dot ${loading ? "pulse" : health}`}></span>
              <span>{status}</span>
            </div>

            {error ? <div className="error-box"><AlertTriangle size={18} /> {error}</div> : null}
          </div>

          <div className="preview-card">
            <div className="browser-frame">
              <div className="browser-top">
                <span></span><span></span><span></span>
                <div>consentguard.live/scan</div>
              </div>
              <div className="browser-body">
                <div className="scan-visual">
                  <div className="shield-orbit"><ShieldCheck size={56} /></div>
                  <div className="signal-card one"><Cookie size={18} /> Cookies</div>
                  <div className="signal-card two"><Activity size={18} /> Requests</div>
                  <div className="signal-card three"><Lock size={18} /> Consent</div>
                </div>
              </div>
            </div>
            <div className="mini-grid">
              <MiniFact icon={BadgeCheck} label="Accept path" value="Measured" />
              <MiniFact icon={ShieldQuestion} label="Reject path" value="Compared" />
              <MiniFact icon={FileText} label="Report" value="Plain English" />
            </div>
          </div>
        </section>

        {loading ? <LoadingPanel /> : null}
        {result ? <Report data={result} /> : <EmptyState />}
      </main>
    </div>
  );
}

function TopBar({ health, onHealth }) {
  const label = health === "ok" ? "Backend online" : health === "bad" ? "Backend issue" : health === "checking" ? "Checking" : "Check backend";
  return (
    <header className="topbar">
      <div className="brand">
        <div className="brand-mark"><ShieldCheck size={22} /></div>
        <div>
          <strong>ConsentGuard</strong>
          <span>Consent scanning for real websites</span>
        </div>
      </div>
      <button className="ghost-button" onClick={onHealth}>
        {health === "checking" ? <Loader2 className="spin" size={17} /> : <RefreshCw size={17} />}
        {label}
      </button>
    </header>
  );
}

function LoadingPanel() {
  return (
    <section className="loading-panel">
      <div>
        <strong>Running two clean browser sessions</strong>
        <span>One accepts cookies, one rejects them. We compare the difference when both finish.</span>
      </div>
      <div className="loading-track"><div></div></div>
    </section>
  );
}

function EmptyState() {
  return (
    <section className="empty-state">
      <div className="empty-icon"><Gauge size={28} /></div>
      <div>
        <h2>Your scan report will appear here.</h2>
        <p>Start with a site that shows a cookie banner. The report will highlight what changed, what kept tracking, and what needs review.</p>
      </div>
    </section>
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
  const score = privacyScore(scan, confirmed, review, afterReject, tone);

  return (
    <div className="report">
      <section className={`verdict-card ${tone}`}>
        <div>
          <div className="verdict-label">{verdictLabel(tone)}</div>
          <h2>{plain.status || "Scan result"}</h2>
          <p>{plain.result}</p>
          <p className="muted-text">{plain.comparison}</p>
          <p className="takeaway">{plain.user_takeaway}</p>
        </div>
        <div className="score-ring" style={{ "--score": Number(score) || 42 }}>
          <strong>{score}</strong>
          <span>privacy signal</span>
        </div>
      </section>

      <section className="metric-grid">
        <Metric icon={Check} label="Accept test" value={scan.clicked_accept ? "Completed" : "Missed"} tone={scan.clicked_accept ? "good" : "warn"} />
        <Metric icon={scan.clicked_reject ? Check : X} label="Reject test" value={scan.clicked_reject ? "Completed" : "Missed"} tone={scan.clicked_reject ? "good" : "warn"} />
        <Metric icon={BarChart3} label="Tracking blocked" value={blocked} tone={blocked ? "good" : "neutral"} />
        <Metric icon={TriangleAlert} label="Tracking after reject" value={afterReject} tone={afterReject ? "bad" : "good"} />
      </section>

      <section className="report-grid">
        <div className="main-column">
          <Panel title="What changed after consent?" subtitle="The easiest way to see if reject worked is to compare both paths.">
            <DomainSection title="Appeared only after accepting" domains={comparison.accept_only_domains || []} empty="No extra services appeared only after accept." />
            <DomainSection title="Appeared only after rejecting" domains={comparison.reject_only_domains || []} empty="No extra services appeared only after reject." />
          </Panel>

          <Panel title="Tracking evidence" subtitle="This separates real tracking events from services that merely loaded.">
            <EvidenceTable tagAudit={tagAudit} />
          </Panel>

          <Panel title="Cookies after reject" subtitle="We show names and domains, not values, because values can identify people.">
            <CookieTable cookies={riskyCookies} />
          </Panel>
        </div>

        <aside className="side-column">
          <Panel title="Consent controls" subtitle="Which banner buttons the scanner clicked.">
            <ConsentStep label="Accept all" clicked={scan.clicked_accept} selector={scan.accept_clicked_selector} />
            <ConsentStep label="Reject all" clicked={scan.clicked_reject} selector={scan.reject_clicked_selector} />
          </Panel>

          <Panel title="Recommended action" subtitle={actionSummary(confirmed, review)}>
            <details className="details-card">
              <summary>View fix notes <ChevronDown size={16} /></summary>
              <pre>{fixText(data.fixes)}</pre>
            </details>
          </Panel>

          <Panel title="Risk snapshot" subtitle="A quick compliance-facing view.">
            <RiskRow label="Confirmed issues" value={confirmed} tone={confirmed ? "bad" : "good"} />
            <RiskRow label="Needs review" value={review} tone={review ? "warn" : "good"} />
            <details className="details-card">
              <summary>View risk details <ChevronDown size={16} /></summary>
              <pre>{JSON.stringify(data.exposure || {}, null, 2)}</pre>
            </details>
          </Panel>

          <Panel title="Advanced report" subtitle="For privacy teams and developers.">
            <details className="details-card">
              <summary>Raw comparison <ChevronDown size={16} /></summary>
              <pre>{rawComparison(comparison)}</pre>
            </details>
            <details className="details-card">
              <summary>Tag-level notes <ChevronDown size={16} /></summary>
              <pre>{plainLanguageVerdict(tagAudit)}</pre>
            </details>
            <details className="details-card">
              <summary>Draft complaint <ChevronDown size={16} /></summary>
              <pre>{data.complaint || ""}</pre>
            </details>
          </Panel>
        </aside>
      </section>
    </div>
  );
}

function MiniFact({ icon: Icon, label, value }) {
  return <div className="mini-fact"><Icon size={18} /><span>{label}</span><strong>{value}</strong></div>;
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
      <div className="panel-head">
        <h3>{title}</h3>
        {subtitle ? <p>{subtitle}</p> : null}
      </div>
      {children}
    </section>
  );
}

function DomainSection({ title, domains, empty }) {
  return (
    <div className="domain-section">
      <h4>{title}</h4>
      <div className="chip-row">
        {domains.length ? domains.slice(0, 14).map((item) => (
          <span className="chip" key={`${title}-${item.domain}`}>{item.domain}<strong>{item.count}</strong></span>
        )) : <div className="soft-empty">{empty}</div>}
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

  if (!rows.length) return <div className="soft-empty">No tracking evidence was detected in this scan.</div>;

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
  if (!cookies.length) return <div className="soft-empty">No concerning cookies were detected after rejection.</div>;
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

function ConsentStep({ label, clicked, selector }) {
  return (
    <div className="consent-step">
      <span className={`step-icon ${clicked ? "good" : "warn"}`}>{clicked ? <Check size={17} /> : <AlertTriangle size={17} />}</span>
      <div>
        <strong>{label}</strong>
        <p>{selector ? `Clicked: ${cleanSelector(selector)}` : "No matching button was clicked."}</p>
      </div>
    </div>
  );
}

function RiskRow({ label, value, tone }) {
  return <div className="risk-row"><span>{label}</span><strong className={tone}>{value}</strong></div>;
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
  if (confirmed) return "Put the listed trackers behind real opt-in consent, then scan again.";
  if (review) return "Review supporting services and confirm they are not sending tracking events after reject.";
  return "No urgent fix was suggested by this scan.";
}

function fixText(fixes = {}) {
  return [stripHtml(fixes.policy_fix || "No policy fix needed."), fixes.banner_fix || "No banner fix needed."].join("\n\n");
}

function rawComparison(comparison = {}) {
  return [
    `Extra activity after accepting: ${comparison.accept_only_request_count ?? 0} request(s)`,
    `Activity only after rejecting: ${comparison.reject_only_request_count ?? 0} request(s)`,
    `Activity in both tests: ${comparison.common_request_count ?? 0} request(s)`,
    "",
    "Services only after accepting:",
    formatDomains(comparison.accept_only_domains || []),
    "",
    "Services only after rejecting:",
    formatDomains(comparison.reject_only_domains || []),
    "",
    "Cookies only after accepting:",
    formatList(comparison.accept_only_cookies || []),
    "",
    "Cookies only after rejecting:",
    formatList(comparison.reject_only_cookies || []),
  ].join("\n");
}

function plainLanguageVerdict(audit = {}) {
  switch (audit.verdict) {
    case "non_essential_payloads_after_reject":
      return "Problem found: advertising or analytics events were still sent after rejecting cookies.";
    case "gtm_loader_after_reject_only":
      return "Review recommended: a tag manager still loaded after rejection, but it did not send advertising or analytics events in this scan.";
    case "no_tracking_payloads_after_reject":
      return "Looks clean: no advertising or analytics events were seen after rejection.";
    case "consent_controls_not_clicked":
      return "Inconclusive: the scanner could not click both cookie choices.";
    default:
      return audit.summary || "No tag-level note available.";
  }
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
    return new URL(value).hostname.replace(/^www\./, "");
  } catch {
    return value;
  }
}

function cleanSelector(value) {
  return String(value || "").replace(/^dynamic:/, "").slice(0, 92);
}

function formatDomains(domains) {
  if (!domains.length) return "- none";
  return domains.map((item) => `- ${item.domain} (${item.count})`).join("\n");
}

function formatList(values) {
  if (!values.length) return "- none";
  return values.slice(0, 30).map((value) => `- ${value}`).join("\n");
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
