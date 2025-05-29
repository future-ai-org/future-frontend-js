"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import LogiaChart from "../../../../components/LogiaChart";
import Loading from "../../../../utils/loading";
import { SavedChart } from "../../../../types/logia";

export default function SavedChartPage() {
  const params = useParams();
  const router = useRouter();
  const [savedChart, setSavedChart] = useState<SavedChart | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadSavedChart = () => {
      try {
        const savedCharts = localStorage.getItem("savedCharts");
        if (!savedCharts) {
          router.push("/dashboard");
          return;
        }

        const charts = JSON.parse(savedCharts);
        const chart = charts.find((c: SavedChart) => c.id === params.id);

        if (!chart) {
          router.push("/dashboard");
          return;
        }

        setSavedChart(chart);
      } catch (error) {
        console.error("Error loading saved chart:", error);
        router.push("/dashboard");
      } finally {
        setIsLoading(false);
      }
    };

    loadSavedChart();
  }, [params.id, router]);

  if (isLoading) {
    return (
      <div className="astrology-container saved-view">
        <Loading />
      </div>
    );
  }

  if (!savedChart) {
    return (
      <div className="astrology-container saved-view">
        <div className="astrology-error">Chart not found</div>
      </div>
    );
  }

  return (
    <div className="astrology-container saved-view">
      <LogiaChart
        birthDate={savedChart.birthDate}
        birthTime={savedChart.birthTime}
        city={savedChart.city}
        name={savedChart.name}
        isGeneratingChart={false}
      />
    </div>
  );
}
