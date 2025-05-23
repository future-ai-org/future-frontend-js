import { OPENSTREETMAP_API_URL } from "../config/api";
import strings from "../i18n/logia.json";

export interface Coordinates {
  lat: number;
  lon: number;
}

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

const fetchOpenStreetMapData = async (
  query: string,
  limit?: number,
): Promise<OpenStreetMapResponse[]> => {
  const url = `${OPENSTREETMAP_API_URL}${encodeURIComponent(query)}${limit ? `&limit=${limit}` : ""}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(strings.en.errors.fetchCoordinatesFailed);
  }

  return response.json();
};

const processCityName = (item: OpenStreetMapResponse): string => {
  const cityName = item.name || item.display_name.split(",")[0].trim();
  const country = item.display_name.split(",").pop()?.trim() || "";
  return `${cityName.toLowerCase()}, ${country.toLowerCase()}`;
};

export const geocodeCity = async (
  cityName: string,
): Promise<Coordinates | null> => {
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

  return `(${formatCoordinate(lat, true)}, ${formatCoordinate(lon, false)})`;
}

export function formatDate(dateStr: string): string {
  const [year, month, day] = dateStr.split("-").map((num) => parseInt(num, 10));
  const monthNames = [
    "january",
    "february",
    "march",
    "april",
    "may",
    "june",
    "july",
    "august",
    "september",
    "october",
    "november",
    "december",
  ];

  const getOrdinalSuffix = (n: number): string => {
    const j = n % 10;
    const k = n % 100;
    if (j === 1 && k !== 11) return "st";
    if (j === 2 && k !== 12) return "nd";
    if (j === 3 && k !== 13) return "rd";
    return "th";
  };

  return `${monthNames[month - 1]}, ${day}${getOrdinalSuffix(day)}, ${year}`;
}

export function formatTime(timeStr: string): string {
  const [hours, minutes] = timeStr.split(":").map((num) => parseInt(num, 10));
  const period = hours >= 12 ? "pm" : "am";
  const displayHours = hours % 12 || 12; // Convert 0 to 12 for 12 AM
  return `${displayHours}:${minutes.toString().padStart(2, "0")} ${period}`;
}
