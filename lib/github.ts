import { z } from "zod";
import {
  type Commit,
  type Contributor,
  type GitHubCommitListItem,
  type GitHubContributorStatsItem,
  type GitHubRepoResponse,
  type GitHubTreeEntry,
  type RepoMeta,
  type TreeNode,
  CommitSchema,
  ContributorSchema,
  LanguagesSchema,
  RepoMetaSchema,
  TreeNodeSchema,
  githubSchemas,
} from "@/lib/schemas/github";

export type GitHubApiErrorCode = "rate_limit" | "not_found" | "unauthorized" | "validation_error" | "api_error" | "parse_error";

export class GitHubApiError extends Error {
  readonly status: number;

  readonly code: GitHubApiErrorCode;

  readonly retryAfter?: number;

  constructor(message: string, status: number, code: GitHubApiErrorCode, retryAfter?: number) {
    super(message);
    this.name = "GitHubApiError";
    this.status = status;
    this.code = code;
    this.retryAfter = retryAfter;
  }
}

interface GitHubErrorBody {
  message?: string;
  documentation_url?: string;
  errors?: Array<Record<string, unknown>>;
}

const JSON_HEADERS = {
  Accept: "application/vnd.github+json",
  "X-GitHub-Api-Version": "2022-11-28",
};

function buildHeaders(token?: string): HeadersInit {
  return token
    ? {
        ...JSON_HEADERS,
        Authorization: `Bearer ${token}`,
      }
    : JSON_HEADERS;
}

async function readJsonBody(response: Response): Promise<unknown> {
  const text = await response.text();

  if (!text) {
    return undefined;
  }

  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
}

function parseErrorBody(body: unknown): GitHubErrorBody {
  return z
    .object({
      message: z.string().optional(),
      documentation_url: z.string().optional(),
      errors: z.array(z.record(z.string(), z.unknown())).optional(),
    })
    .passthrough()
    .safeParse(body).success
    ? (body as GitHubErrorBody)
    : {};
}

function createGitHubError(response: Response, body: unknown): GitHubApiError {
  const parsed = parseErrorBody(body);
  const remaining = response.headers.get("x-ratelimit-remaining");
  const retryAfter = response.headers.get("retry-after");
  const retryAfterSeconds = retryAfter ? Number.parseInt(retryAfter, 10) : undefined;
  const message = parsed.message ?? `GitHub request failed with status ${response.status}`;

  if (response.status === 404) {
    return new GitHubApiError(message || "Repository not found", 404, "not_found");
  }

  if (response.status === 401) {
    return new GitHubApiError("GitHub authentication failed. Please sign in again.", 401, "unauthorized");
  }

  if (response.status === 429 || remaining === "0" || message.toLowerCase().includes("rate limit")) {
    return new GitHubApiError(
      "GitHub rate limit hit. Sign in with GitHub to get the higher authenticated limit.",
      response.status,
      "rate_limit",
      retryAfterSeconds,
    );
  }

  if (response.status === 422) {
    return new GitHubApiError(message, 422, "validation_error");
  }

  return new GitHubApiError(message, response.status, "api_error");
}

async function requestJson(url: string, token?: string): Promise<unknown> {
  const response = await fetch(url, {
    cache: "no-store",
    headers: buildHeaders(token),
  });

  const body = await readJsonBody(response);

  if (!response.ok) {
    throw createGitHubError(response, body);
  }

  return body;
}

function mapRepoResponse(raw: GitHubRepoResponse): RepoMeta {
  const mapped = {
    fullName: raw.full_name,
    description: raw.description ?? null,
    htmlUrl: raw.html_url,
    ownerLogin: raw.owner.login,
    ownerAvatarUrl: raw.owner.avatar_url,
    stars: raw.stargazers_count,
    forks: raw.forks_count,
    openIssues: raw.open_issues_count,
    primaryLanguage: raw.language ?? null,
    defaultBranch: raw.default_branch,
    updatedAt: raw.updated_at,
    isPrivate: raw.private,
    topics: raw.topics ?? [],
  };

  return RepoMetaSchema.parse(mapped);
}

function mapTreeEntries(entries: GitHubTreeEntry[]): TreeNode[] {
  const root: TreeNode[] = [];

  const findOrCreateChild = (nodes: TreeNode[], name: string, path: string, kind: "folder" | "file"): TreeNode => {
    const existing = nodes.find((node) => node.name === name);
    if (existing) {
      return existing;
    }

    const created: TreeNode = {
      name,
      path,
      kind,
      children: [],
    };

    nodes.push(created);
    return created;
  };

  for (const entry of entries) {
    const segments = entry.path.split("/");
    let children = root;
    let currentPath = "";

    for (let index = 0; index < segments.length; index += 1) {
      const segment = segments[index];
      currentPath = currentPath ? `${currentPath}/${segment}` : segment;
      const isLeaf = index === segments.length - 1;
      const kind = isLeaf ? (entry.type === "tree" ? "folder" : "file") : "folder";
      const node = findOrCreateChild(children, segment, currentPath, kind);

      if (isLeaf) {
        node.kind = kind;
        node.size = entry.size;
        node.extension = entry.type === "blob" && segment.includes(".") ? segment.split(".").pop() : undefined;
        if (node.children && node.children.length === 0) {
          delete node.children;
        }
      } else {
        node.kind = "folder";
        node.children ??= [];
        children = node.children;
      }
    }
  }

  return root;
}

