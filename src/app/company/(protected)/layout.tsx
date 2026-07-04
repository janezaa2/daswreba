import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";
import { AdminNav } from "@/components/admin/AdminNav";
import { LogoutButton } from "@/components/admin/LogoutButton";

const COMPANY_NAV_LINKS = [
  { href: "/company/dashboard", label: "დეშბორდი" },
  { href: "/company/cashiers", label: "მოლარეები" },
  { href: "/company/registers", label: "სალაროები" },
  { href: "/company/attendance", label: "დასწრების ჟურნალი" },
  { href: "/company/settings", label: "პარამეტრები" },
];

export default async function CompanyProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getAdminSession();
  const company = session?.companyId
    ? await prisma.company.findUnique({ where: { id: session.companyId } })
    : null;

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-medium text-emerald-600 uppercase">
              {company?.name || "კომპანია"}
            </p>
            <h1 className="text-lg font-bold text-slate-900">მართვის პანელი</h1>
          </div>
          <div className="flex items-center gap-4">
            {session && (
              <span className="text-sm text-slate-500">{session.username}</span>
            )}
            <LogoutButton />
          </div>
        </div>
        <div className="mx-auto max-w-6xl px-4 pb-3">
          <AdminNav links={COMPANY_NAV_LINKS} />
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
        {children}
      </main>
    </div>
  );
}
