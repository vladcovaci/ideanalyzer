"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

export default function DevToolsPage() {
  const [email, setEmail] = useState("");
  const [result, setResult] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const verifyEmail = async () => {
    setIsLoading(true);
    setResult("");
    try {
      // Find the verification token for this email
      const response = await fetch("/api/dev/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setResult(`✅ Email verified successfully for ${email}`);
      } else {
        setResult(`❌ Error: ${data.error}`);
      }
    } catch (error) {
      setResult(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Only show in development
  if (process.env.NODE_ENV === "production") {
    return (
      <div className="container py-20 text-center">
        <h1 className="text-2xl font-bold">Not Available in Production</h1>
      </div>
    );
  }

  return (
    <div className="container py-10">
      <div className="mx-auto max-w-2xl space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Development Tools</h1>
          <p className="text-muted-foreground">
            Helpful utilities for testing authentication during development
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Verify Email (Skip Email Step)</CardTitle>
            <CardDescription>
              Manually verify an email address without clicking the email link.
              Useful when Resend is not configured.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                verifyEmail();
              }}
            >
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="email">Email Address</FieldLabel>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="user@example.com"
                    required
                    disabled={isLoading}
                  />
                </Field>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Verifying..." : "Verify Email"}
                </Button>
                {result && (
                  <div
                    className={`rounded-lg p-3 text-sm ${
                      result.startsWith("✅")
                        ? "bg-green-50 text-green-800 "
                        : "bg-red-50 text-red-800 "
                    }`}
                  >
                    {result}
                  </div>
                )}
              </FieldGroup>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Setup Checklist</CardTitle>
            <CardDescription>
              Things to configure for full functionality
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <span className="font-mono">✓</span>
                <span>
                  <strong>Database:</strong> MongoDB connected via Prisma
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-mono">
                  {process.env.NEXT_PUBLIC_APP_URL ? "✓" : "✗"}
                </span>
                <span>
                  <strong>NEXT_PUBLIC_APP_URL:</strong>{" "}
                  {process.env.NEXT_PUBLIC_APP_URL || "Not configured"}
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-mono">⚠</span>
                <span>
                  <strong>Google OAuth:</strong> Configure GOOGLE_CLIENT_ID and
                  GOOGLE_CLIENT_SECRET
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-mono">⚠</span>
                <span>
                  <strong>Resend:</strong> Configure RESEND_API_KEY for email
                  sending
                </span>
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Development Mode Notes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>
              • Verification and password reset URLs are logged to your terminal
              console
            </p>
            <p>
              • Use this page to verify emails without clicking email links
            </p>
            <p>
              • Google OAuth requires proper redirect URIs in Google Cloud
              Console
            </p>
            <p>
              • Check <code className="rounded bg-muted px-1">AUTH_SETUP.md</code> for
              detailed setup instructions
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
