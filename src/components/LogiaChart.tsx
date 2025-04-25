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

interface LogiaChartProps {
  chartData: ChartData | null;
  chartInfo: string | null;
  onBack: () => void;
  isGeneratingChart: boolean;
}

export default function LogiaChart({
  chartData,
  chartInfo,
  onBack,
  isGeneratingChart,
}: LogiaChartProps) {
  const { theme } = useTheme();
  const [selectedPlanet, setSelectedPlanet] = React.useState<string | null>(null);
  const t = strings.en;

  useEffect(() => {
    if (!chartData) return;

    const container = document.getElementById("chart");
    if (!container) return;

    d3.select(container).selectAll("*").remove();
    const width = container.clientWidth;
    const height = container.clientHeight;
    const size = Math.min(width, height);
    const radius = size / 2 - 40;

    const svg = d3
      .select(container)
      .append("svg")
      .attr("width", "100%")
      .attr("height", "100%")
      .attr("viewBox", `0 0 ${width} ${height}`)
      .attr("preserveAspectRatio", "xMidYMid meet")
      .style("background-color", "transparent");

    const g = svg
      .append("g")
      .attr("transform", `translate(${width / 2},${height / 2})`);

    g.append("circle")
      .attr("r", radius)
      .style("fill", "none")
      .style("stroke", "var(--color-primary)")
      .style("stroke-width", 2);

    g.append("circle")
      .attr("r", radius + 30)
      .style("fill", "none")
      .style("stroke", "var(--color-primary)")
      .style("stroke-width", 1.5)
      .style("opacity", 0.8);

    const zodiacRadius = radius + 15;
    const houseNumberRadius = radius * 0.2;
    const zodiacSymbols = ZODIAC_SIGNS.map((sign: string) =>
      getZodiacSymbol(sign),
    );

    const ascendantAngle = chartData.houses[0];
    for (let i = 0; i < 12; i++) {
      const angle =
        ((((ascendantAngle - i * 30 + 360) % 360) - 90 + 15) * Math.PI) / 180;
      const x = houseNumberRadius * Math.cos(angle);
      const y = houseNumberRadius * Math.sin(angle);

      g.append("text")
        .attr("x", x)
        .attr("y", y)
        .attr("text-anchor", "middle")
        .attr("dy", "0.35em")
        .text((i + 1).toString())
        .style("font-size", "12px")
        .style("fill", "var(--color-primary)")
        .style("opacity", "0.8")
        .style("font-weight", "800");
    }

    const ascX =
      (radius - 35) * Math.cos(((ascendantAngle - 90) * Math.PI) / 180);
    const ascY =
      (radius - 35) * Math.sin(((ascendantAngle - 90) * Math.PI) / 180);

    const ascGroup = g
      .append("g")
      .attr("transform", `translate(${ascX},${ascY})`);

    ascGroup
      .append("circle")
      .attr("r", 8)
      .style("fill", "var(--primary-color)")
      .style("stroke", "var(--background-color)")
      .style("stroke-width", 2);

    ascGroup
      .append("text")
      .attr("x", 12)
      .attr("y", 5)
      .text("ASC")
      .style("font-size", "16px")
      .style("fill", "var(--color-primary)");

    for (let index = 0; index < 12; index++) {
      const angle = ((index * 30 - 90 + 15) * Math.PI) / 180;
      const x = zodiacRadius * Math.cos(angle);
      const y = zodiacRadius * Math.sin(angle);

      g.append("text")
        .attr("x", x)
        .attr("y", y)
        .attr("text-anchor", "middle")
        .attr("dy", "0.35em")
        .text(zodiacSymbols[index])
        .style("font-size", "16px")
        .style("fill", "var(--color-primary)")
        .style("opacity", "0.8")
        .style("font-weight", "500")
        .style("text-shadow", "0 0 8px var(--color-primary)")
        .style("transition", "all 0.3s ease")
        .on("mouseover", function () {
          d3.select(this)
            .style("opacity", "1")
            .style("font-size", "20px")
            .style("text-shadow", "0 0 12px var(--color-primary)");
        })
        .on("mouseout", function () {
          d3.select(this)
            .style("opacity", "0.8")
            .style("font-size", "16px")
            .style("text-shadow", "0 0 8px var(--color-primary)");
        });
    }

    chartData.houses.forEach((angle) => {
      const x = radius * Math.cos(((angle - 90) * Math.PI) / 180);
      const y = radius * Math.sin(((angle - 90) * Math.PI) / 180);

      g.append("line")
        .attr("x1", 0)
        .attr("y1", 0)
        .attr("x2", x)
        .attr("y2", y)
        .style("stroke", "var(--color-primary)")
        .style("stroke-width", 1.5)
        .style("opacity", "0.9");
    });

    chartData.aspects.forEach((aspect) => {
      const planet1 = chartData.planets.find((p) => p.name === aspect.planet1);
      const planet2 = chartData.planets.find((p) => p.name === aspect.planet2);

      if (planet1 && planet2) {
        const x1 =
          (radius - 35) * Math.cos(((planet1.position - 90) * Math.PI) / 180);
        const y1 =
          (radius - 35) * Math.sin(((planet1.position - 90) * Math.PI) / 180);
        const x2 =
          (radius - 35) * Math.cos(((planet2.position - 90) * Math.PI) / 180);
        const y2 =
          (radius - 35) * Math.sin(((planet2.position - 90) * Math.PI) / 180);

        g.append("line")
          .attr("x1", x1)
          .attr("y1", y1)
          .attr("x2", x2)
          .attr("y2", y2)
          .style("stroke", "var(--primary-color)")
          .style("stroke-width", 0.5)
          .style("stroke-dasharray", "3,3");
      }
    });

    chartData.planets.forEach((planet) => {
      const x =
        (radius - 35) * Math.cos(((planet.position - 90) * Math.PI) / 180);
      const y =
        (radius - 35) * Math.sin(((planet.position - 90) * Math.PI) / 180);

      const planetGroup = g
        .append("g")
        .attr("transform", `translate(${x},${y})`)
        .on("click", () => setSelectedPlanet(planet.name));

      planetGroup
        .append("circle")
        .attr("r", 8)
        .style("fill", "var(--primary-color)")
        .style("stroke", "var(--background-color)")
        .style("stroke-width", 2);

      planetGroup
        .append("text")
        .attr("x", 12)
        .attr("y", 5)
        .text(getPlanetSymbol(planet.name))
        .style("font-size", "16px")
        .style("fill", "var(--color-primary)");
    });

    return () => {
      svg.selectAll("*").remove();
    };
  }, [chartData, theme]);

  return (
    <div className="astrology-chart-section">
      <div className="astrology-info-box">
        <div
          className="astrology-info-text"
          dangerouslySetInnerHTML={{ __html: chartInfo || "" }}
        />
      </div>
      <button className="astrology-button" onClick={onBack}>
        {t.buttons.back}
      </button>
      <div className="astrology-chart-container" id="chart">
        {isGeneratingChart && (
          <div className="astrology-chart-loading">
            <div className="astrology-loading-dots">
              <div className="astrology-loading-dot"></div>
              <div className="astrology-loading-dot"></div>
              <div className="astrology-loading-dot"></div>
            </div>
          </div>
        )}
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