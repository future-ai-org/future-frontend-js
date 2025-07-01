"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import LogiaChart, { SavedChart } from "../../../../components/LogiaChart";
import Loading from "../../../../utils/loading";
import { useTranslation } from "react-i18next";

export default function SavedChartPage() {
  const params = useParams();
  const { t } = useTranslation("logia");
  const [savedChart, setSavedChart] = useState<SavedChart | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadSavedChart = useCallback(() => {
    if (!params.id) {
      setError(t("errors.chartNotFound"));
      setIsLoading(false);
      return;
    }

    try {
      const savedCharts = localStorage.getItem("savedCharts");
      if (!savedCharts) {
        setError(t("errors.noSavedCharts"));
        setIsLoading(false);
        return;
      }

      const charts = JSON.parse(savedCharts);
      const chart = charts.find((c: SavedChart) => c.id === params.id);

      if (!chart) {
        setError(t("errors.chartNotFound"));
        setIsLoading(false);
        return;
      }

      setSavedChart(chart);
    } catch {
      setError(t("errors.loadingError"));
    } finally {
      setIsLoading(false);
    }
  }, [params.id, t]);

  useEffect(() => {
    loadSavedChart();
  }, [loadSavedChart]);

  if (isLoading) {
    return (
      <div className="astrology-container saved-view">
        <div className="astrology-content-wrapper">
          <Loading />
        </div>
      </div>
    );
  }

  if (error || !savedChart) {
    return (
      <div className="astrology-container saved-view">
        <div className="astrology-content-wrapper">
          <div className="astrology-error">
            {error || t("errors.chartNotFound")}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="astrology-container saved-view">
      <div className="astrology-content-wrapper">
        <LogiaChart
          birthDate={savedChart.birthDate}
          birthTime={savedChart.birthTime}
          city={savedChart.city}
          name={savedChart.name}
          isGeneratingChart={false}
        />
      </div>
    </div>
  );
}
