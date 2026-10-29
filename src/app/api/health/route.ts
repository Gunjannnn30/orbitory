import { NextResponse } from "next/server";
import { handleApi } from "@/server/http";
import { prisma } from "@/lib/prisma";

export async function GET() {
  return handleApi(async () => {
    let db = "ok";
    try {
      await prisma.$queryRaw`SELECT 1`;
    } catch {
      db = "down";
    }
    return NextResponse.json({
      status: db === "ok" ? "ok" : "degraded",
      database: db,
      service: "orbitory",
      time: new Date().toISOString(),
    });
  });
}
