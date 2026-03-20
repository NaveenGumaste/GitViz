"use client";

import { useMemo, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Sector,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
} from "recharts";
import { Card } from "@/components/ui/Card";
import { ErrorState } from "@/components/ui/ErrorState";
import { Skeleton } from "@/components/ui/Skeleton";
import type { RepoMeta } from "@/lib/schemas/github";
import { cn, formatNumber } from "@/lib/utils";

interface LanguageDonutProps {
  languages: Record<string, number> | null;
  repoMeta: RepoMeta | null;
  isLoading: boolean;
  error: string | null;
  onRetry: () => void;
}

interface LanguageDatum {
  name: string;
  value: number;
  color: string;
}

interface LanguageTooltipProps {
  active?: boolean;
  payload?: Array<{ payload: LanguageDatum }>;
}

const COLORS = ["#ff4d00", "#ff9248", "#ff6b6b", "#f4a261", "#ffb703", "#7dd3fc", "#4f83ff", "#6ee7b7", "#c77dff", "#f472b6"] as const;

export function LanguageDonut({ languages, repoMeta, isLoading, error, onRetry }: LanguageDonutProps): React.ReactNode {
  const [activeIndex, setActiveIndex] = useState(0);

  const data = useMemo(() => {
    if (!languages) {
      return [];
    }

    return Object.entries(languages)
      .sort((left, right) => right[1] - left[1])
      .map(([name, value], index) => ({
        name,
        value,
        color: COLORS[index % COLORS.length],
      }));
  }, [languages]);

  const totalBytes = useMemo(() => data.reduce((sum, entry) => sum + entry.value, 0), [data]);
  const primaryName = repoMeta?.primaryLanguage ?? data[0]?.name ?? "Mixed";

  if (isLoading && !languages) {
    return <LanguageDonutSkeleton />;
  }

  if (error && !languages) {
    return <ErrorState title="Language breakdown unavailable" message={error} onRetry={onRetry} variant={error.toLowerCase().includes("rate limit") ? "rate-limit" : "default"} />;
  }

  if (!languages || data.length === 0) {
    return (
      <Card className="flex min-h-[520px] items-center justify-center">
        <p className="text-sm text-muted dark:text-paper/65">No language information is available yet.</p>
      </Card>
    );
  }

  return (
    <Card className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-muted dark:text-paper/55">Language breakdown</p>
          <h3 className="font-display text-3xl leading-tight tracking-[-0.04em] text-ink dark:text-paper">The codebase by byte share.</h3>
        </div>
        <div className="rounded-full border border-border bg-surface-light px-4 py-2 text-sm text-muted dark:border-border-dark dark:bg-paper/5 dark:text-paper/68">
          {formatNumber(totalBytes)} bytes total
        </div>
      </div>

      <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_300px]">
        <div className="relative min-h-[440px]">
          <div className="absolute inset-x-0 top-[45%] z-10 flex flex-col items-center justify-center text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-muted dark:text-paper/55">Primary language</p>
            <p className="mt-2 font-display text-4xl tracking-[-0.04em] text-ink dark:text-paper">{primaryName}</p>
            <p className="mt-2 text-sm text-muted dark:text-paper/68">{formatNumber(totalBytes)} bytes across {data.length} languages</p>
          </div>

          <ResponsiveContainer width="100%" height={440}>
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={92}
                outerRadius={150}
                paddingAngle={3}
                activeIndex={activeIndex}
                activeShape={activeShape}
                onMouseEnter={(_, index) => setActiveIndex(index)}
                animationBegin={120}
                animationDuration={700}
              >
                {data.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
              <RechartsTooltip content={<LanguageTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-muted dark:text-paper/55">Legend</p>
          <div className="space-y-3">
            {data.map((entry) => {
              const percentage = totalBytes > 0 ? (entry.value / totalBytes) * 100 : 0;
              return (
                <button
                  key={entry.name}
                  type="button"
                  onMouseEnter={() => setActiveIndex(data.findIndex((item) => item.name === entry.name))}
                  className={cn(
                    "flex w-full items-center justify-between gap-4 rounded-[1.25rem] border border-border bg-surface-light px-4 py-3 text-left transition-all hover:-translate-y-0.5 dark:border-border-dark dark:bg-paper/5",
                    activeIndex === data.findIndex((item) => item.name === entry.name) ? "border-accent/50 shadow-md" : "",
                  )}
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span className={cn("size-3 rounded-full", colorClass(entry.color))} />
                    <span className="truncate font-medium text-ink dark:text-paper">{entry.name}</span>
                  </div>
                  <span className="text-sm text-muted dark:text-paper/65">{percentage.toFixed(1)}%</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </Card>
  );
}

function activeShape(props: unknown): React.ReactElement {
  const shape = props as {
    cx?: number;
    cy?: number;
    innerRadius?: number;
    outerRadius?: number;
    startAngle?: number;
    endAngle?: number;
    fill?: string;
  };

  if (shape.cx === undefined || shape.cy === undefined || shape.innerRadius === undefined || shape.outerRadius === undefined || shape.startAngle === undefined || shape.endAngle === undefined) {
    return <g />;
  }

  return (
    <Sector
      cx={shape.cx}
      cy={shape.cy}
      innerRadius={shape.innerRadius}
      outerRadius={shape.outerRadius + 8}
      startAngle={shape.startAngle}
      endAngle={shape.endAngle}
      fill={shape.fill}
      opacity={0.92}
    />
  );
}

function LanguageTooltip({ active, payload }: LanguageTooltipProps): React.ReactNode {
  if (!active || !payload?.[0]) {
    return null;
  }

  const data = payload[0].payload;

  return (
    <div className="rounded-[1.25rem] border border-border bg-paper px-4 py-3 text-sm text-ink shadow-xl dark:border-border-dark dark:bg-surface dark:text-paper">
      <p className="font-medium">{data.name}</p>
      <p className="mt-1 text-muted dark:text-paper/68">{formatNumber(data.value)} bytes</p>
    </div>
  );
}

function LanguageDonutSkeleton(): React.ReactNode {
  return (
    <Card className="space-y-6">
      <Skeleton className="h-8 w-72 rounded-full" />
      <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_300px]">
        <Skeleton className="h-[440px] rounded-[2rem]" />
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-14 rounded-[1.25rem]" />
          ))}
        </div>
      </div>
    </Card>
  );
}

function colorClass(color: string): string {
  switch (color) {
    case "#ff4d00":
      return "bg-[#ff4d00]";
    case "#ff9248":
      return "bg-[#ff9248]";
    case "#ff6b6b":
      return "bg-[#ff6b6b]";
    case "#f4a261":
      return "bg-[#f4a261]";
    case "#ffb703":
      return "bg-[#ffb703]";
    case "#7dd3fc":
      return "bg-[#7dd3fc]";
    case "#4f83ff":
      return "bg-[#4f83ff]";
    case "#6ee7b7":
      return "bg-[#6ee7b7]";
    case "#c77dff":
      return "bg-[#c77dff]";
    case "#f472b6":
      return "bg-[#f472b6]";
    default:
      return "bg-[#6b6b6b]";
  }
}
