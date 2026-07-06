import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireMobileCashier } from "@/lib/mobileApiHelpers";
import { mobileCheckInSchema } from "@/lib/validation";
import { todayAsUtcMidnight, toTbilisiDateString, toTbilisiShortTimeString } from "@/lib/dates";
import { haversineDistanceMeters } from "@/lib/geofence";

export async function POST(request: NextRequest) {
  const auth = await requireMobileCashier(request);
  if ("error" in auth) return auth.error;

  const body = await request.json().catch(() => null);
  const parsed = mobileCheckInSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, message: parsed.error.issues[0]?.message || "არასწორი მონაცემები" },
      { status: 400 },
    );
  }

  const { cashRegisterId, latitude, longitude, accuracy, deviceInfo, platform, deviceId } =
    parsed.data;
  const cashier = auth.cashier;

  const cashRegister = await prisma.cashRegister.findUnique({ where: { id: cashRegisterId } });
  if (
    !cashRegister ||
    cashRegister.status !== "active" ||
    cashRegister.companyId !== cashier.companyId
  ) {
    return NextResponse.json(
      { success: false, message: "სალარო ვერ მოიძებნა ან არააქტიურია" },
      { status: 404 },
    );
  }

  const date = todayAsUtcMidnight();
  const existing = await prisma.attendanceRecord.findUnique({
    where: { cashierId_date: { cashierId: cashier.id, date } },
  });
  if (existing) {
    return NextResponse.json(
      {
        success: false,
        code: "ALREADY_CHECKED_IN",
        message: "თქვენი დასწრება დღეს უკვე დაფიქსირებულია",
      },
      { status: 409 },
    );
  }

  const deviceUsedByOther = await prisma.attendanceRecord.findFirst({
    where: { deviceId, date, cashierId: { not: cashier.id } },
  });
  if (deviceUsedByOther) {
    return NextResponse.json(
      {
        success: false,
        code: "DEVICE_ALREADY_USED",
        message: "ეს მოწყობილობა უკვე გამოყენებულია სხვა მოლარის დასწრების დასაფიქსირებლად დღეს",
      },
      { status: 409 },
    );
  }

  const company = await prisma.company.findUnique({ where: { id: cashier.companyId } });
  let outOfRange = false;
  if (
    company?.geofenceEnabled &&
    company.allowedLatitude != null &&
    company.allowedLongitude != null &&
    company.allowedRadiusMeters != null
  ) {
    const distance = haversineDistanceMeters(
      latitude,
      longitude,
      company.allowedLatitude,
      company.allowedLongitude,
    );
    outOfRange = distance > company.allowedRadiusMeters;
  }

  try {
    const record = await prisma.attendanceRecord.create({
      data: {
        cashierId: cashier.id,
        cashierName: `${cashier.firstName} ${cashier.lastName}`,
        cashierCode: cashier.uniqueCode,
        cashRegisterId: cashRegister.id,
        cashRegisterName: cashRegister.name,
        companyId: cashier.companyId,
        date,
        checkInTime: new Date(),
        latitude,
        longitude,
        accuracy: accuracy ?? null,
        userAgent: deviceInfo || "",
        platform,
        deviceId,
        outOfRange,
        status: "present",
      },
    });

    return NextResponse.json({
      success: true,
      message: "დასწრება წარმატებით დაფიქსირდა",
      attendance: {
        date: toTbilisiDateString(record.date),
        time: toTbilisiShortTimeString(record.checkInTime),
        cashRegisterName: record.cashRegisterName,
      },
    });
  } catch {
    return NextResponse.json(
      {
        success: false,
        code: "ALREADY_CHECKED_IN",
        message: "თქვენი დასწრება დღეს უკვე დაფიქსირებულია",
      },
      { status: 409 },
    );
  }
}
