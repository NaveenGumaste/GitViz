"use client";

import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input({ className, invalid, ...props }, ref) {
  return (
    <input
      ref={ref}
      className={cn(
        "flex h-11 w-full rounded-full border border-border bg-paper px-4 text-sm text-ink outline-none transition-all placeholder:text-muted focus:border-accent focus:ring-4 focus:ring-accent-muted dark:border-border-dark dark:bg-surface dark:text-paper dark:placeholder:text-muted/80",
        invalid && "border-accent focus:ring-accent/20",
        className,
      )}
      aria-invalid={invalid || undefined}
      {...props}
    />
  );
});

Input.displayName = "Input";
