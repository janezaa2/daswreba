import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireCompanyUser } from "@/lib/apiHelpers";
import { settingsUpdateSchema } from "@/lib/validation";

function toSettingsShape(company: {
  name: string;
  allowedLatitude: number | null;
  allowedLongitude: number | null;
  allowedRadiusMeters: number | null;
  geofenceEnabled: boolean;
}) {
  return {
    companyName: company.name,
    allowedLatitude: company.allowedLatitude,
    allowedLongitude: company.allowedLongitude,
    allowedRadiusMeters: company.allowedRadiusMeters,
    geofenceEnabled: company.geofenceEnabled,
  };
}

export async function GET() {
  const auth = await requireCompanyUser();
  if ("error" in auth) return auth.error;

  const company = await prisma.company.findUniqueOrThrow({ where: { id: auth.companyId } });
  return NextResponse.json({ settings: toSettingsShape(company) });
}

export async function PUT(request: NextRequest) {
  const auth = await requireCompanyUser();
  if ("error" in auth) return auth.error;

  const body = await request.json().catch(() => null);
  const parsed = settingsUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { message: parsed.error.issues[0]?.message || "არასწორი მონაცემები" },
      { status: 400 },
    );
  }

  const { companyName, ...geofence } = parsed.data;
  const company = await prisma.company.update({
    where: { id: auth.companyId },
    data: {
      ...(companyName !== undefined && { name: companyName }),
      ...geofence,
    },
  });

  return NextResponse.json({ settings: toSettingsShape(company) });
}
