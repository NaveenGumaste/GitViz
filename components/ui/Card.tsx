"use client";

import { forwardRef, type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type CardProps = HTMLAttributes<HTMLDivElement>;

export const Card = forwardRef<HTMLDivElement, CardProps>(function Card({ className, ...props }, ref) {
  return (
    <div
      ref={ref}
      className={cn(
        "rounded-[2rem] border border-border bg-paper/85 p-6 shadow-[0_10px_32px_rgba(0,0,0,0.06)] backdrop-blur-sm transition-all duration-300 dark:border-border-dark dark:bg-surface/80 dark:shadow-[0_10px_36px_rgba(0,0,0,0.24)]",
        "hover:-translate-y-1 hover:shadow-[0_18px_42px_rgba(0,0,0,0.12)]",
        className,
      )}
      {...props}
    />
  );
});

Card.displayName = "Card";
