import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const platformUsername = process.env.SEED_PLATFORM_ADMIN_USERNAME || "superadmin";
  const platformPassword = process.env.SEED_PLATFORM_ADMIN_PASSWORD || "super123";
  const platformPasswordHash = await bcrypt.hash(platformPassword, 10);

  await prisma.adminUser.upsert({
    where: { username: platformUsername },
    update: { passwordHash: platformPasswordHash, role: "platform_admin", companyId: null },
    create: {
      username: platformUsername,
      passwordHash: platformPasswordHash,
      role: "platform_admin",
    },
  });
  console.log(`✔ საიტის ადმინისტრატორი მზადაა: ${platformUsername} / ${platformPassword}`);

  const companyUsername = process.env.SEED_COMPANY_ADMIN_USERNAME || "admin";
  const companyPassword = process.env.SEED_COMPANY_ADMIN_PASSWORD || "admin123";
  const companyPasswordHash = await bcrypt.hash(companyPassword, 10);

  const company = await prisma.company.upsert({
    where: { id: "seed-mtatsminda-park" },
    update: {},
    create: {
      id: "seed-mtatsminda-park",
      name: "მთაწმინდის პარკი",
      status: "active",
      geofenceEnabled: false,
    },
  });

  await prisma.adminUser.upsert({
    where: { username: companyUsername },
    update: { passwordHash: companyPasswordHash, role: "company_user", companyId: company.id },
    create: {
      username: companyUsername,
      passwordHash: companyPasswordHash,
      role: "company_user",
      companyId: company.id,
    },
  });
  console.log(
    `✔ კომპანია "${company.name}" მზადაა, მომხმარებელი: ${companyUsername} / ${companyPassword}`,
  );

  const registers = [
    { name: "მთავარი შესასვლელი", registerNumber: "R-01", zone: "შესასვლელი" },
    { name: "ატრაქციონების ზონა", registerNumber: "R-02", zone: "ატრაქციონები" },
    { name: "კაფე ბარი", registerNumber: "R-03", zone: "კვება" },
  ];

  for (const register of registers) {
    const existing = await prisma.cashRegister.findFirst({
      where: { registerNumber: register.registerNumber, companyId: company.id },
    });
    if (!existing) {
      await prisma.cashRegister.create({ data: { ...register, companyId: company.id } });
    }
  }
  console.log(`✔ სალაროები მზადაა (${registers.length})`);

  const cashiers = [
    { firstName: "გიორგი", lastName: "მაისურაძე", uniqueCode: "100001" },
    { firstName: "ნინო", lastName: "კვარაცხელია", uniqueCode: "100002" },
    { firstName: "დავით", lastName: "ჯანელიძე", uniqueCode: "100003" },
  ];

  for (const cashier of cashiers) {
    await prisma.cashier.upsert({
      where: { uniqueCode: cashier.uniqueCode },
      update: {},
      create: { ...cashier, companyId: company.id },
    });
  }
  console.log(`✔ სატესტო მოლარეები მზადაა (${cashiers.length})`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
