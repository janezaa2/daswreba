const EARTH_RADIUS_METERS = 6371000;

function toRadians(deg: number) {
  return (deg * Math.PI) / 180;
}

export function haversineDistanceMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS_METERS * c;
}

export function buildGoogleMapsLink(latitude: number, longitude: number) {
  return `https://www.google.com/maps?q=${latitude},${longitude}`;
}

type GeofenceLocation = {
  latitude: number;
  longitude: number;
  radiusMeters: number;
};

// A check-in is within range if it falls inside ANY of the company's locations.
export function isWithinAnyLocation(
  latitude: number,
  longitude: number,
  locations: GeofenceLocation[],
): boolean {
  if (locations.length === 0) return true;
  return locations.some(
    (location) =>
      haversineDistanceMeters(latitude, longitude, location.latitude, location.longitude) <=
      location.radiusMeters,
  );
}

export function distanceToNearestLocation(
  latitude: number,
  longitude: number,
  locations: GeofenceLocation[],
): number | null {
  if (locations.length === 0) return null;
  return Math.min(
    ...locations.map((location) =>
      haversineDistanceMeters(latitude, longitude, location.latitude, location.longitude),
    ),
  );
}
