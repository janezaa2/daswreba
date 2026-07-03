import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/apiHelpers";
import { settingsUpdateSchema } from "@/lib/validation";

async function getOrCreateSettings() {
  const settings = await prisma.appSettings.findUnique({ where: { id: 1 } });
  if (settings) return settings;
  return prisma.appSettings.create({ data: { id: 1 } });
}

export async function GET() {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;

  const settings = await getOrCreateSettings();
  return NextResponse.json({ settings });
}

export async function PUT(request: NextRequest) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;

  const body = await request.json().catch(() => null);
  const parsed = settingsUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { message: parsed.error.issues[0]?.message || "არასწორი მონაცემები" },
      { status: 400 },
    );
  }

  await getOrCreateSettings();
  const settings = await prisma.appSettings.update({
    where: { id: 1 },
    data: parsed.data,
  });

  return NextResponse.json({ settings });
}
