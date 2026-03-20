"use client";

import { type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type SkeletonProps = HTMLAttributes<HTMLDivElement>;

export function Skeleton({ className, ...props }: SkeletonProps): React.ReactNode {
  return (
    <div
      className={cn(
        "rounded-2xl bg-[linear-gradient(110deg,rgba(0,0,0,0.06)_8%,rgba(0,0,0,0.12)_18%,rgba(0,0,0,0.06)_33%)] bg-[length:200%_100%] animate-[shimmer_1.4s_linear_infinite] dark:bg-[linear-gradient(110deg,rgba(255,255,255,0.06)_8%,rgba(255,255,255,0.12)_18%,rgba(255,255,255,0.06)_33%)]",
        className,
      )}
      {...props}
    />
  );
}
