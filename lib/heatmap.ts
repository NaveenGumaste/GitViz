import * as d3 from "d3";
import type { Commit } from "@/lib/schemas/github";

export interface HeatmapCell {
	date: string;
	count: number;
	weekIndex: number;
	dayIndex: number;
}

export function buildCommitCountsFromCommits(
	commits: Commit[],
): Record<string, number> {
	return commits.reduce<Record<string, number>>((accumulator, commit) => {
		const key = commit.date.slice(0, 10);
		accumulator[key] = (accumulator[key] ?? 0) + 1;
		return accumulator;
	}, {});
}

export function buildHeatmapCells(
	commitCountsByDate: Record<string, number>,
	now = new Date(),
): HeatmapCell[] {
	const endDate = d3.utcDay.floor(now);
	const startDate = d3.utcDay.offset(endDate, -363);
	const firstSunday = d3.utcSunday.floor(startDate);
	const days = d3.utcDays(firstSunday, d3.utcDay.offset(endDate, 1));

	return days.map((date: Date) => {
		const day = d3.utcDay.floor(date);
		const key = day.toISOString().slice(0, 10);

		return {
			date: key,
			count: commitCountsByDate[key] ?? 0,
			weekIndex: d3.utcSunday.count(firstSunday, day),
			dayIndex: day.getUTCDay(),
		};
	});
}
