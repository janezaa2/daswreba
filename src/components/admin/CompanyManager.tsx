"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";

type CompanyRow = {
  id: string;
  name: string;
  status: "pending" | "active" | "inactive";
  createdAt: string;
  adminUsers: { id: string; username: string }[];
  _count: { cashiers: number; cashRegisters: number };
};

const STATUS_LABEL: Record<CompanyRow["status"], string> = {
  pending: "მოლოდინში",
  active: "აქტიური",
  inactive: "დეაქტივირებული",
};

const STATUS_CLASS: Record<CompanyRow["status"], string> = {
  pending: "bg-amber-100 text-amber-700",
  active: "bg-emerald-100 text-emerald-700",
  inactive: "bg-slate-100 text-slate-500",
};

export function CompanyManager() {
  const [companies, setCompanies] = useState<CompanyRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  async function loadCompanies() {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/companies");
      const data = await response.json();
      if (!response.ok) {
        setError(data.message || "ჩატვირთვა ვერ მოხერხდა");
        return;
      }
      setCompanies(data.companies);
    } catch {
      setError("სერვერთან კავშირი ვერ მოხერხდა");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCompanies();
  }, []);

  async function updateStatus(company: CompanyRow, status: CompanyRow["status"]) {
    setBusyId(company.id);
    try {
      await fetch(`/api/companies/${company.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      await loadCompanies();
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-2xl font-bold text-slate-900">კომპანიების მართვა</h2>

      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
      )}

      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full min-w-[820px] text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-slate-500">
            <tr>
              <th className="px-4 py-3 font-medium">კომპანია</th>
              <th className="px-4 py-3 font-medium">მომხმარებელი</th>
              <th className="px-4 py-3 font-medium">მოლარეები</th>
              <th className="px-4 py-3 font-medium">სალაროები</th>
              <th className="px-4 py-3 font-medium">სტატუსი</th>
              <th className="px-4 py-3 font-medium">მოქმედება</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                  იტვირთება...
                </td>
              </tr>
            )}
            {!loading && companies.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                  კომპანიები არ არის რეგისტრირებული
                </td>
              </tr>
            )}
            {!loading &&
              companies.map((company) => (
                <tr key={company.id}>
                  <td className="px-4 py-3 font-medium text-slate-900">{company.name}</td>
                  <td className="px-4 py-3 text-slate-500">
                    {company.adminUsers.map((u) => u.username).join(", ") || "—"}
                  </td>
                  <td className="px-4 py-3 text-slate-500">{company._count.cashiers}</td>
                  <td className="px-4 py-3 text-slate-500">{company._count.cashRegisters}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_CLASS[company.status]}`}
                    >
                      {STATUS_LABEL[company.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      {company.status === "pending" && (
                        <>
                          <Button
                            className="px-2 py-1"
                            loading={busyId === company.id}
                            onClick={() => updateStatus(company, "active")}
                          >
                            დამტკიცება
                          </Button>
                          <Button
                            variant="danger"
                            className="px-2 py-1"
                            loading={busyId === company.id}
                            onClick={() => updateStatus(company, "inactive")}
                          >
                            უარყოფა
                          </Button>
                        </>
                      )}
                      {company.status === "active" && (
                        <Button
                          variant="danger"
                          className="px-2 py-1"
                          loading={busyId === company.id}
                          onClick={() => updateStatus(company, "inactive")}
                        >
                          დეაქტივაცია
                        </Button>
                      )}
                      {company.status === "inactive" && (
                        <Button
                          className="px-2 py-1"
                          loading={busyId === company.id}
                          onClick={() => updateStatus(company, "active")}
                        >
                          აქტივაცია
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
