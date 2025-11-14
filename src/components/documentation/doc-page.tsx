import type { DocPage } from "@/content/documentation/types";

export function DocPageContent({ page }: { page: DocPage }) {
  return (
    <div className="prose prose-gray max-w-none dark:prose-invert">
      <h1>{page.title}</h1>
      <p className="lead">{page.description}</p>
      {page.sections.map((section) => (
        <section key={section.heading}>
          <h2>{section.heading}</h2>
          {section.body.map((paragraph, index) => (
            <p key={`${section.heading}-body-${index}`}>{paragraph}</p>
          ))}
          {section.bullets && (
            <ul>
              {section.bullets.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          )}
          {section.references && section.references.length > 0 && (
            <div className="mt-4 rounded-xl border border-border bg-muted/30 p-4">
              <p className="text-sm font-semibold text-muted-foreground">Relevant files</p>
              <ul className="mt-2 text-sm">
                {section.references.map((reference) => (
                  <li key={`${reference.path}-${reference.title}`}>
                    <code>{reference.path}</code>
                    {reference.description ? ` — ${reference.description}` : ` — ${reference.title}`}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      ))}
    </div>
  );
}
