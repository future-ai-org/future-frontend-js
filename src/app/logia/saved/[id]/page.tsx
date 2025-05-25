"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import LogiaChart from "../../../../components/LogiaChart";
import { ChartData } from "../../../../config/logiaChart";
import Loading from "../../../../utils/loading";
import "../../../../styles/logia.css";
import { useTranslation } from "react-i18next";

interface SavedChart {
  id: string;
  birthDate: string;
  birthTime: string;
  city: string;
  chartData: ChartData;
  savedAt: string;
}

export default function SavedChartPage() {
  const params = useParams();
  const { t } = useTranslation("logia");
  const [savedChart, setSavedChart] = useState<SavedChart | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadSavedChart = () => {
      try {
        const savedCharts = JSON.parse(
          localStorage.getItem("savedCharts") || "[]",
        );
        const chart = savedCharts.find((c: SavedChart) => c.id === params.id);

        if (chart) {
          setSavedChart(chart);
        } else {
          setError(t("errors.chartNotFound"));
        }
      } catch {
        setError(t("errors.failedToLoadChart"));
      } finally {
        setIsLoading(false);
      }
    };

    loadSavedChart();
  }, [params.id, t]);

  if (isLoading) {
    return (
      <div className="astrology-container">
        <div className="astrology-form-section">
          <Loading />
        </div>
      </div>
    );
  }

  if (error || !savedChart) {
    return (
      <div className="astrology-container">
        <div className="astrology-form-section">
          <div className="astrology-error-message">
            {error || t("errors.chartNotFound")}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="astrology-container">
      <div className="astrology-form-section">
        <LogiaChart
          birthDate={savedChart.birthDate}
          birthTime={savedChart.birthTime}
          city={savedChart.city}
          isGeneratingChart={false}
        />
      </div>
    </div>
  );
}
