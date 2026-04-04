import { describe, expect, test } from "bun:test";
import { buildCommitCountsFromCommits, buildHeatmapCells } from "@/lib/heatmap";
import type { Commit } from "@/lib/schemas/github";

const sampleCommits: Commit[] = [
	{
		sha: "a1",
		message: "feat: add parser",
		date: "2026-03-28T10:15:00.000Z",
		htmlUrl: "https://github.com/example/repo/commit/a1",
		authorLogin: "alice",
	},
	{
		sha: "a2",
		message: "fix: parser edge case",
		date: "2026-03-28T17:25:00.000Z",
		htmlUrl: "https://github.com/example/repo/commit/a2",
		authorLogin: "alice",
	},
	{
		sha: "b1",
		message: "docs: update readme",
		date: "2026-03-30T08:05:00.000Z",
		htmlUrl: "https://github.com/example/repo/commit/b1",
		authorLogin: "bob",
	},
];

describe("heatmap utilities", () => {
	test("builds daily commit counts from commits", () => {
		const counts = buildCommitCountsFromCommits(sampleCommits);

		expect(counts["2026-03-28"]).toBe(2);
		expect(counts["2026-03-30"]).toBe(1);
		expect(Object.values(counts).reduce((sum, count) => sum + count, 0)).toBe(
			3,
		);
	});

	test("maps UTC day keys into 52-week heatmap cells", () => {
		const counts = buildCommitCountsFromCommits(sampleCommits);
		const cells = buildHeatmapCells(
			counts,
			new Date("2026-04-04T12:00:00.000Z"),
		);

		expect(cells.length).toBeGreaterThanOrEqual(364);
		expect(cells.length).toBeLessThanOrEqual(371);

		const march28Cell = cells.find((cell) => cell.date === "2026-03-28");
		const march30Cell = cells.find((cell) => cell.date === "2026-03-30");

		expect(march28Cell?.count).toBe(2);
		expect(march28Cell?.dayIndex).toBe(6);
		expect(march30Cell?.count).toBe(1);
		expect(cells.some((cell) => cell.count > 0)).toBe(true);
	});
});
