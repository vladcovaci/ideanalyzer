export default function ThemingPage() {
  return (
    <div className="prose prose-gray max-w-none dark:prose-invert">
      <h1>Theming & Branding</h1>
      <p className="lead">
        Update one file to refresh the entire visual language. Tailwind v4 + CSS variables enable sweeping color and
        typography changes without touching every component.
      </p>

      <h2>Color System</h2>
      <p>
        All brand colors live in <code>src/app/globals.css</code> inside the <code>:root</code> block. Adjust hues, swap
        gradients, or change border radiuses and every shadcn component picks them up automatically.
      </p>
      <pre className="bg-gray-950 text-gray-50 p-4 rounded-lg overflow-x-auto">
        <code>{`:root {
  --primary: 229 87% 63%;
  --secondary: 37 100% 87%;
  --radius: 1.5rem;
}`}</code>
      </pre>
      <p>Update the values, then restart the dev server to recalibrate the Tailwind inline theme tokens.</p>

      <h2>Dark Mode</h2>
      <p>
        <code>next-themes</code> handles theme switching. Wrap your app in <code>ThemeProvider</code> from
        <code>src/components/providers/theme-provider.tsx</code> (already configured in <code>src/app/layout.tsx</code>).
        Use the <code>useTheme</code> hook (see <code>src/components/ui/sonner.tsx</code>) to respond to theme changes.
      </p>

      <h2>Fonts</h2>
      <p>
        Modify <code>--font-sans</code> and <code>--font-serif</code> variables in <code>globals.css</code> to point at
        your preferred families. Because Tailwind pulls from those CSS variables, headings, body text, and components
        update in sync.
      </p>

      <h2>Component Tokens</h2>
      <p>
        Shadcn components live in <code>src/components/ui</code>. Each component uses the <code>cn</code> helper and Tailwind classes referencing the CSS variables above. When you need bespoke variants, edit the relevant file (for example
        <code>ui/button.tsx</code>) and adjust the <code>cva</code> config.
      </p>

      <h2>Backgrounds & Glassmorphism</h2>
      <p>
        The landing pages rely on the glass variables defined in <code>globals.css</code> (
        <code>--glass-surface</code>, <code>--glass-border</code>, etc.). Update them to fine-tune the transparency,
        blur, or drop shadows across hero cards, sidebar, and documentation tiles.
      </p>

      <h2>Branding Checklist</h2>
      <ul>
        <li>Swap logos/favicons in <code>public/</code> (apple-icon.tsx, icon.tsx, etc.).</li>
        <li>Update plan names/prices in <code>src/lib/stripe.ts</code>.</li>
        <li>Customize marketing copy in <code>src/app/page.tsx</code>, <code>src/app/pricing</code>, and other public routes.</li>
        <li>Replace testimonial or feature illustrations if needed (see <code>src/components/marketing</code>).</li>
      </ul>
    </div>
  );
}
