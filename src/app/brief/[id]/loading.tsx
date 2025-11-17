import { Section } from "@/components/ui/section";
import { Skeleton } from "@/components/ui/skeleton";

export default function BriefLoading() {
  return (
    <div className="min-h-screen bg-muted/30">
      <header className="bg-gradient-to-b from-background to-muted/30">
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-4 px-6 py-12">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-12 w-3/4" />
          <div className="flex flex-wrap gap-3">
            <Skeleton className="h-7 w-24 rounded-full" />
            <Skeleton className="h-7 w-24 rounded-full" />
            <Skeleton className="h-7 w-32 rounded-full" />
          </div>
          <Skeleton className="h-16 w-full" />
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-6 py-12">
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-48 rounded-[32px]" />
          <Skeleton className="h-48 rounded-[32px]" />
        </div>
        <Skeleton className="h-80 rounded-[32px]" />
        <Section>
          <Skeleton className="h-96 rounded-[32px]" />
        </Section>
        <Skeleton className="h-96 rounded-[32px]" />
        <Skeleton className="h-44 rounded-[32px]" />
      </main>
    </div>
  );
}