export async function getRepoMeta(owner: string, repo: string, token?: string): Promise<RepoMeta> {
  const raw = (await requestJson(`https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`, token)) as unknown;
  const parsed = githubSchemas.repo.parse(raw);
  return mapRepoResponse(parsed);
}

export async function getBranchSha(owner: string, repo: string, branch: string, token?: string): Promise<string> {
  const raw = (await requestJson(
    `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/branches/${encodeURIComponent(branch)}`,
    token,
  )) as unknown;

  const parsed = z
    .object({
      commit: z.object({
        sha: z.string(),
      }),
    })
    .parse(raw);

  return parsed.commit.sha;
}

export async function getRepoTree(owner: string, repo: string, sha: string, token?: string): Promise<TreeNode[]> {
  const raw = (await requestJson(
    `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/git/trees/${encodeURIComponent(sha)}?recursive=1`,
    token,
  )) as unknown;
  const parsed = githubSchemas.tree.parse(raw);
  const mapped = mapTreeEntries(parsed.tree);
  TreeNodeSchema.array().parse(mapped);
  return mapped;
}

export async function resolveTreeFromDefaultBranch(owner: string, repo: string, token?: string): Promise<TreeNode[]> {
  const repoMeta = await getRepoMeta(owner, repo, token);
  const sha = await getBranchSha(owner, repo, repoMeta.defaultBranch, token);
  return getRepoTree(owner, repo, sha, token);
}

export async function getCommits(owner: string, repo: string, token?: string): Promise<Commit[]> {
  const commits: Commit[] = [];

  for (let page = 1; page <= 5; page += 1) {
    const raw = (await requestJson(
      `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/commits?per_page=100&page=${page}`,
      token,
    )) as unknown;
    const parsed = z.array(githubSchemas.commit).parse(raw) as GitHubCommitListItem[];

    for (const item of parsed) {
      const mapped = {
        sha: item.sha,
        message: item.commit.message,
        date: item.commit.author?.date ?? new Date().toISOString(),
        htmlUrl: item.html_url,
        authorLogin: item.author?.login ?? item.commit.author?.name ?? "unknown",
        authorAvatarUrl: item.author?.avatar_url,
        authorHtmlUrl: item.author?.html_url,
      };

      commits.push(CommitSchema.parse(mapped));
    }

    if (parsed.length < 100) {
      break;
    }
  }

  return commits;
}

async function requestContributorStats(owner: string, repo: string, token?: string): Promise<unknown> {
  const url = `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/stats/contributors`;

  for (let attempt = 0; attempt < 6; attempt += 1) {
    const response = await fetch(url, {
      cache: "no-store",
      headers: buildHeaders(token),
    });

    if (response.status === 202) {
      await new Promise((resolve) => setTimeout(resolve, 1000 + attempt * 500));
      continue;
    }

    const body = await readJsonBody(response);

    if (!response.ok) {
      throw createGitHubError(response, body);
    }

    return body;
  }

  throw new GitHubApiError("GitHub is still preparing contributor stats. Please try again shortly.", 202, "api_error");
}

export async function getContributorStats(owner: string, repo: string, token?: string): Promise<Contributor[]> {
  const raw = (await requestContributorStats(owner, repo, token)) as unknown;
  const parsed = z.array(githubSchemas.contributor).parse(raw) as GitHubContributorStatsItem[];
  const mapped = parsed.map((entry) => {
    const additions = entry.weeks.reduce((sum, week) => sum + week.a, 0);
    const deletions = entry.weeks.reduce((sum, week) => sum + week.d, 0);

    return ContributorSchema.parse({
      login: entry.author?.login ?? "unknown",
      avatarUrl: entry.author?.avatar_url ?? `https://avatars.githubusercontent.com/u/0?v=4`,
      htmlUrl: entry.author?.html_url ?? `https://github.com/${encodeURIComponent(entry.author?.login ?? "unknown")}`,
      total: entry.total,
      additions,
      deletions,
      activeWeeks: entry.weeks.filter((week) => week.c > 0).length,
    });
  });

  return mapped;
}

export async function getLanguages(owner: string, repo: string, token?: string): Promise<Record<string, number>> {
  const raw = (await requestJson(
    `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/languages`,
    token,
  )) as unknown;
  return LanguagesSchema.parse(raw);
}
