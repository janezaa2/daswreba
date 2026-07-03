import { randomInt } from "crypto";
import { prisma } from "@/lib/prisma";

const CODE_PREFIX = "MP-";
const CODE_DIGITS = 6;

function generateCandidate(): string {
  let digits = "";
  for (let i = 0; i < CODE_DIGITS; i++) {
    digits += randomInt(0, 10).toString();
  }
  return `${CODE_PREFIX}${digits}`;
}

export async function generateUniqueCashierCode(): Promise<string> {
  for (let attempt = 0; attempt < 20; attempt++) {
    const candidate = generateCandidate();
    const existing = await prisma.cashier.findUnique({
      where: { uniqueCode: candidate },
    });
    if (!existing) {
      return candidate;
    }
  }
  throw new Error("უნიკალური კოდის გენერაცია ვერ მოხერხდა, სცადეთ ხელახლა");
}
