import {
  OPENSTREETMAP_API_URL,
  MAX_CACHE_SIZE,
  MONTH_NAMES,
  ORDINAL_SUFFIXES,
} from "../config/geocoding";
import strings from "../i18n/logia.json";

export interface CitySuggestion {
  display_name: string;
  lat: string;
  lon: string;
}

interface OpenStreetMapResponse {
  name?: string;
  display_name: string;
  lat: string;
  lon: string;
}

const formatCache = new Map<string, string>();
const coordinateCache = new Map<string, string>();

const pendingRequests = new Map<string, Promise<OpenStreetMapResponse[]>>();

const fetchOpenStreetMapData = async (
  query: string,
  limit?: number,
): Promise<OpenStreetMapResponse[]> => {
  const cacheKey = `${query}:${limit || "default"}`;

  if (pendingRequests.has(cacheKey)) {
    return pendingRequests.get(cacheKey)!;
  }

  const requestPromise = (async () => {
    try {
      const url = `${OPENSTREETMAP_API_URL}${encodeURIComponent(query)}${limit ? `&limit=${limit}` : ""}`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(strings.en.errors.fetchCoordinatesFailed);
      }

      return response.json();
    } finally {
      pendingRequests.delete(cacheKey);
    }
  })();

  pendingRequests.set(cacheKey, requestPromise);
  return requestPromise;
};

const processCityName = (item: OpenStreetMapResponse): string => {
  if (item.name) {
    const parts = item.display_name.split(",");
    const country = parts[parts.length - 1]?.trim() || "";
    return `${item.name.toLowerCase()}, ${country.toLowerCase()}`;
  }

  const parts = item.display_name.split(",");
  const cityName = parts[0]?.trim() || "";
  const country = parts[parts.length - 1]?.trim() || "";
  return `${cityName.toLowerCase()}, ${country.toLowerCase()}`;
};

export const geocodeCity = async (
  cityName: string,
): Promise<{ lat: number; lon: number } | null> => {
  try {
    const data = await fetchOpenStreetMapData(cityName);

    if (data.length === 0) {
      throw new Error(strings.en.errors.cityNotFound);
    }

    const { lat, lon } = data[0];
    return { lat: parseFloat(lat), lon: parseFloat(lon) };
  } catch (err) {
    throw err instanceof Error
      ? err
      : new Error(strings.en.errors.unknownError);
  }
};

export const searchCities = async (
  query: string,
): Promise<CitySuggestion[]> => {
  if (query.length < 2) {
    return [];
  }

  try {
    const data = await fetchOpenStreetMapData(query, 10);
    const seen = new Set<string>();

    return data
      .map((item) => ({
        display_name: processCityName(item),
        lat: item.lat,
        lon: item.lon,
      }))
      .filter((item) => {
        const key = item.display_name.toLowerCase();
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
  } catch {
    return [];
  }
};

export function formatCoordinates(lat: number, lon: number): string {
  const cacheKey = `${lat},${lon}`;
  if (coordinateCache.has(cacheKey)) {
    return coordinateCache.get(cacheKey)!;
  }

  const formatCoordinate = (coord: number, isLatitude: boolean): string => {
    const absolute = Math.abs(coord);
    const degrees = Math.floor(absolute);
    const minutes = Math.round((absolute - degrees) * 60);
    const direction = isLatitude
      ? coord >= 0
        ? "N"
        : "S"
      : coord >= 0
        ? "E"
        : "W";
    return `${degrees}°${minutes}'${direction}`;
  };

  const result = `(${formatCoordinate(lat, true)}, ${formatCoordinate(lon, false)})`;
  coordinateCache.set(cacheKey, result);
  limitCacheSize(coordinateCache);
  return result;
}

export function formatDate(dateStr: string): string {
  if (formatCache.has(`date:${dateStr}`)) {
    return formatCache.get(`date:${dateStr}`)!;
  }

  const [year, month, day] = dateStr.split("-").map((num) => parseInt(num, 10));

  const getOrdinalSuffix = (n: number): string => {
    const j = n % 10;
    const k = n % 100;
    if (j === 1 && k !== 11) return ORDINAL_SUFFIXES[1];
    if (j === 2 && k !== 12) return ORDINAL_SUFFIXES[2];
    if (j === 3 && k !== 13) return ORDINAL_SUFFIXES[3];
    return ORDINAL_SUFFIXES[0];
  };

  const result = `${MONTH_NAMES[month - 1]}, ${day}${getOrdinalSuffix(day)}, ${year}`;
  formatCache.set(`date:${dateStr}`, result);
  limitCacheSize(formatCache);
  return result;
}

export function formatTime(timeStr: string): string {
  if (formatCache.has(`time:${timeStr}`)) {
    return formatCache.get(`time:${timeStr}`)!;
  }

  const [hours, minutes] = timeStr.split(":").map((num) => parseInt(num, 10));
  const period = hours >= 12 ? "pm" : "am";
  const displayHours = hours % 12 || 12;
  const result = `${displayHours}:${minutes.toString().padStart(2, "0")} ${period}`;
  formatCache.set(`time:${timeStr}`, result);
  limitCacheSize(formatCache);
  return result;
}

function limitCacheSize(cache: Map<string, string>): void {
  if (cache.size > MAX_CACHE_SIZE) {
    const entries = Array.from(cache.entries());
    const toDelete = entries.slice(0, Math.floor(MAX_CACHE_SIZE / 2));
    toDelete.forEach(([key]) => cache.delete(key));
  }
}

export function clearFormatCache(): void {
  formatCache.clear();
  coordinateCache.clear();
  pendingRequests.clear();
}
