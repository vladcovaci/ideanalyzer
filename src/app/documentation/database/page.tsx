export default function DatabasePage() {
  return (
    <div className="prose prose-gray max-w-none dark:prose-invert">
      <h1>Database & Prisma</h1>
      <p className="lead">
        StartupKit uses Prisma with MongoDB. The schema at <code>prisma/schema.prisma</code> includes everything NextAuth
        needs plus Stripe subscription artifacts, usage tracking, and notification preferences.
      </p>

      <h2>Models</h2>
      <ul>
        <li>
          <strong>User</strong>: Auth profile plus Stripe metadata (
          <code>stripeCustomerId</code>, <code>stripeSubscriptionId</code>, <code>stripePriceId</code>,
          <code>stripeCurrentPeriodEnd</code>, onboarding state, profile info).
        </li>
        <li>
          <strong>Account</strong>, <strong>Session</strong>, <strong>VerificationToken</strong>,
          <strong>PasswordResetToken</strong>: Standard NextAuth tables.
        </li>
        <li>
          <strong>Subscription</strong>: Historical subscription entries for reporting or admin dashboards.
        </li>
        <li>
          <strong>UsageRecord</strong>: Tracks per-feature quotas (api calls, storage, etc.) with start/end periods.
        </li>
        <li>
          <strong>NotificationPreferences</strong>: Stores JSON preferences for emails/alerts.
        </li>
      </ul>

      <h2>Workflow</h2>
      <ol>
        <li>After editing the schema, run <code>npx prisma generate</code>.</li>
        <li>Use <code>npx prisma db push</code> for quick dev changes or <code>npx prisma migrate dev</code> if you want
          migration files.</li>
        <li>On production deploys, run <code>npx prisma migrate deploy</code> (Vercel does this in the build script if
          you add it as a post-build step).</li>
      </ol>

      <h2>Accessing Prisma</h2>
      <p>
        Import the singleton from <code>src/lib/db.ts</code>. The Prisma client is automatically reused in development to
        avoid exhausting connections.
      </p>

      <h2>Seeding / Test Data</h2>
      <p>
        StartupKit relies on the actual UI to create demo data which keeps the onboarding instructions simple for
        customers receiving the zip download. If you want fixtures, add a script under <code>prisma/seed.ts</code> and
        run <code>npx prisma db seed</code>.
      </p>

      <h2>Extending the Schema</h2>
      <ul>
        <li>Add extra profile fields to <code>User</code> and expose them on <code>/dashboard/account</code>.</li>
        <li>Create new collections for your specific product data and query them inside the dashboard routes.</li>
        <li>Update <code>src/types/next-auth.d.ts</code> if you need to surface new user fields inside the session.</li>
      </ul>
    </div>
  );
}
