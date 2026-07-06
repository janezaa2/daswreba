import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requirePlatformAdmin } from "@/lib/apiHelpers";
import { siteContentBlockUpdateSchema } from "@/lib/validation";

type RouteParams = { params: Promise<{ id: string }> };

export async function PUT(request: NextRequest, { params }: RouteParams) {
  const auth = await requirePlatformAdmin();
  if ("error" in auth) return auth.error;

  const { id } = await params;
  const body = await request.json().catch(() => null);
  const parsed = siteContentBlockUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { message: parsed.error.issues[0]?.message || "არასწორი მონაცემები" },
      { status: 400 },
    );
  }

  const existing = await prisma.siteContentBlock.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ message: "ბლოკი ვერ მოიძებნა" }, { status: 404 });
  }

  const block = await prisma.siteContentBlock.update({ where: { id }, data: parsed.data });
  return NextResponse.json({ block });
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const auth = await requirePlatformAdmin();
  if ("error" in auth) return auth.error;

  const { id } = await params;
  const existing = await prisma.siteContentBlock.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ message: "ბლოკი ვერ მოიძებნა" }, { status: 404 });
  }

  await prisma.siteContentBlock.delete({ where: { id } });
  return NextResponse.json({ message: "წაშლილია" });
}
