import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireCompanyUser } from "@/lib/apiHelpers";
import { cashierCreateSchema } from "@/lib/validation";
import { generateUniqueCashierCode } from "@/lib/codeGenerator";

export async function GET() {
  const auth = await requireCompanyUser();
  if ("error" in auth) return auth.error;

  const cashiers = await prisma.cashier.findMany({
    where: { companyId: auth.companyId },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ cashiers });
}

export async function POST(request: NextRequest) {
  const auth = await requireCompanyUser();
  if ("error" in auth) return auth.error;

  const body = await request.json().catch(() => null);
  const parsed = cashierCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { message: parsed.error.issues[0]?.message || "არასწორი მონაცემები" },
      { status: 400 },
    );
  }

  const uniqueCode = await generateUniqueCashierCode();
  const cashier = await prisma.cashier.create({
    data: {
      firstName: parsed.data.firstName,
      lastName: parsed.data.lastName,
      personalId: parsed.data.personalId || null,
      phone: parsed.data.phone || null,
      uniqueCode,
      companyId: auth.companyId,
    },
  });

  return NextResponse.json({ cashier }, { status: 201 });
}
