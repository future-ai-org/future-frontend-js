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
    [key: string]: any;
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

  return (
    <div className="astrology-container">
      <div className="astrology-header">
        <h1 className="astrology-title">{t.title}</h1>
      </div>
      <div className="astrology-subtitle">{subtitleContent}</div>

      {loading && <div className="loading">Loading astrological data...</div>}
      {error && <div className="error">{error}</div>}

      {!loading && !error && astroData?.data && (
        <div className="astrology-table-container">
          <table className="astrology-table">
            <thead>
              <tr>
                <th>Body</th>
                <th>Sign</th>
                <th>Position</th>
                <th>House</th>
                <th>Quality</th>
                <th>Element</th>
                <th>Retrograde</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(astroData.data).map(([key, value]) => {
                if (
                  typeof value === "object" &&
                  value !== null &&
                  "name" in value
                ) {
                  const body = value as CelestialBody;
                  return (
                    <tr key={key}>
                      <td>{body.name}</td>
                      <td>
                        {body.emoji} {body.sign}
                      </td>
                      <td>{formatPosition(body.position)}°</td>
                      <td>{body.house?.replace("_", " ")}</td>
                      <td>{body.quality}</td>
                      <td>{body.element}</td>
                      <td>{body.retrograde ? "R" : ""}</td>
                    </tr>
                  );
                }
                return null;
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
