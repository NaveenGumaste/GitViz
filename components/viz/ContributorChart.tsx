"use client";

import Image from "next/image";
import { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
} from "recharts";
import { Card } from "@/components/ui/Card";
import { ErrorState } from "@/components/ui/ErrorState";
import { Skeleton } from "@/components/ui/Skeleton";
import { formatNumber } from "@/lib/utils";
import type { Contributor } from "@/lib/schemas/github";

interface ContributorChartProps {
  contributors: Contributor[] | null;
  isLoading: boolean;
  error: string | null;
  onRetry: () => void;
}

interface ChartDatum extends Contributor {
  barColor: string;
}

interface ContributorTooltipProps {
  active?: boolean;
  payload?: Array<{ payload: ChartDatum }>;
}

const BAR_COLORS = ["#ff4d00", "#ff6b6b", "#ff9248", "#ffb347", "#ffd166", "#f6ad55", "#e76f51", "#c77dff", "#6ee7b7", "#4f83ff"] as const;

export function ContributorChart({ contributors, isLoading, error, onRetry }: ContributorChartProps): React.ReactNode {
  const contributorCount = contributors?.length ?? 0;

  const data = useMemo(() => {
    if (!contributors) {
      return [];
    }

    return [...contributors]
      .sort((left, right) => right.total - left.total)
      .slice(0, 10)
      .map((entry, index) => ({
        ...entry,
        barColor: BAR_COLORS[index % BAR_COLORS.length],
      }));
  }, [contributors]);

  const maxTotal = useMemo(() => Math.max(1, ...data.map((entry) => entry.total)), [data]);

  if (isLoading && !contributors) {
    return <ContributorChartSkeleton />;
  }

  if (error && !contributors) {
    return <ErrorState title="Contributor stats unavailable" message={error} onRetry={onRetry} variant={error.toLowerCase().includes("rate limit") ? "rate-limit" : "default"} />;
  }

  if (!contributors || contributors.length === 0) {
    return (
      <Card className="flex min-h-[560px] items-center justify-center">
        <p className="text-sm text-muted dark:text-paper/65">No contributor data is available yet.</p>
      </Card>
    );
  }

  return (
    <Card className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-muted dark:text-paper/55">Contributor stats</p>
          <h3 className="font-display text-3xl leading-tight tracking-[-0.04em] text-ink dark:text-paper">The top 10 contributors by total commits.</h3>
        </div>
        <div className="rounded-full border border-border bg-surface-light px-4 py-2 text-sm text-muted dark:border-border-dark dark:bg-paper/5 dark:text-paper/68">
          Showing {data.length} of {formatNumber(contributorCount)} contributors
        </div>
      </div>

      <div className="grid gap-8 xl:grid-cols-[320px_minmax(0,1fr)]">
        <div className="space-y-4">
          {data.map((entry) => (
            <div key={entry.login} className="rounded-[1.5rem] border border-border bg-surface-light p-4 dark:border-border-dark dark:bg-paper/5">
              <div className="flex items-center gap-3">
                <div className="relative size-12 overflow-hidden rounded-full border border-border dark:border-border-dark">
                  <Image src={entry.avatarUrl} alt={entry.login} fill sizes="48px" className="object-cover" />
                </div>
                <div className="min-w-0">
                  <p className="truncate font-medium text-ink dark:text-paper">{entry.login}</p>
                  <p className="text-xs text-muted dark:text-paper/60">{formatNumber(entry.total)} commits</p>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-2 text-xs text-muted dark:text-paper/65">
                <Metric label="Add" value={formatNumber(entry.additions)} />
                <Metric label="Del" value={formatNumber(entry.deletions)} />
                <Metric label="Weeks" value={formatNumber(entry.activeWeeks)} />
              </div>
            </div>
          ))}
        </div>

        <div className="min-h-[520px]" role="img" aria-label={`Top ${data.length} contributors ranked by total commits`}>
          <ResponsiveContainer width="100%" height={Math.max(440, data.length * 56 + 48)}>
            <BarChart data={data} layout="vertical" margin={{ top: 12, right: 24, bottom: 12, left: 12 }} barCategoryGap={18}>
              <defs>
                <linearGradient id="contributor-bar-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#ff9248" />
                  <stop offset="100%" stopColor="#ff4d00" />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="rgba(107,107,107,0.15)" strokeDasharray="3 3" horizontal={false} />
              <XAxis
                type="number"
                domain={[0, maxTotal]}
                tick={{ fill: "currentColor", fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => formatNumber(Number(value))}
              />
              <YAxis type="category" dataKey="login" hide />
              <RechartsTooltip content={<ContributorTooltip />} cursor={{ fill: "rgba(255,77,0,0.06)" }} />
              <Bar dataKey="total" radius={[0, 18, 18, 0]} animationBegin={120} animationDuration={700} fill="url(#contributor-bar-gradient)">
                {data.map((entry) => (
                  <Cell key={entry.login} fill={entry.barColor} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </Card>
  );
}

function ContributorTooltip({ active, payload }: ContributorTooltipProps): React.ReactNode {
  if (!active || !payload?.[0]) {
    return null;
  }

  const data = payload[0].payload;

  return (
    <div className="rounded-[1.25rem] border border-border bg-paper px-4 py-3 text-sm text-ink shadow-xl dark:border-border-dark dark:bg-surface dark:text-paper">
      <p className="font-medium">{data.login}</p>
      <p className="mt-1 text-muted dark:text-paper/68">{formatNumber(data.total)} commits</p>
      <p className="mt-1 text-xs text-muted dark:text-paper/60">
        +{formatNumber(data.additions)} / -{formatNumber(data.deletions)} · {formatNumber(data.activeWeeks)} active weeks
      </p>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }): React.ReactNode {
  return (
    <div className="rounded-2xl bg-paper px-3 py-2 text-center dark:bg-ink/20">
      <p className="text-[10px] uppercase tracking-[0.24em] text-muted dark:text-paper/55">{label}</p>
      <p className="mt-1 font-mono text-sm text-ink dark:text-paper">{value}</p>
    </div>
  );
}

function ContributorChartSkeleton(): React.ReactNode {
  return (
    <Card className="space-y-6">
      <Skeleton className="h-8 w-72 rounded-full" />
      <div className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
        <div className="space-y-4">
          {Array.from({ length: 10 }).map((_, index) => (
            <Skeleton key={index} className="h-24 rounded-[1.5rem]" />
          ))}
        </div>
        <Skeleton className="h-[560px] rounded-[2rem]" />
      </div>
    </Card>
  );
}
