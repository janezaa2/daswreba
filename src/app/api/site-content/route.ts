import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requirePlatformAdmin } from "@/lib/apiHelpers";
import { siteContentBlockCreateSchema, siteContentPageSchema } from "@/lib/validation";

export async function GET(request: NextRequest) {
  const pageParam = request.nextUrl.searchParams.get("page");
  const parsedPage = siteContentPageSchema.safeParse(pageParam);
  if (!parsedPage.success) {
    return NextResponse.json({ message: "არასწორი გვერდი" }, { status: 400 });
  }

  const blocks = await prisma.siteContentBlock.findMany({
    where: { page: parsedPage.data },
    orderBy: { order: "asc" },
  });
  return NextResponse.json({ blocks });
}

export async function POST(request: NextRequest) {
  const auth = await requirePlatformAdmin();
  if ("error" in auth) return auth.error;

  const body = await request.json().catch(() => null);
  const parsed = siteContentBlockCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { message: parsed.error.issues[0]?.message || "არასწორი მონაცემები" },
      { status: 400 },
    );
  }

  const block = await prisma.siteContentBlock.create({ data: parsed.data });
  return NextResponse.json({ block }, { status: 201 });
}
