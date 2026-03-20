"use client";

import { AlertTriangle, RefreshCcw, Github, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils";

interface ErrorStateProps {
  title: string;
  message: string;
  onRetry?: () => void;
  retryLabel?: string;
  className?: string;
  variant?: "default" | "rate-limit";
}

export function ErrorState({
  title,
  message,
  onRetry,
  retryLabel = "Try Again",
  className,
  variant = "default",
}: ErrorStateProps): React.ReactNode {
  return (
    <Card className={cn("flex flex-col items-start gap-4", className)}>
      <div className="flex items-start gap-3">
        <div className="rounded-full bg-accent-muted p-3 text-accent">
          {variant === "rate-limit" ? <Loader2 className="size-5 animate-spin" aria-hidden="true" /> : <AlertTriangle className="size-5" aria-hidden="true" />}
        </div>
        <div className="space-y-1">
          <h3 className="font-display text-2xl text-ink dark:text-paper">{title}</h3>
          <p className="max-w-xl text-sm leading-6 text-muted dark:text-paper/70">{message}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        {onRetry ? (
          <Button variant="primary" size="sm" iconLeft={<RefreshCcw className="size-4" aria-hidden="true" />} onClick={onRetry}>
            {retryLabel}
          </Button>
        ) : null}
        {variant === "rate-limit" ? (
          <Button
            href="/api/auth/signin/github"
            variant="outline"
            size="sm"
            iconLeft={<Github className="size-4" aria-hidden="true" />}
          >
            Sign in with GitHub
          </Button>
        ) : null}
        <Button href="/" variant="ghost" size="sm">
          Back home
        </Button>
      </div>
    </Card>
  );
}
