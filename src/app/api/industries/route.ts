import { NextResponse } from "next/server";
import { handleApi } from "@/server/http";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  return handleApi(async () => {
    const { searchParams } = new URL(req.url);
    const includeEmpty = searchParams.get("includeEmpty") === "true";
    const industries = await prisma.industry.findMany({
      where: includeEmpty ? {} : { companyCount: { gt: 0 } },
      orderBy: { name: "asc" },
      include: {
        _count: { select: { children: true } },
        companies: {
          where: {},
          include: { company: { select: { id: true, slug: true, name: true, companyStatus: true, businessModel: true } } },
        },
      },
    });
    return NextResponse.json({
      industries: industries.map((i) => ({
        id: i.id,
        name: i.name,
        slug: i.slug,
        description: i.description,
        color: i.color,
        parentId: i.parentIndustryId,
        companyCount: i.companies.length,
        companies: i.companies.map((c) => c.company),
      })),
    });
  });
}
