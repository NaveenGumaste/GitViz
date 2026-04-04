"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import * as d3 from "d3";
import { useTheme } from "next-themes";
import { Card } from "@/components/ui/Card";
import { ErrorState } from "@/components/ui/ErrorState";
import { Skeleton } from "@/components/ui/Skeleton";
import {
	buildCommitCountsFromCommits,
	buildHeatmapCells,
	type HeatmapCell,
} from "@/lib/heatmap";
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

const CELL_SIZE = 14;
const CELL_GAP = 4;
const CELL_STEP = CELL_SIZE + CELL_GAP;
const LABEL_GUTTER = 42;
const PADDING_LEFT = 36;
const PADDING_TOP = 24;
const NUM_DAYS = 7;

const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;

export function CommitHeatmap({
	commits,
	commitCountsByDate,
	isLoading,
	error,
	onRetry,
}: CommitHeatmapProps): React.ReactNode {
	const { resolvedTheme } = useTheme();
	const svgRef = useRef<SVGSVGElement | null>(null);
	const [hovered, setHovered] = useState<HoverState | null>(null);

	const themePalette = useMemo(() => {
		const isDark = resolvedTheme === "dark";
		return {
			emptyFill: isDark ? "#2a2a2a" : "#d7d0c5",
			lowFill: isDark ? "#3a2418" : "#fff0e4",
			accentFill: "#ff4d00",
		};
	}, [resolvedTheme]);

	const effectiveCommitCountsByDate = useMemo(() => {
		if (commits && commits.length > 0) {
			return buildCommitCountsFromCommits(commits);
		}

		return commitCountsByDate;
	}, [commits, commitCountsByDate]);

	const cells = useMemo(
		() => buildHeatmapCells(effectiveCommitCountsByDate),
		[effectiveCommitCountsByDate],
	);

	const totalCommits = useMemo(
		() =>
			Object.values(effectiveCommitCountsByDate).reduce(
				(sum, value) => sum + value,
				0,
			),
		[effectiveCommitCountsByDate],
	);
	const maxCount = useMemo(
		() => Math.max(1, ...cells.map((cell) => cell.count)),
		[cells],
	);

	/* Compute the number of weeks to size the SVG viewBox correctly */
	const numWeeks = useMemo(() => {
		if (cells.length === 0) return 53;
		return Math.max(...cells.map((c) => c.weekIndex)) + 1;
	}, [cells]);

	const svgWidth = PADDING_LEFT + LABEL_GUTTER + numWeeks * CELL_STEP;
	const svgHeight = PADDING_TOP + NUM_DAYS * CELL_STEP;

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
		return (
			<ErrorState
				title="Commit activity unavailable"
				message={error}
				onRetry={onRetry}
				variant={
					error.toLowerCase().includes("rate limit") ? "rate-limit" : "default"
				}
			/>
		);
	}

	if (!commits || commits.length === 0) {
		return (
			<Card className="flex min-h-[520px] items-center justify-center">
				<p className="text-sm text-muted dark:text-paper/65">
					There are no commits available to draw the heatmap yet.
				</p>
			</Card>
		);
	}

	return (
		<Card className="relative overflow-hidden">
			<div className="flex flex-wrap items-end justify-between gap-4">
				<div className="space-y-2">
					<p className="text-xs font-semibold uppercase tracking-[0.25em] text-muted dark:text-paper/55">
						Commit activity
					</p>
					<h3 className="font-display text-3xl leading-tight tracking-[-0.04em] text-ink dark:text-paper">
						52 weeks of contribution density.
					</h3>
				</div>
				<div className="rounded-full border border-border bg-surface-light px-4 py-2 text-sm text-muted dark:border-border-dark dark:bg-paper/5 dark:text-paper/68">
					{formatNumber(totalCommits)} commits
				</div>
			</div>

			<div className="relative mt-8">
				<svg
					ref={svgRef}
					className="w-full"
					viewBox={`0 0 ${svgWidth} ${svgHeight}`}
					preserveAspectRatio="xMinYMin meet"
					role="img"
					aria-label="Commit heatmap">
					<g transform={`translate(${PADDING_LEFT},${PADDING_TOP})`}>
						{dayLabels.map((label, index) => (
							<text
								key={label}
								x={0}
								y={index * CELL_STEP + CELL_SIZE - 1}
								className="fill-muted text-[10px] font-medium uppercase tracking-[0.2em] dark:fill-paper/55">
								{label}
							</text>
						))}

						{cells.map((cell) => {
							const x = cell.weekIndex * CELL_STEP + LABEL_GUTTER;
							const y = cell.dayIndex * CELL_STEP;
							const fill =
								cell.count === 0
									? themePalette.emptyFill
									: colorScale(
											cell.count,
											maxCount,
											themePalette.lowFill,
											themePalette.accentFill,
										);

							return (
								<rect
									key={cell.date}
									className="heatmap-cell"
									x={x}
									y={y}
									width={CELL_SIZE}
									height={CELL_SIZE}
									rx={4}
									fill={fill}
									onMouseEnter={() =>
										setHovered({ date: cell.date, count: cell.count })
									}
									onMouseLeave={() => setHovered(null)}
								/>
							);
						})}
					</g>
				</svg>

				{hovered ? (
					<div className="pointer-events-none absolute left-4 top-4 max-w-xs rounded-[1.5rem] border border-border bg-paper/95 p-4 text-ink shadow-xl backdrop-blur-sm dark:border-border-dark dark:bg-surface/95 dark:text-paper">
						<p className="text-xs font-semibold uppercase tracking-[0.25em] text-muted dark:text-paper/60">
							Hover details
						</p>
						<p className="mt-2 font-display text-2xl leading-tight">
							{formatDate(hovered.date)}
						</p>
						<p className="mt-2 text-sm text-muted dark:text-paper/70">
							{hovered.count === 0
								? "No commits on this date."
								: `${hovered.count} commit${hovered.count === 1 ? "" : "s"} on this date.`}
						</p>
					</div>
				) : null}

				<div className="absolute right-4 top-4 rounded-[1.5rem] border border-border bg-paper/90 p-4 shadow-lg backdrop-blur-sm dark:border-border-dark dark:bg-surface/90">
					<p className="text-xs font-semibold uppercase tracking-[0.25em] text-muted dark:text-paper/55">
						Legend
					</p>
					<div className="mt-3 flex items-center gap-2 text-sm text-muted dark:text-paper/68">
						<span
							className={cn(
								"size-3 rounded-sm",
								resolvedTheme === "dark" ? "bg-[#2a2a2a]" : "bg-[#d7d0c5]",
							)}
						/>
						<span>0</span>
						<span
							className={cn(
								"size-3 rounded-sm",
								resolvedTheme === "dark" ? "bg-[#3a2418]" : "bg-[#fff0e4]",
							)}
						/>
						<span>Low</span>
						<span className="size-3 rounded-sm bg-accent" />
						<span>High</span>
					</div>
				</div>
			</div>
		</Card>
	);
}

function colorScale(
	count: number,
	maxCount: number,
	lowFill: string,
	accentFill: string,
): string {
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
			<Skeleton className="h-[200px] rounded-[2rem]" />
		</Card>
	);
}
