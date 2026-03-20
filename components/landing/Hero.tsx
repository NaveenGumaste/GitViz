"use client";

import { useState, useTransition } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { ArrowRight, Search } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { parseRepoInput } from "@/lib/utils";

export function Hero(): React.ReactNode {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>): void => {
    event.preventDefault();

    try {
      const { owner, repo } = parseRepoInput(query);
      setError(null);

      startTransition(() => {
        router.push(`/viz/${owner}/${repo}`);
      });
    } catch (submitError) {
      if (submitError instanceof Error) {
        setError(submitError.message);
        return;
      }

      setError("Enter a GitHub repository URL or owner/repo pair.");
    }
  };

  return (
    <section className="relative min-h-svh overflow-hidden" id="home">
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(rgba(0,0,0,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.035)_1px,transparent_1px)] bg-size-[72px_72px] dark:bg-[linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)]" />
      <motion.div
        aria-hidden="true"
        animate={{ y: [0, -12, 0] }}
        transition={{ duration: 8, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
        className="absolute -left-32 top-20 -z-10 size-96 rounded-full bg-accent/12 blur-3xl"
      />
      <motion.div
        aria-hidden="true"
        animate={{ y: [0, 14, 0] }}
        transition={{ duration: 10, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
        className="absolute -right-24 top-40 -z-10 size-72 rounded-full bg-accent/10 blur-3xl"
      />

      <div className="mx-auto flex w-full max-w-7xl flex-col gap-12 px-6 pb-24 pt-28 lg:px-8 lg:pt-32">
        <div className="max-w-4xl space-y-8">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex rounded-full border border-border bg-paper/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-muted backdrop-blur-sm dark:border-border-dark dark:bg-surface/80"
          >
            Git Repository Visualizer
          </motion.p>

          <div className="space-y-6">
            <motion.h1
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.05 }}
              className="max-w-4xl font-display text-[clamp(3rem,8vw,7rem)] leading-[0.88] tracking-[-0.06em] text-ink dark:text-paper"
            >
              See Your Codebase.
              <br />
              Really See It.
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.12 }}
              className="max-w-2xl text-lg leading-8 text-muted dark:text-paper/72"
            >
              Turn a GitHub repository into a visual story: the file tree, commit rhythm, contributor shape, and language mix all in one editorial dashboard.
            </motion.p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.18 }}
            className="flex flex-wrap gap-4"
          >
            <Button href="#repo-search" variant="primary" size="lg" iconRight={<ArrowRight className="size-4" aria-hidden="true" />}>
              Analyze a Repo
            </Button>
            <Button href="#demo-preview" variant="outline" size="lg">
              View Demo
            </Button>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.22 }}
          className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]"
        >
          <Card className="relative overflow-hidden border-border/90 bg-paper/90 p-8 dark:border-border-dark/80 dark:bg-surface/85">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,77,0,0.12),transparent_40%)]" />
            <div className="relative space-y-6">
              <div className="flex items-center gap-3">
                <div className="size-3 rounded-full bg-accent" />
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted">Paste a GitHub URL</p>
              </div>

              <form className="space-y-4" onSubmit={handleSubmit} id="repo-search">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted" aria-hidden="true" />
                  <Input
                    value={query}
                    onChange={(event) => {
                      setQuery(event.target.value);
                      if (error) {
                        setError(null);
                      }
                    }}
                    placeholder="e.g., facebook/react"
                    className="h-14 pl-11 pr-4 text-base"
                    invalid={Boolean(error)}
                    aria-describedby={error ? "repo-input-error" : undefined}
                  />
                </div>

                {error ? (
                  <p id="repo-input-error" className="text-sm text-accent">
                    {error}
                  </p>
                ) : (
                  <p className="text-sm text-muted dark:text-paper/60">
                    The app validates the repo with Zod, then loads the visualizer with the GitHub API.
                  </p>
                )}

                <div className="flex flex-wrap gap-3">
                  <Button type="submit" loading={isPending} variant="primary" size="lg">
                    Analyze Repository
                  </Button>
                  <Button href="/#about" variant="outline" size="lg">
                    Learn More
                  </Button>
                </div>
              </form>
            </div>
          </Card>

          <Card className="flex flex-col justify-between gap-6 overflow-hidden p-8">
            <div className="space-y-4">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-muted dark:text-paper/60">Instant insights</p>
              <h2 className="font-display text-3xl leading-tight">A visual dashboard for the shape of your repository.</h2>
              <p className="max-w-md text-sm leading-7 text-muted dark:text-paper/70">
                Designed for quick scans and deep dives: tree structure, activity cadence, contributor mix, and language spread stay visible without losing context.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {[
                ["Tree", "Radial file explorer"],
                ["Heat", "Commit calendar"],
                ["People", "Contributor ranking"],
                ["Code", "Language donut"],
              ].map(([label, caption]) => (
                <div key={label} className="rounded-3xl border border-ink/10 bg-ink/5 p-4 dark:border-paper/10 dark:bg-paper/5">
                  <p className="text-sm font-semibold">{label}</p>
                  <p className="mt-1 text-xs text-muted dark:text-paper/65">{caption}</p>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
      </div>
    </section>
  );
}
