import { NextResponse } from "next/server";
import { getAdminSession, type AdminSessionPayload } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function requireAdmin(): Promise<
  { session: AdminSessionPayload } | { error: NextResponse }
> {
  const session = await getAdminSession();
  if (!session) {
    return {
      error: NextResponse.json(
        { message: "ავტორიზაცია საჭიროა" },
        { status: 401 },
      ),
    };
  }
  return { session };
}

export async function requirePlatformAdmin(): Promise<
  { session: AdminSessionPayload } | { error: NextResponse }
> {
  const auth = await requireAdmin();
  if ("error" in auth) return auth;
  if (auth.session.role !== "platform_admin") {
    return {
      error: NextResponse.json(
        { message: "ეს მოქმედება მხოლოდ საიტის ადმინისტრატორისთვისაა ხელმისაწვდომი" },
        { status: 403 },
      ),
    };
  }
  return auth;
}

export async function requireCompanyUser(): Promise<
  { session: AdminSessionPayload; companyId: string } | { error: NextResponse }
> {
  const auth = await requireAdmin();
  if ("error" in auth) return auth;
  if (auth.session.role !== "company_user" || !auth.session.companyId) {
    return {
      error: NextResponse.json(
        { message: "ეს მოქმედება მხოლოდ კომპანიის მომხმარებლისთვისაა ხელმისაწვდომი" },
        { status: 403 },
      ),
    };
  }

  const company = await prisma.company.findUnique({
    where: { id: auth.session.companyId },
  });
  if (!company || company.status !== "active") {
    return {
      error: NextResponse.json(
        { message: "თქვენი კომპანია არააქტიურია, მიმართეთ საიტის ადმინისტრატორს" },
        { status: 403 },
      ),
    };
  }

  return { session: auth.session, companyId: auth.session.companyId };
}

export function errorResponse(message: string, status = 400) {
  return NextResponse.json({ message }, { status });
}
