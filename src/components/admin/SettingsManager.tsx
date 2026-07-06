"use client";

import { FormEvent, useEffect, useState } from "react";
import { Input } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { LocationManager } from "@/components/admin/LocationManager";
import type { CompanySettings } from "@/types";

export function SettingsManager() {
  const [settings, setSettings] = useState<CompanySettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [companyName, setCompanyName] = useState("");
  const [geofenceEnabled, setGeofenceEnabled] = useState(false);

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((data) => {
        const s: CompanySettings = data.settings;
        setSettings(s);
        setCompanyName(s.companyName);
        setGeofenceEnabled(s.geofenceEnabled);
      })
      .catch(() => setError("პარამეტრების ჩატვირთვა ვერ მოხერხდა"))
      .finally(() => setLoading(false));
  }, []);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    setSaving(true);
    try {
      const response = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companyName, geofenceEnabled }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.message || "შენახვა ვერ მოხერხდა");
        return;
      }
      setSuccess("პარამეტრები წარმატებით შენახულია");
    } catch {
      setError("სერვერთან კავშირი ვერ მოხერხდა");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <p className="text-slate-400">იტვირთება...</p>;
  }

  if (!settings) {
    return <p className="text-red-600">პარამეტრების ჩატვირთვა ვერ მოხერხდა</p>;
  }

  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-2xl font-bold text-slate-900">პარამეტრები</h2>

      <form
        onSubmit={handleSubmit}
        className="flex max-w-xl flex-col gap-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <Input
          label="კომპანიის სახელი"
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
          required
        />

        {settings.identificationCode && (
          <p className="text-xs text-slate-400">
            საიდენტიფიკაციო კოდი: <span className="font-mono">{settings.identificationCode}</span>
          </p>
        )}

        <label className="flex items-center gap-3 text-sm">
          <input
            type="checkbox"
            checked={geofenceEnabled}
            onChange={(e) => setGeofenceEnabled(e.target.checked)}
            className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
          />
          <span className="font-medium text-slate-700">
            გეოლოკაციის შეზღუდვის ჩართვა (Geofence)
          </span>
        </label>

        <p className="-mt-3 text-xs text-slate-400">
          ჩართვის შემთხვევაში, თუ მოლარე დაფიქსირდება ქვემოთ მითითებული ლოკაციებიდან
          რომელიმეს რადიუსის გარეთ, სისტემა ჟურნალში გამოაჩენს გაფრთხილებას (დასწრება
          მაინც შეინახება).
        </p>

        {error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
        )}
        {success && (
          <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
            {success}
          </p>
        )}

        <Button type="submit" loading={saving} className="w-full">
          შენახვა
        </Button>
      </form>

      <LocationManager />
    </div>
  );
}
