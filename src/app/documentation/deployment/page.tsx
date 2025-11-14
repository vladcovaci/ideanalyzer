export default function DeploymentPage() {
  return (
    <div className="prose prose-gray max-w-none dark:prose-invert">
      <h1>Vercel Deployment</h1>
      <p className="lead">
        StartupKit is optimized for Vercel, but the Next.js output runs on any Node host. These steps assume you cloned
        the zip into your own private Git repo.
      </p>

      <h2>Pre-flight Checklist</h2>
      <ul>
        <li>Database provisioned (MongoDB Atlas) and reachable from Vercel.</li>
        <li>Stripe products, keys, and webhook URL ready.</li>
        <li>Resend domain verified (or fallback sender prepared).</li>
        <li>Environment variables copied from <code>.env</code>.</li>
      </ul>

      <h2>Deploy to Vercel</h2>
      <ol>
        <li>Push your private repository (created from the zip) to GitHub, GitLab, or Bitbucket.</li>
        <li>Import the project in Vercel.</li>
        <li>Paste all env vars under <strong>Project Settings → Environment Variables</strong> (repeat for Preview vs Production as needed).</li>
        <li>
          Optionally add a <code>postbuild</code> script to run <code>prisma migrate deploy</code> before
          <code>next build</code> (or run it manually).
        </li>
        <li>Click Deploy.</li>
      </ol>

      <h2>Verification</h2>
      <ul>
        <li>Visit the live URL and create a test account.</li>
        <li>Run through checkout with Stripe test mode and confirm the webhook logs in Vercel.</li>
        <li>Ensure emails send from your production domain (or at least Arrive in Resend logs).</li>
        <li>Check the dashboard pages still respect onboarding + subscription gating.</li>
      </ul>

      <h2>Production Tips</h2>
      <ul>
        <li>Rotate <code>NEXTAUTH_SECRET</code> and Stripe keys before handing a copy to a customer.</li>
        <li>Disable <code>/dev-tools</code> in production by checking <code>process.env.NODE_ENV</code> (already handled).</li>
        <li>Use Vercel Analytics or your preferred telemetry to monitor usage.</li>
        <li>Schedule backups for MongoDB Atlas and Stripe webhooks.</li>
      </ul>

      <h2>Self-Hosting</h2>
      <p>
        Prefer another provider (Render, Railway, Fly.io, bare metal)? Run <code>npm run build</code> then
        <code>npm run start</code>. Make sure the runtime exposes <code>PORT</code> and set
        <code>NEXTAUTH_URL</code> to the public domain.
      </p>
    </div>
  );
}
