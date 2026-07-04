import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireCompanyUser } from "@/lib/apiHelpers";
import { cashierUpdateSchema } from "@/lib/validation";

type RouteParams = { params: Promise<{ id: string }> };

export async function PUT(request: NextRequest, { params }: RouteParams) {
  const auth = await requireCompanyUser();
  if ("error" in auth) return auth.error;

  const { id } = await params;
  const body = await request.json().catch(() => null);
  const parsed = cashierUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { message: parsed.error.issues[0]?.message || "არასწორი მონაცემები" },
      { status: 400 },
    );
  }

  const existing = await prisma.cashier.findUnique({ where: { id } });
  if (!existing || existing.companyId !== auth.companyId) {
    return NextResponse.json({ message: "მოლარე ვერ მოიძებნა" }, { status: 404 });
  }

  const cashier = await prisma.cashier.update({
    where: { id },
    data: {
      ...(parsed.data.firstName !== undefined && { firstName: parsed.data.firstName }),
      ...(parsed.data.lastName !== undefined && { lastName: parsed.data.lastName }),
      ...(parsed.data.personalId !== undefined && { personalId: parsed.data.personalId || null }),
      ...(parsed.data.phone !== undefined && { phone: parsed.data.phone || null }),
      ...(parsed.data.status !== undefined && { status: parsed.data.status }),
    },
  });

  return NextResponse.json({ cashier });
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const auth = await requireCompanyUser();
  if ("error" in auth) return auth.error;

  const { id } = await params;
  const existing = await prisma.cashier.findUnique({ where: { id } });
  if (!existing || existing.companyId !== auth.companyId) {
    return NextResponse.json({ message: "მოლარე ვერ მოიძებნა" }, { status: 404 });
  }

  const cashier = await prisma.cashier.update({
    where: { id },
    data: { status: "inactive" },
  });

  return NextResponse.json({ cashier, message: "მოლარე დეაქტივირებულია" });
}
