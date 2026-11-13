import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import {
  companies,
  industries,
  niches,
} from "../../../data/companies";

const prisma = new PrismaClient();

export async function GET() {
  try {
    // Clear existing data in dependency order
    await prisma.metricObservationSource.deleteMany();
    await prisma.metricObservation.deleteMany();
    await prisma.metricDefinition.deleteMany();
    await prisma.timelineEventSource.deleteMany();
    await prisma.timelineEvent.deleteMany();
    await prisma.strategicDecisionSource.deleteMany();
    await prisma.strategicDecision.deleteMany();
    await prisma.product.deleteMany();
    await prisma.claimSource.deleteMany();
    await prisma.claim.deleteMany();
    await prisma.competitorRelationship.deleteMany();
    await prisma.companyNiche.deleteMany();
    await prisma.companyIndustry.deleteMany();
    await prisma.company.deleteMany();
    await prisma.niche.deleteMany();
    await prisma.industry.deleteMany();
    await prisma.source.deleteMany();

    // Create industries (keyed by both id and slug)
    const industryMapById = new Map<string, string>();
    const industryMapBySlug = new Map<string, string>();
    for (const ind of industries) {
      const created = await prisma.industry.create({
        data: {
          id: ind.id,
          name: ind.name,
          slug: ind.slug,
          description: ind.description,
          color: ind.color,
        },
      });
      industryMapById.set(ind.id, created.id);
      industryMapBySlug.set(ind.slug, created.id);
    }

    // Create niches (keyed by both id and slug)
    const nicheMap = new Map<string, string>();
    for (const n of niches) {
      const created = await prisma.niche.create({
        data: {
          id: n.id,
          name: n.name,
          slug: n.slug,
          description: n.description,
          industryId: industryMapById.get(n.industryId)!,
        },
      });
      nicheMap.set(n.id, created.id);
      nicheMap.set(n.slug, created.id);
    }

    // Create companies first
    const companyMap = new Map<string, string>();
    for (const c of companies) {
      const company = await prisma.company.create({
        data: {
          id: c.slug,
          slug: c.slug,
          name: c.name,
          description: c.description,
          shortDescription: c.shortDescription,
          foundedAt: c.foundedAt ? new Date(c.foundedAt) : null,
          headquarters: c.headquarters,
          website: c.website,
          logoUrl: c.logoUrl,
          companyStatus: c.companyStatus,
          ownershipType: c.ownershipType,
          businessModel: c.businessModel,
          researchStatus: c.researchStatus,
        },
      });
      companyMap.set(c.slug, company.id);

      for (const industryId of c.industryIds) {
        const industryIdResolved = industryMapById.get(industryId);
        if (!industryIdResolved) continue;
        await prisma.companyIndustry.create({
          data: { companyId: company.id, industryId: industryIdResolved },
        });
      }
      for (const nicheSlug of c.nicheIds) {
        const nicheIdResolved = nicheMap.get(nicheSlug);
        if (!nicheIdResolved) continue;
        await prisma.companyNiche.create({
          data: { companyId: company.id, nicheId: nicheIdResolved },
        });
      }

      for (const f of c.founders) {
        const founder = await prisma.founder.create({
          data: { name: f.name, biography: f.biography ?? null },
        });
        await prisma.companyFounder.create({
          data: { companyId: company.id, founderId: founder.id, role: f.role ?? null },
        });
      }

      for (const p of c.products) {
        await prisma.product.create({
          data: {
            companyId: company.id,
            name: p.name,
            description: p.description ?? null,
            status: p.status ?? null,
            launchDate: p.launchDate ? new Date(p.launchDate) : null,
            pricingModel: p.pricingModel ?? null,
          },
        });
      }

      for (const e of c.timelineEvents) {
        await prisma.timelineEvent.create({
          data: {
            companyId: company.id,
            eventType: e.eventType,
            title: e.title,
            description: e.description ?? null,
            eventDate: e.eventDate ? new Date(e.eventDate) : null,
            evidenceStatus: e.evidenceStatus,
            sourceExcerpt: e.sourceExcerpt ?? null,
          },
        });
      }

      for (const d of c.strategicDecisions) {
        await prisma.strategicDecision.create({
          data: {
            companyId: company.id,
            title: d.title,
            context: d.context ?? null,
            decision: d.decision ?? null,
            documentedOutcome: d.documentedOutcome ?? null,
            analysis: d.analysis ?? null,
            limitations: d.limitations ?? null,
            evidenceStatus: d.evidenceStatus,
          },
        });
      }

      for (const cl of c.claims) {
        await prisma.claim.create({
          data: {
            companyId: company.id,
            claimText: cl.claimText,
            evidenceStatus: cl.evidenceStatus,
            confidence: cl.confidence,
            verificationStatus: cl.verificationStatus ?? null,
          },
        });
      }

      for (const m of c.metrics) {
        let metricDef = await prisma.metricDefinition.findUnique({
          where: { slug: m.metricSlug },
        });
        if (!metricDef) {
          metricDef = await prisma.metricDefinition.create({
            data: {
              slug: m.metricSlug,
              name: m.metricSlug,
              category: "other",
              definition: null,
              formula: null,
              unit: m.unit ?? null,
              interpretation: null,
              limitations: null,
            },
          });
        }
        await prisma.metricObservation.create({
          data: {
            companyId: company.id,
            metricDefinitionId: metricDef.id,
            valueText: m.valueText,
            valueType: m.valueType,
            unit: m.unit ?? null,
            periodEnd: m.periodEnd ? new Date(m.periodEnd) : null,
            reportedAt: m.reportedAt ? new Date(m.reportedAt) : null,
            notes: m.notes ?? null,
          },
        });
      }
    }

    // Create competitor relationships (now all companies exist)
    for (const c of companies) {
      for (const comp of c.competitors) {
        const competitorId = companyMap.get(comp.competitorSlug);
        if (!competitorId) continue;
        await prisma.competitorRelationship.create({
          data: {
            companyId: companyMap.get(c.slug)!,
            competitorCompanyId: competitorId,
            relationshipType: comp.relationshipType,
            notes: comp.notes ?? null,
          },
        });
      }
    }

    return NextResponse.json({ status: "ok", message: `Seeded ${companies.length} companies` });
  } catch (e: any) {
    return NextResponse.json(
      { status: "error", message: e.message, stack: e.stack },
      { status: 500 },
    );
  } finally {
    await prisma.$disconnect();
  }
}
