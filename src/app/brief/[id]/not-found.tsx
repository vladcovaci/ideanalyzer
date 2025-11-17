import Link from "next/link";

export default function BriefNotFound() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center gap-4 text-center">
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold text-foreground">
          Brief not found
        </h2>
        <p className="text-sm text-muted-foreground">
          We couldn’t find that research brief. It may have been removed or you may not have access.
        </p>
      </div>
      <Link
        href="/dashboard"
        className="text-sm font-medium text-primary underline-offset-4 hover:underline"
      >
        Back to Dashboard
      </Link>
    </div>
  );
}
