import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import {
  companies,
  industries,
  niches,
  type CompanySeed,
  type IndustrySeed,
  type NicheSeed,
} from "../src/data/companies";

const prisma = new PrismaClient();

const NOW = new Date();

// Map local seed IDs to created DB records
const industryMap = new Map<string, string>();
const nicheMap = new Map<string, string>();
const companyMap = new Map<string, string>();

async function createSource(data: {
  url: string;
  title: string;
  publisher?: string | null;
  author?: string | null;
  publishedAt?: Date | null;
  accessedAt?: Date | null;
  sourceType: any;
}) {
  return prisma.source.create({
    data: {
      url: data.url,
      title: data.title,
      publisher: data.publisher ?? null,
      author: data.author ?? null,
      publishedAt: data.publishedAt ?? null,
      accessedAt: data.accessedAt ?? NOW,
      sourceType: data.sourceType,
    },
  });
}

async function main() {
  console.log("🌱 Seeding Orbitory...");

  // Idempotent: clear previously seeded research data in dependency order.
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
  await prisma.report.deleteMany();
  await prisma.savedComparison.deleteMany();
  await prisma.collectionItem.deleteMany();
  await prisma.userCollection.deleteMany();
  await prisma.researchEdit.deleteMany();
  await prisma.session.deleteMany();
  await prisma.userSettings.deleteMany();
  await prisma.user.deleteMany();

  // ---------------------------------------------------------------------------
  // Demo user (password: DemoPass123!)
  // ---------------------------------------------------------------------------
  const demoUser = await prisma.user.upsert({
    where: { email: "pm@orbitory.demo" },
    update: {},
    create: {
      email: "pm@orbitory.demo",
      username: "pm_demo",
      name: "Demo Product Manager",
      passwordHash: await bcrypt.hash("DemoPass123!", 12),
    },
  });
  await prisma.userSettings.upsert({
    where: { userId: demoUser.id },
    update: {},
    create: { userId: demoUser.id, theme: "dark" },
  });
  console.log("  created demo user:", demoUser.email);

  // ---------------------------------------------------------------------------
  // Industries (galaxies)
  // ---------------------------------------------------------------------------
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
    industryMap.set(ind.id, created.id);
  }
  console.log("  created industries:", industries.length);

  // ---------------------------------------------------------------------------
  // Niches (solar systems)
  // ---------------------------------------------------------------------------
  for (const nich of niches) {
    const industryId = industryMap.get(nich.industryId)!;
    const created = await prisma.niche.create({
      data: {
        id: nich.id,
        name: nich.name,
        slug: nich.slug,
        description: nich.description,
        industryId,
      },
    });
    nicheMap.set(nich.id, created.id);
  }
  console.log("  created niches:", niches.length);

  // ---------------------------------------------------------------------------
  // Companies (planets)
  // ---------------------------------------------------------------------------
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

    // Link industries & niches (many-to-many)
    for (const industryId of c.industryIds) {
      await prisma.companyIndustry.create({
        data: { companyId: company.id, industryId: industryMap.get(industryId)! },
      });
    }
    for (const nicheId of c.nicheIds) {
      await prisma.companyNiche.create({
        data: { companyId: company.id, nicheId: nicheMap.get(nicheId)! },
      });
    }

    // Founders
    for (const f of c.founders) {
      const founder = await prisma.founder.create({
        data: {
          name: f.name,
          biography: f.biography ?? null,
        },
      });
      await prisma.companyFounder.create({
        data: {
          companyId: company.id,
          founderId: founder.id,
          role: f.role ?? null,
        },
      });
    }

    // Products
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

    // Timeline events
    for (const e of c.timelineEvents) {
      const event = await prisma.timelineEvent.create({
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
      // Attach source if we have one matching by URL hint
      // (sources are referenced by url; we create them lazily below)
    }

    // Strategic decisions
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

    // Claims
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

    // Metrics
    for (const m of c.metrics) {
      // Find or create the metric definition by slug
      let metricDef = await prisma.metricDefinition.findUnique({
        where: { slug: m.metricSlug },
      });
      if (!metricDef) {
        // Create a minimal definition so the observation has a parent
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

    // Competitor relationships
    for (const comp of c.competitors) {
      const competitorId = companyMap.get(comp.competitorSlug);
      if (!competitorId) continue;
      await prisma.competitorRelationship.create({
        data: {
          companyId: company.id,
          competitorCompanyId: competitorId,
          relationshipType: comp.relationshipType,
          notes: comp.notes ?? null,
        },
      });
    }
  }
  console.log("  created companies:", companies.length);

  console.log("✅ Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
