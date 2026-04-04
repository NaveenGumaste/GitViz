import { describe, expect, test } from "bun:test";
import {
	REPO_CACHE_KEY_PREFIX,
	REPO_CACHE_TTL_MS,
	pruneExpiredRepoCache,
	readRepoCache,
	type RepoCacheData,
	writeRepoCache,
} from "@/lib/repoCache";

class InMemoryStorage {
	private readonly values = new Map<string, string>();

	get length(): number {
		return this.values.size;
	}

	clear(): void {
		this.values.clear();
	}

	key(index: number): string | null {
		const keys = Array.from(this.values.keys());
		return keys[index] ?? null;
	}

	getItem(key: string): string | null {
		return this.values.get(key) ?? null;
	}

	setItem(key: string, value: string): void {
		this.values.set(key, value);
	}

	removeItem(key: string): void {
		this.values.delete(key);
	}
}

const sampleCacheData: RepoCacheData = {
	repoMeta: {
		fullName: "vercel/next.js",
		description: "React framework",
		htmlUrl: "https://github.com/vercel/next.js",
		ownerLogin: "vercel",
		ownerAvatarUrl: "https://avatars.githubusercontent.com/u/14985020?v=4",
		stars: 100,
		forks: 20,
		openIssues: 10,
		primaryLanguage: "TypeScript",
		defaultBranch: "canary",
		updatedAt: "2026-04-04T10:00:00.000Z",
		isPrivate: false,
		topics: ["react", "framework"],
	},
	tree: [
		{
			name: "app",
			path: "app",
			kind: "folder",
			children: [
				{
					name: "page.tsx",
					path: "app/page.tsx",
					kind: "file",
					size: 1200,
					extension: "tsx",
				},
			],
		},
	],
	commits: [
		{
			sha: "abc123",
			message: "Initial commit",
			date: "2026-04-04T10:00:00.000Z",
			htmlUrl: "https://github.com/vercel/next.js/commit/abc123",
			authorLogin: "vercel-bot",
			authorAvatarUrl: "https://avatars.githubusercontent.com/u/14985020?v=4",
			authorHtmlUrl: "https://github.com/vercel",
		},
	],
	commitCountsByDate: {
		"2026-04-04": 1,
	},
	contributors: [
		{
			login: "alice",
			avatarUrl: "https://avatars.githubusercontent.com/u/1?v=4",
			htmlUrl: "https://github.com/alice",
			total: 12,
			additions: 200,
			deletions: 50,
			activeWeeks: 8,
		},
	],
	languages: {
		TypeScript: 90,
		JavaScript: 10,
	},
};

describe("repo cache", () => {
	test("returns cached repo data before TTL expiry", () => {
		const storage = new InMemoryStorage();
		const now = Date.UTC(2026, 3, 4, 10, 0, 0);

		writeRepoCache("Vercel", "Next.js", sampleCacheData, storage, now);

		const cached = readRepoCache(
			"vercel",
			"next.js",
			storage,
			now + REPO_CACHE_TTL_MS - 1,
		);
		expect(cached).toEqual(sampleCacheData);
	});

	test("removes cached repo data after TTL expiry", () => {
		const storage = new InMemoryStorage();
		const now = Date.UTC(2026, 3, 4, 10, 0, 0);

		writeRepoCache("vercel", "next.js", sampleCacheData, storage, now);

		const cached = readRepoCache(
			"vercel",
			"next.js",
			storage,
			now + REPO_CACHE_TTL_MS + 1,
		);
		expect(cached).toBeNull();
		expect(storage.length).toBe(0);
	});

	test("prunes invalid or expired cache entries while keeping valid ones", () => {
		const storage = new InMemoryStorage();
		const now = Date.UTC(2026, 3, 4, 10, 0, 0);

		writeRepoCache(
			"vercel",
			"expired",
			sampleCacheData,
			storage,
			now - REPO_CACHE_TTL_MS - 10,
		);
		writeRepoCache("vercel", "fresh", sampleCacheData, storage, now);
		storage.setItem(`${REPO_CACHE_KEY_PREFIX}broken/entry`, "{not-json");

		pruneExpiredRepoCache(storage, now);

		const expired = readRepoCache("vercel", "expired", storage, now);
		const fresh = readRepoCache("vercel", "fresh", storage, now);

		expect(expired).toBeNull();
		expect(fresh).toEqual(sampleCacheData);
		expect(storage.length).toBe(1);
	});
});
