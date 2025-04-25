import React, { useState, useCallback } from "react";
import strings from "../i18n/logia.json";
import { searchCities, CitySuggestion } from "../utils/Geocoding";
import Loading from "../utils/Loading";

const t = strings.en;

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
  const [formData, setFormData] = useState({
    birthDate: "",
    birthTime: "",
    city: "",
  });
  const [citySuggestions, setCitySuggestions] = useState<CitySuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const handleCityChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setFormData((prev) => ({ ...prev, city: value }));
      const suggestions = await searchCities(value);
      setCitySuggestions(suggestions);
      setShowSuggestions(true);
    },
    [],
  );

  const handleCitySelect = (suggestion: CitySuggestion) => {
    setFormData((prev) => ({ ...prev, city: suggestion.display_name }));
    setCitySuggestions([]);
    setShowSuggestions(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.birthDate || !formData.birthTime || !formData.city) return;
    onSubmit(formData);
  };

  return (
    <form className="astrology-form" onSubmit={handleSubmit}>
      <div className="astrology-form-group">
        <label className="astrology-label">{t.labels.birthDate}</label>
        <input
          className="astrology-input"
          type="date"
          name="birthDate"
          value={formData.birthDate}
          onChange={handleInputChange}
          required
        />
      </div>
      <div className="astrology-form-group">
        <label className="astrology-label">{t.labels.birthTime}</label>
        <input
          className="astrology-input"
          type="time"
          name="birthTime"
          value={formData.birthTime}
          onChange={handleInputChange}
          required
        />
      </div>
      <div className="astrology-form-group">
        <label className="astrology-label">{t.labels.birthCity}</label>
        <div className="astrology-city-input-container">
          <input
            className="astrology-input astrology-city-input"
            type="text"
            value={formData.city}
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
        {isGeneratingChart ? <Loading /> : t.buttons.generateChart}
      </button>
    </form>
  );
}
