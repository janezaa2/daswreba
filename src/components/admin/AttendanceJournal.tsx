"use client";

import { useEffect, useMemo, useState } from "react";
import { Select } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { toTbilisiDateString } from "@/lib/dates";
import type { AttendanceRecord, Cashier, CashRegister } from "@/types";

export function AttendanceJournal() {
  const today = useMemo(() => toTbilisiDateString(new Date()), []);

  const [dateFrom, setDateFrom] = useState(today);
  const [dateTo, setDateTo] = useState(today);
  const [cashierId, setCashierId] = useState("");
  const [cashRegisterId, setCashRegisterId] = useState("");
  const [status, setStatus] = useState("");

  const [cashiers, setCashiers] = useState<Cashier[]>([]);
  const [registers, setRegisters] = useState<CashRegister[]>([]);
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/cashiers")
      .then((r) => r.json())
      .then((data) => setCashiers(data.cashiers || []))
      .catch(() => {});
    fetch("/api/registers")
      .then((r) => r.json())
      .then((data) => setRegisters(data.registers || []))
      .catch(() => {});
  }, []);

  const queryString = useMemo(() => {
    const params = new URLSearchParams();
    if (dateFrom) params.set("dateFrom", dateFrom);
    if (dateTo) params.set("dateTo", dateTo);
    if (cashierId) params.set("cashierId", cashierId);
    if (cashRegisterId) params.set("cashRegisterId", cashRegisterId);
    if (status) params.set("status", status);
    return params.toString();
  }, [dateFrom, dateTo, cashierId, cashRegisterId, status]);

  async function loadRecords() {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/attendance?${queryString}`);
      const data = await response.json();
      if (!response.ok) {
        setError(data.message || "ჩატვირთვა ვერ მოხერხდა");
        return;
      }
      setRecords(data.records);
    } catch {
      setError("სერვერთან კავშირი ვერ მოხერხდა");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadRecords();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryString]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-2xl font-bold text-slate-900">დასწრების ჟურნალი</h2>
        <a href={`/api/attendance/export?${queryString}`}>
          <Button>Excel Export</Button>
        </a>
      </div>

      <div className="grid grid-cols-1 gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:grid-cols-2 lg:grid-cols-5">
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-slate-700">თარიღიდან</span>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-slate-700">თარიღამდე</span>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
          />
        </label>
        <Select label="მოლარე" value={cashierId} onChange={(e) => setCashierId(e.target.value)}>
          <option value="">ყველა</option>
          {cashiers.map((c) => (
            <option key={c.id} value={c.id}>
              {c.firstName} {c.lastName}
            </option>
          ))}
        </Select>
        <Select
          label="სალარო"
          value={cashRegisterId}
          onChange={(e) => setCashRegisterId(e.target.value)}
        >
          <option value="">ყველა</option>
          {registers.map((r) => (
            <option key={r.id} value={r.id}>
              {r.name}
            </option>
          ))}
        </Select>
        <Select label="სტატუსი" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">ყველა</option>
          <option value="present">დამსწრე</option>
        </Select>
      </div>

      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
      )}

      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full min-w-[960px] text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-slate-500">
            <tr>
              <th className="px-4 py-3 font-medium">თარიღი</th>
              <th className="px-4 py-3 font-medium">დრო</th>
              <th className="px-4 py-3 font-medium">მოლარე</th>
              <th className="px-4 py-3 font-medium">კოდი</th>
              <th className="px-4 py-3 font-medium">სალარო</th>
              <th className="px-4 py-3 font-medium">GPS</th>
              <th className="px-4 py-3 font-medium">მოწყობილობა</th>
              <th className="px-4 py-3 font-medium">სტატუსი</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading && (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-slate-400">
                  იტვირთება...
                </td>
              </tr>
            )}
            {!loading && records.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-slate-400">
                  ჩანაწერები ვერ მოიძებნა
                </td>
              </tr>
            )}
            {!loading &&
              records.map((record) => (
                <tr key={record.id} className={record.outOfRange ? "bg-red-50" : undefined}>
                  <td
                    className={`px-4 py-3 whitespace-nowrap ${record.outOfRange ? "text-red-700" : "text-slate-700"}`}
                  >
                    {toTbilisiDateString(new Date(record.date))}
                  </td>
                  <td
                    className={`px-4 py-3 whitespace-nowrap ${record.outOfRange ? "text-red-700" : "text-slate-700"}`}
                  >
                    {new Date(record.checkInTime).toLocaleTimeString("ka-GE", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </td>
                  <td
                    className={`px-4 py-3 font-medium whitespace-nowrap ${record.outOfRange ? "text-red-900" : "text-slate-900"}`}
                  >
                    {record.cashierName}
                  </td>
                  <td
                    className={`px-4 py-3 font-mono text-xs whitespace-nowrap ${record.outOfRange ? "text-red-600" : "text-slate-500"}`}
                  >
                    {record.cashierCode}
                  </td>
                  <td
                    className={`px-4 py-3 whitespace-nowrap ${record.outOfRange ? "text-red-700" : "text-slate-700"}`}
                  >
                    {record.cashRegisterName}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <a
                      href={`https://www.google.com/maps?q=${record.latitude},${record.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-emerald-600 underline decoration-dotted hover:text-emerald-700"
                    >
                      რუკაზე ნახვა
                    </a>
                  </td>
                  <td
                    className={`max-w-[220px] truncate px-4 py-3 text-xs ${record.outOfRange ? "text-red-400" : "text-slate-400"}`}
                    title={record.userAgent}
                  >
                    {record.userAgent}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        record.outOfRange
                          ? "bg-red-100 text-red-700"
                          : "bg-emerald-100 text-emerald-700"
                      }`}
                    >
                      {record.status === "present" ? "დამსწრე" : record.status}
                      {record.outOfRange ? " (ლოკაციის გარეთ)" : ""}
                    </span>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
