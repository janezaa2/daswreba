"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Field";

export default function RegisterPage() {
  const [companyName, setCompanyName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [radiusMeters, setRadiusMeters] = useState("200");
  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const hasLocation = latitude !== "" && longitude !== "";

  function useCurrentLocation() {
    setLocationError(null);
    if (!navigator.geolocation) {
      setLocationError("ეს ბრაუზერი არ უჭერს მხარს გეოლოკაციას");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLatitude(position.coords.latitude.toFixed(6));
        setLongitude(position.coords.longitude.toFixed(6));
        setLocating(false);
      },
      () => {
        setLocationError("ლოკაციის მიღება ვერ მოხერხდა, გთხოვთ დაუშვათ წვდომა და სცადოთ ხელახლა");
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 },
    );
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    if (!hasLocation) {
      setError("კომპანიის ლოკაციის მითითება სავალდებულოა");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/company/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyName,
          username,
          password,
          allowedLatitude: Number(latitude),
          allowedLongitude: Number(longitude),
          allowedRadiusMeters: Number(radiusMeters),
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.message || "რეგისტრაცია ვერ მოხერხდა");
        return;
      }
      setSuccess(data.message);
      setCompanyName("");
      setUsername("");
      setPassword("");
      setLatitude("");
      setLongitude("");
    } catch {
      setError("სერვერთან კავშირი ვერ მოხერხდა");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex flex-1 items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="mb-6 text-center">
          <h1 className="mt-1 text-2xl font-bold text-slate-900">კომპანიის რეგისტრაცია</h1>
          <p className="mt-1 text-sm text-slate-500">
            დაარეგისტრირეთ თქვენი კომპანია დასწრების აღრიცხვის სისტემაში
          </p>
        </div>

        {success ? (
          <div className="rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {success}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
              label="კომპანიის დასახელება"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              autoFocus
              required
            />
            <Input
              label="მომხმარებლის სახელი"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
            <Input
              label="პაროლი"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <div className="flex flex-col gap-2 rounded-lg border border-slate-200 p-3">
              <p className="text-sm font-medium text-slate-700">
                კომპანიის ლოკაცია <span className="text-red-500">*</span>
              </p>
              <p className="text-xs text-slate-400">
                სავალდებულოა — მოლარეები ვერ დააფიქსირებენ დასწრებას ამ ტერიტორიის გარეთ
                გაფრთხილების გარეშე
              </p>

              <Button
                type="button"
                variant="secondary"
                loading={locating}
                onClick={useCurrentLocation}
              >
                📍 მიმდინარე ლოკაციის გამოყენება
              </Button>

              {hasLocation && (
                <p className="text-xs text-emerald-600">
                  ლოკაცია მიღებულია: {latitude}, {longitude}
                </p>
              )}
              {locationError && (
                <p className="text-xs text-red-600">{locationError}</p>
              )}

              <Input
                label="დაშვებული რადიუსი (მეტრი)"
                value={radiusMeters}
                onChange={(e) => setRadiusMeters(e.target.value)}
                placeholder="200"
                required
              />
            </div>

            {error && (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
                {error}
              </p>
            )}

            <Button type="submit" loading={loading} className="mt-2 w-full">
              რეგისტრაცია
            </Button>
          </form>
        )}

        <p className="mt-6 text-center text-sm text-slate-500">
          უკვე გაქვთ ანგარიში?{" "}
          <Link href="/login" className="font-medium text-emerald-600 hover:underline">
            შესვლა
          </Link>
        </p>
      </div>
    </main>
  );
}
