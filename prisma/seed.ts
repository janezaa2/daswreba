import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const adminUsername = process.env.SEED_ADMIN_USERNAME || "admin";
  const adminPassword = process.env.SEED_ADMIN_PASSWORD || "admin123";
  const passwordHash = await bcrypt.hash(adminPassword, 10);

  await prisma.adminUser.upsert({
    where: { username: adminUsername },
    update: { passwordHash },
    create: { username: adminUsername, passwordHash },
  });
  console.log(`✔ ადმინისტრატორი მზადაა: ${adminUsername} / ${adminPassword}`);

  await prisma.appSettings.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      companyName: "მთაწმინდის პარკი",
      geofenceEnabled: false,
    },
  });
  console.log("✔ AppSettings ინიციალიზებულია");

  const registers = [
    { name: "მთავარი შესასვლელი", registerNumber: "R-01", zone: "შესასვლელი" },
    { name: "ატრაქციონების ზონა", registerNumber: "R-02", zone: "ატრაქციონები" },
    { name: "კაფე ბარი", registerNumber: "R-03", zone: "კვება" },
  ];

  for (const register of registers) {
    const existing = await prisma.cashRegister.findFirst({
      where: { registerNumber: register.registerNumber },
    });
    if (!existing) {
      await prisma.cashRegister.create({ data: register });
    }
  }
  console.log(`✔ სალაროები მზადაა (${registers.length})`);

  const cashiers = [
    { firstName: "გიორგი", lastName: "მაისურაძე", uniqueCode: "MP-100001" },
    { firstName: "ნინო", lastName: "კვარაცხელია", uniqueCode: "MP-100002" },
    { firstName: "დავით", lastName: "ჯანელიძე", uniqueCode: "MP-100003" },
  ];

  for (const cashier of cashiers) {
    await prisma.cashier.upsert({
      where: { uniqueCode: cashier.uniqueCode },
      update: {},
      create: cashier,
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
