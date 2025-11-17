import { withAuth } from "next-auth/middleware";
import type { NextRequestWithAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

// Define premium routes that require a paid subscription
// Customize this based on your needs
const PREMIUM_ROUTES = [
  "/dashboard/analytics",
  "/dashboard/projects",
  "/dashboard/team",
];

export default withAuth(
  function middleware(request: NextRequestWithAuth) {
    const token = request.nextauth?.token;
    const isAuth = !!token;

  const isAuthPage =
    request.nextUrl.pathname.startsWith("/login") ||
    request.nextUrl.pathname.startsWith("/register") ||
    request.nextUrl.pathname.startsWith("/forgot-password") ||
    request.nextUrl.pathname.startsWith("/reset-password") ||
    request.nextUrl.pathname.startsWith("/verify-email");

  // If user is authenticated and tries to access auth pages, redirect to dashboard
    if (isAuthPage && isAuth) {
      return NextResponse.redirect(
        new URL("/dashboard", request.url)
      );
  }

  // If user is not authenticated and tries to access protected pages, redirect to login
    if (!isAuth && request.nextUrl.pathname.startsWith("/dashboard")) {
      return NextResponse.redirect(new URL("/login", request.url));
  }

  // Optional: Enforce subscription tier for premium routes
  // Enable this by setting ENABLE_SUBSCRIPTION_ENFORCEMENT=true in .env
  const enforceSubscriptions =
    process.env.ENABLE_SUBSCRIPTION_ENFORCEMENT === "true";

    if (enforceSubscriptions && isAuth) {
      const isPremiumRoute = PREMIUM_ROUTES.some((route) =>
        request.nextUrl.pathname.startsWith(route)
      );

      if (isPremiumRoute) {
        const hasActiveSubscription = token?.stripeSubscriptionId;

        if (!hasActiveSubscription) {
          const url = new URL("/dashboard/billing", request.url);
          url.searchParams.set("upgrade", "true");
          url.searchParams.set(
            "message",
            "This feature requires an active subscription"
          );
          return NextResponse.redirect(url);
        }
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: () => true,
    },
  }
);

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/login",
    "/register",
    "/forgot-password",
    "/reset-password",
    "/verify-email",
  ],
};
