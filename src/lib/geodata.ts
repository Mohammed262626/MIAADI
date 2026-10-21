/* City reference points for proximity filtering.
   Only cities that actually have doctors are listed. Visitor coordinates are
   mapped to the nearest of these with the haversine formula, so detection never
   needs a third-party geocoding request (and never invents a city). */

export type CityPoint = { name: string; lat: number; lng: number };
export type NearestCity = { city: string; km: number };

export const CITIES: CityPoint[] = [
  { name: "الخرطوم", lat: 15.5007, lng: 32.5599 },
  { name: "أم درمان", lat: 15.6445, lng: 32.4777 },
  { name: "الخرطوم بحري", lat: 15.6355, lng: 32.5822 },
  { name: "بورتسودان", lat: 19.6158, lng: 37.2164 },
  { name: "ود مداني", lat: 14.401, lng: 33.519 },
  { name: "نيالا", lat: 12.0489, lng: 24.8807 },
  { name: "الفاشر", lat: 13.6276, lng: 25.3494 },
  { name: "كسلا", lat: 15.45, lng: 36.4 },
  { name: "عطبرة", lat: 17.7014, lng: 33.9811 },
  { name: "الأبيض", lat: 13.1846, lng: 32.5324 },
  { name: "سنار", lat: 13.55, lng: 33.6 },
  { name: "دنقلا", lat: 19.1667, lng: 32.4833 },
];

const CITY_STORAGE_KEY = "miaadi.city";
const DETECT_TIMEOUT_MS = 8000;

/** The city the visitor chose/detected earlier, or null. Never a guess. */
export function storedCity(): string | null {
  try {
    const saved = localStorage.getItem(CITY_STORAGE_KEY);
    return saved && CITIES.some((c) => c.name === saved) ? saved : null;
  } catch {
    return null;
  }
}

export function rememberCity(city: string) {
  try {
    localStorage.setItem(CITY_STORAGE_KEY, city);
  } catch {
    /* storage can be blocked (private mode); detection still works this session */
  }
}

/** "كل السودان" until a city is actually known. */
export function locationLabel(city: string | null = storedCity()): string {
  return city ? `السودان · ${city}` : "كل السودان";
}

export function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function nearestCity(lat: number, lng: number): NearestCity {
  let best = CITIES[0];
  let bestKm = Number.POSITIVE_INFINITY;
  for (const city of CITIES) {
    const km = haversineKm(lat, lng, city.lat, city.lng);
    if (km < bestKm) {
      bestKm = km;
      best = city;
    }
  }
  return { city: best.name, km: bestKm };
}

/** Browser geolocation, wrapped in a promise with a bounded wait. */
export function getCurrentPosition(timeoutMs = DETECT_TIMEOUT_MS): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (!("geolocation" in navigator)) {
      reject(new Error("unsupported"));
      return;
    }
    navigator.geolocation.getCurrentPosition(resolve, () => reject(new Error("unavailable")), {
      enableHighAccuracy: false,
      timeout: timeoutMs,
      maximumAge: 300000,
    });
  });
}

export async function detectNearestCity(timeoutMs = DETECT_TIMEOUT_MS): Promise<NearestCity> {
  const pos = await getCurrentPosition(timeoutMs);
  return nearestCity(pos.coords.latitude, pos.coords.longitude);
}
