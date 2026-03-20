import { useEffect } from "react";
import { useRepoStore } from "@/stores/repoStore";

export function useRepo(owner: string, repo: string): void {
  const fetchAll = useRepoStore((state) => state.fetchAll);

  useEffect(() => {
    void fetchAll(owner, repo);
  }, [fetchAll, owner, repo]);
}
