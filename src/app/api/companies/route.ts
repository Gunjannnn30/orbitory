import { NextResponse } from "next/server";
import { handleApi, requireUser } from "@/server/http";
import { requireCompany } from "@/server/authorization";
import { prisma } from "@/lib/prisma";
import { companySearchSchema } from "@/lib/schemas";
import { z } from "zod";

export async function GET(req: Request) {
  return handleApi(async () => {
    const { searchParams } = new URL(req.url);
    const raw = Object.fromEntries(searchParams.entries());
    const parsed = companySearchSchema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json({ error: { code: "VALIDATION_ERROR", message: "Invalid filters." } }, { status: 422 });
    }
    const { q, industry, niche, country, status, stage, businessModel, ownership, researchStatus, sort, direction, limit, offset } = parsed.data;

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
    if (ownership) where.ownershipType = ownership;
    if (businessModel) where.businessModel = businessModel;
    if (researchStatus) where.researchStatus = researchStatus;

    const orderBy: any = sort === "founded"
      ? { foundedAt: { sort: direction, nulls: "last" } }
      : { [sort]: direction };

    const [companies, total] = await Promise.all([
      prisma.company.findMany({
        where,
        orderBy,
        take: limit,
        skip: offset,
        include: {
          industries: { include: { industry: true } },
          niches: { include: { niche: true } },
          _count: { select: { products: true, timelineEvents: true, metrics: true, claims: true } },
        },
      }),
      prisma.company.count({ where }),
    ]);

    return NextResponse.json({
      companies: companies.map((c) => ({
        id: c.id,
        slug: c.slug,
        name: c.name,
        description: c.shortDescription ?? c.description,
        foundedAt: c.foundedAt,
        headquarters: c.headquarters,
        website: c.website,
        logoUrl: c.logoUrl,
        companyStatus: c.companyStatus,
        ownershipType: c.ownershipType,
        businessModel: c.businessModel,
        researchStatus: c.researchStatus,
        lastResearchedAt: c.lastResearchedAt,
        industries: c.industries.map((i) => i.industry),
        niches: c.niches.map((n) => n.niche),
        counts: c._count,
      })),
      total,
      limit,
      offset,
    });
  });
}

export async function POST(req: Request) {
  return handleApi(async () => {
    await requireUser(req as any);
    const body = await req.json().catch(() => null);
    // Minimal company creation for research workspace; full dossier fields handled in admin routes.
    const parsed = z.object({
      name: z.string().min(2),
      slug: z.string().min(2),
      description: z.string().optional(),
    }).safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: { code: "VALIDATION_ERROR", message: "Invalid company data." } }, { status: 422 });
    }
    const { name, slug, description } = parsed.data;
    const existing = await prisma.company.findUnique({ where: { slug } });
    if (existing) {
      return NextResponse.json({ error: { code: "CONFLICT", message: "A company with this slug already exists." } }, { status: 409 });
    }
    const company = await prisma.company.create({ data: { name, slug, description, researchStatus: "UNRESEARCHED" } });
    return NextResponse.json({ company }, { status: 201 });
  });
}
