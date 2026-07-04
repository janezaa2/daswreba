import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requirePlatformAdmin } from "@/lib/apiHelpers";

export async function GET() {
  const auth = await requirePlatformAdmin();
  if ("error" in auth) return auth.error;

  const users = await prisma.adminUser.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      username: true,
      role: true,
      companyId: true,
      createdAt: true,
      company: { select: { id: true, name: true, status: true } },
    },
  });

  return NextResponse.json({ users });
}
