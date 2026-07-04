import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

export const ADMIN_COOKIE_NAME = "admin_session";
const ADMIN_SESSION_TTL_SECONDS = 8 * 60 * 60; // 8 hours

function getSecretKey() {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET გარემოს ცვლადი არ არის დაყენებული");
  }
  return new TextEncoder().encode(secret);
}

export type AdminRole = "platform_admin" | "company_user";

export type AdminSessionPayload = {
  adminId: string;
  username: string;
  role: AdminRole;
  companyId: string | null;
};

export async function signAdminToken(payload: AdminSessionPayload) {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${ADMIN_SESSION_TTL_SECONDS}s`)
    .sign(getSecretKey());
}

export async function verifyAdminToken(
  token: string,
): Promise<AdminSessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    if (
      typeof payload.adminId !== "string" ||
      typeof payload.username !== "string" ||
      (payload.role !== "platform_admin" && payload.role !== "company_user")
    ) {
      return null;
    }
    return {
      adminId: payload.adminId,
      username: payload.username,
      role: payload.role,
      companyId: typeof payload.companyId === "string" ? payload.companyId : null,
    };
  } catch {
    return null;
  }
}

export async function getAdminSession(): Promise<AdminSessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyAdminToken(token);
}

export const ADMIN_COOKIE_MAX_AGE = ADMIN_SESSION_TTL_SECONDS;
