import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireMobileCashier } from "@/lib/mobileApiHelpers";

export async function GET(request: NextRequest) {
  const auth = await requireMobileCashier(request);
  if ("error" in auth) return auth.error;

  const registers = await prisma.cashRegister.findMany({
    where: { status: "active", companyId: auth.cashier.companyId },
    orderBy: { name: "asc" },
  });

  return NextResponse.json({
    success: true,
    registers: registers.map((register) => ({
      id: register.id,
      name: register.name,
      registerNumber: register.registerNumber,
      zone: register.zone,
    })),
  });
}
