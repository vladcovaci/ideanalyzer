"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";

type SettingsPageProps = {
  user: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
  };
};

const SECTION_CLASSES =
  "rounded-[32px] border border-border/60 bg-card/60 p-6 shadow-sm";

export function SettingsPage({ user }: SettingsPageProps) {
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [preferences, setPreferences] = useState({
    briefReadyEmail: true,
    weeklySummary: false,
  });

  const handlePasswordSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPasswordLoading(true);
    const formData = new FormData(event.currentTarget);
    const payload = {
      currentPassword: formData.get("currentPassword"),
      newPassword: formData.get("newPassword"),
      confirmPassword: formData.get("confirmPassword"),
    };

    if (!payload.newPassword || payload.newPassword !== payload.confirmPassword) {
      toast.error("New passwords do not match.");
      setPasswordLoading(false);
      return;
    }

    const response = await fetch("/api/user/password", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setPasswordLoading(false);
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      toast.error(data?.error ?? "Failed to update password");
      return;
    }

    (event.target as HTMLFormElement).reset();
    toast.success("Password updated successfully");
  };

  const handleNotificationsSubmit = async (values: typeof preferences) => {
    setNotificationsLoading(true);
    const response = await fetch("/api/user/notifications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        preferences: values,
      }),
    });
    setNotificationsLoading(false);

    if (!response.ok) {
      toast.error("Failed to save notification preferences");
      return;
    }

    toast.success("Notification preferences updated");
  };

  const handleDeleteAccount = async () => {
    setDeleteLoading(true);
    const response = await fetch("/api/user/profile", {
      method: "DELETE",
    });
    setDeleteLoading(false);

    if (!response.ok) {
      toast.error("Failed to delete account");
      return;
    }

    toast.success("Account deleted");
    window.location.href = "/";
  };

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 py-10">
      <header className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
          Settings
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          Manage your account
        </h1>
        <p className="text-sm text-muted-foreground">
          Update your account information, preferences, and privacy controls.
        </p>
      </header>

      <Accordion
        type="single"
        defaultValue="account"
        collapsible
        className="space-y-4"
      >
        <AccordionItem value="account" className={SECTION_CLASSES}>
          <AccordionTrigger className="text-left text-lg font-semibold">
            Account
          </AccordionTrigger>
          <AccordionContent className="space-y-6 pt-6">
            <div className="space-y-2">
              <Label>Email address</Label>
              <Input value={user.email} disabled />
              <p className="text-xs text-muted-foreground">
                Email cannot be changed. Contact support if you need assistance.
              </p>
            </div>

            <form className="space-y-4" onSubmit={handlePasswordSubmit}>
              <p className="text-sm font-medium text-foreground">
                Change password
              </p>
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Current password</Label>
                <Input
                  id="currentPassword"
                  name="currentPassword"
                  type="password"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPassword">New password</Label>
                <Input id="newPassword" name="newPassword" type="password" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm new password</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                />
              </div>
              <Button type="submit" disabled={passwordLoading}>
                {passwordLoading ? "Updating..." : "Update Password"}
              </Button>
            </form>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="notifications" className={SECTION_CLASSES}>
          <AccordionTrigger className="text-left text-lg font-semibold">
            Notifications
          </AccordionTrigger>
          <AccordionContent className="space-y-6 pt-6">
            <div className="flex items-center justify-between rounded-2xl border border-border/40 px-4 py-3">
              <div>
                <p className="text-sm font-medium text-foreground">
                  Email when brief is ready
                </p>
                <p className="text-xs text-muted-foreground">
                  Receive an email as soon as your research brief is generated.
                </p>
              </div>
              <Switch
                checked={preferences.briefReadyEmail}
                onCheckedChange={(checked) =>
                  setPreferences((prev) => ({
                    ...prev,
                    briefReadyEmail: checked,
                  }))
                }
              />
            </div>

            <div className="flex items-center justify-between rounded-2xl border border-border/40 px-4 py-3">
              <div>
                <p className="text-sm font-medium text-foreground">
                  Weekly summary emails
                </p>
                <p className="text-xs text-muted-foreground">
                  Coming soon — early access to curated insights.
                </p>
              </div>
              <Switch
                checked={preferences.weeklySummary}
                onCheckedChange={(checked) =>
                  setPreferences((prev) => ({
                    ...prev,
                    weeklySummary: checked,
                  }))
                }
              />
            </div>

            <Button
              onClick={() => handleNotificationsSubmit(preferences)}
              disabled={notificationsLoading}
            >
              {notificationsLoading ? "Saving..." : "Save Preferences"}
            </Button>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="privacy" className={SECTION_CLASSES}>
          <AccordionTrigger className="text-left text-lg font-semibold">
            Privacy & Data
          </AccordionTrigger>
          <AccordionContent className="space-y-6 pt-6">
            <div className="space-y-2">
              <p className="text-sm font-medium text-foreground">Privacy policy</p>
              <p className="text-sm text-muted-foreground">
                Review how we collect, use, and store your data.
              </p>
              <Link
                href="/privacy"
                className="text-sm font-medium text-primary underline-offset-4 hover:underline"
              >
                View Privacy Policy
              </Link>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-foreground">Terms of service</p>
              <p className="text-sm text-muted-foreground">
                Understand your rights and responsibilities as a user.
              </p>
              <Link
                href="/terms"
                className="text-sm font-medium text-primary underline-offset-4 hover:underline"
              >
                View Terms of Service
              </Link>
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="destructive">Delete Account</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Delete account</DialogTitle>
                  <DialogDescription>
                    This action is permanent and will remove all briefs and history. Are you sure you want to continue?
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button variant="outline">Cancel</Button>
                  <Button
                    variant="destructive"
                    onClick={handleDeleteAccount}
                    disabled={deleteLoading}
                  >
                    {deleteLoading ? "Deleting..." : "Delete Account"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
