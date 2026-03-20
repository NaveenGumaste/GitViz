"use client";

import { ArrowLeft, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { useRepo } from "@/hooks/useRepo";
import { useRepoStore } from "@/stores/repoStore";
import { Button } from "@/components/ui/Button";
import { ErrorState } from "@/components/ui/ErrorState";
import { RepoSidebar } from "@/components/viz/RepoSidebar";
import { TabNav } from "@/components/viz/TabNav";
import { FileTree } from "@/components/viz/FileTree";
import { CommitHeatmap } from "@/components/viz/CommitHeatmap";
import { ContributorChart } from "@/components/viz/ContributorChart";
import { LanguageDonut } from "@/components/viz/LanguageDonut";

interface RepoDashboardProps {
  owner: string;
  repo: string;
}

export function RepoDashboard({ owner, repo }: RepoDashboardProps): React.ReactNode {
  useRepo(owner, repo);

  const repoMeta = useRepoStore((state) => state.repoMeta);
  const tree = useRepoStore((state) => state.tree);
  const commits = useRepoStore((state) => state.commits);
  const commitCountsByDate = useRepoStore((state) => state.commitCountsByDate);
  const contributors = useRepoStore((state) => state.contributors);
  const languages = useRepoStore((state) => state.languages);
  const isLoading = useRepoStore((state) => state.isLoading);
  const errors = useRepoStore((state) => state.errors);
  const activeTab = useRepoStore((state) => state.activeTab);
  const refresh = useRepoStore((state) => state.refresh);

  const repoError = errors.repoMeta;
  const isRateLimited = repoError?.toLowerCase().includes("rate limit") ?? false;

  if (repoError && !repoMeta) {
    return (
      <section className="mx-auto flex min-h-[70vh] max-w-5xl items-center justify-center px-6 py-20 lg:px-8">
        <ErrorState
          title="We couldn't load that repository"
          message={repoError}
          onRetry={() => {
            void refresh();
          }}
          variant={isRateLimited ? "rate-limit" : "default"}
          className="w-full"
        />
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-7xl px-6 py-10 lg:px-8">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-2">
          <Link href="/" className="inline-flex items-center gap-2 text-sm font-medium text-muted transition-colors hover:text-accent dark:text-paper/60">
            <ArrowLeft className="size-4" aria-hidden="true" />
            Back to landing
          </Link>
        </div>

        <Button
          href={`https://github.com/${owner}/${repo}`}
        target="_blank"
        rel="noreferrer"
        variant="outline"
        size="sm"
        iconRight={<ArrowUpRight className="size-4" aria-hidden="true" />}
      >
        Open repo
      </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[300px_minmax(0,1fr)]">
        <RepoSidebar repoMeta={repoMeta} isLoading={isLoading.repoMeta} error={errors.repoMeta} onRetry={() => void refresh()} />

        <div className="space-y-6">
          <TabNav />

          {activeTab === "tree" ? (
            <FileTree nodes={tree} isLoading={isLoading.tree} error={errors.tree} onRetry={() => void refresh()} />
          ) : null}

          {activeTab === "heatmap" ? (
            <CommitHeatmap
              commits={commits}
              commitCountsByDate={commitCountsByDate}
              isLoading={isLoading.commits}
              error={errors.commits}
              onRetry={() => void refresh()}
            />
          ) : null}

          {activeTab === "contributors" ? (
            <ContributorChart contributors={contributors} isLoading={isLoading.contributors} error={errors.contributors} onRetry={() => void refresh()} />
          ) : null}

          {activeTab === "languages" ? (
            <LanguageDonut languages={languages} repoMeta={repoMeta} isLoading={isLoading.languages} error={errors.languages} onRetry={() => void refresh()} />
          ) : null}
        </div>
      </div>
    </section>
  );
}
