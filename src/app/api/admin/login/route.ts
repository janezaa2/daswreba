import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { adminLoginSchema } from "@/lib/validation";
import { signAdminToken, ADMIN_COOKIE_NAME, ADMIN_COOKIE_MAX_AGE } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = adminLoginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { message: parsed.error.issues[0]?.message || "არასწორი მონაცემები" },
      { status: 400 },
    );
  }

  const { username, password } = parsed.data;
  const admin = await prisma.adminUser.findUnique({
    where: { username },
    include: { company: true },
  });
  if (!admin) {
    return NextResponse.json(
      { message: "მომხმარებლის სახელი ან პაროლი არასწორია" },
      { status: 401 },
    );
  }

  const passwordOk = await bcrypt.compare(password, admin.passwordHash);
  if (!passwordOk) {
    return NextResponse.json(
      { message: "მომხმარებლის სახელი ან პაროლი არასწორია" },
      { status: 401 },
    );
  }

  if (admin.role === "company_user") {
    if (!admin.company || admin.company.status === "pending") {
      return NextResponse.json(
        { message: "თქვენი კომპანიის რეგისტრაცია ჯერ არ არის დამტკიცებული ადმინისტრატორის მიერ" },
        { status: 403 },
      );
    }
    if (admin.company.status === "inactive") {
      return NextResponse.json(
        { message: "თქვენი კომპანია დეაქტივირებულია, მიმართეთ საიტის ადმინისტრატორს" },
        { status: 403 },
      );
    }
  }

  const token = await signAdminToken({
    adminId: admin.id,
    username: admin.username,
    role: admin.role,
    companyId: admin.companyId,
  });

  const response = NextResponse.json({
    message: "წარმატებით შეხვედით სისტემაში",
    admin: { id: admin.id, username: admin.username, role: admin.role },
  });
  response.cookies.set(ADMIN_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: ADMIN_COOKIE_MAX_AGE,
  });
  return response;
}
