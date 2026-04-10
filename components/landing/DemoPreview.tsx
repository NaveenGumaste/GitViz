"use client";

import { motion } from "framer-motion";
import { Card } from "@/components/ui/Card";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.18,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.65,
      ease: "easeOut" as const,
    },
  },
};

export function DemoPreview(): React.ReactNode {
  return (
    <section className="mx-auto max-w-7xl px-6 py-20 lg:px-8" id="demo-preview">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        variants={containerVariants}
      >
        <motion.div variants={itemVariants} className="space-y-6">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-muted dark:text-paper/55">
            Live demo preview
          </p>
          <h2 className="font-display text-[clamp(2.2rem,4vw,3.8rem)] leading-[0.95] tracking-[-0.05em] text-ink dark:text-paper">
            The dashboard, framed like a browser and styled like an editorial
            spread.
          </h2>
          <p className="max-w-2xl text-base leading-8 text-muted dark:text-paper/60">
            A balanced preview surface that stays readable and elegant in both
            light and dark mode.
          </p>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="mt-12 overflow-hidden border-border/80 bg-paper/85 p-0 shadow-[0_18px_48px_rgba(0,0,0,0.08)] dark:border-border-dark/80 dark:bg-surface/82 dark:shadow-[0_20px_60px_rgba(0,0,0,0.28)]">
            <div className="border-b border-border/80 bg-surface-light/70 px-5 py-4 dark:border-border-dark dark:bg-ink/60">
              <div className="flex items-center gap-2">
                <span className="size-3 rounded-full bg-[#ff5f57]" />
                <span className="size-3 rounded-full bg-[#febc2e]" />
                <span className="size-3 rounded-full bg-[#28c840]" />
                <div className="ml-4 rounded-full border border-border/70 bg-paper px-4 py-1 text-xs text-muted dark:border-border-dark dark:bg-surface dark:text-paper/65">
                  github.com/owner/repo
                </div>
              </div>
            </div>

            <div className="grid gap-4 p-5 lg:grid-cols-[260px_minmax(0,1fr)]">
              <div className="rounded-[1.5rem] border border-border/80 bg-paper p-4 dark:border-border-dark dark:bg-surface/92">
                <div className="h-24 rounded-[1rem] bg-[radial-gradient(circle_at_top,rgba(255,77,0,0.16),transparent_72%)]" />
                <div className="mt-4 space-y-3">
                  <div className="h-5 w-2/3 rounded-full bg-surface-light dark:bg-paper/10" />
                  <div className="h-4 w-1/2 rounded-full bg-surface-light dark:bg-paper/10" />
                  <div className="grid grid-cols-2 gap-3 pt-3">
                    <div className="h-16 rounded-2xl bg-surface-light/80 dark:bg-paper/10" />
                    <div className="h-16 rounded-2xl bg-surface-light/80 dark:bg-paper/10" />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-[1.5rem] border border-border/80 bg-paper p-5 dark:border-border-dark dark:bg-surface/92">
                    <div className="flex items-center justify-between">
                      <div className="h-4 w-24 rounded-full bg-surface-light dark:bg-paper/10" />
                      <div className="h-4 w-10 rounded-full bg-accent/20" />
                    </div>
                    <div className="mt-6 space-y-3">
                      <div className="h-3 rounded-full bg-surface-light dark:bg-paper/10" />
                      <div className="h-3 w-5/6 rounded-full bg-surface-light dark:bg-paper/10" />
                      <div className="h-3 w-2/3 rounded-full bg-surface-light dark:bg-paper/10" />
                    </div>
                  </div>

                  <div className="rounded-[1.5rem] border border-border/80 bg-paper p-5 dark:border-border-dark dark:bg-surface/92">
                    <div className="flex items-center justify-between">
                      <div className="h-4 w-24 rounded-full bg-surface-light dark:bg-paper/10" />
                      <div className="h-4 w-10 rounded-full bg-accent/20" />
                    </div>
                    <div className="mt-6 grid grid-cols-7 gap-2">
                      {Array.from({ length: 28 }).map((_, index) => (
                        <div
                          key={index}
                          className="aspect-square rounded-md bg-[linear-gradient(180deg,rgba(255,77,0,0.15),rgba(255,77,0,0.5))]"
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-[1.5rem] border border-border/80 bg-paper p-5 dark:border-border-dark dark:bg-surface/92">
                    <div className="flex items-center justify-between">
                      <div className="h-4 w-24 rounded-full bg-surface-light dark:bg-paper/10" />
                      <div className="h-4 w-10 rounded-full bg-accent/20" />
                    </div>
                    <div className="mt-5 grid gap-3">
                      {Array.from({ length: 4 }).map((_, index) => (
                        <div key={index} className="flex items-center gap-3">
                          <div className="size-8 rounded-full bg-accent/20" />
                          <div className="h-3 flex-1 rounded-full bg-surface-light dark:bg-paper/10" />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-[1.5rem] border border-border/80 bg-paper p-5 dark:border-border-dark dark:bg-surface/92">
                    <div className="flex items-center justify-between">
                      <div className="h-4 w-24 rounded-full bg-surface-light dark:bg-paper/10" />
                      <div className="h-4 w-10 rounded-full bg-accent/20" />
                    </div>
                    <div className="mt-6 flex items-center justify-center">
                      <div className="relative size-44 rounded-full border border-border dark:border-border-dark">
                        <div className="absolute inset-4 rounded-full border border-dashed border-accent/40" />
                        <div className="absolute inset-0 m-auto flex size-24 items-center justify-center rounded-full bg-accent text-paper">
                          78%
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      </motion.div>
    </section>
  );
}
