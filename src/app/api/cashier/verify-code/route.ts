import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyCodeSchema } from "@/lib/validation";
import { todayAsUtcMidnight } from "@/lib/dates";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = verifyCodeSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { message: parsed.error.issues[0]?.message || "არასწორი კოდი" },
      { status: 400 },
    );
  }

  const code = parsed.data.code.trim().toUpperCase();
  const cashier = await prisma.cashier.findUnique({ where: { uniqueCode: code } });

  if (!cashier) {
    return NextResponse.json({ message: "კოდი ვერ მოიძებნა, გთხოვთ სცადოთ ხელახლა" }, { status: 404 });
  }

  if (cashier.status !== "active") {
    return NextResponse.json(
      { message: "თქვენი ანგარიში დეაქტივირებულია, მიმართეთ ადმინისტრატორს" },
      { status: 403 },
    );
  }

  const existingAttendance = await prisma.attendanceRecord.findUnique({
    where: {
      cashierId_date: {
        cashierId: cashier.id,
        date: todayAsUtcMidnight(),
      },
    },
  });

  return NextResponse.json({
    cashier: {
      id: cashier.id,
      firstName: cashier.firstName,
      lastName: cashier.lastName,
      uniqueCode: cashier.uniqueCode,
    },
    alreadyCheckedIn: Boolean(existingAttendance),
  });
}
