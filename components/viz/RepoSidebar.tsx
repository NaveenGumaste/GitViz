"use client";

import Image from "next/image";
import { ArrowUpRight, GitFork, Bug, Star, CalendarClock, Code2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { ErrorState } from "@/components/ui/ErrorState";
import { formatNumber, formatRelativeDate } from "@/lib/utils";
import type { RepoMeta } from "@/lib/schemas/github";
import { cn } from "@/lib/utils";

interface RepoSidebarProps {
  repoMeta: RepoMeta | null;
  isLoading: boolean;
  error: string | null;
  onRetry: () => void;
}

export function RepoSidebar({ repoMeta, isLoading, error, onRetry }: RepoSidebarProps): React.ReactNode {
  if (isLoading && !repoMeta) {
    return <RepoSidebarSkeleton />;
  }

  if (error && !repoMeta) {
    return (
      <ErrorState
        title="Repository unavailable"
        message={error}
        onRetry={onRetry}
        className="h-full"
        variant={error.toLowerCase().includes("rate limit") ? "rate-limit" : "default"}
      />
    );
  }

  if (!repoMeta) {
    return <RepoSidebarSkeleton />;
  }

  return (
    <Card className="sticky top-8 space-y-6">
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="relative size-20 overflow-hidden rounded-3xl border border-border dark:border-border-dark">
            <Image src={repoMeta.ownerAvatarUrl} alt={repoMeta.ownerLogin} fill sizes="80px" className="object-cover" />
          </div>
          <div className={cn("rounded-full border px-3 py-1 text-xs font-medium", repoMeta.isPrivate ? "border-accent/30 bg-accent-muted text-accent" : "border-border bg-surface-light text-muted dark:border-border-dark dark:bg-paper/5 dark:text-paper/65")}>
            {repoMeta.isPrivate ? "Private" : "Public"}
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-ink/70 dark:text-paper/55">Repository</p>
          <h2
            className={cn(
              "font-display leading-tight tracking-[-0.04em] text-ink dark:text-paper",
              repoMeta.fullName.length > 28 ? "text-xl" : repoMeta.fullName.length > 20 ? "text-2xl" : "text-3xl",
            )}
          >
            {repoMeta.fullName.split("/").map((part, index, arr) => (
              <span key={index}>
                {part}
                {index < arr.length - 1 && <span className="text-ink/40 dark:text-paper/40">/</span>}
                {index < arr.length - 1 && <wbr />}
              </span>
            ))}
          </h2>
          <p className="text-sm leading-7 text-muted dark:text-paper/68">{repoMeta.description ?? "No description was provided for this repository."}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {[
          { label: "Stars", value: formatNumber(repoMeta.stars), icon: Star },
          { label: "Forks", value: formatNumber(repoMeta.forks), icon: GitFork },
          { label: "Issues", value: formatNumber(repoMeta.openIssues), icon: Bug },
          { label: "Updated", value: formatRelativeDate(repoMeta.updatedAt), icon: CalendarClock },
        ].map((item) => {
          const Icon = item.icon;

          return (
            <div key={item.label} className="rounded-3xl border border-border bg-surface-light p-4 dark:border-border-dark dark:bg-paper/5">
              <div className="flex items-center gap-2 text-ink/70 dark:text-paper/55">
                <Icon className="size-4" aria-hidden="true" />
                <span className="text-xs font-medium uppercase tracking-[0.2em]">{item.label}</span>
              </div>
              <p className="mt-3 font-mono text-sm text-ink dark:text-paper">{item.value}</p>
            </div>
          );
        })}
      </div>

      <div className="rounded-3xl border border-border bg-surface-light p-4 dark:border-border-dark dark:bg-paper/5">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-ink/70 dark:text-paper/68">
            <Code2 className="size-4 text-accent" aria-hidden="true" />
            <span>Primary language</span>
          </div>
          <span className="font-medium text-ink dark:text-paper">{repoMeta.primaryLanguage ?? "Mixed"}</span>
        </div>
        <div className="mt-3 flex items-center justify-between gap-4 text-sm text-muted dark:text-paper/68">
          <span>Default branch</span>
          <span className="font-mono text-ink dark:text-paper">{repoMeta.defaultBranch}</span>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <Button href={repoMeta.htmlUrl} target="_blank" rel="noreferrer" variant="outline" size="sm" iconRight={<ArrowUpRight className="size-4" aria-hidden="true" />}>
          View on GitHub
        </Button>
      </div>
    </Card>
  );
}

function RepoSidebarSkeleton(): React.ReactNode {
  return (
    <Card className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <Skeleton className="size-20 rounded-3xl" />
        <Skeleton className="h-8 w-20 rounded-full" />
      </div>
      <div className="space-y-3">
        <Skeleton className="h-3 w-28 rounded-full" />
        <Skeleton className="h-8 w-3/4 rounded-full" />
        <Skeleton className="h-4 w-full rounded-full" />
        <Skeleton className="h-4 w-11/12 rounded-full" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-24 rounded-3xl" />
        ))}
      </div>
      <Skeleton className="h-20 rounded-3xl" />
      <Skeleton className="h-11 w-40 rounded-full" />
    </Card>
  );
}
