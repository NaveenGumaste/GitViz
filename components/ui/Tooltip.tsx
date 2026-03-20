"use client";

import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface TooltipProps {
  content: ReactNode;
  children: ReactNode;
  className?: string;
  side?: "top" | "bottom";
}

export function Tooltip({ content, children, className, side = "top" }: TooltipProps): React.ReactNode {
  return (
    <span className={cn("group relative inline-flex", className)}>
      {children}
      <span
        role="tooltip"
        className={cn(
          "pointer-events-none absolute left-1/2 z-20 min-w-max -translate-x-1/2 rounded-full border border-border bg-paper px-3 py-1 text-xs font-medium text-ink opacity-0 shadow-lg transition-all duration-200 group-hover:opacity-100 dark:border-border-dark dark:bg-surface dark:text-paper",
          side === "top" ? "bottom-full mb-2" : "top-full mt-2",
        )}
      >
        {content}
      </span>
    </span>
  );
}
