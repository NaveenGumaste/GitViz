import { ArrowUpRight, FolderTree, CalendarRange, Users, PieChart } from "lucide-react";
import { Card } from "@/components/ui/Card";

const features = [
  {
    number: "01",
    title: "File Tree Visualization",
    description: "Explore the repository structure as a radial tree with folder collapse, file detail tooltips, and zoom/pan.",
    icon: FolderTree,
  },
  {
    number: "02",
    title: "Commit Heatmap",
    description: "See repository activity evolve over the last 52 weeks with a GitHub-style calendar rendered in D3.",
    icon: CalendarRange,
  },
  {
    number: "03",
    title: "Contributor Stats",
    description: "Compare the most active contributors with animated horizontal bars and richer commit metadata.",
    icon: Users,
  },
  {
    number: "04",
    title: "Language Breakdown",
    description: "Understand the codebase mix at a glance with a donut chart and clear byte distribution legend.",
    icon: PieChart,
  },
] as const;

export function Features(): React.ReactNode {
  return (
    <section className="mx-auto max-w-7xl px-6 py-20 lg:px-8" id="features">
      <div className="space-y-6">
        <p className="text-sm font-semibold uppercase tracking-[0.28em] text-muted">Features</p>
        <h2 className="max-w-3xl font-display text-[clamp(2.2rem,4vw,3.8rem)] leading-[0.95] tracking-[-0.05em]">
          Four ways to understand a repository without opening the code.
        </h2>
      </div>

      <div className="mt-12 grid gap-6 md:grid-cols-2">
        {features.map((feature) => {
          const Icon = feature.icon;

          return (
            <Card key={feature.title} className="group relative overflow-hidden p-8">
              <div className="flex items-start justify-between gap-4">
                <span className="font-mono text-sm tracking-[0.3em] text-accent/80">{feature.number}</span>
                <div className="rounded-full border border-border bg-paper p-3 text-ink transition-all duration-300 group-hover:border-accent group-hover:text-accent dark:border-border-dark dark:bg-surface dark:text-paper">
                  <Icon className="size-5" aria-hidden="true" />
                </div>
              </div>

              <div className="mt-8 space-y-4">
                <h3 className="max-w-xs font-display text-3xl tracking-[-0.04em]">{feature.title}</h3>
                <p className="max-w-lg text-sm leading-7 text-muted dark:text-paper/68">{feature.description}</p>
              </div>

              <ArrowUpRight className="absolute bottom-6 right-6 size-5 text-accent transition-transform duration-300 group-hover:-translate-y-1 group-hover:translate-x-1" aria-hidden="true" />
              <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_right,rgba(255,77,0,0.08),transparent_35%)] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            </Card>
          );
        })}
      </div>
    </section>
  );
}
