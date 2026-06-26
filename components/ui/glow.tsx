import { cn } from "@/lib/utils";

export function Glow({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute inset-x-0 top-0 -z-10 mx-auto h-[34rem] max-w-6xl",
        className
      )}
    >
      <div className="absolute left-1/2 top-16 h-72 w-72 -translate-x-1/2 rounded-full bg-emerald-400/20 blur-3xl" />
      <div className="absolute right-12 top-28 h-56 w-56 rounded-full bg-teal-300/10 blur-3xl" />
    </div>
  );
}
