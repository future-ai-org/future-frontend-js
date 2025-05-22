import React, { useEffect, useMemo, useCallback } from "react";
import {
  ChartData,
  getPlanetSymbol,
  getZodiacSymbol,
  ZODIAC_SYMBOLS,
  PLANET_SYMBOLS,
  calculateChart as calculateChartData,
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
  drawAscendant,
  drawZodiacSymbols,
  drawAspects,
  drawPlanets,
} from "../utils/chartCalculation";

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
): ChartData {
  return calculateChartData(birthDate, birthTime, latitude, longitude);
}

export async function printChartInfo(
  birthDate: string,
  birthTime: string,
  latitude: number,
  longitude: number,
): Promise<string> {
  interface ApiResponse {
    [key: string]: PlanetResponse;
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

    const chartData = calculateChartData(
      birthDate,
      birthTime,
      latitude,
      longitude,
    );
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
        const planetData = chartData.planets.find(
          (p) => p.name.toLowerCase() === planet.toLowerCase(),
        );
        return {
          planet,
          sign: info.sign,
          longitude: info.degrees,
          house: planetData?.house || "-",
          position: info.degrees,
          element: getElementForSign(info.sign),
        };
      },
    );

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
          ${planets
            .map((planet) => {
              const element = getElementForSign(planet.sign);
              const elementInfo =
                {
                  "🜂": chartT.elements.fire,
                  "🜃": chartT.elements.earth,
                  "🜁": chartT.elements.air,
                  "🜄": chartT.elements.water,
                }[element] || element;
              const elementName =
                {
                  "🜂": chartT.elements.names.fire,
                  "🜃": chartT.elements.names.earth,
                  "🜁": chartT.elements.names.air,
                  "🜄": chartT.elements.names.water,
                }[element] || element;
              return `
            <tr>
              <td class="planet-cell">${PLANET_SYMBOLS[planet.planet.toLowerCase() as keyof typeof PLANET_SYMBOLS]}</td>
              <td class="planet-cell">${getZodiacSymbol(planet.sign)}</td>
              <td class="planet-cell element-cell" data-tooltip="${elementName}\n\n${elementInfo}">${element}</td>
              <td class="planet-cell">${planet.longitude.toFixed(2)}°</td>
              <td class="planet-cell">${planet.house}</td>
              <td class="planet-cell" data-tooltip="${chartT.effects[planet.planet.toLowerCase() as keyof typeof chartT.effects] || "-"}">${chartT.effects[planet.planet.toLowerCase() as keyof typeof chartT.effects] || "-"}</td>
            </tr>
          `;
            })
            .join("")}
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
      drawHouseLines(g, dimensions.radius, chartData.houses);
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
