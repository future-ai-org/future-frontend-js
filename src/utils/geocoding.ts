import { OPENSTREETMAP_API_URL } from "../config/logiaForm";
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

export const geocodeCity = async (
  cityName: string,
): Promise<Coordinates | null> => {
  try {
    const response = await fetch(
      `${OPENSTREETMAP_API_URL}${encodeURIComponent(cityName)}`,
    );

    if (!response.ok) {
      throw new Error(strings.en.errors.fetchCoordinatesFailed);
    }

    const data = await response.json();

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
    const response = await fetch(
      `${OPENSTREETMAP_API_URL}${encodeURIComponent(query)}&limit=10`,
    );

    if (!response.ok) {
      throw new Error(strings.en.errors.fetchCoordinatesFailed);
    }

    const data = await response.json();
    const seen = new Set();
    return data
      .map(
        (item: {
          name?: string;
          display_name: string;
          lat: string;
          lon: string;
        }) => {
          const cityName = item.name || item.display_name.split(",")[0].trim();
          const parts = item.display_name.split(",");
          const country = parts[parts.length - 1].trim();

          return {
            display_name: `${cityName.toLowerCase()}, ${country.toLowerCase()}`,
            lat: item.lat,
            lon: item.lon,
          };
        },
      )
      .filter((item: { display_name: string }) => {
        const key = item.display_name.toLowerCase();
        if (seen.has(key)) {
          return false;
        }
        seen.add(key);
        return true;
      });
  } catch (err) {
    return [];
  }
};
