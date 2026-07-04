import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireCompanyUser } from "@/lib/apiHelpers";
import { registerUpdateSchema } from "@/lib/validation";

type RouteParams = { params: Promise<{ id: string }> };

export async function PUT(request: NextRequest, { params }: RouteParams) {
  const auth = await requireCompanyUser();
  if ("error" in auth) return auth.error;

  const { id } = await params;
  const body = await request.json().catch(() => null);
  const parsed = registerUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { message: parsed.error.issues[0]?.message || "არასწორი მონაცემები" },
      { status: 400 },
    );
  }

  const existing = await prisma.cashRegister.findUnique({ where: { id } });
  if (!existing || existing.companyId !== auth.companyId) {
    return NextResponse.json({ message: "სალარო ვერ მოიძებნა" }, { status: 404 });
  }

  const register = await prisma.cashRegister.update({
    where: { id },
    data: {
      ...(parsed.data.name !== undefined && { name: parsed.data.name }),
      ...(parsed.data.registerNumber !== undefined && { registerNumber: parsed.data.registerNumber }),
      ...(parsed.data.zone !== undefined && { zone: parsed.data.zone || null }),
      ...(parsed.data.status !== undefined && { status: parsed.data.status }),
    },
  });

  return NextResponse.json({ register });
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const auth = await requireCompanyUser();
  if ("error" in auth) return auth.error;

  const { id } = await params;
  const existing = await prisma.cashRegister.findUnique({ where: { id } });
  if (!existing || existing.companyId !== auth.companyId) {
    return NextResponse.json({ message: "სალარო ვერ მოიძებნა" }, { status: 404 });
  }

  const register = await prisma.cashRegister.update({
    where: { id },
    data: { status: "inactive" },
  });

  return NextResponse.json({ register, message: "სალარო დეაქტივირებულია" });
}
