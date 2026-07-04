import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { requirePlatformAdmin } from "@/lib/apiHelpers";
import { adminUserUpdateSchema } from "@/lib/validation";

type RouteParams = { params: Promise<{ id: string }> };

export async function PUT(request: NextRequest, { params }: RouteParams) {
  const auth = await requirePlatformAdmin();
  if ("error" in auth) return auth.error;

  const { id } = await params;
  const body = await request.json().catch(() => null);
  const parsed = adminUserUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { message: parsed.error.issues[0]?.message || "არასწორი მონაცემები" },
      { status: 400 },
    );
  }

  const existing = await prisma.adminUser.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ message: "მომხმარებელი ვერ მოიძებნა" }, { status: 404 });
  }

  const { username, password } = parsed.data;

  try {
    const user = await prisma.adminUser.update({
      where: { id },
      data: {
        ...(username !== undefined && { username }),
        ...(password !== undefined && { passwordHash: await bcrypt.hash(password, 10) }),
      },
      select: {
        id: true,
        username: true,
        role: true,
        companyId: true,
        createdAt: true,
        company: { select: { id: true, name: true, status: true } },
      },
    });
    return NextResponse.json({ user, message: "მომხმარებელი განახლდა" });
  } catch (error: unknown) {
    if (typeof error === "object" && error && "code" in error && error.code === "P2002") {
      return NextResponse.json(
        { message: "მომხმარებლის სახელი დაკავებულია" },
        { status: 409 },
      );
    }
    throw error;
  }
}
