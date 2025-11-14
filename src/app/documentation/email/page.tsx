export default function EmailSystemPage() {
  return (
    <div className="prose prose-gray max-w-none dark:prose-invert">
      <h1>Email System</h1>
      <p className="lead">
        Transactional emails (verification, welcome, password reset, subscription updates) are powered by Resend with
        beautifully formatted HTML templates stored in <code>src/lib/email.ts</code>.
      </p>

      <h2>Capabilities</h2>
      <ul>
        <li>Email verification on sign-up.</li>
        <li>Password reset requests and confirmations.</li>
        <li>Welcome emails after onboarding.</li>
        <li>Subscription lifecycle notifications (confirmation, cancellation, payment failures).</li>
        <li>Console logging fallback for development.</li>
      </ul>

      <h2>Configuration</h2>
      <ol>
        <li>Grab a Resend API key and set <code>RESEND_API_KEY</code>.</li>
        <li>Set <code>EMAIL_FROM</code> (verified domain), <code>EMAIL_FROM_NAME</code>, and optionally
          <code>ADMIN_EMAIL</code>.
        </li>
        <li>Point <code>NEXT_PUBLIC_APP_URL</code> at the domain you want to appear inside links.</li>
      </ol>

      <div className="docs-callout">
        <p className="font-semibold">Development friendly</p>
        <p className="text-sm text-muted-foreground">
          If <code>RESEND_API_KEY</code> is missing the project prints every verification or password reset URL directly
          to your terminal so you can click it instantly.
        </p>
      </div>

      <h2>Templates</h2>
      <p>
        Each helper in <code>src/lib/email.ts</code> returns a full HTML string. Update the markup or switch to React
        email components if you prefer:
      </p>
      <ul>
        <li><code>sendVerificationEmail(email, token)</code></li>
        <li><code>sendPasswordResetEmail(email, token)</code></li>
        <li><code>sendWelcomeEmail(email, name)</code></li>
        <li><code>sendSubscriptionConfirmationEmail(email, name, plan, periodEnd)</code></li>
      </ul>

      <h2>Testing Tips</h2>
      <ul>
        <li>Use <code>/dev-tools</code> to manually mark emails verified if you are offline.</li>
        <li>
          Point <code>EMAIL_FROM</code> to <code>onboarding@resend.dev</code> for quick sandbox testing while your domain
          is pending verification.
        </li>
        <li>Keep <code>ADMIN_EMAIL</code> populated so you can quickly route critical billing notifications internally.</li>
      </ul>

      <h2>Deliverability</h2>
      <ul>
        <li>Verify your sending domain and add the DNS records Resend provides.</li>
        <li>
          Use branded <code>EMAIL_FROM_NAME</code> so customers immediately recognize your company name in their inbox.
        </li>
        <li>Set up DMARC + SPF + DKIM once you map the project to your production domain.</li>
      </ul>
    </div>
  );
}
