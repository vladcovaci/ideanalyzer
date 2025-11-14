import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { BillingContent } from "@/components/dashboard/billing-content";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { stripe, STRIPE_PLANS, getSubscriptionStatusDisplay } from "@/lib/stripe";

export default async function BillingPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect("/login");
  }

  // Get user from database with subscription data
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: {
      subscriptions: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
  });

  if (!user) {
    redirect("/login");
  }

  // Get current plan
  let currentPlan = "free";
  let subscriptionData = null;
  let invoices: Array<{
    id: string;
    amount: string;
    status: string;
    date: string;
    invoiceUrl: string | null;
    pdfUrl: string | null;
  }> = [];
  let paymentMethod = null;

  if (user.stripeCustomerId && stripe) {
    try {
      // Fetch invoices from Stripe
      const stripeInvoices = await stripe.invoices.list({
        customer: user.stripeCustomerId,
        limit: 10,
      });

      invoices = stripeInvoices.data.map((invoice) => ({
        id: invoice.number || invoice.id,
        amount: (invoice.amount_paid / 100).toFixed(2),
        status: invoice.status === "paid" ? "Paid" : invoice.status === "open" ? "Pending" : "Failed",
        date: new Date(invoice.created * 1000).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
        invoiceUrl: invoice.hosted_invoice_url ?? null,
        pdfUrl: invoice.invoice_pdf ?? null,
      }));

      // Fetch payment methods
      const paymentMethods = await stripe.paymentMethods.list({
        customer: user.stripeCustomerId,
        type: "card",
        limit: 1,
      });

      if (paymentMethods.data.length > 0) {
        const pm = paymentMethods.data[0];
        paymentMethod = {
          brand: pm.card?.brand,
          last4: pm.card?.last4,
          expMonth: pm.card?.exp_month,
          expYear: pm.card?.exp_year,
        };
      }

      // Fetch subscription if exists
      if (user.stripeSubscriptionId) {
        const subscriptionResponse = await stripe.subscriptions.retrieve(
          user.stripeSubscriptionId
        );

        // Type assertion for subscription object which includes period fields
        const subscription = subscriptionResponse as typeof subscriptionResponse & {
          current_period_end: number;
          trial_end: number | null;
        };

        const priceId = subscription.items.data[0]?.price.id;
        const plan = Object.values(STRIPE_PLANS).find((p) => p.priceId === priceId);
        currentPlan = plan?.id || "unknown";

        const statusInfo = getSubscriptionStatusDisplay(subscription.status);

        subscriptionData = {
          status: subscription.status,
          statusDisplay: statusInfo,
          plan: plan?.name || "Unknown",
          planId: currentPlan,
          price: plan?.price || 0,
          currentPeriodEnd: new Date(
            subscription.current_period_end * 1000
          ).toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
          }),
          cancelAtPeriodEnd: subscription.cancel_at_period_end,
          trialEnd: subscription.trial_end
            ? new Date(subscription.trial_end * 1000)
            : null,
        };
      }
    } catch (error) {
      console.error("Error fetching Stripe data:", error);
    }
  }

  return (
    <DashboardShell>
      <BillingContent
        user={{
          email: user.email!,
          name: user.name || "User",
          stripeCustomerId: user.stripeCustomerId,
        }}
        subscription={subscriptionData}
        currentPlan={currentPlan}
        invoices={invoices}
        paymentMethod={paymentMethod}
      />
    </DashboardShell>
  );
}
