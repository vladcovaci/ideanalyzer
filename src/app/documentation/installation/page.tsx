export default function InstallationPage() {
  return (
    <div className="prose prose-gray max-w-none dark:prose-invert">
      <h1>Installation Guide</h1>
      <p className="lead">
        Complete setup guide for all features including database, authentication, payments, and email services.
      </p>

      <h2>1. Unpack & Install Dependencies</h2>
      <p>
        Every customer receives StartupKit as a downloadable <code>.zip</code> file ready to import into your own Git
        host (or keep private). Unzip it, enter the folder, then install dependencies:
      </p>
      <pre className="bg-gray-950 text-gray-50 p-4 rounded-lg overflow-x-auto">
        <code>unzip startupkit.zip
cd startupkit
npm install</code>
      </pre>

      <h2>2. MongoDB Setup</h2>
      <p>You&rsquo;ll need a MongoDB database. We recommend MongoDB Atlas for production:</p>

      <ol>
        <li>Go to <a href="https://www.mongodb.com/cloud/atlas" target="_blank" rel="noopener noreferrer">MongoDB Atlas</a></li>
        <li>Create a free account and a new cluster</li>
        <li>Click &ldquo;Connect&rdquo; and choose &ldquo;Connect your application&rdquo;</li>
        <li>Copy the connection string</li>
        <li>Replace <code>&lt;password&gt;</code> with your database user password</li>
      </ol>

      <p>Your connection string should look like:</p>
      <pre className="bg-gray-950 text-gray-50 p-4 rounded-lg overflow-x-auto">
        <code>mongodb+srv://username:password@cluster.mongodb.net/dbname?retryWrites=true&w=majority</code>
      </pre>

      <h2>3. Environment Variables</h2>
      <p>Copy the example environment file:</p>
      <pre className="bg-gray-950 text-gray-50 p-4 rounded-lg overflow-x-auto">
        <code>cp .env.example .env</code>
      </pre>

      <h3>Required Variables</h3>
      <pre className="bg-gray-950 text-gray-50 p-4 rounded-lg overflow-x-auto">
        <code>{`# Database
DATABASE_URL="your-mongodb-connection-string"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"`}</code>
      </pre>

      <h3>Generate NEXTAUTH_SECRET</h3>
      <pre className="bg-gray-950 text-gray-50 p-4 rounded-lg overflow-x-auto">
        <code>openssl rand -base64 32</code>
      </pre>

      <h2>4. Google OAuth Setup (Optional)</h2>
      <p>To enable Google authentication:</p>

      <ol>
        <li>Go to <a href="https://console.cloud.google.com" target="_blank" rel="noopener noreferrer">Google Cloud Console</a></li>
        <li>Create a new project or select an existing one</li>
        <li>Navigate to &ldquo;APIs &amp; Services&rdquo; → &ldquo;Credentials&rdquo;</li>
        <li>Click &ldquo;Create Credentials&rdquo; → &ldquo;OAuth client ID&rdquo;</li>
        <li>Select &ldquo;Web application&rdquo;</li>
        <li>Add authorized redirect URI: <code>http://localhost:3000/api/auth/callback/google</code></li>
        <li>Copy the Client ID and Client Secret</li>
      </ol>

      <p>Add to your <code>.env</code>:</p>
      <pre className="bg-gray-950 text-gray-50 p-4 rounded-lg overflow-x-auto">
        <code>{`GOOGLE_CLIENT_ID="your-client-id"
GOOGLE_CLIENT_SECRET="your-client-secret"`}</code>
      </pre>

      <h2>5. Stripe Setup</h2>
      <p>For subscription billing and payments:</p>

      <h3>Create Stripe Account</h3>
      <ol>
        <li>Sign up at <a href="https://stripe.com" target="_blank" rel="noopener noreferrer">Stripe</a></li>
        <li>Go to Developers → API keys</li>
        <li>Copy your Publishable key and Secret key</li>
      </ol>

      <h3>Create Products and Prices</h3>
      <ol>
        <li>Go to Products in Stripe Dashboard</li>
        <li>Create a product for each plan (Starter, Growth, Scale)</li>
        <li>Add a recurring price to each product</li>
        <li>Copy the Price ID for each plan</li>
      </ol>

      <p>Add to your <code>.env</code>:</p>
      <pre className="bg-gray-950 text-gray-50 p-4 rounded-lg overflow-x-auto">
        <code>{`STRIPE_SECRET_KEY="sk_test_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..." # We'll get this in step 6

# Price IDs from your Stripe products
STRIPE_STARTER_PRICE_ID="price_..."
STRIPE_GROWTH_PRICE_ID="price_..."
STRIPE_SCALE_PRICE_ID="price_..."`}</code>
      </pre>

      <h3>Update Stripe Configuration</h3>
      <p>Edit <code>src/lib/stripe.ts</code> and update the plan details to match your Stripe products:</p>
      <pre className="bg-gray-950 text-gray-50 p-4 rounded-lg overflow-x-auto">
        <code>{`export const STRIPE_PLANS = {
  STARTER: {
    id: "starter",
    name: "Starter",
    price: 29, // Your price in dollars
    priceId: process.env.STRIPE_STARTER_PRICE_ID!,
    // ... update features
  },
  // ... update other plans
};`}</code>
      </pre>

      <h2>6. Stripe Webhooks</h2>
      <p>Webhooks are required for subscription updates:</p>

      <h3>Local Development (Stripe CLI)</h3>
      <ol>
        <li>Install <a href="https://stripe.com/docs/stripe-cli" target="_blank" rel="noopener noreferrer">Stripe CLI</a></li>
        <li>Login: <code>stripe login</code></li>
        <li>Forward webhooks: <code>stripe listen --forward-to localhost:3000/api/stripe/webhook</code></li>
        <li>Copy the webhook signing secret shown (starts with <code>whsec_</code>)</li>
        <li>Add it to your <code>.env</code> as <code>STRIPE_WEBHOOK_SECRET</code></li>
      </ol>

      <h3>Production Webhooks</h3>
      <ol>
        <li>Go to Developers → Webhooks in Stripe Dashboard</li>
        <li>Click &ldquo;Add endpoint&rdquo;</li>
        <li>Enter your endpoint: <code>https://yourdomain.com/api/stripe/webhook</code></li>
        <li>Select these events:
          <ul>
            <li><code>checkout.session.completed</code></li>
            <li><code>customer.subscription.created</code></li>
            <li><code>customer.subscription.updated</code></li>
            <li><code>customer.subscription.deleted</code></li>
          </ul>
        </li>
        <li>Copy the webhook signing secret to your production environment</li>
      </ol>

      <h2>7. Resend Email Setup</h2>
      <p>For transactional emails:</p>

      <ol>
        <li>Sign up at <a href="https://resend.com" target="_blank" rel="noopener noreferrer">Resend</a></li>
        <li>Go to API Keys and create a new key</li>
        <li>Add your domain in Settings → Domains (or use <code>onboarding@resend.dev</code> for testing)</li>
        <li>Follow the DNS verification steps</li>
      </ol>

      <p>Add to your <code>.env</code>:</p>
      <pre className="bg-gray-950 text-gray-50 p-4 rounded-lg overflow-x-auto">
        <code>{`RESEND_API_KEY="re_..."
EMAIL_FROM="noreply@yourdomain.com"
ADMIN_EMAIL="admin@yourdomain.com"`}</code>
      </pre>

      <div className="docs-callout">
        <p className="font-semibold">⚠️ Email Deliverability</p>
        <p className="text-sm text-muted-foreground">
          For testing, you can use <code>onboarding@resend.dev</code> as your EMAIL_FROM.
          For production, you must verify your domain to ensure email delivery.
        </p>
      </div>

      <h2>8. Database Schema Setup</h2>
      <p>Initialize your database with Prisma:</p>
      <pre className="bg-gray-950 text-gray-50 p-4 rounded-lg overflow-x-auto">
        <code>npx prisma generate
npx prisma db push</code>
      </pre>

      <p>This will create all required tables and generate the Prisma client.</p>

      <h2>9. Run the Application</h2>
      <p>Start the development server:</p>
      <pre className="bg-gray-950 text-gray-50 p-4 rounded-lg overflow-x-auto">
        <code>npm run dev</code>
      </pre>

      <p>Open <a href="http://localhost:3000">http://localhost:3000</a> in your browser.</p>

      <h2>10. Test the Setup</h2>
      <div className="space-y-2">
        <p><strong>Authentication:</strong></p>
        <ul>
          <li>Create an account at <code>/register</code></li>
          <li>Check your terminal for the verification email link</li>
          <li>Verify your email and log in</li>
        </ul>

        <p><strong>Subscriptions:</strong></p>
        <ul>
          <li>Navigate to Billing in the dashboard</li>
          <li>Select a plan and use Stripe test card: <code>4242 4242 4242 4242</code></li>
          <li>Use any future expiry date and any CVC</li>
          <li>Verify subscription appears in your Stripe Dashboard</li>
        </ul>
      </div>

      <div className="docs-callout">
        <p className="font-semibold">✅ Setup Complete!</p>
        <p className="text-sm text-muted-foreground">
          Your SaaS application is now fully configured with authentication, billing, and email services.
        </p>
      </div>

      <h2>Troubleshooting</h2>
      <div className="space-y-3">
        <div>
          <p className="font-semibold">Database connection errors</p>
          <p className="text-sm">Verify your MongoDB connection string and ensure your IP is whitelisted in MongoDB Atlas.</p>
        </div>

        <div>
          <p className="font-semibold">OAuth not working</p>
          <p className="text-sm">Check that your redirect URIs match exactly in Google Cloud Console. For production, update them to your domain.</p>
        </div>

        <div>
          <p className="font-semibold">Stripe webhooks failing</p>
          <p className="text-sm">Ensure Stripe CLI is running for local development. Check webhook signing secret matches your .env file.</p>
        </div>

        <div>
          <p className="font-semibold">Emails not sending</p>
          <p className="text-sm">Verify your Resend API key is correct. Use onboarding@resend.dev for testing, or ensure your domain is verified for production.</p>
        </div>
      </div>

      <h2>Next Steps</h2>
      <ul>
        <li><a href="/documentation/environment">Environment Variables Reference</a> - Complete list of all variables</li>
        <li><a href="/documentation/authentication">Authentication Guide</a> - Deep dive into auth system</li>
        <li><a href="/documentation/billing">Billing Guide</a> - Managing subscriptions</li>
        <li><a href="/documentation/deployment">Deployment Guide</a> - Deploy to production</li>
      </ul>
    </div>
  );
}
