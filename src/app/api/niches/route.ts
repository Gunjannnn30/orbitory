import { NextResponse } from "next/server";
import { handleApi } from "@/server/http";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

export async function GET(req: Request) {
  return handleApi(async () => {
    const { searchParams } = new URL(req.url);
    const industryId = searchParams.get("industry");
    const where = industryId ? { industryId } : {};
    const niches = await prisma.niche.findMany({
      where,
      orderBy: { name: "asc" },
      include: { industry: { select: { id: true, name: true, slug: true } } },
    });
    return NextResponse.json({ niches });
  });
}

export async function POST(req: Request) {
  return handleApi(async () => {
    const body = await req.json().catch(() => null);
    const parsed = z.object({
      name: z.string().min(2),
      slug: z.string().min(2),
      description: z.string().optional(),
      industryId: z.string().min(1),
    }).safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: { code: "VALIDATION_ERROR", message: "Invalid niche data." } }, { status: 422 });
    }
    const niche = await prisma.niche.create({ data: parsed.data });
    return NextResponse.json({ niche }, { status: 201 });
  });
}
