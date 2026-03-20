import { create } from "zustand";
import { z } from "zod";
import {
  type Commit,
  type Contributor,
  type RepoMeta,
  type TreeNode,
  CommitSchema,
  ContributorSchema,
  LanguagesSchema,
  RepoMetaSchema,
  TreeNodeSchema,
} from "@/lib/schemas/github";
import { formatNumber } from "@/lib/utils";

export type RepoTab = "tree" | "heatmap" | "contributors" | "languages";

interface RepoStoreData {
  repoMeta: RepoMeta | null;
  tree: TreeNode[] | null;
  commits: Commit[] | null;
  commitCountsByDate: Record<string, number>;
  contributors: Contributor[] | null;
  languages: Record<string, number> | null;
}

interface RepoStoreState extends RepoStoreData {
  currentRepo: { owner: string; repo: string } | null;
  isLoading: Record<keyof RepoStoreData, boolean>;
  errors: Record<keyof RepoStoreData, string | null>;
  activeTab: RepoTab;
  setActiveTab: (tab: RepoTab) => void;
  fetchAll: (owner: string, repo: string) => Promise<void>;
  refresh: () => Promise<void>;
  reset: () => void;
}

const emptyData: RepoStoreData = {
  repoMeta: null,
  tree: null,
  commits: null,
  commitCountsByDate: {},
  contributors: null,
  languages: null,
};

const emptyLoading: Record<keyof RepoStoreData, boolean> = {
  repoMeta: false,
  tree: false,
  commits: false,
  commitCountsByDate: false,
  contributors: false,
  languages: false,
};

const emptyErrors: Record<keyof RepoStoreData, string | null> = {
  repoMeta: null,
  tree: null,
  commits: null,
  commitCountsByDate: null,
  contributors: null,
  languages: null,
};

const RouteErrorSchema = z.object({
  error: z.string(),
  code: z.string().optional(),
});

async function parseRouteResponse<T>(response: Response, schema: z.ZodType<T>): Promise<T> {
  const body: unknown = await response.json();

  if (!response.ok) {
    const parsedError = RouteErrorSchema.safeParse(body);
    throw new Error(parsedError.success ? parsedError.data.error : `Request failed with status ${response.status}`);
  }

  return schema.parse(body);
}

function buildCommitCounts(commits: Commit[]): Record<string, number> {
  return commits.reduce<Record<string, number>>((accumulator, commit) => {
    const key = commit.date.slice(0, 10);
    accumulator[key] = (accumulator[key] ?? 0) + 1;
    return accumulator;
  }, {});
}

function formatRequestError(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return "Unexpected request failure";
}

async function fetchRouteData<T>(url: string, schema: z.ZodType<T>): Promise<T> {
  const response = await fetch(url, { cache: "no-store" });
  return parseRouteResponse(response, schema);
}

export const useRepoStore = create<RepoStoreState>((set, get) => ({
  ...emptyData,
  currentRepo: null,
  isLoading: emptyLoading,
  errors: emptyErrors,
  activeTab: "tree",
  setActiveTab: (tab) => set({ activeTab: tab }),
  reset: () =>
    set({
      ...emptyData,
      currentRepo: null,
      isLoading: emptyLoading,
      errors: emptyErrors,
      activeTab: "tree",
    }),
  refresh: async () => {
    const current = get().currentRepo;
    if (!current) {
      return;
    }

    await get().fetchAll(current.owner, current.repo);
  },
  fetchAll: async (owner, repo) => {
    set({
      currentRepo: { owner, repo },
      isLoading: {
        repoMeta: true,
        tree: true,
        commits: true,
        commitCountsByDate: true,
        contributors: true,
        languages: true,
      },
      errors: emptyErrors,
      ...emptyData,
    });

    try {
      const baseParams = new URLSearchParams({ owner, repo });
      const repoMeta = await fetchRouteData(`/api/github/repo?${baseParams.toString()}`, RepoMetaSchema);
      const treeParams = new URLSearchParams({ owner, repo, branch: repoMeta.defaultBranch });

      const [treeResult, commitsResult, contributorsResult, languagesResult] = await Promise.allSettled([
        fetchRouteData(`/api/github/tree?${treeParams.toString()}`, TreeNodeSchema.array()),
        fetchRouteData(`/api/github/commits?${baseParams.toString()}`, CommitSchema.array()),
        fetchRouteData(`/api/github/contributors?${baseParams.toString()}`, ContributorSchema.array()),
        fetchRouteData(`/api/github/languages?${baseParams.toString()}`, LanguagesSchema),
      ]);

      const nextData: RepoStoreData = {
        repoMeta,
        tree: null,
        commits: null,
        commitCountsByDate: {},
        contributors: null,
        languages: null,
      };

      const nextErrors: Record<keyof RepoStoreData, string | null> = {
        repoMeta: null,
        tree: null,
        commits: null,
        commitCountsByDate: null,
        contributors: null,
        languages: null,
      };

      if (treeResult.status === "fulfilled") {
        nextData.tree = treeResult.value;
      } else {
        nextErrors.tree = formatRequestError(treeResult.reason);
      }

      if (commitsResult.status === "fulfilled") {
        nextData.commits = commitsResult.value;
        nextData.commitCountsByDate = buildCommitCounts(commitsResult.value);
      } else {
        nextErrors.commits = formatRequestError(commitsResult.reason);
        nextErrors.commitCountsByDate = nextErrors.commits;
      }

      if (contributorsResult.status === "fulfilled") {
        nextData.contributors = contributorsResult.value;
      } else {
        nextErrors.contributors = formatRequestError(contributorsResult.reason);
      }

      if (languagesResult.status === "fulfilled") {
        nextData.languages = languagesResult.value;
      } else {
        nextErrors.languages = formatRequestError(languagesResult.reason);
      }

      set({
        ...nextData,
        errors: nextErrors,
        isLoading: {
          repoMeta: false,
          tree: false,
          commits: false,
          commitCountsByDate: false,
          contributors: false,
          languages: false,
        },
      });
    } catch (error) {
      const message = formatRequestError(error);
      set({
        errors: {
          repoMeta: message,
          tree: message,
          commits: message,
          commitCountsByDate: message,
          contributors: message,
          languages: message,
        },
        isLoading: {
          repoMeta: false,
          tree: false,
          commits: false,
          commitCountsByDate: false,
          contributors: false,
          languages: false,
        },
      });
    }
  },
}));

export const selectRepoSummary = (state: RepoStoreState): string => {
  if (!state.repoMeta) {
    return "Loading repository";
  }

  return `${state.repoMeta.fullName} · ${formatNumber(state.repoMeta.stars)} stars`;
};
