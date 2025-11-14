import { getServerSession } from "next-auth";

import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { PasswordUpdateDialog } from "@/components/dashboard/password-update-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { authOptions } from "@/lib/auth";

const getInitials = (name?: string | null, email?: string | null) => {
  if (name) {
    const initials = name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? "")
      .join("");
    if (initials) {
      return initials;
    }
  }
  if (email) {
    return email[0]?.toUpperCase() ?? "U";
  }
  return "U";
};

export default async function AccountPage() {
  const session = await getServerSession(authOptions);
  const user = session?.user;
  const displayName =
    user?.name?.trim() || (user?.email ? user.email.split("@")[0] : "Your name");
  const displayEmail = user?.email?.trim() || "you@example.com";

  return (
    <DashboardShell>
      <div className="space-y-12">
        <header className="space-y-2">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-muted-foreground">
            Account
          </p>
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Profile settings</h1>
          <p className="text-muted-foreground max-w-2xl">
            Control how your information appears across the workspace. All changes synchronise instantly across any connected integrations.
          </p>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <Card className="h-full">
          <CardHeader>
            <CardTitle>Personal details</CardTitle>
            <CardDescription>
              Update your avatar, display name and primary contact information.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-start gap-4 rounded-2xl border border-[color:var(--glass-border)] bg-[color:var(--glass-surface)] p-4">
              <Avatar className="h-16 w-16 rounded-2xl">
                {user?.image ? (
                  <AvatarImage src={user.image} alt={displayName} />
                ) : null}
                <AvatarFallback className="rounded-2xl text-base">
                  {getInitials(user?.name, user?.email)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-2 text-sm">
                <p className="font-medium text-foreground">{displayName}</p>
                <p className="text-muted-foreground">
                  {displayEmail}
                </p>
              </div>
            </div>

            <Separator className="bg-[color:var(--glass-border)]" />

            <form className="space-y-6">
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="full-name">Full name</FieldLabel>
                  <Input
                    id="full-name"
                    name="full-name"
                    defaultValue={displayName}
                    placeholder="Enter your full name"
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="email">Email address</FieldLabel>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    defaultValue={displayEmail}
                    placeholder="Enter a contact email"
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="job-title">Job title</FieldLabel>
                  <Input
                    id="job-title"
                    name="job-title"
                    placeholder="e.g. Product Designer"
                  />
                </Field>
              </FieldGroup>
              <CardFooter className="justify-end gap-3">
                <Button variant="ghost" type="button">
                  Reset
                </Button>
                <Button type="submit">Save changes</Button>
              </CardFooter>
            </form>
          </CardContent>
        </Card>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Account security</CardTitle>
              <CardDescription>
                Strengthen access to keep your workspace protected.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between rounded-2xl border border-[color:var(--glass-border)] bg-[color:var(--glass-surface)] p-4">
                <div>
                  <p className="text-sm font-medium">Password</p>
                  <p className="text-xs text-muted-foreground">
                    Update your account password
                  </p>
                </div>
                <PasswordUpdateDialog />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Workspace visibility</CardTitle>
              <CardDescription>
                Decide who can view personal details within your organisation.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <label className="flex items-start gap-3">
                <input
                  type="radio"
                  name="visibility"
                  defaultChecked
                  className="mt-1 h-4 w-4 rounded-full border border-[color:var(--glass-border)] text-[hsl(var(--primary))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                />
                <span>
                  <span className="font-medium text-foreground">
                    Visible to team members
                  </span>
                  <p className="text-muted-foreground">
                    Share your name, avatar and job title across the organisation.
                  </p>
                </span>
              </label>
              <label className="flex items-start gap-3">
                <input
                  type="radio"
                  name="visibility"
                  className="mt-1 h-4 w-4 rounded-full border border-[color:var(--glass-border)] text-[hsl(var(--primary))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                />
                <span>
                  <span className="font-medium text-foreground">
                    Private to admins
                  </span>
                  <p className="text-muted-foreground">
                    Only workspace owners and billing admins can view your details.
                  </p>
                </span>
              </label>
            </CardContent>
            <CardFooter className="justify-end">
              <Button variant="outline" size="sm" type="button">
                Save preference
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
      </div>
    </DashboardShell>
  );
}
