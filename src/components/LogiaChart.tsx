import React, { useEffect, useMemo, useCallback, useState } from "react";
import {
  ChartData,
  getPlanetSymbol,
  getZodiacSymbol,
  PLANET_SYMBOLS,
  getElementForSign,
  getElementNameForSign,
} from "../config/logiaChart";
import Loading from "../utils/loading";
import "../styles/logiachart.css";
import {
  calculateChartDimensions,
  createBaseChart,
  drawChartCircles,
  drawHouseLines,
  drawHouseNumbers,
  toRomanNumeral,
} from "../utils/chartDrawing";
import {
  drawZodiacSymbols,
  drawPlanets,
  updateOrderedSigns,
  calculateHouses,
  calculateAspects,
  orderedSigns,
} from "../utils/chartFilling";
import {
  formatCoordinates,
  formatDate,
  formatTime,
  geocodeCity,
} from "../utils/geocoding";
import chartStrings from "../i18n/logiaChart.json";

interface ChartCalculationResult {
  chartData: ChartData;
  chartInfoHtml: string;
}

interface PlanetResponse {
  sign: string;
  degrees: number;
}

interface ApiResponse {
  [key: string]: PlanetResponse;
}

interface AscendantResponse {
  sign: string;
  degrees: number;
}

async function calculateChartData(
  birthDate: string,
  birthTime: string,
  city: string,
  chartT: typeof chartStrings.en,
): Promise<ChartCalculationResult> {
  const coordinates = await geocodeCity(city);
  if (!coordinates) {
    throw new Error(chartT.errors.cityNotFound);
  }

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
    latitude: coordinates.lat,
    longitude: coordinates.lon,
  };

  const [planetsResponse, ascendantResponse] = await Promise.all([
    fetch(`${baseUrl}/planets`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        API_KEY: process.env.NEXT_PUBLIC_LILIT_ASTRO_API_KEY!,
      },
      body: JSON.stringify(requestBody),
    }),
    fetch(`${baseUrl}/ascendant`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        API_KEY: process.env.NEXT_PUBLIC_LILIT_ASTRO_API_KEY!,
      },
      body: JSON.stringify(requestBody),
    }),
  ]);

  if (!planetsResponse.ok || !ascendantResponse.ok) {
    const errorText = await (planetsResponse.ok
      ? ascendantResponse.text()
      : planetsResponse.text());
    throw new Error(
      chartT.errors.apiRequestFailed
        .replace(
          "{status}",
          (planetsResponse.ok
            ? ascendantResponse.status
            : planetsResponse.status
          ).toString(),
        )
        .replace("{error}", errorText),
    );
  }

  const [planetsData, ascendantData] = await Promise.all([
    planetsResponse.json() as Promise<ApiResponse>,
    ascendantResponse.json() as Promise<AscendantResponse>,
  ]);

  if (
    !planetsData ||
    typeof planetsData !== "object" ||
    !ascendantData ||
    typeof ascendantData !== "object"
  ) {
    throw new Error(chartT.errors.invalidApiResponse);
  }

  const planets = Object.entries(planetsData).map(([name, data]) => ({
    name: name.toLowerCase(),
    position: data.degrees,
    sign: data.sign.toLowerCase(),
    house:
      Math.floor(((data.degrees - ascendantData.degrees + 360) % 360) / 30) + 1,
  }));

  const houses = calculateHouses(ascendantData.degrees);

  const chartData: ChartData = {
    planets,
    houses,
    aspects: calculateAspects(planets),
    birthDate,
    birthTime,
    latitude: coordinates.lat,
    longitude: coordinates.lon,
    city,
    ascendantSign: ascendantData.sign.toLowerCase(),
  };

  function getDecadeDescription(degrees: number): string {
    const decade = Math.floor(degrees / 10);
    switch (decade) {
      case 0:
        return chartT.decades.first;
      case 1:
        return chartT.decades.second;
      case 2:
        return chartT.decades.third;
      default:
        return "";
    }
  }

  const tableRows = [
    `<tr>
      <td class="planet-cell" title="${chartT.points.tooltip.replace("{sign}", ascendantData.sign).replace("{position}", ascendantData.degrees.toFixed(2))} - ${chartT.planetDescriptions.ascendant}">AC</td>
      <td class="planet-cell" title="${chartT.signs[ascendantData.sign.toLowerCase() as keyof typeof chartT.signs]}">${getZodiacSymbol(ascendantData.sign)}</td>
      <td class="planet-cell" title="${chartT.elements[getElementNameForSign(ascendantData.sign).toLowerCase() as keyof typeof chartT.elements]}">${getElementForSign(ascendantData.sign)}</td>
      <td class="planet-cell" title="${getDecadeDescription(ascendantData.degrees)}">${ascendantData.degrees.toFixed(2)}°</td>
      <td class="planet-cell" title="${chartT.houses["1"]}">I</td>
      <td class="planet-cell">${chartT.effects.ascendant || "-"}</td>
    </tr>`,
    ...Object.entries(planetsData).map(([planet, info]) => {
      const orderedArray = Array.from(orderedSigns.keys());
      const houseNumber =
        orderedArray.findIndex(
          (sign) => (sign as string).toLowerCase() === info.sign.toLowerCase(),
        ) + 1;

      const planetEffect =
        chartT.effects[planet.toLowerCase() as keyof typeof chartT.effects] ||
        "-";
      const planetDescription =
        chartT.planetDescriptions[
          planet.toLowerCase() as keyof typeof chartT.planetDescriptions
        ] || "-";
      const tooltipText = `${chartT.points.tooltip.replace("{sign}", info.sign).replace("{position}", info.degrees.toFixed(2))} - ${planetDescription}`;
      const signDescription =
        chartT.signs[info.sign.toLowerCase() as keyof typeof chartT.signs];
      const houseDescription =
        chartT.houses[houseNumber.toString() as keyof typeof chartT.houses];
      const element = getElementNameForSign(info.sign).toLowerCase();
      const elementDescription =
        chartT.elements[element as keyof typeof chartT.elements];

      return `<tr>
        <td class="planet-cell" title="${tooltipText}">${PLANET_SYMBOLS[planet.toLowerCase() as keyof typeof PLANET_SYMBOLS]}</td>
        <td class="planet-cell" title="${signDescription}">${getZodiacSymbol(info.sign)}</td>
        <td class="planet-cell" title="${elementDescription}">${getElementForSign(info.sign)}</td>
        <td class="planet-cell" title="${getDecadeDescription(info.degrees)}">${info.degrees.toFixed(2)}°</td>
        <td class="planet-cell" title="${houseDescription}">${toRomanNumeral(houseNumber)}</td>
        <td class="planet-cell">${planetEffect}</td>
      </tr>`;
    }),
  ].join("");

  const chartInfoHtml = `
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

  return { chartData, chartInfoHtml };
}

interface LogiaChartProps {
  birthDate: string;
  birthTime: string;
  city: string;
  isGeneratingChart: boolean;
}

interface SavedChart {
  id: string;
  birthDate: string;
  birthTime: string;
  city: string;
  chartData: ChartData;
  savedAt: string;
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
      drawPlanets(
        g,
        dimensions.radius,
        onPlanetSelect,
        getPlanetSymbol,
        chartData,
      );

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
            {translations.table.house}: {toRomanNumeral(planet.house)}
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
  const [isSaving, setIsSaving] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState("");

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
    } catch {
      setError(chartT.errors.unknownError);
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

  const handleSaveChart = useCallback(async () => {
    if (!chartData) return;

    setIsSaving(true);
    try {
      const savedCharts = JSON.parse(
        localStorage.getItem("savedCharts") || "[]",
      );

      // Check if a chart with the same data already exists
      const isDuplicate = savedCharts.some((savedChart: SavedChart) => {
        return (
          savedChart.birthDate === birthDate &&
          savedChart.birthTime === birthTime &&
          savedChart.city === city &&
          JSON.stringify(savedChart.chartData) === JSON.stringify(chartData)
        );
      });

      if (isDuplicate) {
        setNotificationMessage(chartT.saveChart.duplicate);
        setShowNotification(true);
        setTimeout(() => setShowNotification(false), 3000);
        setIsSaving(false);
        return;
      }

      const newChart: SavedChart = {
        id: crypto.randomUUID(),
        birthDate,
        birthTime,
        city,
        chartData,
        savedAt: new Date().toISOString(),
      };

      savedCharts.push(newChart);
      localStorage.setItem("savedCharts", JSON.stringify(savedCharts));

      setNotificationMessage(chartT.saveChart.success);
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 3000);
    } catch {
      setError(chartT.saveChart.error);
    } finally {
      setIsSaving(false);
    }
  }, [chartData, birthDate, birthTime, city]);

  if (error) {
    return <div className="astrology-error-message">{error}</div>;
  }

  if (isLoading || isGeneratingChart) {
    return <Loading />;
  }

  return (
    <>
      <div className="astrology-header">
        {showNotification && (
          <div className="save-notification">{notificationMessage}</div>
        )}
        <a href="/logia-advanced" className="advanced-view-button">
          {chartT.advancedView}
        </a>
        <h1 className="astrology-title">{chartT.title.toLowerCase()}</h1>
        <button
          onClick={handleSaveChart}
          disabled={isSaving || !chartData}
          className="save-chart-button"
        >
          {isSaving ? chartT.saveChart.saving : chartT.saveChart.button}
        </button>
      </div>
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
