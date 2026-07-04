import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";
import { todayAsUtcMidnight, toTbilisiDateString } from "@/lib/dates";

export default async function CompanyDashboardPage() {
  const session = await getAdminSession();
  const companyId = session!.companyId!;
  const today = todayAsUtcMidnight();

  const [activeCashiersCount, presentCashierIds, company] = await Promise.all([
    prisma.cashier.count({ where: { status: "active", companyId } }),
    prisma.attendanceRecord.findMany({
      where: { date: today, companyId },
      select: { cashierId: true },
      distinct: ["cashierId"],
    }),
    prisma.company.findUnique({ where: { id: companyId } }),
  ]);

  const presentCount = presentCashierIds.length;
  const absentCount = Math.max(activeCashiersCount - presentCount, 0);
  const companyName = company?.name || "თქვენი კომპანია";

  const stats = [
    { label: "აქტიური მოლარეები", value: activeCashiersCount, color: "text-slate-900" },
    { label: "დღეს გამოცხადდა", value: presentCount, color: "text-emerald-600" },
    { label: "დღეს არ გამოცხადებულა", value: absentCount, color: "text-red-500" },
  ];

  const quickLinks = [
    { href: "/company/cashiers", label: "მოლარეების მართვა", description: "დამატება, რედაქტირება, კოდების მართვა" },
    { href: "/company/registers", label: "სალაროების მართვა", description: "სალაროების დამატება და სტატუსი" },
    { href: "/company/attendance", label: "დასწრების ჟურნალი", description: "დღიური დასწრების ნახვა და ფილტრაცია" },
    { href: "/api/attendance/export", label: "Excel Export", description: "დღევანდელი დასწრების ჩამოტვირთვა", download: true },
  ];

  return (
    <div className="flex flex-col gap-8">
      <div>
        <p className="text-sm text-slate-500">{companyName}</p>
        <h2 className="text-2xl font-bold text-slate-900">
          დღევანდელი სტატისტიკა — {toTbilisiDateString(new Date())}
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <p className="text-sm text-slate-500">{stat.label}</p>
            <p className={`mt-2 text-3xl font-bold ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      <div>
        <h3 className="mb-3 text-sm font-semibold text-slate-500 uppercase">
          სწრაფი მოქმედებები
        </h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {quickLinks.map((link) =>
            link.download ? (
              <a
                key={link.href}
                href={link.href}
                className="flex flex-col gap-1 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-emerald-300 hover:shadow-md"
              >
                <span className="font-semibold text-slate-900">{link.label}</span>
                <span className="text-xs text-slate-500">{link.description}</span>
              </a>
            ) : (
              <Link
                key={link.href}
                href={link.href}
                className="flex flex-col gap-1 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-emerald-300 hover:shadow-md"
              >
                <span className="font-semibold text-slate-900">{link.label}</span>
                <span className="text-xs text-slate-500">{link.description}</span>
              </Link>
            ),
          )}
        </div>
      </div>
    </div>
  );
}
