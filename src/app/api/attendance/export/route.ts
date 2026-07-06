import { NextRequest, NextResponse } from "next/server";
import * as XLSX from "xlsx";
import { prisma } from "@/lib/prisma";
import { requireCompanyUser } from "@/lib/apiHelpers";
import {
  buildAttendanceWhere,
  extractFiltersFromSearchParams,
} from "@/lib/attendanceFilters";
import { toTbilisiDateString, toTbilisiTimeString } from "@/lib/dates";
import { buildGoogleMapsLink } from "@/lib/geofence";

function buildFilename(dateFrom: string | null, dateTo: string | null): string {
  if (dateFrom && dateTo && dateFrom !== dateTo) {
    return `attendance_${dateFrom}_to_${dateTo}.xlsx`;
  }
  const single = dateFrom || dateTo || toTbilisiDateString(new Date());
  return `attendance_${single}.xlsx`;
}

export async function GET(request: NextRequest) {
  const auth = await requireCompanyUser();
  if ("error" in auth) return auth.error;

  const filters = extractFiltersFromSearchParams(request.nextUrl.searchParams);
  const where = { ...buildAttendanceWhere(filters), companyId: auth.companyId };

  const records = await prisma.attendanceRecord.findMany({
    where,
    orderBy: { checkInTime: "desc" },
  });

  const rows = records.map((record) => ({
    Date: toTbilisiDateString(record.date),
    "Check-in Time": toTbilisiTimeString(record.checkInTime),
    "Cashier Name": record.cashierName,
    "Cashier Code": record.cashierCode,
    "Cash Register": record.cashRegisterName,
    Latitude: record.latitude,
    Longitude: record.longitude,
    "Google Maps Link": buildGoogleMapsLink(record.latitude, record.longitude),
    "Device Info": record.userAgent,
    Status: record.status.charAt(0).toUpperCase() + record.status.slice(1),
    Location: record.outOfRange ? "Out of Range" : "Within Range",
  }));

  const worksheet = XLSX.utils.json_to_sheet(rows, {
    header: [
      "Date",
      "Check-in Time",
      "Cashier Name",
      "Cashier Code",
      "Cash Register",
      "Latitude",
      "Longitude",
      "Google Maps Link",
      "Device Info",
      "Status",
      "Location",
    ],
  });
  worksheet["!cols"] = [
    { wch: 12 },
    { wch: 14 },
    { wch: 22 },
    { wch: 14 },
    { wch: 20 },
    { wch: 12 },
    { wch: 12 },
    { wch: 45 },
    { wch: 40 },
    { wch: 12 },
    { wch: 14 },
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Attendance");

  const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });
  const filename = buildFilename(filters.dateFrom ?? null, filters.dateTo ?? null);

  return new NextResponse(buffer, {
    status: 200,
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
