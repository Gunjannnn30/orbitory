import { NextResponse } from "next/server";
import { handleApi, requireUser } from "@/server/http";
import { getRequestUser, endRequestSession } from "@/server/auth";
import { prisma } from "@/lib/prisma";
import { loginSchema, registerSchema } from "@/lib/schemas";
import { badRequest, conflict, unauthorized } from "@/lib/errors";
import bcrypt from "bcryptjs";

export async function GET(req: Request) {
  return handleApi(async () => {
    const user = await getRequestUser(req as any);
    if (!user) return NextResponse.json({ user: null }, { status: 200 });
    return NextResponse.json({ user });
  });
}

export async function POST(req: Request) {
  return handleApi(async () => {
    const body = await req.json().catch(() => null);
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) throw badRequest("Invalid login payload.");

    const { identifier, password } = parsed.data;
    const user = await prisma.user.findFirst({
      where: { OR: [{ email: identifier }, { username: identifier }] },
    });
    if (!user) throw unauthorized("Invalid email/username or password.");

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) throw unauthorized("Invalid email/username or password.");

    // create session via server module
    const { createSession, sessionCookieOptions } = await import("@/server/session");
    const { token, expiresAt } = await createSession(user.id, {
      userAgent: req.headers.get("user-agent") ?? undefined,
      ip: (req as any).headers.get("x-forwarded-for") ?? undefined,
    });

    const res = NextResponse.json({ user: { id: user.id, email: user.email, username: user.username, name: user.name } });
    res.cookies.set("orbitory_session", token, sessionCookieOptions(expiresAt) as any);
    return res;
  });
}

export async function PUT(req: Request) {
  return handleApi(async () => {
    const user = await requireUser(req as any);
    await prisma.session.deleteMany({ where: { userId: user.id } });
    const res = NextResponse.json({ ok: true });
    res.cookies.set("orbitory_session", "", { maxAge: 0, path: "/" });
    return res;
  });
}
