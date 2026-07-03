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
  if (!cashRegister || cashRegister.status !== "active") {
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

  const settings = await prisma.appSettings.findUnique({ where: { id: 1 } });
  let geofenceWarning: string | null = null;
  if (
    settings?.geofenceEnabled &&
    settings.allowedLatitude != null &&
    settings.allowedLongitude != null &&
    settings.allowedRadiusMeters != null
  ) {
    const distance = haversineDistanceMeters(
      latitude,
      longitude,
      settings.allowedLatitude,
      settings.allowedLongitude,
    );
    if (distance > settings.allowedRadiusMeters) {
      geofenceWarning = `თქვენი ლოკაცია დაშორებულია პარკის ტერიტორიიდან დაახლოებით ${Math.round(distance)} მეტრით`;
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
