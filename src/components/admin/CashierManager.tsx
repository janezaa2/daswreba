"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { CashierFormModal } from "@/components/admin/CashierFormModal";
import type { Cashier } from "@/types";

export function CashierManager() {
  const [cashiers, setCashiers] = useState<Cashier[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalState, setModalState] = useState<
    { mode: "create" } | { mode: "edit"; cashier: Cashier } | null
  >(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  async function loadCashiers() {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/cashiers");
      const data = await response.json();
      if (!response.ok) {
        setError(data.message || "ჩატვირთვა ვერ მოხერხდა");
        return;
      }
      setCashiers(data.cashiers);
    } catch {
      setError("სერვერთან კავშირი ვერ მოხერხდა");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCashiers();
  }, []);

  async function toggleStatus(cashier: Cashier) {
    setBusyId(cashier.id);
    try {
      if (cashier.status === "active") {
        await fetch(`/api/cashiers/${cashier.id}`, { method: "DELETE" });
      } else {
        await fetch(`/api/cashiers/${cashier.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "active" }),
        });
      }
      await loadCashiers();
    } finally {
      setBusyId(null);
    }
  }

  async function regenerateCode(cashier: Cashier) {
    if (!confirm(`დარწმუნებული ხართ, რომ გსურთ ${cashier.firstName} ${cashier.lastName}-ის კოდის ხელახლა გენერაცია?`)) {
      return;
    }
    setBusyId(cashier.id);
    try {
      await fetch(`/api/cashiers/${cashier.id}/regenerate-code`, { method: "POST" });
      await loadCashiers();
    } finally {
      setBusyId(null);
    }
  }

  function copyCode(cashier: Cashier) {
    navigator.clipboard?.writeText(cashier.uniqueCode).then(() => {
      setCopiedId(cashier.id);
      setTimeout(() => setCopiedId(null), 1500);
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-900">მოლარეების მართვა</h2>
        <Button onClick={() => setModalState({ mode: "create" })}>+ მოლარის დამატება</Button>
      </div>

      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
      )}

      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-slate-500">
            <tr>
              <th className="px-4 py-3 font-medium">სახელი გვარი</th>
              <th className="px-4 py-3 font-medium">პირადი ნომერი</th>
              <th className="px-4 py-3 font-medium">ტელეფონი</th>
              <th className="px-4 py-3 font-medium">უნიკალური კოდი</th>
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
            {!loading && cashiers.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                  მოლარეები არ არის დამატებული
                </td>
              </tr>
            )}
            {!loading &&
              cashiers.map((cashier) => (
                <tr key={cashier.id}>
                  <td className="px-4 py-3 font-medium text-slate-900">
                    {cashier.firstName} {cashier.lastName}
                  </td>
                  <td className="px-4 py-3 text-slate-500">{cashier.personalId || "—"}</td>
                  <td className="px-4 py-3 text-slate-500">{cashier.phone || "—"}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => copyCode(cashier)}
                      className="rounded bg-slate-100 px-2 py-1 font-mono text-xs text-slate-700 hover:bg-slate-200"
                      title="დააკოპირეთ კოდი"
                    >
                      {copiedId === cashier.id ? "დაკოპირდა!" : cashier.uniqueCode}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <Badge active={cashier.status === "active"} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      <Button
                        variant="ghost"
                        className="px-2 py-1"
                        onClick={() => setModalState({ mode: "edit", cashier })}
                      >
                        რედაქტირება
                      </Button>
                      <Button
                        variant="ghost"
                        className="px-2 py-1"
                        loading={busyId === cashier.id}
                        onClick={() => regenerateCode(cashier)}
                      >
                        კოდის განახლება
                      </Button>
                      <Button
                        variant={cashier.status === "active" ? "danger" : "primary"}
                        className="px-2 py-1"
                        loading={busyId === cashier.id}
                        onClick={() => toggleStatus(cashier)}
                      >
                        {cashier.status === "active" ? "დეაქტივაცია" : "აქტივაცია"}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {modalState && (
        <CashierFormModal
          cashier={modalState.mode === "edit" ? modalState.cashier : null}
          onClose={() => setModalState(null)}
          onSaved={() => {
            setModalState(null);
            loadCashiers();
          }}
        />
      )}
    </div>
  );
}
