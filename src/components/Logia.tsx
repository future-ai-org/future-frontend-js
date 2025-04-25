"use client";

import React, { useState } from "react";
import { calculateChart, ChartData, printChartInfo } from "../config/logia";
import strings from "../i18n/logia.json";
import LogiaForm from "./LogiaForm";
import LogiaChart from "./LogiaChart";
import "../styles/logiachart.css";
import "../styles/logiaform.css";

export default function Logia() {
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [chartInfo, setChartInfo] = useState<string | null>(null);
  const [isGeneratingChart, setIsGeneratingChart] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const t = strings.en;

  const geocodeCity = async (cityName: string) => {
    try {
      setIsGeneratingChart(true);
      setError(null);

      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          cityName,
        )}`,
      );

      if (!response.ok) {
        throw new Error(t.errors.fetchCoordinatesFailed);
      }

      const data = await response.json();

      if (data.length === 0) {
        throw new Error(t.errors.cityNotFound);
      }

      const { lat, lon } = data[0];
      return { lat: parseFloat(lat), lon: parseFloat(lon) };
    } catch (err) {
      setError(err instanceof Error ? err.message : t.errors.unknownError);
      return null;
    } finally {
      setIsGeneratingChart(false);
    }
  };

  const handleSubmit = async (data: {
    birthDate: string;
    birthTime: string;
    city: string;
  }) => {
    const { birthDate, birthTime, city } = data;
    setIsGeneratingChart(true);
    setError(null);

    try {
      const coordinates = await geocodeCity(city);
      if (!coordinates) {
        throw new Error(t.errors.cityNotFound);
      }

      const chart = calculateChart(
        birthDate,
        birthTime,
        coordinates.lat,
        coordinates.lon,
      );
      setChartData(chart);
      setChartInfo(
        printChartInfo(
          birthDate,
          birthTime,
          coordinates.lat,
          coordinates.lon,
          city,
          t,
        ),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : t.errors.unknownError);
    } finally {
      setIsGeneratingChart(false);
    }
  };

  return (
    <div className="astrology-container">
      <div className="astrology-form-section">
        {!chartInfo ? (
          <LogiaForm
            onSubmit={handleSubmit}
            isGeneratingChart={isGeneratingChart}
            error={error}
          />
        ) : (
          <LogiaChart
            chartData={chartData}
            chartInfo={chartInfo}
            isGeneratingChart={isGeneratingChart}
          />
        )}
      </div>
    </div>
  );
}
