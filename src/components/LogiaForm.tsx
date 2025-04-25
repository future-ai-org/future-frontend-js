import React, { useState, useCallback } from "react";
import { OPENSTREETMAP_API_URL } from "../config/logia";
import strings from "../i18n/logia.json";

interface LogiaFormProps {
  onSubmit: (data: { birthDate: string; birthTime: string; city: string }) => void;
  isGeneratingChart: boolean;
  error: string | null;
}

export default function LogiaForm({ onSubmit, isGeneratingChart, error }: LogiaFormProps) {
  const [birthDate, setBirthDate] = useState("");
  const [birthTime, setBirthTime] = useState("");
  const [city, setCity] = useState("");
  const [citySuggestions, setCitySuggestions] = useState<
    Array<{ display_name: string; lat: string; lon: string }>
  >([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const t = strings.en;

  const searchCities = useCallback(
    async (query: string) => {
      if (query.length < 2) {
        setCitySuggestions([]);
        return;
      }

      try {
        const response = await fetch(
          `${OPENSTREETMAP_API_URL}${encodeURIComponent(query)}&limit=10`,
        );

        if (!response.ok) {
          throw new Error(t.errors.fetchCoordinatesFailed);
        }

        const data = await response.json();
        const seen = new Set();
        const formattedData = data
          .map(
            (item: {
              name?: string;
              display_name: string;
              lat: string;
              lon: string;
            }) => {
              const cityName =
                item.name || item.display_name.split(",")[0].trim();
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
        setCitySuggestions(formattedData);
      } catch (err) {
        setCitySuggestions([]);
      }
    },
    [t.errors.fetchCoordinatesFailed],
  );

  const handleCityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCity(value);
    searchCities(value);
    setShowSuggestions(true);
  };

  const handleCitySelect = (suggestion: {
    display_name: string;
    lat: string;
    lon: string;
  }) => {
    setCity(suggestion.display_name);
    setCitySuggestions([]);
    setShowSuggestions(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!birthDate || !birthTime || !city) return;
    onSubmit({ birthDate, birthTime, city });
  };

  return (
    <form className="astrology-form" onSubmit={handleSubmit}>
      <div className="astrology-form-group">
        <label className="astrology-label">{t.labels.birthDate}</label>
        <input
          className="astrology-input"
          type="date"
          value={birthDate}
          onChange={(e) => setBirthDate(e.target.value)}
          required
        />
      </div>
      <div className="astrology-form-group">
        <label className="astrology-label">{t.labels.birthTime}</label>
        <input
          className="astrology-input"
          type="time"
          value={birthTime}
          onChange={(e) => setBirthTime(e.target.value)}
          required
        />
      </div>
      <div className="astrology-form-group">
        <label className="astrology-label">{t.labels.birthCity}</label>
        <div className="astrology-city-input-container">
          <input
            className="astrology-input astrology-city-input"
            type="text"
            value={city}
            onChange={handleCityChange}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            placeholder={t.labels.cityPlaceholder}
            required
          />
          {showSuggestions && citySuggestions.length > 0 && (
            <ul className="astrology-city-suggestions">
              {citySuggestions.map((suggestion, index) => (
                <li
                  key={index}
                  onClick={() => handleCitySelect(suggestion)}
                  className="astrology-city-suggestion"
                >
                  {suggestion.display_name}
                </li>
              ))}
            </ul>
          )}
        </div>
        {error && <div className="astrology-error-message">{error}</div>}
      </div>
      <button
        className="astrology-button"
        type="submit"
        disabled={isGeneratingChart}
      >
        {isGeneratingChart
          ? t.loading.generatingChart
          : t.buttons.generateChart}
      </button>
    </form>
  );
} 