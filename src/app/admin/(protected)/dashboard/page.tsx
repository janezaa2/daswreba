import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function PlatformAdminDashboardPage() {
  const [totalCompanies, pendingCompanies, activeCompanies, inactiveCompanies, totalCashiers] =
    await Promise.all([
      prisma.company.count(),
      prisma.company.count({ where: { status: "pending" } }),
      prisma.company.count({ where: { status: "active" } }),
      prisma.company.count({ where: { status: "inactive" } }),
      prisma.cashier.count(),
    ]);

  const stats = [
    { label: "სულ კომპანია", value: totalCompanies, color: "text-slate-900" },
    { label: "დასამტკიცებელი", value: pendingCompanies, color: "text-amber-600" },
    { label: "აქტიური", value: activeCompanies, color: "text-emerald-600" },
    { label: "დეაქტივირებული", value: inactiveCompanies, color: "text-red-500" },
    { label: "სულ მოლარე (ყველა კომპანია)", value: totalCashiers, color: "text-slate-900" },
  ];

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">საიტის მიმოხილვა</h2>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
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

      {pendingCompanies > 0 && (
        <Link
          href="/admin/companies"
          className="flex flex-col gap-1 rounded-2xl border border-amber-200 bg-amber-50 p-5 shadow-sm transition hover:border-amber-300"
        >
          <span className="font-semibold text-amber-800">
            {pendingCompanies} კომპანია ელოდება დამტკიცებას
          </span>
          <span className="text-sm text-amber-700">გადადით კომპანიების გვერდზე განსახილველად</span>
        </Link>
      )}
    </div>
  );
}
