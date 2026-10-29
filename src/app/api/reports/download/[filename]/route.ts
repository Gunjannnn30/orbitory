import { NextResponse } from "next/server";
import { handleApi } from "@/server/http";
import fs from "node:fs";
import path from "node:path";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ filename: string }> },
) {
  return handleApi(async () => {
    const filename = path.basename((await params).filename);
    const filePath = path.join(process.cwd(), "storage", "reports", filename);
    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: { code: "NOT_FOUND", message: "Report not found." } }, { status: 404 });
    }
    const stat = fs.statSync(filePath);
    const file = fs.createReadStream(filePath);
    return new NextResponse(file as any, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Length": String(stat.size),
      },
    });
  });
}
