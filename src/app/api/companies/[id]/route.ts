import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requirePlatformAdmin } from "@/lib/apiHelpers";
import { companyUpdateSchema } from "@/lib/validation";

type RouteParams = { params: Promise<{ id: string }> };

export async function PUT(request: NextRequest, { params }: RouteParams) {
  const auth = await requirePlatformAdmin();
  if ("error" in auth) return auth.error;

  const { id } = await params;
  const body = await request.json().catch(() => null);
  const parsed = companyUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { message: parsed.error.issues[0]?.message || "არასწორი მონაცემები" },
      { status: 400 },
    );
  }

  const existing = await prisma.company.findUnique({
    where: { id },
    include: { adminUsers: true },
  });
  if (!existing) {
    return NextResponse.json({ message: "კომპანია ვერ მოიძებნა" }, { status: 404 });
  }

  const { username, ...companyFields } = parsed.data;

  if (username) {
    const primaryAdmin = existing.adminUsers.find((u) => u.role === "company_user");
    if (primaryAdmin && username !== primaryAdmin.username) {
      const usernameTaken = await prisma.adminUser.findUnique({ where: { username } });
      if (usernameTaken) {
        return NextResponse.json(
          { message: "მომხმარებლის სახელი დაკავებულია" },
          { status: 409 },
        );
      }
      await prisma.adminUser.update({ where: { id: primaryAdmin.id }, data: { username } });
    }
  }

  try {
    const company = await prisma.company.update({
      where: { id },
      data: companyFields,
      include: { adminUsers: { select: { id: true, username: true } } },
    });
    return NextResponse.json({ company });
  } catch {
    return NextResponse.json(
      { message: "საიდენტიფიკაციო კოდი დაკავებულია" },
      { status: 409 },
    );
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const auth = await requirePlatformAdmin();
  if ("error" in auth) return auth.error;

  const { id } = await params;
  const existing = await prisma.company.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ message: "კომპანია ვერ მოიძებნა" }, { status: 404 });
  }

  await prisma.$transaction([
    prisma.attendanceRecord.deleteMany({ where: { companyId: id } }),
    prisma.cashier.deleteMany({ where: { companyId: id } }),
    prisma.cashRegister.deleteMany({ where: { companyId: id } }),
    prisma.companyLocation.deleteMany({ where: { companyId: id } }),
    prisma.adminUser.deleteMany({ where: { companyId: id } }),
    prisma.company.delete({ where: { id } }),
  ]);

  return NextResponse.json({ message: "კომპანია და მასთან დაკავშირებული ყველა მონაცემი წაშლილია" });
}
