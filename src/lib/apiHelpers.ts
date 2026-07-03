import { NextResponse } from "next/server";
import { getAdminSession, type AdminSessionPayload } from "@/lib/auth";

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

export function errorResponse(message: string, status = 400) {
  return NextResponse.json({ message }, { status });
}
