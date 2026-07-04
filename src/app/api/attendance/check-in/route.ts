import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkInSchema } from "@/lib/validation";
import { todayAsUtcMidnight } from "@/lib/dates";
import { haversineDistanceMeters } from "@/lib/geofence";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = checkInSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { message: parsed.error.issues[0]?.message || "არასწორი მონაცემები" },
      { status: 400 },
    );
  }

  const { uniqueCode, cashRegisterId, latitude, longitude, accuracy, userAgent } = parsed.data;
  const code = uniqueCode.trim().toUpperCase();

  const cashier = await prisma.cashier.findUnique({ where: { uniqueCode: code } });
  if (!cashier) {
    return NextResponse.json({ message: "კოდი ვერ მოიძებნა" }, { status: 404 });
  }
  if (cashier.status !== "active") {
    return NextResponse.json(
      { message: "თქვენი ანგარიში დეაქტივირებულია, მიმართეთ ადმინისტრატორს" },
      { status: 403 },
    );
  }

  const cashRegister = await prisma.cashRegister.findUnique({ where: { id: cashRegisterId } });
  if (
    !cashRegister ||
    cashRegister.status !== "active" ||
    cashRegister.companyId !== cashier.companyId
  ) {
    return NextResponse.json({ message: "სალარო ვერ მოიძებნა ან არააქტიურია" }, { status: 404 });
  }

  const date = todayAsUtcMidnight();
  const existingAttendance = await prisma.attendanceRecord.findUnique({
    where: { cashierId_date: { cashierId: cashier.id, date } },
  });
  if (existingAttendance) {
    return NextResponse.json(
      { message: "თქვენი დასწრება დღეს უკვე დაფიქსირებულია" },
      { status: 409 },
    );
  }

  const company = await prisma.company.findUnique({ where: { id: cashier.companyId } });
  let geofenceWarning: string | null = null;
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
    if (distance > company.allowedRadiusMeters) {
      geofenceWarning = `თქვენი ლოკაცია დაშორებულია დაშვებული ტერიტორიიდან დაახლოებით ${Math.round(distance)} მეტრით`;
    }
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
        userAgent: userAgent || "",
        status: "present",
      },
    });

    return NextResponse.json({
      message: "დასწრება წარმატებით დაფიქსირდა",
      record,
      geofenceWarning,
    });
  } catch {
    return NextResponse.json(
      { message: "თქვენი დასწრება დღეს უკვე დაფიქსირებულია" },
      { status: 409 },
    );
  }
}
