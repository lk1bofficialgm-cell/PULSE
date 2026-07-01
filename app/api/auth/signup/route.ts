import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/password";
import { signupSchema } from "@/lib/validation";
import { jsonError } from "@/lib/api-utils";

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return jsonError(400, "Invalid JSON body");
  }

  const parsed = signupSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(400, "Validation failed", { issues: parsed.error.flatten() });
  }

  const { email, password, name, username, fitnessLevel } = parsed.data;

  const existing = await prisma.user.findFirst({
    where: { OR: [{ email }, { username }] },
    select: { email: true, username: true },
  });
  if (existing) {
    const field = existing.email === email ? "email" : "username";
    return jsonError(409, `That ${field} is already taken`);
  }

  const passwordHash = await hashPassword(password);

  const user = await prisma.user.create({
    data: { email, passwordHash, name, username, fitnessLevel },
    select: { id: true, email: true, name: true, username: true, fitnessLevel: true },
  });

  return NextResponse.json({ user }, { status: 201 });
}
