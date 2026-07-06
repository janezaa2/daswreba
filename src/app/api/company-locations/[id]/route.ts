import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireCompanyUser } from "@/lib/apiHelpers";
import { companyLocationUpdateSchema } from "@/lib/validation";

type RouteParams = { params: Promise<{ id: string }> };

export async function PUT(request: NextRequest, { params }: RouteParams) {
  const auth = await requireCompanyUser();
  if ("error" in auth) return auth.error;

  const { id } = await params;
  const body = await request.json().catch(() => null);
  const parsed = companyLocationUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { message: parsed.error.issues[0]?.message || "არასწორი მონაცემები" },
      { status: 400 },
    );
  }

  const existing = await prisma.companyLocation.findUnique({ where: { id } });
  if (!existing || existing.companyId !== auth.companyId) {
    return NextResponse.json({ message: "ლოკაცია ვერ მოიძებნა" }, { status: 404 });
  }

  const location = await prisma.companyLocation.update({
    where: { id },
    data: parsed.data,
  });

  return NextResponse.json({ location });
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const auth = await requireCompanyUser();
  if ("error" in auth) return auth.error;

  const { id } = await params;
  const existing = await prisma.companyLocation.findUnique({ where: { id } });
  if (!existing || existing.companyId !== auth.companyId) {
    return NextResponse.json({ message: "ლოკაცია ვერ მოიძებნა" }, { status: 404 });
  }

  const remainingCount = await prisma.companyLocation.count({
    where: { companyId: auth.companyId },
  });
  if (remainingCount <= 1) {
    return NextResponse.json(
      { message: "მინიმუმ ერთი ლოკაცია უნდა დარჩეს" },
      { status: 409 },
    );
  }

  await prisma.companyLocation.delete({ where: { id } });
  return NextResponse.json({ message: "ლოკაცია წაშლილია" });
}
