export default function QuickStartPage() {
  return (
    <div className="prose prose-gray max-w-none dark:prose-invert">
      <h1>Quick Start</h1>
      <p className="lead">
        Get your SaaS up and running in under 5 minutes. This guide will walk you through the essential setup steps.
      </p>

      <h2>Prerequisites</h2>
      <ul>
        <li>Node.js 18+ installed</li>
        <li>Git installed</li>
        <li>A code editor (VS Code recommended)</li>
      </ul>

      <h2>Step 1: Download & Unpack</h2>
      <p>
        You received StartupKit as a <code>.zip</code> download (no GitHub access needed). Unzip it and move the
        extracted folder wherever you keep your projects:
      </p>
      <pre className="bg-gray-950 text-gray-50 p-4 rounded-lg overflow-x-auto">
        <code>unzip startupkit.zip
cd startupkit</code>
      </pre>
      <p className="text-sm text-muted-foreground">
        On macOS you can also double-click the zip. The folder name in the archive is <code>startupkit</code>.
      </p>

      <h2>Step 2: Install Dependencies</h2>
      <pre className="bg-gray-950 text-gray-50 p-4 rounded-lg overflow-x-auto">
        <code>npm install</code>
      </pre>

      <h2>Step 3: Set Up Environment Variables</h2>
      <p>Copy the example environment file and fill in your credentials:</p>
      <pre className="bg-gray-950 text-gray-50 p-4 rounded-lg overflow-x-auto">
        <code>cp .env.example .env</code>
      </pre>

      <p>At minimum, you need to configure:</p>
      <ul>
        <li><strong>DATABASE_URL</strong> - Your MongoDB connection string</li>
        <li><strong>NEXTAUTH_SECRET</strong> - Generate with: <code>openssl rand -base64 32</code></li>
        <li><strong>NEXTAUTH_URL</strong> - Your app URL (http://localhost:3000 for development)</li>
      </ul>

      <div className="docs-callout">
        <p className="font-semibold">💡 Tip</p>
        <p className="text-sm text-muted-foreground">
          You can start with just these three variables and add Stripe, Google OAuth, and Resend later.
        </p>
      </div>

      <h2>Step 4: Set Up the Database</h2>
      <p>Generate Prisma client and push the schema to your database:</p>
      <pre className="bg-gray-950 text-gray-50 p-4 rounded-lg overflow-x-auto">
        <code>npx prisma generate
npx prisma db push</code>
      </pre>

      <h2>Step 5: Run the Development Server</h2>
      <pre className="bg-gray-950 text-gray-50 p-4 rounded-lg overflow-x-auto">
        <code>npm run dev</code>
      </pre>

      <p>Open <a href="http://localhost:3000">http://localhost:3000</a> in your browser!</p>

      <h2>Step 6: Create Your First Account</h2>
      <ol>
        <li>Navigate to <code>/register</code></li>
        <li>Create an account with email/password</li>
        <li>Check your terminal for the verification link (if Resend is not configured)</li>
        <li>Verify your email and log in</li>
      </ol>

      <div className="docs-callout">
        <p className="font-semibold">✅ Success!</p>
        <p className="text-sm text-muted-foreground">
          You now have a fully functional SaaS application running locally. Explore the dashboard and check out the other documentation pages to learn more.
        </p>
      </div>

      <h2>Next Steps</h2>
      <ul>
        <li><a href="/documentation/installation">Complete Installation Guide</a> - Full setup with all features</li>
        <li><a href="/documentation/environment">Environment Variables</a> - Configure all services</li>
        <li><a href="/documentation/authentication">Authentication</a> - Set up OAuth providers</li>
        <li><a href="/documentation/billing">Billing</a> - Configure Stripe subscriptions</li>
      </ul>
    </div>
  );
}
