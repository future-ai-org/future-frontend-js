import React, { useState, useCallback } from "react";
import strings from "../i18n/logia.json";
import { searchCities, CitySuggestion } from "../utils/geocoding";
import Loading from "../utils/loading";

interface LogiaFormProps {
  onSubmit: (data: {
    birthDate: string;
    birthTime: string;
    city: string;
  }) => void;
  isGeneratingChart: boolean;
  error: string | null;
}

export default function LogiaForm({
  onSubmit,
  isGeneratingChart,
  error,
}: LogiaFormProps) {
  const [birthDate, setBirthDate] = useState("");
  const [birthTime, setBirthTime] = useState("");
  const [city, setCity] = useState("");
  const [citySuggestions, setCitySuggestions] = useState<CitySuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const t = strings.en;

  const handleCityChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setCity(value);
      const suggestions = await searchCities(value);
      setCitySuggestions(suggestions);
      setShowSuggestions(true);
    },
    [],
  );

  const handleCitySelect = (suggestion: CitySuggestion) => {
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
        {isGeneratingChart ? (
          <Loading />
        ) : (
          t.buttons.generateChart
        )}
      </button>
    </form>
  );
}
