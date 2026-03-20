"use client";

import { forwardRef, type TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  invalid?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea({ className, invalid, ...props }, ref) {
  return (
    <textarea
      ref={ref}
      className={cn(
        "min-h-32 w-full rounded-[1.5rem] border border-border bg-paper px-4 py-3 text-sm text-ink outline-none transition-all placeholder:text-muted focus:border-accent focus:ring-4 focus:ring-accent-muted dark:border-border-dark dark:bg-surface dark:text-paper dark:placeholder:text-muted/80",
        invalid && "border-accent focus:ring-accent/20",
        className,
      )}
      aria-invalid={invalid || undefined}
      {...props}
    />
  );
});

Textarea.displayName = "Textarea";
