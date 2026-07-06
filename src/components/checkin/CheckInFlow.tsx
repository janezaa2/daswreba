"use client";

import { FormEvent, useState } from "react";
import { Button } from "@/components/ui/Button";
import { FingerprintIcon } from "@/components/checkin/FingerprintIcon";
import type { CashRegister } from "@/types";

type Step = "code" | "fingerprint" | "register" | "success";

type CashierInfo = {
  id: string;
  firstName: string;
  lastName: string;
  uniqueCode: string;
};

type Location = {
  latitude: number;
  longitude: number;
  accuracy: number | null;
};

const DEVICE_ID_STORAGE_KEY = "checkin_device_id";

function getOrCreateDeviceId(): string {
  let deviceId = localStorage.getItem(DEVICE_ID_STORAGE_KEY);
  if (!deviceId) {
    deviceId = crypto.randomUUID();
    localStorage.setItem(DEVICE_ID_STORAGE_KEY, deviceId);
  }
  return deviceId;
}

export function CheckInFlow() {
  const [step, setStep] = useState<Step>("code");

  const [code, setCode] = useState("");
  const [codeLoading, setCodeLoading] = useState(false);
  const [codeError, setCodeError] = useState<string | null>(null);
  const [cashier, setCashier] = useState<CashierInfo | null>(null);
  const [alreadyCheckedIn, setAlreadyCheckedIn] = useState(false);

  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [location, setLocation] = useState<Location | null>(null);

  const [registers, setRegisters] = useState<CashRegister[]>([]);
  const [registersLoading, setRegistersLoading] = useState(false);
  const [selectedRegisterId, setSelectedRegisterId] = useState("");
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [geofenceWarning, setGeofenceWarning] = useState<string | null>(null);

  function resetFlow() {
    setStep("code");
    setCode("");
    setCodeError(null);
    setCashier(null);
    setAlreadyCheckedIn(false);
    setLocating(false);
    setLocationError(null);
    setLocation(null);
    setRegisters([]);
    setSelectedRegisterId("");
    setSubmitError(null);
    setGeofenceWarning(null);
  }

  async function handleCodeSubmit(event: FormEvent) {
    event.preventDefault();
    setCodeError(null);
    setCodeLoading(true);
    try {
      const response = await fetch("/api/cashier/verify-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: code.trim() }),
      });
      const data = await response.json();
      if (!response.ok) {
        setCodeError(data.message || "კოდი ვერ მოიძებნა");
        return;
      }
      setCashier(data.cashier);
      setAlreadyCheckedIn(Boolean(data.alreadyCheckedIn));
      setStep("fingerprint");
    } catch {
      setCodeError("სერვერთან კავშირი ვერ მოხერხდა");
    } finally {
      setCodeLoading(false);
    }
  }

  function handleFingerprintPress() {
    setLocationError(null);

    if (!navigator.geolocation) {
      setLocationError("დასწრების დასაფიქსირებლად აუცილებელია ლოკაციის გაზიარება");
      return;
    }

    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy ?? null,
        });
        setLocating(false);
        setStep("register");
        setRegistersLoading(true);
        try {
          const response = await fetch(
            `/api/registers?activeOnly=true&code=${encodeURIComponent(cashier?.uniqueCode ?? "")}`,
          );
          const data = await response.json();
          setRegisters(data.registers || []);
        } catch {
          setSubmitError("სალაროების ჩატვირთვა ვერ მოხერხდა");
        } finally {
          setRegistersLoading(false);
        }
      },
      (error) => {
        setLocating(false);
        if (error.code === error.PERMISSION_DENIED) {
          setLocationError("დასწრების დასაფიქსირებლად აუცილებელია ლოკაციის გაზიარება");
        } else {
          setLocationError("ლოკაციის მიღება ვერ მოხერხდა, გთხოვთ სცადოთ ხელახლა");
        }
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 },
    );
  }

  async function handleConfirmAttendance() {
    if (!cashier || !location || !selectedRegisterId) return;
    setSubmitError(null);
    setSubmitting(true);
    try {
      const response = await fetch("/api/attendance/check-in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          uniqueCode: cashier.uniqueCode,
          cashRegisterId: selectedRegisterId,
          latitude: location.latitude,
          longitude: location.longitude,
          accuracy: location.accuracy,
          userAgent: navigator.userAgent,
          deviceId: getOrCreateDeviceId(),
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        setSubmitError(data.message || "დასწრების დაფიქსირება ვერ მოხერხდა");
        return;
      }
      setGeofenceWarning(data.geofenceWarning || null);
      setStep("success");
    } catch {
      setSubmitError("სერვერთან კავშირი ვერ მოხერხდა");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="flex flex-1 flex-col items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="mt-1 text-2xl font-bold text-slate-900">დასწრების დაფიქსირება</h1>
        </div>

        {step === "code" && (
          <form
            onSubmit={handleCodeSubmit}
            className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <label className="flex flex-col gap-1 text-sm">
              <span className="font-medium text-slate-700">თქვენი უნიკალური კოდი</span>
              <input
                autoFocus
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="MP-XXXXXX"
                className="rounded-lg border border-slate-300 px-4 py-3 text-center text-lg font-mono tracking-wider outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                required
              />
            </label>
            {codeError && (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{codeError}</p>
            )}
            <Button type="submit" loading={codeLoading} className="w-full py-3 text-base">
              შესვლა
            </Button>
          </form>
        )}

        {step === "fingerprint" && cashier && (
          <div className="flex flex-col items-center gap-6 rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
            <p className="text-slate-600">
              მოგესალმებით, <span className="font-semibold text-slate-900">{cashier.firstName} {cashier.lastName}</span>
            </p>

            {alreadyCheckedIn ? (
              <>
                <p className="rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-700">
                  თქვენი დასწრება დღეს უკვე დაფიქსირებულია
                </p>
                <Button variant="secondary" className="w-full" onClick={resetFlow}>
                  დაბრუნება
                </Button>
              </>
            ) : (
              <>
                <button
                  onClick={handleFingerprintPress}
                  disabled={locating}
                  className="flex h-40 w-40 items-center justify-center rounded-full bg-emerald-600 text-white shadow-xl shadow-emerald-600/30 transition active:scale-95 disabled:opacity-70"
                >
                  {locating ? (
                    <span className="h-10 w-10 animate-spin rounded-full border-4 border-white border-t-transparent" />
                  ) : (
                    <FingerprintIcon className="h-20 w-20" />
                  )}
                </button>
                <p className="text-sm text-slate-500">
                  დააჭირე თითი დასწრების დასაფიქსირებლად
                </p>
                {locationError && (
                  <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
                    {locationError}
                  </p>
                )}
                <button
                  onClick={resetFlow}
                  className="text-sm text-slate-400 underline hover:text-slate-600"
                >
                  სხვა კოდით შესვლა
                </button>
              </>
            )}
          </div>
        )}

        {step === "register" && cashier && (
          <div className="flex flex-col gap-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-center text-sm text-slate-500">
              ლოკაცია მიღებულია ✓ — აირჩიეთ სალარო
            </p>

            {registersLoading && (
              <p className="text-center text-slate-400">იტვირთება...</p>
            )}

            {!registersLoading && registers.length === 0 && (
              <p className="rounded-lg bg-amber-50 px-3 py-2 text-center text-sm text-amber-700">
                აქტიური სალაროები ვერ მოიძებნა
              </p>
            )}

            {!registersLoading && registers.length > 0 && (
              <div className="grid grid-cols-1 gap-2">
                {registers.map((register) => (
                  <button
                    key={register.id}
                    onClick={() => setSelectedRegisterId(register.id)}
                    className={`rounded-xl border px-4 py-3 text-left transition ${
                      selectedRegisterId === register.id
                        ? "border-emerald-600 bg-emerald-50"
                        : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <p className="font-medium text-slate-900">{register.name}</p>
                    <p className="text-xs text-slate-400">
                      {register.registerNumber}
                      {register.zone ? ` · ${register.zone}` : ""}
                    </p>
                  </button>
                ))}
              </div>
            )}

            {submitError && (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{submitError}</p>
            )}

            <Button
              onClick={handleConfirmAttendance}
              disabled={!selectedRegisterId}
              loading={submitting}
              className="w-full py-3 text-base"
            >
              დასწრების დაფიქსირება
            </Button>
            <button
              onClick={resetFlow}
              className="text-center text-sm text-slate-400 underline hover:text-slate-600"
            >
              გაუქმება
            </button>
          </div>
        )}

        {step === "success" && cashier && (
          <div className="flex flex-col items-center gap-4 rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-3xl text-emerald-600">
              ✓
            </div>
            <p className="text-lg font-semibold text-slate-900">დასწრება დაფიქსირდა!</p>
            <p className="text-sm text-slate-500">
              {cashier.firstName} {cashier.lastName} · {new Date().toLocaleTimeString("ka-GE")}
            </p>
            {geofenceWarning && (
              <p className="rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-700">
                {geofenceWarning}
              </p>
            )}
            <Button className="w-full" onClick={resetFlow}>
              დასრულება
            </Button>
          </div>
        )}
      </div>
    </main>
  );
}
