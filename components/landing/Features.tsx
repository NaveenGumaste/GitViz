"use client";

import { motion } from "framer-motion";
import {
  GitBranch,
  Activity,
  Users,
  PieChart,
  Sparkles,
  Layers,
} from "lucide-react";

const features = [
  {
    title: "Radial File Explorer",
    description:
      "Navigate your repository's architecture through an interactive, zoomable radial tree. See the shape of your codebase instantly.",
    icon: GitBranch,
    color: "from-blue-500/20 to-cyan-500/20",
    iconColor: "text-blue-500 dark:text-blue-400",
  },
  {
    title: "Commit Rhythm",
    description:
      "Understand project momentum with a beautiful commit heatmap. Spot trends, sprints, and quiet periods at a single glance.",
    icon: Activity,
    color: "from-accent/20 to-orange-500/20",
    iconColor: "text-accent",
  },
  {
    title: "Contributor Dynamics",
    description:
      "Discover who is driving the project forward. Visual rankings and contribution graphs highlight the team's true heroes.",
    icon: Users,
    color: "from-emerald-500/20 to-green-500/20",
    iconColor: "text-emerald-500 dark:text-emerald-400",
  },
  {
    title: "Language Distribution",
    description:
      "A clean, editorial breakdown of the languages powering your repository. Know your tech stack composition immediately.",
    icon: PieChart,
    color: "from-purple-500/20 to-pink-500/20",
    iconColor: "text-purple-500 dark:text-purple-400",
  },
  {
    title: "Zero Setup Required",
    description:
      "No configuration, no installation. Just paste a GitHub URL and watch the visualization unfold in real-time.",
    icon: Sparkles,
    color: "from-yellow-500/20 to-amber-500/20",
    iconColor: "text-yellow-500 dark:text-yellow-400",
  },
  {
    title: "Editorial Design",
    description:
      "Built with obsession over typography, contrast, and layout. Data visualization that feels like reading a premium magazine.",
    icon: Layers,
    color: "from-rose-500/20 to-red-500/20",
    iconColor: "text-rose-500 dark:text-rose-400",
  },
] as const;

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring" as const, stiffness: 80, damping: 20 },
  },
};

export function Features(): React.ReactNode {
  return (
    <section
      className="relative overflow-hidden bg-transparent py-24 sm:py-32"
      id="features"
    >
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,transparent,rgba(13,13,13,0.03)_1px,transparent_1px)] bg-[size:100%_4px] dark:bg-[linear-gradient(to_bottom,transparent,rgba(245,240,232,0.04)_1px,transparent_1px)]" />
      <div className="pointer-events-none absolute right-0 top-0 -mr-40 -mt-40 h-[600px] w-[600px] rounded-full bg-accent/6 blur-[100px] dark:bg-accent/8" />
      <div className="pointer-events-none absolute bottom-0 left-0 -mb-40 -ml-40 h-[600px] w-[600px] rounded-full bg-blue-500/6 blur-[100px] dark:bg-blue-500/8" />

      <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7 }}
          className="mx-auto max-w-2xl text-center"
        >
          <p className="inline-flex items-center justify-center rounded-full border border-border/70 bg-paper/80 px-4 py-1.5 text-sm font-semibold tracking-wide text-muted backdrop-blur-sm dark:border-border-dark/70 dark:bg-surface/75 dark:text-paper/65">
            Everything you need
          </p>

          <h2 className="mt-6 font-display text-[clamp(2.5rem,5vw,4rem)] font-bold leading-[1.1] tracking-tight text-ink dark:text-paper">
            Data density without the visual noise.
          </h2>

          <p className="mt-6 text-lg leading-8 text-muted dark:text-paper/60">
            We stripped away the clutter of traditional dashboards. What remains
            is a curated, highly interactive experience designed to give you
            instant clarity on any codebase.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="mx-auto mt-16 grid max-w-7xl grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {features.map((feature) => (
            <motion.div
              key={feature.title}
              variants={cardVariants}
              whileHover={{ y: -5, scale: 1.02 }}
              className="group relative rounded-3xl border border-border/70 bg-paper/78 p-8 backdrop-blur-md transition-all hover:border-border hover:bg-paper/90 hover:shadow-2xl hover:shadow-black/8 dark:border-border-dark/60 dark:bg-surface/72 dark:hover:border-border-dark dark:hover:bg-surface/86 dark:hover:shadow-black/30"
            >
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-b from-white/20 to-transparent opacity-0 transition-opacity group-hover:opacity-100 dark:from-white/5" />

              <div className="relative">
                <div
                  className={`mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${feature.color} ring-1 ring-black/5 dark:ring-white/10`}
                >
                  <feature.icon
                    className={`h-6 w-6 ${feature.iconColor}`}
                    aria-hidden="true"
                  />
                </div>

                <h3 className="mb-3 font-display text-xl font-semibold tracking-tight text-ink dark:text-paper">
                  {feature.title}
                </h3>

                <p className="text-sm leading-relaxed text-muted dark:text-paper/60">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
