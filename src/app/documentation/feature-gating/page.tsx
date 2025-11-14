export default function FeatureGatingPage() {
  return (
    <div className="prose prose-gray max-w-none dark:prose-invert">
      <h1>Feature Gating</h1>
      <p className="lead">
        Go beyond simple paywalls by combining middleware redirects, plan-aware helpers, and usage tracking. Everything
        lives alongside the Stripe config so you can resell the boilerplate with clear upgrade paths.
      </p>

      <h2>Choose Your Strategy</h2>
      <ol>
        <li>
          <strong>Route-level gating</strong>: Middleware checks subscription status and reroutes users away from premium
          dashboards.
        </li>
        <li>
          <strong>Component-level gating</strong>: UI reads the current plan and hides unavailable features.
        </li>
        <li>
          <strong>Usage quotas</strong>: <code>UsageRecord</code> entries track metrics such as API calls and storage.
        </li>
      </ol>

      <h2>Middleware</h2>
      <p>
        In <code>src/middleware.ts</code>, set <code>ENABLE_SUBSCRIPTION_ENFORCEMENT=&quot;true&quot;</code> in your
        <code>.env</code> to block access to <code>/dashboard/analytics</code>, <code>/dashboard/projects</code>, and
        <code>/dashboard/team</code> unless <code>token.stripeSubscriptionId</code> exists. Customize the
        <code>PREMIUM_ROUTES</code> array to cover new pages.
      </p>

      <h2>Helper Functions</h2>
      <ul>
        <li>
          <code>getUserPlan(stripeSubscriptionId, stripePriceId)</code>: resolves the plan key (FREE/STARTER/GROWTH/SCALE).
        </li>
        <li>
          <code>isPlanFeatureEnabled(plan, feature)</code>: boolean switch for toggling UI.
        </li>
        <li>
          <code>hasFeatureAccess(plan, feature, usage)</code>: enforce per-plan limits (pass current usage count).
        </li>
      </ul>

      <pre className="bg-gray-950 text-gray-50 p-4 rounded-lg overflow-x-auto">
        <code>{`import { getUserPlan, isPlanFeatureEnabled } from "@/lib/stripe";

const plan = getUserPlan(user.stripeSubscriptionId, user.stripePriceId);

if (!isPlanFeatureEnabled(plan, "analytics")) {
  redirect("/dashboard/billing?upgrade=true");
}`}</code>
      </pre>

      <h2>Usage Tracking</h2>
      <p>
        When you need metered usage, store counts in the <code>UsageRecord</code> model. Each record tracks a feature,
        the limit, and the current period. Update counts via cron job, queue, or directly inside API routes.
      </p>

      <h2>UI Patterns</h2>
      <ul>
        <li>Show plan comparison cards (see <code>src/components/pricing-comparison.tsx</code>).</li>
        <li>Use toast notifications or inline alerts prompting users to upgrade when they hit limits.</li>
        <li>Add query params (e.g., <code>?upgrade=true</code>) so the billing page highlights the relevant plan.</li>
      </ul>
    </div>
  );
}
