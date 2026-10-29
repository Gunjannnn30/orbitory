import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui";
import { Badge } from "@/components/ui";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui";
import { ChevronRight, ExternalLink, Timer, AlertTriangle } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

async function getCompany(slug: string) {
  const company = await prisma.company.findUnique({
    where: { slug },
    include: {
      industries: { include: { industry: true } },
      niches: { include: { niche: true } },
      founders: { include: { founder: true } },
      products: true,
      timelineEvents: { orderBy: [{ eventDate: "asc" }, { createdAt: "asc" }] },
      strategicDecisions: true,
      metrics: { include: { metricDefinition: true }, orderBy: [{ metricDefinition: { category: "asc" } }, { periodEnd: "desc" }] },
      claims: { orderBy: { createdAt: "desc" }, take: 30 },
      asCompetitor: { include: { competitor: true } },
    },
  });
  if (!company) return null;
  return company;
}

type DossierPageParams = { params: Promise<{ slug: string }> };

export default async function CompanyDossierPage({ params }: DossierPageParams) {
  const { slug } = await params;
  const company = await getCompany(slug);
  if (!company) notFound();

  const timelineByYear: Record<string, typeof company.timelineEvents> = {};
  for (const e of company.timelineEvents) {
    const year = e.eventDate ? String(e.eventDate.getFullYear()) : "undated";
    if (!timelineByYear[year]) timelineByYear[year] = [];
    timelineByYear[year].push(e);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <Badge variant={company.researchStatus === "RESEARCHED" ? "success" : company.researchStatus === "PARTIAL" ? "warn" : "muted"}>
              {company.researchStatus}
            </Badge>
            <Badge variant="ghost">{company.companyStatus}</Badge>
          </div>
          <h1 className="font-display text-3xl font-semibold tracking-tight">{company.name}</h1>
          <p className="text-muted-foreground">{company.shortDescription ?? company.description}</p>
        </div>
        <div className="flex items-end gap-2 md:ml-auto">
          {company.website && (
            <Link href={company.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 rounded-lg border border-input bg-input/40 px-3 py-2 text-sm text-muted-foreground hover:bg-accent/30 transition">
              <ExternalLink className="h-4 w-4" /> Website
            </Link>
          )}
        </div>
      </div>

      {/* Meta strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <MetaItem label="Founded" value={company.foundedAt ? String(company.foundedAt.getFullYear()) : "—"} />
        <MetaItem label="Headquarters" value={company.headquarters || "—"} />
        <MetaItem label="Status" value={String(company.companyStatus)} />
        <MetaItem label="Business model" value={String(company.businessModel)} />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {/* Industries */}
        <Card className="col-span-2 md:col-span-1">
          <CardHeader>
            <CardTitle className="text-sm">Industries</CardTitle>
          </CardHeader>
          <CardContent className="pb-2">
            <div className="flex flex-wrap gap-2">
              {company.industries.map((ci) => (
                <Link key={ci.industry.slug} href={`/explore?industry=${ci.industry.slug}`} className="rounded-lg border border-input bg-input/30 px-2 py-1 text-xs text-muted-foreground hover:bg-accent/30 transition">
                  {ci.industry.name}
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Niches */}
        <Card className="col-span-2 md:col-span-1">
          <CardHeader>
            <CardTitle className="text-sm">Markets / Niches</CardTitle>
          </CardHeader>
          <CardContent className="pb-2">
            <div className="flex flex-wrap gap-2">
              {company.niches.length > 0 ? (
                company.niches.map((cn_) => (
                  <Link key={cn_.niche.slug} href={`/explore?niche=${cn_.niche.slug}`} className="rounded-lg border border-input bg-input/30 px-2 py-1 text-xs text-muted-foreground hover:bg-accent/30 transition">
                    {cn_.niche.name}
                  </Link>
                ))
              ) : (
                <p className="text-xs text-muted-foreground">None classified</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Founders */}
        <Card className="col-span-2 md:col-span-1">
          <CardHeader>
            <CardTitle className="text-sm">Founders</CardTitle>
          </CardHeader>
          <CardContent className="pb-2">
            {company.founders.length > 0 ? (
              <ul className="space-y-1 text-xs">
                {company.founders.map((f) => (
                  <li key={f.founder.id} className="flex items-center gap-2">
                    <span className="font-medium">{f.founder.name}</span>
                    {f.role && <span className="text-muted-foreground">— {f.role}</span>}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-muted-foreground">Not recorded</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview">
        <TabsList className="grid w-full grid-cols-4 border-none">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="story">Origin Story</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="model">Business Model</TabsTrigger>
          <TabsTrigger value="strategy">Strategy</TabsTrigger>
          <TabsTrigger value="decisions">Decisions</TabsTrigger>
          <TabsTrigger value="failures">Failures</TabsTrigger>
          <TabsTrigger value="metrics">Metrics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="border-none">
          <OverviewTab company={company} timelineByYear={timelineByYear} />
        </TabsContent>
        <TabsContent value="story" className="border-none">
          <StoryTab company={company} />
        </TabsContent>
        <TabsContent value="products" className="border-none">
          <ProductsTab company={company} />
        </TabsContent>
        <TabsContent value="model" className="border-none">
          <ModelTab company={company} />
        </TabsContent>
        <TabsContent value="strategy" className="border-none">
          <StrategyTab company={company} />
        </TabsContent>
        <TabsContent value="decisions" className="border-none">
          <DecisionsTab company={company} />
        </TabsContent>
        <TabsContent value="failures" className="border-none">
          <FailuresTab company={company} />
        </TabsContent>
        <TabsContent value="metrics" className="border-none">
          <MetricsTab company={company} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function MetaItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-card p-3">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="font-medium">{value}</div>
    </div>
  );
}

function OverviewTab({ company, timelineByYear }: any) {
  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-border bg-card p-5">
        <h3 className="font-display text-lg font-semibold">Description</h3>
        <p className="mt-2 text-muted-foreground leading-relaxed">{company.description}</p>
      </div>
      <div className="rounded-xl border border-border bg-card p-5">
        <h3 className="font-display text-lg font-semibold">Timeline</h3>
        <div className="mt-4 space-y-4">
          {Object.entries(timelineByYear).map(([year, events]: [string, any]) => (
            <div key={year}>
              <h4 className="text-sm font-semibold text-muted-foreground">{year}</h4>
              <ul className="mt-1.5 space-y-2 text-sm">
                {events.map((e: any) => (
                  <li key={e.id} className="flex gap-3">
                    <div className="w-8 text-xs font-medium text-primary">{e.eventDate ? String(e.eventDate.getFullYear()) : "—"}</div>
                    <div>
                      <div className="font-medium">{e.title}</div>
                      {e.description && <div className="text-xs text-muted-foreground">{e.description}</div>}
                      <div className="flex items-center gap-1 mt-1 text-[10px]">
                        <Timer className="h-3 w-3" /> <span className="text-muted-foreground">{e.evidenceStatus}</span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          {company.timelineEvents.length === 0 && <p className="text-sm text-muted-foreground">No timeline events recorded.</p>}
        </div>
      </div>
    </div>
  );
}

function StoryTab({ company }: any) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Origin story</CardTitle>
          <CardDescription>The documented founding context and early decisions.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground leading-relaxed">
            Origin narrative for {company.name} is captured in timeline events and strategic decisions on this dossier.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

function ProductsTab({ company }: any) {
  return (
    <div className="space-y-4">
      <h2 className="font-display text-lg font-semibold">Product portfolio</h2>
      {company.products.length === 0 ? (
        <p className="text-sm text-muted-foreground">No products recorded.</p>
      ) : (
        <div className="space-y-3">
          {company.products.map((p: any) => (
            <Card key={p.id} className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="font-medium">{p.name}</div>
                  <div className="text-xs text-muted-foreground">{p.status ?? "Status not recorded"}</div>
                </div>
                <Badge variant="ghost">{p.status ?? "—"}</Badge>
              </div>
              {p.description && <p className="mt-1.5 text-sm text-muted-foreground">{p.description}</p>}
              {p.pricingModel && (
                <p className="mt-1 text-[11px] font-medium text-muted-foreground">Pricing: {p.pricingModel}</p>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function ModelTab({ company }: any) {
  return (
    <div className="space-y-4">
      <h2 className="font-display text-lg font-semibold">Business model</h2>
      <div className="rounded-xl border border-border bg-card p-5">
        <p className="text-muted-foreground">
          Business model: <span className="font-medium capitalize">{String(company.businessModel)}</span>{" "}
          · Ownership: <span className="font-medium">{String(company.ownershipType)}</span>
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          Detailed business-model analysis (value proposition, revenue streams, cost structure) is captured in the
          research workspace. Strategic decisions and their outcomes appear under Strategy and Decisions.
        </p>
      </div>
    </div>
  );
}

function StrategyTab({ company }: any) {
  return (
    <div className="space-y-4">
      <h2 className="font-display text-lg font-semibold">Strategy &amp; positioning</h2>
      <p className="text-sm text-muted-foreground">
        Competitive differentiation, growth strategy, and defensibility are documented in strategic decisions and the
        competitor list below.
      </p>
      <div className="rounded-xl border border-border bg-card p-5">
        <h3 className="font-medium text-sm">Documented competitors</h3>
        {company.asCompetitor.length === 0 ? (
          <p className="mt-2 text-sm text-muted-foreground">No competitor relationships recorded.</p>
        ) : (
          <ul className="mt-2 space-y-2 text-sm">
            {company.asCompetitor.map((c: any) => (
              <li key={c.competitorCompanyId} className="flex items-center gap-3">
                <Link href={`/companies/${c.competitor.slug}`} className="font-medium hover:underline">
                  {c.competitor.name}
                </Link>
                <Badge variant="ghost" className="ml-auto">{String(c.relationshipType)}</Badge>
                {c.notes && <span className="text-xs text-muted-foreground">— {c.notes}</span>}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function DecisionsTab({ company }: any) {
  return (
    <div className="space-y-4">
      <h2 className="font-display text-lg font-semibold">Strategic decisions</h2>
      {company.strategicDecisions.length === 0 ? (
        <p className="text-sm text-muted-foreground">No strategic decisions recorded.</p>
      ) : (
        <div className="space-y-4">
          {company.strategicDecisions.map((d: any) => (
            <Card key={d.id} className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="font-medium">{d.title}</div>
                  <Badge variant={d.evidenceStatus === "VERIFIED" ? "success" : d.evidenceStatus === "REPORTED" ? "muted" : "warn"}>
                    {d.evidenceStatus}
                  </Badge>
                </div>
              </div>
              {d.context && <p className="mt-1.5 text-sm text-muted-foreground">{d.context}</p>}
              {d.decision && <p className="mt-1 text-sm">{d.decision}</p>}
              {d.documentedOutcome && (
                <p className="mt-1 text-[11px] font-medium text-green-foreground">Outcome: {d.documentedOutcome}</p>
              )}
              {d.limitations && (
                <p className="mt-1 text-[11px] font-medium text-muted-foreground">Limitations: {d.limitations}</p>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function FailuresTab({ company }: any) {
  return (
    <div className="space-y-4">
      <h2 className="font-display text-lg font-semibold">Failures &amp; unresolved risks</h2>
      <p className="text-sm text-muted-foreground">
        Failures are treated as a first-class research category. Discontinued products, unsuccessful pivots, and
        strategic reversals appear in the timeline below with evidence labels.
      </p>
      <div className="rounded-xl border border-border bg-card p-5">
        <h3 className="font-medium text-sm">Timeline events (failures &amp; reversals)</h3>
        <ul className="mt-2 space-y-3 text-sm">
          {company.timelineEvents.filter((e: any) => ["FAILURE", "CLOSURE", "RESTRUCTURING", "PIVOT"].includes(e.eventType)).length > 0 ? (
            company.timelineEvents
              .filter((e: any) => ["FAILURE", "CLOSURE", "RESTRUCTURING", "PIVOT"].includes(e.eventType))
              .map((e: any) => (
                <li key={e.id} className="flex gap-3">
                  <div className="w-8 text-xs font-medium text-danger">{e.eventDate ? String(e.eventDate.getFullYear()) : "—"}</div>
                  <div>
                    <div className="font-medium">{e.title}</div>
                    {e.description && <div className="text-xs text-muted-foreground">{e.description}</div>}
                    <div className="flex items-center gap-1 mt-1 text-[10px]">
                      <AlertTriangle className="h-3 w-3 text-danger" /> <span className="text-muted-foreground">{e.evidenceStatus}</span>
                    </div>
                  </div>
                </li>
              ))
          ) : (
            <p className="text-sm text-muted-foreground">No documented failures or reversals.</p>
          )}
        </ul>
      </div>
    </div>
  );
}

function MetricsTab({ company }: any) {
  return (
    <div className="space-y-4">
      <h2 className="font-display text-lg font-semibold">PM Metrics</h2>
      <p className="text-sm text-muted-foreground">
        Observed metric values for this company. Values are labeled by type (reported / calculated / estimated /
        illustrative) so you can distinguish documented performance from inferred figures.
      </p>
      {company.metrics.length === 0 ? (
        <p className="text-sm text-muted-foreground">No metrics recorded for this company.</p>
      ) : (
        <div className="space-y-3">
          {company.metrics.map((m: any) => (
            <Card key={m.id} className="p-4">
              <div className="flex items-start justify-between gap-3 mb-1">
                <div className="flex flex-col">
                  <div className="font-medium">{m.metricDefinition.name}</div>
                  <div className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground">{m.metricDefinition.category}</div>
                </div>
                <Badge variant={m.valueType === "REPORTED" ? "success" : m.valueType === "ILLUSTRATIVE" ? "warn" : "muted"}>
                  {m.valueType}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mb-2">{m.metricDefinition.definition ?? "No definition."}</p>
              <div className="flex items-center gap-4 text-sm">
                <span className="font-medium">{m.valueText ?? m.value?.toString() ?? "—"} {m.unit ?? ""}</span>
                {m.periodEnd && <span className="text-muted-foreground">Period: {String(m.periodEnd).slice(0, 7)}</span>}
                {m.reportedAt && <span className="text-muted-foreground">Reported: {String(m.reportedAt).slice(0, 10)}</span>}
              </div>
              {m.metricDefinition.formula && (
                <p className="mt-1 text-[10px] text-muted-foreground">Formula: {m.metricDefinition.formula}</p>
              )}
              {m.notes && (
                <p className="mt-1 text-[10px] text-muted-foreground">Note: {m.notes}</p>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
