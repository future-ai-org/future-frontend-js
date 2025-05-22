import React, { useEffect, useMemo, useCallback } from "react";
import {
  ChartData,
  getPlanetSymbol,
  getZodiacSymbol,
  ZODIAC_SYMBOLS,
  PLANET_SYMBOLS,
  calculateChartData,
  getElementForSign,
} from "../config/logiaChart";
import { useTheme } from "../utils/themeContext";
import chartStrings from "../i18n/logiaChart.json";
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
} from "../utils/chartFilling";

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
}

const chartT = chartStrings.en;

export function calculateChart(
  birthDate: string,
  birthTime: string,
  latitude: number,
  longitude: number,
  city: string,
): ChartData {
  return calculateChartData(birthDate, birthTime, latitude, longitude, city);
}

export async function printChartInfo(
  birthDate: string,
  birthTime: string,
  latitude: number,
  longitude: number,
  city: string,
): Promise<string> {
  interface ApiResponse {
    [key: string]: PlanetResponse;
  }

  interface AscendantResponse {
    sign: string;
    degrees: number;
  }

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

    const baseUrl = process.env.NEXT_PUBLIC_LILIT_ASTRO_API_URL;
    if (!baseUrl) {
      throw new Error(chartT.errors.apiUrlNotConfigured);
    }

    const requestBody = {
      date_time: formattedDateTime,
      latitude: latitude,
      longitude: longitude,
    };

    const [planetsResponse, ascendantResponse] = await Promise.all([
      fetch(`${baseUrl}/planets`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "API_KEY": process.env.NEXT_PUBLIC_LILIT_ASTRO_API_KEY!,
        },
        body: JSON.stringify(requestBody),
      }),
      fetch(`${baseUrl}/ascendant`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "API_KEY": process.env.NEXT_PUBLIC_LILIT_ASTRO_API_KEY!,
        },
        body: JSON.stringify(requestBody),
      }),
    ]);

    if (!planetsResponse.ok || !ascendantResponse.ok) {
      const errorText = await (planetsResponse.ok ? ascendantResponse.text() : planetsResponse.text());
      throw new Error(
        chartT.errors.apiRequestFailed
          .replace("{status}", (planetsResponse.ok ? ascendantResponse.status : planetsResponse.status).toString())
          .replace("{error}", errorText),
      );
    }

    const [planetsData, ascendantData] = await Promise.all([
      planetsResponse.json() as Promise<ApiResponse>,
      ascendantResponse.json() as Promise<AscendantResponse>,
    ]);

    console.log('Planets Data:', planetsData);
    console.log('Ascendant Data:', ascendantData);

    if (!planetsData || typeof planetsData !== "object" || !ascendantData || typeof ascendantData !== "object") {
      throw new Error(chartT.errors.invalidApiResponse);
    }

    const chartData = calculateChartData(
      birthDate,
      birthTime,
      latitude,
      longitude,
      city,
      ascendantData
    );

    // Create table rows for all data
    const tableRows = [
      // Ascendant row
      `<tr>
        <td class="planet-cell">AC</td>
        <td class="planet-cell">${getZodiacSymbol(ascendantData.sign)}</td>
        <td class="planet-cell">${getElementForSign(ascendantData.sign)}</td>
        <td class="planet-cell">${ascendantData.degrees.toFixed(2)}°</td>
        <td class="planet-cell">1</td>
        <td class="planet-cell">${chartT.effects.ascendant || "-"}</td>
      </tr>`,
      // Planet rows
      ...Object.entries(planetsData).map(([planet, info]) => {
        const planetData = chartData.planets.find(p => p.name.toLowerCase() === planet.toLowerCase());
        return `<tr>
          <td class="planet-cell">${PLANET_SYMBOLS[planet.toLowerCase() as keyof typeof PLANET_SYMBOLS]}</td>
          <td class="planet-cell">${getZodiacSymbol(info.sign)}</td>
          <td class="planet-cell">${getElementForSign(info.sign)}</td>
          <td class="planet-cell">${info.degrees.toFixed(2)}°</td>
          <td class="planet-cell">${planetData?.house || "-"}</td>
          <td class="planet-cell">${chartT.effects[planet.toLowerCase() as keyof typeof chartT.effects] || "-"}</td>
        </tr>`;
      })
    ].join('');

    return `
      <table class="astrology-table">
        <thead>
          <tr>
            <th class="astrology-table-header">${chartT.table.planet}</th>
            <th class="astrology-table-header">${chartT.table.sign}</th>
            <th class="astrology-table-header">${chartT.table.element}</th>
            <th class="astrology-table-header">${chartT.table.position}</th>
            <th class="astrology-table-header">${chartT.table.house}</th>
            <th class="astrology-table-header">${chartT.table.effects}</th>
          </tr>
        </thead>
        <tbody>
          ${tableRows}
        </tbody>
      </table>
    `;
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : chartT.errors.unknownError;
    return `<div class="astrology-error">${errorMessage}</div>`;
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
      drawHouseLines(g, dimensions.radius);
      drawHouseNumbers(g, dimensions.radius);
      drawZodiacSymbols(g, dimensions.radius, ZODIAC_ORDER);
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
      {chartData && (
        <div className="astrology-subtitle">
          {chartData.birthDate} {chartData.birthTime} • {chartData.city} ({chartData.latitude.toFixed(2)}°, {chartData.longitude.toFixed(2)}°)
        </div>
      )}
      <div className="astrology-chart-section">
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
