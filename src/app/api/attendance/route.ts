import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireCompanyUser } from "@/lib/apiHelpers";
import {
  buildAttendanceWhere,
  extractFiltersFromSearchParams,
} from "@/lib/attendanceFilters";

export async function GET(request: NextRequest) {
  const auth = await requireCompanyUser();
  if ("error" in auth) return auth.error;

  const filters = extractFiltersFromSearchParams(request.nextUrl.searchParams);
  const where = { ...buildAttendanceWhere(filters), companyId: auth.companyId };

  const records = await prisma.attendanceRecord.findMany({
    where,
    orderBy: { checkInTime: "desc" },
    take: 1000,
  });

  return NextResponse.json({ records });
}
