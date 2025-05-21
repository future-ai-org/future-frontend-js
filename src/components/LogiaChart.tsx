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
    // Parse and validate the date components
    const [year, month, day] = birthDate.split('-').map(num => parseInt(num, 10));
    
    // Validate date components
    if (isNaN(year) || isNaN(month) || isNaN(day) || 
        month < 1 || month > 12 || 
        day < 1 || day > 31) {
      throw new Error('Invalid date format. Please use YYYY-MM-DD format with valid month (1-12) and day (1-31) values.');
    }

    // Format the date with leading zeros
    const formattedDate = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    const [hour, minute] = birthTime.split(':').map(num => parseInt(num, 10));
    
    // Validate time components
    if (isNaN(hour) || isNaN(minute) || 
        hour < 0 || hour > 23 || 
        minute < 0 || minute > 59) {
      throw new Error('Invalid time format. Please use HH:MM format with valid hour (0-23) and minute (0-59) values.');
    }

    const formattedTime = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
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
      console.error("API Error Response:", errorText);
      throw new Error(`API request failed with status ${response.status}: ${errorText}`);
    }

    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      const text = await response.text();
      console.error("Unexpected response type:", contentType);
      console.error("Response body:", text);
      throw new Error(`Expected JSON response but got ${contentType}`);
    }

    const data: ApiResponse = await response.json();
    console.log("API Response:", data);

    // Validate the response data structure
    if (!data || typeof data !== "object") {
      throw new Error("Invalid API response format");
    }

    // Convert the object into an array of planets
    const planets = Object.entries(data).map(
      ([planet, info]: [string, PlanetResponse]) => {
        if (!info || typeof info !== "object" || !info.sign || typeof info.degrees !== "number") {
          throw new Error(`Invalid planet data for ${planet}`);
        }
        return {
          planet,
          sign: info.sign,
          longitude: info.degrees,
        };
      },
    );

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
          ${planets
            .map(
              (planet) => `
            <tr>
              <td class="planet-cell">${planet.planet}</td>
              <td class="planet-cell">${planet.longitude.toFixed(2)}°</td>
              <td class="planet-cell">${planet.sign}</td>
            </tr>
          `,
            )
            .join("")}
        </tbody>
      </table>
    `;
  } catch (error: any) {
    console.error("Error in printChartInfo:", error);
    return `<div class="astrology-error">Error: ${error.message}</div>`;
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
  const [selectedPlanet, setSelectedPlanet] = React.useState<string | null>(
    null,
  );
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
