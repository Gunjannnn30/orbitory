import { NextResponse } from "next/server";
import { handleApi } from "@/server/http";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

export async function GET(req: Request) {
  return handleApi(async () => {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const q = searchParams.get("q");
    const where: any = {};
    if (category) where.category = category;
    if (q) where.name = { contains: q, mode: "insensitive" };
    const metrics = await prisma.metricDefinition.findMany({
      where,
      orderBy: [{ category: "asc" }, { name: "asc" }],
    });
    return NextResponse.json({ metrics });
  });
}

export async function POST(req: Request) {
  return handleApi(async () => {
    const body = await req.json().catch(() => null);
    const parsed = z.object({
      name: z.string().min(2),
      slug: z.string().min(2),
      category: z.string().min(2),
      definition: z.string().optional(),
      formula: z.string().optional(),
      unit: z.string().optional(),
      applicableBusinessModels: z.string().optional(),
      interpretation: z.string().optional(),
      limitations: z.string().optional(),
    }).safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: { code: "VALIDATION_ERROR", message: "Invalid metric definition." } }, { status: 422 });
    }
    const metric = await prisma.metricDefinition.create({ data: parsed.data });
    return NextResponse.json({ metric }, { status: 201 });
  });
}
