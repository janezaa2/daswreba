"use client";

import { FormEvent, useEffect, useState } from "react";
import { Input } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import type { AppSettings } from "@/types";

export function SettingsManager() {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [locating, setLocating] = useState(false);

  const [companyName, setCompanyName] = useState("");
  const [geofenceEnabled, setGeofenceEnabled] = useState(false);
  const [allowedLatitude, setAllowedLatitude] = useState("");
  const [allowedLongitude, setAllowedLongitude] = useState("");
  const [allowedRadiusMeters, setAllowedRadiusMeters] = useState("");

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((data) => {
        const s: AppSettings = data.settings;
        setSettings(s);
        setCompanyName(s.companyName);
        setGeofenceEnabled(s.geofenceEnabled);
        setAllowedLatitude(s.allowedLatitude?.toString() ?? "");
        setAllowedLongitude(s.allowedLongitude?.toString() ?? "");
        setAllowedRadiusMeters(s.allowedRadiusMeters?.toString() ?? "");
      })
      .catch(() => setError("პარამეტრების ჩატვირთვა ვერ მოხერხდა"))
      .finally(() => setLoading(false));
  }, []);

  function useCurrentLocation() {
    if (!navigator.geolocation) {
      setError("ეს ბრაუზერი არ უჭერს მხარს გეოლოკაციას");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setAllowedLatitude(position.coords.latitude.toFixed(6));
        setAllowedLongitude(position.coords.longitude.toFixed(6));
        setLocating(false);
      },
      () => {
        setError("ლოკაციის მიღება ვერ მოხერხდა");
        setLocating(false);
      },
    );
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    setSaving(true);
    try {
      const response = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyName,
          geofenceEnabled,
          allowedLatitude: allowedLatitude ? Number(allowedLatitude) : null,
          allowedLongitude: allowedLongitude ? Number(allowedLongitude) : null,
          allowedRadiusMeters: allowedRadiusMeters ? Number(allowedRadiusMeters) : null,
        }),
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
          ჩართვის შემთხვევაში, თუ მოლარე დაფიქსირდება პარკის ტერიტორიიდან
          მითითებულ რადიუსზე მეტად დაშორებული, სისტემა ჟურნალში გამოაჩენს
          გაფრთხილებას (დასწრება მაინც შეინახება).
        </p>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            label="განედი (Latitude)"
            value={allowedLatitude}
            onChange={(e) => setAllowedLatitude(e.target.value)}
            placeholder="41.700000"
          />
          <Input
            label="გრძედი (Longitude)"
            value={allowedLongitude}
            onChange={(e) => setAllowedLongitude(e.target.value)}
            placeholder="44.780000"
          />
        </div>

        <Button type="button" variant="secondary" loading={locating} onClick={useCurrentLocation}>
          📍 მიმდინარე ლოკაციის გამოყენება
        </Button>

        <Input
          label="დაშვებული რადიუსი (მეტრი)"
          value={allowedRadiusMeters}
          onChange={(e) => setAllowedRadiusMeters(e.target.value)}
          placeholder="200"
        />

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
    </div>
  );
}
