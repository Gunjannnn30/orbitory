import { NextResponse } from "next/server";
import { handleApi, requireUser } from "@/server/http";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { generateCompanyReport } from "@/lib/pdf";

export async function GET(req: Request) {
  return handleApi(async () => {
    const { searchParams } = new URL(req.url);
    const user = await getRequestUserSafe(req as any);
    const where: any = {};
    if (user) where.userId = user.id;
    const reports = await prisma.report.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: { company: { select: { id: true, slug: true, name: true } } },
    });
    return NextResponse.json({ reports });
  });
}

export async function POST(req: Request) {
  return handleApi(async () => {
    const user = await getRequestUserSafe(req as any);
    const body = await req.json().catch(() => null);
    const parsed = z.object({
      companyId: z.string().min(1),
      type: z.enum(["COMPANY_INTELLIGENCE", "PM_METRICS"]),
      sections: z.array(z.string()).default([]),
    }).safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: { code: "VALIDATION_ERROR", message: "Invalid report request." } }, { status: 422 });
    }
    const company = await prisma.company.findUnique({ where: { id: parsed.data.companyId } });
    if (!company) {
      return NextResponse.json({ error: { code: "NOT_FOUND", message: "Company not found." } }, { status: 404 });
    }

    const report = await prisma.report.create({
      data: {
        userId: user?.id ?? null,
        companyId: company.id,
        type: parsed.data.type,
        status: "PENDING",
      },
    });

    try {
      const fileUrl = await generateCompanyReport(company, parsed.data.type, parsed.data.sections);
      await prisma.report.update({
        where: { id: report.id },
        data: { status: "COMPLETED", fileUrl, generatedAt: new Date() },
      });
      return NextResponse.json({ report: { ...report, status: "COMPLETED", fileUrl } }, { status: 201 });
    } catch (err) {
      await prisma.report.update({ where: { id: report.id }, data: { status: "FAILED" } });
      throw err;
    }
  });
}

async function getRequestUserSafe(req: any) {
  try {
    const { getRequestUser } = await import("@/server/auth");
    return await getRequestUser(req);
  } catch {
    return null;
  }
}
