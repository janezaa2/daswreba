import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { companyRegisterSchema } from "@/lib/validation";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = companyRegisterSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { message: parsed.error.issues[0]?.message || "არასწორი მონაცემები" },
      { status: 400 },
    );
  }

  const { companyName, identificationCode, password, locations } = parsed.data;

  const existingUser = await prisma.adminUser.findUnique({
    where: { username: identificationCode },
  });
  if (existingUser) {
    return NextResponse.json(
      { message: "ამ საიდენტიფიკაციო კოდით კომპანია უკვე რეგისტრირებულია" },
      { status: 409 },
    );
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const company = await prisma.company.create({
    data: {
      name: companyName,
      identificationCode,
      status: "pending",
      geofenceEnabled: true,
      locations: {
        create: locations,
      },
      adminUsers: {
        create: {
          username: identificationCode,
          passwordHash,
          role: "company_user",
        },
      },
    },
  });

  return NextResponse.json(
    {
      message:
        "რეგისტრაცია მიღებულია. თქვენი მოთხოვნა ელოდება საიტის ადმინისტრატორის დამტკიცებას — დამტკიცების შემდეგ შეძლებთ სისტემაში შესვლას.",
      company: { id: company.id, name: company.name, status: company.status },
    },
    { status: 201 },
  );
}
