"use client";

import { useEffect } from "react";
import { ErrorState } from "@/components/ui/ErrorState";

interface RepoErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function RepoError({ error, reset }: RepoErrorProps): React.ReactNode {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <section className="mx-auto flex min-h-[70vh] max-w-5xl items-center px-6 py-20 lg:px-8">
      <ErrorState title="Unable to load repository" message={error.message} onRetry={reset} className="w-full" />
    </section>
  );
}
