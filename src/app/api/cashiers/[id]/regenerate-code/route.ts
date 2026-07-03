import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/apiHelpers";
import { generateUniqueCashierCode } from "@/lib/codeGenerator";

type RouteParams = { params: Promise<{ id: string }> };

export async function POST(_request: NextRequest, { params }: RouteParams) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;

  const { id } = await params;
  const existing = await prisma.cashier.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ message: "მოლარე ვერ მოიძებნა" }, { status: 404 });
  }

  const uniqueCode = await generateUniqueCashierCode();
  const cashier = await prisma.cashier.update({
    where: { id },
    data: { uniqueCode },
  });

  return NextResponse.json({ cashier, message: "კოდი განახლდა" });
}
