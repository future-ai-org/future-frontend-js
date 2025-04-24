"use client";

import React, { useState, useEffect, useCallback } from "react";
import * as d3 from "d3";
import {
  calculateChart,
  getPlanetSymbol,
  getZodiacSymbol,
  ChartData,
  OPENSTREETMAP_API_URL,
  printChartInfo,
  ZODIAC_SIGNS,
} from "../config/logia";
import { useTheme } from "../contexts/ThemeContext";
import strings from "../i18n/logia.json";
import "../styles/logia.css";

export default function Logia() {
  const { theme } = useTheme();
  const [birthDate, setBirthDate] = useState("");
  const [birthTime, setBirthTime] = useState("");
  const [city, setCity] = useState("");
  const [citySuggestions, setCitySuggestions] = useState<
    Array<{ display_name: string; lat: string; lon: string }>
  >([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [selectedPlanet, setSelectedPlanet] = useState<string | null>(null);
  const [isGeneratingChart, setIsGeneratingChart] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [chartInfo, setChartInfo] = useState<string | null>(null);

  const t = strings.en;

  const searchCities = useCallback(
    async (query: string) => {
      if (query.length < 2) {
        setCitySuggestions([]);
        return;
      }

      try {
        setIsGeneratingChart(true);
        setError(null);

        const response = await fetch(
          `${OPENSTREETMAP_API_URL}${encodeURIComponent(query)}&limit=10`,
        );

        if (!response.ok) {
          throw new Error(t.errors.fetchCoordinatesFailed);
        }

        const data = await response.json();
        const seen = new Set();
        const formattedData = data
          .map(
            (item: {
              name?: string;
              display_name: string;
              lat: string;
              lon: string;
            }) => {
              const cityName =
                item.name || item.display_name.split(",")[0].trim();
              const parts = item.display_name.split(",");
              const country = parts[parts.length - 1].trim();

              return {
                display_name: `${cityName.toLowerCase()}, ${country.toLowerCase()}`,
                lat: item.lat,
                lon: item.lon,
              };
            },
          )
          .filter((item: { display_name: string }) => {
            const key = item.display_name.toLowerCase();
            if (seen.has(key)) {
              return false;
            }
            seen.add(key);
            return true;
          });
        setCitySuggestions(formattedData);
      } catch (err) {
        setError(err instanceof Error ? err.message : t.errors.unknownError);
        setCitySuggestions([]);
      } finally {
        setIsGeneratingChart(false);
      }
    },
    [t.errors.fetchCoordinatesFailed, t.errors.unknownError],
  );

  const handleCityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCity(value);
    searchCities(value);
    setShowSuggestions(true);
  };

  const handleCitySelect = (suggestion: {
    display_name: string;
    lat: string;
    lon: string;
  }) => {
    setCity(suggestion.display_name);
    setCitySuggestions([]);
    setShowSuggestions(false);
  };

  const geocodeCity = async (cityName: string) => {
    try {
      setIsGeneratingChart(true);
      setError(null);

      const response = await fetch(
        `${OPENSTREETMAP_API_URL}${encodeURIComponent(cityName)}`,
      );

      if (!response.ok) {
        throw new Error(t.errors.fetchCoordinatesFailed);
      }

      const data = await response.json();

      if (data.length === 0) {
        throw new Error(t.errors.cityNotFound);
      }

      const { lat, lon } = data[0];
      return { lat: parseFloat(lat), lon: parseFloat(lon) };
    } catch (err) {
      setError(err instanceof Error ? err.message : t.errors.unknownError);
      return null;
    } finally {
      setIsGeneratingChart(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!birthDate || !birthTime || !city) return;

    setIsGeneratingChart(true);
    setError(null);

    try {
      const coordinates = await geocodeCity(city);
      if (!coordinates) {
        throw new Error(t.errors.cityNotFound);
      }

      const chart = calculateChart(
        birthDate,
        birthTime,
        coordinates.lat,
        coordinates.lon,
      );
      setChartData(chart);
      setChartInfo(
        printChartInfo(
          birthDate,
          birthTime,
          coordinates.lat,
          coordinates.lon,
          city,
          t,
        ),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : t.errors.unknownError);
    } finally {
      setIsGeneratingChart(false);
    }
  };

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

    // Add outer circle beyond zodiac symbols
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

    // Add house numbers starting from ascendant
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

    // Add ascendant marker
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
    <div className="astrology-container">
      <div className="astrology-form-section">
        {!chartInfo ? (
          <form className="astrology-form" onSubmit={handleSubmit}>
            <div className="astrology-form-group">
              <label className="astrology-label">{t.labels.birthDate}</label>
              <input
                className="astrology-input"
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                required
              />
            </div>
            <div className="astrology-form-group">
              <label className="astrology-label">{t.labels.birthTime}</label>
              <input
                className="astrology-input"
                type="time"
                value={birthTime}
                onChange={(e) => setBirthTime(e.target.value)}
                required
              />
            </div>
            <div className="astrology-form-group">
              <label className="astrology-label">{t.labels.birthCity}</label>
              <div className="astrology-city-input-container">
                <input
                  className="astrology-input astrology-city-input"
                  type="text"
                  value={city}
                  onChange={handleCityChange}
                  onBlur={() =>
                    setTimeout(() => setShowSuggestions(false), 200)
                  }
                  placeholder={t.labels.cityPlaceholder}
                  required
                />
                {showSuggestions && citySuggestions.length > 0 && (
                  <ul className="astrology-city-suggestions">
                    {citySuggestions.map((suggestion, index) => (
                      <li
                        key={index}
                        onClick={() => handleCitySelect(suggestion)}
                        className="astrology-city-suggestion"
                      >
                        {suggestion.display_name}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              {error && <div className="astrology-error-message">{error}</div>}
            </div>
            <button
              className="astrology-button"
              type="submit"
              disabled={isGeneratingChart}
            >
              {isGeneratingChart
                ? t.loading.generatingChart
                : t.buttons.generateChart}
            </button>
          </form>
        ) : (
          <>
            <div className="astrology-info-box">
              <div
                className="astrology-info-text"
                dangerouslySetInnerHTML={{ __html: chartInfo }}
              />
            </div>
            <button
              className="astrology-button"
              onClick={() => {
                setChartInfo(null);
                setChartData(null);
              }}
            >
              {t.buttons.back}
            </button>
          </>
        )}
      </div>
      <div className="astrology-chart-section">
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
    </div>
  );
}
