import { z } from "zod";
import {
	CommitSchema,
	ContributorSchema,
	LanguagesSchema,
	RepoMetaSchema,
	TreeNodeSchema,
	type Commit,
	type Contributor,
	type RepoMeta,
	type TreeNode,
} from "@/lib/schemas/github";

export interface RepoCacheData {
	repoMeta: RepoMeta | null;
	tree: TreeNode[] | null;
	commits: Commit[] | null;
	commitCountsByDate: Record<string, number>;
	contributors: Contributor[] | null;
	languages: Record<string, number> | null;
}

interface StorageLike {
	readonly length: number;
	key: (index: number) => string | null;
	getItem: (key: string) => string | null;
	setItem: (key: string, value: string) => void;
	removeItem: (key: string) => void;
}

const RepoCacheDataSchema = z.object({
	repoMeta: RepoMetaSchema.nullable(),
	tree: z.array(TreeNodeSchema).nullable(),
	commits: z.array(CommitSchema).nullable(),
	commitCountsByDate: z.record(z.string(), z.number().int().nonnegative()),
	contributors: z.array(ContributorSchema).nullable(),
	languages: LanguagesSchema.nullable(),
});

const RepoCacheEntrySchema = z.object({
	version: z.literal(1),
	owner: z.string().min(1),
	repo: z.string().min(1),
	expiresAt: z.number().int().positive(),
	data: RepoCacheDataSchema,
});

export const REPO_CACHE_TTL_MS = 48 * 60 * 60 * 1000;
export const REPO_CACHE_KEY_PREFIX = "gitviz:repo-cache:";

function resolveStorage(storage?: StorageLike): StorageLike | null {
	if (storage) {
		return storage;
	}

	if (
		typeof window === "undefined" ||
		typeof window.localStorage === "undefined"
	) {
		return null;
	}

	return window.localStorage;
}

function normalizeRepoSlug(owner: string, repo: string): string {
	return `${owner.trim().toLowerCase()}/${repo.trim().toLowerCase()}`;
}

function getRepoCacheKey(owner: string, repo: string): string {
	return `${REPO_CACHE_KEY_PREFIX}${normalizeRepoSlug(owner, repo)}`;
}

function parseCacheEntry(
	raw: string,
): z.infer<typeof RepoCacheEntrySchema> | null {
	try {
		const parsedJson: unknown = JSON.parse(raw);
		const parsedEntry = RepoCacheEntrySchema.safeParse(parsedJson);
		return parsedEntry.success ? parsedEntry.data : null;
	} catch {
		return null;
	}
}

export function pruneExpiredRepoCache(
	storage?: StorageLike,
	now = Date.now(),
): void {
	const storageRef = resolveStorage(storage);
	if (!storageRef) {
		return;
	}

	const cacheKeys: string[] = [];
	for (let index = 0; index < storageRef.length; index += 1) {
		const key = storageRef.key(index);
		if (key?.startsWith(REPO_CACHE_KEY_PREFIX)) {
			cacheKeys.push(key);
		}
	}

	for (const key of cacheKeys) {
		const raw = storageRef.getItem(key);
		if (!raw) {
			continue;
		}

		const parsed = parseCacheEntry(raw);
		if (!parsed || parsed.expiresAt <= now) {
			storageRef.removeItem(key);
		}
	}
}

export function readRepoCache(
	owner: string,
	repo: string,
	storage?: StorageLike,
	now = Date.now(),
): RepoCacheData | null {
	const storageRef = resolveStorage(storage);
	if (!storageRef) {
		return null;
	}

	pruneExpiredRepoCache(storageRef, now);

	const key = getRepoCacheKey(owner, repo);
	const raw = storageRef.getItem(key);
	if (!raw) {
		return null;
	}

	const parsed = parseCacheEntry(raw);
	if (!parsed || parsed.expiresAt <= now) {
		storageRef.removeItem(key);
		return null;
	}

	return parsed.data;
}

export function writeRepoCache(
	owner: string,
	repo: string,
	data: RepoCacheData,
	storage?: StorageLike,
	now = Date.now(),
): void {
	const storageRef = resolveStorage(storage);
	if (!storageRef) {
		return;
	}

	pruneExpiredRepoCache(storageRef, now);

	const key = getRepoCacheKey(owner, repo);
	const entry = {
		version: 1 as const,
		owner,
		repo,
		expiresAt: now + REPO_CACHE_TTL_MS,
		data,
	};

	storageRef.setItem(key, JSON.stringify(entry));
}

export function clearRepoCache(
	owner: string,
	repo: string,
	storage?: StorageLike,
): void {
	const storageRef = resolveStorage(storage);
	if (!storageRef) {
		return;
	}

	storageRef.removeItem(getRepoCacheKey(owner, repo));
}
