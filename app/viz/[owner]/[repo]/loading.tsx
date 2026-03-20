import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";

export default function Loading(): React.ReactNode {
  return (
    <section className="mx-auto max-w-7xl px-6 py-10 lg:px-8">
      <div className="grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
        <Card className="space-y-4">
          <Skeleton className="size-20 rounded-3xl" />
          <Skeleton className="h-6 w-48 rounded-full" />
          <Skeleton className="h-4 w-full rounded-full" />
          <div className="grid grid-cols-2 gap-3">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-20 rounded-3xl" />
            ))}
          </div>
        </Card>
        <div className="space-y-6">
          <Skeleton className="h-16 rounded-[1.75rem]" />
          <Skeleton className="h-[680px] rounded-[2rem]" />
        </div>
      </div>
    </section>
  );
}
