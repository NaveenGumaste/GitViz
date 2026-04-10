"use client";

import { motion } from "framer-motion";
import { ArrowRight, ScanSearch, Database, BarChart3 } from "lucide-react";
import { Card } from "@/components/ui/Card";

const steps = [
  {
    number: "01",
    title: "Paste a GitHub URL",
    description:
      "Drop in a repository URL or shorthand owner/repo pair and the app validates it immediately.",
    icon: ScanSearch,
  },
  {
    number: "02",
    title: "We fetch & process",
    description:
      "The server resolves repository metadata, tree data, commits, contributors, and language bytes.",
    icon: Database,
  },
  {
    number: "03",
    title: "Explore visual insights",
    description:
      "Switch between the radial tree, calendar heatmap, contributor chart, and language donut.",
    icon: BarChart3,
  },
] as const;

export function HowItWorks(): React.ReactNode {
  return (
    <section className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        variants={{
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: { staggerChildren: 0.2 },
          },
        }}
      >
        <motion.div
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
          }}
          className="space-y-6"
        >
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-muted dark:text-paper/55">
            How it works
          </p>
          <h2 className="font-display text-[clamp(2.2rem,4vw,3.8rem)] leading-[0.95] tracking-[-0.05em] text-ink dark:text-paper">
            Three steps from URL to insight.
          </h2>
        </motion.div>

        <div className="relative mt-12 grid gap-6 lg:grid-cols-3">
          <div className="pointer-events-none absolute left-10 right-10 top-9 hidden h-px bg-border dark:bg-border-dark lg:block" />
          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="pointer-events-none absolute left-10 right-10 top-9 hidden h-px origin-left bg-accent/80 lg:block"
          />

          {steps.map((step, index) => {
            const Icon = step.icon;

            return (
              <motion.div
                key={step.number}
                variants={{
                  hidden: { opacity: 0, y: 30 },
                  visible: {
                    opacity: 1,
                    y: 0,
                    transition: { duration: 0.6, delay: index * 0.1 },
                  },
                }}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
              >
                <Card className="relative h-full overflow-hidden p-8">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex size-16 shrink-0 items-center justify-center rounded-full border border-border bg-paper text-2xl font-display text-accent dark:border-border-dark dark:bg-surface">
                      {step.number}
                    </div>
                    <div className="rounded-full bg-accent-muted p-3 text-accent">
                      <Icon className="size-5" aria-hidden="true" />
                    </div>
                  </div>

                  <div className="mt-8 space-y-3">
                    <h3 className="font-display text-3xl tracking-[-0.03em] text-ink dark:text-paper">
                      {step.title}
                    </h3>
                    <p className="max-w-md text-sm leading-7 text-muted dark:text-paper/68">
                      {step.description}
                    </p>
                  </div>

                  <ArrowRight
                    className="absolute bottom-6 right-6 size-5 text-accent/80"
                    aria-hidden="true"
                  />
                </Card>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </section>
  );
}
