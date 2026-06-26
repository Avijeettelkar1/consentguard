import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Glow } from "@/components/ui/glow";
import { Icons } from "@/components/ui/icons";
import { ScanPreviewMockup } from "@/components/ui/mockup";

const metrics = [
  { value: "41", label: "Trackers Found", tone: "text-emerald-200" },
  { value: "34", label: "Undeclared", tone: "text-amber-200" },
  { value: "High Risk", label: "Compliance Signal", tone: "text-red-200" }
];

export function HeroSection() {
  return (
    <section className="relative isolate overflow-hidden px-6 py-8 sm:py-10 lg:px-8">
      <Glow />
      <div className="mx-auto flex max-w-7xl items-center justify-between border-b border-white/10 pb-6">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-md border border-emerald-300/25 bg-emerald-300/10 text-emerald-200">
            <Icons.lock className="h-5 w-5" />
          </span>
          <span className="text-sm font-semibold text-white">ConsentGuard</span>
        </div>
        <Button variant="ghost" size="sm" className="hidden sm:inline-flex">
          Compliance Report
        </Button>
      </div>

      <div className="mx-auto grid max-w-7xl gap-10 pb-14 pt-16 lg:grid-cols-[0.92fr_1.08fr] lg:items-center lg:pt-20">
        <div>
          <Badge>Daytona HackSprint Berlin 2026</Badge>
          <h1 className="mt-6 max-w-4xl text-5xl font-semibold leading-[0.98] tracking-normal text-white sm:text-6xl lg:text-7xl">
            Your Reject Button Is Probably Broken
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-emerald-50/72">
            ConsentGuard scans any website, clicks "Reject All", captures real
            network traffic, detects trackers still loading without consent, and
            generates a compliance report.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button size="lg">
              Start Audit
              <Icons.arrowRight className="h-4 w-4" />
            </Button>
            <Button size="lg" variant="secondary">
              View Demo
            </Button>
          </div>
        </div>

        <div className="relative">
          <div className="absolute -inset-4 rounded-xl border border-emerald-300/10 bg-emerald-300/5 blur-xl" />
          <ScanPreviewMockup className="relative" />
        </div>
      </div>

      <div className="mx-auto grid max-w-7xl gap-3 sm:grid-cols-3">
        {metrics.map((metric) => (
          <div
            key={metric.label}
            className="rounded-lg border border-white/10 bg-white/[0.055] p-5 backdrop-blur-xl"
          >
            <p className={`text-3xl font-semibold ${metric.tone}`}>
              {metric.value}
            </p>
            <p className="mt-2 text-sm text-emerald-50/62">{metric.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
