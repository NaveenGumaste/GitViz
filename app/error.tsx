"use client";

import { useEffect } from "react";
import { ErrorState } from "@/components/ui/ErrorState";

interface RootErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function RootError({ error, reset }: RootErrorProps): React.ReactNode {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="mx-auto flex min-h-[70vh] max-w-5xl items-center px-6 py-20 lg:px-8">
      <ErrorState title="Something went wrong" message={error.message} onRetry={reset} className="w-full" />
    </main>
  );
}
