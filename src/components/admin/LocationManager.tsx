"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { LocationPickerCard, type LocationDraft } from "@/components/LocationPickerCard";
import type { CompanyLocation } from "@/types";

const EMPTY_DRAFT: LocationDraft = { name: "", latitude: null, longitude: null, radiusMeters: "200" };

export function LocationManager() {
  const [locations, setLocations] = useState<CompanyLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalState, setModalState] = useState<
    { mode: "create" } | { mode: "edit"; location: CompanyLocation } | null
  >(null);
  const [draft, setDraft] = useState<LocationDraft>(EMPTY_DRAFT);
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  async function loadLocations() {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/company-locations");
      const data = await response.json();
      if (!response.ok) {
        setError(data.message || "ჩატვირთვა ვერ მოხერხდა");
        return;
      }
      setLocations(data.locations);
    } catch {
      setError("სერვერთან კავშირი ვერ მოხერხდა");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadLocations();
  }, []);

  function openCreate() {
    setDraft(EMPTY_DRAFT);
    setModalState({ mode: "create" });
  }

  function openEdit(location: CompanyLocation) {
    setDraft({
      name: location.name,
      latitude: location.latitude,
      longitude: location.longitude,
      radiusMeters: location.radiusMeters.toString(),
    });
    setModalState({ mode: "edit", location });
  }

  async function handleSave() {
    if (!draft.name.trim() || draft.latitude == null || draft.longitude == null || !draft.radiusMeters) {
      setError("ყველა ველის შევსება აუცილებელია");
      return;
    }
    setError(null);
    setSaving(true);
    try {
      const payload = {
        name: draft.name.trim(),
        latitude: draft.latitude,
        longitude: draft.longitude,
        radiusMeters: Number(draft.radiusMeters),
      };
      const url =
        modalState?.mode === "edit" ? `/api/company-locations/${modalState.location.id}` : "/api/company-locations";
      const method = modalState?.mode === "edit" ? "PUT" : "POST";
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.message || "შენახვა ვერ მოხერხდა");
        return;
      }
      setModalState(null);
      await loadLocations();
    } catch {
      setError("სერვერთან კავშირი ვერ მოხერხდა");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(location: CompanyLocation) {
    if (!confirm(`წავშალო ლოკაცია "${location.name}"?`)) return;
    setBusyId(location.id);
    setError(null);
    try {
      const response = await fetch(`/api/company-locations/${location.id}`, { method: "DELETE" });
      const data = await response.json();
      if (!response.ok) {
        setError(data.message || "წაშლა ვერ მოხერხდა");
        return;
      }
      await loadLocations();
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-slate-900">კომპანიის ლოკაციები</h3>
          <p className="text-xs text-slate-400">
            თუ კომპანიას რამდენიმე ტერიტორია აქვს, დაამატეთ თითოეული — მოლარე ჩაითვლება
            დასწრებულად, თუ ნებისმიერი ლოკაციის რადიუსშია
          </p>
        </div>
        <Button type="button" onClick={openCreate}>
          + დამატება
        </Button>
      </div>

      {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}

      {loading && <p className="text-sm text-slate-400">იტვირთება...</p>}

      {!loading && locations.length === 0 && (
        <p className="text-sm text-slate-400">ლოკაციები არ არის დამატებული</p>
      )}

      {!loading && locations.length > 0 && (
        <div className="flex flex-col gap-2">
          {locations.map((location) => (
            <div
              key={location.id}
              className="flex items-center justify-between rounded-lg border border-slate-200 px-4 py-3"
            >
              <div>
                <p className="text-sm font-medium text-slate-900">{location.name}</p>
                <p className="text-xs text-slate-400">
                  {location.latitude.toFixed(5)}, {location.longitude.toFixed(5)} · {location.radiusMeters}მ
                  რადიუსი
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" className="px-2 py-1" onClick={() => openEdit(location)}>
                  რედაქტირება
                </Button>
                <Button
                  variant="danger"
                  className="px-2 py-1"
                  loading={busyId === location.id}
                  onClick={() => handleDelete(location)}
                >
                  წაშლა
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {modalState && (
        <Modal
          title={modalState.mode === "edit" ? "ლოკაციის რედაქტირება" : "ახალი ლოკაციის დამატება"}
          onClose={() => setModalState(null)}
          maxWidth="max-w-lg"
        >
          <div className="flex flex-col gap-4">
            <LocationPickerCard value={draft} onChange={setDraft} />
            {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}
            <div className="flex justify-end gap-2">
              <Button type="button" variant="secondary" onClick={() => setModalState(null)}>
                გაუქმება
              </Button>
              <Button type="button" loading={saving} onClick={handleSave}>
                შენახვა
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
