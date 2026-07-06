import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireCompanyUser } from "@/lib/apiHelpers";
import { companyLocationSchema } from "@/lib/validation";

export async function GET() {
  const auth = await requireCompanyUser();
  if ("error" in auth) return auth.error;

  const locations = await prisma.companyLocation.findMany({
    where: { companyId: auth.companyId },
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json({ locations });
}

export async function POST(request: NextRequest) {
  const auth = await requireCompanyUser();
  if ("error" in auth) return auth.error;

  const body = await request.json().catch(() => null);
  const parsed = companyLocationSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { message: parsed.error.issues[0]?.message || "არასწორი მონაცემები" },
      { status: 400 },
    );
  }

  const location = await prisma.companyLocation.create({
    data: { ...parsed.data, companyId: auth.companyId },
  });

  return NextResponse.json({ location }, { status: 201 });
}
