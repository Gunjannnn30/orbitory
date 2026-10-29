import { NextResponse } from "next/server";
import { handleApi, requireUser } from "@/server/http";
import { endRequestSession } from "@/server/auth";

export async function POST(req: Request) {
  return handleApi(async () => {
    await requireUser(req as any);
    await endRequestSession(req as any);
    const res = NextResponse.json({ ok: true });
    res.cookies.set("orbitory_session", "", { maxAge: 0, path: "/" });
    return res;
  });
}
