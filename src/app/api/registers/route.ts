import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireCompanyUser } from "@/lib/apiHelpers";
import { registerCreateSchema } from "@/lib/validation";

export async function GET(request: NextRequest) {
  const activeOnly = request.nextUrl.searchParams.get("activeOnly") === "true";

  if (activeOnly) {
    const code = request.nextUrl.searchParams.get("code")?.trim().toUpperCase();
    if (!code) {
      return NextResponse.json({ message: "კოდი აუცილებელია" }, { status: 400 });
    }
    const cashier = await prisma.cashier.findUnique({ where: { uniqueCode: code } });
    if (!cashier || cashier.status !== "active") {
      return NextResponse.json({ message: "კოდი ვერ მოიძებნა" }, { status: 404 });
    }
    const registers = await prisma.cashRegister.findMany({
      where: { status: "active", companyId: cashier.companyId },
      orderBy: { name: "asc" },
    });
    return NextResponse.json({ registers });
  }

  const auth = await requireCompanyUser();
  if ("error" in auth) return auth.error;

  const registers = await prisma.cashRegister.findMany({
    where: { companyId: auth.companyId },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ registers });
}

export async function POST(request: NextRequest) {
  const auth = await requireCompanyUser();
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
      companyId: auth.companyId,
    },
  });

  return NextResponse.json({ register }, { status: 201 });
}
