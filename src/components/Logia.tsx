"use client";

import React, { useState, useCallback } from "react";
import { calculateChart, ChartData, printChartInfo } from "../config/logia";
import strings from "../i18n/logia.json";
import LogiaForm from "./LogiaForm";
import LogiaChart from "./LogiaChart";
import { geocodeCity } from "../utils/geocoding";
import "../styles/logiachart.css";
import "../styles/logiaform.css";

export default function Logia() {
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [chartInfo, setChartInfo] = useState<string | null>(null);
  const [isGeneratingChart, setIsGeneratingChart] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const t = strings.en;

  const handleSubmit = useCallback(
    async (data: { birthDate: string; birthTime: string; city: string }) => {
      const { birthDate, birthTime, city } = data;
      setIsGeneratingChart(true);
      setError(null);

      try {
        const coordinates = await geocodeCity(city);
        if (!coordinates) {
          return;
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
    },
    [t],
  );

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
