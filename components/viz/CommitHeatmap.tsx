"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import * as d3 from "d3";
import { useTheme } from "next-themes";
import { Card } from "@/components/ui/Card";
import { ErrorState } from "@/components/ui/ErrorState";
import { Skeleton } from "@/components/ui/Skeleton";
import { cn, formatDate, formatNumber } from "@/lib/utils";
import type { Commit } from "@/lib/schemas/github";

interface CommitHeatmapProps {
  commits: Commit[] | null;
  commitCountsByDate: Record<string, number>;
  isLoading: boolean;
  error: string | null;
  onRetry: () => void;
}

interface HoverState {
  date: string;
  count: number;
}

interface HeatmapSize {
  width: number;
  height: number;
}

export function CommitHeatmap({
  commits,
  commitCountsByDate,
  isLoading,
  error,
  onRetry,
}: CommitHeatmapProps): React.ReactNode {
  const { resolvedTheme } = useTheme();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [hovered, setHovered] = useState<HoverState | null>(null);
  const [size, setSize] = useState<HeatmapSize>({ width: 0, height: 0 });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return undefined;
    }

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) {
        return;
      }

      const width = entry.contentRect.width;
      const height = Math.max(420, Math.round(width * 0.4));
      setSize({ width, height });
    });

    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  const themePalette = useMemo(() => {
    const isDark = resolvedTheme === "dark";
    return {
      emptyFill: isDark ? "#2a2a2a" : "#d7d0c5",
      lowFill: isDark ? "#3a2418" : "#fff0e4",
      accentFill: "#ff4d00",
    };
  }, [resolvedTheme]);

  const cells = useMemo(() => buildCells(commitCountsByDate), [commitCountsByDate]);
  const monthTicks = useMemo(() => buildMonthTicks(cells), [cells]);
  const totalCommits = useMemo(() => Object.values(commitCountsByDate).reduce((sum, value) => sum + value, 0), [commitCountsByDate]);
  const maxCount = useMemo(() => Math.max(1, ...cells.map((cell) => cell.count)), [cells]);

  useEffect(() => {
    if (!svgRef.current) {
      return;
    }

    d3.select(svgRef.current)
      .selectAll<SVGRectElement, HeatmapCell>("rect.heatmap-cell")
      .attr("opacity", 0)
      .transition()
      .duration(300)
      .ease(d3.easeCubicOut)
      .attr("opacity", 1);
  }, [cells, themePalette]);

  if (isLoading && !commits) {
    return <CommitHeatmapSkeleton />;
  }

  if (error && !commits) {
    return <ErrorState title="Commit activity unavailable" message={error} onRetry={onRetry} variant={error.toLowerCase().includes("rate limit") ? "rate-limit" : "default"} />;
  }

  if (!commits || commits.length === 0) {
    return (
      <Card className="flex min-h-[520px] items-center justify-center">
        <p className="text-sm text-muted dark:text-paper/65">There are no commits available to draw the heatmap yet.</p>
      </Card>
    );
  }

  return (
    <Card className="relative overflow-hidden">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-muted dark:text-paper/55">Commit activity</p>
          <h3 className="font-display text-3xl leading-tight tracking-[-0.04em] text-ink dark:text-paper">52 weeks of contribution density.</h3>
        </div>
        <div className="rounded-full border border-border bg-surface-light px-4 py-2 text-sm text-muted dark:border-border-dark dark:bg-paper/5 dark:text-paper/68">
          {formatNumber(totalCommits)} commits
        </div>
      </div>

      <div ref={containerRef} className="relative mt-8 min-h-[520px]">
        <svg
          ref={svgRef}
          className="h-full w-full"
          viewBox={`0 0 ${size.width || 1000} ${size.height || 520}`}
          role="img"
          aria-label={`Commit heatmap for the last 52 weeks with ${formatNumber(totalCommits)} commits`}
        >
          <g transform={`translate(36,24)`}>
            {monthTicks.map((month) => (
              <text
                key={month.label + month.weekIndex}
                x={month.weekIndex * (CELL_SIZE + CELL_GAP) + 42}
                y={-8}
                className="fill-muted text-[10px] font-medium uppercase tracking-[0.2em] dark:fill-paper/55"
              >
                {month.label}
              </text>
            ))}

            {dayLabels.map((label, index) => (
              <text
                key={label}
                x={0}
                y={index * (CELL_SIZE + CELL_GAP) + CELL_SIZE - 1}
                className="fill-muted text-[10px] font-medium uppercase tracking-[0.2em] dark:fill-paper/55"
              >
                {label}
              </text>
            ))}

            {cells.map((cell) => {
              const x = cell.weekIndex * (CELL_SIZE + CELL_GAP) + 42;
              const y = cell.dayIndex * (CELL_SIZE + CELL_GAP);
              const fill = cell.count === 0 ? themePalette.emptyFill : colorScale(cell.count, maxCount, themePalette.lowFill, themePalette.accentFill);

              return (
                <rect
                  key={cell.date}
                  className="heatmap-cell rounded-[4px]"
                  x={x}
                  y={y}
                  width={CELL_SIZE}
                  height={CELL_SIZE}
                  rx={4}
                  fill={fill}
                  onMouseEnter={() => setHovered({ date: cell.date, count: cell.count })}
                  onMouseLeave={() => setHovered(null)}
                />
              );
            })}
          </g>
        </svg>

        {hovered ? (
          <div className="pointer-events-none absolute left-4 top-4 max-w-xs rounded-[1.5rem] border border-border bg-paper/95 p-4 text-ink shadow-xl backdrop-blur-sm dark:border-border-dark dark:bg-surface/95 dark:text-paper">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-muted dark:text-paper/60">Hover details</p>
            <p className="mt-2 font-display text-2xl leading-tight">{formatDate(hovered.date)}</p>
            <p className="mt-2 text-sm text-muted dark:text-paper/70">
              {hovered.count === 0 ? "No commits on this date." : `${hovered.count} commit${hovered.count === 1 ? "" : "s"} on this date.`}
            </p>
          </div>
        ) : null}

        <div className="absolute right-4 top-4 rounded-[1.5rem] border border-border bg-paper/90 p-4 shadow-lg backdrop-blur-sm dark:border-border-dark dark:bg-surface/90">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-muted dark:text-paper/55">Legend</p>
          <div className="mt-3 space-y-2 text-sm text-muted dark:text-paper/68">
            <div
              className={cn(
                "h-3 w-36 rounded-full",
                resolvedTheme === "dark"
                  ? "bg-[linear-gradient(90deg,#2a2a2a_0%,#3a2418_35%,#ff4d00_100%)]"
                  : "bg-[linear-gradient(90deg,#d7d0c5_0%,#fff0e4_35%,#ff4d00_100%)]",
              )}
              aria-hidden="true"
            />
            <div className="flex items-center justify-between">
              <span>0</span>
              <span>Low</span>
              <span>High</span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}

