import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { mobileVerifyCodeSchema } from "@/lib/validation";
import { signMobileToken } from "@/lib/mobileAuth";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = mobileVerifyCodeSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, message: parsed.error.issues[0]?.message || "კოდი აუცილებელია" },
      { status: 400 },
    );
  }

  const code = parsed.data.uniqueCode.trim().toUpperCase();
  const cashier = await prisma.cashier.findUnique({ where: { uniqueCode: code } });

  if (!cashier || cashier.status !== "active") {
    return NextResponse.json(
      { success: false, message: "კოდი არასწორია ან მოლარე არ არის აქტიური" },
      { status: 401 },
    );
  }

  const token = await signMobileToken({ cashierId: cashier.id });

  return NextResponse.json({
    success: true,
    token,
    cashier: {
      id: cashier.id,
      firstName: cashier.firstName,
      lastName: cashier.lastName,
      uniqueCode: cashier.uniqueCode,
    },
  });
}
