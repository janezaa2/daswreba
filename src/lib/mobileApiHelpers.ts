import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getBearerToken, verifyMobileToken } from "@/lib/mobileAuth";
import type { Cashier } from "@prisma/client";

export async function requireMobileCashier(
  request: NextRequest,
): Promise<{ cashier: Cashier } | { error: NextResponse }> {
  const token = getBearerToken(request);
  if (!token) {
    return {
      error: NextResponse.json(
        { success: false, message: "ავტორიზაცია საჭიროა" },
        { status: 401 },
      ),
    };
  }

  const payload = await verifyMobileToken(token);
  if (!payload) {
    return {
      error: NextResponse.json(
        { success: false, message: "სესია ვადაგასულია, გთხოვთ შეხვიდეთ თავიდან" },
        { status: 401 },
      ),
    };
  }

  const cashier = await prisma.cashier.findUnique({ where: { id: payload.cashierId } });
  if (!cashier || cashier.status !== "active") {
    return {
      error: NextResponse.json(
        { success: false, message: "მოლარე ვერ მოიძებნა ან არააქტიურია" },
        { status: 401 },
      ),
    };
  }

  return { cashier };
}
