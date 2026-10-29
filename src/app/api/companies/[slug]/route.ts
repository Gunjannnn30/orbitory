import { NextResponse } from "next/server";
import { handleApi } from "@/server/http";
import { requireCompany } from "@/server/authorization";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  return handleApi(async () => {
    const { slug } = await params;
    const company = await prisma.company.findUnique({
      where: { slug },
      include: {
        industries: { include: { industry: true } },
        niches: { include: { niche: true } },
        founders: { include: { founder: true } },
        products: true,
        timelineEvents: { orderBy: [{ eventDate: "asc" }, { createdAt: "asc" }] },
        strategicDecisions: true,
        metrics: { include: { metricDefinition: true } },
        claims: { orderBy: { createdAt: "desc" }, take: 50 },
        asCompetitor: { include: { competitor: true } },
        competitors: { include: { company: true } },
        _count: { select: { products: true, timelineEvents: true, metrics: true, claims: true } },
      },
    });
    if (!company) {
      return NextResponse.json({ error: { code: "NOT_FOUND", message: "Company not found." } }, { status: 404 });
    }

    // Group timeline events by year
    const timelineByYear: Record<string, any[]> = {};
    for (const event of company.timelineEvents) {
      const year = event.eventDate ? String(event.eventDate.getFullYear()) : "undated";
      if (!timelineByYear[year]) timelineByYear[year] = [];
      timelineByYear[year].push(event);
    }

    return NextResponse.json({
      company: {
        id: company.id,
        slug: company.slug,
        name: company.name,
        description: company.description,
        shortDescription: company.shortDescription,
        foundedAt: company.foundedAt,
        headquarters: company.headquarters,
        website: company.website,
        logoUrl: company.logoUrl,
        companyStatus: company.companyStatus,
        ownershipType: company.ownershipType,
        businessModel: company.businessModel,
        researchStatus: company.researchStatus,
        lastResearchedAt: company.lastResearchedAt,
        createdAt: company.createdAt,
        updatedAt: company.updatedAt,
        industries: company.industries.map((i) => i.industry),
        niches: company.niches.map((n) => n.niche),
        founders: company.founders.map((f) => ({ ...f.founder, role: f.role, joinedAt: f.joinedAt, leftAt: f.leftAt })),
        products: company.products,
        timelineByYear,
        timelineEvents: company.timelineEvents,
        strategicDecisions: company.strategicDecisions,
        metrics: company.metrics.map((m) => ({
          id: m.id,
          value: m.value,
          valueText: m.valueText,
          unit: m.unit,
          periodStart: m.periodStart,
          periodEnd: m.periodEnd,
          reportedAt: m.reportedAt,
          valueType: m.valueType,
          notes: m.notes,
          metricDefinition: m.metricDefinition,
        })),
        claims: company.claims,
        competitors: company.asCompetitor.map((c) => ({ ...c.competitor, relationshipType: c.relationshipType, notes: c.notes })),
        counts: company._count,
      },
    });
  });
}
