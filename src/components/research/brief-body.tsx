import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { KeywordAnalyticsSectionEnhanced } from "@/components/research/keyword-analytics-section-enhanced";
import type { ProofSignal, ResearchBriefResult } from "@/lib/research/types";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const SectionBlock = ({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) => (
  <section className="glass-strong rounded-[32px] border border-[color:var(--glass-border)] bg-[color:var(--glass-surface)] p-8 shadow-lg transition hover:shadow-xl">
    <div className="mb-6 flex flex-col gap-2">
      <h2 className="bg-gradient-to-br from-foreground to-foreground-secondary bg-clip-text text-2xl font-bold tracking-tight text-transparent">{title}</h2>
      {description && (
        <div className="prose prose-sm max-w-none text-muted-foreground [&_p]:leading-relaxed [&_p]:my-2 [&_a]:text-primary [&_a]:underline-offset-2 hover:[&_a]:underline">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {description}
          </ReactMarkdown>
        </div>
      )}
    </div>
    {children}
  </section>
);

const WhyNowList = ({ items }: { items: string[] }) =>
  items.length ? (
    <ul className="list-disc space-y-2 pl-6 text-sm leading-relaxed text-muted-foreground">
      {items.map((item, index) => (
        <li key={`${item}-${index}`}>{item}</li>
      ))}
    </ul>
  ) : (
    <p className="text-sm text-muted-foreground">Timing signals will appear when available.</p>
  );

const formatDomain = (url: string) => {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
};

const CompetitionCards = ({
  content,
}: {
  content: ResearchBriefResult["competition"];
}) => {
  if (!content?.competitors?.length) {
    return (
      <p className="text-sm text-muted-foreground">
        Competition details will populate when the briefing process finishes.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <p className="text-sm font-medium text-muted-foreground">
        Competitive density:{" "}
        <span className="text-foreground capitalize">{content.competitiveDensity ?? "unknown"}</span>
      </p>
      <div className="grid gap-5 md:grid-cols-2">
        {content.competitors.map((competitor) => (
          <Card key={competitor.name} className="h-full">
            <CardHeader className="mb-0 pb-0">
              <CardTitle className="text-xl">{competitor.name}</CardTitle>
              <p className="text-sm text-muted-foreground">{competitor.positioning}</p>
            </CardHeader>
            <CardContent className="mt-4 space-y-4 text-sm">
              <p className="text-muted-foreground">{competitor.description}</p>
              {competitor.strengths?.length ? (
                <div>
                  <p className="font-medium">Strengths</p>
                  <ul className="list-disc pl-5 text-muted-foreground">
                    {competitor.strengths.map((item, index) => (
                      <li key={`${competitor.name}-strength-${index}`}>{item}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
              {competitor.weaknesses?.length ? (
                <div>
                  <p className="font-medium">Weaknesses</p>
                  <ul className="list-disc pl-5 text-muted-foreground">
                    {competitor.weaknesses.map((item, index) => (
                      <li key={`${competitor.name}-weakness-${index}`}>{item}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
              {competitor.gaps?.length ? (
                <div>
                  <p className="font-medium">Gaps & opportunities</p>
                  <ul className="list-disc pl-5 text-muted-foreground">
                    {competitor.gaps.map((item, index) => (
                      <li key={`${competitor.name}-gap-${index}`}>{item}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </CardContent>
          </Card>
        ))}
      </div>
      {content.disclaimer && (
        <p className="text-xs text-muted-foreground">{content.disclaimer}</p>
      )}
    </div>
  );
};

const ProofSignals = ({
  signals,
  summary,
  stage,
  disclaimer,
}: {
  signals: ProofSignal[];
  summary?: string;
  stage?: string;
  disclaimer?: string;
}) => (
  <SectionBlock
    title="Proof Signals"
    description={summary ?? "Evidence highlighting traction, demand, and supporting catalysts."}
  >
    {stage && (
      <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-muted px-4 py-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
        Market stage: <span className="text-foreground">{stage}</span>
      </div>
    )}
    {signals.length ? (
      <Accordion type="single" collapsible className="space-y-3">
        {signals.map((signal, index) => (
          <AccordionItem key={`signal-${index}`} value={`signal-${index}`} className="rounded-2xl border px-4">
            <AccordionTrigger className="text-left text-base font-semibold text-foreground">
              <div className="prose prose-sm max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0 [&_strong]:font-semibold">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {signal.description}
                </ReactMarkdown>
              </div>
            </AccordionTrigger>
            <AccordionContent className="space-y-3 text-sm text-muted-foreground">
              <div className="prose prose-sm max-w-none text-muted-foreground [&>*:first-child]:mt-0 [&>*:last-child]:mb-0 [&_p]:leading-relaxed [&_p]:my-2 [&_a]:text-primary [&_a]:underline-offset-2 hover:[&_a]:underline [&_strong]:font-semibold [&_ol]:my-2 [&_ol]:pl-4 [&_ul]:my-2 [&_ul]:pl-4 [&_li]:my-1">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {signal.evidence}
                </ReactMarkdown>
              </div>
              {signal.sources?.length ? (
                <div className="space-y-1">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground/80">
                    Sources
                  </p>
                  <ul className="space-y-1 text-sm">
                    {signal.sources.map((source, sourceIdx) => (
                      <li key={`${source}-${sourceIdx}`}>
                        <a
                          href={source}
                          target="_blank"
                          rel="noreferrer"
                          className="text-primary underline-offset-2 hover:underline"
                        >
                          {formatDomain(source)}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    ) : (
      <p className="text-sm text-muted-foreground">
        Proof signals will appear here once your deep research completes.
      </p>
    )}
    {disclaimer && (
      <p className="mt-6 text-xs text-muted-foreground">{disclaimer}</p>
    )}
  </SectionBlock>
);

const ResourcesFooter = ({ sources }: { sources: string[] }) => (
  <SectionBlock
    title="Research Sources"
    description="Click any reference to open the original source in a new tab."
  >
    {sources.length ? (
      <div className="grid gap-3 md:grid-cols-2">
        {sources.map((source, index) => (
          <a
            key={`${source}-${index}`}
            href={source}
            target="_blank"
            rel="noreferrer"
            className="group flex items-center justify-between rounded-2xl border border-dashed border-muted px-4 py-3 text-sm transition hover:border-primary"
          >
            <span className="truncate text-primary group-hover:underline">
              {source}
            </span>
            <span className="text-xs uppercase tracking-wide text-muted-foreground">
              {formatDomain(source)}
            </span>
          </a>
        ))}
      </div>
    ) : (
      <p className="text-sm text-muted-foreground">Sources will appear once proof signals are generated.</p>
    )}
  </SectionBlock>
);

export function ResearchBriefBody({
  content,
  proofSources = [],
}: {
  content: ResearchBriefResult;
  proofSources?: string[];
}) {
  return (
    <>
      <div className="grid gap-6 md:grid-cols-2">
        <SectionBlock title="Problem" description="The core pain point and who experiences it.">
          <p className="text-sm leading-relaxed text-muted-foreground">
            {content.problem}
          </p>
        </SectionBlock>
        <SectionBlock title="Why Now?" description="Timing signals and market catalysts.">
          <WhyNowList items={content.whyNow ?? []} />
        </SectionBlock>
      </div>

      <SectionBlock title="Competition Landscape">
        <CompetitionCards content={content.competition} />
      </SectionBlock>

      <KeywordAnalyticsSectionEnhanced data={content.keywords ?? null} />

      <ProofSignals
        signals={content.proofSignals ?? []}
        summary={content.proofSignalSummary}
        stage={content.proofSignalStage}
        disclaimer={content.proofSignalDisclaimer}
      />

      <ResourcesFooter sources={proofSources} />
    </>
  );
}
