"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Circle, useMapEvents, useMap } from "react-leaflet";
import L from "leaflet";

const markerIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const DEFAULT_CENTER: [number, number] = [41.7151, 44.8271]; // თბილისი

type MapPickerProps = {
  latitude: number | null;
  longitude: number | null;
  radiusMeters: number;
  onSelect: (lat: number, lng: number) => void;
};

function ClickHandler({ onSelect }: { onSelect: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onSelect(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

function Recenter({ position }: { position: [number, number] | null }) {
  const map = useMap();
  useEffect(() => {
    if (position) {
      map.setView(position, Math.max(map.getZoom(), 15));
    }
  }, [position, map]);
  return null;
}

export function MapPicker({ latitude, longitude, radiusMeters, onSelect }: MapPickerProps) {
  const position: [number, number] | null =
    latitude != null && longitude != null ? [latitude, longitude] : null;

  return (
    <div className="h-64 w-full overflow-hidden rounded-lg border border-slate-300">
      <MapContainer
        center={position ?? DEFAULT_CENTER}
        zoom={position ? 15 : 11}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ClickHandler onSelect={onSelect} />
        <Recenter position={position} />
        {position && (
          <>
            <Marker
              position={position}
              icon={markerIcon}
              draggable
              eventHandlers={{
                dragend: (event) => {
                  const latLng = event.target.getLatLng();
                  onSelect(latLng.lat, latLng.lng);
                },
              }}
            />
            <Circle
              center={position}
              radius={radiusMeters}
              pathOptions={{ color: "#059669", fillOpacity: 0.1 }}
            />
          </>
        )}
      </MapContainer>
    </div>
  );
}
