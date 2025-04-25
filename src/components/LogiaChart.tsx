import React, { useEffect, useMemo, useCallback } from "react";
import {
  ChartData,
  getPlanetSymbol,
  getZodiacSymbol,
  ZODIAC_SIGNS,
  calculateChart as calculateChartData,
  getElementForSign,
} from "../config/logiaChart";
import { useTheme } from "../utils/ThemeContext";
import strings from "../i18n/logiaChart.json";
import Loading from "../utils/Loading";
import {
  calculateChartDimensions,
  createBaseChart,
  drawChartCircles,
  drawHouseNumbers,
  drawAscendant,
  drawZodiacSymbols,
  drawHouses,
  drawAspects,
  drawPlanets,
} from "./../utils/chartCalculation";

interface LogiaChartProps {
  chartData: ChartData | null;
  chartInfo: string | null;
  isGeneratingChart: boolean;
}

interface PlanetInfoPanelProps {
  selectedPlanet: string;
  chartData: ChartData;
  t: typeof strings.en;
}

export function calculateChart(
  birthDate: string,
  birthTime: string,
  latitude: number,
  longitude: number,
): ChartData {
  return calculateChartData(birthDate, birthTime, latitude, longitude);
}

export function printChartInfo(
  birthDate: string,
  birthTime: string,
  city: string,
): string {
  const chart = calculateChart(birthDate, birthTime, 0, 0); // We need the chart data for the table
  const date = new Date(`${birthDate}T${birthTime}`);
  const formattedDate = date.toLocaleDateString("en-us", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const formattedTime = date.toLocaleTimeString("en-us", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const planetTable = `
    <table class="astrology-table">
      <thead>
        <tr>
          <th>Planet</th>
          <th>Angle</th>
          <th>Sign</th>
          <th>Element</th>
          <th>House</th>
        </tr>
      </thead>
      <tbody>
        ${chart.planets
          .map(
            (planet) => `
        <tr>
          <td>${getPlanetSymbol(planet.name)}</td>
          <td>${(planet.position % 30).toFixed(2)}°</td>
          <td>${getZodiacSymbol(planet.sign)}</td>
          <td>${getElementForSign(planet.sign)}</td>
          <td>${planet.house}</td>
        </tr>
      `,
          )
          .join("")}
      </tbody>
    </table>
  `;

  return `
    <div class="astrology-chart-header">
      <div class="astrology-chart-date">${formattedDate.toLowerCase()}</div>
      <div class="astrology-chart-time">${formattedTime.toLowerCase()}<span class="at-text"> at </span>${city.toLowerCase()}</div>
    </div>
    ${planetTable}
  `;
}

const PlanetInfoPanel: React.FC<PlanetInfoPanelProps> = React.memo(
  ({ selectedPlanet, chartData, t }) => {
    const planet = chartData.planets.find((p) => p.name === selectedPlanet);
    if (!planet) return null;

    return (
      <div className="astrology-info-panel">
        <h3>{t.infoPanel.title}</h3>
        <div className="astrology-planet-info">
          <div>
            <strong>{planet.name}</strong>{" "}
            <span className="planet-symbol">
              {getPlanetSymbol(planet.name)}
            </span>
          </div>
          <div>
            {t.infoPanel.sign}: {planet.sign}{" "}
            <span className="zodiac-symbol" data-sign={planet.sign}>
              {getZodiacSymbol(planet.sign)}
            </span>
          </div>
          <div>
            {t.infoPanel.house}: {planet.house}
          </div>
          <div>
            {t.infoPanel.position}: {planet.position.toFixed(1)}°
          </div>
        </div>
      </div>
    );
  },
);

PlanetInfoPanel.displayName = "PlanetInfoPanel";

export default function LogiaChart({
  chartData,
  chartInfo,
  isGeneratingChart,
}: LogiaChartProps) {
  const { theme } = useTheme();
  const [selectedPlanet, setSelectedPlanet] = React.useState<string | null>(
    null,
  );
  const t = strings.en;

  const drawChart = useCallback(
    (container: HTMLElement) => {
      if (!chartData) return;

      const dimensions = calculateChartDimensions(container);
      const { g } = createBaseChart(container, dimensions);

      drawChartCircles(g, dimensions.radius);
      drawHouseNumbers(g, dimensions.radius, chartData.houses[0]);
      drawAscendant(g, dimensions.radius, chartData.houses[0]);
      drawZodiacSymbols(
        g,
        dimensions.radius,
        ZODIAC_SIGNS.map((sign: string) => getZodiacSymbol(sign)),
      );
      drawHouses(g, dimensions.radius, chartData.houses);
      drawAspects(g, dimensions.radius, chartData);
      drawPlanets(
        g,
        dimensions.radius,
        chartData,
        setSelectedPlanet,
        getPlanetSymbol,
      );

      return g;
    },
    [chartData],
  );

  useEffect(() => {
    const container = document.getElementById("chart");
    if (!container) return;

    const g = drawChart(container);

    return () => {
      if (g) {
        g.remove();
      }
    };
  }, [drawChart, theme]);

  const memoizedPlanetInfo = useMemo(() => {
    if (!selectedPlanet || !chartData) return null;
    return (
      <PlanetInfoPanel
        selectedPlanet={selectedPlanet}
        chartData={chartData}
        t={t}
      />
    );
  }, [selectedPlanet, chartData, t]);

  return (
    <div
      className="astrology-chart-section"
      style={{ position: "relative", zIndex: 0 }}
    >
      <div className="astrology-chart-container" id="chart">
        {isGeneratingChart && <Loading />}
      </div>
      <div className="astrology-info-box">
        <div
          className="astrology-info-text"
          dangerouslySetInnerHTML={{ __html: chartInfo || "" }}
        />
        {memoizedPlanetInfo}
      </div>
    </div>
  );
}
