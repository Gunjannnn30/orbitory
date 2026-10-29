import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui";
import { Input } from "@/components/ui";
import { Badge } from "@/components/ui";
import { Card } from "@/components/ui";
import { Search, Compass, List, ChevronRight } from "lucide-react";
import Link from "next/link";

type Industry = { id: string; name: string; slug: string };
type Niche = { id: string; name: string; slug: string; industryId: string };

export default async function ExplorePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; industry?: string; niche?: string; status?: string; researchStatus?: string }>;
}) {
  const params = await searchParams;
  const q = (params.q ?? "").trim();
  const industry = params.industry ?? "";
  const niche = params.niche ?? "";
  const status = params.status ?? "";
  const researchStatus = params.researchStatus ?? "";

  const where: any = {};
  if (q) {
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { shortDescription: { contains: q, mode: "insensitive" } },
      { description: { contains: q, mode: "insensitive" } },
      { headquarters: { contains: q, mode: "insensitive" } },
    ];
  }
  if (industry) where.industries = { some: { industry: { slug: industry } } };
  if (niche) where.niches = { some: { niche: { slug: niche } } };
  if (status) where.companyStatus = status;
  if (researchStatus) where.researchStatus = researchStatus;

  const [companies, total, industries] = await Promise.all([
    prisma.company.findMany({
      where,
      orderBy: { name: "asc" },
      take: 20,
      include: {
        industries: { include: { industry: true } },
        niches: { include: { niche: true } },
        _count: { select: { products: true, timelineEvents: true, metrics: true, claims: true } },
      },
    }),
    prisma.company.count({ where }),
    prisma.industry.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="font-display text-2xl font-semibold">Explore</h1>
          <p className="text-muted-foreground">Search and filter the company directory.</p>
        </div>
      </div>

      {/* Search + filters (server-rendered form) */}
      <form action="" method="GET" className="rounded-xl border border-border bg-card p-5 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <div className="relative col-span-2 md:col-span-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              name="q"
              placeholder="Search companies, industries, metrics…"
              defaultValue={q}
              className="pl-10"
            />
          </div>
          <div>
            <label className="block text-xs text-muted-foreground mb-1">Industry</label>
            <select name="industry" defaultValue={industry || undefined} className="w-full rounded-lg border border-input bg-input/40 px-3 py-2 text-sm">
              <option value="">All industries</option>
              {industries.map((i) => (
                <option key={i.id} value={i.slug}>
                  {i.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-muted-foreground mb-1">Status</label>
            <select name="status" defaultValue={status || undefined} className="w-full rounded-lg border border-input bg-input/40 px-3 py-2 text-sm">
              <option value="">Any status</option>
              <option value="ACTIVE">Active</option>
              <option value="ACQUIRED">Acquired</option>
              <option value="CLOSED">Closed</option>
              <option value="IPO">IPO</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-muted-foreground mb-1">Research status</label>
            <select name="researchStatus" defaultValue={researchStatus || undefined} className="w-full rounded-lg border border-input bg-input/40 px-3 py-2 text-sm">
              <option value="">Any</option>
              <option value="RESEARCHED">Researched</option>
              <option value="PARTIAL">Partial</option>
              <option value="UNRESEARCHED">Unresearched</option>
            </select>
          </div>
        </div>
        <div className="flex items-end gap-2">
          <Button type="submit">Apply filters</Button>
          <Link href="/" className="rounded-lg border border-input bg-input/40 px-3 py-2 text-sm text-foreground hover:bg-accent/30 transition inline-flex items-center gap-2">
            <Compass className="h-3.5 w-3.5 mr-1" /> Universe map
          </Link>
        </div>
      </form>

      {/* Results */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          {total} result{total !== 1 ? "s" : ""}
        </div>
      </div>
      <div className="space-y-3">
        {companies.length === 0 ? (
          <div className="rounded-xl border border-border bg-card p-12 text-center">
            <List className="h-10 w-10 mx-auto text-muted-foreground" />
            <h3 className="mt-4 font-medium">No companies match your filters</h3>
            <p className="mt-1 text-sm text-muted-foreground">Try adjusting your search or filters.</p>
          </div>
        ) : (
          companies.map((c) => (
            <Card key={c.id} className="p-4 hover:bg-accent/20 transition group">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant={c.researchStatus === "RESEARCHED" ? "success" : c.researchStatus === "PARTIAL" ? "warn" : "muted"}>
                    {c.researchStatus}
                  </Badge>
                  <Badge variant="ghost">{c.companyStatus}</Badge>
                </div>
                <Link href={`/companies/${c.slug}`} className="ml-auto">
                  <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition" />
                </Link>
              </div>
              <Link href={`/companies/${c.slug}`} className="hover:text-primary transition">
                <h3 className="font-medium">{c.name}</h3>
              </Link>
              <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{c.shortDescription}</p>
              <div className="mt-2 flex flex-wrap gap-1 text-xs text-muted-foreground">
                {c.industries.map((i) => (
                  <span key={i.industry.slug} className="truncate">
                    {i.industry.name}
                  </span>
                ))}
              </div>
              <div className="mt-3 flex items-center gap-2 text-[11px] text-muted-foreground">
                {c.headquarters && <span>{c.headquarters}</span>}
                <span className="h-1 w-1 rounded-full bg-muted-foreground/30 mx-1" />
                {c.foundedAt && <span>{String(c.foundedAt).slice(0, 4)}</span>}
              </div>
            </Card>
          ))
        )}
      </div>

      {total > companies.length && (
        <div className="text-xs text-muted-foreground mt-2">
          Showing {companies.length} of {total}. Use the Universe map for immersive browsing.
        </div>
      )}
    </div>
  );
}
