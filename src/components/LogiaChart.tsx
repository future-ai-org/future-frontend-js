import React, { useEffect, useMemo, useCallback } from "react";
import {
  ChartData,
  getPlanetSymbol,
  getZodiacSymbol,
  ZODIAC_SYMBOLS,
  calculateChart as calculateChartData,
  getElementForSign,
} from "../config/logiaChart";
import { useTheme } from "../utils/themeContext";
import chartStrings from "../i18n/logiaChart.json";
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
  translations: typeof chartT;
}

interface PlanetResponse {
  sign: string;
  degrees: number;
  house?: number;
  position?: number;
  element?: string;
}

interface ApiResponse {
  [key: string]: PlanetResponse;
}

const chartT = chartStrings.en;

const ZODIAC_ORDER = [
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
];

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
  latitude: number,
  longitude: number,
): Promise<string> {
  try {
    const [year, month, day] = birthDate
      .split("-")
      .map((num) => parseInt(num, 10));

    if (
      isNaN(year) ||
      isNaN(month) ||
      isNaN(day) ||
      month < 1 ||
      month > 12 ||
      day < 1 ||
      day > 31
    ) {
      throw new Error(chartT.errors.invalidDateFormat);
    }

    const formattedDate = `${year}-${month.toString().padStart(2, "0")}-${day.toString().padStart(2, "0")}`;
    const [hour, minute] = birthTime.split(":").map((num) => parseInt(num, 10));

    if (
      isNaN(hour) ||
      isNaN(minute) ||
      hour < 0 ||
      hour > 23 ||
      minute < 0 ||
      minute > 59
    ) {
      throw new Error(chartT.errors.invalidTimeFormat);
    }

    const formattedTime = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
    const formattedDateTime = `${formattedDate}T${formattedTime}`;

    const response = await fetch(process.env.NEXT_PUBLIC_LILIT_ASTRO_API_URL!, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        API_KEY: process.env.NEXT_PUBLIC_LILIT_ASTRO_API_KEY!,
      },
      body: JSON.stringify({
        date_time: formattedDateTime,
        latitude: latitude,
        longitude: longitude,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        chartT.errors.apiRequestFailed
          .replace("{status}", response.status.toString())
          .replace("{error}", errorText),
      );
    }

    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      throw new Error(
        chartT.errors.invalidResponseType.replace(
          "{type}",
          contentType || "unknown",
        ),
      );
    }

    const data: ApiResponse = await response.json();

    if (!data || typeof data !== "object") {
      throw new Error(chartT.errors.invalidApiResponse);
    }

    // Calculate chart data to get house information
    const chartData = calculateChartData(birthDate, birthTime, latitude, longitude);

    const planets = Object.entries(data).map(
      ([planet, info]: [string, PlanetResponse]) => {
        if (
          !info ||
          typeof info !== "object" ||
          !info.sign ||
          typeof info.degrees !== "number"
        ) {
          throw new Error(
            chartT.errors.invalidPlanetData.replace("{planet}", planet),
          );
        }
        // Find the corresponding planet in chartData to get house information
        const planetData = chartData.planets.find(p => p.name.toLowerCase() === planet.toLowerCase());
        return {
          planet,
          sign: info.sign,
          longitude: info.degrees,
          house: planetData?.house || "-",
          position: info.position,
          element: info.element || getElementForSign(info.sign),
        };
      },
    );

    return `
      <table class="astrology-table" style="font-family: 'Arial Unicode MS', 'Arial', sans-serif;">
        <thead>
          <tr>
            <th style="color: var(--color-primary); font-weight: 500;">${chartT.table.planet}</th>
            <th style="color: var(--color-primary); font-weight: 500;">${chartT.table.sign}</th>
            <th style="color: var(--color-primary); font-weight: 500;">${chartT.table.element}</th>
            <th style="color: var(--color-primary); font-weight: 500;">${chartT.table.position}</th>
            <th style="color: var(--color-primary); font-weight: 500;">${chartT.table.house}</th>
            <th style="color: var(--color-primary); font-weight: 500;">${chartT.table.effects}</th>
          </tr>
        </thead>
        <tbody>
          ${planets
            .map(
              (planet) => `
            <tr>
              <td class="planet-cell" style="color: var(--color-primary);">${planet.planet.toLowerCase()}</td>
              <td class="planet-cell" style="color: var(--color-primary); font-size: 20px; font-weight: 500; text-shadow: 0 0 8px var(--color-primary);">${getZodiacSymbol(planet.sign)}</td>
              <td class="planet-cell" style="color: var(--color-primary);">${getElementForSign(planet.sign)}</td>
              <td class="planet-cell" style="color: var(--color-primary);">${planet.longitude.toFixed(2)}°</td>
              <td class="planet-cell" style="color: var(--color-primary);">${planet.house}</td>
              <td class="planet-cell" style="color: var(--color-primary);">-</td>
            </tr>
          `,
            )
            .join("")}
        </tbody>
      </table>
    `;
  } catch (error: any) {
    return `<div class="astrology-error">Error: ${error.message}</div>`;
  }
}

const PlanetInfoPanel: React.FC<PlanetInfoPanelProps> = React.memo(
  ({ selectedPlanet, chartData, translations }) => {
    const planet = chartData.planets.find((p) => p.name === selectedPlanet);
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
  chartData,
  chartInfo,
  isGeneratingChart,
}: LogiaChartProps) {
  const { theme } = useTheme();
  const [selectedPlanet, setSelectedPlanet] = React.useState<string | null>(
    null,
  );
  const [chartInfoHtml, setChartInfoHtml] = React.useState<string>("");

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
      drawZodiacSymbols(g, dimensions.radius, ZODIAC_ORDER);
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
        translations={chartT}
      />
    );
  }, [selectedPlanet, chartData]);

  return (
    <>
      <h1 className="page-title">{chartT.title.toLowerCase()}</h1>
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
    </>
  );
}
