"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FieldDescription } from "@/components/ui/field";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import { Mail, CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";

export function VerifyEmailContent({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const email = searchParams.get("email");
  const [isResending, setIsResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [isVerified, setIsVerified] = useState<boolean | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  const verifyEmail = useCallback(async () => {
    if (!token) return;
    setIsVerifying(true);
    try {
      const response = await fetch("/api/auth/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });

      if (response.ok) {
        setIsVerified(true);
        toast.success("Email verified successfully.");
      } else {
        setIsVerified(false);
        toast.error("Verification link is invalid or has expired.");
      }
    } catch (error) {
      console.error("Failed to verify email", error);
      setIsVerified(false);
      toast.error("Unable to verify email. Please try again.");
    } finally {
      setIsVerifying(false);
    }
  }, [token]);

  useEffect(() => {
    if (!token || isVerifying || isVerified !== null) {
      return;
    }
    verifyEmail();
  }, [token, isVerifying, isVerified, verifyEmail]);

  const handleResendEmail = async () => {
    if (!email) return;

    setIsResending(true);
    setResendSuccess(false);
    try {
      const response = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        setResendSuccess(true);
        toast.success("Verification email sent. Please check your inbox.");
      } else {
        toast.error("Failed to resend verification email.");
      }
    } catch (error) {
      console.error("Failed to resend verification email", error);
      toast.error("Failed to resend verification email.");
    } finally {
      setIsResending(false);
    }
  };

  if (token) {
    // Verification from email link
    return (
      <div className={cn("flex flex-col gap-6", className)} {...props}>
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-primary/10">
              {isVerified === true ? (
                <CheckCircle className="size-8 text-green-600" />
              ) : isVerified === false ? (
                <XCircle className="size-8 text-red-600" />
              ) : (
                <Mail className="size-8 text-primary" />
              )}
            </div>
            <CardTitle className="text-xl">
              {isVerified === true
                ? "Email verified!"
                : isVerified === false
                ? "Verification failed"
                : "Verifying your email..."}
            </CardTitle>
            <CardDescription>
              {isVerified === true
                ? "Your email has been successfully verified"
                : isVerified === false
                ? "The verification link is invalid or has expired"
                : "Please wait while we verify your email address"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {isVerified === true && (
                <Button asChild className="w-full">
                  <Link href="/login">Continue to login</Link>
                </Button>
              )}
              {isVerified === false && (
                <>
                  <Button onClick={handleResendEmail} className="w-full" disabled={isResending}>
                    {isResending ? "Sending..." : "Resend verification email"}
                  </Button>
                  <FieldDescription className="text-center">
                    <Link href="/login" className="underline hover:text-foreground">
                      Back to login
                    </Link>
                  </FieldDescription>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Waiting for email verification (after registration)
  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-primary/10">
            <Mail className="size-8 text-primary" />
          </div>
          <CardTitle className="text-xl">Check your email</CardTitle>
          <CardDescription>
            We&apos;ve sent a verification link to{" "}
            {email && <strong>{email}</strong>}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="rounded-lg bg-blue-50 p-4 text-sm text-blue-800">
              Click the link in the email to verify your account. If you
              don&apos;t see it, check your spam folder.
            </div>
            {resendSuccess ? (
              <div className="rounded-lg bg-green-50 p-4 text-center text-sm text-green-800">
                Verification email sent! Please check your inbox.
              </div>
            ) : (
              <Button
                variant="outline"
                onClick={handleResendEmail}
                className="w-full"
                disabled={isResending}
              >
                {isResending ? "Sending..." : "Resend verification email"}
              </Button>
            )}
            <FieldDescription className="text-center">
              <Link href="/login" className="underline hover:text-foreground">
                Back to login
              </Link>
            </FieldDescription>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
