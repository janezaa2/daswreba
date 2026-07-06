"use client";

import { useState } from "react";
import { MapPicker } from "@/components/MapPickerLoader";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Field";

export type LocationDraft = {
  name: string;
  latitude: number | null;
  longitude: number | null;
  radiusMeters: string;
};

type LocationPickerCardProps = {
  value: LocationDraft;
  onChange: (value: LocationDraft) => void;
};

export function LocationPickerCard({ value, onChange }: LocationPickerCardProps) {
  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  function useCurrentLocation() {
    setLocationError(null);
    if (!navigator.geolocation) {
      setLocationError("ეს ბრაუზერი არ უჭერს მხარს გეოლოკაციას");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        onChange({
          ...value,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        setLocating(false);
      },
      () => {
        setLocationError("ლოკაციის მიღება ვერ მოხერხდა, გთხოვთ დაუშვათ წვდომა და სცადოთ ხელახლა");
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 },
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <Input
        label="ლოკაციის სახელი"
        value={value.name}
        onChange={(e) => onChange({ ...value, name: e.target.value })}
        placeholder="მაგ. მთავარი ოფისი, ფილიალი 2"
        required
      />

      <MapPicker
        latitude={value.latitude}
        longitude={value.longitude}
        radiusMeters={Number(value.radiusMeters) || 200}
        onSelect={(lat, lng) => onChange({ ...value, latitude: lat, longitude: lng })}
      />
      <p className="text-xs text-slate-400">
        დააჭირეთ რუკას ლოკაციის ასარჩევად, ან გადაათრიეთ ნიშანი ზუსტად დასაყენებლად
      </p>

      <Button type="button" variant="secondary" loading={locating} onClick={useCurrentLocation}>
        📍 მიმდინარე ლოკაციის გამოყენება
      </Button>

      {value.latitude != null && value.longitude != null && (
        <p className="text-xs text-emerald-600">
          არჩეულია: {value.latitude.toFixed(6)}, {value.longitude.toFixed(6)}
        </p>
      )}
      {locationError && <p className="text-xs text-red-600">{locationError}</p>}

      <Input
        label="დაშვებული რადიუსი (მეტრი)"
        value={value.radiusMeters}
        onChange={(e) => onChange({ ...value, radiusMeters: e.target.value })}
        placeholder="200"
        required
      />
    </div>
  );
}
