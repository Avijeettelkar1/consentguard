import * as React from "react";

import { cn } from "@/lib/utils";

export function Badge({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border border-emerald-300/25 bg-emerald-300/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.16em] text-emerald-200 backdrop-blur-xl",
        className
      )}
      {...props}
    />
  );
}
