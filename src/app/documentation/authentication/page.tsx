export default function AuthenticationPage() {
  return (
    <div className="prose prose-gray max-w-none dark:prose-invert">
      <h1>Authentication</h1>
      <p className="lead">
        StartupKit ships with email + password auth, Google OAuth, email verification, password reset, onboarding, and
        middleware-based route protection powered by NextAuth.js.
      </p>

      <h2>Architecture Overview</h2>
      <ul>
        <li>
          <strong>NextAuth configuration</strong>: <code>src/lib/auth.ts</code> wires the Prisma adapter, Google provider
          and Credentials provider.
        </li>
        <li>
          <strong>Database models</strong>: Defined in <code>prisma/schema.prisma</code> (User, Account, Session,
          VerificationToken, PasswordResetToken).
        </li>
        <li>
          <strong>UI flows</strong>: All auth pages live in <code>src/app/(auth)</code> and use shadcn/ui components for
          consistency.
        </li>
        <li>
          <strong>Middleware</strong>: <code>src/middleware.ts</code> guards dashboard routes, onboarding, and optional
          subscription enforcement.
        </li>
      </ul>

      <h2>Flows</h2>
      <h3>Registration</h3>
      <ol>
        <li>User signs up at <code>/register</code> with email/password or Google.</li>
        <li>Email/password users receive a verification link (Resend or console log).</li>
        <li>Google users have <code>emailVerified</code> set automatically.</li>
        <li>Everyone is redirected to <code>/dashboard/onboarding</code> until they finish the profile form.</li>
      </ol>

      <h3>Login</h3>
      <p>
        Credentials are validated with bcrypt via Prisma. Users must have <code>emailVerified</code> set. OAuth users can
        log in immediately after the Google callback.
      </p>

      <h3>Password Reset</h3>
      <ol>
        <li>Users request a reset at <code>/forgot-password</code>.</li>
        <li>A <code>PasswordResetToken</code> is created and emailed (or logged in dev).</li>
        <li>The reset page verifies the token and lets the user set a new password.</li>
      </ol>

      <h2>Configuration Steps</h2>
      <ol>
        <li>Fill out the env vars in <code>.env</code> (<code>DATABASE_URL</code>, <code>NEXTAUTH_SECRET</code>, Google,
          Resend, etc.).</li>
        <li>Generate Prisma client + push schema.</li>
        <li>Start the dev server and register your first account.</li>
        <li>Visit <code>/dev-tools</code> to mark the account verified if you have not hooked up Resend yet.</li>
      </ol>

      <h2>Extending Authentication</h2>
      <ul>
        <li>
          <strong>Add providers</strong>: Import any NextAuth provider inside <code>src/lib/auth.ts</code> and append it
          to the <code>providers</code> array. Remember to set env vars for the provider keys.
        </li>
        <li>
          <strong>Custom fields</strong>: Add columns to the <code>User</code> model in Prisma, run
          <code>npx prisma db push</code>, then update onboarding + dashboard forms to collect/store values.
        </li>
        <li>
          <strong>Session data</strong>: Use the <code>jwt</code> and <code>session</code> callbacks to expose extra
          fields to the client.
        </li>
      </ul>

      <h2>Testing Checklist</h2>
      <ul>
        <li>Create two accounts: email/password and Google.</li>
        <li>Ensure the middleware forces onboarding before hitting <code>/dashboard</code>.</li>
        <li>Confirm the password reset email logs the correct URL locally.</li>
        <li>Toggle <code>ENABLE_SUBSCRIPTION_ENFORCEMENT</code> to verify gated dashboards still respect auth.</li>
      </ul>
    </div>
  );
}
