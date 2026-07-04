import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requirePlatformAdmin } from "@/lib/apiHelpers";

export async function GET() {
  const auth = await requirePlatformAdmin();
  if ("error" in auth) return auth.error;

  const companies = await prisma.company.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      adminUsers: { select: { id: true, username: true } },
      _count: { select: { cashiers: true, cashRegisters: true } },
    },
  });

  return NextResponse.json({ companies });
}
