import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { SupportForm } from "@/components/dashboard/support-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { authOptions } from "@/lib/auth";

export default async function SupportPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <DashboardShell>
      <div className="space-y-12">
        <header className="space-y-2">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-muted-foreground">
            Support
          </p>
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">
              Get Help
            </h1>
            <p className="max-w-2xl text-muted-foreground">
              Have a question or need assistance? Send us a message and we&apos;ll
              get back to you within 24-48 hours.
            </p>
          </div>
        </header>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Support Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Contact Support</CardTitle>
                <CardDescription>
                  Fill out the form below and our support team will respond as
                  soon as possible.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <SupportForm
                  user={{
                    name: session.user.name || "",
                    email: session.user.email || "",
                  }}
                />
              </CardContent>
            </Card>
          </div>

          {/* Help Resources */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Help Resources</CardTitle>
                <CardDescription>
                  Find answers to common questions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold">Documentation</h3>
                  <p className="text-sm text-muted-foreground">
                    Browse our comprehensive documentation to learn about all
                    features.
                  </p>
                  <a
                    href="/docs"
                    className="text-sm text-primary hover:underline"
                  >
                    View docs →
                  </a>
                </div>
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold">FAQ</h3>
                  <p className="text-sm text-muted-foreground">
                    Quick answers to frequently asked questions.
                  </p>
                  <a
                    href="/faq"
                    className="text-sm text-primary hover:underline"
                  >
                    View FAQ →
                  </a>
                </div>
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold">Status</h3>
                  <p className="text-sm text-muted-foreground">
                    Check the current status of our services.
                  </p>
                  <a
                    href="https://status.example.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline"
                  >
                    View status →
                  </a>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Response Times</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Free</span>
                  <span className="font-medium">48-72 hours</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Starter</span>
                  <span className="font-medium">24-48 hours</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Growth</span>
                  <span className="font-medium">12-24 hours</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Scale</span>
                  <span className="font-medium">6-12 hours</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
