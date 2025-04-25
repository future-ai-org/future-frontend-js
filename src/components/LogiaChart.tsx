import React, { useEffect } from "react";
import * as d3 from "d3";
import {
  ChartData,
  getPlanetSymbol,
  getZodiacSymbol,
  ZODIAC_SIGNS,
} from "../config/logia";
import { useTheme } from "../contexts/ThemeContext";
import strings from "../i18n/logia.json";
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
} from "../utils/chartCalculation";

interface LogiaChartProps {
  chartData: ChartData | null;
  chartInfo: string | null;
  isGeneratingChart: boolean;
}

export default function LogiaChart({
  chartData,
  chartInfo,
  isGeneratingChart,
}: LogiaChartProps) {
  const { theme } = useTheme();
  const [selectedPlanet, setSelectedPlanet] = React.useState<string | null>(null);
  const t = strings.en;

  useEffect(() => {
    if (!chartData) return;

    const container = document.getElementById("chart");
    if (!container) return;

    const dimensions = calculateChartDimensions(container);
    const { g } = createBaseChart(container, dimensions);

    drawChartCircles(g, dimensions.radius);
    drawHouseNumbers(g, dimensions.radius, chartData.houses[0]);
    drawAscendant(g, dimensions.radius, chartData.houses[0]);
    drawZodiacSymbols(
      g,
      dimensions.radius,
      ZODIAC_SIGNS.map((sign: string) => getZodiacSymbol(sign))
    );
    drawHouses(g, dimensions.radius, chartData.houses);
    drawAspects(g, dimensions.radius, chartData);
    drawPlanets(g, dimensions.radius, chartData, setSelectedPlanet, getPlanetSymbol);

    return () => {
      d3.select(container).selectAll("*").remove();
    };
  }, [chartData, theme]);

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
        {selectedPlanet && chartData && (
          <div className="astrology-info-panel">
            <h3>{t.infoPanel.title}</h3>
            {chartData.planets
              .filter((planet) => planet.name === selectedPlanet)
              .map((planet) => (
                <div key={planet.name} className="astrology-planet-info">
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
              ))}
          </div>
        )}
      </div>
    </div>
  );
}
