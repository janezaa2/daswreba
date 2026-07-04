import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireMobileCashier } from "@/lib/mobileApiHelpers";
import { todayAsUtcMidnight, toTbilisiDateString, toTbilisiShortTimeString } from "@/lib/dates";

export async function GET(request: NextRequest) {
  const auth = await requireMobileCashier(request);
  if ("error" in auth) return auth.error;

  const date = todayAsUtcMidnight();
  const record = await prisma.attendanceRecord.findUnique({
    where: { cashierId_date: { cashierId: auth.cashier.id, date } },
  });

  if (!record) {
    return NextResponse.json({ success: true, alreadyCheckedIn: false });
  }

  return NextResponse.json({
    success: true,
    alreadyCheckedIn: true,
    attendance: {
      date: toTbilisiDateString(record.date),
      time: toTbilisiShortTimeString(record.checkInTime),
      cashRegisterName: record.cashRegisterName,
    },
  });
}
