import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <div className="glass-strong max-w-md rounded-[32px] border border-border/60 bg-card/80 p-8 text-center shadow-lg">
        <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground" />
        <h1 className="mt-4 text-2xl font-bold text-foreground">
          Brief Not Found
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          This research brief doesn&apos;t exist, has been made private, or the share link is invalid.
        </p>
        <Button asChild className="mt-6" size="lg">
          <Link href="/">Go to Homepage</Link>
        </Button>
      </div>
    </div>
  );
}
