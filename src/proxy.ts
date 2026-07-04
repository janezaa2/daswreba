import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const ADMIN_COOKIE_NAME = "admin_session";

type Role = "platform_admin" | "company_user";

async function getRole(token: string | undefined): Promise<Role | null> {
  if (!token) return null;
  const secret = process.env.JWT_SECRET;
  if (!secret) return null;
  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(secret));
    if (payload.role === "platform_admin" || payload.role === "company_user") {
      return payload.role;
    }
    return null;
  } catch {
    return null;
  }
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(ADMIN_COOKIE_NAME)?.value;
  const role = await getRole(token);

  if (pathname.startsWith("/login")) {
    if (role === "platform_admin") {
      return NextResponse.redirect(new URL("/admin/dashboard", request.url));
    }
    if (role === "company_user") {
      return NextResponse.redirect(new URL("/company/dashboard", request.url));
    }
    return NextResponse.next();
  }

  if (pathname.startsWith("/admin")) {
    if (role !== "platform_admin") {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    return NextResponse.next();
  }

  if (pathname.startsWith("/company")) {
    if (role !== "company_user") {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/company/:path*", "/login"],
};
