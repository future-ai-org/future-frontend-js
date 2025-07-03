"use client";

import React, { useEffect, useState } from "react";
import strings from "../i18n/logiaAdvanced.json";
import { formatDate, formatTime } from "../utils/geocoding";
import { LOGIA_ADVANCED_CONFIG } from "../config/logiaAdvanced";
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
        const response = await fetch(LOGIA_ADVANCED_CONFIG.API_ENDPOINT);

        if (!response.ok) {
          throw new Error(
            t.errors.httpError.replace("{status}", response.status.toString()),
          );
        }

        const data = await response.json();

        if (data.error) {
          throw new Error(data.error);
        }

        if (data.status !== "OK") {
          throw new Error(t.errors.serverError);
        }

        setAstroData(data);
        setError(null);
      } catch (error) {
        console.error(t.errors.fetchError, error);
        setError(
          error instanceof Error ? error.message : t.errors.genericError,
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const formattedDate = birthDate ? formatDate(birthDate) : "";
  const formattedTime = birthTime ? formatTime(birthTime) : "";
  const formattedCity = city ? city.toLowerCase() : "";

  const subtitleContent = t.subtitle
    .replace("{birthDate}", formattedDate)
    .replace("{birthTime}", formattedTime)
    .replace("{city}", formattedCity);

  const formatPosition = (pos: number) => pos.toFixed(2);

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
  const getElementColor = (element: string) => {
    const elementColors: Record<string, string> = {
      Fire: LOGIA_ADVANCED_CONFIG.COLORS.ELEMENT_FIRE,
      Earth: LOGIA_ADVANCED_CONFIG.COLORS.ELEMENT_EARTH,
      Air: LOGIA_ADVANCED_CONFIG.COLORS.ELEMENT_AIR,
      Water: LOGIA_ADVANCED_CONFIG.COLORS.ELEMENT_WATER,
    };
    return elementColors[element] || LOGIA_ADVANCED_CONFIG.COLORS.PRIMARY;
  };

  const getQualityColor = (quality: string) => {
    const qualityColors: Record<string, string> = {
      Cardinal: LOGIA_ADVANCED_CONFIG.COLORS.QUALITY_CARDINAL,
      Fixed: LOGIA_ADVANCED_CONFIG.COLORS.QUALITY_FIXED,
      Mutable: LOGIA_ADVANCED_CONFIG.COLORS.QUALITY_MUTABLE,
    };
    return qualityColors[quality] || LOGIA_ADVANCED_CONFIG.COLORS.PRIMARY;
  };

  return (
    <div className="advanced-astrology-container">
      <div className="cosmic-background">
        <div className="stars"></div>
        <div className="nebula"></div>
      </div>

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

      {loading && (
        <div className="loading-container">
          <div className="loading-spinner">
            <div className="spinner-ring"></div>
            <div className="spinner-ring"></div>
            <div className="spinner-ring"></div>
          </div>
          <p className="loading-text">{t.loading.text}</p>
        </div>
      )}

      {error && (
        <div className="error-container">
          <div className="error-icon">⚠️</div>
          <p className="error-text">{error}</p>
        </div>
      )}

      {!loading && !error && astroData?.data && (
        <div className="astrology-content">
          <div className="summary-section">
            <div className="summary-card">
              <div className="summary-icon">🌍</div>
              <div className="summary-content">
                <h3>{t.summary.location}</h3>
                <p>
                  {astroData.data.city}, {astroData.data.nation}
                </p>
              </div>
            </div>
            <div className="summary-card">
              <div className="summary-icon">📅</div>
              <div className="summary-content">
                <h3>{t.summary.dateTime}</h3>
                <p>{astroData.data.iso_formatted_local_datetime}</p>
              </div>
            </div>
            <div className="summary-card">
              <div className="summary-icon">🧭</div>
              <div className="summary-content">
                <h3>{t.summary.coordinates}</h3>
                <p>
                  {t.summary.coordinateFormat
                    .replace("{lat}", astroData.data.lat.toFixed(2))
                    .replace("{lng}", astroData.data.lng.toFixed(2))}
                </p>
              </div>
            </div>
          </div>

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
                      {body.retrograde && (
                        <span className="retrograde">
                          {t.details.retrograde}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="card-details">
                  <div className="detail-row">
                    <span className="detail-label">{t.details.position}</span>
                    <span className="detail-value">
                      {formatPosition(body.position)}°
                    </span>
                  </div>
                  {body.house && (
                    <div className="detail-row">
                      <span className="detail-label">{t.details.house}</span>
                      <span className="detail-value">
                        {body.house.replace("_", " ")}
                      </span>
                    </div>
                  )}
                  <div className="detail-row">
                    <span className="detail-label">{t.details.quality}</span>
                    <span
                      className="detail-value quality-badge"
                      style={{ color: getQualityColor(body.quality) }}
                    >
                      {body.quality}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">{t.details.element}</span>
                    <span
                      className="detail-value element-badge"
                      style={{ color: getElementColor(body.element) }}
                    >
                      {body.element}
                    </span>
                  </div>
                </div>

                {selectedBody === key && (
                  <div className="expanded-details">
                    <div className="detail-section">
                      <h4>{t.expanded.astrologicalSignificance}</h4>
                      <p>
                        {t.expanded.significanceText
                          .replace("{bodyName}", body.name.toLowerCase())
                          .replace("{sign}", body.sign.toLowerCase())
                          .replace("{position}", formatPosition(body.position))}
                      </p>
                    </div>
                    <div className="detail-section">
                      <h4>{t.expanded.elementalInfluence}</h4>
                      <p>
                        {t.expanded.elementalText.replace(
                          /{element}/g,
                          body.element.toLowerCase(),
                        )}
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
