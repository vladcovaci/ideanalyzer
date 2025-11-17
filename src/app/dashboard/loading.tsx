import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <div className="space-y-6 px-4 pt-6 lg:px-10">
      <div className="rounded-[32px] border border-border/60 bg-card/60 p-6">
        <Skeleton className="mb-4 h-6 w-1/3" />
        <Skeleton className="h-8 w-1/2" />
        <Skeleton className="mt-4 h-12 w-40" />
      </div>
      <div className="rounded-[32px] border border-border/60 bg-card/60 p-6">
        <Skeleton className="mb-4 h-5 w-1/4" />
        <div className="grid gap-4 md:grid-cols-3">
          <Skeleton className="h-36 rounded-2xl" />
          <Skeleton className="h-36 rounded-2xl" />
          <Skeleton className="h-36 rounded-2xl" />
        </div>
      </div>
      <div className="rounded-[32px] border border-border/60 bg-card/60 p-6">
        <Skeleton className="mb-4 h-5 w-1/3" />
        <div className="space-y-4">
          <Skeleton className="h-20 rounded-2xl" />
          <Skeleton className="h-20 rounded-2xl" />
          <Skeleton className="h-20 rounded-2xl" />
        </div>
      </div>
    </div>
  );
}
