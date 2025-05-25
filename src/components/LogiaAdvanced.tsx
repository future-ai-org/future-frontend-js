"use client";

import React from "react";
import strings from "../i18n/logiaAdvanced.json";
import { formatDate, formatTime } from "../utils/geocoding";
import "../styles/logiaAdvanced.css";

const t = strings.en;

interface LogiaAdvancedProps {
  birthDate: string;
  birthTime: string;
  city: string;
}

export default function LogiaAdvanced({
  birthDate,
  birthTime,
  city,
}: LogiaAdvancedProps) {
  // Ensure we have valid values before formatting
  const formattedDate = birthDate ? formatDate(birthDate) : "";
  const formattedTime = birthTime ? formatTime(birthTime) : "";
  const formattedCity = city ? city.toLowerCase() : "";

  const subtitleContent = t.subtitle
    .replace("{birthDate}", formattedDate)
    .replace("{birthTime}", formattedTime)
    .replace("{city}", formattedCity);

  return (
    <div className="astrology-container">
      <div className="astrology-header">
        <h1 className="astrology-title">{t.title}</h1>
      </div>
      <div className="astrology-subtitle">{subtitleContent}</div>
    </div>
  );
}
