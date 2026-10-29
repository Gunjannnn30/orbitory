import { NextResponse } from "next/server";
import { handleApi, requireUser } from "@/server/http";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

export async function GET(req: Request) {
  return handleApi(async () => {
    const { searchParams } = new URL(req.url);
    const slugs = searchParams.getAll("slug");
    if (slugs.length < 2) {
      return NextResponse.json({ error: { code: "BAD_REQUEST", message: "Provide at least two company slugs." } }, { status: 400 });
    }
    const companies = await prisma.company.findMany({
      where: { slug: { in: slugs } },
      include: {
        products: true,
        timelineEvents: { take: 8, orderBy: [{ eventDate: "desc" }] },
        metrics: { include: { metricDefinition: true }, take: 12 },
        asCompetitor: { include: { competitor: true } },
      },
    });
    if (companies.length !== slugs.length) {
      return NextResponse.json({ error: { code: "NOT_FOUND", message: "One or more companies not found." } }, { status: 404 });
    }
    return NextResponse.json({ companies });
  });
}

export async function POST(req: Request) {
  return handleApi(async () => {
    const user = await requireUser(req as any);
    const body = await req.json().catch(() => null);
    const parsed = z.object({
      name: z.string().min(2),
      companyIds: z.array(z.string()).min(2).max(5),
    }).safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: { code: "VALIDATION_ERROR", message: "Invalid comparison." } }, { status: 422 });
    }
    const comparison = await prisma.savedComparison.create({ data: { name: parsed.data.name, userId: user.id, companyIds: JSON.stringify(parsed.data.companyIds) } });
    return NextResponse.json({ comparison }, { status: 201 });
  });
}
