"use client";

import React, { useEffect, useState } from "react";
import strings from "../i18n/logiaAdvanced.json";
import { formatDate, formatTime } from "../utils/geocoding";
import "../styles/logiaAdvanced.css";

const t = strings.en;

interface LogiaAdvancedProps {
  birthDate: string;
  birthTime: string;
  city: string;
}

interface CelestialBody {
  name: string;
  quality: string;
  element: string;
  sign: string;
  sign_num: number;
  position: number;
  abs_pos: number;
  emoji: string;
  point_type: string;
  house: string | null;
  retrograde: boolean | null;
}

interface AstroData {
  status: string;
  data: {
    name: string;
    year: number;
    month: number;
    day: number;
    hour: number;
    minute: number;
    city: string;
    nation: string;
    lng: number;
    lat: number;
    tz_str: string;
    zodiac_type: string;
    houses_system_name: string;
    perspective_type: string;
    iso_formatted_local_datetime: string;
    [key: string]: string | number | CelestialBody;
  };
}

export default function LogiaAdvanced({
  birthDate,
  birthTime,
  city,
}: LogiaAdvancedProps) {
  const [astroData, setAstroData] = useState<AstroData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedBody, setSelectedBody] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/astro");

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data.error) {
          throw new Error(data.error);
        }

        if (data.status !== "OK") {
          throw new Error("Invalid response from server");
        }

        setAstroData(data);
        setError(null);
      } catch (error) {
        console.error("Error fetching astro data:", error);
        setError(
          error instanceof Error
            ? error.message
            : "Failed to load astrological data. Please try again later.",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Ensure we have valid values before formatting
  const formattedDate = birthDate ? formatDate(birthDate) : "";
  const formattedTime = birthTime ? formatTime(birthTime) : "";
  const formattedCity = city ? city.toLowerCase() : "";

  const subtitleContent = t.subtitle
    .replace("{birthDate}", formattedDate)
    .replace("{birthTime}", formattedTime)
    .replace("{city}", formattedCity);

  // Function to format position to 2 decimal places
  const formatPosition = (pos: number) => pos.toFixed(2);

  // Get celestial bodies from data
  const getCelestialBodies = () => {
    if (!astroData?.data) return [];

    return Object.entries(astroData.data)
      .filter(
        ([, value]) =>
          typeof value === "object" && value !== null && "name" in value,
      )
      .map(([key, value]) => ({
        key,
        body: value as CelestialBody,
      }));
  };

  const celestialBodies = getCelestialBodies();

  // Get element color
  const getElementColor = (element: string) => {
    const colors = {
      Fire: "var(--color-bullish)",
      Earth: "#8B4513",
      Air: "#87CEEB",
      Water: "#4682B4",
    };
    return colors[element as keyof typeof colors] || "var(--color-primary)";
  };

  // Get quality color
  const getQualityColor = (quality: string) => {
    const colors = {
      Cardinal: "#FF6B6B",
      Fixed: "#4ECDC4",
      Mutable: "#45B7D1",
    };
    return colors[quality as keyof typeof colors] || "var(--color-primary)";
  };

  return (
    <div className="advanced-astrology-container">
      {/* Background decoration */}
      <div className="cosmic-background">
        <div className="stars"></div>
        <div className="nebula"></div>
      </div>

      {/* Header Section */}
      <div className="advanced-header">
        <div className="header-content">
          <h1 className="advanced-title">
            <span className="title-glow">{t.title}</span>
          </h1>
          <div className="advanced-subtitle">
            <div className="subtitle-icon">✨</div>
            <span>{subtitleContent}</span>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="loading-container">
          <div className="loading-spinner">
            <div className="spinner-ring"></div>
            <div className="spinner-ring"></div>
            <div className="spinner-ring"></div>
          </div>
          <p className="loading-text">Reading the stars...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="error-container">
          <div className="error-icon">⚠️</div>
          <p className="error-text">{error}</p>
        </div>
      )}

      {/* Astrological Data */}
      {!loading && !error && astroData?.data && (
        <div className="astrology-content">
          {/* Summary Cards */}
          <div className="summary-section">
            <div className="summary-card">
              <div className="summary-icon">🌍</div>
              <div className="summary-content">
                <h3>Location</h3>
                <p>
                  {astroData.data.city}, {astroData.data.nation}
                </p>
              </div>
            </div>
            <div className="summary-card">
              <div className="summary-icon">📅</div>
              <div className="summary-content">
                <h3>Date & Time</h3>
                <p>{astroData.data.iso_formatted_local_datetime}</p>
              </div>
            </div>
            <div className="summary-card">
              <div className="summary-icon">🧭</div>
              <div className="summary-content">
                <h3>Coordinates</h3>
                <p>
                  {astroData.data.lat.toFixed(2)}°N,{" "}
                  {astroData.data.lng.toFixed(2)}°E
                </p>
              </div>
            </div>
          </div>

          {/* Celestial Bodies Grid */}
          <div className="celestial-grid">
            {celestialBodies.map(({ key, body }) => (
              <div
                key={key}
                className={`celestial-card ${selectedBody === key ? "selected" : ""}`}
                onClick={() =>
                  setSelectedBody(selectedBody === key ? null : key)
                }
              >
                <div className="card-header">
                  <div className="body-emoji">{body.emoji}</div>
                  <div className="body-info">
                    <h3 className="body-name">{body.name}</h3>
                    <div className="body-sign">
                      <span className="sign-emoji">{body.emoji}</span>
                      <span className="sign-name">{body.sign}</span>
                      {body.retrograde && <span className="retrograde">R</span>}
                    </div>
                  </div>
                </div>

                <div className="card-details">
                  <div className="detail-row">
                    <span className="detail-label">Position:</span>
                    <span className="detail-value">
                      {formatPosition(body.position)}°
                    </span>
                  </div>
                  {body.house && (
                    <div className="detail-row">
                      <span className="detail-label">House:</span>
                      <span className="detail-value">
                        {body.house.replace("_", " ")}
                      </span>
                    </div>
                  )}
                  <div className="detail-row">
                    <span className="detail-label">Quality:</span>
                    <span
                      className="detail-value quality-badge"
                      style={{ color: getQualityColor(body.quality) }}
                    >
                      {body.quality}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Element:</span>
                    <span
                      className="detail-value element-badge"
                      style={{ color: getElementColor(body.element) }}
                    >
                      {body.element}
                    </span>
                  </div>
                </div>

                {/* Expanded Details */}
                {selectedBody === key && (
                  <div className="expanded-details">
                    <div className="detail-section">
                      <h4>Astrological Significance</h4>
                      <p>
                        This celestial body represents {body.name.toLowerCase()}{" "}
                        in {body.sign.toLowerCase()} at{" "}
                        {formatPosition(body.position)}°.
                      </p>
                    </div>
                    <div className="detail-section">
                      <h4>Elemental Influence</h4>
                      <p>
                        The {body.element.toLowerCase()} element brings{" "}
                        {body.element.toLowerCase()} qualities to this
                        placement.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
