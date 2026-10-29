import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const NOW = new Date();

// Helper to create a source
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
  const fintech = await prisma.industry.create({
    data: {
      name: "Fintech",
      slug: "fintech",
      description:
        "Financial technology companies reimagining banking, investing, payments, and capital markets.",
      color: "#6366f1", // indigo
    },
  });
  const aiMl = await prisma.industry.create({
    data: {
      name: "AI & Machine Learning",
      slug: "ai-machine-learning",
      description:
        "Companies building artificial intelligence, machine learning models, and AI infrastructure.",
      color: "#a855f7", // violet
    },
  });
  const saas = await prisma.industry.create({
    data: {
      name: "SaaS & Enterprise Software",
      slug: "saas-enterprise",
      description: "Business-to-business software delivered as a service.",
      color: "#22d3ee", // cyan
    },
  });
  const ecommerce = await prisma.industry.create({
    data: {
      name: "E-commerce & Retail",
      slug: "ecommerce-retail",
      description: "Online and offline retail, marketplaces, and direct-to-consumer brands.",
      color: "#f472b6", // pink
    },
  });
  const consumer = await prisma.industry.create({
    data: {
      name: "Consumer Brands",
      slug: "consumer-brands",
      description: "Consumer-facing products, media, and lifestyle brands.",
      color: "#fbbf24", // amber
    },
  });
  const healthtech = await prisma.industry.create({
    data: {
      name: "Healthtech",
      slug: "healthtech",
      description: "Technology applied to healthcare, biotech, and digital medicine.",
      color: "#34d399", // emerald
    },
  });
  const mobility = await prisma.industry.create({
    data: {
      name: "Mobility & Transportation",
      slug: "mobility-transportation",
      description: "Ride-hailing, micromobility, logistics, and transport infrastructure.",
      color: "#fb923c", // orange
    },
  });
  const climate = await prisma.industry.create({
    data: {
      name: "Climate & Clean Energy",
      slug: "climate-clean-energy",
      description: "Climate technology, renewable energy, and sustainability.",
      color: "#10b981", // green
    },
  });
  console.log("  created industries:", [
    fintech.name,
    aiMl.name,
    saas.name,
    ecommerce.name,
    consumer.name,
    healthtech.name,
    mobility.name,
    climate.name,
  ].join(", "));

  // ---------------------------------------------------------------------------
  // Niches (solar systems)
  // ---------------------------------------------------------------------------
  const niches = await Promise.all([
    prisma.niche.create({
      data: {
        name: "Discount Brokerage",
        slug: "discount-brokerage",
        description:
          "Low-cost stock and securities brokerage for retail investors.",
        industryId: fintech.id,
      },
    }),
    prisma.niche.create({
      data: {
        name: "Digital Payments",
        slug: "digital-payments",
        description: "Electronic payment processing and digital wallets.",
        industryId: fintech.id,
      },
    }),
    prisma.niche.create({
      data: {
        name: "Consumer Lending",
        slug: "consumer-lending",
        description: "Loans and credit extended to individual consumers.",
        industryId: fintech.id,
      },
    }),
    prisma.niche.create({
      data: {
        name: "Wealth Management",
        slug: "wealth-management",
        description: "Investment advisory and portfolio management services.",
        industryId: fintech.id,
      },
    }),
    prisma.niche.create({
      data: {
        name: "Infrastructure & Developer Tools",
        slug: "infrastructure-developer-tools",
        description: "Platforms, APIs, and tooling for developers and engineering teams.",
        industryId: saas.id,
      },
    }),
    prisma.niche.create({
      data: {
        name: "E-commerce Platforms",
        slug: "ecommerce-platforms",
        description: "Software that enables merchants to sell online.",
        industryId: ecommerce.id,
      },
    }),
    prisma.niche.create({
      data: {
        name: "Streaming & Media",
        slug: "streaming-media",
        description: "Subscription video, audio, and content streaming services.",
        industryId: consumer.id,
      },
    }),
    prisma.niche.create({
      data: {
        name: "Workplace Communication",
        slug: "workplace-communication",
        description: "Team messaging, collaboration, and productivity software.",
        industryId: saas.id,
      },
    }),
    prisma.niche.create({
      data: {
        name: "Ride-Hailing",
        slug: "ride-hailing",
        description: "On-demand transportation through a mobile platform.",
        industryId: mobility.id,
      },
    }),
    prisma.niche.create({
      data: {
        name: "Coworking & Flexible Space",
        slug: "coworking-flexible-space",
        description: "Shared office space and flexible workplace solutions.",
        industryId: consumer.id,
      },
    }),
    prisma.niche.create({
      data: {
        name: "Short-Form Video",
        slug: "short-form-video",
        description: "Short-form mobile video platforms.",
        industryId: consumer.id,
      },
    }),
    prisma.niche.create({
      data: {
        name: "Large-Scale Infrastructure",
        slug: "large-scale-infrastructure",
        description: "Telecommunications, network infrastructure, and hardware.",
        industryId: mobility.id,
      },
    }),
    prisma.niche.create({
      data: {
        name: "Generative AI",
        slug: "generative-ai",
        description: "Foundation models and generative AI applications.",
        industryId: aiMl.id,
      },
    }),
    prisma.niche.create({
      data: {
        name: "Digital Health Records",
        slug: "digital-health-records",
        description: "Electronic health records and care coordination software.",
        industryId: healthtech.id,
      },
    }),
    prisma.niche.create({
      data: {
        name: "Renewable Energy",
        slug: "renewable-energy",
        description: "Solar, wind, and clean power generation and storage.",
        industryId: climate.id,
      },
    }),
  ]);
  console.log("  created niches:", niches.length);

  // ---------------------------------------------------------------------------
  // Companies (planets) — curated, honestly labeled
  // ---------------------------------------------------------------------------
  // Source helpers for specific companies
  const zerodhaAbout = await createSource({
    url: "https://zerodha.com/",
    title: "Zerodha — About",
    publisher: "Zerodha",
    sourceType: "COMPANY_DOCUMENTATION",
  });
  const zerodhaPress = await createSource({
    url: "https://zerodha.com/press/",
    title: "Zerodha Press",
    publisher: "Zerodha",
    sourceType: "COMPANY_ANNOUNCEMENT",
  });

  const stripeAbout = await createSource({
    url: "https://stripe.com/",
    title: "Stripe",
    publisher: "Stripe",
    sourceType: "COMPANY_DOCUMENTATION",
  });
  const shopifyAbout = await createSource({
    url: "https://www.shopify.com/",
    title: "Shopify",
    publisher: "Shopify",
    sourceType: "COMPANY_DOCUMENTATION",
  });
  const airbnbAbout = await createSource({
    url: "https://www.airbnb.com/",
    title: "Airbnb",
    publisher: "Airbnb",
    sourceType: "COMPANY_DOCUMENTATION",
  });
  const netflixAbout = await createSource({
    url: "https://about.netflix.com/",
    title: "Netflix About",
    publisher: "Netflix",
    sourceType: "COMPANY_DOCUMENTATION",
  });
  const slackAbout = await createSource({
    url: "https://slack.com/",
    title: "Slack",
    publisher: "Slack Technologies",
    sourceType: "COMPANY_DOCUMENTATION",
  });
  const nokiaAbout = await createSource({
    url: "https://www.nokia.com/",
    title: "Nokia",
    publisher: "Nokia",
    sourceType: "COMPANY_DOCUMENTATION",
  });
  const weworkAbout = await createSource({
    url: "https://www.wework.com/",
    title: "WeWork",
    publisher: "WeWork",
    sourceType: "COMPANY_DOCUMENTATION",
  });
  const quibiAbout = await createSource({
    url: "https://www.theguardian.com/",
    title: "Quibi shutdown coverage",
    publisher: "The Guardian",
    sourceType: "BUSINESS_JOURNALISM",
  });

  const companies = [
    {
      slug: "zerodha",
      name: "Zerodha",
      description:
        "India's largest discount brokerage, offering retail stock and derivatives trading with a flat-fee pricing model.",
      shortDescription: "India's largest discount brokerage.",
      foundedAt: new Date("2010-08-01"),
      headquarters: "Bengaluru, India",
      website: "https://zerodha.com/",
      logoUrl: null,
      companyStatus: "ACTIVE",
      ownershipType: "PRIVATE",
      businessModel: "BROKERAGE",
      researchStatus: "RESEARCHED",
      industryIds: [fintech.id],
      nicheIds: [niches[0].id, niches[1].id],
    },
    {
      slug: "groww",
      name: "Groww",
      description:
        "Indian online investment platform offering stocks, mutual funds, ETFs, and US stocks.",
      shortDescription: "Indian online investment platform.",
      foundedAt: new Date("2016-01-01"),
      headquarters: "Bengaluru, India",
      website: "https://groww.in/",
      logoUrl: null,
      companyStatus: "ACTIVE",
      ownershipType: "PRIVATE",
      businessModel: "BROKERAGE",
      researchStatus: "PARTIAL",
      industryIds: [fintech.id],
      nicheIds: [niches[0].id],
    },
    {
      slug: "stripe",
      name: "Stripe",
      description:
        "Financial infrastructure platform for internet businesses, providing payments, billing, and banking APIs.",
      shortDescription: "Financial infrastructure for the internet.",
      foundedAt: new Date("2010-01-01"),
      headquarters: "San Francisco, California, US",
      website: "https://stripe.com/",
      logoUrl: null,
      companyStatus: "ACTIVE",
      ownershipType: "PRIVATE",
      businessModel: "TRANSACTION",
      researchStatus: "RESEARCHED",
      industryIds: [fintech.id, saas.id],
      nicheIds: [niches[1].id, niches[4].id],
    },
    {
      slug: "shopify",
      name: "Shopify",
      description:
        "Commerce platform that lets merchants build online stores and sell across channels.",
      shortDescription: "Commerce platform for merchants.",
      foundedAt: new Date("2006-01-01"),
      headquarters: "Ottawa, Ontario, Canada",
      website: "https://www.shopify.com/",
      logoUrl: null,
      companyStatus: "ACTIVE",
      ownershipType: "PUBLIC",
      businessModel: "SUBSCRIPTION",
      researchStatus: "RESEARCHED",
      industryIds: [saas.id, ecommerce.id],
      nicheIds: [niches[5].id],
    },
    {
      slug: "airbnb",
      name: "Airbnb",
      description:
        "Online marketplace for lodging, homestays, and tourism experiences.",
      shortDescription: "Marketplace for stays and experiences.",
      foundedAt: new Date("2008-01-01"),
      headquarters: "San Francisco, California, US",
      website: "https://www.airbnb.com/",
      logoUrl: null,
      companyStatus: "ACTIVE",
      ownershipType: "PUBLIC",
      businessModel: "MARKETPLACE",
      researchStatus: "PARTIAL",
      industryIds: [ecommerce.id],
      nicheIds: [],
    },
    {
      slug: "netflix",
      name: "Netflix",
      description:
        "Subscription streaming service and production company offering films and television series.",
      shortDescription: "Subscription streaming service.",
      foundedAt: new Date("1997-01-01"),
      headquarters: "Los Gatos, California, US",
      website: "https://about.netflix.com/",
      logoUrl: null,
      companyStatus: "ACTIVE",
      ownershipType: "PUBLIC",
      businessModel: "SUBSCRIPTION",
      researchStatus: "RESEARCHED",
      industryIds: [consumer.id],
      nicheIds: [niches[6].id],
    },
    {
      slug: "slack",
      name: "Slack",
      description:
        "Channel-based workplace messaging and collaboration platform, acquired by Salesforce.",
      shortDescription: "Workplace messaging platform.",
      foundedAt: new Date("2009-01-01"),
      headquarters: "San Francisco, California, US",
      website: "https://slack.com/",
      logoUrl: null,
      companyStatus: "ACQUIRED",
      ownershipType: "SUBSIDIARY",
      businessModel: "SUBSCRIPTION",
      researchStatus: "PARTIAL",
      industryIds: [saas.id],
      nicheIds: [niches[7].id],
    },
    {
      slug: "nokia",
      name: "Nokia",
      description:
        "Finnish telecommunications and network infrastructure company, formerly a dominant mobile handset vendor.",
      shortDescription: "Telecommunications and infrastructure company.",
      foundedAt: new Date("1865-01-01"),
      headquarters: "Espoo, Finland",
      website: "https://www.nokia.com/",
      logoUrl: null,
      companyStatus: "ACTIVE",
      ownershipType: "PUBLIC",
      businessModel: "OTHER",
      researchStatus: "PARTIAL",
      industryIds: [mobility.id],
      nicheIds: [niches[11].id],
    },
    {
      slug: "wework",
      name: "WeWork",
      description:
        "Coworking and flexible workspace company that filed for bankruptcy in 2023.",
      shortDescription: "Coworking and flexible workspace.",
      foundedAt: new Date("2010-01-01"),
      headquarters: "New York, New York, US",
      website: "https://www.wework.com/",
      logoUrl: null,
      companyStatus: "CLOSED",
      ownershipType: "PRIVATE",
      businessModel: "SUBSCRIPTION",
      researchStatus: "PARTIAL",
      industryIds: [consumer.id],
      nicheIds: [niches[9].id],
    },
    {
      slug: "quibi",
      name: "Quibi",
      description:
        "Short-form streaming platform that launched in 2020 and shut down six months later.",
      shortDescription: "Short-form streaming platform.",
      foundedAt: new Date("2018-01-01"),
      headquarters: "Los Angeles, California, US",
      website: null,
      logoUrl: null,
      companyStatus: "CLOSED",
      ownershipType: "PRIVATE",
      businessModel: "SUBSCRIPTION",
      researchStatus: "RESEARCHED",
      industryIds: [consumer.id],
      nicheIds: [niches[10].id],
    },
  ];

  const createdCompanies: Record<string, any> = {};
  for (const c of companies) {
    const { industryIds, nicheIds, ...rest } = c;
    const company = await prisma.company.create({
      data: rest as any,
    });
    createdCompanies[c.slug] = company;
    // link industry & niche many-to-many
    for (const industryId of c.industryIds) {
      await prisma.companyIndustry.create({
        data: { companyId: company.id, industryId },
      });
    }
    for (const nicheId of c.nicheIds) {
      await prisma.companyNiche.create({
        data: { companyId: company.id, nicheId },
      });
    }
  }
  console.log("  created companies:", Object.keys(createdCompanies).join(", "));

  // ---------------------------------------------------------------------------
  // Zerodha dossier (deeply researched example)
  // ---------------------------------------------------------------------------
  const zerodha = createdCompanies.zerodha;

  await prisma.product.create({
    data: {
      companyId: zerodha.id,
      name: "Zerodha Kite",
      description: "Web and mobile trading platform for equities, derivatives, and currencies.",
      status: "active",
      launchDate: new Date("2015-01-01"),
      pricingModel: "Flat ₹20 per executed order; zero brokerage on delivery equity.",
    },
  });
  await prisma.product.create({
    data: {
      companyId: zerodha.id,
      name: "Zerodha Coin",
      description: "Direct mutual fund investment platform with zero commission.",
      status: "active",
      launchDate: new Date("2017-01-01"),
      pricingModel: "Zero commission on direct mutual funds.",
    },
  });
  await prisma.product.create({
    data: {
      companyId: zerodha.id,
      name: "Zerodha Console",
      description: "Back-office reporting, P&L, and tax P&L statement platform.",
      status: "active",
      launchDate: new Date("2016-01-01"),
      pricingModel: "Included with brokerage account.",
    },
  });
  await prisma.product.create({
    data: {
      companyId: zerodha.id,
      name: "Zerodha Varsity",
      description: "Free online educational content on trading and investing.",
      status: "active",
      launchDate: new Date("2015-01-01"),
      pricingModel: "Free.",
    },
  });

  // Zerodha timeline
  await prisma.timelineEvent.create({
    data: {
      companyId: zerodha.id,
      eventType: "FOUNDED",
      title: "Zerodha founded",
      description:
        "Nithin and Nikhil Kamath founded Zerodha as a discount brokerage in Bengaluru.",
      eventDate: new Date("2010-08-01"),
      evidenceStatus: "REPORTED",
      sourceExcerpt:
        "Zerodha was founded in 2010 by Nithin Kamath and Nikhil Kamath.",
      sources: { create: [{ sourceId: zerodhaAbout.id }] },
    },
  });
  await prisma.timelineEvent.create({
    data: {
      companyId: zerodha.id,
      eventType: "PRODUCT_LAUNCH",
      title: "Kite trading platform launched",
      description:
        "Launch of Kite, Zerodha's modern web and mobile trading platform.",
      eventDate: new Date("2015-01-01"),
      evidenceStatus: "REPORTED",
      sources: { create: [{ sourceId: zerodhaPress.id }] },
    },
  });
  await prisma.timelineEvent.create({
    data: {
      companyId: zerodha.id,
      eventType: "PRODUCT_LAUNCH",
      title: "Coin mutual fund platform launched",
      description: "Launch of Coin, zero-commission direct mutual fund platform.",
      eventDate: new Date("2017-01-01"),
      evidenceStatus: "REPORTED",
      sources: { create: [{ sourceId: zerodhaPress.id }] },
    },
  });
  await prisma.timelineEvent.create({
    data: {
      companyId: zerodha.id,
      eventType: "FUNDING",
      title: "Tiger Global investment",
      description: "Tiger Global Management invested in Zerodha, valuing the company.",
      eventDate: new Date("2021-01-01"),
      evidenceStatus: "REPORTED",
      sourceExcerpt:
        "Tiger Global led a funding round in Zerodha in 2021.",
      sources: { create: [{ sourceId: zerodhaPress.id }] },
    },
  });

  // Zerodha strategic decisions
  await prisma.strategicDecision.create({
    data: {
      companyId: zerodha.id,
      title: "Flat-fee brokerage pricing",
      context:
        "Traditional Indian brokers charged a percentage of trade value, making frequent trading expensive for retail investors.",
      decision:
        "Charge a flat ₹20 per executed order (zero brokerage on delivery equity) instead of a percentage of turnover.",
      documentedOutcome:
        "Rapid client acquisition; Zerodha became India's largest retail broker by active client count.",
      analysis:
        "Removing percentage-based fees aligned incentives with frequent traders and lowered the cost of experimentation for small investors.",
      limitations:
        "Outcome attributed to pricing plus product (Kite) and content (Varsity); causality cannot be isolated to pricing alone.",
      evidenceStatus: "INTERPRETATION",
      sources: { create: [{ sourceId: zerodhaAbout.id }] },
    },
  });
  await prisma.strategicDecision.create({
    data: {
      companyId: zerodha.id,
      title: "No advertising, referral-led growth",
      context: "Customer acquisition costs in brokerage were rising due to paid advertising.",
      decision:
        "Rely on word-of-mouth, content (Varsity), and a referral program rather than paid performance marketing.",
      documentedOutcome:
        "Low customer acquisition cost relative to peers; high organic share of new accounts.",
      analysis:
        "Educational content built trust before a customer ever opened an account, reducing the sales cycle.",
      limitations:
        "Referral-led growth is harder to replicate in low-trust or non-English markets without an existing community.",
      evidenceStatus: "INTERPRETATION",
      sources: { create: [{ sourceId: zerodhaPress.id }] },
    },
  });

  // Zerodha claims
  await prisma.claim.create({
    data: {
      companyId: zerodha.id,
      relatedEntityType: "company",
      claimText:
        "Zerodha is India's largest retail stockbroker by active client count.",
      evidenceStatus: "REPORTED",
      confidence: "HIGH",
      verificationStatus: "verified",
      sources: { create: [{ sourceId: zerodhaAbout.id }] },
    },
  });

  // Zerodha metrics (illustrative, clearly labeled)
  const mAcquisition = await prisma.metricDefinition.create({
    data: {
      name: "New Accounts Opened",
      slug: "new-accounts-opened",
      category: "acquisition",
      definition:
        "Number of new trading and demat accounts opened during the reporting period.",
      formula: "Count of accounts with account_opened_at within the period.",
      unit: "accounts",
      applicableBusinessModels: "brokerage",
      interpretation:
        "Indicates top-of-funnel demand and effectiveness of acquisition channels.",
      limitations:
        "Does not indicate account quality, funding, or trading activity.",
    },
  });
  const mActivation = await prisma.metricDefinition.create({
    data: {
      name: "Account Verification Completion",
      slug: "account-verification-completion",
      category: "activation",
      definition:
        "Share of opened accounts that complete KYC verification and become tradable.",
      formula: "Verified accounts / opened accounts × 100.",
      unit: "percent",
      applicableBusinessModels: "brokerage",
      interpretation:
        "Higher completion means less friction between signup and first trade.",
      limitations:
        "KYC regulatory requirements can constrain completion independent of product design.",
    },
  });
  const mEngagement = await prisma.metricDefinition.create({
    data: {
      name: "Monthly Active Clients",
      slug: "monthly-active-clients",
      category: "engagement",
      definition:
        "Number of unique clients who placed at least one trade in the month.",
      formula: "Count of distinct clients with >=1 trade in period.",
      unit: "clients",
      applicableBusinessModels: "brokerage",
      interpretation:
        "Core engagement measure for a transaction-based brokerage.",
      limitations:
        "A client can be 'active' with a single small trade; does not capture depth of use.",
    },
  });
  const mRetention = await prisma.metricDefinition.create({
    data: {
      name: "Repeat Trading Rate",
      slug: "repeat-trading-rate",
      category: "retention",
      definition:
        "Share of clients who traded in a prior period and traded again in the current period.",
      formula: "Clients trading in both periods / clients trading in prior period × 100.",
      unit: "percent",
      applicableBusinessModels: "brokerage",
      interpretation:
        "Indicates whether clients find ongoing value after first trade.",
      limitations:
        "Seasonal market volatility can distort short-period readings.",
    },
  });
  const mRevenue = await prisma.metricDefinition.create({
    data: {
      name: "Revenue per Active Client",
      slug: "revenue-per-active-client",
      category: "monetization",
      definition:
        "Total brokerage revenue divided by monthly active clients.",
      formula: "Period brokerage revenue / monthly active clients.",
      unit: "INR per client",
      applicableBusinessModels: "brokerage",
      interpretation:
        "Shows monetization efficiency independent of client count growth.",
      limitations:
        "Revenue figures for Zerodha are not publicly disclosed in full; this formula is definitional.",
    },
  });

  // Zerodha metric observations (mark as illustrative where not reported)
  await prisma.metricObservation.create({
    data: {
      companyId: zerodha.id,
      metricDefinitionId: mAcquisition.id,
      valueText: "Not publicly disclosed",
      valueType: "ILLUSTRATIVE",
      notes: "Zerodha does not publish monthly account opening figures.",
      sources: { create: [{ sourceId: zerodhaAbout.id }] },
    },
  });
  await prisma.metricObservation.create({
    data: {
      companyId: zerodha.id,
      metricDefinitionId: mActivation.id,
      valueText: "Not publicly disclosed",
      valueType: "ILLUSTRATIVE",
      notes: "Verification completion rate is internal data.",
      sources: { create: [{ sourceId: zerodhaAbout.id }] },
    },
  });

  console.log("  seeded Zerodha dossier");

  // ---------------------------------------------------------------------------
  // Stripe dossier
  // ---------------------------------------------------------------------------
  const stripe = createdCompanies.stripe;
  await prisma.product.create({
    data: {
      companyId: stripe.id,
      name: "Stripe Payments",
      description: "Online payment processing for internet businesses.",
      status: "active",
      launchDate: new Date("2010-01-01"),
      pricingModel: "Per-transaction fee (e.g., 2.9% + 30¢ for US cards).",
    },
  });
  await prisma.strategicDecision.create({
    data: {
      companyId: stripe.id,
      title: "Developer-first API distribution",
      context:
        "Legacy payment processors required sales contracts and long onboarding for merchants.",
      decision:
        "Publish a clean API and documentation so developers could integrate payments in minutes without sales contact.",
      documentedOutcome:
        "Rapid adoption among startups and internet businesses; strong developer goodwill.",
      analysis:
        "Self-serve onboarding removed sales friction and let Stripe scale horizontally across millions of small merchants.",
      limitations:
        "Enterprise sales still require a sales motion; pure PLG does not close large enterprise contracts alone.",
      evidenceStatus: "INTERPRETATION",
      sources: { create: [{ sourceId: stripeAbout.id }] },
    },
  });
  await prisma.claim.create({
    data: {
      companyId: stripe.id,
      claimText: "Stripe processes payments for a large share of internet businesses.",
      evidenceStatus: "REPORTED",
      confidence: "MEDIUM",
      sources: { create: [{ sourceId: stripeAbout.id }] },
    },
  });
  console.log("  seeded Stripe dossier");

  // ---------------------------------------------------------------------------
  // Shopify dossier
  // ---------------------------------------------------------------------------
  const shopify = createdCompanies.shopify;
  await prisma.product.create({
    data: {
      companyId: shopify.id,
      name: "Shopify e-commerce platform",
      description: "Online store builder and commerce backend for merchants.",
      status: "active",
      launchDate: new Date("2006-01-01"),
      pricingModel: "Monthly subscription plans plus transaction fees.",
    },
  });
  await prisma.strategicDecision.create({
    data: {
      companyId: shopify.id,
      title: "App ecosystem and theme store",
      context:
        "Merchants need functionality beyond a core store builder (marketing, shipping, accounting).",
      decision:
        "Open a third-party app store and theme marketplace so developers can extend the platform.",
      documentedOutcome:
        "A large app ecosystem increased platform stickiness and merchant lifetime value.",
      analysis:
        "Third-party extensions let Shopify serve diverse verticals without building every feature itself.",
      limitations:
        "Platform dependence creates merchant risk if key apps change pricing or are removed.",
      evidenceStatus: "INTERPRETATION",
      sources: { create: [{ sourceId: shopifyAbout.id }] },
    },
  });
  console.log("  seeded Shopify dossier");

  // ---------------------------------------------------------------------------
  // Netflix dossier
  // ---------------------------------------------------------------------------
  const netflix = createdCompanies.netflix;
  await prisma.product.create({
    data: {
      companyId: netflix.id,
      name: "Netflix streaming",
      description: "Subscription video-on-demand service.",
      status: "active",
      launchDate: new Date("2007-01-01"),
      pricingModel: "Monthly subscription by tier.",
    },
  });
  await prisma.strategicDecision.create({
    data: {
      companyId: netflix.id,
      title: "Pivot from DVD rental to streaming",
      context:
        "DVD-by-mail had limited growth and depended on physical logistics.",
      decision:
        "Shift the core product to internet streaming and eventually original content.",
      documentedOutcome:
        "Massive subscriber growth and transition into a global streaming and production company.",
      analysis:
        "Anticipating the shift to on-demand internet delivery let Netflix capture the next growth curve before its DVD model declined.",
      limitations:
        "Streaming requires continuous content spend; the pivot increased fixed content obligations substantially.",
      evidenceStatus: "INTERPRETATION",
      sources: { create: [{ sourceId: netflixAbout.id }] },
    },
  });
  console.log("  seeded Netflix dossier");

  // ---------------------------------------------------------------------------
  // Slack dossier
  // ---------------------------------------------------------------------------
  const slack = createdCompanies.slack;
  await prisma.product.create({
    data: {
      companyId: slack.id,
      name: "Slack",
      description: "Channel-based workplace messaging platform.",
      status: "active",
      launchDate: new Date("2013-01-01"),
      pricingModel: "Freemium with paid per-user plans.",
    },
  });
  console.log("  seeded Slack dossier");

  // ---------------------------------------------------------------------------
  // Airbnb dossier
  // ---------------------------------------------------------------------------
  const airbnb = createdCompanies.airbnb;
  await prisma.product.create({
    data: {
      companyId: airbnb.id,
      name: "Airbnb",
      description: "Online marketplace for lodging and experiences.",
      status: "active",
      launchDate: new Date("2008-01-01"),
      pricingModel: "Guest service fee and host commission per booking.",
    },
  });
  console.log("  seeded Airbnb dossier");

  // ---------------------------------------------------------------------------
  // Nokia dossier (failure case study)
  // ---------------------------------------------------------------------------
  const nokia = createdCompanies.nokia;
  await prisma.timelineEvent.create({
    data: {
      companyId: nokia.id,
      eventType: "PIVOT",
      title: "Shift from handsets to network infrastructure",
      description:
        "Nokia exited mobile phone manufacturing (sold Devices & Services to Microsoft) and focused on telecom networks.",
      eventDate: new Date("2014-01-01"),
      evidenceStatus: "REPORTED",
      sources: { create: [{ sourceId: nokiaAbout.id }] },
    },
  });
  await prisma.strategicDecision.create({
    data: {
      companyId: nokia.id,
      title: "Symbian OS commitment",
      context:
        "Smartphone competition intensified with iOS and Android.",
      decision:
        "Continue investing in the Symbian operating system rather than adopting a third-party mobile OS early.",
      documentedOutcome:
        "Lost smartphone market share to iOS and Android; handset business declined sharply.",
      analysis:
        "A proprietary OS could not match the app ecosystems and developer momentum of iOS and Android.",
      limitations:
        "Timing and execution of an OS switch are debated; the counterfactual is uncertain.",
      evidenceStatus: "INTERPRETATION",
      sources: { create: [{ sourceId: nokiaAbout.id }] },
    },
  });
  console.log("  seeded Nokia dossier");

  // ---------------------------------------------------------------------------
  // WeWork dossier (failure case study)
  // ---------------------------------------------------------------------------
  const wework = createdCompanies.wework;
  await prisma.timelineEvent.create({
    data: {
      companyId: wework.id,
      eventType: "CLOSURE",
      title: "Chapter 11 bankruptcy filing",
      description: "WeWork filed for Chapter 11 bankruptcy protection.",
      eventDate: new Date("2023-11-01"),
      evidenceStatus: "REPORTED",
      sources: { create: [{ sourceId: weworkAbout.id }] },
    },
  });
  await prisma.strategicDecision.create({
    data: {
      companyId: wework.id,
      title: "Asset-light vs. long-term leases",
      context:
        "WeWork positioned itself as a tech platform but signed long-term real-estate leases.",
      decision:
        "Lease buildings long-term and sublet desks short-term, carrying the lease liability on the balance sheet.",
      documentedOutcome:
        "Maturity mismatch between long-term lease obligations and short-term member contracts created liquidity risk.",
      analysis:
        "The company bore real-estate risk while offering customers flexibility, a mismatch that became terminal when demand fell.",
      limitations:
        "Governance and valuation factors also contributed; the lease model alone does not explain the failure.",
      evidenceStatus: "INTERPRETATION",
      sources: { create: [{ sourceId: weworkAbout.id }] },
    },
  });
  console.log("  seeded WeWork dossier");

  // ---------------------------------------------------------------------------
  // Quibi dossier (failure case study)
  // ---------------------------------------------------------------------------
  const quibi = createdCompanies.quibi;
  await prisma.timelineEvent.create({
    data: {
      companyId: quibi.id,
      eventType: "CLOSURE",
      title: "Service shut down",
      description: "Quibi shut down approximately six months after launch.",
      eventDate: new Date("2020-12-01"),
      evidenceStatus: "REPORTED",
      sources: { create: [{ sourceId: quibiAbout.id }] },
    },
  });
  await prisma.strategicDecision.create({
    data: {
      companyId: quibi.id,
      title: "Mobile-only short-form video",
      context:
        "Competition from TikTok, YouTube, and Instagram offering free short-form video.",
      decision:
        "Launch a paid, mobile-only short-form video service with premium Hollywood content.",
      documentedOutcome:
        "Failed to attract subscribers; shut down six months after launch.",
      analysis:
        "Paid premium content could not compete with free, creator-driven short-form video with network effects.",
      limitations:
        "The COVID-19 pandemic constrained the intended mobile, on-the-go use case at launch.",
      evidenceStatus: "INTERPRETATION",
      sources: { create: [{ sourceId: quibiAbout.id }] },
    },
  });
  console.log("  seeded Quibi dossier");

  // ---------------------------------------------------------------------------
  // Competitor relationships
  // ---------------------------------------------------------------------------
  await prisma.competitorRelationship.create({
    data: {
      companyId: zerodha.id,
      competitorCompanyId: createdCompanies.groww.id,
      relationshipType: "DIRECT_COMPETITOR",
      notes: "Both are Indian discount brokerages competing for retail investors.",
    },
  });
  await prisma.competitorRelationship.create({
    data: {
      companyId: zerodha.id,
      competitorCompanyId: createdCompanies.stripe.id,
      relationshipType: "INDIRECT_COMPETITOR",
      notes: "Different market, but both are fintech platforms with developer-friendly distribution.",
    },
  });

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
