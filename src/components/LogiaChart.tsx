import React, { useEffect, useMemo, useCallback } from "react";
import {
  ChartData,
  getPlanetSymbol,
  getZodiacSymbol,
  ZODIAC_SYMBOLS,
  calculateChart as calculateChartData,
} from "../config/logiaChart";
import { useTheme } from "../utils/themeContext";
import strings from "../i18n/logiaChart.json";
import Loading from "../utils/loading";
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

interface PlanetResponse {
  sign: string;
  degrees: number;
}

interface ApiResponse {
  [key: string]: PlanetResponse;
}

export function calculateChart(
  birthDate: string,
  birthTime: string,
  latitude: number,
  longitude: number,
): ChartData {
  return calculateChartData(birthDate, birthTime, latitude, longitude);
}

export async function printChartInfo(
  birthDate: string,
  birthTime: string,
  city: string,
  latitude: number,
  longitude: number,
): Promise<string> {
  try {
    const response = await fetch('https://lilit-service-astro.vercel.app/planets', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'API_KEY': 'LgSnP9YWajfllFjXrtk9LZ3lgc2OwKCbckrvT6cGG8sUwgPk5G'
      },
      body: JSON.stringify({
        date_time: `${birthDate}T${birthTime}`,
        latitude: latitude,
        longitude: longitude
      })
    });

    const data: ApiResponse = await response.json();
    console.log('API Response:', data);

    // Convert the object into an array of planets
    const planets = Object.entries(data).map(([planet, info]: [string, PlanetResponse]) => ({
      planet,
      sign: info.sign,
      longitude: info.degrees
    }));

    return `
      <table class="astrology-table">
        <thead>
          <tr>
            <th>Planet</th>
            <th>Angle</th>
            <th>Sign</th>
          </tr>
        </thead>
        <tbody>
          ${planets.map(planet => `
            <tr>
              <td>${planet.planet}</td>
              <td>${planet.longitude.toFixed(2)}°</td>
              <td>${planet.sign}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  } catch (error: any) {
    console.error('Error:', error);
    return `<div>Error: ${error.message}</div>`;
  }
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
  const [selectedPlanet, setSelectedPlanet] = React.useState<string | null>(null);
  const [chartInfoHtml, setChartInfoHtml] = React.useState<string>("");
  const t = strings.en;

  useEffect(() => {
    if (chartInfo) {
      setChartInfoHtml(chartInfo);
    }
  }, [chartInfo]);

  const drawChart = useCallback(
    (container: HTMLElement) => {
      if (!chartData) return;

      const dimensions = calculateChartDimensions(container);
      const { g } = createBaseChart(container, dimensions);

      drawChartCircles(g, dimensions.radius);
      drawHouseNumbers(g, dimensions.radius, chartData.houses[0]);
      drawAscendant(g, dimensions.radius, chartData.houses[0]);
      drawZodiacSymbols(g, dimensions.radius, [
        ZODIAC_SYMBOLS.pisces,
        ZODIAC_SYMBOLS.aquarius,
        ZODIAC_SYMBOLS.capricorn,
        ZODIAC_SYMBOLS.sagittarius,
        ZODIAC_SYMBOLS.scorpio,
        ZODIAC_SYMBOLS.libra,
        ZODIAC_SYMBOLS.virgo,
        ZODIAC_SYMBOLS.leo,
        ZODIAC_SYMBOLS.cancer,
        ZODIAC_SYMBOLS.gemini,
        ZODIAC_SYMBOLS.taurus,
        ZODIAC_SYMBOLS.aries,
      ]);
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
          dangerouslySetInnerHTML={{ __html: chartInfoHtml }}
        />
        {memoizedPlanetInfo}
      </div>
    </div>
  );
}
