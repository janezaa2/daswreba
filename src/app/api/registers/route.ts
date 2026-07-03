import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/apiHelpers";
import { registerCreateSchema } from "@/lib/validation";

export async function GET(request: NextRequest) {
  const activeOnly = request.nextUrl.searchParams.get("activeOnly") === "true";

  if (activeOnly) {
    const registers = await prisma.cashRegister.findMany({
      where: { status: "active" },
      orderBy: { name: "asc" },
    });
    return NextResponse.json({ registers });
  }

  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;

  const registers = await prisma.cashRegister.findMany({
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ registers });
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;

  const body = await request.json().catch(() => null);
  const parsed = registerCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { message: parsed.error.issues[0]?.message || "არასწორი მონაცემები" },
      { status: 400 },
    );
  }

  const register = await prisma.cashRegister.create({
    data: {
      name: parsed.data.name,
      registerNumber: parsed.data.registerNumber,
      zone: parsed.data.zone || null,
    },
  });

  return NextResponse.json({ register }, { status: 201 });
}
