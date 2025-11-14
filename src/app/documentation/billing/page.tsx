export default function BillingPage() {
  return (
    <div className="prose prose-gray max-w-none dark:prose-invert">
      <h1>Subscription & Billing</h1>
      <p className="lead">
        Stripe powers the entire paid experience&mdash;checkout, customer portal, plan upgrades, downgrades, and webhook
        driven sync. All logic lives inside <code>src/lib/stripe.ts</code> and the API routes under
        <code>src/app/api/stripe</code>.
      </p>

      <h2>What You Get</h2>
      <ul>
        <li>Three production-ready plans (Starter, Growth, Scale) plus a free tier.</li>
        <li>Pre-wired checkout and billing portal buttons on <code>/dashboard/billing</code>.</li>
        <li>Webhook handling for subscription creation, updates, cancellations, payment failures, and trials.</li>
        <li>Feature flags per plan via <code>STRIPE_PLANS</code> in <code>src/lib/stripe.ts</code>.</li>
      </ul>

      <h2>Setup Checklist</h2>
      <ol>
        <li>Follow <code>STRIPE_SETUP.md</code> after unzipping the project.</li>
        <li>Create the three products + monthly prices in the Stripe Dashboard and collect their IDs.</li>
        <li>Update the env vars:
          <ul>
            <li><code>STRIPE_SECRET_KEY</code>, <code>NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY</code></li>
            <li>Price IDs + (optional) product IDs</li>
            <li><code>STRIPE_WEBHOOK_SECRET</code> (from Stripe CLI or Dashboard)</li>
          </ul>
        </li>
        <li>
          Start <code>stripe listen --forward-to localhost:3000/api/stripe/webhook</code> whenever you run
          <code>npm run dev</code>.
        </li>
      </ol>

      <h2>Billing API Routes</h2>
      <ul>
        <li>
          <code>POST /api/stripe/checkout</code>: Creates a checkout session for the selected plan. Called from the
          dashboard using the logged-in user ID and plan slug.
        </li>
        <li>
          <code>POST /api/stripe/portal</code>: Opens the Stripe customer portal so users can update payment methods,
          cancel, etc.
        </li>
        <li>
          <code>POST /api/stripe/update-subscription</code>: Switches plans without sending the user back through
          checkout.
        </li>
        <li>
          <code>POST /api/stripe/webhook</code>: Processes all incoming events and updates Prisma models +
          <code>User</code> stripe fields.
        </li>
      </ul>

      <h2>Plan Configuration</h2>
      <p>
        Edit <code>STRIPE_PLANS</code> to change descriptions, pricing, trial days, limits, and feature flags. For
        example:
      </p>
      <pre className="bg-gray-950 text-gray-50 p-4 rounded-lg overflow-x-auto">
        <code>{`STRIPE_PLANS.STARTER = {
  ...,
  price: 39,
  features: { apiCalls: 20000, storage: 25, projects: 10, teamMembers: 5 },
  enabledFeatures: { analytics: true, team: false, ... }
};`}</code>
      </pre>

      <h2>Enforcing Access</h2>
      <ul>
        <li>
          Middleware enforcement: set <code>ENABLE_SUBSCRIPTION_ENFORCEMENT=&quot;true&quot;</code> to redirect unpaid users away
          from <code>/dashboard/analytics</code>, <code>/dashboard/projects</code>, and <code>/dashboard/team</code>.
        </li>
        <li>
          Component-level enforcement: import <code>isPlanFeatureEnabled</code> and
          <code>hasFeatureAccess</code> to hide UI or block actions on a per-feature basis.
        </li>
      </ul>

      <h2>Testing Notes</h2>
      <ul>
        <li>Use Stripe test card <code>4242 4242 4242 4242</code> with any future expiry/CVC.</li>
        <li>Cancel, upgrade, and downgrade from the dashboard to confirm webhooks update Prisma.</li>
        <li>
          Verify your <code>User</code> records receive <code>stripeCustomerId</code>,
          <code>stripeSubscriptionId</code>, <code>stripePriceId</code>, and <code>stripeCurrentPeriodEnd</code>.
        </li>
      </ul>
    </div>
  );
}
