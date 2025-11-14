"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";

type PreferenceGroup = {
  id: string;
  title: string;
  description: string;
  options: {
    id: string;
    label: string;
    helper?: string;
  }[];
};

const preferenceBlueprint: PreferenceGroup[] = [
  {
    id: "product",
    title: "Product updates",
    description: "Release notes, feature previews and beta invitations.",
    options: [
      { id: "new-features", label: "New feature releases", helper: "Major launches and weekly release notes." },
      { id: "roadmap", label: "Roadmap previews", helper: "Early access to roadmap items and surveys." },
      { id: "betas", label: "Beta programmes", helper: "Try unreleased features and share feedback." },
    ],
  },
  {
    id: "activity",
    title: "Workspace activity",
    description: "Alerts that keep you in sync with your team.",
    options: [
      { id: "mentions", label: "Mentions & replies", helper: "Instant alerts for conversations you are tagged in." },
      { id: "sharing", label: "Shared documents", helper: "Notifications when files are shared with you." },
      { id: "approvals", label: "Approvals & requests", helper: "Stay on top of workflow approvals." },
    ],
  },
  {
    id: "billing",
    title: "Billing & legal",
    description: "Critical notices about your subscription.",
    options: [
      { id: "invoices", label: "Invoice receipts", helper: "Delivered immediately after payment is processed." },
      { id: "renewals", label: "Renewal reminders", helper: "Reminder emails 14 and 3 days before renewal." },
      { id: "compliance", label: "Compliance updates", helper: "Legal changes and policy notifications." },
    ],
  },
];

type PreferencesState = Record<string, boolean>;

export default function NotificationsPage() {
  const defaultState = useMemo<PreferencesState>(() => {
    const entries: [string, boolean][] = [];
    preferenceBlueprint.forEach((group) => {
      group.options.forEach((option) => {
        entries.push([`${group.id}.${option.id}`, !option.id.includes("compliance")]);
      });
    });
    return Object.fromEntries(entries);
  }, []);

  const [preferences, setPreferences] = useState<PreferencesState>(defaultState);
  const [savedState, setSavedState] = useState<PreferencesState>(defaultState);
  const [saving, setSaving] = useState(false);

  // Fetch preferences from database on mount
  useEffect(() => {
    const fetchPreferences = async () => {
      try {
        const response = await fetch("/api/user/notifications");
        const data = await response.json();

        if (data.preferences) {
          setPreferences(data.preferences);
          setSavedState(data.preferences);
        }
      } catch (error) {
        console.error("Error fetching preferences:", error);
      }
    };

    fetchPreferences();
  }, []);

  const hasChanges = useMemo(() => {
    return Object.keys(preferences).some((key) => preferences[key] !== savedState[key]);
  }, [preferences, savedState]);

  const toggleOption = (key: string) => {
    setPreferences((current) => ({
      ...current,
      [key]: !current[key],
    }));
  };

  const handleReset = () => {
    setPreferences(savedState);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch("/api/user/notifications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ preferences }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to save preferences");
      }

      setSavedState(preferences);
      toast.success("Preferences saved successfully!");
    } catch (error) {
      console.error("Error saving preferences:", error);
      toast.error("Failed to save preferences. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardShell>
      <div className="space-y-12">
        <header className="space-y-2">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-muted-foreground">
            Notifications
        </p>
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">Stay in the loop</h1>
            <p className="text-muted-foreground max-w-2xl">
              Tailor the updates you receive from StartupKit so you only see what matters to your workflow.
            </p>
          </div>
          <Badge
            variant="outline"
            className="rounded-full border-[color:var(--glass-border)] bg-[color:var(--glass-surface)] px-4 py-1.5 text-xs font-medium"
          >
            {Object.values(preferences).filter(Boolean).length} preferences enabled
          </Badge>
        </div>
      </header>

      <div className="space-y-6">
        {preferenceBlueprint.map((group) => (
          <Card key={group.id}>
            <CardHeader>
              <CardTitle>{group.title}</CardTitle>
              <CardDescription>{group.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <FieldGroup>
                {group.options.map((option) => {
                  const key = `${group.id}.${option.id}`;
                  const checked = preferences[key] ?? false;

                  return (
                    <Field
                      key={option.id}
                      className="gap-3 rounded-2xl border border-[color:var(--glass-border)] bg-[color:var(--glass-surface)] p-4 md:flex md:items-start md:gap-4"
                    >
                      <Checkbox
                        id={key}
                        checked={checked}
                        onCheckedChange={() => toggleOption(key)}
                        className="mt-1"
                      />
                      <div className="space-y-1">
                        <FieldLabel htmlFor={key} className="text-base">
                          {option.label}
                        </FieldLabel>
                        {option.helper ? (
                          <FieldDescription>{option.helper}</FieldDescription>
                        ) : null}
                      </div>
                    </Field>
                  );
                })}
              </FieldGroup>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Digest emails</CardTitle>
          <CardDescription>
            Prefer fewer emails? Switch to a digest to bundle updates together.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FieldGroup>
            <Field className="flex items-center justify-between rounded-2xl border border-[color:var(--glass-border)] bg-[color:var(--glass-surface)] px-4 py-3">
              <div>
                <FieldLabel htmlFor="digest-weekly" className="text-base">
                  Weekly digest
                </FieldLabel>
                <FieldDescription>
                  Every Monday at 9am in your workspace timezone.
                </FieldDescription>
              </div>
              <Checkbox
                id="digest-weekly"
                checked={preferences["digest.weekly"] ?? false}
                onCheckedChange={() => toggleOption("digest.weekly")}
              />
            </Field>
            <Field className="flex items-center justify-between rounded-2xl border border-[color:var(--glass-border)] bg-[color:var(--glass-surface)] px-4 py-3">
              <div>
                <FieldLabel htmlFor="digest-monthly" className="text-base">
                  Monthly summary
                </FieldLabel>
                <FieldDescription>
                  First business day of the month covering highlights.
                </FieldDescription>
              </div>
              <Checkbox
                id="digest-monthly"
                checked={preferences["digest.monthly"] ?? false}
                onCheckedChange={() => toggleOption("digest.monthly")}
              />
            </Field>
          </FieldGroup>
        </CardContent>
        <CardFooter className="justify-end gap-3">
          <Button variant="ghost" type="button" onClick={handleReset} disabled={!hasChanges || saving}>
            Reset
          </Button>
          <Button type="button" onClick={handleSave} disabled={!hasChanges || saving}>
            {saving ? "Saving..." : "Save preferences"}
          </Button>
        </CardFooter>
      </Card>
      </div>
    </DashboardShell>
  );
}
