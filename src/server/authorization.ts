import { notFound } from "@/lib/errors";
import { prisma } from "@/lib/prisma";

export async function requireCompany(companyId: string) {
  const company = await prisma.company.findUnique({ where: { id: companyId } });
  if (!company) throw notFound("Company not found.");
  return company;
}

export async function getCompanyOrThrow(companyId: string) {
  return requireCompany(companyId);
}
