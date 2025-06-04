"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useParams } from "next/navigation";
import LogiaChart from "../../../../components/LogiaChart";
import Loading from "../../../../utils/loading";
import { SavedChart } from "../../../../components/LogiaChart";
import { useTranslation } from "react-i18next";

export default function SavedChartPage() {
  const params = useParams();
  const { t } = useTranslation("logia");
  const [savedChart, setSavedChart] = useState<SavedChart | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadSavedChart = useCallback(() => {
    try {
      const savedCharts = localStorage.getItem("savedCharts");
      if (!savedCharts) {
        setError(t("errors.noSavedCharts"));
        return;
      }

      const charts = JSON.parse(savedCharts);
      const chart = charts.find((c: SavedChart) => c.id === params.id);

      if (!chart) {
        setError(t("errors.chartNotFound"));
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

  const chartContent = useMemo(() => {
    if (isLoading) {
      return <Loading />;
    }

    if (error || !savedChart) {
      return (
        <div className="astrology-error">
          {error || t("errors.chartNotFound")}
        </div>
      );
    }

    return (
      <LogiaChart
        birthDate={savedChart.birthDate}
        birthTime={savedChart.birthTime}
        city={savedChart.city}
        name={savedChart.name}
        isGeneratingChart={false}
      />
    );
  }, [isLoading, error, savedChart, t]);

  return (
    <div className="astrology-container saved-view">
      <div className="astrology-content-wrapper">{chartContent}</div>
    </div>
  );
}
