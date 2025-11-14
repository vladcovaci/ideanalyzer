const envVars = [
  {
    category: "Database & URLs",
    items: [
      {
        key: "DATABASE_URL",
        required: true,
        description: "MongoDB connection string (Atlas recommended).",
      },
      {
        key: "NEXTAUTH_URL",
        required: true,
        description: "The domain where the app runs (http://localhost:3000 in dev).",
      },
      {
        key: "NEXT_PUBLIC_APP_URL",
        required: true,
        description: "Public URL used inside emails and client-side fetches.",
      },
    ],
  },
  {
    category: "Authentication",
    items: [
      {
        key: "NEXTAUTH_SECRET",
        required: true,
        description: "Generate with `openssl rand -base64 32` to encrypt NextAuth tokens.",
      },
      {
        key: "GOOGLE_CLIENT_ID",
        required: false,
        description: "Google OAuth client ID (enable the Google API + OAuth consent screen).",
      },
      {
        key: "GOOGLE_CLIENT_SECRET",
        required: false,
        description: "Google OAuth client secret.",
      },
    ],
  },
  {
    category: "Email & Notifications",
    items: [
      {
        key: "RESEND_API_KEY",
        required: false,
        description: "API key from Resend. Optional in dev because links log to console.",
      },
      {
        key: "EMAIL_FROM",
        required: true,
        description: "Verified sender e.g. noreply@yourdomain.com.",
      },
      {
        key: "EMAIL_FROM_NAME",
        required: true,
        description: "Friendly sender name shown in inboxes.",
      },
      {
        key: "ADMIN_EMAIL",
        required: false,
        description: "Address that should receive internal alerts.",
      },
    ],
  },
  {
    category: "Stripe Billing",
    items: [
      {
        key: "STRIPE_SECRET_KEY",
        required: false,
        description: "Server-side key (starts with sk_). Needed for live checkout.",
      },
      {
        key: "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY",
        required: false,
        description: "Client-side key (starts with pk_).",
      },
      {
        key: "STRIPE_WEBHOOK_SECRET",
        required: false,
        description: "Provided by Stripe CLI or Dashboard when you configure webhooks.",
      },
      {
        key: "STRIPE_STARTER_PRICE_ID",
        required: false,
        description: "Price ID for the Starter plan.",
      },
      {
        key: "STRIPE_STARTER_PRODUCT_ID",
        required: false,
        description: "Optional Stripe product reference for Starter.",
      },
      {
        key: "STRIPE_GROWTH_PRICE_ID",
        required: false,
        description: "Price ID for Growth plan.",
      },
      {
        key: "STRIPE_GROWTH_PRODUCT_ID",
        required: false,
        description: "Optional Stripe product reference for Growth.",
      },
      {
        key: "STRIPE_SCALE_PRICE_ID",
        required: false,
        description: "Price ID for Scale plan.",
      },
      {
        key: "STRIPE_SCALE_PRODUCT_ID",
        required: false,
        description: "Optional Stripe product reference for Scale.",
      },
      {
        key: "STRIPE_TRIAL_PERIOD_DAYS",
        required: false,
        description: "Number of trial days applied to paid subscriptions (default 14).",
      },
      {
        key: "ENABLE_SUBSCRIPTION_ENFORCEMENT",
        required: false,
        description: "Set to \"true\" to block premium pages unless a subscription exists.",
      },
    ],
  },
];

export default function EnvVariablesPage() {
  return (
    <div className="prose prose-gray max-w-none dark:prose-invert">
      <h1>Environment Variables Reference</h1>
      <p className="lead">
        Every purchase ships with a <code>.env.example</code> file. Copy it to <code>.env</code> after unzipping the
        download, then replace the placeholders below with real credentials.
      </p>

      {envVars.map((section) => (
        <section key={section.category}>
          <h2>{section.category}</h2>
          <table>
            <thead>
              <tr>
                <th>Variable</th>
                <th>Required</th>
                <th>Purpose</th>
              </tr>
            </thead>
            <tbody>
              {section.items.map((item) => (
                <tr key={item.key}>
                  <td>
                    <code>{item.key}</code>
                  </td>
                  <td>{item.required ? "Yes" : "Optional"}</td>
                  <td>{item.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      ))}

      <h2>Tips</h2>
      <ul>
        <li>
          Keep a separate <code>.env.local</code> for secrets you never want to ship with the template you resell.
        </li>
        <li>
          When deploying to Vercel, paste everything under <strong>Project Settings → Environment Variables</strong>.
          Redeploy after updating secrets.
        </li>
        <li>
          Rotate Stripe and Resend keys whenever you share a copy of the boilerplate with a customer.
        </li>
      </ul>
    </div>
  );
}
