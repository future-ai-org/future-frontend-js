import React, { useEffect, useMemo, useCallback, useState } from "react";
import {
  ChartData,
  getPlanetSymbol,
  getZodiacSymbol,
} from "../config/logiaChart";
import Loading from "../utils/loading";
import "../styles/logiachart.css";
import {
  calculateChartDimensions,
  createBaseChart,
  drawChartCircles,
  drawHouseLines,
  drawHouseNumbers,
} from "../utils/chartDrawing";
import {
  drawZodiacSymbols,
  drawAspects,
  drawPlanets,
  drawAscendant,
  updateOrderedSigns,
  calculateChartData,
} from "../utils/chartFilling";
import { formatCoordinates, formatDate, formatTime } from "../utils/geocoding";
import chartStrings from "../i18n/logiaChart.json";

interface LogiaChartProps {
  birthDate: string;
  birthTime: string;
  city: string;
  isGeneratingChart: boolean;
}

interface PlanetInfoPanelProps {
  selectedPlanet: string;
  chartData: ChartData;
  translations: typeof chartT;
}

const chartT = chartStrings.en;

const useChartDrawing = (
  chartData: ChartData | null,
  onPlanetSelect: (planet: string) => void,
) => {
  const drawChart = useCallback(
    (container: HTMLElement) => {
      if (!chartData) return;

      const dimensions = calculateChartDimensions(container);
      const { g } = createBaseChart(container, dimensions);

      drawChartCircles(g, dimensions.radius);
      drawHouseLines(g, dimensions.radius);
      drawHouseNumbers(g, dimensions.radius);

      updateOrderedSigns(chartData.ascendantSign, chartData);

      drawZodiacSymbols(g, dimensions.radius);
      drawAspects(g, dimensions.radius, chartData);
      drawPlanets(
        g,
        dimensions.radius,
        chartData,
        onPlanetSelect,
        getPlanetSymbol,
      );
      drawAscendant(g, dimensions.radius, chartData);

      return g;
    },
    [chartData, onPlanetSelect],
  );

  return drawChart;
};

const PlanetInfoPanel: React.FC<PlanetInfoPanelProps> = React.memo(
  ({ selectedPlanet, chartData, translations }) => {
    const planet = useMemo(
      () => chartData.planets.find((p) => p.name === selectedPlanet),
      [chartData.planets, selectedPlanet],
    );

    if (!planet) return null;

    return (
      <div className="astrology-info-panel">
        <h3>{translations.title}</h3>
        <div className="astrology-planet-info">
          <div>
            <strong>{planet.name}</strong>{" "}
            <span className="planet-symbol">
              {getPlanetSymbol(planet.name)}
            </span>
          </div>
          <div>
            {translations.table.sign}: {planet.sign}{" "}
            <span className="zodiac-symbol" data-sign={planet.sign}>
              {getZodiacSymbol(planet.sign)}
            </span>
          </div>
          <div>
            {translations.table.house}: {planet.house}
          </div>
          <div>
            {translations.table.position}: {planet.position?.toFixed(2) || "-"}°
          </div>
        </div>
      </div>
    );
  },
);

PlanetInfoPanel.displayName = "PlanetInfoPanel";

export default function LogiaChart({
  birthDate,
  birthTime,
  city,
  isGeneratingChart,
}: LogiaChartProps) {
  const [selectedPlanet, setSelectedPlanet] = useState<string | null>(null);
  const [chartInfoHtml, setChartInfoHtml] = useState<string>("");
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handlePlanetSelect = useCallback((planet: string) => {
    setSelectedPlanet(planet);
  }, []);

  const drawChart = useChartDrawing(chartData, handlePlanetSelect);
  const fetchChartData = useCallback(async () => {
    if (!birthDate || !birthTime || !city) return;

    setIsLoading(true);
    setError(null);
    try {
      const { chartData, chartInfoHtml } = await calculateChartData(
        birthDate,
        birthTime,
        city,
        chartT,
      );
      setChartData(chartData);
      setChartInfoHtml(chartInfoHtml);
    } catch (err) {
      setError(err instanceof Error ? err.message : chartT.errors.unknownError);
    } finally {
      setIsLoading(false);
    }
  }, [birthDate, birthTime, city]);

  useEffect(() => {
    fetchChartData();
  }, [fetchChartData]);

  useEffect(() => {
    const container = document.getElementById("chart");
    if (!container) return;

    const g = drawChart(container);

    return () => {
      if (g) {
        g.remove();
      }
    };
  }, [drawChart]);

  const memoizedPlanetInfo = useMemo(() => {
    if (!selectedPlanet || !chartData) return null;
    return (
      <PlanetInfoPanel
        selectedPlanet={selectedPlanet}
        chartData={chartData}
        translations={chartT}
      />
    );
  }, [selectedPlanet, chartData]);

  const subtitleContent = useMemo(() => {
    if (!chartData) return null;
    return chartT.subtitle
      .replace("{birthDate}", formatDate(chartData.birthDate))
      .replace("{birthTime}", formatTime(chartData.birthTime))
      .replace("{city}", chartData.city.toLowerCase())
      .replace(
        "{latitude}",
        formatCoordinates(chartData.latitude, chartData.longitude),
      );
  }, [chartData]);

  if (error) {
    return <div className="astrology-error-message">{error}</div>;
  }

  if (isLoading || isGeneratingChart) {
    return <Loading />;
  }

  return (
    <>
      <h1 className="astrology-title">{chartT.title.toLowerCase()}</h1>
      {subtitleContent && (
        <div className="astrology-subtitle">{subtitleContent}</div>
      )}
      <div className="astrology-chart-section">
        <div className="astrology-chart-container" id="chart">
          {isLoading && <Loading />}
        </div>
        <div className="astrology-info-box">
          <div
            className="astrology-info-text"
            dangerouslySetInnerHTML={{ __html: chartInfoHtml }}
          />
          {memoizedPlanetInfo}
        </div>
      </div>
    </>
  );
}
