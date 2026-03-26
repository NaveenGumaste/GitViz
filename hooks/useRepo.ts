import { useEffect } from "react";
import { useRepoStore } from "@/stores/repoStore";

export function useRepo(owner: string, repo: string): void {
  const fetchAll = useRepoStore((state) => state.fetchAll);
  const currentRepo = useRepoStore((state) => state.currentRepo);
  const repoMeta = useRepoStore((state) => state.repoMeta);
  const isLoadingRepoMeta = useRepoStore((state) => state.isLoading.repoMeta);
  const repoError = useRepoStore((state) => state.errors.repoMeta);

  useEffect(() => {
    const isSameRepo = currentRepo?.owner === owner && currentRepo?.repo === repo;
    if (isSameRepo && (repoMeta || isLoadingRepoMeta) && !repoError) {
      return;
    }

    void fetchAll(owner, repo);
  }, [currentRepo?.owner, currentRepo?.repo, fetchAll, isLoadingRepoMeta, owner, repo, repoError, repoMeta]);
}
