export default function AddingFeaturesPage() {
  return (
    <div className="prose prose-gray max-w-none dark:prose-invert">
      <h1>Adding Features</h1>
      <p className="lead">
        Treat StartupKit as the base layer for any SaaS. This guide shows where to plug in new domains, APIs, or UI
        without breaking the upgrade path you sell to customers.
      </p>

      <h2>1. Extend the Data Layer</h2>
      <ol>
        <li>
          Add Prisma models in <code>prisma/schema.prisma</code> for your feature (projects, tasks, AI runs, etc.).
        </li>
        <li>Run <code>npx prisma generate</code> and <code>npx prisma db push</code>.</li>
        <li>
          Create typed helpers in <code>src/lib</code> or <code>src/server</code> (e.g., <code>src/lib/projects.ts</code>
          ).
        </li>
      </ol>

      <h2>2. Build API Routes</h2>
      <ul>
        <li>
          Use the App Router API routes (<code>src/app/api/feature/route.ts</code>) with <code>NextResponse</code>.
        </li>
        <li>
          Import <code>getServerSession</code> from <code>next-auth</code> and validate access before mutating data.
        </li>
        <li>Return JSON the dashboard can consume (status messages, pagination metadata, etc.).</li>
      </ul>

      <h2>3. Connect to the Dashboard</h2>
      <ol>
        <li>
          Add new routes inside <code>src/app/dashboard</code>. The `page.tsx` files are server components so you can
          fetch data directly with Prisma.
        </li>
        <li>
          Compose UI from the primitives in <code>src/components/ui</code> and layout helpers in
          <code>src/components/dashboard</code>.
        </li>
        <li>
          Gate access with <code>isPlanFeatureEnabled</code> or <code>hasFeatureAccess</code> to keep upsell flows
          consistent.
        </li>
      </ol>

      <h2>4. Update Pricing & Docs</h2>
      <ul>
        <li>Edit <code>STRIPE_PLANS</code> to toggle the new feature per tier.</li>
        <li>Update <code>src/components/pricing-comparison.tsx</code> and any marketing copy.</li>
        <li>
          Mention the new capability in this documentation page before shipping an updated zip to customers.
        </li>
      </ul>

      <h2>5. Release Process</h2>
      <ol>
        <li>Test locally with multiple accounts and plans.</li>
        <li>Run <code>npm run lint</code> and <code>npm run build</code> to ensure the template still compiles.</li>
        <li>Zip the project (excluding <code>node_modules</code> if you want a smaller download) and send it to your customers.</li>
      </ol>

      <h2>Pro Tips</h2>
      <ul>
        <li>Keep feature-specific logic in isolated folders so buyers can remove what they do not need.</li>
        <li>Document manual steps (API keys, third-party services) inside <code>/documentation</code> so resale customers stay unblocked.</li>
        <li>Use feature flags or env variables when experimenting—only bake in what is production-ready before exporting the zip.</li>
      </ul>
    </div>
  );
}
