import { Icons } from "@/components/ui/icons";
import { cn } from "@/lib/utils";

const scanSteps = [
  { label: "Opening Daytona sandbox", icon: Icons.globe },
  { label: "Clicking Reject All", icon: Icons.click },
  { label: "Capturing network traffic", icon: Icons.network },
  { label: "Matching trackers", icon: Icons.radar },
  { label: "Generating report", icon: Icons.fileCheck }
];

const requests = [
  { host: "analytics.vendor.io", status: "undeclared", risk: "High" },
  { host: "ads.measure.net", status: "blocked late", risk: "High" },
  { host: "cdn.product.app", status: "allowed", risk: "Low" }
];

export function ScanPreviewMockup({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-lg border border-white/12 bg-slate-950/70 p-4 shadow-2xl shadow-emerald-950/40 backdrop-blur-2xl",
        className
      )}
    >
      <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(16,185,129,0.12),transparent_42%,rgba(20,184,166,0.08))]" />
      <div className="relative">
        <div className="mb-4 flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-emerald-300/15 text-emerald-200">
              <Icons.shield className="h-4 w-4" />
            </span>
            <div>
              <p className="text-sm font-semibold text-white">ConsentGuard Audit</p>
              <p className="text-xs text-emerald-100/60">daytona-sandbox://audit</p>
            </div>
          </div>
          <div className="rounded-full border border-red-300/25 bg-red-400/10 px-2.5 py-1 text-xs font-semibold text-red-200">
            High Risk
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="space-y-2">
            {scanSteps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.label}
                  className="flex items-center gap-3 rounded-md border border-white/10 bg-white/[0.04] p-3"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-emerald-300/10 text-emerald-200">
                    <Icon className="h-4 w-4" />
                  </span>
                  <span className="text-sm text-emerald-50">{step.label}</span>
                  <span className="ml-auto text-xs text-emerald-200/70">
                    {index < 4 ? "done" : "live"}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="rounded-lg border border-white/10 bg-black/30 p-3">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-100/70">
                Network Requests
              </p>
              <span className="flex items-center gap-1 text-xs text-emerald-200">
                <Icons.activity className="h-3.5 w-3.5" />
                124 captured
              </span>
            </div>
            <div className="space-y-2">
              {requests.map((request) => (
                <div
                  key={request.host}
                  className="grid grid-cols-[1fr_auto] gap-3 rounded-md border border-white/8 bg-white/[0.035] p-3"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-white">
                      {request.host}
                    </p>
                    <p className="text-xs text-emerald-100/55">
                      {request.status}
                    </p>
                  </div>
                  <span
                    className={cn(
                      "self-center rounded-full px-2 py-1 text-xs font-semibold",
                      request.risk === "Low"
                        ? "bg-emerald-300/10 text-emerald-200"
                        : "bg-red-400/10 text-red-200"
                    )}
                  >
                    {request.risk}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-3 rounded-md border border-emerald-300/15 bg-emerald-300/10 p-3 text-sm text-emerald-50">
              34 trackers are absent from the cookie policy after rejection.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
