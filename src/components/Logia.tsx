"use client";

import React, { useState, useCallback, useRef } from "react";
import { ChartData } from "../config/logiaChart";
import strings from "../i18n/logia.json";
import LogiaChart, { calculateChart, printChartInfo } from "./LogiaChart";
import { geocodeCity, searchCities, CitySuggestion } from "../utils/geocoding";
import Loading from "../utils/loading";
import "../styles/logiachart.css";
import "../styles/logia.css";

const t = strings.en;

interface FormData {
  birthDate: string;
  birthTime: string;
  city: string;
}

interface LogiaFormProps {
  onSubmit: (data: FormData) => void;
  isGeneratingChart: boolean;
  error: string | null;
}

export default function Logia() {
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [chartInfo, setChartInfo] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = useCallback(async (data: FormData) => {
    const { birthDate, birthTime, city } = data;
    setIsLoading(true);
    setError(null);

    try {
      const coordinates = await geocodeCity(city);
      if (!coordinates) {
        setError(t.errors.cityNotFound);
        return;
      }

      const chart = calculateChart(
        birthDate,
        birthTime,
        coordinates.lat,
        coordinates.lon,
      );
      setChartData(chart);
      const chartInfoHtml = await printChartInfo(
        birthDate,
        birthTime,
        city,
        coordinates.lat,
        coordinates.lon,
      );
      setChartInfo(chartInfoHtml);
    } catch (err) {
      setError(err instanceof Error ? err.message : t.errors.unknownError);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const renderContent = () => {
    if (isLoading) {
      return <Loading />;
    }

    if (!chartInfo) {
      return (
        <>
          <h1 className="page-title">{t.title.toLowerCase()}</h1>
          <div className="logia-container">
            <LogiaForm
              onSubmit={handleSubmit}
              isGeneratingChart={isLoading}
              error={error}
            />
          </div>
        </>
      );
    }

    return (
      <LogiaChart
        chartData={chartData}
        chartInfo={chartInfo}
        isGeneratingChart={isLoading}
      />
    );
  };

  return (
    <div className="astrology-container">
      <div className="astrology-form-section">{renderContent()}</div>
    </div>
  );
}

function LogiaForm({ onSubmit, isGeneratingChart, error }: LogiaFormProps) {
  const [formData, setFormData] = useState<FormData>({
    birthDate: "",
    birthTime: "",
    city: "",
  });
  const [timePeriod, setTimePeriod] = useState<"AM" | "PM">("AM");
  const [citySuggestions, setCitySuggestions] = useState<CitySuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const blurTimeoutRef = useRef<NodeJS.Timeout>();
  const searchTimeoutRef = useRef<NodeJS.Timeout>();

  const handleCityChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setFormData((prev) => ({ ...prev, city: value }));

      // Clear any existing timeout
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }

      // Set a new timeout to debounce the search
      searchTimeoutRef.current = setTimeout(async () => {
        if (value.trim()) {
          const suggestions = await searchCities(value);
          setCitySuggestions(suggestions);
          setShowSuggestions(true);
        } else {
          setCitySuggestions([]);
          setShowSuggestions(false);
        }
      }, 300); // Wait 300ms after the user stops typing
    },
    [],
  );

  const handleCitySelect = useCallback((suggestion: CitySuggestion) => {
    setFormData((prev) => ({ ...prev, city: suggestion.display_name }));
    setCitySuggestions([]);
    setShowSuggestions(false);
  }, []);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!formData.birthDate || !formData.birthTime || !formData.city) return;

      // Convert 12-hour format to 24-hour format
      const [hour, minute] = formData.birthTime.split(":");
      let hour24 = parseInt(hour, 10);
      if (timePeriod === "PM" && hour24 < 12) hour24 += 12;
      if (timePeriod === "AM" && hour24 === 12) hour24 = 0;

      const time24 = `${hour24}:${minute}`;
      onSubmit({ ...formData, birthTime: time24 });
    },
    [formData, timePeriod, onSubmit],
  );

  const handleBlur = useCallback(() => {
    if (blurTimeoutRef.current) {
      clearTimeout(blurTimeoutRef.current);
    }
    blurTimeoutRef.current = setTimeout(() => setShowSuggestions(false), 200);
  }, []);

  return (
    <form className="astrology-form" onSubmit={handleSubmit}>
      <div className="astrology-form-group">
        <label className="astrology-label">{t.labels.birthDate}</label>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <input
            className="astrology-input"
            type="text"
            name="birthYear"
            value={formData.birthDate.split("-")[0] || ""}
            onChange={(e) => {
              const year = e.target.value;
              const [, month, day] = formData.birthDate.split("-");
              setFormData((prev) => ({
                ...prev,
                birthDate: `${year}-${month || ""}-${day || ""}`,
              }));
            }}
            placeholder="YYYY"
            maxLength={4}
            style={{ width: "80px" }}
            required
          />
          <input
            className="astrology-input"
            type="text"
            name="birthMonth"
            value={formData.birthDate.split("-")[1] || ""}
            onChange={(e) => {
              const month = e.target.value;
              const [year, , day] = formData.birthDate.split("-");
              setFormData((prev) => ({
                ...prev,
                birthDate: `${year || ""}-${month}-${day || ""}`,
              }));
            }}
            placeholder="MM"
            maxLength={2}
            style={{ width: "60px" }}
            required
          />
          <input
            className="astrology-input"
            type="text"
            name="birthDay"
            value={formData.birthDate.split("-")[2] || ""}
            onChange={(e) => {
              const day = e.target.value;
              const [year, month] = formData.birthDate.split("-");
              setFormData((prev) => ({
                ...prev,
                birthDate: `${year || ""}-${month || ""}-${day}`,
              }));
            }}
            placeholder="DD"
            maxLength={2}
            style={{ width: "60px" }}
            required
          />
        </div>
      </div>
      <div className="astrology-form-group">
        <label className="astrology-label">{t.labels.birthTime}</label>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <input
            className="astrology-input"
            type="text"
            name="birthHour"
            value={formData.birthTime.split(":")[0] || ""}
            onChange={(e) => {
              let hour = e.target.value.replace(/\D/g, "");
              if (hour) {
                const numHour = parseInt(hour, 10);
                if (numHour > 12) hour = "12";
                if (numHour < 1) hour = "1";
              }
              const [, minute] = formData.birthTime.split(":");
              setFormData((prev) => ({
                ...prev,
                birthTime: `${hour}:${minute || ""}`,
              }));
            }}
            placeholder="HH"
            maxLength={2}
            style={{ width: "60px" }}
            required
          />
          <input
            className="astrology-input"
            type="text"
            name="birthMinute"
            value={formData.birthTime.split(":")[1] || ""}
            onChange={(e) => {
              let minute = e.target.value.replace(/\D/g, "");
              if (minute) {
                const numMinute = parseInt(minute, 10);
                if (numMinute > 59) minute = "59";
                if (numMinute < 0) minute = "0";
              }
              const [hour] = formData.birthTime.split(":");
              setFormData((prev) => ({
                ...prev,
                birthTime: `${hour || ""}:${minute}`,
              }));
            }}
            placeholder="MM"
            maxLength={2}
            style={{ width: "60px" }}
            required
          />
          <select
            className="astrology-time-period-select"
            value={timePeriod}
            onChange={(e) => setTimePeriod(e.target.value as "AM" | "PM")}
          >
            <option value="AM">AM</option>
            <option value="PM">PM</option>
          </select>
        </div>
      </div>
      <div className="astrology-form-group">
        <label className="astrology-label">{t.labels.birthCity}</label>
        <div className="astrology-city-input-container">
          <input
            className="astrology-input astrology-city-input"
            type="text"
            value={formData.city}
            onChange={handleCityChange}
            onBlur={handleBlur}
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
