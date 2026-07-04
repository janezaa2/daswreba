import { SignJWT, jwtVerify } from "jose";

const MOBILE_TOKEN_TTL_SECONDS = 30 * 24 * 60 * 60; // 30 დღე

function getSecretKey() {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET გარემოს ცვლადი არ არის დაყენებული");
  }
  return new TextEncoder().encode(secret);
}

export type MobileSessionPayload = {
  cashierId: string;
};

export async function signMobileToken(payload: MobileSessionPayload) {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setAudience("mobile")
    .setIssuedAt()
    .setExpirationTime(`${MOBILE_TOKEN_TTL_SECONDS}s`)
    .sign(getSecretKey());
}

export async function verifyMobileToken(
  token: string,
): Promise<MobileSessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecretKey(), {
      audience: "mobile",
    });
    if (typeof payload.cashierId !== "string") return null;
    return { cashierId: payload.cashierId };
  } catch {
    return null;
  }
}

export function getBearerToken(request: Request): string | null {
  const header = request.headers.get("authorization");
  if (!header?.startsWith("Bearer ")) return null;
  const token = header.slice("Bearer ".length).trim();
  return token || null;
}
