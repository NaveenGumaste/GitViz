const badges = [
  "Next.js",
  "TypeScript",
  "Tailwind CSS",
  "D3.js",
  "Recharts",
  "GitHub API",
  "NextAuth",
  "Zod",
  "Zustand",
  "Framer Motion",
] as const;

export function TechBadges(): React.ReactNode {
  return (
    <section className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
      <p className="text-sm font-semibold uppercase tracking-[0.28em] text-muted">Tech stack</p>
      <div className="mt-6 overflow-hidden rounded-[2rem] border border-border bg-paper/80 py-5 dark:border-border-dark dark:bg-surface/80">
        <div className="flex w-max items-center gap-3 px-5 animate-[scroll_26s_linear_infinite]">
          {[...badges, ...badges].map((badge, index) => (
            <span
              key={`${badge}-${index}`}
              className="inline-flex items-center rounded-full border border-border bg-surface-light px-4 py-2 text-sm font-medium text-ink dark:border-border-dark dark:bg-paper/10 dark:text-paper"
            >
              {badge}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
