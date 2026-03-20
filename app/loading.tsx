import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";

export default function Loading(): React.ReactNode {
  return (
    <main className="mx-auto min-h-[70vh] max-w-7xl px-6 py-20 lg:px-8">
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="space-y-4">
          <Skeleton className="h-4 w-40 rounded-full" />
          <Skeleton className="h-16 w-3/4 rounded-full" />
          <Skeleton className="h-5 w-full rounded-full" />
          <Skeleton className="h-5 w-2/3 rounded-full" />
        </Card>
        <Card className="space-y-4">
          <Skeleton className="h-4 w-40 rounded-full" />
          <Skeleton className="h-[420px] rounded-[2rem]" />
        </Card>
      </div>
    </main>
  );
}
