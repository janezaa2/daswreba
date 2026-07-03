"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { RegisterFormModal } from "@/components/admin/RegisterFormModal";
import type { CashRegister } from "@/types";

export function RegisterManager() {
  const [registers, setRegisters] = useState<CashRegister[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalState, setModalState] = useState<
    { mode: "create" } | { mode: "edit"; register: CashRegister } | null
  >(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  async function loadRegisters() {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/registers");
      const data = await response.json();
      if (!response.ok) {
        setError(data.message || "ჩატვირთვა ვერ მოხერხდა");
        return;
      }
      setRegisters(data.registers);
    } catch {
      setError("სერვერთან კავშირი ვერ მოხერხდა");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadRegisters();
  }, []);

  async function toggleStatus(register: CashRegister) {
    setBusyId(register.id);
    try {
      if (register.status === "active") {
        await fetch(`/api/registers/${register.id}`, { method: "DELETE" });
      } else {
        await fetch(`/api/registers/${register.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "active" }),
        });
      }
      await loadRegisters();
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-900">სალაროების მართვა</h2>
        <Button onClick={() => setModalState({ mode: "create" })}>+ სალაროს დამატება</Button>
      </div>

      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
      )}

      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-slate-500">
            <tr>
              <th className="px-4 py-3 font-medium">სახელი</th>
              <th className="px-4 py-3 font-medium">ნომერი</th>
              <th className="px-4 py-3 font-medium">ზონა</th>
              <th className="px-4 py-3 font-medium">სტატუსი</th>
              <th className="px-4 py-3 font-medium">მოქმედება</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-slate-400">
                  იტვირთება...
                </td>
              </tr>
            )}
            {!loading && registers.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-slate-400">
                  სალაროები არ არის დამატებული
                </td>
              </tr>
            )}
            {!loading &&
              registers.map((register) => (
                <tr key={register.id}>
                  <td className="px-4 py-3 font-medium text-slate-900">{register.name}</td>
                  <td className="px-4 py-3 text-slate-500">{register.registerNumber}</td>
                  <td className="px-4 py-3 text-slate-500">{register.zone || "—"}</td>
                  <td className="px-4 py-3">
                    <Badge active={register.status === "active"} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      <Button
                        variant="ghost"
                        className="px-2 py-1"
                        onClick={() => setModalState({ mode: "edit", register })}
                      >
                        რედაქტირება
                      </Button>
                      <Button
                        variant={register.status === "active" ? "danger" : "primary"}
                        className="px-2 py-1"
                        loading={busyId === register.id}
                        onClick={() => toggleStatus(register)}
                      >
                        {register.status === "active" ? "დეაქტივაცია" : "აქტივაცია"}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {modalState && (
        <RegisterFormModal
          register={modalState.mode === "edit" ? modalState.register : null}
          onClose={() => setModalState(null)}
          onSaved={() => {
            setModalState(null);
            loadRegisters();
          }}
        />
      )}
    </div>
  );
}
