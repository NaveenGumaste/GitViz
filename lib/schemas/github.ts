import { z } from "zod";

export interface RepoMeta {
  fullName: string;
  description: string | null;
  htmlUrl: string;
  ownerLogin: string;
  ownerAvatarUrl: string;
  stars: number;
  forks: number;
  openIssues: number;
  primaryLanguage: string | null;
  defaultBranch: string;
  updatedAt: string;
  isPrivate: boolean;
  topics: string[];
}

export interface TreeNode {
  name: string;
  path: string;
  kind: "folder" | "file";
  size?: number;
  extension?: string;
  children?: TreeNode[];
}

export interface Commit {
  sha: string;
  message: string;
  date: string;
  htmlUrl: string;
  authorLogin: string;
  authorAvatarUrl?: string;
  authorHtmlUrl?: string;
}

export interface Contributor {
  login: string;
  avatarUrl: string;
  htmlUrl: string;
  total: number;
  additions: number;
  deletions: number;
  activeWeeks: number;
}

export const RepoInputSchema = z
  .string()
  .trim()
  .min(1, "Enter a GitHub repository")
  .refine((value) => {
    const normalized = value
      .replace(/\/+$/, "")
      .replace(/^https?:\/\/(?:www\.)?github\.com\//i, "")
      .replace(/^github\.com\//i, "")
      .replace(/\.git$/i, "");

    return /^[\w.-]+\/[\w.-]+$/.test(normalized);
  }, "Invalid GitHub repo URL");

const GitHubRepoOwnerSchema = z.object({
  login: z.string(),
  avatar_url: z.string().url(),
});

const GitHubRepoResponseSchema = z.object({
  full_name: z.string(),
  description: z.string().nullable().optional(),
  html_url: z.string().url(),
  stargazers_count: z.number().int().nonnegative(),
  forks_count: z.number().int().nonnegative(),
  open_issues_count: z.number().int().nonnegative(),
  language: z.string().nullable().optional(),
  default_branch: z.string(),
  updated_at: z.string(),
  private: z.boolean(),
  topics: z.array(z.string()).optional(),
  owner: GitHubRepoOwnerSchema,
});

export const RepoMetaSchema = z.object({
  fullName: z.string(),
  description: z.string().nullable(),
  htmlUrl: z.string().url(),
  ownerLogin: z.string(),
  ownerAvatarUrl: z.string().url(),
  stars: z.number().int().nonnegative(),
  forks: z.number().int().nonnegative(),
  openIssues: z.number().int().nonnegative(),
  primaryLanguage: z.string().nullable(),
  defaultBranch: z.string(),
  updatedAt: z.string(),
  isPrivate: z.boolean(),
  topics: z.array(z.string()),
});

const GitHubTreeEntrySchema: z.ZodType<{
  path: string;
  mode: string;
  type: "tree" | "blob" | "commit";
  sha: string;
  size?: number;
  url?: string;
}> = z.object({
  path: z.string(),
  mode: z.string(),
  type: z.union([z.literal("tree"), z.literal("blob"), z.literal("commit")]),
  sha: z.string(),
  size: z.number().int().nonnegative().optional(),
  url: z.string().url().optional(),
});

const GitHubTreeResponseSchema = z.object({
  sha: z.string(),
  truncated: z.boolean(),
  tree: z.array(GitHubTreeEntrySchema),
});

export const TreeNodeSchema: z.ZodType<TreeNode> = z.lazy(() =>
  z.object({
    name: z.string(),
    path: z.string(),
    kind: z.union([z.literal("folder"), z.literal("file")]),
    size: z.number().int().nonnegative().optional(),
    extension: z.string().optional(),
    children: z.array(TreeNodeSchema).optional(),
  }),
);

const GitHubCommitAuthorSchema = z
  .object({
    name: z.string().optional(),
    email: z.string().optional(),
    date: z.string(),
  })
  .nullable();

const GitHubCommitListItemSchema = z.object({
  sha: z.string(),
  html_url: z.string().url(),
  commit: z.object({
    message: z.string(),
    author: GitHubCommitAuthorSchema,
  }),
  author: z
    .object({
      login: z.string(),
      avatar_url: z.string().url(),
      html_url: z.string().url(),
    })
    .nullable(),
});

export const CommitSchema = z.object({
  sha: z.string(),
  message: z.string(),
  date: z.string(),
  htmlUrl: z.string().url(),
  authorLogin: z.string(),
  authorAvatarUrl: z.string().url().optional(),
  authorHtmlUrl: z.string().url().optional(),
});

const GitHubContributorWeekSchema = z.object({
  w: z.number().int().nonnegative(),
  a: z.number().int(),
  d: z.number().int(),
  c: z.number().int().nonnegative(),
});

const GitHubContributorStatsItemSchema = z.object({
  total: z.number().int().nonnegative(),
  weeks: z.array(GitHubContributorWeekSchema),
  author: z
    .object({
      login: z.string(),
      avatar_url: z.string().url(),
      html_url: z.string().url(),
    })
    .nullable(),
});

export const ContributorSchema = z.object({
  login: z.string(),
  avatarUrl: z.string().url(),
  htmlUrl: z.string().url(),
  total: z.number().int().nonnegative(),
  additions: z.number().int(),
  deletions: z.number().int(),
  activeWeeks: z.number().int().nonnegative(),
});

export const LanguagesSchema = z.record(z.string(), z.number().nonnegative());

export type GitHubRepoResponse = z.infer<typeof GitHubRepoResponseSchema>;
export type GitHubTreeResponse = z.infer<typeof GitHubTreeResponseSchema>;
export type GitHubTreeEntry = z.infer<typeof GitHubTreeEntrySchema>;
export type GitHubCommitListItem = z.infer<typeof GitHubCommitListItemSchema>;
export type GitHubContributorStatsItem = z.infer<typeof GitHubContributorStatsItemSchema>;

export const githubSchemas = {
  repo: GitHubRepoResponseSchema,
  tree: GitHubTreeResponseSchema,
  treeEntry: GitHubTreeEntrySchema,
  commit: GitHubCommitListItemSchema,
  contributor: GitHubContributorStatsItemSchema,
};
