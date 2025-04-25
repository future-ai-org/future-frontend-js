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
