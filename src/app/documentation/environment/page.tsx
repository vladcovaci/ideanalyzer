export default function EnvironmentSetupPage() {
  return (
    <div className="prose prose-gray max-w-none dark:prose-invert">
      <h1>Environment Setup</h1>
      <p className="lead">
        Configure your workstation so StartupKit runs exactly the same way it does for your customers. No GitHub
        access is required&mdash;everything ships as a zipped folder you control.
      </p>

      <h2>Local Requirements</h2>
      <ul>
        <li>Node.js 18+ and npm 10+ (use <code>nvm</code> or Volta to match versions)</li>
        <li>MongoDB Atlas account (or any MongoDB 6.x cluster)</li>
        <li>Stripe account + Stripe CLI for webhook testing</li>
        <li>Resend account (optional in dev because links are logged)</li>
      </ul>

      <h2>Bootstrap the Project</h2>
      <ol>
        <li>Unzip <code>startupkit.zip</code> and move the folder somewhere permanent.</li>
        <li>Install packages: <code>npm install</code>.</li>
        <li>
          Copy the example env file: <code>cp .env.example .env</code>, then fill in the values from your providers.
        </li>
        <li>Generate the Prisma client: <code>npx prisma generate</code>.</li>
        <li>Push the schema to your database (safe for dev): <code>npx prisma db push</code>.</li>
      </ol>

      <div className="docs-callout">
        <p className="font-semibold">No Git history required</p>
        <p className="text-sm text-muted-foreground">
          Because customers receive a fresh zip, they can import the folder into their own private repo or keep it
          offline. The documentation intentionally references only local commands.
        </p>
      </div>

      <h2>Command Cheat Sheet</h2>
      <table>
        <thead>
          <tr>
            <th>Command</th>
            <th>When to run</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><code>npm run dev</code></td>
            <td>Starts the Next.js dev server on <code>http://localhost:3000</code>.</td>
          </tr>
          <tr>
            <td><code>npm run build</code></td>
            <td>Creates a production build before deploying to Vercel or any Node host.</td>
          </tr>
          <tr>
            <td><code>npm run start</code></td>
            <td>Runs the compiled app locally (uses <code>.env</code> values).</td>
          </tr>
          <tr>
            <td><code>npm run lint</code></td>
            <td>Ensures the codebase passes the default ESLint config.</td>
          </tr>
        </tbody>
      </table>

      <h2>Development Helpers</h2>
      <ul>
        <li>
          <strong>/dev-tools</strong>: Verify email addresses without sending actual emails, perfect when Resend is not
          configured yet.
        </li>
        <li>
          <strong>Terminal logs</strong>: Verification and password reset links are printed automatically whenever
          Resend credentials are missing.
        </li>
        <li>
          <strong>Seed-free sample data</strong>: Register through the UI to create your first account; no seeding
          scripts are required.
        </li>
      </ul>

      <h2>Recommended Global Tools</h2>
      <ul>
        <li>
          <strong>MongoDB Compass</strong> or Atlas UI for browsing data and clearing sessions.
        </li>
        <li>
          <strong>Stripe CLI</strong> for streaming webhook events to <code>/api/stripe/webhook</code>.
        </li>
        <li>
          <strong>ngrok</strong> (optional) when you want to share the local app with teammates for review.
        </li>
      </ul>
    </div>
  );
}
