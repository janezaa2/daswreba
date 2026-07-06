"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Field";
import { LocationPickerCard, type LocationDraft } from "@/components/LocationPickerCard";
import { SiteTopBar } from "@/components/SiteTopBar";

const EMPTY_DRAFT: LocationDraft = { name: "", latitude: null, longitude: null, radiusMeters: "200" };

type SavedLocation = { name: string; latitude: number; longitude: number; radiusMeters: number };

export default function RegisterPage() {
  const [companyName, setCompanyName] = useState("");
  const [identificationCode, setIdentificationCode] = useState("");
  const [password, setPassword] = useState("");
  const [locations, setLocations] = useState<SavedLocation[]>([]);
  const [draft, setDraft] = useState<LocationDraft>(EMPTY_DRAFT);
  const [addingLocation, setAddingLocation] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function addLocation() {
    if (!draft.name.trim() || draft.latitude == null || draft.longitude == null || !draft.radiusMeters) {
      setError("ლოკაციის დასამატებლად შეავსეთ სახელი, ლოკაცია და რადიუსი");
      return;
    }
    setError(null);
    setLocations((prev) => [
      ...prev,
      {
        name: draft.name.trim(),
        latitude: draft.latitude!,
        longitude: draft.longitude!,
        radiusMeters: Number(draft.radiusMeters),
      },
    ]);
    setDraft(EMPTY_DRAFT);
    setAddingLocation(false);
  }

  function removeLocation(index: number) {
    setLocations((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    if (locations.length === 0) {
      setError("მინიმუმ ერთი ლოკაციის დამატება სავალდებულოა");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/company/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companyName, identificationCode, password, locations }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.message || "რეგისტრაცია ვერ მოხერხდა");
        return;
      }
      setSuccess(data.message);
      setCompanyName("");
      setIdentificationCode("");
      setPassword("");
      setLocations([]);
    } catch {
      setError("სერვერთან კავშირი ვერ მოხერხდა");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex flex-1 items-center justify-center px-4 py-12">
      <SiteTopBar />
      <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
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
              label="საიდენტიფიკაციო კოდი (9 ციფრი)"
              value={identificationCode}
              onChange={(e) => setIdentificationCode(e.target.value.replace(/\D/g, "").slice(0, 9))}
              placeholder="XXXXXXXXX"
              inputMode="numeric"
              pattern="\d{9}"
              maxLength={9}
              required
            />
            <p className="-mt-3 text-xs text-slate-400">
              ეს კოდი გამოყენებული იქნება სისტემაში შესვლის მომხმარებლის სახელად
            </p>
            <Input
              label="პაროლი"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <div className="flex flex-col gap-3 rounded-lg border border-slate-200 p-3">
              <p className="text-sm font-medium text-slate-700">
                კომპანიის ლოკაცია(ები) <span className="text-red-500">*</span>
              </p>
              <p className="text-xs text-slate-400">
                სავალდებულოა — მოლარეები ვერ დააფიქსირებენ დასწრებას ამ ტერიტორიების გარეთ
                გაფრთხილების გარეშე. თუ კომპანიას რამდენიმე ფილიალი აქვს, დაამატეთ თითოეული.
              </p>

              {locations.length > 0 && (
                <div className="flex flex-col gap-2">
                  {locations.map((location, index) => (
                    <div
                      key={`${location.name}-${index}`}
                      className="flex items-center justify-between rounded-lg bg-emerald-50 px-3 py-2"
                    >
                      <div>
                        <p className="text-sm font-medium text-emerald-800">{location.name}</p>
                        <p className="text-xs text-emerald-600">
                          {location.latitude.toFixed(5)}, {location.longitude.toFixed(5)} ·{" "}
                          {location.radiusMeters}მ
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeLocation(index)}
                        className="text-xs text-red-500 hover:underline"
                      >
                        წაშლა
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {addingLocation ? (
                <div className="flex flex-col gap-3 rounded-lg border border-slate-200 p-3">
                  <LocationPickerCard value={draft} onChange={setDraft} />
                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => {
                        setAddingLocation(false);
                        setDraft(EMPTY_DRAFT);
                      }}
                    >
                      გაუქმება
                    </Button>
                    <Button type="button" onClick={addLocation}>
                      ლოკაციის დამატება
                    </Button>
                  </div>
                </div>
              ) : (
                <Button type="button" variant="secondary" onClick={() => setAddingLocation(true)}>
                  + ლოკაციის დამატება
                </Button>
              )}
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