interface HeatmapCell {
  date: string;
  count: number;
  weekIndex: number;
  dayIndex: number;
}

interface MonthTick {
  weekIndex: number;
  label: string;
}

const CELL_SIZE = 14;
const CELL_GAP = 4;
const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;

function buildCells(commitCountsByDate: Record<string, number>): HeatmapCell[] {
  const endDate = d3.timeDay.floor(new Date());
  const startDate = d3.timeDay.offset(endDate, -363);
  const firstSunday = d3.timeSunday.floor(startDate);
  const days = d3.timeDays(firstSunday, d3.timeDay.offset(endDate, 1));

  return days.map((date: Date) => {
    const day = d3.timeDay.floor(date);
    const weekIndex = d3.timeSunday.count(firstSunday, day);

    return {
      date: day.toISOString().slice(0, 10),
      count: commitCountsByDate[day.toISOString().slice(0, 10)] ?? 0,
      weekIndex,
      dayIndex: day.getDay(),
    };
  });
}

function buildMonthTicks(cells: HeatmapCell[]): MonthTick[] {
  const seen = new Set<string>();
  const formatter = new Intl.DateTimeFormat("en-US", { month: "short" });

  return cells
    .filter((cell) => {
      const date = new Date(`${cell.date}T00:00:00Z`);
      const key = `${date.getUTCFullYear()}-${date.getUTCMonth()}`;

      if (seen.has(key)) {
        return false;
      }

      if (date.getUTCDate() > 7 && cell.weekIndex !== 0) {
        return false;
      }

      seen.add(key);
      return true;
    })
    .map((cell) => ({
      weekIndex: cell.weekIndex,
      label: formatter.format(new Date(`${cell.date}T00:00:00Z`)),
    }));
}

function colorScale(count: number, maxCount: number, lowFill: string, accentFill: string): string {
  if (maxCount <= 1) {
    return count > 0 ? accentFill : lowFill;
  }

  const ratio = count / maxCount;
  const mix = d3.interpolateRgb(lowFill, accentFill)(Math.max(0.1, ratio));
  return mix;
}

function CommitHeatmapSkeleton(): React.ReactNode {
  return (
    <Card className="space-y-4">
      <Skeleton className="h-8 w-64 rounded-full" />
      <Skeleton className="h-[520px] rounded-[2rem]" />
    </Card>
  );
}
