"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowRight, Github, Search, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { parseRepoInput } from "@/lib/utils";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.14,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring" as const,
      stiffness: 110,
      damping: 18,
    },
  },
};

export function Hero(): React.ReactNode {
  const router = useRouter();
  const [repoUrl, setRepoUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>): void => {
    event.preventDefault();

    try {
      const { owner, repo } = parseRepoInput(repoUrl);
      setError(null);
      setLoading(true);
      router.push(`/viz/${owner}/${repo}`);
    } catch (submitError) {
      setLoading(false);
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Enter a valid GitHub repository URL or owner/repo pair.",
      );
    }
  };

  return (
    <section
      id="home"
      className="relative isolate overflow-hidden pt-28 pb-20 sm:pt-32 sm:pb-24"
    >
      <div className="absolute inset-0 -z-20 bg-paper dark:bg-ink" />

      <div className="absolute inset-0 -z-10 pointer-events-none">
        <div className="absolute left-[-12%] top-[-10%] h-[30rem] w-[30rem] rounded-full bg-accent/10 blur-[120px] dark:bg-accent/12" />
        <div className="absolute right-[-10%] bottom-[-12%] h-[26rem] w-[26rem] rounded-full bg-orange-400/10 blur-[110px] dark:bg-orange-500/10" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(13,13,13,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(13,13,13,0.05)_1px,transparent_1px)] bg-[size:72px_72px] dark:bg-[linear-gradient(to_right,rgba(245,240,232,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(245,240,232,0.05)_1px,transparent_1px)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_35%,rgba(245,240,232,0.95)_85%)] dark:bg-[radial-gradient(circle_at_center,transparent_35%,rgba(13,13,13,0.92)_85%)]" />
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="mx-auto flex w-full max-w-7xl flex-col items-center px-6 text-center lg:px-8"
      >
        <motion.div variants={itemVariants} className="mb-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-paper/80 px-4 py-2 text-sm font-medium text-ink/80 shadow-sm backdrop-blur-xl dark:border-border-dark/80 dark:bg-surface/75 dark:text-paper/80">
            <span className="relative flex size-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-70" />
              <span className="relative inline-flex size-2.5 rounded-full bg-accent" />
            </span>
            <span>GitViz 1.0 is now live</span>
            <Sparkles className="size-3.5 text-accent" aria-hidden="true" />
          </div>
        </motion.div>

        <motion.h1
          variants={itemVariants}
          className="max-w-5xl font-display text-[clamp(2.8rem,8vw,6.5rem)] font-bold leading-[0.96] tracking-[-0.06em] text-ink dark:text-paper"
        >
          See the heartbeat of your{" "}
          <span className="bg-gradient-to-r from-accent to-orange-400 bg-clip-text text-transparent">
            repositories
          </span>
        </motion.h1>

        <motion.p
          variants={itemVariants}
          className="mt-8 max-w-2xl text-lg leading-8 text-muted dark:text-paper/62 sm:text-xl"
        >
          Transform dense Git history into beautiful, interactive visual
          landscapes. Understand architecture, activity, and contribution
          patterns in a way that feels immediate and memorable.
        </motion.p>

        <motion.form
          id="repo-search"
          variants={itemVariants}
          onSubmit={handleSubmit}
          className="mt-12 flex w-full max-w-xl flex-col gap-3 sm:flex-row"
        >
          <div className="group relative flex-1">
            <div className="absolute -inset-0.5 rounded-[1.4rem] bg-gradient-to-r from-accent/25 to-orange-400/25 opacity-0 blur transition duration-500 group-focus-within:opacity-100" />
            <div className="relative">
              <Search
                className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted transition-colors group-focus-within:text-accent dark:text-paper/40"
                aria-hidden="true"
              />
              <input
                type="text"
                value={repoUrl}
                onChange={(event) => {
                  setRepoUrl(event.target.value);
                  if (error) {
                    setError(null);
                  }
                }}
                placeholder="owner/repo or GitHub URL"
                className="h-14 w-full rounded-[1.4rem] border border-border bg-paper/90 pl-12 pr-4 text-sm text-ink shadow-[0_10px_30px_rgba(0,0,0,0.04)] outline-none backdrop-blur-xl transition-all placeholder:text-muted focus:border-accent focus:ring-4 focus:ring-accent-muted dark:border-border-dark dark:bg-surface/80 dark:text-paper dark:shadow-[0_10px_36px_rgba(0,0,0,0.24)] dark:placeholder:text-paper/35"
                aria-invalid={Boolean(error) || undefined}
                aria-describedby={error ? "hero-repo-error" : undefined}
              />
            </div>
          </div>

          <Button
            type="submit"
            loading={loading}
            size="lg"
            className="h-14 rounded-[1.4rem] px-8"
            iconRight={<ArrowRight className="size-4" aria-hidden="true" />}
          >
            Visualize
          </Button>
        </motion.form>

        <motion.div variants={itemVariants} className="mt-4 min-h-6">
          {error ? (
            <p id="hero-repo-error" className="text-sm text-accent">
              {error}
            </p>
          ) : (
            <p className="text-sm text-muted dark:text-paper/48">
              Try a popular repository or paste your own GitHub project.
            </p>
          )}
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="mt-6 flex flex-wrap items-center justify-center gap-2 text-sm text-muted dark:text-paper/48"
        >
          <span>Try these:</span>
          {["facebook/react", "vercel/next.js", "microsoft/TypeScript"].map(
            (demo) => (
              <button
                key={demo}
                type="button"
                onClick={() => {
                  setRepoUrl(demo);
                  setError(null);
                }}
                className="rounded-full border border-border bg-paper/75 px-3 py-1.5 text-ink transition-all hover:-translate-y-0.5 hover:border-accent hover:text-accent dark:border-border-dark dark:bg-surface/70 dark:text-paper/80 dark:hover:border-accent dark:hover:text-accent"
              >
                {demo}
              </button>
            ),
          )}
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="mt-20 w-full max-w-5xl rounded-[2rem] border border-border/80 bg-paper/70 p-2 shadow-[0_30px_70px_rgba(0,0,0,0.08)] backdrop-blur-2xl dark:border-border-dark/80 dark:bg-surface/70 dark:shadow-[0_30px_80px_rgba(0,0,0,0.36)]"
        >
          <div className="relative aspect-[16/9] overflow-hidden rounded-[1.5rem] border border-border/80 bg-paper dark:border-border-dark dark:bg-ink">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,77,0,0.12),transparent_40%),radial-gradient(circle_at_bottom_right,rgba(59,130,246,0.08),transparent_32%)] dark:bg-[radial-gradient(circle_at_top,rgba(255,77,0,0.16),transparent_40%),radial-gradient(circle_at_bottom_right,rgba(59,130,246,0.12),transparent_32%)]" />

            <div className="absolute left-0 right-0 top-0 flex h-12 items-center justify-between border-b border-border/80 bg-paper/80 px-4 backdrop-blur-md dark:border-border-dark dark:bg-surface/85">
              <div className="flex items-center gap-2">
                <span className="size-2.5 rounded-full bg-[#ff5f57]" />
                <span className="size-2.5 rounded-full bg-[#febc2e]" />
                <span className="size-2.5 rounded-full bg-[#28c840]" />
              </div>
              <div className="rounded-full border border-border bg-paper px-4 py-1 text-xs text-muted dark:border-border-dark dark:bg-ink/70 dark:text-paper/60">
                github.com/owner/repo
              </div>
            </div>

            <div className="absolute inset-x-0 bottom-0 top-12 grid gap-4 p-5 lg:grid-cols-[1.05fr_0.95fr]">
              <div className="rounded-[1.5rem] border border-border bg-paper/88 p-5 dark:border-border-dark dark:bg-surface/78">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.28em] text-muted dark:text-paper/45">
                      Structure Map
                    </p>
                    <h3 className="mt-3 font-display text-2xl tracking-[-0.04em] text-ink dark:text-paper">
                      Repository orbit
                    </h3>
                  </div>
                  <div className="rounded-2xl bg-accent/12 p-3 text-accent">
                    <Github className="size-5" aria-hidden="true" />
                  </div>
                </div>

                <div className="relative mt-8 flex h-[calc(100%-4rem)] min-h-72 items-start justify-center overflow-hidden rounded-[1.25rem] border border-border/70 bg-surface-light/65 pt-10 dark:border-border-dark dark:bg-ink/40">
                  <div className="relative size-64 -translate-y-4">
                    {/* Ring 1 */}
                    <div className="absolute inset-0 rounded-full border border-accent/20 border-dashed" />
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 90,
                        repeat: Number.POSITIVE_INFINITY,
                        ease: "linear",
                      }}
                      className="absolute inset-0"
                    >
                      <div className="absolute left-1/2 top-0 size-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent shadow-[0_0_18px_rgba(255,77,0,0.45)]" />
                    </motion.div>

                    {/* Ring 2 */}
                    <div className="absolute inset-5 rounded-full border border-blue-400/20" />
                    <motion.div
                      animate={{ rotate: -360 }}
                      transition={{
                        duration: 70,
                        repeat: Number.POSITIVE_INFINITY,
                        ease: "linear",
                      }}
                      className="absolute inset-5"
                    >
                      <div className="absolute right-0 top-1/2 size-3 -translate-y-1/2 translate-x-1/2 rounded-full bg-blue-400 shadow-[0_0_16px_rgba(96,165,250,0.35)]" />
                    </motion.div>

                    {/* Ring 3 */}
                    <div className="absolute inset-10 rounded-full border border-emerald-400/20" />
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 50,
                        repeat: Number.POSITIVE_INFINITY,
                        ease: "linear",
                      }}
                      className="absolute inset-10"
                    >
                      <div className="absolute bottom-0 left-1/2 size-2.5 -translate-x-1/2 translate-y-1/2 rounded-full bg-emerald-400" />
                    </motion.div>

                    {/* Ring 4 */}
                    <div className="absolute inset-14 rounded-full border border-orange-300/20" />
                    <motion.div
                      animate={{ rotate: -360 }}
                      transition={{
                        duration: 40,
                        repeat: Number.POSITIVE_INFINITY,
                        ease: "linear",
                      }}
                      className="absolute inset-14"
                    >
                      <div className="absolute left-0 top-1/2 size-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-orange-300" />
                    </motion.div>

                    {/* Ring 5 */}
                    <div className="absolute inset-[4.5rem] rounded-full border border-purple-400/20" />
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 25,
                        repeat: Number.POSITIVE_INFINITY,
                        ease: "linear",
                      }}
                      className="absolute inset-[4.5rem]"
                    >
                      <div className="absolute left-1/2 top-0 size-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-purple-400" />
                    </motion.div>

                    <div className="absolute inset-0 m-auto flex size-20 items-center justify-center rounded-full border border-border bg-paper shadow-lg dark:border-border-dark dark:bg-surface">
                      <Github className="size-8 text-ink/70 dark:text-paper/70" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid gap-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-[1.5rem] border border-border bg-paper/88 p-5 dark:border-border-dark dark:bg-surface/78">
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted dark:text-paper/45">
                      Activity
                    </p>
                    <div className="mt-5 grid grid-cols-7 gap-2">
                      {Array.from({ length: 28 }).map((_, index) => (
                        <div
                          key={index}
                          className="aspect-square rounded-md bg-[linear-gradient(180deg,rgba(255,77,0,0.16),rgba(255,77,0,0.55))]"
                        />
                      ))}
                    </div>
                  </div>

                  <div className="rounded-[1.5rem] border border-border bg-paper/88 p-5 dark:border-border-dark dark:bg-surface/78">
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted dark:text-paper/45">
                      Language mix
                    </p>
                    <div className="mt-6 flex items-center justify-center">
                      <div className="relative size-28 rounded-full border border-border dark:border-border-dark">
                        <div className="absolute inset-3 rounded-full border border-dashed border-accent/45" />
                        <div className="absolute inset-0 m-auto flex size-14 items-center justify-center rounded-full bg-accent text-paper text-sm font-semibold">
                          78%
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="rounded-[1.5rem] border border-border bg-paper/88 p-5 dark:border-border-dark dark:bg-surface/78">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted dark:text-paper/45">
                        Contributors
                      </p>
                      <h4 className="mt-2 text-base font-semibold text-ink dark:text-paper">
                        Team dynamics at a glance
                      </h4>
                    </div>
                    <div className="rounded-full bg-accent/12 px-3 py-1 text-xs font-medium text-accent">
                      Live
                    </div>
                  </div>

                  <div className="mt-5 grid gap-3">
                    {[
                      "Core maintainer",
                      "Frontend contributor",
                      "Docs & DX",
                      "Infra support",
                    ].map((label, index) => (
                      <div
                        key={label}
                        className="grid grid-cols-[auto_1fr] items-center gap-3"
                      >
                        <div className="size-8 rounded-full bg-accent/16" />
                        <div className="space-y-2">
                          <p className="text-xs text-muted dark:text-paper/48">
                            {label}
                          </p>
                          <div className="h-2 rounded-full bg-surface-light dark:bg-paper/10">
                            <div
                              className="h-full rounded-full bg-accent"
                              style={{ width: `${88 - index * 14}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-[1.5rem] border border-border bg-paper/88 p-5 dark:border-border-dark dark:bg-surface/78">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted dark:text-paper/45">
                      Instant insights
                    </p>
                    <div className="rounded-full border border-border bg-paper px-3 py-1 text-xs text-muted dark:border-border-dark dark:bg-ink/60 dark:text-paper/55">
                      Ready in seconds
                    </div>
                  </div>
                  <div className="mt-5 grid gap-3 sm:grid-cols-3">
                    {[
                      ["Tree", "Repository architecture"],
                      ["Heat", "Commit cadence"],
                      ["People", "Contributor mix"],
                    ].map(([label, caption]) => (
                      <div
                        key={label}
                        className="rounded-2xl border border-border bg-surface-light/55 p-4 dark:border-border-dark dark:bg-ink/35"
                      >
                        <p className="text-sm font-semibold text-ink dark:text-paper">
                          {label}
                        </p>
                        <p className="mt-1 text-xs leading-6 text-muted dark:text-paper/48">
                          {caption}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
