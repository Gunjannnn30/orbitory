import { NextResponse } from "next/server";
import { handleApi } from "@/server/http";
import { prisma } from "@/lib/prisma";
import { registerSchema } from "@/lib/schemas";
import { conflict, badRequest } from "@/lib/errors";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  return handleApi(async () => {
    const body = await req.json().catch(() => null);
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) throw badRequest("Invalid registration payload.");

    const { email, username, name, password } = parsed.data;

    const existing = await prisma.user.findFirst({
      where: { OR: [{ email }, { username }] },
    });
    if (existing) {
      throw conflict(
        existing.email === email ? "An account with this email already exists." : "Username is already taken.",
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: { email, username, name, passwordHash },
    });
    await prisma.userSettings.create({ data: { userId: user.id, theme: "dark" } });

    const res = NextResponse.json({
      user: { id: user.id, email: user.email, username: user.username, name: user.name },
    });
    return res;
  });
}
